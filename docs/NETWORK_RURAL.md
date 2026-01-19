# 🌱 Network Rural - Documentação do Módulo

## Visão Geral

O **Network Rural** é um módulo premium dentro do app Bota Love, funcionando como um "mini-LinkedIn rural" voltado exclusivamente ao agronegócio. Permite conexões profissionais qualificadas entre usuários "Sou Agro".

---

## 📁 Arquivos Criados/Modificados

### Novos Arquivos

| Arquivo | Descrição |
|---------|-----------|
| `data/networkRuralService.ts` | Serviço principal com tipos, funções e dados mockados |
| `app/(tabs)/network-rural.tsx` | Tela principal da aba Network Rural |
| `components/rural-icons/NetworkRuralIcon.tsx` | Ícones SVG customizados |
| `components/NetworkBadge.tsx` | Componentes de selo e badges |

### Arquivos Modificados

| Arquivo | Modificação |
|---------|-------------|
| `contexts/AuthContext.tsx` | Adicionado estado e funções de Network Rural |
| `data/mockData.ts` | Adicionados campos de Network nos tipos User |
| `app/(tabs)/_layout.tsx` | Adicionada aba Network Rural (condicional) |
| `app/(tabs)/store.tsx` | Adicionado banner de assinatura Network Rural |
| `app/onboarding-goals.tsx` | Alerta ao selecionar objetivo Network |

---

## 🏗️ Arquitetura

### Tipos Principais

```typescript
// Status da assinatura
type NetworkSubscriptionStatus = 'inactive' | 'trial' | 'active' | 'lifetime' | 'expired';

// Dados do LinkedIn integrado
interface LinkedInData {
  profileUrl: string;
  currentPosition?: string;
  company?: string;
  industry?: string;
  summary?: string;
  isVerified: boolean;
}

// Assinatura do Network Rural
interface NetworkRuralSubscription {
  status: NetworkSubscriptionStatus;
  planType: 'monthly' | 'lifetime' | null;
  startDate: Date | null;
  endDate: Date | null;
  trialEndDate: Date | null;
  price: number;
  autoRenew: boolean;
}
```

### Contexto de Autenticação

O `AuthContext` foi expandido com:

```typescript
// Novos estados
isAgroUser: boolean;
hasNetworkRural: boolean;
networkSubscription: NetworkRuralSubscription | null;
networkTrialDaysRemaining: number;

// Novas ações
setIsAgroUser: (isAgro: boolean) => void;
activateNetworkTrial: () => void;
subscribeNetworkMonthly: () => void;
subscribeNetworkLifetime: () => void;
cancelNetworkSubscription: () => void;
```

---

## 💰 Modelo de Monetização

### Preços

| Plano | Preço | Descrição |
|-------|-------|-----------|
| Mensal | R$ 14,90/mês | Renovação automática |
| Vitalício | R$ 9,90/mês | Promoção de lançamento (preço fixo para sempre) |

### Regras de Acesso

1. **Período Gratuito**: 7 dias de trial automático ao ativar
2. **Pós-Trial sem assinatura**: Network desativado, selo removido
3. **Assinatura Ativa**: Acesso completo, selo visível, destaque no feed
4. **Plano Vitalício**: Nunca expira, sem cobranças recorrentes

---

## 🎨 Componentes de UI

### NetworkActiveBadge
Selo que aparece no perfil indicando Network ativo.

```tsx
<NetworkActiveBadge 
  subscription={networkSubscription}
  size="medium" // small | medium | large
  showLabel={true}
/>
```

### NetworkPhotoOverlay
Ícone que aparece sobre a foto principal do perfil.

```tsx
<NetworkPhotoOverlay subscription={networkSubscription} />
```

### NetworkInterestTag
Tag fixa no perfil indicando interesse em networking.

```tsx
<NetworkInterestTag />
// "Interessado em conexões profissionais (Network Rural)"
```

### NetworkFeedHighlight
Badge de destaque para assinantes ativos no feed.

