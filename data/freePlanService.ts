/**
 * 🎯 BOTA LOVE APP - Sistema de Plano Gratuito
 * 
 * Controle progressivo de limites com experiência fluida
 * Sem avisos constantes - conversão apenas no bloqueio
 * 
 * @author Bota Love Team
 */

// ============================================
// 📊 TIPOS E INTERFACES
// ============================================

export type FreePlanPeriod = 
  | 'day1'           // 1º dia - Onboarding forte
  | 'days2to7'       // 2º ao 7º dia
  | 'days8to10'      // 8º ao 10º dia
  | 'days11to14'     // 11º ao 14º dia
  | 'afterFirstMonth' // Após o período inicial
  | 'mature';        // Após 2º mês em diante

export interface FreePlanLimits {
  dailyViews: number | 'unlimited';
  dailyLikes: number | 'unlimited';
  messagesPerMatch: number; // 0 = apenas leitura
  canSendMessages: boolean;
  canReadMessages: boolean;
}

export interface UserFreePlanState {
  userId: string;
  registrationDate: Date;
  currentPeriod: FreePlanPeriod;
  daysActive: number;
  monthsActive: number;
  
  // Contadores diários
  dailyViewsUsed: number;
  dailyLikesUsed: number;
  lastResetDate: string; // YYYY-MM-DD
  
  // Contadores de mensagens por match
  messagesPerMatchUsed: Map<string, number>; // matchId -> count
}

export interface ProfileVisibility {
  // Informações visíveis no plano gratuito
  age: boolean;
  city: boolean;
  distance: boolean;
  gender: boolean;
  
  // Informações bloqueadas no plano gratuito
  fullBio: boolean;
  profession: boolean;
  interests: boolean;
  extraPhotos: boolean;
  preferences: boolean;
  premiumData: boolean;
}

export interface ConversionTrigger {
  type: 'views' | 'likes' | 'messages' | 'filters' | 'profile';
  title: string;
  message: string;
  ctaText: string;
}

// ============================================
// 📅 CONFIGURAÇÃO DE LIMITES POR PERÍODO
// ============================================

export const FREE_PLAN_LIMITS: Record<FreePlanPeriod, FreePlanLimits> = {
  // 🟢 1º DIA - Onboarding forte
  day1: {
    dailyViews: 'unlimited',
    dailyLikes: 'unlimited',
    messagesPerMatch: 2,
    canSendMessages: true,
    canReadMessages: true,
  },
  
  // 🟡 2º AO 7º DIA
  days2to7: {
    dailyViews: 120,
    dailyLikes: 25,
    messagesPerMatch: 1,
    canSendMessages: true,
    canReadMessages: true,
  },
  
  // 🟠 8º AO 10º DIA
  days8to10: {
    dailyViews: 50,
    dailyLikes: 25,
    messagesPerMatch: 1,
    canSendMessages: true,
    canReadMessages: true,
  },
  
  // 🔴 11º AO 14º DIA
  days11to14: {
    dailyViews: 50,
    dailyLikes: 20,
    messagesPerMatch: 1,
    canSendMessages: true,
    canReadMessages: true,
  },
  
  // 🔁 Após o 14º dia (primeiro mês)
  afterFirstMonth: {
    dailyViews: 50,
    dailyLikes: 3,
    messagesPerMatch: 0,
    canSendMessages: false,
    canReadMessages: true,
  },
  
  // 🔁 Após o 7º dia (segundo mês em diante)
  mature: {
    dailyViews: 50,
    dailyLikes: 3,
    messagesPerMatch: 0,
    canSendMessages: false,
    canReadMessages: true,
  },
};

// ============================================
// 👤 VISIBILIDADE DE PERFIS PARA PLANO GRATUITO
// ============================================

export const FREE_PLAN_PROFILE_VISIBILITY: ProfileVisibility = {
  // ✅ Liberadas
  age: true,
  city: true,
  distance: true,
  gender: true,
  
  // ❌ Bloqueadas
  fullBio: false,
  profession: false,
  interests: false,
  extraPhotos: false,
  preferences: false,
  premiumData: false,
};

