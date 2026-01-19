// Mock Data para o Bota Love App

export type RelationshipGoal = 'amizade' | 'namoro' | 'casamento' | 'eventos' | 'network';

export interface LinkedInProfile {
  profileUrl: string;
  currentPosition?: string;
  company?: string;
  industry?: string;
  summary?: string;
  isVerified: boolean;
}

export interface User {
  id: string;
  name: string;
  age: number;
  city: string;
  state: string;
  bio: string;
  photos: string[];
  interests: string[];
  occupation: string;
  hasPremium: boolean;
  distance?: number;
  likedYou?: boolean; // Indica se essa pessoa curtiu você
  // Network Rural fields
  isAgroUser?: boolean; // Se marcou "Sou Agro"
  relationshipGoals?: RelationshipGoal[]; // Objetivos selecionados
  hasNetworkRural?: boolean; // Se tem Network Rural ativo
  linkedInProfile?: LinkedInProfile; // Dados do LinkedIn integrado
  agroAreas?: string[]; // Áreas do agro que atua
}

export interface Match {
  id: string;
  userId: string;
  matchedAt: Date;
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount: number;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: Date;
  read: boolean;
}

export interface AgroEvent {
  id: string;
  title: string;
  type: 'rodeio' | 'exposicao' | 'balada' | 'encontro' | 'feira' | 'leilao' | 'show' | 'congresso';
  date: Date;
  location: string;
  city: string;
  state: string;
  description: string;
  image: string;
  price?: string;
}

export interface Notification {
  id: string;
  type: 'match' | 'like' | 'message' | 'event' | 'promotion';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  userId?: string;
}

export interface Plan {
  id: string;
  name: string;
  title: string;
  duration: 'mensal' | 'trimestral' | 'anual';
  billing_cycle: 'monthly' | 'quarterly' | 'annual';
  category: string;
  price: number;
  originalPrice?: number;
  description: string;
  target_audience: string;
  features: string[];
  popular?: boolean;
  status: 'active' | 'inactive';
}

// Usuário logado atual (pode alternar entre os dois para testar)
export const CURRENT_USER_ID = 'user-0'; // COM plano premium
// export const CURRENT_USER_ID = 'user-free'; // SEM plano premium

// Usuários mockados
export const MOCK_USERS: User[] = [
  {
    id: 'user-0',
    name: 'Você',
    age: 28,
    city: 'Goiânia',
    state: 'GO',
    bio: 'Apaixonado pelo agro e pela vida no campo. Veterinário e criador de gado. Curto rodeios e uma boa música sertaneja!',
    photos: [
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400',
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400',
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
      'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=400',
      'https://images.unsplash.com/photo-1495366691023-cc4eadcc2d7e?w=400',
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400',
    ],
    interests: ['Rodeio', 'Pecuária', 'Sertanejo', 'Fazenda'],
    occupation: 'Veterinário',
    hasPremium: true, // COM PLANO
    isAgroUser: true,
    relationshipGoals: ['namoro', 'network'],
    hasNetworkRural: false,
    agroAreas: ['Pecuária de Corte', 'Pecuária Leiteira'],
  },
  {
    id: 'user-free',
    name: 'Teste Sem Plano',
    age: 25,
    city: 'Rio Verde',
    state: 'GO',
    bio: 'Estudante de agronomia, apaixonado pelo campo.',
    photos: ['https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400'],
    interests: ['Agronomia', 'Agricultura'],
    occupation: 'Estudante',
    hasPremium: false, // SEM PLANO
  },
  {
    id: 'user-1',
    name: 'Mariana Silva',
    age: 26,
    city: 'Goiânia',
    state: 'GO',
    bio: 'Agrônoma apaixonada por cavalos e vida no campo. Amo um rodeio e estar em contato com a natureza! 🐴🌾',
    photos: [
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400',
      'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400',
      'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400',
      'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=400',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400',
    ],
    interests: ['Equitação', 'Agronomia', 'Rodeio', 'Natureza'],
    occupation: 'Agrônoma',
    hasPremium: false,
    distance: 3,
    likedYou: true, // Essa pessoa curtiu você!
  },
  {
    id: 'user-2',
    name: 'João Pedro',
    age: 29,
    city: 'Rio Verde',
    state: 'GO',
    bio: 'Produtor rural, 4ª geração no agro. Vida na fazenda é tudo! Curto um churrasco e uma boa viola. 🎸🥩',
    photos: [
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400',
    ],
    interests: ['Pecuária', 'Churrasco', 'Música Sertaneja'],
    occupation: 'Produtor Rural',
    hasPremium: false,
    distance: 45,
  },
  {
    id: 'user-3',
    name: 'Camila Rodrigues',
    age: 24,
    city: 'Uberlândia',
    state: 'MG',
    bio: 'Zootecnista e apaixonada por animais. Adoro festas do peão e viajar pelo interior! 🐂✨',
    photos: [
      'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
      'https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?w=400',
    ],
    interests: ['Zootecnia', 'Rodeio', 'Viagens', 'Festas'],
    occupation: 'Zootecnista',
    hasPremium: false,
    distance: 120,
  },
  {
    id: 'user-4',
    name: 'Lucas Mendes',
    age: 31,
    city: 'Goiânia',
    state: 'GO',
    bio: 'Engenheiro agrícola. Tecnologia no campo é minha praia. Nas horas vagas, pescaria e churrasco! 🎣',
    photos: [
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
    ],
    interests: ['Tecnologia Agrícola', 'Pescaria', 'Churrasco'],
    occupation: 'Engenheiro Agrícola',
    hasPremium: false,
    distance: 8,
  },
  {
    id: 'user-5',
    name: 'Beatriz Costa',
    age: 27,
    city: 'Jataí',
    state: 'GO',
    bio: 'Médica veterinária especializada em grandes animais. Apaixonada por cavalos e pela rotina na fazenda! 🐴💚',
    photos: [
      'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400',
    ],
    interests: ['Veterinária', 'Cavalos', 'Fazenda'],
    occupation: 'Médica Veterinária',
    hasPremium: false,
    distance: 85,
  },
];

