/**
 * 🔥 BOTA LOVE APP - Tela de Matches
 * 
 * Lista de matches e conversas em tempo real:
 * - Novos matches (ainda não conversaram)
 * - Mensagens com matches ativos
 * - Busca por nome
 * 
 * @author Bota Love Team
 */

import { BotaLoveColors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { getUserById } from '@/firebase';
import { getUserMatches } from '@/firebase/matchService';
import { useChats } from '@/hooks/useChat';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Image,
    Platform,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isSmallDevice = SCREEN_WIDTH < 375;
const CARD_PADDING = isSmallDevice ? 14 : 20;

// Tipo para novos matches (ainda sem conversa iniciada)
interface NewMatch {
  id: string;
  matchId: string;
  userId: string;
  name: string;
  photo: string;
  isVerified: boolean;
  matchedAt: Date;
}

export default function MatchesScreen() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const { chats, loading: chatsLoading, totalUnread, refreshChats } = useChats();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [newMatches, setNewMatches] = useState<NewMatch[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Carregar novos matches (matches sem conversa iniciada)
  const loadNewMatches = useCallback(async () => {
    if (!currentUser?.id) return;
    
    try {
      const matchesList = await getUserMatches(currentUser.id);
      
      // IDs de usuários que já têm chat
      const chatUserIds = new Set(chats.map(c => c.otherUser.id));
      
      // Filtrar matches que ainda não têm chat
      const newMatchesData: NewMatch[] = [];
      
      for (const match of matchesList) {
        const otherUserId = match.users.find((id: string) => id !== currentUser.id);
        if (!otherUserId || chatUserIds.has(otherUserId)) continue;
        
        try {
          const userData = await getUserById(otherUserId);
          if (userData) {
            newMatchesData.push({
              id: match.id,
              matchId: match.id,
              userId: otherUserId,
              name: userData.profile?.name || 'Usuário',
              photo: userData.profile?.photos?.[0] || 'https://via.placeholder.com/100',
              isVerified: userData.emailVerified || false,
              matchedAt: match.createdAt?.toDate() || new Date(),
            });
          }
        } catch (e) {
          console.warn('Erro ao buscar usuário do match:', e);
        }
      }
      
      setNewMatches(newMatchesData);
    } catch (error) {
      console.error('Erro ao carregar matches:', error);
    } finally {
      setLoadingMatches(false);
    }
  }, [currentUser?.id, chats]);

  useEffect(() => {
    loadNewMatches();
  }, [loadNewMatches]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      refreshChats(),
      loadNewMatches(),
    ]);
    setRefreshing(false);
  }, [refreshChats, loadNewMatches]);

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
    if (diffDays < 7) return `${diffDays}d atrás`;
    
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  // Filtrar chats pela busca
  const filteredChats = chats.filter(chat => {
    if (!searchQuery) return true;
    return chat.otherUser.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Filtrar novos matches pela busca
  const filteredNewMatches = newMatches.filter(match => {
    if (!searchQuery) return true;
    return match.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const isLoading = chatsLoading && loadingMatches;
  const totalConnections = chats.length + newMatches.length;

  // Loading state
  if (isLoading && totalConnections === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Matches</Text>
          <Text style={styles.subtitle}>Carregando...</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BotaLoveColors.primary} />
          <Text style={styles.loadingText}>Carregando matches...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Matches</Text>
        <Text style={styles.subtitle}>{totalConnections} conexões</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={BotaLoveColors.neutralDark} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder={`Buscar ${totalConnections} Matches`}
          placeholderTextColor={BotaLoveColors.neutralDark}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Estado vazio - quando não há nenhum match */}
      {totalConnections === 0 && !searchQuery && (
        <View style={styles.emptyStateFullScreen}>
          <LinearGradient
            colors={['#D4AD63', '#B8944D']}
            style={styles.emptyIconCircle}
          >
            <Ionicons name="heart" size={48} color="#FFF" />
          </LinearGradient>
          <Text style={styles.emptyTitle}>Ainda não há matches</Text>
          <Text style={styles.emptyText}>
            Continue navegando para encontrar pessoas do agro!
          </Text>
          <TouchableOpacity 
            style={styles.emptyButton}
            onPress={() => router.push('/')}
          >
            <LinearGradient
              colors={['#27AE60', '#229954']}
              style={styles.emptyButtonGradient}
            >
              <Text style={styles.emptyButtonText}>Começar a explorar</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {/* Conteúdo quando há matches */}
      {(totalConnections > 0 || searchQuery) && (
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
          {/* Novos Matches Section */}
          {filteredNewMatches.length > 0 && (
            <View style={styles.newMatchesSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Novos Matches</Text>
              <View style={styles.newBadge}>
                <Text style={styles.newBadgeText}>{filteredNewMatches.length}</Text>
              </View>
            </View>

            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.newMatchesScroll}
            >
              {filteredNewMatches.map((match) => (
                <TouchableOpacity
                  key={match.id}
                  style={styles.newMatchCard}
                  onPress={() => router.push(`/profile-detail/${match.userId}`)}
                >
                  <View style={styles.newMatchImageContainer}>
                    <Image source={{ uri: match.photo }} style={styles.newMatchImage} />
                    {match.isVerified && (
                      <View style={styles.verifiedBadge}>
                        <Ionicons name="checkmark-circle" size={20} color="#3498DB" />
                      </View>
                    )}
                  </View>
                  <Text style={styles.newMatchName} numberOfLines={1}>
                    {match.name.split(' ')[0]}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Mensagens Section */}
        <View style={styles.messagesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Mensagens</Text>
            {totalUnread > 0 && (
              <View style={styles.unreadCountBadge}>
                <Text style={styles.unreadCountText}>{totalUnread}</Text>
              </View>
            )}
          </View>

          {filteredChats.map((chat) => (
            <TouchableOpacity
              key={chat.chatId}
              style={styles.messageCard}
              onPress={() => router.push(`/chat/${chat.chatId}`)}
            >
              <View style={styles.avatarContainer}>
                <Image source={{ uri: chat.otherUser.photo }} style={styles.avatar} />
                {chat.otherUser.isOnline && <View style={styles.onlineDot} />}
              </View>
              
              <View style={styles.messageInfo}>
                <View style={styles.messageHeader}>
                  <View style={styles.nameRow}>
                    <Text style={styles.messageName}>{chat.otherUser.name}</Text>
                    <Ionicons name="checkmark-circle" size={16} color="#3498DB" style={styles.verifiedIcon} />
                  </View>
                  {chat.lastMessageTime && (
                    <Text style={styles.messageTime}>{formatTime(chat.lastMessageTime)}</Text>
                  )}
                </View>

                {chat.lastMessage && (
                  <Text 
                    style={[
                      styles.lastMessage,
                      chat.unreadCount > 0 && styles.lastMessageUnread
                    ]} 
                    numberOfLines={1}
                  >
                    {chat.lastMessage}
                  </Text>
                )}
              </View>

              {chat.unreadCount > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadText}>{chat.unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}

          {filteredChats.length === 0 && searchQuery && (
            <View style={styles.emptySearch}>
              <Ionicons name="search-outline" size={48} color={BotaLoveColors.neutralDark} />
              <Text style={styles.emptySearchText}>Nenhuma conversa encontrada</Text>
            </View>
          )}

          {filteredChats.length === 0 && !searchQuery && totalConnections > 0 && (
            <View style={styles.emptyMessages}>
              <Ionicons name="chatbubble-outline" size={32} color={BotaLoveColors.neutralDark} />
              <Text style={styles.emptyMessagesText}>
                Nenhuma conversa iniciada ainda
              </Text>
              <Text style={styles.emptyMessagesSubtext}>
                Envie uma mensagem para um match!
              </Text>
            </View>
          )}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingHorizontal: CARD_PADDING,
    paddingBottom: isSmallDevice ? 14 : 18,
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
  title: {
    fontSize: isSmallDevice ? 30 : 36,
    fontWeight: '800',
    color: BotaLoveColors.secondary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: isSmallDevice ? 14 : 15,
    color: BotaLoveColors.neutralDark,
    marginTop: 4,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: BotaLoveColors.neutralDark,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BotaLoveColors.backgroundWhite,
    marginHorizontal: isSmallDevice ? 12 : 16,
    marginVertical: isSmallDevice ? 10 : 14,
    paddingHorizontal: isSmallDevice ? 14 : 18,
    paddingVertical: isSmallDevice ? 12 : 14,
    borderRadius: isSmallDevice ? 14 : 16,
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.06)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  searchIcon: {
    marginRight: isSmallDevice ? 10 : 12,
  },
  searchInput: {
    flex: 1,
    fontSize: isSmallDevice ? 15 : 16,
    color: BotaLoveColors.textPrimary,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  newMatchesSection: {
    backgroundColor: BotaLoveColors.backgroundWhite,
    paddingVertical: isSmallDevice ? 16 : 22,
    marginBottom: isSmallDevice ? 6 : 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: CARD_PADDING,
    marginBottom: isSmallDevice ? 14 : 18,
    gap: isSmallDevice ? 8 : 12,
  },
  sectionTitle: {
    fontSize: isSmallDevice ? 17 : 19,
    fontWeight: '700',
    color: BotaLoveColors.secondary,
    letterSpacing: -0.2,
  },
  newBadge: {
    backgroundColor: '#E74C3C',
    paddingHorizontal: isSmallDevice ? 10 : 12,
    paddingVertical: isSmallDevice ? 4 : 5,
    borderRadius: isSmallDevice ? 12 : 14,
    ...Platform.select({
      ios: {
        shadowColor: '#E74C3C',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  newBadgeText: {
    color: '#FFF',
    fontSize: isSmallDevice ? 12 : 13,
    fontWeight: '700',
  },
  newMatchesScroll: {
    paddingHorizontal: isSmallDevice ? 14 : 18,
    gap: isSmallDevice ? 12 : 16,
  },
  newMatchCard: {
    alignItems: 'center',
    width: isSmallDevice ? 80 : 95,
  },
  newMatchImageContainer: {
    position: 'relative',
    marginBottom: isSmallDevice ? 7 : 10,
  },
  newMatchImage: {
    width: isSmallDevice ? 70 : 85,
    height: isSmallDevice ? 90 : 110,
    borderRadius: isSmallDevice ? 14 : 16,
    borderWidth: 3,
    borderColor: BotaLoveColors.primary,
    ...Platform.select({
      ios: {
        shadowColor: BotaLoveColors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 3,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.15,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  newMatchName: {
    fontSize: isSmallDevice ? 13 : 14,
    fontWeight: '700',
    color: BotaLoveColors.secondary,
    textAlign: 'center',
  },
  messagesSection: {
    backgroundColor: BotaLoveColors.backgroundWhite,
    borderRadius: isSmallDevice ? 16 : 20,
    marginHorizontal: isSmallDevice ? 10 : 14,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  unreadCountBadge: {
    backgroundColor: '#E74C3C',
    paddingHorizontal: isSmallDevice ? 10 : 12,
    paddingVertical: isSmallDevice ? 4 : 5,
    borderRadius: isSmallDevice ? 12 : 14,
  },
  unreadCountText: {
    color: '#FFF',
    fontSize: isSmallDevice ? 12 : 13,
    fontWeight: '700',
  },
  messageCard: {
    flexDirection: 'row',
    padding: isSmallDevice ? 14 : 18,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.04)',
    alignItems: 'center',
    backgroundColor: BotaLoveColors.backgroundWhite,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: isSmallDevice ? 12 : 16,
  },
  avatar: {
    width: isSmallDevice ? 58 : 68,
    height: isSmallDevice ? 58 : 68,
    borderRadius: isSmallDevice ? 29 : 34,
    borderWidth: 2.5,
    borderColor: BotaLoveColors.neutralLight,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 3,
    right: 3,
    width: isSmallDevice ? 14 : 17,
    height: isSmallDevice ? 14 : 17,
    borderRadius: isSmallDevice ? 7 : 9,
    backgroundColor: '#27AE60',
    borderWidth: 3,
    borderColor: '#FFF',
  },
  messageInfo: {
    flex: 1,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: isSmallDevice ? 4 : 6,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: isSmallDevice ? 4 : 6,
  },
  messageName: {
    fontSize: isSmallDevice ? 16 : 18,
    fontWeight: '700',
    color: BotaLoveColors.textPrimary,
    letterSpacing: -0.2,
  },
  verifiedIcon: {
    marginLeft: 2,
  },
  messageTime: {
    fontSize: isSmallDevice ? 12 : 13,
    color: BotaLoveColors.neutralDark,
    fontWeight: '500',
  },
  lastMessage: {
    fontSize: isSmallDevice ? 14 : 15,
    color: BotaLoveColors.neutralDark,
    marginBottom: isSmallDevice ? 3 : 5,
    lineHeight: isSmallDevice ? 19 : 21,
  },
  lastMessageUnread: {
    fontWeight: '600',
    color: BotaLoveColors.textPrimary,
  },
  unreadBadge: {
    backgroundColor: BotaLoveColors.primary,
    minWidth: isSmallDevice ? 24 : 28,
    height: isSmallDevice ? 24 : 28,
    borderRadius: isSmallDevice ? 12 : 14,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: isSmallDevice ? 7 : 9,
    ...Platform.select({
      ios: {
        shadowColor: BotaLoveColors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  unreadText: {
    color: '#FFF',
    fontSize: isSmallDevice ? 12 : 14,
    fontWeight: '800',
  },
  emptySearch: {
    alignItems: 'center',
    paddingVertical: isSmallDevice ? 50 : 70,
    paddingHorizontal: isSmallDevice ? 32 : 40,
  },
  emptySearchText: {
    fontSize: isSmallDevice ? 15 : 17,
    color: BotaLoveColors.neutralDark,
    marginTop: isSmallDevice ? 12 : 16,
    fontWeight: '500',
  },
  emptyMessages: {
    alignItems: 'center',
    paddingVertical: isSmallDevice ? 30 : 40,
    paddingHorizontal: isSmallDevice ? 32 : 40,
  },
  emptyMessagesText: {
    fontSize: isSmallDevice ? 15 : 16,
    color: BotaLoveColors.neutralDark,
    marginTop: isSmallDevice ? 12 : 16,
    fontWeight: '600',
  },
  emptyMessagesSubtext: {
    fontSize: isSmallDevice ? 13 : 14,
    color: BotaLoveColors.neutralMedium,
    marginTop: 4,
  },
  emptyStateFullScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: isSmallDevice ? 32 : 48,
    backgroundColor: BotaLoveColors.backgroundWhite,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: isSmallDevice ? 60 : 90,
    paddingHorizontal: isSmallDevice ? 32 : 48,
    backgroundColor: BotaLoveColors.backgroundWhite,
  },
  emptyIconCircle: {
    width: isSmallDevice ? 90 : 110,
    height: isSmallDevice ? 90 : 110,
    borderRadius: isSmallDevice ? 45 : 55,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: isSmallDevice ? 20 : 28,
    ...Platform.select({
      ios: {
        shadowColor: BotaLoveColors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 16,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  emptyTitle: {
    fontSize: isSmallDevice ? 20 : 24,
    fontWeight: '800',
    color: BotaLoveColors.secondary,
    marginBottom: isSmallDevice ? 8 : 12,
    letterSpacing: -0.3,
  },
  emptyText: {
    fontSize: isSmallDevice ? 14 : 16,
    color: BotaLoveColors.neutralDark,
    textAlign: 'center',
    lineHeight: isSmallDevice ? 21 : 24,
    marginBottom: isSmallDevice ? 24 : 30,
  },
  emptyButton: {
    borderRadius: isSmallDevice ? 26 : 30,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#27AE60',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  emptyButtonGradient: {
    paddingHorizontal: isSmallDevice ? 28 : 36,
    paddingVertical: isSmallDevice ? 14 : 16,
  },
  emptyButtonText: {
    color: '#FFF',
    fontSize: isSmallDevice ? 16 : 18,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  bottomSpacer: {
    height: isSmallDevice ? 35 : 50,
  },
});