export const PREMIUM_PROFILE_VISIBILITY: ProfileVisibility = {
  age: true,
  city: true,
  distance: true,
  gender: true,
  fullBio: true,
  profession: true,
  interests: true,
  extraPhotos: true,
  preferences: true,
  premiumData: true,
};

// ============================================
// 💬 MENSAGENS DE CONVERSÃO
// ============================================

export const CONVERSION_MESSAGES: Record<ConversionTrigger['type'], ConversionTrigger> = {
  messages: {
    type: 'messages',
    title: '💬 Chat Ilimitado!',
    message: 'Continue a conversa com o chat Ilimitado, assine um Plano e destrave tudo!!!',
    ctaText: 'Ver Planos',
  },
  views: {
    type: 'views',
    title: '👀 Limite de Visualizações',
    message: 'Você viu todos os perfis disponíveis hoje! Assine para perfis ilimitados.',
    ctaText: 'Desbloquear Perfis',
  },
  likes: {
    type: 'likes',
    title: '💚 Limite de Curtidas',
    message: 'Suas curtidas de hoje acabaram! Assine para curtir sem limites.',
    ctaText: 'Curtir Ilimitado',
  },
  filters: {
    type: 'filters',
    title: '🔍 Filtros Avançados',
    message: 'Filtros avançados são exclusivos para assinantes. Encontre exatamente quem você procura!',
    ctaText: 'Desbloquear Filtros',
  },
  profile: {
    type: 'profile',
    title: '👤 Perfil Completo',
    message: 'Veja a bio completa, interesses e muito mais! Assine e conheça melhor.',
    ctaText: 'Ver Perfil Completo',
  },
};

// ============================================
// 🔒 FILTROS AVANÇADOS (BLOQUEADOS NO PLANO GRATUITO)
// ============================================

export interface AdvancedFilter {
  id: string;
  name: string;
  icon: string;
  description: string;
  isPremium: boolean;
}

export const ADVANCED_FILTERS: AdvancedFilter[] = [
  { id: 'distance', name: 'Distância Personalizada', icon: '📍', description: 'Defina raio exato', isPremium: true },
  { id: 'height', name: 'Altura', icon: '📏', description: 'Filtre por altura', isPremium: true },
  { id: 'education', name: 'Escolaridade', icon: '🎓', description: 'Nível educacional', isPremium: true },
  { id: 'children', name: 'Filhos', icon: '👶', description: 'Preferência sobre filhos', isPremium: true },
  { id: 'smoking', name: 'Fumante', icon: '🚬', description: 'Hábito de fumar', isPremium: true },
  { id: 'drinking', name: 'Bebida', icon: '🍺', description: 'Hábito de beber', isPremium: true },
  { id: 'religion', name: 'Religião', icon: '🙏', description: 'Crença religiosa', isPremium: true },
  { id: 'zodiac', name: 'Signo', icon: '⭐', description: 'Signo do zodíaco', isPremium: true },
  { id: 'pets', name: 'Animais', icon: '🐾', description: 'Tem pets', isPremium: true },
  { id: 'verified', name: 'Verificados', icon: '✓', description: 'Apenas verificados', isPremium: true },
  { id: 'online', name: 'Online Agora', icon: '🟢', description: 'Usuários online', isPremium: true },
  { id: 'newUsers', name: 'Novos Usuários', icon: '✨', description: 'Cadastros recentes', isPremium: true },
];

// ============================================
// 🛠️ MOCK DE ESTADOS DE USUÁRIOS
// ============================================

let USER_FREE_PLAN_STATES: Map<string, UserFreePlanState> = new Map();

// ============================================
// 📆 FUNÇÕES UTILITÁRIAS DE DATA
// ============================================

function getCurrentDate(): string {
  return new Date().toISOString().split('T')[0];
}

