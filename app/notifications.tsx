import { ConversationReminderCard } from '@/components/ConversationReminderCard';
import { BotaLoveColors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { getPendingReminders } from '@/data/conversationService';
import { MOCK_NOTIFICATIONS } from '@/data/mockData';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

export default function NotificationsScreen() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const [pendingReminders, setPendingReminders] = useState(
    getPendingReminders(currentUser?.id || 'user-0')
  );

  const getIcon = (type: string) => {
    switch (type) {
      case 'match':
        return 'heart';
      case 'like':
        return 'heart-outline';
      case 'message':
        return 'chatbubble';
      case 'event':
        return 'calendar';
      case 'promotion':
        return 'pricetag';
      default:
        return 'notifications';
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'match':
        return '#E74C3C';
      case 'like':
        return '#2ECC71';
      case 'message':
        return '#5DADE2';
      case 'event':
        return BotaLoveColors.primary;
      case 'promotion':
        return '#9B59B6';
      default:
        return BotaLoveColors.secondary;
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (hours < 1) return 'Agora';
    if (hours < 24) return `${hours}h atrás`;
    if (days === 1) return 'Ontem';
    return `${days} dias atrás`;
  };

  const handleReminderRespond = () => {
    // Atualizar lista de lembretes
    setPendingReminders(getPendingReminders(currentUser?.id || 'user-0'));
  };

  const handleReminderClose = () => {
    // Atualizar lista de lembretes
    setPendingReminders(getPendingReminders(currentUser?.id || 'user-0'));
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={BotaLoveColors.secondary} />
        </TouchableOpacity>
        <Text style={styles.title}>Notificações</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Seção de Lembretes de Conversa */}
        {pendingReminders.length > 0 && (
          <View style={styles.remindersSection}>
            <View style={styles.sectionHeader}>
              <Ionicons name="alarm" size={20} color="#E67E22" />
              <Text style={styles.sectionTitle}>
                Conversas Pendentes ({pendingReminders.length})
              </Text>
            </View>
            <View style={styles.remindersList}>
              {pendingReminders.map((reminder) => (
                <ConversationReminderCard
                  key={reminder.id}
                  reminder={reminder}
                  userName={currentUser?.profile?.name || 'Usuário'}
                  onRespond={handleReminderRespond}
                  onClose={handleReminderClose}
                />
              ))}
            </View>
          </View>
        )}

        {/* Seção de Notificações Gerais */}
        <View style={styles.notificationsSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="notifications" size={20} color={BotaLoveColors.primary} />
            <Text style={styles.sectionTitle}>Notificações Recentes</Text>
          </View>
          {MOCK_NOTIFICATIONS.map((notification) => (
            <TouchableOpacity
              key={notification.id}
              style={[styles.notificationItem, !notification.read && styles.unread]}
            >
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: `${getIconColor(notification.type)}15` },
                ]}
              >
                <Ionicons
                  name={getIcon(notification.type)}
                  size={24}
                  color={getIconColor(notification.type)}
                />
              </View>

              <View style={styles.contentContainer}>
                <Text style={styles.notificationTitle}>{notification.title}</Text>
                <Text style={styles.notificationMessage}>{notification.message}</Text>
                <Text style={styles.notificationTime}>
                  {formatTime(notification.timestamp)}
                </Text>
              </View>

              {!notification.read && <View style={styles.unreadDot} />}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BotaLoveColors.neutralLight,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: BotaLoveColors.backgroundWhite,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: BotaLoveColors.secondary,
  },
  placeholder: {
    width: 32,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: BotaLoveColors.backgroundWhite,
    marginBottom: 1,
    alignItems: 'center',
  },
  unread: {
    backgroundColor: '#FFF9E6',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: BotaLoveColors.secondary,
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: BotaLoveColors.textPrimary,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: BotaLoveColors.neutralDark,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: BotaLoveColors.primary,
    marginLeft: 8,
  },
  remindersSection: {
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: BotaLoveColors.neutralLight,
  },
  notificationsSection: {
    paddingTop: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: BotaLoveColors.textPrimary,
  },
  remindersList: {
    paddingHorizontal: 16,
  },
});
