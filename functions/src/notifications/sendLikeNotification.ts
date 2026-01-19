/**
 * 🔔 BOTA LOVE APP - Send Like Notification
 * 
 * Cloud Function para enviar notificação de like/super like.
 * Super likes sempre enviam notificação.
 * Likes normais só enviam para usuários premium.
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

interface SendLikeNotificationData {
  fromUserId: string;
  toUserId: string;
  isSuperLike: boolean;
}

interface SendLikeNotificationResult {
  success: boolean;
  notificationId?: string;
  skipped?: boolean;
  skipReason?: string;
  error?: string;
}

// =============================================================================
// 🔔 CLOUD FUNCTION: sendLikeNotification
// =============================================================================

/**
 * Cloud Function para enviar notificação de like
 * 
 * Recebe: fromUserId, toUserId, isSuperLike
 * Envia: Push notification para o toUser
 * 
 * Regras:
 * - Super likes: sempre envia notificação
 * - Likes normais: só envia se toUser for premium
 */
export const sendLikeNotification = onCall<SendLikeNotificationData, Promise<SendLikeNotificationResult>>(
  {
    region: 'southamerica-east1',
    timeoutSeconds: 30,
    memory: '256MiB',
  },
  async (request: CallableRequest<SendLikeNotificationData>): Promise<SendLikeNotificationResult> => {
    const { fromUserId, toUserId, isSuperLike } = request.data;

    logger.info('[sendLikeNotification] Iniciando...', { fromUserId, toUserId, isSuperLike });

    try {
      // 1. Validar dados
      if (!fromUserId || !toUserId) {
        throw new HttpsError(
          'invalid-argument',
          'fromUserId e toUserId são obrigatórios'
        );
      }

      const db = admin.firestore();

      // 2. Se não for super like, verificar se o destinatário é premium
      if (!isSuperLike) {
        const toUserSnap = await db.collection('users').doc(toUserId).get();
        
        if (!toUserSnap.exists) {
          throw new HttpsError('not-found', 'Usuário destinatário não encontrado');
        }

        const toUserData = toUserSnap.data();
        const subscription = toUserData?.subscription;
        
        // Verificar se é premium (trial ou ativo)
        const isPremium = subscription && 
          (subscription.status === 'trial' || subscription.status === 'active') &&
          subscription.endDate?.toDate() > new Date();

        if (!isPremium) {
          logger.info('[sendLikeNotification] Usuário não é premium, notificação pulada');
          return {
            success: true,
            skipped: true,
            skipReason: 'Usuário não é premium',
          };
        }
      }

      // 3. Buscar dados do remetente (quem deu o like)
      const fromUserSnap = await db.collection('users').doc(fromUserId).get();

      if (!fromUserSnap.exists) {
        throw new HttpsError('not-found', 'Usuário remetente não encontrado');
      }

      const fromUserData = fromUserSnap.data();
      const fromUserName = fromUserData?.profile?.name || 'Alguém';
      const fromUserPhoto = fromUserData?.profile?.photos?.[0] || '';

      // 4. Preparar notificação
      const title = isSuperLike 
        ? '⭐ Super Like!' 
        : '❤️ Alguém curtiu você!';
      
      const body = isSuperLike
        ? `${fromUserName} deu um Super Like em você!`
        : `${fromUserName} curtiu seu perfil. Veja quem é!`;

      const type = isSuperLike ? 'super_like' : 'like';

      // 5. Enviar push
      const result = await sendPushToUser(db, {
        userId: toUserId,
        title,
        body,
        type,
        data: {
          fromUserId,
          fromUserName,
          isSuperLike: isSuperLike ? 'true' : 'false',
        },
        imageUrl: fromUserPhoto,
      });

      logger.info('[sendLikeNotification] Resultado:', { success: result.success });

      return {
        success: result.success,
        notificationId: result.notificationId,
        error: result.error,
      };
    } catch (error: any) {
      logger.error('[sendLikeNotification] Erro:', error);

      if (error instanceof HttpsError) {
        throw error;
      }

      throw new HttpsError('internal', error.message || 'Erro ao enviar notificação de like');
    }
  }
);
