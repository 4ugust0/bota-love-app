# 🌾 Preferências Agrolove - Documentação

## Visão Geral

O **Preferências Agrolove** é um filtro avançado premium que permite aos usuários personalizar suas buscas com base em critérios específicos do mundo agro. Preço: **R$ 39,90** (pagamento único).

## Funcionalidades

### Para o Usuário

1. **Acesso**: Configurações → Preferências Agrolove
2. **Seleção múltipla** em todas as categorias
3. **Categorias de preferências**:
   - Qual você prefere? (Profissão)
   - Você prefere quem mora: (Residência)
   - Qual Formação você prefere?
   - Quais atividades você prefere?
   - Você prefere quem tem? (Propriedade)
   - Você prefere quem trabalha e/ou cria: (Animais)
   - Você prefere quem planta: (Cultivos)
   - Quem você prefere encontrar? (Gênero)
   - Qual idade você prefere?
   - Qual altura você prefere?

4. **Botão de compra**: "Agrolove Preferido por R$ 39,90"

### Regra Importante ⚠️

O sistema **respeita a aba selecionada no cadastro do usuário**:
- Se o usuário escolheu **Sou Agro** → busca apenas perfis de Sou Agro
- Se o usuário escolheu **Simpatizante Agro** → busca apenas perfis de Simpatizante
- Se o usuário escolheu **Ambas** → busca em ambas as abas

**NÃO É PERMITIDO** mostrar perfis de abas diferentes das selecionadas no cadastro.

## Arquivos Relacionados

### Frontend
- `app/agrolove-preferences.tsx` - Tela de seleção de preferências
- `app/settings.tsx` - Card de acesso nas configurações

### Backend/Serviços
- `firebase/agroloveService.ts` - Serviço completo com:
  - Salvamento de preferências
  - Registro de vendas
  - Métricas para admin
  - Filtro de discovery

## Métricas para Painel Administrativo

### Coleções do Firestore

```
📁 agrolove_preferences/    # Preferências por usuário
   └── {userId}
       ├── preferences: { profession, residence, ... }
       ├── purchaseDate: Timestamp
       ├── status: 'active' | 'expired' | 'cancelled'
       └── tabPreference: 'sou_agro' | 'simpatizantes' | 'both'

📁 agrolove_sales/          # Histórico de vendas
   └── {saleId}
       ├── userId
       ├── userName
       ├── userEmail
       ├── preferences
       ├── price: 39.90
       ├── purchaseDate: Timestamp
       └── paymentMethod

📁 agrolove_metrics/        # Métricas agregadas
   ├── global
   │   ├── totalSales: number
   │   ├── totalRevenue: number
   │   └── lastUpdated: Timestamp
   └── month_{YYYY-MM}
       ├── month: 'YYYY-MM'
       ├── sales: number
       └── revenue: number
```

### Funções para Admin

```typescript
// Obter métricas globais
const metrics = await getAgroloveGlobalMetrics();
// { totalSales, totalRevenue, monthlySales, monthlyRevenue }

// Obter histórico de vendas
const sales = await getAgroloveSalesHistory(50);
// Array de vendas recentes

// Obter métricas mensais (para gráficos)
const monthly = await getAgroloveMonthlyMetrics(6);
// Últimos 6 meses: [{ month, sales, revenue }, ...]
```

## Integração com Discovery

O serviço `filterProfilesByAgrolovePreferences()` é usado no feed de descoberta para filtrar perfis baseado nas preferências do usuário.

```typescript
import { filterProfilesByAgrolovePreferences, getAgrolovePreferences } from '@/firebase/agroloveService';

// No hook de discovery
const agroloveData = await getAgrolovePreferences(userId);

if (agroloveData?.status === 'active') {
  filteredProfiles = filterProfilesByAgrolovePreferences(
    profiles,
    agroloveData.preferences,
    agroloveData.tabPreference
  );
}
```

## Opções de Preferências

### Profissão
- Produtor(a) Rural
- Empresário(a) do Agro
- Engenheiro(a) Agrônomo(a)
- Médico(a) Veterinário(a)
- Zootecnista
- Técnico(a) em Agropecuária
- Estudantes do Agro
- Outros

### Residência
- No Campo
- Na Cidade
- Quem vive entre o Campo e a Cidade

### Formação
- Nível Médio
- Nível Técnico
- Graduação
- Pós-Graduação
- Mestrado
- Doutorado
- Pós-Doutorado

### Atividades
- Produtor(a) Rural
- Agricultura
- Agronegócio
- Agroindústria
- Pecuária de Corte
- Pecuária de Leite
- Médico(a) Veterinário(a) de Pequenos Animais
- Médico(a) Veterinário(a) de Grandes Animais
- Outros

### Propriedade
- Sítio
- Fazenda
- Chácara
- Pequeno(a) Produtor(a)
- Grande Produtor(a)
- Clínica/Consultório Veterinário

### Animais
- Bovinos
- Equinos
- Aves
- Caprinos
- Ovinos
- Suínos
- Animais Domésticos (Gato e Cão)
- Animais Exóticos
- Outros

### Cultivos
- Soja
- Milho
- Sorgo
- Café
- Cana-de-açúcar
- Algodão
- Outros

### Gênero
- Homens
- Mulheres
- Ambos

### Idade
- Entre 18 e 25 anos
- Entre 25 e 35 anos
- Entre 35 e 45 anos
- Acima de 45 anos

### Altura
- Abaixo de 1.70m
- Entre 1.70m e 1.80m
- Entre 1.80m e 1.90m
- Acima de 1.90m

## Fluxo de Compra

1. Usuário acessa Configurações
2. Clica em "Preferências Agrolove" (card destacado)
3. Seleciona suas preferências
4. Clica em "Agrolove Preferido por R$ 39,90"
5. Confirma compra
6. Redirecionado para checkout (Stripe)
7. Após pagamento, preferências são salvas e ativadas
8. Venda é registrada para métricas

---

**Última atualização**: Fevereiro 2026
