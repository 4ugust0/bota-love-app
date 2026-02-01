/**
 * 🎯 Serviço de Assinatura de Planos - Bota Love
 * 
 * Gerencia as assinaturas dos usuários aos planos:
 * - Registra assinatura com data de início e fim
 * - Gerencia itens incluídos no plano
 * - Verifica expiração e renova/cancela automaticamente
 * 
 * @author Bota Love Team
 */

import { firestore } from '@/firebase/config';
import {
    addDoc,
    collection,
    doc,
    getDoc,
    getDocs,
    increment,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
    Timestamp,
    updateDoc,
    where,
} from 'firebase/firestore';
import { getPlanById, IncludedItem } from './plansService';

// =============================================================================
// TIPOS
// =============================================================================

export type SubscriptionPeriod = 'monthly' | 'quarterly' | 'yearly';
export type UserSubscriptionStatus = 'active' | 'expired' | 'cancelled' | 'pending' | 'trial';

export interface UserPlanSubscription {
  id: string;
  
  // Referências
  userId: string;
  planId: string;
  planName: string;
  planCategory: string;
  
  // Período
  period: SubscriptionPeriod;
  
  // Datas
  startDate: Timestamp;
  endDate: Timestamp;
  trialEndDate?: Timestamp;
  cancelledAt?: Timestamp;
  
  // Status
  status: UserSubscriptionStatus;
  autoRenew: boolean;
  
  // Pagamento
  price: number; // em centavos
  lastPaymentId?: string;
  lastPaymentDate?: Timestamp;
  
  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface UserInventoryItem {
  itemId: string;
  itemName: string;
  quantity: number; // quantidade disponível
  renewalType: 'per_period' | 'once' | 'unlimited';
  lastRenewedAt?: Timestamp;
}

export interface UserInventory {
  userId: string;
  items: UserInventoryItem[];
  updatedAt: Timestamp;
}

export interface SubscriptionResult {
  success: boolean;
  subscriptionId?: string;
  subscription?: UserPlanSubscription;
  error?: string;
}

export interface PaymentRecord {
  id?: string;
  userId: string;
  subscriptionId: string;
  planId: string;
  planName: string;
  period: SubscriptionPeriod;
  amount: number; // centavos
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: 'pix' | 'credit_card' | 'simulated';
  isSimulated: boolean;
  simulationNotes?: string;
  transactionId?: string;
  createdAt: Timestamp;
  completedAt?: Timestamp;
}

// =============================================================================
// CONSTANTES
// =============================================================================

const SUBSCRIPTIONS_COLLECTION = 'user_subscriptions';
const INVENTORY_COLLECTION = 'user_inventory';
const PAYMENTS_COLLECTION = 'payments';

/**
 * Duração em dias por período
 */
export const PERIOD_DAYS: Record<SubscriptionPeriod, number> = {
  monthly: 30,
  quarterly: 90,
  yearly: 365,
};

/**
 * Labels dos períodos
 */
export const PERIOD_LABELS: Record<SubscriptionPeriod, string> = {
  monthly: 'Mensal',
  quarterly: 'Trimestral',
  yearly: 'Anual',
};

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Calcula a data final baseada no período
 */
export const calculateEndDate = (startDate: Date, period: SubscriptionPeriod): Date => {
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + PERIOD_DAYS[period]);
  return endDate;
};

/**
 * Verifica se a assinatura está ativa
 */
export const isSubscriptionActive = (subscription: UserPlanSubscription): boolean => {
  if (subscription.status === 'cancelled' || subscription.status === 'expired') {
    return false;
  }
  
  const now = new Date();
  const endDate = subscription.endDate.toDate();
  
  return now < endDate;
};

/**
 * Calcula dias restantes da assinatura
 */
export const getDaysRemaining = (subscription: UserPlanSubscription): number => {
  const now = new Date();
  const endDate = subscription.endDate.toDate();
  const diffMs = endDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
};

/**
 * Formata preço de centavos para Real
 */
export const formatPrice = (cents: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100);
};

// =============================================================================
// SERVIÇOS DE ASSINATURA
// =============================================================================

/**
 * Busca a assinatura ativa do usuário
 */
