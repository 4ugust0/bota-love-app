/**
 * 🔒 BOTA LOVE APP - Sistema Avançado de Moderação
 * 
 * REGEX + IA para detectar:
 * - Ofensas e palavrões
 * - Dados pessoais (telefone, email, redes sociais)
 * - Conteúdo sexual explícito e disfarçado
 * - Exploração infantil / pedofilia
 * - Drogas e tráfico
 * - Fraude / golpes / extorsão
 * - Terrorismo / discurso de ódio
 * - Tentativas de suicídio / autolesão
 * - Tentativas de burlar filtros
 * 
 * FLUXO DE MODERAÇÃO:
 * 1. REGEX → detecta palavras sensíveis
 * 2. REGEX de disfarce → detecta p3ni$ / inst4 / s3xo
 * 3. IA → interpreta intenção
 * 4. Categoria → decide ação (allow, block, flag, escalate)
 * 5. Mensagem automática → mostra razão
 * 6. Log e auditoria → salva registro
 * 
 * @author Bota Love Team
 */

// ============================================
// 📊 TIPOS E INTERFACES
// ============================================

export type ModerationAction = 'allow' | 'block' | 'flag' | 'escalate';

export type ModerationCategory = 
  | 'sexual_explicit'
  | 'child_exploitation'
  | 'grooming'
  | 'drugs'
  | 'fraud'
  | 'violence'
  | 'hate'
  | 'self_harm'
  | 'contact_external'
  | 'profanity'
  | 'spam'
  | 'other';

export interface AdvancedModerationResult {
  action: ModerationAction;
  category: ModerationCategory | null;
  confidence: number;
  explanation: string;
  matchedPatterns: string[];
  isCritical: boolean;
  requiresHumanReview: boolean;
  userMessage: string;
}

export interface ModerationLog {
  timestamp: Date;
  userId: string;
  contentType: 'bio' | 'chat';
  originalContent: string;
  matchedRegex: string[];
  aiResponse?: any;
  actionTaken: ModerationAction;
  category: ModerationCategory | null;
}

// ============================================
// 🔍 REGEX PATTERNS POR CATEGORIA
// ============================================

/**
 * CATEGORIA 1: Conteúdo Sexual Explícito e Disfarçado (PT/EN)
 */
const SEXUAL_EXPLICIT_PATTERNS: RegExp[] = [
  // Órgãos e atos sexuais (com disfarces)
  /\b(?:p[e3]n[i1l!í]s?|p[i1!]nt[o0]?|p[a@4]u|p[i1!]r[o0]c[a4]|r[o0]l[a4])\b/gi,
  /\b(?:b[o0]qu[e3]t[e3]|ch[uú]p(?:ar)?|f[o0]d[e3]r?|tr[a@4]ns[a@4]r|g[o0]z[a@4]r?)\b/gi,
  /\b(?:s[e3]x[o0]|s[e3]ks?|sxx[o0]?|n[uú]d[e3]s?|n[uú]dz?)\b/gi,
  /\b(?:6?9|69|a[nm]al|0r[a4]l|b[i1!]g[cç]k|c[o0]c[kq])\b/gi,
  /\b(?:t[e3]s[a4][o0]|t[e3]s[uú]d[o0]|s[a4]f[a4]d[ao0])\b/gi,
  /\b(?:bucet[a@]|xoxota|xan[a@]|ppk|vagina|xereca)\b/gi,
  /\b(?:porn[oô]|pornografia|hentai|xxx)\b/gi,
  /\b(?:oral|boquete|chupar|mamar|engolir)\b/gi,
  /\b(?:nudes?|pack|conteúdo\s+adulto|cam\s*girl|cam\s*boy)\b/gi,
  /\b(?:sugar\s*daddy|sugar\s*mommy|sugar\s*baby|patrocínio|acompanhante)\b/gi,
  /\b(?:sem\s+compromisso|casual|amizade\s+colorida|one\s+night)\b/gi,
  /\b(?:só\s+(?:sexo|uma\s+noite|diversão))\b/gi,
  /\b(?:boobs?|tits|pussy|dick|cock|ass\s+fuck)\b/gi,
  // Disfarces com caracteres especiais
  /(?:[s5][\W_]*e[\W_]*x[\W_]*o)/gi,
  /(?:p[\W_]*e[\W_]*n[\W_]*i[\W_]*s)/gi,
  /(?:n[\W_]*u[\W_]*d[\W_]*e[\W_]*s)/gi,
];

