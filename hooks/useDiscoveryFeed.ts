/**
 * 🔥 BOTA LOVE APP - Hook de Feed de Descoberta
 * 
 * Hook que gerencia o feed de usuários para descoberta:
 * - Carrega usuários reais do Firebase
 * - Combina com dados mockados (temporariamente)
 * - Gerencia likes, passes e matches
 * 
 * @author Bota Love Team
 */

import { useAuth } from '@/contexts/AuthContext';
import { MOCK_USERS, User as MockUser } from '@/data/mockData';
import {
    DiscoverySettings,
    DiscoveryUser,
    getDiscoveryFeed,
    likeUser,
    passUser,
} from '@/firebase';
import { useCallback, useEffect, useState } from 'react';

// =============================================================================
// 📝 TIPOS
// =============================================================================

export interface FeedUser {
  id: string;
  name: string;
  age: number;
  bio: string;
  photos: string[];
  city: string;
  state: string;
  occupation: string;
  interests: string[];
  distance?: number;
  isVerified: boolean;
  isAgroUser: boolean;
  likedYou: boolean;
  superLikedYou: boolean;
  // Origem dos dados
  source: 'firebase' | 'mock';
  // Campos adicionais do Firebase
  ruralActivities?: string[];
  propertySize?: string[];
  animals?: string[];
}

export interface SwipeResult {
  success: boolean;
  isMatch: boolean;
  matchId?: string;
  chatId?: string;
  error?: string;
}

// =============================================================================
// 🔄 CONVERSÕES
// =============================================================================

/**
 * Converte DiscoveryUser (Firebase) para FeedUser
 */
function convertDiscoveryUserToFeedUser(user: DiscoveryUser): FeedUser {
  return {
    id: user.id,
    name: user.name,
    age: user.age,
    bio: user.bio,
    photos: user.photos.length > 0 ? user.photos : [
      'https://via.placeholder.com/400x600/27AE60/FFF?text=' + user.name.charAt(0)
    ],
    city: user.city,
    state: user.state,
    occupation: user.occupation,
    interests: user.interests,
    distance: user.distance,
    isVerified: user.isVerified,
    isAgroUser: user.isAgroUser,
    likedYou: user.hasLikedMe,
    superLikedYou: user.hasSuperLikedMe,
    source: 'firebase',
    ruralActivities: user.ruralActivities,
    propertySize: user.propertySize,
    animals: user.animals,
  };
}

/**
 * Converte MockUser para FeedUser
 */
function convertMockUserToFeedUser(user: MockUser): FeedUser {
  return {
    id: user.id,
    name: user.name,
    age: user.age,
    bio: user.bio,
    photos: user.photos,
    city: user.city,
    state: user.state,
    occupation: user.occupation,
    interests: user.interests,
    distance: user.distance,
    isVerified: true, // Mock users são sempre "verificados"
    isAgroUser: user.isAgroUser ?? true,
    likedYou: user.likedYou ?? false,
    superLikedYou: false,
    source: 'mock',
  };
}

// =============================================================================
// 🎣 HOOK PRINCIPAL
// =============================================================================

interface UseDiscoveryFeedOptions {
  includesMock?: boolean; // Se deve incluir usuários mockados
  maxResults?: number;
}

interface UseDiscoveryFeedReturn {
  users: FeedUser[];
  loading: boolean;
  error: string | null;
  currentIndex: number;
  currentUser: FeedUser | null;
  hasMoreUsers: boolean;
  // Ações
  handleLike: () => Promise<SwipeResult>;
  handleSuperLike: () => Promise<SwipeResult>;
  handlePass: () => Promise<void>;
  refreshFeed: () => Promise<void>;
  goToNextUser: () => void;
  resetFeed: () => void;
}

