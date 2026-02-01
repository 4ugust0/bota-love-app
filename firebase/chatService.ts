/**
 * 🔥 BOTA LOVE APP - Chat Service
 * 
 * Sistema unificado de chat para:
 * - Match (relacionamentos)
 * - Network Rural (networking profissional)
 * 
 * Inclui:
 * - Envio/recebimento de mensagens
 * - Moderação de conteúdo (REGEX + IA)
 * - Gerenciamento de lembretes
 * - Histórico de conversas
 * 
 * @author Bota Love Team
 * @updated 2026-01-06
 */

import {
    logModerationAttempt,
    moderateChatMessage,
    ModerationAction
} from '@/services/advancedModerationService';
import {
    addDoc,
    collection,
    doc,
    DocumentSnapshot,
    getDoc,
    getDocs,
    increment,
    limit,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
    startAfter,
    Timestamp,
    updateDoc,
    where,
    writeBatch,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { firestore, functions } from './config';
import {
    ChatOrigin,
    COLLECTIONS,
    FirebaseChat,
    FirebaseMessage,
    MessageType
} from './types';

// =============================================================================
// 📝 TIPOS
// =============================================================================

export interface SendMessageResult {
  success: boolean;
  messageId?: string;
  moderated?: boolean;
  blocked?: boolean;
  error?: string;
  moderationAction?: ModerationAction;
  moderationMessage?: string;
}

export interface ChatWithDetails {
  chat: FirebaseChat;
  otherUserId: string;
  otherUserName?: string;
  otherUserPhoto?: string;
  unreadCount: number;
}

// =============================================================================
// 💬 OPERAÇÕES DE CHAT
// =============================================================================

/**
 * Obtém chat pelo ID
 */
export async function getChatById(chatId: string): Promise<FirebaseChat | null> {
  try {
    const chatRef = doc(firestore, COLLECTIONS.CHATS, chatId);
    const chatSnap = await getDoc(chatRef);

    if (!chatSnap.exists()) {
      return null;
    }

    return { ...chatSnap.data(), id: chatSnap.id } as FirebaseChat;
  } catch (error) {
    console.error('Erro ao buscar chat:', error);
    return null;
  }
}

/**
 * Obtém todos os chats do usuário
 */
export async function getUserChats(
  userId: string,
  origin?: ChatOrigin
): Promise<FirebaseChat[]> {
  try {
    let constraints: any[] = [
      where('participants', 'array-contains', userId),
      where('isActive', '==', true),
    ];

    if (origin) {
      constraints.push(where('origin', '==', origin));
    }

    constraints.push(orderBy('updatedAt', 'desc'));

    const q = query(collection(firestore, COLLECTIONS.CHATS), ...constraints);
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }) as FirebaseChat);
  } catch (error) {
    console.error('Erro ao buscar chats:', error);
    return [];
  }
}

/**
 * Obtém chat entre dois usuários (se existir)
 */
export async function getChatBetweenUsers(
  userId1: string,
  userId2: string,
  origin?: ChatOrigin
): Promise<FirebaseChat | null> {
  try {
    const participants = [userId1, userId2].sort() as [string, string];
    
    let constraints: any[] = [
      where('participants', '==', participants),
      where('isActive', '==', true),
    ];

    if (origin) {
      constraints.push(where('origin', '==', origin));
    }

    constraints.push(limit(1));

    const q = query(collection(firestore, COLLECTIONS.CHATS), ...constraints);
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return { ...doc.data(), id: doc.id } as FirebaseChat;
  } catch (error) {
    console.error('Erro ao buscar chat entre usuários:', error);
    return null;
  }
}

/**
 * Cria chat para Network Rural
 */
export async function createNetworkChat(
  userId1: string,
  userId2: string,
  connectionId?: string
): Promise<FirebaseChat> {
  try {
    const participants = [userId1, userId2].sort() as [string, string];
    const chatId = `network_${participants[0]}_${participants[1]}`;

    const chatRef = doc(firestore, COLLECTIONS.CHATS, chatId);
    
    // Verificar se já existe
    const existingChat = await getDoc(chatRef);
    if (existingChat.exists()) {
      return { ...existingChat.data(), id: chatId } as FirebaseChat;
    }

    const chatData: Omit<FirebaseChat, 'id'> = {
      participants,
      origin: 'network',
      networkConnectionId: connectionId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      lastMessage: null,
      isActive: true,
      messageCount: 0,
      inactivityReminders: 0,
    };

    await setDoc(chatRef, chatData);

    return { ...chatData, id: chatId } as FirebaseChat;
  } catch (error) {
    console.error('Erro ao criar chat de network:', error);
    throw error;
  }
}