function getDaysDifference(date1: Date, date2: Date): number {
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

function getMonthsDifference(date1: Date, date2: Date): number {
  const months = (date2.getFullYear() - date1.getFullYear()) * 12;
  return months + date2.getMonth() - date1.getMonth();
}

// ============================================
// 📊 DETERMINAÇÃO DO PERÍODO DO USUÁRIO
// ============================================

export function calculateUserPeriod(registrationDate: Date): FreePlanPeriod {
  const now = new Date();
  const daysActive = getDaysDifference(registrationDate, now);
  const monthsActive = getMonthsDifference(registrationDate, now);
  
  // 🟢 1º DIA
  if (daysActive === 0) {
    return 'day1';
  }
  
  // Primeiro mês
  if (monthsActive === 0) {
    // 🟡 2º AO 7º DIA
    if (daysActive >= 1 && daysActive <= 6) {
      return 'days2to7';
    }
    
    // 🟠 8º AO 10º DIA
    if (daysActive >= 7 && daysActive <= 9) {
      return 'days8to10';
    }
    
    // 🔴 11º AO 14º DIA
    if (daysActive >= 10 && daysActive <= 13) {
      return 'days11to14';
    }
    
    // 🔁 Após o 14º dia (primeiro mês)
    return 'afterFirstMonth';
  }
  
  // 🔁 Segundo mês em diante
  // Após o 7º dia do mês atual
  const dayOfMonth = now.getDate();
  if (dayOfMonth > 7) {
    return 'mature';
  }
  
  // Nos primeiros 7 dias de cada mês após o primeiro
  return 'days2to7';
}

// ============================================
// 👤 GERENCIAMENTO DE ESTADO DO USUÁRIO
// ============================================

export function getOrCreateUserState(userId: string, registrationDate?: Date): UserFreePlanState {
  let state = USER_FREE_PLAN_STATES.get(userId);
  const today = getCurrentDate();
  
  if (!state) {
    const regDate = registrationDate || new Date();
    state = {
      userId,
      registrationDate: regDate,
      currentPeriod: calculateUserPeriod(regDate),
      daysActive: getDaysDifference(regDate, new Date()),
      monthsActive: getMonthsDifference(regDate, new Date()),
      dailyViewsUsed: 0,
      dailyLikesUsed: 0,
      lastResetDate: today,
      messagesPerMatchUsed: new Map(),
    };
    USER_FREE_PLAN_STATES.set(userId, state);
  }
  
  // Reset diário automático
  if (state.lastResetDate !== today) {
    state.dailyViewsUsed = 0;
    state.dailyLikesUsed = 0;
    state.lastResetDate = today;
    state.currentPeriod = calculateUserPeriod(state.registrationDate);
    state.daysActive = getDaysDifference(state.registrationDate, new Date());
    state.monthsActive = getMonthsDifference(state.registrationDate, new Date());
  }
  
  return state;
}

/**
 * Inicializa estado do usuário com data de registro do Firebase
 */
export function initUserFreePlanState(userId: string, registrationDate: Date): void {
  const today = getCurrentDate();
  
  // Se já existe, atualizar a data de registro se necessário
  let state = USER_FREE_PLAN_STATES.get(userId);
  
  if (state) {
    // Atualizar data de registro se for diferente
    if (state.registrationDate.getTime() !== registrationDate.getTime()) {
      state.registrationDate = registrationDate;
      state.currentPeriod = calculateUserPeriod(registrationDate);
      state.daysActive = getDaysDifference(registrationDate, new Date());
      state.monthsActive = getMonthsDifference(registrationDate, new Date());
    }
  } else {
    // Criar novo estado com a data de registro correta
    state = {
      userId,
      registrationDate,
      currentPeriod: calculateUserPeriod(registrationDate),
      daysActive: getDaysDifference(registrationDate, new Date()),
      monthsActive: getMonthsDifference(registrationDate, new Date()),
      dailyViewsUsed: 0,
      dailyLikesUsed: 0,
      lastResetDate: today,
      messagesPerMatchUsed: new Map(),
    };
    USER_FREE_PLAN_STATES.set(userId, state);
  }
}

export function getUserLimits(userId: string, registrationDate?: Date): FreePlanLimits {
  const state = getOrCreateUserState(userId, registrationDate);
  return FREE_PLAN_LIMITS[state.currentPeriod];
}

// ============================================
// 👀 CONTROLE DE VISUALIZAÇÕES
// ============================================

export function canViewProfile(userId: string): boolean {
  const state = getOrCreateUserState(userId);
  const limits = FREE_PLAN_LIMITS[state.currentPeriod];
  
  if (limits.dailyViews === 'unlimited') {
    return true;
  }
  
  return state.dailyViewsUsed < limits.dailyViews;
}

export function incrementViewCount(userId: string): void {
  const state = getOrCreateUserState(userId);
  state.dailyViewsUsed += 1;
}

export function getViewsInfo(userId: string): { used: number; limit: number | 'unlimited'; remaining: number | 'unlimited' } {
  const state = getOrCreateUserState(userId);
  const limits = FREE_PLAN_LIMITS[state.currentPeriod];
  
  if (limits.dailyViews === 'unlimited') {
    return { used: state.dailyViewsUsed, limit: 'unlimited', remaining: 'unlimited' };
  }
  
  return {
    used: state.dailyViewsUsed,
    limit: limits.dailyViews,
    remaining: Math.max(0, limits.dailyViews - state.dailyViewsUsed),
  };
}

// ============================================
// 💚 CONTROLE DE CURTIDAS
// ============================================

export function canLikeProfile(userId: string): boolean {
  const state = getOrCreateUserState(userId);
  const limits = FREE_PLAN_LIMITS[state.currentPeriod];
  
  if (limits.dailyLikes === 'unlimited') {
    return true;
  }
  
  return state.dailyLikesUsed < limits.dailyLikes;
}

export function incrementLikeCount(userId: string): void {
  const state = getOrCreateUserState(userId);
  state.dailyLikesUsed += 1;
}

export function getLikesInfo(userId: string): { used: number; limit: number | 'unlimited'; remaining: number | 'unlimited' } {
  const state = getOrCreateUserState(userId);
  const limits = FREE_PLAN_LIMITS[state.currentPeriod];
  
  if (limits.dailyLikes === 'unlimited') {
    return { used: state.dailyLikesUsed, limit: 'unlimited', remaining: 'unlimited' };
  }
  
  return {
    used: state.dailyLikesUsed,
    limit: limits.dailyLikes,
    remaining: Math.max(0, limits.dailyLikes - state.dailyLikesUsed),
  };
}

// ============================================
// 💬 CONTROLE DE MENSAGENS
// ============================================

export function canSendMessage(userId: string, matchId: string): boolean {
  const state = getOrCreateUserState(userId);
  const limits = FREE_PLAN_LIMITS[state.currentPeriod];
  
  // Período em que não pode enviar mensagens
  if (!limits.canSendMessages) {
    return false;
  }
  
  // Verificar limite de mensagens para este match
  const messagesSent = state.messagesPerMatchUsed.get(matchId) || 0;
  return messagesSent < limits.messagesPerMatch;
}

export function canReadMessages(): boolean {
  // Leitura sempre liberada em todos os períodos
  return true;
}

export function incrementMessageCount(userId: string, matchId: string): void {
  const state = getOrCreateUserState(userId);
  const current = state.messagesPerMatchUsed.get(matchId) || 0;
  state.messagesPerMatchUsed.set(matchId, current + 1);
}

export function getMessagesInfo(userId: string, matchId: string): { 
  sent: number; 
  limit: number; 
  remaining: number;
  canSend: boolean;
  canRead: boolean;
} {
  const state = getOrCreateUserState(userId);
  const limits = FREE_PLAN_LIMITS[state.currentPeriod];
  const sent = state.messagesPerMatchUsed.get(matchId) || 0;
  
  return {
    sent,
    limit: limits.messagesPerMatch,
    remaining: Math.max(0, limits.messagesPerMatch - sent),
    canSend: limits.canSendMessages && sent < limits.messagesPerMatch,
    canRead: limits.canReadMessages,
  };
}

// ============================================
// 🔒 CONTROLE DE FILTROS AVANÇADOS
// ============================================

export function canUseAdvancedFilter(filterId: string, hasPremium: boolean): boolean {
  if (hasPremium) return true;
  
  const filter = ADVANCED_FILTERS.find(f => f.id === filterId);
  return filter ? !filter.isPremium : true;
}

export function getLockedFilters(): AdvancedFilter[] {
  return ADVANCED_FILTERS.filter(f => f.isPremium);
}

// ============================================
// 👤 CONTROLE DE VISIBILIDADE DE PERFIL
// ============================================

export function getProfileVisibility(hasPremium: boolean): ProfileVisibility {
  return hasPremium ? PREMIUM_PROFILE_VISIBILITY : FREE_PLAN_PROFILE_VISIBILITY;
}

export function canViewFullProfile(hasPremium: boolean): boolean {
  return hasPremium;
}

export function filterProfileData<T extends Record<string, any>>(
  profile: T, 
  hasPremium: boolean
): Partial<T> {
  if (hasPremium) {
    return profile;
  }
  
  // Retorna apenas campos permitidos para plano gratuito
  const visibility = FREE_PLAN_PROFILE_VISIBILITY;
  const filteredProfile: Record<string, any> = {};
  
  // Campos sempre visíveis
  if ('age' in profile && visibility.age) filteredProfile.age = profile.age;
  if ('city' in profile && visibility.city) filteredProfile.city = profile.city;
  if ('distance' in profile && visibility.distance) filteredProfile.distance = profile.distance;
  if ('gender' in profile && visibility.gender) filteredProfile.gender = profile.gender;
  
  // Campos básicos que sempre devem estar presentes
  if ('id' in profile) filteredProfile.id = profile.id;
  if ('name' in profile) filteredProfile.name = profile.name;
  if ('photos' in profile) {
    // Apenas primeira foto para plano gratuito
    filteredProfile.photos = [(profile.photos as string[])[0]];
  }
  
  // Bio truncada
  if ('bio' in profile && !visibility.fullBio) {
    const bio = profile.bio as string;
    filteredProfile.bio = bio.length > 50 ? bio.substring(0, 50) + '...' : bio;
  }
  
  return filteredProfile as Partial<T>;
}

// ============================================
// 📊 INFORMAÇÕES DO PERÍODO ATUAL
// ============================================

export function getUserPeriodInfo(userId: string): {
  period: FreePlanPeriod;
  periodName: string;
  daysActive: number;
  monthsActive: number;
  limits: FreePlanLimits;
  emoji: string;
} {
  const state = getOrCreateUserState(userId);
  const limits = FREE_PLAN_LIMITS[state.currentPeriod];
  
  const periodNames: Record<FreePlanPeriod, { name: string; emoji: string }> = {
    day1: { name: 'Dia de Boas-vindas', emoji: '🟢' },
    days2to7: { name: 'Primeira Semana', emoji: '🟡' },
    days8to10: { name: 'Segunda Semana', emoji: '🟠' },
    days11to14: { name: 'Período de Avaliação', emoji: '🔴' },
    afterFirstMonth: { name: 'Plano Base', emoji: '⚪' },
    mature: { name: 'Plano Maduro', emoji: '⚪' },
  };
  
  const periodInfo = periodNames[state.currentPeriod];
  
  return {
    period: state.currentPeriod,
    periodName: periodInfo.name,
    daysActive: state.daysActive,
    monthsActive: state.monthsActive,
    limits,
    emoji: periodInfo.emoji,
  };
}

// ============================================
// 🧹 FUNÇÕES DE MANUTENÇÃO
// ============================================

export function resetUserState(userId: string): void {
  USER_FREE_PLAN_STATES.delete(userId);
}

export function resetAllStates(): void {
  USER_FREE_PLAN_STATES.clear();
}

// Para testes: simular dias passados
export function simulateDaysPassed(userId: string, days: number): void {
  const state = getOrCreateUserState(userId);
  const newRegDate = new Date(state.registrationDate);
  newRegDate.setDate(newRegDate.getDate() - days);
  state.registrationDate = newRegDate;
  state.currentPeriod = calculateUserPeriod(newRegDate);
  state.daysActive = getDaysDifference(newRegDate, new Date());
  state.monthsActive = getMonthsDifference(newRegDate, new Date());
}