export function useDiscoveryFeed(options: UseDiscoveryFeedOptions = {}): UseDiscoveryFeedReturn {
  const { includesMock = true, maxResults = 30 } = options;
  const { currentUser: authUser, isAuthenticated } = useAuth();

  const [users, setUsers] = useState<FeedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [processedIds, setProcessedIds] = useState<Set<string>>(new Set());

  // Carregar feed de descoberta
  const loadFeed = useCallback(async () => {
    if (!isAuthenticated || !authUser?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Obter configurações de descoberta do usuário
      const discoverySettings: DiscoverySettings = authUser?.discoverySettings || {
        ageRange: { min: 18, max: 60 },
        distanceRadius: 100,
        genderInterest: 'both',
        showOutsideDistance: true,
        showOutsideAgeRange: false,
        onlyVerified: false,
        onlyWithPhotos: false,
        showMe: true,
      };

      console.log('🔍 Buscando usuários do Firebase...', discoverySettings);

      // 2. Buscar usuários reais do Firebase
      const firebaseUsers = await getDiscoveryFeed(
        authUser.id,
        discoverySettings,
        maxResults
      );

      console.log(`✅ Encontrados ${firebaseUsers.length} usuários no Firebase`);

      // 3. Converter para FeedUser
      const realUsers: FeedUser[] = firebaseUsers.map(convertDiscoveryUserToFeedUser);

      // 4. Adicionar usuários mockados (se configurado e se necessário)
      let allUsers: FeedUser[] = [...realUsers];

      if (includesMock) {
        // Filtrar mock users que não são o usuário atual e que não são duplicatas
        const mockUsers = MOCK_USERS
          .filter((u) => u.id !== authUser?.id && u.id !== 'user-free')
          .filter((u) => !realUsers.some((ru) => ru.id === u.id))
          .map(convertMockUserToFeedUser);

        console.log(`📦 Adicionando ${mockUsers.length} usuários mockados`);
        
        // Intercalar usuários reais com mockados para melhor experiência
        allUsers = intercalateUsers(realUsers, mockUsers);
      }

      // 5. Remover já processados
      const filteredUsers = allUsers.filter((u) => !processedIds.has(u.id));

      setUsers(filteredUsers);
      setCurrentIndex(0);
    } catch (err: any) {
      console.error('❌ Erro ao carregar feed:', err);
      setError(err.message || 'Erro ao carregar perfis');
      
      // Fallback para mock users em caso de erro
      if (includesMock) {
        const mockUsers = MOCK_USERS
          .filter((u) => u.id !== authUser?.id && u.id !== 'user-free')
          .map(convertMockUserToFeedUser);
        setUsers(mockUsers);
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, authUser?.id, authUser?.discoverySettings, includesMock, maxResults, processedIds]);

  // Carregar ao montar
  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  // Usuário atual do feed
  const currentFeedUser = users[currentIndex] || null;
  const hasMoreUsers = currentIndex < users.length;

  // Ação: Curtir
  const handleLike = useCallback(async (): Promise<SwipeResult> => {
    if (!currentFeedUser || !authUser?.id) {
      return { success: false, isMatch: false, error: 'Nenhum usuário disponível' };
    }

    try {
      // Marcar como processado
      setProcessedIds((prev) => new Set([...prev, currentFeedUser.id]));

      // Se for usuário real do Firebase, registrar like
      if (currentFeedUser.source === 'firebase') {
        const result = await likeUser(authUser.id, currentFeedUser.id, false);
        return result;
      }

      // Para mock users, simular match (30% de chance, 100% se já curtiu)
      const isMatch = currentFeedUser.likedYou || Math.random() < 0.3;
      
      return {
        success: true,
        isMatch,
        matchId: isMatch ? `mock_match_${currentFeedUser.id}` : undefined,
        chatId: isMatch ? `mock_chat_${currentFeedUser.id}` : undefined,
      };
    } catch (err: any) {
      console.error('Erro ao dar like:', err);
      return { success: false, isMatch: false, error: err.message };
    }
  }, [currentFeedUser, authUser?.id]);

  // Ação: Super Like
  const handleSuperLike = useCallback(async (): Promise<SwipeResult> => {
    if (!currentFeedUser || !authUser?.id) {
      return { success: false, isMatch: false, error: 'Nenhum usuário disponível' };
    }

    try {
      // Marcar como processado
      setProcessedIds((prev) => new Set([...prev, currentFeedUser.id]));

      // Se for usuário real do Firebase, registrar super like
      if (currentFeedUser.source === 'firebase') {
        const result = await likeUser(authUser.id, currentFeedUser.id, true);
        return result;
      }

      // Para mock users, simular match (80% de chance no super like)
      const isMatch = currentFeedUser.likedYou || Math.random() < 0.8;
      
      return {
        success: true,
        isMatch,
        matchId: isMatch ? `mock_match_${currentFeedUser.id}` : undefined,
        chatId: isMatch ? `mock_chat_${currentFeedUser.id}` : undefined,
      };
    } catch (err: any) {
      console.error('Erro ao dar super like:', err);
      return { success: false, isMatch: false, error: err.message };
    }
  }, [currentFeedUser, authUser?.id]);

  // Ação: Passar
  const handlePass = useCallback(async (): Promise<void> => {
    if (!currentFeedUser || !authUser?.id) return;

    try {
      // Marcar como processado
      setProcessedIds((prev) => new Set([...prev, currentFeedUser.id]));

      // Se for usuário real do Firebase, registrar pass
      if (currentFeedUser.source === 'firebase') {
        await passUser(authUser.id, currentFeedUser.id);
      }
    } catch (err: any) {
      console.error('Erro ao passar:', err);
    }
  }, [currentFeedUser, authUser?.id]);

  // Avançar para próximo usuário
  const goToNextUser = useCallback(() => {
    setCurrentIndex((prev) => Math.min(prev + 1, users.length));
  }, [users.length]);

  // Resetar feed
  const resetFeed = useCallback(() => {
    setProcessedIds(new Set());
    setCurrentIndex(0);
    loadFeed();
  }, [loadFeed]);

  // Atualizar feed
  const refreshFeed = useCallback(async () => {
    await loadFeed();
  }, [loadFeed]);

  return {
    users,
    loading,
    error,
    currentIndex,
    currentUser: currentFeedUser,
    hasMoreUsers,
    handleLike,
    handleSuperLike,
    handlePass,
    refreshFeed,
    goToNextUser,
    resetFeed,
  };
}

// =============================================================================
// 🛠️ FUNÇÕES AUXILIARES
// =============================================================================

/**
 * Intercala usuários reais com mockados
 * Prioriza usuários reais, mas mistura para melhor experiência
 */
function intercalateUsers(realUsers: FeedUser[], mockUsers: FeedUser[]): FeedUser[] {
  if (realUsers.length === 0) return mockUsers;
  if (mockUsers.length === 0) return realUsers;

  const result: FeedUser[] = [];
  const realCopy = [...realUsers];
  const mockCopy = [...mockUsers];

  // Padrão: 2 reais, 1 mock
  while (realCopy.length > 0 || mockCopy.length > 0) {
    // Adicionar até 2 usuários reais
    if (realCopy.length > 0) {
      result.push(realCopy.shift()!);
    }
    if (realCopy.length > 0) {
      result.push(realCopy.shift()!);
    }
    // Adicionar 1 mock
    if (mockCopy.length > 0) {
      result.push(mockCopy.shift()!);
    }
  }

  return result;
}