// =============================================================================
// 📨 MENSAGENS
// =============================================================================

/**
 * Envia mensagem com moderação avançada (REGEX + IA)
 */
export async function sendMessage(
  chatId: string,
  senderId: string,
  text: string,
  type: MessageType = 'text',
  isPremiumUser: boolean = false
): Promise<SendMessageResult> {
  try {
    // 1. Verificar se o chat existe e está ativo
    const chat = await getChatById(chatId);
    if (!chat) {
      return { success: false, error: 'Chat não encontrado' };
    }

    if (!chat.isActive) {
      return { success: false, error: 'Este chat não está mais ativo' };
    }

    if (chat.blockedBy) {
      return { success: false, blocked: true, error: 'Chat bloqueado' };
    }

    // Verificar se o usuário é participante
    if (!chat.participants.includes(senderId)) {
      return { success: false, error: 'Acesso negado' };
    }

    // 2. MODERAÇÃO AVANÇADA LOCAL (REGEX + IA)
    const moderationResult = await moderateChatMessage(text, isPremiumUser);
    
    // Logar tentativa de moderação
    logModerationAttempt(senderId, 'chat', text, moderationResult);
    
    // Verificar resultado da moderação
    if (moderationResult.action !== 'allow') {
      return {
        success: false,
        blocked: true,
        error: moderationResult.userMessage,
        moderationAction: moderationResult.action,
        moderationMessage: moderationResult.userMessage,
      };
    }

    let sanitizedText = text.trim();
    let wasModerated = false;
    
    // 3. Tentar moderação adicional via Cloud Function (se disponível)
    try {
      const moderateContent = httpsCallable(functions, 'moderateMessage');
      const cloudResult = await moderateContent({ text, chatId, senderId });
      const cloudModeration = cloudResult.data as {
        allowed: boolean;
        sanitizedText: string;
        score: number;
        violations: string[];
      };

      if (!cloudModeration.allowed) {
        return {
          success: false,
          blocked: true,
          error: 'Mensagem bloqueada pela moderação',
          moderationAction: 'block',
        };
      }
      
      sanitizedText = cloudModeration.sanitizedText;
      wasModerated = sanitizedText !== text;
    } catch (moderationError) {
      // Cloud Function não disponível, já fizemos moderação local
      console.warn('Moderação via Cloud Function não disponível, usando apenas moderação local');
    }

    // 4. Criar mensagem
    const messagesRef = collection(firestore, COLLECTIONS.CHATS, chatId, COLLECTIONS.MESSAGES);
    
    const messageData: Omit<FirebaseMessage, 'id'> = {
      chatId,
      senderId,
      text: sanitizedText,
      type,
      status: 'sent',
      createdAt: Timestamp.now(),
      moderated: wasModerated,
      originalText: wasModerated ? text : undefined,
    };

    const messageRef = await addDoc(messagesRef, messageData);

    // 5. Atualizar chat
    await updateDoc(doc(firestore, COLLECTIONS.CHATS, chatId), {
      lastMessage: {
        text: sanitizedText,
        senderId,
        timestamp: Timestamp.now(),
        type,
      },
      updatedAt: serverTimestamp(),
      messageCount: increment(1),
      inactivityReminders: 0, // Reset lembretes quando há atividade
    });

    // 6. Enviar notificação push
    const receiverId = chat.participants.find((p) => p !== senderId);
    if (receiverId) {
      const sendPushNotification = httpsCallable(functions, 'sendMessageNotification');
      await sendPushNotification({
        chatId,
        senderId,
        receiverId,
        messageText: sanitizedText,
        chatOrigin: chat.origin,
      }).catch(console.error);
    }

    return {
      success: true,
      messageId: messageRef.id,
      moderated: wasModerated,
    };
  } catch (error: any) {
    console.error('Erro ao enviar mensagem:', error);
    return {
      success: false,
      error: error.message || 'Erro ao enviar mensagem',
    };
  }
}

/**
 * Obtém mensagens do chat (paginado)
 */