```tsx
<NetworkFeedHighlight subscription={networkSubscription} />
```

---

## 🔍 Filtros Disponíveis

Os usuários podem filtrar perfis por:

- ✅ Mostrar apenas perfis com Network Rural ativo
- ✅ Buscar apenas usuários que marcaram Network
- ✅ Buscar apenas usuários que escolheram só Network
- ✅ Filtrar por área do agro
- ✅ Filtrar por região
- ✅ Filtrar por LinkedIn verificado

---

## 🔗 Integração com LinkedIn (API)

### Fluxo de Integração

1. Usuário assina o plano
2. Campo de LinkedIn é liberado
3. Usuário cola URL do perfil LinkedIn
4. Sistema faz fetch via API (simulado)
5. Dados são exibidos no perfil

### Dados Obtidos

- Cargo atual
- Empresa
- Área de atuação
- Resumo profissional
- Badge de verificação

---

## 📱 Fluxos de Usuário

### Fluxo de Ativação

```
1. Usuário marca "Sou Agro" no cadastro
   ↓
2. Opção Network aparece em Objetivos
   ↓
3. Ao selecionar Network, aparece alerta:
   "Assine e coloque seus dados profissionais do seu LinkedIn!"
   ↓
4. Usuário pode:
   - Ver Planos → Vai para Loja
   - Continuar → Segue cadastro
   ↓
5. Na Loja, vê banner Network Rural Premium
   ↓
6. Clica em "Ativar Network Rural"
   ↓
7. Escolhe: Trial 7 dias OU Assinar
   ↓
8. Após pagamento: LinkedIn liberado, selo ativo
```

### Navegação

```
Tab Bar (para usuários Sou Agro):
├── Explorar
├── Matches  
├── Loja
├── Network Rural ← NOVO
├── Eventos
└── Perfil
```

---

## 🎯 Regras de Visibilidade

| Condição | Aba Network | Selo | Filtros | Destaque Feed |
|----------|-------------|------|---------|---------------|
| Não é Sou Agro | ❌ | ❌ | ❌ | ❌ |
| Sou Agro sem assinatura | ✅ (bloqueado) | ❌ | ❌ | ❌ |
| Trial ativo | ✅ | ✅ | ✅ | ❌ |
| Assinatura ativa | ✅ | ✅ | ✅ | ✅ |
| Assinatura vitalícia | ✅ | ✅ | ✅ | ✅ |
| Assinatura expirada | ✅ (bloqueado) | ❌ | ❌ | ❌ |

---

## 🧪 Como Testar

### 1. Ativar modo Sou Agro
No `AuthContext`, o `isAgroUser` já está como `true` por padrão para demo.

### 2. Ativar Trial
```tsx
const { activateNetworkTrial } = useAuth();
activateNetworkTrial();
```

### 3. Assinar Plano Mensal
```tsx
const { subscribeNetworkMonthly } = useAuth();
subscribeNetworkMonthly();
```

### 4. Assinar Plano Vitalício
```tsx
const { subscribeNetworkLifetime } = useAuth();
subscribeNetworkLifetime();
```

---

## 🔮 Próximos Passos (Sugestões)

1. **Integração real com API do LinkedIn** - Implementar OAuth 2.0
2. **Sistema de pagamentos** - Integrar Stripe ou similar
3. **Notificações de expiração** - Push notifications
4. **Analytics** - Rastrear conversões e engajamento
5. **Sistema de mensagens profissionais** - Chat específico para networking
6. **Eventos de networking** - Encontros presenciais entre assinantes
7. **Selo verificado** - Validação manual de perfis profissionais

---

## 📊 Métricas Sugeridas

- Taxa de conversão Trial → Pago
- Tempo médio de uso do módulo
- Número de conexões realizadas
- Taxa de integração com LinkedIn
- Churn rate por tipo de plano
- NPS específico do Network Rural

---

*Documentação criada em Janeiro 2026*
