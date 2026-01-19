/**
 * Extensão do modelo User para suportar abas e filtros avançados
 */

import { ProfileVisibility, SubscriptionTier, UserTab } from './tabsAndFiltersService';

export interface ExtendedUserProfile {
  // Informações de Aba e Visibilidade
  userTab: UserTab; // Qual aba o usuário pertence
  profileVisibility: ProfileVisibility; // Onde o perfil aparece
  subscriptionTier: SubscriptionTier; // Plano contratado
  
  // Informações Adicionais para Filtros
  height?: number; // cm
  education?: string; // 'fundamental', 'medio', 'superior', 'pos_graduacao'
  income?: number; // Renda mensal
  hasChildren?: boolean;
  wantsChildren?: boolean;
  smoking?: boolean;
  drinking?: 'nunca' | 'socialmente' | 'frequentemente';
  
  // Informações Rurais Detalhadas
  ruralActivities?: string[]; // ['Pecuária', 'Agricultura', 'Veterinária']
  propertyType?: string[]; // ['Fazenda', 'Sítio', 'Chácara']
  animals?: string[]; // ['Bovinos', 'Equinos', 'Suínos']
  crops?: string[]; // ['Milho', 'Soja', 'Café']
  
  // Estilo de Vida e Interesses
  musicalStyle?: string[]; // ['Sertanejo', 'Modão', 'Universitário']
  hobbies?: string[]; // ['Rodeio', 'Pescaria', 'Cavalgada']
  lifestyle?: string[]; // ['Rural', 'Urbano', 'Híbrido']
  
  // Network (apenas para Sou Agro)
  professionalArea?: string[]; // ['Agronegócio', 'Pecuária', 'Tecnologia Rural']
  networkGoals?: string[]; // ['Parceria', 'Investimento', 'Conhecimento']
  companyRole?: string; // 'Proprietário', 'Gerente', 'Consultor'
  
