/**
 * 🔥 BOTA LOVE APP - Verify Email Code Cloud Function
 * 
 * Função HTTP Callable para verificar código de email
 * durante o cadastro (SEM necessidade de autenticação).
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

interface VerifyEmailCodeData {
  email: string;
  code: string;
}

interface VerifyEmailCodeResult {
  success: boolean;
  message: string;
  verified?: boolean;
}

// =============================================================================
// ✅ CLOUD FUNCTION: verifyEmailCode
// =============================================================================

/**
 * Cloud Function para verificar código de email
 * 
 * NÃO requer autenticação - usado durante o cadastro
 * 
 * 1. Busca código no Firestore por email
 * 2. Valida se o código corresponde
 * 3. Marca como verificado
 */
export const verifyEmailCode = onCall<VerifyEmailCodeData, Promise<VerifyEmailCodeResult>>(
  {
    region: 'southamerica-east1',
    timeoutSeconds: 30,
    memory: '256MiB',
    invoker: 'public', // Permite chamadas sem autenticação
  },
  async (request: CallableRequest<VerifyEmailCodeData>): Promise<VerifyEmailCodeResult> => {
    const startTime = Date.now();
    const data = request.data;
    
    console.log('✅ [verifyEmailCode] Iniciando verificação...');
    console.log('✅ [verifyEmailCode] Email:', data.email ? '***@***' : 'não fornecido');

    try {
      // =========================================================================
      // 1. VALIDAÇÃO DE DADOS
      // =========================================================================
      
      if (!data.email || !data.code) {
        console.error('❌ [verifyEmailCode] Dados incompletos');
        throw new HttpsError(
          'invalid-argument',
          'Email e código são obrigatórios.'
        );
      }

      if (data.code.length !== 6 || !/^\d{6}$/.test(data.code)) {
        console.error('❌ [verifyEmailCode] Código inválido:', data.code);
        throw new HttpsError(
          'invalid-argument',
          'Código deve ter 6 dígitos numéricos.'
        );
      }

      const db = admin.firestore();
      const emailKey = data.email.toLowerCase().trim();

      // =========================================================================
      // 2. BUSCAR VERIFICAÇÃO NO FIRESTORE
      // =========================================================================

      const verificationRef = db.collection('email_verifications').doc(emailKey);
      const verificationDoc = await verificationRef.get();

      if (!verificationDoc.exists) {
        console.error('❌ [verifyEmailCode] Nenhuma verificação pendente para:', emailKey);
        throw new HttpsError(
          'not-found',
          'Nenhum código de verificação encontrado. Solicite um novo código.'
        );
      }

      const verificationData = verificationDoc.data();

      if (!verificationData) {
        throw new HttpsError(
          'not-found',
          'Dados de verificação não encontrados.'
        );
      }

      // =========================================================================
      // 3. VERIFICAR SE JÁ FOI VERIFICADO
      // =========================================================================

      if (verificationData.verified === true) {
        console.log('✅ [verifyEmailCode] Email já verificado anteriormente');
        return {
          success: true,
          message: 'Email já verificado!',
          verified: true,
        };
      }

      // =========================================================================
      // 4. VERIFICAR EXPIRAÇÃO
      // =========================================================================

      const expiresAt = verificationData.expiresAt?.toMillis?.() || verificationData.expiresAt;
      if (expiresAt && Date.now() > expiresAt) {
        console.error('❌ [verifyEmailCode] Código expirado');
        throw new HttpsError(
          'deadline-exceeded',
          'Código expirado. Solicite um novo código.'
        );
      }

      // =========================================================================
      // 5. VERIFICAR TENTATIVAS
      // =========================================================================

      const attempts = verificationData.attempts || 0;
      if (attempts >= MAX_VERIFICATION_ATTEMPTS) {
        console.error('❌ [verifyEmailCode] Muitas tentativas');
        throw new HttpsError(
          'resource-exhausted',
          'Muitas tentativas incorretas. Solicite um novo código.'
        );
      }

      // =========================================================================
      // 6. COMPARAR CÓDIGO
      // =========================================================================

      if (verificationData.code !== data.code) {
        // Incrementar tentativas
        await verificationRef.update({
          attempts: admin.firestore.FieldValue.increment(1),
          lastAttemptAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        const remainingAttempts = MAX_VERIFICATION_ATTEMPTS - attempts - 1;
        console.warn(`⚠️ [verifyEmailCode] Código incorreto. Tentativas restantes: ${remainingAttempts}`);
        
        throw new HttpsError(
          'invalid-argument',
          `Código incorreto. ${remainingAttempts > 0 ? `Você tem mais ${remainingAttempts} tentativa(s).` : 'Solicite um novo código.'}`
        );
      }

      // =========================================================================
      // 7. MARCAR COMO VERIFICADO
      // =========================================================================

      await verificationRef.update({
        verified: true,
        verifiedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      const duration = Date.now() - startTime;
      console.log(`✅ [verifyEmailCode] Código verificado com sucesso em ${duration}ms`);

      return {
        success: true,
        message: 'Email verificado com sucesso!',
        verified: true,
      };

    } catch (error: unknown) {
      const duration = Date.now() - startTime;
      console.error(`❌ [verifyEmailCode] Erro após ${duration}ms:`, error);

      // Se já é um HttpsError, apenas repassa
      if (error instanceof HttpsError) {
        throw error;
      }

      // Erro genérico
      throw new HttpsError(
        'internal',
        'Erro interno ao verificar código.'
      );
    }
  }
);
