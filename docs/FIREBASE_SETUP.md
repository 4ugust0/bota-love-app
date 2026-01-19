# 🔥 Configuração Firebase - Bota Love App

> **Status:** Avançado - 85% completo  
> **Última atualização:** 05/01/2026

---

## 📋 Sumário

- [Visão Geral](#visão-geral)
- [O que foi feito](#-o-que-foi-feito)
- [O que falta fazer](#-o-que-falta-fazer)
- [Estrutura de Arquivos](#-estrutura-de-arquivos)
- [Configuração do Projeto Firebase](#-configuração-do-projeto-firebase)
- [Collections do Firestore](#-collections-do-firestore)
- [Cloud Functions](#-cloud-functions)
- [Próximos Passos](#-próximos-passos)

---

## Visão Geral

Sistema completo de backend usando Firebase para o app Bota Love, incluindo:
- **Authentication:** Registro, login, verificação de email
- **Firestore:** Banco de dados em tempo real
- **Storage:** Upload de imagens
- **Cloud Functions:** Backend serverless
- **Cloud Messaging:** Notificações push

---

## ✅ O QUE FOI FEITO

### 1. Configuração Base do Firebase (Frontend)

| Arquivo | Descrição | Status |
|---------|-----------|--------|
| `firebase/config.ts` | Inicialização do Firebase SDK | ✅ Completo |
| `firebase/types.ts` | Todos os tipos TypeScript para Firestore | ✅ Completo |
| `firebase/index.ts` | Exports centralizados | ✅ Completo |

### 2. Serviços Firebase (Frontend)

| Serviço | Arquivo | Funcionalidades | Status |
|---------|---------|-----------------|--------|
| **Auth** | `firebase/authService.ts` | Registro, login, logout, verificação email, reset senha | ✅ Completo |
| **Firestore** | `firebase/firestoreService.ts` | CRUD usuários, discovery, perfis | ✅ Completo |
| **Match** | `firebase/matchService.ts` | Likes, super likes, matches, unmatch | ✅ Completo |
| **Chat** | `firebase/chatService.ts` | Mensagens, moderação, lembretes | ✅ Completo |
| **Subscription** | `firebase/subscriptionService.ts` | Planos, trials, pagamentos simulados | ✅ Completo |
| **Notification** | `firebase/notificationService.ts` | Notificações in-app e push | ✅ Completo |
| **Storage** | `firebase/storageService.ts` | Upload de fotos | ✅ Completo |
| **Network Rural** | `firebase/networkRuralFirebaseService.ts` | Conexões profissionais | ✅ Completo |

### 3. Tipos e Interfaces

Todas as interfaces definidas em `firebase/types.ts`:

- ✅ `FirebaseUser` - Usuário completo com perfil, assinatura, configurações
- ✅ `UserProfile` - Dados do perfil
- ✅ `UserSubscription` - Assinatura premium
- ✅ `NetworkRuralData` - Dados do Network Rural
- ✅ `FirebaseMatch` - Matches
- ✅ `FirebaseLike` - Likes e super likes
- ✅ `FirebaseChat` - Conversas
- ✅ `FirebaseMessage` - Mensagens
- ✅ `FirebaseNotification` - Notificações
- ✅ `FirebasePayment` - Pagamentos
- ✅ `NetworkConnection` - Conexões do Network
- ✅ `EmailVerification` - Verificação de email
- ✅ `FirebaseEvent` - Eventos agro

### 4. Cloud Functions (Backend) - Implementação

| Arquivo | Descrição | Status |
|---------|-----------|--------|
| `functions/package.json` | Dependências do backend | ✅ Completo |
| `functions/tsconfig.json` | Configuração TypeScript | ✅ Completo |
| `functions/src/index.ts` | Entry point com exports | ✅ Completo |
| `functions/src/auth/sendVerificationEmail.ts` | Envio de email com código | ✅ Completo |
| `functions/src/auth/resendVerificationCode.ts` | Reenvio de código | ✅ Completo |
| `functions/src/moderation/moderateMessage.ts` | Moderação de chat com regex | ✅ Completo |
| `functions/src/user/onUserLogin.ts` | Verificações no login (subscriptions, trials, chats) | ✅ Completo |
| `functions/src/templates/emailTemplates.ts` | Templates HTML de email | ✅ Completo |
| `functions/src/utils/emailService.ts` | Serviço SMTP com Nodemailer | ✅ Completo |

### 5. Integração no App

| Tarefa | Descrição | Status |
|--------|-----------|--------|
| `AuthContext.tsx` integrado | Usa Firebase Auth completo | ✅ Completo |
| `.env.example` criado | Template de variáveis de ambiente | ✅ Completo |
| `package.json` atualizado | Dependências Firebase instaladas | ✅ Completo |
| `app.json` configurado | Notificações e Google Services | ✅ Completo |

---

## ❌ O QUE FALTA FAZER

### 1. Cloud Functions - Notificações Push ✅ COMPLETO

| Função | Descrição | Status |
|--------|-----------|--------|
| `sendMatchNotification` | Push notification de novo match | ✅ Completo |
| `sendMessageNotification` | Push notification de nova mensagem | ✅ Completo |
| `sendLikeNotification` | Push notification de like/super like | ✅ Completo |
| `notifications/pushHelper.ts` | Utilitário para gerenciar FCM tokens | ✅ Completo |

### 2. Cloud Functions - Scheduled Jobs (Prioridade Baixa)

| Função | Descrição | Status |
|--------|-----------|--------|
| `checkExpiredSubscriptions` | Cron diário para expirar assinaturas | ❌ Pendente |
| `sendTrialReminders` | Lembrete de trial expirando | ❌ Pendente |
| `checkInactiveChats` | Lembretes de chats inativos | ❌ Pendente |
| `cleanupOldData` | Limpeza semanal de dados antigos | ❌ Pendente |

> **Nota:** A função `onUserLogin` já faz estas verificações no momento do login, então as scheduled functions são opcionais para verificação em batch.

### 3. Integração no App - Telas

| Tarefa | Descrição | Status |
|--------|-----------|--------|
| Telas de signup | Integrar com `register()` do AuthContext | ⏳ Revisar |
| Telas de login | Integrar com `login()` do AuthContext | ⏳ Revisar |
| Tela de verificação | Usar `verifyEmail()` e `resendCode()` | ⏳ Revisar |
| Tela de recuperar senha | Usar `resetPassword()` | ⏳ Revisar |

### 4. Configuração Firebase Console

| Tarefa | Descrição | Status |
|--------|-----------|--------|
| Criar projeto no Firebase Console | bota-love-app | ⏳ Pendente |
| Configurar Authentication | Email/Password provider | ⏳ Pendente |
| Criar índices no Firestore | Queries compostas | ⏳ Pendente |
| Configurar regras de segurança | Firestore rules | ⏳ Pendente |
| Configurar Storage rules | Regras de upload | ⏳ Pendente |
| Configurar variáveis SMTP | Secrets no Cloud Functions | ⏳ Pendente |
| Deploy das Cloud Functions | `firebase deploy --only functions` | ⏳ Pendente |

---

## 📁 Estrutura de Arquivos

```
bota-love-app/
├── firebase/                          # ✅ COMPLETO
│   ├── config.ts                      # ✅ Configuração SDK
│   ├── types.ts                       # ✅ Tipos TypeScript
│   ├── index.ts                       # ✅ Exports
│   ├── authService.ts                 # ✅ Autenticação
│   ├── firestoreService.ts            # ✅ CRUD Firestore
│   ├── matchService.ts                # ✅ Sistema de match
│   ├── chatService.ts                 # ✅ Sistema de chat
│   ├── subscriptionService.ts         # ✅ Planos e pagamentos
│   ├── notificationService.ts         # ✅ Notificações
│   ├── storageService.ts              # ✅ Upload de arquivos
│   ├── loginCheckService.ts           # ✅ Verificações no login
│   └── networkRuralFirebaseService.ts # ✅ Network Rural
│
├── functions/                         # ✅ IMPLEMENTADO
│   ├── package.json                   # ✅ Dependências
│   ├── tsconfig.json                  # ✅ TypeScript config
│   └── src/
│       ├── index.ts                   # ✅ Entry point
│       ├── auth/
│       │   ├── sendVerificationEmail.ts    # ✅ Envio de email
│       │   └── resendVerificationCode.ts   # ✅ Reenvio de código
│       ├── moderation/
│       │   ├── moderateMessage.ts     # ✅ Moderação de chat
│       │   └── moderateMessage.test.ts # ✅ Testes
│       ├── user/
│       │   └── onUserLogin.ts         # ✅ Verificações no login
│       ├── templates/
│       │   └── emailTemplates.ts      # ✅ Templates de email
│       ├── utils/
│       │   └── emailService.ts        # ✅ Serviço SMTP
│       ├── notifications/             # ❌ Falta criar
│       └── scheduled/                 # ❌ Falta criar
│
├── contexts/
│   └── AuthContext.tsx                # ✅ Integrado com Firebase
│
├── .env.example                       # ✅ Template completo
└── app.json                           # ✅ Configurado

---

## 🗄️ Collections do Firestore

### Estrutura das Collections

```
firestore/
├── users/                    # Usuários
│   └── {userId}/
│       └── profile_views/    # Subcollection (opcional)
│
├── matches/                  # Matches entre usuários
├── likes/                    # Likes dados
├── chats/                    # Conversas
│   └── {chatId}/
│       └── messages/         # Subcollection de mensagens
│
├── notifications/            # Notificações
├── payments/                 # Histórico de pagamentos
├── network_connections/      # Conexões do Network Rural
├── email_verifications/      # Códigos de verificação
└── events/                   # Eventos agro
```

### Índices Necessários

```javascript
// Índices compostos a criar no Firestore
// 1. Users - Discovery
{ collection: 'users', fields: ['status', 'emailVerified', 'discoverySettings.showMe'] }

// 2. Likes - Recebidos
{ collection: 'likes', fields: ['toUserId', 'matchCreated', 'createdAt'] }

// 3. Matches - Por usuário
{ collection: 'matches', fields: ['users', 'isActive', 'lastMessageAt'] }

// 4. Chats - Por participante
{ collection: 'chats', fields: ['participants', 'isActive', 'updatedAt'] }

// 5. Notifications - Por usuário
{ collection: 'notifications', fields: ['userId', 'read', 'createdAt'] }
```

---

## ⚡ Cloud Functions

### Funções HTTP Callable

```typescript
// auth/
sendVerificationEmail(userId, email, name, code)
resendVerificationCode(userId)

// notifications/
sendMatchNotification(user1Id, user2Id, matchId)
sendMessageNotification(chatId, senderId, receiverId, messageText, chatOrigin)
sendLikeNotification(fromUserId, toUserId, isSuperLike)

// moderation/
moderateMessage(text, chatId, senderId) → { allowed, sanitizedText, score, violations }

// subscriptions/
processPayment(userId, planId, paymentData) // Para integração futura
scheduleTrialReminder(userId, trialEndDate)
```

### Funções Scheduled (Cron)

```typescript
// Executar diariamente
checkExpiredSubscriptions() // Expira assinaturas vencidas
checkExpiredTrials()        // Expira trials vencidos
sendTrialReminders()        // Envia lembretes 1 dia antes

// Executar a cada hora
checkInactiveChats()        // Envia lembretes de inatividade
```

### Triggers Firestore

```typescript
// Opcional - para processamento automático
onUserCreated()             // Após criar usuário
onMatchCreated()            // Após criar match
onMessageCreated()          // Após enviar mensagem
```

---

## 🚀 Próximos Passos

### Fase 1: Configuração Firebase Console - Prioridade Alta

1. [ ] Criar projeto no Firebase Console (bota-love-app)
2. [ ] Habilitar Authentication (Email/Password)
3. [ ] Criar banco Firestore (southamerica-east1)
4. [ ] Configurar índices compostos
5. [ ] Aplicar regras de segurança
6. [ ] Configurar Storage
7. [ ] Preencher `.env` com credenciais reais
8. [ ] Configurar secrets SMTP: `firebase functions:secrets:set SMTP_HOST SMTP_USER SMTP_PASS`
9. [ ] Deploy das Cloud Functions: `firebase deploy --only functions`

### Fase 2: Integração das Telas - Prioridade Alta

1. [ ] Revisar telas de signup para usar `register()` do AuthContext
2. [ ] Revisar tela de login para usar `login()` do AuthContext
3. [ ] Revisar tela de verificação de email
4. [ ] Testar fluxo completo de registro → verificação → login

### Fase 3: Cloud Functions - Notificações Push (Opcional)

1. [ ] Criar `functions/src/notifications/sendMatchNotification.ts`
2. [ ] Criar `functions/src/notifications/sendMessageNotification.ts`
3. [ ] Criar `functions/src/notifications/sendLikeNotification.ts`
4. [ ] Criar `functions/src/notifications/helpers/pushHelper.ts`

### Fase 4: Cloud Functions - Scheduled Jobs (Opcional)

> **Nota:** A função `onUserLogin` já faz verificações de subscription e chats inativos no momento do login. As scheduled functions são opcionais para processamento em batch.

1. [ ] Criar `functions/src/scheduled/checkExpiredSubscriptions.ts`
2. [ ] Criar `functions/src/scheduled/sendTrialReminders.ts`
3. [ ] Criar `functions/src/scheduled/checkInactiveChats.ts`
4. [ ] Criar `functions/src/scheduled/cleanupOldData.ts`

---

## 📊 Progresso Geral

| Área | Progresso | Status |
|------|-----------|--------|
| Firebase SDK (Frontend) | 100% | ✅ Completo |
| Serviços Firebase | 100% | ✅ Completo |
| Tipos TypeScript | 100% | ✅ Completo |
| Cloud Functions - Auth | 100% | ✅ Completo |
| Cloud Functions - Moderação | 100% | ✅ Completo |
| Cloud Functions - Login Check | 100% | ✅ Completo |
| Cloud Functions - Notificações | 0% | ❌ Pendente (opcional) |
| Cloud Functions - Scheduled | 0% | ❌ Pendente (opcional) |
| Integração AuthContext | 100% | ✅ Completo |
| Configuração package.json | 100% | ✅ Completo |
| Configuração app.json | 100% | ✅ Completo |
| Arquivo .env.example | 100% | ✅ Completo |
| Firebase Console | 0% | ⏳ Pendente (setup manual) |
| Integração Telas Signup/Login | 50% | ⏳ Revisar |

**Progresso Total: ~85%**

### Resumo do que está pronto para uso:

✅ **AuthContext** totalmente integrado com Firebase Auth:
- `register()` - Registro de usuário
- `login()` - Login com email/senha
- `logout()` - Logout
- `verifyEmail()` - Verificação de código
- `resendCode()` - Reenvio de código
- `resetPassword()` - Recuperação de senha
- `updateProfile()` - Atualização de perfil
- `updatePhotos()` - Atualização de fotos
- `activatePremiumTrial()` - Ativa trial premium
- `activateNetworkTrial()` - Ativa trial Network Rural
- `subscribeToPlan()` - Assina plano

✅ **Cloud Functions** prontas:
- `sendVerificationEmail` - Envia email com código
- `resendVerificationCode` - Reenvia código
- `moderateMessage` - Modera mensagens de chat
- `onUserLogin` - Verifica subscriptions, trials e chats inativos

---

## 🔗 Referências

- [Firebase Documentation](https://firebase.google.com/docs)
- [Expo Firebase Guide](https://docs.expo.dev/guides/using-firebase/)
- [Cloud Functions for Firebase](https://firebase.google.com/docs/functions)

---

*Documento atualizado em 05/01/2026 - Bota Love Team*
