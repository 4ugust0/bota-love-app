/**
 * 🔥 BOTA LOVE APP - Send Password Reset Code Cloud Function
 * 
 * Função HTTP Callable para enviar código de recuperação de senha
 * via SMTP configurado.
 * 
 * @author Bota Love Team
 */

import * as admin from 'firebase-admin';
import { CallableRequest, HttpsError, onCall } from 'firebase-functions/v2/https';
import { EMAIL_SUBJECTS, getPasswordResetEmailTemplate } from '../templates/emailTemplates';
import { isValidEmail, sendEmail } from '../utils/emailService';

// =============================================================================
// 🔧 CONFIGURAÇÃO
// =============================================================================

const RATE_LIMIT_HOURS = 1;
const MAX_ATTEMPTS_PER_HOUR = 3;
const CODE_EXPIRY_MINUTES = 30;

// =============================================================================
// 📝 TIPOS
// =============================================================================

interface SendPasswordResetCodeData {
  email: string;
}

interface SendPasswordResetCodeResult {
  success: boolean;
  message: string;
  messageId?: string;
}

// =============================================================================
// 📧 CLOUD FUNCTION: sendPasswordResetCode
// =============================================================================

export const sendPasswordResetCode = onCall<SendPasswordResetCodeData, Promise<SendPasswordResetCodeResult>>(
  {
    region: 'southamerica-east1',
    timeoutSeconds: 60,
    memory: '256MiB',
    secrets: ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'SMTP_FROM_NAME', 'SMTP_FROM_EMAIL'],
    invoker: 'public',
  },
  async (request: CallableRequest<SendPasswordResetCodeData>): Promise<SendPasswordResetCodeResult> => {
    const startTime = Date.now();
    const data = request.data;
    
    console.log('🔑 [sendPasswordResetCode] Iniciando...');

    try {
      // =========================================================================
      // 1. VALIDAÇÃO DE DADOS
      // =========================================================================
      
      if (!data.email) {
        console.error('❌ [sendPasswordResetCode] Email não fornecido');
        throw new HttpsError(
          'invalid-argument',
          'Email é obrigatório.'
        );
      }

      if (!isValidEmail(data.email)) {
        console.error('❌ [sendPasswordResetCode] Email inválido');
        throw new HttpsError(
          'invalid-argument',
          'Formato de email inválido.'
        );
      }

      // =========================================================================
      // 2. VERIFICAR SE O EMAIL EXISTE NO SISTEMA
      // =========================================================================
      
      const db = admin.firestore();
      const emailLower = data.email.toLowerCase();
      
      // Buscar usuário pelo email
      const usersSnapshot = await db.collection('users')
        .where('email', '==', emailLower)
        .limit(1)
        .get();
      
      if (usersSnapshot.empty) {
        // Por segurança, não revelamos se o email existe ou não
        console.log('⚠️ [sendPasswordResetCode] Email não encontrado, retornando sucesso falso');
        return {
          success: true,
          message: 'Se o email estiver cadastrado, você receberá um código de recuperação.',
        };
      }

      const userDoc = usersSnapshot.docs[0];
      const userData = userDoc.data();
      const userName = userData?.profile?.name || 'Usuário';

      // =========================================================================
      // 3. RATE LIMITING
      // =========================================================================
      
      const rateLimitRef = db.collection('passwordResetRateLimits').doc(emailLower);
      
      const rateLimitResult = await db.runTransaction(async (transaction: admin.firestore.Transaction) => {
        const rateLimitDoc = await transaction.get(rateLimitRef);
        const now = Date.now();
        const oneHourAgo = now - (RATE_LIMIT_HOURS * 60 * 60 * 1000);

        let attempts: number[] = [];
        
        if (rateLimitDoc.exists) {
          const rateLimitData = rateLimitDoc.data();
          attempts = rateLimitData?.attempts || [];
          attempts = attempts.filter((timestamp: number) => timestamp > oneHourAgo);
        }

        if (attempts.length >= MAX_ATTEMPTS_PER_HOUR) {
          const oldestAttempt = Math.min(...attempts);
          const waitTime = Math.ceil((oldestAttempt + (RATE_LIMIT_HOURS * 60 * 60 * 1000) - now) / 60000);
          
          console.warn(`⚠️ [sendPasswordResetCode] Rate limit excedido para: ${emailLower}`);
          
          return {
            allowed: false,
            waitMinutes: waitTime,
          };
        }

        attempts.push(now);
        
        transaction.set(rateLimitRef, {
          email: emailLower,
          attempts: attempts,
          lastAttempt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });

        return { allowed: true };
      });

      if (!rateLimitResult.allowed) {
        throw new HttpsError(
          'resource-exhausted',
          `Limite de tentativas excedido. Aguarde ${rateLimitResult.waitMinutes} minutos.`
        );
      }

      // =========================================================================
      // 4. GERAR E SALVAR CÓDIGO
      // =========================================================================
      
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + CODE_EXPIRY_MINUTES * 60 * 1000);
      
      // Salvar código na collection passwordResetCodes
      await db.collection('passwordResetCodes').doc(emailLower).set({
        email: emailLower,
        userId: userDoc.id,
        code: code,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        expiresAt: admin.firestore.Timestamp.fromDate(expiresAt),
        used: false,
        attempts: 0,
      });

      console.log('🔑 [sendPasswordResetCode] Código gerado e salvo');

      // =========================================================================
      // 5. ENVIAR EMAIL
      // =========================================================================
      
      const emailHtml = getPasswordResetEmailTemplate({
        name: userName,
        code: code,
        expiryMinutes: CODE_EXPIRY_MINUTES,
      });

      const emailResult = await sendEmail({
        to: emailLower,
        subject: EMAIL_SUBJECTS.PASSWORD_RESET,
        html: emailHtml,
      });

      if (!emailResult.success) {
        console.error('❌ [sendPasswordResetCode] Falha ao enviar email:', emailResult.error);
        throw new HttpsError(
          'internal',
          'Falha ao enviar email. Tente novamente.'
        );
      }

      const duration = Date.now() - startTime;
      console.log(`✅ [sendPasswordResetCode] Código enviado com sucesso em ${duration}ms`);

      return {
        success: true,
        message: 'Código de recuperação enviado para seu email.',
        messageId: emailResult.messageId,
      };

    } catch (error: any) {
      console.error('❌ [sendPasswordResetCode] Erro:', error);
      
      if (error instanceof HttpsError) {
        throw error;
      }
      
      throw new HttpsError(
        'internal',
        'Erro interno ao processar solicitação.'
      );
    }
  }
);
