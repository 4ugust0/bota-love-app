/**
 * 🔥 BOTA LOVE APP - Hook de Chat
 * 
 * Hook que gerencia chats em tempo real:
 * - Lista de conversas
 * - Mensagens em tempo real
 * - Envio de mensagens
 * - Status de leitura
 * 
 * @author Bota Love Team
 */

import { useAuth } from '@/contexts/AuthContext';
import {
    getChatById,
    markMessagesAsRead,
    sendMessage,
    subscribeToMessages,
    subscribeToUserChats
} from '@/firebase/chatService';
import { getUserById } from '@/firebase/firestoreService';
import { FirebaseChat, FirebaseMessage } from '@/firebase/types';
import { useCallback, useEffect, useState } from 'react';

// =============================================================================
// 📝 TIPOS
// =============================================================================

export interface ChatUser {
  id: string;
  name: string;
  photo: string;
  isOnline?: boolean;
}

export interface ChatConversation {
  chatId: string;
  otherUser: ChatUser;
  lastMessage: string;
  lastMessageTime: Date | null;
  unreadCount: number;
  origin: 'match' | 'network' | 'correio_da_roca';
  isActive: boolean;
}

export interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  isMe: boolean;
  timestamp: Date;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  type: 'text' | 'image' | 'audio' | 'system';
}

// =============================================================================
// 🎣 HOOK: LISTA DE CHATS
// =============================================================================

interface UseChatsReturn {
  chats: ChatConversation[];
  loading: boolean;
  error: string | null;
  totalUnread: number;
  refreshChats: () => void;
}

export function useChats(): UseChatsReturn {
  const { currentUser, isAuthenticated } = useAuth();
  const [chats, setChats] = useState<ChatConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !currentUser?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);

    // Listener em tempo real para chats
    const unsubscribe = subscribeToUserChats(
      currentUser.id,
      async (firebaseChats: FirebaseChat[]) => {
        try {
          // Converter para ChatConversation com dados do outro usuário
          const conversationsPromises = firebaseChats.map(async (chat) => {
            const otherUserId = chat.participants.find(p => p !== currentUser.id) || '';
            
            // Buscar dados do outro usuário
            let otherUser: ChatUser = {
              id: otherUserId,
              name: 'Usuário',
              photo: 'https://via.placeholder.com/100',
            };

            try {
              const userData = await getUserById(otherUserId);
              if (userData) {
                otherUser = {
                  id: otherUserId,
                  name: userData.profile?.name || 'Usuário',
                  photo: userData.profile?.photos?.[0] || 'https://via.placeholder.com/100',
                  isOnline: userData.status === 'active',
                };
              }
            } catch (e) {
              console.warn('Erro ao buscar usuário:', e);
            }

            // Calcular não lidas (simplificado - idealmente usar listener separado)
            let unreadCount = 0;
            if (chat.lastMessage && chat.lastMessage.senderId !== currentUser.id) {
              // Considerar como não lido se a última mensagem não foi do usuário atual
              // Em produção, usar um campo específico ou contador
              unreadCount = 1;
            }

            const conversation: ChatConversation = {
              chatId: chat.id,
              otherUser,
              lastMessage: chat.lastMessage?.text || 'Diga oi! 👋',
              lastMessageTime: chat.lastMessage?.timestamp?.toDate() || chat.createdAt?.toDate() || null,
              unreadCount,
              origin: chat.origin,
              isActive: chat.isActive,
            };

            return conversation;
          });

          const conversations = await Promise.all(conversationsPromises);
          
          // Ordenar por última mensagem
          conversations.sort((a, b) => {
            if (!a.lastMessageTime) return 1;
            if (!b.lastMessageTime) return -1;
            return b.lastMessageTime.getTime() - a.lastMessageTime.getTime();
          });

          setChats(conversations);
          setError(null);
        } catch (err: any) {
          console.error('Erro ao processar chats:', err);
          setError(err.message);
        } finally {
          setLoading(false);
        }
      }
    );

    return () => unsubscribe();
  }, [isAuthenticated, currentUser?.id]);

  const totalUnread = chats.reduce((acc, chat) => acc + chat.unreadCount, 0);

  const refreshChats = useCallback(() => {
    // O listener já atualiza automaticamente
    // Este método pode ser usado para forçar refresh se necessário
  }, []);

  return {
    chats,
    loading,
    error,
    totalUnread,
    refreshChats,
  };
}

// =============================================================================
// 🎣 HOOK: MENSAGENS DE UM CHAT
// =============================================================================

interface UseChatMessagesReturn {
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  otherUser: ChatUser | null;
  chatInfo: FirebaseChat | null;
  sendTextMessage: (text: string) => Promise<boolean>;
  loadMoreMessages: () => Promise<void>;
  hasMore: boolean;
}

