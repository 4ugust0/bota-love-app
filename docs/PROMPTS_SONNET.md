# 🤖 Prompts para Desenvolvimento - Bota Love App

> Prompts otimizados para Claude Sonnet continuar o desenvolvimento dos módulos pendentes.

---

## 📋 Índice de Prompts

1. [Cloud Functions - Email/Auth](#1-cloud-functions---emailauth)
2. [Cloud Functions - Notificações Push](#2-cloud-functions---notificações-push)
3. [Cloud Functions - Moderação de Conteúdo](#3-cloud-functions---moderação-de-conteúdo)
4. [Cloud Functions - Scheduled Jobs](#4-cloud-functions---scheduled-jobs)
5. [Integração AuthContext](#5-integração-authcontext)
6. [Atualização package.json](#6-atualização-packagejson)
7. [Telas de Signup/Login](#7-telas-de-signuplogin)
8. [Configuração Firebase Console](#8-configuração-firebase-console)

---

## 1. Cloud Functions - Email/Auth

```
Você é um **Desenvolvedor Backend Firebase** especialista em Cloud Functions.

Estou desenvolvendo o app **Bota Love** (app de relacionamento rural) e preciso implementar as Cloud Functions de autenticação.

## CONTEXTO

Já tenho criado:
- `functions/package.json` com firebase-functions, firebase-admin e nodemailer
- `functions/tsconfig.json` configurado
- Frontend em `firebase/authService.ts` que chama estas funções

## TAREFA

Criar os seguintes arquivos em `functions/src/`:

### 1. `index.ts` - Entry point
- Inicializar Firebase Admin
- Exportar todas as funções

### 2. `auth/sendVerificationEmail.ts`
- Função HTTP Callable
- Recebe: userId, email, name, code
- Envia email via SMTP (Nodemailer) com código de 6 dígitos
- Template HTML bonito com a marca "Bota Love"
- Configuração SMTP via variáveis de ambiente

### 3. `auth/resendVerificationCode.ts`
- Gera novo código
- Atualiza no Firestore
- Reenvia email

## REQUISITOS

- TypeScript
- Tratamento de erros
- Logs para debugging
- Região: southamerica-east1
- Template de email responsivo e bonito
- Rate limiting básico (max 3 tentativas por hora)

## ESTRUTURA DO EMAIL

Assunto: "🌾 Código de Verificação - Bota Love"
Corpo: 
- Logo/Nome do app
- Saudação personalizada
- Código em destaque
- Validade de 30 minutos
- Aviso de segurança
```

---

## 2. Cloud Functions - Notificações Push

```
Você é um **Desenvolvedor Backend Firebase** especialista em Cloud Messaging (FCM).

Estou desenvolvendo o app **Bota Love** e preciso implementar as Cloud Functions de notificações push.

## CONTEXTO

Já tenho:
- `firebase/notificationService.ts` no frontend
- `firebase/types.ts` com FirebaseNotification
- Usuários têm array `fcmTokens` no Firestore

## TAREFA

Criar em `functions/src/notifications/`:

### 1. `sendMatchNotification.ts`
- Função HTTP Callable
- Recebe: user1Id, user2Id, matchId
- Busca dados dos dois usuários
- Envia push para ambos com:
  - Título: "💕 É um Match!"
  - Body: "Você e {nome} combinaram!"
  - Data: { type: 'match', matchId, otherUserId }
- Cria registro em /notifications

### 2. `sendMessageNotification.ts`
- Recebe: chatId, senderId, receiverId, messageText, chatOrigin
- Envia push para receiverId:
  - Título: Nome do sender
  - Body: Preview da mensagem (max 50 chars)
  - Data: { type: 'message', chatId, senderId }
- Respeitar configurações de notificação do usuário

### 3. `sendLikeNotification.ts`
- Recebe: fromUserId, toUserId, isSuperLike
- Se superLike, envia push:
  - Título: "⭐ Super Like!"
  - Body: "{nome} deu um Super Like em você!"
- Se like normal, só envia se usuário for premium

### 4. `helpers/pushHelper.ts`
- Função utilitária para enviar push
- Gerencia tokens inválidos (remove do Firestore)
- Suporta múltiplos tokens por usuário

## REQUISITOS

- Verificar se notificações estão habilitadas
- Remover tokens inválidos automaticamente
- Criar registro em /notifications para histórico
- Badge count para iOS
```

---

## 3. Cloud Functions - Moderação de Conteúdo

```
Você é um **Desenvolvedor Backend** especialista em moderação de conteúdo.

Estou desenvolvendo o app **Bota Love** e preciso de uma Cloud Function para moderar mensagens de chat.

## CONTEXTO

Já tenho no frontend:
- `data/contentModerationService.ts` com padrões regex
- `firebase/chatService.ts` que chama `moderateMessage`

## TAREFA

Criar `functions/src/moderation/moderateMessage.ts`:

### Funcionalidade

1. Receber: text, chatId, senderId
2. Aplicar regex patterns para detectar:
   - Informações de contato (telefone, email, redes sociais)
   - Palavrões e linguagem vulgar
   - Spam e conteúdo repetitivo
   - Golpes e fraudes
   - Assédio e ameaças
   - Conteúdo sexual explícito
   - Links externos
3. Calcular score de risco (0-100)
4. Sanitizar texto se necessário
5. Retornar: { allowed, sanitizedText, score, violations }

### Padrões a Detectar

```typescript
// Exemplos de patterns
const CONTACT_PATTERNS = [
  /\b(?:\+?55\s?)?(?:\(?\d{2}\)?\s?)?\d{4,5}[-.\s]?\d{4}\b/gi, // Telefone BR
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/gi, // Email
  /\b(?:@|insta(?:gram)?:?\s*@?)[A-Za-z0-9_.]{3,30}\b/gi, // Instagram
  /\b(?:whats?app|zap|wpp):?\s*[@]?[\d\s\-()]+/gi, // WhatsApp
];

const PROFANITY_PATTERNS = [...]; // Lista de palavrões em português
const SCAM_PATTERNS = [...]; // Padrões de golpe
```

### Ações por Score

- 0-30: Liberado (allowed: true)
- 31-60: Liberado com sanitização (allowed: true, texto alterado)
- 61-100: Bloqueado (allowed: false)
## REQUISITOS

- Sanitizar substituindo por asteriscos
- Logar violações para análise posterior
- Não bloquear termos do contexto rural (ex: "gado", "touro")
- Performance: resposta < 500ms
```

---

## 4. Cloud Functions - Scheduled Jobs

```
Você é um **Desenvolvedor Backend Firebase** especialista em Scheduled Functions.

Preciso implementar jobs agendados para o app **Bota Love**.

## TAREFA

Criar em `functions/src/scheduled/`:

### 1. `checkExpiredSubscriptions.ts`
- Schedule: Diário às 00:00 (America/Sao_Paulo)
- Query: usuários com subscription.endDate < now e status != 'expired'
- Ação: Atualizar status para 'expired'
- Enviar push: "Sua assinatura expirou"

### 2. `sendTrialReminders.ts`
- Schedule: Diário às 10:00
- Query: usuários com trial expirando em 1-2 dias
- Ação: Enviar push de lembrete
- "Seu trial acaba em X dias"

### 3. `checkInactiveChats.ts`
- Schedule: A cada 6 horas
- Query: chats com lastMessage > 48h e inactivityReminders < 3
- Ação: 
  - Incrementar inactivityReminders
  - Enviar push para ambos participantes
  - "Conversa parada há X dias"

### 4. `cleanupOldData.ts`
- Schedule: Semanal (domingo 03:00)
- Deletar:
  - Verificações de email expiradas (> 24h)
  - Notificações lidas (> 30 dias)
  - Logs antigos

## REQUISITOS

- Timezone: America/Sao_Paulo
- Batch processing para performance
- Logs detalhados
- Tratamento de erros sem quebrar o job inteiro
```

---

## 5. Integração AuthContext

```
Você é um **Desenvolvedor React Native** especialista em Firebase.

Preciso integrar o AuthContext existente do app **Bota Love** com Firebase Auth.

## CONTEXTO

Tenho:
- `contexts/AuthContext.tsx` - Context atual com dados mock
- `firebase/authService.ts` - Serviço Firebase completo
- `firebase/types.ts` - Tipos FirebaseUser

## TAREFA

Atualizar `contexts/AuthContext.tsx` para:

### 1. Substituir dados mock por Firebase

- Usar `onAuthStateChange` para estado de autenticação
- Buscar dados do usuário do Firestore
- Manter compatibilidade com interface atual

### 2. Funções a implementar

```typescript
interface AuthContextType {
  // Estado
  currentUser: FirebaseUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Premium
  hasPremium: boolean;
  
  // Network Rural
  isAgroUser: boolean;
  hasNetworkRural: boolean;
  networkTrialDaysRemaining: number;
  
  // Auth actions
  register: (data: RegisterData) => Promise<LoginResult>;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
  verifyEmail: (code: string) => Promise<boolean>;
  resendCode: () => Promise<boolean>;
  resetPassword: (email: string) => Promise<boolean>;
  
  // Profile actions
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  updatePhotos: (photos: string[]) => Promise<void>;
  
  // Subscription actions
  activatePremiumTrial: () => Promise<boolean>;
  activateNetworkTrial: () => Promise<boolean>;
  subscribeToPlan: (planId: string) => Promise<boolean>;
}
```

### 3. Persistência de sessão

- Usar AsyncStorage para manter sessão
- Loading state enquanto verifica auth
- Redirect automático baseado no estado

## REQUISITOS

- Manter retrocompatibilidade
- Loading states
- Error handling
- TypeScript strict
```

---

## 6. Atualização package.json

```
Você é um **Desenvolvedor React Native/Expo** especialista em configuração de projetos.

Preciso atualizar o package.json do app **Bota Love** para incluir Firebase.

## TAREFA

Atualizar `package.json` adicionando:

### Dependências Firebase

```json
{
  "dependencies": {
    // Existentes...
    
    // Firebase
    "firebase": "^10.7.0",
    "@react-native-async-storage/async-storage": "^1.21.0",
    
    // Notificações
    "expo-notifications": "~0.27.0",
    "expo-device": "~6.0.0",
    
    // Utilitários
    "date-fns": "^3.0.0"
  }
}
```

### Criar arquivo `.env.example`

```env
# Firebase Config
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
```

### Atualizar `app.json`

Adicionar configurações para notificações:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#8B5A2B"
        }
      ]
    ],
    "android": {
      "googleServicesFile": "./google-services.json"
    },
    "ios": {
      "googleServicesFile": "./GoogleService-Info.plist"
    }
  }
}
```

## REQUISITOS

- Versões compatíveis com Expo SDK 54
- Não quebrar dependências existentes
```

---

## 7. Telas de Signup/Login

```
Você é um **Desenvolvedor React Native** especialista em UX de autenticação.

Preciso atualizar as telas de signup e login do app **Bota Love** para usar Firebase.

## CONTEXTO

Telas existentes:
- `app/signup.tsx` - Tela inicial de cadastro
- `app/signup-email.tsx` - Email
- `app/signup-name.tsx` - Nome
- `app/signup-password.tsx` - Senha
- `app/signup-verify-email.tsx` - Verificação
- `app/signup-terms.tsx` - Termos
- `app/login.tsx` - Login
- `app/forgot-password.tsx` - Recuperar senha

Services:
- `firebase/authService.ts`
- `contexts/AuthContext.tsx` (atualizado)

## TAREFA

### 1. Atualizar fluxo de signup

- Coletar dados progressivamente
- No final, chamar `register()` do AuthContext
- Redirecionar para verificação de email
- Mostrar loading e erros

### 2. Atualizar `signup-verify-email.tsx`

- Input para código de 6 dígitos
- Auto-focus e auto-advance
- Botão "Reenviar código"
- Timer de 60s para reenvio
- Verificar código via `verifyEmail()`

### 3. Atualizar `login.tsx`

- Campos email e senha
- Chamar `login()` do AuthContext
- Tratar erro de email não verificado
- Link para recuperar senha

### 4. Atualizar `forgot-password.tsx`

- Campo de email
- Chamar `resetPassword()`
- Feedback de sucesso

## REQUISITOS

- Design consistente com o app
- Validações inline
- Loading states
- Mensagens de erro amigáveis
- Teclado não cobrir inputs
```

---

## 8. Configuração Firebase Console

```
Você é um **DevOps/Firebase Admin** especialista em configuração de projetos.

Preciso de um guia passo-a-passo para configurar o projeto Firebase do app **Bota Love**.

## TAREFA

Criar guia detalhado para:

### 1. Criar Projeto Firebase

- Nome: bota-love-app
- Região: southamerica-east1
- Analytics: Sim

### 2. Configurar Authentication

- Habilitar Email/Password
- Configurar templates de email (português)
- Configurar domínio autorizado

### 3. Configurar Firestore

- Modo: Production
- Região: southamerica-east1
- Criar índices necessários:

```
// users
- status, emailVerified, discoverySettings.showMe (ASC)

// likes  
- toUserId, matchCreated, createdAt (DESC)

// matches
- users (ARRAY_CONTAINS), isActive, lastMessageAt (DESC)

// chats
- participants (ARRAY_CONTAINS), isActive, updatedAt (DESC)

// notifications
- userId, read, createdAt (DESC)
```

### 4. Regras de Segurança Firestore

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Funções auxiliares
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    
    // Users
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow write: if isOwner(userId);
    }
    
    // Matches
    match /matches/{matchId} {
      allow read: if isAuthenticated() && 
        request.auth.uid in resource.data.users;
      allow write: if false; // Apenas Cloud Functions
    }
    
    // Chats e mensagens
    match /chats/{chatId} {
      allow read: if isAuthenticated() && 
        request.auth.uid in resource.data.participants;
      
      match /messages/{messageId} {
        allow read: if isAuthenticated();
        allow create: if isAuthenticated() && 
          request.auth.uid == request.resource.data.senderId;
      }
    }
    
    // Notifications
    match /notifications/{notificationId} {
      allow read, write: if isAuthenticated() && 
        request.auth.uid == resource.data.userId;
    }
  }
}
```

### 5. Configurar Storage

- Bucket padrão
- Regras:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    
    match /chats/{chatId}/{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 6. Configurar Cloud Messaging

- Gerar chave VAPID para web
- Baixar google-services.json (Android)
- Baixar GoogleService-Info.plist (iOS)

### 7. Deploy Cloud Functions

```bash
cd functions
npm install
npm run build
firebase deploy --only functions
```

## OUTPUT

Criar checklist markdown com todos os passos e comandos necessários.
```

---

## 🎯 Como Usar Estes Prompts

1. **Copie o prompt** do módulo que deseja desenvolver
2. **Cole no Claude** (nova conversa ou continue esta)
3. **Aguarde a implementação**
4. **Teste e ajuste** conforme necessário

### Ordem Recomendada

1. 📦 **Atualização package.json** (Prompt 6)
2. 🔧 **Cloud Functions - Email** (Prompt 1)
3. 🔧 **Cloud Functions - Moderação** (Prompt 3)
4. 🔧 **Cloud Functions - Notificações** (Prompt 2)
5. 🔧 **Cloud Functions - Scheduled** (Prompt 4)
6. 🔗 **Integração AuthContext** (Prompt 5)
7. 📱 **Telas de Signup/Login** (Prompt 7)
8. ☁️ **Firebase Console** (Prompt 8)

---

*Prompts otimizados para Claude Sonnet - Bota Love Team*
