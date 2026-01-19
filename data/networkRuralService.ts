/**
 * Network Rural Service
 * Gerencia todas as funcionalidades do módulo Network Rural
 * Mini-LinkedIn rural dentro do app Bota Love
 */

// =============================================================================
// TIPOS E INTERFACES
// =============================================================================

export type NetworkSubscriptionStatus = 'inactive' | 'trial' | 'active' | 'lifetime' | 'expired';

export interface LinkedInData {
  profileUrl: string;
  currentPosition?: string;
  company?: string;
  industry?: string;
  summary?: string;
  location?: string;
  photoUrl?: string;
  isVerified: boolean;
  lastSync?: Date;
}

export interface NetworkRuralSubscription {
  status: NetworkSubscriptionStatus;
  planType: 'monthly' | 'lifetime' | null;
  startDate: Date | null;
  endDate: Date | null;
  trialEndDate: Date | null;
  price: number;
  autoRenew: boolean;
}

export interface NetworkRuralProfile {
  userId: string;
  isActive: boolean;
  linkedInData: LinkedInData | null;
  subscription: NetworkRuralSubscription;
  goals: NetworkGoal[];
  agroArea: string[];
  region: string;
  lookingFor: NetworkLookingFor[];
  createdAt: Date;
  updatedAt: Date;
}

export type NetworkGoal = 
  | 'networking' 
  | 'partnerships' 
  | 'business' 
  | 'mentorship' 
  | 'hiring' 
  | 'investment';

export type NetworkLookingFor = 
  | 'producers' 
  | 'veterinarians' 
  | 'agronomists' 
  | 'engineers' 
  | 'consultants' 
  | 'investors'
  | 'suppliers'
  | 'buyers';

export interface NetworkRuralUser {
  id: string;
  name: string;
  age: number;
  city: string;
  state: string;
  photo: string;
  occupation: string;
  agroArea: string[];
  linkedInData: LinkedInData | null;
  networkProfile: NetworkRuralProfile;
  matchScore?: number; // Score de afinidade profissional
}

export interface NetworkRuralFilter {
  agroAreas?: string[];
  regions?: string[];
  occupations?: string[];
  hasLinkedIn?: boolean;
  goals?: NetworkGoal[];
  lookingFor?: NetworkLookingFor[];
}

// =============================================================================
// CONSTANTES
// =============================================================================

export const NETWORK_RURAL_PRICES = {
  monthly: 14.90,
  lifetime: 9.90, // Promoção de lançamento
  lifetimeOriginal: 14.90,
} as const;

export const TRIAL_DURATION_DAYS = 7;

export const AGRO_AREAS = [
  'Pecuária de Corte',
  'Pecuária Leiteira',
  'Agricultura de Grãos',
  'Agricultura de Hortifruti',
  'Suinocultura',
  'Avicultura',
  'Aquicultura',
  'Cafeicultura',
  'Cana-de-Açúcar',
  'Silvicultura',
  'Fruticultura',
  'Equinocultura',
  'Apicultura',
  'Tecnologia Agrícola',
  'Consultoria Agro',
  'Máquinas e Equipamentos',
  'Insumos Agrícolas',
  'Logística Agro',
  'Comércio de Commodities',
] as const;

export const AGRO_OCCUPATIONS = [
  'Produtor Rural',
  'Agrônomo(a)',
  'Veterinário(a)',
  'Zootecnista',
  'Engenheiro(a) Agrícola',
  'Engenheiro(a) Florestal',
  'Técnico(a) Agrícola',
  'Consultor(a) Agro',
  'Gestor(a) de Fazenda',
  'Pecuarista',
  'Investidor(a) Agro',
  'Representante Comercial',
  'Pesquisador(a)',
  'Professor(a)',
  'Empreendedor(a) Agro',
] as const;

