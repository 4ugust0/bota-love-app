# 📱 DOCUMENTAÇÃO DE VALIDAÇÃO DO APLICATIVO MOBILE
## BOTA LOVE APP - Versão 1.0.0

**Data:** Fevereiro 2026  
**Versão:** 1.0.0  
**Contrato:** Cláusulas 12ª e 15ª - Validação Técnica de Entrega  
**Status:** ✅ Completo e Operacional  

---

## 📋 ÍNDICE GERAL

### 1. RESUMO EXECUTIVO
- [1.1 Visão Geral do Aplicativo](#11-visão-geral-do-aplicativo)
- [1.2 Públicos-Alvo](#12-públicos-alvo)
- [1.3 Objetivos Alcançados](#13-objetivos-alcançados)

### 2. ARQUITETURA DO SISTEMA
- [2.1 Mapa da Arquitetura](#21-mapa-da-arquitetura)
- [2.2 Stack Tecnológico](#22-stack-tecnológico)
- [2.3 Fluxo de Dados](#23-fluxo-de-dados)

### 3. FUNCIONALIDADES COMPLETAS
- [3.1 Sistema de Autenticação](#31-sistema-de-autenticação)
- [3.2 Feed de Descoberta](#32-feed-de-descoberta)
- [3.3 Sistema de Matches](#33-sistema-de-matches)
- [3.4 Sistema de Chat](#34-sistema-de-chat)
- [3.5 Network Rural](#35-network-rural)
- [3.6 Sistema de Eventos](#36-sistema-de-eventos)
- [3.7 Sistema de Planos e Assinaturas](#37-sistema-de-planos-e-assinaturas)
- [3.8 Sistema de Pagamentos](#38-sistema-de-pagamentos)
- [3.9 Moderação de Conteúdo](#39-moderação-de-conteúdo)
- [3.10 Notificações Push](#310-notificações-push)

### 4. FIREBASE & BACKEND
- [4.1 Configuração Firebase](#41-configuração-firebase)
- [4.2 Collections Firestore](#42-collections-firestore)
- [4.3 Cloud Functions](#43-cloud-functions)
- [4.4 Regras de Segurança](#44-regras-de-segurança)

### 5. ESTRUTURA TÉCNICA
- [5.1 Estrutura de Pastas](#51-estrutura-de-pastas)
- [5.2 Componentes Principais](#52-componentes-principais)
- [5.3 Serviços e Integrações](#53-serviços-e-integrações)
- [5.4 Contextos de Estado](#54-contextos-de-estado)

### 6. FLUXOS E TELAS
- [6.1 Fluxo de Autenticação](#61-fluxo-de-autenticação)
- [6.2 Fluxo de Onboarding](#62-fluxo-de-onboarding)
- [6.3 Navegação Principal](#63-navegação-principal)
- [6.4 Telas por Módulo](#64-telas-por-módulo)

### 7. ATIVOS E RECURSOS
- [7.1 Assets Visuais](#71-assets-visuais)
- [7.2 Fontes e Tipografia](#72-fontes-e-tipografia)
- [7.3 Paleta de Cores](#73-paleta-de-cores)
- [7.4 Ícones e Componentes](#74-ícones-e-componentes)

### 8. ENDPOINTS & APIs
- [8.1 Cloud Functions REST](#81-cloud-functions-rest)
- [8.2 Firestore Queries](#82-firestore-queries)
- [8.3 Integração Stripe](#83-integração-stripe)
- [8.4 Integração LinkedIn](#84-integração-linkedin)

### 9. DADOS TÉCNICOS
- [9.1 Tipos TypeScript](#91-tipos-typescript)
- [9.2 Modelos de Dados](#92-modelos-de-dados)
- [9.3 Enums e Constantes](#93-enums-e-constantes)

### 10. OPERAÇÃO E DEPLOY
- [10.1 Ambiente de Produção](#101-ambiente-de-produção)
- [10.2 Variáveis de Ambiente](#102-variáveis-de-ambiente)
- [10.3 Monitoramento e Logs](#103-monitoramento-e-logs)

---

## 1. RESUMO EXECUTIVO

### 1.1 Visão Geral do Aplicativo

**BOTA LOVE APP** é um aplicativo mobile de relacionamentos e networking focado exclusivamente no público rural e agro brasileiro. Desenvolvido com React Native (Expo) e Firebase, oferece uma experiência segura, moderada e inclusiva para profissionais do agronegócio.

**Principais Características:**
- ✅ Matches e relacionamentos com algoritmo de descoberta por proximidade
- ✅ Chat em tempo real com moderação de conteúdo automática
- ✅ Network Rural para conexões profissionais e networking
- ✅ Eventos agro (rodeios, feiras, exposições, shows, congressos)
- ✅ Sistema de planos freemium com conversão progressiva
- ✅ Pagamentos via PIX/Stripe integrado
- ✅ Verificação de email e segurança multi-camadas
- ✅ Integrações com LinkedIn para Network Rural
- ✅ Moderação de imagens e conteúdo por IA
- ✅ Notificações push em tempo real

**Idioma:** Português Brasileiro (pt-BR)  
**Plataformas:** iOS e Android (via Expo)  
**Regiões:** Brasil (com foco rural)  

### 1.2 Públicos-Alvo

1. **Usuários Agro** - Produtores, criadores, cooperativas
2. **Simpatizantes** - Profissionais urbanos com interesse no agro
3. **Produtores** - Criadores de eventos e produtores rurais
4. **Network Profissional** - Consultores, veterinários, agrônomos

### 1.3 Objetivos Alcançados

- ✅ Sistema completo de autenticação com verificação de email
- ✅ Feed de descoberta com 50+ filtros avançados
- ✅ Sistema de matches bidirecional com detecção automática
- ✅ Chat unificado com origem múltipla (match, network, correio)
- ✅ Network profissional com LinkedIn OAuth
- ✅ Plataforma de eventos com pagamento de publicação
- ✅ Sistema de planos premium e network com trial
- ✅ Pagamentos PIX integrados ao Stripe
- ✅ Moderação de conteúdo em texto e imagem
- ✅ Notificações push com Firebase Messaging

---

## 2. ARQUITETURA DO SISTEMA

### 2.1 Mapa da Arquitetura

```
┌──────────────────────────────────────────────────────────────┐
│                    BOTA LOVE APP v1.0.0                      │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │           FRONTEND - React Native / Expo             │    │
│  │  • TypeScript 5.9.2                                  │    │
│  │  • Expo Router 6.0.21 (File-based routing)          │    │
│  │  • React 19.1.0                                      │    │
│  │  • Reanimated 4.1.1 (Animações)                      │    │
│  └─────────────────────────────────────────────────────┘    │
│                            ↓↑                                 │
│  ┌─────────────────────────────────────────────────────┐    │
│  │    CONTEXTOS & GERENCIAMENTO DE ESTADO              │    │
│  │  • AuthContext (Autenticação)                        │    │
│  │  • FreePlanContext (Limites)                         │    │
│  │  • SignupContext (Fluxo de cadastro)                 │    │
│  └─────────────────────────────────────────────────────┘    │
│                            ↓↑                                 │
│  ┌─────────────────────────────────────────────────────┐    │
│  │         FIREBASE SDK (v12.7.0)                       │    │
│  │  ┌─────────────────────────────────────────────┐   │    │
│  │  │ • Auth - Autenticação com Email/Password    │   │    │
│  │  │ • Firestore - NoSQL Database                │   │    │
│  │  │ • Storage - Armazenamento de imagens        │   │    │
│  │  │ • Messaging - Push Notifications            │   │    │
│  │  │ • Functions - Serverless backend            │   │    │
│  │  └─────────────────────────────────────────────┘   │    │
│  └─────────────────────────────────────────────────────┘    │
│                            ↓↑                                 │
│  ┌─────────────────────────────────────────────────────┐    │
│  │     CLOUD FUNCTIONS v2 (southamerica-east1)         │    │
│  │  ┌────────────────────────────────────────────┐    │    │
│  │  │ • Autenticação (Email)                     │    │    │
│  │  │ • Notificações (Push/Email)                │    │    │
│  │  │ • Moderação (Texto/Imagem)                 │    │    │
│  │  │ • Pagamentos (Stripe PIX)                  │    │    │
│  │  └────────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────┘    │
│                            ↓↑                                 │
│  ┌─────────────────────────────────────────────────────┐    │
│  │        INTEGRAÇÕES EXTERNAS                         │    │
│  │  • Stripe (Pagamentos PIX)                          │    │
│  │  • LinkedIn OAuth (Network)                         │    │
│  │  • SendGrid (Email)                                 │    │
│  │  • Google Vision AI (Moderação)                     │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### 2.2 Stack Tecnológico

#### Frontend
| Tecnologia | Versão | Função |
|------------|--------|--------|
| **Expo** | ~54.0.31 | Framework React Native |
| **React** | 19.1.0 | Biblioteca UI |
| **React Native** | 0.81.5 | Framework mobile nativo |
| **TypeScript** | ~5.9.2 | Linguagem tipada |
| **Expo Router** | ~6.0.21 | Navegação file-based |
| **Reanimated** | ~4.1.1 | Animações performáticas |
| **AsyncStorage** | 2.2.0 | Persistência local |

#### Backend (Firebase)
| Serviço | Versão | Função |
|---------|--------|--------|
| **Firebase SDK** | ^12.7.0 | SDK JavaScript |
| **Auth** | - | Autenticação E-mail/Senha |
| **Firestore** | - | Banco de dados NoSQL |
| **Storage** | - | Armazenamento de imagens |
| **Functions** | v2 | Serverless backend |
| **Messaging** | - | Push notifications |
| **Analytics** | - | Eventos de usuário |

#### Integrações
| Serviço | Função |
|---------|--------|
| **Stripe** | Pagamentos PIX via API REST |
| **LinkedIn OAuth** | Autenticação de networking |
| **Google Vision AI** | Moderação de imagens |
| **SendGrid** | Emails transacionais |

### 2.3 Fluxo de Dados

```
Usuário (App) 
    ↓
  [Contexts - Estado Global]
    ↓
  [Firebase SDK]
    ├─→ Auth (autenticação)
    ├─→ Firestore (queries/writes)
    ├─→ Storage (imagens)
    └─→ Functions (triggers)
    ↓
  [Cloud Functions]
    ├─→ Email Service
    ├─→ Notification Service
    ├─→ Moderation Service
    └─→ Payment Service
    ↓
  [Integrações Externas]
    ├─→ Stripe (PIX)
    ├─→ LinkedIn (OAuth)
    └─→ Google Vision (IA)
```

---

## 3. FUNCIONALIDADES COMPLETAS

### 3.1 Sistema de Autenticação

**Finalidade:** Criar contas seguras e verificadas para todos os usuários da plataforma.

**Funcionamento:**

```
1. CADASTRO
   └─ Usuário insere: Email, Nome, Senha
   └─ Sistema verifica email já registrado
   └─ Envia código de verificação por email (via Cloud Function)
   └─ Usuário confirma código na app

2. LOGIN
   └─ Usuário insere: Email, Senha
   └─ Firebase Auth valida credenciais
   └─ Token JWT retornado
   └─ App carrega perfil do Firestore

3. VERIFICAÇÃO DE EMAIL
   └─ Código enviado via SendGrid
   └─ Usuário digita 6 dígitos na app
   └─ Cloud Function valida código
   └─ Email marcado como verificado

4. RECUPERAÇÃO DE SENHA
   └─ Usuário clica "Esqueci a senha"
   └─ Insere email registrado
   └─ Firebase envia link de reset
   └─ Usuário cria nova senha
```

**Integrações:**
- Firebase Auth (autenticação)
- Firestore (dados de usuário)
- Cloud Functions (email)
- SendGrid (envio de emails)

**Arquivos Relacionados:**
- [app/signup.tsx](app/signup.tsx) - Fluxo de cadastro
- [app/login.tsx](app/login.tsx) - Login
- [app/forgot-password.tsx](app/forgot-password.tsx) - Recuperação
- [firebase/authService.ts](firebase/authService.ts) - Serviço
- [functions/src/auth/](functions/src/auth/) - Cloud Functions

---

### 3.2 Feed de Descoberta

**Finalidade:** Apresentar perfis compatíveis através de filtros avançados e cálculo de proximidade.

**Funcionamento:**

```
ETAPA 1: COLETA DE FILTROS
└─ Preferência de idade (18-80 anos)
└─ Raio de distância (5-5000 km)
└─ Gênero (masculino, feminino, ambos)
└─ Filtros avançados (profissão, animais, plantações, etc)

ETAPA 2: CÁLCULO DE DISTÂNCIA
└─ Localização do usuário (GPS)
└─ Coordenadas de cada perfil
└─ Fórmula de Haversine (terra esférica)
└─ Ordena por proximidade

ETAPA 3: EXCLUSÕES
└─ Usuários já vistos
└─ Já curtidos (like/pass)
└─ Bloqueados
└─ Perfis deletados

ETAPA 4: APRESENTAÇÃO
└─ Card com foto, nome, idade, distância
└─ Bio resumida (primeiras linhas)
└─ Ações: Like, Super Like, Pass
```

**Filtros Disponíveis:**

| Categoria | Opções |
|-----------|--------|
| **Localização** | Estado, Cidade, Raio (km) |
| **Idade** | Mín-Máx (18-80) |
| **Gênero** | Masculino, Feminino, Ambos |
| **Profissão** | 50+ opções agro |
| **Propriedade** | Tamanho (pequena, média, grande) |
| **Animais** | Gado, suínos, aves, etc |
| **Plantações** | Milho, soja, cana, café, etc |
| **Atividades** | Rodeio, vaquejada, etc |
| **Hobbies** | Música, leitura, games, etc |
| **Verificação** | Apenas verificados |
| **Fotos** | Apenas com fotos |

**Integrações:**
- Firestore (queries de usuários)
- Geo-localização (GPS)
- Discovery Service

**Arquivos Relacionados:**
- [app/(tabs)/index.tsx](app/(tabs)/index.tsx) - Tela feed
- [firebase/discoveryService.ts](firebase/discoveryService.ts) - Serviço
- [hooks/useDiscoveryFeed.ts](hooks/useDiscoveryFeed.ts) - Hook
- [constants/index.ts](constants/index.ts) - Opções de filtros

---

### 3.3 Sistema de Matches

**Finalidade:** Criar conexões bidirecionalas quando dois usuários se curtem mutuamente.

**Funcionamento:**

```
ETAPA 1: DAR LIKE
└─ Usuário A clica ❤️ em Usuário B
└─ Sistema valida: não já deu like
└─ Cria documento em collection "likes"
└─ Verifica se B também deu like em A

ETAPA 2: DETECÇÃO DE MATCH
└─ Se B deu like em A:
    ├─ Cria documento em "matches"
    ├─ Cria chat entre A e B
    ├─ Animação de match
    ├─ Envia notificação: "Novo match!"
    └─ Ambos veem conversação aberta

ETAPA 3: SUPER LIKE
└─ Versão premium do like
└─ Custa recurso (superLikes)
└─ Prioridade na descoberta
└─ Notificação especial

ETAPA 4: PASS (REJEIÇÃO)
└─ Usuário clica ✕ em perfil
└─ Sistema registra em collection "passes"
└─ Usuário não aparece por X dias
└─ Após X dias pode aparecer novamente

ETAPA 5: DESFAZER MATCH
└─ Um dos usuários clica "desmanchar"
└─ Match marcado como inativo
└─ Chat permanece (histórico)
└─ Pode recriar match depois
```

**Estrutura de Dados:**

```typescript
// Like
{
  id: "userA_userB"
  fromUserId: "userA"
  toUserId: "userB"
  isSuperLike: true
  createdAt: 2026-02-01T10:30:00Z
  seen: false
  matchCreated: true
  matchId: "match_abc123"
}

// Match
{
  id: "match_abc123"
  users: ["userA", "userB"]
  createdAt: 2026-02-01T10:30:00Z
  lastMessageAt: null
  chatId: "chat_abc123"
  isActive: true
}
```

**Integrações:**
- Firestore (documents)
- Chat Service (criar chat)
- Notification Service
- Transaction (atomicidade)

**Arquivos Relacionados:**
- [firebase/matchService.ts](firebase/matchService.ts) - Serviço
- [components/MatchAnimation.tsx](components/MatchAnimation.tsx) - Animação

---

### 3.4 Sistema de Chat

**Finalidade:** Comunicação em tempo real entre usuários com moderação de conteúdo.

**Funcionamento:**

```
CHAT UNIFICADO
├─ Origin: 'match' (relacionamento)
├─ Origin: 'network' (networking profissional)
├─ Origin: 'correio_da_roca' (mensagem especial)
└─ Origin: 'misterio_do_campo' (anônima)

ETAPA 1: CRIAR CHAT
└─ Sistema cria automaticamente quando:
    ├─ Novo match é criado
    ├─ Conexão network é aceita
    └─ Mensagem anônima é revelada

ETAPA 2: ENVIAR MENSAGEM
└─ Usuário escreve mensagem
└─ Sistema valida (tamanho, caracteres)
└─ Modera conteúdo (regex + IA)
└─ Envia notificação ao outro usuário
└─ Salva em subcollection "messages"

ETAPA 3: MODERAÇÃO
└─ Regex patterns (palavrões, spammers)
└─ IA (Google Vision para imagens)
└─ Score de moderação (0-100)
└─ Se bloqueado: não salva, aviso ao usuário

ETAPA 4: LEITURA
└─ Mensagens marcadas como read
└─ Contador de não lidas
└─ Sincronização em tempo real

ETAPA 5: INATIVIDADE
└─ Chat sem mensagens há 7 dias
└─ Sistema envia lembrete automático
└─ Email + notificação push
└─ Máx 3 lembretes
```

**Tipos de Mensagem:**
- `text` - Texto puro
- `image` - Imagem (com moderação)
- `audio` - Áudio (futuro)
- `system` - Mensagem do sistema
- `misterio` - Anônima com revelação

**Integrações:**
- Firestore (chats e messages)
- Firebase Realtime (real-time listeners)
- Moderação Service (texto + imagem)
- Notification Service

**Arquivos Relacionados:**
- [app/chat/[id].tsx](app/chat/[id].tsx) - Tela de chat
- [firebase/chatService.ts](firebase/chatService.ts) - Serviço
- [hooks/useChat.ts](hooks/useChat.ts) - Hook
- [services/advancedModerationService.ts](services/advancedModerationService.ts)

---

### 3.5 Network Rural

**Finalidade:** Networking profissional entre profissionais do agronegócio com integração LinkedIn.

**Funcionamento:**

```
ETAPA 1: ATIVAR NETWORK
└─ Usuário ativa Network Rural na onboarding
└─ Escolhe: Interesse profissional, goals, buscando
└─ Pode conectar LinkedIn (opcional)

ETAPA 2: DESCOBERTA
└─ Feed de perfis Network diferentes
└─ Filtros: profissão, área agro, localização
└─ LinkedIn badge se verificado

ETAPA 3: CONEXÃO
└─ Tipos: Profissional, Negócio, Mentoria
└─ Cria solicitação com mensagem
└─ Outro usuário aceita/rejeita
└─ Se aceito: chat criado automaticamente

ETAPA 4: CHAT DEDICADO
└─ Chat com origem 'network'
└─ Mensagens profissionais
└─ Sem gamificação (sem like/super like)
└─ Histórico completo

ETAPA 5: ASSINATURA
└─ Plano separado de premium
└─ Mensal ou Lifetime
└─ Trial 7 dias
└─ Acesso a filtros avançados + LinkedIn
```

**Integração LinkedIn OAuth:**

```
1. User clica "Conectar LinkedIn"
2. Redireciona para OAuth LinkedIn
3. Usuário autoriza acesso
4. Retorna para app com token
5. Sistema obtém dados:
   - Nome e foto
   - Posição atual
   - Empresa
   - Indústria
   - Resumo (summary)
6. Marca perfil como verificado
7. Badge "LinkedIn Verificado"
```

**Integrações:**
- Firestore (network_connections)
- Chat Service (criar chat)
- LinkedIn OAuth 2.0
- Subscription Service

**Arquivos Relacionados:**
- [app/(tabs)/network-rural.tsx](app/(tabs)/network-rural.tsx) - Tela
- [firebase/networkRuralFirebaseService.ts](firebase/networkRuralFirebaseService.ts)
- [firebase/linkedinService.ts](firebase/linkedinService.ts)

---

### 3.6 Sistema de Eventos

**Finalidade:** Plataforma para criadores publicarem eventos agro (rodeios, feiras, shows).

**Funcionamento:**

```
PRODUTOR (Criador de evento)
  ↓
ETAPA 1: CRIAR EVENTO
└─ Tipo: Rodeio, Exposição, Balada, Encontro, Feira, Leilão, Show, Congresso
└─ Dados: Título, descrição, data, local, capacidade
└─ Upload foto de capa
└─ Link externo (site/ingresso)

ETAPA 2: PUBLICAR
└─ Duração: 15, 30, 60 ou 90 dias
└─ Highlight (destaque): opcional
└─ Priceplan: $valor pela duração
└─ Sistema cria pagamento

ETAPA 3: PAGAMENTO
└─ PIX via Stripe
└─ User escaneia QR code
└─ Sistema verifica em webhook
└─ Se aprovado: evento ativo

ETAPA 4: EVENTO ATIVO
└─ Aparece no feed "Eventos"
└─ Usuários clicam "Interessado" ou "Confirmando presença"
└─ Contador de visualizações
└─ Produtor vê métricas

────────────────────

USUÁRIO (Descobrir evento)
  ↓
ETAPA 1: NAVEGAR
└─ Aba "Eventos" mostra todos ativos
└─ Filtro por tipo, localização, data

ETAPA 2: VISUALIZAR
└─ Tela de detalhe com todas informações
└─ Localização no mapa
└─ Confirmação de interesse

ETAPA 3: COMPARTILHAR
└─ Compartilhar evento com matches
└─ Convidar para evento
```

**Tipos de Evento:**
- Rodeio
- Exposição/Feira
- Balada
- Encontro
- Leilão
- Show
- Congresso

**Integrações:**
- Firestore (events collection)
- Storage (imagens de capa)
- Stripe (pagamento)
- Notification Service

**Arquivos Relacionados:**
- [app/(tabs)/events.tsx](app/(tabs)/events.tsx) - Feed de eventos
- [app/(tabs)/create-event.tsx](app/(tabs)/create-event.tsx) - Criar evento
- [app/(tabs)/event-history.tsx](app/(tabs)/event-history.tsx) - Histórico
- [firebase/eventService.ts](firebase/eventService.ts)

---

### 3.7 Sistema de Planos e Assinaturas

**Finalidade:** Modelo freemium com conversão progressiva de usuários gratuitos para premium.

**PLANO GRATUITO - Limites Progressivos:**

| Período | Views/dia | Likes/dia | Msg por Match | Visibilidade |
|---------|-----------|-----------|---------------|--------------|
| **Dia 1** | ∞ | ∞ | 2 | Básica |
| **Dias 2-7** | 120 | 25 | 1 | Básica |
| **Dias 8-10** | 50 | 25 | 1 | Básica |
| **Dias 11-14** | 20 | 15 | 0 | Restrita |
| **Após 1º mês** | 10 | 10 | 0 | Restrita |
| **2º+ mês** | 5 | 5 | 0 | Restrita |

**Visibilidade de Perfil (Free vs Premium):**

| Campo | Free | Premium |
|-------|------|---------|
| Nome | ✅ | ✅ |
| Idade | ✅ | ✅ |
| Distância | ✅ | ✅ |
| Foto principal | ✅ | ✅ |
| Bio completa | ❌ | ✅ |
| Profissão | ❌ | ✅ |
| Interesses | ❌ | ✅ |
| Fotos extras | ❌ | ✅ (ilimitadas) |
| Filtros avançados | ❌ | ✅ |

**PLANO PREMIUM:**
- Mensalidade: R$ 49,90
- Trimestral: R$ 119,70 (10% off)
- Anual: R$ 399,60 (33% off)
- Trial: 7 dias grátis
- Auto-renovação ativada por padrão

**NETWORK RURAL:**
- Mensal: R$ 39,90
- Lifetime: R$ 299,00
- Trial: 7 dias grátis
- Acesso LinkedIn + Filtros Network

**Funcionalidades Premium:**
- ✅ Ilimitado de views
- ✅ Ilimitado de likes
- ✅ Super likes diários (5x)
- ✅ Boosts (destaque do perfil)
- ✅ Mensagens ilimitadas
- ✅ Desmanchar matches invisível
- ✅ Filtros avançados
- ✅ Ver perfis que gostaram
- ✅ Prioridade na descoberta

**Integrações:**
- Firebase (subscriptions collection)
- Stripe (pagamento)
- Cloud Functions (verificação de acesso)

**Arquivos Relacionados:**
- [app/plans.tsx](app/plans.tsx) - Tela de planos
- [firebase/subscriptionService.ts](firebase/subscriptionService.ts)
- [data/freePlanService.ts](data/freePlanService.ts)
- [contexts/FreePlanContext.tsx](contexts/FreePlanContext.tsx)

---

### 3.8 Sistema de Pagamentos

**Finalidade:** Processar pagamentos de assinaturas premium e eventos via PIX.

**Funcionamento:**

```
TIPOS DE PAGAMENTO
├─ Premium Monthly/Quarterly/Annual
├─ Network Rural Monthly/Lifetime
├─ Eventos (publicação)
└─ Items da Loja (Super Likes, Boosts)

FLUXO PIX
1. Usuário vai ao checkout
2. Seleciona plano/produto
3. Sistema calcula valor
4. Cloud Function cria Payment Intent no Stripe
5. Stripe retorna PIX code + QR code
6. App exibe para scanning
7. Usuário escaneia com app do banco
8. Realiza pagamento PIX
9. Stripe webhook notifica sistema
10. Assinatura ativada automaticamente
11. Notificação ao usuário

VERIFICAÇÃO
└─ Webhook do Stripe
└─ Valida assinatura
└─ Atualiza Firebase
└─ Envia email de confirmação
```

**Status de Pagamento:**
- `pending` - Aguardando PIX
- `processing` - Processando
- `succeeded` - Concluído
- `failed` - Falhou
- `expired` - PIX expirou
- `canceled` - Cancelado pelo usuário

**Integrações:**
- Stripe API v2025
- Cloud Functions (processamento)
- Firestore (auditoria)
- SendGrid (confirmação por email)

**Arquivos Relacionados:**
- [firebase/stripeService.ts](firebase/stripeService.ts)
- [app/premium-checkout.tsx](app/premium-checkout.tsx)
- [functions/src/stripe/](functions/src/stripe/)

---

### 3.9 Moderação de Conteúdo

**Finalidade:** Garantir ambiente seguro através de moderação automática de texto e imagens.

**Funcionamento:**

```
MODERAÇÃO DE TEXTO
├─ REGEX Patterns:
│  ├─ Palavrões (dicionário de 100+ termos)
│  ├─ Links suspeitos
│  ├─ Emails/telefones (spam)
│  ├─ Spam repetido
│  └─ Caracteres inválidos
│
├─ Pontuação: 0-100
│  ├─ 0-30: Permitido
│  ├─ 30-70: Sanitizado (remove palavrão)
│  └─ 70+: Bloqueado

MODERAÇÃO DE IMAGEM
├─ Google Vision AI:
│  ├─ Detecta nudez/conteúdo sexual (SAFE_SEARCH)
│  ├─ Detecta violência
│  ├─ Detecta conteúdo adulto
│  └─ Retorna score (LIKELY, VERY_LIKELY)
│
├─ Aceita: POSSIBLE, UNLIKELY, VERY_UNLIKELY
└─ Rejeita: LIKELY, VERY_LIKELY

AÇÃO NA REJEIÇÃO
├─ Texto: Mensagem não entregue + aviso
├─ Imagem: Bloqueada + sugestão de reupload
└─ Múltiplas: Aviso de suspensão

REGISTRO
└─ Log de todas tentativas
└─ Score de moderação
└─ Ação tomada
└─ Admins podem revisar
```

**Integrações:**
- Google Vision AI (imagens)
- Cloud Functions (processamento)
- Firestore (logs)

**Arquivos Relacionados:**
- [services/advancedModerationService.ts](services/advancedModerationService.ts)
- [functions/src/moderation/](functions/src/moderation/)

---

### 3.10 Notificações Push

**Finalidade:** Engajar usuários com eventos relevantes em tempo real.

**Tipos de Notificação:**

| Tipo | Exemplo | Frequência |
|------|---------|-----------|
| **Match** | "Novo match com João!" | Imediato |
| **Like** | "Maria curtiu você! 💕" | Imediato |
| **Super Like** | "Você recebeu Super Like!" | Imediato |
| **Message** | "Nova mensagem de João" | Imediato |
| **Trial Expiring** | "Seu trial expira em 1 dia" | 1x por dia |
| **Subscription Expired** | "Seu premium expirou" | 1x dia após expiração |
| **Chat Inativo** | "João está sentindo sua falta!" | 3x total, a cada 7 dias |
| **Event Alert** | "Novo evento perto de você!" | 1x por dia (máx) |
| **System** | Manutenção programada | Conforme necessário |

**Funcionamento:**

```
1. EVENTO NO APP (match, like, mensagem)
   └─ Cloud Function triggered

2. CLOUD FUNCTION
   ├─ Obtém FCM tokens do usuário
   ├─ Verifica notificationSettings
   ├─ Cria payload de notificação
   └─ Envia via Firebase Messaging

3. FIREBASE MESSAGING
   ├─ Identifica dispositivo
   ├─ Entrega notificação push
   └─ Criptografa dados sensíveis

4. DEVICE
   ├─ Recebe notificação
   ├─ Exibe na bandeja
   ├─ Usuário clica
   └─ App abre screen relevante

5. ANALYTICS
   └─ Registra: impressão, clique, ação
```

**Configurações do Usuário:**
- ✅ Notificações push (geral)
- ✅ Matches
- ✅ Likes
- ✅ Super Likes
- ✅ Mensagens
- ✅ Marketing
- ✅ Email vs Push

**Integrações:**
- Firebase Messaging
- Cloud Functions (triggers)
- Expo Notifications
- Analytics

**Arquivos Relacionados:**
- [firebase/notificationService.ts](firebase/notificationService.ts)
- [functions/src/notifications/](functions/src/notifications/)

---

## 4. FIREBASE & BACKEND

### 4.1 Configuração Firebase

**Projeto:** `botalove-app`  
**Região:** `southamerica-east1` (Brasil)  
**Ambiente:** Produção com backup diário

**Serviços Ativados:**
- ✅ Firebase Authentication
- ✅ Cloud Firestore
- ✅ Cloud Storage
- ✅ Cloud Functions
- ✅ Cloud Messaging
- ✅ Analytics
- ✅ Hosting (opcional)

**Arquivo de Configuração:**

```typescript
// firebase/config.ts
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};
```

### 4.2 Collections Firestore

**Estrutura Completa:**

```
firestore/
├── users/                      [13 campos]
│   ├── id (string)
│   ├── email (string)
│   ├── emailVerified (boolean)
│   ├── profile (object)
│   ├── subscription (object)
│   ├── networkRural (object)
│   ├── discoverySettings (object)
│   ├── notificationSettings (object)
│   ├── status (enum)
│   ├── fcmTokens (array)
│   ├── inventory (object)
│   ├── boostStatus (object)
│   ├── createdAt (timestamp)
│   ├── updatedAt (timestamp)
│   └── lastActive (timestamp)
│
├── likes/                      [7 campos]
│   ├── fromUserId (string)
│   ├── toUserId (string)
│   ├── isSuperLike (boolean)
│   ├── createdAt (timestamp)
│   ├── seen (boolean)
│   ├── matchCreated (boolean)
│   └── matchId (string)
│
├── matches/                    [6 campos]
│   ├── users (array<string>)
│   ├── createdAt (timestamp)
│   ├── lastMessageAt (timestamp)
│   ├── chatId (string)
│   ├── isActive (boolean)
│   └── unmatchedAt (timestamp)
│
├── chats/                      [9 campos]
│   ├── participants (array<string>)
│   ├── origin (enum: match|network|correio|misterio)
│   ├── matchId (string)
│   ├── networkConnectionId (string)
│   ├── lastMessage (object)
│   ├── messageCount (number)
│   ├── isActive (boolean)
│   ├── inactivityReminders (number)
│   └── createdAt/updatedAt (timestamp)
│   │
│   └── messages/ (subcollection)   [10 campos]
│       ├── senderId (string)
│       ├── text (string)
│       ├── type (enum)
│       ├── status (enum)
│       ├── moderated (boolean)
│       ├── originalText (string)
│       ├── moderationScore (number)
│       ├── misterio (object)
│       ├── metadata (object)
│       └── createdAt (timestamp)
│
├── passes/                     [4 campos]
│   ├── fromUserId (string)
│   ├── toUserId (string)
│   ├── createdAt (timestamp)
│   └── expiresAt (timestamp)
│
├── network_connections/        [6 campos]
│   ├── users (array<string>)
│   ├── connectionType (enum)
│   ├── chatId (string)
│   ├── isActive (boolean)
│   └── createdAt/updatedAt (timestamp)
│
├── notifications/              [8 campos]
│   ├── userId (string)
│   ├── type (enum)
│   ├── title (string)
│   ├── body (string)
│   ├── data (object)
│   ├── read (boolean)
│   ├── pushSent (boolean)
│   └── createdAt (timestamp)
│
├── events/                     [17 campos]
│   ├── creatorId (string)
│   ├── title (string)
│   ├── description (string)
│   ├── type (enum)
│   ├── eventDate (timestamp)
│   ├── venueName (string)
│   ├── city (string)
│   ├── state (string)
│   ├── capacity (number)
│   ├── durationDays (number)
│   ├── isHighlighted (boolean)
│   ├── views (number)
│   ├── attendees (number)
│   ├── interested (number)
│   ├── status (enum)
│   ├── createdAt (timestamp)
│   └── expiresAt (timestamp)
│
├── payments/                   [15 campos]
│   ├── userId (string)
│   ├── amount (number)
│   ├── currency (string)
│   ├── productId (string)
│   ├── productType (enum)
│   ├── plan (enum)
│   ├── status (enum)
│   ├── provider (enum)
│   ├── externalTransactionId (string)
│   ├── stripePaymentIntentId (string)
│   ├── createdAt (timestamp)
│   ├── completedAt (timestamp)
│   ├── isSimulated (boolean)
│   └── metadata (object)
│
├── subscriptions/              [8 campos]
│   ├── userId (string)
│   ├── plan (enum)
│   ├── status (enum)
│   ├── startDate (timestamp)
│   ├── endDate (timestamp)
│   ├── trialEndDate (timestamp)
│   ├── autoRenew (boolean)
│   └── createdAt (timestamp)
│
├── correio_da_roca/            [6 campos]
│   ├── fromUserId (string)
│   ├── toUserId (string)
│   ├── message (string)
│   ├── status (enum)
│   ├── chatId (string)
│   └── createdAt (timestamp)
│
├── email_verifications/        [6 campos]
│   ├── userId (string)
│   ├── email (string)
│   ├── code (string)
│   ├── expiresAt (timestamp)
│   ├── verified (boolean)
│   └── attempts (number)
│
└── users_admin/                [3 campos]
    ├── email (string)
    ├── role (enum)
    └── status (enum)
```

**Índices Criados:**

```javascript
// firestore.indexes.json
[
  {
    "collectionGroup": "users",
    "queryScope": "Collection",
    "fields": [
      { "fieldPath": "status", "order": "ASCENDING" },
      { "fieldPath": "createdAt", "order": "DESCENDING" }
    ]
  },
  {
    "collectionGroup": "chats",
    "queryScope": "Collection",
    "fields": [
      { "fieldPath": "participants", "arrayConfig": "CONTAINS" },
      { "fieldPath": "updatedAt", "order": "DESCENDING" }
    ]
  },
  // ... 10 índices adicionais
]
```

### 4.3 Cloud Functions

**Todas as funções estão na região: `southamerica-east1` (Brasil)**

**Autenticação (7 funções):**
| Função | Trigger | Descrição |
|--------|---------|-----------|
| `sendVerificationEmail` | HTTPS | Envia email de verificação |
| `verifyEmailCode` | HTTPS | Valida código inserido |
| `resendVerificationCode` | HTTPS | Reenvia código |
| `sendPasswordResetCode` | HTTPS | Email para reset de senha |
| `verifyPasswordResetCode` | HTTPS | Valida código de reset |
| `resetPassword` | HTTPS | Reseta a senha |
| `sendWelcomeEmail` | HTTPS | Email de boas-vindas |

**Notificações (3 funções):**
| Função | Trigger | Descrição |
|--------|---------|-----------|
| `sendMatchNotification` | Firestore | Match novo |
| `sendLikeNotification` | Firestore | Like recebido |
| `sendMessageNotification` | Firestore | Mensagem nova |

**Moderação (1 função):**
| Função | Trigger | Descrição |
|--------|---------|-----------|
| `moderateMessage` | HTTPS | Modera texto/imagem |

**Pagamentos Stripe (5 funções):**
| Função | Trigger | Descrição |
|--------|---------|-----------|
| `createPixPayment` | HTTPS | Cria PIX via Stripe |
| `getPixPaymentStatus` | HTTPS | Obtém status |
| `cancelPixPayment` | HTTPS | Cancela PIX |
| `getPaymentHistory` | HTTPS | Histórico pagamentos |
| `stripeWebhook` | HTTPS | Webhook de confirmação |

**Usuário (1 função):**
| Função | Trigger | Descrição |
|--------|---------|-----------|
| `onUserLogin` | Auth | Registra login |

### 4.4 Regras de Segurança Firestore

```plaintext
Arquivo: firestore.rules (435 linhas)

ESTRUTURA GERAL:
├─ users_admin/        → Apenas admins
├─ users/              → Próprio ou admin
├─ likes/              → Envolvidos
├─ matches/            → Participantes
├─ chats/              → Participantes
│  └─ messages/        → Participantes
├─ passes/             → Envolvidos
├─ network_connections/→ Envolvidos
├─ notifications/      → Destinatário
├─ payments/           → Dono ou admin
├─ subscriptions/      → Dono
├─ events/             → Criador ou leitura pública
├─ email_verifications/→ Admin SDK apenas
└─ recovery_codes/     → Admin SDK apenas
```

---

## 5. ESTRUTURA TÉCNICA

### 5.1 Estrutura de Pastas

```
bota-love-app/
├── 📱 app/                          # Telas (File-based routing Expo)
│   ├── _layout.tsx                  # Layout raiz
│   ├── index.tsx                    # Tela inicial/onboarding
│   ├── login.tsx                    # Login
│   ├── signup.tsx                   # Cadastro
│   ├── signup-*.tsx                 # Fluxo de cadastro (8 telas)
│   ├── onboarding*.tsx              # Fluxo onboarding (8 telas)
│   ├── forgot-password.tsx          # Recuperação de senha
│   ├── (tabs)/                      # Navigator com tabs
│   │   ├── _layout.tsx              # Layout das tabs
│   │   ├── index.tsx                # Feed de descoberta
│   │   ├── matches.tsx              # Lista de matches
│   │   ├── chat.tsx                 # Lista de chats
│   │   ├── events.tsx               # Feed de eventos
│   │   ├── network-rural.tsx        # Network profissional
│   │   ├── profile.tsx              # Perfil do usuário
│   │   ├── store.tsx                # Loja de items
│   │   ├── create-event.tsx         # Criar evento
│   │   └── event-history.tsx        # Histórico de eventos
│   ├── chat/
│   │   └── [id].tsx                 # Chat individual (dinâmico)
│   ├── profile-detail/
│   │   └── [id].tsx                 # Perfil detalhado (dinâmico)
│   ├── modal.tsx                    # Modal compartilhado
│   ├── plans.tsx                    # Tela de planos
│   ├── premium-checkout.tsx         # Checkout premium
│   ├── premium-thank-you.tsx        # Agradecimento
│   ├── settings.tsx                 # Configurações
│   ├── notifications.tsx            # Centro de notificações
│   ├── help.tsx                     # Ajuda/FAQ
│   ├── terms.tsx                    # Termos de serviço
│   ├── advanced-filters.tsx         # Filtros avançados
│   ├── agrolove-preferences.tsx    # Preferências Agro
│   ├── edit-profile.tsx             # Editar perfil
│   ├── discovery-settings.tsx       # Configurações de descoberta
│   ├── event-location.tsx           # Localização do evento
│   ├── linkedin-connect.tsx         # Conexão LinkedIn
│   ├── publish-event.tsx            # Publicar evento
│   └── store.tsx                    # Loja
│
├── 🧩 components/                   # Componentes reutilizáveis
│   ├── CompleteProfileModal.tsx     # Modal: completar perfil
│   ├── ConversationReminderCard.tsx # Card: lembrete inatividade
│   ├── ConversionModal.tsx          # Modal: conversão para premium
│   ├── MatchAnimation.tsx           # Animação: novo match
│   ├── SuperLikeAnimation.tsx       # Animação: super like
│   ├── PremiumModal.tsx             # Modal: features premium
│   ├── ProfileGuard.tsx             # Guard: perfil completo
│   ├── RestrictedProfile.tsx        # Visibilidade restrita
│   ├── NetworkBadge.tsx             # Badge: LinkedIn verificado
│   ├── LocationInitializer.tsx      # Inicializador de localização
│   ├── LockedFilter.tsx             # Filter: bloqueado premium
│   ├── external-link.tsx            # Link externo
│   ├── haptic-tab.tsx               # Tab com feedback háptico
│   ├── hello-wave.tsx               # Wave animation
│   ├── parallax-scroll-view.tsx     # Scroll com parallax
│   ├── themed-text.tsx              # Texto com tema
│   ├── themed-view.tsx              # View com tema
│   ├── ui/                          # Componentes UI base
│   │   ├── bota-button.tsx
│   │   ├── bota-input.tsx
│   │   ├── collapsible.tsx
│   │   └── ... (5+ componentes)
│   └── rural-icons/                 # Ícones rurais
│       ├── animals/
│       ├── crops/
│       ├── activities/
│       └── ... (20+ ícones)
│
├── ⚙️ constants/                     # Constantes globais
│   ├── index.ts                     # Constantes gerais
│   ├── theme.ts                     # Cores e tema
│   └── typography.ts                # Sistema tipográfico
│
├── 🔄 contexts/                     # Contextos React
│   ├── AuthContext.tsx              # Autenticação (880 linhas)
│   ├── FreePlanContext.tsx          # Plano gratuito (330 linhas)
│   └── SignupContext.tsx            # Cadastro
│
├── 📊 data/                         # Serviços de dados
│   ├── contentModerationService.ts # Moderação de conteúdo
│   ├── conversationService.ts      # Conversas
│   ├── extendedUserData.ts         # Dados estendidos
│   ├── freePlanService.ts          # Lógica plano gratuito (611 linhas)
│   ├── mockData.ts                 # Dados mockados
│   ├── networkRuralService.ts      # Network rural
│   ├── tabsAndFiltersService.ts    # Tabs e filtros
│   └── viewLimitsService.ts        # Limites de view
│
├── 📚 docs/                         # Documentação
│   ├── TECHNICAL_DOCUMENTATION.md
│   ├── FIREBASE_SETUP.md
│   ├── FREE_PLAN.md
│   ├── MATCH_MODULE.md
│   ├── NETWORK_RURAL.md
│   ├── IMAGE_MODERATION.md
│   └── ... (5+ documentos)
│
├── 🔥 firebase/                     # Firebase Services (20 arquivos)
│   ├── config.ts                    # Configuração
│   ├── types.ts                     # Tipos TypeScript (521 linhas)
│   ├── authService.ts              # Autenticação (580 linhas)
│   ├── chatService.ts              # Chat (810 linhas)
│   ├── discoveryService.ts         # Descoberta (449 linhas)
│   ├── eventService.ts             # Eventos (578 linhas)
│   ├── firestoreService.ts         # Firestore geral
│   ├── linkedinService.ts          # LinkedIn OAuth
│   ├── loginCheckService.ts        # Verificação login
│   ├── matchService.ts             # Matches (779 linhas)
│   ├── networkRuralFirebaseService.ts # Network (355 linhas)
│   ├── notificationService.ts      # Notificações
│   ├── planSubscriptionService.ts  # Planos
│   ├── plansService.ts             # Detalhes planos
│   ├── storageService.ts           # Storage de imagens
│   ├── storeItemsService.ts        # Items da loja
│   ├── stripeService.ts            # Stripe PIX (278 linhas)
│   ├── subscriptionService.ts      # Assinaturas
│   ├── agroloveService.ts          # Serviço agro geral
│   └── index.ts                    # Exportações
│
├── ⚡ functions/                    # Cloud Functions
│   ├── .firebaserc
│   ├── firebase.json
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts                # Entry point (60 linhas)
│       ├── auth/                   # Autenticação (7 arquivos)
│       ├── notifications/          # Notificações (3 arquivos)
│       ├── moderation/             # Moderação (1 arquivo)
│       ├── stripe/                 # Pagamentos (571 linhas)
│       ├── user/                   # Usuário (1 arquivo)
│       ├── templates/              # Templates de email
│       └── utils/                  # Utilitários
│
├── 🪝 hooks/                        # Hooks customizados
│   ├── useChat.ts
│   ├── useColorScheme.ts
│   ├── useColorScheme.web.ts
│   ├── useDiscoveryFeed.ts
│   ├── useFreePlanLimits.ts
│   ├── useLocationPermission.ts
│   └── useThemeColor.ts
│
├── 🛠️ services/                     # Serviços auxiliares
│   ├── advancedModerationService.ts # Moderação avançada
│   ├── bioValidationService.ts      # Validação bio
│   ├── emailService.ts              # Email
│   ├── imageModeration.ts           # Moderação imagem
│   ├── locationService.ts           # Localização
│   └── ... (5+ serviços)
│
├── 📱 assets/                       # Assets estáticos
│   ├── fonts/
│   │   ├── Montserrat-Regular.ttf
│   │   ├── PlayfairDisplay-Bold.ttf
│   │   └── ... (6+ fontes)
│   └── images/
│       ├── icon.png
│       ├── splash-icon.png
│       ├── android-icon-*.png
│       └── ... (20+ imagens)
│
├── 📋 App Config Files
│   ├── app.json                    # Config Expo
│   ├── package.json               # Dependências
│   ├── tsconfig.json             # TypeScript
│   ├── eslint.config.js          # ESLint
│   ├── firebase.json             # Firebase config
│   ├── firestore.rules           # Firestore security (435 linhas)
│   └── firestore.indexes.json    # Índices Firestore
│
└── 📖 Docs & Config
    ├── README.md
    ├── DOCUMENTACAO_tecnica.md    # Documentação técnica completa
    ├── google-services.json       # Google Services (Android)
    └── GoogleService-Info.plist   # Google Services (iOS)
```

**Total de Arquivos:** 150+  
**Linhas de Código:** 50,000+  
**Componentes:** 30+  
**Serviços:** 25+  
**Cloud Functions:** 17  

### 5.2 Componentes Principais

**UI Base (10 componentes):**
1. `BotaButton` - Botão estilizado
2. `BotaInput` - Input de texto
3. `ThemedText` - Texto com tema
4. `ThemedView` - View com tema
5. `Collapsible` - Conteúdo expansível
6. `HapticTab` - Tab com feedback háptico
7. `ExternalLink` - Link externo
8. `HelloWave` - Animação wave
9. `ParallaxScrollView` - Scroll parallax
10. `TypographyExamples` - Exemplos tipografia

**Componentes de Negócio (10 componentes):**
1. `MatchAnimation` - Animação de match
2. `SuperLikeAnimation` - Animação super like
3. `PremiumModal` - Modal de features premium
4. `ConversionModal` - Modal de conversão para premium
5. `CompleteProfileModal` - Modal: completar perfil
6. `RestrictedProfile` - Exibição restrita de perfil
7. `LockedFilter` - Filter bloqueado (premium)
8. `NetworkBadge` - Badge LinkedIn verificado
9. `ConversationReminderCard` - Card de lembrete
10. `LocationInitializer` - Inicializador de localização
11. `ProfileGuard` - Guard de perfil completo

**Ícones Rurais (20+ componentes):**
- Animais: Gado, Suínos, Aves, Ovelhas, Cavalos
- Plantações: Milho, Soja, Cana, Café, Alface
- Atividades: Rodeio, Vaquejada, Leilão, Roubo de Boi
- Outros: Trator, Fazenda, Cerca, etc

### 5.3 Serviços e Integrações

**Firebase Services (20 serviços):**

1. **authService.ts** (580 linhas)
   - registerUser()
   - loginUser()
   - logoutUser()
   - verifyEmailCode()
   - resetPassword()

2. **matchService.ts** (779 linhas)
   - likeUser()
   - superLikeUser()
   - passUser()
   - getMatches()
   - unmatchUser()

3. **chatService.ts** (810 linhas)
   - getChatById()
   - getUserChats()
   - sendMessage()
   - getMessages()
   - subscribeToMessages()

4. **discoveryService.ts** (449 linhas)
   - discoverUsers()
   - calculateDistance()
   - calculateAge()
   - applyFilters()

5. **eventService.ts** (578 linhas)
   - createEvent()
   - updateEvent()
   - getActiveEvents()
   - simulateEventPayment()

6. **networkRuralFirebaseService.ts** (355 linhas)
   - getNetworkProfiles()
   - createConnection()
   - getConnections()

7. **stripeService.ts** (278 linhas)
   - createPixPayment()
   - getPixPaymentStatus()
   - cancelPixPayment()
   - getPaymentHistory()

8. **linkedinService.ts**
   - authenticateWithLinkedIn()
   - getProfile()
   - syncProfile()

9. **subscriptionService.ts**
   - subscribeToPremium()
   - subscribeToNetwork()
   - cancelSubscription()

10. **notificationService.ts**
    - sendNotification()
    - subscribeToNotifications()
    - markAsRead()

+ 10 serviços adicionais

**Data Services (7 serviços):**

1. **freePlanService.ts** (611 linhas)
   - Lógica completa do plano gratuito
   - Cálculo de limites por período
   - Gestão de views/likes/mensagens

2. **contentModerationService.ts**
   - Validação de conteúdo
   - Regex patterns
   - Sanitização

3. **networkRuralService.ts**
   - Gestão de rede profissional
   - Filtros de networking

4. **conversationService.ts**
   - Gestão de conversas
   - Histórico

5. **extendedUserData.ts**
   - Dados adicionais de usuário
   - Computações

6. **tabsAndFiltersService.ts**
   - Configuração de tabs
   - Estado de filtros

7. **viewLimitsService.ts**
   - Gestão de limites de visualização

### 5.4 Contextos de Estado

**AuthContext.tsx** (880 linhas)
```typescript
- currentUser: FirebaseUser | null
- isAuthenticated: boolean
- isLoading: boolean
- hasPremium: boolean
- hasNetworkRural: boolean
- networkTrialDaysRemaining: number
- userType: UserType
- register/login/logout/verifyEmail
- updateProfile/updatePhotos
- activatePremiumTrial/subscribeToPlan
```

**FreePlanContext.tsx** (330 linhas)
```typescript
- isFreePlan: boolean
- currentPeriod: FreePlanPeriod
- limits: FreePlanLimits
- viewsInfo/likesInfo
- checkCanView/checkCanLike/checkCanSendMessage
- consumeView/consumeLike/consumeMessage
- showConversionModal/triggerConversion
```

**SignupContext.tsx**
```typescript
- email: string
- name: string
- password: string
- profile: UserProfile
- currentStep: number
- complete()
- updateField()
```

---

## 6. FLUXOS E TELAS

### 6.1 Fluxo de Autenticação

```
┌─────────────────────────────────────────────────────┐
│             FLUXO DE AUTENTICAÇÃO                   │
└─────────────────────────────────────────────────────┘

┌─────────────┐
│  APP INICIA │
└──────┬──────┘
       │
       ▼
┌────────────────────────┐
│ Verifica Token Salvo?  │
└──────┬──────────┬──────┘
       │ Sim      │ Não
       │          │
       ▼          ▼
   [HOME]   ┌──────────────────────┐
            │ Verifica Auth State  │
            │ (Firebase)           │
            └──────┬──────────┬────┘
                   │          │
                   │ Log in   │ Log out
                   │          │
                   ▼          ▼
          ┌──────────────┐  ┌──────────────────┐
          │  LOGIN FLOW  │  │ CADASTRO FLOW    │
          └──────┬───────┘  └────────┬─────────┘
                 │                   │
       ┌─────────┴─────────┐  ┌──────┴────────────┐
       │                   │  │                   │
       ▼                   ▼  ▼                   ▼
   LOGIN FORM        FORGOT PASS  SIGNUP FORM   NAME
       │                  │          │           │
       │                  ▼          ▼           ▼
       │             PASSWORD         EMAIL    BIRTHDATE
       │             RESET CODE        │        │
       │                  │            ▼        ▼
       └──────────────────┴──→ VERIFY EMAIL → GENDER
                                   │          │
                                   ▼          ▼
                              PASSWORD     TERMS
                                   │          │
                                   ▼          ▼
                            ┌─────────────────────┐
                            │ ONBOARDING FLOW     │
                            └────────┬────────────┘
                                     │
                    ┌────────────────┼────────────────┐
                    │                │                │
                    ▼                ▼                ▼
                GENDER           GOALS          LOOKING FOR
                PREFER           │              │
                 │               ▼              ▼
                 │           LOCATION       ORIENTATION
                 │               │              │
                 └───────────┬────┴──────┬──────┘
                             │           │
                             ▼           ▼
                        ┌──────────────────────┐
                        │  PROFILE COMPLETION  │
                        │  - Photos Upload     │
                        │  - Bio               │
                        │  - Preferences       │
                        └──────┬───────────────┘
                               │
                               ▼
                        ┌──────────────────┐
                        │   HOME / FEED    │
                        └──────────────────┘
```

### 6.2 Fluxo de Onboarding

```
STEP 1: GÊNERO
├─ Radio buttons: Masculino, Feminino, Não-binário, Outro
└─ Next/Back buttons

STEP 2: PREFERÊNCIAS DE GÊNERO
├─ Radio buttons: Homens, Mulheres, Ambos
└─ Next/Back buttons

STEP 3: OBJETIVOS DE RELACIONAMENTO
├─ Checkboxes (múltipla):
│  ├─ Amizade
│  ├─ Namoro
│  ├─ Casamento
│  ├─ Eventos
│  └─ Network
└─ Next/Back buttons

STEP 4: O QUE PROCURA
├─ Checkboxes (múltipla):
│  ├─ Alguém no agro
│  ├─ Profissional experiente
│  ├─ Mentoria
│  ├─ Parceria
│  └─ Amizade genuína
└─ Next/Back buttons

STEP 5: ORIENTAÇÃO SEXUAL
├─ Radio buttons:
│  ├─ Heterossexual
│  ├─ Homossexual
│  ├─ Bissexual
│  ├─ Pansexual
│  ├─ Assexual
│  ├─ Outro
│  └─ Prefiro não dizer
└─ Next/Back buttons

STEP 6: UPLOAD DE FOTOS
├─ Gallery picker (múltipla)
├─ Drag & drop para reordenar
├─ Primeira foto é principal
└─ Next/Back buttons

STEP 7: COMPLEMENTAR PERFIL
├─ Bio (100-500 caracteres)
├─ Profissão
├─ Altura (opcional)
├─ Filhos (sim/não)
├─ Educação
├─ Hobbies
└─ Next/Back buttons

STEP 8: ATIVAR AGRO (opcional)
├─ "Sou do agro" checkbox
├─ Se SIM:
│  ├─ Tipo de propriedade
│  ├─ Tamanho da propriedade
│  ├─ Animais (checkboxes)
│  ├─ Plantações (checkboxes)
│  └─ Atividades rurais (checkboxes)
└─ Finish

RESULTADO
└─ Profile 100% completo
└─ Acesso ao feed de descoberta
```

### 6.3 Navegação Principal

```
┌──────────────────────────────────────────────────────────┐
│                    TAB NAVIGATOR                         │
└──────────────────────────────────────────────────────────┘

TAB 1: DESCOBRIR (🔥)
├─ Feed de perfis
├─ Swipe cards (Like/Pass/Super Like)
├─ Bottom action buttons
├─ Profile preview on tap
└─ Filtros (top)

TAB 2: MATCHES (💕)
├─ Lista de matches
├─ Ordenado por recente
├─ Chat preview
├─ Ações: Chat, Unmatch, Share
└─ Empty state se nenhum

TAB 3: CHAT (💬)
├─ Lista de conversas
├─ Ordenado por último contato
├─ Unread count badge
├─ Message preview
└─ Origin indicator (match/network)

TAB 4: EVENTOS (🎪)
├─ Feed de eventos ativos
├─ Filtro por tipo
├─ Mapa view disponível
├─ Event detail sheet
└─ Interest/Attendance actions

TAB 5: NETWORK (🌾) [apenas Agro]
├─ Feed de perfis Network
├─ Filtro profissional
├─ LinkedIn badge
├─ Connection request form
└─ Chat dedicado

TAB 6: PERFIL (👤)
├─ Meu perfil
├─ Editar perfil
├─ Configurações
├─ Planos/Assinatura
├─ Logout
└─ Ajuda/FAQs

ADDITIONAL: LOJA (🛒)
├─ Super Likes
├─ Boosts
├─ Network items
└─ Payment flow
```

### 6.4 Telas por Módulo

**Autenticação & Onboarding (16 telas):**
- Splash/Inicial
- Login
- Signup (email)
- Signup (confirmação email)
- Signup (nome)
- Signup (data nascimento)
- Signup (senha)
- Signup (termos)
- Signup (verificação)
- Forgot Password
- Onboarding (Gender)
- Onboarding (Goals)
- Onboarding (Looking For)
- Onboarding (Orientation)
- Onboarding (Profile)
- Onboarding (Final)

**Principal (11 telas):**
- Discovery Feed (matches)
- Matches List
- Chat List
- Chat Detail
- Events Feed
- Network Rural
- Profile
- Store
- Plans
- Premium Checkout
- Settings

**Modais & Componentes:**
- Complete Profile Modal
- Conversion Modal
- Premium Features Modal
- Match Animation
- Super Like Animation

---

## 7. ATIVOS E RECURSOS

### 7.1 Assets Visuais

**Ícones (50+):**
- Tab icons (6)
- Action icons (20)
- Rural icons (20)
- Status icons (4)

**Imagens (20+):**
- App icon (4 resoluções)
- Splash screen
- Onboarding illustrations
- Empty states (5)
- Error illustrations
- Success illustrations

**Logos:**
- Bota Love logo (horizontal/vertical)
- Favicon
- App icon com badge

### 7.2 Fontes e Tipografia

**Fontes Instaladas:**
1. **Montserrat** (Sans-serif)
   - Regular (400)
   - Medium (500)
   - Bold (700)
   - Uso: Corpo, labels, buttons

2. **Playfair Display** (Serif)
   - Bold (700)
   - Uso: Headlines, branding

3. **Sistema:**
   - iOS: SF Pro Display
   - Android: Roboto

**Sistema Tipográfico:**

```typescript
// constants/typography.ts
- Display (32px, bold)    // Headlines principais
- Headline (24px, bold)   // Seções
- Title (20px, bold)      // Cards, modals
- Subtitle (16px, bold)   // Labels
- Body (14px, regular)    // Conteúdo
- Caption (12px, regular) // Help text
- Overline (11px, bold)   // Tags, badges
```

### 7.3 Paleta de Cores

**Tema Claro (Light):**

```typescript
// Cores Primárias (Agro/Natural)
Primary:        #F9A825  (Laranja - Sol, Energia)
PrimaryLight:   #FFD54F  (Amarelo - Plenitude)
PrimaryDark:    #F57C00  (Laranja Escuro - Terra)

// Cores Secundárias (Agro/Natural)
Secondary:      #502914  (Marrom Escuro - Couro)
SecondaryLight: #663C23  (Marrom Médio)
SecondaryDark:  #3E1F0F  (Marrom Claro)

// Neutras
NeutralLight:   #FFF9E6  (Creme)
NeutralMedium:  #A9927A  (Bege)
NeutralDark:    #7A5841  (Taupe)

// Texto
TextPrimary:    #1F130C  (Preto/Marrom)
TextSecondary:  #502914  (Marrom)
TextLight:      #FFFFFF  (Branco)

// Background
BackgroundLight:#EFEFEF  (Cinza Claro)
BackgroundWhite:#FFFFFF  (Branco)

// Status
Success:        #66BB6A  (Verde)
Error:          #E53935  (Vermelho)
Warning:        #FFA726  (Laranja)
Info:           #1E88E5  (Azul)

// Social
LikePink:       #FF69B4  (Pink - Like)
SuperLikePurple:#9C27B0  (Roxo - Super Like)
```

**Tema Escuro (Dark):**
- Ajustes de contraste para readabilidade
- Backgrounds mais escuros
- Textos mais claros

### 7.4 Ícones e Componentes

**Ícones Rurais (Material Community Icons):**
- `fire` - Descobrir
- `heart` - Matches
- `cart` - Loja
- `sprout` - Network
- `calendar` - Eventos
- `plus-circle` - Criar
- `clipboard-text` - Histórico
- `account` - Perfil
- `chat` - Chat
- E 40+ mais

**Componentes Reutilizáveis:**

```tsx
// UI Base
<BotaButton
  title="Enviar"
  variant="primary|secondary|outline"
  size="small|medium|large"
  loading={false}
  disabled={false}
/>

<BotaInput
  placeholder="Email..."
  value={email}
  onChangeText={setEmail}
  type="text|email|password|number"
  error={error}
/>

<ThemedText variant="headline|body|caption" />
<ThemedView>... content ...</ThemedView>

// Card
<ProfileCard
  user={user}
  onLike={() => {}}
  onPass={() => {}}
  onSuperLike={() => {}}
/>
```

---

## 8. ENDPOINTS & APIs

### 8.1 Cloud Functions REST

**Base URL:**
```
https://southamerica-east1-botalove-app.cloudfunctions.net/
```

**Autenticação Email:**

```bash
POST /sendVerificationEmail
Content-Type: application/json

{
  "email": "usuario@example.com",
  "name": "João"
}

Response:
{
  "success": true,
  "messageSent": true,
  "expiresIn": 600
}
```

```bash
POST /verifyEmailCode
Content-Type: application/json

{
  "email": "usuario@example.com",
  "code": "123456"
}

Response:
{
  "success": true,
  "verified": true,
  "validUntil": "2026-02-02T10:30:00Z"
}
```

**Recuperação de Senha:**

```bash
POST /sendPasswordResetCode
Content-Type: application/json

{
  "email": "usuario@example.com"
}

Response:
{
  "success": true,
  "messageSent": true,
  "expiresIn": 900
}
```

```bash
POST /resetPassword
Content-Type: application/json
Authorization: Bearer {userId}

{
  "code": "123456",
  "newPassword": "SecurePass123!"
}

Response:
{
  "success": true,
  "passwordReset": true
}
```

### 8.2 Firestore Queries

**Usuários por Localização:**

```typescript
const q = query(
  collection(firestore, 'users'),
  where('profile.state', '==', 'SP'),
  where('profile.city', '==', 'São Paulo'),
  where('status', '==', 'active'),
  orderBy('profile.name', 'asc'),
  limit(50)
);
```

**Matches do Usuário:**

```typescript
const q = query(
  collection(firestore, 'matches'),
  where('users', 'array-contains', currentUserId),
  where('isActive', '==', true),
  orderBy('lastMessageAt', 'desc'),
  limit(100)
);
```

**Chats com Mensagens:**

```typescript
// Subcollection query
const chatRef = doc(firestore, 'chats', chatId);
const messagesRef = collection(chatRef, 'messages');

const q = query(
  messagesRef,
  orderBy('createdAt', 'desc'),
  limit(50),
  startAfter(lastVisible)
);
```

**Eventos Ativos:**

```typescript
const q = query(
  collection(firestore, 'events'),
  where('status', '==', 'active'),
  where('eventDate', '>=', new Date()),
  orderBy('eventDate', 'asc'),
  limit(50)
);
```

### 8.3 Integração Stripe

**Criar Pagamento PIX:**

```javascript
POST https://api.stripe.com/v1/payment_intents

{
  "amount": 4990,              // R$ 49,90 em centavos
  "currency": "brl",
  "payment_method_types": ["pix"],
  "customer": "cus_xxx",
  "description": "Premium Monthly",
  "metadata": {
    "userId": "user123",
    "productId": "premium_monthly",
    "plan": "premium_monthly"
  }
}

Response:
{
  "id": "pi_xxx",
  "client_secret": "pi_xxx_secret_xxx",
  "status": "requires_payment_method",
  "charges": {
    "data": [
      {
        "payment_method_details": {
          "pix": {
            "qr_code": "00020126360...",
            "qr_code_url": "data:image/png;base64,...",
            "expires_at": 1708025400
          }
        }
      }
    ]
  }
}
```

**Webhook do Stripe:**

```javascript
POST https://app-url.com/webhook

Event: payment_intent.succeeded

{
  "id": "evt_xxx",
  "type": "payment_intent.succeeded",
  "data": {
    "object": {
      "id": "pi_xxx",
      "status": "succeeded",
      "metadata": {
        "userId": "user123",
        "productId": "premium_monthly"
      }
    }
  }
}
```

### 8.4 Integração LinkedIn

**OAuth Flow:**

```javascript
1. Redireciona para:
https://www.linkedin.com/oauth/v2/authorization?
  client_id=YOUR_CLIENT_ID
  &response_type=code
  &scope=r_liteprofile%20r_emailaddress
  &redirect_uri=botaloveapp://linkedin-callback
  &state=STATE_PARAM

2. Usuário autoriza
3. LinkedIn redireciona para:
botaloveapp://linkedin-callback?code=CODE&state=STATE

4. App troca code por token:
POST https://www.linkedin.com/oauth/v2/accessToken
  grant_type=authorization_code
  code=CODE
  client_id=YOUR_CLIENT_ID
  client_secret=YOUR_SECRET
  redirect_uri=botaloveapp://linkedin-callback

5. Response:
{
  "access_token": "token",
  "expires_in": 5184000
}

6. App busca perfil:
GET https://api.linkedin.com/v2/me
  Authorization: Bearer token

Response:
{
  "localizedFirstName": "João",
  "localizedLastName": "Silva",
  "profilePicture": { ... }
}
```

---

## 9. DADOS TÉCNICOS

### 9.1 Tipos TypeScript

**Arquivo:** `firebase/types.ts` (521 linhas)

**Tipos Base:**

```typescript
export type UserStatus = 'pending' | 'active' | 'suspended' | 'deleted';
export type SubscriptionStatus = 'none' | 'trial' | 'active' | 'expired' | 'cancelled';
export type SubscriptionPlan = 
  | 'free' 
  | 'premium_monthly' 
  | 'premium_quarterly' 
  | 'premium_annual'
  | 'network_monthly'
  | 'network_lifetime';

export type Gender = 'male' | 'female' | 'non_binary' | 'other';
export type GenderPreference = 'male' | 'female' | 'all';
export type ChatOrigin = 'match' | 'network' | 'correio_da_roca' | 'misterio_do_campo';
export type MessageType = 'text' | 'image' | 'audio' | 'system' | 'misterio';
export type MessageStatus = 'sent' | 'delivered' | 'read';
export type NotificationType = 'match' | 'message' | 'like' | 'super_like' | 'trial_expiring' | 'system';
export type RelationshipGoal = 'amizade' | 'namoro' | 'casamento' | 'eventos' | 'network';
export type UserAccountType = 'agro' | 'simpatizante' | 'produtor';
```

### 9.2 Modelos de Dados

**FirebaseUser (Interface Principal):**

```typescript
interface FirebaseUser {
  // Identificação
  id: string;
  email: string;
  emailVerified: boolean;
  verificationCode?: string;
  verificationCodeExpiry?: Timestamp;
  
  // Perfil
  profile: UserProfile;
  status: UserStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastActive: Timestamp;
  
  // Assinaturas
  subscription: UserSubscription;
  networkRural: NetworkRuralData;
  
  // Configurações
  notificationSettings: NotificationSettings;
  discoverySettings: DiscoverySettings;
  fcmTokens: string[];
  
  // Estatísticas
  stats: UserStats;
  
  // Inventário
  inventory?: UserInventory;
  boostStatus?: UserBoostStatus;
}

interface UserProfile {
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
  profileCompleted?: boolean;
  lookingForGoals?: LookingForGoal[];
  networkEnabled?: boolean;
  nationality?: string;
  livingPreference?: LivingPreference;
  ruralValues?: RuralValue[];
  sexualOrientation?: SexualOrientation;
  // ... mais 10 campos
}
```

**FirebaseChat:**

```typescript
interface FirebaseChat {
  id: string;
  participants: [string, string];
  origin: ChatOrigin;
  matchId?: string;
  networkConnectionId?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastMessage: LastMessage | null;
  isActive: boolean;
  blockedBy?: string;
  messageCount: number;
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
  readAt?: Timestamp;
  moderated: boolean;
  originalText?: string;
  moderationScore?: number;
  misterio?: MisterioData;
  metadata?: MessageMetadata;
}
```

### 9.3 Enums e Constantes

**Constantes:**

```typescript
// constants/index.ts
export const LIBRE_LIMIT = 10;
export const MAX_DISTANCE = 5000; // km
export const MIN_AGE = 18;
export const MAX_AGE = 80;
export const BIO_MIN = 10;
export const BIO_MAX = 500;
export const MESSAGE_MAX = 2000;
export const PHOTO_MAX_SIZE = 5 * 1024 * 1024; // 5MB
export const PASS_EXPIRY = 7; // dias
export const INACTIVITY_WARNING_DAYS = 7;
export const PROFILE_RESET_TIME = 60; // dias

// Opções de Filtros
export const PROFESSIONS = [
  'Produtor Rural',
  'Veterinário',
  'Agrônomo',
  'Mecanicista',
  'Pecuarista',
  // ... 45+ opções
];

export const ANIMALS = [
  'Gado (Gado de Corte)',
  'Gado (Gado de Leite)',
  'Suínos',
  'Aves (Frango)',
  'Aves (Pato)',
  // ... 20+ opções
];

export const RURAL_ACTIVITIES = [
  'Rodeio',
  'Vaquejada',
  'Leilão de Gado',
  'Roubo de Boi',
  'Festa de Rodeio',
  // ... 15+ opções
];
```

---

## 10. OPERAÇÃO E DEPLOY

### 10.1 Ambiente de Produção

**Plataforma de Deploy:**
- **Frontend:** EAS Build + Expo (OTA updates)
- **Backend:** Firebase Firestore + Cloud Functions
- **Storage:** Firebase Storage + CloudFlare CDN
- **Monitarização:** Firebase Analytics + Sentry
- **CI/CD:** GitHub Actions (opcional)

**Configuração EAS:**

```json
{
  "build": {
    "production": {
      "android": {
        "buildType": "apk|aab"
      },
      "ios": {
        "buildType": "archive"
      }
    }
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccount": "firebase-key.json"
      },
      "ios": {
        "asciiProviderProfile": "production"
      }
    }
  }
}
```

**Firebase Deployment:**

```bash
# Deploy Cloud Functions
cd functions
npm install
firebase deploy --only functions --region southamerica-east1

# Deploy Firestore Rules
firebase deploy --only firestore:rules

# Deploy Indexes
firebase deploy --only firestore:indexes
```

### 10.2 Variáveis de Ambiente

**Arquivo: `.env` (deve ser protegido)**

```bash
# Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyD...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=botalove-app.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=botalove-app
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=botalove-app.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:android:abc123xyz

# Stripe
STRIPE_PUBLIC_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# LinkedIn OAuth
LINKEDIN_CLIENT_ID=xxx
LINKEDIN_CLIENT_SECRET=xxx
LINKEDIN_REDIRECT_URI=botaloveapp://linkedin-callback

# SendGrid
SENDGRID_API_KEY=SG.xxx
EMAIL_FROM=noreply@botalove.com
EMAIL_SUPPORT=support@botalove.com

# Google Vision
GOOGLE_APPLICATION_CREDENTIALS=./google-vision-key.json

# App Config
APP_VERSION=1.0.0
API_BASE_URL=https://southamerica-east1-botalove-app.cloudfunctions.net
SENTRY_DSN=https://xxx@sentry.io/xxx
```

### 10.3 Monitoramento e Logs

**Firebase Console Monitoring:**

```
Dashboard
├─ Real-time Usage
├─ Errors & Crashes
├─ Performance
├─ Security Warnings
└─ Analytics

Sections:
├─ Authentication
│  └─ Sign-in Methods, Users, Active Sessions
├─ Firestore
│  └─ Database Size, Reads/Writes, Indexes
├─ Storage
│  └─ Files, Size, Bandwidth
├─ Functions
│  └─ Invocations, Memory, Duration, Errors
├─ Analytics
│  └─ DAU, MAU, Retention, Conversion
└─ Messaging
   └─ Message Delivery, Open Rate, Errors
```

**Sentry Error Tracking:**

```typescript
import * as Sentry from "@sentry/react-native";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: "production",
});

// Automaticamente captura erros não tratados
// Também pode capturar manualmente:
Sentry.captureException(error);
Sentry.captureMessage("User action", "info");
```

**Custom Logging:**

```typescript
// Logs estruturados
console.log('✅ Chat sent', {
  userId,
  chatId,
  messageId,
  timestamp: new Date().toISOString(),
  duration: endTime - startTime,
});

console.error('❌ Match creation failed', {
  error: error.message,
  userId,
  attempt: retryCount,
});
```

---

## CONCLUSÃO

Este documento valida que o **BOTA LOVE APP v1.0.0** é um aplicativo mobile completo, funcional e pronto para produção, atendendo a todos os requisitos contratuais das Cláusulas 12ª e 15ª.

### ✅ Checklist de Validação

- ✅ **Funcionalidades Completas:** 10 módulos principais implementados
- ✅ **Arquitetura Robusta:** Firebase + Cloud Functions escalável
- ✅ **Segurança:** Firestore Rules + Auth segura + Moderação de conteúdo
- ✅ **UX/UI:** Interface intuitiva com animações e feedback háptico
- ✅ **Pagamentos:** Integração Stripe PIX funcional
- ✅ **Notificações:** Push notifications em tempo real
- ✅ **Networking:** LinkedIn OAuth integrado
- ✅ **Moderação:** Texto e imagem com IA (Google Vision)
- ✅ **Planos:** Freemium com conversão progressiva
- ✅ **Documentação:** Código comentado e documentação completa
- ✅ **Deploy:** Pronto para EAS Build e Firebase hosting
- ✅ **Monitoramento:** Sentry + Firebase Analytics

### 📱 Especificações Finais

| Característica | Valor |
|---|---|
| **Plataformas** | iOS + Android |
| **Linguagem** | TypeScript / React Native |
| **Backend** | Firebase (Firestore + Functions) |
| **Usuários Potenciais** | 50.000+ (target regional) |
| **Regiões Suportadas** | Brasil inteiro |
| **Idioma** | Português Brasileiro |
| **Horário de Pico** | 100+ requisições/min |
| **TAM (Total Addressable Market)** | Profissionais do agronegócio BR |

---

**Documento Preparado Para:** Validação Contratual  
**Data de Emissão:** Fevereiro 2026  
**Versão:** 1.0.0  
**Status:** ✅ COMPLETO E OPERACIONAL

---

## 📑 APÊNDICE - REFERÊNCIAS RÁPIDAS

### Arquivos Principais
- App: `/app/*` (40+ telas)
- Serviços: `/firebase/*` (20 serviços)
- Componentes: `/components/*` (30+ componentes)
- Cloud Functions: `/functions/src/*` (17 funções)
- Documentação: `/docs/*` (10+ documentos)

### Documentação Adicional
- [FIREBASE_SETUP.md](docs/FIREBASE_SETUP.md) - Configuração Firebase
- [FREE_PLAN.md](docs/FREE_PLAN.md) - Sistema plano gratuito
- [MATCH_MODULE.md](docs/MATCH_MODULE.md) - Sistema de matches
- [NETWORK_RURAL.md](docs/NETWORK_RURAL.md) - Network profissional
- [IMAGE_MODERATION.md](docs/IMAGE_MODERATION.md) - Moderação IA
- [STRIPE_LINKEDIN_SETUP.md](docs/STRIPE_LINKEDIN_SETUP.md) - Integrações

### Contato & Suporte
- **Email:** augustokayorodriguesramos@gmail.com

---

**FIM DO DOCUMENTO**
