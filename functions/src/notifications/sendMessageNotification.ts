/**
 * 🔔 BOTA LOVE APP - Send Message Notification
 * 
 * Cloud Function para enviar notificação de nova mensagem.
 * Respeita as configurações de notificação do usuário.
 * 
 * @author Bota Love Team
 */

import * as admin from 'firebase-admin';
import * as logger from 'firebase-functions/logger';
import { CallableRequest, HttpsError, onCall } from 'firebase-functions/v2/https';
import { sendPushToUser } from './pushHelper';

// =============================================================================
// 📝 TIPOS
// =============================================================================

interface SendMessageNotificationData {
  chatId: string;
  senderId: string;
  receiverId: string;
  messageText: string;
  chatOrigin: 'match' | 'network';
}

interface SendMessageNotificationResult {
  success: boolean;
  notificationId?: string;
  error?: string;
}

// =============================================================================
// 🔔 CLOUD FUNCTION: sendMessageNotification
// =============================================================================

/**
 * Cloud Function para enviar notificação de nova mensagem
 * 
 * Recebe: chatId, senderId, receiverId, messageText, chatOrigin
 * Envia: Push notification para o receiver
 */
export const sendMessageNotification = onCall<SendMessageNotificationData, Promise<SendMessageNotificationResult>>(
  {
    region: 'southamerica-east1',
    timeoutSeconds: 30,
    memory: '256MiB',
  },
  async (request: CallableRequest<SendMessageNotificationData>): Promise<SendMessageNotificationResult> => {
    const { chatId, senderId, receiverId, messageText, chatOrigin } = request.data;

    logger.info('[sendMessageNotification] Iniciando...', { chatId, senderId, receiverId });

    try {
      // 1. Validar dados
      if (!chatId || !senderId || !receiverId || !messageText) {
        throw new HttpsError(
          'invalid-argument',
          'chatId, senderId, receiverId e messageText são obrigatórios'
        );
      }

      const db = admin.firestore();

      // 2. Buscar dados do remetente
      const senderSnap = await db.collection('users').doc(senderId).get();

      if (!senderSnap.exists) {
        throw new HttpsError('not-found', 'Remetente não encontrado');
      }

      const senderData = senderSnap.data();
      const senderName = senderData?.profile?.name || 'Alguém';
      const senderPhoto = senderData?.profile?.photos?.[0] || '';

      // 3. Preparar preview da mensagem
      const messagePreview = messageText.length > 50 
        ? messageText.substring(0, 47) + '...' 
        : messageText;

      // 4. Determinar título baseado na origem
      const title = chatOrigin === 'network' 
        ? `🌾 ${senderName}` 
        : `💬 ${senderName}`;

      // 5. Enviar push para o receiver
      const result = await sendPushToUser(db, {
        userId: receiverId,
        title,
        body: messagePreview,
        type: 'message',
        data: {
          chatId,
          senderId,
          senderName,
          chatOrigin: chatOrigin || 'match',
        },
        imageUrl: senderPhoto,
      });

      logger.info('[sendMessageNotification] Resultado:', { success: result.success });

      return {
        success: result.success,
        notificationId: result.notificationId,
        error: result.error,
      };
    } catch (error: any) {
      logger.error('[sendMessageNotification] Erro:', error);

      if (error instanceof HttpsError) {
        throw error;
      }

      throw new HttpsError('internal', error.message || 'Erro ao enviar notificação de mensagem');
    }
  }
);
