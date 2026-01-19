/**
 * 🔥 BOTA LOVE APP - Network Rural Service (Firebase)
 * 
 * Serviço de Network Rural integrado ao Firebase:
 * - Conexões profissionais
 * - Perfis de networking
 * - LinkedIn integration
 * 
 * @author Bota Love Team
 */

import {
    addDoc,
    collection,
    doc,
    getDocs,
    onSnapshot,
    query,
    serverTimestamp,
    Timestamp,
    updateDoc,
    where
} from 'firebase/firestore';
import { createNetworkChat } from './chatService';
import { firestore } from './config';
import {
    COLLECTIONS,
    FirebaseUser,
    LinkedInProfile,
    NetworkConnection
} from './types';

// =============================================================================
// 📝 TIPOS
// =============================================================================

export interface NetworkProfile {
  userId: string;
  name: string;
  photo: string;
  occupation: string;
  city: string;
  state: string;
  agroAreas: string[];
  linkedIn?: LinkedInProfile;
  goals: string[];
  lookingFor: string[];
  isActive: boolean;
}

export interface ConnectionRequest {
  fromUserId: string;
  toUserId: string;
  message?: string;
  connectionType: 'professional' | 'business' | 'mentorship';
}

// =============================================================================
// 👥 BUSCA DE PERFIS NETWORK
// =============================================================================

/**
 * Busca perfis disponíveis no Network Rural
 */
export async function getNetworkProfiles(
  currentUserId: string,
  filters?: {
    agroAreas?: string[];
    occupations?: string[];
    hasLinkedIn?: boolean;
    goals?: string[];
  }
): Promise<NetworkProfile[]> {
  try {
    const q = query(
      collection(firestore, COLLECTIONS.USERS),
      where('profile.isAgroUser', '==', true),
      where('networkRural.isActive', '==', true),
      where('status', '==', 'active')
    );

    const snapshot = await getDocs(q);
    
    let profiles: NetworkProfile[] = [];

    snapshot.forEach((doc) => {
      const userData = doc.data() as FirebaseUser;
      
      // Não incluir o próprio usuário
      if (doc.id === currentUserId) return;
      
      // Aplicar filtros
      if (filters?.agroAreas?.length) {
        const userAreas = userData.profile.agroAreas || [];
        const hasMatch = filters.agroAreas.some((area) => userAreas.includes(area));
        if (!hasMatch) return;
      }
      
      if (filters?.hasLinkedIn && !userData.networkRural.linkedIn?.isVerified) {
        return;
      }
      
      if (filters?.goals?.length) {
        const userGoals = userData.networkRural.goals || [];
        const hasMatch = filters.goals.some((goal) => userGoals.includes(goal));
        if (!hasMatch) return;
      }
      
      profiles.push({
        userId: doc.id,
        name: userData.profile.name,
        photo: userData.profile.photos[0] || '',
        occupation: userData.profile.occupation,
        city: userData.profile.city,
        state: userData.profile.state,
        agroAreas: userData.profile.agroAreas || [],
        linkedIn: userData.networkRural.linkedIn,
        goals: userData.networkRural.goals,
        lookingFor: userData.networkRural.lookingFor,
        isActive: true,
      });
    });

    return profiles;
  } catch (error) {
    console.error('Erro ao buscar perfis do Network:', error);
    return [];
  }
}

// =============================================================================
// 🤝 CONEXÕES
// =============================================================================

/**
 * Cria conexão de networking
 */
