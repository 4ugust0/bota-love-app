/**
 * 🔔 BOTA LOVE APP - Send Match Notification
 * 
 * Cloud Function para enviar notificação de match.
 * Envia push para ambos os usuários quando há um match.
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

interface SendMatchNotificationData {
  user1Id: string;
  user2Id: string;
  matchId: string;
}

interface SendMatchNotificationResult {
  success: boolean;
  notifications: {
    user1: { sent: boolean; notificationId?: string };
    user2: { sent: boolean; notificationId?: string };
  };
  error?: string;
}

// =============================================================================
// 🔔 CLOUD FUNCTION: sendMatchNotification
// =============================================================================

/**
 * Cloud Function para enviar notificação de match
 * 
 * Recebe: user1Id, user2Id, matchId
 * Envia: Push notification para ambos os usuários
 */
export const sendMatchNotification = onCall<SendMatchNotificationData, Promise<SendMatchNotificationResult>>(
  {
    region: 'southamerica-east1',
    timeoutSeconds: 30,
    memory: '256MiB',
  },
  async (request: CallableRequest<SendMatchNotificationData>): Promise<SendMatchNotificationResult> => {
    const { user1Id, user2Id, matchId } = request.data;

    logger.info('[sendMatchNotification] Iniciando...', { user1Id, user2Id, matchId });

    try {
      // 1. Validar dados
      if (!user1Id || !user2Id || !matchId) {
        throw new HttpsError(
          'invalid-argument',
          'user1Id, user2Id e matchId são obrigatórios'
        );
      }

      const db = admin.firestore();

      // 2. Buscar dados de ambos os usuários
      const [user1Snap, user2Snap] = await Promise.all([
        db.collection('users').doc(user1Id).get(),
        db.collection('users').doc(user2Id).get(),
      ]);

      if (!user1Snap.exists || !user2Snap.exists) {
        throw new HttpsError('not-found', 'Um ou ambos os usuários não foram encontrados');
      }

      const user1Data = user1Snap.data();
      const user2Data = user2Snap.data();

      const user1Name = user1Data?.profile?.name || 'Alguém';
      const user2Name = user2Data?.profile?.name || 'Alguém';
      const user1Photo = user1Data?.profile?.photos?.[0] || '';
      const user2Photo = user2Data?.profile?.photos?.[0] || '';

      // 3. Enviar push para User1 (sobre User2)
      const result1 = await sendPushToUser(db, {
        userId: user1Id,
        title: '💕 É um Match!',
        body: `Você e ${user2Name} combinaram! Comece uma conversa agora.`,
        type: 'match',
        data: {
          matchId,
          otherUserId: user2Id,
          otherUserName: user2Name,
          otherUserPhoto: user2Photo,
        },
        imageUrl: user2Photo,
      });

      // 4. Enviar push para User2 (sobre User1)
      const result2 = await sendPushToUser(db, {
        userId: user2Id,
        title: '💕 É um Match!',
        body: `Você e ${user1Name} combinaram! Comece uma conversa agora.`,
        type: 'match',
        data: {
          matchId,
          otherUserId: user1Id,
          otherUserName: user1Name,
          otherUserPhoto: user1Photo,
        },
        imageUrl: user1Photo,
      });

      logger.info('[sendMatchNotification] Notificações enviadas', {
        user1: result1.success,
        user2: result2.success,
      });

      return {
        success: result1.success || result2.success,
        notifications: {
          user1: { sent: result1.success, notificationId: result1.notificationId },
          user2: { sent: result2.success, notificationId: result2.notificationId },
        },
      };
    } catch (error: any) {
      logger.error('[sendMatchNotification] Erro:', error);

      if (error instanceof HttpsError) {
        throw error;
      }

      throw new HttpsError('internal', error.message || 'Erro ao enviar notificação de match');
    }
  }
);