export async function getChatMessages(
  chatId: string,
  limitCount: number = 50,
  lastMessageDoc?: DocumentSnapshot
): Promise<{ messages: FirebaseMessage[]; lastDoc: DocumentSnapshot | null }> {
  try {
    let constraints: any[] = [
      orderBy('createdAt', 'desc'),
      limit(limitCount),
    ];

    if (lastMessageDoc) {
      constraints.push(startAfter(lastMessageDoc));
    }

    const q = query(
      collection(firestore, COLLECTIONS.CHATS, chatId, COLLECTIONS.MESSAGES),
      ...constraints
    );

    const snapshot = await getDocs(q);
    
    const messages = snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }) as FirebaseMessage);

    const lastDoc = snapshot.docs.length > 0 
      ? snapshot.docs[snapshot.docs.length - 1] 
      : null;

    return { messages: messages.reverse(), lastDoc };
  } catch (error) {
    console.error('Erro ao buscar mensagens:', error);
    return { messages: [], lastDoc: null };
  }
}

/**
 * Marca mensagens como lidas
 */
export async function markMessagesAsRead(
  chatId: string,
  userId: string
): Promise<void> {
  try {
    const q = query(
      collection(firestore, COLLECTIONS.CHATS, chatId, COLLECTIONS.MESSAGES),
      where('senderId', '!=', userId),
      where('status', '!=', 'read')
    );

    const snapshot = await getDocs(q);
    
    if (snapshot.empty) return;

    const batch = writeBatch(firestore);
    
    snapshot.docs.forEach((doc) => {
      batch.update(doc.ref, {
        status: 'read',
        readAt: serverTimestamp(),
      });
    });

    await batch.commit();
  } catch (error) {
    console.error('Erro ao marcar mensagens como lidas:', error);
  }
}

/**
 * Conta mensagens não lidas
 */
export async function getUnreadCount(chatId: string, userId: string): Promise<number> {
  try {
    const q = query(
      collection(firestore, COLLECTIONS.CHATS, chatId, COLLECTIONS.MESSAGES),
      where('senderId', '!=', userId),
      where('status', '!=', 'read')
    );

    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (error) {
    console.error('Erro ao contar mensagens não lidas:', error);
    return 0;
  }
}

// =============================================================================
// 🔔 LEMBRETES DE INATIVIDADE
// =============================================================================

/**
 * Verifica e atualiza status de inatividade do chat
 */
export async function checkChatInactivity(chatId: string): Promise<void> {
  try {
    const chat = await getChatById(chatId);
    if (!chat || !chat.lastMessage) return;

    const lastMessageTime = chat.lastMessage.timestamp.toDate();
    const now = new Date();
    const hoursDiff = (now.getTime() - lastMessageTime.getTime()) / (1000 * 60 * 60);

    // Lógica de lembretes baseada no tempo
    if (hoursDiff > 48 && chat.inactivityReminders < 1) {
      await updateDoc(doc(firestore, COLLECTIONS.CHATS, chatId), {
        inactivityReminders: 1,
        lastReminderAt: serverTimestamp(),
      });
      // Trigger Cloud Function para enviar lembrete
    } else if (hoursDiff > 120 && chat.inactivityReminders < 2) { // 5 dias
      await updateDoc(doc(firestore, COLLECTIONS.CHATS, chatId), {
        inactivityReminders: 2,
        lastReminderAt: serverTimestamp(),
      });
    } else if (hoursDiff > 168 && chat.inactivityReminders < 3) { // 7 dias
      await updateDoc(doc(firestore, COLLECTIONS.CHATS, chatId), {
        inactivityReminders: 3,
        lastReminderAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error('Erro ao verificar inatividade:', error);
  }
}

// =============================================================================
// 🚫 BLOQUEIO E DENÚNCIA
// =============================================================================

/**
 * Bloqueia chat
 */
export async function blockChat(chatId: string, blockedByUserId: string): Promise<void> {
  try {
    await updateDoc(doc(firestore, COLLECTIONS.CHATS, chatId), {
      blockedBy: blockedByUserId,
      isActive: false,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Erro ao bloquear chat:', error);
    throw error;
  }
}

/**
 * Desbloqueia chat (apenas quem bloqueou pode desbloquear)
 */
export async function unblockChat(chatId: string, userId: string): Promise<void> {
  try {
    const chat = await getChatById(chatId);
    if (!chat) throw new Error('Chat não encontrado');
    if (chat.blockedBy !== userId) throw new Error('Apenas quem bloqueou pode desbloquear');

    await updateDoc(doc(firestore, COLLECTIONS.CHATS, chatId), {
      blockedBy: null,
      isActive: true,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Erro ao desbloquear chat:', error);
    throw error;
  }
}

// =============================================================================
// 📡 LISTENERS EM TEMPO REAL
// =============================================================================

/**
 * Escuta mensagens em tempo real
 */
export function subscribeToMessages(
  chatId: string,
  callback: (messages: FirebaseMessage[]) => void
): () => void {
  const q = query(
    collection(firestore, COLLECTIONS.CHATS, chatId, COLLECTIONS.MESSAGES),
    orderBy('createdAt', 'asc')
  );

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }) as FirebaseMessage);
    callback(messages);
  }, (error) => {
    console.error('Erro no listener de mensagens:', error);
    callback([]);
  });
}

/**
 * Escuta chats em tempo real
 */
export function subscribeToUserChats(
  userId: string,
  callback: (chats: FirebaseChat[]) => void,
  origin?: ChatOrigin
): () => void {
  let constraints: any[] = [
    where('participants', 'array-contains', userId),
    where('isActive', '==', true),
  ];

  if (origin) {
    constraints.push(where('origin', '==', origin));
  }

  constraints.push(orderBy('updatedAt', 'desc'));

  const q = query(collection(firestore, COLLECTIONS.CHATS), ...constraints);

  return onSnapshot(q, (snapshot) => {
    const chats = snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }) as FirebaseChat);
    callback(chats);
  }, (error) => {
    console.error('Erro no listener de chats:', error);
    callback([]);
  });
}

