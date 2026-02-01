/**
 * 🌾 BOTA LOVE APP - Serviço de Preferências Agrolove
 * 
 * Gerencia:
 * - Preferências de busca personalizadas do usuário
 * - Compras do filtro Agrolove (R$ 39,90)
 * - Métricas de vendas para o Painel Administrativo
 * - Integração com discovery para filtrar perfis
 * 
 * @author Bota Love Team
 */

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
    Timestamp
} from 'firebase/firestore';
import { firestore } from './config';

// ============================================
// 📊 TIPOS E INTERFACES
// ============================================

export interface AgrolovePreferences {
  profession: string[];
  residence: string[];
  education: string[];
  activities: string[];
  property: string[];
  animals: string[];
  crops: string[];
  gender: string[];
  age: string[];
  height: string[];
}

export interface AgroloveSubscription {
  id: string;
  userId: string;
  preferences: AgrolovePreferences;
  purchaseDate: Timestamp;
  expirationDate: Timestamp | null; // null = vitalício
  price: number;
  status: 'active' | 'expired' | 'cancelled';
  paymentId?: string;
  tabPreference: 'sou_agro' | 'simpatizantes' | 'both'; // Aba do usuário no cadastro
}

export interface AgroloveMetrics {
  totalSales: number;
  totalRevenue: number;
  monthlySales: number;
  monthlyRevenue: number;
  lastUpdated: Timestamp;
}

export interface AgroloveSale {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  preferences: AgrolovePreferences;
  price: number;
  purchaseDate: Timestamp;
  paymentMethod: string;
  paymentId?: string;
  tabPreference: string;
}

// Preço do filtro Agrolove
export const AGROLOVE_PRICE = 39.90;

// Coleções do Firestore
const AGROLOVE_COLLECTION = 'agrolove_preferences';
const AGROLOVE_SALES_COLLECTION = 'agrolove_sales';
const AGROLOVE_METRICS_COLLECTION = 'agrolove_metrics';

// ============================================
// 👤 GERENCIAMENTO DE PREFERÊNCIAS DO USUÁRIO
// ============================================

/**
 * Salva ou atualiza preferências Agrolove do usuário
 */
