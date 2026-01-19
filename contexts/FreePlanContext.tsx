/**
 * 🎯 BOTA LOVE APP - Contexto do Plano Gratuito
 * 
 * Gerencia estado global dos limites do usuário
 * Integra com o serviço de plano gratuito
 * 
 * @author Bota Love Team
 */

import {
    canLikeProfile,
    canSendMessage,
    canViewProfile,
    CONVERSION_MESSAGES,
    ConversionTrigger,
    FreePlanLimits,
    FreePlanPeriod,
    getLikesInfo,
    getMessagesInfo,
    getProfileVisibility,
    getUserPeriodInfo,
    getViewsInfo,
    incrementLikeCount,
    incrementMessageCount,
    incrementViewCount,
    ProfileVisibility
} from '@/data/freePlanService';
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

// ============================================
// 📊 TIPOS E INTERFACES
// ============================================

interface FreePlanContextType {
  // Estado do usuário
  isFreePlan: boolean;
  currentPeriod: FreePlanPeriod;
  periodName: string;
  daysActive: number;
  limits: FreePlanLimits;
  
  // Informações de uso
  viewsInfo: { used: number; limit: number | 'unlimited'; remaining: number | 'unlimited' };
  likesInfo: { used: number; limit: number | 'unlimited'; remaining: number | 'unlimited' };
  
  // Visibilidade de perfis
  profileVisibility: ProfileVisibility;
  
  // Verificações de permissão (silenciosas - sem avisos)
  checkCanView: () => boolean;
  checkCanLike: () => boolean;
  checkCanSendMessage: (matchId: string) => boolean;
  
  // Ações que consomem limites
  consumeView: () => boolean;
  consumeLike: () => boolean;
  consumeMessage: (matchId: string) => boolean;
  
  // Informações de mensagem por match
  getMatchMessagesInfo: (matchId: string) => {
    sent: number;
    limit: number;
    remaining: number;
    canSend: boolean;
    canRead: boolean;
  };
  
  // Modal de conversão
  showConversionModal: boolean;
  conversionTrigger: ConversionTrigger | null;
  triggerConversion: (type: ConversionTrigger['type']) => void;
  dismissConversion: () => void;
  
  // Refresh de estado
  refreshState: () => void;
}

// ============================================
// 📦 CONTEXTO
// ============================================

const FreePlanContext = createContext<FreePlanContextType | undefined>(undefined);

// ============================================
// 🎁 PROVIDER
// ============================================