export const getActiveSubscription = async (userId: string): Promise<UserPlanSubscription | null> => {
  try {
    const q = query(
      collection(firestore, SUBSCRIPTIONS_COLLECTION),
      where('userId', '==', userId),
      where('status', 'in', ['active', 'trial']),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return null;
    }

    const subscription = {
      id: snapshot.docs[0].id,
      ...snapshot.docs[0].data(),
    } as UserPlanSubscription;

    // Verificar se ainda está ativo
    if (!isSubscriptionActive(subscription)) {
      // Atualizar status para expirado
      await updateDoc(doc(firestore, SUBSCRIPTIONS_COLLECTION, subscription.id), {
        status: 'expired',
        updatedAt: serverTimestamp(),
      });
      return null;
    }

    return subscription;
  } catch (error) {
    console.error('Erro ao buscar assinatura ativa:', error);
    return null;
  }
};

/**
 * Busca histórico de assinaturas do usuário
 */
export const getSubscriptionHistory = async (userId: string): Promise<UserPlanSubscription[]> => {
  try {
    const q = query(
      collection(firestore, SUBSCRIPTIONS_COLLECTION),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as UserPlanSubscription[];
  } catch (error) {
    console.error('Erro ao buscar histórico de assinaturas:', error);
    return [];
  }
};

/**
 * Cria uma nova assinatura (simula pagamento)
 */
export const subscribeToPlan = async (
  userId: string,
  planId: string,
  period: SubscriptionPeriod
): Promise<SubscriptionResult> => {
  try {
    // 1. Buscar dados do plano
    const plan = await getPlanById(planId);
    if (!plan) {
      return { success: false, error: 'Plano não encontrado' };
    }

    // 2. Verificar se já tem assinatura ativa
    const existingSubscription = await getActiveSubscription(userId);
    if (existingSubscription) {
      return { 
        success: false, 
        error: 'Você já possui uma assinatura ativa. Cancele a atual antes de assinar um novo plano.' 
      };
    }

    // 3. Calcular preço baseado no período
    const price = plan.prices[period];
    if (!price || price === 0) {
      return { success: false, error: 'Preço não disponível para este período' };
    }

    // 4. Calcular datas
    const now = new Date();
    const startDate = Timestamp.fromDate(now);
    const endDate = Timestamp.fromDate(calculateEndDate(now, period));

    // 5. Criar registro de pagamento (SIMULADO)
    const paymentData: Omit<PaymentRecord, 'id'> = {
      userId,
      subscriptionId: '', // Será atualizado
      planId,
      planName: plan.name,
      period,
      amount: price,
      currency: 'BRL',
      status: 'completed', // Simulado como completo
      paymentMethod: 'simulated',
      isSimulated: true,
      simulationNotes: `Pagamento simulado para ${plan.name} (${PERIOD_LABELS[period]}) - ${formatPrice(price)}`,
      createdAt: Timestamp.now(),
      completedAt: Timestamp.now(),
    };

    const paymentRef = await addDoc(collection(firestore, PAYMENTS_COLLECTION), paymentData);

    // 6. Criar assinatura
    const subscriptionData: Omit<UserPlanSubscription, 'id'> = {
      userId,
      planId,
      planName: plan.name,
      planCategory: plan.category,
      period,
      startDate,
      endDate,
      status: 'active',
      autoRenew: true,
      price,
      lastPaymentId: paymentRef.id,
      lastPaymentDate: Timestamp.now(),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const subscriptionRef = await addDoc(
      collection(firestore, SUBSCRIPTIONS_COLLECTION),
      subscriptionData
    );

    // 7. Atualizar pagamento com ID da assinatura
    await updateDoc(paymentRef, {
      subscriptionId: subscriptionRef.id,
    });

    // 8. Adicionar itens ao inventário do usuário
    if (plan.includedItems && plan.includedItems.length > 0) {
      await addItemsToInventory(userId, plan.includedItems);
    }

    // 9. Atualizar documento do usuário com referência à assinatura
    await updateDoc(doc(firestore, 'users', userId), {
      'subscription.status': 'active',
      'subscription.plan': planId,
      'subscription.planName': plan.name,
      'subscription.startDate': startDate,
      'subscription.endDate': endDate,
      'subscription.autoRenew': true,
      'subscription.lastPaymentId': paymentRef.id,
      'subscription.subscriptionId': subscriptionRef.id,
      updatedAt: serverTimestamp(),
    });

    // 10. Incrementar contador de assinantes do plano
    await updateDoc(doc(firestore, 'plans', planId), {
      totalSubscribers: increment(1),
    });

    const subscription: UserPlanSubscription = {
      id: subscriptionRef.id,
      ...subscriptionData,
    };

    console.log('✅ Assinatura criada com sucesso:', {
      subscriptionId: subscriptionRef.id,
      planName: plan.name,
      period,
      startDate: now.toLocaleDateString('pt-BR'),
      endDate: calculateEndDate(now, period).toLocaleDateString('pt-BR'),
      price: formatPrice(price),
    });

    return {
      success: true,
      subscriptionId: subscriptionRef.id,
      subscription,
    };
  } catch (error: any) {
    console.error('Erro ao criar assinatura:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Cancela uma assinatura
 */
export const cancelSubscription = async (
  userId: string,
  subscriptionId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const subscriptionRef = doc(firestore, SUBSCRIPTIONS_COLLECTION, subscriptionId);
    const subscriptionSnap = await getDoc(subscriptionRef);

    if (!subscriptionSnap.exists()) {
      return { success: false, error: 'Assinatura não encontrada' };
    }

    const subscription = subscriptionSnap.data() as UserPlanSubscription;

    if (subscription.userId !== userId) {
      return { success: false, error: 'Sem permissão para cancelar esta assinatura' };
    }

    // Atualizar assinatura
    await updateDoc(subscriptionRef, {
      status: 'cancelled',
      autoRenew: false,
      cancelledAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Atualizar documento do usuário
    await updateDoc(doc(firestore, 'users', userId), {
      'subscription.status': 'cancelled',
      'subscription.autoRenew': false,
      updatedAt: serverTimestamp(),
    });

    console.log('✅ Assinatura cancelada:', subscriptionId);

    return { success: true };
  } catch (error: any) {
    console.error('Erro ao cancelar assinatura:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Verifica e atualiza status de assinaturas expiradas
 */
export const checkAndUpdateExpiredSubscriptions = async (userId: string): Promise<void> => {
  try {
    const q = query(
      collection(firestore, SUBSCRIPTIONS_COLLECTION),
      where('userId', '==', userId),
      where('status', '==', 'active')
    );

    const snapshot = await getDocs(q);

    for (const docSnap of snapshot.docs) {
      const subscription = docSnap.data() as UserPlanSubscription;
      const endDate = subscription.endDate.toDate();
      const now = new Date();

      if (now > endDate) {
        // Assinatura expirou
        await updateDoc(doc(firestore, SUBSCRIPTIONS_COLLECTION, docSnap.id), {
          status: 'expired',
          updatedAt: serverTimestamp(),
        });

        // Atualizar documento do usuário
        await updateDoc(doc(firestore, 'users', userId), {
          'subscription.status': 'expired',
          updatedAt: serverTimestamp(),
        });

        console.log('⏰ Assinatura expirada:', docSnap.id);
      }
    }
  } catch (error) {
    console.error('Erro ao verificar assinaturas expiradas:', error);
  }
};

// =============================================================================
// SERVIÇOS DE INVENTÁRIO
// =============================================================================

/**
 * Busca inventário do usuário
 */
export const getUserInventory = async (userId: string): Promise<UserInventoryItem[]> => {
  try {
    const docRef = doc(firestore, INVENTORY_COLLECTION, userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data() as UserInventory;
      return data.items || [];
    }

    return [];
  } catch (error) {
    console.error('Erro ao buscar inventário:', error);
    return [];
  }
};

/**
 * Adiciona itens ao inventário do usuário
 */
export const addItemsToInventory = async (
  userId: string,
  items: IncludedItem[]
): Promise<void> => {
  try {
    const docRef = doc(firestore, INVENTORY_COLLECTION, userId);
    const docSnap = await getDoc(docRef);

    let currentItems: UserInventoryItem[] = [];

    if (docSnap.exists()) {
      currentItems = (docSnap.data() as UserInventory).items || [];
    }

    // Adicionar ou atualizar itens
    for (const newItem of items) {
      const existingIndex = currentItems.findIndex((i) => i.itemId === newItem.itemId);

      if (existingIndex >= 0) {
        // Se o tipo de renovação for 'unlimited', manter
        if (newItem.renewalType === 'unlimited') {
          currentItems[existingIndex].quantity = -1; // -1 = ilimitado
        } else {
          // Adicionar quantidade
          currentItems[existingIndex].quantity += newItem.quantity;
        }
        currentItems[existingIndex].lastRenewedAt = Timestamp.now();
      } else {
        // Novo item
        currentItems.push({
          itemId: newItem.itemId,
          itemName: newItem.itemName,
          quantity: newItem.renewalType === 'unlimited' ? -1 : newItem.quantity,
          renewalType: newItem.renewalType,
          lastRenewedAt: Timestamp.now(),
        });
      }
    }

    // Salvar inventário
    await setDoc(docRef, {
      userId,
      items: currentItems,
      updatedAt: serverTimestamp(),
    });

    console.log('✅ Itens adicionados ao inventário:', items.map((i) => `${i.quantity}x ${i.itemName}`));
  } catch (error) {
    console.error('Erro ao adicionar itens ao inventário:', error);
    throw error;
  }
};

/**
 * Usa um item do inventário
 */
export const useInventoryItem = async (
  userId: string,
  itemId: string,
  quantity: number = 1
): Promise<{ success: boolean; remaining: number; error?: string }> => {
  try {
    const docRef = doc(firestore, INVENTORY_COLLECTION, userId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return { success: false, remaining: 0, error: 'Inventário não encontrado' };
    }

    const inventory = docSnap.data() as UserInventory;
    const itemIndex = inventory.items.findIndex((i) => i.itemId === itemId);

    if (itemIndex < 0) {
      return { success: false, remaining: 0, error: 'Item não encontrado no inventário' };
    }

    const item = inventory.items[itemIndex];

    // Verificar se é ilimitado
    if (item.quantity === -1) {
      return { success: true, remaining: -1 }; // Ilimitado
    }

    // Verificar se tem quantidade suficiente
    if (item.quantity < quantity) {
      return { 
        success: false, 
        remaining: item.quantity, 
        error: `Quantidade insuficiente. Você tem ${item.quantity} ${item.itemName}(s)` 
      };
    }

    // Decrementar quantidade
    inventory.items[itemIndex].quantity -= quantity;

    await updateDoc(docRef, {
      items: inventory.items,
      updatedAt: serverTimestamp(),
    });

    console.log(`✅ Item usado: ${quantity}x ${item.itemName}. Restante: ${inventory.items[itemIndex].quantity}`);

    return { 
      success: true, 
      remaining: inventory.items[itemIndex].quantity 
    };
  } catch (error: any) {
    console.error('Erro ao usar item:', error);
    return { success: false, remaining: 0, error: error.message };
  }
};

/**
 * Usa um item do inventário pelo NOME do item
 * Mais flexível que usar por ID, pois itens podem vir de planos ou loja com IDs diferentes
 */
export const useInventoryItemByName = async (
  userId: string,
  itemName: string,
  quantity: number = 1
): Promise<{ success: boolean; remaining: number; error?: string }> => {
  try {
    const docRef = doc(firestore, INVENTORY_COLLECTION, userId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return { success: false, remaining: 0, error: 'Inventário não encontrado' };
    }

    const inventory = docSnap.data() as UserInventory;
    
    // Buscar item pelo nome (case insensitive)
    const itemIndex = inventory.items.findIndex(
      (i) => i.itemName.toLowerCase() === itemName.toLowerCase()
    );

    if (itemIndex < 0) {
      return { success: false, remaining: 0, error: `Item "${itemName}" não encontrado no inventário` };
    }

    const item = inventory.items[itemIndex];

    // Verificar se é ilimitado
    if (item.quantity === -1) {
      return { success: true, remaining: -1 }; // Ilimitado
    }

    // Verificar se tem quantidade suficiente
    if (item.quantity < quantity) {
      return { 
        success: false, 
        remaining: item.quantity, 
        error: `Quantidade insuficiente. Você tem ${item.quantity} ${item.itemName}(s)` 
      };
    }

    // Decrementar quantidade
    inventory.items[itemIndex].quantity -= quantity;

    await updateDoc(docRef, {
      items: inventory.items,
      updatedAt: serverTimestamp(),
    });

    console.log(`✅ Item usado: ${quantity}x ${item.itemName}. Restante: ${inventory.items[itemIndex].quantity}`);

    return { 
      success: true, 
      remaining: inventory.items[itemIndex].quantity 
    };
  } catch (error: any) {
    console.error('Erro ao usar item:', error);
    return { success: false, remaining: 0, error: error.message };
  }
};

/**
 * Verifica se o usuário tem um item específico
 */
export const hasInventoryItem = async (
  userId: string,
  itemId: string,
  minQuantity: number = 1
): Promise<boolean> => {
  try {
    const items = await getUserInventory(userId);
    const item = items.find((i) => i.itemId === itemId);

    if (!item) return false;
    if (item.quantity === -1) return true; // Ilimitado
    return item.quantity >= minQuantity;
  } catch (error) {
    console.error('Erro ao verificar item:', error);
    return false;
  }
};

/**
 * Obtém quantidade de um item específico
 */
export const getItemQuantity = async (userId: string, itemId: string): Promise<number> => {
  try {
    const items = await getUserInventory(userId);
    const item = items.find((i) => i.itemId === itemId);
    return item?.quantity ?? 0;
  } catch (error) {
    console.error('Erro ao obter quantidade:', error);
    return 0;
  }
};

// =============================================================================
// SERVIÇOS DE PAGAMENTO
// =============================================================================

/**
 * Busca histórico de pagamentos do usuário
 */
export const getPaymentHistory = async (userId: string): Promise<PaymentRecord[]> => {
  try {
    const q = query(
      collection(firestore, PAYMENTS_COLLECTION),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as PaymentRecord[];
  } catch (error) {
    console.error('Erro ao buscar histórico de pagamentos:', error);
    return [];
  }
};

// =============================================================================
// 🚀 ASSOBIOS DO PEÃO (BOOST)
// =============================================================================

/**
 * Interface para o status do boost
 */
interface BoostStatus {
  isActive: boolean;
  activatedAt?: Date;
  expiresAt?: Date;
  remainingMinutes?: number;
}

/**
 * Ativa o boost (Assobios do Peão) por 1 hora
 * O perfil do usuário aparece em destaque no feed de discovery
 */
export const activateBoost = async (userId: string): Promise<{ success: boolean; error?: string; expiresAt?: Date }> => {
  try {
    // Verificar se o usuário tem boost no inventário
    const consumeResult = await useInventoryItemByName(userId, 'Assobios do Peão', 1);
    
    if (!consumeResult.success) {
      return { 
        success: false, 
        error: 'Você não tem Assobios do Peão disponível. Compre mais na loja!' 
      };
    }
    
    // Calcular expiração (1 hora a partir de agora)
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 60 * 60 * 1000); // +1 hora
    
    // Atualizar status de boost do usuário
    const userRef = doc(firestore, 'users', userId);
    await updateDoc(userRef, {
      boostStatus: {
        isActive: true,
        activatedAt: serverTimestamp(),
        expiresAt: Timestamp.fromDate(expiresAt),
      },
      updatedAt: serverTimestamp(),
    });
    
    console.log(`🚀 Boost ativado para usuário ${userId}! Expira em: ${expiresAt.toISOString()}`);
    
    return { success: true, expiresAt };
  } catch (error: any) {
    console.error('Erro ao ativar boost:', error);
    return { success: false, error: error.message || 'Erro ao ativar boost' };
  }
};

/**
 * Verifica se o boost do usuário ainda está ativo
 */
export const checkBoostStatus = async (userId: string): Promise<BoostStatus> => {
  try {
    const userRef = doc(firestore, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      return { isActive: false };
    }
    
    const userData = userSnap.data();
    const boostStatus = userData.boostStatus;
    
    if (!boostStatus || !boostStatus.isActive) {
      return { isActive: false };
    }
    
    // Verificar se expirou
    const expiresAt = boostStatus.expiresAt?.toDate?.() || new Date(0);
    const now = new Date();
    
    if (now >= expiresAt) {
      // Boost expirou, desativar
      await updateDoc(userRef, {
        'boostStatus.isActive': false,
        updatedAt: serverTimestamp(),
      });
      return { isActive: false };
    }
    
    // Boost ainda ativo
    const remainingMinutes = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60));
    
    return {
      isActive: true,
      activatedAt: boostStatus.activatedAt?.toDate?.(),
      expiresAt,
      remainingMinutes,
    };
  } catch (error) {
    console.error('Erro ao verificar boost:', error);
    return { isActive: false };
  }
};

/**
 * Obtém usuários com boost ativo (para priorizar no feed)
 * Retorna lista de IDs de usuários com boost ativo
 */
export const getBoostedUsers = async (): Promise<string[]> => {
  try {
    const now = Timestamp.now();
    
    const q = query(
      collection(firestore, 'users'),
      where('boostStatus.isActive', '==', true),
      where('boostStatus.expiresAt', '>', now)
    );
    
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => doc.id);
  } catch (error) {
    console.error('Erro ao buscar usuários com boost:', error);
    return [];
  }
};

// =============================================================================
// EXPORTAR TUDO
// =============================================================================

export default {
  // Assinatura
  getActiveSubscription,
  getSubscriptionHistory,
  subscribeToPlan,
  cancelSubscription,
  checkAndUpdateExpiredSubscriptions,
  isSubscriptionActive,
  getDaysRemaining,
  calculateEndDate,
  
  // Inventário
  getUserInventory,
  addItemsToInventory,
  useInventoryItem,
  useInventoryItemByName,
  hasInventoryItem,
  getItemQuantity,
  
  // Boost
  activateBoost,
  checkBoostStatus,
  getBoostedUsers,
  
  // Pagamentos
  getPaymentHistory,
  
  // Helpers
  formatPrice,
  PERIOD_DAYS,
  PERIOD_LABELS,
};
