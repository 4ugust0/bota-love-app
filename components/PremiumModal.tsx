import { BotaLoveColors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import {
    getUserInventory,
    PERIOD_LABELS,
    subscribeToPlan,
    SubscriptionPeriod
} from '@/firebase/planSubscriptionService';
import {
    formatPlanPrice,
    getPlansByCategory,
    MOCK_PLANS,
    Plan,
    PlanCategory,
} from '@/firebase/plansService';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    FlatList,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface PremiumModalProps {
  visible: boolean;
  onClose: () => void;
  feature?: string;
}

export default function PremiumModal({ visible, onClose, feature }: PremiumModalProps) {
  const { togglePremium, isAgroUser, currentUser, refreshUserData } = useAuth();
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<SubscriptionPeriod>('monthly');

  // Determinar a categoria do usuário
  const getUserCategory = useCallback((): PlanCategory => {
    // Se o usuário é agro, mostrar planos 'sou_agro'
    if (isAgroUser) {
      return 'sou_agro';
    }
    // Caso contrário, mostrar planos 'simpatizante_agro'
    return 'simpatizante_agro';
  }, [isAgroUser]);

  // Carregar planos do Firebase
  useEffect(() => {
    const loadPlans = async () => {
      if (!visible) return;
      
      setIsLoading(true);
      try {
        const userCategory = getUserCategory();
        console.log('🎯 Carregando planos para categoria:', userCategory);
        
        const fetchedPlans = await getPlansByCategory(userCategory);
        
        if (fetchedPlans.length > 0) {
          setPlans(fetchedPlans);
          console.log(`✅ ${fetchedPlans.length} planos carregados:`, fetchedPlans.map(p => p.name));
        } else {
          // Fallback para mock data
          console.log('⚠️ Usando planos mock');
          const mockFiltered = MOCK_PLANS.filter(
            p => p.category === userCategory || p.category === 'all'
          );
          setPlans(mockFiltered.length > 0 ? mockFiltered : MOCK_PLANS);
        }
      } catch (error) {
        console.error('❌ Erro ao carregar planos:', error);
        setPlans(MOCK_PLANS);
      } finally {
        setIsLoading(false);
      }
    };

    loadPlans();
  }, [visible, getUserCategory]);

  // Handler para assinar um plano
  const handleSubscribe = async (plan: Plan, period: SubscriptionPeriod) => {
    if (!currentUser) {
      Alert.alert('Erro', 'Você precisa estar logado para assinar um plano.');
      return;
    }

    const price = plan.prices[period];
    const periodLabel = PERIOD_LABELS[period];

    // Confirmar assinatura
    Alert.alert(
      '✨ Confirmar Assinatura',
      `Você está prestes a assinar:\n\n` +
      `📋 Plano: ${plan.name}\n` +
      `⏱️ Período: ${periodLabel}\n` +
      `💰 Valor: ${formatPlanPrice(price)}\n\n` +
      `${plan.includedItems && plan.includedItems.length > 0 
        ? '🎁 Itens incluídos:\n' + plan.includedItems.map(i => `  • ${i.quantity}x ${i.itemName}`).join('\n') + '\n\n'
        : ''}` +
      `Deseja continuar?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Assinar Agora',
          style: 'default',
          onPress: async () => {
            setIsSubscribing(true);
            try {
              const result = await subscribeToPlan(currentUser.id, plan.id, period);

              if (result.success) {
                // Buscar itens do inventário para mostrar
                const inventory = await getUserInventory(currentUser.id);
                
                // Atualizar dados do usuário no contexto
                await refreshUserData();
                
                // Fechar modal e mostrar sucesso
                onClose();
                
                setTimeout(() => {
                  Alert.alert(
                    '🎉 Parabéns!',
                    `Sua assinatura do ${plan.name} foi ativada com sucesso!\n\n` +
                    `📅 Período: ${periodLabel}\n` +
                    `🗓️ Válido até: ${result.subscription?.endDate.toDate().toLocaleDateString('pt-BR')}\n\n` +
                    `${inventory.length > 0 
                      ? '🎁 Seus itens:\n' + inventory.map(i => `  • ${i.quantity === -1 ? '∞' : i.quantity}x ${i.itemName}`).join('\n')
                      : ''}`,
                    [{ text: 'Começar a usar!' }]
                  );
                }, 400);
              } else {
                Alert.alert('Erro', result.error || 'Não foi possível processar sua assinatura.');
              }
            } catch (error: any) {
              console.error('Erro ao assinar:', error);
              Alert.alert('Erro', 'Ocorreu um erro ao processar sua assinatura.');
            } finally {
              setIsSubscribing(false);
            }
          },
        },
      ]
    );
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Seja Premium</Text>
            {feature && (
              <Text style={styles.featureText}>
                Para usar <Text style={styles.featureBold}>{feature}</Text>, você precisa de um plano Premium
              </Text>
            )}
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Benefícios */}
            <View style={styles.benefitsSection}>
              <Text style={styles.sectionTitle}>✨ Benefícios Premium</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.benefitsList}
              >
                <BenefitItem icon="💚" text="Likes ilimitados" />
                <BenefitItem icon="⭐" text="Super Likes" />
                <BenefitItem icon="🚀" text="Boosts" />
                <BenefitItem icon="👁️" text="Veja quem curtiu" />
                <BenefitItem icon="🚫" text="Sem anúncios" />
                <BenefitItem icon="🔒" text="Privacidade" />
              </ScrollView>
            </View>

            {/* Carrossel de Planos */}
            <View style={styles.carouselSection}>
              <Text style={styles.carouselTitle}>Escolha seu plano</Text>
              <Text style={styles.categoryBadge}>
                {isAgroUser ? '🌾 Planos Sou Agro' : '💚 Planos Simpatizante'}
              </Text>
              
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={BotaLoveColors.primary} />
                  <Text style={styles.loadingText}>Carregando planos...</Text>
                </View>
              ) : plans.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>Nenhum plano disponível</Text>
                </View>
              ) : (
              <FlatList
                ref={flatListRef}
                data={plans}
                renderItem={({ item }) => (
                  <PlanCard 
                    plan={item} 
                    onSelect={(period) => handleSubscribe(item, period)}
                    isSubscribing={isSubscribing}
                  />
                )}
                keyExtractor={(item) => item.id}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                snapToInterval={SCREEN_WIDTH - 40}
                decelerationRate="fast"
                contentContainerStyle={styles.carouselContent}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
                getItemLayout={(data, index) => ({
                  length: SCREEN_WIDTH - 40,
                  offset: (SCREEN_WIDTH - 40) * index,
                  index,
                })}
                initialScrollIndex={0}
              />
              )}

              {/* Indicadores de página */}
              {plans.length > 0 && (
              <View style={styles.pagination}>
                {plans.map((_, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.paginationDot,
                      index === currentIndex && styles.paginationDotActive,
                    ]}
                    onPress={() => {
                      flatListRef.current?.scrollToIndex({ index, animated: true });
                    }}
                  />
                ))}
              </View>
              )}
            </View>

            <Text style={styles.disclaimer}>
              Pagamento seguro • Cancele quando quiser
            </Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function BenefitItem({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.benefitItem}>
      <Text style={styles.benefitIcon}>{icon}</Text>
      <Text style={styles.benefitText}>{text}</Text>
    </View>
  );
}

interface PlanCardProps {
  plan: Plan;
  onSelect: (period: SubscriptionPeriod) => void;
  isSubscribing: boolean;
}

function PlanCard({ plan, onSelect, isSubscribing }: PlanCardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<SubscriptionPeriod>('monthly');
  
  // Preços por período
  const prices = plan.prices || { monthly: 0, quarterly: 0, yearly: 0 };
  const originalPrices = plan.originalPrices || { monthly: 0, quarterly: 0, yearly: 0 };
  
  // Preço atual baseado no período selecionado
  const currentPrice = prices[selectedPeriod];
  const originalPrice = originalPrices[selectedPeriod];
  
  // Calcular desconto
  const discount = originalPrice > 0 
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
    : 0;

  // Calcular economia no anual
  const monthlyCost = prices.monthly;
  const yearlySavings = prices.yearly > 0 && monthlyCost > 0
    ? Math.round(((monthlyCost * 12) - prices.yearly) / (monthlyCost * 12) * 100)
    : 0;
  
  const quarterlySavings = prices.quarterly > 0 && monthlyCost > 0
    ? Math.round(((monthlyCost * 3) - prices.quarterly) / (monthlyCost * 3) * 100)
    : 0;

  return (
    <View style={styles.planCardContainer}>
      <View 
        style={[
          styles.planCard, 
          plan.isFeatured && styles.planCardPopular,
          plan.color ? { borderColor: plan.color } : null
        ]}
      >
        {plan.isFeatured && (
          <View style={[styles.popularBadge, plan.color ? { backgroundColor: plan.color } : null]}>
            <Text style={styles.popularBadgeText}>
              {plan.badgeText || 'MAIS POPULAR'}
            </Text>
          </View>
        )}

        <View style={styles.planContent}>
          <Text style={styles.planName}>{plan.name}</Text>
          <Text style={styles.planDescription}>{plan.description}</Text>

          {/* Seletor de Período */}
          <View style={styles.periodSelector}>
            <TouchableOpacity
              style={[
                styles.periodOption,
                selectedPeriod === 'monthly' && styles.periodOptionSelected,
              ]}
              onPress={() => setSelectedPeriod('monthly')}
            >
              <Text style={[
                styles.periodText,
                selectedPeriod === 'monthly' && styles.periodTextSelected,
              ]}>Mensal</Text>
              <Text style={[
                styles.periodPrice,
                selectedPeriod === 'monthly' && styles.periodPriceSelected,
              ]}>{formatPlanPrice(prices.monthly)}</Text>
            </TouchableOpacity>

            {prices.quarterly > 0 && (
              <TouchableOpacity
                style={[
                  styles.periodOption,
                  selectedPeriod === 'quarterly' && styles.periodOptionSelected,
                ]}
                onPress={() => setSelectedPeriod('quarterly')}
              >
                {quarterlySavings > 0 && (
                  <View style={styles.periodSavingsBadge}>
                    <Text style={styles.periodSavingsText}>-{quarterlySavings}%</Text>
                  </View>
                )}
                <Text style={[
                  styles.periodText,
                  selectedPeriod === 'quarterly' && styles.periodTextSelected,
                ]}>Trimestral</Text>
                <Text style={[
                  styles.periodPrice,
                  selectedPeriod === 'quarterly' && styles.periodPriceSelected,
                ]}>{formatPlanPrice(prices.quarterly)}</Text>
              </TouchableOpacity>
            )}

            {prices.yearly > 0 && (
              <TouchableOpacity
                style={[
                  styles.periodOption,
                  selectedPeriod === 'yearly' && styles.periodOptionSelected,
                ]}
                onPress={() => setSelectedPeriod('yearly')}
              >
                {yearlySavings > 0 && (
                  <View style={styles.periodSavingsBadge}>
                    <Text style={styles.periodSavingsText}>-{yearlySavings}%</Text>
                  </View>
                )}
                <Text style={[
                  styles.periodText,
                  selectedPeriod === 'yearly' && styles.periodTextSelected,
                ]}>Anual</Text>
                <Text style={[
                  styles.periodPrice,
                  selectedPeriod === 'yearly' && styles.periodPriceSelected,
                ]}>{formatPlanPrice(prices.yearly)}</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Preço destacado */}
          <View style={styles.priceContainer}>
            {originalPrice > 0 && (
              <Text style={styles.originalPrice}>{formatPlanPrice(originalPrice)}</Text>
            )}
            <View style={styles.priceRow}>
              <Text style={styles.planPrice}>{formatPlanPrice(currentPrice)}</Text>
              <Text style={styles.planDuration}>
                /{selectedPeriod === 'monthly' ? 'mês' : selectedPeriod === 'quarterly' ? '3 meses' : 'ano'}
              </Text>
            </View>
          </View>

          {discount > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-{discount}%</Text>
            </View>
          )}

          {/* Itens Incluídos */}
          {plan.includedItems && plan.includedItems.length > 0 && (
            <View style={styles.includedItemsSection}>
              <Text style={styles.includedItemsTitle}>🎁 Itens Incluídos</Text>
              {plan.includedItems.map((item, index) => (
                <View key={index} style={styles.includedItemRow}>
                  <View style={styles.includedItemQuantityBadge}>
                    <Text style={styles.includedItemQuantityText}>
                      {item.quantity === -1 ? '∞' : `${item.quantity}x`}
                    </Text>
                  </View>
                  <Text style={styles.includedItemName}>{item.itemName}</Text>
                  {item.renewalType === 'per_period' && (
                    <View style={styles.renewalBadge}>
                      <Text style={styles.renewalBadgeText}>Por período</Text>
                    </View>
                  )}
                  {item.renewalType === 'unlimited' && (
                    <View style={[styles.renewalBadge, { backgroundColor: '#2ECC71' }]}>
                      <Text style={styles.renewalBadgeText}>Ilimitado</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}

          <View style={styles.divider} />

          {/* Benefícios */}
          <View style={styles.featuresContainer}>
            {plan.benefits && plan.benefits.map((benefit, index) => (
              <View key={index} style={styles.featureRow}>
                <Text style={styles.checkmark}>✓</Text>
                <Text style={styles.featureItem}>{benefit}</Text>
              </View>
            ))}
          </View>

          {/* Trial */}
          {plan.trialDays > 0 && (
            <View style={styles.trialBadge}>
              <Text style={styles.trialText}>
                🎉 {plan.trialDays} dias grátis para testar!
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity 
          style={[
            styles.selectButton, 
            plan.color ? { backgroundColor: plan.color } : null,
            isSubscribing && styles.selectButtonDisabled
          ]} 
          onPress={() => onSelect(selectedPeriod)}
          disabled={isSubscribing}
        >
          {isSubscribing ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Text style={styles.selectButtonText}>
              Assinar {PERIOD_LABELS[selectedPeriod]} - {formatPlanPrice(currentPrice)}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: BotaLoveColors.backgroundWhite,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '90%',
    paddingBottom: 20,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: BotaLoveColors.neutralLight,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 4,
  },
  closeButtonText: {
    fontSize: 28,
    color: BotaLoveColors.neutralDark,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: BotaLoveColors.secondary,
    textAlign: 'center',
    marginBottom: 10,
  },
  featureText: {
    fontSize: 14,
    color: BotaLoveColors.neutralDark,
    textAlign: 'center',
  },
  featureBold: {
    fontWeight: 'bold',
    color: BotaLoveColors.secondary,
  },
  content: {
    flex: 1,
  },
  benefitsSection: {
    padding: 20,
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: BotaLoveColors.secondary,
    marginBottom: 16,
  },
  benefitsList: {
    flexDirection: 'row',
    gap: 16,
    paddingRight: 20,
  },
  benefitItem: {
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: BotaLoveColors.neutralLight,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    minWidth: 100,
  },
  benefitIcon: {
    fontSize: 28,
    marginBottom: 6,
  },
  benefitText: {
    fontSize: 13,
    color: BotaLoveColors.textPrimary,
    textAlign: 'center',
    fontWeight: '500',
  },
  carouselSection: {
    paddingTop: 10,
  },
  carouselTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: BotaLoveColors.secondary,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  carouselContent: {
    paddingHorizontal: 20,
  },
  planCardContainer: {
    width: SCREEN_WIDTH - 40,
    paddingHorizontal: 0,
  },
  planCard: {
    backgroundColor: BotaLoveColors.neutralLight,
    borderRadius: 20,
    padding: 28,
    borderWidth: 3,
    borderColor: 'transparent',
    height: 560,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    justifyContent: 'space-between',
  },
  planContent: {
    flex: 0,
  },
  planCardPopular: {
    borderColor: BotaLoveColors.primary,
    backgroundColor: '#FFF9E6',
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    alignSelf: 'center',
    backgroundColor: BotaLoveColors.primary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  popularBadgeText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: BotaLoveColors.textPrimary,
    letterSpacing: 0.5,
  },
  planName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: BotaLoveColors.secondary,
    marginBottom: 4,
    marginTop: 8,
  },
  planDescription: {
    fontSize: 14,
    color: BotaLoveColors.neutralDark,
    marginBottom: 16,
  },
  priceContainer: {
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  originalPrice: {
    fontSize: 16,
    color: BotaLoveColors.neutralDark,
    textDecorationLine: 'line-through',
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  planPrice: {
    fontSize: 44,
    fontWeight: 'bold',
    color: BotaLoveColors.secondary,
    lineHeight: 50,
  },
  planDuration: {
    fontSize: 18,
    color: BotaLoveColors.neutralDark,
    marginLeft: 4,
  },
  discountBadge: {
    backgroundColor: BotaLoveColors.error,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  discountText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: BotaLoveColors.textLight,
  },
  divider: {
    height: 1,
    backgroundColor: BotaLoveColors.neutralMedium,
    marginBottom: 16,
    opacity: 0.3,
  },
  featuresContainer: {
    marginBottom: 0,
    gap: 12,
    flex: 1,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  checkmark: {
    fontSize: 18,
    color: BotaLoveColors.primary,
    fontWeight: 'bold',
    marginTop: 2,
  },
  featureItem: {
    fontSize: 15,
    color: BotaLoveColors.textPrimary,
    lineHeight: 22,
    flex: 1,
  },
  selectButton: {
    backgroundColor: BotaLoveColors.primary,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  selectButtonDisabled: {
    opacity: 0.7,
  },
  selectButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: BotaLoveColors.textLight,
  },
  // Seletor de período
  periodSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  periodOption: {
    flex: 1,
    backgroundColor: BotaLoveColors.neutralLight,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  periodOptionSelected: {
    backgroundColor: '#FFF9E6',
    borderColor: BotaLoveColors.primary,
  },
  periodText: {
    fontSize: 12,
    fontWeight: '600',
    color: BotaLoveColors.neutralDark,
    marginBottom: 2,
  },
  periodTextSelected: {
    color: BotaLoveColors.secondary,
  },
  periodPrice: {
    fontSize: 11,
    fontWeight: 'bold',
    color: BotaLoveColors.neutralDark,
  },
  periodPriceSelected: {
    color: BotaLoveColors.primary,
  },
  periodSavingsBadge: {
    position: 'absolute',
    top: -8,
    right: -4,
    backgroundColor: '#2ECC71',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 6,
    zIndex: 1,
  },
  periodSavingsText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFF',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: BotaLoveColors.neutralMedium,
  },
  paginationDotActive: {
    width: 24,
    backgroundColor: BotaLoveColors.primary,
  },
  disclaimer: {
    fontSize: 12,
    color: BotaLoveColors.neutralDark,
    textAlign: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    fontStyle: 'italic',
  },
  // Novos estilos para itens inclusos
  includedItemsSection: {
    marginBottom: 12,
  },
  includedItemsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: BotaLoveColors.secondary,
    marginBottom: 8,
  },
  includedItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  includedItemQuantityBadge: {
    backgroundColor: BotaLoveColors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    minWidth: 32,
    alignItems: 'center',
  },
  includedItemQuantityText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: BotaLoveColors.textLight,
  },
  includedItemName: {
    fontSize: 14,
    color: BotaLoveColors.textPrimary,
    flex: 1,
  },
  renewalBadge: {
    backgroundColor: BotaLoveColors.neutralMedium,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  renewalBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFF',
  },
  trialBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 8,
    alignItems: 'center',
  },
  trialText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2E7D32',
  },
  // Estados de carregamento e vazio
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: BotaLoveColors.neutralDark,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 16,
    color: BotaLoveColors.neutralDark,
    textAlign: 'center',
  },
});
