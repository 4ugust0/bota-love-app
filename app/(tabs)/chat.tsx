/**
 * 🔥 BOTA LOVE APP - Tela de Chats
 * 
 * Lista de conversas em tempo real com Firebase:
 * - Chats de matches
 * - Chats do Correio da Roça
 * - Chats do Network Rural
 * 
 * @author Bota Love Team
 */

import { BotaLoveColors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useChats } from '@/hooks/useChat';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Image,
    Platform,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isSmallDevice = SCREEN_WIDTH < 375;

export default function ChatScreen() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const { chats, loading, error, totalUnread, refreshChats } = useChats();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    refreshChats();
    setTimeout(() => setRefreshing(false), 1000);
  }, [refreshChats]);

  const formatTime = (date: Date | null) => {
    if (!date) return '';
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Agora';
    if (diffMins < 60) return `${diffMins}min`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  const getOriginBadge = (origin: string) => {
    switch (origin) {
      case 'correio_da_roca':
        return { icon: 'mail', color: '#3498DB', label: 'Correio' };
      case 'network':
        return { icon: 'business', color: '#9B59B6', label: 'Network' };
      default:
        return null;
    }
  };

  // Loading state
  if (loading && chats.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Mensagens</Text>
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BotaLoveColors.primary} />
          <Text style={styles.loadingText}>Carregando conversas...</Text>
        </View>
      </View>
    );
  }

  // Error state
  if (error && chats.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Mensagens</Text>
          </View>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={BotaLoveColors.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refreshChats}>
            <Text style={styles.retryButtonText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Mensagens</Text>
          {totalUnread > 0 && (
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>{totalUnread}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity style={styles.searchButton} activeOpacity={0.8}>
          <Ionicons name="search" size={22} color={BotaLoveColors.secondary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[BotaLoveColors.primary]}
            tintColor={BotaLoveColors.primary}
          />
        }
      >
        {/* Lista de Chats */}
        {chats.length > 0 && (
          <View style={styles.activeSection}>
            <Text style={styles.sectionLabel}>CONVERSAS ATIVAS</Text>
          </View>
        )}

        {chats.map((chat, index) => {
          const originBadge = getOriginBadge(chat.origin);

          return (
            <TouchableOpacity
              key={chat.chatId}
              style={[
                styles.chatCard,
                index === chats.length - 1 && styles.chatCardLast,
              ]}
              onPress={() => router.push(`/chat/${chat.chatId}`)}
              activeOpacity={0.7}
            >
              <View style={styles.avatarContainer}>
                <Image
                  source={{ uri: chat.otherUser.photo }}
                  style={styles.avatar}
                />
                {chat.otherUser.isOnline && (
                  <View style={styles.onlineIndicator} />
                )}
              </View>

              <View style={styles.chatInfo}>
                <View style={styles.chatHeader}>
                  <View style={styles.nameContainer}>
                    <Text style={styles.chatName}>{chat.otherUser.name}</Text>
                    {originBadge && (
                      <View style={[styles.originBadge, { backgroundColor: originBadge.color }]}>
                        <Ionicons name={originBadge.icon as any} size={10} color="#FFF" />
                      </View>
                    )}
                  </View>
                  {chat.lastMessageTime && (
                    <Text
                      style={[
                        styles.chatTime,
                        chat.unreadCount > 0 && styles.chatTimeUnread,
                      ]}
                    >
                      {formatTime(chat.lastMessageTime)}
                    </Text>
                  )}
                </View>

                <Text
                  style={[
                    styles.lastMessage,
                    chat.unreadCount > 0 && styles.unreadMessage,
                  ]}
                  numberOfLines={2}
                >
                  {chat.lastMessage}
                </Text>
              </View>

              {chat.unreadCount > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadText}>{chat.unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        {/* Empty State */}
        {chats.length === 0 && (
          <View style={styles.emptyState}>
            <LinearGradient
              colors={[BotaLoveColors.primaryLight, BotaLoveColors.primary]}
              style={styles.emptyIconContainer}
            >
              <Ionicons name="chatbubbles" size={48} color="#FFF" />
            </LinearGradient>
            <Text style={styles.emptyTitle}>Nenhuma conversa ainda</Text>
            <Text style={styles.emptyText}>
              Quando você der match com alguém, pode começar a conversar aqui!
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => router.push('/')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[BotaLoveColors.primary, BotaLoveColors.primaryDark]}
                style={styles.emptyButtonGradient}
              >
                <Text style={styles.emptyButtonText}>Explorar perfis</Text>
                <Ionicons name="arrow-forward" size={18} color="#FFF" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingHorizontal: isSmallDevice ? 16 : 20,
    paddingBottom: isSmallDevice ? 16 : 20,
    backgroundColor: BotaLoveColors.backgroundWhite,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: isSmallDevice ? 28 : 32,
    fontWeight: '800',
    color: BotaLoveColors.secondary,
    letterSpacing: -0.5,
  },
  headerBadge: {
    backgroundColor: BotaLoveColors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  headerBadgeText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  searchButton: {
    width: isSmallDevice ? 40 : 44,
    height: isSmallDevice ? 40 : 44,
    borderRadius: isSmallDevice ? 20 : 22,
    backgroundColor: BotaLoveColors.neutralLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: BotaLoveColors.textSecondary,
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
  activeSection: {
    paddingHorizontal: isSmallDevice ? 16 : 20,
    paddingTop: isSmallDevice ? 16 : 20,
    paddingBottom: 10,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: BotaLoveColors.neutralDark,
    letterSpacing: 1,
  },
  chatCard: {
    flexDirection: 'row',
    paddingVertical: isSmallDevice ? 14 : 16,
    paddingHorizontal: isSmallDevice ? 16 : 20,
    alignItems: 'center',
    backgroundColor: BotaLoveColors.backgroundWhite,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.04)',
  },
  chatCardLast: {
    borderBottomWidth: 0,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: isSmallDevice ? 12 : 14,
  },
  avatar: {
    width: isSmallDevice ? 56 : 64,
    height: isSmallDevice ? 56 : 64,
    borderRadius: isSmallDevice ? 28 : 32,
    borderWidth: 2,
    borderColor: BotaLoveColors.neutralLight,
    backgroundColor: BotaLoveColors.neutralLight,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: isSmallDevice ? 14 : 16,
    height: isSmallDevice ? 14 : 16,
    borderRadius: isSmallDevice ? 7 : 8,
    backgroundColor: '#27AE60',
    borderWidth: 3,
    borderColor: '#FFF',
  },
  originBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatInfo: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chatName: {
    fontSize: isSmallDevice ? 15 : 17,
    fontWeight: '700',
    color: BotaLoveColors.textPrimary,
  },
  chatTime: {
    fontSize: isSmallDevice ? 11 : 12,
    color: BotaLoveColors.neutralDark,
    fontWeight: '500',
  },
  chatTimeUnread: {
    color: BotaLoveColors.primary,
    fontWeight: '600',
  },
  lastMessage: {
    fontSize: isSmallDevice ? 13 : 14,
    color: BotaLoveColors.neutralDark,
    lineHeight: isSmallDevice ? 18 : 20,
  },
  unreadMessage: {
    fontWeight: '600',
    color: BotaLoveColors.textPrimary,
  },
  unreadBadge: {
    backgroundColor: BotaLoveColors.primary,
    minWidth: isSmallDevice ? 22 : 24,
    height: isSmallDevice ? 22 : 24,
    borderRadius: isSmallDevice ? 11 : 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    paddingHorizontal: 6,
    ...Platform.select({
      ios: {
        shadowColor: BotaLoveColors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  unreadText: {
    color: '#FFF',
    fontSize: isSmallDevice ? 11 : 12,
    fontWeight: '800',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: isSmallDevice ? 60 : 80,
    paddingHorizontal: isSmallDevice ? 32 : 40,
  },
  emptyIconContainer: {
    width: isSmallDevice ? 90 : 100,
    height: isSmallDevice ? 90 : 100,
    borderRadius: isSmallDevice ? 45 : 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: isSmallDevice ? 20 : 24,
    ...Platform.select({
      ios: {
        shadowColor: BotaLoveColors.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  emptyTitle: {
    fontSize: isSmallDevice ? 20 : 22,
    fontWeight: '800',
    color: BotaLoveColors.secondary,
    marginBottom: isSmallDevice ? 8 : 10,
    letterSpacing: -0.3,
  },
  emptyText: {
    fontSize: isSmallDevice ? 14 : 15,
    color: BotaLoveColors.neutralDark,
    textAlign: 'center',
    lineHeight: isSmallDevice ? 20 : 22,
    marginBottom: isSmallDevice ? 24 : 28,
  },
  emptyButton: {
    borderRadius: isSmallDevice ? 24 : 28,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: BotaLoveColors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  emptyButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: isSmallDevice ? 24 : 28,
    paddingVertical: isSmallDevice ? 12 : 14,
  },
  emptyButtonText: {
    color: '#FFF',
    fontSize: isSmallDevice ? 15 : 16,
    fontWeight: '700',
  },
  bottomSpacer: {
    height: 40,
  },
});