// Matches do usuário atual
export const MOCK_MATCHES: Match[] = [
  {
    id: 'match-1',
    userId: 'user-1',
    matchedAt: new Date('2024-11-28T10:30:00'),
    lastMessage: 'Que legal! Também adoro rodeios 🤠',
    lastMessageTime: new Date('2024-11-30T14:20:00'),
    unreadCount: 2,
  },
  {
    id: 'match-2',
    userId: 'user-3',
    matchedAt: new Date('2024-11-27T15:45:00'),
    lastMessage: 'Vamos marcar de ir na próxima expo?',
    lastMessageTime: new Date('2024-11-29T18:30:00'),
    unreadCount: 0,
  },
  {
    id: 'match-3',
    userId: 'user-5',
    matchedAt: new Date('2024-11-25T09:15:00'),
    lastMessage: 'Oi! Tudo bem?',
    lastMessageTime: new Date('2024-11-25T09:20:00'),
    unreadCount: 0,
  },
];

// Mensagens mockadas para cada match
export const MOCK_MESSAGES: Record<string, Message[]> = {
  'user-1': [
    {
      id: 'msg-1',
      senderId: 'user-1',
      receiverId: 'user-0',
      text: 'Oi! Vi que você também curte rodeios!',
      timestamp: new Date('2024-11-28T10:35:00'),
      read: true,
    },
    {
      id: 'msg-2',
      senderId: 'user-0',
      receiverId: 'user-1',
      text: 'Oi Mariana! Sim, adoro! Você vai na expo de Goiânia?',
      timestamp: new Date('2024-11-28T11:00:00'),
      read: true,
    },
    {
      id: 'msg-3',
      senderId: 'user-1',
      receiverId: 'user-0',
      text: 'Com certeza! Sempre vou 😊',
      timestamp: new Date('2024-11-30T14:15:00'),
      read: true,
    },
    {
      id: 'msg-4',
      senderId: 'user-1',
      receiverId: 'user-0',
      text: 'Que legal! Também adoro rodeios 🤠',
      timestamp: new Date('2024-11-30T14:20:00'),
      read: false,
    },
  ],
  'user-3': [
    {
      id: 'msg-5',
      senderId: 'user-3',
      receiverId: 'user-0',
      text: 'Oi! Achei seu perfil incrível!',
      timestamp: new Date('2024-11-27T16:00:00'),
      read: true,
    },
    {
      id: 'msg-6',
      senderId: 'user-0',
      receiverId: 'user-3',
      text: 'Obrigado! O seu também 😊',
      timestamp: new Date('2024-11-27T16:30:00'),
      read: true,
    },
    {
      id: 'msg-7',
      senderId: 'user-3',
      receiverId: 'user-0',
      text: 'Vamos marcar de ir na próxima expo?',
      timestamp: new Date('2024-11-29T18:30:00'),
      read: true,
    },
  ],
  'user-5': [
    {
      id: 'msg-8',
      senderId: 'user-5',
      receiverId: 'user-0',
      text: 'Oi! Tudo bem?',
      timestamp: new Date('2024-11-25T09:20:00'),
      read: true,
    },
  ],
};

