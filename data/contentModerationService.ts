/**
 * 🔒 BOTA LOVE APP - Sistema de Moderação de Conteúdo
 * 
 * Regex + IA de moderação para:
 * - Bio
 * - Chat/Mensagens
 * - Nome
 * - Conteúdo geral
 * 
 * ⚠️ SEMPRE ATIVO - independente do plano
 * 
 * @author Bota Love Team
 */

// ============================================
// 📊 TIPOS E INTERFACES
// ============================================

export type ModerationResult = 'safe' | 'warning' | 'blocked';
export type ContentType = 'bio' | 'message' | 'name' | 'general';

export interface ModerationResponse {
  result: ModerationResult;
  originalContent: string;
  sanitizedContent: string;
  violations: Violation[];
  score: number; // 0-100 (0 = seguro, 100 = muito perigoso)
}

export interface Violation {
  type: ViolationType;
  match: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
}

export type ViolationType = 
  | 'contact_info'      // Telefone, email, redes sociais
  | 'profanity'         // Palavrões e linguagem vulgar
  | 'spam'              // Spam e conteúdo repetitivo
  | 'scam'              // Golpes e tentativas de fraude
  | 'harassment'        // Assédio e ameaças
  | 'inappropriate'     // Conteúdo sexual explícito
  | 'external_links'    // Links externos
  | 'fake_profile'      // Indicadores de perfil falso
  | 'hate_speech';      // Discurso de ódio

// ============================================
// 🔍 PADRÕES REGEX PARA DETECÇÃO
// ============================================

