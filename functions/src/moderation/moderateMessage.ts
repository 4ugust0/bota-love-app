/**
 * 🔒 BOTA LOVE APP - Cloud Function de Moderação de Mensagens
 * 
 * Modera mensagens de chat em tempo real:
 * - Detecta informações de contato
 * - Filtra palavrões e linguagem vulgar
 * - Identifica spam e golpes
 * - Bloqueia assédio e ameaças
 * - Remove links externos
 * 
 * @author Bota Love Team
 */

import * as admin from 'firebase-admin';
import { CallableRequest, HttpsError, onCall } from 'firebase-functions/v2/https';

// =============================================================================
// 📝 TIPOS E INTERFACES
// =============================================================================

export interface ModerationRequest {
  text: string;
  chatId: string;
  senderId: string;
}

export interface ModerationResponse {
  allowed: boolean;
  sanitizedText: string;
  score: number;
  violations: ViolationInfo[];
}

export interface ViolationInfo {
  type: ViolationType;
  match: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
}

export type ViolationType =
  | 'contact_info'
  | 'profanity'
  | 'spam'
  | 'scam'
  | 'harassment'
  | 'inappropriate'
  | 'external_links'
  | 'hate_speech';

// =============================================================================
// 🔍 PADRÕES REGEX PARA DETECÇÃO
// =============================================================================

const MODERATION_PATTERNS: Record<ViolationType, RegExp[]> = {
  // 📱 Informações de Contato
  contact_info: [
    // Telefones brasileiros (vários formatos)
    /\b(?:\+?55\s?)?(?:\(?\d{2}\)?\s?)?\d{4,5}[-.\s]?\d{4}\b/gi,
    // Telefones genéricos (8+ dígitos)
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
    /\b(?:face(?:book)?|fb):?\s*[/]?[A-Za-z0-9_.]+/gi,
    // Twitter/X
    /\b(?:twitter|x\.com):?\s*@?[A-Za-z0-9_]+/gi,
    // LinkedIn
    /\b(?:linked\s?in):?\s*[/]?[A-Za-z0-9_-]+/gi,
    // Números disfarçados por extenso
    /\b(?:zero|um|dois|tres|quatro|cinco|seis|sete|oito|nove|dez)[\s,-]*(?:zero|um|dois|tres|quatro|cinco|seis|sete|oito|nove|dez){7,}/gi,
    // "me chama no"
    /\b(?:me\s+)?(?:chama|manda|fala|add)\s+(?:no|na|pelo|pela)\s+(?:insta|whats|zap|telegram|face)/gi,
  ],

  // 🤬 Palavrões e Linguagem Vulgar
  profanity: [
    /\b(?:put[a@]|puta|caralh[o0@]|cuzao|cuzã[o0]|bucet[a@]|fdp|vsf|vtnc|pqp|merda|bost[a@]|porra|cacete|foder|fod[ae]|arrombad[o@a]|desgraça|disgraça|inferno|viado|viad[o@]|bicha|sapatao|sapatã[o0])\b/gi,
    // Variações com símbolos
    /\b(?:p\*t[a@]|c@r@lh[o0]|f\*d[ae]r?)\b/gi,
  ],

  // 📧 Spam e Conteúdo Repetitivo
  spam: [
    // Repetição excessiva de caracteres
    /(.)\1{5,}/gi,
    // Caps lock excessivo (mais de 5 palavras em caps)
    /\b[A-Z]{2,}\s+[A-Z]{2,}\s+[A-Z]{2,}\s+[A-Z]{2,}\s+[A-Z]{2,}/g,
    // Emojis excessivos (10+)
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
    /\b(?:some|desaparece|morre)\b/gi,
    /\b(?:feia|fei[o0]|gord[ao@]|nojent[ao@]|horrível|horrorosa?)\b/gi,
  ],

  // 🔞 Conteúdo Sexual Explícito
  inappropriate: [
    /\b(?:sexo|transar|trepar|foder|chupar|mamar|engolir)\b/gi,
    /\b(?:nudes?|pack|conteúdo\s+adulto|cam\s*girl|cam\s*boy)\b/gi,
    /\b(?:pau|rola|pinto|bct|ppk|xoxota|xana|bucet[a@])\b/gi,
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
    /\b(?:bit\.ly|tinyurl|goo\.gl|t\.co|linktr\.ee|beacons\.ai)[^\s]*/gi,
  ],

  // 🚫 Discurso de Ódio
  hate_speech: [
    /\b(?:morte\s+(?:a|aos?|às?)|abaixo)\b/gi,
    /\b(?:preto|negro|macaco|crioulo|negra)\s+(?:lixo|nojento|fedido)/gi,
    /\b(?:nordestino|baiano|paraíba)\s+(?:lixo|vagabundo|preguiçoso)/gi,
    /\b(?:gay|viado|traveco|trans)\s+(?:lixo|nojento|doente)/gi,
    /\b(?:mulher|homem)\s+(?:lixo|inferior|lugar)\b/gi,
  ],
};

