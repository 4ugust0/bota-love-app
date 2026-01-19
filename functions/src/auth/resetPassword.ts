/**
 * 🔥 BOTA LOVE APP - Reset Password Cloud Function
 * 
 * Função HTTP Callable para redefinir a senha do usuário
 * após verificação do código.
 * 
 * @author Bota Love Team
 */

import * as admin from 'firebase-admin';
import { CallableRequest, HttpsError, onCall } from 'firebase-functions/v2/https';

// =============================================================================
// 📝 TIPOS
// =============================================================================

interface ResetPasswordData {
  email: string;
  resetToken: string;
  newPassword: string;
}

interface ResetPasswordResult {
  success: boolean;
  message: string;
}

// =============================================================================
// 📧 CLOUD FUNCTION: resetPassword
// =============================================================================

export const resetPassword = onCall<ResetPasswordData, Promise<ResetPasswordResult>>(
  {
    region: 'southamerica-east1',
    timeoutSeconds: 30,
    memory: '256MiB',
    invoker: 'public',
  },
  async (request: CallableRequest<ResetPasswordData>): Promise<ResetPasswordResult> => {
    const data = request.data;
    
    console.log('🔐 [resetPassword] Iniciando redefinição de senha...');

    try {
      // =========================================================================
      // 1. VALIDAÇÃO DE DADOS
      // =========================================================================
      
      if (!data.email || !data.resetToken || !data.newPassword) {
        throw new HttpsError(
          'invalid-argument',
          'Email, token e nova senha são obrigatórios.'
        );
      }

      const emailLower = data.email.toLowerCase();
      const { resetToken, newPassword } = data;

      // Validar senha
      if (newPassword.length < 6) {
        throw new HttpsError(
          'invalid-argument',
          'A senha deve ter pelo menos 6 caracteres.'
        );
      }

      // =========================================================================
      // 2. VERIFICAR TOKEN DE RESET
      // =========================================================================
      
      const db = admin.firestore();
      const resetCodeRef = db.collection('passwordResetCodes').doc(emailLower);
      
      const result = await db.runTransaction(async (transaction: admin.firestore.Transaction) => {
        const resetCodeDoc = await transaction.get(resetCodeRef);
        
        if (!resetCodeDoc.exists) {
          return {
            success: false,
            error: 'Token inválido ou expirado.',
          };
        }

        const resetData = resetCodeDoc.data()!;
        
        // Verificar se o código foi verificado
        if (!resetData.verified) {
          return {
            success: false,
            error: 'Código não foi verificado. Complete a verificação primeiro.',
          };
        }

        // Verificar se já foi usado
        if (resetData.used) {
          return {
            success: false,
            error: 'Este token já foi utilizado.',
          };
        }

        // Verificar token
        if (resetData.resetToken !== resetToken) {
          return {
            success: false,
            error: 'Token inválido.',
          };
        }

        // Verificar expiração do token
        const tokenExpiresAt = resetData.resetTokenExpiresAt?.toDate?.() || new Date(0);
        if (new Date() > tokenExpiresAt) {
          return {
            success: false,
            error: 'Token expirado. Solicite um novo código.',
          };
        }

        // Marcar como usado
        transaction.update(resetCodeRef, {
          used: true,
          usedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        return {
          success: true,
          userId: resetData.userId,
        };
      });

      if (!result.success) {
        throw new HttpsError('failed-precondition', result.error!);
      }

      // =========================================================================
      // 3. ATUALIZAR SENHA NO FIREBASE AUTH
      // =========================================================================
      
      try {
        await admin.auth().updateUser(result.userId!, {
          password: newPassword,
        });
        
        console.log(`✅ [resetPassword] Senha atualizada para usuário: ${result.userId}`);
      } catch (authError: any) {
        console.error('❌ [resetPassword] Erro ao atualizar senha no Auth:', authError);
        throw new HttpsError(
          'internal',
          'Erro ao atualizar senha. Tente novamente.'
        );
      }

      // =========================================================================
      // 4. LIMPAR DADOS DE RESET (OPCIONAL - SEGURANÇA)
      // =========================================================================
      
      // Deletar o documento após uso bem-sucedido
      await db.collection('passwordResetCodes').doc(emailLower).delete();
      
      // Limpar rate limit
      await db.collection('passwordResetRateLimits').doc(emailLower).delete();

      console.log('✅ [resetPassword] Senha redefinida com sucesso');

      return {
        success: true,
        message: 'Senha redefinida com sucesso! Você já pode fazer login.',
      };

    } catch (error: any) {
      console.error('❌ [resetPassword] Erro:', error);
      
      if (error instanceof HttpsError) {
        throw error;
      }
      
      throw new HttpsError(
        'internal',
        'Erro interno ao redefinir senha.'
      );
    }
  }
);