const MODERATION_PATTERNS: Record<ViolationType, RegExp[]> = {
  // 📱 Informações de Contato
  contact_info: [
    // Telefones brasileiros (vários formatos)
    /\b(?:\+?55\s?)?(?:\(?\d{2}\)?\s?)?\d{4,5}[-.\s]?\d{4}\b/gi,
    // Telefones genéricos
    /\b\d{8,15}\b/g,
    // Emails
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/gi,
    // Instagram
    /\b(?:@|insta(?:gram)?:?\s*@?)[A-Za-z0-9_.]{3,30}\b/gi,
    // WhatsApp menções
    /\b(?:whats?app|zap|wpp|whats):?\s*[@]?[\d\s\-()]+/gi,
    // Telegram
    /\b(?:telegram|tele|tg):?\s*@?[A-Za-z0-9_]+/gi,
    // Snapchat
    /\b(?:snap(?:chat)?):?\s*@?[A-Za-z0-9_.]+/gi,
    // TikTok
    /\b(?:tik\s?tok):?\s*@?[A-Za-z0-9_.]+/gi,
    // Facebook
    /\b(?:face(?:book)?|fb):?\s*[\/]?[A-Za-z0-9_.]+/gi,
    // Twitter/X
    /\b(?:twitter|x\.com):?\s*@?[A-Za-z0-9_]+/gi,
    // LinkedIn
    /\b(?:linked\s?in):?\s*[\/]?[A-Za-z0-9_-]+/gi,
    // Números disfarçados
    /\b(?:zero|um|dois|tres|quatro|cinco|seis|sete|oito|nove|dez)[\s,-]*(?:zero|um|dois|tres|quatro|cinco|seis|sete|oito|nove|dez){7,}/gi,
    // Números com letras/símbolos no meio
    /\b\d+[oO0]\d+/gi,
    // "me chama no"
    /\b(?:me\s+)?(?:chama|manda|fala|add)\s+(?:no|na|pelo|pela)\s+\w+/gi,
  ],
  
  // 🤬 Palavrões e Linguagem Vulgar
  profanity: [
    /\b(?:put[a@]|puta|caralh[o0@]|cuzao|cuzã[o0]|bucet[a@]|fdp|vsf|vtnc|pqp|merda|bost[a@]|porra|cacete|foder|fod[ae]|arrombad[o@a]|desgraça|disgraça|inferno|viado|viad[o@]|bicha|sapatao|sapatã[o0])\b/gi,
    // Variações com símbolos
    /\b(?:p\*t[a@]|c@r@lh[o0]|f\*d[ae]r?)\b/gi,
    // Censura parcial comum
    /\b\w*\*+\w*\b/g, // palavras com asteriscos no meio
  ],
  
  // 📧 Spam e Conteúdo Repetitivo
  spam: [
    // Repetição excessiva de caracteres
    /(.)\1{4,}/gi,
    // Caps lock excessivo (mais de 5 palavras em caps)
    /\b[A-Z]{2,}\s+[A-Z]{2,}\s+[A-Z]{2,}\s+[A-Z]{2,}\s+[A-Z]{2,}/g,
    // Emojis excessivos
    /(?:[\u{1F300}-\u{1F9FF}][\u{FE00}-\u{FE0F}]?){10,}/gu,
    // Texto repetido
    /\b(\w{3,})\s+\1\s+\1/gi,
  ],
  
  // 💰 Golpes e Fraudes
  scam: [
    /\b(?:ganhe\s+dinheiro|renda\s+extra|trabalhe\s+em\s+casa|home\s+office\s+(?:\d+k|\d+\s*mil))/gi,
    /\b(?:investimento|bitcoin|btc|cripto|forex)\s+(?:garantido|rendimento|lucro)/gi,
    /\b(?:pix|transfere|deposita)\s+(?:primeiro|antes|pra\s+mim)/gi,
    /\b(?:cartão|cartao)\s+(?:clonado|limite)/gi,
    /\b(?:empréstimo|emprestimo)\s+(?:fácil|facil|rápido|rapido)/gi,
    /\b(?:ganhei?|ganha)\s+(?:\d+\s*(?:mil|k|reais|r\$))/gi,
    /\b(?:trabalho|vaga)\s+(?:online|remoto)\s+(?:\d+\s*(?:mil|k|reais))/gi,
    /\b(?:método|metodo)\s+(?:comprovado|garantido|secreto)/gi,
  ],
  
  // 😠 Assédio e Ameaças
  harassment: [
    /\b(?:vou\s+te\s+(?:matar|pegar|caçar|encontrar))\b/gi,
    /\b(?:sei\s+onde\s+(?:você|vc|tu)\s+(?:mora|trabalha|estuda))\b/gi,
    /\b(?:(?:sua?|tua?)\s+(?:família|familia|mãe|mae|pai)\s+vai)\b/gi,
    /\b(?:cuidado|tome\s+cuidado|se\s+cuida)\b/gi,
    /\b(?:some|desaparece|morre)\b/gi,
    /\b(?:feia|fei[o0]|gord[ao@]|nojent[ao@]|horrível|horrorosa?)\b/gi,
  ],
  
  // 🔞 Conteúdo Sexual Explícito
  inappropriate: [
    /\b(?:sexo|transar|trepar|foder|chupar|mamar|engolir)\b/gi,
    /\b(?:nudes?|pack|conteúdo\s+adulto|cam\s*girl|cam\s*boy)\b/gi,
    /\b(?:pau|rola|pinto|bct|ppk|xoxota|xana|bucet[a@])\b/gi,
    /\b(?:sem\s+compromisso|casual|amizade\s+colorida)\b/gi,
    /\b(?:só\s+(?:sexo|uma\s+noite|diversão)|one\s+night)\b/gi,
    /\b(?:safad[ao@]|tarad[ao@]|gostosa?|delícia|delicia)\b/gi,
    /\b(?:oral|anal|dp|bdsm|fetiche)\b/gi,
    /\b(?:sugar\s*(?:daddy|mommy|baby)|patrocínio|patrocinio)\b/gi,
  ],
  
  // 🔗 Links Externos
  external_links: [
    /https?:\/\/[^\s]+/gi,
    /www\.[^\s]+/gi,
    /\b[A-Za-z0-9-]+\.(?:com|net|org|br|io|me|tv|app|xyz|site|link|bio|ly)(?:\/[^\s]*)?\b/gi,
    /\b(?:bit\.ly|tinyurl|goo\.gl|t\.co|linktr\.ee|beacons\.ai)\b/gi,
  ],
  
  // 🎭 Indicadores de Perfil Falso
  fake_profile: [
    /\b(?:não\s+sou\s+(?:fake|falso)|sou\s+real|pessoa\s+real)\b/gi,
    /\b(?:add\s+no|chama\s+no|me\s+chama|só\s+respondo)\s+(?:insta|whats|zap|telegram)/gi,
    /\b(?:verificado|verificada|perfil\s+real)\b/gi,
    /\b(?:foto\s+(?:é|e)\s+(?:minha|real))\b/gi,
  ],
  
  // 🚫 Discurso de Ódio
  hate_speech: [
    /\b(?:morte\s+(?:a|aos?|às?)|abaixo)\b/gi,
    /\b(?:racista|nazista?|fascista?)\b/gi,
    /\b(?:preto|negro|macaco|crioulo|negra)\s+(?:lixo|nojento|fedido)/gi,
    /\b(?:nordestino|baiano|paraíba)\s+(?:lixo|vagabundo|preguiçoso)/gi,
    /\b(?:gay|viado|traveco|trans)\s+(?:lixo|nojento|doente)/gi,
    /\b(?:mulher|homem)\s+(?:lixo|inferior|lugar)\b/gi,
  ],
};

