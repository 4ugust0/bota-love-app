/**
 * 🔥 BOTA LOVE APP - Match Service
 * 
 * Gerencia todo o sistema de likes e matches:
 * - Like/Unlike
 * - Super Like
 * - Detecção de match
 * - Criação automática de chat
 * 
 * @author Bota Love Team
 */

import {
    collection,
    doc,
    getDoc,
    getDocs,
    limit,
    onSnapshot,
    orderBy,
    query,
    runTransaction,
    serverTimestamp,
    setDoc,
    Timestamp,
    updateDoc,
    where,
    writeBatch
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { firestore, functions } from './config';
import { incrementUserStat } from './firestoreService';
import {
    COLLECTIONS,
    CorreioDaRoca,
    CorreioStatus,
    FirebaseChat,
    FirebaseLike,
    FirebaseMatch,
    FirebasePass,
} from './types';

// =============================================================================
// 📝 TIPOS
// =============================================================================

export interface LikeResult {
  success: boolean;
  isMatch: boolean;
  matchId?: string;
  chatId?: string;
  error?: string;
}

export interface MatchWithUser {
  match: FirebaseMatch;
  otherUserId: string;
  otherUserName?: string;
  otherUserPhoto?: string;
  lastMessage?: string;
  lastMessageTime?: Timestamp;
  unreadCount?: number;
}

// =============================================================================
// ❤️ SISTEMA DE LIKES
// =============================================================================

/**
 * Dá like em um usuário
 */
export async function likeUser(
  fromUserId: string,
  toUserId: string,
  isSuperLike: boolean = false
): Promise<LikeResult> {
  try {
    // Verificar se é usuário MOCK (simular sucesso sem salvar)
    if (toUserId.startsWith('user-') || toUserId.startsWith('mock-')) {
      console.log(`⏭️ Like em usuário MOCK simulado: ${fromUserId} -> ${toUserId} (SuperLike: ${isSuperLike})`);
      // Simular match aleatório para demo
      const simulateMatch = Math.random() < 0.3; // 30% chance de match
      return { 
        success: true, 
        isMatch: simulateMatch,
        matchId: simulateMatch ? `mock_match_${Date.now()}` : undefined,
        chatId: simulateMatch ? `mock_chat_${Date.now()}` : undefined
      };
    }
    
    // Verificar se já deu like
    const existingLike = await getLike(fromUserId, toUserId);
    if (existingLike) {
      return { success: false, isMatch: false, error: 'Você já curtiu este perfil' };
    }

    // Verificar se o outro usuário já deu like (potencial match)
    const reverseLike = await getLike(toUserId, fromUserId);
    const isMatch = !!reverseLike;

    // Criar like
    const likeId = `${fromUserId}_${toUserId}`;
    const likeRef = doc(firestore, COLLECTIONS.LIKES, likeId);

    let matchId: string | undefined;
    let chatId: string | undefined;

    if (isMatch) {
      // É UM MATCH! 🎉
      // Usar transaction para garantir consistência
      await runTransaction(firestore, async (transaction) => {
        // 1. Criar o like
        const likeData: Omit<FirebaseLike, 'id'> = {
          fromUserId,
          toUserId,
          isSuperLike,
          createdAt: Timestamp.now(),
          seen: false,
          matchCreated: true,
        };
        transaction.set(likeRef, likeData);

        // 2. Criar o match
        matchId = generateMatchId(fromUserId, toUserId);
        chatId = `chat_${matchId}`;
        
        const matchRef = doc(firestore, COLLECTIONS.MATCHES, matchId);
        const matchData: Omit<FirebaseMatch, 'id'> = {
          users: [fromUserId, toUserId].sort() as [string, string],
          createdAt: Timestamp.now(),
          lastMessageAt: null,
          chatId,
          isActive: true,
        };
        transaction.set(matchRef, matchData);

        // 3. Criar o chat
        const chatRef = doc(firestore, COLLECTIONS.CHATS, chatId);
        const chatData: Omit<FirebaseChat, 'id'> = {
          participants: [fromUserId, toUserId].sort() as [string, string],
          origin: 'match',
          matchId,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          lastMessage: null,
          isActive: true,
          messageCount: 0,
          inactivityReminders: 0,
        };
        transaction.set(chatRef, chatData);

        // 4. Atualizar o like reverso para indicar que criou match
        const reverseLikeRef = doc(firestore, COLLECTIONS.LIKES, `${toUserId}_${fromUserId}`);
        transaction.update(reverseLikeRef, {
          matchCreated: true,
          matchId,
        });

        // 5. Atualizar likes com matchId
        transaction.update(likeRef, { matchId });
      });

      // 6. Incrementar estatísticas
      await Promise.all([
        incrementUserStat(fromUserId, 'totalMatches'),
        incrementUserStat(toUserId, 'totalMatches'),
      ]);

      // 7. Enviar notificação de match via Cloud Function
      const sendMatchNotification = httpsCallable(functions, 'sendMatchNotification');
      await sendMatchNotification({
        user1Id: fromUserId,
        user2Id: toUserId,
        matchId,
      }).catch(console.error);

    } else {
      // Apenas like, sem match
      const likeData: Omit<FirebaseLike, 'id'> = {
        fromUserId,
        toUserId,
        isSuperLike,
        createdAt: Timestamp.now(),
        seen: false,
        matchCreated: false,
      };
      await setDoc(likeRef, likeData);

      // Incrementar estatísticas
      await incrementUserStat(toUserId, 'totalLikes');
      if (isSuperLike) {
        await incrementUserStat(toUserId, 'superLikesReceived');
      }

      // Enviar notificação de like (apenas para premium ou super like)
      if (isSuperLike) {
        const sendLikeNotification = httpsCallable(functions, 'sendLikeNotification');
        await sendLikeNotification({
          fromUserId,
          toUserId,
          isSuperLike: true,
        }).catch(console.error);
      }
    }

    return {
      success: true,
      isMatch,
      matchId,
      chatId,
    };
  } catch (error: any) {
    console.error('Erro ao dar like:', error);
    return {
      success: false,
      isMatch: false,
      error: error.message || 'Erro ao processar like',
    };
  }
}

/**
 * Remove like (passar) - registra o pass para não mostrar novamente por 24h
 */
export async function passUser(fromUserId: string, toUserId: string): Promise<void> {
  try {
    // Verificar se é usuário MOCK (não salvar no Firebase)
    if (toUserId.startsWith('user-') || toUserId.startsWith('mock-')) {
      console.log(`⏭️ Pass em usuário MOCK ignorado: ${fromUserId} -> ${toUserId}`);
      return;
    }
    
    const passId = `${fromUserId}_${toUserId}`;
    const passRef = doc(firestore, COLLECTIONS.PASSES, passId);
    
    // Pass expira em 24 horas (o usuário pode aparecer novamente depois)
    const expiresAt = Timestamp.fromMillis(Date.now() + 24 * 60 * 60 * 1000);
    
    const passData: Omit<FirebasePass, 'id'> = {
      fromUserId,
      toUserId,
      createdAt: Timestamp.now(),
      expiresAt,
    };
    
    console.log(`🔄 Tentando registrar pass: ${fromUserId} -> ${toUserId}`);
    await setDoc(passRef, passData);
    console.log(`✅ Pass registrado: ${fromUserId} -> ${toUserId}`);
  } catch (error) {
    console.error('❌ Erro ao registrar pass:', error);
    // Re-throw para debugging - pode ser removido depois
    throw error;
  }
}

/**
 * Verifica se existe like
 */
export async function getLike(fromUserId: string, toUserId: string): Promise<FirebaseLike | null> {
  try {
    const likeId = `${fromUserId}_${toUserId}`;
    const likeRef = doc(firestore, COLLECTIONS.LIKES, likeId);
    const likeSnap = await getDoc(likeRef);

    if (!likeSnap.exists()) {
      return null;
    }

    return { ...likeSnap.data(), id: likeSnap.id } as FirebaseLike;
  } catch (error) {
    console.error('Erro ao buscar like:', error);
    return null;
  }
}

/**
 * Obtém likes recebidos (quem curtiu você)
 */
export async function getReceivedLikes(
  userId: string,
  onlySeen: boolean = false
): Promise<FirebaseLike[]> {
  try {
    const constraints = [
      where('toUserId', '==', userId),
      where('matchCreated', '==', false),
    ];

    if (onlySeen) {
      constraints.push(where('seen', '==', false));
    }

    const q = query(
      collection(firestore, COLLECTIONS.LIKES),
      ...constraints,
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }) as FirebaseLike);
  } catch (error) {
    console.error('Erro ao buscar likes recebidos:', error);
    return [];
  }
}