// Eventos agropecuários
export const MOCK_EVENTS: AgroEvent[] = [
  {
    id: 'event-1',
    title: 'Expo Goiânia 2024',
    type: 'exposicao',
    date: new Date('2024-12-15T08:00:00'),
    location: 'Centro de Convenções',
    city: 'Goiânia',
    state: 'GO',
    description: 'A maior exposição agropecuária de Goiás! Rodeios, leilões, shows e muito mais.',
    image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400',
    price: 'R$ 50,00',
  },
  {
    id: 'event-2',
    title: 'Rodeio de Rio Verde',
    type: 'rodeio',
    date: new Date('2024-12-20T19:00:00'),
    location: 'Arena Rio Verde',
    city: 'Rio Verde',
    state: 'GO',
    description: 'Rodeio profissional com os melhores peões do Brasil. Shows sertanejos após as competições.',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400',
    price: 'R$ 80,00',
  },
  {
    id: 'event-3',
    title: 'Balada do Agro - Caldas Country',
    type: 'balada',
    date: new Date('2024-12-07T22:00:00'),
    location: 'Caldas Country Club',
    city: 'Goiânia',
    state: 'GO',
    description: 'A melhor balada sertaneja de Goiânia! Open bar e shows ao vivo.',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400',
    price: 'R$ 120,00',
  },
  {
    id: 'event-4',
    title: 'Encontro Universitário do Agro',
    type: 'encontro',
    date: new Date('2024-12-10T14:00:00'),
    location: 'UFG - Campus Samambaia',
    city: 'Goiânia',
    state: 'GO',
    description: 'Networking para estudantes e profissionais do agronegócio. Palestras e workshops.',
    image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400',
    price: 'Gratuito',
  },
  {
    id: 'event-5',
    title: 'Feira de Tecnologia Agrícola',
    type: 'feira',
    date: new Date('2024-12-12T09:00:00'),
    location: 'Centro de Eventos',
    city: 'Rio Verde',
    state: 'GO',
    description: 'Últimas novidades em tecnologia para o campo. Drones, tratores, sistemas de irrigação e mais.',
    image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400',
    price: 'R$ 30,00',
  },
  {
    id: 'event-6',
    title: 'Leilão Nelore de Elite',
    type: 'leilao',
    date: new Date('2024-12-18T14:00:00'),
    location: 'Parque de Exposições',
    city: 'Anápolis',
    state: 'GO',
    description: 'Leilão de gado Nelore com animais campeões. Genética de ponta para seu rebanho.',
    image: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=400',
    price: 'Entrada franca',
  },
  {
    id: 'event-7',
    title: 'Show Gusttavo Lima',
    type: 'show',
    date: new Date('2024-12-22T21:00:00'),
    location: 'Arena Country',
    city: 'Goiânia',
    state: 'GO',
    description: 'Show especial de fim de ano com o Embaixador! Imperdível!',
    image: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=400',
    price: 'R$ 150,00',
  },
  {
    id: 'event-8',
    title: 'Congresso Nacional do Agronegócio',
    type: 'congresso',
    date: new Date('2024-12-05T08:00:00'),
    location: 'Centro de Convenções',
    city: 'Goiânia',
    state: 'GO',
    description: 'Palestras com especialistas, tendências do mercado e networking de alto nível.',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400',
    price: 'R$ 200,00',
  },
];

// Notificações
export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    type: 'match',
    title: 'Novo Match! 💚',
    message: 'Você e Mariana Silva deram match!',
    timestamp: new Date('2024-11-28T10:30:00'),
    read: false,
    userId: 'user-1',
  },
  {
    id: 'notif-2',
    type: 'like',
    title: 'Alguém curtiu você! 😍',
    message: 'Você recebeu um novo like. Assine Premium para ver quem foi!',
    timestamp: new Date('2024-11-30T16:45:00'),
    read: false,
  },
  {
    id: 'notif-3',
    type: 'message',
    title: 'Nova mensagem',
    message: 'Mariana Silva enviou uma mensagem',
    timestamp: new Date('2024-11-30T14:20:00'),
    read: true,
    userId: 'user-1',
  },
  {
    id: 'notif-4',
    type: 'event',
    title: 'Evento próximo! 🎉',
    message: 'Expo Goiânia 2024 começa em 2 semanas!',
    timestamp: new Date('2024-11-29T09:00:00'),
    read: true,
  },
  {
    id: 'notif-5',
    type: 'promotion',
    title: 'Oferta Especial! 🔥',
    message: '50% OFF no plano trimestral. Aproveite!',
    timestamp: new Date('2024-11-27T10:00:00'),
    read: true,
  },
];