/**
 * CATEGORIA 2: Exploração Infantil / Pedofilia (CRÍTICO)
 */
const CHILD_EXPLOITATION_PATTERNS: RegExp[] = [
  /\b(?:pedofilia|ped[oó]filo|pedófila)\b/gi,
  /\b(?:aliciar\s+menor|aliciamento)\b/gi,
  /\b(?:grooming)\b/gi,
  /\b(?:explora[çc][aã]o\s+infantil|explora[çc][aã]o\s+de\s+menor)\b/gi,
  /\b(?:abuso\s+infantil|abuso\s+de\s+menor|abuso\s+de\s+crian[çc]a)\b/gi,
  /\b(?:crian[çc]a|menor)\s+(?:nua?|pelad[ao]|gostosa?)\b/gi,
  /\b(?:cp|loli|shota)\b/gi,
];

/**
 * CATEGORIA 3: Violência / Estupro / Assédio
 */
const VIOLENCE_PATTERNS: RegExp[] = [
  /\b(?:estupro|estuprar|violentar)\b/gi,
  /\b(?:viol[eê]ncia\s+sexual|abuso\s+sexual|assediar|ass[eé]dio)\b/gi,
  /\b(?:coagir|amea[çc]a|amea[çc]ar)\b/gi,
  /\b(?:vou\s+te\s+(?:matar|pegar|ca[çc]ar|encontrar))\b/gi,
  /\b(?:sei\s+onde\s+(?:você|vc|tu)\s+(?:mora|trabalha|estuda))\b/gi,
  /\b(?:cuidado|tome\s+cuidado|se\s+cuida)\b/gi,
  /\b(?:some|desaparece|morre)\b/gi,
];

/**
 * CATEGORIA 4: Drogas / Tráfico
 */
const DRUGS_PATTERNS: RegExp[] = [
  /\b(?:droga[s]?|trafic[oa]nte?|vender\s+drogas|comprar\s+drogas)\b/gi,
  /\b(?:coca[ií]na|crack|maconha|hero[ií]na|metanfetamina)\b/gi,
  /\b(?:ecstasy|LSD|ketamina|md|mdma|lsd|cogumelo)\b/gi,
  /\b(?:baseado|beck|bagulho|pó|pedra|carreirinha)\b/gi,
  /\b(?:plantação|cultivo)\s+(?:de)?\s*(?:maconha|cannabis)\b/gi,
];

/**
 * CATEGORIA 5: Fraude / Golpes / Extorsão
 */
const FRAUD_PATTERNS: RegExp[] = [
  /\b(?:estelionat[oá]rio|estelionato|golpe|golpista)\b/gi,
  /\b(?:fraude|fraudar|extors[aã]o|extorquir|chantagem)\b/gi,
  /\b(?:pix\s+pra\s+mim|depositar\s+dinheiro|transferir\s+dinheiro|enviar\s+dinheiro)\b/gi,
  /\b(?:me\s+ajuda\s+financeiramente|preciso\s+de\s+dinheiro)\b/gi,
  /\b(?:ganhe\s+dinheiro|renda\s+extra|trabalhe\s+em\s+casa)\b/gi,
  /\b(?:investimento|bitcoin|cripto)\s+(?:garantido|rendimento|lucro)\b/gi,
  /\b(?:cartão|cartao)\s+(?:clonado|limite)\b/gi,
  /\b(?:empréstimo|emprestimo)\s+(?:fácil|facil|rápido|rapido)\b/gi,
];

