/**
 * 🔥 BOTA LOVE APP - On User Login Function
 * 
 * Cloud Function que é chamada quando o usuário faz login.
 * Realiza verificações e atualizações em tempo real:
 * 
 * 1. Verifica assinaturas expiradas
 * 2. Verifica trial expirando
 * 3. Verifica chats inativos
 * 4. Limpa dados antigos do usuário
 * 
 * @author Bota Love Team
 */

import * as admin from 'firebase-admin';
import * as logger from 'firebase-functions/logger';
import { HttpsError, onCall } from 'firebase-functions/v2/https';

// =============================================================================
// 📝 TIPOS
// =============================================================================

interface OnLoginRequest {
  userId: string;
}

interface LoginCheckResult {
  subscriptionUpdated: boolean;
  subscriptionExpired: boolean;
  trialExpiringDays: number | null;
  inactiveChatsCount: number;
  cleanedDataCount: number;
  notifications: LoginNotification[];
}

interface LoginNotification {
  type: 'subscription_expired' | 'trial_expiring' | 'inactive_chat' | 'info';
  title: string;
  message: string;
  data?: Record<string, any>;
}

interface ChatDoc {
  id: string;
  participants: [string, string];
  lastMessage: {
    timestamp: admin.firestore.Timestamp;
  } | null;
  inactivityReminders: number;
  isActive: boolean;
}

interface UserDoc {
  subscription: {
    status: string;
    endDate: admin.firestore.Timestamp | null;
    trialEndDate: admin.firestore.Timestamp | null;
  };
  networkRural: {
    subscription: {
      status: string;
      endDate: admin.firestore.Timestamp | null;
      trialEndDate: admin.firestore.Timestamp | null;
    };
  };
  profile: {
    name: string;
  };
  fcmTokens?: string[];
}

// =============================================================================
// 🔔 HELPER: ENVIAR NOTIFICAÇÃO PUSH
// =============================================================================

async function sendPushNotification(
  db: admin.firestore.Firestore,
  userId: string,
  title: string,
  body: string,
  data: Record<string, string> = {},
  type: string = 'system'
): Promise<void> {
  try {
    const userRef = db.collection('users').doc(userId);
    const userSnap = await userRef.get();
    
    if (!userSnap.exists) return;
    
    const userData = userSnap.data() as UserDoc;
    const tokens = userData.fcmTokens || [];
    
    if (tokens.length === 0) {
      logger.info(`Usuário ${userId} não tem tokens FCM registrados`);
      return;
    }
    
    // Criar registro de notificação no Firestore
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
    
    // Enviar push para todos os tokens do usuário
    const messages = tokens.map((token: string) => ({
      token,
      notification: { title, body },
      data,
      android: {
        priority: 'high' as const,
        notification: { sound: 'default' },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
          },
        },
      },
    }));
    
    const results = await admin.messaging().sendEach(messages);
    
    // Remover tokens inválidos
    const invalidTokens: string[] = [];
    results.responses.forEach((response, index) => {
      if (!response.success && response.error) {
        const errorCode = response.error.code;
        if (
          errorCode === 'messaging/invalid-registration-token' ||
          errorCode === 'messaging/registration-token-not-registered'
        ) {
          invalidTokens.push(tokens[index]);
        }
      }
    });
    
    if (invalidTokens.length > 0) {
      await userRef.update({
        fcmTokens: admin.firestore.FieldValue.arrayRemove(...invalidTokens),
      });
      logger.info(`Removidos ${invalidTokens.length} tokens inválidos do usuário ${userId}`);
    }
    
    // Atualizar status da notificação
    await notificationRef.update({
      pushSent: true,
      pushSentAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    logger.info(`Push enviado para usuário ${userId}: ${title}`);
  } catch (error) {
    logger.error('Erro ao enviar push notification:', error);
  }
}

// =============================================================================
// 📅 VERIFICAR ASSINATURAS EXPIRADAS
// =============================================================================