// Planos Premium
export const PREMIUM_PLANS: Plan[] = [
  {
    id: 'paixao_sertaneja',
    name: 'Mensal',
    title: 'Paixão Sertaneja',
    duration: 'mensal',
    billing_cycle: 'monthly',
    category: 'sou_agro',
    price: 99.90,
    description: 'Para quem vive o agro de coração',
    target_audience: 'Pessoas ligadas diretamente ao Agro',
    popular: true,
    status: 'active',
    features: [
      'Curtidas ilimitadas',
      'Mensagens ilimitadas após o match',
      '2 Retorno da Estrada Livre - Se passou reto, pode dar meia-volta e rever o perfil',
      '3 Olhar do Campo - Mostra quem já reparou em você e deixou seu like',
      '4 Super Agro por mês - Demonstrações especiais de interesse',
      'Passaporte Rural – Matches em qualquer região do Brasil',
      'Sítio Secreto - Seu perfil visível apenas para quem você escolher',
      'Rumo Certo - Apenas os perfis que combinam com suas escolhas aparecem',
      '1 Assobio do Peão - Seu perfil em destaque por 1h na sua região',
      'Selo Rural Exclusivo',
      '1 Chekin Agro Premium - Apareça em evidência em eventos agro',
    ],
  },
  {
    id: 'coracao_do_campo',
    name: 'Trimestral',
    title: 'Coração do Campo',
    duration: 'trimestral',
    billing_cycle: 'quarterly',
    category: 'sou_agro',
    price: 249.90,
    originalPrice: 299.70,
    description: 'O melhor custo-benefício para encontrar seu par',
    target_audience: 'Pessoas ligadas diretamente ao Agro',
    status: 'active',
    features: [
      'Tudo do Paixão Sertaneja',
      '6 Retorno da Estrada Livre',
      '12 Super Agro por trimestre',
      '3 Assobio do Peão',
      '3 Chekin Agro Premium',
      'Economia de 17%',
    ],
  },
  {
    id: 'alma_rural',
    name: 'Anual',
    title: 'Alma Rural',
    duration: 'anual',
    billing_cycle: 'annual',
    category: 'sou_agro',
    price: 799.90,
    originalPrice: 1198.80,
    description: 'Para quem busca o amor verdadeiro no campo',
    target_audience: 'Pessoas ligadas diretamente ao Agro',
    status: 'active',
    features: [
      'Tudo do Coração do Campo',
      '24 Retorno da Estrada Livre',
      '48 Super Agro por ano',
      '12 Assobio do Peão',
      '12 Chekin Agro Premium',
      'Economia de 33%',
      'Suporte prioritário',
    ],
  },
];

// Itens avulsos
export interface StoreItem {
  id: string;
  name: string;
  type: 'boost' | 'superlike';
  quantity: number;
  price: number;
  popular?: boolean;
}

export const STORE_ITEMS: StoreItem[] = [
  {
    id: 'item-boost-1',
    name: '1 Boost',
    type: 'boost',
    quantity: 1,
    price: 9.90,
  },
  {
    id: 'item-boost-5',
    name: '5 Boosts',
    type: 'boost',
    quantity: 5,
    price: 39.90,
    popular: true,
  },
  {
    id: 'item-boost-10',
    name: '10 Boosts',
    type: 'boost',
    quantity: 10,
    price: 69.90,
  },
  {
    id: 'item-superlike-5',
    name: '5 Super Likes',
    type: 'superlike',
    quantity: 5,
    price: 14.90,
  },
  {
    id: 'item-superlike-25',
    name: '25 Super Likes',
    type: 'superlike',
    quantity: 25,
    price: 49.90,
    popular: true,
  },
];

// Função helper para pegar usuário por ID
export const getUserById = (id: string): User | undefined => {
  return MOCK_USERS.find((user) => user.id === id);
};

// Função helper para pegar mensagens de um chat
export const getMessagesByUserId = (userId: string): Message[] => {
  return MOCK_MESSAGES[userId] || [];
};
