# DOCUMENTAÇÃO TÉCNICA PARA VALIDAÇÃO DO APLICATIVO MOBILE BOTA LOVE

**Versão:** 1.0.0  
**Data:** Fevereiro 2026  
**Autor:** Augusto Kayo - Desenvolvedor Interino
**Classificação:** Documentação Técnica - Validação Contratual

---

## 📋 ÍNDICE

1. [Resumo Executivo](#resumo-executivo)
2. [Lista Completa de Funcionalidades](#lista-completa-de-funcionalidades)
3. [Arquitetura do Sistema](#arquitetura-do-sistema)
4. [Descrição Detalhada das Funcionalidades](#descrição-detalhada-das-funcionalidades)
5. [Banco de Dados Firebase](#banco-de-dados-firebase)
6. [Cloud Functions - Endpoints](#cloud-functions---endpoints)
7. [Fluxos e Telas do Aplicativo](#fluxos-e-telas-do-aplicativo)
8. [Componentes e Ativos Técnicos](#componentes-e-ativos-técnicos)
9. [Stack Tecnológico](#stack-tecnológico)
10. [Segurança e Regras Firestore](#segurança-e-regras-firestore)

---

## 📌 RESUMO EXECUTIVO

O **Bota Love App** é um aplicativo mobile de relacionamentos focado no público rural e agro brasileiro. Desenvolvido com **React Native (Expo)** e **Firebase** como backend completo, o aplicativo oferece um conjunto robusto de funcionalidades para conectar profissionais do setor agropecuário.

### Período de Desenvolvimento
- **Conclusão:** Fevereiro 2026
- **Versão:** 1.0.0 (Produção)

### Plataformas Suportadas
- ✅ iOS (Apple)
- ✅ Android (Google)
- ✅ Web (Progressive Web App)

### Tecnologias Principais
- **Frontend:** React Native 0.81.5 + Expo 54.0.31 + TypeScript 5.9.2
- **Backend:** Firebase (Auth, Firestore, Storage, Cloud Functions)
- **Pagamentos:** Stripe PIX
- **Notificações:** Firebase Cloud Messaging

---

## 📋 LISTA COMPLETA DE FUNCIONALIDADES

### **MÓDULO 1: AUTENTICAÇÃO E CADASTRO**
1. Registro de novo usuário com email
2. Verificação de email via código
3. Login com email e senha
4. Recuperação de senha
5. Logout
6. Gerenciamento de sessão
7. Renovação de token

### **MÓDULO 2: GERENCIAMENTO DE PERFIL**
1. Criação de perfil completo
2. Edição de informações básicas (nome, data nascimento, gênero)
3. Upload de fotos (múltiplas)
4. Escrita de bio/descrição pessoal
5. Seleção de objetivos de relacionamento
6. Configuração de preferências de gênero
7. Detalhes profissionais (ocupação, áreas agrícolas)
8. Verificação de perfil
9. Pré-visualização de perfil

### **MÓDULO 3: DESCOBERTA E MATCHES**
1. Feed de descoberta com cards deslizáveis
2. Like em perfil
3. Super Agro (com notificação especial)
4. Rejeição de perfil (Pass)
5. Detecção automática de match (like mútuo)
6. Criação automática de chat ao fazer match
7. Visualização de quem curtiu você
8. Gerenciamento de matches (ativo/inativo)
9. Desfazer match (unmatch)

### **MÓDULO 4: FILTROS E PREFERÊNCIAS**
1. Filtros básicos (idade, distância, localização)
2. Filtros avançados (profissões, atividades rurais, animais)
3. Salvamento de preferências
4. Aplicação em tempo real
5. Sugestão de filtros inteligentes
6. Filtro por verificação de perfil
7. Filtro por presença de fotos
8. Filtro por características rurais

### **MÓDULO 5: CHAT E MENSAGENS**
1. Conversas em tempo real
2. Envio de mensagens de texto
3. Suporte a múltiplos tipos de mensagens (texto, imagem)
4. Status de leitura de mensagens
5. Histórico de conversas persistente
6. Busca em conversas
7. Notificações de novas mensagens
8. Bloqueio de usuários
9. Moderação de conteúdo em mensagens
10. Lembretes de inatividade
11. Presença online/offline

### **MÓDULO 6: SYSTEM DE PLANOS E ASSINATURAS**
1. Plano Gratuito com limites progressivos
   - Dia 1: Acesso ilimitado (onboarding)
   - Dias 2-7: 120 views, 25 likes, 1 msg/match
   - Dias 8-10: 50 views, 25 likes, 1 msg/match
   - Dias 11-14: 20 views, 15 likes, 0 msg (leitura)
   - Após mês: 10 views, 10 likes, 0 msg (leitura)
   - 2+ meses: 5 views, 5 likes, 0 msg (leitura)

2. Premium Mensal
   - Acesso ilimitado a descoberta
   - Mensagens ilimitadas
   - Filtros avançados
   - Boost de perfil
   - Visibilidade de quem curtiu

3. Premium Trimestral
   - Todos os benefícios mensais
   - Desconto de preço

4. Premium Anual
   - Todos os benefícios mensais
   - Melhor desconto de preço

5. Network Rural (Monthly)
   - Acesso a rede profissional
   - Conexões com profissionais agrícolas
   - Chat dedicado para networking

6. Network Rural (Lifetime)
   - Acesso permanente
   - Todas as features do Network

### **MÓDULO 7: EVENTOS AGRO**
1. Listagem de eventos (rodeios, feiras, shows, congressos)
2. Criação de eventos (produtores)
3. Edição de eventos próprios
4. Deletar eventos
5. Detalhes do evento (data, local, descrição)
6. Indicar interesse em evento
7. Confirmar presença
8. Visualizar estatísticas de evento
9. Publicação com duração configurável (15, 30, 60, 90 dias)
10. Destaque de eventos (com custo adicional)
11. Busca e filtro de eventos por tipo

### **MÓDULO 8: NETWORK RURAL**
1. Perfil para networking profissional
2. Busca de profissionais do agro
3. Filtro por área de atuação
4. Integração com LinkedIn
5. Conexão profissional (3 tipos: profissional, negócio, mentoria)
6. Chat dedicado para network
7. Estatísticas de conexões
8. Recomendações profissionais

### **MÓDULO 9: LOJA VIRTUAL**
1. Compra de Super Agros avulsos
2. Compra de Boosts (Assobios do Peão)
3. Histórico de compras
4. Carrinho de compras
5. Checkout integrado

### **MÓDULO 10: NOTIFICAÇÕES**
1. Push notifications (iOS/Android)
2. Notificações de novo match
3. Notificações de like recebido
4. Notificações de Super Agro
5. Notificações de nova mensagem
6. Notificações de evento interessante
7. Notificações de assinatura expirando
8. Configuração de preferências de notificação

### **MÓDULO 11: MODERAÇÃO E SEGURANÇA**
1. Moderação de perfis (fotos, bio)
2. Moderação de mensagens (conteúdo impróprio)
3. Bloqueio de usuários
4. Report de usuários
5. Banimento de contas
6. Auditoria de ações
7. Verificação de email obrigatória

### **MÓDULO 12: CONFIGURAÇÕES**
1. Configuração de notificações push
2. Privacidade de perfil (mostrar/esconder)
3. Gerenciamento de preferências de descoberta
4. Alteração de senha
5. Logout
6. Deleção de conta
7. Baixar dados pessoais (LGPD)

### **MÓDULO 13: ESPECIAL - CORREIO DA ROÇA**
1. Envio de mensagens anônimas (pendente de aceite)
2. Aceitação/rejeição de mensagens anônimas
3. Revelação de identidade (automática após 24h)
4. Criação de match após aceitar

### **MÓDULO 14: ONBOARDING**
1. Splash screen
2. Seleção de gênero
3. Seleção de orientação sexual
4. Seleção de objetivos relacionais
5. Seleção de "o que você procura aqui"
6. Upload de fotos de perfil
7. Preenchimento de dados pessoais
8. Confirmação de termos e condições
9. Conclusão do onboarding

---

## 🏗️ ARQUITETURA DO SISTEMA

### Diagrama Geral

```
┌─────────────────────────────────────────────────────────────────────┐
│                        BOTA LOVE APP                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │              FRONTEND - React Native (Expo)                  │   │
│  │  ├─ Telas (File-based routing)                             │   │
│  │  ├─ Componentes reutilizáveis                             │   │
│  │  ├─ Gerenciamento de estado (Context API)                │   │
│  │  ├─ Hooks customizados                                    │   │
│  │  └─ Tema e estilização                                    │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                           ↓                                           │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │           FIREBASE - Backend as a Service                    │   │
│  │  ├─ Authentication (Email/Password)                         │   │
│  │  ├─ Firestore (NoSQL Database)                             │   │
│  │  ├─ Storage (Imagens de perfil)                            │   │
│  │  ├─ Cloud Functions (Lógica serverless)                    │   │
│  │  ├─ Cloud Messaging (Push notifications)                   │   │
│  │  └─ Security Rules (Controle de acesso)                    │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                           ↓                                           │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │        INTEGRAÇÕES EXTERNAS                                 │   │
│  │  ├─ Stripe (Pagamentos PIX)                                │   │
│  │  ├─ LinkedIn (Verificação profissional)                    │   │
│  │  ├─ SendGrid (Email)                                       │   │
│  │  └─ Google Cloud Vision (Moderação de imagens)             │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

### Stack Tecnológico Detalhado

#### Frontend
- **Runtime:** Expo 54.0.31
- **Framework:** React Native 0.81.5
- **Linguagem:** TypeScript 5.9.2
- **Roteamento:** Expo Router 6.0.21
- **UI:** React Native com tema customizado
- **Animações:** React Native Reanimated 4.1.1
- **Gestos:** React Native Gesture Handler 2.28.0

#### Backend
- **Autenticação:** Firebase Auth
- **Banco de Dados:** Firestore (NoSQL)
- **Armazenamento:** Firebase Storage
- **Funções:** Cloud Functions v2
- **Notificações:** Firebase Cloud Messaging
- **Região:** South America East (GCP - Brasil)

#### Dependências Críticas
- `firebase@^12.7.0` - SDK Firebase
- `@react-native-firebase/*@^23.7.0` - Firebase para React Native
- `expo-image-picker@~17.0.10` - Seleção de imagens
- `expo-location@~19.0.8` - Localização GPS
- `expo-notifications@~0.32.16` - Notificações locais
- `date-fns@^3.6.0` - Manipulação de datas

#### Serviços Terceirizados
- **Stripe:** Pagamentos via PIX
- **LinkedIn:** Autenticação e verificação profissional
- **SendGrid:** Envio de emails transacionais
- **Google Cloud Vision:** Moderação de imagens

---

## 📖 DESCRIÇÃO DETALHADA DAS FUNCIONALIDADES

### 1. AUTENTICAÇÃO E CADASTRO

#### Finalidade
Permitir que novos usuários se registrem de forma segura e usuários existentes façam login, garantindo a verificação de identidade através de validação de email.

#### Funcionamento
1. **Registro (Sign Up)**
   - Usuário insere email e cria senha
   - Sistema envia código de verificação por email
   - Usuário digita código para confirmar propriedade do email
   - Conta é criada no Firebase Auth
   - Documento de usuário é criado no Firestore

2. **Login**
   - Usuário insere email e senha
   - Firebase Auth valida credenciais
   - Sessão é iniciada
   - Dados do usuário são carregados do Firestore

3. **Recuperação de Senha**
   - Usuário solicita reset de senha
   - Sistema envia código por email
   - Usuário digita novo código e define nova senha
   - Senha é atualizada no Firebase Auth

#### Integrações
- **Firebase Auth:** Autenticação e gerenciamento de credenciais
- **Firestore:** Armazenamento de dados de usuário
- **Cloud Functions:** Envio de emails de verificação (SendGrid)
- **SendGrid:** Serviço de email

#### Arquivos Envolvidos
```
firebase/
  ├─ authService.ts (registerUser, loginUser, resetPassword, etc)
  ├─ config.ts (Configuração Firebase)
  └─ types.ts (Tipos: FirebaseUser, LoginResult)

functions/src/auth/
  ├─ sendVerificationEmail.ts
  ├─ verifyEmailCode.ts
  ├─ sendPasswordResetCode.ts
  └─ resetPassword.ts

contexts/
  └─ AuthContext.tsx (Gerenciamento de estado de autenticação)
```

---

### 2. GERENCIAMENTO DE PERFIL

#### Finalidade
Permitir que usuários criem, editem e exibam um perfil completo com informações pessoais, profissionais e de preferências.

#### Funcionamento
1. **Criação de Perfil**
   - Usuário preenche dados básicos (nome, data de nascimento, gênero)
   - Upload de fotos de perfil (máx 6 fotos)
   - Bio pessoal (descrição)
   - Informações profissionais (ocupação, áreas agrícolas)
   - Preferências de relacionamento

2. **Edição de Perfil**
   - Usuário pode editar qualquer campo de seu perfil
   - Alterações são salvas em tempo real no Firestore
   - Fotos podem ser adicionadas, removidas ou reordenadas

3. **Visualização de Perfil**
   - Outros usuários podem visualizar o perfil (com restrições por plano)
   - Usuário vê seu próprio perfil completo
   - Sistema exibe informações conforme visibilidade de perfil

#### Integrações
- **Firestore:** Armazenamento de dados de perfil
- **Firebase Storage:** Armazenamento de imagens
- **Google Cloud Vision:** Moderação de imagens (conteúdo impróprio)

#### Arquivos Envolvidos
```
firebase/
  ├─ firestoreService.ts (updateUserProfile, updatePhotos)
  └─ storageService.ts (Upload de imagens)

data/
  ├─ freePlanService.ts (Visibilidade conforme plano)
  └─ bioValidationService.ts (Validação de bio)

contexts/
  └─ AuthContext.tsx (updateProfile, updatePhotos)
```

---

### 3. DESCOBERTA E MATCHES

#### Finalidade
Permitir que usuários descubram potenciais parceiros através de um feed interativo e façam matches (relacionamentos) através de likes mútuos.

#### Funcionamento
1. **Feed de Descoberta**
   - Sistema exibe cards de usuários potenciais
   - Ordem baseada em: proximidade, compatibilidade de filtros
   - Usuário pode: Like, Super Agro ou Pass (rejeitar)
   - Máximo de 50 usuários por carregamento

2. **Sistema de Likes**
   - **Like Normal:** Indica interesse em um usuário
   - **Super Agro:** Like com destaque especial (notificação diferente)
   - **Pass:** Rejeita usuário por tempo determinado

3. **Detecção de Match**
   - Se dois usuários dão like um no outro: MATCH! 🎉
   - Chat é criado automaticamente
   - Ambos recebem notificação de match
   - Conversa pode começar imediatamente

4. **Gerenciamento de Matches**
   - Usuário vê lista de matches
   - Pode desativar match (unmatch)
   - Pode bloquear usuário
   - Histórico de matches permanece

#### Integrações
- **Firestore:** Armazenamento de likes, matches, passes
- **Cloud Functions:** Notificação de match
- **Cloud Messaging:** Push notifications

#### Arquivos Envolvidos
```
firebase/
  ├─ matchService.ts (likeUser, superLikeUser, passUser, unmatch)
  ├─ discoveryService.ts (getDiscoveryFeed, calcularDistância)
  └─ types.ts (FirebaseLike, FirebaseMatch)

hooks/
  └─ useDiscoveryFeed.ts (Lógica do feed)

functions/src/notifications/
  └─ sendMatchNotification.ts (Notifica match)
```

---

### 4. FILTROS E PREFERÊNCIAS

#### Finalidade
Permitir que usuários refinarem sua descoberta através de filtros avançados, garantindo maior compatibilidade e interesse mútuo.

#### Funcionamento
1. **Filtros Básicos**
   - Faixa etária (mín/máx)
   - Raio de distância (km)
   - Localização (estado/cidade)
   - Preferência de gênero (homens, mulheres, ambos)

2. **Filtros Avançados**
   - Profissão
   - Atividades rurais
   - Tamanho de propriedade
   - Animais que possui
   - Educação
   - Filhos
   - Interesses
   - Estilo musical

3. **Aplicação em Tempo Real**
   - Filtros são salvos automaticamente
   - Feed atualiza com novos critérios
   - Sem necessidade de reload

4. **Inteligência**
   - Sistema sugere filtros baseado em padrões
   - Detecta filtros muito restritivos
   - Oferece expansão de filtros

#### Arquivos Envolvidos
```
firebase/
  ├─ discoveryService.ts (Aplicação de filtros)
  └─ types.ts (DiscoverySettings)

contexts/
  └─ AuthContext.tsx (updateDiscoverySettings)

components/
  ├─ LockedFilter.tsx (Filtros bloqueados para gratuito)
  └─ advanced-filters.tsx (Tela de filtros avançados)
```

---

### 5. CHAT E MENSAGENS

#### Finalidade
Permitir comunicação em tempo real entre usuários que fizeram match, com suporte a múltiplos tipos de conteúdo e moderação.

#### Funcionamento
1. **Envio de Mensagens**
   - Usuário digita mensagem
   - Clica enviar
   - Mensagem é armazenada no Firestore
   - Receptor recebe em tempo real
   - Status: enviado → entregue → lido

2. **Tipos de Mensagens**
   - Texto simples
   - Imagens
   - Áudio (planejado)
   - Mensagens de sistema

3. **Moderação**
   - Mensagens são analisadas automaticamente
   - Sistema detecta palavras impróprias
   - Conteúdo impróprio é filtrado/bloqueado
   - Histórico de moderação é registrado

4. **Gerenciamento de Conversas**
   - Histórico persistente
   - Busca em conversas
   - Marcar como lida
   - Bloqueio de usuário
   - Lembretes de inatividade

#### Integrações
- **Firestore:** Armazenamento de chats e mensagens
- **Firebase Storage:** Armazenamento de imagens em mensagens
- **Cloud Functions:** Moderação de conteúdo, notificações
- **Advanced Moderation Service:** Análise de conteúdo

#### Arquivos Envolvidos
```
firebase/
  ├─ chatService.ts (CRUD de chats e mensagens)
  └─ types.ts (FirebaseChat, FirebaseMessage)

hooks/
  └─ useChat.ts (Lógica de chat)

services/
  └─ advancedModerationService.ts (Moderação)

functions/src/
  ├─ notifications/sendMessageNotification.ts
  └─ moderation/moderateMessage.ts
```

---

### 6. SISTEMA DE PLANOS E ASSINATURAS

#### Finalidade
Oferecer diferentes níveis de acesso (Gratuito, Premium, Network Rural) com monetização clara e limites justos.

#### Funcionamento

**PLANO GRATUITO (Freemium)**

Evolui em períodos com limites progressivos:

| Período | Duração | Views/dia | Likes/dia | Msgs/match | Bio | Filtros | Descrição |
|---------|---------|-----------|-----------|------------|-----|---------|-----------|
| Dia 1 | 1 dia | ∞ | ∞ | 2 | ✅ | ✅ | Onboarding generoso |
| 2-7 dias | 6 dias | 120 | 25 | 1 | ❌ | Básicos | Período de avaliação |
| 8-10 dias | 3 dias | 50 | 25 | 1 | ❌ | Básicos | Conversão crítica |
| 11-14 dias | 4 dias | 20 | 15 | 0 | ❌ | Básicos | Apenas leitura |
| Após mês | Ilimitado | 10 | 10 | 0 | ❌ | Básicos | Limite baixo |
| 2+ meses | Ilimitado | 5 | 5 | 0 | ❌ | Básicos | Limite muito baixo |

**PLANO NETWORK RURAL**

Acesso à rede profissional de agropecuaristas:
- Networking com profissionais do agro
- Busca avançada por áreas de atuação
- Integração com LinkedIn
- Chat dedicado para networking
- Recomendações profissionais

Opções:
- Mensal: R$ 29,90
- Lifetime (vitalício): R$ 199,90

#### Integrações
- **Firestore:** Armazenamento de assinaturas
- **Stripe:** Processamento de pagamentos PIX
- **Cloud Functions:** Validação de pagamento, criação de assinatura

#### Arquivos Envolvidos
```
firebase/
  ├─ subscriptionService.ts (Gerenciamento de assinaturas)
  ├─ stripeService.ts (Integração Stripe)
  └─ types.ts (SubscriptionPlan, UserSubscription)

data/
  └─ freePlanService.ts (Lógica de limites do gratuito)

contexts/
  ├─ AuthContext.tsx (Ações de subscription)
  └─ FreePlanContext.tsx (Limites e conversão)

functions/src/stripe/
  ├─ createPixPayment.ts
  ├─ getPixPaymentStatus.ts
  └─ stripeWebhook.ts
```

---

### 7. EVENTOS AGRO

#### Finalidade
Permitir que produtores rurais publiquem eventos e que usuários descubram eventos de interesse (rodeios, feiras, shows, etc).

#### Funcionamento

**Para Usuários Comuns**
1. Acessam aba de Eventos
2. Veem listagem de eventos ativos
3. Filtram por tipo (rodeio, feira, show, etc)
4. Clicam em evento para detalhes
5. Podem indicar interesse ou confirmar presença
6. Recebem notificação quando evento se aproxima

**Para Produtores**
1. Acessam "Criar Evento"
2. Preenchem formulário:
   - Título
   - Descrição
   - Tipo (rodeio, feira, show, congresso, etc)
   - Data e hora
   - Local (endereço, cidade, estado)
   - Capacidade
   - Preço de entrada (opcional)
3. Escolhem duração de publicação:
   - 15 dias
   - 30 dias
   - 60 dias
   - 90 dias
4. Opcionalmente, destacam evento:
   - 15 dias de destaque
   - 30 dias de destaque
   - 60 dias de destaque
   - 90 dias de destaque
5. Finalizando checkout com PIX
6. Evento fica ativo conforme duração
7. Recebem notificações de interesse e confirmações

**Metrificação**
- Visualizações
- Usuários interessados
- Confirmações de presença
- Alcance geográfico

#### Arquivos Envolvidos
```
firebase/
  ├─ eventService.ts (CRUD de eventos)
  └─ types.ts (FirebaseEvent)

app/(tabs)/
  ├─ events.tsx (Listagem de eventos)
  ├─ create-event.tsx (Criação)
  └─ event-history.tsx (Histórico do produtor)

functions/src/stripe/
  └─ Pagamentos de eventos
```

---

### 8. NETWORK RURAL

#### Finalidade
Conectar profissionais do setor agropecuário para networking, oportunidades de negócios e mentoria.

#### Funcionamento
1. **Ativar Network**
   - Usuário habilita Network Rural em seu perfil
   - Informa áreas de atuação
   - Define objetivos (parcerias, mentoria, etc)
   - Indica o que procura

2. **Busca de Profissionais**
   - Sistema filtra usuários com Network ativo
   - Filtros por: áreas, profissão, localização, LinkedIn

3. **Conexão**
   - Usuário envia pedido de conexão
   - Outro usuário aceita/rejeita
   - Se aceito: chat é criado automaticamente

4. **Chat de Network**
   - Igual ao chat de matches
   - Mensagens não expiram
   - Suporta compartilhamento de perfil

5. **LinkedIn Integration**
   - Usuários podem conectar perfil do LinkedIn
   - Verificação profissional automática
   - Dados do LinkedIn são sincronizados

#### Integrações
- **Firestore:** Armazenamento de conexões
- **LinkedIn API:** Verificação profissional
- **Cloud Functions:** Notificações de conexão

#### Arquivos Envolvidos
```
firebase/
  ├─ networkRuralFirebaseService.ts
  ├─ linkedinService.ts
  └─ types.ts (NetworkConnection, LinkedInProfile)

app/(tabs)/
  └─ network-rural.tsx
```

---

### 9. LOJA VIRTUAL

#### Finalidade
Permitir que usuários comprem itens para melhorar sua experiência no app (Super Agros, Boosts).

#### Funcionamento
1. **Itens Disponíveis**

2. **Compra**
   - Usuário seleciona item
   - Clica em comprar
   - Sistema redireciona para checkout PIX
   - Após confirmação, itens são adicionados ao inventário

#### Integrações
- **Stripe:** Pagamentos
- **Firestore:** Armazenamento de inventário
- **Cloud Functions:** Confirmação de compra

#### Arquivos Envolvidos
```
firebase/
  ├─ storeItemsService.ts
  └─ types.ts (UserInventory)

app/(tabs)/
  └─ store.tsx
```

---

### 10. NOTIFICAÇÕES

#### Finalidade
Manter usuários engajados informando-os sobre eventos importantes em tempo real.

#### Funcionamento
1. **Tipos de Notificação**
   - Novo match
   - Novo like recebido
   - Super Agro recebido
   - Nova mensagem
   - Evento de interesse se aproximando
   - Assinatura expirando
   - Assinatura expirada

2. **Entrega**
   - Push notification (iOS/Android)
   - Notificação in-app
   - Email (configurável)

3. **Personalização**
   - Usuário ativa/desativa por tipo
   - Configura horários de notificação
   - Silencia para período específico

#### Integrações
- **Firebase Cloud Messaging:** Entrega de notificações
- **Expo Notifications:** Notificações locais
- **Cloud Functions:** Triggers para envio

#### Arquivos Envolvidos
```
firebase/
  ├─ notificationService.ts
  └─ types.ts (FirebaseNotification)

functions/src/notifications/
  ├─ sendMatchNotification.ts
  ├─ sendLikeNotification.ts
  └─ sendMessageNotification.ts

contexts/
  └─ AuthContext.tsx (notificationSettings)
```

---

### 11. MODERAÇÃO E SEGURANÇA

#### Finalidade
Manter a plataforma segura, removendo conteúdo impróprio e banindo usuários problemáticos.

#### Funcionamento
1. **Moderação de Fotos**
   - Google Cloud Vision API analisa conteúdo
   - Detecta nudez, violência, etc
   - Foto é rejeitada ou aprovada
   - Usuário é notificado se rejeitada

2. **Moderação de Mensagens**
   - Sistema detecta palavras impróprias (regex)
   - Análise IA de toxicidade
   - Mensagem é filtrada ou bloqueada
   - Admin é notificado se necessário

3. **Report e Banimento**
   - Usuário pode reportar outro
   - Admin analisa report
   - Se confirmado, conta é suspensa/banida
   - Todas as conversas são documentadas

4. **Auditoria**
   - Log de todas as ações
   - Histórico de moderação
   - Rastreamento de violações

#### Arquivos Envolvidos
```
services/
  ├─ imageModeration.ts
  ├─ bioValidationService.ts
  └─ advancedModerationService.ts

functions/src/moderation/
  └─ moderateMessage.ts

functions/src/auth/
  └─ sendWelcomeEmail.ts (Template com regras)
```

---

### 12. CONFIGURAÇÕES

#### Finalidade
Permitir que usuários personalizem sua experiência e gerenciem suas preferências.

#### Funcionamento
1. **Notificações**
   - Ativar/desativar por tipo
   - Configurar horários
   - Configurar canais (push, email)

2. **Privacidade**
   - Mostrar/esconder perfil na descoberta
   - Quem pode ver seu perfil
   - Quem pode te adicionar

3. **Dados**
   - Baixar dados pessoais (LGPD)
   - Excluir conta permanentemente
   - Revogar acesso a LinkedIn

#### Arquivos Envolvidos
```
app/
  └─ settings.tsx

contexts/
  └─ AuthContext.tsx (updateDiscoverySettings)
```

---

### 13. CORREIO DA ROÇA (Mensagens Anônimas)

#### Finalidade
Permitir que usuários enviem mensagens anônimas para quem os interessa, como forma de "quebra-gelo".

#### Funcionamento
1. **Envio**
   - Usuário clica em "Correio da Roça" no perfil
   - Escreve mensagem anônima
   - Envia
   - Remetente não é revelado imediatamente

2. **Recepção**
   - Destinatário recebe notificação de mensagem anônima
   - Pode aceitar ou rejeitar
   - Se aceitar: match é criado e identidade é revelada
   - Se rejeitar: mensagem é descartada

3. **Revelação de Identidade**
   - Se aceito: identidade é revelada imediatamente
   - Se não aceito após 24h: identidade é revelada automaticamente
   - Chat é criado apenas se aceito

#### Integrações
- **Firestore:** Armazenamento de mensagens anônimas
- **Cloud Functions:** Revelação automática após 24h

#### Arquivos Envolvidos
```
firebase/
  ├─ matchService.ts (createCorreioDaRoca)
  └─ types.ts (CorreioDaRoca)
```

---

### 14. ONBOARDING

#### Finalidade
Guiar novos usuários através da configuração inicial, garantindo perfil completo e preferências bem definidas.

#### Funcionamento
1. **Splash Screen**
   - Apresenta app com branding
   - Botões: Entrar / Criar Conta

2. **Fluxo de Cadastro**
   - Nome e email
   - Senha
   - Verificação de email
   - Termos e condições
   - Foto de perfil

3. **Fluxo de Onboarding**
   - Seleção de gênero
   - Seleção de orientação sexual
   - Seleção de objetivos (namoro, amizade, eventos, etc)
   - O que procura aqui
   - Bio pessoal
   - Interesse em Network
   - Preferências de gênero
   - Conclusão

#### Arquivos Envolvidos
```
app/
  ├─ onboarding.tsx
  ├─ onboarding-*.tsx (Múltiplas telas)
  ├─ signup.tsx
  ├─ signup-*.tsx (Múltiplas telas)
  └─ signup-verify-email.tsx

contexts/
  └─ SignupContext.tsx (Estado do fluxo)
```

---

## 🗄️ BANCO DE DADOS FIREBASE

### Estrutura do Firestore

#### 1. Collection: `users`

Armazena dados de todos os usuários do aplicativo.

```typescript
{
  id: string,                    // UID Firebase Auth
  email: string,
  emailVerified: boolean,
  userType: 'agro' | 'simpatizante' | 'produtor',
  status: 'pending' | 'active' | 'suspended' | 'deleted',
  
  // Perfil
  profile: {
    name: string,
    birthDate: Timestamp,
    age: number,
    gender: 'male' | 'female' | 'non_binary' | 'other',
    genderPreference: 'male' | 'female' | 'all',
    bio: string,
    photos: string[],            // URLs em Storage
    city: string,
    state: string,
    occupation: string,
    relationshipGoals: string[],
    isAgroUser: boolean,
    agroAreas: string[],
    profileCompleted: boolean,
  },
  
  // Assinatura
  subscription: {
    status: 'none' | 'trial' | 'active' | 'expired' | 'cancelled',
    plan: 'free' | 'premium_monthly' | 'premium_quarterly' | 'premium_annual',
    startDate: Timestamp | null,
    endDate: Timestamp | null,
    trialEndDate: Timestamp | null,
    autoRenew: boolean,
    lastPaymentId: string,
  },
  
  // Network Rural
  networkRural: {
    isActive: boolean,
    subscription: {
      status: 'none' | 'trial' | 'active' | 'expired',
      plan: 'monthly' | 'lifetime',
      startDate: Timestamp,
      endDate: Timestamp,
    },
    linkedIn: {
      profileUrl: string,
      currentPosition: string,
      company: string,
      isVerified: boolean,
    },
    goals: string[],
    lookingFor: string[],
  },
  
  // Descoberta
  discoverySettings: {
    showMe: boolean,
    ageRange: { min: number, max: number },
    distanceRadius: number,
    genderInterest: 'men' | 'women' | 'both',
    onlyVerified: boolean,
    onlyWithPhotos: boolean,
    selectedInterests: string[],
    selectedProfessions: string[],
    // ... mais filtros
  },
  
  // Notificações
  notificationSettings: {
    pushEnabled: boolean,
    matchNotifications: boolean,
    messageNotifications: boolean,
    likeNotifications: boolean,
  },
  fcmTokens: string[],           // Tokens para push
  
  // Estatísticas
  stats: {
    totalLikes: number,
    totalMatches: number,
    totalMessages: number,
    profileViews: number,
    superLikesReceived: number,
  },
  
  // Inventário
  inventory: {
    superLikes: number,
    boosts: number,
  },
  
  // Timestamps
  createdAt: Timestamp,
  updatedAt: Timestamp,
  lastActive: Timestamp,
}
```

#### 2. Collection: `likes`

Armazena informação de likes entre usuários.

```typescript
{
  id: string,                    // fromUserId_toUserId
  fromUserId: string,            // Quem deu like
  toUserId: string,              // Quem recebeu like
  isSuperLike: boolean,
  createdAt: Timestamp,
  seen: boolean,
  matchCreated: boolean,         // Virou match?
  matchId: string,               // Se virou match
}
```

#### 3. Collection: `matches`

Armazena matches entre usuários (quando há like mútuo).

```typescript
{
  id: string,                    // Gerado automático
  users: [string, string],       // IDs dos 2 usuários
  createdAt: Timestamp,
  lastMessageAt: Timestamp | null,
  chatId: string,                // Chat associado
  isActive: boolean,
  unmatchedBy: string,           // Se foi feito unmatch
  unmatchedAt: Timestamp,
}
```

#### 4. Collection: `chats`

Armazena conversas entre usuários.

```typescript
{
  id: string,
  participants: [string, string],       // IDs ordenados
  origin: 'match' | 'network' | 'correio_da_roca',
  matchId: string,                      // Se origin = match
  networkConnectionId: string,          // Se origin = network
  
  createdAt: Timestamp,
  updatedAt: Timestamp,
  lastMessage: {
    text: string,
    senderId: string,
    timestamp: Timestamp,
    type: 'text' | 'image',
  },
  
  isActive: boolean,
  messageCount: number,
  inactivityReminders: number,
  lastReminderAt: Timestamp,
}
```

#### 5. Subcollection: `chats/{chatId}/messages`

Armazena mensagens individuais.

```typescript
{
  id: string,
  chatId: string,
  senderId: string,
  text: string,
  type: 'text' | 'image' | 'audio' | 'system' | 'misterio',
  status: 'sent' | 'delivered' | 'read',
  createdAt: Timestamp,
  readAt: Timestamp,
  
  // Moderação
  moderated: boolean,
  originalText: string,          // Se foi sanitizado
  moderationScore: number,
  
  // Se for mensagem mistério
  misterio: {
    isRevealed: boolean,
    revealedAt: Timestamp,
    expiresAt: Timestamp,        // 24h após envio
    blurredPhotoUrl: string,
    originalPhotoUrl: string,
    senderName: string,
  },
}
```

#### 6. Collection: `payments`

Armazena histórico de pagamentos.

```typescript
{
  id: string,
  userId: string,
  
  amount: number,                 // Em centavos
  currency: string,               // BRL
  description: string,
  
  productId: string,              // Ex: 'premium_monthly'
  plan: string,
  
  status: 'pending' | 'completed' | 'failed' | 'refunded',
  provider: 'stripe' | 'simulated',
  
  stripePaymentIntentId: string,
  
  createdAt: Timestamp,
  completedAt: Timestamp,
}
```

#### 7. Collection: `notifications`

Armazena notificações para cada usuário.

```typescript
{
  id: string,
  userId: string,
  
  type: 'match' | 'like' | 'super_like' | 'message' | 'trial_expiring',
  title: string,
  body: string,
  
  data: {
    // Dados contextuais
    fromUserId: string,
    matchId: string,
    chatId: string,
  },
  
  read: boolean,
  readAt: Timestamp,
  
  pushSent: boolean,
  pushSentAt: Timestamp,
  
  createdAt: Timestamp,
}
```

#### 8. Collection: `events`

Armazena eventos criados por produtores.

```typescript
{
  id: string,
  creatorId: string,
  title: string,
  description: string,
  
  type: 'rodeio' | 'exposicao' | 'balada' | 'encontro' | 'feira',
  
  eventDate: Timestamp,
  eventTime: string,              // HH:mm
  
  location: {
    address: string,
    city: string,
    state: string,
    coordinates: {
      latitude: number,
      longitude: number,
    },
  },
  
  imageUrl: string,               // Em Storage
  
  capacity: number,
  ticketPrice: number,            // Em reais
  
  durationDays: number,           // 15, 30, 60, 90
  highlightDays: number,
  isHighlighted: boolean,
  
  status: 'active' | 'completed' | 'cancelled',
  
  views: number,
  interested: number,
  attendees: number,
  
  createdAt: Timestamp,
  updatedAt: Timestamp,
  expiresAt: Timestamp,           // Quando evento sai do ar
}
```

#### 9. Collection: `network_connections`

Armazena conexões profissionais do Network Rural.

```typescript
{
  id: string,
  users: [string, string],              // IDs ordenados
  createdAt: Timestamp,
  
  chatId: string,                       // Chat automático
  connectionType: 'professional' | 'business' | 'mentorship',
  
  isActive: boolean,
}
```

#### 10. Collection: `correio_da_roca`

Armazena mensagens anônimas.

```typescript
{
  id: string,
  fromUserId: string,             // Remetente (oculto no início)
  toUserId: string,               // Destinatário
  
  message: string,
  status: 'pending' | 'accepted' | 'rejected',
  
  createdAt: Timestamp,
  respondedAt: Timestamp,
  
  chatId: string,                 // Criado se aceito
  matchId: string,                // Criado se aceito
}
```

#### 11. Collection: `email_verifications`

Armazena códigos de verificação de email.

```typescript
{
  id: string,                     // email (lowercase + trimmed)
  email: string,
  code: string,
  expiresAt: Timestamp,           // 24h
  verified: boolean,
  verifiedAt: Timestamp,
  attempts: number,
  createdAt: Timestamp,
  usedForRegistration: boolean,   // Se foi usado no cadastro
  registeredUserId: string,
  registeredAt: Timestamp,
}
```

### Índices do Firestore

Para otimizar queries, os seguintes índices são criados:

```
// Users
- users:email
- users:userType, users:status
- users:status
- users:profile.city, users:profile.state
- users:subscription.status

// Likes
- likes:toUserId, likes:createdAt (desc)
- likes:fromUserId, likes:createdAt (desc)
- likes:isSuperLike, likes:createdAt (desc)

// Matches
- matches:users, matches:createdAt (desc)
- matches:createdAt (desc)
- matches:lastMessageAt (desc)

// Chats
- chats:participants, chats:updatedAt (desc)
- chats:createdAt (desc)

// Messages
- chats/{chatId}/messages:createdAt (desc)
- chats/{chatId}/messages:status

// Events
- events:status, events:expiresAt
- events:city, events:state
- events:createdAt (desc)

// Notifications
- notifications:userId, notifications:read
- notifications:userId, notifications:createdAt (desc)
```

---

## ☁️ CLOUD FUNCTIONS - ENDPOINTS

### Configuração Global

**Região:** `southamerica-east1` (São Paulo, Brasil)  
**Versão:** Firebase Functions v2  
**Runtime:** Node.js 20

### Funções de Autenticação

#### 1. `sendVerificationEmail`
- **Tipo:** Callable Function
- **Autenticação:** Requer usuário autenticado
- **Parâmetros:**
  ```typescript
  {
    userId: string,
    email: string
  }
  ```
- **Resposta:**
  ```typescript
  {
    success: boolean,
    message?: string,
    error?: string
  }
  ```
- **Finalidade:** Enviar email com código de verificação

#### 2. `verifyEmailCode`
- **Tipo:** Callable Function
- **Parâmetros:**
  ```typescript
  {
    userId: string,
    code: string
  }
  ```
- **Resposta:**
  ```typescript
  {
    success: boolean,
    message?: string,
    error?: string
  }
  ```
- **Finalidade:** Validar código de verificação e marcar email como verificado

#### 3. `resendVerificationCode`
- **Tipo:** Callable Function
- **Autenticação:** Requer usuário autenticado
- **Resposta:**
  ```typescript
  {
    success: boolean,
    message?: string,
    error?: string
  }
  ```
- **Finalidade:** Reenviar código de verificação

#### 4. `sendPasswordResetCode`
- **Tipo:** Callable Function
- **Parâmetros:**
  ```typescript
  {
    email: string
  }
  ```
- **Resposta:**
  ```typescript
  {
    success: boolean,
    message?: string,
    error?: string
  }
  ```
- **Finalidade:** Enviar código de reset de senha

#### 5. `verifyPasswordResetCode`
- **Tipo:** Callable Function
- **Parâmetros:**
  ```typescript
  {
    email: string,
    code: string
  }
  ```
- **Resposta:**
  ```typescript
  {
    success: boolean,
    message?: string,
    error?: string
  }
  ```
- **Finalidade:** Validar código de reset antes de definir nova senha

#### 6. `resetPassword`
- **Tipo:** Callable Function
- **Parâmetros:**
  ```typescript
  {
    email: string,
    code: string,
    newPassword: string
  }
  ```
- **Resposta:**
  ```typescript
  {
    success: boolean,
    message?: string,
    error?: string
  }
  ```
- **Finalidade:** Alterar senha do usuário

#### 7. `sendWelcomeEmail`
- **Tipo:** Cloud Function (após registro)
- **Trigger:** Automático (novo documento em `users`)
- **Finalidade:** Enviar email de boas-vindas

### Funções de Notificação

#### 8. `sendMatchNotification`
- **Tipo:** Callable Function
- **Parâmetros:**
  ```typescript
  {
    userId: string,
    matchId: string,
    fromUserName: string
  }
  ```
- **Resposta:**
  ```typescript
  {
    success: boolean,
    notificationId?: string
  }
  ```
- **Finalidade:** Notificar novo match

#### 9. `sendLikeNotification`
- **Tipo:** Callable Function
- **Parâmetros:**
  ```typescript
  {
    userId: string,
    fromUserId: string,
    isSuperLike: boolean
  }
  ```
- **Resposta:**
  ```typescript
  {
    success: boolean,
    notificationId?: string
  }
  ```
- **Finalidade:** Notificar novo like/Super Agro

#### 10. `sendMessageNotification`
- **Tipo:** Callable Function
- **Parâmetros:**
  ```typescript
  {
    userId: string,
    chatId: string,
    fromUserName: string,
    messagePreview: string
  }
  ```
- **Resposta:**
  ```typescript
  {
    success: boolean,
    notificationId?: string
  }
  ```
- **Finalidade:** Notificar nova mensagem

### Funções de Moderação

#### 11. `moderateMessage`
- **Tipo:** Callable Function
- **Parâmetros:**
  ```typescript
  {
    messageId: string,
    chatId: string,
    text: string
  }
  ```
- **Resposta:**
  ```typescript
  {
    success: boolean,
    moderated: boolean,
    action: 'allowed' | 'filtered' | 'blocked',
    originalText?: string
  }
  ```
- **Finalidade:** Moderação automática de conteúdo

### Funções de Pagamento (Stripe PIX)

#### 12. `createPixPayment`
- **Tipo:** Callable Function
- **Autenticação:** Requer usuário autenticado
- **Parâmetros:**
  ```typescript
  {
    userId: string,
    product: {
      id: string,
      name: string,
      amount: number,          // em centavos
      category: 'premium' | 'network' | 'store'
    },
    customerEmail?: string,
    customerName?: string
  }
  ```
- **Resposta:**
  ```typescript
  {
    success: boolean,
    paymentId?: string,
    pixCode?: string,          // Copia e cola
    pixQrCode?: string,        // Base64
    expiresAt?: string,        // ISO 8601
    error?: string
  }
  ```
- **Finalidade:** Criar pagamento PIX e retornar QR Code

#### 13. `getPixPaymentStatus`
- **Tipo:** Callable Function
- **Parâmetros:**
  ```typescript
  {
    paymentId: string
  }
  ```
- **Resposta:**
  ```typescript
  {
    success: boolean,
    status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'expired',
    paidAt?: string
  }
  ```
- **Finalidade:** Verificar status de um pagamento PIX

#### 14. `cancelPixPayment`
- **Tipo:** Callable Function
- **Parâmetros:**
  ```typescript
  {
    paymentId: string
  }
  ```
- **Resposta:**
  ```typescript
  {
    success: boolean,
    message?: string
  }
  ```
- **Finalidade:** Cancelar pagamento PIX pendente

#### 15. `getPaymentHistory`
- **Tipo:** Callable Function
- **Autenticação:** Requer usuário autenticado
- **Resposta:**
  ```typescript
  {
    success: boolean,
    payments?: Array<{
      id: string,
      amount: number,
      currency: string,
      status: string,
      createdAt: string,
      productId: string,
      productName: string
    }>
  }
  ```
- **Finalidade:** Obter histórico de pagamentos do usuário

#### 16. `stripeWebhook`
- **Tipo:** HTTP Function
- **Autenticação:** Validação de signature Stripe
- **Triggers:**
  - `charge.succeeded` - Pagamento confirmado
  - `charge.failed` - Pagamento falhou
  - `charge.refunded` - Reembolso processado
- **Finalidade:** Webhook para receber eventos do Stripe

### Funções de Usuário

#### 17. `onUserLogin`
- **Tipo:** Cloud Function (trigger)
- **Trigger:** `onAuthStateChanged` (Realtime Database)
- **Finalidade:** Registrar login, atualizar `lastActive`

---

## 🎨 FLUXOS E TELAS DO APLICATIVO

### Fluxo Geral de Navegação

```
┌─────────────────────────────────────────────────────────────┐
│                     SPLASH SCREEN                           │
│            (Apresentação do App - 2-3 segundos)            │
└────────────────────┬────────────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
    ┌────▼────┐             ┌────▼─────┐
    │ ENTRAR  │             │CRIAR CONTA│
    └────┬────┘             └────┬──────┘
         │                       │
    ┌────▼───────────────────┐  ┌▼────────────────────────┐
    │ LOGIN                  │  │ SIGNUP (Multi-step)    │
    │ - Email                │  │ - Email                │
    │ - Senha                │  │ - Verificação Email    │
    │ - Recuperação senha    │  │ - Senha                │
    └────┬───────────────────┘  │ - Termos               │
         │                      │ - Verificação          │
         │                      └──┬─────────────────────┘
         │                         │
         └──────────────┬──────────┘
                        │
             ┌──────────▼──────────┐
             │   ONBOARDING        │
             │ (Multi-step form)   │
             │ - Gênero            │
             │ - Objetivos         │
             │ - Fotos             │
             │ - Bio               │
             │ - Preferências      │
             └──────────────┬──────┘
                            │
             ┌──────────────▼──────────────┐
             │    TABS PRINCIPAL (HOME)    │
             │ 🔥 Descoberta              │
             │ 💕 Matches                 │
             │ 💬 Chat                    │
             │ 🎪 Eventos                 │
             │ 🌾 Network Rural           │
             │ 👤 Perfil                  │
             └─────────────────────────────┘
```

### Telas Principais

#### 1. **Splash Screen** (`onboarding-splash.tsx`)
- Apresentação da marca
- Botões: Entrar / Criar Conta
- Duração: 2-3 segundos se autenticado (skip automático)

#### 2. **Login** (`login.tsx`)
- Email input
- Senha input
- Botão "Entrar"
- Link "Esqueceu a senha?"
- Link "Criar Conta"
- Validação em tempo real

#### 3. **Signup - Fluxo** (múltiplas telas)
- `signup.tsx` - Nome e email
- `signup-password.tsx` - Definir senha
- `signup-verify-email.tsx` - Verificação de código
- `signup-confirm.tsx` - Confirmação final
- `signup-terms.tsx` - Aceitar termos

#### 4. **Onboarding - Fluxo** (múltiplas telas)
- `onboarding-gender.tsx` - Seleção de gênero
- `onboarding-orientation.tsx` - Orientação sexual
- `onboarding-goals.tsx` - Objetivos de relacionamento
- `onboarding-looking-for.tsx` - O que procura aqui
- `onboarding-profile.tsx` - Bio e fotos
- `onboarding-final.tsx` - Conclusão

#### 5. **Feed de Descoberta** (`(tabs)/index.tsx`)
- Cards deslizáveis de perfis
- Swipe direita: Like
- Swipe esquerda: Pass
- Botão Super Agro (topo)
- Botão Filtros (topo)
- Infinite scroll

#### 6. **Matches** (`(tabs)/matches.tsx`)
- Lista de matches
- Avatar + nome + última mensagem
- Timestamp da última mensagem
- Indicador de mensagens não lidas
- Click abre chat individual

#### 7. **Chat Individual** (`chat/[id].tsx`)
- Cabeçalho com avatar/nome/status online
- Lista de mensagens (scroll reverso)
- Input de mensagem
- Botão enviar (ou ícone de envio)
- Indicador de digitação
- Data separadora entre dias

#### 8. **Eventos** (`(tabs)/events.tsx`)
- Lista de eventos com grid/lista view toggle
- Cards com imagem, título, data, local
- Filtro por tipo
- Busca por texto
- Pull-to-refresh

#### 9. **Criar Evento** (`(tabs)/create-event.tsx`)
- Formulário multi-step
- Upload de imagem
- Seleção de data/hora
- Coordenadas GPS
- Resumo e checkout

#### 10. **Network Rural** (`(tabs)/network-rural.tsx`)
- Lista de profissionais
- Filtros por área/profissão
- Botão conectar
- Badge LinkedIn se verificado
- Histórico de conexões

#### 11. **Perfil** (`(tabs)/profile.tsx`)
- Avatar grande (editável)
- Nome, idade, localização
- Bio (editável)
- Galeria de fotos (edit)
- Badges (Premium, Network, Verificado)
- Ações: Editar Perfil, Configurações, Sair

#### 12. **Editar Perfil** (`edit-profile.tsx`)
- Formulário com todos os campos
- Upload de fotos com reordenação
- Preview de como aparece para outros
- Salvamento automático

#### 13. **Planos** (`plans.tsx`)
- 3 cards: Gratuito, Premium, Network
- Preços claros
- Botões de ação (Já tenho, Testar 3 dias, Assinar)
- Comparação de features

#### 14. **Checkout Premium** (`premium-checkout.tsx`)
- Resumo do plano
- Dados de cobrança
- QR Code PIX
- Copia e cola do código
- Botão confirmar pagamento
- Ou selecionar outro método

#### 15. **Obrigado - Premium** (`premium-thank-you.tsx`)
- Confirmação de compra
- Próximas features desbloqueadas
- Botão voltar para home

#### 16. **Configurações** (`settings.tsx`)
- Notificações
- Privacidade
- Dados e privacidade (LGPD)
- Sobre o app
- Logout
- Deletar conta

#### 17. **Loja** (`(tabs)/store.tsx`)
- Grid de produtos
- Super Agros avulsos
- Boosts (Assobios)
- Preços e botão comprar
- Histórico de compras
- Saldo atual de itens

#### 18. **Detalhes de Perfil** (`profile-detail/[id].tsx`)
- Fotos em carousel
- Nome, idade, localização, distância
- Bio e informações (conforme plano)
- Badges
- Botões: Like, Super Agro, Pass, Report, Block

---

## 🧩 COMPONENTES E ATIVOS TÉCNICOS

### Componentes Base (UI)

#### Componentes de Entrada
- `BotaInput.tsx` - Input de texto estilizado
- `BotaButton.tsx` - Botão primário/secundário/outline
- `BotaPickerSelect.tsx` - Seletor de opções
- `BotaDatePicker.tsx` - Seletor de data
- `BotaSlider.tsx` - Slider de intervalo (idade, distância)

#### Componentes de Exibição
- `ThemedText.tsx` - Texto com tema
- `ThemedView.tsx` - View com tema
- `Collapsible.tsx` - Conteúdo colapsável
- `BotaCard.tsx` - Card genérico
- `BotaBadge.tsx` - Badge de status

#### Componentes de Navegação
- `HapticTab.tsx` - Tab com feedback háptico
- `ExternalLink.tsx` - Link para URLs externas

### Componentes de Negócio

#### Autenticação
- `ProfileGuard.tsx` - HOC para proteger rotas
- `RestrictedProfile.tsx` - Renderiza perfil com restrições

#### Matches e Descoberta
- `MatchAnimation.tsx` - Animação de match encontrado
- `SuperLikeAnimation.tsx` - Animação de Super Agro
- `ProfileCard.tsx` - Card de perfil no feed

#### Modal e Overlay
- `PremiumModal.tsx` - Modal de upgrade premium
- `ConversionModal.tsx` - Modal de conversão (when limit reached)
- `CompleteProfileModal.tsx` - Lembrete de completar perfil
- `NetworkBadge.tsx` - Badge de Network Rural

#### Chat
- `ConversationReminderCard.tsx` - Card de lembrete de inatividade

#### Localização
- `LocationInitializer.tsx` - Inicializa GPS ao abrir app

#### Filtros
- `LockedFilter.tsx` - Filtro bloqueado para gratuito

### Ícones Rurais

Componentes customizados em `components/rural-icons/`:
- `CowIcon.tsx`
- `HayIcon.tsx`
- `HorseIcon.tsx`
- `CornIcon.tsx`
- `ChickenIcon.tsx`
- `PickaxeIcon.tsx`
- E muitos outros...

### Assets (Imagens e Fontes)

#### Imagens
```
assets/images/
  ├─ icon.png (App icon)
  ├─ splash-icon.png (Splash)
  ├─ android-icon-*.png (Android icons)
  ├─ favicon.png (Web)
  ├─ logo-*.png (Logos)
  └─ placeholder-*.png (Placeholders)
```

#### Fontes
- **Montserrat** (Sans-serif regular)
- **Playfair Display** (Serif elegante)

Ambas as fontes são carregadas via Expo Google Fonts.

### Tema e Estilização

#### Sistema de Cores
```typescript
const BotaLoveColors = {
  // Primárias (Laranja/Amarelo - Agro)
  primary: '#F9A825',          // Laranja principal
  primaryLight: '#FFD54F',     // Amarelo claro
  primaryDark: '#F57C00',      // Laranja escuro
  
  // Secundárias (Marrom - Couro/Terra)
  secondary: '#502914',         // Marrom escuro
  secondaryLight: '#663C23',    // Marrom médio
  secondaryDark: '#3E1F0F',     // Marrom muito escuro
  
  // Neutras
  neutralLight: '#FFF9E6',      // Bege muito claro
  neutralMedium: '#A9927A',     // Marrom claro
  neutralDark: '#7A5841',       // Marrom opaco
  
  // Texto
  textPrimary: '#1F130C',       // Marrom muito escuro
  textSecondary: '#502914',     // Marrom médio
  textLight: '#FFFFFF',         // Branco
  
  // Background
  backgroundLight: '#EFEFEF',   // Cinza claro
  backgroundWhite: '#FFFFFF',   // Branco puro
  
  // Status
  error: '#E53935',             // Vermelho
  success: '#66BB6A',           // Verde
  warning: '#FFA726',           // Laranja aviso
  info: '#42A5F5',              // Azul
  
  // Outros
  border: '#E0E0E0',
  disabled: '#CCCCCC',
};
```

#### Tipografia
```typescript
const BotaLoveTypography = {
  // Headings
  h1: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '700',
  },
  h2: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '700',
  },
  h3: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '700',
  },
  
  // Body
  bodyLarge: {
    fontFamily: 'Montserrat_400Regular',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
  bodyRegular: {
    fontFamily: 'Montserrat_400Regular',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
  },
  
  // Caption
  caption: {
    fontFamily: 'Montserrat_400Regular',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
  },
};
```

### Estrutura de Pastas de Componentes

```
components/
  ├─ ui/
  │   ├─ bota-button.tsx
  │   ├─ bota-input.tsx
  │   ├─ bota-card.tsx
  │   ├─ collapsible.tsx
  │   ├─ picker-select.tsx
  │   ├─ date-picker.tsx
  │   ├─ slider-range.tsx
  │   └─ bota-badge.tsx
  │
  ├─ CompleteProfileModal.tsx
  ├─ ConversationReminderCard.tsx
  ├─ ConversionModal.tsx
  ├─ external-link.tsx
  ├─ haptic-tab.tsx
  ├─ hello-wave.tsx
  ├─ LocationInitializer.tsx
  ├─ LockedFilter.tsx
  ├─ MatchAnimation.tsx
  ├─ NetworkBadge.tsx
  ├─ parallax-scroll-view.tsx
  ├─ PremiumModal.tsx
  ├─ ProfileGuard.tsx
  ├─ RestrictedProfile.tsx
  ├─ SuperLikeAnimation.tsx
  ├─ themed-text.tsx
  ├─ themed-view.tsx
  │
  └─ rural-icons/
      ├─ cow-icon.tsx
      ├─ hay-icon.tsx
      ├─ horse-icon.tsx
      ├─ corn-icon.tsx
      ├─ chicken-icon.tsx
      ├─ pickaxe-icon.tsx
      └─ ... (20+ ícones rurais)
```

---

## 🛠️ STACK TECNOLÓGICO

### Versões Críticas

| Tecnologia | Versão | Propósito |
|------------|--------|----------|
| Expo | 54.0.31 | Framework React Native |
| React | 19.1.0 | Biblioteca de UI |
| React Native | 0.81.5 | Framework mobile |
| TypeScript | 5.9.2 | Linguagem tipada |
| Firebase SDK | 12.7.0 | Backend |
| Stripe | 12.5.0 | Pagamentos |

### Dependências de Runtime

```json
{
  "@expo-google-fonts/montserrat": "^0.4.2",
  "@expo-google-fonts/playfair-display": "^0.4.2",
  "@expo/vector-icons": "^15.0.3",
  "@react-native-async-storage/async-storage": "^2.2.0",
  "@react-native-community/datetimepicker": "8.4.4",
  "@react-native-community/slider": "5.0.1",
  "@react-native-firebase/app": "^23.7.0",
  "@react-native-firebase/auth": "^23.7.0",
  "@react-native-firebase/firestore": "^23.7.0",
  "@react-native-firebase/messaging": "^23.7.0",
  "@react-native-firebase/storage": "^23.7.0",
  "@react-native-picker/picker": "2.11.1",
  "@react-navigation/bottom-tabs": "^7.4.0",
  "@react-navigation/native": "^7.1.8",
  "date-fns": "^3.6.0",
  "expo": "~54.0.31",
  "expo-clipboard": "^8.0.8",
  "expo-constants": "~18.0.10",
  "expo-device": "~8.0.10",
  "expo-font": "~14.0.9",
  "expo-haptics": "~15.0.8",
  "expo-image": "~3.0.11",
  "expo-image-picker": "~17.0.10",
  "expo-linear-gradient": "~15.0.8",
  "expo-linking": "~8.0.11",
  "expo-location": "~19.0.8",
  "expo-notifications": "~0.32.16",
  "expo-router": "~6.0.21",
  "expo-splash-screen": "~31.0.13",
  "expo-status-bar": "~3.0.9",
  "expo-symbols": "~1.0.8",
  "expo-system-ui": "~6.0.9",
  "expo-updates": "~29.0.16",
  "expo-web-browser": "~15.0.10",
  "firebase": "^12.7.0",
  "react": "19.1.0",
  "react-dom": "19.1.0",
  "react-icons": "^5.5.0",
  "react-native": "0.81.5",
  "react-native-draggable-flatlist": "^4.0.3",
  "react-native-gesture-handler": "~2.28.0",
  "react-native-reanimated": "~4.1.1",
  "react-native-safe-area-context": "~5.6.0",
  "react-native-screens": "~4.16.0",
  "react-native-svg": "15.12.1",
  "react-native-web": "~0.21.0"
}
```

### Dependências de Desenvolvimento

```json
{
  "@types/react": "~19.1.0",
  "eslint": "^9.25.0",
  "eslint-config-expo": "~10.0.0",
  "typescript": "~5.9.2"
}
```

---

## 🔐 SEGURANÇA E REGRAS FIRESTORE

### Arquitetura de Segurança

```
┌─────────────────────────────────────────────────────────┐
│         Firebase Authentication (Email/Password)        │
└──────────────────────────┬──────────────────────────────┘
                           │
          ┌────────────────┴────────────────┐
          │                                 │
     ┌────▼──────┐                    ┌────▼──────┐
     │ Firebase  │                    │  Firestore│
     │   Auth    │                    │  Security │
     │           │                    │   Rules   │
     └───────────┘                    └───────────┘
          │                                 │
          └────────────────┬────────────────┘
                           │
     ┌─────────────────────▼──────────────────────┐
     │         Application Logic                  │
     │    (Validação, Autorização, Auditoria)     │
     └───────────────────────────────────────────┘
```

### Regras de Segurança (Firestore)

#### Princípios
1. **Autenticação Obrigatória:** Apenas usuários autenticados podem acessar
2. **Autorização por Documento:** Usuários só acessam dados que lhes pertencem
3. **Cloud Functions Protegidas:** Operações críticas via admin SDK
4. **Auditoria:** Logs de todas as ações

#### Regras por Collection

**Collection: `users`**
```
// Leitura: autenticado pode ler qualquer perfil (com restrições no app)
allow read: if isAuthenticated()

// Criação: apenas o próprio usuário pode criar seu documento
allow create: if isOwner(userId)

// Atualização: próprio usuário ou admin
allow update: if isOwner(userId) || isAdmin()

// Deleção: próprio usuário ou admin
allow delete: if isOwner(userId) || isAdmin()
```

**Collection: `likes`**
```
// Leitura: apenas quem deu ou recebeu o like
allow read: if isAuthenticated() && 
  (resource.data.fromUserId == request.auth.uid || 
   resource.data.toUserId == request.auth.uid)

// Criação: quem dá like
allow create: if isAuthenticated() && 
  request.resource.data.fromUserId == request.auth.uid

// Atualização: quem deu like
allow update: if isAuthenticated() && 
  resource.data.fromUserId == request.auth.uid

// Deleção: quem deu like
allow delete: if isAuthenticated() && 
  resource.data.fromUserId == request.auth.uid
```

**Collection: `chats` e `chats/{chatId}/messages`**
```
// Leitura: apenas participantes do chat
allow read: if isAuthenticated() && 
  request.auth.uid in resource.data.participants

// Criação: participante
allow create: if isAuthenticated() && 
  request.auth.uid in request.resource.data.participants

// Mensagens: apenas participantes podem enviar
allow create: if isAuthenticated() && 
  request.resource.data.senderId == request.auth.uid

// Deleção: apenas quem enviou a mensagem
allow delete: if isAuthenticated() && 
  resource.data.senderId == request.auth.uid
```

**Collection: `payments`**
```
// Leitura: usuário vê seus próprios, admin vê todos
allow read: if isAuthenticated() && 
  (resource.data.userId == request.auth.uid || isAdmin())

// Criação: usuário cria seu próprio
allow create: if isAuthenticated() && 
  request.resource.data.userId == request.auth.uid

// Deleção: NUNCA (manter auditoria)
allow delete: if false
```

**Collection: `notifications`**
```
// Leitura: apenas o destinatário
allow read: if isOwner(resource.data.userId)

// Criação: Cloud Functions apenas
allow create: if false

// Atualização: destinatário marca como lida
allow update: if isOwner(resource.data.userId)
```

### Validações Críticas

1. **Email Verification**
   - Código enviado via email
   - Válido por 24h
   - Máximo 5 tentativas

2. **Rate Limiting**
   - Máximo 5 likes por segundo (previne abuse)
   - Máximo 10 registros por IP/dia

3. **Conteúdo Indevido**
   - Moderação de fotos (Google Cloud Vision)
   - Moderação de textos (regex + IA)
   - Bloqueio automático se score alto

4. **Auditoria**
   - Log de todos os logins
   - Log de todas as transações
   - Log de ações administrativas

---

## 📝 CONCLUSÃO

O **Bota Love App** é um aplicativo mobile completo, seguro e bem arquitetado, desenvolvido com tecnologias modernas e melhores práticas de desenvolvimento. Todas as funcionalidades descritas nesta documentação foram implementadas e testadas, cumprindo integralmente os requisitos contratuais.

### Funcionalidades Entregues
✅ Sistema completo de autenticação  
✅ Gerenciamento de perfis  
✅ Descoberta e sistema de matches  
✅ Chat em tempo real com moderação  
✅ Sistema de planos com 6 opções  
✅ Pagamentos via PIX (Stripe)  
✅ Gerenciamento de eventos  
✅ Network Rural com LinkedIn  
✅ Loja virtual  
✅ Push notifications  
✅ Moderação de conteúdo  
✅ Regras de segurança completas  

### Qualidade Técnica
✅ TypeScript para type safety  
✅ React Native/Expo para multiplataforma  
✅ Firebase para backend escalável  
✅ Cloud Functions serverless  
✅ Firestore com índices otimizados  
✅ Testes de segurança  
✅ Documentação completa  

### Suporte
Toda a documentação técnica está disponível em repositório, incluindo:
- Setup inicial (FIREBASE_SETUP.md)
- Integração de pagamentos (STRIPE_LINKEDIN_SETUP.md)
- Detalhes de cada módulo (MATCH_MODULE.md, etc)
- Guias de moderação e segurança

---

**Data da Conclusão:** Fevereiro 2026  
**Versão:** 1.0.0  
**Status:** Produção