async function checkExpiredSubscription(
  db: admin.firestore.Firestore,
  userId: string,
  userData: UserDoc
): Promise<{ updated: boolean; expired: boolean; notification: LoginNotification | null }> {
  const now = admin.firestore.Timestamp.now();
  let updated = false;
  let expired = false;
  let notification: LoginNotification | null = null;
  
  // Verificar assinatura principal
  if (
    userData.subscription?.endDate &&
    userData.subscription.endDate.toMillis() < now.toMillis() &&
    userData.subscription.status !== 'expired' &&
    userData.subscription.status !== 'none'
  ) {
    logger.info(`Assinatura expirada para usuário ${userId}`);
    
    await db.collection('users').doc(userId).update({
      'subscription.status': 'expired',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    updated = true;
    expired = true;
    
    // Enviar notificação push
    await sendPushNotification(
      db,
      userId,
      '😢 Sua assinatura expirou',
      'Renove sua assinatura para continuar aproveitando todos os recursos premium.',
      { type: 'subscription_expired' },
      'subscription_expired'
    );
    
    notification = {
      type: 'subscription_expired',
      title: 'Assinatura Expirada',
      message: 'Sua assinatura Premium expirou. Renove para continuar aproveitando todos os recursos.',
    };
  }
  
  // Verificar assinatura Network Rural
  if (
    userData.networkRural?.subscription?.endDate &&
    userData.networkRural.subscription.endDate.toMillis() < now.toMillis() &&
    userData.networkRural.subscription.status !== 'expired' &&
    userData.networkRural.subscription.status !== 'none'
  ) {
    logger.info(`Assinatura Network Rural expirada para usuário ${userId}`);
    
    await db.collection('users').doc(userId).update({
      'networkRural.subscription.status': 'expired',
      'networkRural.isActive': false,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    updated = true;
    expired = true;
    
    await sendPushNotification(
      db,
      userId,
      '🌾 Sua assinatura Network Rural expirou',
      'Renove para continuar conectando com profissionais do agronegócio.',
      { type: 'subscription_expired', network: 'rural' },
      'subscription_expired'
    );
    
    notification = {
      type: 'subscription_expired',
      title: 'Network Rural Expirada',
      message: 'Sua assinatura Network Rural expirou. Renove para continuar conectando.',
    };
  }
  
  return { updated, expired, notification };
}

// =============================================================================
// ⏰ VERIFICAR TRIAL EXPIRANDO
// =============================================================================

async function checkTrialExpiring(
  db: admin.firestore.Firestore,
  userId: string,
  userData: UserDoc
): Promise<{ daysRemaining: number | null; notification: LoginNotification | null }> {
  const now = new Date();
  let notification: LoginNotification | null = null;
  
  // Verificar trial principal
  if (
    userData.subscription?.status === 'trial' &&
    userData.subscription.trialEndDate
  ) {
    const trialEnd = userData.subscription.trialEndDate.toDate();
    const diffTime = trialEnd.getTime() - now.getTime();
    const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (daysRemaining > 0 && daysRemaining <= 3) {
      logger.info(`Trial expirando em ${daysRemaining} dias para usuário ${userId}`);
      
      const dayText = daysRemaining === 1 ? 'dia' : 'dias';
      
      await sendPushNotification(
        db,
        userId,
        `⏰ Seu trial acaba em ${daysRemaining} ${dayText}!`,
        'Aproveite os últimos dias e não perca os recursos premium.',
        { type: 'trial_expiring', daysRemaining: String(daysRemaining) },
        'trial_expiring'
      );
      
      notification = {
        type: 'trial_expiring',
        title: 'Trial Expirando',
        message: `Seu trial premium acaba em ${daysRemaining} ${dayText}. Aproveite!`,
        data: { daysRemaining },
      };
      
      return { daysRemaining, notification };
    }
    
    return { daysRemaining: daysRemaining > 0 ? daysRemaining : null, notification: null };
  }
  
  // Verificar trial Network Rural
  if (
    userData.networkRural?.subscription?.status === 'trial' &&
    userData.networkRural.subscription.trialEndDate
  ) {
    const trialEnd = userData.networkRural.subscription.trialEndDate.toDate();
    const diffTime = trialEnd.getTime() - now.getTime();
    const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (daysRemaining > 0 && daysRemaining <= 3) {
      logger.info(`Trial Network Rural expirando em ${daysRemaining} dias para usuário ${userId}`);
      
      const dayText = daysRemaining === 1 ? 'dia' : 'dias';
      
      await sendPushNotification(
        db,
        userId,
        `🌾 Seu trial Network Rural acaba em ${daysRemaining} ${dayText}!`,
        'Continue conectando com profissionais do agronegócio.',
        { type: 'trial_expiring', daysRemaining: String(daysRemaining), network: 'rural' },
        'trial_expiring'
      );
      
      notification = {
        type: 'trial_expiring',
        title: 'Trial Network Rural Expirando',
        message: `Seu trial Network Rural acaba em ${daysRemaining} ${dayText}.`,
        data: { daysRemaining },
      };
      
      return { daysRemaining, notification };
    }
    
    return { daysRemaining: daysRemaining > 0 ? daysRemaining : null, notification: null };
  }
  
  return { daysRemaining: null, notification: null };
}

// =============================================================================
// 💬 VERIFICAR CHATS INATIVOS
// =============================================================================

async function checkInactiveChats(
  db: admin.firestore.Firestore,
  userId: string
): Promise<{ count: number; notifications: LoginNotification[] }> {
  const notifications: LoginNotification[] = [];
  const now = admin.firestore.Timestamp.now();
  const fortyEightHoursAgo = admin.firestore.Timestamp.fromMillis(
    now.toMillis() - (48 * 60 * 60 * 1000)
  );
  
  try {
    // Buscar chats do usuário
    const chatsQuery = await db
      .collection('chats')
      .where('participants', 'array-contains', userId)
      .where('isActive', '==', true)
      .get();
    
    let inactiveCount = 0;
    const batch = db.batch();
    let batchCount = 0;
    
    for (const chatDoc of chatsQuery.docs) {
      const chat = chatDoc.data() as ChatDoc;
      
      // Verificar se o chat está inativo há mais de 48h
      if (
        chat.lastMessage?.timestamp &&
        chat.lastMessage.timestamp.toMillis() < fortyEightHoursAgo.toMillis() &&
        (chat.inactivityReminders || 0) < 3
      ) {
        // Calcular dias de inatividade
        const inactiveMs = now.toMillis() - chat.lastMessage.timestamp.toMillis();
        const inactiveDays = Math.floor(inactiveMs / (1000 * 60 * 60 * 24));
        
        // Incrementar contador de lembretes
        batch.update(chatDoc.ref, {
          inactivityReminders: (chat.inactivityReminders || 0) + 1,
          lastReminderAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        batchCount++;
        
        inactiveCount++;
        
        // Encontrar o outro participante
        const otherUserId = chat.participants.find((p: string) => p !== userId);
        if (otherUserId) {
          // Buscar nome do outro participante
          const otherUserSnap = await db.collection('users').doc(otherUserId).get();
          const otherUserData = otherUserSnap.data() as UserDoc | undefined;
          const otherUserName = otherUserData?.profile?.name || 'Alguém';
          
          // Enviar push apenas para o usuário atual (o outro receberá quando logar)
          await sendPushNotification(
            db,
            userId,
            '💬 Conversa parada há tempo',
            `Você e ${otherUserName} não conversam há ${inactiveDays} dias. Que tal mandar uma mensagem?`,
            { type: 'inactive_chat', chatId: chatDoc.id, otherUserId },
            'message'
          );
          
          notifications.push({
            type: 'inactive_chat',
            title: 'Conversa Inativa',
            message: `Você e ${otherUserName} não conversam há ${inactiveDays} dias.`,
            data: { chatId: chatDoc.id, otherUserName, inactiveDays },
          });
        }
        
        // Commit batch a cada 500 operações
        if (batchCount >= 500) {
          await batch.commit();
          batchCount = 0;
        }
      }
    }
    
    // Commit final do batch
    if (batchCount > 0) {
      await batch.commit();
    }
    
    logger.info(`${inactiveCount} chats inativos encontrados para usuário ${userId}`);
    
    return { count: inactiveCount, notifications };
  } catch (error) {
    logger.error('Erro ao verificar chats inativos:', error);
    return { count: 0, notifications: [] };
  }
}

// =============================================================================
// 🧹 LIMPAR DADOS ANTIGOS DO USUÁRIO
// =============================================================================

async function cleanupUserData(
  db: admin.firestore.Firestore,
  userId: string
): Promise<{ count: number }> {
  const now = admin.firestore.Timestamp.now();
  const twentyFourHoursAgo = admin.firestore.Timestamp.fromMillis(
    now.toMillis() - (24 * 60 * 60 * 1000)
  );
  const thirtyDaysAgo = admin.firestore.Timestamp.fromMillis(
    now.toMillis() - (30 * 24 * 60 * 60 * 1000)
  );
  
  let cleanedCount = 0;
  
  try {
    const batch = db.batch();
    let batchCount = 0;
    
    // 1. Limpar notificações lidas há mais de 30 dias
    const oldNotificationsQuery = await db
      .collection('notifications')
      .where('userId', '==', userId)
      .where('read', '==', true)
      .where('createdAt', '<', thirtyDaysAgo)
      .limit(100) // Limitar para não sobrecarregar
      .get();
    
    oldNotificationsQuery.docs.forEach((doc) => {
      batch.delete(doc.ref);
      batchCount++;
      cleanedCount++;
    });
    
    // 2. Limpar verificações de email expiradas (caso existam resquícios)
    const userRef = db.collection('users').doc(userId);
    const userSnap = await userRef.get();
    
    if (userSnap.exists) {
      const userData = userSnap.data();
      if (
        userData?.verificationCodeExpiry &&
        userData.verificationCodeExpiry.toMillis() < twentyFourHoursAgo.toMillis()
      ) {
        batch.update(userRef, {
          verificationCode: null,
          verificationCodeExpiry: null,
        });
        batchCount++;
        cleanedCount++;
      }
    }
    
    // Commit do batch
    if (batchCount > 0) {
      await batch.commit();
    }
    
    logger.info(`${cleanedCount} registros antigos limpos para usuário ${userId}`);
    
    return { count: cleanedCount };
  } catch (error) {
    logger.error('Erro ao limpar dados antigos:', error);
    return { count: 0 };
  }
}

// =============================================================================
// 🚀 FUNÇÃO PRINCIPAL: ON USER LOGIN
// =============================================================================

export const onUserLogin = onCall(
  {
    region: 'southamerica-east1',
    maxInstances: 10,
  },
  async (request) => {
    const { userId } = request.data as OnLoginRequest;
    
    // Validar entrada
    if (!userId) {
      throw new HttpsError('invalid-argument', 'userId é obrigatório');
    }
    
    // Verificar autenticação
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Usuário não autenticado');
    }
    
    // Verificar se o usuário está acessando seus próprios dados
    if (request.auth.uid !== userId) {
      throw new HttpsError('permission-denied', 'Acesso não autorizado');
    }
    
    logger.info(`🔑 Processando login do usuário: ${userId}`);
    
    const db = admin.firestore();
    const result: LoginCheckResult = {
      subscriptionUpdated: false,
      subscriptionExpired: false,
      trialExpiringDays: null,
      inactiveChatsCount: 0,
      cleanedDataCount: 0,
      notifications: [],
    };
    
    try {
      // 1. Buscar dados do usuário
      const userRef = db.collection('users').doc(userId);
      const userSnap = await userRef.get();
      
      if (!userSnap.exists) {
        throw new HttpsError('not-found', 'Usuário não encontrado');
      }
      
      const userData = userSnap.data() as UserDoc;
      
      // 2. Verificar assinaturas expiradas
      const subscriptionCheck = await checkExpiredSubscription(db, userId, userData);
      result.subscriptionUpdated = subscriptionCheck.updated;
      result.subscriptionExpired = subscriptionCheck.expired;
      if (subscriptionCheck.notification) {
        result.notifications.push(subscriptionCheck.notification);
      }
      
      // 3. Verificar trial expirando
      const trialCheck = await checkTrialExpiring(db, userId, userData);
      result.trialExpiringDays = trialCheck.daysRemaining;
      if (trialCheck.notification) {
        result.notifications.push(trialCheck.notification);
      }
      
      // 4. Verificar chats inativos
      const inactiveChatsCheck = await checkInactiveChats(db, userId);
      result.inactiveChatsCount = inactiveChatsCheck.count;
      result.notifications.push(...inactiveChatsCheck.notifications);
      
      // 5. Limpar dados antigos
      const cleanupResult = await cleanupUserData(db, userId);
      result.cleanedDataCount = cleanupResult.count;
      
      // 6. Atualizar lastActive
      await userRef.update({
        lastActive: admin.firestore.FieldValue.serverTimestamp(),
      });
      
      logger.info(`✅ Login processado com sucesso para usuário: ${userId}`, result);
      
      return result;
    } catch (error: any) {
      logger.error(`❌ Erro ao processar login do usuário ${userId}:`, error);
      
      if (error instanceof HttpsError) {
        throw error;
      }
      
      throw new HttpsError('internal', 'Erro ao processar login');
    }
  }
);
