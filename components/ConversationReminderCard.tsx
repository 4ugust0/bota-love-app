import { BotaLoveColors } from '@/constants/theme';
import {
    CLOSURE_MESSAGES,
    CloseReason,
    ConversationReminder,
    closeConversation,
    getReminderMessage,
    markConversationAsResponded,
} from '@/data/conversationService';
import { getUserById } from '@/data/mockData';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Dimensions,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width } = Dimensions.get('window');

interface ConversationReminderCardProps {
  reminder: ConversationReminder;
  userName: string;
  onRespond: () => void;
  onClose: () => void;
}

export function ConversationReminderCard({
  reminder,
  userName,
  onRespond,
  onClose,
}: ConversationReminderCardProps) {
  const router = useRouter();
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState<CloseReason | null>(null);

  const otherUser = getUserById(reminder.otherUserId);
  const reminderMessage = getReminderMessage(reminder, userName);

  if (!otherUser) return null;

  const daysSinceLastMessage = Math.floor(
    (new Date().getTime() - reminder.lastMessageDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  const handleRespond = () => {
    markConversationAsResponded(reminder.id);
    onRespond();
    router.push(`/chat/${reminder.chatId}`);
  };

  const handleCloseConversation = () => {
    if (!selectedReason) {
      Alert.alert('Atenção', 'Por favor, selecione um motivo para encerrar a conversa.');
      return;
    }

    const closureData = closeConversation(reminder.id, selectedReason);
    
    Alert.alert(
      '✅ Conversa Encerrada',
      `Mensagem enviada: "${closureData.message}"`,
      [
        {
          text: 'OK',
          onPress: () => {
            setShowCloseModal(false);
            onClose();
          },
        },
      ]
    );
  };

  const reasonOptions: Array<{ key: CloseReason; label: string; icon: string }> = [
    { key: 'no_chemistry', label: 'Não rolou afinidade', icon: '🤝' },
    { key: 'focused_on_work', label: 'Estou focado(a) na lida rural agora', icon: '🚜' },
    { key: 'met_someone', label: 'Conheci outro(a) Agrolove', icon: '💕' },
    { key: 'other', label: 'Outro motivo', icon: '👋' },
  ];

  return (
    <View style={styles.cardContainer}>
      <LinearGradient
        colors={['#FFF8F0', '#FFF']}
        style={styles.cardGradient}
      >
        {/* Header com foto e info */}
        <View style={styles.cardHeader}>
          <Image source={{ uri: otherUser.photos[0] }} style={styles.cardAvatar} />
          <View style={styles.cardHeaderInfo}>
            <Text style={styles.cardName}>{otherUser.name}</Text>
            <Text style={styles.cardInactivity}>
              {daysSinceLastMessage === 0
                ? 'Inativo hoje'
                : `${daysSinceLastMessage} ${daysSinceLastMessage === 1 ? 'dia' : 'dias'} sem resposta`}
            </Text>
          </View>
          <View style={styles.statusBadge}>
            <Ionicons name="time-outline" size={16} color="#E67E22" />
          </View>
        </View>

        {/* Mensagem de lembrete */}
        <View style={styles.reminderBox}>
          <Text style={styles.reminderIcon}>💬</Text>
          <Text style={styles.reminderText}>{reminderMessage}</Text>
        </View>

        {/* Ações */}
        <View style={styles.cardActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.closeButton]}
            onPress={() => setShowCloseModal(true)}
          >
            <Ionicons name="close-circle-outline" size={20} color="#C0392B" />
            <Text style={styles.closeButtonText}>Encerrar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.respondButton]}
            onPress={handleRespond}
          >
            <LinearGradient
              colors={['#27AE60', '#229954']}
              style={styles.respondGradient}
            >
              <Ionicons name="chatbubble-outline" size={20} color="#FFF" />
              <Text style={styles.respondButtonText}>Responder</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Modal de Encerramento */}
      <Modal
        visible={showCloseModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCloseModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Encerrar Conversa</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowCloseModal(false)}
              >
                <Ionicons name="close" size={28} color={BotaLoveColors.neutralDark} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Escolha um motivo para encerrar educadamente:
            </Text>

            <ScrollView style={styles.reasonsList}>
              {reasonOptions.map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.reasonOption,
                    selectedReason === option.key && styles.reasonOptionSelected,
                  ]}
                  onPress={() => setSelectedReason(option.key)}
                  activeOpacity={0.7}
                >
                  <View style={styles.reasonIconContainer}>
                    <Text style={styles.reasonIcon}>{option.icon}</Text>
                  </View>
                  <Text
                    style={[
                      styles.reasonLabel,
                      selectedReason === option.key && styles.reasonLabelSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                  {selectedReason === option.key && (
                    <Ionicons name="checkmark-circle" size={24} color="#27AE60" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Preview da mensagem */}
            {selectedReason && (
              <View style={styles.messagePreview}>
                <Text style={styles.messagePreviewLabel}>Mensagem que será enviada:</Text>
                <View style={styles.messagePreviewBox}>
                  <Text style={styles.messagePreviewIcon}>
                    {CLOSURE_MESSAGES[selectedReason].emoji}
                  </Text>
                  <Text style={styles.messagePreviewText}>
                    {CLOSURE_MESSAGES[selectedReason].message}
                  </Text>
                </View>
              </View>
            )}

            {/* Botões de ação */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowCloseModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalConfirmButton,
                  !selectedReason && styles.modalConfirmButtonDisabled,
                ]}
                onPress={handleCloseConversation}
                disabled={!selectedReason}
              >
                <LinearGradient
                  colors={
                    selectedReason
                      ? ['#C0392B', '#A93226']
                      : ['#CCC', '#AAA']
                  }
                  style={styles.modalConfirmGradient}
                >
                  <Text style={styles.modalConfirmText}>Encerrar Conversa</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardGradient: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: BotaLoveColors.primary,
  },
  cardHeaderInfo: {
    flex: 1,
    marginLeft: 12,
  },
  cardName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: BotaLoveColors.textPrimary,
    marginBottom: 4,
  },
  cardInactivity: {
    fontSize: 13,
    color: '#E67E22',
    fontWeight: '600',
  },
  statusBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E67E22',
  },
  reminderBox: {
    backgroundColor: '#FFF',
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#E67E22',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  reminderIcon: {
    fontSize: 24,
  },
  reminderText: {
    flex: 1,
    fontSize: 14,
    color: BotaLoveColors.textPrimary,
    lineHeight: 20,
    fontWeight: '500',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  closeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#C0392B',
  },
  closeButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#C0392B',
  },
  respondButton: {
    flex: 1,
  },
  respondGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
  },
  respondButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 32,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: BotaLoveColors.textPrimary,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalSubtitle: {
    fontSize: 15,
    color: BotaLoveColors.neutralDark,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  reasonsList: {
    paddingHorizontal: 20,
    maxHeight: 300,
  },
  reasonOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#F8F8F8',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  reasonOptionSelected: {
    backgroundColor: '#E8F5E9',
    borderColor: '#27AE60',
  },
  reasonIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  reasonIcon: {
    fontSize: 24,
  },
  reasonLabel: {
    flex: 1,
    fontSize: 15,
    color: BotaLoveColors.textPrimary,
    fontWeight: '500',
  },
  reasonLabelSelected: {
    fontWeight: '700',
    color: '#27AE60',
  },
  messagePreview: {
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 20,
  },
  messagePreviewLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: BotaLoveColors.neutralDark,
    marginBottom: 8,
  },
  messagePreviewBox: {
    backgroundColor: '#FFF9E6',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: BotaLoveColors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  messagePreviewIcon: {
    fontSize: 24,
  },
  messagePreviewText: {
    flex: 1,
    fontSize: 14,
    color: BotaLoveColors.textPrimary,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: BotaLoveColors.neutralDark,
  },
  modalConfirmButton: {
    flex: 1.5,
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalConfirmButtonDisabled: {
    opacity: 0.5,
  },
  modalConfirmGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalConfirmText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
});
