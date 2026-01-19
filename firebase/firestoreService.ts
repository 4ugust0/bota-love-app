/**
 * 🔥 BOTA LOVE APP - Firestore Service
 * 
 * Serviço para operações no Firestore:
 * - CRUD de usuários
 * - Gerenciamento de perfis
 * - Queries e filtros
 * 
 * @author Bota Love Team
 */

import {
    collection,
    doc,
    getDoc,
    getDocs,
    increment,
    limit,
    onSnapshot,
    query,
    QueryConstraint,
    serverTimestamp,
    updateDoc,
    where
} from 'firebase/firestore';
import { firestore } from './config';
import {
    COLLECTIONS,
    DiscoverySettings,
    FirebaseUser,
    NotificationSettings,
    UserProfile,
    UserStats
} from './types';

// =============================================================================
// 👤 OPERAÇÕES DE USUÁRIO
// =============================================================================

/**
 * Obtém dados do usuário pelo ID
 */
export async function getUserById(userId: string): Promise<FirebaseUser | null> {
  try {
    const userRef = doc(firestore, COLLECTIONS.USERS, userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return null;
    }

    return { ...userSnap.data(), id: userId } as FirebaseUser;
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    throw error;
  }
}

/**
 * Atualiza perfil do usuário
 */
export async function updateUserProfile(
  userId: string,
  profileData: Partial<UserProfile>
): Promise<void> {
  try {
    const userRef = doc(firestore, COLLECTIONS.USERS, userId);
    
    // Construir objeto de atualização com notação de ponto
    const updates: Record<string, any> = {
      updatedAt: serverTimestamp(),
    };

    Object.keys(profileData).forEach((key) => {
      updates[`profile.${key}`] = profileData[key as keyof UserProfile];
    });

    await updateDoc(userRef, updates);
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    throw error;
  }
}

/**
 * Atualiza fotos do usuário
 */
