/**
 * 🔥 BOTA LOVE APP - Firebase Types
 * 
 * Definição de todos os tipos e interfaces para
 * as collections do Firestore
 * 
 * @author Bota Love Team
 */

import { Timestamp } from 'firebase/firestore';

// =============================================================================
// 📝 TIPOS BASE
// =============================================================================

export type UserStatus = 'pending' | 'active' | 'suspended' | 'deleted';
export type SubscriptionStatus = 'none' | 'trial' | 'active' | 'expired' | 'cancelled';
export type SubscriptionPlan = 'free' | 'premium_monthly' | 'premium_quarterly' | 'premium_annual' | 'network_monthly' | 'network_lifetime';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type PaymentProvider = 'apple_store' | 'google_play' | 'stripe' | 'simulated';
export type ChatOrigin = 'match' | 'network' | 'correio_da_roca' | 'misterio_do_campo';
export type MessageType = 'text' | 'image' | 'audio' | 'system' | 'misterio';
export type MessageStatus = 'sent' | 'delivered' | 'read';
export type NotificationType = 'match' | 'message' | 'like' | 'super_like' | 'trial_expiring' | 'subscription_expired' | 'system';
export type RelationshipGoal = 'amizade' | 'namoro' | 'casamento' | 'eventos' | 'network';
export type Gender = 'male' | 'female' | 'non_binary' | 'other';
export type GenderPreference = 'male' | 'female' | 'all';

// =============================================================================
// 👤 USUÁRIOS (users collection)
// =============================================================================

export type UserAccountType = 'agro' | 'simpatizante' | 'produtor';

export interface FirebaseUser {
  // Identificação
  id: string;
  email: string;
  emailVerified: boolean;
  verificationCode?: string;
  verificationCodeExpiry?: Timestamp;
  
  // Tipo de conta
  userType?: UserAccountType;
  
  // Perfil básico
  profile: UserProfile;
  
  // Status e configurações
  status: UserStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastActive: Timestamp;
  
  // Planos e assinaturas
  subscription: UserSubscription;
  networkRural: NetworkRuralData;
  
  // Configurações de notificação
  notificationSettings: NotificationSettings;
  fcmTokens: string[];
  
  // Configurações de descoberta
  discoverySettings: DiscoverySettings;
  
  // Estatísticas
  stats: UserStats;
  
  // Inventário de itens avulsos
  inventory?: UserInventory;
  
  // Status de boost (Assobios do Peão)
  boostStatus?: UserBoostStatus;
}

export interface UserInventory {
  superLikes: number;
  boosts: number;
}

// Status de boost ativo do usuário
export interface UserBoostStatus {
  isActive: boolean;
  activatedAt?: Timestamp;
  expiresAt?: Timestamp;
}

export interface UserProfile {
  name: string;
  birthDate: Timestamp | null;
  age: number;
  gender: Gender;
  genderPreference: GenderPreference;
  bio: string;
  photos: string[];
  city: string;
  state: string;
  occupation: string;
  relationshipGoals: RelationshipGoal[];
  isAgroUser: boolean;
  agroAreas?: string[];
  profileCompleted?: boolean; // Flag para indicar perfil completo
  
  // Novos campos obrigatórios - O que procura por aqui
  lookingForGoals?: LookingForGoal[]; // Múltipla escolha: amizade, namoro, casamento, eventos, network
  networkEnabled?: boolean; // Se ativou Network no Agro
  
  // Nacionalidade e preferência de moradia
  nationality?: string;
  livingPreference?: LivingPreference; // 'campo' | 'cidade' | 'ambos'
  
  // Valores rurais (múltipla escolha)
  ruralValues?: RuralValue[];
  
  // Orientação sexual
  sexualOrientation?: SexualOrientation;
  
  // Informações Básicas
  birthCity?: string;
  birthState?: string; // Estado de nascimento
  height?: string;
  children?: string;
  education?: string;
  institution?: string;
  professions?: string[];
  
  // Vida Rural
  ruralActivities?: string[];
  propertySize?: string[];
  animals?: string[];
  crops?: string[];
  
  // Preferências e hobbies
  musicalStyles?: string[];
  hobbies?: string[]; // Hobbies rurais
  ruralHobbies?: string[]; // Hobbies específicos rurais
  personalTastes?: string[];
  pets?: string[];
  
  // Campos removidos/depreciados
  interests?: string[]; // Removido conforme solicitação
}

// Tipos para novos campos
export type LookingForGoal = 'amizade_agro' | 'namoro_agro' | 'casamento_agro' | 'eventos_agro' | 'network_agro';
export type LivingPreference = 'campo' | 'cidade' | 'ambos';
export type RuralValue = 'familia' | 'conservador' | 'tradicao' | 'fe_religiao' | 'simplicidade' | 'prosperidade' | 'carater_respeito' | 'bruto' | 'rustico' | 'sistematico';
export type SexualOrientation = 'heterossexual' | 'homossexual' | 'bissexual' | 'pansexual' | 'assexual' | 'outro' | 'prefiro_nao_dizer';

