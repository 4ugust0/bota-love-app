/**
 * 🛒 Serviço de Itens da Loja - Bota Love
 * 
 * Gerencia os itens avulsos disponíveis para compra
 * Collection: itens_avulso
 */

import { firestore } from '@/firebase/config';
import {
    collection,
    doc,
    getDoc,
    getDocs,
    increment,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
    where,
} from 'firebase/firestore';

// =============================================================================
// TIPOS
// =============================================================================

export type ItemType =
  | 'super_like'
  | 'boost'
  | 'rewind'
  | 'see_likes'
  | 'unlimited_likes'
  | 'read_receipts'
  | 'priority_likes'
  | 'incognito'
  | 'spotlight'
  | 'checkin_agro'
  | 'correio_da_roca'
  | 'misterio_do_campo'
  | 'bota_no_evento'
  | 'passaporte_rural'
  | 'other';

export type ItemStatus = 'active' | 'inactive' | 'promotion';

export interface PricePackage {
  quantity: number;
  price: number; // em centavos
}

export interface StoreItem {
  id: string;
  name: string;
  description: string;
  type: ItemType;
  pricePackages: PricePackage[];
  // Campos legados
  price?: number;
  quantity?: number;
  // Visual
  icon?: string;
  color?: string;
  badgeText?: string;
  // Status e ordenacao
  status: ItemStatus;
  order: number;
  // Estatisticas
  totalSales: number;
  // Timestamps
  createdAt: any;
  updatedAt: any;
}

export interface PricePackageWithSavings extends PricePackage {
  unitPrice: number;
  savingsPercent: number;
}

// =============================================================================
// LABELS E TRADUCOES
// =============================================================================

export const itemTypeLabels: Record<ItemType, string> = {
  super_like: 'Super Agro',
  boost: 'Assobios do Peão (Boost)',
  rewind: 'Retorno da Estrada Livre',
  see_likes: 'Olhar do Campo',
  unlimited_likes: 'Curtidas Ilimitadas',
  read_receipts: 'Confirmação de Leitura',
  priority_likes: 'Likes Prioritários',
  incognito: 'Modo Incógnito',
  spotlight: 'Destaque Rural',
  checkin_agro: 'Checkin Agro Premium',
  correio_da_roca: 'Correio da Roça',
  misterio_do_campo: 'Mistério do Campo',
  bota_no_evento: 'Bota no Evento',
  passaporte_rural: 'Passaporte Rural',
  other: 'Outro',
};

export const itemTypeIcons: Record<ItemType, string> = {
  super_like: 'star',
  boost: 'rocket',
  rewind: 'refresh',
  see_likes: 'eye',
  unlimited_likes: 'heart',
  read_receipts: 'checkmark-done',
  priority_likes: 'flash',
  incognito: 'eye-off',
  spotlight: 'sparkles',
  checkin_agro: 'location',
  correio_da_roca: 'mail',
  misterio_do_campo: 'help-circle',
  bota_no_evento: 'calendar',
  passaporte_rural: 'globe',
  other: 'cube',
};

export const itemTypeColors: Record<ItemType, string> = {
  super_like: '#5DADE2',
  boost: '#9B59B6',
  rewind: '#F39C12',
  see_likes: '#E74C3C',
  unlimited_likes: '#E91E63',
  read_receipts: '#27AE60',
  priority_likes: '#FF6B35',
  incognito: '#607D8B',
  spotlight: '#D4AD63',
  checkin_agro: '#2ECC71',
  correio_da_roca: '#3498DB',
  misterio_do_campo: '#8E44AD',
  bota_no_evento: '#E67E22',
  passaporte_rural: '#1ABC9C',
  other: '#95A5A6',
};

// =============================================================================
// FUNCOES AUXILIARES
// =============================================================================

/**
 * Formata preco de centavos para Real
 */
export const formatPrice = (cents: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100);
};

/**
 * Calcula economia dos pacotes
 */
