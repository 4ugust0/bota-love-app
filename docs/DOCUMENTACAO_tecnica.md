# 📚 Documentação Técnica - Bota Love App

> **Versão:** 1.0.0  
> **Última atualização:** Janeiro 2026  
> **Autor:** Bota Love Team

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura do Projeto](#arquitetura-do-projeto)
3. [Stack Tecnológico](#stack-tecnológico)
4. [Estrutura de Pastas](#estrutura-de-pastas)
5. [Firebase - Backend](#firebase---backend)
6. [Sistema de Autenticação](#sistema-de-autenticação)
7. [Sistema de Matches](#sistema-de-matches)
8. [Sistema de Chat](#sistema-de-chat)
9. [Sistema de Descoberta](#sistema-de-descoberta)
10. [Network Rural](#network-rural)
11. [Sistema de Eventos](#sistema-de-eventos)
12. [Sistema de Planos e Assinaturas](#sistema-de-planos-e-assinaturas)
13. [Cloud Functions](#cloud-functions)
14. [Gerenciamento de Estado](#gerenciamento-de-estado)
15. [Hooks Customizados](#hooks-customizados)
16. [Componentes](#componentes)
17. [Navegação](#navegação)
18. [Tema e Estilização](#tema-e-estilização)
19. [Variáveis de Ambiente](#variáveis-de-ambiente)
20. [Deploy e Configuração](#deploy-e-configuração)

---

## 🎯 Visão Geral

O **Bota Love App** é um aplicativo de relacionamentos focado no público rural e agro brasileiro. Desenvolvido com React Native (Expo), utiliza Firebase como backend completo (Auth, Firestore, Storage, Functions).

### Principais Funcionalidades

- ✅ Sistema de matches (like, super like, pass)
- ✅ Chat em tempo real
- ✅ Network Rural (networking profissional)
- ✅ Eventos agro (rodeios, feiras, shows)
- ✅ Sistema de planos (Free, Premium)
- ✅ Integração com LinkedIn
- ✅ Verificação de email
- ✅ Notificações push
- ✅ Moderação de conteúdo
- ✅ Pagamentos via Stripe/PIX

---

## 🏗️ Arquitetura do Projeto

```
┌─────────────────────────────────────────────────────────────┐
│                      BOTA LOVE APP                          │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │    Expo     │  │   React     │  │  TypeScript │         │
│  │  Router v6  │  │  Native     │  │    5.9.2    │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │                 CONTEXTS (Estado Global)             │   │
│  │  AuthContext │ FreePlanContext │ SignupContext      │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │                 FIREBASE SERVICES                    │   │
│  │  Auth │ Firestore │ Storage │ Functions │ Messaging │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │               CLOUD FUNCTIONS (v2)                   │   │
│  │  Email │ Notifications │ Moderation │ Stripe/PIX    │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Stack Tecnológico

### Frontend

| Tecnologia | Versão | Descrição |
|------------|--------|-----------|
| **Expo** | ~54.0.31 | Framework React Native |
| **React** | 19.1.0 | Biblioteca UI |
| **React Native** | 0.81.5 | Framework mobile |
| **TypeScript** | ~5.9.2 | Linguagem tipada |
| **Expo Router** | ~6.0.21 | Navegação file-based |

### Backend (Firebase)

| Serviço | Versão | Descrição |
|---------|--------|-----------|
| **Firebase SDK** | ^12.7.0 | SDK JavaScript |
| **Auth** | - | Autenticação |
| **Firestore** | - | Banco de dados NoSQL |
| **Storage** | - | Armazenamento de arquivos |
| **Functions** | v2 | Serverless functions |
| **Messaging** | - | Push notifications |

### Bibliotecas Principais

```json
{
  "react-native-reanimated": "~4.1.1",
  "react-native-gesture-handler": "~2.28.0",
  "expo-image-picker": "~17.0.10",
  "expo-location": "~19.0.8",
  "expo-notifications": "~0.32.16",
  "date-fns": "^3.6.0",
  "react-native-draggable-flatlist": "^4.0.3"
}
```

---

## 📁 Estrutura de Pastas

```
bota-love-app/
├── app/                    # Telas (file-based routing)
│   ├── (tabs)/            # Telas com navegação em tabs
│   │   ├── index.tsx      # Feed de descoberta
│   │   ├── matches.tsx    # Lista de matches
│   │   ├── chat.tsx       # Lista de conversas
│   │   ├── events.tsx     # Eventos
│   │   ├── network-rural.tsx # Network profissional
│   │   ├── profile.tsx    # Perfil do usuário
│   │   └── store.tsx      # Loja de itens
│   ├── chat/              # Telas de chat individual
│   ├── profile-detail/    # Detalhes de perfil
│   ├── onboarding*.tsx    # Fluxo de onboarding
│   ├── signup*.tsx        # Fluxo de cadastro
│   └── ...                # Outras telas
│
├── components/            # Componentes reutilizáveis
│   ├── ui/               # Componentes básicos (Button, Input)
│   ├── rural-icons/      # Ícones customizados agro
│   └── *.tsx             # Componentes específicos
│
├── constants/             # Constantes globais
│   ├── index.ts          # Constantes gerais
│   ├── theme.ts          # Tema e cores
│   └── typography.ts     # Sistema tipográfico
│
├── contexts/              # Contextos React
│   ├── AuthContext.tsx   # Autenticação
│   ├── FreePlanContext.tsx # Limites plano gratuito
│   └── SignupContext.tsx # Estado do cadastro
│
├── data/                  # Serviços de dados
│   ├── freePlanService.ts    # Lógica do plano gratuito
│   ├── mockData.ts           # Dados mockados
│   └── ...                   # Outros serviços
│
├── firebase/              # Integração Firebase
│   ├── config.ts         # Configuração
│   ├── types.ts          # Tipos TypeScript
│   ├── authService.ts    # Autenticação
│   ├── chatService.ts    # Chat
│   ├── matchService.ts   # Matches
│   ├── discoveryService.ts # Descoberta
│   ├── eventService.ts   # Eventos
│   └── ...               # Outros serviços
│
├── functions/             # Cloud Functions
│   └── src/
│       ├── auth/         # Funções de autenticação
│       ├── notifications/# Funções de notificação
│       ├── moderation/   # Moderação de conteúdo
│       ├── stripe/       # Pagamentos
│       └── user/         # Funções de usuário
│
├── hooks/                 # Hooks customizados
│   ├── useDiscoveryFeed.ts
│   ├── useChat.ts
│   └── useFreePlanLimits.ts
│
├── services/              # Serviços auxiliares
│   ├── emailService.ts
│   └── imageModeration.ts
│
├── assets/                # Assets estáticos
│   ├── fonts/
│   └── images/
│
└── docs/                  # Documentação adicional
```

---

## 🔥 Firebase - Backend

### Configuração (`firebase/config.ts`)

```typescript
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Região das Cloud Functions
const FUNCTIONS_REGION = 'southamerica-east1';
```

### Collections do Firestore

| Collection | Descrição |
|------------|-----------|
| `users` | Dados dos usuários |
| `matches` | Matches entre usuários |
| `likes` | Likes dados |
| `passes` | Perfis rejeitados |
| `chats` | Conversas |
| `chats/{id}/messages` | Mensagens (subcollection) |
| `notifications` | Notificações |
| `payments` | Pagamentos |
| `events` | Eventos |
| `network_connections` | Conexões Network Rural |
| `correio_da_roca` | Mensagens especiais |
| `email_verifications` | Verificações de email |

---

## 🔐 Sistema de Autenticação

### Tipos de Usuário

```typescript
type UserAccountType = 'agro' | 'simpatizante' | 'produtor';
type UserStatus = 'pending' | 'active' | 'suspended' | 'deleted';
```

### Estrutura do Usuário (`FirebaseUser`)

```typescript
interface FirebaseUser {
  id: string;
  email: string;
  emailVerified: boolean;
  userType?: UserAccountType;
  profile: UserProfile;
  status: UserStatus;
  subscription: UserSubscription;
  networkRural: NetworkRuralData;
  discoverySettings: DiscoverySettings;
  notificationSettings: NotificationSettings;
  stats: UserStats;
  inventory?: UserInventory;
  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastActive: Timestamp;
}
```

### Fluxo de Autenticação

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Signup     │───▶│  Verify     │───▶│  Onboarding │
│  (email)    │    │  Email      │    │  (perfil)   │
└─────────────┘    └─────────────┘    └─────────────┘
                          │
                          ▼
                   ┌─────────────┐
                   │  Home/Feed  │
                   └─────────────┘
```

### Funções do AuthService

```typescript
// Registro
registerUser(data: RegisterData): Promise<LoginResult>

// Login
loginUser(email: string, password: string): Promise<LoginResult>

// Logout
logoutUser(): Promise<void>

// Verificação de email
verifyEmailCode(code: string): Promise<boolean>
resendVerificationCode(): Promise<boolean>

// Recuperação de senha
resetPassword(email: string): Promise<boolean>
```

---

## 💕 Sistema de Matches

### Fluxo de Match

```
┌─────────────┐                    ┌─────────────┐
│  Usuário A  │                    │  Usuário B  │
│  dá like    │                    │  dá like    │
│  em B       │                    │  em A       │
└──────┬──────┘                    └──────┬──────┘
       │                                  │
       └──────────────┬───────────────────┘
                      ▼
              ┌───────────────┐
              │    MATCH!     │
              │  Chat criado  │
              └───────────────┘
```

### Estruturas de Dados

```typescript
interface FirebaseLike {
  id: string;
  fromUserId: string;
  toUserId: string;
  isSuperLike: boolean;
  createdAt: Timestamp;
  seen: boolean;
  matchCreated: boolean;
  matchId?: string;
}

interface FirebaseMatch {
  id: string;
  users: [string, string];
  createdAt: Timestamp;
  lastMessageAt: Timestamp | null;
  chatId: string;
  isActive: boolean;
}
```

### Funções do MatchService

```typescript
// Like em usuário
likeUser(fromUserId, toUserId, isSuperLike): Promise<LikeResult>

// Super Like
superLikeUser(fromUserId, toUserId): Promise<LikeResult>

// Passar perfil
passUser(fromUserId, toUserId): Promise<boolean>

// Desfazer match
unmatch(matchId, userId): Promise<boolean>

// Buscar matches
getUserMatches(userId): Promise<MatchWithUser[]>
```

---

## 💬 Sistema de Chat

### Origens de Chat

```typescript
type ChatOrigin = 'match' | 'network' | 'correio_da_roca';
```

### Estrutura do Chat

```typescript
interface FirebaseChat {
  id: string;
  participants: [string, string];
  origin: ChatOrigin;
  matchId?: string;
  networkConnectionId?: string;
  lastMessage: LastMessage | null;
  messageCount: number;
  isActive: boolean;
  // Lembretes de inatividade
  inactivityReminders: number;
  lastReminderAt?: Timestamp;
}

interface FirebaseMessage {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  type: MessageType;
  status: MessageStatus;
  createdAt: Timestamp;
  // Moderação
  moderated: boolean;
  originalText?: string;
  moderationScore?: number;
}
```

### Funções do ChatService

```typescript
// Obter chat
getChatById(chatId): Promise<FirebaseChat | null>
getUserChats(userId, origin?): Promise<FirebaseChat[]>

// Mensagens
sendMessage(chatId, senderId, text, type): Promise<SendMessageResult>
getMessages(chatId, limit?, lastDoc?): Promise<FirebaseMessage[]>

// Real-time
subscribeToMessages(chatId, callback): Unsubscribe
subscribeToChats(userId, callback): Unsubscribe

// Ações
markAsRead(chatId, userId): Promise<void>
blockChat(chatId, userId): Promise<void>
```

---

## 🔍 Sistema de Descoberta

### Filtros de Descoberta

```typescript
interface DiscoverySettings {
  showMe: boolean;
  ageRange: { min: number; max: number };
  distanceRadius: number; // km
  genderInterest: 'men' | 'women' | 'both';
  state: string;
  city: string;
  // Filtros avançados
  selectedInterests: string[];
  selectedProfessions: string[];
  selectedRuralActivities: string[];
  selectedPropertySize: string[];
  selectedAnimals: string[];
  onlyVerified: boolean;
  onlyWithPhotos: boolean;
}
```

### Cálculo de Distância (Haversine)

```typescript
function calculateDistance(lat1, lon1, lat2, lon2): number {
  const R = 6371; // Raio da Terra em km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  // ... fórmula de Haversine
  return distanceInKm;
}
```

### Funções do DiscoveryService

```typescript
// Feed de descoberta
getDiscoveryFeed(filters: DiscoveryFilters): Promise<DiscoveryUser[]>

// Atualizar configurações
updateDiscoverySettings(userId, settings): Promise<void>

// Verificar se usuário foi visto
hasUserBeenSeen(fromUserId, toUserId): Promise<boolean>
```

---

## 🌾 Network Rural

### Funcionalidades

- Networking profissional entre profissionais do agro
- Integração com LinkedIn
- Conexões por tipo (profissional, negócio, mentoria)
- Chat dedicado para networking

### Estruturas

```typescript
interface NetworkRuralData {
  isActive: boolean;
  subscription: {
    status: SubscriptionStatus;
    plan: 'monthly' | 'lifetime' | null;
    startDate: Timestamp | null;
    endDate: Timestamp | null;
  };
  linkedIn?: LinkedInProfile;
  goals: string[];
  lookingFor: string[];
}

interface NetworkConnection {
  id: string;
  users: [string, string];
  connectionType: 'professional' | 'business' | 'mentorship';
  chatId: string;
  isActive: boolean;
}
```

### Funções do NetworkRuralService

```typescript
// Buscar perfis
getNetworkProfiles(userId, filters?): Promise<NetworkProfile[]>

// Conexões
createConnection(request): Promise<{ connectionId, chatId }>
getConnectionBetweenUsers(userId1, userId2): Promise<NetworkConnection | null>
getUserConnections(userId): Promise<NetworkConnection[]>
```

---

## 🎪 Sistema de Eventos

### Tipos de Evento

```typescript
type EventType = 'show' | 'feira' | 'rodeio' | 'leilao' | 
                 'circuito' | 'festa' | 'congresso';

type EventStatus = 'pending' | 'active' | 'completed' | 'cancelled';
```

### Estrutura do Evento

```typescript
interface Event {
  id: string;
  producerId: string;
  producerName: string;
  title: string;
  description: string;
  eventType: EventType;
  eventDate: Timestamp;
  venueName: string;
  city: string;
  state: string;
  capacity: number;
  // Publicação
  durationDays: number; // 15, 30, 60, 90
  highlightDays?: number;
  isHighlighted: boolean;
  // Métricas
  views: number;
  attendees: number;
  interested: number;
  status: EventStatus;
}
```

### Funções do EventService

```typescript
// CRUD
createEvent(event, producerId): Promise<string>
updateEvent(eventId, updates): Promise<void>
deleteEvent(eventId): Promise<void>

// Busca
getActiveEvents(filters?): Promise<Event[]>
getEventsByProducer(producerId): Promise<Event[]>
getHighlightedEvents(): Promise<Event[]>

// Interações
markInterested(eventId, userId): Promise<void>
confirmAttendance(eventId, userId): Promise<void>
```

---

## 💳 Sistema de Planos e Assinaturas

### Planos Disponíveis

```typescript
type SubscriptionPlan = 
  | 'free' 
  | 'premium_monthly' 
  | 'premium_quarterly' 
  | 'premium_annual'
  | 'network_monthly'
  | 'network_lifetime';

type SubscriptionStatus = 'none' | 'trial' | 'active' | 'expired' | 'cancelled';
```

### Sistema de Plano Gratuito

#### Períodos e Limites

| Período | Views/dia | Likes/dia | Msgs/match |
|---------|-----------|-----------|------------|
| **Dia 1** | ∞ | ∞ | 2 |
| **Dias 2-7** | 120 | 25 | 1 |
| **Dias 8-10** | 50 | 25 | 1 |
| **Dias 11-14** | 20 | 15 | 0 (só leitura) |
| **Após 1º mês** | 10 | 10 | 0 (só leitura) |
| **2º mês+** | 5 | 5 | 0 (só leitura) |

#### Visibilidade de Perfil (Gratuito)

```typescript
interface ProfileVisibility {
  age: boolean;        // ✅ Visível
  city: boolean;       // ✅ Visível
  distance: boolean;   // ✅ Visível
  gender: boolean;     // ✅ Visível
  fullBio: boolean;    // ❌ Restrito
  profession: boolean; // ❌ Restrito
  interests: boolean;  // ❌ Restrito
  extraPhotos: boolean;// ❌ Restrito
}
```

### Estrutura de Assinatura

```typescript
interface UserSubscription {
  status: SubscriptionStatus;
  plan: SubscriptionPlan;
  startDate: Timestamp | null;
  endDate: Timestamp | null;
  trialEndDate: Timestamp | null;
  autoRenew: boolean;
  lastPaymentId: string | null;
}
```

---

## ☁️ Cloud Functions

### Região

```typescript
const REGION = 'southamerica-east1'; // Brasil
```

### Funções Disponíveis

#### Autenticação

| Função | Descrição |
|--------|-----------|
| `sendVerificationEmail` | Envia código de verificação |
| `verifyEmailCode` | Verifica código digitado |
| `resendVerificationCode` | Reenvia código |
| `sendPasswordResetCode` | Envia código de reset |
| `verifyPasswordResetCode` | Verifica código de reset |
| `resetPassword` | Reseta a senha |
| `sendWelcomeEmail` | Email de boas-vindas |

#### Notificações

| Função | Descrição |
|--------|-----------|
| `sendMatchNotification` | Notifica novo match |
| `sendLikeNotification` | Notifica novo like |
| `sendMessageNotification` | Notifica nova mensagem |

#### Moderação

| Função | Descrição |
|--------|-----------|
| `moderateMessage` | Modera conteúdo de mensagens |

#### Usuário

| Função | Descrição |
|--------|-----------|
| `onUserLogin` | Trigger ao fazer login |

#### Pagamentos (Stripe/PIX)

| Função | Descrição |
|--------|-----------|
| `createPixPayment` | Cria pagamento PIX |
| `getPixPaymentStatus` | Verifica status |
| `cancelPixPayment` | Cancela pagamento |
| `getPaymentHistory` | Histórico de pagamentos |
| `stripeWebhook` | Webhook do Stripe |

---

## 🔄 Gerenciamento de Estado

### AuthContext

```typescript
interface AuthContextType {
  // Estado
  currentUser: FirebaseUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasPremium: boolean;
  hasNetworkRural: boolean;
  
  // Ações de auth
  register: (data) => Promise<LoginResult>;
  login: (email, password) => Promise<LoginResult>;
  logout: () => Promise<void>;
  verifyEmail: (code) => Promise<boolean>;
  resetPassword: (email) => Promise<boolean>;
  
  // Ações de perfil
  updateProfile: (data) => Promise<void>;
  updatePhotos: (photos) => Promise<void>;
  updateDiscoverySettings: (settings) => Promise<void>;
  
  // Ações de assinatura
  activatePremiumTrial: () => Promise<boolean>;
  subscribeToPlan: (planId) => Promise<boolean>;
  cancelPremium: () => Promise<boolean>;
}
```

### FreePlanContext

```typescript
interface FreePlanContextType {
  // Estado
  isFreePlan: boolean;
  currentPeriod: FreePlanPeriod;
  limits: FreePlanLimits;
  
  // Informações de uso
  viewsInfo: { used, limit, remaining };
  likesInfo: { used, limit, remaining };
  
  // Verificações
  checkCanView: () => boolean;
  checkCanLike: () => boolean;
  checkCanSendMessage: (matchId) => boolean;
  
  // Consumir limites
  consumeView: () => boolean;
  consumeLike: () => boolean;
  consumeMessage: (matchId) => boolean;
  
  // Modal de conversão
  showConversionModal: boolean;
  triggerConversion: (type) => void;
}
```

### SignupContext

Gerencia o fluxo de cadastro multi-step:
- Nome
- Email
- Senha
- Verificação
- Termos
- Onboarding

---

## 🪝 Hooks Customizados

### useDiscoveryFeed

```typescript
const {
  users,          // Usuários para exibir
  isLoading,      // Carregando
  error,          // Erro
  hasMore,        // Tem mais usuários
  loadMore,       // Carregar mais
  handleLike,     // Dar like
  handlePass,     // Passar
  handleSuperLike,// Super like
  refreshFeed,    // Atualizar feed
} = useDiscoveryFeed(filters);
```

### useChat

```typescript
const {
  messages,       // Lista de mensagens
  isLoading,      // Carregando
  sendMessage,    // Enviar mensagem
  loadMore,       // Carregar anteriores
  markAsRead,     // Marcar como lida
} = useChat(chatId);
```

### useFreePlanLimits

```typescript
const {
  canView,
  canLike,
  canMessage,
  viewsRemaining,
  likesRemaining,
  consumeView,
  consumeLike,
} = useFreePlanLimits();
```

### useLocationPermission

```typescript
const {
  hasPermission,
  location,
  requestPermission,
  getCurrentLocation,
} = useLocationPermission();
```

---

## 🧩 Componentes

### Componentes UI Básicos

| Componente | Arquivo | Descrição |
|------------|---------|-----------|
| `BotaButton` | `ui/bota-button.tsx` | Botão estilizado |
| `BotaInput` | `ui/bota-input.tsx` | Input estilizado |
| `ThemedText` | `themed-text.tsx` | Texto com tema |
| `ThemedView` | `themed-view.tsx` | View com tema |
| `Collapsible` | `ui/collapsible.tsx` | Conteúdo colapsável |

### Componentes de Negócio

| Componente | Descrição |
|------------|-----------|
| `MatchAnimation` | Animação de match |
| `SuperLikeAnimation` | Animação de super like |
| `PremiumModal` | Modal de planos premium |
| `ConversionModal` | Modal de conversão |
| `CompleteProfileModal` | Modal para completar perfil |
| `RestrictedProfile` | Perfil com dados bloqueados |
| `LockedFilter` | Filtro bloqueado (premium) |
| `NetworkBadge` | Badge Network Rural |
| `ConversationReminderCard` | Lembrete de inatividade |
| `LocationInitializer` | Inicializa localização |

### Ícones Rurais

Componentes em `components/rural-icons/` para ícones temáticos do agro.

---

## 🗺️ Navegação

### Estrutura de Rotas (File-based)

```
app/
├── _layout.tsx              # Layout raiz
├── index.tsx                # Tela inicial
├── (tabs)/                  # Tab Navigator
│   ├── _layout.tsx          # Layout das tabs
│   ├── index.tsx            # Descoberta
│   ├── matches.tsx          # Matches
│   ├── chat.tsx             # Chats
│   ├── events.tsx           # Eventos
│   ├── network-rural.tsx    # Network
│   ├── profile.tsx          # Perfil
│   └── store.tsx            # Loja
├── chat/
│   └── [id].tsx             # Chat individual
├── profile-detail/
│   └── [id].tsx             # Detalhe de perfil
├── onboarding*.tsx          # Fluxo onboarding
├── signup*.tsx              # Fluxo cadastro
├── login.tsx                # Login
├── settings.tsx             # Configurações
├── plans.tsx                # Planos
└── ...
```

### Tabs Principais

| Tab | Ícone | Tela |
|-----|-------|------|
| Descobrir | 🔍 | Feed de perfis |
| Matches | 💕 | Lista de matches |
| Chat | 💬 | Conversas |
| Eventos | 🎪 | Eventos agro |
| Network | 🌾 | Network Rural |
| Perfil | 👤 | Meu perfil |

---

## 🎨 Tema e Estilização

### Paleta de Cores

```typescript
const BotaLoveColors = {
  // Primárias (laranja/amarelo agro)
  primary: '#F9A825',
  primaryLight: '#FFD54F',
  primaryDark: '#F57C00',
  
  // Secundárias (marrom couro)
  secondary: '#502914',
  secondaryLight: '#663C23',
  secondaryDark: '#3E1F0F',
  
  // Neutras
  neutralLight: '#FFF9E6',
  neutralMedium: '#A9927A',
  neutralDark: '#7A5841',
  
  // Texto
  textPrimary: '#1F130C',
  textSecondary: '#502914',
  textLight: '#FFFFFF',
  
  // Background
  backgroundLight: '#EFEFEF',
  backgroundWhite: '#FFFFFF',
  
  // Status
  error: '#E53935',
  success: '#66BB6A',
  warning: '#FFA726',
};
```

### Fontes

- **Sans-serif:** Montserrat
- **Serif:** Playfair Display

---

## 🔐 Variáveis de Ambiente

### Arquivo `.env.example`

```bash
# Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=your-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
EXPO_PUBLIC_FIREBASE_APP_ID=your-app-id
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id

# Stripe (Pagamentos)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email Service
SENDGRID_API_KEY=SG...
EMAIL_FROM=noreply@botalove.com
```

---

## 🚀 Deploy e Configuração

### Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Iniciar Expo
npx expo start

# Android
npx expo start --android

# iOS
npx expo start --ios

# Web
npx expo start --web
```

### Deploy Cloud Functions

```bash
cd functions

# Instalar dependências
npm install

# Deploy
firebase deploy --only functions
```

### Build de Produção

```bash
# Build Android
eas build --platform android

# Build iOS
eas build --platform ios

# Submit para stores
eas submit
```

### Configuração Firebase

1. Criar projeto no [Firebase Console](https://console.firebase.google.com)
2. Ativar Auth (Email/Password)
3. Criar banco Firestore
4. Configurar Storage
5. Copiar credenciais para `.env`
6. Adicionar `google-services.json` (Android)
7. Adicionar `GoogleService-Info.plist` (iOS)

---

## 📊 Regras do Firestore

Ver arquivo `firestore.rules` para regras de segurança detalhadas.

---

## 📖 Documentação Adicional

- [FIREBASE_SETUP.md](docs/FIREBASE_SETUP.md) - Setup completo do Firebase
- [STRIPE_LINKEDIN_SETUP.md](docs/STRIPE_LINKEDIN_SETUP.md) - Integração Stripe/LinkedIn
- [FREE_PLAN.md](docs/FREE_PLAN.md) - Detalhes do plano gratuito
- [MATCH_MODULE.md](docs/MATCH_MODULE.md) - Módulo de matches
- [NETWORK_RURAL.md](docs/NETWORK_RURAL.md) - Network Rural
- [IMAGE_MODERATION.md](docs/IMAGE_MODERATION.md) - Moderação de imagens

---

## 📝 Changelog

### v1.0.0 (Janeiro 2026)
- 🚀 Lançamento inicial
- ✅ Sistema de autenticação completo
- ✅ Matches e chat em tempo real
- ✅ Network Rural
- ✅ Sistema de eventos
- ✅ Planos e assinaturas
- ✅ Pagamentos PIX via Stripe
- ✅ Push notifications
- ✅ Moderação de conteúdo

---

> **Bota Love App** - Conectando corações do campo 🌾💕
