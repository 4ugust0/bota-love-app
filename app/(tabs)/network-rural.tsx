import { LinkedInIcon } from '@/components/rural-icons/NetworkRuralIcon';
import { BotaLoveColors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import {
    getSubscriptionStatusColor,
    NETWORK_RURAL_BENEFITS,
    NETWORK_RURAL_PRICES,
    NetworkRuralUser,
    searchNetworkUsers
} from '@/data/networkRuralService';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
    Dimensions,
    Image,
    Modal,
    Platform,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function NetworkRuralScreen() {
  const router = useRouter();
  const { 
    isAgroUser, 
    hasNetworkRural, 
    networkSubscription,
    networkTrialDaysRemaining,
    activateNetworkTrial,
    subscribeNetworkMonthly,
    subscribeNetworkLifetime,
  } = useAuth();

  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [networkUsers, setNetworkUsers] = useState<NetworkRuralUser[]>([]);

  // Carregar usuários do network
  useEffect(() => {
    loadNetworkUsers();
  }, [hasNetworkRural]);

  const loadNetworkUsers = () => {
    const users = searchNetworkUsers();
    setNetworkUsers(users);
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      loadNetworkUsers();
      setRefreshing(false);
    }, 1000);
  };

  // Filtrar usuários baseado na busca
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return networkUsers;
    const query = searchQuery.toLowerCase();
    return networkUsers.filter(user => 
      user.name.toLowerCase().includes(query) ||
      user.occupation.toLowerCase().includes(query) ||
      user.agroArea.some(area => area.toLowerCase().includes(query)) ||
      user.city.toLowerCase().includes(query)
    );
  }, [networkUsers, searchQuery]);

  // Se não for usuário Agro, não mostrar nada
  if (!isAgroUser) {
    return (
      <View style={styles.container}>
        <View style={styles.notAgroContainer}>
          <Ionicons name="leaf-outline" size={80} color={BotaLoveColors.neutralMedium} />
          <Text style={styles.notAgroTitle}>Recurso exclusivo</Text>
          <Text style={styles.notAgroText}>
            O Network Rural está disponível apenas para usuários que marcaram "Sou Agro" no cadastro.
          </Text>
        </View>
      </View>
    );
  }

  // Renderizar card de usuário do network
  const renderNetworkUserCard = (user: NetworkRuralUser) => (
    <TouchableOpacity 
      key={user.id} 
      style={styles.userCard}
      activeOpacity={0.8}
      onPress={() => {
        if (hasNetworkRural) {
          // Navegar para o perfil detalhado
          router.push(`/profile-detail/${user.id}` as any);
        } else {
          setShowSubscribeModal(true);
        }
      }}
    >
      <View style={styles.userCardContent}>
        {/* Foto e info básica */}
        <View style={styles.userHeader}>
          <View style={styles.userPhotoContainer}>
            <Image source={{ uri: user.photo }} style={styles.userPhoto} />
            {user.linkedInData?.isVerified && (
              <View style={styles.verifiedBadge}>
                <LinkedInIcon size={14} color="#FFF" />
              </View>
            )}
          </View>
          
          <View style={styles.userInfo}>
            <View style={styles.userNameRow}>
              <Text style={styles.userName}>{user.name}</Text>
              {user.matchScore && user.matchScore > 80 && (
                <View style={styles.matchScoreBadge}>
                  <Text style={styles.matchScoreText}>{user.matchScore}%</Text>
                </View>
              )}
            </View>
            <Text style={styles.userOccupation}>{user.occupation}</Text>
            <Text style={styles.userLocation}>
              <Ionicons name="location-outline" size={12} color={BotaLoveColors.neutralMedium} />
              {' '}{user.city}, {user.state}
            </Text>
          </View>
        </View>

        {/* LinkedIn Info (se tiver) */}
        {user.linkedInData && hasNetworkRural && (
          <View style={styles.linkedInSection}>
            <View style={styles.linkedInHeader}>
              <LinkedInIcon size={16} />
              <Text style={styles.linkedInTitle}>LinkedIn</Text>
            </View>
            <Text style={styles.linkedInPosition}>
              {user.linkedInData.currentPosition} • {user.linkedInData.company}
            </Text>
            {user.linkedInData.summary && (
              <Text style={styles.linkedInSummary} numberOfLines={2}>
                {user.linkedInData.summary}
              </Text>
            )}
          </View>
        )}

        {/* Áreas do Agro */}
        <View style={styles.areasContainer}>
          {user.agroArea.slice(0, 3).map((area, index) => (
            <View key={index} style={styles.areaBadge}>
              <Text style={styles.areaText}>{area}</Text>
            </View>
          ))}
          {user.agroArea.length > 3 && (
            <View style={[styles.areaBadge, styles.moreAreasBadge]}>
              <Text style={styles.moreAreasText}>+{user.agroArea.length - 3}</Text>
            </View>
          )}
        </View>

        {/* Bloqueio se não tiver assinatura */}
        {!hasNetworkRural && (
          <View style={styles.lockedOverlay}>
            <Ionicons name="lock-closed" size={24} color="#FFF" />
            <Text style={styles.lockedText}>Assine para ver perfil completo</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Network Rural</Text>
            <Text style={styles.headerSubtitle}>Conexões profissionais do agro</Text>
          </View>
          <View style={styles.headerActions}>
            {/* Botão de conectar LinkedIn */}
            {hasNetworkRural && (
              <TouchableOpacity 
                style={styles.linkedInButton}
                onPress={() => router.push('/linkedin-connect' as any)}
              >
                <Ionicons name="logo-linkedin" size={20} color="#0A66C2" />
              </TouchableOpacity>
            )}
            {hasNetworkRural && networkSubscription && (
              <View style={[
                styles.statusBadge,
                { backgroundColor: getSubscriptionStatusColor(networkSubscription) + '20' }
              ]}>
                <View style={[
                  styles.statusDot,
                  { backgroundColor: getSubscriptionStatusColor(networkSubscription) }
                ]} />
                <Text style={[
                  styles.statusText,
                  { color: getSubscriptionStatusColor(networkSubscription) }
                ]}>
                  {networkSubscription.status === 'trial' 
                    ? `${networkTrialDaysRemaining}d restantes`
                    : networkSubscription.status === 'lifetime'
                      ? 'Vitalício'
                      : 'Ativo'
                  }
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Barra de busca */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={BotaLoveColors.neutralMedium} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nome, área ou cidade..."
            placeholderTextColor={BotaLoveColors.neutralMedium}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={BotaLoveColors.neutralMedium} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filtros rápidos */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filtersScroll}
          contentContainerStyle={styles.filtersContent}
        >
          {['Todos', 'LinkedIn Verificado', 'Pecuária', 'Agricultura', 'Tecnologia'].map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterChip,
                selectedFilter === filter && styles.filterChipActive
              ]}
              onPress={() => setSelectedFilter(selectedFilter === filter ? null : filter)}
            >
              <Text style={[
                styles.filterText,
                selectedFilter === filter && styles.filterTextActive
              ]}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Banner de assinatura (se não tiver) */}
        {!hasNetworkRural && (
          <TouchableOpacity 
            style={styles.subscribeBanner}
            onPress={() => setShowSubscribeModal(true)}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['#2ECC71', '#27AE60']}
              style={styles.subscribeGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.subscribeContent}>
                <View style={styles.subscribeIcon}>
                  <MaterialCommunityIcons name="sprout" size={32} color="#FFF" />
                </View>
                <View style={styles.subscribeText}>
                  <Text style={styles.subscribeTitle}>Network Rural Premium</Text>
                  <Text style={styles.subscribeSubtitle}>
                    Conecte-se com profissionais do agro!
                  </Text>
                </View>
                <View style={styles.subscribePriceTag}>
                  <Text style={styles.subscribePriceOld}>R$ {NETWORK_RURAL_PRICES.lifetimeOriginal.toFixed(2)}</Text>
                  <Text style={styles.subscribePrice}>R$ {NETWORK_RURAL_PRICES.lifetime.toFixed(2)}</Text>
                  <Text style={styles.subscribePriceLabel}>/mês</Text>
                </View>
              </View>
              <View style={styles.subscribePromo}>
                <Ionicons name="time-outline" size={14} color="#FFF" />
                <Text style={styles.subscribePromoText}>
                  Promoção de lançamento • Preço vitalício!
                </Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Banner para conectar LinkedIn (se tem assinatura mas não conectou) */}
        {hasNetworkRural && (
          <TouchableOpacity 
            style={styles.linkedInBanner}
            onPress={() => router.push('/linkedin-connect' as any)}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['#0A66C2', '#004182']}
              style={styles.linkedInBannerGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.linkedInBannerContent}>
                <View style={styles.linkedInBannerIcon}>
                  <Ionicons name="logo-linkedin" size={28} color="#FFF" />
                </View>
                <View style={styles.linkedInBannerText}>
                  <Text style={styles.linkedInBannerTitle}>Conecte seu LinkedIn</Text>
                  <Text style={styles.linkedInBannerSubtitle}>
                    Importe seus dados profissionais automaticamente
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#FFF" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Seção: Sugestões de Conexão */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🌱 Conexões Recomendadas</Text>
            <Text style={styles.sectionSubtitle}>
              Baseado em suas áreas de interesse
            </Text>
          </View>

          {filteredUsers.length > 0 ? (
            filteredUsers.map(renderNetworkUserCard)
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="search" size={48} color={BotaLoveColors.neutralMedium} />
              <Text style={styles.emptyTitle}>Nenhum resultado</Text>
              <Text style={styles.emptyText}>
                Tente ajustar sua busca ou filtros
              </Text>
            </View>
          )}
        </View>

        {/* Info sobre o Network Rural */}
        {!hasNetworkRural && (
          <View style={styles.benefitsSection}>
            <Text style={styles.benefitsTitle}>Por que assinar?</Text>
            {NETWORK_RURAL_BENEFITS.slice(0, 4).map((benefit, index) => (
              <View key={index} style={styles.benefitItem}>
                <View style={styles.benefitIcon}>
                  <Ionicons name={benefit.icon as any} size={20} color={BotaLoveColors.primary} />
                </View>
                <View style={styles.benefitText}>
                  <Text style={styles.benefitTitle}>{benefit.title}</Text>
                  <Text style={styles.benefitDescription}>{benefit.description}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Modal de Assinatura */}
      <NetworkRuralSubscribeModal
        visible={showSubscribeModal}
        onClose={() => setShowSubscribeModal(false)}
        onSubscribeMonthly={subscribeNetworkMonthly}
        onSubscribeLifetime={subscribeNetworkLifetime}
        onStartTrial={activateNetworkTrial}
      />
    </View>
  );
}

// Modal de Assinatura do Network Rural
interface SubscribeModalProps {
  visible: boolean;
  onClose: () => void;
  onSubscribeMonthly: () => void;
  onSubscribeLifetime: () => void;
  onStartTrial: () => void;
}

function NetworkRuralSubscribeModal({
  visible,
  onClose,
  onSubscribeMonthly,
  onSubscribeLifetime,
  onStartTrial,
}: SubscribeModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'lifetime'>('lifetime');

  const handleSubscribe = () => {
    if (selectedPlan === 'lifetime') {
      onSubscribeLifetime();
    } else {
      onSubscribeMonthly();
    }
    onClose();
  };

  const handleStartTrial = () => {
    onStartTrial();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={modalStyles.overlay}>
        <View style={modalStyles.container}>
          {/* Header */}
          <LinearGradient
            colors={['#2ECC71', '#27AE60']}
            style={modalStyles.header}
          >
            <TouchableOpacity style={modalStyles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color="#FFF" />
            </TouchableOpacity>
            
            <MaterialCommunityIcons name="sprout" size={60} color="#FFF" />
            <Text style={modalStyles.title}>Network Rural Premium</Text>
            <Text style={modalStyles.subtitle}>
              Conecte-se com quem movimenta o agro de verdade!
            </Text>
          </LinearGradient>

          <ScrollView style={modalStyles.content} showsVerticalScrollIndicator={false}>
            {/* Frase de impacto */}
            <View style={modalStyles.impactPhrase}>
              <Ionicons name="sparkles" size={20} color={BotaLoveColors.primary} />
              <Text style={modalStyles.impactText}>
                "Networking profissional no agro, em um só lugar."
              </Text>
            </View>

            {/* Benefícios */}
            <View style={modalStyles.benefitsContainer}>
              {NETWORK_RURAL_BENEFITS.map((benefit, index) => (
                <View key={index} style={modalStyles.benefitRow}>
                  <View style={modalStyles.benefitIcon}>
                    <Ionicons name={benefit.icon as any} size={18} color="#2ECC71" />
                  </View>
                  <Text style={modalStyles.benefitText}>{benefit.title}</Text>
                </View>
              ))}
            </View>

            {/* Planos */}
            <Text style={modalStyles.plansTitle}>Escolha seu plano:</Text>

            {/* Plano Vitalício (Promoção) */}
            <TouchableOpacity
              style={[
                modalStyles.planCard,
                selectedPlan === 'lifetime' && modalStyles.planCardSelected,
              ]}
              onPress={() => setSelectedPlan('lifetime')}
              activeOpacity={0.8}
            >
              <View style={modalStyles.planPromoTag}>
                <Ionicons name="flash" size={12} color="#FFF" />
                <Text style={modalStyles.planPromoText}>PROMOÇÃO DE LANÇAMENTO</Text>
              </View>
              <View style={modalStyles.planHeader}>
                <View style={modalStyles.planRadio}>
                  {selectedPlan === 'lifetime' && (
                    <View style={modalStyles.planRadioInner} />
                  )}
                </View>
                <View style={modalStyles.planInfo}>
                  <Text style={modalStyles.planName}>Plano Vitalício</Text>
                  <Text style={modalStyles.planDescription}>
                    Pague este preço para sempre!
                  </Text>
                </View>
                <View style={modalStyles.planPricing}>
                  <Text style={modalStyles.planPriceOld}>
                    R$ {NETWORK_RURAL_PRICES.lifetimeOriginal.toFixed(2)}
                  </Text>
                  <Text style={modalStyles.planPrice}>
                    R$ {NETWORK_RURAL_PRICES.lifetime.toFixed(2)}
                  </Text>
                  <Text style={modalStyles.planPeriod}>/mês</Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Plano Mensal */}
            <TouchableOpacity
              style={[
                modalStyles.planCard,
                selectedPlan === 'monthly' && modalStyles.planCardSelected,
              ]}
              onPress={() => setSelectedPlan('monthly')}
              activeOpacity={0.8}
            >
              <View style={modalStyles.planHeader}>
                <View style={modalStyles.planRadio}>
                  {selectedPlan === 'monthly' && (
                    <View style={modalStyles.planRadioInner} />
                  )}
                </View>
                <View style={modalStyles.planInfo}>
                  <Text style={modalStyles.planName}>Plano Mensal</Text>
                  <Text style={modalStyles.planDescription}>
                    Renovação automática
                  </Text>
                </View>
                <View style={modalStyles.planPricing}>
                  <Text style={modalStyles.planPrice}>
                    R$ {NETWORK_RURAL_PRICES.monthly.toFixed(2)}
                  </Text>
                  <Text style={modalStyles.planPeriod}>/mês</Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Trial Info */}
            <View style={modalStyles.trialInfo}>
              <Ionicons name="gift-outline" size={20} color={BotaLoveColors.primary} />
              <Text style={modalStyles.trialText}>
                Experimente 7 dias grátis antes de pagar!
              </Text>
            </View>
          </ScrollView>

          {/* Footer com botões */}
          <View style={modalStyles.footer}>
            <TouchableOpacity
              style={modalStyles.subscribeButton}
              onPress={handleSubscribe}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#2ECC71', '#27AE60']}
                style={modalStyles.subscribeGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={modalStyles.subscribeButtonText}>
                  ✅ Quero ativar o Network Rural
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={modalStyles.trialButton}
              onPress={handleStartTrial}
              activeOpacity={0.7}
            >
              <Text style={modalStyles.trialButtonText}>
                Começar período gratuito de 7 dias
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BotaLoveColors.backgroundLight,
  },
  notAgroContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  notAgroTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: BotaLoveColors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  notAgroText: {
    fontSize: 16,
    color: BotaLoveColors.neutralMedium,
    textAlign: 'center',
    lineHeight: 24,
  },
  header: {
    backgroundColor: '#FFF',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  linkedInButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F4FC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: BotaLoveColors.secondary,
  },
  headerSubtitle: {
    fontSize: 14,
    color: BotaLoveColors.neutralMedium,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BotaLoveColors.backgroundLight,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: BotaLoveColors.textPrimary,
    marginLeft: 8,
  },
  filtersScroll: {
    marginBottom: 4,
  },
  filtersContent: {
    paddingRight: 20,
  },
  filterChip: {
    backgroundColor: BotaLoveColors.backgroundLight,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  filterChipActive: {
    backgroundColor: BotaLoveColors.primary,
    borderColor: BotaLoveColors.primary,
  },
  filterText: {
    fontSize: 13,
    color: BotaLoveColors.neutralDark,
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#FFF',
  },
  subscribeBanner: {
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  subscribeGradient: {
    padding: 16,
  },
  subscribeContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subscribeIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  subscribeText: {
    flex: 1,
    marginLeft: 12,
  },
  subscribeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  subscribeSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  subscribePriceTag: {
    alignItems: 'flex-end',
  },
  subscribePriceOld: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    textDecorationLine: 'line-through',
  },
  subscribePrice: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
  },
  subscribePriceLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
  },
  subscribePromo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  subscribePromoText: {
    fontSize: 12,
    color: '#FFF',
    fontWeight: '600',
    marginLeft: 6,
  },
  linkedInBanner: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  linkedInBannerGradient: {
    padding: 16,
  },
  linkedInBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkedInBannerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  linkedInBannerText: {
    flex: 1,
    marginLeft: 12,
  },
  linkedInBannerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  linkedInBannerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: BotaLoveColors.textPrimary,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: BotaLoveColors.neutralMedium,
    marginTop: 4,
  },
  userCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  userCardContent: {
    padding: 16,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  userPhotoContainer: {
    position: 'relative',
  },
  userPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#0A66C2',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: BotaLoveColors.textPrimary,
  },
  matchScoreBadge: {
    backgroundColor: '#2ECC71',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  matchScoreText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FFF',
  },
  userOccupation: {
    fontSize: 14,
    color: BotaLoveColors.secondary,
    marginTop: 2,
  },
  userLocation: {
    fontSize: 12,
    color: BotaLoveColors.neutralMedium,
    marginTop: 2,
  },
  linkedInSection: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F0F7FF',
    borderRadius: 8,
  },
  linkedInHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  linkedInTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0A66C2',
    marginLeft: 6,
  },
  linkedInPosition: {
    fontSize: 13,
    fontWeight: '600',
    color: BotaLoveColors.textPrimary,
  },
  linkedInSummary: {
    fontSize: 12,
    color: BotaLoveColors.neutralDark,
    marginTop: 4,
    lineHeight: 18,
  },
  areasContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 6,
  },
  areaBadge: {
    backgroundColor: BotaLoveColors.primary + '15',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  areaText: {
    fontSize: 11,
    color: BotaLoveColors.primaryDark,
    fontWeight: '500',
  },
  moreAreasBadge: {
    backgroundColor: BotaLoveColors.neutralMedium + '20',
  },
  moreAreasText: {
    fontSize: 11,
    color: BotaLoveColors.neutralDark,
    fontWeight: '500',
  },
  lockedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
  lockedText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: BotaLoveColors.textPrimary,
    marginTop: 12,
  },
  emptyText: {
    fontSize: 14,
    color: BotaLoveColors.neutralMedium,
    marginTop: 4,
  },
  benefitsSection: {
    backgroundColor: '#FFF',
    margin: 16,
    padding: 20,
    borderRadius: 16,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: BotaLoveColors.textPrimary,
    marginBottom: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  benefitIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: BotaLoveColors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  benefitText: {
    flex: 1,
    marginLeft: 12,
  },
  benefitTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: BotaLoveColors.textPrimary,
  },
  benefitDescription: {
    fontSize: 13,
    color: BotaLoveColors.neutralMedium,
    marginTop: 2,
  },
});

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 12,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginTop: 6,
  },
  content: {
    padding: 20,
  },
  impactPhrase: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BotaLoveColors.primary + '15',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
  },
  impactText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: BotaLoveColors.primaryDark,
    marginLeft: 8,
    fontWeight: '600',
  },
  benefitsContainer: {
    marginBottom: 24,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E8F8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  benefitText: {
    fontSize: 14,
    color: BotaLoveColors.textPrimary,
    flex: 1,
  },
  plansTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: BotaLoveColors.textPrimary,
    marginBottom: 12,
  },
  planCard: {
    borderWidth: 2,
    borderColor: '#E8E8E8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  planCardSelected: {
    borderColor: '#2ECC71',
    backgroundColor: '#F0FFF5',
  },
  planPromoTag: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#E74C3C',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderBottomLeftRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  planPromoText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#FFF',
    marginLeft: 4,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  planRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#2ECC71',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  planRadioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2ECC71',
  },
  planInfo: {
    flex: 1,
  },
  planName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: BotaLoveColors.textPrimary,
  },
  planDescription: {
    fontSize: 12,
    color: BotaLoveColors.neutralMedium,
    marginTop: 2,
  },
  planPricing: {
    alignItems: 'flex-end',
  },
  planPriceOld: {
    fontSize: 11,
    color: BotaLoveColors.neutralMedium,
    textDecorationLine: 'line-through',
  },
  planPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2ECC71',
  },
  planPeriod: {
    fontSize: 11,
    color: BotaLoveColors.neutralMedium,
  },
  trialInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BotaLoveColors.primary + '15',
    padding: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  trialText: {
    fontSize: 13,
    color: BotaLoveColors.primaryDark,
    fontWeight: '600',
    marginLeft: 8,
  },
  footer: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
  },
  subscribeButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  subscribeGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  subscribeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  trialButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  trialButtonText: {
    fontSize: 14,
    color: BotaLoveColors.neutralDark,
    fontWeight: '600',
  },
});
