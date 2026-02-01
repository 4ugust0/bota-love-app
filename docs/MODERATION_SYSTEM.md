# 🔒 Sistema de Moderação de Conteúdo - REGEX + IA

## Visão Geral

O Bota Love App utiliza um sistema de moderação em camadas para garantir a segurança de todos os usuários. O sistema analisa automaticamente:

- **Bio do perfil**: Validada ao salvar o perfil
- **Mensagens de chat**: Validadas antes do envio

## Fluxo de Moderação

```
1️⃣ REGEX → Detecta palavras sensíveis
2️⃣ REGEX de disfarce → Detecta p3ni$, inst4, s3xo
3️⃣ IA → Interpreta intenção (segunda camada)
4️⃣ Categoria → Decide ação (allow, block, flag, escalate)
5️⃣ Mensagem → Mostra razão ao usuário
6️⃣ Log → Salva registro para auditoria
```

## Categorias de Violação

| Categoria | Descrição | Ação |
|-----------|-----------|------|
| `child_exploitation` | Pedofilia / Aliciamento de menores | 🚨 ESCALATE (imediato) |
| `grooming` | Tentativas de aliciamento | 🚨 ESCALATE (imediato) |
| `violence` | Ameaças / Violência / Estupro | 🚨 ESCALATE |
| `drugs` | Tráfico / Venda de drogas | 🚨 ESCALATE |
| `fraud` | Golpes / Extorsão / Fraude | 🚨 ESCALATE |
| `hate` | Racismo / Discurso de ódio | 🚨 ESCALATE |
| `sexual_explicit` | Pornografia / Conteúdo sexual explícito | ⛔ BLOCK |
| `self_harm` | Suicídio / Automutilação | ⚠️ FLAG (com ajuda) |
| `contact_external` | Instagram / WhatsApp / Telefone | ⛔ BLOCK |
| `profanity` | Palavrões / Ofensas | ⛔ BLOCK |

## Ações Disponíveis

- **ALLOW**: Conteúdo aprovado, pode prosseguir
- **BLOCK**: Conteúdo bloqueado, usuário vê mensagem de erro
- **FLAG**: Conteúdo suspeito, requer revisão humana + mostra ajuda
- **ESCALATE**: Conteúdo crítico, sinalizado para equipe de segurança

## Padrões REGEX Implementados

### 1. Conteúdo Sexual Explícito

```regex
/\b(?:p[e3]n[i1l!í]s?|p[i1!]nt[o0]?|p[a@4]u|p[i1!]r[o0]c[a4]|r[o0]l[a4])\b/gi
/\b(?:b[o0]qu[e3]t[e3]|ch[uú]p(?:ar)?|f[o0]d[e3]r?|tr[a@4]ns[a@4]r|g[o0]z[a@4]r?)\b/gi
/\b(?:s[e3]x[o0]|s[e3]ks?|sxx[o0]?|n[uú]d[e3]s?|n[uú]dz?)\b/gi
/\b(?:sugar\s*daddy|sugar\s*mommy|sugar\s*baby|patrocínio|acompanhante)\b/gi
```

### 2. Exploração Infantil (CRÍTICO)

```regex
/\b(?:pedofilia|ped[oó]filo|pedófila)\b/gi
/\b(?:aliciar\s+menor|aliciamento)\b/gi
/\b(?:grooming)\b/gi
/\b(?:explora[çc][aã]o\s+infantil|explora[çc][aã]o\s+de\s+menor)\b/gi
/\b(?:crian[çc]a|menor)\s+(?:nua?|pelad[ao]|gostosa?)\b/gi
```

### 3. Contatos Externos

```regex
/(?:@[A-Za-z0-9._]{2,30})/gi              // @username
/\b(?:insta(?:gram)?|ig)\s*[:\s]?\s*@?[A-Za-z0-9._]+/gi
/\b(?:whats?app?|zap|zuap|wpp|wts|whats)\b/gi
/(?:\+?\s*55\s*)?(?:\(?\d{2}\)?\s*)?9?\d{4}[-.\s]?\d{4}/gi  // Telefone BR
/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi          // Email
```

### 4. Disfarces Detectados

O sistema detecta tentativas de burlar filtros:

- `i.n.s.t.a` → `insta`
- `1nst4gr4m` → `instagram`
- `s3x0` → `sexo`
- `p3n1s` → `penis`
- `wh4ts4pp` → `whatsapp`

## Mensagens para o Usuário

### Bio com Contato Externo
```
Sua descrição contém informações que não são permitidas. Para proteger todos os usuários, 
o aplicativo não aceita Instagram, links, telefones ou qualquer tipo de contato externo. 
Por favor, edite sua bio antes de continuar!
```

### Chat - Usuário FREE
```
Envio de contatos externos é um recurso Premium. 
Assine para liberar o envio de links e números.
```

### Conteúdo Sexual
```
Conteúdo sexual não é permitido no aplicativo. 
Mantenha sua bio e suas conversas respeitosas.
```

### Conteúdo Crítico (ESCALATE)
```
Conteúdo proibido detectado. Sua conta foi sinalizada para análise — 
nossa equipe de segurança entrará em contato se necessário.
```

### Auto-lesão / Suicídio
```
⚠️ Notamos linguagem sobre autoferimento. Se você estiver em risco, 
procure ajuda imediata. CVV: 188 (24h) - www.cvv.org.br
```

## Integração com IA

O sistema possui preparação para integração com IA (OpenAI, Claude, etc.) como segunda camada de moderação. O prompt utilizado:

```
Você é um moderador automatizado para um aplicativo de relacionamento. 
Analise o texto USER_TEXT e responda SOMENTE em JSON com os campos:
- action: "allow" | "block" | "flag" | "escalate"
- category: uma das categorias definidas
- confidence: número entre 0 e 1
- explain: breve justificativa (1-2 frases)
```

### Implementação da IA

Para ativar a IA, edite a função `callModerationAI` em `services/advancedModerationService.ts`:

```typescript
async function callModerationAI(content: string) {
  // Chamada real à API
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: AI_MODERATION_PROMPT },
        { role: 'user', content: `USER_TEXT: ${content}` },
      ],
      temperature: 0,
      max_tokens: 200,
    }),
  });
  
  const result = await response.json();
  return JSON.parse(result.choices[0].message.content);
}
```

## Arquivos Relacionados

- `services/advancedModerationService.ts` - Serviço principal de moderação
- `services/bioValidationService.ts` - Validação básica de bio
- `data/contentModerationService.ts` - Serviço legado de moderação
- `firebase/chatService.ts` - Integração no chat
- `app/edit-profile.tsx` - Integração na bio
- `app/chat/[id].tsx` - Tela de chat com moderação

## Logs e Auditoria

Todas as tentativas de moderação são logadas com:

```typescript
{
  timestamp: Date,
  userId: string,
  contentType: 'bio' | 'chat',
  originalContent: string,
  matchedRegex: string[],
  aiResponse?: any,
  actionTaken: ModerationAction,
  category: ModerationCategory,
}
```

## Usuários Premium

Usuários premium têm permissão para:
- ✅ Enviar contatos externos no **CHAT** (Instagram, WhatsApp, etc.)

Usuários premium **NÃO** podem:
- ❌ Incluir contatos na **BIO** (aplica a todos)
- ❌ Enviar conteúdo sexual/violento/ilegal (aplica a todos)

## Escalação

Quando `action === 'escalate'`:

1. Conta é sinalizada no Firebase
2. Equipe de segurança é notificada
3. Usuário recebe mensagem genérica
4. Conteúdo e contexto são preservados para análise

## Manutenção

### Adicionar novos padrões REGEX

Edite as constantes em `advancedModerationService.ts`:

```typescript
const SEXUAL_EXPLICIT_PATTERNS: RegExp[] = [
  // Adicione novos padrões aqui
  /\bnovo_padrao\b/gi,
];
```

### Adicionar nova categoria

1. Adicione o tipo em `ModerationCategory`
2. Crie array de padrões `NEW_CATEGORY_PATTERNS`
3. Adicione ao `CATEGORY_PATTERNS`
4. Adicione mensagem em `MODERATION_MESSAGES`
5. Defina se é crítica em `CRITICAL_CATEGORIES`

---

**Última atualização**: Janeiro 2026  
**Versão**: 2.0 (REGEX + IA)