export const NETWORK_GOALS_OPTIONS: { id: NetworkGoal; label: string; icon: string; description: string }[] = [
  { id: 'networking', label: 'Networking', icon: 'people', description: 'Expandir contatos profissionais' },
  { id: 'partnerships', label: 'Parcerias', icon: 'handshake', description: 'Encontrar parceiros de negócio' },
  { id: 'business', label: 'Negócios', icon: 'briefcase', description: 'Fechar novos negócios' },
  { id: 'mentorship', label: 'Mentoria', icon: 'school', description: 'Buscar ou oferecer mentoria' },
  { id: 'hiring', label: 'Contratação', icon: 'person-add', description: 'Contratar ou ser contratado' },
  { id: 'investment', label: 'Investimento', icon: 'trending-up', description: 'Investir ou captar recursos' },
];

export const LOOKING_FOR_OPTIONS: { id: NetworkLookingFor; label: string }[] = [
  { id: 'producers', label: 'Produtores Rurais' },
  { id: 'veterinarians', label: 'Veterinários' },
  { id: 'agronomists', label: 'Agrônomos' },
  { id: 'engineers', label: 'Engenheiros' },
  { id: 'consultants', label: 'Consultores' },
  { id: 'investors', label: 'Investidores' },
  { id: 'suppliers', label: 'Fornecedores' },
  { id: 'buyers', label: 'Compradores' },
];

// =============================================================================
// DADOS MOCKADOS
// =============================================================================

