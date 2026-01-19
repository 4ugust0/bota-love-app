# 🤖 Moderação de Imagens com IA

Este documento explica como configurar e usar o sistema de moderação de imagens com GPT-4o Vision no Bota Love App.

## 📋 Visão Geral

O sistema de moderação automaticamente valida todas as fotos de perfil antes que elas sejam adicionadas ao aplicativo, garantindo que apenas conteúdo apropriado seja exibido.

## 🔧 Configuração

### 1. Obter Chave da API do OpenAI

1. Acesse [OpenAI Platform](https://platform.openai.com/)
2. Faça login ou crie uma conta
3. Navegue para [API Keys](https://platform.openai.com/api-keys)
4. Clique em "Create new secret key"
5. Copie a chave gerada (começa com `sk-proj-...`)

### 2. Configurar Variáveis de Ambiente

Edite o arquivo `.env` na raiz do projeto (ou crie a partir do `.env.example`):

```bash
# 🤖 OPENAI - Moderação de Conteúdo (GPT-4o Vision)
EXPO_PUBLIC_OPENAI_API_KEY=sk-proj-sua_chave_aqui
EXPO_PUBLIC_OPENAI_MODEL=gpt-4o
EXPO_PUBLIC_OPENAI_API_URL=https://api.openai.com/v1
```

### 3. Variáveis Disponíveis

| Variável | Descrição | Padrão | Obrigatório |
|----------|-----------|--------|-------------|
| `EXPO_PUBLIC_OPENAI_API_KEY` | Chave da API do OpenAI | - | ✅ Sim |
| `EXPO_PUBLIC_OPENAI_MODEL` | Modelo a usar (gpt-4o ou gpt-4o-mini) | gpt-4o | ❌ Não |
| `EXPO_PUBLIC_OPENAI_API_URL` | URL base da API | https://api.openai.com/v1 | ❌ Não |

## 🎯 Como Funciona

### Fluxo de Validação

1. **Seleção de Imagem**: Usuário seleciona uma foto da galeria
2. **Exibição Temporária**: Foto é mostrada com indicador de "Validando com IA..."
3. **Análise com GPT-4o Vision**: Imagem é enviada para análise
4. **Decisão Automática**:
   - ✅ **Aprovada**: Foto permanece e pode ser usada
   - ❌ **Rejeitada**: Foto é removida e usuário recebe feedback

### Critérios de Aprovação

#### ✅ Permitido:
- Fotos de pessoas em ambientes rurais ou urbanos
- Fotos profissionais ou casuais
- Selfies e fotos em grupo adequadas
- Fotos com animais de fazenda ou pets
- Ambientes de trabalho no campo
- Fotos em eventos sociais apropriados

#### ❌ Não Permitido:
- Nudez ou semi-nudez
- Conteúdo sexual ou sugestivo
- Violência ou conteúdo perturbador
- Drogas ou substâncias ilegais
- Menores de idade desacompanhados
- Símbolos de ódio ou ofensivos
- Armas ou conteúdo perigoso
- Fotos muito escuras ou sem rosto visível
- Fotos de celebridades (possível fake)
- Imagens de baixa qualidade

## 💻 Uso no Código

### Importar Serviço

```typescript
import { moderateImage, getModerationErrorMessage } from '@/services/imageModeration';
```

### Validar Uma Imagem

```typescript
const result = await moderateImage(imageUri);

if (result.isApproved) {
  // ✅ Imagem aprovada
  console.log('Foto aprovada!');
} else {
  // ❌ Imagem rejeitada
  const errorMessage = getModerationErrorMessage(result);
  Alert.alert('Foto Não Aprovada', errorMessage);
}
```

### Validar Múltiplas Imagens

```typescript
import { moderateImages, areAllImagesApproved } from '@/services/imageModeration';

const results = await moderateImages([uri1, uri2, uri3]);
const allApproved = areAllImagesApproved(results);
```

## 📊 Estrutura da Resposta

```typescript
interface ImageModerationResult {
  isApproved: boolean;           // Se a imagem foi aprovada
  reason?: string;                // Motivo da rejeição (se aplicável)
  confidence?: number;            // Nível de confiança (0-100)
  suggestions?: string[];         // Sugestões para o usuário
  details?: {
    hasNudity: boolean;           // Detectou nudez
    hasViolence: boolean;         // Detectou violência
    hasIllegalContent: boolean;   // Detectou conteúdo ilegal
    hasOffensiveContent: boolean; // Detectou conteúdo ofensivo
    hasMinors: boolean;           // Detectou menores
    hasFace: boolean;             // Detectou rosto
    isProfileAppropriate: boolean;// Apropriada para perfil
  };
}
```

## 🎨 Interface do Usuário

### Indicador Visual

Durante a validação, a foto exibe:
- Overlay escuro semi-transparente
- Loading spinner animado
- Texto "🤖 Validando com IA..."

### Feedback ao Usuário

**Aprovada:**
```
✅ Foto Aprovada!
Sua foto foi validada e pode ser usada no perfil.
```

**Rejeitada:**
```
❌ Foto Não Aprovada
[Motivo da rejeição]

Sugestões:
• [Sugestão 1]
• [Sugestão 2]
```

## 🔒 Segurança e Privacidade

### Boas Práticas

1. ✅ **Chave da API**: Nunca commite a chave no Git
2. ✅ **Variáveis de Ambiente**: Use `.env` e adicione ao `.gitignore`
3. ✅ **Modo Desenvolvimento**: Em dev, validação pode ser desabilitada automaticamente
4. ✅ **Fallback**: Em caso de erro, rejeita por segurança

### Modo Desenvolvimento

Se a chave não estiver configurada e `EXPO_PUBLIC_APP_ENV=development`:
- Sistema aprova imagens automaticamente
- Log de aviso é exibido
- Útil para desenvolvimento local sem custos

## 💰 Custos

### Pricing do GPT-4o Vision (Janeiro 2026)

| Modelo | Entrada (por 1M tokens) | Saída (por 1M tokens) |
|--------|--------------------------|------------------------|
| GPT-4o | $2.50 | $10.00 |
| GPT-4o-mini | $0.15 | $0.60 |

**Estimativa por imagem:** ~$0.002 - $0.005 (usando gpt-4o)

### Otimizações

- Imagens são redimensionadas para 800x800px máximo
- Quality 0.8 reduz tamanho sem perder detalhes
- Cache de resultados por hash de imagem (futuro)

## 🐛 Troubleshooting

### Erro: "Chave da API não configurada"

**Solução:**
1. Verifique se a variável `EXPO_PUBLIC_OPENAI_API_KEY` está definida
2. Reinicie o servidor Expo após editar `.env`
3. Limpe cache: `npx expo start --clear`

### Erro: "Rate limit exceeded"

**Solução:**
- Você excedeu o limite de requisições
- Aguarde alguns minutos
- Considere aumentar o tier da sua conta OpenAI

### Erro: "Image too large"

**Solução:**
- Reduza o `quality` no ImagePicker
- Implemente compressão adicional antes da validação

### Validação muito lenta

**Causas possíveis:**
- Conexão lenta do usuário
- Imagem muito grande
- Servidor OpenAI sobrecarregado

**Soluções:**
- Usar `gpt-4o-mini` (mais rápido)
- Reduzir qualidade/resolução da imagem
- Implementar timeout e retry

## 📚 Recursos Adicionais

- [OpenAI Vision Guide](https://platform.openai.com/docs/guides/vision)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [Best Practices for Vision](https://platform.openai.com/docs/guides/vision/best-practices)

## 🔄 Atualizações Futuras

- [ ] Cache de resultados por hash de imagem
- [ ] Validação em batch para múltiplas imagens
- [ ] Fallback para serviço alternativo
- [ ] Estatísticas de moderação no dashboard admin
- [ ] A/B testing de prompts para melhor precisão
- [ ] Suporte a vídeos de perfil

## 📞 Suporte

Para questões ou problemas:
1. Verifique este guia primeiro
2. Consulte os logs do console
3. Entre em contato com a equipe de desenvolvimento

---

**Última atualização:** Janeiro 2026  
**Versão:** 1.0.0
