/**
 * 🔥 BOTA LOVE APP - Plans Screen (Estilo Tinder)
 * 
 * Tela de seleção de planos com carrossel horizontal e benefícios
 * 
 * @author Bota Love Team
 */

import { BotaLoveColors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { auth } from '@/firebase/config';
import { checkoutNetwork, checkoutPremium, formatPrice, ProductData } from '@/firebase/stripeService';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    FlatList,
    Image,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.7;
const CARD_MARGIN = 10;

// =============================================================================
// 📝 TIPOS
// =============================================================================

interface Plan {
  id: string;
  name: string;
  shortName: string;
  price: number;
  period: 'month' | 'quarter' | 'year' | 'lifetime';
  periodLabel: string;
  pricePerMonth?: number;
  description: string;
  popular?: boolean;
  discount?: number;
  originalPrice?: number;
  color: string;
  gradientColors: [string, string];
}

interface Benefit {
  id: string;
  title: string;
  subtitle?: string;
  icon: string;
  locked: boolean;
  premium?: boolean;
}

// =============================================================================
// 📊 PLANOS DISPONÍVEIS (valores em centavos)
// =============================================================================

const PREMIUM_PLANS: Plan[] = [
  {
    id: 'premium_monthly',
    name: 'Bota Love+',
    shortName: 'Mensal',
    price: 4990,
    period: 'month',
    periodLabel: '/mês',
    description: 'Experimente o Premium',
    color: '#D4AD63',
    gradientColors: ['#E5C88A', '#D4AD63'],
  },
  {
    id: 'premium_quarterly',
    name: 'Bota Love+',
    shortName: 'Trimestral',
    price: 11990,
    originalPrice: 14970,
    pricePerMonth: 3997,
    period: 'quarter',
    periodLabel: '/trimestre',
    description: 'Economize 20%',
    discount: 20,
    color: '#9C27B0',
    gradientColors: ['#BA68C8', '#9C27B0'],
  },
  {
    id: 'premium_annual',
    name: 'Bota Love+',
    shortName: 'Anual',
    price: 35990,
    originalPrice: 59880,
    pricePerMonth: 2999,
    period: 'year',
    periodLabel: '/ano',
    description: 'Economize 40%',
    popular: true,
    discount: 40,
    color: '#E91E63',
    gradientColors: ['#F48FB1', '#E91E63'],
  },
];

// Benefícios organizados em seções
const BENEFITS_UPGRADE: Benefit[] = [
  {
    id: 'unlimited_likes',
    title: 'Curtidas ilimitadas',
    icon: 'heart',
    locked: false,
    premium: true,
  },
  {
    id: 'see_likes',
    title: 'Veja quem curtiu você',
    subtitle: 'Saiba quem já demonstrou interesse',
    icon: 'eye',
    locked: true,
  },
  {
    id: 'priority_likes',
    title: 'Curtidas Prioritárias',
    subtitle: 'Seus likes aparecem primeiro',
    icon: 'flash',
    locked: true,
  },
];

const BENEFITS_EXPERIENCE: Benefit[] = [
  {
    id: 'rewind',
    title: 'Use o Voltar quantas vezes quiser',
    icon: 'refresh',
    locked: false,
    premium: true,
  },
  {
    id: 'boost',
    title: '1 Destaque Rural grátis por mês',
    icon: 'rocket',
    locked: true,
  },
  {
    id: 'super_likes',
    title: '3 Super Agro grátis por semana',
    icon: 'star',
    locked: true,
  },
  {
    id: 'correio',
    title: '3 Correio da Roça por semana',
    subtitle: 'Chame atenção com uma mensagem antes de dar match',
    icon: 'mail',
    locked: true,
  },
];

const NETWORK_PLANS: Plan[] = [
  {
    id: 'network_monthly',
    name: 'Network Rural',
    shortName: 'Mensal',
    price: 1490,
    period: 'month',
    periodLabel: '/mês',
    description: 'Conexões do Agro',
    color: '#4CAF50',
    gradientColors: ['#81C784', '#4CAF50'],
  },
  {
    id: 'network_lifetime',
    name: 'Network Rural',
    shortName: 'Vitalício',
    price: 990,
    period: 'lifetime',
    periodLabel: 'único',
    description: 'Oferta de lançamento!',
    popular: true,
    color: '#2E7D32',
    gradientColors: ['#4CAF50', '#2E7D32'],
  },
];

// =============================================================================
// 🎭 COMPONENTE PRINCIPAL
// =============================================================================

export default function PlansScreen() {
  const router = useRouter();
  const { currentUser, hasPremium, hasNetworkRural, isAgroUser } = useAuth();
  const [selectedPlanIndex, setSelectedPlanIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'premium' | 'network'>('premium');
  const flatListRef = useRef<FlatList>(null);
  
  // PIX Payment State
  const [pixCode, setPixCode] = useState<string | null>(null);
  const [pixQrCode, setPixQrCode] = useState<string | null>(null);
  const [pixExpiresAt, setPixExpiresAt] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);

  const plans = activeTab === 'premium' ? PREMIUM_PLANS : NETWORK_PLANS;
  const selectedPlan = plans[selectedPlanIndex];
  const isSubscribed = activeTab === 'premium' ? hasPremium : hasNetworkRural;

  // ===========================================================================
  // 💳 PAGAMENTO VIA PIX
  // ===========================================================================

  const handleSubscribe = () => {
    setPixCode(null);
    setPixQrCode(null);
    setPixExpiresAt(null);
    setPaymentId(null);
    setShowPaymentModal(true);
  };

  const handlePayment = async () => {
    if (!selectedPlan || !auth.currentUser) return;

    setIsProcessing(true);

    try {
      const userId = auth.currentUser.uid;
      const email = auth.currentUser.email || undefined;
      const name = currentUser?.profile?.name || undefined;

      const product: ProductData = {
        id: selectedPlan.id,
        name: selectedPlan.name,
        description: selectedPlan.description,
        amount: selectedPlan.price,
        category: activeTab,
        metadata: {
          period: selectedPlan.period,
        },
      };

      let result;
      if (activeTab === 'premium') {
        result = await checkoutPremium(userId, product, email, name);
      } else {
        result = await checkoutNetwork(userId, product, email, name);
      }

      if (result.success && result.pixCode) {
        setPixCode(result.pixCode);
        setPixQrCode(result.pixQrCode || null);
        setPixExpiresAt(result.expiresAt || null);
        setPaymentId(result.paymentId || null);
        
        Alert.alert(
          '🎉 PIX Gerado!',
          'Escaneie o QR Code ou copie o código PIX para realizar o pagamento.',
          [{ text: 'Entendi' }]
        );
      } else {
        throw new Error(result.error || 'Erro ao gerar PIX');
      }
    } catch (error: any) {
      console.error('Erro no pagamento:', error);
      Alert.alert(
        'Erro no Pagamento', 
        error.message || 'Não foi possível processar o pagamento. Tente novamente.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const copyPixCode = async () => {
    if (pixCode) {
      await Clipboard.setStringAsync(pixCode);
      Alert.alert('Copiado!', 'Código PIX copiado para a área de transferência.');
    }
  };

  const closePaymentModal = () => {
    setShowPaymentModal(false);
    setPixCode(null);
    setPixQrCode(null);
    setPixExpiresAt(null);
    setPaymentId(null);
  };

  // ===========================================================================
  // 📱 CARROSSEL DE PLANOS
  // ===========================================================================

  const onScrollEnd = (e: any) => {
    const contentOffset = e.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffset / (CARD_WIDTH + CARD_MARGIN * 2));
    setSelectedPlanIndex(Math.max(0, Math.min(index, plans.length - 1)));
  };

  const renderPlanCard = ({ item, index }: { item: Plan; index: number }) => {
    const isSelected = index === selectedPlanIndex;
    
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => {
          setSelectedPlanIndex(index);
          flatListRef.current?.scrollToIndex({ index, animated: true });
        }}
        style={[
          styles.planCard,
          isSelected && styles.planCardSelected,
        ]}
      >
        <LinearGradient
          colors={item.gradientColors}
          style={styles.planCardGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Badge de desconto */}
          {item.discount && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-{item.discount}%</Text>
            </View>
          )}
          
          {/* Nome do plano */}
          <View style={styles.planCardContent}>
            <Text style={styles.planCardName}>{item.name}</Text>
            <Text style={styles.planCardPeriod}>{item.shortName}</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  // ===========================================================================
  // 🎁 BENEFÍCIOS
  // ===========================================================================

  const renderBenefitItem = (benefit: Benefit) => (
    <View key={benefit.id} style={styles.benefitItem}>
      <View style={styles.benefitIcon}>
        {benefit.locked ? (
          <Ionicons name="lock-closed" size={18} color="#999" />
        ) : (
          <Ionicons name="checkmark" size={18} color={BotaLoveColors.primary} />
        )}
      </View>
      <View style={styles.benefitContent}>
        <Text style={[
          styles.benefitTitle,
          benefit.locked && styles.benefitTitleLocked
        ]}>
          {benefit.title}
        </Text>
        {benefit.subtitle && (
          <Text style={styles.benefitSubtitle}>{benefit.subtitle}</Text>
        )}
      </View>
    </View>
  );

  // ===========================================================================
  // 💳 MODAL DE PAGAMENTO
  // ===========================================================================

  const renderPaymentModal = () => {
    if (!selectedPlan) return null;

    return (
      <Modal
        visible={showPaymentModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => !isProcessing && closePaymentModal()}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => !isProcessing && closePaymentModal()}
              disabled={isProcessing}
            >
              <Ionicons name="close" size={28} color="#333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {pixCode ? 'Pague com PIX' : 'Confirmar Pagamento'}
            </Text>
            <View style={{ width: 28 }} />
          </View>

          <ScrollView style={styles.modalContent}>
            {pixCode ? (
              <View style={styles.pixContainer}>
                {pixQrCode && (
                  <View style={styles.qrCodeContainer}>
                    <Image 
                      source={{ uri: pixQrCode }} 
                      style={styles.qrCodeImage}
                      resizeMode="contain"
                    />
                  </View>
                )}
                
                <Text style={styles.pixInstructions}>
                  Escaneie o QR Code acima ou copie o código PIX abaixo
                </Text>

                <View style={styles.pixCodeContainer}>
                  <Text style={styles.pixCodeText} numberOfLines={3}>
                    {pixCode}
                  </Text>
                </View>

                <TouchableOpacity style={styles.copyButton} onPress={copyPixCode}>
                  <Ionicons name="copy-outline" size={20} color="#FFF" />
                  <Text style={styles.copyButtonText}>Copiar Código PIX</Text>
                </TouchableOpacity>

                {pixExpiresAt && (
                  <Text style={styles.pixExpires}>
                    ⏱️ PIX válido até {new Date(pixExpiresAt).toLocaleTimeString('pt-BR')}
                  </Text>
                )}

                <Text style={styles.pixNote}>
                  Após o pagamento, seu plano será ativado automaticamente em alguns segundos.
                </Text>

                <TouchableOpacity style={styles.closeButton} onPress={closePaymentModal}>
                  <Text style={styles.closeButtonText}>Fechar</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {/* Resumo do Plano */}
                <View style={styles.summaryCard}>
                  <LinearGradient
                    colors={selectedPlan.gradientColors}
                    style={styles.summaryGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text style={styles.summaryPlanName}>{selectedPlan.name}</Text>
                    <Text style={styles.summaryPlanPeriod}>{selectedPlan.shortName}</Text>
                  </LinearGradient>
                  
                  <View style={styles.summaryDetails}>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Plano</Text>
                      <Text style={styles.summaryValue}>{selectedPlan.name} {selectedPlan.shortName}</Text>
                    </View>

                    {selectedPlan.originalPrice && (
                      <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Desconto</Text>
                        <Text style={[styles.summaryValue, { color: '#4CAF50' }]}>
                          -{selectedPlan.discount}%
                        </Text>
                      </View>
                    )}

                    <View style={styles.summaryDivider} />

                    <View style={styles.summaryRow}>
                      <Text style={styles.totalLabel}>Total</Text>
                      <Text style={styles.totalValue}>
                        {formatPrice(selectedPlan.price)}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Método de Pagamento */}
                <Text style={styles.paymentMethodTitle}>Método de Pagamento</Text>
                
                <View style={styles.paymentMethod}>
                  <View style={styles.paymentMethodIcon}>
                    <Text style={{ fontSize: 24 }}>💳</Text>
                  </View>
                  <View style={styles.paymentMethodInfo}>
                    <Text style={styles.paymentMethodName}>PIX</Text>
                    <Text style={styles.paymentMethodDesc}>Pagamento instantâneo</Text>
                  </View>
                  <Ionicons name="checkmark-circle" size={24} color="#00D4AA" />
                </View>

                <View style={styles.securityInfo}>
                  <Ionicons name="shield-checkmark" size={20} color="#4CAF50" />
                  <Text style={styles.securityText}>Pagamento 100% seguro via PIX</Text>
                </View>

                <Text style={styles.termsText}>
                  Ao continuar, você concorda com nossos Termos de Uso e Política de Privacidade.
                </Text>
              </>
            )}
          </ScrollView>

          {!pixCode && (
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[
                  styles.payButton,
                  { backgroundColor: selectedPlan.color },
                  isProcessing && styles.payButtonDisabled,
                ]}
                onPress={handlePayment}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <ActivityIndicator color="#FFF" />
                    <Text style={styles.payButtonText}>Processando...</Text>
                  </>
                ) : (
                  <>
                    <MaterialCommunityIcons name="qrcode-scan" size={20} color="#FFF" />
                    <Text style={styles.payButtonText}>
                      Pagar {formatPrice(selectedPlan.price)}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>
    );
  };

  // ===========================================================================
  // 🎨 RENDERIZAÇÃO
  // ===========================================================================

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Ionicons name="close" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Minha assinatura</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Carrossel de Planos */}
        <View style={styles.carouselContainer}>
          <FlatList
            ref={flatListRef}
            data={plans}
            renderItem={renderPlanCard}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={CARD_WIDTH + CARD_MARGIN * 2}
            decelerationRate="fast"
            contentContainerStyle={styles.carouselContent}
            onMomentumScrollEnd={onScrollEnd}
          />
          
          {/* Indicadores de página */}
          <View style={styles.pageIndicators}>
            {plans.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.pageIndicator,
                  index === selectedPlanIndex && styles.pageIndicatorActive,
                ]}
              />
            ))}
          </View>
        </View>

        {/* Seção: Dê um upgrade nas suas curtidas */}
        <View style={styles.benefitsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Dê um upgrade nas suas curtidas</Text>
          </View>
          {BENEFITS_UPGRADE.map(renderBenefitItem)}
        </View>

        {/* Seção: Melhore a sua experiência */}
        <View style={styles.benefitsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Melhore a sua experiência</Text>
          </View>
          {BENEFITS_EXPERIENCE.map(renderBenefitItem)}
        </View>

        {/* Garantia */}
        <View style={styles.guaranteeCard}>
          <Ionicons name="shield-checkmark" size={24} color="#4CAF50" />
          <Text style={styles.guaranteeText}>
            Garantia de 7 dias - Não ficou satisfeito? Devolveremos 100% do seu dinheiro.
          </Text>
        </View>
      </ScrollView>

      {/* Botão de Assinar Fixo */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.subscribeButton, { backgroundColor: selectedPlan?.color || BotaLoveColors.primary }]}
          onPress={handleSubscribe}
        >
          <Text style={styles.subscribeButtonText}>
            A PARTIR DE {formatPrice(selectedPlan?.price || 0).replace('R$', 'R$').trim()}
          </Text>
        </TouchableOpacity>
      </View>

      {renderPaymentModal()}
    </View>
  );
}

