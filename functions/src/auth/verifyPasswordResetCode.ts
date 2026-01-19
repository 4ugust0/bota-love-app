/**
 * 🔥 BOTA LOVE APP - Verify Password Reset Code Cloud Function
 * 
 * Função HTTP Callable para verificar o código de recuperação de senha.
 * 
 * @author Bota Love Team
 */

import * as admin from 'firebase-admin';
import { CallableRequest, HttpsError, onCall } from 'firebase-functions/v2/https';

// =============================================================================
// 🔧 CONFIGURAÇÃO
// =============================================================================

const MAX_VERIFICATION_ATTEMPTS = 5;

// =============================================================================
// 📝 TIPOS
// =============================================================================

interface VerifyPasswordResetCodeData {
  email: string;
  code: string;
}

interface VerifyPasswordResetCodeResult {
  success: boolean;
  message: string;
  resetToken?: string; // Token temporário para permitir a redefinição
}

// =============================================================================
// 📧 CLOUD FUNCTION: verifyPasswordResetCode
// =============================================================================

export const verifyPasswordResetCode = onCall<VerifyPasswordResetCodeData, Promise<VerifyPasswordResetCodeResult>>(
  {
    region: 'southamerica-east1',
    timeoutSeconds: 30,
    memory: '256MiB',
    invoker: 'public',
  },
  async (request: CallableRequest<VerifyPasswordResetCodeData>): Promise<VerifyPasswordResetCodeResult> => {
    const data = request.data;
    
    console.log('🔍 [verifyPasswordResetCode] Iniciando verificação...');

    try {
      // =========================================================================
      // 1. VALIDAÇÃO DE DADOS
      // =========================================================================
      
      if (!data.email || !data.code) {
        throw new HttpsError(
          'invalid-argument',
          'Email e código são obrigatórios.'
        );
      }

      const emailLower = data.email.toLowerCase();
      const codeInput = data.code.trim();

      if (codeInput.length !== 6 || !/^\d+$/.test(codeInput)) {
        throw new HttpsError(
          'invalid-argument',
          'Código inválido. Deve ter 6 dígitos.'
        );
      }

      // =========================================================================
      // 2. BUSCAR CÓDIGO NO FIRESTORE
      // =========================================================================
      
      const db = admin.firestore();
      const resetCodeRef = db.collection('passwordResetCodes').doc(emailLower);
      
      const result = await db.runTransaction(async (transaction: admin.firestore.Transaction) => {
        const resetCodeDoc = await transaction.get(resetCodeRef);
        
        if (!resetCodeDoc.exists) {
          return {
            success: false,
            error: 'Nenhum código de recuperação encontrado. Solicite um novo.',
          };
        }

        const resetData = resetCodeDoc.data()!;
        
        // Verificar se já foi usado
        if (resetData.used) {
          return {
            success: false,
            error: 'Este código já foi utilizado. Solicite um novo.',
          };
        }

        // Verificar expiração
        const expiresAt = resetData.expiresAt?.toDate?.() || new Date(0);
        if (new Date() > expiresAt) {
          return {
            success: false,
            error: 'Código expirado. Solicite um novo.',
          };
        }

        // Verificar número de tentativas
        const attempts = resetData.attempts || 0;
        if (attempts >= MAX_VERIFICATION_ATTEMPTS) {
          return {
            success: false,
            error: 'Muitas tentativas incorretas. Solicite um novo código.',
          };
        }

        // Verificar código
        if (resetData.code !== codeInput) {
          // Incrementar tentativas
          transaction.update(resetCodeRef, {
            attempts: admin.firestore.FieldValue.increment(1),
            lastAttemptAt: admin.firestore.FieldValue.serverTimestamp(),
          });
          
          const remainingAttempts = MAX_VERIFICATION_ATTEMPTS - attempts - 1;
          return {
            success: false,
            error: `Código incorreto. ${remainingAttempts} tentativa(s) restante(s).`,
          };
        }

        // Código válido! Gerar token de reset
        const resetToken = generateResetToken();
        const tokenExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos

        // Marcar código como verificado e salvar token
        transaction.update(resetCodeRef, {
          verified: true,
          verifiedAt: admin.firestore.FieldValue.serverTimestamp(),
          resetToken: resetToken,
          resetTokenExpiresAt: admin.firestore.Timestamp.fromDate(tokenExpiresAt),
        });

        return {
          success: true,
          resetToken: resetToken,
          userId: resetData.userId,
        };
      });

      if (!result.success) {
        throw new HttpsError('failed-precondition', result.error!);
      }

      console.log('✅ [verifyPasswordResetCode] Código verificado com sucesso');

      return {
        success: true,
        message: 'Código verificado com sucesso.',
        resetToken: result.resetToken,
      };

    } catch (error: any) {
      console.error('❌ [verifyPasswordResetCode] Erro:', error);
      
      if (error instanceof HttpsError) {
        throw error;
      }
      
      throw new HttpsError(
        'internal',
        'Erro interno ao verificar código.'
      );
    }
  }
);

/**
 * Gera um token seguro para reset de senha
 */
function generateResetToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 64; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}