/**
 * CATEGORIA 6: Terrorismo / Ódio / Extremismo
 */
const HATE_PATTERNS: RegExp[] = [
  /\b(?:terrorismo|terrorista|extremismo|extremista)\b/gi,
  /\b(?:racismo|racista|nazista?|fascista?)\b/gi,
  /\b(?:xenofobia|homofobia|transfobia)\b/gi,
  /\b(?:incitar\s+[oó]dio|discurso\s+de\s+[oó]dio)\b/gi,
  /\b(?:morte\s+(?:a|aos?|às?)|abaixo)\s+(?:os?|as?|todos?)/gi,
  /\b(?:preto|negro|macaco)\s+(?:lixo|nojento|fedido)\b/gi,
  /\b(?:nordestino|baiano)\s+(?:lixo|vagabundo|preguiçoso)\b/gi,
  /\b(?:gay|viado|traveco|trans)\s+(?:lixo|nojento|doente)\b/gi,
];

/**
 * CATEGORIA 7: Suicídio / Autolesão
 */
const SELF_HARM_PATTERNS: RegExp[] = [
  /\b(?:suic[ií]dio|suicidar)\b/gi,
  /\b(?:me\s+mat(?:ar|o)|me\s+quero\s+matar)\b/gi,
  /\b(?:tirar\s+(?:a|minha)\s+vida)\b/gi,
  /\b(?:automutila[rç][aã]o|me\s+cortar|me\s+machucar)\b/gi,
  /\b(?:não\s+aguento\s+mais|quero\s+morrer)\b/gi,
];

/**
 * CATEGORIA 8: Tentativas de Contato Externo
 */
const CONTACT_EXTERNAL_PATTERNS: RegExp[] = [
  // Instagram e variações
  /(?:@[A-Za-z0-9._]{2,30})/gi,
  /(?:instagram\.com|insta\.com)/gi,
  /\b(?:insta(?:gram)?|ig)\s*[:\s]?\s*@?[A-Za-z0-9._]+/gi,
  /\b(?:arroba|meu\s*user|meu\s*perfil|me\s*chama\s*no|me\s*segue)\b/gi,
  // Instagram disfarçado
  /(?:i[\W_]*n[\W_]*s[\W_]*t[\W_]*a)/gi,
  
  // WhatsApp e variações
  /\b(?:whats?app?|zap|zuap|wpp|wts|whats)\b/gi,
  /\b(?:me\s*chama\s*no)\s*(?:zap|whats)/gi,
  
  // Telefone brasileiro
  /(?:\+?\s*55\s*)?(?:\(?\d{2}\)?\s*)?9?\d{4}[-.\s]?\d{4}/gi,
  /\b\d{8,13}\b/g,
  
  // Links e domínios
  /(?:https?:\/\/|www\.)[^\s]+/gi,
  /\b[a-z0-9-]+\.(?:com|net|org|br|io|me|tv|app|xyz|site|link|bio|ly)\b/gi,
  
  // Telegram
  /\b(?:telegram|tele|tg|t\.me)\s*[:\s@]?\s*[A-Za-z0-9_]+/gi,
  
  // Email
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi,
  
  // Direct/DM
  /\b(?:direct|dm)\b/gi,
];

/**
 * CATEGORIA 9: Palavrões e Ofensas
 */
const PROFANITY_PATTERNS: RegExp[] = [
  /\b(?:put[a@]|puta|caralh[o0@]|cuz[aã][o0]|bucet[a@]|fdp|vsf|vtnc|pqp)\b/gi,
  /\b(?:merda|bost[a@]|porra|cacete|foder|fod[ae])\b/gi,
  /\b(?:arrombad[o@a]|desgra[çc]a|inferno)\b/gi,
  /\b(?:viado|viad[o@]|bicha|sapatao|sapatã[o0])\b/gi,
  /\b(?:feia|fei[o0]|gord[ao@]|nojent[ao@]|horrível|horrorosa?)\b/gi,
  /\b(?:otário|idiota|imbecil|retardado|burro)\b/gi,
  // Com censura parcial
  /\b\w*\*+\w*\b/g,
];

