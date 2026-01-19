# 🎯 BOTA LOVE APP - Sistema de Plano Gratuito

## 📋 Visão Geral

Este documento detalha o sistema completo de **Plano Gratuito** do Bota Love App, incluindo:
- Controle progressivo de limites
- Experiência fluida sem avisos constantes
- Gatilhos de conversão para planos pagos
- Integração técnica com backend e frontend

---

## 🎯 PRINCÍPIOS DO PLANO GRATUITO

| Princípio | Descrição |
|-----------|-----------|
| ❌ Sem mensagens constantes | O usuário NÃO vê avisos mostrando suas limitações |
| ✅ Limites silenciosos | Os limites atuam em segundo plano até o bloqueio |
| ✅ Conversão no bloqueio | Apenas quando limite é atingido, exibir mensagem de conversão |
| 🔒 Moderação ativa | Bloqueios de BIO, CHAT e NOME sempre ativos (Regex + IA) |

---

## 📅 REGRAS POR PERÍODO DE USO

### 🟢 1º DIA - Onboarding Forte

**Objetivo:** Gerar valor máximo no primeiro contato

| Recurso | Limite |
|---------|--------|
| Visualizações de perfil | **Ilimitadas** |
| Curtidas | **Ilimitadas** |
| Chat | Apenas com Match |
| Mensagens por Match | **2 mensagens** |
| Leitura de chat | ✅ Liberada |

---

### 🟡 2º AO 7º DIA - Primeira Semana

| Recurso | Limite |
|---------|--------|
| Visualizações de perfil | **120/dia** |
| Curtidas | **25/dia** |
| Chat | Apenas com Match |
| Mensagens por Match | **1 mensagem** |
| Leitura de chat | ✅ Liberada |

---

### 🟠 8º AO 10º DIA - Segunda Semana

| Recurso | Limite |
|---------|--------|
| Visualizações de perfil | **50/dia** |
| Curtidas | **25/dia** |
| Chat | Apenas com Match |
| Mensagens por Match | **1 mensagem** |
| Leitura de chat | ✅ Liberada |

---

### 🔴 11º AO 14º DIA - Período de Avaliação

| Recurso | Limite |
|---------|--------|
| Visualizações de perfil | **50/dia** |
| Curtidas | **20/dia** |
| Chat | Apenas com Match |
| Mensagens por Match | **1 mensagem** |
| Leitura de chat | ✅ Liberada |

---

### ⚪ APÓS O PERÍODO INICIAL

**Após o 14º dia (primeiro mês) / Após o 7º dia (segundo mês em diante)**

| Recurso | Limite |
|---------|--------|
| Visualizações de perfil | **50/dia** |
| Curtidas | **3/dia** |
| Chat | Apenas com Match |
| Envio de mensagens | ❌ **Bloqueado** |
| Leitura de chat | ✅ Liberada |
| Ao tentar enviar | 📢 Exibir mensagem de conversão |

---

## 💬 BLOQUEIO DE ENVIO DE MENSAGEM

### Mensagem de Conversão (OBRIGATÓRIA)

Quando o usuário **atinge o limite de mensagens**, exibir:

> **"Continue a conversa com o chat ilimitado, assine um Plano e destrave tudo!!!"**

### Onde aparece:
- ✅ No botão de envio (input bloqueado)
- ✅ No momento exato do bloqueio
- ❌ Sem avisos prévios

---

## 👤 PERFIS VISÍVEIS NO PLANO GRATUITO

### ✅ Informações LIBERADAS

| Campo | Visível |
|-------|---------|
| Idade | ✅ |
| Cidade | ✅ |
| Distância | ✅ |
| Gênero | ✅ |
| Nome | ✅ |
| 1ª Foto | ✅ |
| Bio (truncada 50 chars) | ✅ |

### ❌ Informações BLOQUEADAS

| Campo | Status |
|-------|--------|
| Bio completa | 🔒 Premium |
| Profissão | 🔒 Premium |
| Interesses | 🔒 Premium |
| Fotos extras | 🔒 Premium |
| Preferências | 🔒 Premium |
| Dados premium | 🔒 Premium |

---

## 🔒 FILTROS AVANÇADOS BLOQUEADOS

### Lista de Filtros Premium

| Filtro | Ícone | Descrição |
|--------|-------|-----------|
| Distância Personalizada | 📍 | Defina raio exato |
| Altura | 📏 | Filtre por altura |
| Escolaridade | 🎓 | Nível educacional |
| Filhos | 👶 | Preferência sobre filhos |
| Fumante | 🚬 | Hábito de fumar |
| Bebida | 🍺 | Hábito de beber |
| Religião | 🙏 | Crença religiosa |
| Signo | ⭐ | Signo do zodíaco |
| Animais | 🐾 | Tem pets |
| Verificados | ✓ | Apenas verificados |
| Online Agora | 🟢 | Usuários online |
| Novos Usuários | ✨ | Cadastros recentes |

### Comportamento:
- Filtros **visíveis** com ícone de **cadeado 🔒**
- Ao tentar usar: direcionar para tela de assinatura
- Sem mensagem agressiva - apenas CTA claro

---

## 🔐 SISTEMA DE MODERAÇÃO DE CONTEÚDO

### Sempre Ativo (independente do plano)

| Tipo | Descrição |
|------|-----------|
| Bio | Moderação de texto da bio |
| Chat | Moderação de mensagens |
| Nome | Moderação de nomes |

### Tipos de Violação Detectados

