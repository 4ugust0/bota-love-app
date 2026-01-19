/**
 * 🔥 BOTA LOVE APP - Notification Service
 * 
 * Gerencia notificações push e in-app:
 * - Registro de FCM tokens
 * - Envio de notificações locais
 * - Histórico de notificações
 * 
 * @author Bota Love Team
 */

import {
    addDoc,
    collection,
    doc,
    getDocs,
    limit,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    Timestamp,
    updateDoc,
    where,
    writeBatch
} from 'firebase/firestore';
import { firestore } from './config';
import {
    COLLECTIONS,
    FirebaseNotification,
    NotificationType,
} from './types';

// =============================================================================
// 📝 TIPOS
// =============================================================================

export interface NotificationPayload {
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, string>;
}

// =============================================================================
// 🔔 OPERAÇÕES DE NOTIFICAÇÃO
// =============================================================================

/**
 * Cria notificação no Firestore
 */
export async function createNotification(
  userId: string,
  notification: NotificationPayload
): Promise<string> {
  try {
    const notificationData: Omit<FirebaseNotification, 'id'> = {
      userId,
      type: notification.type,
      title: notification.title,
      body: notification.body,
      data: notification.data || {},
      read: false,
      createdAt: Timestamp.now(),
      pushSent: false,
    };

    const docRef = await addDoc(
      collection(firestore, COLLECTIONS.NOTIFICATIONS),
      notificationData
    );

    return docRef.id;
  } catch (error) {
    console.error('Erro ao criar notificação:', error);
    throw error;
  }
}

/**
 * Obtém notificações do usuário
 */
export async function getUserNotifications(
  userId: string,
  onlyUnread: boolean = false,
  limitCount: number = 50
): Promise<FirebaseNotification[]> {
  try {
    let constraints: any[] = [
      where('userId', '==', userId),
    ];

    if (onlyUnread) {
      constraints.push(where('read', '==', false));
    }

    constraints.push(orderBy('createdAt', 'desc'));
    constraints.push(limit(limitCount));

    const q = query(collection(firestore, COLLECTIONS.NOTIFICATIONS), ...constraints);
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }) as FirebaseNotification);
  } catch (error) {
    console.error('Erro ao buscar notificações:', error);
    return [];
  }
}

/**
 * Conta notificações não lidas
 */
export async function getUnreadNotificationCount(userId: string): Promise<number> {
  try {
    const q = query(
      collection(firestore, COLLECTIONS.NOTIFICATIONS),
      where('userId', '==', userId),
      where('read', '==', false)
    );

    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (error) {
    console.error('Erro ao contar notificações:', error);
    return 0;
  }
}

/**
 * Marca notificação como lida
 */
export async function markNotificationAsRead(notificationId: string): Promise<void> {
  try {
    await updateDoc(doc(firestore, COLLECTIONS.NOTIFICATIONS, notificationId), {
      read: true,
      readAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Erro ao marcar notificação como lida:', error);
  }
}

/**
 * Marca todas as notificações como lidas
 */
export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  try {
    const q = query(
      collection(firestore, COLLECTIONS.NOTIFICATIONS),
      where('userId', '==', userId),
      where('read', '==', false)
    );

    const snapshot = await getDocs(q);
    
    if (snapshot.empty) return;

    const batch = writeBatch(firestore);
    
    snapshot.docs.forEach((doc) => {
      batch.update(doc.ref, {
        read: true,
        readAt: serverTimestamp(),
      });
    });

    await batch.commit();
  } catch (error) {
    console.error('Erro ao marcar todas notificações como lidas:', error);
  }
}

/**
 * Deleta notificação
 */
export async function deleteNotification(notificationId: string): Promise<void> {
  try {
    const { deleteDoc: firestoreDeleteDoc } = await import('firebase/firestore');
    await firestoreDeleteDoc(doc(firestore, COLLECTIONS.NOTIFICATIONS, notificationId));
  } catch (error) {
    console.error('Erro ao deletar notificação:', error);
  }
}

// =============================================================================
// 📡 LISTENERS EM TEMPO REAL
// =============================================================================

/**
 * Escuta notificações em tempo real
 */
export function subscribeToNotifications(
  userId: string,
  callback: (notifications: FirebaseNotification[]) => void
): () => void {
  const q = query(
    collection(firestore, COLLECTIONS.NOTIFICATIONS),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(50)
  );

  return onSnapshot(q, (snapshot) => {
    const notifications = snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }) as FirebaseNotification);
    callback(notifications);
  }, (error) => {
    console.error('Erro no listener de notificações:', error);
    callback([]);
  });
}

/**
 * Escuta contagem de notificações não lidas
 */
export function subscribeToUnreadCount(
  userId: string,
  callback: (count: number) => void
): () => void {
  const q = query(
    collection(firestore, COLLECTIONS.NOTIFICATIONS),
    where('userId', '==', userId),
    where('read', '==', false)
  );

  return onSnapshot(q, (snapshot) => {
    callback(snapshot.size);
  }, (error) => {
    console.error('Erro no listener de contagem:', error);
    callback(0);
  });
}

// =============================================================================
// 🔧 TEMPLATES DE NOTIFICAÇÃO
// =============================================================================

export const NOTIFICATION_TEMPLATES = {
  newMatch: (matchedUserName: string): NotificationPayload => ({
    type: 'match',
    title: '💕 É um Match!',
    body: `Você e ${matchedUserName} combinaram! Comece uma conversa agora.`,
  }),

  newMessage: (senderName: string, preview: string): NotificationPayload => ({
    type: 'message',
    title: `💬 ${senderName}`,
    body: preview.length > 50 ? preview.substring(0, 47) + '...' : preview,
  }),

  newLike: (likerName: string): NotificationPayload => ({
    type: 'like',
    title: '❤️ Alguém curtiu você!',
    body: `${likerName} curtiu seu perfil. Veja quem é!`,
  }),

  newSuperLike: (likerName: string): NotificationPayload => ({
    type: 'super_like',
    title: '⭐ Super Like!',
    body: `${likerName} deu um Super Like em você!`,
  }),

  trialExpiring: (daysLeft: number): NotificationPayload => ({
    type: 'trial_expiring',
    title: '⏰ Seu trial está acabando',
    body: `Restam ${daysLeft} dias do seu período de teste. Assine agora!`,
  }),

  subscriptionExpired: (): NotificationPayload => ({
    type: 'subscription_expired',
    title: '😢 Assinatura expirada',
    body: 'Sua assinatura expirou. Renove para continuar aproveitando todos os recursos.',
  }),
};

// =============================================================================
// 📤 EXPORTS
// =============================================================================

export { NOTIFICATION_TEMPLATES as NotificationTemplates };