// ============================================
// 📋 MAPEAMENTO DE CATEGORIAS
// ============================================

const CATEGORY_PATTERNS: Record<ModerationCategory, RegExp[]> = {
  sexual_explicit: SEXUAL_EXPLICIT_PATTERNS,
  child_exploitation: CHILD_EXPLOITATION_PATTERNS,
  grooming: CHILD_EXPLOITATION_PATTERNS, // Usa os mesmos padrões
  drugs: DRUGS_PATTERNS,
  fraud: FRAUD_PATTERNS,
  violence: VIOLENCE_PATTERNS,
  hate: HATE_PATTERNS,
  self_harm: SELF_HARM_PATTERNS,
  contact_external: CONTACT_EXTERNAL_PATTERNS,
  profanity: PROFANITY_PATTERNS,
  spam: [], // Tratado separadamente
  other: [],
};

// Categorias que requerem escalonamento IMEDIATO
const CRITICAL_CATEGORIES: ModerationCategory[] = [
  'child_exploitation',
  'grooming',
  'violence',
  'drugs',
  'fraud',
  'hate',
];

// Categorias que requerem revisão humana
const REVIEW_CATEGORIES: ModerationCategory[] = [
  'self_harm',
  'violence',
  'fraud',
];

// ============================================
// 📝 MENSAGENS PARA O USUÁRIO
// ============================================

export const MODERATION_MESSAGES: Record<ModerationCategory | 'default', string> = {
  sexual_explicit: 'Conteúdo sexual não é permitido no aplicativo. Mantenha sua bio e suas conversas respeitosas.',
  child_exploitation: 'Conteúdo proibido detectado. Sua conta foi sinalizada para análise — nossa equipe de segurança entrará em contato se necessário.',
  grooming: 'Conteúdo proibido detectado. Sua conta foi sinalizada para análise — nossa equipe de segurança entrará em contato se necessário.',
  drugs: 'Conteúdo relacionado a substâncias ilícitas não é permitido.',
  fraud: 'Conteúdo suspeito de fraude ou golpe detectado. Sua conta será analisada.',
  violence: 'Conteúdo violento ou ameaçador não é tolerado.',
  hate: 'Discurso de ódio não é tolerado em nossa plataforma.',
  self_harm: '⚠️ Notamos linguagem sobre autoferimento. Se você estiver em risco, procure ajuda imediata. CVV: 188 (24h) - www.cvv.org.br',
  contact_external: 'Sua descrição contém informações que não são permitidas. Para proteger todos os usuários, o aplicativo não aceita Instagram, links, telefones ou qualquer tipo de contato externo. Por favor, edite sua bio antes de continuar!',
  profanity: 'Vamos manter o respeito? Use uma linguagem mais apropriada.',
  spam: 'Conteúdo repetitivo ou spam detectado.',
  other: 'Este conteúdo viola nossas diretrizes. Por favor, revise e tente novamente.',
  default: 'Mensagem bloqueada — nosso app não permite esse tipo de conteúdo. Mantenha as conversas dentro das regras.',
};

// Mensagem para contato externo (usuário FREE)
export const CONTACT_EXTERNAL_FREE_MESSAGE = 
  'Envio de contatos externos é um recurso Premium. Assine para liberar o envio de links e números.';

// ============================================
// 🔍 FUNÇÕES DE DETECÇÃO POR REGEX
// ============================================

/**
 * Executa todos os regex de uma categoria e retorna matches
 */
