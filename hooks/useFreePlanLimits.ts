/**
 * 🪝 BOTA LOVE APP - Hook useFreePlanLimits
 * 
 * Hook utilitário para facilitar o uso dos limites do plano gratuito
 * em qualquer componente da aplicação.
 * 
 * @author Bota Love Team
 */

import { useAuth } from '@/contexts/AuthContext';
import { useFreePlan } from '@/contexts/FreePlanContext';
import {
    getSanitizedContent,
    hasContactInfo,
    isSafeContent,
    moderateBio,
    moderateContent,
    moderateMessage,
    moderateName,
    shouldBlockContent,
} from '@/data/contentModerationService';
import {
    canUseAdvancedFilter,
    CONVERSION_MESSAGES,
    filterProfileData,
    getLockedFilters,
} from '@/data/freePlanService';
import { useCallback, useMemo } from 'react';

// ============================================
// 🎯 HOOK PRINCIPAL
// ============================================

export function useFreePlanLimits() {
  const { hasPremium, currentUser } = useAuth();
  const freePlan = useFreePlan();
  
  // ============================================
  // 👀 VISUALIZAÇÕES
  // ============================================
  
  const views = useMemo(() => ({
    canView: freePlan.checkCanView(),
    used: freePlan.viewsInfo.used,
    limit: freePlan.viewsInfo.limit,
    remaining: freePlan.viewsInfo.remaining,
    isUnlimited: freePlan.viewsInfo.limit === 'unlimited',
  }), [freePlan]);
  
  const consumeView = useCallback(() => {
    return freePlan.consumeView();
  }, [freePlan]);
  
  // ============================================
  // 💚 CURTIDAS
  // ============================================
  
  const likes = useMemo(() => ({
    canLike: freePlan.checkCanLike(),
    used: freePlan.likesInfo.used,
    limit: freePlan.likesInfo.limit,
    remaining: freePlan.likesInfo.remaining,
    isUnlimited: freePlan.likesInfo.limit === 'unlimited',
  }), [freePlan]);
  
  const consumeLike = useCallback(() => {
    return freePlan.consumeLike();
  }, [freePlan]);
  
  // ============================================
  // 💬 MENSAGENS
  // ============================================
  
  const getMessageLimits = useCallback((matchId: string) => {
    const info = freePlan.getMatchMessagesInfo(matchId);
    return {
      canSend: info.canSend,
      canRead: info.canRead,
      sent: info.sent,
      limit: info.limit,
      remaining: info.remaining,
    };
  }, [freePlan]);
  
  const consumeMessage = useCallback((matchId: string) => {
    return freePlan.consumeMessage(matchId);
  }, [freePlan]);
  
  // ============================================
  // 🔒 FILTROS
  // ============================================
  
  const filters = useMemo(() => ({
    lockedFilters: getLockedFilters(),
    canUseFilter: (filterId: string) => canUseAdvancedFilter(filterId, hasPremium),
  }), [hasPremium]);
  
  // ============================================
  // 👤 PERFIS
  // ============================================
  
  const profile = useMemo(() => ({
    visibility: freePlan.profileVisibility,
    canViewFull: hasPremium,
    filterData: <T extends Record<string, any>>(data: T) => filterProfileData(data, hasPremium),
  }), [freePlan.profileVisibility, hasPremium]);
  
  // ============================================
  // 🔐 MODERAÇÃO DE CONTEÚDO
  // ============================================
  
  const moderation = useMemo(() => ({
    moderateContent,
    moderateBio,
    moderateMessage,
    moderateName,
    isSafe: isSafeContent,
    shouldBlock: shouldBlockContent,
    hasContact: hasContactInfo,
    sanitize: getSanitizedContent,
  }), []);
  
  // ============================================
  // 📊 ESTADO DO PLANO
  // ============================================
  
  const planStatus = useMemo(() => ({
    isFreePlan: freePlan.isFreePlan,
    isPremium: hasPremium,
    period: freePlan.currentPeriod,
    periodName: freePlan.periodName,
    daysActive: freePlan.daysActive,
    limits: freePlan.limits,
  }), [freePlan, hasPremium]);
  
  // ============================================
  // 🎯 CONVERSÃO
  // ============================================
  
  const conversion = useMemo(() => ({
    show: freePlan.showConversionModal,
    trigger: freePlan.conversionTrigger,
    triggerConversion: freePlan.triggerConversion,
    dismiss: freePlan.dismissConversion,
    messages: CONVERSION_MESSAGES,
  }), [freePlan]);
  
  return {
    // Estado
    planStatus,
    
    // Visualizações
    views,
    consumeView,
    
    // Curtidas
    likes,
    consumeLike,
    
    // Mensagens
    getMessageLimits,
    consumeMessage,
    
    // Filtros
    filters,
    
    // Perfis
    profile,
    
    // Moderação
    moderation,
    
    // Conversão
    conversion,
    
    // Refresh
    refresh: freePlan.refreshState,
  };
}

// ============================================
// 🎣 HOOKS ESPECÍFICOS
// ============================================

/**
 * Hook específico para controle de visualizações
 */
export function useViewLimits() {
  const { views, consumeView, conversion } = useFreePlanLimits();
  
  return {
    ...views,
    consume: consumeView,
    triggerConversion: () => conversion.triggerConversion('views'),
  };
}

/**
 * Hook específico para controle de curtidas
 */
export function useLikeLimits() {
  const { likes, consumeLike, conversion } = useFreePlanLimits();
  
  return {
    ...likes,
    consume: consumeLike,
    triggerConversion: () => conversion.triggerConversion('likes'),
  };
}

/**
 * Hook específico para controle de mensagens
 */
export function useMessageLimits(matchId: string) {
  const { getMessageLimits, consumeMessage, conversion } = useFreePlanLimits();
  
  const limits = getMessageLimits(matchId);
  
  return {
    ...limits,
    consume: () => consumeMessage(matchId),
    triggerConversion: () => conversion.triggerConversion('messages'),
  };
}

/**
 * Hook específico para moderação de conteúdo
 */
export function useContentModeration() {
  const { moderation } = useFreePlanLimits();
  return moderation;
}

/**
 * Hook específico para filtros avançados
 */
export function useAdvancedFilters() {
  const { filters, conversion } = useFreePlanLimits();
  
  return {
    ...filters,
    triggerConversion: () => conversion.triggerConversion('filters'),
  };
}

/**
 * Hook específico para visibilidade de perfil
 */
export function useProfileVisibility() {
  const { profile, conversion } = useFreePlanLimits();
  
  return {
    ...profile,
    triggerConversion: () => conversion.triggerConversion('profile'),
  };
}

export default useFreePlanLimits;