export const calculateSavings = (packages: PricePackage[]): PricePackageWithSavings[] => {
  // Verificação de segurança
  if (!packages || !Array.isArray(packages) || packages.length < 1) return [];

  // Ordenar por quantidade
  const sorted = [...packages].sort((a, b) => a.quantity - b.quantity);

  // Preco por unidade do menor pacote
  const baseUnitPrice = sorted[0].price / sorted[0].quantity;

  return sorted.map((pkg) => {
    const unitPrice = pkg.price / pkg.quantity;
    const savingsPercent = Math.round((1 - unitPrice / baseUnitPrice) * 100);
    return {
      ...pkg,
      unitPrice,
      savingsPercent: savingsPercent > 0 ? savingsPercent : 0,
    };
  });
};

/**
 * Obtem o icone padrao para um tipo de item
 */
export const getItemIcon = (item: StoreItem): string => {
  if (item.icon) return item.icon;
  return itemTypeIcons[item.type] || 'cube';
};

/**
 * Obtem a cor padrao para um tipo de item
 */
export const getItemColor = (item: StoreItem): string => {
  if (item.color) return item.color;
  return itemTypeColors[item.type] || '#95A5A6';
};

// =============================================================================
// SERVICOS FIREBASE
// =============================================================================

const COLLECTION_NAME = 'itens_avulso';

/**
 * Busca todos os itens ativos da loja
 */
export const getActiveStoreItems = async (): Promise<StoreItem[]> => {
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
    })) as StoreItem[];
  } catch (error) {
    console.error('Erro ao buscar itens da loja:', error);
    return [];
  }
};

/**
 * Busca um item especifico por ID
 */
export const getStoreItemById = async (itemId: string): Promise<StoreItem | null> => {
  try {
    const docRef = doc(firestore, COLLECTION_NAME, itemId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as StoreItem;
    }

    return null;
  } catch (error) {
    console.error('Erro ao buscar item:', error);
    return null;
  }
};

/**
 * Busca itens por tipo
 */
