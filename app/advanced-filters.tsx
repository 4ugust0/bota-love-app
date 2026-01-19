import PremiumModal from '@/components/PremiumModal';
import { BotaLoveColors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { getExtendedProfile } from '@/data/extendedUserData';
import {
    AdvancedFilters,
    hasFeatureAccess,
    SubscriptionTier
} from '@/data/tabsAndFiltersService';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width } = Dimensions.get('window');

export default function AdvancedFiltersScreen() {
  const router = useRouter();
  const { currentUser, hasPremium } = useAuth();
  
  const userProfile = getExtendedProfile(currentUser?.id || 'user-0');
  const userTier: SubscriptionTier = userProfile?.subscriptionTier || 'bronze';
  const hasAdvancedFilters = hasFeatureAccess(userTier, 'advancedFilters');

  const [filters, setFilters] = useState<AdvancedFilters>({
    maxDistance: 100,
    minHeight: 150,
    maxHeight: 200,
  });

  const [activeSection, setActiveSection] = useState<string | null>('location');
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  if (!hasAdvancedFilters) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={BotaLoveColors.secondary} />
          </TouchableOpacity>
          <Text style={styles.title}>Filtros Avançados</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.lockedContainer}>
          <LinearGradient
            colors={['#FFD700', BotaLoveColors.primary, '#FF6B35']}
            style={styles.lockedGradient}
          >
            <View style={styles.lockedIconCircle}>
              <Ionicons name="lock-closed" size={64} color="#FFF" />
            </View>
            
            <Text style={styles.lockedTitle}>🔍 Filtros Avançados</Text>
            
            <Text style={styles.lockedMessage}>
              Encontre exatamente quem você procura!{'\n\n'}
              ✨ Filtros por profissão{'\n'}
              📏 Altura e características{'\n'}
              🌾 Atividades rurais{'\n'}
              🏠 Tipo de propriedade{'\n'}
              🐂 Animais e culturas{'\n'}
              🎯 E muito mais!
            </Text>

            <TouchableOpacity
              style={styles.upgradeButton}
              onPress={() => setShowPremiumModal(true)}
            >
              <LinearGradient
                colors={['#27AE60', '#229954']}
                style={styles.upgradeGradient}
              >
                <Ionicons name="rocket" size={24} color="#FFF" />
                <Text style={styles.upgradeText}>Desbloquear Filtros</Text>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </View>
        
        <PremiumModal
          visible={showPremiumModal}
          onClose={() => setShowPremiumModal(false)}
          feature="Filtros Avançados"
        />
      </View>
    );
  }

  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? null : section);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={BotaLoveColors.secondary} />
        </TouchableOpacity>
        <Text style={styles.title}>Filtros Avançados</Text>
        <TouchableOpacity
          style={styles.resetButton}
          onPress={() => setFilters({})}
        >
          <Text style={styles.resetText}>Limpar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Seção: Localização */}
        <FilterSection
          icon="location"
          title="Localização"
          active={activeSection === 'location'}
          onToggle={() => toggleSection('location')}
        >
          <View style={styles.filterContent}>
            <Text style={styles.filterLabel}>
              Distância máxima: {filters.maxDistance || 100} km
            </Text>
            {/* Aqui iria um Slider */}
            <Text style={styles.filterHint}>
              Veja perfis em um raio de até {filters.maxDistance || 100} km
            </Text>
          </View>
        </FilterSection>

        {/* Seção: Características Físicas */}
        <FilterSection
          icon="body"
          title="Características Físicas"
          active={activeSection === 'physical'}
          onToggle={() => toggleSection('physical')}
        >
          <View style={styles.filterContent}>
            <Text style={styles.filterLabel}>Altura</Text>
            <View style={styles.rangeRow}>
              <Text>Min: {filters.minHeight || 150} cm</Text>
              <Text>Max: {filters.maxHeight || 200} cm</Text>
            </View>
          </View>
        </FilterSection>

        {/* Seção: Perfil Profissional */}
        <FilterSection
          icon="briefcase"
          title="Perfil Profissional"
          active={activeSection === 'professional'}
          onToggle={() => toggleSection('professional')}
        >
          <View style={styles.filterContent}>
            <FilterOption
              label="Educação"
              options={['Fundamental', 'Médio', 'Superior', 'Pós-graduação']}
              selected={filters.education || []}
              onSelect={(val) => setFilters({ ...filters, education: val })}
            />
          </View>
        </FilterSection>

        {/* Seção: Vida Rural */}
        <FilterSection
          icon="leaf"
          title="Vida Rural"
          active={activeSection === 'rural'}
          onToggle={() => toggleSection('rural')}
        >
          <View style={styles.filterContent}>
            <FilterOption
              label="Atividades Rurais"
              options={['Pecuária', 'Agricultura', 'Veterinária', 'Agronomia']}
              selected={filters.ruralActivities || []}
              onSelect={(val) => setFilters({ ...filters, ruralActivities: val })}
            />
            
            <FilterOption
              label="Propriedade"
              options={['Fazenda', 'Sítio', 'Chácara', 'Haras']}
              selected={filters.propertyType || []}
              onSelect={(val) => setFilters({ ...filters, propertyType: val })}
            />
            
            <FilterOption
              label="Animais"
              options={['Bovinos', 'Equinos', 'Suínos', 'Aves']}
              selected={filters.animals || []}
              onSelect={(val) => setFilters({ ...filters, animals: val })}
            />
          </View>
        </FilterSection>

        {/* Seção: Estilo de Vida */}
        <FilterSection
          icon="heart"
          title="Estilo de Vida"
          active={activeSection === 'lifestyle'}
          onToggle={() => toggleSection('lifestyle')}
        >
          <View style={styles.filterContent}>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Tem filhos</Text>
              <Switch
                value={filters.hasChildren}
                onValueChange={(val) => setFilters({ ...filters, hasChildren: val })}
                trackColor={{ false: '#CCC', true: BotaLoveColors.primary }}
              />
            </View>
            
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Não fuma</Text>
              <Switch
                value={filters.smoking === false}
                onValueChange={(val) => setFilters({ ...filters, smoking: !val })}
                trackColor={{ false: '#CCC', true: BotaLoveColors.primary }}
              />
            </View>
          </View>
        </FilterSection>

        {/* Botão de Aplicar */}
        <TouchableOpacity
          style={styles.applyButton}
          onPress={() => {
            // Aplicar filtros e voltar
            router.back();
          }}
        >
          <LinearGradient
            colors={['#27AE60', '#229954']}
            style={styles.applyGradient}
          >
            <Ionicons name="checkmark-circle" size={24} color="#FFF" />
            <Text style={styles.applyText}>Aplicar Filtros</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