function runCategoryRegex(content: string, category: ModerationCategory): string[] {
  const patterns = CATEGORY_PATTERNS[category];
  const matches: string[] = [];
  
  for (const pattern of patterns) {
    // Reset do lastIndex
    pattern.lastIndex = 0;
    const found = content.match(pattern);
    if (found) {
      matches.push(...found);
    }
  }
  
  return [...new Set(matches)]; // Remove duplicatas
}

/**
 * Verifica todas as categorias e retorna a mais grave
 */
function detectByRegex(content: string): {
  category: ModerationCategory | null;
  matches: string[];
  allCategories: ModerationCategory[];
} {
  const allMatches: Record<ModerationCategory, string[]> = {} as any;
  const detectedCategories: ModerationCategory[] = [];
  
  // Verificar categorias críticas primeiro
  for (const category of CRITICAL_CATEGORIES) {
    const matches = runCategoryRegex(content, category);
    if (matches.length > 0) {
      allMatches[category] = matches;
      detectedCategories.push(category);
    }
  }
  
  // Se encontrou categoria crítica, retorna imediatamente
  if (detectedCategories.length > 0) {
    const primaryCategory = detectedCategories[0];
    return {
      category: primaryCategory,
      matches: allMatches[primaryCategory],
      allCategories: detectedCategories,
    };
  }
  
  // Verificar outras categorias
  const otherCategories: ModerationCategory[] = [
    'sexual_explicit',
    'self_harm',
    'contact_external',
    'profanity',
  ];
  
  for (const category of otherCategories) {
    const matches = runCategoryRegex(content, category);
    if (matches.length > 0) {
      allMatches[category] = matches;
      detectedCategories.push(category);
    }
  }
  
  if (detectedCategories.length > 0) {
    const primaryCategory = detectedCategories[0];
    return {
      category: primaryCategory,
      matches: allMatches[primaryCategory],
      allCategories: detectedCategories,
    };
  }
  
  return {
    category: null,
    matches: [],
    allCategories: [],
  };
}

// ============================================
// 🤖 PROMPT PARA IA (Segunda Camada)
// ============================================

export const AI_MODERATION_PROMPT = `
Você é um moderador automatizado para um aplicativo de relacionamento. Analise o texto USER_TEXT e responda SOMENTE em JSON com os campos:
- action: "allow" | "block" | "flag" | "escalate"
- category: uma das: "sexual_explicit", "child_exploitation", "grooming", "drugs", "fraud", "violence", "hate", "self_harm", "contact_external", "other"
- confidence: número entre 0 e 1
- explain: breve justificativa (1-2 frases)

Regras:
- Se o texto indicar exploração sexual de menores, grooming, pedofilia → action = "escalate".
- Se o texto contiver pornografia explícita ou convite sexual explícito entre adultos → action = "block".
- Se o texto contiver pedidos de dinheiro, extorsão, tentativa de golpe → action = "escalate".
- Se o texto mencionar tráfico de drogas, compra/venda → action = "escalate".
- Se o texto mencionar suicídio ou automutilação → action = "flag" (mostrar ajuda e escalar para suporte humano).
- Se o texto pedir contato externo (Instagram, WhatsApp, telefone) → action = "block".
- Se dúvida ou linguagem ambígua com conotação sexual → action = "flag".
- Se o texto contiver duplo sentido sexual ou gírias sexuais disfarçadas → action = "block".
- Se não houver problemas → action = "allow".

Retorne apenas o JSON. Não explique nada fora do JSON.

Texto a analisar:
`;

/**
 * Simula resposta da IA para moderação
 * Em produção, substituir por chamada real à API (OpenAI, etc.)
 */
async function callModerationAI(content: string): Promise<{
  action: ModerationAction;
  category: ModerationCategory;
  confidence: number;
  explain: string;
}> {
  // TODO: Implementar chamada real à API da IA
  // Por enquanto, retorna "allow" para textos que passaram pelo regex
  return {
    action: 'allow',
    category: 'other',
    confidence: 0.8,
    explain: 'Nenhum conteúdo problemático detectado pela IA.',
  };
}

