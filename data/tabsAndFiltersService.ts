/**
 * Sistema de Abas e Segmentação de Usuários
 * Gerencia a separação entre "Sou Agro" e "Simpatizantes Agro"
 */

export type UserTab = 'sou_agro' | 'simpatizantes' | 'both';
export type ProfileVisibility = 'sou_agro' | 'simpatizantes' | 'both';

export interface TabSettings {
  currentTab: UserTab;
  profileVisibility: ProfileVisibility;
  allowedTabs: UserTab[];
}

/**
 * Planos e suas permissões
 */
export type SubscriptionTier = 'bronze' | 'prata' | 'ouro' | 'diamante';

export interface PlanFeatures {
  // Filtros e Busca
  advancedFilters: boolean;
  networkSearch: boolean; // Busca LinkedIn-style
  
  // Funcionalidades Especiais
  retornoDaEstrada: number; // Número de "voltar" por dia (0 = bloqueado)
  olharDoCampo: boolean; // Ver quem deu like
  superAgroMensal: number; // Quantidade de Super Agro por mês
  passaporteRural: boolean; // Matches em qualquer região
  sitioSecreto: boolean; // Perfil privado
  assobiosDoPeao: number; // Destaques de 1h por mês
  correiosDaRoca: number; // Mensagens diretas sem match por dia
  rumoCerto: boolean; // Filtros automáticos inteligentes
  seloRural: boolean; // Badge exclusivo
  misteroDoCampo: number; // Mensagens secretas por mês
  checkinAgroPremium: number; // Check-ins premium por evento
  
  // Limites Gerais
  dailyProfiles: number | 'unlimited';
  profileVisibilityControl: boolean; // Controlar visibilidade por aba
}

/**
 * Definição das features por plano
 */
export const PLAN_FEATURES: Record<SubscriptionTier, PlanFeatures> = {
  bronze: {
    advancedFilters: false,
    networkSearch: false,
    retornoDaEstrada: 0,
    olharDoCampo: false,
    superAgroMensal: 0,
    passaporteRural: false,
    sitioSecreto: false,
    assobiosDoPeao: 0,
    correiosDaRoca: 0,
    rumoCerto: false,
    seloRural: false,
    misteroDoCampo: 0,
    checkinAgroPremium: 0,
    dailyProfiles: 20,
    profileVisibilityControl: false,
  },
  prata: {
    advancedFilters: true,
    networkSearch: false,
    retornoDaEstrada: 3,
    olharDoCampo: true,
    superAgroMensal: 5,
    passaporteRural: false,
    sitioSecreto: false,
    assobiosDoPeao: 1,
    correiosDaRoca: 3,
    rumoCerto: false,
    seloRural: true,
    misteroDoCampo: 2,
    checkinAgroPremium: 1,
    dailyProfiles: 'unlimited',
    profileVisibilityControl: true,
  },
  ouro: {
    advancedFilters: true,
    networkSearch: true,
    retornoDaEstrada: 10,
    olharDoCampo: true,
    superAgroMensal: 15,
    passaporteRural: true,
    sitioSecreto: true,
    assobiosDoPeao: 3,
    correiosDaRoca: 10,
    rumoCerto: true,
    seloRural: true,
    misteroDoCampo: 5,
    checkinAgroPremium: 3,
    dailyProfiles: 'unlimited',
    profileVisibilityControl: true,
  },
  diamante: {
    advancedFilters: true,
    networkSearch: true,
    retornoDaEstrada: 999,
    olharDoCampo: true,
    superAgroMensal: 999,
    passaporteRural: true,
    sitioSecreto: true,
    assobiosDoPeao: 10,
    correiosDaRoca: 999,
    rumoCerto: true,
    seloRural: true,
    misteroDoCampo: 999,
    checkinAgroPremium: 999,
    dailyProfiles: 'unlimited',
    profileVisibilityControl: true,
  },
};

/**
 * Filtros avançados disponíveis
 */
export interface AdvancedFilters {
  // Localização
  minDistance?: number;
  maxDistance?: number;
  city?: string;
  state?: string;
  region?: string[];
  
  // Perfil Profissional
  occupation?: string[];
  education?: string[];
  income?: { min?: number; max?: number };
  
  // Características Físicas
  minHeight?: number;
  maxHeight?: number;
  
