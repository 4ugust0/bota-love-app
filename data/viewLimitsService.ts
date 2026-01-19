/**
 * Sistema de limitação de visualizações de perfis baseado em plano
 */

export type SubscriptionPlan = 'bronze' | 'prata' | 'ouro';

export interface DailyViewLimit {
  userId: string;
  date: string; // YYYY-MM-DD
  viewsCount: number;
  plan: SubscriptionPlan;
}

export interface PlanLimits {
  bronze: {
    dailyViews: number;
    dailyLikes: number | 'unlimited';
    superLikes: number;
    boost: boolean;
    correio: boolean;
    filters: boolean;
  };
  prata: {
    dailyViews: number | 'unlimited';
    dailyLikes: number | 'unlimited';
    superLikes: number;
    boost: boolean;
    correio: boolean;
    filters: boolean;
  };
  ouro: {
    dailyViews: number | 'unlimited';
    dailyLikes: number | 'unlimited';
    superLikes: number | 'unlimited';
    boost: boolean;
    correio: boolean;
    filters: boolean;
  };
}

// Definição dos limites por plano
export const PLAN_LIMITS: PlanLimits = {
  bronze: {
    dailyViews: 20,
    dailyLikes: 'unlimited',
    superLikes: 0,
    boost: false,
    correio: false,
    filters: false,
  },
  prata: {
    dailyViews: 'unlimited',
    dailyLikes: 'unlimited',
    superLikes: 5,
    boost: true,
    correio: true,
    filters: true,
  },
  ouro: {
    dailyViews: 'unlimited',
    dailyLikes: 'unlimited',
    superLikes: 'unlimited',
    boost: true,
    correio: true,
    filters: true,
  },
};

// Mock de dados de visualizações
let DAILY_VIEWS: DailyViewLimit[] = [];

/**
 * Obtém a data atual no formato YYYY-MM-DD
 */
function getCurrentDate(): string {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

/**
 * Obtém o plano do usuário (integrar com sistema real de assinaturas)
 */
export function getUserPlan(hasPremium: boolean): SubscriptionPlan {
  // Lógica simplificada: premium = ouro, caso contrário = bronze
  // Em produção, isso viria de um sistema de assinaturas
  return hasPremium ? 'ouro' : 'bronze';
}

/**
 * Obtém ou cria o registro de visualizações do dia para o usuário
 */
function getDailyViewRecord(userId: string, plan: SubscriptionPlan): DailyViewLimit {
  const today = getCurrentDate();
  let record = DAILY_VIEWS.find(
    (v) => v.userId === userId && v.date === today
  );

  if (!record) {
    record = {
      userId,
      date: today,
      viewsCount: 0,
      plan,
    };
    DAILY_VIEWS.push(record);
  }

  return record;
}

/**
 * Verifica se o usuário pode visualizar mais perfis hoje
 */
export function canViewProfile(userId: string, plan: SubscriptionPlan): boolean {
  const limits = PLAN_LIMITS[plan];
  
  // Planos com visualizações ilimitadas
  if (limits.dailyViews === 'unlimited') {
    return true;
  }

  const record = getDailyViewRecord(userId, plan);
  return record.viewsCount < limits.dailyViews;
}

/**
 * Registra uma visualização de perfil
 */
export function incrementViewCount(userId: string, plan: SubscriptionPlan): void {
  const record = getDailyViewRecord(userId, plan);
  record.viewsCount += 1;
}

/**
 * Obtém a quantidade de visualizações restantes para o dia
 */
export function getRemainingViews(userId: string, plan: SubscriptionPlan): number | 'unlimited' {
  const limits = PLAN_LIMITS[plan];
  
  if (limits.dailyViews === 'unlimited') {
    return 'unlimited';
  }

  const record = getDailyViewRecord(userId, plan);
  const remaining = limits.dailyViews - record.viewsCount;
  return Math.max(0, remaining);
}

/**
 * Obtém o total de visualizações realizadas hoje
 */
export function getViewsToday(userId: string, plan: SubscriptionPlan): number {
  const record = getDailyViewRecord(userId, plan);
  return record.viewsCount;
}

/**
 * Reseta as visualizações do usuário (útil para testes)
 */
export function resetViewsForUser(userId: string): void {
  const today = getCurrentDate();
  DAILY_VIEWS = DAILY_VIEWS.filter(
    (v) => !(v.userId === userId && v.date === today)
  );
}

/**
 * Limpa visualizações de dias anteriores (manutenção)
 */
export function cleanOldViewRecords(): void {
  const today = getCurrentDate();
  DAILY_VIEWS = DAILY_VIEWS.filter((v) => v.date === today);
}

/**
 * Mensagens de upgrade baseadas no plano atual
 */
export const UPGRADE_MESSAGES = {
  bronze: {
    title: '🚀 Limite de Perfis Atingido!',
    message: `Você chegou ao limite de 20 perfis por hoje.\n\nNos planos Prata e Ouro você tem:\n\n✨ Perfis ilimitados\n💎 Super Agro (curtidas especiais)\n📬 Correio da Roça\n🔍 Filtros avançados\n\nQue tal fazer um upgrade?`,
    buttonText: 'Ver Planos Premium',
  },
};