interface FilterSectionProps {
  icon: any;
  title: string;
  active: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function FilterSection({ icon, title, active, onToggle, children }: FilterSectionProps) {
  return (
    <View style={styles.section}>
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <View style={styles.sectionHeaderLeft}>
          <View style={styles.sectionIconCircle}>
            <Ionicons name={icon} size={20} color={BotaLoveColors.primary} />
          </View>
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        <Ionicons
          name={active ? 'chevron-up' : 'chevron-down'}
          size={24}
          color={BotaLoveColors.neutralDark}
        />
      </TouchableOpacity>
      
      {active && children}
    </View>
  );
}

interface FilterOptionProps {
  label: string;
  options: string[];
  selected: string[];
  onSelect: (selected: string[]) => void;
}

function FilterOption({ label, options, selected, onSelect }: FilterOptionProps) {
  const toggleOption = (option: string) => {
    if (selected.includes(option)) {
      onSelect(selected.filter((o) => o !== option));
    } else {
      onSelect([...selected, option]);
    }
  };

  return (
    <View style={styles.filterOption}>
      <Text style={styles.filterOptionLabel}>{label}</Text>
      <View style={styles.optionsGrid}>
        {options.map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.optionChip,
              selected.includes(option) && styles.optionChipSelected,
            ]}
            onPress={() => toggleOption(option)}
          >
            <Text
              style={[
                styles.optionChipText,
                selected.includes(option) && styles.optionChipTextSelected,
              ]}
            >
              {option}
            </Text>
            {selected.includes(option) && (
              <Ionicons name="checkmark-circle" size={18} color="#27AE60" />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: BotaLoveColors.secondary,
  },
  resetButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  resetText: {
    fontSize: 15,
    fontWeight: '600',
    color: BotaLoveColors.primary,
  },
  placeholder: {
    width: 60,
  },
  section: {
    backgroundColor: '#FFF',
    marginTop: 12,
    borderRadius: 12,
    marginHorizontal: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sectionIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF9E6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: BotaLoveColors.textPrimary,
  },
  filterContent: {
    padding: 16,
    paddingTop: 0,
    gap: 16,
  },
  filterLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: BotaLoveColors.textPrimary,
    marginBottom: 8,
  },
  filterHint: {
    fontSize: 13,
    color: BotaLoveColors.neutralDark,
    marginTop: 4,
  },
  rangeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  switchLabel: {
    fontSize: 15,
    color: BotaLoveColors.textPrimary,
  },
  filterOption: {
    marginBottom: 12,
  },
  filterOptionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: BotaLoveColors.neutralDark,
    marginBottom: 10,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  optionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
  },
  optionChipSelected: {
    backgroundColor: '#E8F5E9',
    borderColor: '#27AE60',
  },
  optionChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: BotaLoveColors.textPrimary,
  },
  optionChipTextSelected: {
    fontWeight: '700',
    color: '#27AE60',
  },
  applyButton: {
    marginHorizontal: 16,
    marginTop: 24,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#27AE60',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  applyGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
  },
  applyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  bottomSpacer: {
    height: 40,
  },
  // Tela de bloqueio
  lockedContainer: {
    flex: 1,
    margin: 16,
    borderRadius: 24,
    overflow: 'hidden',
  },
  lockedGradient: {
    flex: 1,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockedIconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  lockedTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  lockedMessage: {
    fontSize: 16,
    color: '#FFF',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 32,
  },
  upgradeButton: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  upgradeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
  },
  upgradeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
});