export function useChatMessages(chatId: string): UseChatMessagesReturn {
  const { currentUser, isAuthenticated } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [otherUser, setOtherUser] = useState<ChatUser | null>(null);
  const [chatInfo, setChatInfo] = useState<FirebaseChat | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [sending, setSending] = useState(false);

  // Carregar info do chat e outro usuário
  useEffect(() => {
    if (!chatId || !isAuthenticated || !currentUser?.id) {
      setLoading(false);
      return;
    }

    const loadChatInfo = async () => {
      try {
        const chat = await getChatById(chatId);
        if (!chat) {
          setError('Chat não encontrado');
          setLoading(false);
          return;
        }

        setChatInfo(chat);

        // Buscar outro usuário
        const otherUserId = chat.participants.find(p => p !== currentUser.id) || '';
        const userData = await getUserById(otherUserId);

        if (userData) {
          setOtherUser({
            id: otherUserId,
            name: userData.profile?.name || 'Usuário',
            photo: userData.profile?.photos?.[0] || 'https://via.placeholder.com/100',
            isOnline: userData.status === 'active',
          });
        }

        // Marcar mensagens como lidas
        await markMessagesAsRead(chatId, currentUser.id);
      } catch (err: any) {
        console.error('Erro ao carregar chat:', err);
        setError(err.message);
      }
    };

    loadChatInfo();
  }, [chatId, isAuthenticated, currentUser?.id]);

  // Listener de mensagens em tempo real
  useEffect(() => {
    if (!chatId || !isAuthenticated || !currentUser?.id) return;

    setLoading(true);

    const unsubscribe = subscribeToMessages(chatId, (firebaseMessages: FirebaseMessage[]) => {
      const convertedMessages: ChatMessage[] = firebaseMessages.map((msg) => ({
        id: msg.id,
        text: msg.text,
        senderId: msg.senderId,
        isMe: msg.senderId === currentUser.id,
        timestamp: msg.createdAt?.toDate() || new Date(),
        status: msg.status || 'sent',
        type: msg.type || 'text',
      }));

      setMessages(convertedMessages);
      setLoading(false);

      // Marcar como lidas quando receber novas mensagens
      if (convertedMessages.length > 0) {
        markMessagesAsRead(chatId, currentUser.id).catch(console.error);
      }
    });

    return () => unsubscribe();
  }, [chatId, isAuthenticated, currentUser?.id]);

  // Enviar mensagem
  const sendTextMessage = useCallback(async (text: string): Promise<boolean> => {
    if (!text.trim() || !chatId || !currentUser?.id || sending) {
      return false;
    }

    setSending(true);

    try {
      const result = await sendMessage(chatId, currentUser.id, text.trim(), 'text');
      
      if (!result.success) {
        setError(result.error || 'Erro ao enviar mensagem');
        return false;
      }

      return true;
    } catch (err: any) {
      console.error('Erro ao enviar mensagem:', err);
      setError(err.message);
      return false;
    } finally {
      setSending(false);
    }
  }, [chatId, currentUser?.id, sending]);

  // Carregar mais mensagens (paginação)
  const loadMoreMessages = useCallback(async () => {
    // Por enquanto, o listener carrega todas
    // Implementar paginação se necessário
    setHasMore(false);
  }, []);

  return {
    messages,
    loading,
    error,
    otherUser,
    chatInfo,
    sendTextMessage,
    loadMoreMessages,
    hasMore,
  };
}

// =============================================================================
// 🎣 HOOK: CHAT POR MATCH/USER ID
// =============================================================================

interface UseChatByMatchReturn extends UseChatMessagesReturn {
  chatId: string | null;
  findingChat: boolean;
}

/**
 * Hook para encontrar ou criar chat com um usuário específico
 * Útil quando navegamos de um match ou perfil
 */
export function useChatByUserId(otherUserId: string): UseChatByMatchReturn {
  const { currentUser, isAuthenticated } = useAuth();
  const [chatId, setChatId] = useState<string | null>(null);
  const [findingChat, setFindingChat] = useState(true);

  // Encontrar chat existente
  useEffect(() => {
    if (!otherUserId || !isAuthenticated || !currentUser?.id) {
      setFindingChat(false);
      return;
    }

    const findChat = async () => {
      setFindingChat(true);
      try {
        // Gerar ID do chat baseado nos IDs ordenados (mesmo formato do matchService)
        const participants = [currentUser.id, otherUserId].sort();
        const matchId = `match_${participants[0]}_${participants[1]}`;
        const possibleChatIds = [
          `chat_${matchId}`, // Formato padrão do match
          `network_${participants[0]}_${participants[1]}`, // Formato do Network Rural
        ];

        // Verificar cada possível ID
        for (const id of possibleChatIds) {
          const chat = await getChatById(id);
          if (chat && chat.isActive) {
            setChatId(id);
            setFindingChat(false);
            return;
          }
        }

        // Não encontrou chat
        setChatId(null);
      } catch (err) {
        console.error('Erro ao buscar chat:', err);
      } finally {
        setFindingChat(false);
      }
    };

    findChat();
  }, [otherUserId, isAuthenticated, currentUser?.id]);

  // Usar o hook de mensagens se encontrou chatId
  const chatHook = useChatMessages(chatId || '');

  return {
    ...chatHook,
    chatId,
    findingChat,
    loading: findingChat || chatHook.loading,
  };
}