// =============================================================================
// 🌾 WHITELIST - TERMOS DO CONTEXTO RURAL
// =============================================================================

const RURAL_WHITELIST: string[] = [
  'gado', 'gados', 'gadinho',
  'touro', 'touros',
  'vaca', 'vacas',
  'boi', 'bois',
  'bezerro', 'bezerros', 'bezerra', 'bezerras',
  'cavalo', 'cavalos', 'égua', 'éguas',
  'porco', 'porcos', 'porca', 'porcas',
  'galinha', 'galinhas', 'galo', 'galos',
  'burro', 'burros', 'burra', 'burras',
  'jumento', 'jumentos',
  'cabra', 'cabras', 'bode', 'bodes',
  'carneiro', 'carneiros', 'ovelha', 'ovelhas',
  'mula', 'mulas',
  'peão', 'peões', 'peoa', 'peoas',
  'fazenda', 'fazendas',
  'roça', 'roças',
  'sítio', 'sítios',
  'curral', 'currais',
  'pasto', 'pastos',
  'plantação', 'plantações',
  'colheita', 'colheitas',
  'safra', 'safras',
  'trator', 'tratores',
  'arado', 'arados',
  'enxada', 'enxadas',
  'foice', 'foices',
  'ordenha', 'ordenhas',
  'inseminação',
  'reprodução',
  'cria', 'crias',
  'manejo',
  'vacinação',
  'vermifugação',
  'desmama',
  'abate',
  'pecuária',
  'agricultura',
  'agropecuária',
  'agrônomo', 'agrônomos',
  'veterinário', 'veterinários',
  'zootecnista', 'zootecnistas',
];

// =============================================================================
// ⚖️ PESOS DE SEVERIDADE
// =============================================================================

const VIOLATION_SEVERITY: Record<ViolationType, 'low' | 'medium' | 'high'> = {
  contact_info: 'medium',
  profanity: 'low',
  spam: 'low',
  scam: 'high',
  harassment: 'high',
  inappropriate: 'medium',
  external_links: 'medium',
  hate_speech: 'high',
};

const SEVERITY_SCORES: Record<'low' | 'medium' | 'high', number> = {
  low: 10,
  medium: 30,
  high: 60,
};

// =============================================================================
// 📝 DESCRIÇÕES DAS VIOLAÇÕES
// =============================================================================

const VIOLATION_DESCRIPTIONS: Record<ViolationType, string> = {
  contact_info: 'Compartilhamento de informações de contato não é permitido',
  profanity: 'Linguagem inapropriada detectada',
  spam: 'Conteúdo repetitivo ou spam',
  scam: 'Possível tentativa de golpe ou fraude',
  harassment: 'Conteúdo que pode ser considerado assédio ou ameaça',
  inappropriate: 'Conteúdo sexual ou impróprio',
  external_links: 'Links externos não são permitidos',
  hate_speech: 'Discurso de ódio não é tolerado',
};

// =============================================================================
// 🧰 FUNÇÕES AUXILIARES
// =============================================================================

/**
 * Verifica se um match está na whitelist rural
 */
function isRuralTerm(match: string): boolean {
  const lowerMatch = match.toLowerCase().trim();
  return RURAL_WHITELIST.some(term => 
    lowerMatch === term || 
    lowerMatch.includes(term) ||
    term.includes(lowerMatch)
  );
}

/**
 * Escapa caracteres especiais para uso em RegExp
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Sanitiza o conteúdo substituindo violações por asteriscos
 */
function sanitizeContent(content: string, violations: ViolationInfo[]): string {
  let sanitized = content;

  // Ordenar violações por tamanho do match (maior primeiro) para evitar problemas de sobreposição
  const sortedViolations = [...violations].sort((a, b) => b.match.length - a.match.length);

  for (const violation of sortedViolations) {
    if (violation.severity === 'high') {
      // Substituir completamente por asteriscos
      sanitized = sanitized.replace(
        new RegExp(escapeRegex(violation.match), 'gi'),
        '*'.repeat(violation.match.length)
      );
    } else if (violation.severity === 'medium') {
      // Censurar parcialmente (manter primeira e última letra)
      sanitized = sanitized.replace(
        new RegExp(escapeRegex(violation.match), 'gi'),
        (match) => {
          if (match.length <= 2) return '*'.repeat(match.length);
          return match[0] + '*'.repeat(match.length - 2) + match[match.length - 1];
        }
      );
    }
    // Low severity: manter original, apenas logar
  }

  return sanitized;
}

/**
 * Detecta violações no texto
 */