// =============================================================================
// 🛠️ FUNÇÕES AUXILIARES
// =============================================================================

/**
 * Obtém o ID do outro participante do chat
 */
export function getOtherParticipant(chat: FirebaseChat, currentUserId: string): string {
  return chat.participants.find((p) => p !== currentUserId) || '';
}

// =============================================================================
// 🎭 MISTÉRIO DO CAMPO
// =============================================================================

/**
 * Interface para dados do Mistério do Campo
 */
export interface MisterioDoCalampoData {
  senderId: string;
  recipientId: string;
  message: string;
  senderName: string;
  senderPhotoUrl: string;
  blurredPhotoUrl?: string;
}

/**
 * Envia uma mensagem anônima "Mistério do Campo"
 * A identidade do remetente fica oculta por 24h ou até o destinatário pagar R$1,99
 */
export async function sendMisterioMessage(data: MisterioDoCalampoData): Promise<SendMessageResult> {
  try {
    const { senderId, recipientId, message, senderName, senderPhotoUrl, blurredPhotoUrl } = data;
    
    // Criar ou obter chat de mistério
    const participants = [senderId, recipientId].sort() as [string, string];
    const chatId = `misterio_${participants[0]}_${participants[1]}_${Date.now()}`;
    
    const chatRef = doc(firestore, COLLECTIONS.CHATS, chatId);
    
    // Expiração: 24 horas a partir de agora
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);
    
    // Criar o chat de mistério
    const chatData = {
      participants,
      origin: 'misterio_do_campo' as ChatOrigin,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastMessage: {
        text: '🎭 Nova mensagem misteriosa...',
        senderId,
        timestamp: serverTimestamp(),
        type: 'misterio',
      },
      isActive: true,
      messageCount: 1,
      inactivityReminders: 0,
      misterioData: {
        isRevealed: false,
        expiresAt: Timestamp.fromDate(expiresAt),
        senderId,
      }
    };
    
    await setDoc(chatRef, chatData);
    
    // Criar a mensagem
    const messageRef = doc(collection(firestore, COLLECTIONS.CHATS, chatId, COLLECTIONS.MESSAGES));
    
    const messageData: Omit<FirebaseMessage, 'id'> = {
      chatId,
      senderId,
      text: message,
      type: 'misterio',
      status: 'sent',
      createdAt: Timestamp.now(),
      moderated: false,
      misterio: {
        isRevealed: false,
        expiresAt: Timestamp.fromDate(expiresAt),
        blurredPhotoUrl: blurredPhotoUrl || senderPhotoUrl, // Usar a foto desfocada se disponível
        originalPhotoUrl: senderPhotoUrl,
        senderName,
      }
    };
    
    await setDoc(messageRef, messageData);
    
    // Enviar notificação para o destinatário
    try {
      await addDoc(collection(firestore, COLLECTIONS.NOTIFICATIONS), {
        userId: recipientId,
        type: 'message',
        title: '🎭 Mistério do Campo',
        body: 'Alguém enviou uma mensagem misteriosa para você!',
        data: { chatId, type: 'misterio_do_campo' },
        read: false,
        createdAt: serverTimestamp(),
      });
    } catch (notifError) {
      console.warn('Erro ao enviar notificação:', notifError);
    }
    
    return { success: true, messageId: messageRef.id };
  } catch (error) {
    console.error('Erro ao enviar Mistério do Campo:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    };
  }
}

