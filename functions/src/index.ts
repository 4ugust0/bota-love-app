/**
 * 🔥 BOTA LOVE APP - Cloud Functions Entry Point
 * 
 * Este arquivo é o ponto de entrada de todas as Cloud Functions.
 * Usa Firebase Functions v2 API.
 * 
 * @author Bota Love Team
 */

import * as admin from 'firebase-admin';
import { setGlobalOptions } from 'firebase-functions/v2';

// =============================================================================
// 🚀 INICIALIZAÇÃO DO FIREBASE ADMIN
// =============================================================================

if (admin.apps.length === 0) {
  admin.initializeApp();
  console.log('✅ Firebase Admin inicializado');
}

// =============================================================================
// 🔧 CONFIGURAÇÕES GLOBAIS
// =============================================================================

setGlobalOptions({
  maxInstances: 10,
  region: 'southamerica-east1',
});

// =============================================================================
// 📧 FUNÇÕES DE AUTENTICAÇÃO
// =============================================================================

export { resendVerificationCode } from './auth/resendVerificationCode';
export { resetPassword } from './auth/resetPassword';
export { sendPasswordResetCode } from './auth/sendPasswordResetCode';
export { sendVerificationEmail } from './auth/sendVerificationEmail';
export { sendWelcomeEmail } from './auth/sendWelcomeEmail';
export { verifyEmailCode } from './auth/verifyEmailCode';
export { verifyPasswordResetCode } from './auth/verifyPasswordResetCode';

// =============================================================================
// 🔒 FUNÇÕES DE MODERAÇÃO
// =============================================================================

export { moderateMessage } from './moderation/moderateMessage';

// =============================================================================
// 👤 FUNÇÕES DE USUÁRIO
// =============================================================================

export { onUserLogin } from './user/onUserLogin';

// =============================================================================
// 🔔 FUNÇÕES DE NOTIFICAÇÃO
// =============================================================================

export { sendLikeNotification } from './notifications/sendLikeNotification';
export { sendMatchNotification } from './notifications/sendMatchNotification';
export { sendMessageNotification } from './notifications/sendMessageNotification';

// =============================================================================
// 💳 FUNÇÕES DE PAGAMENTO (STRIPE PIX)
// =============================================================================

export {
  cancelPixPayment,
  createPixPayment,
  getPaymentHistory,
  getPixPaymentStatus,
  stripeWebhook
} from './stripe';

// =============================================================================
// 📝 LOGS DE INICIALIZAÇÃO
// =============================================================================

console.log('🌾 Bota Love Cloud Functions carregadas com sucesso!');
console.log('📍 Região: southamerica-east1');
console.log('💳 Stripe integration enabled');