| Tipo | Severidade | Descrição |
|------|------------|-----------|
| `contact_info` | Média | Telefone, email, redes sociais |
| `profanity` | Baixa | Palavrões e linguagem vulgar |
| `spam` | Baixa | Spam e conteúdo repetitivo |
| `scam` | Alta | Golpes e tentativas de fraude |
| `harassment` | Alta | Assédio e ameaças |
| `inappropriate` | Média | Conteúdo sexual explícito |
| `external_links` | Média | Links externos |
| `fake_profile` | Baixa | Indicadores de perfil falso |
| `hate_speech` | Alta | Discurso de ódio |

### Score de Moderação
- **0-19:** `safe` - Conteúdo seguro
- **20-59:** `warning` - Conteúdo com avisos
- **60-100:** `blocked` - Conteúdo bloqueado

---

## 🛠️ ARQUITETURA TÉCNICA

### Arquivos do Sistema

```
data/
├── freePlanService.ts      # Lógica de limites e períodos
├── contentModerationService.ts  # Regex e moderação
│
contexts/
├── FreePlanContext.tsx     # Estado global do plano
│
components/
├── ConversionModal.tsx     # Modal de conversão
├── LockedFilter.tsx        # Filtros com cadeado
│
hooks/
├── useFreePlanLimits.ts    # Hook utilitário
```

### Fluxo de Verificação

```
┌─────────────────────────────────────────────────────────┐
│                    USUÁRIO AÇÃO                         │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│              É PREMIUM?                                  │
│                                                          │
│     SIM ─────────────────────► PERMITIR                 │
│                                                          │
│     NÃO ─────────────────────► VERIFICAR LIMITE         │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│            LIMITE ATINGIDO?                              │
│                                                          │
│     NÃO ─────────────────────► CONSUMIR + PERMITIR      │
│                                                          │
│     SIM ─────────────────────► MOSTRAR CONVERSÃO        │
└─────────────────────────────────────────────────────────┘
```

---

## 📦 COMO USAR

### 1. Importar o Context no Layout Principal

```tsx
// app/_layout.tsx
import { FreePlanProvider } from '@/contexts/FreePlanContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <FreePlanProvider>
        {/* ... */}
      </FreePlanProvider>
    </AuthProvider>
  );
}
```

### 2. Usar o Hook em Componentes

```tsx
import { useFreePlanLimits } from '@/hooks/useFreePlanLimits';

function MyComponent() {
  const { views, likes, consumeView, consumeLike } = useFreePlanLimits();
  
  const handleViewProfile = () => {
    if (consumeView()) {
      // Visualização permitida
    }
    // Se não permitido, modal de conversão é exibido automaticamente
  };
  
  const handleLike = () => {
    if (consumeLike()) {
      // Curtida permitida
    }
    // Se não permitido, modal de conversão é exibido automaticamente
  };
}
```

### 3. Verificar Mensagens no Chat

```tsx
import { useMessageLimits } from '@/hooks/useFreePlanLimits';

function ChatScreen({ matchId }) {
  const { canSend, consume, triggerConversion } = useMessageLimits(matchId);
  
  const handleSend = () => {
    if (!canSend) {
      triggerConversion();
      return;
    }
    
    if (consume()) {
      // Enviar mensagem
    }
  };
}
```

### 4. Moderar Conteúdo

```tsx
import { useContentModeration } from '@/hooks/useFreePlanLimits';

function ProfileEditor() {
  const { shouldBlock, sanitize } = useContentModeration();
  
  const handleSaveBio = (bio: string) => {
    if (shouldBlock(bio)) {
      // Mostrar erro
      return;
    }
    
    const safeBio = sanitize(bio, 'bio');
    // Salvar bio sanitizada
  };
}
```

---

## 🚫 RESTRIÇÕES IMPORTANTES

| ❌ NÃO FAZER | ✅ FAZER |
|--------------|----------|
| Exibir banners constantes de limitação | Limites silenciosos em background |
| Avisar "você tem X mensagens restantes" | Conversão apenas no bloqueio |
| Mensagens agressivas de upsell | CTAs claros e não punitivos |
| Bloquear experiência completamente | Degradar gradualmente |

---

## ✅ RESULTADO ESPERADO

Um Plano Gratuito que é:

| Característica | Descrição |
|----------------|-----------|
| 🎯 Atrativo no início | Muitos recursos no Day 1 |
| 📉 Progressivamente restritivo | Limites aumentam com o tempo |
| 💰 Altamente conversor | Gatilhos no momento certo |
| 🔧 Tecnicamente claro | Fácil de implementar e manter |
| 🔒 Seguro contra abuso | Moderação sempre ativa |

---

## 📊 TABELA RESUMO DE LIMITES

| Período | Views/dia | Likes/dia | Msgs/Match | Enviar | Ler |
|---------|-----------|-----------|------------|--------|-----|
| 🟢 Day 1 | ∞ | ∞ | 2 | ✅ | ✅ |
| 🟡 Days 2-7 | 120 | 25 | 1 | ✅ | ✅ |
| 🟠 Days 8-10 | 50 | 25 | 1 | ✅ | ✅ |
| 🔴 Days 11-14 | 50 | 20 | 1 | ✅ | ✅ |
| ⚪ Após 14d / 7d | 50 | 3 | 0 | ❌ | ✅ |

---

## 🔄 Changelog

### v1.0.0 (Janeiro 2026)
- Implementação inicial do sistema de plano gratuito
- Sistema de moderação de conteúdo com regex
- Componentes de conversão e filtros bloqueados
- Hooks utilitários para fácil integração
