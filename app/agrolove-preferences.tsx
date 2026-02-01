/**
 * 🌾 BOTA LOVE APP - Preferências Agrolove
 * 
 * Filtro avançado premium para usuários do agro
 * Preço: R$ 39,90
 * 
 * Respeita as abas selecionadas no cadastro:
 * - Sou Agro
 * - Simpatizante Agro
 * - Ambas
 * 
 * @author Bota Love Team
 */

import { BotaLoveColors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ============================================
// 📊 OPÇÕES DE PREFERÊNCIAS
// ============================================ 

const PREFERENCE_SECTIONS = {
  profession: {
    title: 'Qual você prefere?',
    icon: '👨‍🌾',
    options: [
      'Produtor(a) Rural',
      'Empresário(a) do Agro',
      'Engenheiro(a) Agrônomo(a)',
      'Médico(a) Veterinário(a)',
      'Zootecnista',
      'Técnico(a) em Agropecuária',
      'Estudantes do Agro',
      'Outros',
    ],
  },
  residence: {
    title: 'Você prefere quem mora:',
    icon: '🏠',
    options: [
      'No Campo',
      'Na Cidade',
      'Quem vive entre o Campo e a Cidade',
    ],
  },
  education: {
    title: 'Qual Formação você prefere?',
    icon: '🎓',
    options: [
      'Nível Médio',
      'Nível Técnico',
      'Graduação',
      'Pós-Graduação',
      'Mestrado',
      'Doutorado',
      'Pós-Doutorado',
    ],
  },
  activities: {
    title: 'Quais atividades você prefere?',
    icon: '🚜',
    options: [
      'Produtor(a) Rural',
      'Agricultura',
      'Agronegócio',
      'Agroindústria',
      'Pecuária de Corte',
      'Pecuária de Leite',
      'Médico(a) Veterinário(a) de Pequenos Animais',
      'Médico(a) Veterinário(a) de Grandes Animais',
      'Outros',
    ],
  },
  property: {
    title: 'Você prefere quem tem?',
    icon: '🏡',
    options: [
      'Sítio',
      'Fazenda',
      'Chácara',
      'Pequeno(a) Produtor(a)',
      'Grande Produtor(a)',
      'Clínica/Consultório Veterinário',
    ],
  },
  animals: {
    title: 'Você prefere quem trabalha e/ou cria:',
    icon: '🐄',
    options: [
      'Bovinos',
      'Equinos',
      'Aves',
      'Caprinos',
      'Ovinos',
      'Suínos',
      'Animais Domésticos (Gato e Cão)',
      'Animais Exóticos',
      'Outros',
    ],
  },
  crops: {
    title: 'Você prefere quem planta:',
    icon: '🌱',
    options: [
      'Soja',
      'Milho',
      'Sorgo',
      'Café',
      'Cana-de-açúcar',
      'Algodão',
      'Outros',
    ],
  },
  gender: {
    title: 'Quem você prefere encontrar?',
    icon: '💚',
    options: [
      'Homens',
      'Mulheres',
      'Ambos',
    ],
  },
  age: {
    title: 'Qual idade você prefere?',
    icon: '📅',
    options: [
      'Entre 18 e 25 anos',
      'Entre 25 e 35 anos',
      'Entre 35 e 45 anos',
      'Acima de 45 anos',
    ],
  },
  height: {
    title: 'Qual altura você prefere?',
    icon: '📏',
    options: [
      'Abaixo de 1.70m',
      'Entre 1.70m e 1.80m',
      'Entre 1.80m e 1.90m',
      'Acima de 1.90m',
    ],
  },
};

// Preço do filtro
const AGROLOVE_PRICE = 39.90;

// ============================================
// 📦 TIPOS
// ============================================

type PreferenceKey = keyof typeof PREFERENCE_SECTIONS;
type PreferencesState = Record<PreferenceKey, string[]>;

// ============================================
// 🎨 COMPONENTE PRINCIPAL
// ============================================

export default function AgrolovePreferencesScreen() {
  const router = useRouter();
  const { currentUser, hasPremium } = useAuth();
  
  // Estado das preferências selecionadas
  const [preferences, setPreferences] = useState<PreferencesState>({
    profession: [],
    residence: [],
    education: [],
    activities: [],
    property: [],
    animals: [],
    crops: [],
    gender: [],
    age: [],
    height: [],
  });
  
  // Estado de seções expandidas
  const [expandedSections, setExpandedSections] = useState<PreferenceKey[]>([
    'profession', 'residence', 'education'
  ]);

  // Toggle opção selecionada
  const toggleOption = (section: PreferenceKey, option: string) => {
    setPreferences(prev => {
      const current = prev[section];
      const isSelected = current.includes(option);
      
      // Para gênero, permitir apenas uma seleção
      if (section === 'gender') {
        return {
          ...prev,
          [section]: isSelected ? [] : [option],
        };
      }
      
      // Para outras seções, múltipla seleção
      return {
        ...prev,
        [section]: isSelected
          ? current.filter(o => o !== option)
          : [...current, option],
      };
    });
  };

  // Toggle seção expandida
  const toggleSection = (section: PreferenceKey) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  // Verificar se tem alguma preferência selecionada
  const hasAnyPreference = Object.values(preferences).some(arr => arr.length > 0);

  // Contar total de preferências selecionadas
  const totalSelected = Object.values(preferences).reduce(
    (acc, arr) => acc + arr.length,
    0
  );

  // Obter aba do usuário (Sou Agro, Simpatizante, Ambas)
  const getUserTab = (): 'sou_agro' | 'simpatizantes' | 'both' => {
    // Se usuário é Agro, assume que quer ver Sou Agro
    // Caso contrário, é Simpatizante
    // Se tiver preferência de ver ambas, retorna 'both'
    const isAgroUser = currentUser?.profile?.isAgroUser ?? false;
    
    // Por padrão, mostra a aba correspondente ao tipo do usuário
    // TODO: Adicionar configuração para o usuário escolher ver ambas
    return isAgroUser ? 'sou_agro' : 'simpatizantes';
  };
  
  const getTabLabel = () => {
    const tab = getUserTab();
    switch (tab) {
      case 'sou_agro':
        return 'Sou Agro';
      case 'simpatizantes':
        return 'Simpatizante Agro';
      default:
        return 'Ambas as Abas';
    }
  };

  // Processar compra
  const handlePurchase = () => {
    if (!hasAnyPreference) {
      Alert.alert(
        'Selecione suas preferências',
        'Escolha pelo menos uma preferência antes de continuar.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Salvar preferências e ir para checkout
    Alert.alert(
      '🌾 Agrolove Preferido',
      `Você está prestes a adquirir o filtro Agrolove por R$ ${AGROLOVE_PRICE.toFixed(2)}.\n\nSuas buscas serão filtradas apenas em: ${getTabLabel()}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Continuar',
          onPress: () => {
            // TODO: Integrar com Stripe/pagamento
            // Salvar preferências no Firebase
            router.push({
              pathname: '/premium-checkout',
              params: {
                product: 'agrolove_preferences',
                price: AGROLOVE_PRICE.toString(),
                preferences: JSON.stringify(preferences),
                tabPreference: getUserTab(),
              },
            });
          },
        },
      ]
    );
  };

  // Renderizar seção de preferências
  const renderSection = (key: PreferenceKey) => {
    const section = PREFERENCE_SECTIONS[key];
    const isExpanded = expandedSections.includes(key);
    const selectedCount = preferences[key].length;

    return (
      <View key={key} style={styles.sectionContainer}>
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => toggleSection(key)}
          activeOpacity={0.7}
        >
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionIcon}>{section.icon}</Text>
            <Text style={styles.sectionTitle}>{section.title}</Text>
          </View>
          <View style={styles.sectionHeaderRight}>
            {selectedCount > 0 && (
              <View style={styles.selectedBadge}>
                <Text style={styles.selectedBadgeText}>{selectedCount}</Text>
              </View>
            )}
            <Ionicons
              name={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={BotaLoveColors.textSecondary}
            />
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.optionsContainer}>
            {section.options.map((option) => {
              const isSelected = preferences[key].includes(option);
              return (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.optionItem,
                    isSelected && styles.optionItemSelected,
                  ]}
                  onPress={() => toggleOption(key, option)}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.checkbox,
                    isSelected && styles.checkboxSelected,
                  ]}>
                    {isSelected && (
                      <Ionicons name="checkmark" size={14} color="#FFF" />
                    )}
                  </View>
                  <Text style={[
                    styles.optionText,
                    isSelected && styles.optionTextSelected,
                  ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[BotaLoveColors.secondary, '#1a0a00']}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Preferências Agrolove</Text>
          <Text style={styles.headerSubtitle}>Filtro Avançado Premium</Text>
        </View>
        <View style={{ width: 40 }} />
      </LinearGradient>

      {/* Info Banner */}
      <View style={styles.infoBanner}>
        <View style={styles.infoBannerIcon}>
          <Text style={styles.infoBannerEmoji}>🎯</Text>
        </View>
        <View style={styles.infoBannerText}>
          <Text style={styles.infoBannerTitle}>Busca Personalizada</Text>
          <Text style={styles.infoBannerDescription}>
            Suas preferências serão buscadas apenas em: <Text style={styles.highlight}>{getTabLabel()}</Text>
          </Text>
        </View>
      </View>

      {/* Lista de Preferências */}
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {(Object.keys(PREFERENCE_SECTIONS) as PreferenceKey[]).map(renderSection)}
        
        {/* Espaço para o botão fixo */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Botão de Compra Fixo */}
      <View style={styles.purchaseContainer}>
        <View style={styles.purchaseInfo}>
          <Text style={styles.purchaseLabel}>
            {totalSelected > 0 
              ? `${totalSelected} preferência${totalSelected > 1 ? 's' : ''} selecionada${totalSelected > 1 ? 's' : ''}`
              : 'Selecione suas preferências'}
          </Text>
        </View>
        <TouchableOpacity
          style={[
            styles.purchaseButton,
            !hasAnyPreference && styles.purchaseButtonDisabled,
          ]}
          onPress={handlePurchase}
          activeOpacity={0.8}
          disabled={!hasAnyPreference}
        >
          <LinearGradient
            colors={hasAnyPreference 
              ? [BotaLoveColors.primary, BotaLoveColors.primaryDark]
              : ['#CCC', '#AAA']
            }
            style={styles.purchaseButtonGradient}
          >
            <Text style={styles.purchaseButtonText}>
              Agrolove Preferido por R$ {AGROLOVE_PRICE.toFixed(2).replace('.', ',')}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ============================================
// 🎨 ESTILOS
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BotaLoveColors.neutralLight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: BotaLoveColors.primary,
  },
  infoBannerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoBannerEmoji: {
    fontSize: 24,
  },
  infoBannerText: {
    flex: 1,
  },
  infoBannerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: BotaLoveColors.secondary,
    marginBottom: 2,
  },
  infoBannerDescription: {
    fontSize: 12,
    color: BotaLoveColors.textSecondary,
    lineHeight: 18,
  },
  highlight: {
    fontWeight: '700',
    color: BotaLoveColors.primary,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 8,
  },
  sectionContainer: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFF',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sectionIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: BotaLoveColors.textPrimary,
    flex: 1,
  },
  sectionHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectedBadge: {
    backgroundColor: BotaLoveColors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    minWidth: 24,
    alignItems: 'center',
  },
  selectedBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
  },
  optionsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: BotaLoveColors.neutralLight,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginTop: 8,
    borderRadius: 10,
    backgroundColor: BotaLoveColors.neutralLight,
  },
  optionItemSelected: {
    backgroundColor: 'rgba(212, 173, 99, 0.15)',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: BotaLoveColors.neutralMedium,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxSelected: {
    backgroundColor: BotaLoveColors.primary,
    borderColor: BotaLoveColors.primary,
  },
  optionText: {
    fontSize: 14,
    color: BotaLoveColors.textSecondary,
    flex: 1,
  },
  optionTextSelected: {
    color: BotaLoveColors.textPrimary,
    fontWeight: '500',
  },
  purchaseContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    paddingTop: 12,
    paddingBottom: 34,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: BotaLoveColors.neutralLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  purchaseInfo: {
    marginBottom: 12,
  },
  purchaseLabel: {
    fontSize: 13,
    color: BotaLoveColors.textSecondary,
    textAlign: 'center',
  },
  purchaseButton: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  purchaseButtonDisabled: {
    opacity: 0.7,
  },
  purchaseButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  purchaseButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFF',
  },
});