export async function updateUserPhotos(userId: string, photos: string[]): Promise<void> {
  try {
    const userRef = doc(firestore, COLLECTIONS.USERS, userId);
    await updateDoc(userRef, {
      'profile.photos': photos,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Erro ao atualizar fotos:', error);
    throw error;
  }
}

/**
 * Atualiza configurações de descoberta
 */
export async function updateDiscoverySettings(
  userId: string,
  settings: Partial<DiscoverySettings>
): Promise<void> {
  try {
    const userRef = doc(firestore, COLLECTIONS.USERS, userId);
    
    const updates: Record<string, any> = {
      updatedAt: serverTimestamp(),
    };

    Object.keys(settings).forEach((key) => {
      updates[`discoverySettings.${key}`] = settings[key as keyof DiscoverySettings];
    });

    await updateDoc(userRef, updates);
  } catch (error) {
    console.error('Erro ao atualizar configurações de descoberta:', error);
    throw error;
  }
}

/**
 * Atualiza configurações de notificação
 */
export async function updateNotificationSettings(
  userId: string,
  settings: Partial<NotificationSettings>
): Promise<void> {
  try {
    const userRef = doc(firestore, COLLECTIONS.USERS, userId);
    
    const updates: Record<string, any> = {
      updatedAt: serverTimestamp(),
    };

    Object.keys(settings).forEach((key) => {
      updates[`notificationSettings.${key}`] = settings[key as keyof NotificationSettings];
    });

    await updateDoc(userRef, updates);
  } catch (error) {
    console.error('Erro ao atualizar configurações de notificação:', error);
    throw error;
  }
}

/**
 * Adiciona FCM token ao usuário
 */
export async function addFcmToken(userId: string, token: string): Promise<void> {
  try {
    const user = await getUserById(userId);
    if (!user) return;

    const tokens = user.fcmTokens || [];
    if (!tokens.includes(token)) {
      tokens.push(token);
      await updateDoc(doc(firestore, COLLECTIONS.USERS, userId), {
        fcmTokens: tokens,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error('Erro ao adicionar FCM token:', error);
    throw error;
  }
}

/**
 * Remove FCM token do usuário
 */
export async function removeFcmToken(userId: string, token: string): Promise<void> {
  try {
    const user = await getUserById(userId);
    if (!user) return;

    const tokens = (user.fcmTokens || []).filter((t) => t !== token);
    await updateDoc(doc(firestore, COLLECTIONS.USERS, userId), {
      fcmTokens: tokens,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Erro ao remover FCM token:', error);
    throw error;
  }
}

/**
 * Incrementa estatística do usuário
 */
export async function incrementUserStat(
  userId: string,
  stat: keyof UserStats,
  value: number = 1
): Promise<void> {
  try {
    const userRef = doc(firestore, COLLECTIONS.USERS, userId);
    await updateDoc(userRef, {
      [`stats.${stat}`]: increment(value),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Erro ao incrementar estatística:', error);
    throw error;
  }
}

// =============================================================================
// 🔍 DISCOVERY - BUSCA DE PERFIS
// =============================================================================

export interface DiscoveryFilter {
  excludeUserIds?: string[];
  genderPreference?: 'male' | 'female' | 'all';
  ageMin?: number;
  ageMax?: number;
  city?: string;
  state?: string;
  isAgroUser?: boolean;
  hasPhotos?: boolean;
  limit?: number;
}

/**
 * Busca perfis para descoberta (explorar)
 */
export async function discoverProfiles(
  currentUserId: string,
  filter: DiscoveryFilter = {}
): Promise<FirebaseUser[]> {
  try {
    const constraints: QueryConstraint[] = [
      where('status', '==', 'active'),
      where('emailVerified', '==', true),
      where('discoverySettings.showMe', '==', true),
    ];

    // Filtro de gênero
    if (filter.genderPreference && filter.genderPreference !== 'all') {
      constraints.push(where('profile.gender', '==', filter.genderPreference));
    }

    // Filtro de usuário agro
    if (filter.isAgroUser !== undefined) {
      constraints.push(where('profile.isAgroUser', '==', filter.isAgroUser));
    }

    // Limite de resultados
    constraints.push(limit(filter.limit || 20));

    const q = query(collection(firestore, COLLECTIONS.USERS), ...constraints);
    const snapshot = await getDocs(q);

    let users: FirebaseUser[] = [];
    
    snapshot.forEach((doc) => {
      const userData = { ...doc.data(), id: doc.id } as FirebaseUser;
      
      // Excluir o próprio usuário
      if (userData.id === currentUserId) return;
      
      // Excluir usuários da lista de exclusão
      if (filter.excludeUserIds?.includes(userData.id)) return;
      
      // Filtros adicionais em memória
      const profile = userData.profile;
      
      // Filtro de idade
      if (filter.ageMin && profile.age < filter.ageMin) return;
      if (filter.ageMax && profile.age > filter.ageMax) return;
      
      // Filtro de fotos
      if (filter.hasPhotos && (!profile.photos || profile.photos.length === 0)) return;
      
      users.push(userData);
    });

    return users;
  } catch (error) {
    console.error('Erro ao descobrir perfis:', error);
    throw error;
  }
}

/**
 * Busca perfis do Network Rural
 */
export async function discoverNetworkProfiles(
  currentUserId: string,
  filter: {
    agroAreas?: string[];
    occupations?: string[];
    hasLinkedIn?: boolean;
    limit?: number;
  } = {}
): Promise<FirebaseUser[]> {
  try {
    const constraints: QueryConstraint[] = [
      where('status', '==', 'active'),
      where('profile.isAgroUser', '==', true),
      where('networkRural.isActive', '==', true),
      limit(filter.limit || 20),
    ];

    const q = query(collection(firestore, COLLECTIONS.USERS), ...constraints);
    const snapshot = await getDocs(q);

    let users: FirebaseUser[] = [];
    
    snapshot.forEach((doc) => {
      const userData = { ...doc.data(), id: doc.id } as FirebaseUser;
      
      // Excluir o próprio usuário
      if (userData.id === currentUserId) return;
      
      // Filtros adicionais em memória
      if (filter.agroAreas?.length) {
        const userAreas = userData.profile.agroAreas || [];
        const hasMatchingArea = filter.agroAreas.some((area) => userAreas.includes(area));
        if (!hasMatchingArea) return;
      }
      
      if (filter.hasLinkedIn && !userData.networkRural.linkedIn?.isVerified) {
        return;
      }
      
      users.push(userData);
    });

    return users;
  } catch (error) {
    console.error('Erro ao descobrir perfis do Network:', error);
    throw error;
  }
}

// =============================================================================
// 👁️ VISUALIZAÇÕES DE PERFIL
// =============================================================================

/**
 * Registra visualização de perfil
 */
export async function recordProfileView(viewerId: string, viewedUserId: string): Promise<void> {
  try {
    // Incrementar contador de visualizações
    await incrementUserStat(viewedUserId, 'profileViews');
    
    // Opcional: registrar em subcollection para histórico
    // const viewRef = doc(collection(firestore, COLLECTIONS.USERS, viewedUserId, 'profile_views'));
    // await setDoc(viewRef, {
    //   viewerId,
    //   timestamp: serverTimestamp(),
    // });
  } catch (error) {
    console.error('Erro ao registrar visualização:', error);
  }
}

// =============================================================================
// 📡 LISTENERS EM TEMPO REAL
// =============================================================================

/**
 * Escuta mudanças no perfil do usuário
 */
export function subscribeToUserProfile(
  userId: string,
  callback: (user: FirebaseUser | null) => void
): () => void {
  const userRef = doc(firestore, COLLECTIONS.USERS, userId);
  
  return onSnapshot(userRef, (snapshot) => {
    if (snapshot.exists()) {
      callback({ ...snapshot.data(), id: snapshot.id } as FirebaseUser);
    } else {
      callback(null);
    }
  }, (error) => {
    console.error('Erro no listener de perfil:', error);
    callback(null);
  });
}

// =============================================================================
// 📤 EXPORTS
// =============================================================================

export { firestore };
