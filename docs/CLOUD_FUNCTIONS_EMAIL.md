# 🔥 Cloud Functions - Email/Auth

## Visão Geral

Este módulo contém as Cloud Functions para autenticação e envio de emails do Bota Love App.

## Estrutura

```
functions/
├── src/
│   ├── index.ts                    # Entry point - inicializa Firebase Admin e exporta funções
│   ├── auth/
│   │   ├── sendVerificationEmail.ts   # Envia email de verificação
│   │   └── resendVerificationCode.ts  # Gera novo código e reenvia email
│   ├── templates/
│   │   └── emailTemplates.ts       # Templates HTML dos emails
│   └── utils/
│       └── emailService.ts         # Configuração Nodemailer e utilitários
├── lib/                            # Código compilado (gerado)
├── package.json
└── tsconfig.json
```

## Funções Disponíveis

### 1. `sendVerificationEmail`

**Tipo:** HTTP Callable  
**Região:** southamerica-east1

Envia email com código de verificação de 6 dígitos.

**Parâmetros:**
```typescript
{
  userId: string;    // ID do usuário
  email: string;     // Email do destinatário
  name: string;      // Nome do usuário
  code: string;      // Código de 6 dígitos
}
```

**Resposta:**
```typescript
{
  success: boolean;
  message: string;
  messageId?: string;  // ID do email enviado
}
```

### 2. `resendVerificationCode`

**Tipo:** HTTP Callable  
**Região:** southamerica-east1

Gera novo código, atualiza no Firestore e reenvia por email.

**Parâmetros:**
```typescript
{
  userId: string;    // ID do usuário
  email?: string;    // Opcional - busca do Firestore se não fornecido
  name?: string;     // Opcional - busca do Firestore se não fornecido
}
```

**Resposta:**
```typescript
{
  success: boolean;
  message: string;
  expiresAt?: string;  // Data/hora de expiração do código
}
```

## Rate Limiting

- **sendVerificationEmail:** Máximo 3 tentativas por hora
- **resendVerificationCode:** Máximo 3 reenvios por hora

Dados armazenados nas collections:
- `emailRateLimits/{userId}` - controle de envios
- `resendRateLimits/{userId}` - controle de reenvios

## Configuração do SMTP

### 1. Configurar Secrets no Firebase

```bash
# Host do servidor SMTP
firebase functions:secrets:set SMTP_HOST

# Porta (587 para TLS, 465 para SSL)
firebase functions:secrets:set SMTP_PORT

# Usuário de autenticação
firebase functions:secrets:set SMTP_USER

# Senha de autenticação
firebase functions:secrets:set SMTP_PASS

# Nome do remetente (opcional, default: "Bota Love")
firebase functions:secrets:set SMTP_FROM_NAME

# Email do remetente (opcional, usa SMTP_USER se não definido)
firebase functions:secrets:set SMTP_FROM_EMAIL
```

### 2. Exemplo com Gmail

```bash
# Para Gmail, ative "Senhas de app" em https://myaccount.google.com/apppasswords
firebase functions:secrets:set SMTP_HOST  # smtp.gmail.com
firebase functions:secrets:set SMTP_PORT  # 587
firebase functions:secrets:set SMTP_USER  # seu-email@gmail.com
firebase functions:secrets:set SMTP_PASS  # sua-senha-de-app (16 caracteres)
```

### 3. Exemplo com SendGrid

```bash
firebase functions:secrets:set SMTP_HOST  # smtp.sendgrid.net
firebase functions:secrets:set SMTP_PORT  # 587
firebase functions:secrets:set SMTP_USER  # apikey
firebase functions:secrets:set SMTP_PASS  # SG.xxxxx (sua API key)
```

## Deploy

### Primeiro deploy
```bash
cd functions
npm install
npm run build
firebase deploy --only functions
```

### Deploy de funções específicas
```bash
firebase deploy --only functions:sendVerificationEmail,functions:resendVerificationCode
```

## Testes Locais

### Usando o Emulador
```bash
cd functions
npm run serve
```

### Testando no Shell
```bash
npm run shell
# No shell:
sendVerificationEmail({userId: "test123", email: "test@example.com", name: "João", code: "123456"})
```

## Collections do Firestore

### `emailRateLimits`
```typescript
{
  userId: string;
  attempts: number[];  // Timestamps das tentativas
  lastAttempt: Timestamp;
  updatedAt: Timestamp;
}
```

### `resendRateLimits`
```typescript
{
  userId: string;
  attempts: number[];  // Timestamps dos reenvios
  lastAttempt: Timestamp;
  updatedAt: Timestamp;
}
```

### `emailLogs`
```typescript
{
  userId: string;
  email: string;
  type: 'verification' | 'resend_verification';
  status: 'sent' | 'failed';
  messageId?: string;
  attemptNumber?: number;
  createdAt: Timestamp;
}
```

## Template do Email

O email de verificação inclui:
- 🎨 Design responsivo com cores do tema rural
- 📧 Logo/branding do Bota Love
- 👤 Saudação personalizada com nome
- 🔢 Código em destaque (formato: 123456)
- ⏱️ Indicador de validade (30 minutos)
- 🔒 Aviso de segurança
- 📱 Compatível com clientes de email mobile e desktop

## Tratamento de Erros

| Código | Descrição |
|--------|-----------|
| `invalid-argument` | Dados incompletos ou inválidos |
| `not-found` | Usuário não encontrado |
| `resource-exhausted` | Rate limit excedido |
| `failed-precondition` | Email já verificado |
| `internal` | Erro interno (SMTP, Firestore, etc) |

## Logs

Todas as funções logam informações detalhadas para debugging:

```bash
# Ver logs em tempo real
firebase functions:log --only sendVerificationEmail

# Ver logs das últimas 24h
firebase functions:log --only resendVerificationCode --follow
```

Emojis nos logs para identificação rápida:
- ✅ Sucesso
- ❌ Erro
- ⚠️ Aviso
- 📧 Email
- 🔢 Código
- 📊 Métricas
- 💾 Firestore
