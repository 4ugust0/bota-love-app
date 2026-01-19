# 💕 Módulo de Match - Bota Love App

Este documento descreve a arquitetura completa do sistema de Match do Bota Love App.

## 📋 Visão Geral

O módulo de Match é responsável por:
- **Descoberta de usuários** por localização e filtros
- **Sistema de likes** (curtir/rejeitar)
- **Super Like** (destaque especial)
- **Detecção de match** (match mútuo)
- **Criação automática de chat** após match
- **Correio da Roça** (mensagem sem match - premium)

## 🏗️ Arquitetura

### Services (Firebase)

```
firebase/
├── discoveryService.ts    # Descoberta de usuários
├── matchService.ts        # Likes, matches e Correio da Roça
├── chatService.ts         # Chat pós-match
└── types.ts               # Tipos TypeScript
```

### Hooks

```
hooks/
└── useDiscoveryFeed.ts    # Hook do feed de descoberta
```

### Collections no Firestore

| Collection | Descrição |
|------------|-----------|
| `users` | Perfis dos usuários |
| `likes` | Registro de likes/super likes |
| `passes` | Rejeições temporárias (24h) |
| `matches` | Matches criados |
| `chats` | Conversas |
| `correio_da_roca` | Mensagens sem match |

---

## 🔍 Descoberta de Usuários

### Filtros Disponíveis

| Filtro | Tipo | Descrição |
|--------|------|-----------|
| `ageRange` | `{min, max}` | Faixa etária (mínimo 18) |
| `distanceRadius` | `number` | Raio em km |
| `genderInterest` | `men \| women \| both` | Preferência de gênero |
| `showOutsideDistance` | `boolean` | Mostrar fora do raio |
| `showOutsideAgeRange` | `boolean` | Mostrar fora da faixa etária |
| `onlyVerified` | `boolean` | Apenas verificados |
| `onlyWithPhotos` | `boolean` | Apenas com fotos |

### Como Funciona

1. **Busca usuários ativos** no Firestore (`status = 'active'`)
2. **Aplica filtros** de idade, gênero e distância
3. **Exclui usuários já interagidos** (curtidos, rejeitados, matches)
4. **Ordena por proximidade** (se tiver coordenadas)
5. **Prioriza quem já curtiu** o usuário atual (especialmente super likes)

### Exemplo de Uso

```typescript
import { getDiscoveryFeed, DiscoverySettings } from '@/firebase';

const discoverySettings: DiscoverySettings = {
  ageRange: { min: 25, max: 40 },
  distanceRadius: 50,
  genderInterest: 'women',
  latitude: -23.5505,
  longitude: -46.6333,
};

const users = await getDiscoveryFeed(userId, discoverySettings);
```

---

## ❤️ Sistema de Likes

### Fluxo de Like

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   User A     │────>│   Like       │────>│   User B     │
│   (from)     │     │   Registry   │     │   (to)       │
└──────────────┘     └──────────────┘     └──────────────┘
                            │
                     Like mútuo?
                            │
                     ┌──────┴──────┐
                     │             │
                    Sim           Não
                     │             │
              ┌──────┴──────┐      │
              │   MATCH!    │      │
              │  Chat criado│  Notificação
              └─────────────┘  (Super Like)
```

### Tipos de Like

| Tipo | Descrição | Match Chance |
|------|-----------|--------------|
| **Like** | Curtida normal | Detecta match se mútuo |
| **Super Like** | Premium - notifica | Prioridade no feed |

### Exemplo de Código

```typescript
import { likeUser, passUser } from '@/firebase';

// Dar like
const result = await likeUser(myUserId, targetUserId, false);
if (result.isMatch) {
  console.log('Match!', result.matchId, result.chatId);
}

// Dar super like
const superResult = await likeUser(myUserId, targetUserId, true);

// Rejeitar (pass)
await passUser(myUserId, targetUserId);
// Usuário não aparece por 24h
```

---

## 🚫 Sistema de Pass

- Quando usuário rejeita, registra um **pass** na collection `passes`
- Pass **expira em 24 horas**
- Após expirar, usuário pode aparecer novamente
- Pass não notifica o outro usuário

---

## 💕 Detecção de Match

Match é criado automaticamente quando:
1. **User A** dá like em **User B**
2. **User B** já tinha dado like em **User A**

### O que acontece no Match:

1. Cria documento em `matches`
2. Cria chat em `chats` (origin: 'match')
3. Atualiza ambos os likes com `matchCreated: true`
4. Incrementa estatística `totalMatches`
5. Envia notificação push para ambos

---

## 📮 Correio da Roça

Funcionalidade **premium** que permite enviar mensagem para alguém **antes do match**.

### Fluxo do Correio

```
┌─────────────────────────────────────────────────────────────┐
│                    CORREIO DA ROÇA                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  User A ──> Envia mensagem ──> User B recebe                │
│                                    │                        │
│                              ┌─────┴─────┐                  │
│                              │           │                  │
│                           ACEITA     REJEITA                │
│                              │        (Porteira             │
│                        ┌─────┴─────┐   Fechada)             │
│                        │   MATCH   │                        │
│                        │ Chat com  │                        │
│                        │ mensagem  │                        │
│                        └───────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

