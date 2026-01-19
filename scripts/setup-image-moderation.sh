#!/bin/bash

# ==============================================================================
# 🤖 Script de Configuração - Moderação de Imagens com IA
# ==============================================================================
# Este script ajuda a configurar as variáveis de ambiente necessárias
# para o sistema de moderação de imagens com GPT-4o Vision

echo "🤖 Configuração de Moderação de Imagens com IA"
echo "=============================================="
echo ""

# Verificar se o arquivo .env existe
if [ ! -f .env ]; then
  echo "⚠️  Arquivo .env não encontrado. Copiando de .env.example..."
  cp .env.example .env
  echo "✅ Arquivo .env criado!"
  echo ""
fi

echo "📝 Configuração da API do OpenAI"
echo ""
echo "Para obter sua chave da API:"
echo "1. Acesse: https://platform.openai.com/api-keys"
echo "2. Faça login ou crie uma conta"
echo "3. Clique em 'Create new secret key'"
echo "4. Copie a chave gerada (começa com sk-proj-...)"
echo ""

# Solicitar chave da API
read -p "Digite sua chave da API do OpenAI (ou pressione Enter para pular): " api_key

if [ -n "$api_key" ]; then
  # Atualizar arquivo .env
  if grep -q "EXPO_PUBLIC_OPENAI_API_KEY=" .env; then
    # Substituir linha existente (compatível com macOS e Linux)
    if [[ "$OSTYPE" == "darwin"* ]]; then
      sed -i '' "s|EXPO_PUBLIC_OPENAI_API_KEY=.*|EXPO_PUBLIC_OPENAI_API_KEY=$api_key|" .env
    else
      sed -i "s|EXPO_PUBLIC_OPENAI_API_KEY=.*|EXPO_PUBLIC_OPENAI_API_KEY=$api_key|" .env
    fi
  else
    # Adicionar nova linha
    echo "EXPO_PUBLIC_OPENAI_API_KEY=$api_key" >> .env
  fi
  
  echo ""
  echo "✅ Chave da API configurada com sucesso!"
else
  echo ""
  echo "⏭️  Configuração pulada. Você pode adicionar manualmente ao arquivo .env"
fi

echo ""
echo "🎯 Escolha o modelo a ser usado:"
echo "1. gpt-4o (mais preciso, mais caro)"
echo "2. gpt-4o-mini (mais rápido, mais barato)"
echo ""

read -p "Escolha uma opção (1 ou 2) [padrão: 1]: " model_choice

case $model_choice in
  2)
    model="gpt-4o-mini"
    ;;
  *)
    model="gpt-4o"
    ;;
esac

# Atualizar modelo no .env
if grep -q "EXPO_PUBLIC_OPENAI_MODEL=" .env; then
  if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "s|EXPO_PUBLIC_OPENAI_MODEL=.*|EXPO_PUBLIC_OPENAI_MODEL=$model|" .env
  else
    sed -i "s|EXPO_PUBLIC_OPENAI_MODEL=.*|EXPO_PUBLIC_OPENAI_MODEL=$model|" .env
  fi
else
  echo "EXPO_PUBLIC_OPENAI_MODEL=$model" >> .env
fi

echo "✅ Modelo configurado: $model"

echo ""
echo "=============================================="
echo "✅ Configuração concluída!"
echo ""
echo "📋 Próximos passos:"
echo "1. Reinicie o servidor Expo: npx expo start --clear"
echo "2. Teste adicionando uma foto no perfil"
echo "3. Veja a validação automática em ação!"
echo ""
echo "📚 Documentação completa: docs/IMAGE_MODERATION.md"
echo "=============================================="