export async function saveAgrolovePreferences(
  userId: string,
  preferences: AgrolovePreferences,
  tabPreference: 'sou_agro' | 'simpatizantes' | 'both',
  paymentId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const docRef = doc(firestore, AGROLOVE_COLLECTION, userId);
    
    const subscription: Omit<AgroloveSubscription, 'id'> = {
      userId,
      preferences,
      purchaseDate: Timestamp.now(),
      expirationDate: null, // Vitalício
      price: AGROLOVE_PRICE,
      status: 'active',
      paymentId,
      tabPreference,
    };
    
    await setDoc(docRef, subscription, { merge: true });
    
    return { success: true };
  } catch (error: any) {
    console.error('Erro ao salvar preferências Agrolove:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Obtém preferências Agrolove do usuário
 */
export async function getAgrolovePreferences(
  userId: string
): Promise<AgroloveSubscription | null> {
  try {
    const docRef = doc(firestore, AGROLOVE_COLLECTION, userId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }
    
    return {
      id: docSnap.id,
      ...docSnap.data(),
    } as AgroloveSubscription;
  } catch (error) {
    console.error('Erro ao obter preferências Agrolove:', error);
    return null;
  }
}

/**
 * Verifica se usuário tem Agrolove ativo
 */
export async function hasActiveAgrolove(userId: string): Promise<boolean> {
  const subscription = await getAgrolovePreferences(userId);
  
  if (!subscription) return false;
  if (subscription.status !== 'active') return false;
  
  // Verificar expiração se houver
  if (subscription.expirationDate) {
    const now = Timestamp.now();
    if (subscription.expirationDate.toMillis() < now.toMillis()) {
      return false;
    }
  }
  
  return true;
}

// ============================================
// 💰 REGISTRO DE VENDAS
// ============================================

/**
 * Registra uma venda de Agrolove
 */
export async function registerAgroloveSale(
  userId: string,
  userName: string,
  userEmail: string,
  preferences: AgrolovePreferences,
  tabPreference: string,
  paymentMethod: string,
  paymentId?: string
): Promise<{ success: boolean; saleId?: string; error?: string }> {
  try {
    const sale: Omit<AgroloveSale, 'id'> = {
      userId,
      userName,
      userEmail,
      preferences,
      price: AGROLOVE_PRICE,
      purchaseDate: Timestamp.now(),
      paymentMethod,
      paymentId,
      tabPreference,
    };
    
    const docRef = await addDoc(
      collection(firestore, AGROLOVE_SALES_COLLECTION),
      sale
    );
    
    // Atualizar métricas
    await updateAgroloveMetrics(AGROLOVE_PRICE);
    
    return { success: true, saleId: docRef.id };
  } catch (error: any) {
    console.error('Erro ao registrar venda Agrolove:', error);
    return { success: false, error: error.message };
  }
}

// ============================================
// 📊 MÉTRICAS PARA PAINEL ADMINISTRATIVO
// ============================================

/**
 * Atualiza métricas de vendas Agrolove
 */
async function updateAgroloveMetrics(saleAmount: number): Promise<void> {
  try {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    // Documento global de métricas
    const globalRef = doc(firestore, AGROLOVE_METRICS_COLLECTION, 'global');
    
    await setDoc(globalRef, {
      totalSales: increment(1),
      totalRevenue: increment(saleAmount),
      lastUpdated: serverTimestamp(),
    }, { merge: true });
    
    // Documento mensal de métricas
    const monthlyRef = doc(firestore, AGROLOVE_METRICS_COLLECTION, `month_${currentMonth}`);
    
    await setDoc(monthlyRef, {
      month: currentMonth,
      sales: increment(1),
      revenue: increment(saleAmount),
      lastUpdated: serverTimestamp(),
    }, { merge: true });
    
  } catch (error) {
    console.error('Erro ao atualizar métricas Agrolove:', error);
  }
}

/**
 * Obtém métricas globais de vendas Agrolove
 */
export async function getAgroloveGlobalMetrics(): Promise<AgroloveMetrics | null> {
  try {
    const docRef = doc(firestore, AGROLOVE_METRICS_COLLECTION, 'global');
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return {
        totalSales: 0,
        totalRevenue: 0,
        monthlySales: 0,
        monthlyRevenue: 0,
        lastUpdated: Timestamp.now(),
      };
    }
    
    const data = docSnap.data();
    
    // Obter dados do mês atual
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const monthlyRef = doc(firestore, AGROLOVE_METRICS_COLLECTION, `month_${currentMonth}`);
    const monthlySnap = await getDoc(monthlyRef);
    
    const monthlyData = monthlySnap.exists() ? monthlySnap.data() : { sales: 0, revenue: 0 };
    
    return {
      totalSales: data.totalSales || 0,
      totalRevenue: data.totalRevenue || 0,
      monthlySales: monthlyData.sales || 0,
      monthlyRevenue: monthlyData.revenue || 0,
      lastUpdated: data.lastUpdated || Timestamp.now(),
    };
  } catch (error) {
    console.error('Erro ao obter métricas Agrolove:', error);
    return null;
  }
}

/**
 * Obtém histórico de vendas Agrolove (para admin)
 */
export async function getAgroloveSalesHistory(
  limit: number = 50
): Promise<AgroloveSale[]> {
  try {
    const q = query(
      collection(firestore, AGROLOVE_SALES_COLLECTION),
      orderBy('purchaseDate', 'desc')
    );
    
    const snapshot = await getDocs(q);
    
    return snapshot.docs.slice(0, limit).map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as AgroloveSale));
  } catch (error) {
    console.error('Erro ao obter histórico de vendas Agrolove:', error);
    return [];
  }
}

/**
 * Obtém métricas mensais (para gráficos no admin)
 */
export async function getAgroloveMonthlyMetrics(
  months: number = 6
): Promise<{ month: string; sales: number; revenue: number }[]> {
  try {
    const results: { month: string; sales: number; revenue: number }[] = [];
    const now = new Date();
    
    for (let i = 0; i < months; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      const docRef = doc(firestore, AGROLOVE_METRICS_COLLECTION, `month_${monthKey}`);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        results.push({
          month: monthKey,
          sales: data.sales || 0,
          revenue: data.revenue || 0,
        });
      } else {
        results.push({
          month: monthKey,
          sales: 0,
          revenue: 0,
        });
      }
    }
    
    return results.reverse();
  } catch (error) {
    console.error('Erro ao obter métricas mensais Agrolove:', error);
    return [];
  }
}

// ============================================
// 🔍 FILTRO DE DISCOVERY COM PREFERÊNCIAS
// ============================================

/**
 * Filtra perfis baseado nas preferências Agrolove do usuário
 * 
 * IMPORTANTE: Respeita a aba selecionada no cadastro do usuário
 * - sou_agro: busca apenas em Sou Agro
 * - simpatizantes: busca apenas em Simpatizante Agro
 * - both: busca em ambas as abas
 */