export const MOCK_NETWORK_USERS: NetworkRuralUser[] = [
  {
    id: 'network-1',
    name: 'Ricardo Oliveira',
    age: 42,
    city: 'Ribeirão Preto',
    state: 'SP',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    occupation: 'Produtor Rural',
    agroArea: ['Pecuária de Corte', 'Agricultura de Grãos'],
    linkedInData: {
      profileUrl: 'https://linkedin.com/in/ricardo-oliveira',
      currentPosition: 'CEO',
      company: 'Fazenda Santa Rita',
      industry: 'Agropecuária',
      summary: 'Produtor rural há 20 anos, especializado em gado Nelore e soja.',
      location: 'Ribeirão Preto, SP',
      isVerified: true,
      lastSync: new Date('2026-01-01'),
    },
    networkProfile: {
      userId: 'network-1',
      isActive: true,
      linkedInData: null,
      subscription: {
        status: 'active',
        planType: 'monthly',
        startDate: new Date('2025-12-01'),
        endDate: new Date('2026-01-31'),
        trialEndDate: null,
        price: 14.90,
        autoRenew: true,
      },
      goals: ['networking', 'partnerships', 'business'],
      agroArea: ['Pecuária de Corte', 'Agricultura de Grãos'],
      region: 'Sudeste',
      lookingFor: ['investors', 'consultants', 'buyers'],
      createdAt: new Date('2025-12-01'),
      updatedAt: new Date('2026-01-05'),
    },
    matchScore: 92,
  },
  {
    id: 'network-2',
    name: 'Fernanda Machado',
    age: 35,
    city: 'Goiânia',
    state: 'GO',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    occupation: 'Agrônoma',
    agroArea: ['Agricultura de Grãos', 'Tecnologia Agrícola'],
    linkedInData: {
      profileUrl: 'https://linkedin.com/in/fernanda-machado',
      currentPosition: 'Diretora Técnica',
      company: 'AgroTech Solutions',
      industry: 'Tecnologia Agrícola',
      summary: 'Especialista em agricultura de precisão e manejo integrado de pragas.',
      location: 'Goiânia, GO',
      isVerified: true,
      lastSync: new Date('2026-01-03'),
    },
    networkProfile: {
      userId: 'network-2',
      isActive: true,
      linkedInData: null,
      subscription: {
        status: 'lifetime',
        planType: 'lifetime',
        startDate: new Date('2025-11-15'),
        endDate: null,
        trialEndDate: null,
        price: 9.90,
        autoRenew: false,
      },
      goals: ['networking', 'mentorship', 'business'],
      agroArea: ['Agricultura de Grãos', 'Tecnologia Agrícola'],
      region: 'Centro-Oeste',
      lookingFor: ['producers', 'investors', 'engineers'],
      createdAt: new Date('2025-11-15'),
      updatedAt: new Date('2026-01-05'),
    },
    matchScore: 88,
  },
  {
    id: 'network-3',
    name: 'Carlos Henrique',
    age: 38,
    city: 'Uberlândia',
    state: 'MG',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
    occupation: 'Veterinário',
    agroArea: ['Pecuária de Corte', 'Pecuária Leiteira'],
    linkedInData: {
      profileUrl: 'https://linkedin.com/in/carlos-henrique-vet',
      currentPosition: 'Veterinário Sênior',
      company: 'Clínica VetAgro',
      industry: 'Veterinária',
      summary: 'Veterinário especializado em reprodução bovina e sanidade animal.',
      location: 'Uberlândia, MG',
      isVerified: true,
      lastSync: new Date('2026-01-02'),
    },
    networkProfile: {
      userId: 'network-3',
      isActive: true,
      linkedInData: null,
      subscription: {
        status: 'active',
        planType: 'monthly',
        startDate: new Date('2025-12-15'),
        endDate: new Date('2026-01-15'),
        trialEndDate: null,
        price: 14.90,
        autoRenew: true,
      },
      goals: ['networking', 'partnerships', 'mentorship'],
      agroArea: ['Pecuária de Corte', 'Pecuária Leiteira'],
      region: 'Sudeste',
      lookingFor: ['producers', 'veterinarians', 'suppliers'],
      createdAt: new Date('2025-12-15'),
      updatedAt: new Date('2026-01-05'),
    },
    matchScore: 85,
  },
  {
    id: 'network-4',
    name: 'Ana Paula Santos',
    age: 29,
    city: 'Cuiabá',
    state: 'MT',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
    occupation: 'Engenheira Agrícola',
    agroArea: ['Tecnologia Agrícola', 'Máquinas e Equipamentos'],
    linkedInData: {
      profileUrl: 'https://linkedin.com/in/ana-paula-santos',
      currentPosition: 'Gerente de Projetos',
      company: 'John Deere',
      industry: 'Máquinas Agrícolas',
      summary: 'Engenheira focada em soluções de automação e IoT para o agro.',
      location: 'Cuiabá, MT',
      isVerified: true,
      lastSync: new Date('2026-01-04'),
    },
    networkProfile: {
      userId: 'network-4',
      isActive: true,
      linkedInData: null,
      subscription: {
        status: 'trial',
        planType: null,
        startDate: new Date('2026-01-02'),
        endDate: null,
        trialEndDate: new Date('2026-01-09'),
        price: 0,
        autoRenew: false,
      },
      goals: ['networking', 'business', 'hiring'],
      agroArea: ['Tecnologia Agrícola', 'Máquinas e Equipamentos'],
      region: 'Centro-Oeste',
      lookingFor: ['producers', 'engineers', 'investors'],
      createdAt: new Date('2026-01-02'),
      updatedAt: new Date('2026-01-05'),
    },
    matchScore: 78,
  },
  {
    id: 'network-5',
    name: 'Marcos Vinícius',
    age: 45,
    city: 'Londrina',
    state: 'PR',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
    occupation: 'Investidor Agro',
    agroArea: ['Agricultura de Grãos', 'Cafeicultura', 'Silvicultura'],
    linkedInData: {
      profileUrl: 'https://linkedin.com/in/marcos-vinicius-invest',
      currentPosition: 'Sócio-Fundador',
      company: 'AgroCapital Investimentos',
      industry: 'Investimentos',
      summary: 'Investidor em projetos agrícolas com foco em sustentabilidade.',
      location: 'Londrina, PR',
      isVerified: true,
      lastSync: new Date('2026-01-05'),
    },
    networkProfile: {
      userId: 'network-5',
      isActive: true,
      linkedInData: null,
      subscription: {
        status: 'lifetime',
        planType: 'lifetime',
        startDate: new Date('2025-10-20'),
        endDate: null,
        trialEndDate: null,
        price: 9.90,
        autoRenew: false,
      },
      goals: ['investment', 'partnerships', 'business'],
      agroArea: ['Agricultura de Grãos', 'Cafeicultura', 'Silvicultura'],
      region: 'Sul',
      lookingFor: ['producers', 'consultants', 'engineers'],
      createdAt: new Date('2025-10-20'),
      updatedAt: new Date('2026-01-05'),
    },
    matchScore: 95,
  },
  {
    id: 'network-6',
    name: 'Juliana Ferreira',
    age: 32,
    city: 'Piracicaba',
    state: 'SP',
    photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400',
    occupation: 'Consultora Agro',
    agroArea: ['Cana-de-Açúcar', 'Consultoria Agro'],
    linkedInData: {
      profileUrl: 'https://linkedin.com/in/juliana-ferreira-agro',
      currentPosition: 'Consultora Sênior',
      company: 'KPMG Agribusiness',
      industry: 'Consultoria',
      summary: 'Consultora especializada em gestão financeira do agronegócio.',
      location: 'Piracicaba, SP',
      isVerified: true,
      lastSync: new Date('2026-01-04'),
    },
    networkProfile: {
      userId: 'network-6',
      isActive: true,
      linkedInData: null,
      subscription: {
        status: 'active',
        planType: 'monthly',
        startDate: new Date('2025-12-20'),
        endDate: new Date('2026-01-20'),
        trialEndDate: null,
        price: 14.90,
        autoRenew: true,
      },
      goals: ['networking', 'business', 'mentorship'],
      agroArea: ['Cana-de-Açúcar', 'Consultoria Agro'],
      region: 'Sudeste',
      lookingFor: ['producers', 'investors', 'buyers'],
      createdAt: new Date('2025-12-20'),
      updatedAt: new Date('2026-01-05'),
    },
    matchScore: 82,
  },
];