// ============================================
// ⚖️ PESOS DE SEVERIDADE
// ============================================

const VIOLATION_SEVERITY: Record<ViolationType, 'low' | 'medium' | 'high'> = {
  contact_info: 'medium',
  profanity: 'low',
  spam: 'low',
  scam: 'high',
  harassment: 'high',
  inappropriate: 'medium',
  external_links: 'medium',
  fake_profile: 'low',
  hate_speech: 'high',
};

const SEVERITY_SCORES: Record<'low' | 'medium' | 'high', number> = {
  low: 10,
  medium: 30,
  high: 60,
};

// ============================================
// 📝 DESCRIÇÕES DAS VIOLAÇÕES
// ============================================

const VIOLATION_DESCRIPTIONS: Record<ViolationType, string> = {
  contact_info: 'Compartilhamento de informações de contato não é permitido',
  profanity: 'Linguagem inapropriada detectada',
  spam: 'Conteúdo repetitivo ou spam',
  scam: 'Possível tentativa de golpe ou fraude',
  harassment: 'Conteúdo que pode ser considerado assédio ou ameaça',
  inappropriate: 'Conteúdo sexual ou impróprio',
  external_links: 'Links externos não são permitidos',
  fake_profile: 'Indicadores de possível perfil falso',
  hate_speech: 'Discurso de ódio não é tolerado',
};

// ============================================
// 🧹 FUNÇÕES DE SANITIZAÇÃO
// ============================================

function sanitizeContent(content: string, violations: Violation[]): string {
  let sanitized = content;
  
  for (const violation of violations) {
    if (violation.severity === 'high') {
      // Substituir completamente por asteriscos
      sanitized = sanitized.replace(
        new RegExp(escapeRegex(violation.match), 'gi'),
        '*'.repeat(violation.match.length)
      );
    } else if (violation.severity === 'medium') {
      // Censurar parcialmente
      sanitized = sanitized.replace(
        new RegExp(escapeRegex(violation.match), 'gi'),
        (match) => match[0] + '*'.repeat(match.length - 2) + match[match.length - 1]
      );
    }
    // Low severity: manter, mas avisar
  }
  
  return sanitized;
}

function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ============================================
// 🔍 FUNÇÃO PRINCIPAL DE MODERAÇÃO
// ============================================

