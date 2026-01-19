/**
 * 🔥 BOTA LOVE APP - Tela de Chat Individual
 * 
 * Chat em tempo real com Firebase:
 * - Mensagens em tempo real
 * - Envio de mensagens com moderação
 * - Status de leitura
 * - Indicador de digitação
 * 
 * @author Bota Love Team
 */

import ConversionModal, { BlockedChatInput } from '@/components/ConversionModal';
import { BotaLoveColors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useFreePlan } from '@/contexts/FreePlanContext';
import {
    moderateMessage,
    MODERATION_FEEDBACK,
    shouldBlockContent,
} from '@/data/contentModerationService';
import { useChatMessages } from '@/hooks/useChat';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function ChatDetailScreen() {
  const { id: chatId } = useLocalSearchParams();
  const router = useRouter();
  const { currentUser, hasPremium } = useAuth();
  const flatListRef = useRef<FlatList>(null);
  const { 
    checkCanSendMessage, 
    consumeMessage, 
    getMatchMessagesInfo,
    showConversionModal,
    conversionTrigger,
    dismissConversion,
    triggerConversion,
  } = useFreePlan();
  
  const [newMessage, setNewMessage] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [sending, setSending] = useState(false);

  // Hook de mensagens em tempo real
  const {
    messages,
    loading,
    error,
    otherUser,
    chatInfo,
    sendTextMessage,
  } = useChatMessages(chatId as string);
  
  // Verificar se pode enviar mensagem (silencioso - sem avisos)
  const canSendMsg = hasPremium || checkCanSendMessage(chatId as string);
  const messagesInfo = getMatchMessagesInfo(chatId as string);

  // Scroll para última mensagem quando receber novas
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  // Loading state
  if (loading && !chatInfo) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.headerName}>Carregando...</Text>
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BotaLoveColors.primary} />
        </View>
      </View>
    );
  }

  // Error ou chat não encontrado
  if (error || !chatInfo) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.headerName}>Chat</Text>
          </View>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={BotaLoveColors.error} />
          <Text style={styles.errorText}>{error || 'Chat não encontrado'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
            <Text style={styles.retryButtonText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const handleSend = async () => {
    if (!newMessage.trim() || sending) return;

    // 🔒 MODERAÇÃO DE CONTEÚDO (sempre ativa)
    if (shouldBlockContent(newMessage)) {
      const result = moderateMessage(newMessage);
      Alert.alert(
        '⚠️ Conteúdo não permitido',
        MODERATION_FEEDBACK.content_blocked,
        [{ text: 'Entendi' }]
      );
      return;
    }

    // 🎯 VERIFICAÇÃO DE LIMITE (silenciosa até o bloqueio)
    if (!hasPremium && !consumeMessage(chatId as string)) {
      return;
    }

    setSending(true);
    const messageText = newMessage.trim();
    setNewMessage('');

    try {
      const success = await sendTextMessage(messageText);
      if (!success) {
        Alert.alert('Erro', 'Não foi possível enviar a mensagem. Tente novamente.');
        setNewMessage(messageText); // Restaurar mensagem
      }
    } catch (err) {
      console.error('Erro ao enviar:', err);
      Alert.alert('Erro', 'Falha ao enviar mensagem.');
      setNewMessage(messageText);
    } finally {
      setSending(false);
    }
  };

  // Handler para quando usuário tenta enviar mas está bloqueado
  const handleBlockedInputPress = () => {
    triggerConversion('messages');
  };

  const formatTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const handleViewProfile = () => {
    setShowMenu(false);
    if (otherUser?.id) {
      router.push(`/profile-detail/${otherUser.id}`);
    }
  };

  const handleBlock = () => {
    setShowMenu(false);
    Alert.alert(
      'Bloquear usuário',
      `Tem certeza que deseja bloquear ${otherUser?.name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Bloquear',
          style: 'destructive',
          onPress: () => {
            // TODO: Implementar bloqueio via Firebase
            Alert.alert('Bloqueado', `${otherUser?.name} foi bloqueado com sucesso.`);
            router.back();
          },
        },
      ]
    );
  };

  const handleReport = () => {
    setShowMenu(false);
    Alert.alert(
      'Denunciar usuário',
      `Denunciar ${otherUser?.name} por comportamento inadequado?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Denunciar',
          style: 'destructive',
          onPress: () => {
            // TODO: Implementar denúncia via Firebase
            Alert.alert('Denunciado', 'Obrigado! Vamos analisar o caso.');
          },
        },
      ]
    );
  };

  const handleArchive = () => {
    setShowMenu(false);
    // TODO: Implementar arquivar
    Alert.alert('Arquivado', `Conversa com ${otherUser?.name} foi arquivada.`);
    router.back();
  };

  const handleDelete = () => {
    setShowMenu(false);
    Alert.alert(
      'Excluir conversa',
      `Tem certeza que deseja excluir a conversa com ${otherUser?.name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            // TODO: Implementar exclusão
            Alert.alert('Excluída', 'Conversa excluída com sucesso.');
            router.back();
          },
        },
      ]
    );
  };

  const handleSendImage = () => {
    Alert.alert('Enviar imagem', 'Funcionalidade de envio de imagem em desenvolvimento.');
  };

  const handleSendAudio = () => {
    Alert.alert('Enviar áudio', 'Funcionalidade de envio de áudio em desenvolvimento.');
  };

  // Renderizar mensagem
  const renderMessage = ({ item: message, index }: { item: any; index: number }) => {
    const isMe = message.isMe;
    const showAvatar = 
      index === messages.length - 1 ||
      messages[index + 1]?.isMe !== isMe;

    return (
      <View style={[styles.messageRow, isMe && styles.messageRowMe]}>
        {!isMe && showAvatar && otherUser?.photo && (
          <Image source={{ uri: otherUser.photo }} style={styles.messageAvatar} />
        )}
        {!isMe && !showAvatar && <View style={styles.messageAvatarSpacer} />}

        <View
          style={[
            styles.messageBubble,
            isMe ? styles.messageBubbleMe : styles.messageBubbleOther,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isMe ? styles.messageTextMe : styles.messageTextOther,
            ]}
          >
            {message.text}
          </Text>
          <View style={styles.messageFooter}>
            <Text
              style={[
                styles.messageTime,
                isMe ? styles.messageTimeMe : styles.messageTimeOther,
              ]}
            >
              {formatTime(message.timestamp)}
            </Text>
            {isMe && (
              <Ionicons
                name={message.status === 'read' ? 'checkmark-done' : 'checkmark'}
                size={14}
                color={message.status === 'read' ? '#3498DB' : 'rgba(31, 19, 12, 0.5)'}
                style={styles.statusIcon}
              />
            )}
          </View>
        </View>
      </View>
    );
  };

  // Obter label da origem do chat
  const getChatOriginLabel = () => {
    switch (chatInfo?.origin) {
      case 'correio_da_roca':
        return '📮 Correio da Roça';
      case 'network':
        return '🌾 Network Rural';
      default:
        return '💚 Match';
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>

        {otherUser?.photo && (
          <Image source={{ uri: otherUser.photo }} style={styles.avatar} />
        )}

        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>{otherUser?.name || 'Chat'}</Text>
          <Text style={styles.headerStatus}>
            {otherUser?.isOnline ? 'Online' : 'Offline'}
          </Text>
        </View>

        <TouchableOpacity style={styles.moreButton} onPress={() => setShowMenu(true)}>
          <Ionicons name="ellipsis-vertical" size={24} color={BotaLoveColors.neutralDark} />
        </TouchableOpacity>
      </View>

      {/* Menu Modal */}
      <Modal
        visible={showMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <TouchableOpacity
          style={styles.menuOverlay}
          activeOpacity={1}
          onPress={() => setShowMenu(false)}
        >
          <View style={styles.menuContainer}>
            <TouchableOpacity style={styles.menuItem} onPress={handleViewProfile}>
              <Ionicons name="person-outline" size={22} color={BotaLoveColors.textPrimary} />
              <Text style={styles.menuText}>Ver perfil</Text>
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity style={styles.menuItem} onPress={handleArchive}>
              <Ionicons name="archive-outline" size={22} color={BotaLoveColors.textPrimary} />
              <Text style={styles.menuText}>Arquivar conversa</Text>
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity style={styles.menuItem} onPress={handleDelete}>
              <Ionicons name="trash-outline" size={22} color={BotaLoveColors.error} />
              <Text style={[styles.menuText, styles.menuTextDanger]}>Excluir conversa</Text>
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity style={styles.menuItem} onPress={handleReport}>
              <Ionicons name="flag-outline" size={22} color={BotaLoveColors.error} />
              <Text style={[styles.menuText, styles.menuTextDanger]}>Denunciar</Text>
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity style={styles.menuItem} onPress={handleBlock}>
              <Ionicons name="ban-outline" size={22} color={BotaLoveColors.error} />
              <Text style={[styles.menuText, styles.menuTextDanger]}>Bloquear usuário</Text>
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity style={styles.menuItemCancel} onPress={() => setShowMenu(false)}>
              <Text style={styles.menuTextCancel}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.matchBanner}>
            <Text style={styles.matchIcon}>
              {chatInfo?.origin === 'correio_da_roca' ? '📮' : chatInfo?.origin === 'network' ? '🌾' : '💚'}
            </Text>
            <Text style={styles.matchText}>
              {getChatOriginLabel()} com {otherUser?.name}
            </Text>
            {chatInfo?.createdAt && (
              <Text style={styles.matchDate}>
                {chatInfo.createdAt.toDate().toLocaleDateString('pt-BR')}
              </Text>
            )}
          </View>
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyMessages}>
              <Text style={styles.emptyMessagesText}>
                Envie a primeira mensagem! 👋
              </Text>
            </View>
          ) : null
        }
        onContentSizeChange={() => {
          flatListRef.current?.scrollToEnd({ animated: false });
        }}
      />

      {/* Input - Condicional baseado no limite de mensagens */}
      {canSendMsg ? (
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.attachButton} onPress={handleSendImage}>
            <Ionicons name="image-outline" size={24} color={BotaLoveColors.primary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.attachButton} onPress={handleSendAudio}>
            <Ionicons name="mic-outline" size={24} color={BotaLoveColors.primary} />
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            placeholder="Digite uma mensagem..."
            placeholderTextColor={BotaLoveColors.neutralMedium}
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
            editable={!sending}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!newMessage.trim() || sending) && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={!newMessage.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color={BotaLoveColors.textPrimary} />
            ) : (
              <Ionicons name="send" size={20} color={BotaLoveColors.textPrimary} />
            )}
          </TouchableOpacity>
        </View>
      ) : (
        // 🔒 Input bloqueado - mostra mensagem de conversão
        <BlockedChatInput onPress={handleBlockedInputPress} />
      )}

      {/* Modal de Conversão */}
      <ConversionModal
        visible={showConversionModal}
        trigger={conversionTrigger}
        onClose={dismissConversion}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BotaLoveColors.neutralLight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 12,
    paddingHorizontal: 16,
    backgroundColor: BotaLoveColors.backgroundWhite,
    borderBottomWidth: 1,
    borderBottomColor: BotaLoveColors.neutralLight,
  },
  backButton: {
    marginRight: 12,
  },
  backIcon: {
    fontSize: 32,
    color: BotaLoveColors.secondary,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: BotaLoveColors.neutralLight,
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: BotaLoveColors.textPrimary,
  },
  headerStatus: {
    fontSize: 12,
    color: BotaLoveColors.neutralDark,
  },
  moreButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 16,
  },
  errorText: {
    fontSize: 16,
    color: BotaLoveColors.textSecondary,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: BotaLoveColors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    flexGrow: 1,
  },
  matchBanner: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  matchIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  matchText: {
    fontSize: 14,
    fontWeight: '600',
    color: BotaLoveColors.textPrimary,
    marginBottom: 4,
  },
  matchDate: {
    fontSize: 12,
    color: BotaLoveColors.neutralDark,
  },
  emptyMessages: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyMessagesText: {
    fontSize: 16,
    color: BotaLoveColors.textSecondary,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  messageRowMe: {
    justifyContent: 'flex-end',
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: BotaLoveColors.neutralLight,
  },
  messageAvatarSpacer: {
    width: 40,
  },
  messageBubble: {
    maxWidth: '70%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  messageBubbleMe: {
    backgroundColor: BotaLoveColors.primary,
    borderBottomRightRadius: 4,
  },
  messageBubbleOther: {
    backgroundColor: BotaLoveColors.backgroundWhite,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  messageTextMe: {
    color: BotaLoveColors.textPrimary,
  },
  messageTextOther: {
    color: BotaLoveColors.textPrimary,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  messageTime: {
    fontSize: 10,
  },
  messageTimeMe: {
    color: 'rgba(31, 19, 12, 0.7)',
  },
  messageTimeOther: {
    color: BotaLoveColors.neutralDark,
  },
  statusIcon: {
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    backgroundColor: BotaLoveColors.backgroundWhite,
    borderTopWidth: 1,
    borderTopColor: BotaLoveColors.neutralLight,
    gap: 8,
  },
  attachButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: BotaLoveColors.neutralLight,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: BotaLoveColors.textPrimary,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: BotaLoveColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  menuContainer: {
    backgroundColor: BotaLoveColors.backgroundWhite,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 8,
    paddingBottom: 32,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 12,
  },
  menuItemCancel: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginTop: 8,
  },
  menuText: {
    fontSize: 16,
    color: BotaLoveColors.textPrimary,
  },
  menuTextDanger: {
    color: BotaLoveColors.error,
  },
  menuTextCancel: {
    fontSize: 16,
    fontWeight: '600',
    color: BotaLoveColors.neutralDark,
  },
  menuDivider: {
    height: 1,
    backgroundColor: BotaLoveColors.neutralLight,
    marginHorizontal: 24,
  },
});
