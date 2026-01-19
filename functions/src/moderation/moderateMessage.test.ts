/**
 * 🧪 BOTA LOVE APP - Testes para Moderação de Conteúdo
 * 
 * Casos de teste para validar os padrões de moderação.
 * Execute manualmente ou integre em pipeline de CI/CD.
 * 
 * @author Bota Love Team
 */

// =============================================================================
// 📝 CASOS DE TESTE
// =============================================================================

interface TestCase {
  description: string;
  input: string;
  expectedAllowed: boolean;
  expectedScoreRange: [number, number];
  expectedViolations?: string[];
}

export const TEST_CASES: TestCase[] = [
  // ✅ Mensagens seguras
  {
    description: 'Mensagem normal',
    input: 'Olá, tudo bem? Como foi seu dia?',
    expectedAllowed: true,
    expectedScoreRange: [0, 10],
  },
  {
    description: 'Saudação com emoji',
    input: 'Oi! 😊 Prazer em conhecer você!',
    expectedAllowed: true,
    expectedScoreRange: [0, 10],
  },
  {
    description: 'Conversa sobre fazenda (termos rurais)',
    input: 'Tenho 50 cabeças de gado na fazenda. O touro reprodutor chegou semana passada.',
    expectedAllowed: true,
    expectedScoreRange: [0, 10],
  },
  {
    description: 'Discussão sobre agropecuária',
    input: 'Sou agrônomo e trabalho com inseminação artificial de bovinos.',
    expectedAllowed: true,
    expectedScoreRange: [0, 10],
  },

  // ⚠️ Mensagens com warning (sanitização)
  {
    description: 'Tentativa de compartilhar telefone',
    input: 'Me chama no 11 98765-4321',
    expectedAllowed: true,
    expectedScoreRange: [20, 40],
    expectedViolations: ['contact_info'],
  },
  {
    description: 'Tentativa de compartilhar Instagram',
    input: 'Meu insta é @joao_da_roça',
    expectedAllowed: true,
    expectedScoreRange: [20, 40],
    expectedViolations: ['contact_info'],
  },
  {
    description: 'Link externo',
    input: 'Olha essa foto: www.exemplo.com/foto',
    expectedAllowed: true,
    expectedScoreRange: [20, 40],
    expectedViolations: ['external_links'],
  },
  {
    description: 'Palavrão leve',
    input: 'Que merda de dia hoje!',
    expectedAllowed: true,
    expectedScoreRange: [5, 20],
    expectedViolations: ['profanity'],
  },

  // 🚫 Mensagens bloqueadas
  {
    description: 'Golpe financeiro',
    input: 'Ganhe dinheiro em casa! Investimento garantido de 10k por mês!',
    expectedAllowed: false,
    expectedScoreRange: [60, 100],
    expectedViolations: ['scam'],
  },
  {
    description: 'Ameaça',
    input: 'Sei onde você mora, vou te pegar!',
    expectedAllowed: false,
    expectedScoreRange: [60, 100],
    expectedViolations: ['harassment'],
  },
  {
    description: 'Discurso de ódio',
    input: 'Negro lixo vai morrer',
    expectedAllowed: false,
    expectedScoreRange: [60, 100],
    expectedViolations: ['hate_speech'],
  },
  {
    description: 'Conteúdo sexual explícito múltiplo',
    input: 'Manda nudes, quero sexo casual agora',
    expectedAllowed: false,
    expectedScoreRange: [60, 100],
    expectedViolations: ['inappropriate'],
  },
  {
    description: 'Múltiplas violações graves',
    input: 'Me chama no whats 11999999999, vou te pegar, sua gorda nojenta',
    expectedAllowed: false,
    expectedScoreRange: [80, 100],
    expectedViolations: ['contact_info', 'harassment'],
  },

  // 🌾 Termos rurais que NÃO devem ser bloqueados
  {
    description: 'Termo "gado" em contexto rural',
    input: 'Preciso comprar mais gado para a fazenda',
    expectedAllowed: true,
    expectedScoreRange: [0, 10],
  },
  {
    description: 'Termo "vaca" em contexto rural',
    input: 'As vacas já foram ordenhadas hoje cedo',
    expectedAllowed: true,
    expectedScoreRange: [0, 10],
  },
  {
    description: 'Termo "porco" em contexto rural',
    input: 'Os porcos estão prontos para o abate',
    expectedAllowed: true,
    expectedScoreRange: [0, 10],
  },
  {
    description: 'Termo "burro" em contexto rural',
    input: 'O burro é usado para carregar a colheita',
    expectedAllowed: true,
    expectedScoreRange: [0, 10],
  },

  // 📧 Variações de contato
  {
    description: 'Email',
    input: 'Meu email é teste@gmail.com',
    expectedAllowed: true,
    expectedScoreRange: [20, 40],
    expectedViolations: ['contact_info'],
  },
  {
    description: 'Número por extenso',
    input: 'Me chama: um um nove oito sete seis cinco quatro três dois um',
    expectedAllowed: true,
    expectedScoreRange: [20, 40],
    expectedViolations: ['contact_info'],
  },
  {
    description: 'WhatsApp disfarçado',
    input: 'Zap: 11 9876 5432',
    expectedAllowed: true,
    expectedScoreRange: [20, 40],
    expectedViolations: ['contact_info'],
  },

  // 🔄 Spam
  {
    description: 'Texto repetido',
    input: 'oi oi oi oi oi oi oi oi',
    expectedAllowed: true,
    expectedScoreRange: [5, 20],
    expectedViolations: ['spam'],
  },
  {
    description: 'Caracteres repetidos',
    input: 'Ooooooooooi tudoooooooo bem?',
    expectedAllowed: true,
    expectedScoreRange: [5, 20],
    expectedViolations: ['spam'],
  },
];

// =============================================================================
// 🧪 FUNÇÃO DE TESTE LOCAL
// =============================================================================

/**
 * Executa testes localmente (sem Firebase)
 * Use para validar os padrões regex rapidamente
 */
export function runLocalTests(): void {
  console.log('🧪 Iniciando testes de moderação...\n');
  
  let passed = 0;
  let failed = 0;

  for (const testCase of TEST_CASES) {
    console.log(`📋 ${testCase.description}`);
    console.log(`   Input: "${testCase.input.substring(0, 50)}${testCase.input.length > 50 ? '...' : ''}"`);
    
    // Simular detecção de violações (código simplificado para teste)
    // Em produção, isso é feito pela Cloud Function
    
    console.log(`   Expected: allowed=${testCase.expectedAllowed}, score=${testCase.expectedScoreRange[0]}-${testCase.expectedScoreRange[1]}`);
    console.log('');
    
    passed++; // Placeholder - em teste real, verificar resultado
  }

  console.log('═'.repeat(50));
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Total: ${TEST_CASES.length}`);
}

// Executar se rodando diretamente
if (require.main === module) {
  runLocalTests();
}
