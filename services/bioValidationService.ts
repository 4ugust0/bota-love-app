/**
 * 🔥 BOTA LOVE APP - Bio Validation Service
 * 
 * Serviço para validar e sanitizar campos de texto,
 * especialmente a biografia, bloqueando informações de contato.
 * 
 * @author Bota Love Team
 */

// =============================================================================
// 🔒 REGEX PATTERNS PARA DETECÇÃO DE CONTATO
// =============================================================================

const CONTACT_PATTERNS = {
  // E-mail
  email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi,
  
  // Telefone brasileiro (com ou sem DDD, com ou sem formatação)
  phone: /(?:\+?55\s?)?(?:\(?\d{2}\)?\s?)?(?:9\s?)?\d{4,5}[-.\s]?\d{4}/gi,
  
  // WhatsApp (menções diretas)
  whatsapp: /(?:whats?app?|wpp|zap|zapzap|whats|wats)[\s.:]*(?:\+?55\s?)?(?:\(?\d{2}\)?\s?)?(?:9\s?)?\d{4,5}[-.\s]?\d{4}|\b(?:whats?app?|wpp|zap|zapzap|whats|wats)\b/gi,
  
  // Instagram
  instagram: /(?:@[a-zA-Z0-9._]{1,30}|instagram\.com\/[a-zA-Z0-9._]{1,30}|insta[\s.:]*@?[a-zA-Z0-9._]{1,30}|\bme\s*segue\s*(?:no|la|lá)?\s*(?:insta|instagram)\b)/gi,
  
  // LinkedIn
  linkedin: /(?:linkedin\.com\/in\/[a-zA-Z0-9-]+|linked[\s-]?in[\s.:]*[a-zA-Z0-9._-]+)/gi,
  
  // Facebook
  facebook: /(?:facebook\.com\/[a-zA-Z0-9.]+|fb\.com\/[a-zA-Z0-9.]+|\bface\b[\s.:]*[a-zA-Z0-9.]+)/gi,
  
  // Twitter/X
  twitter: /(?:twitter\.com\/[a-zA-Z0-9_]+|x\.com\/[a-zA-Z0-9_]+|@[a-zA-Z0-9_]+\s*(?:no\s*)?(?:twitter|x\b))/gi,
  
  // TikTok
  tiktok: /(?:tiktok\.com\/@?[a-zA-Z0-9._]+|tik\s*tok[\s.:]*@?[a-zA-Z0-9._]+)/gi,
  
  // Telegram
  telegram: /(?:t\.me\/[a-zA-Z0-9_]+|telegram[\s.:]*@?[a-zA-Z0-9_]+)/gi,
  
  // URLs genéricas
  urls: /(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9][-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z]{2,6}(?:\/[-a-zA-Z0-9@:%_+.~#?&//=]*)?/gi,
  
  // Números sequenciais que parecem telefone (mínimo 8 dígitos)
  sequentialNumbers: /\d[\d\s.-]{7,}\d/g,
  
  // Tentativas de burlar filtro (números escritos por extenso)
  writtenNumbers: /(?:zero|um|dois|tres|três|quatro|cinco|seis|sete|oito|nove|meia)[\s,.-]*(?:zero|um|dois|tres|três|quatro|cinco|seis|sete|oito|nove|meia)[\s,.-]*(?:zero|um|dois|tres|três|quatro|cinco|seis|sete|oito|nove|meia)/gi,
  
  // Menção a "me chama" ou "entra em contato" seguido de rede social
  callToAction: /(?:me\s*chama?|entra?\s*em\s*contato|fala?\s*comigo)[\s]*(?:no|na|pelo|pela)?[\s]*(?:insta|instagram|whats|wpp|zap|face|facebook|telegram)/gi,
};

// =============================================================================
// 📝 TIPOS
// =============================================================================

export interface ValidationResult {
  isValid: boolean;
  hasContactInfo: boolean;
  detectedPatterns: string[];
  cleanedText?: string;
  errorMessage?: string;
}

export type ContactType = 
  | 'email' 
  | 'phone' 
  | 'whatsapp' 
  | 'instagram' 
  | 'linkedin' 
  | 'facebook' 
  | 'twitter' 
  | 'tiktok' 
  | 'telegram' 
  | 'urls' 
  | 'sequentialNumbers'
  | 'writtenNumbers'
  | 'callToAction';

// =============================================================================
// 🔍 FUNÇÕES DE VALIDAÇÃO
// =============================================================================

/**
 * Detecta padrões de contato em um texto
 */
export function detectContactPatterns(text: string): ContactType[] {
  const detected: ContactType[] = [];
  
  for (const [patternName, pattern] of Object.entries(CONTACT_PATTERNS)) {
    // Reset do lastIndex para regex global
    pattern.lastIndex = 0;
    
    if (pattern.test(text)) {
      detected.push(patternName as ContactType);
    }
  }
  
  return detected;
}

/**
 * Valida um texto (biografia) verificando se contém informações de contato
 */
export function validateBio(text: string): ValidationResult {
  if (!text || text.trim().length === 0) {
    return {
      isValid: true,
      hasContactInfo: false,
      detectedPatterns: [],
    };
  }

  const detectedPatterns = detectContactPatterns(text);
  const hasContactInfo = detectedPatterns.length > 0;

  if (hasContactInfo) {
    const friendlyNames: Record<ContactType, string> = {
      email: 'e-mail',
      phone: 'número de telefone',
      whatsapp: 'WhatsApp',
      instagram: 'Instagram',
      linkedin: 'LinkedIn',
      facebook: 'Facebook',
      twitter: 'Twitter/X',
      tiktok: 'TikTok',
      telegram: 'Telegram',
      urls: 'links externos',
      sequentialNumbers: 'número de telefone',
      writtenNumbers: 'número escrito',
      callToAction: 'convite para contato externo',
    };

    const detectedNames = detectedPatterns
      .map(p => friendlyNames[p])
      .filter((v, i, a) => a.indexOf(v) === i) // Remove duplicatas
      .join(', ');

    return {
      isValid: false,
      hasContactInfo: true,
      detectedPatterns,
      errorMessage: `Sua biografia contém informações de contato (${detectedNames}). Por segurança, não é permitido compartilhar dados de contato no perfil. Use o chat do app para se conectar com outros usuários!`,
    };
  }

  return {
    isValid: true,
    hasContactInfo: false,
    detectedPatterns: [],
  };
}

/**
 * Remove informações de contato de um texto
 * (Usado apenas para limpeza automática, não substitui a validação)
 */
export function sanitizeBio(text: string): string {
  let sanitized = text;

  for (const pattern of Object.values(CONTACT_PATTERNS)) {
    pattern.lastIndex = 0;
    sanitized = sanitized.replace(pattern, '[informação removida]');
  }

  // Limpa múltiplos espaços e quebras de linha
  sanitized = sanitized
    .replace(/\[informação removida\]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  return sanitized;
}

/**
 * Valida comprimento da biografia
 */
export function validateBioLength(text: string, minLength = 10, maxLength = 500): ValidationResult {
  const trimmedText = text.trim();

  if (trimmedText.length < minLength) {
    return {
      isValid: false,
      hasContactInfo: false,
      detectedPatterns: [],
      errorMessage: `Sua biografia deve ter pelo menos ${minLength} caracteres.`,
    };
  }

  if (trimmedText.length > maxLength) {
    return {
      isValid: false,
      hasContactInfo: false,
      detectedPatterns: [],
      errorMessage: `Sua biografia deve ter no máximo ${maxLength} caracteres.`,
    };
  }

  return {
    isValid: true,
    hasContactInfo: false,
    detectedPatterns: [],
  };
}

/**
 * Validação completa da biografia (comprimento + contato)
 */
export function validateBioComplete(
  text: string, 
  options: { minLength?: number; maxLength?: number; required?: boolean } = {}
): ValidationResult {
  const { minLength = 10, maxLength = 500, required = false } = options;
  
  const trimmedText = text?.trim() || '';
  
  // Se não é obrigatório e está vazio, é válido
  if (!required && trimmedText.length === 0) {
    return {
      isValid: true,
      hasContactInfo: false,
      detectedPatterns: [],
    };
  }
  
  // Se é obrigatório e está vazio
  if (required && trimmedText.length === 0) {
    return {
      isValid: false,
      hasContactInfo: false,
      detectedPatterns: [],
      errorMessage: 'A biografia é obrigatória.',
    };
  }

  // Validar comprimento
  const lengthValidation = validateBioLength(trimmedText, minLength, maxLength);
  if (!lengthValidation.isValid) {
    return lengthValidation;
  }

  // Validar conteúdo (informações de contato)
  return validateBio(trimmedText);
}

// =============================================================================
// 🎯 EXPORTS PARA USO NO APP
// =============================================================================

export default {
  validateBio,
  validateBioComplete,
  validateBioLength,
  sanitizeBio,
  detectContactPatterns,
};