export async function createConnection(
  request: ConnectionRequest
): Promise<{ success: boolean; connectionId?: string; chatId?: string; error?: string }> {
  try {
    const { fromUserId, toUserId, connectionType } = request;

    // Verificar se já existe conexão
    const existingConnection = await getConnectionBetweenUsers(fromUserId, toUserId);
    if (existingConnection) {
      return { 
        success: true, 
        connectionId: existingConnection.id,
        chatId: existingConnection.chatId 
      };
    }

    // Criar chat para a conexão
    const chat = await createNetworkChat(fromUserId, toUserId);

    // Criar conexão
    const connectionData: Omit<NetworkConnection, 'id'> = {
      users: [fromUserId, toUserId].sort() as [string, string],
      createdAt: Timestamp.now(),
      chatId: chat.id,
      connectionType,
      isActive: true,
    };

    const connectionRef = await addDoc(
      collection(firestore, COLLECTIONS.NETWORK_CONNECTIONS),
      connectionData
    );

    return {
      success: true,
      connectionId: connectionRef.id,
      chatId: chat.id,
    };
  } catch (error: any) {
    console.error('Erro ao criar conexão:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Obtém conexão entre dois usuários
 */
export async function getConnectionBetweenUsers(
  userId1: string,
  userId2: string
): Promise<NetworkConnection | null> {
  try {
    const users = [userId1, userId2].sort() as [string, string];
    
    const q = query(
      collection(firestore, COLLECTIONS.NETWORK_CONNECTIONS),
      where('users', '==', users),
      where('isActive', '==', true)
    );

    const snapshot = await getDocs(q);
    
    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    return { ...doc.data(), id: doc.id } as NetworkConnection;
  } catch (error) {
    console.error('Erro ao buscar conexão:', error);
    return null;
  }
}

/**
 * Obtém todas as conexões do usuário
 */
export async function getUserConnections(userId: string): Promise<NetworkConnection[]> {
  try {
    const q = query(
      collection(firestore, COLLECTIONS.NETWORK_CONNECTIONS),
      where('users', 'array-contains', userId),
      where('isActive', '==', true)
    );

    const snapshot = await getDocs(q);
    
    return snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }) as NetworkConnection);
  } catch (error) {
    console.error('Erro ao buscar conexões:', error);
    return [];
  }
}

/**
 * Remove conexão
 */
export async function removeConnection(connectionId: string): Promise<void> {
  try {
    await updateDoc(doc(firestore, COLLECTIONS.NETWORK_CONNECTIONS, connectionId), {
      isActive: false,
    });
  } catch (error) {
    console.error('Erro ao remover conexão:', error);
    throw error;
  }
}

// =============================================================================
// 🔗 LINKEDIN INTEGRATION
// =============================================================================

/**
 * Atualiza dados do LinkedIn
 */
export async function updateLinkedInProfile(
  userId: string,
  linkedInData: LinkedInProfile
): Promise<void> {
  try {
    await updateDoc(doc(firestore, COLLECTIONS.USERS, userId), {
      'networkRural.linkedIn': {
        ...linkedInData,
        lastSync: serverTimestamp(),
      },
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Erro ao atualizar LinkedIn:', error);
    throw error;
  }
}

/**
 * Remove integração com LinkedIn
 */
export async function removeLinkedInIntegration(userId: string): Promise<void> {
  try {
    await updateDoc(doc(firestore, COLLECTIONS.USERS, userId), {
      'networkRural.linkedIn': null,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Erro ao remover LinkedIn:', error);
    throw error;
  }
}

// =============================================================================
// ⚙️ CONFIGURAÇÕES DO NETWORK
// =============================================================================

/**
 * Atualiza configurações do Network Rural
 */
export async function updateNetworkSettings(
  userId: string,
  settings: {
    goals?: string[];
    lookingFor?: string[];
  }
): Promise<void> {
  try {
    const updates: Record<string, any> = {
      updatedAt: serverTimestamp(),
    };

    if (settings.goals !== undefined) {
      updates['networkRural.goals'] = settings.goals;
    }

    if (settings.lookingFor !== undefined) {
      updates['networkRural.lookingFor'] = settings.lookingFor;
    }

    await updateDoc(doc(firestore, COLLECTIONS.USERS, userId), updates);
  } catch (error) {
    console.error('Erro ao atualizar configurações do Network:', error);
    throw error;
  }
}

// =============================================================================
// 📡 LISTENERS
// =============================================================================

/**
 * Escuta conexões em tempo real
 */
export function subscribeToConnections(
  userId: string,
  callback: (connections: NetworkConnection[]) => void
): () => void {
  const q = query(
    collection(firestore, COLLECTIONS.NETWORK_CONNECTIONS),
    where('users', 'array-contains', userId),
    where('isActive', '==', true)
  );

  return onSnapshot(q, (snapshot) => {
    const connections = snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }) as NetworkConnection);
    callback(connections);
  }, (error) => {
    console.error('Erro no listener de conexões:', error);
    callback([]);
  });
}

// =============================================================================
// 📤 EXPORTS
// =============================================================================

export type { NetworkConnection };
