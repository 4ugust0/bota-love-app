/**
 * 🔥 BOTA LOVE APP - Send Verification Email Cloud Function
 * 
 * Função HTTP Callable para enviar email de verificação
 * com código de 6 dígitos.
 * 
 * @author Bota Love Team
 */

import * as admin from 'firebase-admin';
import { CallableRequest, HttpsError, onCall } from 'firebase-functions/v2/https';
import { EMAIL_SUBJECTS, getVerificationEmailTemplate } from '../templates/emailTemplates';
import { isValidEmail, sendEmail } from '../utils/emailService';

// =============================================================================
// 🔧 CONFIGURAÇÃO
// =============================================================================

const RATE_LIMIT_HOURS = 1;
const MAX_ATTEMPTS_PER_HOUR = 3;

// =============================================================================
// 📝 TIPOS
// =============================================================================

interface SendVerificationEmailData {
  email: string;
  name: string;
}

interface SendVerificationEmailResult {
  success: boolean;
  message: string;
  messageId?: string;
}

// =============================================================================
// 📧 CLOUD FUNCTION: sendVerificationEmail
// =============================================================================

/**
 * Cloud Function para enviar email de verificação
 * 
 * Recebe: email, name
 * Gera código automaticamente e envia email
 * 
 * Rate limiting: Máximo 3 tentativas por hora por email
 */
export const sendVerificationEmail = onCall<SendVerificationEmailData, Promise<SendVerificationEmailResult>>(
  {
    region: 'southamerica-east1',
    timeoutSeconds: 60,
    memory: '256MiB',
    secrets: ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'SMTP_FROM_NAME', 'SMTP_FROM_EMAIL'],
    invoker: 'public',
  },
  async (request: CallableRequest<SendVerificationEmailData>): Promise<SendVerificationEmailResult> => {
    const startTime = Date.now();
    const data = request.data;
    
    console.log('📧 [sendVerificationEmail] Iniciando...');
    console.log('📧 [sendVerificationEmail] Dados recebidos:', {
      email: data.email ? '***@***' : 'não fornecido',
      name: data.name ? data.name.split(' ')[0] : 'não fornecido',
    });

    try {
      // =========================================================================
      // 1. VALIDAÇÃO DE DADOS
      // =========================================================================
      
      if (!data.email || !data.name) {
        console.error('❌ [sendVerificationEmail] Dados incompletos');
        throw new HttpsError(
          'invalid-argument',
          'Dados incompletos. email e name são obrigatórios.'
        );
      }

      if (!isValidEmail(data.email)) {
        console.error('❌ [sendVerificationEmail] Email inválido:', data.email);
        throw new HttpsError(
          'invalid-argument',
          'Formato de email inválido.'
        );
      }

      // Gerar código de 6 dígitos
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      console.log('🔑 [sendVerificationEmail] Código gerado');

      // =========================================================================
      // 2. RATE LIMITING
      // =========================================================================
      
      const db = admin.firestore();
      const emailKey = data.email.toLowerCase();
      const rateLimitRef = db.collection('emailRateLimits').doc(emailKey);
      
      const rateLimitResult = await db.runTransaction(async (transaction: admin.firestore.Transaction) => {
        const rateLimitDoc = await transaction.get(rateLimitRef);
        const now = Date.now();
        const oneHourAgo = now - (RATE_LIMIT_HOURS * 60 * 60 * 1000);

        let attempts: number[] = [];
        
        if (rateLimitDoc.exists) {
          const rateLimitData = rateLimitDoc.data();
          attempts = rateLimitData?.attempts || [];
          
          // Filtrar apenas tentativas dentro da última hora
          attempts = attempts.filter((timestamp: number) => timestamp > oneHourAgo);
        }

        // Verificar se excedeu o limite
        if (attempts.length >= MAX_ATTEMPTS_PER_HOUR) {
          const oldestAttempt = Math.min(...attempts);
          const waitTime = Math.ceil((oldestAttempt + (RATE_LIMIT_HOURS * 60 * 60 * 1000) - now) / 60000);
          
          console.warn(`⚠️ [sendVerificationEmail] Rate limit excedido para email: ${emailKey}`);
          
          return {
            allowed: false,
            waitMinutes: waitTime,
            attemptCount: attempts.length,
          };
        }

        // Adicionar nova tentativa
        attempts.push(now);
        
        transaction.set(rateLimitRef, {
          email: emailKey,
          attempts: attempts,
          lastAttempt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });

        return {
          allowed: true,
          attemptCount: attempts.length,
        };
      });

      if (!rateLimitResult.allowed) {
        throw new HttpsError(
          'resource-exhausted',
          `Limite de tentativas excedido. Aguarde ${rateLimitResult.waitMinutes} minutos.`
        );
      }

      console.log(`📊 [sendVerificationEmail] Tentativa ${rateLimitResult.attemptCount}/${MAX_ATTEMPTS_PER_HOUR} na última hora`);

      // =========================================================================
      // 3. SALVAR CÓDIGO NO FIRESTORE
      // =========================================================================

      const verificationRef = db.collection('email_verifications').doc(emailKey);
      await verificationRef.set({
        email: emailKey,
        code: code,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        expiresAt: admin.firestore.Timestamp.fromMillis(Date.now() + (30 * 60 * 1000)), // 30 minutos
        attempts: 0,
        verified: false,
      });

      console.log('💾 [sendVerificationEmail] Código salvo no Firestore');

      // =========================================================================
      // 4. ENVIAR EMAIL
      // =========================================================================

      const emailHtml = getVerificationEmailTemplate({
        name: data.name,
        code: code,
        expiryMinutes: 30,
      });

      const emailResult = await sendEmail({
        to: data.email,
        subject: EMAIL_SUBJECTS.VERIFICATION,
        html: emailHtml,
      });

      if (!emailResult.success) {
        console.error('❌ [sendVerificationEmail] Falha ao enviar email:', emailResult.error);
        throw new HttpsError(
          'internal',
          'Não foi possível enviar o email. Tente novamente.'
        );
      }

      // =========================================================================
      // 5. LOG DE SUCESSO
      // =========================================================================

      // Registrar log do envio (para auditoria)
      await db.collection('emailLogs').add({
        email: emailKey,
        type: 'verification',
        status: 'sent',
        messageId: emailResult.messageId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      const duration = Date.now() - startTime;
      console.log(`✅ [sendVerificationEmail] Email enviado com sucesso em ${duration}ms`);
      console.log(`✅ [sendVerificationEmail] Message ID: ${emailResult.messageId}`);

      return {
        success: true,
        message: 'Email de verificação enviado com sucesso!',
        messageId: emailResult.messageId,
      };

    } catch (error: unknown) {
      const duration = Date.now() - startTime;
      console.error(`❌ [sendVerificationEmail] Erro após ${duration}ms:`, error);

      // Se já é um HttpsError, apenas repassa
      if (error instanceof HttpsError) {
        throw error;
      }

      // Erro genérico
      throw new HttpsError(
        'internal',
        'Erro interno ao enviar email de verificação.'
      );
    }
  }
);
