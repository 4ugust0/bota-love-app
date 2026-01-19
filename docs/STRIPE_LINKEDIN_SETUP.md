# 💳 Configuração do Stripe (PIX) e LinkedIn - Bota Love

Este documento descreve como configurar as integrações de pagamento via PIX (Stripe) e LinkedIn OAuth.

## 📋 Índice

1. [Configuração do Stripe PIX](#configuração-do-stripe-pix)
2. [Configuração do LinkedIn OAuth](#configuração-do-linkedin-oauth)
3. [Variáveis de Ambiente](#variáveis-de-ambiente)
4. [Deploy das Cloud Functions](#deploy-das-cloud-functions)
5. [Testes](#testes)

---

## 💳 Configuração do Stripe PIX

### Sobre a Integração

O Stripe é usado **apenas como gateway de pagamento PIX**. Os valores dos produtos vêm do Firebase/backend do app, não do Stripe Dashboard. Isso significa que:

- ✅ Não é necessário criar produtos no Stripe Dashboard
- ✅ Os preços são definidos dinamicamente no app
- ✅ O dono do app recebe o valor diretamente na conta Stripe
- ✅ PIX expira em 30 minutos (configurável)

### 1. Criar conta no Stripe

1. Acesse [stripe.com](https://stripe.com) e crie uma conta
2. Complete a verificação de identidade (obrigatório para receber pagamentos)
3. Ative PIX como método de pagamento em **Settings > Payment methods > PIX**

### 2. Configurar Conta para Brasil

1. Vá em **Settings > Business settings**
2. Configure o país como Brasil
3. Adicione sua conta bancária para receber os pagamentos
4. Configure os dados fiscais (CNPJ ou CPF)

### 3. Obter Chaves da API

Em **Developers > API Keys**:
- **Publishable Key**: `pk_test_...` ou `pk_live_...` (usada no app)
- **Secret Key**: `sk_test_...` ou `sk_live_...` (usada nas Cloud Functions)

### 4. Configurar Webhook

1. Vá em **Developers > Webhooks**
2. Adicione um endpoint: `https://southamerica-east1-<project-id>.cloudfunctions.net/stripeWebhook`
3. Selecione os eventos:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.canceled`
4. Copie o **Webhook Signing Secret**: `whsec_...`

### 5. Fluxo de Pagamento

```
1. Usuário seleciona produto no app
2. App envia dados para Cloud Function (createPixPayment)
3. Cloud Function cria PaymentIntent no Stripe com PIX
4. Stripe retorna código PIX e QR Code
5. App exibe QR Code para o usuário pagar
6. Usuário paga via app do banco
7. Stripe envia webhook de confirmação
8. Cloud Function processa e ativa o produto/plano
```

---

## 💼 Configuração do LinkedIn OAuth

### 1. Criar App no LinkedIn

1. Acesse [LinkedIn Developers](https://www.linkedin.com/developers/)
2. Clique em **Create App**
3. Preencha os dados:
   - **App name**: Bota Love
   - **LinkedIn Page**: Sua página do LinkedIn
   - **Privacy policy URL**: URL da política de privacidade
   - **App logo**: Logo do app

### 2. Configurar Produtos

1. Vá na aba **Products**
2. Solicite acesso a:
   - **Sign In with LinkedIn using OpenID Connect** (obrigatório)

### 3. Configurar OAuth 2.0

1. Vá na aba **Auth**
2. Adicione as **Redirect URLs**:
   - Desenvolvimento: `botalove://linkedin-callback`
   - Produção: `botalove://linkedin-callback`
3. Copie:
   - **Client ID**
   - **Client Secret**

### 4. Escopos Necessários

```
openid
profile
email
```

### 5. Limitações da API

> **Importante**: A API do LinkedIn v2 tem acesso limitado. Dados detalhados como histórico de posições e educação requerem parceria oficial com o LinkedIn.

Dados disponíveis sem parceria:
- Nome completo
- Foto do perfil
- Email
- URL do perfil público

---

## 🔧 Variáveis de Ambiente

### No arquivo `.env` (raiz do projeto):

```env
# Stripe (apenas chave publicável)
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx

# LinkedIn OAuth
EXPO_PUBLIC_LINKEDIN_CLIENT_ID=xxx
EXPO_PUBLIC_LINKEDIN_CLIENT_SECRET=xxx
```

### Configurar Firebase Functions:

```bash
# Stripe
firebase functions:config:set stripe.secret_key="sk_xxx"
firebase functions:config:set stripe.webhook_secret="whsec_xxx"
```

Ou usando variáveis de ambiente do Functions v2 (arquivo `.env` dentro de `/functions`):

```env
STRIPE_SECRET_KEY=sk_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

---

## 🚀 Deploy das Cloud Functions

### 1. Instalar dependência do Stripe

```bash
cd functions
npm install stripe
npm install --save-dev @types/stripe
```

### 2. Deploy

```bash
# Deploy de todas as funções
firebase deploy --only functions

# Ou deploy individual
firebase deploy --only functions:createPixPayment
firebase deploy --only functions:getPixPaymentStatus
firebase deploy --only functions:getPaymentHistory
firebase deploy --only functions:cancelPixPayment
firebase deploy --only functions:stripeWebhook
```

### 3. Verificar Logs

```bash
firebase functions:log --only createPixPayment
firebase functions:log --only stripeWebhook
```

---

## 🧪 Testes

### Testando PIX no Stripe (Modo Teste)

No modo teste, o Stripe simula pagamentos PIX. Use o Dashboard do Stripe para simular a confirmação:

1. Crie um pagamento PIX pelo app
2. Vá em **Payments** no Dashboard do Stripe
3. Encontre o pagamento pendente
4. Clique em **Succeed** para simular confirmação

### Testando em Produção

Em produção, use PIX real:
1. Crie um pagamento PIX pelo app
2. Escaneie o QR Code com o app do seu banco
3. Faça o pagamento
4. Aguarde a confirmação (geralmente instantânea)

### Verificar Pagamentos no Firebase

No Firebase Console, verifique:
- Collection `payments` - todos os pagamentos
- Documento do usuário em `users/{userId}` - assinatura atualizada

---

## 📊 Estrutura de Dados no Firestore

### Payment Document

```json
{
  "id": "pi_xxx",
  "userId": "user123",
  "productId": "premium_monthly",
  "productName": "Premium Mensal",
  "category": "premium",
  "amount": 4990,
  "currency": "brl",
  "status": "pending | succeeded | failed | expired | canceled",
  "pixCode": "00020126...",
  "pixQrCode": "https://...",
  "expiresAt": "2026-01-06T12:30:00.000Z",
  "paidAt": "...",
  "createdAt": "...",
  "metadata": {}
}
```

### User Document (após pagamento)

```json
{
  "stripe": {
    "customerId": "cus_xxx"
  },
  "subscription": {
    "plan": "premium_monthly",
    "status": "active",
    "startDate": "...",
    "endDate": "...",
    "paidAt": "..."
  },
  "networkRural": {
    "isActive": true,
    "subscription": {
      "plan": "lifetime",
      "status": "active",
      "isLifetime": true
    }
  },
  "inventory": {
    "superLikes": 15,
    "boosts": 5
  }
}
```

---

## 🆘 Troubleshooting

### Erro: "PIX não disponível"
- Certifique-se de ter ativado PIX em **Settings > Payment methods**
- A conta precisa estar verificada e no Brasil

### Erro: "Webhook signature verification failed"
- Verifique se o webhook secret está correto
- Certifique-se de usar `req.rawBody` na função

### PIX expira muito rápido
- O padrão é 30 minutos, ajuste `PIX_EXPIRATION_MINUTES` na Cloud Function

### Pagamento não está sendo confirmado
- Verifique os logs do webhook: `firebase functions:log --only stripeWebhook`
- Confirme que o webhook está recebendo eventos no Dashboard

### LinkedIn OAuth não funciona
- Verifique se as Redirect URLs estão corretas
- Confira se o app tem os produtos necessários ativados
- O deep link `botalove://` deve estar configurado no app.json

---

## 📚 Referências

- [Stripe PIX Documentation](https://stripe.com/docs/payments/pix)
- [Stripe PaymentIntents](https://stripe.com/docs/api/payment_intents)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [LinkedIn OAuth 2.0](https://learn.microsoft.com/en-us/linkedin/shared/authentication/authorization-code-flow)