// =============================================================================
// FUNÇÕES DO SERVIÇO
// =============================================================================

/**
 * Verifica se o período de trial ainda está ativo
 */
export function isTrialActive(subscription: NetworkRuralSubscription): boolean {
  if (subscription.status !== 'trial' || !subscription.trialEndDate) {
    return false;
  }
  return new Date() < subscription.trialEndDate;
}

/**
 * Verifica se a assinatura está ativa (paga ou trial)
 */
export function isSubscriptionActive(subscription: NetworkRuralSubscription): boolean {
  if (subscription.status === 'lifetime') return true;
  if (subscription.status === 'trial') return isTrialActive(subscription);
  if (subscription.status === 'active' && subscription.endDate) {
    return new Date() < subscription.endDate;
  }
  return false;
}

/**
 * Calcula dias restantes do trial
 */
export function getTrialDaysRemaining(subscription: NetworkRuralSubscription): number {
  if (!subscription.trialEndDate) return 0;
  const diff = subscription.trialEndDate.getTime() - new Date().getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

/**
 * Cria uma nova assinatura de trial
 */
export function createTrialSubscription(): NetworkRuralSubscription {
  const startDate = new Date();
  const trialEndDate = new Date();
  trialEndDate.setDate(trialEndDate.getDate() + TRIAL_DURATION_DAYS);

  return {
    status: 'trial',
    planType: null,
    startDate,
    endDate: null,
    trialEndDate,
    price: 0,
    autoRenew: false,
  };
}

/**
 * Cria uma assinatura mensal ativa
 */
export function createMonthlySubscription(): NetworkRuralSubscription {
  const startDate = new Date();
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + 1);

  return {
    status: 'active',
    planType: 'monthly',
    startDate,
    endDate,
    trialEndDate: null,
    price: NETWORK_RURAL_PRICES.monthly,
    autoRenew: true,
  };
}

