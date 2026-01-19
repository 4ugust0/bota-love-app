# 🔑 Login Check Service - Bota Love App

> Documentação do serviço de verificações automáticas no login

---

## 📋 Visão Geral

O **Login Check Service** substitui os jobs agendados (cron jobs) por verificações em tempo real que são executadas quando o usuário faz login no app.

### Vantagens dessa abordagem:

1. **Redução de custos** - Não há jobs rodando constantemente
2. **Atualizações em tempo real** - O usuário recebe informações atualizadas imediatamente
3. **Melhor UX** - Notificações relevantes são mostradas no momento do login
4. **Menos complexidade** - Código centralizado e mais fácil de manter

---

## 🔧 Arquitetura

### Cloud Function: `onUserLogin`

**Localização:** `functions/src/user/onUserLogin.ts`

**Tipo:** HTTP Callable Function

**Região:** `southamerica-east1`

**Chamada automática:** Sim, no `loginUser()` do `authService.ts`

---

## 📦 Funcionalidades

### 1. Verificação de Assinaturas Expiradas

- Verifica se a assinatura Premium expirou
- Verifica se a assinatura Network Rural expirou
- Atualiza o status para `expired` automaticamente
- Envia push notification informando a expiração

**Push enviado:**
```
Título: 😢 Sua assinatura expirou
Corpo: Renove sua assinatura para continuar aproveitando todos os recursos premium.
```

### 2. Verificação de Trial Expirando

- Verifica se o trial Premium está expirando (≤ 3 dias)
- Verifica se o trial Network Rural está expirando (≤ 3 dias)
- Envia push notification com lembrete

**Push enviado:**
```
Título: ⏰ Seu trial acaba em X dias!
Corpo: Aproveite os últimos dias e não perca os recursos premium.
```

### 3. Verificação de Chats Inativos

- Busca chats do usuário inativos há mais de 48 horas
- Incrementa contador de lembretes (máximo 3)
- Envia push para incentivar a conversa

**Push enviado:**
```
Título: 💬 Conversa parada há tempo
Corpo: Você e {nome} não conversam há X dias. Que tal mandar uma mensagem?
```

### 4. Limpeza de Dados Antigos

- Remove notificações lidas há mais de 30 dias
- Remove códigos de verificação de email expirados

---

## 📝 Interface de Resposta

```typescript
interface LoginCheckResult {
  subscriptionUpdated: boolean;    // Se alguma assinatura foi atualizada
  subscriptionExpired: boolean;    // Se há assinatura expirada
  trialExpiringDays: number | null; // Dias restantes do trial (se ≤ 3)
  inactiveChatsCount: number;      // Quantidade de chats inativos
  cleanedDataCount: number;        // Quantidade de registros limpos
  notifications: LoginNotification[]; // Notificações para exibir ao usuário
}

interface LoginNotification {
  type: 'subscription_expired' | 'trial_expiring' | 'inactive_chat' | 'info';
  title: string;
  message: string;
  data?: Record<string, any>;
}
```

---

## 🚀 Como Usar

### Chamada Automática (Login)

A função é chamada automaticamente em `firebase/authService.ts` durante o login:

```typescript
// authService.ts - loginUser()
const onUserLogin = httpsCallable(functions, 'onUserLogin');
const loginCheckResult = await onUserLogin({ userId: uid });
```

### Chamada Manual

Você pode chamar a verificação manualmente usando o `loginCheckService.ts`:

```typescript
import { performLoginCheck, hasImportantNotifications } from '@/firebase';

// Executar verificação
const result = await performLoginCheck(userId);

if (result && hasImportantNotifications(result)) {
  // Mostrar modal ou toast com notificações importantes
}
```

### Funções Utilitárias

```typescript
import { 
  performLoginCheck,
  hasImportantNotifications,
  getHighPriorityNotifications,
  getInactiveChatNotifications
} from '@/firebase';

// Verificar se há notificações importantes
const hasImportant = hasImportantNotifications(result);

// Obter apenas notificações de alta prioridade
const highPriority = getHighPriorityNotifications(result);

// Obter notificações de chats inativos
const inactiveChats = getInactiveChatNotifications(result);
```

---

## 📂 Arquivos Criados/Modificados

### Novos Arquivos

- `functions/src/user/onUserLogin.ts` - Cloud Function principal
- `firebase/loginCheckService.ts` - Serviço frontend para chamar a função

### Arquivos Modificados

- `functions/src/index.ts` - Exportação da nova função
- `firebase/authService.ts` - Integração no login
- `firebase/index.ts` - Exportação do serviço

---

## 🔐 Segurança

A Cloud Function inclui as seguintes verificações de segurança:

1. **Autenticação obrigatória** - Requer `request.auth`
2. **Verificação de propriedade** - O usuário só pode verificar seus próprios dados
3. **Validação de entrada** - `userId` é obrigatório

---

## 📊 Logs

A função produz logs detalhados para debugging:

```
🔑 Processando login do usuário: {userId}
✅ Login processado com sucesso para usuário: {userId}
❌ Erro ao processar login do usuário {userId}: {error}
```

Logs específicos por funcionalidade:
- `Assinatura expirada para usuário {userId}`
- `Trial expirando em X dias para usuário {userId}`
- `X chats inativos encontrados para usuário {userId}`
- `X registros antigos limpos para usuário {userId}`

---

## 🔄 Quando Usar Chamada Manual

Recomenda-se chamar `performLoginCheck` manualmente nos seguintes cenários:

1. **App volta do background** - Quando o app fica inativo por muito tempo
2. **Refresh manual** - Quando o usuário faz pull-to-refresh na tela principal
3. **Navegação para tela de assinaturas** - Para garantir dados atualizados

---

## ⚡ Performance

- **Timeout:** Padrão do Firebase Functions (60s)
- **Max Instances:** 10 (configurado globalmente)
- **Batch Processing:** Operações em batch para chats e notificações
- **Erro Handling:** Erros não bloqueiam o login do usuário

---

*Bota Love Team - 2026*
