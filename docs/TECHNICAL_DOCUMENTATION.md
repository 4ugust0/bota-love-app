# 🤠 BOTA LOVE APP - Documentação Técnica

> **Versão:** 1.0.0  
> **Última Atualização:** Fevereiro 2026  
> **Plataformas:** iOS, Android, Web  
> **Framework:** React Native + Expo

---

## 📑 Índice

1. [Visão Geral](#1-visão-geral)
2. [Stack Tecnológica](#2-stack-tecnológica)
3. [Arquitetura do Sistema](#3-arquitetura-do-sistema)
4. [Estrutura de Diretórios](#4-estrutura-de-diretórios)
5. [Firebase Services](#5-firebase-services)
6. [Modelo de Dados (Firestore)](#6-modelo-de-dados-firestore)
7. [Sistema de Autenticação](#7-sistema-de-autenticação)
8. [Sistema de Planos e Assinaturas](#8-sistema-de-planos-e-assinaturas)
9. [Funcionalidades Premium (Itens Avulsos)](#9-funcionalidades-premium-itens-avulsos)
10. [Sistema de Matching](#10-sistema-de-matching)
11. [Sistema de Chat](#11-sistema-de-chat)
12. [Sistema de Notificações](#12-sistema-de-notificações)
13. [Cloud Functions](#13-cloud-functions)
14. [Moderação de Conteúdo](#14-moderação-de-conteúdo)
15. [Configuração e Deploy](#15-configuração-e-deploy)
16. [Variáveis de Ambiente](#16-variáveis-de-ambiente)
17. [Testes](#17-testes)
18. [Changelog](#18-changelog)

---

## 1. Visão Geral

### 1.1 Descrição do Produto

O **Bota Love App** é uma plataforma de relacionamentos voltada para o público do agronegócio brasileiro. O aplicativo conecta pessoas com interesses no mundo rural, oferecendo funcionalidades de match, networking profissional e descoberta de eventos agropecuários.

### 1.2 Tipos de Usuário

| Tipo | Código | Descrição |
|------|--------|-----------|
| **Agro** | `agro` | Usuários ligados diretamente ao agronegócio |
| **Simpatizante** | `simpatizante` | Usuários que admiram o estilo de vida rural |
| **Produtor** | `produtor` | Organizadores de eventos agropecuários |

### 1.3 Principais Módulos

- **Discovery**: Feed de perfis para matching (estilo Tinder)
- **Network Rural**: Networking profissional do agro
- **Eventos**: Publicação e check-in em eventos agropecuários
- **Chat**: Mensagens em tempo real com moderação
- **Loja**: Compra de itens premium avulsos

---

## 2. Stack Tecnológica

### 2.1 Frontend

| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| React Native | 0.81.5 | Framework mobile |
| Expo | ~54.0.31 | Toolchain de desenvolvimento |
| Expo Router | ~6.0.21 | Navegação file-based |
| TypeScript | ~5.9.2 | Type safety |
| React Navigation | 7.x | Navegação nativa |

### 2.2 Backend (BaaS)

| Serviço | Propósito |
|---------|-----------|
| Firebase Authentication | Autenticação de usuários |
| Cloud Firestore | Banco de dados NoSQL |
| Firebase Storage | Armazenamento de mídia |
| Cloud Functions | Serverless backend |
| Firebase Cloud Messaging | Push notifications |

### 2.3 Integrações Externas

| Serviço | Propósito |
|---------|-----------|
| Stripe | Processamento de pagamentos |
| LinkedIn API | Verificação profissional |
| Google Cloud Vision | Moderação de imagens |
| Expo Location | Geolocalização |

### 2.4 Dependências Principais

```json
{
  "firebase": "^12.7.0",
  "expo-location": "~19.0.8",
  "expo-notifications": "~0.32.16",
  "expo-image-picker": "~17.0.10",
  "react-native-reanimated": "~4.1.1",
  "react-native-gesture-handler": "~2.28.0",
  "@react-native-community/slider": "5.0.1",
  "date-fns": "^3.6.0"
}
```

---

## 3. Arquitetura do Sistema

### 3.1 Diagrama de Alto Nível

```
┌─────────────────────────────────────────────────────────────────┐
│                        BOTA LOVE APP                             │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Screens   │  │ Components  │  │       Contexts          │  │
│  │   (app/)    │  │             │  │  (Auth, Signup, Plan)   │  │
│  └──────┬──────┘  └──────┬──────┘  └───────────┬─────────────┘  │
│         │                │                      │                │
│  ┌──────▼────────────────▼──────────────────────▼─────────────┐ │
│  │                    Hooks Layer                              │ │
│  │  (useChat, useDiscoveryFeed, useFreePlanLimits, etc.)      │ │
│  └─────────────────────────┬───────────────────────────────────┘ │
│                            │                                     │
│  ┌─────────────────────────▼───────────────────────────────────┐ │
│  │                   Services Layer                             │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────────┐  │ │
│  │  │ Firebase │ │ Location │ │Moderation│ │  Email/Push    │  │ │
│  │  │ Services │ │ Service  │ │ Service  │ │   Services     │  │ │
│  │  └──────────┘ └──────────┘ └──────────┘ └────────────────┘  │ │
│  └─────────────────────────┬───────────────────────────────────┘ │
└────────────────────────────┼─────────────────────────────────────┘
                             │
┌────────────────────────────▼─────────────────────────────────────┐
│                      FIREBASE BACKEND                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────────┐ │
│  │   Auth   │ │Firestore │ │ Storage  │ │   Cloud Functions    │ │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────────────┘ │
└───────────────────────────────────────────────────────────────────┘
```

### 3.2 Padrões Arquiteturais

- **Feature-based Structure**: Organização por funcionalidade
- **Service Layer Pattern**: Abstração de acesso a dados
- **Context API**: Gerenciamento de estado global
- **Custom Hooks**: Lógica reutilizável
- **File-based Routing**: Navegação via Expo Router

---

## 4. Estrutura de Diretórios

```
bota-love-app/
├── app/                          # Telas (Expo Router)
│   ├── (tabs)/                   # Tab Navigator
│   │   ├── index.tsx             # Home (Discovery Feed)
│   │   ├── matches.tsx           # Lista de Matches
│   │   ├── events.tsx            # Eventos Agro
│   │   ├── network.tsx           # Network Rural
│   │   ├── profile.tsx           # Perfil do Usuário
│   │   ├── store.tsx             # Loja de Itens
│   │   └── _layout.tsx           # Layout das Tabs
│   ├── chat/                     # Telas de Chat
│   │   └── [id].tsx              # Conversa individual
│   ├── profile-detail/           # Detalhes de Perfil
│   │   └── [id].tsx              # Perfil de outro usuário
│   ├── onboarding*.tsx           # Fluxo de Onboarding
│   ├── signup*.tsx               # Fluxo de Cadastro
│   ├── login.tsx                 # Tela de Login
│   ├── plans.tsx                 # Planos Premium
│   ├── discovery-settings.tsx    # Configurações de Descoberta
│   ├── event-location.tsx        # Localização de Eventos
│   ├── settings.tsx              # Configurações Gerais
│   └── _layout.tsx               # Layout Root
│
├── components/                   # Componentes Reutilizáveis
│   ├── ui/                       # Componentes de UI base
│   ├── rural-icons/              # Ícones temáticos rurais
│   ├── MatchAnimation.tsx        # Animação de Match
│   ├── SuperLikeAnimation.tsx    # Animação Super Like
│   ├── PremiumModal.tsx          # Modal de Upgrade
│   ├── CompleteProfileModal.tsx  # Modal Completar Perfil
│   ├── RestrictedProfile.tsx     # Perfil com blur
│   ├── LockedFilter.tsx          # Filtro bloqueado
│   └── LocationInitializer.tsx   # Inicializador de GPS
│
├── contexts/                     # Context Providers
│   ├── AuthContext.tsx           # Autenticação e usuário
│   ├── SignupContext.tsx         # Estado do cadastro
│   └── FreePlanContext.tsx       # Limites do plano gratuito
│
├── firebase/                     # Serviços Firebase
│   ├── config.ts                 # Configuração Firebase
│   ├── types.ts                  # Tipos TypeScript
│   ├── authService.ts            # Autenticação
│   ├── chatService.ts            # Chat e mensagens
│   ├── discoveryService.ts       # Feed de descoberta
│   ├── matchService.ts           # Sistema de matching
│   ├── planSubscriptionService.ts # Assinaturas e inventário
│   ├── plansService.ts           # Definição de planos
│   ├── storeItemsService.ts      # Itens da loja
│   ├── eventService.ts           # Eventos agro
│   ├── storageService.ts         # Upload de mídia
│   ├── notificationService.ts    # Push notifications
│   └── networkRuralFirebaseService.ts # Network Rural
│
├── services/                     # Serviços Externos
│   ├── advancedModerationService.ts  # Moderação de conteúdo
│   ├── bioValidationService.ts   # Validação de biografias
│   ├── imageModeration.ts        # Moderação de imagens
│   ├── locationService.ts        # Serviço de localização
│   └── emailService.ts           # Envio de emails
│
├── hooks/                        # Custom Hooks
│   ├── useChat.ts                # Hook de chat
│   ├── useDiscoveryFeed.ts       # Hook de descoberta
│   ├── useFreePlanLimits.ts      # Limites do plano free
│   └── useLocationPermission.ts  # Permissão de localização
│
├── data/                         # Dados e Serviços de Dados
│   ├── mockData.ts               # Dados de desenvolvimento
│   ├── viewLimitsService.ts      # Limites de visualização
│   ├── freePlanService.ts        # Serviço plano gratuito
│   └── contentModerationService.ts # Moderação de conteúdo
│
├── constants/                    # Constantes
│   ├── theme.ts                  # Paleta de cores
│   ├── typography.ts             # Sistema tipográfico
│   └── index.ts                  # Exportações
│
├── functions/                    # Cloud Functions (Node.js)
│   └── src/
│       ├── auth/                 # Funções de autenticação
│       ├── moderation/           # Moderação automatizada
│       ├── notifications/        # Push notifications
│       ├── stripe/               # Webhooks Stripe
│       ├── user/                 # Triggers de usuário
│       └── templates/            # Templates de email
│
├── assets/                       # Recursos Estáticos
│   ├── fonts/                    # Fontes customizadas
│   └── images/                   # Imagens e ícones
│
├── docs/                         # Documentação
│
├── scripts/                      # Scripts utilitários
│
├── app.json                      # Configuração Expo
├── package.json                  # Dependências
├── tsconfig.json                 # Configuração TypeScript
├── firebase.json                 # Configuração Firebase
├── firestore.rules               # Regras de segurança
├── firestore.indexes.json        # Índices Firestore
└── eslint.config.js              # Configuração ESLint
```

---

## 5. Firebase Services

### 5.1 Configuração (`firebase/config.ts`)

```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);
```

### 5.2 Serviços Disponíveis

| Serviço | Arquivo | Descrição |
|---------|---------|-----------|
| `authService` | `authService.ts` | Login, registro, verificação de email |
| `chatService` | `chatService.ts` | Mensagens, moderação, Mistério do Campo |
| `discoveryService` | `discoveryService.ts` | Feed de perfis, filtros por localização |
| `matchService` | `matchService.ts` | Likes, passes, super likes, matches |
| `planSubscriptionService` | `planSubscriptionService.ts` | Assinaturas, inventário, boost |
| `storeItemsService` | `storeItemsService.ts` | Catálogo de itens, preços |
| `eventService` | `eventService.ts` | Eventos, check-in, Bota no Evento |
| `notificationService` | `notificationService.ts` | Push notifications, FCM |
| `storageService` | `storageService.ts` | Upload de fotos |

---

## 6. Modelo de Dados (Firestore)

### 6.1 Collections Principais

#### `users`
```typescript
interface FirebaseUser {
  id: string;
  email: string;
  emailVerified: boolean;
  userType: 'agro' | 'simpatizante' | 'produtor';
  status: 'pending' | 'active' | 'suspended' | 'deleted';
  
  profile: {
    name: string;
    birthDate: Timestamp;
    age: number;
    gender: 'male' | 'female' | 'non_binary' | 'other';
    genderPreference: 'male' | 'female' | 'all';
    bio: string;
    photos: string[];
    city: string;
    state: string;
    occupation: string;
    isAgroUser: boolean;
    relationshipGoals: string[];
    // Campos rurais
    ruralActivities?: string[];
    propertySize?: string[];
    animals?: string[];
    crops?: string[];
    agroAreas?: string[];
  };
  
  subscription: {
    status: 'none' | 'trial' | 'active' | 'expired';
    plan: string;
    startDate?: Timestamp;
    endDate?: Timestamp;
  };
  
  discoverySettings: {
    distanceRadius: number;
    ageRange: { min: number; max: number };
    genderInterest: 'men' | 'women' | 'both';
    showMe: boolean;
    latitude?: number;
    longitude?: number;
    rumoCertoEnabled?: boolean;
  };
  
  boostStatus?: {
    isActive: boolean;
    activatedAt?: Timestamp;
    expiresAt?: Timestamp;
  };
  
  stats: {
    totalLikes: number;
    totalMatches: number;
    profileViews: number;
  };
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastActive: Timestamp;
}
```

#### `likes`
```typescript
interface Like {
  id: string;
  fromUserId: string;
  toUserId: string;
  type: 'like' | 'super_like';
  createdAt: Timestamp;
  seen: boolean;
}
```

#### `passes`
```typescript
interface Pass {
  id: string;
  fromUserId: string;
  toUserId: string;
  createdAt: Timestamp;
}
```

#### `matches`
```typescript
interface Match {
  id: string;
  users: [string, string];
  createdAt: Timestamp;
  chatId: string;
  lastActivity?: Timestamp;
  isActive: boolean;
}
```

#### `chats`
```typescript
interface Chat {
  id: string;
  participants: [string, string];
  origin: 'match' | 'network' | 'correio_da_roca' | 'misterio_do_campo';
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastMessage?: {
    text: string;
    senderId: string;
    timestamp: Timestamp;
    type: string;
  };
  isActive: boolean;
  messageCount: number;
  
  // Para Mistério do Campo
  misterioData?: {
    isRevealed: boolean;
    expiresAt: Timestamp;
    senderId: string;
    revealedAt?: Timestamp;
    revealMethod?: 'paid' | 'timer';
  };
}
```

#### `chats/{chatId}/messages`
```typescript
interface Message {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  type: 'text' | 'image' | 'audio' | 'system' | 'misterio';
  status: 'sent' | 'delivered' | 'read';
  createdAt: Timestamp;
  moderated: boolean;
  originalText?: string;
  
  // Para Mistério do Campo
  misterio?: {
    isRevealed: boolean;
    expiresAt: Timestamp;
    blurredPhotoUrl: string;
    originalPhotoUrl: string;
    senderName: string;
  };
}
```

#### `user_inventory`
```typescript
interface UserInventory {
  userId: string;
  items: Array<{
    itemId: string;
    itemName: string;
    quantity: number;
    acquiredAt: Timestamp;
  }>;
  updatedAt: Timestamp;
}
```

#### `user_subscriptions`
```typescript
interface UserSubscription {
  id: string;
  userId: string;
  planId: string;
  planName: string;
  status: 'active' | 'expired' | 'cancelled';
  period: 'monthly' | 'quarterly' | 'yearly';
  startDate: Timestamp;
  endDate: Timestamp;
  autoRenew: boolean;
  includedItems: Array<{
    itemId: string;
    itemName: string;
    quantity: number;
  }>;
}
```

#### `itens_avulso`
```typescript
interface StoreItem {
  id: string;
  name: string;
  description: string;
  type: ItemType;
  pricePackages: Array<{
    quantity: number;
    price: number; // em centavos
  }>;
  icon?: string;
  color?: string;
  badgeText?: string;
  status: 'active' | 'inactive' | 'promotion';
  order: number;
  totalSales: number;
}

type ItemType = 
  | 'super_like' 
  | 'boost' 
  | 'rewind' 
  | 'see_likes' 
  | 'unlimited_likes'
  | 'checkin_agro'
  | 'correio_da_roca'
  | 'misterio_do_campo'
  | 'bota_no_evento'
  | 'passaporte_rural';
```

#### `events`
```typescript
interface Event {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  startDate: Timestamp;
  endDate: Timestamp;
  location: {
    address: string;
    city: string;
    state: string;
    latitude: number;
    longitude: number;
    radius: number; // km para check-in
  };
  creatorId: string;
  attendees: string[];
  checkins: string[];
  status: 'upcoming' | 'ongoing' | 'finished';
}
```

### 6.2 Índices Compostos

```json
{
  "indexes": [
    {
      "collectionGroup": "users",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "emailVerified", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "likes",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "toUserId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "chats",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "participants", "arrayConfig": "CONTAINS" },
        { "fieldPath": "updatedAt", "order": "DESCENDING" }
      ]
    }
  ]
}
```

---

## 7. Sistema de Autenticação

### 7.1 Fluxo de Cadastro

```
┌─────────────────┐
│  signup.tsx     │ Tela inicial
└────────┬────────┘
         │
┌────────▼────────┐
│ signup-email    │ Email do usuário
└────────┬────────┘
         │
┌────────▼────────┐
│ signup-password │ Senha (mín. 8 caracteres)
└────────┬────────┘
         │
┌────────▼────────┐
│ signup-name     │ Nome do usuário
└────────┬────────┘
         │
┌────────▼────────┐
│signup-birthdate │ Data de nascimento (+18 anos)
└────────┬────────┘
         │
┌────────▼────────┐
│ signup-gender   │ Gênero
└────────┬────────┘
         │
┌────────▼────────────┐
│signup-gender-pref   │ Preferência de gênero
└────────┬────────────┘
         │
┌────────▼────────┐
│ signup-terms    │ Aceite dos termos
└────────┬────────┘
         │
┌────────▼──────────────┐
│ signup-verify-email   │ Verificação por código
└────────┬──────────────┘
         │
┌────────▼────────┐
│ signup-confirm  │ Confirmação final
└────────┬────────┘
         │
┌────────▼────────┐
│   Onboarding    │ Configuração do perfil
└─────────────────┘
```

### 7.2 AuthContext

```typescript
interface AuthContextType {
  currentUser: FirebaseUser | null;
  hasPremium: boolean;
  userType: UserAccountType;
  isLoading: boolean;
  
  // Métodos
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUserData: () => Promise<void>;
  updateDiscoverySettings: (settings: Partial<DiscoverySettings>) => Promise<void>;
}
```

### 7.3 Verificação de Email

1. Usuário informa email no cadastro
2. Sistema gera código de 6 dígitos
3. Email enviado via Cloud Function
4. Código válido por 15 minutos
5. Até 3 tentativas de reenvio

---

## 8. Sistema de Planos e Assinaturas

### 8.1 Planos Disponíveis

| Plano | Código | Período | Preço |
|-------|--------|---------|-------|
| Bronze (Free) | `free` | - | Gratuito |
| Sou Agro Mensal | `premium_monthly` | 30 dias | R$ 79,90 |
| Sou Agro Trimestral | `premium_quarterly` | 90 dias | R$ 199,90 |
| Sou Agro Anual | `premium_annual` | 365 dias | R$ 599,90 |
| Network Rural | `network_monthly` | 30 dias | R$ 49,90 |

### 8.2 Comparativo de Benefícios

| Funcionalidade | Bronze | Sou Agro | Premium |
|----------------|--------|----------|---------|
| Visualizações diárias | 50 | Ilimitado | Ilimitado |
| Likes diários | 50 | Ilimitado | Ilimitado |
| Super Likes | 1/semana | 5/dia | 10/dia |
| Distância máxima | 150km | 500km | 1000km |
| Ver quem curtiu | ❌ | ✅ | ✅ |
| Rumo Certo | ❌ | ✅ | ✅ |
| Boost mensal | ❌ | 1 | 3 |
| Voltar Perfil | ❌ | ✅ | ✅ |
| Selo Rural | ❌ | ✅ | ✅ |
| Passaporte Rural | ❌ | ✅ | ✅ |

### 8.3 Limites por Plano (`viewLimitsService.ts`)

```typescript
const PLAN_LIMITS = {
  bronze: {
    maxDistance: 150,
    canChangeDistance: false,
    dailyViews: 50,
    dailyLikes: 50,
    superLikesPerWeek: 1,
    boost: false,
  },
  silver: {
    maxDistance: 300,
    canChangeDistance: true,
    dailyViews: 150,
    dailyLikes: 150,
    superLikesPerWeek: 5,
    boost: true,
  },
  gold: {
    maxDistance: 500,
    canChangeDistance: true,
    dailyViews: -1, // ilimitado
    dailyLikes: -1,
    superLikesPerWeek: 15,
    boost: true,
  },
  premium: {
    maxDistance: 1000,
    canChangeDistance: true,
    dailyViews: -1,
    dailyLikes: -1,
    superLikesPerWeek: -1,
    boost: true,
  },
};
```

---

## 9. Funcionalidades Premium (Itens Avulsos)

### 9.1 Catálogo de Itens

| Item | Código | Descrição | Consumo |
|------|--------|-----------|---------|
| **Super Agro** | `super_like` | Like destacado, notifica o destinatário | Por uso |
| **Assobios do Peão** | `boost` | Destaca perfil por 1 hora | Por ativação |
| **Retorno da Estrada** | `rewind` | Volta ao perfil anterior | Por uso |
| **Olhar do Campo** | `see_likes` | Ver quem curtiu você | Por período |
| **Correio da Roça** | `correio_da_roca` | Mensagem antes do match | Por mensagem |
| **Mistério do Campo** | `misterio_do_campo` | Mensagem anônima | Por mensagem |
| **Checkin Agro** | `checkin_agro` | Check-in em eventos | Por check-in |
| **Bota no Evento** | `bota_no_evento` | Confirmar presença | Por confirmação |
| **Passaporte Rural** | `passaporte_rural` | Buscar em qualquer região | Por ativação |

### 9.2 Sistema de Inventário

```typescript
// Adicionar item ao inventário
await addItemsToInventory(userId, itemId, itemName, quantity);

// Consumir item por nome
const result = await useInventoryItemByName(userId, 'Super Agro', 1);
if (result.success) {
  console.log(`Restante: ${result.remaining}`);
}

// Verificar quantidade
const quantity = await getItemQuantity(userId, itemId);
```

### 9.3 Boost (Assobios do Peão)

```typescript
// Ativar boost
const result = await activateBoost(userId);
// Perfil destacado por 1 hora

// Verificar status
const status = await checkBoostStatus(userId);
// { isActive: true, remainingMinutes: 45, expiresAt: Date }

// Listar usuários com boost (para feed)
const boostedUsers = await getBoostedUsers();
```

### 9.4 Mistério do Campo

```typescript
// Enviar mensagem misteriosa
await sendMisterioMessage({
  senderId: 'user1',
  recipientId: 'user2',
  message: 'Olá, gostei do seu perfil!',
  senderName: 'João',
  senderPhotoUrl: 'https://...',
});

// Revelar identidade (pago ou timer)
await revealMisterioIdentity(chatId, messageId, 'paid');

// Auto-revelar após 24h
await checkAndRevealExpiredMisterios(userId);
```

---

## 10. Sistema de Matching

### 10.1 Fluxo de Descoberta

```typescript
// Buscar perfis para o feed
const profiles = await discoverUsers({
  userId: currentUserId,
  latitude: -16.6799,
  longitude: -49.2550,
  distanceRadius: 150,
  ageMin: 18,
  ageMax: 45,
  genderInterest: 'women',
  showOutsideDistance: false,
});

// Filtros aplicados:
// 1. Status ativo + email verificado
// 2. Gênero conforme preferência
// 3. Idade dentro da faixa
// 4. Distância máxima (Haversine)
// 5. Não inclui usuários já interagidos
```

### 10.2 Ações de Interação

```typescript
// Like
const result = await likeUser(fromUserId, toUserId);
// Retorna { matched: true, chatId: '...' } se houver match

// Super Like (Super Agro)
const result = await superLikeUser(fromUserId, toUserId);

// Pass (Rejeitar)
await passUser(fromUserId, toUserId);

// Correio da Roça (mensagem sem match)
await sendCorreioDaRoca(fromUserId, toUserId, message);
```

### 10.3 Algoritmo de Distância (Haversine)

```typescript
function calculateDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371; // Raio da Terra em km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return Math.round(R * c);
}
```

---

## 11. Sistema de Chat

### 11.1 Tipos de Conversa

| Origem | Código | Descrição |
|--------|--------|-----------|
| Match | `match` | Conversa após match mútuo |
| Network | `network` | Networking profissional |
| Correio | `correio_da_roca` | Mensagem sem match |
| Mistério | `misterio_do_campo` | Mensagem anônima |

### 11.2 Envio de Mensagens

```typescript
const result = await sendMessage(
  chatId,
  senderId,
  text,
  type // 'text' | 'image' | 'audio'
);

// Resultado inclui:
// - success: boolean
// - messageId: string
// - moderated: boolean (se texto foi sanitizado)
// - blocked: boolean (se foi bloqueado)
```

### 11.3 Moderação de Conteúdo

```typescript
// Palavras bloqueadas
const BLOCKED_PATTERNS = [
  /\b(n[u4]mero|tel[e3]fone|whats?app?|wpp)\b/i,
  /\b(instagram|insta|@)\b/i,
  /\b(pix|transfere|dinheiro)\b/i,
  // ... mais padrões
];

// Função de moderação
const moderation = await moderateChatMessage(text);
// { action: 'allow' | 'sanitize' | 'block', sanitizedText?: string }
```

### 11.4 Listeners em Tempo Real

```typescript
// Escutar mensagens
const unsubscribe = subscribeToMessages(chatId, (messages) => {
  setMessages(messages);
});

// Escutar chats do usuário
const unsubscribe = subscribeToUserChats(userId, (chats) => {
  setChats(chats);
});
```

---

## 12. Sistema de Notificações

### 12.1 Tipos de Notificação

| Tipo | Código | Trigger |
|------|--------|---------|
| Match | `match` | Novo match |
| Mensagem | `message` | Nova mensagem |
| Like | `like` | Alguém curtiu |
| Super Like | `super_like` | Recebeu Super Agro |
| Trial | `trial_expiring` | Trial expirando |
| Sistema | `system` | Avisos gerais |

### 12.2 Configuração FCM

```typescript
// Registrar token
await registerPushToken(userId, fcmToken);

// Enviar notificação (via Cloud Function)
await sendPushNotification({
  userId: targetUserId,
  title: 'Novo Match! 🎉',
  body: 'Você e Maria combinaram!',
  data: { type: 'match', matchId: '...' },
});
```

### 12.3 Configurações do Usuário

```typescript
interface NotificationSettings {
  newMatches: boolean;
  newMessages: boolean;
  newLikes: boolean;
  promotions: boolean;
  reminders: boolean;
}
```

---

## 13. Cloud Functions

### 13.1 Estrutura

```
functions/src/
├── index.ts              # Entry point
├── auth/
│   └── onUserCreate.ts   # Trigger: novo usuário
├── user/
│   └── onUserLogin.ts    # Trigger: login
├── moderation/
│   ├── moderateImage.ts  # Moderação de imagens
│   └── moderateText.ts   # Moderação de texto
├── notifications/
│   ├── pushHelper.ts     # Helper de push
│   └── sendMatch.ts      # Notificação de match
├── stripe/
│   └── webhooks.ts       # Webhooks de pagamento
└── utils/
    └── helpers.ts        # Funções auxiliares
```

### 13.2 Funções Principais

| Função | Trigger | Descrição |
|--------|---------|-----------|
| `onUserCreate` | Auth | Inicializa documento do usuário |
| `onUserLogin` | Callable | Registra login, verifica status |
| `sendVerificationEmail` | Callable | Envia código de verificação |
| `moderateImage` | Storage | Modera imagem com Vision API |
| `processPayment` | HTTP | Webhook do Stripe |
| `sendPushNotification` | Callable | Envia push notification |

### 13.3 Deploy

```bash
# Deploy de todas as funções
firebase deploy --only functions

# Deploy de função específica
firebase deploy --only functions:onUserCreate

# Logs em tempo real
firebase functions:log --only onUserCreate
```

---

## 14. Moderação de Conteúdo

### 14.1 Moderação de Texto

```typescript
// Níveis de ação
type ModerationAction = 'allow' | 'sanitize' | 'block' | 'warn';

// Categorias de detecção
const CATEGORIES = {
  CONTACT_INFO: ['telefone', 'whatsapp', 'instagram'],
  INAPPROPRIATE: ['palavrões', 'conteúdo adulto'],
  SPAM: ['links', 'promoções'],
  FINANCIAL: ['pix', 'dinheiro', 'pagamento'],
};

// Aplicar moderação
const result = await moderateChatMessage(text);
```

### 14.2 Moderação de Imagens

```typescript
// Via Cloud Function + Vision API
const result = await moderateImage(imageUrl);

// Verificações:
// - Safe Search (adult, violence, racy)
// - Face detection (quantidade de rostos)
// - Label detection (conteúdo inapropriado)
```

### 14.3 Validação de Bio

```typescript
const validation = validateBio(bioText);
// {
//   isValid: boolean,
//   issues: string[],
//   sanitizedBio?: string
// }
```

---

## 15. Configuração e Deploy

### 15.1 Requisitos

- Node.js >= 18.x
- npm >= 9.x
- Expo CLI
- Firebase CLI
- Conta Firebase (Blaze Plan para Functions)
- Conta Stripe (para pagamentos)

### 15.2 Setup Inicial

```bash
# 1. Clonar repositório
git clone https://github.com/seu-usuario/bota-love-app.git
cd bota-love-app

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente
cp .env.example .env.local
# Editar .env.local com suas credenciais

# 4. Instalar funções
cd functions
npm install
cd ..

# 5. Iniciar desenvolvimento
npm start
```

### 15.3 Build e Deploy

```bash
# Build iOS
eas build --platform ios

# Build Android
eas build --platform android

# Deploy Firebase
firebase deploy

# Deploy apenas regras
firebase deploy --only firestore:rules

# Deploy apenas funções
firebase deploy --only functions
```

### 15.4 Ambientes

| Ambiente | Branch | Firebase Project |
|----------|--------|------------------|
| Development | `develop` | bota-love-dev |
| Staging | `staging` | bota-love-staging |
| Production | `main` | bota-love-prod |

---

## 16. Variáveis de Ambiente

### 16.1 `.env.local` (Frontend)

```env
# Firebase
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

# Stripe
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx

# LinkedIn
EXPO_PUBLIC_LINKEDIN_CLIENT_ID=xxx
EXPO_PUBLIC_LINKEDIN_REDIRECT_URI=botaloveapp://linkedin-callback
```

### 16.2 `functions/.env` (Backend)

```env
# Stripe
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Email (SendGrid ou similar)
SENDGRID_API_KEY=SG.xxx
EMAIL_FROM=noreply@botalove.com

# Google Cloud Vision
GOOGLE_CLOUD_PROJECT=your_project_id
```

---

## 17. Testes

### 17.1 Estrutura de Testes

```
__tests__/
├── unit/
│   ├── services/
│   ├── hooks/
│   └── utils/
├── integration/
│   ├── auth.test.ts
│   └── matching.test.ts
└── e2e/
    ├── signup.test.ts
    └── discovery.test.ts
```

### 17.2 Executar Testes

```bash
# Testes unitários
npm test

# Testes com coverage
npm run test:coverage

# Testes E2E
npm run test:e2e
```

### 17.3 Mock Data

O arquivo `data/mockData.ts` contém dados de desenvolvimento para testes sem Firebase:

```typescript
export const MOCK_USERS: User[] = [
  {
    id: 'mock-user-1',
    name: 'Ana Clara',
    age: 28,
    // ...
  },
  // ...
];
```

---

## 18. Changelog

### v1.0.0 (Fevereiro 2026)

#### Features
- ✅ Sistema de descoberta com swipe cards
- ✅ Matching com Like, Super Like, Pass
- ✅ Chat em tempo real com moderação
- ✅ Sistema de planos e assinaturas
- ✅ Loja de itens avulsos
- ✅ Boost (Assobios do Peão)
- ✅ Mistério do Campo (mensagem anônima)
- ✅ Correio da Roça (mensagem sem match)
- ✅ Check-in em eventos com GPS
- ✅ Passaporte Rural (busca nacional)
- ✅ Rumo Certo (filtro quem curtiu)
- ✅ Selo Rural (badge de usuário agro)
- ✅ Network Rural (networking profissional)
- ✅ Push notifications
- ✅ Verificação de email

#### Infraestrutura
- ✅ Firebase Authentication
- ✅ Cloud Firestore
- ✅ Firebase Storage
- ✅ Cloud Functions
- ✅ Stripe integration
- ✅ Expo SDK 54

---

> **Bota Love App** - Conectando corações do campo 🤠💚

*Documentação gerada em 01 de Fevereiro de 2026*