export const getStoreItemsByType = async (type: ItemType): Promise<StoreItem[]> => {
  try {
    const q = query(
      collection(firestore, COLLECTION_NAME),
      where('type', '==', type),
      where('status', 'in', ['active', 'promotion']),
      orderBy('order', 'asc')
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as StoreItem[];
  } catch (error) {
    console.error('Erro ao buscar itens por tipo:', error);
    return [];
  }
};

/**
 * Incrementa o contador de vendas de um item
 */
export const incrementItemSales = async (itemId: string, quantity: number = 1): Promise<void> => {
  try {
    const docRef = doc(firestore, COLLECTION_NAME, itemId);
    await updateDoc(docRef, {
      totalSales: increment(quantity),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Erro ao incrementar vendas:', error);
  }
};

// =============================================================================
// DADOS MOCK (para desenvolvimento/fallback)
// =============================================================================

export const MOCK_STORE_ITEMS: StoreItem[] = [
  {
    id: 'super_agro_1',
    name: 'Super Agro',
    description: 'Mostre que você está muito interessado! A pessoa vai saber que você deu um Super Agro antes de decidir!',
    type: 'super_like',
    pricePackages: [
      { quantity: 3, price: 1490 },
      { quantity: 10, price: 3990 },
      { quantity: 25, price: 7990 },
    ],
    color: '#5DADE2',
    badgeText: 'POPULAR',
    status: 'active',
    order: 1,
    totalSales: 150,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'olhar_do_campo_1',
    name: 'Olhar do Campo',
    description: 'Mostra quem já reparou em você e deixou seu like!',
    type: 'see_likes',
    pricePackages: [
      { quantity: 1, price: 4990 },
      { quantity: 3, price: 11990 },
      { quantity: 7, price: 19990 },
    ],
    color: '#E74C3C',
    status: 'active',
    order: 2,
    totalSales: 200,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'checkin_agro_1',
    name: 'Checkin Agro',
    description: 'Registre sua presença em um Evento Agro e apareça em evidência para quem também está por lá!',
    type: 'checkin_agro',
    pricePackages: [
      { quantity: 1, price: 990 },
      { quantity: 5, price: 4490 },
      { quantity: 10, price: 7990 },
    ],
    color: '#2ECC71',
    badgeText: 'NOVO',
    status: 'active',
    order: 3,
    totalSales: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'voltar_perfil_1',
    name: 'Voltar Perfil',
    description: 'Passou sem querer? Use para voltar ao perfil anterior e dar outra chance!',
    type: 'rewind',
    pricePackages: [
      { quantity: 5, price: 990 },
      { quantity: 15, price: 2490 },
      { quantity: 30, price: 3990 },
    ],
    color: '#F39C12',
    status: 'active',
    order: 4,
    totalSales: 45,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'destaque_rural_1',
    name: 'Destaque Rural',
    description: 'Seu perfil fica com borda dourada e aparece em destaque por 24 horas!',
    type: 'spotlight',
    pricePackages: [
      { quantity: 1, price: 4990 },
      { quantity: 3, price: 11990 },
      { quantity: 5, price: 17990 },
    ],
    color: '#D4AD63',
    badgeText: 'PREMIUM',
    status: 'active',
    order: 5,
    totalSales: 30,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'correio_da_roca_1',
    name: 'Correio da Roça',
    description: 'Envie uma mensagem para alguém antes do match! Mostre seu interesse de forma criativa.',
    type: 'correio_da_roca',
    pricePackages: [
      { quantity: 3, price: 1490 },
      { quantity: 10, price: 3990 },
      { quantity: 25, price: 7990 },
    ],
    color: '#3498DB',
    badgeText: 'NOVO',
    status: 'active',
    order: 6,
    totalSales: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'misterio_do_campo_1',
    name: 'Mistério do Campo',
    description: 'Envie uma mensagem anônima com sua foto desfocada. A pessoa pode revelar por R$1,99 ou aguardar 24h!',
    type: 'misterio_do_campo',
    pricePackages: [
      { quantity: 1, price: 490 },
      { quantity: 5, price: 1990 },
      { quantity: 10, price: 2990 },
    ],
    color: '#8E44AD',
    badgeText: 'EXCLUSIVO',
    status: 'active',
    order: 7,
    totalSales: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'bota_no_evento_1',
    name: 'Bota no Evento',
    description: 'Marque presença antecipada em eventos agro e seja notificado quando outros participantes confirmarem!',
    type: 'bota_no_evento',
    pricePackages: [
      { quantity: 3, price: 990 },
      { quantity: 10, price: 2490 },
      { quantity: 20, price: 3990 },
    ],
    color: '#E67E22',
    status: 'active',
    order: 8,
    totalSales: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'assobios_do_peao_1',
    name: 'Assobios do Peão (Boost)',
    description: 'Destaque seu perfil por 1 hora! Apareça para muito mais pessoas e aumente suas chances de match.',
    type: 'boost',
    pricePackages: [
      { quantity: 1, price: 1990 },
      { quantity: 5, price: 7990 },
      { quantity: 10, price: 12990 },
    ],
    color: '#9B59B6',
    badgeText: 'DESTAQUE',
    status: 'active',
    order: 9,
    totalSales: 25,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'passaporte_rural_1',
    name: 'Passaporte Rural',
    description: 'Explore perfis de qualquer região do Brasil! Encontre pessoas além da sua área.',
    type: 'passaporte_rural',
    pricePackages: [
      { quantity: 1, price: 2990 },
      { quantity: 7, price: 14990 },
      { quantity: 30, price: 39990 },
    ],
    color: '#1ABC9C',
    status: 'active',
    order: 10,
    totalSales: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'retorno_estrada_1',
    name: 'Retorno da Estrada Livre',
    description: 'Voltou atrás? Use para desfazer seu último passe e dar outra chance ao perfil.',
    type: 'rewind',
    pricePackages: [
      { quantity: 5, price: 990 },
      { quantity: 15, price: 2490 },
      { quantity: 30, price: 3990 },
    ],
    color: '#F39C12',
    status: 'active',
    order: 11,
    totalSales: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];
