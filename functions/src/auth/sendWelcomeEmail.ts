/**
 * 🔥 BOTA LOVE APP - Send Welcome Email Cloud Function
 * 
 * Função HTTP Callable para enviar email de boas-vindas
 * após o registro do usuário.
 * 
 * @author Bota Love Team
 */

import { CallableRequest, HttpsError, onCall } from 'firebase-functions/v2/https';
import { EMAIL_SUBJECTS, getWelcomeEmailTemplate } from '../templates/emailTemplates';
import { isValidEmail, sendEmail } from '../utils/emailService';

// =============================================================================
// 📝 TIPOS
// =============================================================================

interface SendWelcomeEmailData {
  email: string;
  name: string;
}

interface SendWelcomeEmailResult {
  success: boolean;
  message: string;
  messageId?: string;
}

// =============================================================================
// 📧 CLOUD FUNCTION: sendWelcomeEmail
// =============================================================================

/**
 * Cloud Function para enviar email de boas-vindas
 * 
 * Recebe: email, name
 * Envia email de boas-vindas incentivando completar o perfil
 */
export const sendWelcomeEmail = onCall<SendWelcomeEmailData, Promise<SendWelcomeEmailResult>>(
  {
    region: 'southamerica-east1',
    timeoutSeconds: 60,
    memory: '256MiB',
    secrets: ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'SMTP_FROM_NAME', 'SMTP_FROM_EMAIL'],
    invoker: 'public',
  },
  async (request: CallableRequest<SendWelcomeEmailData>): Promise<SendWelcomeEmailResult> => {
    const startTime = Date.now();
    const data = request.data;
    
    console.log('📧 [sendWelcomeEmail] Iniciando...');
    console.log('📧 [sendWelcomeEmail] Dados recebidos:', {
      email: data.email ? '***@***' : 'não fornecido',
      name: data.name ? data.name.split(' ')[0] : 'não fornecido',
    });

    try {
      // =========================================================================
      // 1. VALIDAÇÃO DE DADOS
      // =========================================================================
      
      if (!data.email || !data.name) {
        console.error('❌ [sendWelcomeEmail] Dados incompletos');
        throw new HttpsError(
          'invalid-argument',
          'Dados incompletos. email e name são obrigatórios.'
        );
      }

      if (!isValidEmail(data.email)) {
        console.error('❌ [sendWelcomeEmail] Email inválido:', data.email);
        throw new HttpsError(
          'invalid-argument',
          'Formato de email inválido.'
        );
      }

      // =========================================================================
      // 2. GERAR TEMPLATE E ENVIAR EMAIL
      // =========================================================================
      
      const htmlContent = getWelcomeEmailTemplate({
        name: data.name,
      });

      console.log('📤 [sendWelcomeEmail] Enviando email...');
      
      const sendResult = await sendEmail({
        to: data.email,
        subject: EMAIL_SUBJECTS.WELCOME,
        html: htmlContent,
      });

      if (!sendResult.success) {
        console.error('❌ [sendWelcomeEmail] Falha ao enviar:', sendResult.error);
        throw new HttpsError(
          'internal',
          'Falha ao enviar email de boas-vindas.'
        );
      }

      const executionTime = Date.now() - startTime;
      console.log(`✅ [sendWelcomeEmail] Concluído em ${executionTime}ms`);

      return {
        success: true,
        message: 'Email de boas-vindas enviado com sucesso!',
        messageId: sendResult.messageId,
      };

    } catch (error: any) {
      console.error('❌ [sendWelcomeEmail] Erro:', error);
      
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