/**
 * Cria uma assinatura vitalícia
 */
export function createLifetimeSubscription(): NetworkRuralSubscription {
  return {
    status: 'lifetime',
    planType: 'lifetime',
    startDate: new Date(),
    endDate: null,
    trialEndDate: null,
    price: NETWORK_RURAL_PRICES.lifetime,
    autoRenew: false,
  };
}

/**
 * Busca usuários do Network Rural com filtros
 */
export function searchNetworkUsers(
  filters?: NetworkRuralFilter,
  currentUserId?: string
): NetworkRuralUser[] {
  let results = MOCK_NETWORK_USERS.filter(user => user.id !== currentUserId);

  if (filters) {
    if (filters.agroAreas && filters.agroAreas.length > 0) {
      results = results.filter(user =>
        user.agroArea.some(area => filters.agroAreas!.includes(area))
      );
    }

    if (filters.regions && filters.regions.length > 0) {
      results = results.filter(user =>
        filters.regions!.includes(user.networkProfile.region)
      );
    }

    if (filters.occupations && filters.occupations.length > 0) {
      results = results.filter(user =>
        filters.occupations!.includes(user.occupation)
      );
    }

    if (filters.hasLinkedIn) {
      results = results.filter(user => user.linkedInData !== null);
    }

    if (filters.goals && filters.goals.length > 0) {
      results = results.filter(user =>
        user.networkProfile.goals.some(goal => filters.goals!.includes(goal))
      );
    }

    if (filters.lookingFor && filters.lookingFor.length > 0) {
      results = results.filter(user =>
        user.networkProfile.lookingFor.some(lf => filters.lookingFor!.includes(lf))
      );
    }
  }

  // Ordenar por matchScore
  return results.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
}

/**
 * Busca sugestões de conexão baseadas em afinidades
 */
export function getNetworkSuggestions(
  currentUserId: string,
  currentUserAgroAreas: string[],
  currentUserRegion: string
): NetworkRuralUser[] {
  return MOCK_NETWORK_USERS
    .filter(user => {
      // Não incluir o próprio usuário
      if (user.id === currentUserId) return false;
      // Apenas usuários com Network ativo
      if (!isSubscriptionActive(user.networkProfile.subscription)) return false;
      // Apenas com LinkedIn integrado
      if (!user.linkedInData) return false;
      return true;
    })
    .map(user => {
      // Calcular score de afinidade
      let score = 50;
      
      // +20 por área em comum
      const areasInCommon = user.agroArea.filter(area => 
        currentUserAgroAreas.includes(area)
      ).length;
      score += areasInCommon * 20;

      // +15 se mesma região
      if (user.networkProfile.region === currentUserRegion) {
        score += 15;
      }

      return { ...user, matchScore: Math.min(100, score) };
    })
    .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
}

/**
 * Simula integração com API do LinkedIn
 * Em produção, isso seria uma chamada real à API do LinkedIn
 */