  // Estilo de Vida
  lifestyle?: string[];
  hasChildren?: boolean;
  wantsChildren?: boolean;
  smoking?: boolean;
  drinking?: string; // 'nunca', 'socialmente', 'frequentemente'
  
  // Rural Específico
  ruralActivities?: string[]; // Pecuária, Agricultura, Veterinária, etc.
  propertyType?: string[]; // Fazenda, Sítio, Chácara, etc.
  animals?: string[]; // Bovinos, Equinos, etc.
  crops?: string[]; // Milho, Soja, Café, etc.
  
  // Interesses
  interests?: string[];
  musicalStyle?: string[];
  hobbies?: string[];
  
  // Network (apenas Ouro+)
  professionalArea?: string[];
  networkGoals?: string[]; // Parceria, Investimento, Conhecimento, etc.
}

/**
 * Verifica se usuário pode acessar determinada aba
 */
export function canAccessTab(userTab: UserTab, targetTab: UserTab): boolean {
  if (userTab === 'both') return true;
  if (targetTab === 'both') return true;
  return userTab === targetTab;
}

/**
 * Verifica se perfil está visível para determinada aba
 */
export function isProfileVisible(
  profileVisibility: ProfileVisibility,
  viewerTab: UserTab
): boolean {
  if (profileVisibility === 'both') return true;
  if (viewerTab === 'both') return true;
  return profileVisibility === viewerTab;
}

/**
 * Obtém features do plano do usuário
 */
export function getPlanFeatures(tier: SubscriptionTier): PlanFeatures {
  return PLAN_FEATURES[tier];
}

/**
 * Verifica se usuário tem acesso a uma feature específica
 */
export function hasFeatureAccess(
  tier: SubscriptionTier,
  feature: keyof PlanFeatures
): boolean {
  const features = PLAN_FEATURES[tier];
  const value = features[feature];
  
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value > 0;
  if (value === 'unlimited') return true;
  
  return false;
}

/**
 * Mensagens de bloqueio por feature
 */
export const FEATURE_MESSAGES: Record<string, { title: string; message: string; plan: SubscriptionTier }> = {
  advancedFilters: {
    title: '🔍 Filtros Avançados',
    message: 'Encontre exatamente quem você procura com filtros detalhados por profissão, altura, estilo de vida e muito mais!',
    plan: 'prata',
  },
  networkSearch: {
    title: '🤝 Network Rural',
    message: 'Conecte-se com profissionais do agro para parcerias, investimentos e crescimento no seu negócio!',
    plan: 'ouro',
  },
  retornoDaEstrada: {
    title: '🔄 Retorno da Estrada',
    message: 'Passou reto em alguém? Com o Retorno da Estrada você pode voltar e dar uma segunda chance!',
    plan: 'prata',
  },
  olharDoCampo: {
    title: '👀 Olhar do Campo',
    message: 'Descubra quem visualizou seu perfil e quem deu like em você antes mesmo do match!',
    plan: 'prata',
  },
  passaporteRural: {
    title: '🌎 Passaporte Rural',
    message: 'Encontre seu amor em qualquer região do Brasil! Sem limites de distância.',
    plan: 'ouro',
  },
  sitioSecreto: {
    title: '🔒 Sítio Secreto',
    message: 'Controle total sobre quem vê seu perfil. Você escolhe quem pode te encontrar!',
    plan: 'ouro',
  },
  assobiosDoPeao: {
    title: '📣 Assobios do Peão',
    message: 'Destaque seu perfil por 1 hora na sua região e aumente suas chances de match!',
    plan: 'prata',
  },
  correiosDaRoca: {
    title: '💌 Correios da Roça',
    message: 'Envie mensagens diretas sem precisar de match! Chame atenção com suas Primeiras Impressões.',
    plan: 'prata',
  },
  rumoCerto: {
    title: '🎯 Rumo Certo',
    message: 'Veja apenas perfis que realmente combinam com você! Nosso algoritmo faz o trabalho por você.',
    plan: 'ouro',
  },
  misteroDoCampo: {
    title: '🔍 Mistério do Campo',
    message: 'Desperte curiosidade! Envie uma mensagem secreta com foto desfocada e crie expectativa.',
    plan: 'prata',
  },
  checkinAgroPremium: {
    title: '⭐ Check-in Agro Premium',
    message: 'Apareça em destaque nos eventos do agro e seja visto por quem realmente importa!',
    plan: 'prata',
  },
};
