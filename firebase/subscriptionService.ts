/**
 * 🔥 BOTA LOVE APP - Subscription Service
 * 
 * Gerencia planos, assinaturas e pagamentos:
 * - Planos Premium (Bota Love)
 * - Planos Network Rural
 * - Trial gratuito
 * - Pagamentos simulados
 * 
 * @author Bota Love Team
 */

import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { firestore, functions } from './config';
import {
  COLLECTIONS,
  FirebasePayment,
  FirebaseUser,
  SubscriptionPlan
} from './types';

// =============================================================================
// 📝 TIPOS E CONSTANTES
// =============================================================================

export interface PlanDetails {
  id: SubscriptionPlan;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  duration: 'monthly' | 'quarterly' | 'annual' | 'lifetime';
  durationDays: number;
  features: string[];
  popular?: boolean;
  promo?: boolean;
}

export const PREMIUM_PLANS: PlanDetails[] = [
  {
    id: 'premium_monthly',
    name: 'Premium Mensal',
    description: 'Acesso completo por 1 mês',
    price: 49.90,
    duration: 'monthly',
    durationDays: 30,
    features: [
      'Likes ilimitados',
      'Ver quem curtiu você',
      'Super Likes ilimitados',
      'Boost de perfil semanal',
      'Sem anúncios',
    ],
  },
  {
    id: 'premium_quarterly',
    name: 'Premium Trimestral',
    description: 'Acesso completo por 3 meses',
    price: 119.90,
    originalPrice: 149.70,
    duration: 'quarterly',
    durationDays: 90,
    features: [
      'Tudo do mensal',
      '20% de desconto',
      'Prioridade no suporte',
    ],
    popular: true,
  },
  {
    id: 'premium_annual',
    name: 'Premium Anual',
    description: 'Acesso completo por 1 ano',
    price: 359.90,
    originalPrice: 598.80,
    duration: 'annual',
    durationDays: 365,
    features: [
      'Tudo do trimestral',
      '40% de desconto',
      'Destaque especial no perfil',
    ],
  },
];

export const NETWORK_PLANS: PlanDetails[] = [
  {
    id: 'network_monthly',
    name: 'Network Mensal',
    description: 'Networking rural por 1 mês',
    price: 14.90,
    duration: 'monthly',
    durationDays: 30,
    features: [
      'Conexões profissionais ilimitadas',
      'Chat com produtores rurais',
      'LinkedIn integrado',
      'Selo "Network Ativo"',
    ],
  },
  {
    id: 'network_lifetime',
    name: 'Network Vitalício',
    description: 'Acesso para sempre',
    price: 9.90,
    originalPrice: 14.90,
    duration: 'lifetime',
    durationDays: 36500, // ~100 anos
    features: [
      'Tudo do mensal',
      'Acesso vitalício',
      'Promoção de lançamento',
    ],
    promo: true,
  },
];

export const TRIAL_DURATION_DAYS = 7;

// =============================================================================
// 💳 GESTÃO DE PLANOS PREMIUM
// =============================================================================

/**
 * Ativa período de teste premium
 */