// ============================================
// 🎯 FUNÇÃO PRINCIPAL DE MODERAÇÃO
// ============================================

/**
 * Modera conteúdo usando REGEX + IA
 * 
 * Fluxo:
 * 1. REGEX por categoria (críticas primeiro)
 * 2. REGEX de disfarce
 * 3. IA (se passar no regex)
 * 4. Retorna ação e mensagem
 */
export async function moderateContentAdvanced(
  content: string,
  contentType: 'bio' | 'chat',
  isPremiumUser: boolean = false
): Promise<AdvancedModerationResult> {
  // 1. Detectar por REGEX
  const regexResult = detectByRegex(content);
  
  // 2. Se encontrou categoria CRÍTICA, escalonar imediatamente
  if (regexResult.category && CRITICAL_CATEGORIES.includes(regexResult.category)) {
    return {
      action: 'escalate',
      category: regexResult.category,
      confidence: 1.0,
      explanation: `Conteúdo crítico detectado: ${regexResult.category}`,
      matchedPatterns: regexResult.matches,
      isCritical: true,
      requiresHumanReview: true,
      userMessage: MODERATION_MESSAGES[regexResult.category] || MODERATION_MESSAGES.default,
    };
  }
  
  // 3. Se encontrou auto-lesão, flag para ajuda
  if (regexResult.category === 'self_harm') {
    return {
      action: 'flag',
      category: 'self_harm',
      confidence: 0.9,
      explanation: 'Possível menção a autolesão detectada',
      matchedPatterns: regexResult.matches,
      isCritical: false,
      requiresHumanReview: true,
      userMessage: MODERATION_MESSAGES.self_harm,
    };
  }
  
  // 4. Se encontrou conteúdo sexual explícito, bloquear
  if (regexResult.category === 'sexual_explicit') {
    return {
      action: 'block',
      category: 'sexual_explicit',
      confidence: 0.95,
      explanation: 'Conteúdo sexual explícito detectado',
      matchedPatterns: regexResult.matches,
      isCritical: false,
      requiresHumanReview: false,
      userMessage: MODERATION_MESSAGES.sexual_explicit,
    };
  }
  
  // 5. Se encontrou contato externo
  if (regexResult.category === 'contact_external') {
    // Para usuários premium, pode ser permitido no chat
    if (isPremiumUser && contentType === 'chat') {
      return {
        action: 'allow',
        category: null,
        confidence: 1.0,
        explanation: 'Usuário premium pode enviar contatos no chat',
        matchedPatterns: [],
        isCritical: false,
        requiresHumanReview: false,
        userMessage: '',
      };
    }
    
    // Para bio ou usuário free, bloquear
    const message = contentType === 'bio' 
      ? MODERATION_MESSAGES.contact_external
      : CONTACT_EXTERNAL_FREE_MESSAGE;
      
    return {
      action: 'block',
      category: 'contact_external',
      confidence: 0.95,
      explanation: 'Tentativa de compartilhar contato externo',
      matchedPatterns: regexResult.matches,
      isCritical: false,
      requiresHumanReview: false,
      userMessage: message,
    };
  }
  
  // 6. Se encontrou palavrões
  if (regexResult.category === 'profanity') {
    return {
      action: 'block',
      category: 'profanity',
      confidence: 0.85,
      explanation: 'Linguagem inapropriada detectada',
      matchedPatterns: regexResult.matches,
      isCritical: false,
      requiresHumanReview: false,
      userMessage: MODERATION_MESSAGES.profanity,
    };
  }
  
  // 7. Se passou pelo REGEX, enviar para IA (segunda camada)
  try {
    const aiResult = await callModerationAI(content);
    
    if (aiResult.action !== 'allow') {
      return {
        action: aiResult.action,
        category: aiResult.category,
        confidence: aiResult.confidence,
        explanation: aiResult.explain,
        matchedPatterns: [],
        isCritical: aiResult.action === 'escalate',
        requiresHumanReview: aiResult.action === 'flag' || aiResult.action === 'escalate',
        userMessage: MODERATION_MESSAGES[aiResult.category] || MODERATION_MESSAGES.default,
      };
    }
  } catch (error) {
    console.error('Erro ao chamar IA de moderação:', error);
    // Em caso de erro na IA, permitir (fail-open com log)
  }
  
  // 8. Conteúdo aprovado
  return {
    action: 'allow',
    category: null,
    confidence: 1.0,
    explanation: 'Conteúdo aprovado',
    matchedPatterns: [],
    isCritical: false,
    requiresHumanReview: false,
    userMessage: '',
  };
}