export interface UserSubscription {
  status: SubscriptionStatus;
  plan: SubscriptionPlan;
  startDate: Timestamp | null;
  endDate: Timestamp | null;
  trialEndDate: Timestamp | null;
  autoRenew: boolean;
  lastPaymentId: string | null;
}

export interface NetworkRuralData {
  isActive: boolean;
  subscription: {
    status: SubscriptionStatus;
    plan: 'monthly' | 'lifetime' | null;
    startDate: Timestamp | null;
    endDate: Timestamp | null;
    trialEndDate: Timestamp | null;
  };
  linkedIn?: LinkedInProfile;
  goals: string[];
  lookingFor: string[];
}

export interface LinkedInProfile {
  profileUrl: string;
  currentPosition?: string;
  company?: string;
  industry?: string;
  summary?: string;
  isVerified: boolean;
  lastSync?: Timestamp;
}

export interface NotificationSettings {
  pushEnabled: boolean;
  matchNotifications: boolean;
  messageNotifications: boolean;
  likeNotifications: boolean;
  marketingNotifications: boolean;
  emailNotifications: boolean;
}

export interface DiscoverySettings {
  showMe: boolean;
  ageRange: { min: number; max: number };
  distanceRadius: number; // em km
  onlyVerified: boolean;
  onlyWithPhotos: boolean;
  
  // Localização
  state: string;
  city: string;
  latitude?: number;
  longitude?: number;
  showOutsideDistance: boolean;
  showOutsideAgeRange: boolean;
  
  // Interesse em
  genderInterest: 'men' | 'women' | 'both';
  
  // Filtros Avançados - Correspondentes ao Perfil
  selectedInterests: string[];
  selectedProfessions: string[];
  selectedRuralActivities: string[];
  selectedPropertySize: string[];
  selectedAnimals: string[];
  selectedCrops: string[];
  selectedMusicalStyles: string[];
  selectedHobbies: string[];
  selectedPets: string[];
  selectedEducation: string[];
  selectedChildren: string[];
}

export interface UserStats {
  totalLikes: number;
  totalMatches: number;
  totalMessages: number;
  profileViews: number;
  superLikesReceived: number;
}

// =============================================================================
// 💕 MATCHES (matches collection)
// =============================================================================

export interface FirebaseMatch {
  id: string;
  users: [string, string]; // IDs dos dois usuários
  createdAt: Timestamp;
  lastMessageAt: Timestamp | null;
  chatId: string;
  isActive: boolean;
  unmatchedBy?: string;
  unmatchedAt?: Timestamp;
}

// =============================================================================
// ❤️ LIKES (likes collection)
// =============================================================================

export interface FirebaseLike {
  id: string;
  fromUserId: string;
  toUserId: string;
  isSuperLike: boolean;
  createdAt: Timestamp;
  seen: boolean;
  seenAt?: Timestamp;
  matchCreated: boolean;
  matchId?: string;
}

// =============================================================================
// 💬 CHATS (chats collection)
// =============================================================================

export interface FirebaseChat {
  id: string;
  participants: [string, string];
  origin: ChatOrigin;
  matchId?: string; // Se origin = 'match'
  networkConnectionId?: string; // Se origin = 'network'
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastMessage: LastMessage | null;
  isActive: boolean;
  blockedBy?: string;
  
  // Estatísticas
  messageCount: number;
  
  // Lembretes de inatividade
  inactivityReminders: number;
  lastReminderAt?: Timestamp;
}

export interface LastMessage {
  text: string;
  senderId: string;
  timestamp: Timestamp;
  type: MessageType;
}

// =============================================================================
// 📨 MENSAGENS (chats/{chatId}/messages subcollection)
// =============================================================================

export interface FirebaseMessage {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  type: MessageType;
  status: MessageStatus;
  createdAt: Timestamp;
  readAt?: Timestamp;
  
  // Moderação
  moderated: boolean;
  originalText?: string; // Se foi sanitizado
  moderationScore?: number;
  
  // Mistério do Campo (mensagem anônima)
  misterio?: {
    isRevealed: boolean;          // Se a identidade foi revelada
    revealedAt?: Timestamp;       // Quando foi revelada
    revealMethod?: 'paid' | 'timer'; // Como foi revelada
    expiresAt: Timestamp;         // Quando revela automaticamente (24h)
    blurredPhotoUrl?: string;     // URL da foto desfocada
    originalPhotoUrl?: string;    // URL da foto original (só mostrar após revelar)
    senderName?: string;          // Nome do remetente (só mostrar após revelar)
  };
  
  // Metadados
  metadata?: {
    imageUrl?: string;
    audioUrl?: string;
    audioDuration?: number;
  };
}

// =============================================================================
// 🔔 NOTIFICAÇÕES (notifications collection)
// =============================================================================