export async function activatePremiumTrial(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const userRef = doc(firestore, COLLECTIONS.USERS, userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return { success: false, error: 'Usuário não encontrado' };
    }

    const userData = userSnap.data() as FirebaseUser;

    // Verificar se já usou trial
    if (userData.subscription.trialEndDate) {
      return { success: false, error: 'Você já utilizou o período de teste' };
    }

    const now = new Date();
    const trialEnd = new Date(now.getTime() + TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000);

    await updateDoc(userRef, {
      'subscription.status': 'trial',
      'subscription.plan': 'premium_monthly',
      'subscription.startDate': Timestamp.fromDate(now),
      'subscription.trialEndDate': Timestamp.fromDate(trialEnd),
      'subscription.endDate': Timestamp.fromDate(trialEnd),
      updatedAt: serverTimestamp(),
    });

    // Agendar notificação de fim de trial
    const scheduleTrialReminder = httpsCallable(functions, 'scheduleTrialReminder');
    await scheduleTrialReminder({ userId, trialEndDate: trialEnd.toISOString() }).catch(console.error);

    return { success: true };
  } catch (error: any) {
    console.error('Erro ao ativar trial premium:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Assina plano premium (pagamento simulado)
 */
export async function subscribeToPremium(
  userId: string,
  planId: SubscriptionPlan
): Promise<{ success: boolean; paymentId?: string; error?: string }> {
  try {
    const plan = PREMIUM_PLANS.find((p) => p.id === planId);
    if (!plan) {
      return { success: false, error: 'Plano não encontrado' };
    }

    // 1. Criar registro de pagamento simulado
    const paymentData: Omit<FirebasePayment, 'id'> = {
      userId,
      amount: plan.price,
      currency: 'BRL',
      description: `Assinatura ${plan.name}`,
      productId: plan.id,
      productType: 'subscription',
      plan: planId,
      status: 'completed', // Simulado como completo
      provider: 'simulated',
      createdAt: Timestamp.now(),
      completedAt: Timestamp.now(),
      isSimulated: true,
      simulationNotes: 'Pagamento simulado para desenvolvimento',
    };

    const paymentRef = await addDoc(collection(firestore, COLLECTIONS.PAYMENTS), paymentData);

    // 2. Atualizar assinatura do usuário
    const now = new Date();
    const endDate = new Date(now.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);

    await updateDoc(doc(firestore, COLLECTIONS.USERS, userId), {
      'subscription.status': 'active',
      'subscription.plan': planId,
      'subscription.startDate': Timestamp.fromDate(now),
      'subscription.endDate': Timestamp.fromDate(endDate),
      'subscription.autoRenew': true,
      'subscription.lastPaymentId': paymentRef.id,
      updatedAt: serverTimestamp(),
    });

    return { success: true, paymentId: paymentRef.id };
  } catch (error: any) {
    console.error('Erro ao assinar plano premium:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Cancela assinatura premium
 */
export async function cancelPremiumSubscription(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await updateDoc(doc(firestore, COLLECTIONS.USERS, userId), {
      'subscription.autoRenew': false,
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error: any) {
    console.error('Erro ao cancelar assinatura:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Cancela assinatura do Network Rural
 */
export async function cancelNetworkSubscription(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const userRef = doc(firestore, COLLECTIONS.USERS, userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return { success: false, error: 'Usuário não encontrado' };
    }

    const userData = userSnap.data() as FirebaseUser;
    
    // Não permite cancelar plano vitalício
    if (userData.networkRural.subscription.plan === 'lifetime') {
      return { success: false, error: 'Plano vitalício não pode ser cancelado' };
    }

    await updateDoc(userRef, {
      'networkRural.subscription.status': 'cancelled',
      'networkRural.isActive': false,
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error: any) {
    console.error('Erro ao cancelar Network Rural:', error);
    return { success: false, error: error.message };
  }
}

// =============================================================================
// 🌾 GESTÃO DE PLANOS NETWORK RURAL
// =============================================================================

/**
 * Ativa período de teste do Network Rural
 */
export async function activateNetworkTrial(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const userRef = doc(firestore, COLLECTIONS.USERS, userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return { success: false, error: 'Usuário não encontrado' };
    }

    const userData = userSnap.data() as FirebaseUser;

    // Verificar se é usuário Agro
    if (!userData.profile.isAgroUser) {
      return { success: false, error: 'Network Rural disponível apenas para usuários Agro' };
    }

    // Verificar se já usou trial
    if (userData.networkRural.subscription.trialEndDate) {
      return { success: false, error: 'Você já utilizou o período de teste do Network' };
    }

    const now = new Date();
    const trialEnd = new Date(now.getTime() + TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000);

    await updateDoc(userRef, {
      'networkRural.isActive': true,
      'networkRural.subscription.status': 'trial',
      'networkRural.subscription.plan': 'monthly',
      'networkRural.subscription.startDate': Timestamp.fromDate(now),
      'networkRural.subscription.trialEndDate': Timestamp.fromDate(trialEnd),
      'networkRural.subscription.endDate': Timestamp.fromDate(trialEnd),
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error: any) {
    console.error('Erro ao ativar trial do Network:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Assina plano do Network Rural (pagamento simulado)
 */
export async function subscribeToNetwork(
  userId: string,
  planType: 'monthly' | 'lifetime'
): Promise<{ success: boolean; paymentId?: string; error?: string }> {
  try {
    const plan = NETWORK_PLANS.find((p) => 
      p.id === (planType === 'monthly' ? 'network_monthly' : 'network_lifetime')
    );
    
    if (!plan) {
      return { success: false, error: 'Plano não encontrado' };
    }

    // Verificar se é usuário Agro
    const userRef = doc(firestore, COLLECTIONS.USERS, userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      return { success: false, error: 'Usuário não encontrado' };
    }

    const userData = userSnap.data() as FirebaseUser;
    if (!userData.profile.isAgroUser) {
      return { success: false, error: 'Network Rural disponível apenas para usuários Agro' };
    }

    // 1. Criar registro de pagamento simulado
    const paymentData: Omit<FirebasePayment, 'id'> = {
      userId,
      amount: plan.price,
      currency: 'BRL',
      description: `Assinatura ${plan.name}`,
      productId: plan.id,
      productType: planType === 'lifetime' ? 'one_time' : 'subscription',
      plan: plan.id,
      status: 'completed',
      provider: 'simulated',
      createdAt: Timestamp.now(),
      completedAt: Timestamp.now(),
      isSimulated: true,
      simulationNotes: 'Pagamento simulado para desenvolvimento',
    };

    const paymentRef = await addDoc(collection(firestore, COLLECTIONS.PAYMENTS), paymentData);

    // 2. Atualizar Network Rural do usuário
    const now = new Date();
    const endDate = planType === 'lifetime' 
      ? new Date(now.getTime() + 36500 * 24 * 60 * 60 * 1000) // ~100 anos
      : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 dias

    await updateDoc(userRef, {
      'networkRural.isActive': true,
      'networkRural.subscription.status': planType === 'lifetime' ? 'lifetime' : 'active',
      'networkRural.subscription.plan': planType,
      'networkRural.subscription.startDate': Timestamp.fromDate(now),
      'networkRural.subscription.endDate': Timestamp.fromDate(endDate),
      updatedAt: serverTimestamp(),
    });

    return { success: true, paymentId: paymentRef.id };
  } catch (error: any) {
    console.error('Erro ao assinar Network:', error);
    return { success: false, error: error.message };
  }
}

// =============================================================================
// 📊 CONSULTAS E VERIFICAÇÕES
// =============================================================================

/**
 * Verifica se o usuário tem plano premium ativo
 */
export async function isPremiumActive(userId: string): Promise<boolean> {
  try {
    const user = await getDoc(doc(firestore, COLLECTIONS.USERS, userId));
    if (!user.exists()) return false;

    const userData = user.data() as FirebaseUser;
    const subscription = userData.subscription;

    if (!subscription || subscription.status === 'none' || subscription.status === 'expired') {
      return false;
    }

    if (subscription.status === 'trial' || subscription.status === 'active') {
      const endDate = subscription.endDate?.toDate();
      return endDate ? new Date() < endDate : false;
    }

    return false;
  } catch (error) {
    console.error('Erro ao verificar status premium:', error);
    return false;
  }
}

/**
 * Verifica se o usuário tem Network Rural ativo
 */
export async function isNetworkActive(userId: string): Promise<boolean> {
  try {
    const user = await getDoc(doc(firestore, COLLECTIONS.USERS, userId));
    if (!user.exists()) return false;

    const userData = user.data() as FirebaseUser;
    const network = userData.networkRural;

    if (!network || !network.isActive) return false;

    const subscription = network.subscription;
    // Plano vitalício está sempre ativo
    if (subscription.plan === 'lifetime') return true;
    
    if (subscription.status === 'trial' || subscription.status === 'active') {
      const endDate = subscription.endDate?.toDate();
      return endDate ? new Date() < endDate : false;
    }

    return false;
  } catch (error) {
    console.error('Erro ao verificar status do Network:', error);
    return false;
  }
}

/**
 * Obtém dias restantes do trial
 */
export async function getTrialDaysRemaining(userId: string, type: 'premium' | 'network'): Promise<number> {
  try {
    const user = await getDoc(doc(firestore, COLLECTIONS.USERS, userId));
    if (!user.exists()) return 0;

    const userData = user.data() as FirebaseUser;
    
    const subscription = type === 'premium' 
      ? userData.subscription 
      : userData.networkRural.subscription;

    if (subscription.status !== 'trial' || !subscription.trialEndDate) {
      return 0;
    }

    const trialEnd = subscription.trialEndDate.toDate();
    const now = new Date();
    const diffTime = trialEnd.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return Math.max(0, diffDays);
  } catch (error) {
    console.error('Erro ao calcular dias do trial:', error);
    return 0;
  }
}

/**
 * Obtém histórico de pagamentos do usuário
 */
export async function getUserPayments(userId: string): Promise<FirebasePayment[]> {
  try {
    const q = query(
      collection(firestore, COLLECTIONS.PAYMENTS),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }) as FirebasePayment);
  } catch (error) {
    console.error('Erro ao buscar pagamentos:', error);
    return [];
  }
}