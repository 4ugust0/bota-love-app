/**
 * 🔥 BOTA LOVE APP - Discovery Service
 * 
 * Serviço de descoberta de usuários para o feed de matches:
 * - Filtro por localização (distância em km)
 * - Filtro por idade (faixa etária)
 * - Filtro por preferência de gênero
 * - Ordenação por proximidade
 * - Exclusão de usuários já vistos/curtidos/rejeitados
 * 
 * @author Bota Love Team
 */

import {
    collection,
    doc,
    getDoc,
    getDocs,
    limit,
    query,
    Timestamp,
    where
} from 'firebase/firestore';
import { firestore } from './config';
import {
    COLLECTIONS,
    DiscoverySettings,
    FirebaseUser,
    Gender,
} from './types';

// =============================================================================
// 📝 TIPOS
// =============================================================================

export interface DiscoveryUser {
  id: string;
  name: string;
  age: number;
  bio: string;
  photos: string[];
  city: string;
  state: string;
  occupation: string;
  interests: string[];
  distance?: number; // km
  isVerified: boolean;
  isAgroUser: boolean;
  relationshipGoals: string[];
  gender: Gender;
  // Indicadores
  hasSuperLikedMe: boolean;
  hasLikedMe: boolean;
  // Campos rurais
  ruralActivities?: string[];
  propertySize?: string[];
  animals?: string[];
  // Coordenadas para cálculo de distância
  latitude?: number;
  longitude?: number;
}

export interface DiscoveryFilters {
  userId: string;
  latitude?: number;
  longitude?: number;
  distanceRadius: number; // km
  ageMin: number;
  ageMax: number;
  genderInterest: 'men' | 'women' | 'both';
  showOutsideDistance?: boolean;
  showOutsideAgeRange?: boolean;
  onlyVerified?: boolean;
  onlyWithPhotos?: boolean;
  state?: string;
  city?: string;
}

// =============================================================================
// 🧮 FUNÇÕES DE CÁLCULO
// =============================================================================

/**
 * Calcula a distância entre duas coordenadas usando a fórmula de Haversine
 * @returns Distância em quilômetros
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Raio da Terra em km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Calcula a idade a partir da data de nascimento
 */