export function FreePlanProvider({ children }: { children: ReactNode }) {
  const { currentUser, hasPremium } = useAuth();
  
  // Estado do modal de conversão
  const [showConversionModal, setShowConversionModal] = useState(false);
  const [conversionTrigger, setConversionTrigger] = useState<ConversionTrigger | null>(null);
  
  // Estado do plano (re-calculado em cada refresh)
  const [planState, setPlanState] = useState<{
    period: FreePlanPeriod;
    periodName: string;
    daysActive: number;
    limits: FreePlanLimits;
    viewsInfo: { used: number; limit: number | 'unlimited'; remaining: number | 'unlimited' };
    likesInfo: { used: number; limit: number | 'unlimited'; remaining: number | 'unlimited' };
  }>(() => {
    if (!currentUser?.id) {
      return {
        period: 'day1',
        periodName: 'Dia de Boas-vindas',
        daysActive: 0,
        limits: {
          dailyViews: 'unlimited',
          dailyLikes: 'unlimited',
          messagesPerMatch: 2,
          canSendMessages: true,
          canReadMessages: true,
        },
        viewsInfo: { used: 0, limit: 'unlimited', remaining: 'unlimited' },
        likesInfo: { used: 0, limit: 'unlimited', remaining: 'unlimited' },
      };
    }
    
    const info = getUserPeriodInfo(currentUser.id);
    return {
      period: info.period,
      periodName: info.periodName,
      daysActive: info.daysActive,
      limits: info.limits,
      viewsInfo: getViewsInfo(currentUser.id),
      likesInfo: getLikesInfo(currentUser.id),
    };
  });
  
  // Refresh do estado
  const refreshState = useCallback(() => {
    if (!currentUser?.id) return;
    
    const info = getUserPeriodInfo(currentUser.id);
    setPlanState({
      period: info.period,
      periodName: info.periodName,
      daysActive: info.daysActive,
      limits: info.limits,
      viewsInfo: getViewsInfo(currentUser.id),
      likesInfo: getLikesInfo(currentUser.id),
    });
  }, [currentUser?.id]);
  
  // Atualizar quando usuário muda
  useEffect(() => {
    refreshState();
  }, [refreshState, currentUser?.id, hasPremium]);
  
  // ============================================
  // 🔍 VERIFICAÇÕES (SILENCIOSAS)
  // ============================================
  
  const checkCanView = useCallback((): boolean => {
    if (hasPremium) return true;
    if (!currentUser?.id) return false;
    return canViewProfile(currentUser.id);
  }, [currentUser?.id, hasPremium]);
  
  const checkCanLike = useCallback((): boolean => {
    if (hasPremium) return true;
    if (!currentUser?.id) return false;
    return canLikeProfile(currentUser.id);
  }, [currentUser?.id, hasPremium]);
  
  const checkCanSendMessage = useCallback((matchId: string): boolean => {
    if (hasPremium) return true;
    if (!currentUser?.id) return false;
    return canSendMessage(currentUser.id, matchId);
  }, [currentUser?.id, hasPremium]);
  
  // ============================================
  // ⚡ AÇÕES QUE CONSOMEM LIMITES
  // ============================================
  
  const consumeView = useCallback((): boolean => {
    if (hasPremium) return true;
    if (!currentUser?.id) return false;
    
    if (!canViewProfile(currentUser.id)) {
      setConversionTrigger(CONVERSION_MESSAGES.views);
      setShowConversionModal(true);
      return false;
    }
    
    incrementViewCount(currentUser.id);
    refreshState();
    return true;
  }, [currentUser?.id, hasPremium, refreshState]);
  
  const consumeLike = useCallback((): boolean => {
    if (hasPremium) return true;
    if (!currentUser?.id) return false;
    
    if (!canLikeProfile(currentUser.id)) {
      setConversionTrigger(CONVERSION_MESSAGES.likes);
      setShowConversionModal(true);
      return false;
    }
    
    incrementLikeCount(currentUser.id);
    refreshState();
    return true;
  }, [currentUser?.id, hasPremium, refreshState]);
  
  const consumeMessage = useCallback((matchId: string): boolean => {
    if (hasPremium) return true;
    if (!currentUser?.id) return false;
    
    if (!canSendMessage(currentUser.id, matchId)) {
      setConversionTrigger(CONVERSION_MESSAGES.messages);
      setShowConversionModal(true);
      return false;
    }
    
    incrementMessageCount(currentUser.id, matchId);
    return true;
  }, [currentUser?.id, hasPremium]);
  
  // ============================================
  // 💬 INFORMAÇÕES DE MENSAGENS POR MATCH
  // ============================================
  
  const getMatchMessagesInfo = useCallback((matchId: string) => {
    if (hasPremium) {
      return {
        sent: 0,
        limit: Infinity,
        remaining: Infinity,
        canSend: true,
        canRead: true,
      };
    }
    if (!currentUser?.id) {
      return {
        sent: 0,
        limit: 0,
        remaining: 0,
        canSend: false,
        canRead: true,
      };
    }
    return getMessagesInfo(currentUser.id, matchId);
  }, [currentUser?.id, hasPremium]);
  
  // ============================================
  // 🎯 MODAL DE CONVERSÃO
  // ============================================
  
  const triggerConversion = useCallback((type: ConversionTrigger['type']) => {
    setConversionTrigger(CONVERSION_MESSAGES[type]);
    setShowConversionModal(true);
  }, []);
  
  const dismissConversion = useCallback(() => {
    setShowConversionModal(false);
    setConversionTrigger(null);
  }, []);
  
  // ============================================
  // 📦 VALOR DO CONTEXTO
  // ============================================
  
  const value: FreePlanContextType = {
    // Estado
    isFreePlan: !hasPremium,
    currentPeriod: planState.period,
    periodName: planState.periodName,
    daysActive: planState.daysActive,
    limits: planState.limits,
    
    // Uso
    viewsInfo: planState.viewsInfo,
    likesInfo: planState.likesInfo,
    
    // Visibilidade
    profileVisibility: getProfileVisibility(hasPremium),
    
    // Verificações
    checkCanView,
    checkCanLike,
    checkCanSendMessage,
    
    // Ações
    consumeView,
    consumeLike,
    consumeMessage,
    
    // Mensagens
    getMatchMessagesInfo,
    
    // Modal
    showConversionModal,
    conversionTrigger,
    triggerConversion,
    dismissConversion,
    
    // Refresh
    refreshState,
  };
  
  return (
    <FreePlanContext.Provider value={value}>
      {children}
    </FreePlanContext.Provider>
  );
}

// ============================================
// 🪝 HOOK
// ============================================

export function useFreePlan() {
  const context = useContext(FreePlanContext);
  if (context === undefined) {
    throw new Error('useFreePlan must be used within a FreePlanProvider');
  }
  return context;
}

export type { FreePlanContextType };