// ============================================
// 🎯 FUNÇÕES ESPECÍFICAS POR CONTEXTO
// ============================================

/**
 * Modera biografia do usuário
 */
export async function moderateBio(bio: string): Promise<AdvancedModerationResult> {
  return moderateContentAdvanced(bio, 'bio', false);
}

/**
 * Modera mensagem de chat
 */
export async function moderateChatMessage(
  message: string,
  isPremiumUser: boolean = false
): Promise<AdvancedModerationResult> {
  return moderateContentAdvanced(message, 'chat', isPremiumUser);
}

// ============================================
// ✅ VERIFICAÇÕES RÁPIDAS (SÍNCRONAS)
// ============================================

/**
 * Verificação rápida se contém contato externo
 */
export function hasExternalContact(content: string): boolean {
  const matches = runCategoryRegex(content, 'contact_external');
  return matches.length > 0;
}

/**
 * Verificação rápida se contém conteúdo sexual
 */
export function hasSexualContent(content: string): boolean {
  const matches = runCategoryRegex(content, 'sexual_explicit');
  return matches.length > 0;
}

/**
 * Verificação rápida se contém conteúdo crítico
 */
export function hasCriticalContent(content: string): boolean {
  for (const category of CRITICAL_CATEGORIES) {
    const matches = runCategoryRegex(content, category);
    if (matches.length > 0) return true;
  }
  return false;
}

/**
 * Verificação rápida se deve bloquear
 */
export function shouldBlockContent(content: string, isPremium: boolean = false): boolean {
  // Sempre bloqueia conteúdo crítico
  if (hasCriticalContent(content)) return true;
  
  // Sempre bloqueia conteúdo sexual
  if (hasSexualContent(content)) return true;
  
  // Bloqueia contato externo para não-premium
  if (!isPremium && hasExternalContact(content)) return true;
  
  return false;
}

// ============================================
// 📊 LOGS E AUDITORIA
// ============================================

const moderationLogs: ModerationLog[] = [];

/**
 * Registra log de moderação
 */
export function logModerationAttempt(
  userId: string,
  contentType: 'bio' | 'chat',
  originalContent: string,
  result: AdvancedModerationResult
): void {
  const log: ModerationLog = {
    timestamp: new Date(),
    userId,
    contentType,
    originalContent,
    matchedRegex: result.matchedPatterns,
    actionTaken: result.action,
    category: result.category,
  };
  
  moderationLogs.push(log);
  
  // Em produção, enviar para backend/analytics
  console.log('[MODERATION LOG]', JSON.stringify(log, null, 2));
}

/**
 * Obtém logs de moderação (para admin)
 */
export function getModerationLogs(): ModerationLog[] {
  return [...moderationLogs];
}

// ============================================
// 🎯 EXPORTS
// ============================================

export default {
  moderateContentAdvanced,
  moderateBio,
  moderateChatMessage,
  hasExternalContact,
  hasSexualContent,
  hasCriticalContent,
  shouldBlockContent,
  logModerationAttempt,
  getModerationLogs,
  MODERATION_MESSAGES,
  AI_MODERATION_PROMPT,
};