### Status do Correio

| Status | Descrição |
|--------|-----------|
| `pending` | Aguardando resposta |
| `accepted` | Match criado |
| `rejected` | Porteira fechada |

### Exemplo de Uso

```typescript
import { 
  sendCorreioDaRoca, 
  acceptCorreioDaRoca, 
  rejectCorreioDaRoca,
  getPendingCorreios 
} from '@/firebase';

// Enviar correio
const result = await sendCorreioDaRoca(
  myUserId, 
  targetUserId, 
  "Oi! Adorei seu perfil, curte vida no campo também?"
);

// Buscar correios recebidos
const pendingCorreios = await getPendingCorreios(myUserId);

// Aceitar correio (cria match e chat)
const acceptResult = await acceptCorreioDaRoca(correioId);

// Rejeitar correio
await rejectCorreioDaRoca(correioId);
```

---

## 🎣 Hook useDiscoveryFeed

Hook React que gerencia o feed de descoberta.

### Uso Básico

```tsx
import { useDiscoveryFeed } from '@/hooks/useDiscoveryFeed';

function DiscoveryScreen() {
  const {
    users,
    loading,
    currentUser,
    currentIndex,
    handleLike,
    handleSuperLike,
    handlePass,
    goToNextUser,
    resetFeed,
    refreshFeed,
  } = useDiscoveryFeed();

  const onSwipeRight = async () => {
    const result = await handleLike();
    if (result.isMatch) {
      showMatchAnimation(result.matchId);
    }
    goToNextUser();
  };

  const onSwipeLeft = async () => {
    await handlePass();
    goToNextUser();
  };

  return (
    // ... UI do feed
  );
}
```

### Opções

```typescript
useDiscoveryFeed({
  includesMock: true,  // Incluir usuários mockados (desenvolvimento)
  maxResults: 30,      // Máximo de resultados
});
```

---

## 🔥 Firestore Rules

As regras garantem:

- **Likes**: Apenas o remetente pode criar/deletar
- **Passes**: Apenas o remetente pode criar/deletar
- **Matches**: Apenas participantes podem ler/atualizar
- **Chats**: Apenas participantes podem acessar
- **Correio**: Apenas remetente pode criar, destinatário pode responder

---

## 📊 Índices Necessários

Os índices estão configurados em `firestore.indexes.json`:

- `likes`: por `fromUserId` e `toUserId`
- `passes`: por `fromUserId` com `expiresAt`
- `correio_da_roca`: por `toUserId/status` e `fromUserId`

Para deploy:
```bash
firebase deploy --only firestore:indexes
```

---

## 🚀 Cloud Functions

As seguintes Cloud Functions são chamadas pelo módulo:

| Function | Trigger | Descrição |
|----------|---------|-----------|
| `sendMatchNotification` | Match criado | Notifica ambos usuários |
| `sendLikeNotification` | Super Like | Notifica destinatário |
| `sendCorreioNotification` | Correio enviado | Notifica destinatário |
| `sendCorreioAcceptedNotification` | Correio aceito | Notifica remetente |

---

## 📱 Integração com UI

A tela principal (`app/(tabs)/index.tsx`) usa o hook `useDiscoveryFeed` para:

1. Carregar usuários (reais + mockados)
2. Exibir cards de perfil
3. Processar swipes (like/pass)
4. Mostrar animação de match
5. Modal do Correio da Roça

---

## ✅ Checklist de Implementação

- [x] Types TypeScript (`firebase/types.ts`)
- [x] Discovery Service (`firebase/discoveryService.ts`)
- [x] Match Service atualizado (`firebase/matchService.ts`)
- [x] Hook de Feed (`hooks/useDiscoveryFeed.ts`)
- [x] Firestore Rules (`firestore.rules`)
- [x] Índices (`firestore.indexes.json`)
- [x] Exportações (`firebase/index.ts`)
- [ ] Cloud Functions de notificação
- [ ] Testes unitários
- [ ] Integração completa na UI

---

## 🔮 Próximos Passos

1. **Cloud Functions**: Implementar notificações push
2. **UI**: Integrar hook na tela de descoberta
3. **Tela Correio**: Criar modal para visualizar/responder correios
4. **Analytics**: Rastrear métricas de match rate
5. **Testes**: Cobertura de testes para serviços
