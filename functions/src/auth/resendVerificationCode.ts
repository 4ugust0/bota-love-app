/**
 * 🔥 BOTA LOVE APP - Resend Verification Code Cloud Function
 * 
 * Função HTTP Callable para gerar novo código de verificação,
 * atualizar no Firestore e reenviar por email.
 * 
 * @author Bota Love Team
 */

import * as admin from 'firebase-admin';
import { CallableRequest, HttpsError, onCall } from 'firebase-functions/v2/https';
import { EMAIL_SUBJECTS, getResendCodeEmailTemplate } from '../templates/emailTemplates';
import { generateVerificationCode, isValidEmail, sendEmail } from '../utils/emailService';

// =============================================================================
// 🔧 CONFIGURAÇÃO
// =============================================================================

const RATE_LIMIT_HOURS = 1;
const MAX_RESEND_PER_HOUR = 3;
const CODE_EXPIRY_MINUTES = 30;

// =============================================================================
// 📝 TIPOS
// =============================================================================

interface ResendVerificationCodeData {
  userId: string;
  email?: string;  // Opcional se conseguir buscar do Firestore
  name?: string;   // Opcional se conseguir buscar do Firestore
}

interface ResendVerificationCodeResult {
  success: boolean;
  message: string;
  expiresAt?: string;
}

// =============================================================================
// 🔄 CLOUD FUNCTION: resendVerificationCode
// =============================================================================

/**
 * Cloud Function para reenviar código de verificação
 * 
 * 1. Gera novo código de 6 dígitos
 * 2. Atualiza no Firestore
 * 3. Envia email com novo código
 * 
 * Rate limiting: Máximo 3 reenvios por hora por usuário
 */
export const resendVerificationCode = onCall<ResendVerificationCodeData, Promise<ResendVerificationCodeResult>>(
  {
    region: 'southamerica-east1',
    timeoutSeconds: 60,
    memory: '256MiB',
    secrets: ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'SMTP_FROM_NAME', 'SMTP_FROM_EMAIL'],
    invoker: 'public',
  },
  async (request: CallableRequest<ResendVerificationCodeData>): Promise<ResendVerificationCodeResult> => {
    const startTime = Date.now();
    const data = request.data;
    
    console.log('🔄 [resendVerificationCode] Iniciando...');
    console.log('🔄 [resendVerificationCode] userId:', data.userId);

    try {
      // =========================================================================
      // 1. VALIDAÇÃO DE DADOS
      // =========================================================================
      
      if (!data.userId) {
        console.error('❌ [resendVerificationCode] userId não fornecido');
        throw new HttpsError(
          'invalid-argument',
          'userId é obrigatório.'
        );
      }

      const db = admin.firestore();

      // =========================================================================
      // 2. BUSCAR DADOS DO USUÁRIO
      // =========================================================================

      const userRef = db.collection('users').doc(data.userId);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        console.error('❌ [resendVerificationCode] Usuário não encontrado:', data.userId);
        throw new HttpsError(
          'not-found',
          'Usuário não encontrado.'
        );
      }

      const userData = userDoc.data();
      
      if (!userData) {
        console.error('❌ [resendVerificationCode] Dados do usuário vazios');
        throw new HttpsError(
          'not-found',
          'Dados do usuário não encontrados.'
        );
      }

      // Verificar se já verificou o email
      if (userData.emailVerified === true) {
        console.log('ℹ️ [resendVerificationCode] Email já verificado');
        throw new HttpsError(
          'failed-precondition',
          'Este email já foi verificado.'
        );
      }

      // Obter email e nome
      const email = data.email || userData.email;
      const name = data.name || userData.profile?.name || userData.name || 'Usuário';

      if (!email || !isValidEmail(email)) {
        console.error('❌ [resendVerificationCode] Email inválido ou não encontrado');
        throw new HttpsError(
          'invalid-argument',
          'Email válido não encontrado.'
        );
      }

      // =========================================================================
      // 3. RATE LIMITING
      // =========================================================================

      const rateLimitRef = db.collection('resendRateLimits').doc(data.userId);
      
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
        if (attempts.length >= MAX_RESEND_PER_HOUR) {
          const oldestAttempt = Math.min(...attempts);
          const waitTime = Math.ceil((oldestAttempt + (RATE_LIMIT_HOURS * 60 * 60 * 1000) - now) / 60000);
          
          console.warn(`⚠️ [resendVerificationCode] Rate limit excedido para userId: ${data.userId}`);
          
          return {
            allowed: false,
            waitMinutes: waitTime,
            attemptCount: attempts.length,
          };
        }

        // Adicionar nova tentativa
        attempts.push(now);
        
        transaction.set(rateLimitRef, {
          userId: data.userId,
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
          `Limite de reenvios excedido. Aguarde ${rateLimitResult.waitMinutes} minutos para solicitar um novo código.`
        );
      }

      console.log(`📊 [resendVerificationCode] Reenvio ${rateLimitResult.attemptCount}/${MAX_RESEND_PER_HOUR} na última hora`);

      // =========================================================================
      // 4. GERAR NOVO CÓDIGO
      // =========================================================================

      const newCode = generateVerificationCode();
      const expiryDate = new Date();
      expiryDate.setMinutes(expiryDate.getMinutes() + CODE_EXPIRY_MINUTES);

      console.log(`🔢 [resendVerificationCode] Novo código gerado (expira em ${CODE_EXPIRY_MINUTES} min)`);

      // =========================================================================
      // 5. ATUALIZAR FIRESTORE
      // =========================================================================

      await userRef.update({
        verificationCode: newCode,
        verificationCodeExpiry: admin.firestore.Timestamp.fromDate(expiryDate),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log('💾 [resendVerificationCode] Código atualizado no Firestore');

      // =========================================================================
      // 6. ENVIAR EMAIL
      // =========================================================================

      const emailHtml = getResendCodeEmailTemplate({
        name: name,
        code: newCode,
        expiryMinutes: CODE_EXPIRY_MINUTES,
      });

      const emailResult = await sendEmail({
        to: email,
        subject: EMAIL_SUBJECTS.RESEND_CODE,
        html: emailHtml,
      });

      if (!emailResult.success) {
        console.error('❌ [resendVerificationCode] Falha ao enviar email:', emailResult.error);
        
        throw new HttpsError(
          'internal',
          'Código gerado, mas não foi possível enviar o email. Tente novamente.'
        );
      }

      // =========================================================================
      // 7. LOG DE SUCESSO
      // =========================================================================

      // Registrar log do reenvio (para auditoria)
      await db.collection('emailLogs').add({
        userId: data.userId,
        email: email,
        type: 'resend_verification',
        status: 'sent',
        messageId: emailResult.messageId,
        attemptNumber: rateLimitResult.attemptCount,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      const duration = Date.now() - startTime;
      console.log(`✅ [resendVerificationCode] Código reenviado com sucesso em ${duration}ms`);

      return {
        success: true,
        message: 'Novo código de verificação enviado para seu email!',
        expiresAt: expiryDate.toISOString(),
      };

    } catch (error: unknown) {
      const duration = Date.now() - startTime;
      console.error(`❌ [resendVerificationCode] Erro após ${duration}ms:`, error);

      // Se já é um HttpsError, apenas repassa
      if (error instanceof HttpsError) {
        throw error;
      }

      // Erro genérico
      throw new HttpsError(
        'internal',
        'Erro interno ao reenviar código de verificação.'
      );
    }
  }
);
