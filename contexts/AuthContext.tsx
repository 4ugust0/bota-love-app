/**
 * 🔥 BOTA LOVE APP - Auth Context
 * 
 * Contexto de autenticação integrado com Firebase Auth:
 * - Gerenciamento de sessão
 * - Estado de autenticação
 * - Ações de auth (login, register, logout)
 * - Gerenciamento de assinaturas
 * 
 * @author Bota Love Team
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';

// Firebase imports
import {
    resetPassword as firebaseResetPassword,
    LoginResult,
    loginUser,
    logoutUser,
    onAuthStateChange,
    RegisterData,
    registerUser,
    resendVerificationCode,
    verifyEmailCode,
} from '@/firebase/authService';
import {
    updateDiscoverySettings as updateDiscoverySettingsFirestore,
    updateUserPhotos,
    updateUserProfile,
} from '@/firebase/firestoreService';
import {
    cancelPremiumSubscription,
    activateNetworkTrial as firebaseActivateNetworkTrial,
    activatePremiumTrial as firebaseActivatePremiumTrial,
    cancelNetworkSubscription as firebaseCancelNetworkSubscription,
    subscribeToNetwork,
    subscribeToPremium,
} from '@/firebase/subscriptionService';
import {
    DiscoverySettings,
    FirebaseUser,
    SubscriptionPlan,
    UserProfile,
} from '@/firebase/types';

// Para manter retrocompatibilidade com código existente
import { User } from '@/data/mockData';
import {
    NetworkRuralSubscription,
    NetworkSubscriptionStatus,
} from '@/data/networkRuralService';

// =============================================================================
// 📝 TIPOS
// =============================================================================

export type UserType = 'regular' | 'producer';

export interface AuthContextType {
  // Estado
  currentUser: FirebaseUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Premium
  hasPremium: boolean;
  
  // Network Rural
  isAgroUser: boolean;
  hasNetworkRural: boolean;
  networkTrialDaysRemaining: number;
  
  // User type (retrocompatibilidade)
  userType: UserType;
  setUserType: (type: UserType) => void;
  
  // Auth actions
  register: (data: RegisterData) => Promise<LoginResult>;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
  verifyEmail: (code: string) => Promise<boolean>;
  resendCode: () => Promise<boolean>;
  resetPassword: (email: string) => Promise<boolean>;
  
  // Profile actions
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  updatePhotos: (photos: string[]) => Promise<void>;
  updateDiscoverySettings: (settings: Partial<DiscoverySettings>) => Promise<void>;
  refreshUserData: () => Promise<void>;
  
  // Subscription actions
  activatePremiumTrial: () => Promise<boolean>;
  activateNetworkTrial: () => Promise<boolean>;
  subscribeToPlan: (planId: string) => Promise<boolean>;
  cancelPremium: () => Promise<boolean>;
  cancelNetworkRural: () => Promise<boolean>;
  
  // Retrocompatibilidade - Network Rural legacy functions
  subscribeNetworkMonthly: () => Promise<boolean>;
  subscribeNetworkLifetime: () => Promise<boolean>;
  cancelNetworkSubscription: () => Promise<boolean>;
  networkSubscription: NetworkRuralSubscription | null;
  
  // Retrocompatibilidade
  updateUser: (updates: Partial<User>) => void;
  togglePremium: () => void;
  setIsAgroUser: (isAgro: boolean) => void;
  
  // Pending user for verification flow
  pendingUserId: string | null;
  setPendingUserId: (id: string | null) => void;
}

// Chave para persistência
const AUTH_STORAGE_KEY = '@bota_love_auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// =============================================================================
// 🔥 PROVIDER
// =============================================================================

export function AuthProvider({ children }: { children: ReactNode }) {
  // Estado principal
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  
  // Retrocompatibilidade
  const [userType, setUserType] = useState<UserType>('regular');

  // ===========================================================================
  // 🔄 EFEITOS
  // ===========================================================================

  /**
   * Listener de estado de autenticação
   */
  useEffect(() => {
    setIsLoading(true);
    
    const unsubscribe = onAuthStateChange(async (authUser, userData) => {
      if (userData) {
        setCurrentUser(userData);
        
        // Definir userType baseado no tipo de conta do usuário
        if (userData.userType === 'produtor') {
          setUserType('producer');
        } else {
          setUserType('regular');
        }
        
        // Persistir sessão
        await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
          userId: userData.id,
          userType: userData.userType,
          timestamp: Date.now(),
        }));
      } else {
        setCurrentUser(null);
        setUserType('regular');
        await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  /**
   * Verificar sessão persistida ao iniciar
   */
  useEffect(() => {
    const checkStoredSession = async () => {
      try {
        const stored = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
        if (stored) {
          const { userId, timestamp } = JSON.parse(stored);
          // Sessão válida por 30 dias
          const thirtyDays = 30 * 24 * 60 * 60 * 1000;
          if (Date.now() - timestamp > thirtyDays) {
            await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
          }
        }
      } catch (error) {
        console.error('Erro ao verificar sessão:', error);
      }
    };
    
    checkStoredSession();
  }, []);

  // ===========================================================================
  // 📊 VALORES COMPUTADOS
  // ===========================================================================

  const isAuthenticated = useMemo(() => {
    return !!currentUser && currentUser.emailVerified && currentUser.status === 'active';
  }, [currentUser]);

  const hasPremium = useMemo(() => {
    if (!currentUser) return false;
    const { subscription } = currentUser;
    const now = new Date();
    
    if (subscription.status === 'trial' && subscription.trialEndDate) {
      return new Date(subscription.trialEndDate.toDate()) > now;
    }
    
    if (subscription.status === 'active' && subscription.endDate) {
      return new Date(subscription.endDate.toDate()) > now;
    }
    
    return false;
  }, [currentUser]);

  const isAgroUser = useMemo(() => {
    return currentUser?.profile.isAgroUser ?? false;
  }, [currentUser]);

  const hasNetworkRural = useMemo(() => {
    if (!currentUser || !currentUser.networkRural.isActive) return false;
    const { subscription } = currentUser.networkRural;
    const now = new Date();
    
    if (subscription.plan === 'lifetime') return true;
    
    if (subscription.status === 'trial' && subscription.trialEndDate) {
      return new Date(subscription.trialEndDate.toDate()) > now;
    }
    
    if (subscription.status === 'active' && subscription.endDate) {
      return new Date(subscription.endDate.toDate()) > now;
    }
    
    return false;
  }, [currentUser]);

  const networkTrialDaysRemaining = useMemo(() => {
    if (!currentUser) return 0;
    const { subscription } = currentUser.networkRural;
    
    if (subscription.status !== 'trial' || !subscription.trialEndDate) return 0;
    
    const endDate = new Date(subscription.trialEndDate.toDate());
    const now = new Date();
    const diffMs = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  }, [currentUser]);

  // ===========================================================================
  // 🔐 AÇÕES DE AUTENTICAÇÃO
  // ===========================================================================

  /**
   * Registrar novo usuário
   */
  const register = useCallback(async (data: RegisterData): Promise<LoginResult> => {
    try {
      setIsLoading(true);
      const result = await registerUser(data);
      
      if (result.success && result.user) {
        setPendingUserId(result.user.id);
      }
      
      return result;
    } catch (error: any) {
      console.error('Erro no registro:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Login
   */
  const login = useCallback(async (email: string, password: string): Promise<LoginResult> => {
    try {
      setIsLoading(true);
      const result = await loginUser(email, password);
      
      if (result.success && result.user) {
        setCurrentUser(result.user);
        
        // Definir userType baseado no tipo de conta
        if (result.user.userType === 'produtor') {
          setUserType('producer');
        } else {
          setUserType('regular');
        }
      } else if (result.requiresVerification && result.user) {
        setPendingUserId(result.user.id);
        setCurrentUser(null);
      } else {
        // Limpar o currentUser em caso de erro
        setCurrentUser(null);
      }
      
      return result;
    } catch (error: any) {
      console.error('Erro no login:', error);
      setCurrentUser(null);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Logout
   */
  const logout = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      await logoutUser();
      setCurrentUser(null);
      setPendingUserId(null);
      setUserType('regular');
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (error) {
      console.error('Erro no logout:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Verificar código de email
   */
  const verifyEmail = useCallback(async (code: string): Promise<boolean> => {
    if (!pendingUserId) {
      console.error('Nenhum usuário pendente para verificação');
      return false;
    }
    
    try {
      setIsLoading(true);
      const result = await verifyEmailCode(pendingUserId, code);
      
      if (result.success) {
        setPendingUserId(null);
      }
      
      return result.success;
    } catch (error) {
      console.error('Erro na verificação:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [pendingUserId]);

  /**
   * Reenviar código de verificação
   */
  const resendCode = useCallback(async (): Promise<boolean> => {
    if (!pendingUserId) {
      console.error('Nenhum usuário pendente para reenvio');
      return false;
    }
    
    try {
      const result = await resendVerificationCode(pendingUserId);
      return result.success;
    } catch (error) {
      console.error('Erro ao reenviar código:', error);
      return false;
    }
  }, [pendingUserId]);

  /**
   * Recuperar senha
   */
  const resetPassword = useCallback(async (email: string): Promise<boolean> => {
    try {
      const result = await firebaseResetPassword(email);
      return result.success;
    } catch (error) {
      console.error('Erro na recuperação de senha:', error);
      return false;
    }
  }, []);

  // ===========================================================================
  // 👤 AÇÕES DE PERFIL
  // ===========================================================================

  /**
   * Atualizar perfil
   */
  const updateProfile = useCallback(async (data: Partial<UserProfile>): Promise<void> => {
    if (!currentUser) {
      throw new Error('Usuário não autenticado');
    }
    
    try {
      await updateUserProfile(currentUser.id, data);
      
      // Atualizar estado local
      setCurrentUser(prev => {
        if (!prev) return null;
        return {
          ...prev,
          profile: { ...prev.profile, ...data },
        };
      });
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      throw error;
    }
  }, [currentUser]);

  /**
   * Atualizar fotos
   */
  const updatePhotos = useCallback(async (photos: string[]): Promise<void> => {
    if (!currentUser) {
      throw new Error('Usuário não autenticado');
    }
    
    try {
      await updateUserPhotos(currentUser.id, photos);
      
      // Atualizar estado local
      setCurrentUser(prev => {
        if (!prev) return null;
        return {
          ...prev,
          profile: { ...prev.profile, photos },
        };
      });
    } catch (error) {
      console.error('Erro ao atualizar fotos:', error);
      throw error;
    }
  }, [currentUser]);

  /**
   * Atualizar configurações de descoberta
   */
  const updateDiscoverySettings = useCallback(async (settings: Partial<DiscoverySettings>): Promise<void> => {
    if (!currentUser) {
      throw new Error('Usuário não autenticado');
    }
    
    try {
      await updateDiscoverySettingsFirestore(currentUser.id, settings);
      
      // Atualizar estado local
      setCurrentUser(prev => {
        if (!prev) return null;
        return {
          ...prev,
          discoverySettings: { ...prev.discoverySettings, ...settings },
        };
      });
    } catch (error) {
      console.error('Erro ao atualizar configurações de descoberta:', error);
      throw error;
    }
  }, [currentUser]);

  /**
   * Recarregar dados do usuário do Firestore
   */
  const refreshUserData = useCallback(async (): Promise<void> => {
    if (!currentUser?.id) return;
    
    try {
      const { getDoc, doc } = await import('firebase/firestore');
      const { firestore } = await import('@/firebase/config');
      
      const userRef = doc(firestore, 'users', currentUser.id);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = { ...userSnap.data(), id: currentUser.id } as FirebaseUser;
        setCurrentUser(userData);
        console.log('✅ Dados do usuário recarregados com sucesso');
      }
    } catch (error) {
      console.error('Erro ao recarregar dados do usuário:', error);
    }
  }, [currentUser?.id]);

  // ===========================================================================
  // 💳 AÇÕES DE ASSINATURA
  // ===========================================================================

  /**
   * Ativar trial premium
   */
  const activatePremiumTrial = useCallback(async (): Promise<boolean> => {
    if (!currentUser) return false;
    
    try {
      const result = await firebaseActivatePremiumTrial(currentUser.id);
      
      if (result.success) {
        // Recarregar dados do usuário
        // O listener de auth state mudança vai atualizar automaticamente
      }
      
      return result.success;
    } catch (error) {
      console.error('Erro ao ativar trial premium:', error);
      return false;
    }
  }, [currentUser]);

  /**
   * Ativar trial Network Rural
   */
  const activateNetworkTrial = useCallback(async (): Promise<boolean> => {
    if (!currentUser) return false;
    
    try {
      const result = await firebaseActivateNetworkTrial(currentUser.id);
      return result.success;
    } catch (error) {
      console.error('Erro ao ativar trial network:', error);
      return false;
    }
  }, [currentUser]);

  /**
   * Assinar plano
   */
  const subscribeToPlan = useCallback(async (planId: string): Promise<boolean> => {
    try {
      // Mapear IDs de planos do mockData para IDs do Firebase
      const planIdMapping: Record<string, SubscriptionPlan> = {
        'paixao_sertaneja': 'premium_monthly',
        'coracao_do_campo': 'premium_quarterly',
        'alma_rural': 'premium_annual',
        'premium_monthly': 'premium_monthly',
        'premium_quarterly': 'premium_quarterly',
        'premium_annual': 'premium_annual',
      };

      // Se não há usuário logado no Firebase, simular localmente
      if (!currentUser || !currentUser.id) {
        console.log('📱 Simulando assinatura localmente (sem Firebase)');
        // Simular sucesso - em produção integraria com Firebase
        return true;
      }

      // Verificar se é plano premium ou network
      if (planId.startsWith('network_')) {
        // Extrair o tipo de plano (monthly ou lifetime)
        const planType = planId.replace('network_', '') as 'monthly' | 'lifetime';
        const result = await subscribeToNetwork(currentUser.id, planType);
        return result.success;
      } else {
        // Usar o mapeamento ou o ID original
        const mappedPlanId = planIdMapping[planId] || (planId as SubscriptionPlan);
        
        try {
          const result = await subscribeToPremium(currentUser.id, mappedPlanId);
          
          if (result.success) {
            // Recarregar dados do usuário após assinatura bem-sucedida
            await refreshUserData();
          }
          
          return result.success;
        } catch (firebaseError) {
          // Se Firebase falhar, simular sucesso para demo
          console.log('📱 Firebase indisponível, simulando assinatura localmente');
          return true;
        }
      }
    } catch (error) {
      console.error('Erro ao assinar plano:', error);
      // Retornar true para demo/simulação
      return true;
    }
  }, [currentUser, refreshUserData]);

  /**
   * Cancelar premium
   */
  const cancelPremium = useCallback(async (): Promise<boolean> => {
    if (!currentUser) return false;
    
    try {
      const result = await cancelPremiumSubscription(currentUser.id);
      return result.success;
    } catch (error) {
      console.error('Erro ao cancelar premium:', error);
      return false;
    }
  }, [currentUser]);

  /**
   * Cancelar Network Rural
   */
  const cancelNetworkRural = useCallback(async (): Promise<boolean> => {
    if (!currentUser) return false;
    
    try {
      const result = await firebaseCancelNetworkSubscription(currentUser.id);
      return result.success;
    } catch (error) {
      console.error('Erro ao cancelar network:', error);
      return false;
    }
  }, [currentUser]);

  // ===========================================================================
  // 🔄 RETROCOMPATIBILIDADE
  // ===========================================================================

  /**
   * Atualizar usuário (retrocompatibilidade com código legado)
   */
  const updateUser = useCallback((updates: Partial<User>) => {
    if (!currentUser) return;
    
    // Mapear campos do User legado para UserProfile
    const profileUpdates: Partial<UserProfile> = {};
    
    if (updates.name) profileUpdates.name = updates.name;
    if (updates.bio) profileUpdates.bio = updates.bio;
    if (updates.photos) profileUpdates.photos = updates.photos;
    if (updates.city) profileUpdates.city = updates.city;
    if (updates.occupation) profileUpdates.occupation = updates.occupation;
    if (updates.interests) profileUpdates.interests = updates.interests;
    
    if (Object.keys(profileUpdates).length > 0) {
      updateProfile(profileUpdates).catch(console.error);
    }
  }, [currentUser, updateProfile]);

  /**
   * Toggle premium (retrocompatibilidade - agora ativa trial)
   */
  const togglePremium = useCallback(() => {
    if (hasPremium) {
      cancelPremium().catch(console.error);
    } else {
      activatePremiumTrial().catch(console.error);
    }
  }, [hasPremium, activatePremiumTrial, cancelPremium]);

  /**
   * Set isAgroUser (retrocompatibilidade)
   */
  const setIsAgroUser = useCallback((isAgro: boolean) => {
    updateProfile({ isAgroUser: isAgro }).catch(console.error);
  }, [updateProfile]);

  /**
   * Subscribe Network Monthly (retrocompatibilidade)
   */
  const subscribeNetworkMonthly = useCallback(async (): Promise<boolean> => {
    return subscribeToPlan('network_monthly');
  }, [subscribeToPlan]);

  /**
   * Subscribe Network Lifetime (retrocompatibilidade)
   */
  const subscribeNetworkLifetime = useCallback(async (): Promise<boolean> => {
    return subscribeToPlan('network_lifetime');
  }, [subscribeToPlan]);

  /**
   * Cancel Network Subscription (retrocompatibilidade)
   */
  const cancelNetworkSubscription = useCallback(async (): Promise<boolean> => {
    return cancelNetworkRural();
  }, [cancelNetworkRural]);

  /**
   * Computed Network Subscription (retrocompatibilidade)
   */
  const networkSubscription = useMemo((): NetworkRuralSubscription | null => {
    if (!currentUser || !currentUser.networkRural.isActive) return null;
    
    const sub = currentUser.networkRural.subscription;
    
    // Calcular datas para retrocompatibilidade
    const startDate = sub.startDate?.toDate() ?? null;
    const endDate = sub.endDate?.toDate() ?? null;
    const trialEndDate = sub.trialEndDate?.toDate() ?? null;
    
    // Mapear status do Firebase para NetworkSubscriptionStatus
    const mapStatus = (status: string): NetworkSubscriptionStatus => {
      switch (status) {
        case 'trial': return 'trial';
        case 'active': return sub.plan === 'lifetime' ? 'lifetime' : 'active';
        case 'expired': return 'expired';
        case 'cancelled': return 'expired';
        default: return 'inactive';
      }
    };
    
    // Determinar preço baseado no plano
    const price = sub.plan === 'lifetime' ? 9.90 : 14.90;
    
    return {
      status: mapStatus(sub.status),
      planType: sub.plan,
      startDate,
      endDate,
      trialEndDate,
      price,
      autoRenew: sub.status === 'active' && sub.plan !== 'lifetime',
    };
  }, [currentUser]);
  // ===========================================================================
  // 📤 PROVIDER VALUE
  // ===========================================================================

  const value = useMemo<AuthContextType>(() => ({
    // Estado
    currentUser,
    isAuthenticated,
    isLoading,
    
    // Premium
    hasPremium,
    
    // Network Rural
    isAgroUser,
    hasNetworkRural,
    networkTrialDaysRemaining,
    
    // User type
    userType,
    setUserType,
    
    // Auth actions
    register,
    login,
    logout,
    verifyEmail,
    resendCode,
    resetPassword,
    
    // Profile actions
    updateProfile,
    updatePhotos,
    updateDiscoverySettings,
    refreshUserData,
    
    // Subscription actions
    activatePremiumTrial,
    activateNetworkTrial,
    subscribeToPlan,
    cancelPremium,
    cancelNetworkRural,
    
    // Retrocompatibilidade - Network Rural legacy
    subscribeNetworkMonthly,
    subscribeNetworkLifetime,
    cancelNetworkSubscription,
    networkSubscription,
    
    // Retrocompatibilidade
    updateUser,
    togglePremium,
    setIsAgroUser,
    
    // Pending user
    pendingUserId,
    setPendingUserId,
  }), [
    currentUser,
    isAuthenticated,
    isLoading,
    hasPremium,
    isAgroUser,
    hasNetworkRural,
    networkTrialDaysRemaining,
    userType,
    register,
    login,
    logout,
    verifyEmail,
    resendCode,
    resetPassword,
    updateProfile,
    updatePhotos,
    updateDiscoverySettings,
    refreshUserData,
    activatePremiumTrial,
    activateNetworkTrial,
    subscribeToPlan,
    cancelPremium,
    cancelNetworkRural,
    subscribeNetworkMonthly,
    subscribeNetworkLifetime,
    cancelNetworkSubscription,
    networkSubscription,
    updateUser,
    togglePremium,
    setIsAgroUser,
    pendingUserId,
  ]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// =============================================================================
// 🪝 HOOK
// =============================================================================

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// =============================================================================
// 🔧 HOOKS AUXILIARES
// =============================================================================

/**
 * Hook para verificar se está carregando autenticação
 */
export function useAuthLoading(): boolean {
  const { isLoading } = useAuth();
  return isLoading;
}

/**
 * Hook para obter apenas o usuário atual
 */
export function useCurrentUser(): FirebaseUser | null {
  const { currentUser } = useAuth();
  return currentUser;
}

/**
 * Hook para verificar status premium
 */
export function usePremiumStatus(): { hasPremium: boolean; isLoading: boolean } {
  const { hasPremium, isLoading } = useAuth();
  return { hasPremium, isLoading };
}

/**
 * Hook para verificar status Network Rural
 */
export function useNetworkRuralStatus(): {
  isAgroUser: boolean;
  hasNetworkRural: boolean;
  trialDaysRemaining: number;
  isLoading: boolean;
} {
  const { isAgroUser, hasNetworkRural, networkTrialDaysRemaining, isLoading } = useAuth();
  return {
    isAgroUser,
    hasNetworkRural,
    trialDaysRemaining: networkTrialDaysRemaining,
    isLoading,
  };
}