// =============================================================================
// 🎨 ESTILOS
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#FFF',
  },
  closeBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },

  // Carrossel
  carouselContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  carouselContent: {
    paddingHorizontal: (SCREEN_WIDTH - CARD_WIDTH) / 2 - CARD_MARGIN,
  },
  planCard: {
    width: CARD_WIDTH,
    height: 100,
    marginHorizontal: CARD_MARGIN,
    borderRadius: 16,
    overflow: 'hidden',
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  planCardSelected: {
    opacity: 1,
    transform: [{ scale: 1 }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  planCardGradient: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  planCardContent: {
    flex: 1,
    justifyContent: 'center',
  },
  planCardName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  planCardPeriod: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
  },
  discountBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  discountText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },

  // Indicadores de página
  pageIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    gap: 8,
  },
  pageIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#DDD',
  },
  pageIndicatorActive: {
    backgroundColor: '#333',
    width: 24,
  },

  // Benefícios
  benefitsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  benefitIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  benefitTitleLocked: {
    color: '#999',
  },
  benefitSubtitle: {
    fontSize: 13,
    color: '#999',
    marginTop: 2,
    lineHeight: 18,
  },

  // Garantia
  guaranteeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FFF4',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  guaranteeText: {
    flex: 1,
    fontSize: 13,
    color: '#4CAF50',
    lineHeight: 18,
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  subscribeButton: {
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subscribeButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },

  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  summaryCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
  },
  summaryGradient: {
    padding: 20,
    alignItems: 'center',
  },
  summaryPlanName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  summaryPlanPeriod: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  summaryDetails: {
    padding: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  paymentMethodTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: BotaLoveColors.primary,
  },
  paymentMethodIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 212, 170, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentMethodInfo: {
    flex: 1,
    marginLeft: 12,
  },
  paymentMethodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  paymentMethodDesc: {
    fontSize: 14,
    color: '#666',
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  securityText: {
    fontSize: 14,
    color: '#4CAF50',
  },
  termsText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    lineHeight: 18,
  },
  modalFooter: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30,
    paddingVertical: 18,
    gap: 10,
  },
  payButtonDisabled: {
    opacity: 0.7,
  },
  payButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },

  // PIX
  pixContainer: {
    alignItems: 'center',
    padding: 20,
  },
  qrCodeContainer: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  qrCodeImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
  },
  pixInstructions: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  pixCodeContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 16,
  },
  pixCodeText: {
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: '#333',
    textAlign: 'center',
    lineHeight: 18,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00D4AA',
    borderRadius: 25,
    paddingVertical: 14,
    paddingHorizontal: 24,
    gap: 8,
    marginBottom: 16,
    width: '100%',
  },
  copyButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  pixExpires: {
    fontSize: 14,
    color: '#B8944D',
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '500',
  },
  pixNote: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  closeButton: {
    backgroundColor: '#EEE',
    borderRadius: 25,
    paddingVertical: 14,
    paddingHorizontal: 40,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
});
