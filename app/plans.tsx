/**
 * 🔥 BOTA LOVE APP - Plans Screen
 * 
 * Tela de seleção de planos com pagamento via PIX (Stripe)
 * 
 * @author Bota Love Team
 */

import { BotaLoveColors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { auth, firestore } from '@/firebase/config';
import { checkoutPremium, checkoutNetwork, ProductData, formatPrice } from '@/firebase/stripeService';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { doc, serverTimestamp, Timestamp, updateDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    Linking,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// =============================================================================
// 📝 TIPOS
// =============================================================================

interface Plan {
  id: string;
  name: string;
  price: number;        // em centavos (R$ 49,90 = 4990)
  period: 'month' | 'quarter' | 'year' | 'lifetime';
  periodLabel: string;
  description: string;
  features: string[];
  popular?: boolean;
  discount?: number;
  originalPrice?: number;
  color: string;
  icon: string;
}

// =============================================================================
// 📊 PLANOS DISPONÍVEIS (valores em centavos)
// =============================================================================

const PREMIUM_PLANS: Plan[] = [
  {
    id: 'premium_monthly',
    name: 'Premium Mensal',
    price: 4990,  // R$ 49,90
    period: 'month',
    periodLabel: '/mês',
    description: 'Experimente o Premium',
    features: [
      'Likes ilimitados',
      'Veja quem curtiu você',
      'Super Likes ilimitados',
      'Boosts grátis todo mês',
      'Sem anúncios',
      'Filtros avançados',
    ],
    color: '#F9A825',
    icon: 'star',
  },
  {
    id: 'premium_quarterly',
    name: 'Premium Trimestral',
    price: 11990,     // R$ 119,90
    originalPrice: 14970, // R$ 149,70
    period: 'quarter',
    periodLabel: '/trimestre',
    description: 'Economize 20%',
    features: [
      'Tudo do plano mensal',
      '3 meses com desconto',
      'Badge exclusivo',
      'Prioridade no suporte',
    ],
    discount: 20,
    color: '#9C27B0',
    icon: 'star-circle',
  },
  {
    id: 'premium_annual',
    name: 'Premium Anual',
    price: 35990,     // R$ 359,90
    originalPrice: 59880, // R$ 598,80
    period: 'year',
    periodLabel: '/ano',
    description: 'Economize 40%',
    features: [
      'Tudo do plano mensal',
      '12 meses pelo preço de 7',
      'Badge exclusivo',
      'Prioridade no suporte',
      'Destaque no feed',
    ],
    popular: true,
    discount: 40,
    color: '#E91E63',
    icon: 'diamond',
  },
];

const NETWORK_PLANS: Plan[] = [
  {
    id: 'network_monthly',
    name: 'Network Mensal',
    price: 1490,  // R$ 14,90
    period: 'month',
    periodLabel: '/mês',
    description: 'Conexões do Agro',
    features: [
      'Acesso à comunidade Agro',
      'Feed exclusivo',
      'Eventos rurais',
      'Networking do campo',
    ],
    color: '#4CAF50',
    icon: 'leaf',
  },
  {
    id: 'network_lifetime',
    name: 'Network Vitalício',
    price: 990,   // R$ 9,90
    period: 'lifetime',
    periodLabel: 'único',
    description: 'Oferta de lançamento!',
    features: [
      'Tudo do plano mensal',
      'Acesso vitalício',
      'Badge exclusivo "Pioneiro"',
      'Grupo VIP',
    ],
    popular: true,
    color: '#2E7D32',
    icon: 'tree',
  },
];

// =============================================================================
// 🎭 COMPONENTE PRINCIPAL
// =============================================================================

export default function PlansScreen() {
  const router = useRouter();
  const { currentUser, hasPremium, hasNetworkRural, isAgroUser } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'premium' | 'network'>('premium');
  
  // PIX Payment State
  const [pixCode, setPixCode] = useState<string | null>(null);
  const [pixQrCode, setPixQrCode] = useState<string | null>(null);
  const [pixExpiresAt, setPixExpiresAt] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);

  const plans = activeTab === 'premium' ? PREMIUM_PLANS : NETWORK_PLANS;
  const isSubscribed = activeTab === 'premium' ? hasPremium : hasNetworkRural;

  // ===========================================================================
  // 💳 PAGAMENTO VIA PIX
  // ===========================================================================

  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlan(plan);
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

      // Criar ProductData para enviar à Cloud Function
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

      // Criar pagamento PIX
      let result;
      if (activeTab === 'premium') {
        result = await checkoutPremium(userId, product, email, name);
      } else {
        result = await checkoutNetwork(userId, product, email, name);
      }

      if (result.success && result.pixCode) {
        // Mostrar PIX no modal
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

  // Copiar código PIX
  const copyPixCode = async () => {
    if (pixCode) {
      await Clipboard.setStringAsync(pixCode);
      Alert.alert('Copiado!', 'Código PIX copiado para a área de transferência.');
    }
  };

  // Fechar modal e limpar estado
  const closePaymentModal = () => {
    setShowPaymentModal(false);
    setSelectedPlan(null);
    setPixCode(null);
    setPixQrCode(null);
    setPixExpiresAt(null);
    setPaymentId(null);
  };

  // ===========================================================================
  // 🎨 RENDERIZAÇÃO
  // ===========================================================================

  const renderPlanCard = (plan: Plan) => {
    const isCurrentPlan = isSubscribed && selectedPlan?.id === plan.id;

    return (
      <TouchableOpacity
        key={plan.id}
        style={[styles.planCard, plan.popular && styles.planCardPopular]}
        onPress={() => handleSelectPlan(plan)}
        activeOpacity={0.9}
      >
        {plan.popular && (
          <View style={styles.popularBadge}>
            <Text style={styles.popularText}>MAIS POPULAR</Text>
          </View>
        )}

        {plan.discount && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{plan.discount}%</Text>
          </View>
        )}

        <View style={styles.planHeader}>
          <View style={[styles.planIconContainer, { backgroundColor: plan.color }]}>
            <MaterialCommunityIcons 
              name={plan.icon as any} 
              size={28} 
              color="#FFF" 
            />
          </View>
          <Text style={styles.planName}>{plan.name}</Text>
          <Text style={styles.planDescription}>{plan.description}</Text>
        </View>

        <View style={styles.priceContainer}>
          {plan.originalPrice && (
            <Text style={styles.originalPrice}>
              {formatPrice(plan.originalPrice)}
            </Text>
          )}
          <View style={styles.priceRow}>
            <Text style={styles.currency}>R$</Text>
            <Text style={styles.price}>{Math.floor(plan.price / 100)}</Text>
            <Text style={styles.cents}>,{String(plan.price % 100).padStart(2, '0')}</Text>
            <Text style={styles.period}>{plan.periodLabel}</Text>
          </View>
        </View>

        <View style={styles.featuresContainer}>
          {plan.features.map((feature, index) => (
            <View key={index} style={styles.featureRow}>
              <Ionicons name="checkmark-circle" size={18} color={plan.color} />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.selectButton, { backgroundColor: plan.color }]}
          onPress={() => handleSelectPlan(plan)}
        >
          <Text style={styles.selectButtonText}>Assinar Agora</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

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
            {/* Se tem PIX, mostrar QR Code e código */}
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

                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={closePaymentModal}
                >
                  <Text style={styles.closeButtonText}>Fechar</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {/* Resumo do Plano */}
                <View style={styles.summaryCard}>
                  <View style={styles.summaryHeader}>
                    <View style={[styles.planIconContainer, { backgroundColor: selectedPlan.color }]}>
                      <MaterialCommunityIcons
                    name={selectedPlan.icon as any}
                    size={24}
                    color="#FFF"
                  />
                </View>
                <View style={styles.summaryInfo}>
                  <Text style={styles.summaryName}>{selectedPlan.name}</Text>
                  <Text style={styles.summaryPeriod}>
                    {selectedPlan.period === 'lifetime' ? 'Pagamento único' : `Renovação ${selectedPlan.period === 'month' ? 'mensal' : selectedPlan.period === 'quarter' ? 'trimestral' : 'anual'}`}
                  </Text>
                </View>
              </View>

              <View style={styles.summaryDivider} />

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>
                  {formatPrice(selectedPlan.price)}
                </Text>
              </View>

              {selectedPlan.originalPrice && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Desconto</Text>
                  <Text style={[styles.summaryValue, { color: '#4CAF50' }]}>
                    - {formatPrice(selectedPlan.originalPrice - selectedPlan.price)}
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

            {/* Método de Pagamento - PIX */}
            <Text style={styles.paymentMethodTitle}>Método de Pagamento</Text>
            
            <View style={styles.paymentMethod}>
              <View style={[styles.paymentMethodIcon, { backgroundColor: '#00D4AA20' }]}>
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
              <Text style={styles.securityText}>
                Pagamento 100% seguro via PIX
              </Text>
            </View>

            <Text style={styles.termsText}>
              Ao continuar, você concorda com nossos Termos de Uso e Política de Privacidade.
              {selectedPlan.period !== 'lifetime' && ' Lembre-se de renovar antes do vencimento.'}
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

  return (
    <LinearGradient colors={['#1a0a00', '#000000']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Escolha seu Plano</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'premium' && styles.tabActive]}
          onPress={() => setActiveTab('premium')}
        >
          <Ionicons
            name="diamond"
            size={20}
            color={activeTab === 'premium' ? BotaLoveColors.primary : 'rgba(255,255,255,0.6)'}
          />
          <Text style={[styles.tabText, activeTab === 'premium' && styles.tabTextActive]}>
            Premium
          </Text>
          {hasPremium && <View style={styles.activeDot} />}
        </TouchableOpacity>

        {isAgroUser && (
          <TouchableOpacity
            style={[styles.tab, activeTab === 'network' && styles.tabActive]}
            onPress={() => setActiveTab('network')}
          >
            <MaterialCommunityIcons
              name="sprout"
              size={20}
              color={activeTab === 'network' ? '#4CAF50' : 'rgba(255,255,255,0.6)'}
            />
            <Text style={[styles.tabText, activeTab === 'network' && styles.tabTextActive]}>
              Network Rural
            </Text>
            {hasNetworkRural && <View style={[styles.activeDot, { backgroundColor: '#4CAF50' }]} />}
          </TouchableOpacity>
        )}
      </View>

      {/* Status atual */}
      {isSubscribed && (
        <View style={styles.subscribedBanner}>
          <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
          <Text style={styles.subscribedText}>
            Você já tem o {activeTab === 'premium' ? 'Premium' : 'Network Rural'} ativo!
          </Text>
        </View>
      )}

      {/* Plans */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.plansContainer}
      >
        {plans.map(renderPlanCard)}

        <View style={styles.guaranteeCard}>
          <Ionicons name="shield-checkmark" size={32} color="#4CAF50" />
          <Text style={styles.guaranteeTitle}>Garantia de 7 dias</Text>
          <Text style={styles.guaranteeText}>
            Não ficou satisfeito? Devolveremos 100% do seu dinheiro, sem perguntas.
          </Text>
        </View>
      </ScrollView>

      {renderPaymentModal()}
    </LinearGradient>
  );
}

// =============================================================================
// 🎨 ESTILOS
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 15,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    gap: 8,
  },
  tabActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  tabText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#FFF',
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: BotaLoveColors.primary,
  },
  subscribedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    marginHorizontal: 20,
    padding: 12,
    borderRadius: 10,
    gap: 10,
    marginBottom: 15,
  },
  subscribedText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  content: {
    flex: 1,
  },
  plansContainer: {
    padding: 20,
    gap: 20,
    paddingBottom: 40,
  },
  planCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  planCardPopular: {
    borderWidth: 2,
    borderColor: BotaLoveColors.primary,
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    left: '50%',
    transform: [{ translateX: -50 }],
    backgroundColor: BotaLoveColors.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
  },
  popularText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  discountBadge: {
    position: 'absolute',
    top: 15,
    right: 15,
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
  planHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  planIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  planName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  planDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  priceContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  originalPrice: {
    fontSize: 16,
    color: '#999',
    textDecorationLine: 'line-through',
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  currency: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  price: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#333',
    lineHeight: 52,
  },
  cents: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  period: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    marginLeft: 4,
  },
  featuresContainer: {
    marginBottom: 20,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  featureText: {
    fontSize: 14,
    color: '#555',
    flex: 1,
  },
  selectButton: {
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
  },
  selectButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  guaranteeCard: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  guaranteeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 10,
  },
  guaranteeText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginTop: 8,
  },

  // Modal styles
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
    padding: 20,
    marginBottom: 24,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  summaryInfo: {
    flex: 1,
  },
  summaryName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  summaryPeriod: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
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
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
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
  // PIX Styles
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
    color: '#FF6B35',
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
});
