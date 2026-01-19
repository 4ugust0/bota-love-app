/**
 * 🔥 BOTA LOVE APP - Premium Checkout
 * 
 * Página de checkout para assinatura de planos Premium
 * Pagamento simulado para demonstração
 * 
 * @author Bota Love Team
 */

import { BotaLoveColors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { Plan, PREMIUM_PLANS } from '@/data/mockData';
import { sendSubscriptionWelcomeEmail } from '@/services/emailService';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function PremiumCheckoutScreen() {
  const router = useRouter();
  const { planId } = useLocalSearchParams<{ planId: string }>();
  const { currentUser, subscribeToPlan } = useAuth();
  
  const [plan, setPlan] = useState<Plan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'pix'>('card');
  
  // Dados do cartão (simulado)
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  useEffect(() => {
    if (planId) {
      const foundPlan = PREMIUM_PLANS.find(p => p.id === planId);
      if (foundPlan) {
        setPlan(foundPlan);
      }
    }
  }, [planId]);

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    const formatted = cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
    return formatted.substring(0, 19);
  };

  const formatExpiry = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const getBillingCycleText = (cycle: Plan['billing_cycle']) => {
    switch (cycle) {
      case 'monthly': return 'mensal';
      case 'quarterly': return 'trimestral';
      case 'annual': return 'anual';
      default: return 'mensal';
    }
  };

  const getNextBillingDate = (cycle: Plan['billing_cycle']) => {
    const now = new Date();
    switch (cycle) {
      case 'monthly':
        return new Date(now.setMonth(now.getMonth() + 1));
      case 'quarterly':
        return new Date(now.setMonth(now.getMonth() + 3));
      case 'annual':
        return new Date(now.setFullYear(now.getFullYear() + 1));
      default:
        return new Date(now.setMonth(now.getMonth() + 1));
    }
  };

  const handlePayment = async () => {
    if (!plan) return;
    
    // Validação básica
    if (paymentMethod === 'card') {
      if (!cardNumber || cardNumber.length < 19) {
        alert('Por favor, insira um número de cartão válido');
        return;
      }
      if (!cardName) {
        alert('Por favor, insira o nome do titular');
        return;
      }
      if (!cardExpiry || cardExpiry.length < 5) {
        alert('Por favor, insira a data de validade');
        return;
      }
      if (!cardCvv || cardCvv.length < 3) {
        alert('Por favor, insira o CVV');
        return;
      }
    }

    setIsLoading(true);

    try {
      // Simular processamento de pagamento
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Ativar o plano (funciona mesmo sem Firebase conectado)
      const success = await subscribeToPlan(plan.id);

      if (success) {
        // Enviar email de confirmação (simulado)
        const startDate = new Date();
        const nextBillingDate = getNextBillingDate(plan.billing_cycle);

        try {
          await sendSubscriptionWelcomeEmail({
            userName: currentUser?.profile?.name || 'Usuário',
            userEmail: currentUser?.email || 'usuario@email.com',
            plan: plan,
            startDate: startDate,
            nextBillingDate: nextBillingDate,
            paymentMethod: paymentMethod === 'card' ? 'Cartão de Crédito' : 'PIX',
          });
        } catch (emailError) {
          console.log('Email simulado (sem serviço real)');
        }

        // Navegar para página de obrigado
        router.replace({
          pathname: '/premium-thank-you',
          params: {
            planId: plan.id,
            planTitle: plan.title,
          },
        } as any);
      } else {
        alert('Erro ao processar pagamento. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro no pagamento:', error);
      alert('Erro ao processar pagamento. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!plan) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={BotaLoveColors.primary} />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={BotaLoveColors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Plan Summary */}
        <View style={styles.planSummary}>
          <LinearGradient
            colors={['#FFF9F0', '#FFF5E6']}
            style={styles.planCard}
          >
            <View style={styles.planHeader}>
              <View>
                <Text style={styles.planTitle}>{plan.title}</Text>
                <Text style={styles.planDescription}>{plan.description}</Text>
              </View>
              <View style={styles.planPricing}>
                {plan.originalPrice && (
                  <Text style={styles.originalPrice}>
                    {formatCurrency(plan.originalPrice)}
                  </Text>
                )}
                <Text style={styles.planPrice}>
                  {formatCurrency(plan.price)}
                </Text>
                <Text style={styles.planCycle}>
                  /{getBillingCycleText(plan.billing_cycle)}
                </Text>
              </View>
            </View>

            <View style={styles.planFeatures}>
              {plan.features.slice(0, 4).map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={18} color="#2ECC71" />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
              {plan.features.length > 4 && (
                <Text style={styles.moreFeatures}>
                  +{plan.features.length - 4} benefícios
                </Text>
              )}
            </View>
          </LinearGradient>
        </View>

        {/* Payment Method Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Forma de Pagamento</Text>
          
          <View style={styles.paymentMethods}>
            <TouchableOpacity
              style={[
                styles.paymentMethodButton,
                paymentMethod === 'card' && styles.paymentMethodActive,
              ]}
              onPress={() => setPaymentMethod('card')}
            >
              <Ionicons 
                name="card" 
                size={24} 
                color={paymentMethod === 'card' ? BotaLoveColors.primary : '#999'} 
              />
              <Text style={[
                styles.paymentMethodText,
                paymentMethod === 'card' && styles.paymentMethodTextActive,
              ]}>
                Cartão
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.paymentMethodButton,
                paymentMethod === 'pix' && styles.paymentMethodActive,
              ]}
              onPress={() => setPaymentMethod('pix')}
            >
              <Ionicons 
                name="qr-code" 
                size={24} 
                color={paymentMethod === 'pix' ? BotaLoveColors.primary : '#999'} 
              />
              <Text style={[
                styles.paymentMethodText,
                paymentMethod === 'pix' && styles.paymentMethodTextActive,
              ]}>
                PIX
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Card Form */}
        {paymentMethod === 'card' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dados do Cartão</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Número do Cartão</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="card-outline" size={20} color="#999" />
                <TextInput
                  style={styles.input}
                  placeholder="0000 0000 0000 0000"
                  placeholderTextColor="#999"
                  value={cardNumber}
                  onChangeText={(text) => setCardNumber(formatCardNumber(text))}
                  keyboardType="numeric"
                  maxLength={19}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Nome do Titular</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={20} color="#999" />
                <TextInput
                  style={styles.input}
                  placeholder="Nome como está no cartão"
                  placeholderTextColor="#999"
                  value={cardName}
                  onChangeText={setCardName}
                  autoCapitalize="characters"
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.inputContainer, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.inputLabel}>Validade</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="calendar-outline" size={20} color="#999" />
                  <TextInput
                    style={styles.input}
                    placeholder="MM/AA"
                    placeholderTextColor="#999"
                    value={cardExpiry}
                    onChangeText={(text) => setCardExpiry(formatExpiry(text))}
                    keyboardType="numeric"
                    maxLength={5}
                  />
                </View>
              </View>

              <View style={[styles.inputContainer, { flex: 1 }]}>
                <Text style={styles.inputLabel}>CVV</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="lock-closed-outline" size={20} color="#999" />
                  <TextInput
                    style={styles.input}
                    placeholder="000"
                    placeholderTextColor="#999"
                    value={cardCvv}
                    onChangeText={setCardCvv}
                    keyboardType="numeric"
                    maxLength={4}
                    secureTextEntry
                  />
                </View>
              </View>
            </View>
          </View>
        )}

        {/* PIX Info */}
        {paymentMethod === 'pix' && (
          <View style={styles.section}>
            <View style={styles.pixInfo}>
              <Ionicons name="information-circle" size={24} color={BotaLoveColors.primary} />
              <Text style={styles.pixInfoText}>
                Ao clicar em "Realizar Pagamento", você será redirecionado para pagar via PIX.
                O plano será ativado automaticamente após a confirmação.
              </Text>
            </View>
          </View>
        )}

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumo do Pedido</Text>
          
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{plan.title}</Text>
              <Text style={styles.summaryValue}>{formatCurrency(plan.price)}</Text>
            </View>
            
            {plan.originalPrice && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Desconto</Text>
                <Text style={styles.discountValue}>
                  -{formatCurrency(plan.originalPrice - plan.price)}
                </Text>
              </View>
            )}
            
            <View style={styles.divider} />
            
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{formatCurrency(plan.price)}</Text>
            </View>
            
            <Text style={styles.recurrenceInfo}>
              💳 Cobrança {getBillingCycleText(plan.billing_cycle)} automática
            </Text>
          </View>
        </View>

        {/* Security Info */}
        <View style={styles.securitySection}>
          <View style={styles.securityItem}>
            <Ionicons name="shield-checkmark" size={20} color="#2ECC71" />
            <Text style={styles.securityText}>Pagamento 100% seguro</Text>
          </View>
          <View style={styles.securityItem}>
            <Ionicons name="lock-closed" size={20} color="#2ECC71" />
            <Text style={styles.securityText}>Criptografia SSL</Text>
          </View>
        </View>

        <View style={{ height: 180 }} />
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[styles.payButton, isLoading && styles.payButtonDisabled]}
          onPress={handlePayment}
          disabled={isLoading}
        >
          <LinearGradient
            colors={isLoading ? ['#ccc', '#aaa'] : [BotaLoveColors.primary, '#C4956A']}
            style={styles.payButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {isLoading ? (
              <>
                <ActivityIndicator color="#fff" style={{ marginRight: 10 }} />
                <Text style={styles.payButtonText}>Processando...</Text>
              </>
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={24} color="#fff" />
                <Text style={styles.payButtonText}>
                  Realizar Pagamento • {formatCurrency(plan.price)}
                </Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.termsText}>
          Ao continuar, você concorda com os Termos de Uso e Política de Privacidade
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: BotaLoveColors.textPrimary,
  },
  content: {
    flex: 1,
  },
  planSummary: {
    padding: 20,
  },
  planCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: BotaLoveColors.primary,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  planTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: BotaLoveColors.textPrimary,
    marginBottom: 4,
  },
  planDescription: {
    fontSize: 14,
    color: '#666',
  },
  planPricing: {
    alignItems: 'flex-end',
  },
  originalPrice: {
    fontSize: 14,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  planPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: BotaLoveColors.primary,
  },
  planCycle: {
    fontSize: 14,
    color: '#666',
  },
  planFeatures: {
    borderTopWidth: 1,
    borderTopColor: '#E5D5C5',
    paddingTop: 15,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#555',
    marginLeft: 10,
    flex: 1,
  },
  moreFeatures: {
    fontSize: 13,
    color: BotaLoveColors.primary,
    fontWeight: '500',
    marginTop: 5,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: BotaLoveColors.textPrimary,
    marginBottom: 15,
  },
  paymentMethods: {
    flexDirection: 'row',
    gap: 15,
  },
  paymentMethodButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    gap: 10,
  },
  paymentMethodActive: {
    borderColor: BotaLoveColors.primary,
    backgroundColor: '#FFF9F0',
  },
  paymentMethodText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#999',
  },
  paymentMethodTextActive: {
    color: BotaLoveColors.primary,
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 15,
    height: 50,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: BotaLoveColors.textPrimary,
    marginLeft: 10,
  },
  row: {
    flexDirection: 'row',
  },
  pixInfo: {
    flexDirection: 'row',
    backgroundColor: '#FFF9F0',
    borderRadius: 12,
    padding: 15,
    gap: 12,
  },
  pixInfoText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 15,
    color: '#666',
  },
  summaryValue: {
    fontSize: 15,
    color: BotaLoveColors.textPrimary,
    fontWeight: '500',
  },
  discountValue: {
    fontSize: 15,
    color: '#2ECC71',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 15,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: BotaLoveColors.textPrimary,
  },
  totalValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: BotaLoveColors.primary,
  },
  recurrenceInfo: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
    marginTop: 15,
  },
  securitySection: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 30,
    paddingHorizontal: 20,
    marginTop: 10,
  },
  securityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  securityText: {
    fontSize: 13,
    color: '#666',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: Platform.OS === 'ios' ? 35 : 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  payButton: {
    borderRadius: 30,
    overflow: 'hidden',
  },
  payButtonDisabled: {
    opacity: 0.7,
  },
  payButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  payButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
  },
  termsText: {
    fontSize: 11,
    color: '#999',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 16,
  },
});
