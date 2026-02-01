/**
 * 🎯 Serviço de Planos Premium - Bota Love
 * 
 * Gerencia os planos de assinatura disponíveis
 * Collection: plans
 */

import { firestore } from '@/firebase/config';
import {
    collection,
    doc,
    getDoc,
    getDocs,
    orderBy,
    query,
    where,
} from 'firebase/firestore';

// =============================================================================
// TIPOS
// =============================================================================

export type PlanCategory = 'sou_agro' | 'simpatizante_agro' | 'all';
export type PlanStatus = 'active' | 'inactive' | 'promotion';
export type RenewalType = 'per_period' | 'once' | 'unlimited';

export interface IncludedItem {
  itemId: string;
  itemName: string;
  quantity: number;
  renewalType: RenewalType;
}

export interface PlanLimits {
  dailyLikes: number; // -1 = ilimitado
  dailySuperLikes: number;
  dailyBoosts: number;
  dailyRewinds: number;
  seeWhoLikesYou: boolean;
  advancedFilters: boolean;
  incognitoMode: boolean;
  readReceipts: boolean;
  noAds: boolean;
  prioritySupport: boolean;
}

export interface PlanPrices {
  monthly: number; // em centavos
  quarterly: number;
  yearly: number;
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  shortDescription?: string;
  category: PlanCategory;
  // Visual
  icon?: string;
  color?: string;
  badgeText?: string;
  // Preços
  prices: PlanPrices;
  originalPrices?: PlanPrices;
  // Benefícios
  benefits: string[];
  includedItems: IncludedItem[];
  limits: PlanLimits;
  // Trial
  trialDays: number;
  // Status e ordenação
  status: PlanStatus;
  order: number;
  isFeatured: boolean;
  // Stats
  totalSubscribers: number;
  // Timestamps
  createdAt: any;
  updatedAt: any;
}

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Formata preço de centavos para Real
 */
export const formatPlanPrice = (cents: number): string => {
  if (cents === 0) return 'Grátis';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100);
};

/**
 * Retorna o texto do limite
 */
export const getLimitText = (value: number): string => {
  if (value === -1) return 'Ilimitado';
  if (value === 0) return 'Não incluído';
  return `${value}/dia`;
};

/**
 * Cores padrão para categorias
 */
export const categoryColors: Record<PlanCategory, string> = {
  sou_agro: '#2ECC71',
  simpatizante_agro: '#8b5cf6',
  all: '#D4AD63',
};

/**
 * Labels das categorias
 */
export const categoryLabels: Record<PlanCategory, string> = {
  sou_agro: 'Sou Agro',
  simpatizante_agro: 'Simpatizante Agro',
  all: 'Todos',
};

// =============================================================================
// SERVIÇOS FIREBASE
// =============================================================================

const COLLECTION_NAME = 'plans';

/**
 * Busca todos os planos ativos
 */
export const getActivePlans = async (): Promise<Plan[]> => {
  try {
    const q = query(
      collection(firestore, COLLECTION_NAME),
      where('status', 'in', ['active', 'promotion']),
      orderBy('order', 'asc')
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Plan[];
  } catch (error) {
    console.error('Erro ao buscar planos:', error);
    return [];
  }
};

/**
 * Busca planos por categoria
 */
export const getPlansByCategory = async (category: PlanCategory): Promise<Plan[]> => {
  try {
    // Busca planos da categoria específica OU planos para "all"
    const q = query(
      collection(firestore, COLLECTION_NAME),
      where('status', 'in', ['active', 'promotion']),
      orderBy('order', 'asc')
    );

    const snapshot = await getDocs(q);

    const plans = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Plan[];

    // Filtra por categoria (aceita a categoria específica ou 'all')
    return plans.filter(
      (plan) => plan.category === category || plan.category === 'all'
    );
  } catch (error) {
    console.error('Erro ao buscar planos por categoria:', error);
    return [];
  }
};

/**
 * Busca um plano específico por ID
 */
export const getPlanById = async (planId: string): Promise<Plan | null> => {
  try {
    const docRef = doc(firestore, COLLECTION_NAME, planId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as Plan;
    }

    return null;
  } catch (error) {
    console.error('Erro ao buscar plano:', error);
    return null;
  }
};

/**
 * Busca o plano em destaque para uma categoria
 */
export const getFeaturedPlan = async (category: PlanCategory): Promise<Plan | null> => {
  try {
    const plans = await getPlansByCategory(category);
    return plans.find((plan) => plan.isFeatured) || plans[0] || null;
  } catch (error) {
    console.error('Erro ao buscar plano em destaque:', error);
    return null;
  }
};

// =============================================================================
// DADOS MOCK (para desenvolvimento/fallback)
// =============================================================================

export const MOCK_PLANS: Plan[] = [
  {
    id: 'paixao_sertaneja',
    name: 'Paixão Sertaneja',
    description: 'Para quem vive o agro de coração',
    shortDescription: 'O plano ideal para começar',
    category: 'simpatizante_agro',
    color: '#8b5cf6',
    prices: {
      monthly: 9990,
      quarterly: 24990,
      yearly: 89990,
    },
    benefits: [
      'Likes ilimitados',
      'Ver quem curtiu você',
      'Filtros avançados',
      'Sem anúncios',
    ],
    includedItems: [
      { itemId: '1', itemName: 'Super Agro', quantity: 5, renewalType: 'per_period' },
      { itemId: '2', itemName: 'Checkin Agro Premium', quantity: 5, renewalType: 'per_period' },
      { itemId: '3', itemName: 'Correio da Roça', quantity: 5, renewalType: 'per_period' },
    ],
    limits: {
      dailyLikes: -1,
      dailySuperLikes: 5,
      dailyBoosts: 1,
      dailyRewinds: -1,
      seeWhoLikesYou: true,
      advancedFilters: true,
      incognitoMode: false,
      readReceipts: true,
      noAds: true,
      prioritySupport: false,
    },
    trialDays: 7,
    status: 'active',
    order: 1,
    isFeatured: true,
    totalSubscribers: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'rei_da_porteira',
    name: 'Rei da Porteira',
    description: 'Para o verdadeiro homem do campo',
    shortDescription: 'Recursos premium exclusivos',
    category: 'sou_agro',
    color: '#2ECC71',
    prices: {
      monthly: 14990,
      quarterly: 39990,
      yearly: 129990,
    },
    originalPrices: {
      monthly: 19990,
      quarterly: 49990,
      yearly: 159990,
    },
    benefits: [
      'Tudo do Paixão Sertaneja',
      'Modo Incógnito',
      'Suporte Prioritário',
      'Boost diário grátis',
    ],
    includedItems: [
      { itemId: '1', itemName: 'Super Agro', quantity: 10, renewalType: 'per_period' },
      { itemId: '2', itemName: 'Checkin Agro Premium', quantity: 10, renewalType: 'per_period' },
      { itemId: '3', itemName: 'Correio da Roça', quantity: 10, renewalType: 'per_period' },
      { itemId: '4', itemName: 'Olhar do Campo', quantity: 5, renewalType: 'per_period' },
    ],
    limits: {
      dailyLikes: -1,
      dailySuperLikes: 10,
      dailyBoosts: 3,
      dailyRewinds: -1,
      seeWhoLikesYou: true,
      advancedFilters: true,
      incognitoMode: true,
      readReceipts: true,
      noAds: true,
      prioritySupport: true,
    },
    trialDays: 7,
    status: 'active',
    order: 2,
    isFeatured: true,
    totalSubscribers: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];
