/**
 * 🔥 BOTA LOVE APP - Loja
 * 
 * Tela de compra de itens avulsos com pagamento via PIX:
 * - Super Likes
 * - Boosts
 * - Checkin Agro
 * - Pacotes combinados
 * - Planos Premium
 * 
 * Integrado com Firebase e Stripe PIX para pagamentos
 * 
 * @author Bota Love Team
 */

import PremiumModal from '@/components/PremiumModal';
import { BotaLoveColors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { auth, firestore } from '@/firebase/config';
import {
    calculateSavings,
    formatPrice,
    getActiveStoreItems,
    getItemColor,
    getItemIcon,
    incrementItemSales,
    MOCK_STORE_ITEMS,
    PricePackage,
    StoreItem
} from '@/firebase/storeItemsService';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { doc, getDoc, increment, serverTimestamp, updateDoc } from 'firebase/firestore';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    Image,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// =============================================================================
// 📝 TIPOS LOCAIS
// =============================================================================

interface UserInventory {
  superLikes: number;
  boosts: number;
  checkinAgro: number;
  rewinds: number;
}

interface SelectedPackage {
  item: StoreItem;
  package: PricePackage;
}

// =============================================================================
// � COMPONENTE PRINCIPAL
// =============================================================================

export default function StoreScreen() {
  const router = useRouter();
  const { currentUser, hasPremium, togglePremium } = useAuth();
  const [loadingItem, setLoadingItem] = useState<string | null>(null);
  
  // Estados dos itens da loja
  const [storeItems, setStoreItems] = useState<StoreItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [selectedPackages, setSelectedPackages] = useState<Record<string, number>>({});
  
  // Estados PIX
  const [showPixModal, setShowPixModal] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<SelectedPackage | null>(null);
  const [pixCode, setPixCode] = useState<string | null>(null);
  const [pixQrCode, setPixQrCode] = useState<string | null>(null);
  const [pixExpiresAt, setPixExpiresAt] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  
  // Estado do inventário
  const [inventory, setInventory] = useState<UserInventory>({ 
    superLikes: 0, 
    boosts: 0, 
    checkinAgro: 0, 
    rewinds: 0 
  });
  const [loadingInventory, setLoadingInventory] = useState(true);
  
  // Estado Premium Modal
  const [premiumModalVisible, setPremiumModalVisible] = useState(false);
  
  // Animação de sucesso
  const successAnim = useRef(new Animated.Value(0)).current;

  /**
   * Carrega itens da loja do Firebase
   */
  useEffect(() => {
    loadStoreItems();
  }, []);

  const loadStoreItems = async () => {
    setLoadingItems(true);
    try {
      const items = await getActiveStoreItems();
      if (items.length > 0) {
        setStoreItems(items);
        // Inicializa pacotes selecionados (primeiro pacote de cada item)
        const initialPackages: Record<string, number> = {};
        items.forEach(item => {
          initialPackages[item.id] = 0;
        });
        setSelectedPackages(initialPackages);
      } else {
        // Fallback para dados mock
        setStoreItems(MOCK_STORE_ITEMS);
        const initialPackages: Record<string, number> = {};
        MOCK_STORE_ITEMS.forEach(item => {
          initialPackages[item.id] = 0;
        });
        setSelectedPackages(initialPackages);
      }
    } catch (error) {
      console.error('Erro ao carregar itens:', error);
      // Usa mock em caso de erro
      setStoreItems(MOCK_STORE_ITEMS);
    } finally {
      setLoadingItems(false);
    }
  };

  /**
   * Carrega inventário do usuário
   */
  useEffect(() => {
    loadUserInventory();
  }, []);

  const loadUserInventory = async () => {
    if (!auth.currentUser) {
      setLoadingInventory(false);
      return;
    }

    try {
      const userRef = doc(firestore, 'users', auth.currentUser.uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const data = userSnap.data();
        setInventory({
          superLikes: data.inventory?.superLikes || 0,
          boosts: data.inventory?.boosts || 0,
          checkinAgro: data.inventory?.checkinAgro || 0,
          rewinds: data.inventory?.rewinds || 0,
        });
      }
    } catch (error) {
      console.error('Erro ao carregar inventário:', error);
    } finally {
      setLoadingInventory(false);
    }
  };

  /**
   * Credita recursos ao usuário
   */
  const creditResourcesToUser = async (item: StoreItem, quantity: number) => {
    if (!auth.currentUser) return;

    try {
      const userRef = doc(firestore, 'users', auth.currentUser.uid);
      
      let updates: any = {
        updatedAt: serverTimestamp(),
      };

      // Atualiza inventário baseado no tipo de item
      switch (item.type) {
        case 'super_like':
          updates['inventory.superLikes'] = increment(quantity);
          setInventory(prev => ({ ...prev, superLikes: prev.superLikes + quantity }));
          break;
        case 'boost':
          updates['inventory.boosts'] = increment(quantity);
          setInventory(prev => ({ ...prev, boosts: prev.boosts + quantity }));
          break;
        case 'checkin_agro':
          updates['inventory.checkinAgro'] = increment(quantity);
          setInventory(prev => ({ ...prev, checkinAgro: prev.checkinAgro + quantity }));
          break;
        case 'rewind':
          updates['inventory.rewinds'] = increment(quantity);
          setInventory(prev => ({ ...prev, rewinds: prev.rewinds + quantity }));
          break;
        default:
          // Para outros tipos, adiciona genericamente
          updates[`inventory.${item.type}`] = increment(quantity);
      }

      await updateDoc(userRef, updates);
      
      // Incrementa vendas do item
      await incrementItemSales(item.id, quantity);
    } catch (error) {
      console.error('Erro ao creditar recursos:', error);
    }
  };

  /**
   * Anima sucesso do pagamento
   */
  const animateSuccess = () => {
    setPaymentSuccess(true);
    Animated.sequence([
      Animated.timing(successAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.delay(2000),
    ]).start();
  };

  /**
   * Seleciona um pacote de preço para um item
   */
  const selectPackage = (itemId: string, packageIndex: number) => {
    setSelectedPackages(prev => ({
      ...prev,
      [itemId]: packageIndex,
    }));
  };

  /**
   * Inicia o pagamento PIX para item avulso
   */
  const handlePurchase = async (item: StoreItem) => {
    if (!auth.currentUser) {
      Alert.alert('Erro', 'Você precisa estar logado para fazer compras.');
      return;
    }

    const packageIndex = selectedPackages[item.id] || 0;
    const selectedPkg = item.pricePackages[packageIndex];

    if (!selectedPkg) {
      Alert.alert('Erro', 'Pacote não encontrado.');
      return;
    }

    setSelectedPurchase({ item, package: selectedPkg });
    setShowPixModal(true);
    setIsProcessing(true);
    setPaymentSuccess(false);
    setPixCode(null);
    setPixQrCode(null);
    setPixExpiresAt(null);

    // Simula geração do PIX
    setTimeout(() => {
      const priceStr = (selectedPkg.price / 100).toFixed(2).replace('.', '');
      setPixCode('00020126580014br.gov.bcb.pix0136a1b2c3d4-e5f6-7890-abcd-ef1234567890520400005303986540' + priceStr + '5802BR5925BOTA LOVE LTDA6009SAO PAULO62070503***6304ABCD');
      setPixQrCode('https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=PIX_CODE_DEMO');
      const expires = new Date();
      expires.setMinutes(expires.getMinutes() + 30);
      setPixExpiresAt(expires.toISOString());
      setIsProcessing(false);
    }, 1500);
  };

  /**
   * Simula confirmação de pagamento PIX
   */
  const handleConfirmPayment = async () => {
    setIsProcessing(true);
    
    // Simula processamento
    setTimeout(async () => {
      if (selectedPurchase) {
        await creditResourcesToUser(selectedPurchase.item, selectedPurchase.package.quantity);
      }
      
      animateSuccess();
      setIsProcessing(false);
    }, 2000);
  };

  /**
   * Copia código PIX
   */
  const copyPixCode = async () => {
    if (pixCode) {
      await Clipboard.setStringAsync(pixCode);
      Alert.alert('Copiado!', 'Código PIX copiado para a área de transferência.');
    }
  };

  /**
   * Fecha modal PIX
   */
  const closePixModal = () => {
    setShowPixModal(false);
    setSelectedPurchase(null);
    setPixCode(null);
    setPixQrCode(null);
    setPixExpiresAt(null);
    setPaymentSuccess(false);
    successAnim.setValue(0);
  };

  /**
   * Abre o modal de planos premium
   */
  const handlePremiumPress = () => {
    setPremiumModalVisible(true);
  };

  // =============================================================================
  // RENDER
  // =============================================================================

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={BotaLoveColors.secondary} />
        </TouchableOpacity>
        <Text style={styles.title}>Loja</Text>
        <TouchableOpacity 
          style={styles.historyButton}
          onPress={() => Alert.alert('Em breve', 'Histórico de compras em desenvolvimento')}
        >
          <Ionicons name="receipt-outline" size={24} color={BotaLoveColors.secondary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Inventário do Usuário */}
        <View style={styles.inventorySection}>
          <Text style={styles.sectionTitle}>Seus Recursos</Text>
          <View style={styles.inventoryContainer}>
            <View style={styles.inventoryItem}>
              <View style={[styles.inventoryIcon, { backgroundColor: '#5DADE220' }]}>
                <Ionicons name="star" size={24} color="#5DADE2" />
              </View>
              <View style={styles.inventoryInfo}>
                <Text style={styles.inventoryLabel}>Super Likes</Text>
                {loadingInventory ? (
                  <ActivityIndicator size="small" color={BotaLoveColors.primary} />
                ) : (
                  <Text style={styles.inventoryValue}>{inventory.superLikes}</Text>
                )}
              </View>
            </View>
            <View style={styles.inventoryDivider} />
            <View style={styles.inventoryItem}>
              <View style={[styles.inventoryIcon, { backgroundColor: '#9B59B620' }]}>
                <Ionicons name="rocket" size={24} color="#9B59B6" />
              </View>
              <View style={styles.inventoryInfo}>
                <Text style={styles.inventoryLabel}>Boosts</Text>
                {loadingInventory ? (
                  <ActivityIndicator size="small" color={BotaLoveColors.primary} />
                ) : (
                  <Text style={styles.inventoryValue}>{inventory.boosts}</Text>
                )}
              </View>
            </View>
          </View>
          
          {/* Segunda linha do inventário */}
          <View style={[styles.inventoryContainer, { marginTop: 12 }]}>
            <View style={styles.inventoryItem}>
              <View style={[styles.inventoryIcon, { backgroundColor: '#2ECC7120' }]}>
                <Ionicons name="location" size={24} color="#2ECC71" />
              </View>
              <View style={styles.inventoryInfo}>
                <Text style={styles.inventoryLabel}>Checkin Agro</Text>
                {loadingInventory ? (
                  <ActivityIndicator size="small" color={BotaLoveColors.primary} />
                ) : (
                  <Text style={styles.inventoryValue}>{inventory.checkinAgro}</Text>
                )}
              </View>
            </View>
            <View style={styles.inventoryDivider} />
            <View style={styles.inventoryItem}>
              <View style={[styles.inventoryIcon, { backgroundColor: '#F39C1220' }]}>
                <Ionicons name="refresh" size={24} color="#F39C12" />
              </View>
              <View style={styles.inventoryInfo}>
                <Text style={styles.inventoryLabel}>Rewinds</Text>
                {loadingInventory ? (
                  <ActivityIndicator size="small" color={BotaLoveColors.primary} />
                ) : (
                  <Text style={styles.inventoryValue}>{inventory.rewinds}</Text>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Banner Premium / Seja Premium */}
        {!hasPremium && (
          <TouchableOpacity 
            style={styles.premiumBanner}
            onPress={handlePremiumPress}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['#D4AD63', '#B8944D']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.premiumGradient}
            >
              <View style={styles.premiumContent}>
                <Ionicons name="diamond" size={32} color="#FFF" />
                <View style={styles.premiumTextContainer}>
                  <Text style={styles.premiumTitle}>Seja Premium 💎</Text>
                  <Text style={styles.premiumSubtitle}>
                    Recursos exclusivos e muito mais matches!
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#FFF" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Items Grid */}
        <View style={styles.itemsContainer}>
          <Text style={styles.sectionTitle}>Itens Avulsos</Text>
          
          {loadingItems ? (
            <View style={styles.loadingItemsContainer}>
              <ActivityIndicator size="large" color={BotaLoveColors.primary} />
              <Text style={styles.loadingItemsText}>Carregando itens...</Text>
            </View>
          ) : (
            storeItems.map((item) => {
              const itemColor = getItemColor(item);
              const itemIcon = getItemIcon(item);
              const packagesWithSavings = calculateSavings(item.pricePackages);
              const selectedPackageIndex = selectedPackages[item.id] || 0;
              const selectedPkg = packagesWithSavings[selectedPackageIndex];
              
              return (
                <View key={item.id} style={styles.itemCard}>
                  {/* Badge */}
                  {(item.badgeText || item.status === 'promotion') && (
                    <View style={[
                      styles.popularBadge,
                      item.status === 'promotion' && styles.promotionBadge
                    ]}>
                      <Ionicons 
                        name={item.status === 'promotion' ? 'pricetag' : 'flame'} 
                        size={12} 
                        color="#FFF" 
                      />
                      <Text style={styles.popularText}>
                        {item.badgeText || 'Promoção'}
                      </Text>
                    </View>
                  )}
                  
                  <View style={styles.itemContent}>
                    <View style={[styles.itemIconContainer, { backgroundColor: `${itemColor}20` }]}>
                      <Ionicons name={itemIcon as any} size={28} color={itemColor} />
                    </View>
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemDescription}>{item.description}</Text>
                    </View>
                  </View>

                  {/* Seletor de Pacotes */}
                  <View style={styles.packagesContainer}>
                    <Text style={styles.packagesLabel}>Escolha a quantidade:</Text>
                    <View style={styles.packagesRow}>
                      {packagesWithSavings.map((pkg, index) => (
                        <TouchableOpacity
                          key={index}
                          style={[
                            styles.packageOption,
                            selectedPackageIndex === index && [
                              styles.packageOptionSelected,
                              { borderColor: itemColor }
                            ]
                          ]}
                          onPress={() => selectPackage(item.id, index)}
                          activeOpacity={0.7}
                        >
                          {pkg.savingsPercent > 0 && (
                            <View style={[styles.packageSavingsBadge, { backgroundColor: itemColor }]}>
                              <Text style={styles.packageSavingsText}>
                                -{pkg.savingsPercent}%
                              </Text>
                            </View>
                          )}
                          <Text style={[
                            styles.packageQuantity,
                            selectedPackageIndex === index && { color: itemColor }
                          ]}>
                            {pkg.quantity}x
                          </Text>
                          <Text style={[
                            styles.packagePrice,
                            selectedPackageIndex === index && { color: itemColor }
                          ]}>
                            {formatPrice(pkg.price)}
                          </Text>
                          <Text style={styles.packageUnitPrice}>
                            {formatPrice(Math.round(pkg.unitPrice))}/un
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View style={styles.itemFooter}>
                    <View style={styles.priceContainer}>
                      <Text style={styles.price}>
                        {selectedPkg ? formatPrice(selectedPkg.price) : '-'}
                      </Text>
                      {selectedPkg && selectedPkg.savingsPercent > 0 && (
                        <View style={styles.discountBadge}>
                          <Text style={styles.discountText}>
                            Economia de {selectedPkg.savingsPercent}%
                          </Text>
                        </View>
                      )}
                    </View>
                    
                    <TouchableOpacity
                      style={[
                        styles.buyButton, 
                        { backgroundColor: itemColor },
                        loadingItem === item.id && styles.buyButtonDisabled,
                      ]}
                      onPress={() => handlePurchase(item)}
                      activeOpacity={0.8}
                      disabled={loadingItem !== null}
                    >
                      {loadingItem === item.id ? (
                        <ActivityIndicator size="small" color="#FFF" />
                      ) : (
                        <>
                          <Text style={styles.buyButtonText}>Comprar</Text>
                          <Ionicons name="cart" size={18} color="#FFF" />
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* Features Info */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Como funciona</Text>
          
          <View style={styles.featureCard}>
            <View style={styles.featureItem}>
              <View style={[styles.featureIcon, { backgroundColor: '#5DADE220' }]}>
                <Ionicons name="star" size={24} color="#5DADE2" />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Super Like</Text>
                <Text style={styles.featureDescription}>
                  Mostre que você está realmente interessado. A pessoa vai saber que você deu um Super Like antes mesmo de decidir!
                </Text>
              </View>
            </View>

            <View style={styles.featureDivider} />

            <View style={styles.featureItem}>
              <View style={[styles.featureIcon, { backgroundColor: '#9B59B620' }]}>
                <Ionicons name="rocket" size={24} color="#9B59B6" />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Boost</Text>
                <Text style={styles.featureDescription}>
                  Seu perfil fica em destaque por 30 minutos! Aparece para muito mais pessoas na sua região.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Payment Methods */}
        <View style={styles.paymentSection}>
          <Text style={styles.sectionTitle}>Forma de Pagamento</Text>
          <View style={styles.paymentMethods}>
            <View style={styles.paymentMethod}>
              <View style={styles.paymentIconContainer}>
                <Text style={{ fontSize: 24 }}>💳</Text>
              </View>
              <Text style={styles.paymentText}>PIX</Text>
              <Text style={styles.paymentSubtext}>Instantâneo</Text>
            </View>
          </View>
        </View>

        {/* Security Info */}
        <View style={styles.securitySection}>
          <View style={styles.securityItem}>
            <Ionicons name="shield-checkmark" size={16} color={BotaLoveColors.primary} />
            <Text style={styles.securityText}>100% Seguro</Text>
          </View>
          <View style={styles.securityItem}>
            <Ionicons name="flash" size={16} color={BotaLoveColors.primary} />
            <Text style={styles.securityText}>Entrega Imediata</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Ao comprar você concorda com nossos{' '}
            <Text style={styles.footerLink}>Termos de Uso</Text>
          </Text>
        </View>
      </ScrollView>

      {/* Modal PIX */}
      <Modal
        visible={showPixModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closePixModal}
      >
        <View style={styles.modalContainer}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={closePixModal} style={styles.modalBackButton}>
              <Ionicons name="close" size={28} color="#333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Pagamento PIX</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView 
            style={styles.modalContent}
            contentContainerStyle={styles.modalContentContainer}
          >
            {isProcessing && !paymentSuccess ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={BotaLoveColors.primary} />
                <Text style={styles.loadingText}>
                  {pixCode ? 'Processando pagamento...' : 'Gerando código PIX...'}
                </Text>
              </View>
            ) : paymentSuccess ? (
              <Animated.View 
                style={[
                  styles.successContainer,
                  {
                    opacity: successAnim,
                    transform: [{
                      scale: successAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.5, 1],
                      }),
                    }],
                  },
                ]}
              >
                <View style={styles.successIconContainer}>
                  <Ionicons name="checkmark-circle" size={80} color="#4CAF50" />
                </View>
                <Text style={styles.successTitle}>Pagamento Confirmado! 🎉</Text>
                <Text style={styles.successSubtitle}>
                  {selectedPurchase 
                    ? `${selectedPurchase.item.name} x${selectedPurchase.package.quantity} foi adicionado à sua conta!`
                    : ''}
                </Text>

                <TouchableOpacity style={styles.successButton} onPress={closePixModal}>
                  <Text style={styles.successButtonText}>Continuar</Text>
                </TouchableOpacity>
              </Animated.View>
            ) : pixCode && selectedPurchase ? (
              <View style={styles.pixContainer}>
                {/* Item Info */}
                <View style={styles.pixItemInfo}>
                  <View style={[styles.itemIconContainer, { backgroundColor: `${getItemColor(selectedPurchase.item)}20` }]}>
                    <Ionicons name={getItemIcon(selectedPurchase.item) as any} size={28} color={getItemColor(selectedPurchase.item)} />
                  </View>
                  <View>
                    <Text style={styles.pixItemName}>{selectedPurchase.item.name} x{selectedPurchase.package.quantity}</Text>
                    <Text style={styles.pixItemPrice}>{formatPrice(selectedPurchase.package.price)}</Text>
                  </View>
                </View>

                {/* QR Code */}
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
                  Escaneie o QR Code ou copie o código abaixo
                </Text>

                {/* PIX Code */}
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
                  Após o pagamento, seus itens serão creditados automaticamente.
                </Text>

                {/* Botão de Simular Pagamento (para desenvolvimento) */}
                <TouchableOpacity 
                  style={styles.simulatePaymentButton} 
                  onPress={handleConfirmPayment}
                >
                  <Ionicons name="flash" size={20} color="#FFF" />
                  <Text style={styles.simulatePaymentText}>Simular Pagamento (Dev)</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={48} color="#F44336" />
                <Text style={styles.errorText}>Erro ao gerar código PIX</Text>
              </View>
            )}
          </ScrollView>

          {pixCode && !paymentSuccess && !isProcessing && (
            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.closeButton} onPress={closePixModal}>
                <Text style={styles.closeButtonText}>Fechar</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>

      {/* Premium Modal */}
      <PremiumModal
        visible={premiumModalVisible}
        onClose={() => setPremiumModalVisible(false)}
      />
    </View>
  );
}

// =============================================================================
// 🎨 ESTILOS
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BotaLoveColors.backgroundLight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingBottom: 16,
    backgroundColor: BotaLoveColors.backgroundWhite,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: BotaLoveColors.secondary,
  },
  historyButton: {
    padding: 8,
  },
  premiumBanner: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  premiumGradient: {
    padding: 16,
  },
  premiumContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  premiumTextContainer: {
    flex: 1,
    marginHorizontal: 12,
  },
  premiumTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  premiumSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 2,
  },
  itemsContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: BotaLoveColors.secondary,
    marginBottom: 16,
  },
  itemCard: {
    backgroundColor: BotaLoveColors.backgroundWhite,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  popularBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#B8944D',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  promotionBadge: {
    backgroundColor: '#4CAF50',
  },
  popularText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FFF',
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  itemIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
    paddingRight: 60,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: BotaLoveColors.secondary,
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 14,
    color: BotaLoveColors.neutralDark,
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 13,
    color: BotaLoveColors.neutralDark,
    lineHeight: 18,
  },
  // Pacotes de preço
  packagesContainer: {
    marginBottom: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  packagesLabel: {
    fontSize: 13,
    color: BotaLoveColors.neutralDark,
    marginBottom: 10,
    fontWeight: '500',
  },
  packagesRow: {
    flexDirection: 'row',
    gap: 10,
  },
  packageOption: {
    flex: 1,
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  packageOptionSelected: {
    backgroundColor: '#FFF',
    borderWidth: 2,
  },
  packageSavingsBadge: {
    position: 'absolute',
    top: -8,
    right: -4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  packageSavingsText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFF',
  },
  packageQuantity: {
    fontSize: 20,
    fontWeight: 'bold',
    color: BotaLoveColors.secondary,
    marginBottom: 2,
  },
  packagePrice: {
    fontSize: 14,
    fontWeight: '600',
    color: BotaLoveColors.secondary,
  },
  packageUnitPrice: {
    fontSize: 11,
    color: BotaLoveColors.neutralDark,
    marginTop: 2,
  },
  // Loading
  loadingItemsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingItemsText: {
    marginTop: 12,
    fontSize: 14,
    color: BotaLoveColors.neutralDark,
  },
  itemFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 16,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  originalPrice: {
    fontSize: 14,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: BotaLoveColors.secondary,
  },
  discountBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  discountText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FFF',
  },
  buyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  buyButtonDisabled: {
    opacity: 0.6,
  },
  buyButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  featuresSection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  featureCard: {
    backgroundColor: BotaLoveColors.backgroundWhite,
    borderRadius: 16,
    padding: 20,
  },
  featureItem: {
    flexDirection: 'row',
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: BotaLoveColors.secondary,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 13,
    color: BotaLoveColors.neutralDark,
    lineHeight: 18,
  },
  featureDivider: {
    height: 1,
    backgroundColor: '#E8E8E8',
    marginVertical: 16,
  },
  paymentSection: {
    backgroundColor: BotaLoveColors.backgroundWhite,
    padding: 16,
    marginBottom: 16,
  },
  paymentMethods: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  paymentMethod: {
    alignItems: 'center',
    gap: 4,
  },
  paymentIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#00D4AA20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentText: {
    fontSize: 14,
    color: BotaLoveColors.textPrimary,
    fontWeight: '600',
  },
  paymentSubtext: {
    fontSize: 12,
    color: BotaLoveColors.neutralDark,
  },
  securitySection: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    paddingVertical: 16,
  },
  securityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  securityText: {
    fontSize: 12,
    color: BotaLoveColors.neutralDark,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: BotaLoveColors.neutralDark,
    textAlign: 'center',
  },
  footerLink: {
    color: BotaLoveColors.primary,
    fontWeight: '500',
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 20 : 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  modalBackButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalContent: {
    flex: 1,
  },
  modalContentContainer: {
    padding: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 60,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#F44336',
  },
  pixContainer: {
    alignItems: 'center',
  },
  pixItemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F9F9F9',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    width: '100%',
  },
  pixItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  pixItemPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: BotaLoveColors.primary,
    marginTop: 2,
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
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  modalFooter: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    alignItems: 'center',
  },
  closeButton: {
    backgroundColor: '#EEE',
    borderRadius: 25,
    paddingVertical: 14,
    paddingHorizontal: 60,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },

  // Inventário
  inventorySection: {
    padding: 16,
    paddingBottom: 0,
  },
  inventoryContainer: {
    flexDirection: 'row',
    backgroundColor: BotaLoveColors.backgroundWhite,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  inventoryItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  inventoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inventoryInfo: {
    flex: 1,
  },
  inventoryLabel: {
    fontSize: 12,
    color: BotaLoveColors.neutralDark,
    marginBottom: 2,
  },
  inventoryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: BotaLoveColors.secondary,
  },
  inventoryDivider: {
    width: 1,
    backgroundColor: '#E8E8E8',
    marginHorizontal: 16,
  },

  // Planos Premium Section
  premiumPlansSection: {
    marginTop: 16,
    marginHorizontal: 16,
  },
  premiumPlansHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 0,
  },
  planCarouselContent: {
    paddingRight: 16,
  },
  planCardContainer: {
    width: SCREEN_WIDTH - 32,
    paddingRight: 16,
  },
  planCard: {
    backgroundColor: BotaLoveColors.backgroundWhite,
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: 'transparent',
    minHeight: 480,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  planCardPopular: {
    borderColor: BotaLoveColors.primary,
    backgroundColor: '#FFF9E6',
  },
  planPopularBadge: {
    position: 'absolute',
    top: -12,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1,
  },
  planPopularBadgeInner: {
    backgroundColor: BotaLoveColors.primary,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
  },
  planPopularBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: BotaLoveColors.textPrimary,
  },
  planContent: {
    flex: 1,
  },
  planName: {
    fontSize: 24,
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
  planPriceContainer: {
    marginBottom: 12,
  },
  planOriginalPrice: {
    fontSize: 14,
    color: BotaLoveColors.neutralDark,
    textDecorationLine: 'line-through',
    marginBottom: 2,
  },
  planPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  planPrice: {
    fontSize: 32,
    fontWeight: 'bold',
    color: BotaLoveColors.secondary,
  },
  planDuration: {
    fontSize: 16,
    color: BotaLoveColors.neutralDark,
    marginLeft: 4,
  },
  planDiscountBadge: {
    backgroundColor: BotaLoveColors.error,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  planDiscountText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: BotaLoveColors.textLight,
  },
  planDivider: {
    height: 1,
    backgroundColor: BotaLoveColors.neutralMedium,
    marginBottom: 12,
    opacity: 0.3,
  },
  planFeaturesScroll: {
    maxHeight: 180,
  },
  planFeatureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 8,
  },
  planCheckmark: {
    fontSize: 14,
    color: BotaLoveColors.primary,
    fontWeight: 'bold',
  },
  planFeatureItem: {
    fontSize: 13,
    color: BotaLoveColors.textPrimary,
    flex: 1,
    lineHeight: 18,
  },
  planSelectButton: {
    backgroundColor: BotaLoveColors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  planSelectButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: BotaLoveColors.textLight,
  },
  planPagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  planPaginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: BotaLoveColors.neutralMedium,
  },
  planPaginationDotActive: {
    width: 24,
    backgroundColor: BotaLoveColors.primary,
  },

  // Sucesso do pagamento
  successContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  successIconContainer: {
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    textAlign: 'center',
    marginBottom: 12,
  },
  successSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  successResources: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 24,
  },
  successResourcesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  successResourcesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  successResourcesText: {
    fontSize: 14,
    color: '#666',
  },
  successButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    paddingHorizontal: 60,
    borderRadius: 25,
  },
  successButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },

  // Simular pagamento
  simulatePaymentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#B8944D',
    borderRadius: 25,
    paddingVertical: 14,
    paddingHorizontal: 24,
    gap: 8,
    width: '100%',
  },
  simulatePaymentText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