export function filterProfilesByAgrolovePreferences(
  profiles: any[],
  preferences: AgrolovePreferences,
  userTabPreference: 'sou_agro' | 'simpatizantes' | 'both'
): any[] {
  return profiles.filter(profile => {
    // 1. PRIMEIRO: Filtrar pela aba do usuário
    const profileTab = profile.isAgroUser ? 'sou_agro' : 'simpatizantes';
    
    if (userTabPreference !== 'both' && profileTab !== userTabPreference) {
      return false;
    }
    
    // 2. Aplicar filtros de preferências
    let matches = true;
    
    // Profissão
    if (preferences.profession.length > 0) {
      const hasMatch = preferences.profession.some(pref => 
        profile.profession?.toLowerCase().includes(pref.toLowerCase())
      );
      if (!hasMatch) matches = false;
    }
    
    // Residência (campo/cidade)
    if (preferences.residence.length > 0 && profile.residence) {
      const hasMatch = preferences.residence.some(pref =>
        profile.residence?.toLowerCase().includes(pref.toLowerCase())
      );
      if (!hasMatch) matches = false;
    }
    
    // Educação
    if (preferences.education.length > 0 && profile.education) {
      const hasMatch = preferences.education.some(pref =>
        profile.education?.toLowerCase().includes(pref.toLowerCase())
      );
      if (!hasMatch) matches = false;
    }
    
    // Atividades rurais
    if (preferences.activities.length > 0 && profile.ruralActivities) {
      const hasMatch = preferences.activities.some(pref =>
        profile.ruralActivities?.some((activity: string) =>
          activity.toLowerCase().includes(pref.toLowerCase())
        )
      );
      if (!hasMatch) matches = false;
    }
    
    // Propriedade
    if (preferences.property.length > 0 && profile.propertySize) {
      const hasMatch = preferences.property.some(pref =>
        profile.propertySize?.some((prop: string) =>
          prop.toLowerCase().includes(pref.toLowerCase())
        )
      );
      if (!hasMatch) matches = false;
    }
    
    // Animais
    if (preferences.animals.length > 0 && profile.animals) {
      const hasMatch = preferences.animals.some(pref =>
        profile.animals?.some((animal: string) =>
          animal.toLowerCase().includes(pref.toLowerCase())
        )
      );
      if (!hasMatch) matches = false;
    }
    
    // Cultivos
    if (preferences.crops.length > 0 && profile.crops) {
      const hasMatch = preferences.crops.some(pref =>
        profile.crops?.some((crop: string) =>
          crop.toLowerCase().includes(pref.toLowerCase())
        )
      );
      if (!hasMatch) matches = false;
    }
    
    // Gênero
    if (preferences.gender.length > 0 && profile.gender) {
      const genderMap: Record<string, string> = {
        'Homens': 'male',
        'Mulheres': 'female',
        'Ambos': 'both',
      };
      
      const wantsBoth = preferences.gender.includes('Ambos');
      if (!wantsBoth) {
        const wantsMale = preferences.gender.includes('Homens');
        const wantsFemale = preferences.gender.includes('Mulheres');
        
        if (wantsMale && profile.gender !== 'male') matches = false;
        if (wantsFemale && profile.gender !== 'female') matches = false;
      }
    }
    
    // Idade
    if (preferences.age.length > 0 && profile.age) {
      const age = profile.age;
      const ageRanges = {
        'Entre 18 e 25 anos': age >= 18 && age <= 25,
        'Entre 25 e 35 anos': age >= 25 && age <= 35,
        'Entre 35 e 45 anos': age >= 35 && age <= 45,
        'Acima de 45 anos': age > 45,
      };
      
      const hasMatch = preferences.age.some(pref =>
        ageRanges[pref as keyof typeof ageRanges]
      );
      if (!hasMatch) matches = false;
    }
    
    // Altura
    if (preferences.height.length > 0 && profile.height) {
      const height = parseFloat(profile.height);
      const heightRanges = {
        'Abaixo de 1.70m': height < 1.70,
        'Entre 1.70m e 1.80m': height >= 1.70 && height <= 1.80,
        'Entre 1.80m e 1.90m': height >= 1.80 && height <= 1.90,
        'Acima de 1.90m': height > 1.90,
      };
      
      const hasMatch = preferences.height.some(pref =>
        heightRanges[pref as keyof typeof heightRanges]
      );
      if (!hasMatch) matches = false;
    }
    
    return matches;
  });
}

// ============================================
// 📤 EXPORTS
// ============================================

export default {
  AGROLOVE_PRICE,
  saveAgrolovePreferences,
  getAgrolovePreferences,
  hasActiveAgrolove,
  registerAgroloveSale,
  getAgroloveGlobalMetrics,
  getAgroloveSalesHistory,
  getAgroloveMonthlyMetrics,
  filterProfilesByAgrolovePreferences,
};