export function calculateAge(birthDate: Timestamp | null): number {
  if (!birthDate) return 0;
  const today = new Date();
  const birth = birthDate.toDate();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

/**
 * Converte gênero de preferência para array de gêneros
 */
function getGendersFromPreference(preference: 'men' | 'women' | 'both'): Gender[] {
  switch (preference) {
    case 'men':
      return ['male'];
    case 'women':
      return ['female'];
    case 'both':
      return ['male', 'female', 'non_binary', 'other'];
    default:
      return ['male', 'female'];
  }
}

// =============================================================================
// 🔍 DESCOBERTA DE USUÁRIOS
// =============================================================================

/**
 * Obtém usuários para o feed de descoberta
 * Combina dados do Firebase com filtros
 */
export async function discoverUsers(
  filters: DiscoveryFilters,
  excludeUserIds: string[] = [],
  maxResults: number = 50
): Promise<DiscoveryUser[]> {
  try {
    console.log('🔍 Iniciando descoberta de usuários...', filters);
    
    // 1. Buscar usuários ativos no Firestore
    const usersRef = collection(firestore, COLLECTIONS.USERS);
    
    // Query base - apenas usuários ativos
    const baseQuery = query(
      usersRef,
      where('status', '==', 'active'),
      where('emailVerified', '==', true),
      limit(200) // Buscar mais para filtrar depois
    );

    const snapshot = await getDocs(baseQuery);
    console.log(`📊 Total de usuários encontrados: ${snapshot.docs.length}`);

    // 2. Filtrar e processar usuários
    const users: DiscoveryUser[] = [];
    const acceptedGenders = getGendersFromPreference(filters.genderInterest);

    for (const docSnap of snapshot.docs) {
      const userData = docSnap.data() as FirebaseUser;
      const userId = docSnap.id;

      // Pular o próprio usuário
      if (userId === filters.userId) continue;

      // Pular usuários já excluídos (curtidos, rejeitados, etc.)
      if (excludeUserIds.includes(userId)) continue;

      // Verificar se o usuário quer ser mostrado
      if (userData.discoverySettings && !userData.discoverySettings.showMe) continue;

      // Filtrar por gênero
      if (!acceptedGenders.includes(userData.profile.gender)) continue;

      // Filtrar por idade
      const age = userData.profile.age || calculateAge(userData.profile.birthDate);
      if (age < 18) continue; // Sempre filtrar menores de 18
      
      if (!filters.showOutsideAgeRange) {
        if (age < filters.ageMin || age > filters.ageMax) continue;
      }

      // Filtrar por fotos (se configurado)
      if (filters.onlyWithPhotos && (!userData.profile.photos || userData.profile.photos.length === 0)) {
        continue;
      }

      // Calcular distância
      let distance: number | undefined;
      const userLat = userData.discoverySettings?.latitude;
      const userLng = userData.discoverySettings?.longitude;

      if (filters.latitude && filters.longitude && userLat && userLng) {
        distance = calculateDistance(
          filters.latitude,
          filters.longitude,
          userLat,
          userLng
        );

        // Filtrar por distância
        if (!filters.showOutsideDistance && distance > filters.distanceRadius) {
          continue;
        }
      } else if (filters.state && userData.profile.state) {
        // Fallback: filtrar por estado se não tiver coordenadas
        if (filters.state !== userData.profile.state) {
          // Se não quer ver fora da distância, pular
          if (!filters.showOutsideDistance) continue;
        }
      }

      // Criar objeto do usuário para o feed
      const discoveryUser: DiscoveryUser = {
        id: userId,
        name: userData.profile.name,
        age: age,
        bio: userData.profile.bio || '',
        photos: userData.profile.photos || [],
        city: userData.profile.city || '',
        state: userData.profile.state || '',
        occupation: userData.profile.occupation || '',
        interests: userData.profile.interests || [],
        distance,
        isVerified: userData.emailVerified,
        isAgroUser: userData.profile.isAgroUser || false,
        relationshipGoals: userData.profile.relationshipGoals || [],
        gender: userData.profile.gender,
        hasSuperLikedMe: false, // Será atualizado depois
        hasLikedMe: false, // Será atualizado depois
        ruralActivities: userData.profile.ruralActivities,
        propertySize: userData.profile.propertySize,
        animals: userData.profile.animals,
        latitude: userLat,
        longitude: userLng,
      };

      users.push(discoveryUser);
    }

    // 3. Ordenar por proximidade (se tiver coordenadas)
    if (filters.latitude && filters.longitude) {
      users.sort((a, b) => {
        if (a.distance === undefined) return 1;
        if (b.distance === undefined) return -1;
        return a.distance - b.distance;
      });
    }

    // 4. Limitar resultados
    const result = users.slice(0, maxResults);
    console.log(`✅ Usuários descobertos: ${result.length}`);

    return result;
  } catch (error) {
    console.error('❌ Erro na descoberta de usuários:', error);
    return [];
  }
}

/**
 * Obtém IDs de usuários que já foram interagidos (like, pass, match)
 */
export async function getInteractedUserIds(userId: string): Promise<string[]> {
  try {
    const interactedIds: string[] = [];

    // 1. Buscar likes dados
    const likesQuery = query(
      collection(firestore, COLLECTIONS.LIKES),
      where('fromUserId', '==', userId)
    );
    const likesSnap = await getDocs(likesQuery);
    likesSnap.docs.forEach((doc) => {
      interactedIds.push(doc.data().toUserId);
    });

    // 2. Buscar passes (rejeições)
    const passesQuery = query(
      collection(firestore, COLLECTIONS.PASSES),
      where('fromUserId', '==', userId),
      where('expiresAt', '>', Timestamp.now())
    );
    const passesSnap = await getDocs(passesQuery);
    passesSnap.docs.forEach((doc) => {
      interactedIds.push(doc.data().toUserId);
    });

    // 3. Buscar matches ativos
    const matchesQuery = query(
      collection(firestore, COLLECTIONS.MATCHES),
      where('users', 'array-contains', userId),
      where('isActive', '==', true)
    );
    const matchesSnap = await getDocs(matchesQuery);
    matchesSnap.docs.forEach((doc) => {
      const users = doc.data().users as string[];
      const otherUserId = users.find((id) => id !== userId);
      if (otherUserId) interactedIds.push(otherUserId);
    });

    return [...new Set(interactedIds)]; // Remover duplicatas
  } catch (error) {
    console.error('Erro ao buscar usuários interagidos:', error);
    return [];
  }
}

/**
 * Obtém likes recebidos para marcar usuários que já curtiram
 */
export async function getReceivedLikesMap(userId: string): Promise<Map<string, { isSuperLike: boolean }>> {
  try {
    const likesMap = new Map<string, { isSuperLike: boolean }>();

    const likesQuery = query(
      collection(firestore, COLLECTIONS.LIKES),
      where('toUserId', '==', userId),
      where('matchCreated', '==', false)
    );

    const snapshot = await getDocs(likesQuery);
    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      likesMap.set(data.fromUserId, { isSuperLike: data.isSuperLike || false });
    });

    return likesMap;
  } catch (error) {
    console.error('Erro ao buscar likes recebidos:', error);
    return new Map();
  }
}

