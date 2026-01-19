/**
 * 🤖 BOTA LOVE APP - Serviço de Moderação de Imagens
 * 
 * Utiliza GPT-4o Vision para validar imagens de perfil
 * e detectar conteúdo inadequado antes do upload
 * 
 * @author Bota Love Team
 */

// =============================================================================
// 📝 TIPOS E INTERFACES
// =============================================================================

export interface ImageModerationResult {
  isApproved: boolean;
  reason?: string;
  confidence?: number;
  suggestions?: string[];
  details?: {
    hasNudity: boolean;
    hasViolence: boolean;
    hasIllegalContent: boolean;
    hasOffensiveContent: boolean;
    hasMinors: boolean;
    hasFace: boolean;
    isProfileAppropriate: boolean;
  };
}

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

// =============================================================================
// 🔧 CONFIGURAÇÃO
// =============================================================================

const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
const OPENAI_MODEL = process.env.EXPO_PUBLIC_OPENAI_MODEL || 'gpt-4o';
const OPENAI_API_URL = process.env.EXPO_PUBLIC_OPENAI_API_URL || 'https://api.openai.com/v1';

// Prompt otimizado para moderação de fotos de perfil
const MODERATION_PROMPT = `Você é um moderador de conteúdo especializado em analisar fotos de perfil para um aplicativo de namoro focado no agronegócio brasileiro.

Analise esta imagem e determine se ela é apropriada para uso como foto de perfil, considerando:

✅ PERMITIDO:
- Fotos de pessoas em ambientes rurais ou urbanos
- Fotos profissionais ou casuais
- Selfies e fotos em grupo (desde que adequadas)
- Fotos com animais de fazenda ou pets
- Ambientes de trabalho no campo
- Fotos em eventos sociais apropriados

❌ NÃO PERMITIDO:
- Nudez ou semi-nudez (roupas muito reveladoras)
- Conteúdo sexual ou sugestivo
- Violência ou conteúdo perturbador
- Drogas ou substâncias ilegais
- Menores de idade desacompanhados
- Símbolos de ódio ou ofensivos
- Armas ou conteúdo perigoso
- Fotos muito escuras ou que não mostram o rosto claramente
- Fotos de celebridades ou pessoas públicas (possível fake)
- Imagens de baixa qualidade ou pixeladas demais

Responda APENAS no seguinte formato JSON (sem markdown, sem backticks):
{
  "isApproved": true/false,
  "reason": "motivo breve caso rejeitado",
  "confidence": 0-100,
  "details": {
    "hasNudity": true/false,
    "hasViolence": true/false,
    "hasIllegalContent": true/false,
    "hasOffensiveContent": true/false,
    "hasMinors": true/false,
    "hasFace": true/false,
    "isProfileAppropriate": true/false
  },
  "suggestions": ["sugestões caso rejeitado"]
}`;

// =============================================================================
// 🚀 FUNÇÕES PRINCIPAIS
// =============================================================================

/**
 * Converte URI de imagem local para base64
 */
async function imageUriToBase64(uri: string): Promise<string> {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        // Remover o prefixo "data:image/...;base64," se existir
        const base64Data = base64.split(',')[1] || base64;
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('❌ Erro ao converter imagem para base64:', error);
    throw new Error('Não foi possível processar a imagem');
  }
}

/**
 * Valida se a imagem é apropriada usando GPT-4o Vision
 */
export async function moderateImage(imageUri: string): Promise<ImageModerationResult> {
  // Validar configuração
  if (!OPENAI_API_KEY || OPENAI_API_KEY.includes('your_openai_api_key')) {
    console.error('❌ Chave da API do OpenAI não configurada');
    // Em desenvolvimento, aprovar temporariamente
    if (process.env.EXPO_PUBLIC_APP_ENV === 'development') {
      console.warn('⚠️ Modo desenvolvimento: Aprovando imagem sem validação');
      return {
        isApproved: true,
        reason: 'Validação desabilitada em desenvolvimento',
        confidence: 0,
        details: {
          hasNudity: false,
          hasViolence: false,
          hasIllegalContent: false,
          hasOffensiveContent: false,
          hasMinors: false,
          hasFace: true,
          isProfileAppropriate: true,
        },
      };
    }
    throw new Error('Serviço de validação de imagem não configurado');
  }

  console.log('🔍 Iniciando moderação de imagem...');

  try {
    // 1. Converter imagem para base64
    const base64Image = await imageUriToBase64(imageUri);
    
    // 2. Chamar API do OpenAI
    const response = await fetch(`${OPENAI_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: MODERATION_PROMPT,
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`,
                  detail: 'high', // Alta resolução para análise detalhada
                },
              },
            ],
          },
        ],
        max_tokens: 500,
        temperature: 0.2, // Baixa temperatura para respostas mais consistentes
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Erro na API do OpenAI:', errorData);
      throw new Error(`Erro na validação: ${response.status}`);
    }

    const data: OpenAIResponse = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('Resposta vazia da API');
    }

    // 3. Processar resposta JSON
    let result: ImageModerationResult;
    
    try {
      // Remover markdown se existir
      const jsonContent = content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      result = JSON.parse(jsonContent);
      
      console.log('✅ Moderação concluída:', {
        aprovada: result.isApproved,
        confianca: result.confidence,
      });
      
      return result;
      
    } catch (parseError) {
      console.error('❌ Erro ao processar resposta:', content);
      throw new Error('Resposta inválida do serviço de validação');
    }

  } catch (error: any) {
    console.error('❌ Erro na moderação de imagem:', error);
    
    // Em caso de erro, rejeitar por segurança
    return {
      isApproved: false,
      reason: 'Não foi possível validar a imagem. Tente novamente.',
      confidence: 0,
      suggestions: [
        'Certifique-se de que a imagem está em boa qualidade',
        'Tente uma foto mais clara e bem iluminada',
        'Verifique sua conexão com a internet',
      ],
    };
  }
}

/**
 * Valida múltiplas imagens em lote
 */
export async function moderateImages(imageUris: string[]): Promise<ImageModerationResult[]> {
  console.log(`🔍 Validando ${imageUris.length} imagem(ns)...`);
  
  const results = await Promise.all(
    imageUris.map(uri => moderateImage(uri))
  );
  
  return results;
}

/**
 * Valida se TODAS as imagens foram aprovadas
 */
export function areAllImagesApproved(results: ImageModerationResult[]): boolean {
  return results.every(result => result.isApproved);
}

/**
 * Obtém mensagem de erro amigável para o usuário
 */
export function getModerationErrorMessage(result: ImageModerationResult): string {
  if (result.isApproved) {
    return '';
  }

  const baseMessage = result.reason || 'Esta imagem não pode ser usada como foto de perfil.';
  
  // Adicionar sugestões se disponíveis
  if (result.suggestions && result.suggestions.length > 0) {
    const suggestions = result.suggestions.join('\n• ');
    return `${baseMessage}\n\nSugestões:\n• ${suggestions}`;
  }

  return baseMessage;
}

/**
 * Obtém resumo da moderação para múltiplas imagens
 */
export function getModerationSummary(results: ImageModerationResult[]): string {
  const approved = results.filter(r => r.isApproved).length;
  const total = results.length;
  const rejected = total - approved;

  if (rejected === 0) {
    return `✅ Todas as ${total} imagens foram aprovadas!`;
  }

  if (rejected === total) {
    return `❌ Nenhuma imagem foi aprovada. Por favor, escolha imagens adequadas.`;
  }

  return `⚠️ ${approved} de ${total} imagens foram aprovadas. ${rejected} foram rejeitadas.`;
}
