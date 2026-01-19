/**
 * 🔔 BOTA LOVE APP - Push Notification Helper
 * 
 * Utilitário para enviar notificações push via FCM:
 * - Gerencia tokens FCM
 * - Remove tokens inválidos automaticamente
 * - Cria registro no Firestore
 * 
 * @author Bota Love Team
 */

import * as admin from 'firebase-admin';
import * as logger from 'firebase-functions/logger';

// =============================================================================
// 📝 TIPOS
// =============================================================================

export interface PushPayload {
  userId: string;
  title: string;
  body: string;
  type: string;
  data?: Record<string, string>;
  imageUrl?: string;
}

export interface PushResult {
  success: boolean;
  notificationId?: string;
  tokensUsed: number;
  tokensRemoved: number;
  error?: string;
}

export interface UserNotificationSettings {
  pushEnabled: boolean;
  matchNotifications: boolean;
  messageNotifications: boolean;
  likeNotifications: boolean;
  marketingNotifications: boolean;
}

// =============================================================================
// 🔔 ENVIAR PUSH NOTIFICATION
// =============================================================================

/**
 * Envia push notification para um usuário
 */
export async function sendPushToUser(
  db: admin.firestore.Firestore,
  payload: PushPayload
): Promise<PushResult> {
  const { userId, title, body, type, data = {}, imageUrl } = payload;

  try {
    // 1. Buscar dados do usuário
    const userRef = db.collection('users').doc(userId);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      logger.warn(`[pushHelper] Usuário não encontrado: ${userId}`);
      return { success: false, tokensUsed: 0, tokensRemoved: 0, error: 'Usuário não encontrado' };
    }

    const userData = userSnap.data();
    const tokens: string[] = userData?.fcmTokens || [];
    const notificationSettings: UserNotificationSettings = userData?.notificationSettings || {
      pushEnabled: true,
      matchNotifications: true,
      messageNotifications: true,
      likeNotifications: true,
      marketingNotifications: false,
    };

    // 2. Verificar se notificações estão habilitadas
    if (!notificationSettings.pushEnabled) {
      logger.info(`[pushHelper] Notificações desabilitadas para usuário ${userId}`);
      return { success: false, tokensUsed: 0, tokensRemoved: 0, error: 'Notificações desabilitadas' };
    }

    // 3. Verificar tipo específico de notificação
    const typeEnabled = checkNotificationTypeEnabled(type, notificationSettings);
    if (!typeEnabled) {
      logger.info(`[pushHelper] Tipo de notificação '${type}' desabilitado para usuário ${userId}`);
      return { success: false, tokensUsed: 0, tokensRemoved: 0, error: `Notificação ${type} desabilitada` };
    }

    // 4. Verificar se há tokens
    if (tokens.length === 0) {
      logger.info(`[pushHelper] Usuário ${userId} não tem tokens FCM`);
      // Ainda assim, cria a notificação no Firestore
      const notificationId = await createNotificationRecord(db, userId, title, body, type, data);
      return { success: true, notificationId, tokensUsed: 0, tokensRemoved: 0 };
    }

    // 5. Criar registro de notificação no Firestore
    const notificationId = await createNotificationRecord(db, userId, title, body, type, data);

    // 6. Preparar mensagens para todos os tokens
    const messages: admin.messaging.Message[] = tokens.map((token) => ({
      token,
      notification: {
        title,
        body,
        ...(imageUrl && { imageUrl }),
      },
      data: {
        ...data,
        type,
        notificationId,
        click_action: 'FLUTTER_NOTIFICATION_CLICK',
      },
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channelId: getChannelId(type),
          icon: 'ic_notification',
          color: '#8B5A2B',
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
            'mutable-content': 1,
          },
        },
        headers: {
          'apns-priority': '10',
        },
      },
    }));

    // 7. Enviar para todos os tokens
    const response = await admin.messaging().sendEach(messages);

    // 8. Processar resultados e remover tokens inválidos
    const invalidTokens: string[] = [];
    response.responses.forEach((result, index) => {
      if (!result.success && result.error) {
        const errorCode = result.error.code;
        if (
          errorCode === 'messaging/invalid-registration-token' ||
          errorCode === 'messaging/registration-token-not-registered'
        ) {
          invalidTokens.push(tokens[index]);
          logger.warn(`[pushHelper] Token inválido removido: ${tokens[index].substring(0, 20)}...`);
        } else {
          logger.error(`[pushHelper] Erro ao enviar para token: ${errorCode}`);
        }
      }
    });

    // 9. Remover tokens inválidos do usuário
    if (invalidTokens.length > 0) {
      await userRef.update({
        fcmTokens: admin.firestore.FieldValue.arrayRemove(...invalidTokens),
      });
      logger.info(`[pushHelper] Removidos ${invalidTokens.length} tokens inválidos do usuário ${userId}`);
    }

    // 10. Atualizar status da notificação
    await db.collection('notifications').doc(notificationId).update({
      pushSent: true,
      pushSentAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    const successCount = response.successCount;
    logger.info(`[pushHelper] Push enviado para ${userId}: ${successCount}/${tokens.length} tokens`);

    return {
      success: successCount > 0,
      notificationId,
      tokensUsed: tokens.length,
      tokensRemoved: invalidTokens.length,
    };
  } catch (error: any) {
    logger.error('[pushHelper] Erro ao enviar push:', error);
    return {
      success: false,
      tokensUsed: 0,
      tokensRemoved: 0,
      error: error.message || 'Erro desconhecido',
    };
  }
}

// =============================================================================
// 🔧 FUNÇÕES AUXILIARES
// =============================================================================

/**
 * Cria registro de notificação no Firestore
 */
async function createNotificationRecord(
  db: admin.firestore.Firestore,
  userId: string,
  title: string,
  body: string,
  type: string,
  data: Record<string, string>
): Promise<string> {
  const notificationRef = db.collection('notifications').doc();
  
  await notificationRef.set({
    id: notificationRef.id,
    userId,
    type,
    title,
    body,
    data,
    read: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    pushSent: false,
  });

  return notificationRef.id;
}

/**
 * Verifica se tipo de notificação está habilitado
 */
function checkNotificationTypeEnabled(
  type: string,
  settings: UserNotificationSettings
): boolean {
  switch (type) {
    case 'match':
      return settings.matchNotifications;
    case 'message':
      return settings.messageNotifications;
    case 'like':
    case 'super_like':
      return settings.likeNotifications;
    case 'marketing':
      return settings.marketingNotifications;
    default:
      return true; // Tipos de sistema sempre permitidos
  }
}

/**
 * Retorna o ID do canal de notificação Android
 */
function getChannelId(type: string): string {
  switch (type) {
    case 'match':
      return 'matches';
    case 'message':
      return 'messages';
    case 'like':
    case 'super_like':
      return 'likes';
    default:
      return 'default';
  }
}

// =============================================================================
// 📤 EXPORTS
// =============================================================================

export { checkNotificationTypeEnabled, createNotificationRecord, getChannelId };