  // Coordenadas para cálculo de distância
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

/**
 * Dados mockados estendidos
 */
export const EXTENDED_USER_PROFILES: Record<string, ExtendedUserProfile> = {
  'user-0': {
    userTab: 'sou_agro',
    profileVisibility: 'both',
    subscriptionTier: 'ouro',
    height: 178,
    education: 'superior',
    income: 15000,
    hasChildren: false,
    wantsChildren: true,
    smoking: false,
    drinking: 'socialmente',
    ruralActivities: ['Pecuária', 'Veterinária'],
    propertyType: ['Fazenda'],
    animals: ['Bovinos', 'Equinos'],
    crops: ['Milho', 'Soja'],
    musicalStyle: ['Sertanejo', 'Modão'],
    hobbies: ['Rodeio', 'Cavalgada', 'Churrasco'],
    lifestyle: ['Rural'],
    professionalArea: ['Veterinária', 'Pecuária de Corte'],
    networkGoals: ['Parceria', 'Conhecimento'],
    companyRole: 'Proprietário',
    coordinates: { latitude: -16.6869, longitude: -49.2648 }, // Goiânia
  },
  'user-1': {
    userTab: 'sou_agro',
    profileVisibility: 'both',
    subscriptionTier: 'prata',
    height: 165,
    education: 'superior',
    income: 8000,
    hasChildren: false,
    wantsChildren: true,
    smoking: false,
    drinking: 'socialmente',
    ruralActivities: ['Agronomia', 'Equitação'],
    propertyType: ['Fazenda', 'Haras'],
    animals: ['Equinos', 'Bovinos'],
    crops: ['Café', 'Pastagem'],
    musicalStyle: ['Sertanejo'],
    hobbies: ['Rodeio', 'Equitação'],
    lifestyle: ['Rural', 'Híbrido'],
    professionalArea: ['Agronomia', 'Consultoria Rural'],
    networkGoals: ['Conhecimento', 'Parceria'],
    companyRole: 'Consultora',
    coordinates: { latitude: -16.6869, longitude: -49.2648 },
  },
  'user-2': {
    userTab: 'sou_agro',
    profileVisibility: 'sou_agro',
    subscriptionTier: 'diamante',
    height: 182,
    education: 'medio',
    income: 25000,
    hasChildren: true,
    wantsChildren: false,
    smoking: false,
    drinking: 'frequentemente',
    ruralActivities: ['Pecuária', 'Agricultura'],
    propertyType: ['Fazenda'],
    animals: ['Bovinos', 'Suínos'],
    crops: ['Soja', 'Milho', 'Algodão'],
    musicalStyle: ['Sertanejo', 'Modão'],
    hobbies: ['Churrasco', 'Pescaria'],
    lifestyle: ['Rural'],
    professionalArea: ['Produção Rural', 'Agronegócio'],
    networkGoals: ['Investimento', 'Parceria'],
    companyRole: 'Proprietário',
    coordinates: { latitude: -17.7944, longitude: -50.9222 }, // Rio Verde
  },
  'user-3': {
    userTab: 'simpatizantes',
    profileVisibility: 'simpatizantes',
    subscriptionTier: 'prata',
    height: 168,
    education: 'superior',
    income: 6000,
    hasChildren: false,
    wantsChildren: true,
    smoking: false,
    drinking: 'socialmente',
    ruralActivities: ['Zootecnia'],
    propertyType: [],
    animals: ['Bovinos', 'Equinos'],
    crops: [],
    musicalStyle: ['Sertanejo', 'Universitário'],
    hobbies: ['Rodeio', 'Festas'],
    lifestyle: ['Híbrido'],
    coordinates: { latitude: -18.9189, longitude: -48.2772 }, // Uberlândia
  },
  'user-4': {
    userTab: 'simpatizantes',
    profileVisibility: 'both',
    subscriptionTier: 'bronze',
    height: 172,
    education: 'superior',
    income: 5000,
    hasChildren: false,
    wantsChildren: true,
    smoking: false,
    drinking: 'socialmente',
    ruralActivities: [],
    propertyType: [],
    animals: [],
    crops: [],
    musicalStyle: ['Sertanejo'],
    hobbies: ['Shows', 'Festivais'],
    lifestyle: ['Urbano'],
    coordinates: { latitude: -15.7942, longitude: -47.8825 }, // Brasília
  },
};

/**
 * Helper para obter perfil estendido do usuário
 */
export function getExtendedProfile(userId: string): ExtendedUserProfile | undefined {
  return EXTENDED_USER_PROFILES[userId];
}

/**
 * Calcula distância entre duas coordenadas (fórmula de Haversine)
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
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance);
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Filtra usuários por aba respeitando visibilidade
 */
export function filterUsersByTab(
  users: string[],
  viewerTab: UserTab
): string[] {
  return users.filter((userId) => {
    const profile = getExtendedProfile(userId);
    if (!profile) return false;
    
    // Se viewer está em "both", pode ver todos
    if (viewerTab === 'both') return true;
    
    // Se profile está em "both", todos podem ver
    if (profile.profileVisibility === 'both') return true;
    
    // Caso contrário, só pode ver se estiver na mesma aba
    return profile.profileVisibility === viewerTab;
  });
}

/**
 * Exemplo de aplicação de filtros avançados
 */
export function applyAdvancedFilters(
  userIds: string[],
  filters: any,
  viewerCoordinates?: { latitude: number; longitude: number }
): string[] {
  return userIds.filter((userId) => {
    const profile = getExtendedProfile(userId);
    if (!profile) return false;
    
    // Filtro de distância
    if (filters.maxDistance && viewerCoordinates && profile.coordinates) {
      const distance = calculateDistance(
        viewerCoordinates.latitude,
        viewerCoordinates.longitude,
        profile.coordinates.latitude,
        profile.coordinates.longitude
      );
      if (distance > filters.maxDistance) return false;
    }
    
    // Filtro de altura
    if (filters.minHeight && profile.height && profile.height < filters.minHeight) {
      return false;
    }
    if (filters.maxHeight && profile.height && profile.height > filters.maxHeight) {
      return false;
    }
    
    // Filtro de educação
    if (filters.education && filters.education.length > 0) {
      if (!profile.education || !filters.education.includes(profile.education)) {
        return false;
      }
    }
    
    // Filtro de atividades rurais
    if (filters.ruralActivities && filters.ruralActivities.length > 0) {
      if (!profile.ruralActivities || profile.ruralActivities.length === 0) {
        return false;
      }
      const hasMatch = filters.ruralActivities.some((activity: string) =>
        profile.ruralActivities?.includes(activity)
      );
      if (!hasMatch) return false;
    }
    
    // Filtro de animais
    if (filters.animals && filters.animals.length > 0) {
      if (!profile.animals || profile.animals.length === 0) {
        return false;
      }
      const hasMatch = filters.animals.some((animal: string) =>
        profile.animals?.includes(animal)
      );
      if (!hasMatch) return false;
    }
    
    // Filtro de filhos
    if (filters.hasChildren !== undefined) {
      if (profile.hasChildren !== filters.hasChildren) {
        return false;
      }
    }
    
    // Filtro de smoking
    if (filters.smoking !== undefined) {
      if (profile.smoking !== filters.smoking) {
        return false;
      }
    }
    
    return true;
  });
}