function detectViolations(text: string): ViolationInfo[] {
  const violations: ViolationInfo[] = [];
  const processedMatches = new Set<string>(); // Evitar duplicatas

  for (const [type, patterns] of Object.entries(MODERATION_PATTERNS) as [ViolationType, RegExp[]][]) {
    for (const pattern of patterns) {
      // Resetar lastIndex do RegExp para evitar problemas com flag 'g'
      pattern.lastIndex = 0;
      
      const matches = text.match(pattern);
      if (matches) {
        for (const match of matches) {
          // Evitar duplicatas
          const matchKey = `${type}:${match.toLowerCase()}`;
          if (processedMatches.has(matchKey)) continue;
          processedMatches.add(matchKey);

          // Verificar whitelist rural
          if (isRuralTerm(match)) {
            console.log(`🌾 Termo rural permitido: "${match}"`);
            continue;
          }

          const severity = VIOLATION_SEVERITY[type];
          violations.push({
            type,
            match,
            severity,
            description: VIOLATION_DESCRIPTIONS[type],
          });
        }
      }
    }
  }

  return violations;
}

/**
 * Calcula o score de risco baseado nas violações
 */
function calculateRiskScore(violations: ViolationInfo[]): number {
  let score = 0;

  for (const violation of violations) {
    score += SEVERITY_SCORES[violation.severity];
  }

  // Limitar a 100
  return Math.min(100, score);
}

/**
 * Loga violações para análise posterior
 */
async function logViolations(
  text: string,
  chatId: string,
  senderId: string,
  violations: ViolationInfo[],
  score: number,
  allowed: boolean
): Promise<void> {
  if (violations.length === 0) return;

  try {
    const db = admin.firestore();
    await db.collection('moderation_logs').add({
      originalText: text,
      chatId,
      senderId,
      violations: violations.map(v => ({
        type: v.type,
        match: v.match,
        severity: v.severity,
      })),
      score,
      allowed,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`📝 Violações logadas - ChatId: ${chatId}, SenderId: ${senderId}, Score: ${score}`);
  } catch (error) {
    console.error('Erro ao logar violações:', error);
    // Não falhar a moderação por causa de erro de log
  }
}

// =============================================================================
// 🚀 CLOUD FUNCTION PRINCIPAL
// =============================================================================

/**
 * Cloud Function para moderação de mensagens de chat
 * 
 * @param data - { text, chatId, senderId }
 * @returns { allowed, sanitizedText, score, violations }
 */
export const moderateMessage = onCall<ModerationRequest, Promise<ModerationResponse>>(
  {
    region: 'southamerica-east1',
    timeoutSeconds: 30,
    memory: '256MiB',
  },
  async (request: CallableRequest<ModerationRequest>): Promise<ModerationResponse> => {
    const startTime = Date.now();
    const data = request.data;

    // Verificar autenticação
    if (!request.auth) {
      throw new HttpsError(
        'unauthenticated',
        'Usuário não autenticado'
      );
    }

    // Validar dados de entrada
    const { text, chatId, senderId } = data;

    if (!text || typeof text !== 'string') {
      throw new HttpsError(
        'invalid-argument',
        'Texto é obrigatório'
      );
    }

    if (!chatId || typeof chatId !== 'string') {
      throw new HttpsError(
        'invalid-argument',
        'ChatId é obrigatório'
      );
    }

    if (!senderId || typeof senderId !== 'string') {
      throw new HttpsError(
        'invalid-argument',
        'SenderId é obrigatório'
      );
    }

    // Verificar se o usuário autenticado é o sender
    if (request.auth.uid !== senderId) {
      throw new HttpsError(
        'permission-denied',
        'Você só pode enviar mensagens como você mesmo'
      );
    }

    try {
      // Detectar violações
      const violations = detectViolations(text);

      // Calcular score de risco
      const score = calculateRiskScore(violations);

      // Determinar se é permitido
      // 0-30: Liberado
      // 31-60: Liberado com sanitização
      // 61-100: Bloqueado
      const allowed = score < 61;

      // Sanitizar texto se necessário
      let sanitizedText = text;
      if (score > 30 && score < 61) {
        sanitizedText = sanitizeContent(text, violations);
      } else if (score >= 61) {
        sanitizedText = ''; // Mensagem bloqueada, não retorna texto
      }

      // Logar violações para análise (assíncrono, não bloqueia resposta)
      logViolations(text, chatId, senderId, violations, score, allowed).catch(console.error);

      // Log de performance
      const duration = Date.now() - startTime;
      console.log(`🔒 Moderação concluída em ${duration}ms - Score: ${score}, Allowed: ${allowed}`);

      if (duration > 500) {
        console.warn(`⚠️ Moderação lenta: ${duration}ms (target: <500ms)`);
      }

      return {
        allowed,
        sanitizedText,
        score,
        violations: violations.map(v => ({
          type: v.type,
          match: v.match,
          severity: v.severity,
          description: v.description,
        })),
      };
    } catch (error) {
      console.error('❌ Erro na moderação:', error);
      throw new HttpsError(
        'internal',
        'Erro ao processar moderação'
      );
    }
  }
);