export async function fetchLinkedInData(profileUrl: string): Promise<LinkedInData | null> {
  // Simulação de delay de API (1.5s - 3s)
  const delay = 1500 + Math.random() * 1500;
  await new Promise(resolve => setTimeout(resolve, delay));

  // Extrair username do URL para personalizar dados
  const urlParts = profileUrl.split('/');
  const username = urlParts[urlParts.length - 1] || urlParts[urlParts.length - 2] || 'usuario';
  
  // Lista de cargos e empresas do agro para simulação
  const positions = [
    'Diretor de Operações',
    'Gerente de Produção',
    'Consultor Técnico',
    'Engenheiro Agrônomo',
    'Veterinário',
    'CEO',
    'Coordenador de Campo',
    'Analista de Mercado',
    'Representante Comercial',
    'Gestor de Fazenda',
  ];
  
  const companies = [
    'Fazenda Santa Rita',
    'AgroTech Solutions',
    'Cooperativa AgroBrasil',
    'Fazenda Boa Vista',
    'JBS S.A.',
    'Cargill',
    'Bunge',
    'Agroceres',
    'Nutrien Ag Solutions',
    'Yara Brasil',
  ];
  
  const industries = [
    'Agronegócio',
    'Pecuária',
    'Agricultura de Precisão',
    'Tecnologia Agrícola',
    'Consultoria Agro',
    'Comércio de Commodities',
    'Máquinas Agrícolas',
    'Insumos Agrícolas',
    'Logística Agro',
    'Veterinária',
  ];
  
  const locations = [
    'São Paulo, SP',
    'Ribeirão Preto, SP',
    'Goiânia, GO',
    'Cuiabá, MT',
    'Campo Grande, MS',
    'Uberlândia, MG',
    'Londrina, PR',
    'Cascavel, PR',
    'Dourados, MS',
    'Sinop, MT',
  ];

  const summaries = [
    'Profissional com mais de 10 anos de experiência no agronegócio brasileiro.',
    'Especialista em gestão de propriedades rurais e otimização de processos.',
    'Focado em inovação e sustentabilidade na produção agrícola.',
    'Experiência em pecuária de corte e manejo de pastagens.',
    'Atuando na transformação digital do agronegócio.',
  ];

  // Gerar dados aleatórios baseados no "username"
  const randomIndex = (arr: string[]) => Math.floor(Math.random() * arr.length);
  
  // Simulação de dados retornados
  const mockData: LinkedInData = {
    profileUrl,
    currentPosition: positions[randomIndex(positions)],
    company: companies[randomIndex(companies)],
    industry: industries[randomIndex(industries)],
    summary: summaries[randomIndex(summaries)],
    location: locations[randomIndex(locations)],
    isVerified: true,
    lastSync: new Date(),
  };

  return mockData;
}

/**
 * Retorna o texto do status da assinatura
 */
export function getSubscriptionStatusText(subscription: NetworkRuralSubscription): string {
  switch (subscription.status) {
    case 'trial':
      const days = getTrialDaysRemaining(subscription);
      return `Período de teste (${days} dia${days !== 1 ? 's' : ''} restante${days !== 1 ? 's' : ''})`;
    case 'active':
      return 'Assinatura ativa';
    case 'lifetime':
      return 'Assinatura vitalícia';
    case 'expired':
      return 'Assinatura expirada';
    default:
      return 'Inativo';
  }
}

/**
 * Retorna a cor do status da assinatura
 */
export function getSubscriptionStatusColor(subscription: NetworkRuralSubscription): string {
  switch (subscription.status) {
    case 'trial':
      return '#5DADE2';
    case 'active':
      return '#2ECC71';
    case 'lifetime':
      return '#9B59B6';
    case 'expired':
      return '#E74C3C';
    default:
      return '#95A5A6';
  }
}

// =============================================================================
// BENEFÍCIOS DO PLANO
// =============================================================================

export const NETWORK_RURAL_BENEFITS = [
  {
    icon: 'search',
    title: 'Encontrar profissionais do agro',
    description: 'Busque por área, região e especialidade',
  },
  {
    icon: 'logo-linkedin',
    title: 'LinkedIn integrado',
    description: 'Exiba seus dados profissionais automaticamente',
  },
  {
    icon: 'people',
    title: 'Conexões qualificadas',
    description: 'Conecte-se com quem realmente importa',
  },
  {
    icon: 'ribbon',
    title: 'Selo "Network Ativo"',
    description: 'Destaque no perfil e nos resultados',
  },
  {
    icon: 'infinite',
    title: 'Acesso ilimitado',
    description: 'Sem limites de visualização ou contato',
  },
  {
    icon: 'flash',
    title: 'Sugestões inteligentes',
    description: 'Conexões recomendadas por afinidade',
  },
];