export function moderateContent(
  content: string,
  contentType: ContentType = 'general'
): ModerationResponse {
  const violations: Violation[] = [];
  let totalScore = 0;
  
  // Verificar cada tipo de violação
  for (const [type, patterns] of Object.entries(MODERATION_PATTERNS) as [ViolationType, RegExp[]][]) {
    for (const pattern of patterns) {
      const matches = content.match(pattern);
      if (matches) {
        for (const match of matches) {
          const severity = VIOLATION_SEVERITY[type];
          violations.push({
            type,
            match,
            severity,
            description: VIOLATION_DESCRIPTIONS[type],
          });
          totalScore += SEVERITY_SCORES[severity];
        }
      }
    }
  }
  
  // Regras específicas por tipo de conteúdo
  if (contentType === 'name') {
    // Nomes não podem ter números ou caracteres especiais excessivos
    if (/\d/.test(content)) {
      violations.push({
        type: 'fake_profile',
        match: content,
        severity: 'low',
        description: 'Nomes não devem conter números',
      });
      totalScore += 5;
    }
    if (/[!@#$%^&*()_+=\[\]{};':"\\|,.<>\/?]+/.test(content)) {
      violations.push({
        type: 'fake_profile',
        match: content,
        severity: 'low',
        description: 'Nomes não devem conter caracteres especiais',
      });
      totalScore += 5;
    }
  }
  
  if (contentType === 'bio') {
    // Bios muito curtas ou genéricas
    if (content.length < 10) {
      violations.push({
        type: 'spam',
        match: content,
        severity: 'low',
        description: 'Bio muito curta',
      });
      totalScore += 5;
    }
  }
  
  // Limitar score a 100
  totalScore = Math.min(100, totalScore);
  
  // Determinar resultado
  let result: ModerationResult;
  if (totalScore >= 60) {
    result = 'blocked';
  } else if (totalScore >= 20) {
    result = 'warning';
  } else {
    result = 'safe';
  }
  
  // Sanitizar conteúdo
  const sanitizedContent = sanitizeContent(content, violations);
  
  return {
    result,
    originalContent: content,
    sanitizedContent,
    violations,
    score: totalScore,
  };
}

// ============================================
// 🎯 FUNÇÕES ESPECÍFICAS POR CONTEXTO
// ============================================

/**
 * Modera conteúdo de Bio/Descrição
 */
export function moderateBio(bio: string): ModerationResponse {
  return moderateContent(bio, 'bio');
}

/**
 * Modera mensagem de chat
 */
export function moderateMessage(message: string): ModerationResponse {
  return moderateContent(message, 'message');
}

/**
 * Modera nome de usuário
 */
export function moderateName(name: string): ModerationResponse {
  return moderateContent(name, 'name');
}

// ============================================
// ✅ VERIFICAÇÕES RÁPIDAS
// ============================================

/**
 * Verifica se conteúdo contém informações de contato
 */
export function hasContactInfo(content: string): boolean {
  const patterns = MODERATION_PATTERNS.contact_info;
  return patterns.some(pattern => pattern.test(content));
}

/**
 * Verifica se conteúdo contém links
 */
export function hasExternalLinks(content: string): boolean {
  const patterns = MODERATION_PATTERNS.external_links;
  return patterns.some(pattern => pattern.test(content));
}

/**
 * Verifica se conteúdo contém palavrões
 */
export function hasProfanity(content: string): boolean {
  const patterns = MODERATION_PATTERNS.profanity;
  return patterns.some(pattern => pattern.test(content));
}

/**
 * Verifica se conteúdo é seguro para publicação
 */
export function isSafeContent(content: string): boolean {
  const result = moderateContent(content);
  return result.result === 'safe';
}

/**
 * Verifica se conteúdo deve ser bloqueado
 */
export function shouldBlockContent(content: string): boolean {
  const result = moderateContent(content);
  return result.result === 'blocked';
}

// ============================================
// 🔄 SANITIZAÇÃO AUTOMÁTICA
// ============================================

/**
 * Retorna versão limpa do conteúdo (remove/censura violações)
 */
export function getSanitizedContent(content: string, contentType: ContentType = 'general'): string {
  const result = moderateContent(content, contentType);
  return result.sanitizedContent;
}

/**
 * Remove todas as informações de contato do texto
 */
export function removeContactInfo(content: string): string {
  let cleaned = content;
  for (const pattern of MODERATION_PATTERNS.contact_info) {
    cleaned = cleaned.replace(pattern, '[removido]');
  }
  return cleaned;
}

/**
 * Remove todos os links do texto
 */
export function removeLinks(content: string): string {
  let cleaned = content;
  for (const pattern of MODERATION_PATTERNS.external_links) {
    cleaned = cleaned.replace(pattern, '[link removido]');
  }
  return cleaned;
}

// ============================================
// 📊 RELATÓRIOS E ANÁLISES
// ============================================

/**
 * Gera relatório detalhado de moderação
 */
export function generateModerationReport(content: string, contentType: ContentType = 'general'): {
  isApproved: boolean;
  score: number;
  violations: Violation[];
  suggestions: string[];
} {
  const result = moderateContent(content, contentType);
  const suggestions: string[] = [];
  
  if (result.violations.some(v => v.type === 'contact_info')) {
    suggestions.push('Remova informações de contato do seu texto');
  }
  if (result.violations.some(v => v.type === 'profanity')) {
    suggestions.push('Evite usar linguagem inapropriada');
  }
  if (result.violations.some(v => v.type === 'external_links')) {
    suggestions.push('Links externos não são permitidos');
  }
  if (result.violations.some(v => v.type === 'spam')) {
    suggestions.push('Evite repetições excessivas');
  }
  
  return {
    isApproved: result.result !== 'blocked',
    score: result.score,
    violations: result.violations,
    suggestions,
  };
}

// ============================================
// 🎯 MENSAGENS DE FEEDBACK PARA USUÁRIO
// ============================================

export const MODERATION_FEEDBACK = {
  contact_blocked: 'Por segurança, informações de contato não podem ser compartilhadas aqui. Aguarde dar match para trocar contatos!',
  content_blocked: 'Este conteúdo viola nossas diretrizes. Por favor, revise e tente novamente.',
  profanity_warning: 'Vamos manter o respeito? Use uma linguagem mais apropriada.',
  link_blocked: 'Links não são permitidos. Converse naturalmente primeiro!',
  spam_warning: 'Detectamos conteúdo repetitivo. Seja mais criativo!',
};