/**
 * Obtém o feed completo de descoberta com todas as informações
 */
export async function getDiscoveryFeed(
  userId: string,
  discoverySettings: DiscoverySettings,
  maxResults: number = 30
): Promise<DiscoveryUser[]> {
  try {
    // 1. Obter IDs de usuários já interagidos
    const excludeIds = await getInteractedUserIds(userId);
    console.log(`🚫 Excluindo ${excludeIds.length} usuários já interagidos`);

    // 2. Criar filtros a partir das configurações
    const filters: DiscoveryFilters = {
      userId,
      latitude: discoverySettings.latitude,
      longitude: discoverySettings.longitude,
      distanceRadius: discoverySettings.distanceRadius,
      ageMin: discoverySettings.ageRange.min,
      ageMax: discoverySettings.ageRange.max,
      genderInterest: discoverySettings.genderInterest,
      showOutsideDistance: discoverySettings.showOutsideDistance,
      showOutsideAgeRange: discoverySettings.showOutsideAgeRange,
      onlyVerified: discoverySettings.onlyVerified,
      onlyWithPhotos: discoverySettings.onlyWithPhotos,
      state: discoverySettings.state,
      city: discoverySettings.city,
    };

    // 3. Descobrir usuários
    const users = await discoverUsers(filters, excludeIds, maxResults);

    // 4. Marcar usuários que já curtiram o usuário atual
    const likesMap = await getReceivedLikesMap(userId);
    
    users.forEach((user) => {
      const likeInfo = likesMap.get(user.id);
      if (likeInfo) {
        user.hasLikedMe = true;
        user.hasSuperLikedMe = likeInfo.isSuperLike;
      }
    });

    // 5. Priorizar usuários que deram super like
    users.sort((a, b) => {
      if (a.hasSuperLikedMe && !b.hasSuperLikedMe) return -1;
      if (!a.hasSuperLikedMe && b.hasSuperLikedMe) return 1;
      if (a.hasLikedMe && !b.hasLikedMe) return -1;
      if (!a.hasLikedMe && b.hasLikedMe) return 1;
      return 0;
    });

    return users;
  } catch (error) {
    console.error('Erro ao obter feed de descoberta:', error);
    return [];
  }
}

/**
 * Obtém um usuário específico para exibir no feed
 */
export async function getDiscoveryUserById(userId: string): Promise<DiscoveryUser | null> {
  try {
    const userRef = doc(firestore, COLLECTIONS.USERS, userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) return null;

    const userData = userSnap.data() as FirebaseUser;
    const age = userData.profile.age || calculateAge(userData.profile.birthDate);

    return {
      id: userSnap.id,
      name: userData.profile.name,
      age,
      bio: userData.profile.bio || '',
      photos: userData.profile.photos || [],
      city: userData.profile.city || '',
      state: userData.profile.state || '',
      occupation: userData.profile.occupation || '',
      interests: userData.profile.interests || [],
      isVerified: userData.emailVerified,
      isAgroUser: userData.profile.isAgroUser || false,
      relationshipGoals: userData.profile.relationshipGoals || [],
      gender: userData.profile.gender,
      hasSuperLikedMe: false,
      hasLikedMe: false,
      ruralActivities: userData.profile.ruralActivities,
      propertySize: userData.profile.propertySize,
      animals: userData.profile.animals,
      latitude: userData.discoverySettings?.latitude,
      longitude: userData.discoverySettings?.longitude,
    };
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    return null;
  }
}