/**
 * Marca like como visto
 */
export async function markLikeAsSeen(likeId: string): Promise<void> {
  try {
    const likeRef = doc(firestore, COLLECTIONS.LIKES, likeId);
    await updateDoc(likeRef, {
      seen: true,
      seenAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Erro ao marcar like como visto:', error);
  }
}

// =============================================================================
// 💕 SISTEMA DE MATCHES
// =============================================================================

/**
 * Obtém todos os matches do usuário
 */
export async function getUserMatches(userId: string): Promise<FirebaseMatch[]> {
  try {
    const q = query(
      collection(firestore, COLLECTIONS.MATCHES),
      where('users', 'array-contains', userId),
      where('isActive', '==', true),
      orderBy('lastMessageAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }) as FirebaseMatch);
  } catch (error) {
    console.error('Erro ao buscar matches:', error);
    return [];
  }
}

/**
 * Obtém match específico
 */
export async function getMatch(matchId: string): Promise<FirebaseMatch | null> {
  try {
    const matchRef = doc(firestore, COLLECTIONS.MATCHES, matchId);
    const matchSnap = await getDoc(matchRef);

    if (!matchSnap.exists()) {
      return null;
    }

    return { ...matchSnap.data(), id: matchSnap.id } as FirebaseMatch;
  } catch (error) {
    console.error('Erro ao buscar match:', error);
    return null;
  }
}

/**
 * Desfaz match (unmatch)
 */
export async function unmatch(matchId: string, userId: string): Promise<void> {
  try {
    const matchRef = doc(firestore, COLLECTIONS.MATCHES, matchId);
    const match = await getMatch(matchId);

    if (!match || !match.users.includes(userId)) {
      throw new Error('Match não encontrado ou acesso negado');
    }

    // Desativar match e chat
    const batch = writeBatch(firestore);

    batch.update(matchRef, {
      isActive: false,
      unmatchedBy: userId,
      unmatchedAt: serverTimestamp(),
    });

    // Desativar chat associado
    if (match.chatId) {
      const chatRef = doc(firestore, COLLECTIONS.CHATS, match.chatId);
      batch.update(chatRef, {
        isActive: false,
        updatedAt: serverTimestamp(),
      });
    }

    await batch.commit();
  } catch (error) {
    console.error('Erro ao desfazer match:', error);
    throw error;
  }
}

/**
 * Escuta matches em tempo real
 */
export function subscribeToMatches(
  userId: string,
  callback: (matches: FirebaseMatch[]) => void
): () => void {
  const q = query(
    collection(firestore, COLLECTIONS.MATCHES),
    where('users', 'array-contains', userId),
    where('isActive', '==', true),
    orderBy('lastMessageAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const matches = snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }) as FirebaseMatch);
    callback(matches);
  }, (error) => {
    console.error('Erro no listener de matches:', error);
    callback([]);
  });
}

// =============================================================================
// 🛠️ FUNÇÕES AUXILIARES
// =============================================================================

/**
 * Gera ID único para match (ordenado alfabeticamente)
 */
function generateMatchId(userId1: string, userId2: string): string {
  const sorted = [userId1, userId2].sort();
  return `match_${sorted[0]}_${sorted[1]}`;
}

/**
 * Obtém o ID do outro usuário no match
 */
export function getOtherUserId(match: FirebaseMatch, currentUserId: string): string {
  return match.users.find((id) => id !== currentUserId) || '';
}

// =============================================================================
// � CORREIO DA ROÇA - Mensagem sem match
// =============================================================================

export interface CorreioResult {
  success: boolean;
  correioId?: string;
  error?: string;
}

export interface CorreioWithUser {
  correio: CorreioDaRoca;
  fromUserName?: string;
  fromUserPhoto?: string;
  fromUserAge?: number;
  fromUserCity?: string;
}

/**
 * Envia uma mensagem via Correio da Roça (sem match necessário)
 * Funcionalidade premium que permite enviar mensagem para alguém
 * que você ainda não deu match
 */
export async function sendCorreioDaRoca(
  fromUserId: string,
  toUserId: string,
  message: string
): Promise<CorreioResult> {
  try {
    // Verificar se já existe um correio pendente para este usuário
    const existingQuery = query(
      collection(firestore, COLLECTIONS.CORREIO_DA_ROCA),
      where('fromUserId', '==', fromUserId),
      where('toUserId', '==', toUserId),
      where('status', '==', 'pending')
    );
    const existingSnap = await getDocs(existingQuery);
    
    if (!existingSnap.empty) {
      return {
        success: false,
        error: 'Você já enviou uma mensagem para esta pessoa. Aguarde a resposta.',
      };
    }

    // Verificar se já existe match
    const matchId = generateMatchId(fromUserId, toUserId);
    const existingMatch = await getMatch(matchId);
    
    if (existingMatch && existingMatch.isActive) {
      return {
        success: false,
        error: 'Vocês já têm um match! Use o chat normalmente.',
      };
    }

    // Criar o correio
    const correioRef = doc(collection(firestore, COLLECTIONS.CORREIO_DA_ROCA));
    const correioData: Omit<CorreioDaRoca, 'id'> = {
      fromUserId,
      toUserId,
      message,
      status: 'pending',
      createdAt: Timestamp.now(),
    };

    await setDoc(correioRef, correioData);

    // Enviar notificação via Cloud Function
    const sendCorreioNotification = httpsCallable(functions, 'sendCorreioNotification');
    await sendCorreioNotification({
      fromUserId,
      toUserId,
      correioId: correioRef.id,
    }).catch(console.error);

    console.log(`📮 Correio da Roça enviado: ${correioRef.id}`);

    return {
      success: true,
      correioId: correioRef.id,
    };
  } catch (error: any) {
    console.error('Erro ao enviar Correio da Roça:', error);
    return {
      success: false,
      error: error.message || 'Erro ao enviar mensagem',
    };
  }
}

/**
 * Aceita um Correio da Roça - cria match e chat
 */
export async function acceptCorreioDaRoca(correioId: string): Promise<LikeResult> {
  try {
    const correioRef = doc(firestore, COLLECTIONS.CORREIO_DA_ROCA, correioId);
    const correioSnap = await getDoc(correioRef);

    if (!correioSnap.exists()) {
      return { success: false, isMatch: false, error: 'Correio não encontrado' };
    }

    const correio = correioSnap.data() as CorreioDaRoca;

    if (correio.status !== 'pending') {
      return { success: false, isMatch: false, error: 'Este correio já foi respondido' };
    }

    // Criar match e chat via transaction
    const matchId = generateMatchId(correio.fromUserId, correio.toUserId);
    const chatId = `chat_${matchId}`;

    await runTransaction(firestore, async (transaction) => {
      // 1. Criar o match
      const matchRef = doc(firestore, COLLECTIONS.MATCHES, matchId);
      const matchData: Omit<FirebaseMatch, 'id'> = {
        users: [correio.fromUserId, correio.toUserId].sort() as [string, string],
        createdAt: Timestamp.now(),
        lastMessageAt: null,
        chatId,
        isActive: true,
      };
      transaction.set(matchRef, matchData);

      // 2. Criar o chat com a mensagem do correio como primeira mensagem
      const chatRef = doc(firestore, COLLECTIONS.CHATS, chatId);
      const chatData: Omit<FirebaseChat, 'id'> = {
        participants: [correio.fromUserId, correio.toUserId].sort() as [string, string],
        origin: 'correio_da_roca',
        matchId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        lastMessage: {
          text: correio.message,
          senderId: correio.fromUserId,
          timestamp: Timestamp.now(),
          type: 'text',
        },
        isActive: true,
        messageCount: 1,
        inactivityReminders: 0,
      };
      transaction.set(chatRef, chatData);

      // 3. Criar a primeira mensagem no chat
      const messageRef = doc(collection(firestore, COLLECTIONS.MESSAGES));
      const messageData = {
        chatId,
        senderId: correio.fromUserId,
        content: correio.message,
        type: 'text',
        createdAt: Timestamp.now(),
        readBy: [correio.fromUserId],
        isCorreioMessage: true,
      };
      transaction.set(messageRef, messageData);

      // 4. Atualizar o correio
      transaction.update(correioRef, {
        status: 'accepted' as CorreioStatus,
        respondedAt: Timestamp.now(),
        chatId,
        matchId,
      });
    });

    // Incrementar estatísticas
    await Promise.all([
      incrementUserStat(correio.fromUserId, 'totalMatches'),
      incrementUserStat(correio.toUserId, 'totalMatches'),
    ]);

    // Notificar o remetente que seu correio foi aceito
    const sendCorreioAcceptedNotification = httpsCallable(functions, 'sendCorreioAcceptedNotification');
    await sendCorreioAcceptedNotification({
      fromUserId: correio.fromUserId,
      toUserId: correio.toUserId,
      matchId,
      chatId,
    }).catch(console.error);

    console.log(`✅ Correio da Roça aceito: ${correioId} -> Match: ${matchId}`);

    return {
      success: true,
      isMatch: true,
      matchId,
      chatId,
    };
  } catch (error: any) {
    console.error('Erro ao aceitar Correio da Roça:', error);
    return {
      success: false,
      isMatch: false,
      error: error.message || 'Erro ao aceitar correio',
    };
  }
}

/**
 * Rejeita um Correio da Roça (Porteira fechada)
 */
export async function rejectCorreioDaRoca(correioId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const correioRef = doc(firestore, COLLECTIONS.CORREIO_DA_ROCA, correioId);
    const correioSnap = await getDoc(correioRef);

    if (!correioSnap.exists()) {
      return { success: false, error: 'Correio não encontrado' };
    }

    const correio = correioSnap.data() as CorreioDaRoca;

    if (correio.status !== 'pending') {
      return { success: false, error: 'Este correio já foi respondido' };
    }

    await updateDoc(correioRef, {
      status: 'rejected' as CorreioStatus,
      respondedAt: Timestamp.now(),
    });

    console.log(`🚪 Correio da Roça rejeitado: ${correioId}`);

    return { success: true };
  } catch (error: any) {
    console.error('Erro ao rejeitar Correio da Roça:', error);
    return {
      success: false,
      error: error.message || 'Erro ao rejeitar correio',
    };
  }
}

/**
 * Obtém correios pendentes recebidos pelo usuário
 */
export async function getPendingCorreios(userId: string): Promise<CorreioDaRoca[]> {
  try {
    const q = query(
      collection(firestore, COLLECTIONS.CORREIO_DA_ROCA),
      where('toUserId', '==', userId),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }) as CorreioDaRoca);
  } catch (error) {
    console.error('Erro ao buscar correios pendentes:', error);
    return [];
  }
}

/**
 * Obtém correios enviados pelo usuário
 */
export async function getSentCorreios(userId: string): Promise<CorreioDaRoca[]> {
  try {
    const q = query(
      collection(firestore, COLLECTIONS.CORREIO_DA_ROCA),
      where('fromUserId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }) as CorreioDaRoca);
  } catch (error) {
    console.error('Erro ao buscar correios enviados:', error);
    return [];
  }
}

/**
 * Escuta correios pendentes em tempo real
 */
export function subscribeToPendingCorreios(
  userId: string,
  callback: (correios: CorreioDaRoca[]) => void
): () => void {
  const q = query(
    collection(firestore, COLLECTIONS.CORREIO_DA_ROCA),
    where('toUserId', '==', userId),
    where('status', '==', 'pending'),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const correios = snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }) as CorreioDaRoca);
    callback(correios);
  }, (error) => {
    console.error('Erro no listener de correios:', error);
    callback([]);
  });
}

/**
 * Conta correios pendentes
 */
export async function countPendingCorreios(userId: string): Promise<number> {
  try {
    const q = query(
      collection(firestore, COLLECTIONS.CORREIO_DA_ROCA),
      where('toUserId', '==', userId),
      where('status', '==', 'pending')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.length;
  } catch (error) {
    console.error('Erro ao contar correios:', error);
    return 0;
  }
}

// =============================================================================
// �📤 EXPORTS
// =============================================================================

export { generateMatchId };