export interface FirebaseNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data: Record<string, string>;
  read: boolean;
  readAt?: Timestamp;
  createdAt: Timestamp;
  
  // Push notification tracking
  pushSent: boolean;
  pushSentAt?: Timestamp;
  pushError?: string;
}

// =============================================================================
// 📬 CORREIO DA ROÇA (correio_da_roca collection)
// =============================================================================

export type CorreioStatus = 'pending' | 'accepted' | 'rejected';

export interface CorreioDaRoca {
  id: string;
  fromUserId: string;
  toUserId: string;
  message: string;
  status: CorreioStatus;
  createdAt: Timestamp;
  respondedAt?: Timestamp;
  chatId?: string; // Criado apenas se aceito
  matchId?: string; // Criado apenas se aceito
}

// =============================================================================
// 🚫 PASSES/REJEIÇÕES (passes collection)
// =============================================================================

export interface FirebasePass {
  id: string;
  fromUserId: string;
  toUserId: string;
  createdAt: Timestamp;
  expiresAt: Timestamp; // Volta a aparecer após X dias
}

// =============================================================================
// 💳 PAGAMENTOS (payments collection)
// =============================================================================

export interface FirebasePayment {
  id: string;
  userId: string;
  
  // Detalhes do pagamento
  amount: number;
  currency: string;
  description: string;
  
  // Produto/Plano
  productId: string;
  productType: 'subscription' | 'one_time';
  plan: SubscriptionPlan;
  
  // Status
  status: PaymentStatus;
  provider: PaymentProvider;
  
  // Referências externas (para integração futura)
  externalTransactionId?: string;
  appleTransactionId?: string;
  googleOrderId?: string;
  stripePaymentIntentId?: string;
  
  // Timestamps
  createdAt: Timestamp;
  completedAt?: Timestamp;
  failedAt?: Timestamp;
  refundedAt?: Timestamp;
  
  // Simulação
  isSimulated: boolean;
  simulationNotes?: string;
}

// =============================================================================
// 🌾 NETWORK RURAL CONNECTIONS (network_connections collection)
// =============================================================================

export interface NetworkConnection {
  id: string;
  users: [string, string];
  createdAt: Timestamp;
  chatId: string;
  connectionType: 'professional' | 'business' | 'mentorship';
  isActive: boolean;
}

// =============================================================================
// 📧 VERIFICAÇÃO DE EMAIL (email_verifications collection)
// =============================================================================

export interface EmailVerification {
  id: string;
  userId: string;
  email: string;
  code: string;
  expiresAt: Timestamp;
  verified: boolean;
  verifiedAt?: Timestamp;
  attempts: number;
  createdAt: Timestamp;
}

// =============================================================================
// 🎯 EVENTOS (events collection)
// =============================================================================

export interface FirebaseEvent {
  id: string;
  creatorId: string;
  title: string;
  description: string;
  type: 'rodeio' | 'exposicao' | 'balada' | 'encontro' | 'feira' | 'leilao' | 'show' | 'congresso';
  date: Timestamp;
  endDate?: Timestamp;
  location: {
    address: string;
    city: string;
    state: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  imageUrl: string;
  price?: string;
  maxAttendees?: number;
  attendees: string[];
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// =============================================================================
// 🛠️ TIPOS AUXILIARES
// =============================================================================

/**
 * Tipo para criação de novos documentos (sem id e timestamps)
 */
export type CreateUser = Omit<FirebaseUser, 'id' | 'createdAt' | 'updatedAt' | 'lastActive'>;
export type CreateMatch = Omit<FirebaseMatch, 'id' | 'createdAt'>;
export type CreateLike = Omit<FirebaseLike, 'id' | 'createdAt'>;
export type CreateChat = Omit<FirebaseChat, 'id' | 'createdAt' | 'updatedAt'>;
export type CreateMessage = Omit<FirebaseMessage, 'id' | 'createdAt'>;
export type CreateNotification = Omit<FirebaseNotification, 'id' | 'createdAt'>;
export type CreatePayment = Omit<FirebasePayment, 'id' | 'createdAt'>;

/**
 * Tipo para atualizações parciais
 */
export type UpdateUser = Partial<FirebaseUser>;
export type UpdateChat = Partial<FirebaseChat>;

// =============================================================================
// 📊 CONSTANTES DE COLLECTION PATHS
// =============================================================================

export const COLLECTIONS = {
  USERS: 'users',
  MATCHES: 'matches',
  LIKES: 'likes',
  PASSES: 'passes',
  CHATS: 'chats',
  MESSAGES: 'messages', // subcollection de chats
  NOTIFICATIONS: 'notifications',
  PAYMENTS: 'payments',
  NETWORK_CONNECTIONS: 'network_connections',
  EMAIL_VERIFICATIONS: 'email_verifications',
  EVENTS: 'events',
  CORREIO_DA_ROCA: 'correio_da_roca',
} as const;
