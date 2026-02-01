import PremiumModal from '@/components/PremiumModal';
import { BotaLoveColors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { NETWORK_RURAL_PRICES } from '@/data/networkRuralService';
import {
  calculateSavings,
  formatPrice,
  getActiveStoreItems,
  getItemColor,
  getItemIcon,
  MOCK_STORE_ITEMS,
  PricePackageWithSavings,
  StoreItem,
} from '@/firebase/storeItemsService';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isSmallDevice = SCREEN_WIDTH < 375;
const isMediumDevice = SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 414;
const CARD_WIDTH = SCREEN_WIDTH - (isSmallDevice ? 60 : 80);
const CARD_PADDING = isSmallDevice ? 16 : 20;

// Gradientes de cores por tipo de item - Todos em tom dourado
const TYPE_GRADIENTS: Record<string, [string, string]> = {
  super_like: ['#D4AD63', '#B8944D'],
  boost: ['#D4AD63', '#B8944D'],
  checkin_agro: ['#D4AD63', '#B8944D'],
  rewind: ['#D4AD63', '#B8944D'],
  see_likes: ['#D4AD63', '#B8944D'],
  spotlight: ['#D4AD63', '#B8944D'],
  unlimited_likes: ['#D4AD63', '#B8944D'],
  incognito: ['#D4AD63', '#B8944D'],
  other: ['#D4AD63', '#B8944D'],
};

export default function StoreScreen() {
  const router = useRouter();
  const { hasPremium, isAgroUser, hasNetworkRural, subscribeNetworkLifetime, subscribeNetworkMonthly } = useAuth();
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  // Estados do Firebase
  const [storeItems, setStoreItems] = useState<StoreItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);

  // Carrega itens do Firebase
  useEffect(() => {
    loadStoreItems();
  }, []);

  const loadStoreItems = async () => {
    setLoadingItems(true);
    try {
      const items = await getActiveStoreItems();
      console.log('Itens carregados:', items.length, items.map(i => i.name));
      if (items.length > 0) {
        setStoreItems(items);
      } else {
        // Fallback para mock
        setStoreItems(MOCK_STORE_ITEMS);
      }
    } catch (error) {
      console.error('Erro ao carregar itens:', error);
      setStoreItems(MOCK_STORE_ITEMS);
    } finally {
      setLoadingItems(false);
    }
  };

  const handlePurchase = (item: StoreItem, pkg: PricePackageWithSavings) => {
    alert(`🎉 Compra simulada!\n\n${pkg.quantity}x ${item.name}\n💰 ${formatPrice(pkg.price)}\n\n✅ Compra realizada com sucesso!`);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Loja</Text>
          <Text style={styles.subtitle}>Turbine seu perfil</Text>
        </View>
        {hasPremium && (
          <View style={styles.premiumBadge}>
            <Ionicons name="diamond" size={16} color="#FFF" />
            <Text style={styles.premiumBadgeText}>Premium</Text>
          </View>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Banner Premium */}
        {!hasPremium && (
          <TouchableOpacity 
            style={styles.promoBanner}
            onPress={() => setShowPremiumModal(true)}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['#D4AD63', '#B8944D']}
              style={styles.promoGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.promoContent}>
                <View style={styles.promoIconContainer}>
                  <Ionicons name="diamond" size={32} color="#FFF" />
                </View>
                <View style={styles.promoText}>
                  <Text style={styles.promoTitle}>Seja Premium</Text>
                  <Text style={styles.promoSubtitle}>
                    Ilimitado de tudo • Sem anúncios
                  </Text>
                </View>
                <Ionicons name="arrow-forward" size={24} color="#FFF" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={20} color={BotaLoveColors.primary} />
          <Text style={styles.infoText}>
            {hasPremium 
              ? '✨ Você tem recursos ilimitados, mas pode comprar extras!'
              : '💡 Compre itens avulsos ou economize sendo Premium'
            }
          </Text>
        </View>

        {/* Itens Avulsos */}
        <View style={styles.carouselSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <View style={[styles.iconCircle, { backgroundColor: BotaLoveColors.primary }]}>
                <Ionicons name="cart" size={20} color="#FFF" />
              </View>
              <Text style={styles.sectionTitle}>Itens Avulsos</Text>
            </View>
            <Text style={styles.itemCount}>{storeItems.length} itens</Text>
          </View>

          {loadingItems ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={BotaLoveColors.primary} />
              <Text style={styles.loadingText}>Carregando itens...</Text>
            </View>
          ) : storeItems.length > 0 ? (
            <View style={styles.itemsGrid}>
              {storeItems.map((item) => (
                <View key={item.id} style={styles.itemWrapper}>
                  <StoreCard 
                    item={item} 
                    onPurchase={(pkg) => handlePurchase(item, pkg)}
                    fullWidth 
                  />
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="basket-outline" size={48} color={BotaLoveColors.neutralDark} />
              <Text style={styles.emptyText}>Nenhum item disponível</Text>
            </View>
          )}
        </View>

        {/* Payment Info */}
        <View style={styles.paymentSection}>
          <Text style={styles.paymentTitle}>Pagamento Seguro</Text>
          <View style={styles.paymentIcons}>
            <View style={styles.paymentIcon}>
              <Ionicons name="card" size={24} color={BotaLoveColors.secondary} />
            </View>
            <View style={styles.paymentIcon}>
              <Ionicons name="logo-google" size={24} color={BotaLoveColors.secondary} />
            </View>
            <View style={styles.paymentIcon}>
              <Ionicons name="logo-apple" size={24} color={BotaLoveColors.secondary} />
            </View>
            <View style={styles.paymentIcon}>
              <Ionicons name="shield-checkmark" size={24} color="#2ECC71" />
            </View>
          </View>
          <Text style={styles.paymentInfo}>
            Compra 100% segura • Criptografia SSL
          </Text>
        </View>

        {/* Network Rural Banner - Apenas para usuários Sou Agro */}
        {isAgroUser && !hasNetworkRural && (
          <View style={styles.networkRuralSection}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <View style={[styles.iconCircle, { backgroundColor: '#2ECC71' }]}>
                  <MaterialCommunityIcons name="sprout" size={20} color="#FFF" />
                </View>
                <Text style={styles.sectionTitle}>Network Rural</Text>
              </View>
              <View style={styles.newBadge}>
                <Text style={styles.newBadgeText}>NOVO</Text>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.networkRuralCard}
              onPress={() => router.push('/(tabs)/network-rural' as any)}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={['#2ECC71', '#27AE60']}
                style={styles.networkRuralGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.networkRuralPromo}>
                  <Ionicons name="flash" size={12} color="#FFF" />
                  <Text style={styles.networkRuralPromoText}>
                    PROMOÇÃO DE LANÇAMENTO
                  </Text>
                </View>

                <View style={styles.networkRuralContent}>
                  <View style={styles.networkRuralIconBg}>
                    <MaterialCommunityIcons name="sprout" size={40} color="#FFF" />
                  </View>
                  
                  <View style={styles.networkRuralInfo}>
                    <Text style={styles.networkRuralTitle}>Network Rural Premium</Text>
                    <Text style={styles.networkRuralSubtitle}>
                      Conecte-se com profissionais do agro!
                    </Text>
                    
                    <View style={styles.networkRuralFeatures}>
                      <View style={styles.networkRuralFeature}>
                        <Ionicons name="checkmark" size={14} color="#FFF" />
                        <Text style={styles.networkRuralFeatureText}>LinkedIn integrado</Text>
                      </View>
                      <View style={styles.networkRuralFeature}>
                        <Ionicons name="checkmark" size={14} color="#FFF" />
                        <Text style={styles.networkRuralFeatureText}>Selo "Network Ativo"</Text>
                      </View>
                      <View style={styles.networkRuralFeature}>
                        <Ionicons name="checkmark" size={14} color="#FFF" />
                        <Text style={styles.networkRuralFeatureText}>Filtros exclusivos</Text>
                      </View>
                    </View>
                  </View>
                </View>

                <View style={styles.networkRuralPricing}>
                  <View style={styles.networkRuralPriceRow}>
                    <Text style={styles.networkRuralPriceOld}>
                      R$ {NETWORK_RURAL_PRICES.lifetimeOriginal.toFixed(2)}
                    </Text>
                    <Text style={styles.networkRuralPrice}>
                      R$ {NETWORK_RURAL_PRICES.lifetime.toFixed(2)}
                    </Text>
                    <Text style={styles.networkRuralPricePeriod}>/mês</Text>
                  </View>
                  <Text style={styles.networkRuralPriceNote}>
                    Preço vitalício • Pague este valor para sempre!
                  </Text>
                </View>

                <TouchableOpacity 
                  style={styles.networkRuralButton}
                  onPress={subscribeNetworkLifetime}
                  activeOpacity={0.8}
                >
                  <Text style={styles.networkRuralButtonText}>
                    ✅ Ativar Network Rural
                  </Text>
                </TouchableOpacity>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* Network Rural Ativo */}
        {isAgroUser && hasNetworkRural && (
          <View style={styles.networkRuralActiveSection}>
            <LinearGradient
              colors={['#E8F8F0', '#D4EFDF']}
              style={styles.networkRuralActiveCard}
            >
              <MaterialCommunityIcons name="sprout" size={32} color="#2ECC71" />
              <View style={styles.networkRuralActiveInfo}>
                <Text style={styles.networkRuralActiveTitle}>Network Rural Ativo!</Text>
                <Text style={styles.networkRuralActiveSubtitle}>
                  Acesse a aba Network Rural para conectar-se
                </Text>
              </View>
              <TouchableOpacity 
                onPress={() => router.push('/(tabs)/network-rural' as any)}
                style={styles.networkRuralActiveButton}
              >
                <Ionicons name="arrow-forward" size={20} color="#2ECC71" />
              </TouchableOpacity>
            </LinearGradient>
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Premium Modal */}
      <PremiumModal
        visible={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        feature="Explore todos os recursos"
      />
    </View>
  );
}

function StoreCard({ 
  item, 
  onPurchase,
  fullWidth = false 
}: { 
  item: StoreItem; 
  onPurchase: (pkg: PricePackageWithSavings) => void;
  fullWidth?: boolean;
}) {
  const [selectedPkgIndex, setSelectedPkgIndex] = useState(0);
  const [imageLoading, setImageLoading] = useState(true);
  
  // Garante que pricePackages existe
  const pricePackages = item.pricePackages || [];
  const packagesWithSavings = calculateSavings(pricePackages);
  const selectedPkg = packagesWithSavings[selectedPkgIndex];
  const itemColor = getItemColor(item);
  const itemIcon = getItemIcon(item);
  const colors = TYPE_GRADIENTS[item.type] || TYPE_GRADIENTS.other;
  
  // Se não houver pacotes, não renderiza o card
  if (packagesWithSavings.length === 0) {
    return null;
  }
  
  // Verifica se o ícone é uma URL de imagem
  const isImageIcon = item.icon && (
    item.icon.startsWith('http') || 
    item.icon.startsWith('https') ||
    item.icon.startsWith('file')
  );

  return (
    <View style={[styles.cardContainer, fullWidth && { width: '100%', marginRight: 0 }]}>
      <LinearGradient
        colors={colors}
        style={[styles.card, fullWidth && { height: 'auto', minHeight: 320 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Badge */}
        {(item.badgeText || item.status === 'promotion') && (
          <View style={[
            styles.popularTag,
            item.status === 'promotion' && { backgroundColor: '#2ECC71' }
          ]}>
            <Ionicons 
              name={item.status === 'promotion' ? 'pricetag' : 'flame'} 
              size={12} 
              color="#FFF" 
            />
            <Text style={styles.popularText}>
              {item.badgeText || 'PROMO'}
            </Text>
          </View>
        )}

        <View style={styles.cardContent}>
          <View style={styles.cardIconContainer}>
            {isImageIcon ? (
              <>
                {imageLoading && (
                  <ActivityIndicator size="small" color="#FFF" style={styles.iconLoader} />
                )}
                <Image 
                  source={{ uri: item.icon }} 
                  style={[
                    styles.cardIconImage,
                    imageLoading && { opacity: 0 }
                  ]}
                  resizeMode="cover"
                  onLoadStart={() => setImageLoading(true)}
                  onLoadEnd={() => setImageLoading(false)}
                />
              </>
            ) : (
              <Ionicons name={itemIcon as any} size={isSmallDevice ? 36 : 44} color="#FFF" />
            )}
          </View>

          <Text style={styles.cardName}>{item.name}</Text>
          <Text style={styles.cardDescription}>{item.description}</Text>

          {/* Seletor de Pacotes */}
          <View style={styles.packageSelector}>
            {packagesWithSavings.map((pkg, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.packageOption,
                  selectedPkgIndex === index && styles.packageOptionSelected
                ]}
                onPress={() => setSelectedPkgIndex(index)}
              >
                {pkg.savingsPercent > 0 && (
                  <View style={styles.packageSavingsBadge}>
                    <Text style={styles.packageSavingsText}>-{pkg.savingsPercent}%</Text>
                  </View>
                )}
                <Text style={[
                  styles.packageQty,
                  selectedPkgIndex === index && styles.packageQtySelected
                ]}>
                  {pkg.quantity}x
                </Text>
                <Text style={[
                  styles.packagePriceSmall,
                  selectedPkgIndex === index && styles.packagePriceSmallSelected
                ]}>
                  {formatPrice(pkg.price)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.cardDivider} />

          <View style={styles.cardPriceSection}>
            {selectedPkg && selectedPkg.savingsPercent > 0 && (
              <View style={styles.savingsInfo}>
                <Ionicons name="checkmark-circle" size={14} color="#FFF" />
                <Text style={styles.savingsText}>
                  Economia de {selectedPkg.savingsPercent}%
                </Text>
              </View>
            )}
            <Text style={styles.cardPrice}>
              {selectedPkg ? formatPrice(selectedPkg.price) : '-'}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.buyButton}
            onPress={() => selectedPkg && onPurchase(selectedPkg)}
            activeOpacity={0.8}
          >
            <Text style={[styles.buyButtonText, { color: colors[0] }]}>Comprar</Text>
            <Ionicons name="cart" size={20} color={colors[0]} />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingHorizontal: CARD_PADDING,
    paddingBottom: isSmallDevice ? 16 : 20,
    backgroundColor: BotaLoveColors.backgroundWhite,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  title: {
    fontSize: isSmallDevice ? 26 : 30,
    fontWeight: '800',
    color: BotaLoveColors.secondary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: isSmallDevice ? 13 : 14,
    color: BotaLoveColors.neutralDark,
    marginTop: 3,
    fontWeight: '500',
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: BotaLoveColors.primary,
    paddingHorizontal: isSmallDevice ? 12 : 14,
    paddingVertical: isSmallDevice ? 6 : 8,
    borderRadius: isSmallDevice ? 16 : 18,
    ...Platform.select({
      ios: {
        shadowColor: BotaLoveColors.primary,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  premiumBadgeText: {
    fontSize: isSmallDevice ? 11 : 12,
    fontWeight: '700',
    color: '#FFF',
  },
  promoBanner: {
    margin: isSmallDevice ? 14 : 18,
    borderRadius: isSmallDevice ? 18 : 22,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#D4AD63',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 14,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  promoGradient: {
    padding: isSmallDevice ? 18 : 22,
  },
  promoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: isSmallDevice ? 14 : 18,
  },
  promoIconContainer: {
    width: isSmallDevice ? 50 : 60,
    height: isSmallDevice ? 50 : 60,
    borderRadius: isSmallDevice ? 25 : 30,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  promoText: {
    flex: 1,
  },
  promoTitle: {
    fontSize: isSmallDevice ? 20 : 24,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  promoSubtitle: {
    fontSize: isSmallDevice ? 13 : 14,
    color: '#FFF',
    opacity: 0.95,
    fontWeight: '500',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${BotaLoveColors.primary}12`,
    padding: isSmallDevice ? 14 : 18,
    marginHorizontal: isSmallDevice ? 14 : 18,
    marginBottom: isSmallDevice ? 14 : 18,
    borderRadius: isSmallDevice ? 14 : 16,
    gap: isSmallDevice ? 10 : 14,
    borderWidth: 1.5,
    borderColor: `${BotaLoveColors.primary}25`,
  },
  infoText: {
    flex: 1,
    fontSize: isSmallDevice ? 12 : 13,
    color: BotaLoveColors.textPrimary,
    lineHeight: isSmallDevice ? 17 : 19,
    fontWeight: '500',
  },
  carouselSection: {
    marginBottom: isSmallDevice ? 26 : 34,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: CARD_PADDING,
    marginBottom: isSmallDevice ? 16 : 22,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: isSmallDevice ? 10 : 14,
  },
  iconCircle: {
    width: isSmallDevice ? 38 : 44,
    height: isSmallDevice ? 38 : 44,
    borderRadius: isSmallDevice ? 19 : 22,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  sectionTitle: {
    fontSize: isSmallDevice ? 20 : 24,
    fontWeight: '800',
    color: BotaLoveColors.secondary,
    letterSpacing: -0.3,
  },
  carouselContent: {
    paddingHorizontal: CARD_PADDING,
  },
  cardContainer: {
    width: CARD_WIDTH,
    marginRight: isSmallDevice ? 14 : 18,
  },
  card: {
    borderRadius: isSmallDevice ? 18 : 22,
    padding: isSmallDevice ? 20 : 26,
    height: isSmallDevice ? 380 : 440,
    justifyContent: 'space-between',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  cardContent: {
    flex: 0,
  },
  cardFooter: {
    marginTop: 'auto',
  },
  popularTag: {
    position: 'absolute',
    top: isSmallDevice ? 12 : 14,
    right: isSmallDevice ? 12 : 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: isSmallDevice ? 4 : 5,
    backgroundColor: 'rgba(231, 76, 60, 0.97)',
    paddingHorizontal: isSmallDevice ? 8 : 10,
    paddingVertical: isSmallDevice ? 4 : 5,
    borderRadius: isSmallDevice ? 10 : 14,
    ...Platform.select({
      ios: {
        shadowColor: '#E74C3C',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.4,
        shadowRadius: 6,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  popularText: {
    fontSize: isSmallDevice ? 9 : 10,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  cardIconContainer: {
    width: isSmallDevice ? 65 : 80,
    height: isSmallDevice ? 65 : 80,
    borderRadius: isSmallDevice ? 33 : 40,
    backgroundColor: 'rgba(255,255,255,0.28)',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: isSmallDevice ? 14 : 18,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  cardIconImage: {
    width: '100%',
    height: '100%',
    borderRadius: isSmallDevice ? 33 : 40,
  },
  iconLoader: {
    position: 'absolute',
  },
  cardQuantity: {
    fontSize: isSmallDevice ? 36 : 44,
    fontWeight: '800',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: isSmallDevice ? 4 : 6,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  cardName: {
    fontSize: isSmallDevice ? 17 : 20,
    fontWeight: '800',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: isSmallDevice ? 4 : 6,
    letterSpacing: -0.2,
  },
  cardDescription: {
    fontSize: isSmallDevice ? 12 : 14,
    color: '#FFF',
    textAlign: 'center',
    opacity: 0.95,
    marginBottom: isSmallDevice ? 10 : 14,
    fontWeight: '500',
  },
  // Package Selector Styles
  packageSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: isSmallDevice ? 8 : 10,
    marginTop: isSmallDevice ? 8 : 12,
  },
  packageOption: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: isSmallDevice ? 10 : 14,
    paddingVertical: isSmallDevice ? 8 : 10,
    borderRadius: isSmallDevice ? 10 : 12,
    alignItems: 'center',
    minWidth: isSmallDevice ? 65 : 75,
    position: 'relative',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  packageOptionSelected: {
    backgroundColor: 'rgba(255,255,255,0.35)',
    borderColor: '#FFF',
  },
  packageSavingsBadge: {
    position: 'absolute',
    top: -8,
    right: -4,
    backgroundColor: '#2ECC71',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 6,
  },
  packageSavingsText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFF',
  },
  packageQty: {
    fontSize: isSmallDevice ? 16 : 18,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.8)',
  },
  packageQtySelected: {
    color: '#FFF',
  },
  packagePriceSmall: {
    fontSize: isSmallDevice ? 10 : 11,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
    marginTop: 2,
  },
  packagePriceSmallSelected: {
    color: '#FFF',
  },
  savingsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  savingsText: {
    fontSize: isSmallDevice ? 11 : 12,
    color: '#FFF',
    fontWeight: '600',
  },
  loadingContainer: {
    paddingVertical: isSmallDevice ? 60 : 80,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: BotaLoveColors.neutralDark,
  },
  itemCount: {
    fontSize: 13,
    color: BotaLoveColors.neutralDark,
    fontWeight: '500',
  },
  itemsGrid: {
    paddingHorizontal: CARD_PADDING,
    gap: 16,
  },
  itemWrapper: {
    marginBottom: 0,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    textAlign: 'center',
    color: BotaLoveColors.neutralDark,
    fontSize: 14,
  },
  benefitContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: isSmallDevice ? 5 : 6,
    backgroundColor: 'rgba(255,255,255,0.28)',
    paddingHorizontal: isSmallDevice ? 10 : 14,
    paddingVertical: isSmallDevice ? 7 : 9,
    borderRadius: isSmallDevice ? 12 : 16,
    alignSelf: 'center',
    marginBottom: isSmallDevice ? 8 : 12,
  },
  benefitText: {
    fontSize: isSmallDevice ? 10 : 12,
    color: '#FFF',
    fontWeight: '600',
  },
  cardDivider: {
    height: 1.5,
    backgroundColor: '#FFF',
    marginBottom: isSmallDevice ? 8 : 10,
    opacity: 0.35,
  },
  cardPriceSection: {
    alignItems: 'center',
    marginBottom: isSmallDevice ? 10 : 12,
    minHeight: isSmallDevice ? 70 : 80,
    justifyContent: 'center',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: isSmallDevice ? 6 : 8,
    marginBottom: isSmallDevice ? 2 : 4,
  },
  cardOriginalPrice: {
    fontSize: isSmallDevice ? 12 : 14,
    color: '#FFF',
    textDecorationLine: 'line-through',
    opacity: 0.75,
    fontWeight: '500',
  },
  discountBadge: {
    backgroundColor: '#2ECC71',
    paddingHorizontal: isSmallDevice ? 6 : 8,
    paddingVertical: isSmallDevice ? 2 : 3,
    borderRadius: isSmallDevice ? 8 : 10,
    ...Platform.select({
      ios: {
        shadowColor: '#2ECC71',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  discountText: {
    fontSize: isSmallDevice ? 9 : 11,
    fontWeight: '800',
    color: '#FFF',
  },
  cardPrice: {
    fontSize: isSmallDevice ? 28 : 34,
    fontWeight: '800',
    color: '#FFF',
    lineHeight: isSmallDevice ? 34 : 40,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  buyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: isSmallDevice ? 8 : 10,
    backgroundColor: '#FFF',
    paddingVertical: isSmallDevice ? 12 : 14,
    borderRadius: isSmallDevice ? 14 : 18,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  buyButtonText: {
    fontSize: isSmallDevice ? 14 : 16,
    fontWeight: '800',
    color: BotaLoveColors.secondary,
    letterSpacing: -0.2,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: isSmallDevice ? 18 : 22,
    gap: isSmallDevice ? 7 : 10,
  },
  paginationDot: {
    width: isSmallDevice ? 8 : 10,
    height: isSmallDevice ? 8 : 10,
    borderRadius: isSmallDevice ? 4 : 5,
    backgroundColor: BotaLoveColors.neutralMedium,
  },
  paginationDotActive: {
    width: isSmallDevice ? 24 : 30,
    backgroundColor: BotaLoveColors.primary,
  },
  paymentSection: {
    backgroundColor: BotaLoveColors.backgroundWhite,
    padding: isSmallDevice ? 18 : 24,
    marginTop: isSmallDevice ? 6 : 10,
    marginHorizontal: isSmallDevice ? 14 : 18,
    borderRadius: isSmallDevice ? 16 : 20,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  paymentTitle: {
    fontSize: isSmallDevice ? 15 : 17,
    fontWeight: '700',
    color: BotaLoveColors.secondary,
    marginBottom: isSmallDevice ? 14 : 18,
    letterSpacing: -0.2,
  },
  paymentIcons: {
    flexDirection: 'row',
    gap: isSmallDevice ? 12 : 18,
    marginBottom: isSmallDevice ? 12 : 14,
  },
  paymentIcon: {
    width: isSmallDevice ? 44 : 52,
    height: isSmallDevice ? 44 : 52,
    borderRadius: isSmallDevice ? 12 : 14,
    backgroundColor: BotaLoveColors.neutralLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentInfo: {
    fontSize: isSmallDevice ? 11 : 13,
    color: BotaLoveColors.neutralDark,
    fontWeight: '500',
  },
  bottomSpacer: {
    height: isSmallDevice ? 18 : 24,
  },
  // Network Rural Styles
  networkRuralSection: {
    paddingHorizontal: isSmallDevice ? 14 : 18,
    marginTop: isSmallDevice ? 14 : 18,
  },
  newBadge: {
    backgroundColor: '#E74C3C',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  newBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  networkRuralCard: {
    borderRadius: isSmallDevice ? 16 : 20,
    overflow: 'hidden',
    marginTop: isSmallDevice ? 12 : 16,
  },
  networkRuralGradient: {
    padding: isSmallDevice ? 16 : 20,
  },
  networkRuralPromo: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: isSmallDevice ? 14 : 18,
    gap: 6,
  },
  networkRuralPromoText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: 0.3,
  },
  networkRuralContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: isSmallDevice ? 16 : 20,
  },
  networkRuralIconBg: {
    width: isSmallDevice ? 60 : 70,
    height: isSmallDevice ? 60 : 70,
    borderRadius: isSmallDevice ? 30 : 35,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: isSmallDevice ? 12 : 16,
  },
  networkRuralInfo: {
    flex: 1,
  },
  networkRuralTitle: {
    fontSize: isSmallDevice ? 18 : 20,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 4,
  },
  networkRuralSubtitle: {
    fontSize: isSmallDevice ? 13 : 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: isSmallDevice ? 10 : 12,
  },
  networkRuralFeatures: {
    gap: 6,
  },
  networkRuralFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  networkRuralFeatureText: {
    fontSize: isSmallDevice ? 11 : 12,
    color: '#FFF',
    fontWeight: '500',
  },
  networkRuralPricing: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    padding: isSmallDevice ? 12 : 16,
    alignItems: 'center',
    marginBottom: isSmallDevice ? 14 : 16,
  },
  networkRuralPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  networkRuralPriceOld: {
    fontSize: isSmallDevice ? 14 : 16,
    color: 'rgba(255,255,255,0.7)',
    textDecorationLine: 'line-through',
    marginRight: 8,
  },
  networkRuralPrice: {
    fontSize: isSmallDevice ? 28 : 34,
    fontWeight: '800',
    color: '#FFF',
  },
  networkRuralPricePeriod: {
    fontSize: isSmallDevice ? 14 : 16,
    color: '#FFF',
    fontWeight: '600',
    marginLeft: 2,
  },
  networkRuralPriceNote: {
    fontSize: isSmallDevice ? 11 : 12,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '500',
  },
  networkRuralButton: {
    backgroundColor: '#FFF',
    paddingVertical: isSmallDevice ? 14 : 16,
    borderRadius: isSmallDevice ? 12 : 14,
    alignItems: 'center',
  },
  networkRuralButtonText: {
    fontSize: isSmallDevice ? 15 : 16,
    fontWeight: '800',
    color: '#27AE60',
  },
  networkRuralActiveSection: {
    paddingHorizontal: isSmallDevice ? 14 : 18,
    marginTop: isSmallDevice ? 14 : 18,
  },
  networkRuralActiveCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: isSmallDevice ? 14 : 18,
    borderRadius: isSmallDevice ? 14 : 16,
    gap: isSmallDevice ? 12 : 16,
  },
  networkRuralActiveInfo: {
    flex: 1,
  },
  networkRuralActiveTitle: {
    fontSize: isSmallDevice ? 15 : 16,
    fontWeight: '700',
    color: '#27AE60',
    marginBottom: 2,
  },
  networkRuralActiveSubtitle: {
    fontSize: isSmallDevice ? 12 : 13,
    color: BotaLoveColors.neutralDark,
  },
  networkRuralActiveButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
