/**
 * 🔒 BOTA LOVE APP - Componentes de Filtros Bloqueados
 * 
 * Filtros avançados visíveis com ícone de cadeado
 * Ao tentar usar: direcionar para assinatura
 * Sem mensagem agressiva - apenas CTA claro
 * 
 * @author Bota Love Team
 */

import { BotaLoveColors } from '@/constants/theme';
import { ADVANCED_FILTERS, AdvancedFilter } from '@/data/freePlanService';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ============================================
// 🔒 COMPONENTE DE FILTRO INDIVIDUAL BLOQUEADO
// ============================================

interface LockedFilterItemProps {
  filter: AdvancedFilter;
  hasPremium: boolean;
  onPress: (filter: AdvancedFilter) => void;
  selected?: boolean;
}

export function LockedFilterItem({ 
  filter, 
  hasPremium, 
  onPress,
  selected = false,
}: LockedFilterItemProps) {
  const isLocked = filter.isPremium && !hasPremium;
  
  return (
    <TouchableOpacity
      style={[
        styles.filterItem,
        selected && styles.filterItemSelected,
        isLocked && styles.filterItemLocked,
      ]}
      onPress={() => onPress(filter)}
      activeOpacity={0.7}
    >
      <View style={styles.filterContent}>
        <Text style={styles.filterIcon}>{filter.icon}</Text>
        <View style={styles.filterTextContainer}>
          <Text style={[
            styles.filterName,
            isLocked && styles.filterNameLocked,
          ]}>
            {filter.name}
          </Text>
          <Text style={styles.filterDescription}>{filter.description}</Text>
        </View>
      </View>
      
      {isLocked && (
        <View style={styles.lockBadge}>
          <Text style={styles.lockIcon}>🔒</Text>
        </View>
      )}
      
      {!isLocked && selected && (
        <View style={styles.checkBadge}>
          <Text style={styles.checkIcon}>✓</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// ============================================
// 📋 LISTA DE FILTROS AVANÇADOS
// ============================================

interface AdvancedFiltersListProps {
  hasPremium: boolean;
  selectedFilters?: string[];
  onFilterSelect?: (filterId: string) => void;
}

export function AdvancedFiltersList({ 
  hasPremium, 
  selectedFilters = [],
  onFilterSelect,
}: AdvancedFiltersListProps) {
  const router = useRouter();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedLockedFilter, setSelectedLockedFilter] = useState<AdvancedFilter | null>(null);
  
  const handleFilterPress = (filter: AdvancedFilter) => {
    const isLocked = filter.isPremium && !hasPremium;
    
    if (isLocked) {
      setSelectedLockedFilter(filter);
      setShowUpgradeModal(true);
    } else if (onFilterSelect) {
      onFilterSelect(filter.id);
    }
  };
  
  const handleUpgrade = () => {
    setShowUpgradeModal(false);
    router.push('/store');
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Filtros Avançados</Text>
        {!hasPremium && (
          <View style={styles.premiumBadge}>
            <Text style={styles.premiumBadgeText}>✨ Premium</Text>
          </View>
        )}
      </View>
      
      <FlatList
        data={ADVANCED_FILTERS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <LockedFilterItem
            filter={item}
            hasPremium={hasPremium}
            onPress={handleFilterPress}
            selected={selectedFilters.includes(item.id)}
          />
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
      
      {/* Modal de Upgrade */}
      <FilterUpgradeModal
        visible={showUpgradeModal}
        filter={selectedLockedFilter}
        onClose={() => setShowUpgradeModal(false)}
        onUpgrade={handleUpgrade}
      />
    </View>
  );
}

// ============================================
// 🎁 MODAL DE UPGRADE PARA FILTRO
// ============================================

interface FilterUpgradeModalProps {
  visible: boolean;
  filter: AdvancedFilter | null;
  onClose: () => void;
  onUpgrade: () => void;
}

function FilterUpgradeModal({ visible, filter, onClose, onUpgrade }: FilterUpgradeModalProps) {
  if (!filter) return null;
  
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={modalStyles.overlay}>
        <View style={modalStyles.container}>
          {/* Ícone */}
          <View style={modalStyles.iconContainer}>
            <LinearGradient
              colors={['#43e97b', '#38f9d7']}
              style={modalStyles.iconGradient}
            >
              <Text style={modalStyles.filterIcon}>{filter.icon}</Text>
            </LinearGradient>
            <View style={modalStyles.lockOverlay}>
              <Text style={modalStyles.lockEmoji}>🔒</Text>
            </View>
          </View>
          
          {/* Título */}
          <Text style={modalStyles.title}>{filter.name}</Text>
          
          {/* Descrição */}
          <Text style={modalStyles.description}>
            Desbloqueie filtros avançados para encontrar exatamente quem você procura!
          </Text>
          
          {/* Benefícios */}
          <View style={modalStyles.benefitsContainer}>
            <View style={modalStyles.benefitRow}>
              <Text style={modalStyles.benefitIcon}>🎯</Text>
              <Text style={modalStyles.benefitText}>Matches mais precisos</Text>
            </View>
            <View style={modalStyles.benefitRow}>
              <Text style={modalStyles.benefitIcon}>⏱️</Text>
              <Text style={modalStyles.benefitText}>Economize tempo</Text>
            </View>
            <View style={modalStyles.benefitRow}>
              <Text style={modalStyles.benefitIcon}>💚</Text>
              <Text style={modalStyles.benefitText}>Conexões de qualidade</Text>
            </View>
          </View>
          
          {/* Botões */}
          <TouchableOpacity
            style={modalStyles.primaryButton}
            onPress={onUpgrade}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[BotaLoveColors.primary, BotaLoveColors.primaryDark]}
              style={modalStyles.buttonGradient}
            >
              <Text style={modalStyles.primaryButtonText}>Desbloquear Filtros</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={modalStyles.secondaryButton}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={modalStyles.secondaryButtonText}>Depois</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ============================================
// 🏷️ CHIP DE FILTRO BLOQUEADO (Compacto)
// ============================================

interface LockedFilterChipProps {
  filter: AdvancedFilter;
  hasPremium: boolean;
  onPress: () => void;
}

export function LockedFilterChip({ filter, hasPremium, onPress }: LockedFilterChipProps) {
  const isLocked = filter.isPremium && !hasPremium;
  
  return (
    <TouchableOpacity
      style={[
        chipStyles.chip,
        isLocked && chipStyles.chipLocked,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={chipStyles.icon}>{filter.icon}</Text>
      <Text style={[
        chipStyles.text,
        isLocked && chipStyles.textLocked,
      ]}>
        {filter.name}
      </Text>
      {isLocked && (
        <Text style={chipStyles.lock}>🔒</Text>
      )}
    </TouchableOpacity>
  );
}

// ============================================
// 📊 BANNER DE FILTROS PREMIUM
// ============================================

interface PremiumFiltersBannerProps {
  onPress: () => void;
}

export function PremiumFiltersBanner({ onPress }: PremiumFiltersBannerProps) {
  return (
    <TouchableOpacity 
      style={bannerStyles.container}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={bannerStyles.gradient}
      >
        <View style={bannerStyles.content}>
          <Text style={bannerStyles.icon}>🔍</Text>
          <View style={bannerStyles.textContainer}>
            <Text style={bannerStyles.title}>Filtros Avançados</Text>
            <Text style={bannerStyles.subtitle}>
              Encontre pessoas por altura, religião, signo e muito mais!
            </Text>
          </View>
          <View style={bannerStyles.badge}>
            <Text style={bannerStyles.badgeText}>🔒 Premium</Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

// ============================================
// 📊 ESTILOS
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: BotaLoveColors.textPrimary,
  },
  premiumBadge: {
    backgroundColor: BotaLoveColors.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  premiumBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  filterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  filterItemSelected: {
    borderColor: BotaLoveColors.primary,
    backgroundColor: `${BotaLoveColors.primary}08`,
  },
  filterItemLocked: {
    opacity: 0.85,
    backgroundColor: '#FAFAFA',
  },
  filterContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  filterIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  filterTextContainer: {
    flex: 1,
  },
  filterName: {
    fontSize: 16,
    fontWeight: '600',
    color: BotaLoveColors.textPrimary,
    marginBottom: 2,
  },
  filterNameLocked: {
    color: BotaLoveColors.textSecondary,
  },
  filterDescription: {
    fontSize: 13,
    color: BotaLoveColors.textSecondary,
  },
  lockBadge: {
    backgroundColor: '#FFF3E0',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockIcon: {
    fontSize: 16,
  },
  checkBadge: {
    backgroundColor: BotaLoveColors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkIcon: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 28,
    width: SCREEN_WIDTH - 48,
    maxWidth: 360,
    alignItems: 'center',
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  iconGradient: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterIcon: {
    fontSize: 32,
  },
  lockOverlay: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  lockEmoji: {
    fontSize: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: BotaLoveColors.textPrimary,
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: BotaLoveColors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  benefitsContainer: {
    width: '100%',
    marginBottom: 24,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  benefitIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  benefitText: {
    fontSize: 15,
    color: BotaLoveColors.textPrimary,
  },
  primaryButton: {
    width: '100%',
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    paddingVertical: 12,
  },
  secondaryButtonText: {
    color: BotaLoveColors.textSecondary,
    fontSize: 15,
    fontWeight: '500',
  },
});

const chipStyles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  chipLocked: {
    backgroundColor: '#F5F5F5',
    borderColor: '#E0E0E0',
  },
  icon: {
    fontSize: 14,
    marginRight: 6,
  },
  text: {
    fontSize: 13,
    color: BotaLoveColors.textPrimary,
    fontWeight: '500',
  },
  textLocked: {
    color: BotaLoveColors.textSecondary,
  },
  lock: {
    fontSize: 12,
    marginLeft: 4,
  },
});

const bannerStyles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  gradient: {
    padding: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: 28,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  badge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