/**
 * Revela a identidade do remetente de uma mensagem mistério
 * @param chatId ID do chat
 * @param messageId ID da mensagem
 * @param method Como foi revelada: 'paid' (pago) ou 'timer' (24h expirado)
 */
export async function revealMisterioIdentity(
  chatId: string, 
  messageId: string, 
  method: 'paid' | 'timer'
): Promise<boolean> {
  try {
    const messageRef = doc(firestore, COLLECTIONS.CHATS, chatId, COLLECTIONS.MESSAGES, messageId);
    const chatRef = doc(firestore, COLLECTIONS.CHATS, chatId);
    
    // Atualizar a mensagem
    await updateDoc(messageRef, {
      'misterio.isRevealed': true,
      'misterio.revealedAt': serverTimestamp(),
      'misterio.revealMethod': method,
    });
    
    // Atualizar o chat
    await updateDoc(chatRef, {
      'misterioData.isRevealed': true,
      'misterioData.revealedAt': serverTimestamp(),
      'misterioData.revealMethod': method,
      updatedAt: serverTimestamp(),
    });
    
    return true;
  } catch (error) {
    console.error('Erro ao revelar identidade:', error);
    return false;
  }
}

/**
 * Verifica e revela automaticamente mensagens mistério expiradas
 * (Pode ser chamado pelo app ou por uma Cloud Function)
 */
export async function checkAndRevealExpiredMisterios(userId: string): Promise<number> {
  try {
    const now = Timestamp.now();
    
    // Buscar chats de mistério do usuário que ainda não foram revelados
    const q = query(
      collection(firestore, COLLECTIONS.CHATS),
      where('participants', 'array-contains', userId),
      where('origin', '==', 'misterio_do_campo'),
      where('misterioData.isRevealed', '==', false)
    );
    
    const snapshot = await getDocs(q);
    let revealedCount = 0;
    
    for (const chatDoc of snapshot.docs) {
      const chatData = chatDoc.data();
      const expiresAt = chatData.misterioData?.expiresAt;
      
      if (expiresAt && expiresAt.toMillis() <= now.toMillis()) {
        // Buscar mensagens de mistério neste chat
        const messagesQ = query(
          collection(firestore, COLLECTIONS.CHATS, chatDoc.id, COLLECTIONS.MESSAGES),
          where('type', '==', 'misterio'),
          where('misterio.isRevealed', '==', false)
        );
        
        const messagesSnapshot = await getDocs(messagesQ);
        
        for (const msgDoc of messagesSnapshot.docs) {
          const revealed = await revealMisterioIdentity(chatDoc.id, msgDoc.id, 'timer');
          if (revealed) revealedCount++;
        }
      }
    }
    
    return revealedCount;
  } catch (error) {
    console.error('Erro ao verificar mistérios expirados:', error);
    return 0;
  }
}

/**
 * Obtém mensagens de mistério recebidas pelo usuário
 */
export async function getReceivedMisterios(userId: string): Promise<FirebaseChat[]> {
  try {
    const q = query(
      collection(firestore, COLLECTIONS.CHATS),
      where('participants', 'array-contains', userId),
      where('origin', '==', 'misterio_do_campo'),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    
    // Filtrar apenas os chats onde o usuário é o destinatário (não o remetente)
    return snapshot.docs
      .map(doc => ({ ...doc.data(), id: doc.id } as FirebaseChat))
      .filter(chat => {
        const misterioData = (chat as any).misterioData;
        return misterioData?.senderId !== userId;
      });
  } catch (error) {
    console.error('Erro ao buscar mistérios recebidos:', error);
    return [];
  }
}

// =============================================================================
// 📤 EXPORTS
// =============================================================================

export { getOtherParticipant as getChatOtherUserId };
