import PremiumModal from '@/components/PremiumModal';
import { BotaLoveColors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { auth } from '@/firebase/config';
import { activateBoost, checkBoostStatus, getUserInventory } from '@/firebase/planSubscriptionService';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isSmallDevice = SCREEN_WIDTH < 375;
const isMediumDevice = SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 414;
const CARD_PADDING = isSmallDevice ? 16 : 20;

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Interface para item do inventário com dados enriquecidos
interface InventoryItemDisplay {
  itemId: string;
  itemName: string;
  quantity: number;
  icon: string;
  color: string;
  bgColor: string;
}

export default function ProfileScreen() {
  const router = useRouter();
  const { currentUser, hasPremium, logout, refreshUserData, userType } = useAuth();
  const [premiumModalVisible, setPremiumModalVisible] = useState(false);
  const [photoModalVisible, setPhotoModalVisible] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [heroPhotoIndex, setHeroPhotoIndex] = useState(0);
  const carouselRef = useRef<FlatList>(null);
  const heroCarouselRef = useRef<FlatList>(null);
  
  // Estado para histórico de itens avulsos
  const [inventoryModalVisible, setInventoryModalVisible] = useState(false);
  const [inventoryItems, setInventoryItems] = useState<InventoryItemDisplay[]>([]);
  const [loadingInventory, setLoadingInventory] = useState(false);
  
  // Estado para Boost (Assobios do Peão)
  const [boostActive, setBoostActive] = useState(false);
  const [boostRemainingMinutes, setBoostRemainingMinutes] = useState(0);
  const [activatingBoost, setActivatingBoost] = useState(false);

  const isProducer = userType === 'producer';

  // Recarregar dados do usuário quando a tela ganhar foco
  useFocusEffect(
    useCallback(() => {
      refreshUserData();
      // Verificar status do boost
      if (currentUser?.id) {
        checkBoostStatus(currentUser.id).then(status => {
          setBoostActive(status.isActive);
          setBoostRemainingMinutes(status.remainingMinutes || 0);
        });
      }
    }, [refreshUserData, currentUser?.id])
  );
  
  // Função para ativar o Boost (Assobios do Peão)
  const handleActivateBoost = async () => {
    if (!currentUser?.id) return;
    
    if (boostActive) {
      Alert.alert(
        '🚀 Boost Ativo!',
        `Seu perfil está em destaque! Restam ${boostRemainingMinutes} minutos.`,
        [{ text: 'OK' }]
      );
      return;
    }
    
    Alert.alert(
      '🚀 Assobios do Peão',
      'Ativar o boost por 1 hora?\n\nSeu perfil aparecerá em destaque para muito mais pessoas!',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Ativar',
          onPress: async () => {
            setActivatingBoost(true);
            try {
              const result = await activateBoost(currentUser.id);
              if (result.success) {
                setBoostActive(true);
                setBoostRemainingMinutes(60);
                Alert.alert(
                  '🚀 Boost Ativado!',
                  'Seu perfil está em destaque por 1 hora! Aproveite!',
                  [{ text: 'Maravilha!' }]
                );
              } else {
                Alert.alert(
                  'Ops!',
                  result.error || 'Não foi possível ativar o boost. Tente novamente.',
                  [
                    { text: 'OK' },
                    { text: 'Comprar', onPress: () => router.push('/store') }
                  ]
                );
              }
            } catch (error) {
              console.error('Erro ao ativar boost:', error);
              Alert.alert('Erro', 'Ocorreu um erro ao ativar o boost.');
            } finally {
              setActivatingBoost(false);
            }
          }
        }
      ]
    );
  };
  
  // Função para gerar cor de fundo clara baseada na cor principal
  const getLightBgColor = (color: string): string => {
    // Converte hex para RGB e clareia
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    // Clareia mantendo a tonalidade
    const lightR = Math.round(r + (255 - r) * 0.85);
    const lightG = Math.round(g + (255 - g) * 0.85);
    const lightB = Math.round(b + (255 - b) * 0.85);
    return `rgb(${lightR}, ${lightG}, ${lightB})`;
  };
  
  // Mapeamento de palavras-chave para ícones e cores baseado nos nomes da loja
  const getItemVisuals = (itemName: string): { icon: keyof typeof Ionicons.glyphMap; color: string } => {
    const name = itemName.toLowerCase();
    
    // Mapeamento baseado em palavras-chave do nome - usando nomes exatos do Ionicons
    if (name.includes('super') && name.includes('agro')) {
      return { icon: 'star', color: '#5DADE2' };
    }
    if (name.includes('olhar') || name.includes('mistério') || name.includes('misterio')) {
      return { icon: 'eye', color: '#E74C3C' };
    }
    if (name.includes('checkin') || name.includes('check-in') || name.includes('chekin')) {
      return { icon: 'location', color: '#2ECC71' };
    }
    if (name.includes('retorno') || name.includes('estrada') || name.includes('voltar')) {
      return { icon: 'refresh', color: '#F39C12' };
    }
    if (name.includes('destaque') || name.includes('rural') || name.includes('spotlight')) {
      return { icon: 'sparkles', color: '#D4AD63' };
    }
    if (name.includes('boost') || name.includes('turbo')) {
      return { icon: 'rocket', color: '#9B59B6' };
    }
    if (name.includes('correio') || name.includes('roça') || name.includes('roca')) {
      return { icon: 'mail', color: '#9B59B6' };
    }
    if (name.includes('assobio') || name.includes('peão') || name.includes('peao')) {
      return { icon: 'musical-notes', color: '#E67E22' };
    }
    if (name.includes('like') || name.includes('coração') || name.includes('coracao')) {
      return { icon: 'heart', color: '#E91E63' };
    }
    if (name.includes('incognito') || name.includes('anônimo') || name.includes('anonimo')) {
      return { icon: 'eye-off', color: '#607D8B' };
    }
    
    // Fallback com ícone válido
    return { icon: 'gift', color: '#D4AD63' };
  };
  
  // Carregar inventário do usuário da coleção user_inventory
  const loadInventory = async () => {
    if (!auth.currentUser) return;
    
    setLoadingInventory(true);
    try {
      // Busca itens da coleção user_inventory
      const items = await getUserInventory(auth.currentUser.uid);
      
      // Filtra apenas itens com quantidade > 0 e enriquece com dados visuais
      const displayItems: InventoryItemDisplay[] = [];
      
      for (const item of items) {
        if (item.quantity > 0) {
          // Usa mapeamento por nome do item para pegar ícone/cor
          const visuals = getItemVisuals(item.itemName);
          
          displayItems.push({
            itemId: item.itemId,
            itemName: item.itemName,
            quantity: item.quantity,
            icon: visuals.icon,
            color: visuals.color,
            bgColor: getLightBgColor(visuals.color),
          });
        }
      }
      
      setInventoryItems(displayItems);
    } catch (error) {
      console.error('Erro ao carregar inventário:', error);
      setInventoryItems([]);
    } finally {
      setLoadingInventory(false);
    }
  };
  
  // Abrir modal de inventário
  const openInventoryModal = () => {
    loadInventory();
    setInventoryModalVisible(true);
  };

  const openPhotoCarousel = (index: number) => {
    setSelectedPhotoIndex(index);
    setPhotoModalVisible(true);
  };

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  // Funções auxiliares para verificar dados do perfil
  const hasBasicInfo = () => {
    const profile = currentUser?.profile;
    return profile?.age || (profile?.city && profile?.state) || profile?.occupation || 
           profile?.height || profile?.children || profile?.education;
  };

  const hasRuralInfo = () => {
    const profile = currentUser?.profile;
    return (profile?.ruralActivities?.length || 0) > 0 || 
           (profile?.propertySize?.length || 0) > 0 ||
           (profile?.animals?.length || 0) > 0 || 
           (profile?.crops?.length || 0) > 0 ||
           (profile?.agroAreas?.length || 0) > 0;
  };

  const hasPreferences = () => {
    const profile = currentUser?.profile;
    return (profile?.relationshipGoals?.length || 0) > 0 ||
           (profile?.musicalStyles?.length || 0) > 0 ||
           (profile?.hobbies?.length || 0) > 0 ||
           (profile?.personalTastes?.length || 0) > 0 ||
           (profile?.pets?.length || 0) > 0;
  };

  const translateGoal = (goal: string) => {
    const translations: { [key: string]: string } = {
      'amizade': 'Amizade',
      'namoro': 'Namoro',
      'casamento': 'Casamento',
      'eventos': 'Eventos',
      'network': 'Networking',
    };
    return translations[goal] || goal;
  };

  if (!currentUser) return null;

  // Renderizar perfil simplificado para produtores
  if (isProducer) {
    return (
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header para Produtor */}
          <LinearGradient
            colors={[BotaLoveColors.primary, BotaLoveColors.primaryDark]}
            style={styles.headerGradient}
          >
            <View style={styles.header}>
              <Text style={styles.title}>Meu Perfil</Text>
              <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                <Ionicons name="log-out-outline" size={24} color="#FFF" />
                <Text style={styles.logoutText}>Sair</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>

          {/* Profile Card Simplificado */}
          <View style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatarRing}>
                {currentUser.profile?.photos?.[0] ? (
                  <Image source={{ uri: currentUser.profile.photos[0] }} style={styles.avatar} />
                ) : (
                  <View style={[styles.avatar, styles.avatarPlaceholder]}>
                    <Ionicons name="business" size={isSmallDevice ? 60 : 80} color={BotaLoveColors.primary} />
                  </View>
                )}
              </View>
            </View>
            
            <Text style={styles.name}>{currentUser.profile?.name}</Text>
            <Text style={styles.producerLabel}>Produtor de Eventos</Text>

            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => router.push('/edit-profile' as any)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[BotaLoveColors.primary, BotaLoveColors.primaryDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.editButtonGradient}
              >
                <Ionicons name="create-outline" size={22} color="#FFF" />
                <Text style={[styles.editButtonText, { color: '#FFF' }]}>Editar Perfil</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Bio Simplificada */}
          {currentUser.profile?.bio && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="person-outline" size={22} color={BotaLoveColors.primary} />
                <Text style={styles.sectionTitle}>Sobre</Text>
              </View>
              <Text style={styles.bio}>{currentUser.profile.bio}</Text>
            </View>
          )}

          {/* Menu Actions */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push('/(tabs)/create-event' as any)}
            >
              <View style={styles.menuIconContainer}>
                <Ionicons name="add-circle" size={24} color="#27AE60" />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>Criar Evento</Text>
                <Text style={styles.menuSubtitle}>Publique um novo evento</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={BotaLoveColors.neutralMedium} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push('/(tabs)/event-history' as any)}
            >
              <View style={styles.menuIconContainer}>
                <Ionicons name="calendar" size={24} color={BotaLoveColors.primary} />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>Meus Eventos</Text>
                <Text style={styles.menuSubtitle}>Gerencie seus eventos</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={BotaLoveColors.neutralMedium} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push('/settings' as any)}
            >
              <View style={styles.menuIconContainer}>
                <Ionicons name="settings" size={24} color="#3498DB" />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>Configurações</Text>
                <Text style={styles.menuSubtitle}>Ajustes da conta</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={BotaLoveColors.neutralMedium} />
            </TouchableOpacity>
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </View>
    );
  }

  // Perfil completo para usuários regulares - Estilo Tinder
  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        {/* Hero Section - Foto Grande com Swipe */}
        <View style={styles.heroSection}>
          {(currentUser.profile?.photos?.length || 0) > 0 ? (
            <FlatList
              ref={heroCarouselRef}
              data={currentUser.profile?.photos || []}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              bounces={false}
              onMomentumScrollEnd={(event) => {
                const newIndex = Math.round(
                  event.nativeEvent.contentOffset.x / SCREEN_WIDTH
                );
                setHeroPhotoIndex(newIndex);
              }}
              keyExtractor={(_, index) => `hero-photo-${index}`}
              renderItem={({ item, index }) => (
                <TouchableOpacity 
                  activeOpacity={0.95}
                  onPress={() => openPhotoCarousel(index)}
                  style={styles.heroSlide}
                >
                  <Image 
                    source={{ uri: item }} 
                    style={styles.heroImage} 
                  />
                </TouchableOpacity>
              )}
              getItemLayout={(_, index) => ({
                length: SCREEN_WIDTH,
                offset: SCREEN_WIDTH * index,
                index,
              })}
            />
          ) : (
            <View style={[styles.heroSlide, styles.heroPlaceholder]}>
              <Ionicons name="person" size={80} color={BotaLoveColors.neutralMedium} />
            </View>
          )}
          
          {/* Gradient Overlay */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)', 'rgba(0,0,0,0.95)']}
            style={styles.heroGradient}
            pointerEvents="none"
          >
            {/* Nome e Idade */}
            <View style={styles.heroContent}>
              <View style={styles.heroNameRow}>
                <Text style={styles.heroName}>
                  {currentUser.profile?.name}
                </Text>
                <Text style={styles.heroAge}>{currentUser.profile?.age}</Text>
                {hasPremium && (
                  <View style={styles.verifiedBadge}>
                    <Ionicons name="checkmark-circle" size={26} color="#3B82F6" />
                  </View>
                )}
              </View>
              
              {/* Info Rápida */}
              <View style={styles.heroInfoRow}>
                {currentUser.profile?.occupation && (
                  <View style={styles.heroInfoItem}>
                    <Ionicons name="briefcase" size={16} color="rgba(255,255,255,0.8)" />
                    <Text style={styles.heroInfoText}>{currentUser.profile.occupation}</Text>
                  </View>
                )}
                {currentUser.profile?.city && (
                  <View style={styles.heroInfoItem}>
                    <Ionicons name="location" size={16} color="rgba(255,255,255,0.8)" />
                    <Text style={styles.heroInfoText}>
                      {currentUser.profile.city}{currentUser.profile?.state ? `, ${currentUser.profile.state}` : ''}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </LinearGradient>

          {/* Botões no Topo */}
          <View style={styles.heroTopActions}>
            <TouchableOpacity 
              style={styles.heroActionButton}
              onPress={() => router.push('/settings' as any)}
            >
              <Ionicons name="settings-outline" size={24} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.heroActionButton}
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>

          {/* Premium Badge flutuante */}
          {hasPremium && (
            <View style={styles.heroPremiumBadge}>
              <LinearGradient
                colors={['#E5C88A', BotaLoveColors.primary]}
                style={styles.heroPremiumGradient}
              >
                <Ionicons name="star" size={16} color="#FFF" />
                <Text style={styles.heroPremiumText}>PREMIUM</Text>
              </LinearGradient>
            </View>
          )}

          {/* Indicadores de Foto */}
          {(currentUser.profile?.photos?.length || 0) > 1 && (
            <View style={styles.heroPhotoIndicators}>
              {(currentUser.profile?.photos || []).map((_, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={[
                    styles.heroPhotoIndicator, 
                    index === heroPhotoIndex && styles.heroPhotoIndicatorActive
                  ]}
                  onPress={() => {
                    heroCarouselRef.current?.scrollToIndex({ index, animated: true });
                    setHeroPhotoIndex(index);
                  }}
                />
              ))}
            </View>
          )}
        </View>

        {/* Action Buttons - Estilo Tinder */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity 
            style={styles.actionButtonSecondary}
            onPress={() => router.push('/settings' as any)}
            activeOpacity={0.8}
          >
            <Ionicons name="settings-outline" size={28} color={BotaLoveColors.neutralDark} />
          </TouchableOpacity>
          
          {/* Boost Button (Assobios do Peão) */}
          <TouchableOpacity 
            style={[styles.actionButtonSecondary, boostActive && styles.actionButtonBoostActive]}
            onPress={handleActivateBoost}
            disabled={activatingBoost}
            activeOpacity={0.8}
          >
            {activatingBoost ? (
              <ActivityIndicator size="small" color={BotaLoveColors.primary} />
            ) : (
              <>
                <Ionicons 
                  name="rocket" 
                  size={28} 
                  color={boostActive ? '#9B59B6' : BotaLoveColors.neutralDark} 
                />
                {boostActive && (
                  <View style={styles.boostBadge}>
                    <Text style={styles.boostBadgeText}>{boostRemainingMinutes}m</Text>
                  </View>
                )}
              </>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButtonPrimary}
            onPress={() => router.push('/edit-profile' as any)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[BotaLoveColors.primary, BotaLoveColors.primaryDark]}
              style={styles.actionButtonGradient}
            >
              <Ionicons name="pencil" size={30} color="#FFF" />
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButtonSecondary}
            onPress={() => router.push('/discovery-settings' as any)}
            activeOpacity={0.8}
          >
            <Ionicons name="options-outline" size={28} color={BotaLoveColors.neutralDark} />
          </TouchableOpacity>
        </View>

        {/* Completar Perfil Progress */}
        <View style={styles.profileCompletionCard}>
          <View style={styles.profileCompletionHeader}>
            <Text style={styles.profileCompletionTitle}>Complete seu perfil</Text>
            <Text style={styles.profileCompletionPercent}>
              {Math.min(100, 
                (currentUser.profile?.photos?.length ? 25 : 0) + 
                (currentUser.profile?.bio ? 25 : 0) + 
                (currentUser.profile?.interests?.length ? 25 : 0) + 
                (hasBasicInfo() ? 25 : 0)
              )}%
            </Text>
          </View>
          <View style={styles.profileCompletionBarBg}>
            <View 
              style={[
                styles.profileCompletionBar, 
                { 
                  width: `${Math.min(100, 
                    (currentUser.profile?.photos?.length ? 25 : 0) + 
                    (currentUser.profile?.bio ? 25 : 0) + 
                    (currentUser.profile?.interests?.length ? 25 : 0) + 
                    (hasBasicInfo() ? 25 : 0)
                  )}%` 
                }
              ]} 
            />
          </View>
          <Text style={styles.profileCompletionSubtext}>
            Perfis completos recebem mais matches!
          </Text>
        </View>

        {/* Galeria de Fotos Moderna */}
        <View style={styles.modernSection}>
          <View style={styles.modernSectionHeader}>
            <Text style={styles.modernSectionTitle}>Fotos</Text>
            <TouchableOpacity 
              style={styles.modernSectionAction}
              onPress={() => router.push('/edit-profile' as any)}
            >
              <Text style={styles.modernSectionActionText}>Editar</Text>
            </TouchableOpacity>
          </View>
          
          {(currentUser.profile?.photos?.length || 0) > 0 ? (
            <View style={styles.photoGridModern}>
              {(currentUser.profile?.photos || []).slice(0, 6).map((photo, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={[
                    styles.photoGridItem,
                    index === 0 && styles.photoGridItemLarge
                  ]}
                  onPress={() => openPhotoCarousel(index)}
                  activeOpacity={0.9}
                >
                  <Image source={{ uri: photo }} style={styles.photoGridImage} />
                  {index === 0 && (
                    <View style={styles.photoMainIndicator}>
                      <Text style={styles.photoMainText}>Principal</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
              {(currentUser.profile?.photos?.length || 0) < 6 && (
                <TouchableOpacity 
                  style={styles.addPhotoGridItem}
                  onPress={() => router.push('/edit-profile' as any)}
                >
                  <View style={styles.addPhotoCircle}>
                    <Ionicons name="add" size={32} color={BotaLoveColors.primary} />
                  </View>
                  <Text style={styles.addPhotoGridText}>Adicionar</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.emptyPhotosModern}
              onPress={() => router.push('/edit-profile' as any)}
            >
              <View style={styles.emptyPhotosIconContainer}>
                <Ionicons name="camera-outline" size={40} color={BotaLoveColors.primary} />
              </View>
              <Text style={styles.emptyPhotosModernTitle}>Adicione suas fotos</Text>
              <Text style={styles.emptyPhotosModernSubtext}>
                Perfis com fotos recebem 10x mais likes
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Sobre Mim */}
        <View style={styles.modernSection}>
          <View style={styles.modernSectionHeader}>
            <Text style={styles.modernSectionTitle}>Sobre mim</Text>
            <TouchableOpacity 
              style={styles.modernSectionAction}
              onPress={() => router.push('/edit-profile' as any)}
            >
              <Text style={styles.modernSectionActionText}>Editar</Text>
            </TouchableOpacity>
          </View>
          
          {currentUser.profile?.bio ? (
            <Text style={styles.bioModern}>{currentUser.profile.bio}</Text>
          ) : (
            <TouchableOpacity 
              style={styles.emptyBioContainer}
              onPress={() => router.push('/edit-profile' as any)}
            >
              <Ionicons name="create-outline" size={24} color={BotaLoveColors.primary} />
              <Text style={styles.emptyBioText}>Adicione uma bio sobre você</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Interesses / Paixões */}
        <View style={styles.modernSection}>
          <View style={styles.modernSectionHeader}>
            <Text style={styles.modernSectionTitle}>Paixões</Text>
            <TouchableOpacity 
              style={styles.modernSectionAction}
              onPress={() => router.push('/edit-profile' as any)}
            >
              <Text style={styles.modernSectionActionText}>Editar</Text>
            </TouchableOpacity>
          </View>
          
          {currentUser.profile?.interests && currentUser.profile.interests.length > 0 ? (
            <View style={styles.interestsModern}>
              {currentUser.profile.interests.map((interest, index) => (
                <View key={index} style={styles.interestTagModern}>
                  <Text style={styles.interestTagText}>{interest}</Text>
                </View>
              ))}
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.emptyInterestsContainer}
              onPress={() => router.push('/edit-profile' as any)}
            >
              <Ionicons name="heart-outline" size={24} color={BotaLoveColors.primary} />
              <Text style={styles.emptyInterestsText}>Adicione seus interesses</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Informações Detalhadas */}
        <View style={styles.detailsCard}>
          <Text style={styles.detailsCardTitle}>Informações</Text>
          
          <View style={styles.detailsGrid}>
            {currentUser.profile?.height && (
              <View style={styles.detailItem}>
                <MaterialCommunityIcons name="ruler" size={20} color={BotaLoveColors.primary} />
                <Text style={styles.detailItemText}>{currentUser.profile.height} cm</Text>
              </View>
            )}
            {currentUser.profile?.education && (
              <View style={styles.detailItem}>
                <Ionicons name="school-outline" size={20} color={BotaLoveColors.primary} />
                <Text style={styles.detailItemText}>{currentUser.profile.education}</Text>
              </View>
            )}
            {currentUser.profile?.children && (
              <View style={styles.detailItem}>
                <Ionicons name="people-outline" size={20} color={BotaLoveColors.primary} />
                <Text style={styles.detailItemText}>{currentUser.profile.children}</Text>
              </View>
            )}
            {currentUser.profile?.birthCity && (
              <View style={styles.detailItem}>
                <Ionicons name="home-outline" size={20} color={BotaLoveColors.primary} />
                <Text style={styles.detailItemText}>{currentUser.profile.birthCity}</Text>
              </View>
            )}
          </View>
          
          {!hasBasicInfo() && (
            <TouchableOpacity 
              style={styles.addDetailsButton}
              onPress={() => router.push('/edit-profile' as any)}
            >
              <Ionicons name="add-circle-outline" size={18} color={BotaLoveColors.primary} />
              <Text style={styles.addDetailsText}>Adicionar informações</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Vida Rural - Estilo moderno */}
        {(currentUser.profile?.isAgroUser || hasRuralInfo()) && (
          <View style={styles.modernSection}>
            <View style={styles.modernSectionHeader}>
              <View style={styles.sectionTitleWithIcon}>
                <View style={styles.sectionIconBg}>
                  <Ionicons name="leaf" size={18} color="#27AE60" />
                </View>
                <Text style={styles.modernSectionTitle}>Vida Rural</Text>
              </View>
              <TouchableOpacity 
                style={styles.modernSectionAction}
                onPress={() => router.push('/edit-profile' as any)}
              >
                <Text style={styles.modernSectionActionText}>Editar</Text>
              </TouchableOpacity>
            </View>

            {hasRuralInfo() ? (
              <View style={styles.ruralSectionsContainer}>
                {/* Atividades Rurais */}
                {(currentUser.profile?.ruralActivities?.length || 0) > 0 && (
                  <View style={styles.ruralSubsection}>
                    <Text style={styles.ruralSubsectionTitle}>🌾 Atividade Rural</Text>
                    <View style={styles.ruralTagsContainer}>
                      {currentUser.profile?.ruralActivities?.map((activity, index) => (
                        <View key={`activity-${index}`} style={[styles.ruralTag, { borderColor: '#27AE60' }]}>
                          <Text style={[styles.ruralTagText, { color: '#27AE60' }]}>{activity}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* Tamanho da Propriedade */}
                {(currentUser.profile?.propertySize?.length || 0) > 0 && (
                  <View style={styles.ruralSubsection}>
                    <Text style={styles.ruralSubsectionTitle}>🏡 Porte da Propriedade</Text>
                    <View style={styles.ruralTagsContainer}>
                      {currentUser.profile?.propertySize?.map((size, index) => (
                        <View key={`size-${index}`} style={[styles.ruralTag, { borderColor: '#2E7D32' }]}>
                          <Text style={[styles.ruralTagText, { color: '#2E7D32' }]}>{size}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* Animais */}
                {(currentUser.profile?.animals?.length || 0) > 0 && (
                  <View style={styles.ruralSubsection}>
                    <Text style={styles.ruralSubsectionTitle}>🐄 Animais que Trabalha/Cria</Text>
                    <View style={styles.ruralTagsContainer}>
                      {currentUser.profile?.animals?.map((animal, index) => (
                        <View key={`animal-${index}`} style={[styles.ruralTag, { borderColor: '#8B4513' }]}>
                          <Text style={[styles.ruralTagText, { color: '#8B4513' }]}>{animal}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* Culturas e Plantio */}
                {(currentUser.profile?.crops?.length || 0) > 0 && (
                  <View style={styles.ruralSubsection}>
                    <Text style={styles.ruralSubsectionTitle}>🌱 Culturas e Plantio</Text>
                    <View style={styles.ruralTagsContainer}>
                      {currentUser.profile?.crops?.map((crop, index) => (
                        <View key={`crop-${index}`} style={[styles.ruralTag, { borderColor: '#558B2F' }]}>
                          <Text style={[styles.ruralTagText, { color: '#558B2F' }]}>{crop}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* Áreas de Atuação */}
                {(currentUser.profile?.agroAreas?.length || 0) > 0 && (
                  <View style={styles.ruralSubsection}>
                    <Text style={styles.ruralSubsectionTitle}>🚜 Áreas de Atuação</Text>
                    <View style={styles.ruralTagsContainer}>
                      {currentUser.profile?.agroAreas?.map((area, index) => (
                        <View key={`area-${index}`} style={[styles.ruralTag, { borderColor: '#388E3C' }]}>
                          <Text style={[styles.ruralTagText, { color: '#388E3C' }]}>{area}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            ) : (
              <TouchableOpacity 
                style={styles.emptyInterestsContainer}
                onPress={() => router.push('/edit-profile' as any)}
              >
                <Ionicons name="leaf-outline" size={24} color="#27AE60" />
                <Text style={[styles.emptyInterestsText, { color: '#27AE60' }]}>
                  Conte sobre sua vida rural
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Preferências Pessoais */}
        {hasPreferences() && (
          <View style={styles.modernSection}>
            <View style={styles.modernSectionHeader}>
              <View style={styles.sectionTitleWithIcon}>
                <View style={[styles.sectionIconBg, { backgroundColor: '#FFF3E0' }]}>
                  <Ionicons name="sparkles" size={18} color="#FF9800" />
                </View>
                <Text style={styles.modernSectionTitle}>Preferências Pessoais</Text>
              </View>
              <TouchableOpacity 
                style={styles.modernSectionAction}
                onPress={() => router.push('/edit-profile' as any)}
              >
                <Text style={styles.modernSectionActionText}>Editar</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.preferencesContainer}>
              {/* Estilos Musicais */}
              {(currentUser.profile?.musicalStyles?.length || 0) > 0 && (
                <View style={styles.preferenceSubsection}>
                  <Text style={styles.preferenceSubsectionTitle}>🎵 Estilos Musicais</Text>
                  <View style={styles.preferenceTagsContainer}>
                    {currentUser.profile?.musicalStyles?.map((style, index) => (
                      <View key={`music-${index}`} style={[styles.preferenceTag, { backgroundColor: '#E3F2FD', borderColor: '#2196F3' }]}>
                        <Text style={[styles.preferenceTagText, { color: '#1976D2' }]}>{style}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Hobbies */}
              {(currentUser.profile?.hobbies?.length || 0) > 0 && (
                <View style={styles.preferenceSubsection}>
                  <Text style={styles.preferenceSubsectionTitle}>🎯 Hobbies</Text>
                  <View style={styles.preferenceTagsContainer}>
                    {currentUser.profile?.hobbies?.map((hobby, index) => (
                      <View key={`hobby-${index}`} style={[styles.preferenceTag, { backgroundColor: '#F3E5F5', borderColor: '#9C27B0' }]}>
                        <Text style={[styles.preferenceTagText, { color: '#7B1FA2' }]}>{hobby}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Gostos Pessoais */}
              {(currentUser.profile?.personalTastes?.length || 0) > 0 && (
                <View style={styles.preferenceSubsection}>
                  <Text style={styles.preferenceSubsectionTitle}>⭐ Gostos Pessoais</Text>
                  <View style={styles.preferenceTagsContainer}>
                    {currentUser.profile?.personalTastes?.map((taste, index) => (
                      <View key={`taste-${index}`} style={[styles.preferenceTag, { backgroundColor: '#FFF8E1', borderColor: '#FFC107' }]}>
                        <Text style={[styles.preferenceTagText, { color: '#F57F17' }]}>{taste}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Animais de Estimação */}
              {(currentUser.profile?.pets?.length || 0) > 0 && (
                <View style={styles.preferenceSubsection}>
                  <Text style={styles.preferenceSubsectionTitle}>🐾 Animais de Estimação</Text>
                  <View style={styles.preferenceTagsContainer}>
                    {currentUser.profile?.pets?.map((pet, index) => (
                      <View key={`pet-${index}`} style={[styles.preferenceTag, { backgroundColor: '#FFEBEE', borderColor: '#E91E63' }]}>
                        <Text style={[styles.preferenceTagText, { color: '#C2185B' }]}>{pet}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Objetivos de Relacionamento */}
        {(currentUser.profile?.relationshipGoals?.length || 0) > 0 && (
          <View style={styles.modernSection}>
            <View style={styles.modernSectionHeader}>
              <View style={styles.sectionTitleWithIcon}>
                <View style={[styles.sectionIconBg, { backgroundColor: '#FDEAEA' }]}>
                  <Ionicons name="heart" size={18} color="#E74C3C" />
                </View>
                <Text style={styles.modernSectionTitle}>Procurando</Text>
              </View>
            </View>
            <View style={styles.goalTagsContainer}>
              {currentUser.profile?.relationshipGoals?.map((goal, index) => (
                <View key={index} style={styles.goalTag}>
                  <Ionicons name="heart" size={14} color="#E74C3C" />
                  <Text style={styles.goalTagText}>{translateGoal(goal)}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Premium Section - Moderno */}
        {!hasPremium && (
          <TouchableOpacity 
            style={styles.premiumCardModern}
            onPress={() => setPremiumModalVisible(true)}
            activeOpacity={0.95}
          >
            <LinearGradient
              colors={['#E5C88A', BotaLoveColors.primary, '#B8944D']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.premiumCardGradient}
            >
              <View style={styles.premiumCardContent}>
                <View style={styles.premiumCardIcon}>
                  <Ionicons name="diamond" size={28} color="#FFF" />
                </View>
                <View style={styles.premiumCardText}>
                  <Text style={styles.premiumCardTitle}>Bota Love Gold</Text>
                  <Text style={styles.premiumCardSubtitle}>
                    Veja quem curtiu você e muito mais
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#FFF" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Menu Profissional */}
        <View style={styles.menuContainer}>
          <Text style={styles.menuSectionTitle}>Configurações</Text>
          <View style={styles.menuCard}>
            <MenuItemPro 
              icon="compass-outline" 
              iconColor="#6366F1"
              iconBg="#EEF2FF"
              title="Ajustes de Descoberta" 
              subtitle="Personalize quem você vê"
              onPress={() => router.push('/discovery-settings' as any)} 
              showBorder
            />
            <MenuItemPro 
              icon="settings-outline" 
              iconColor="#8B5CF6"
              iconBg="#F3E8FF"
              title="Configurações" 
              subtitle="Conta, privacidade e mais"
              onPress={() => router.push('/settings' as any)} 
              showBorder
            />
            <MenuItemPro 
              icon="notifications-outline" 
              iconColor="#EC4899"
              iconBg="#FCE7F3"
              title="Notificações" 
              subtitle="Gerencie seus alertas"
              onPress={() => router.push('/notifications' as any)} 
              showBorder
            />
            <MenuItemPro 
              icon="bag-outline" 
              iconColor={BotaLoveColors.primary}
              iconBg="#FEF7E8"
              title="Histórico de Itens Avulsos" 
              subtitle="Super Likes, Boosts e mais"
              onPress={openInventoryModal} 
            />
          </View>

          <Text style={styles.menuSectionTitle}>Suporte</Text>
          <View style={styles.menuCard}>
            <MenuItemPro 
              icon="help-circle-outline" 
              iconColor="#14B8A6"
              iconBg="#CCFBF1"
              title="Ajuda e Suporte" 
              subtitle="Central de ajuda e FAQ"
              onPress={() => router.push('/help' as any)} 
              showBorder
            />
            <MenuItemPro 
              icon="document-text-outline" 
              iconColor="#F59E0B"
              iconBg="#FEF3C7"
              title="Termos e Privacidade" 
              subtitle="Políticas e termos de uso"
              onPress={() => router.push('/terms' as any)} 
            />
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Bota Love v1.0.0</Text>
          <Text style={styles.footerSubtext}>Feito com ❤️ para o agro</Text>
        </View>
      </ScrollView>

      {/* Photo Carousel Modal */}
      <Modal
        visible={photoModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setPhotoModalVisible(false)}
        statusBarTranslucent
      >
        <View style={styles.modalContainer}>
          <StatusBar barStyle="light-content" backgroundColor="rgba(0,0,0,0.95)" />
          
          {/* Header do Modal */}
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setPhotoModalVisible(false)}
            >
              <Ionicons name="close" size={28} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.modalCounter}>
              {selectedPhotoIndex + 1} / {currentUser.profile?.photos?.length || 0}
            </Text>
            <View style={{ width: 44 }} />
          </View>

          {/* Carrossel de Fotos */}
          <FlatList
            ref={carouselRef}
            data={currentUser.profile?.photos || []}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={selectedPhotoIndex}
            getItemLayout={(_, index) => ({
              length: SCREEN_WIDTH,
              offset: SCREEN_WIDTH * index,
              index,
            })}
            onMomentumScrollEnd={(event) => {
              const newIndex = Math.round(
                event.nativeEvent.contentOffset.x / SCREEN_WIDTH
              );
              setSelectedPhotoIndex(newIndex);
            }}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item, index }) => (
              <View style={styles.carouselSlide}>
                <Image
                  source={{ uri: item }}
                  style={styles.carouselImage}
                  resizeMode="contain"
                />
                {index === 0 && (
                  <View style={styles.carouselMainBadge}>
                    <Ionicons name="star" size={14} color="#FFF" />
                    <Text style={styles.carouselMainText}>Foto Principal</Text>
                  </View>
                )}
              </View>
            )}
          />

          {/* Indicadores de Paginação */}
          <View style={styles.paginationContainer}>
            {(currentUser.profile?.photos || []).map((_, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.paginationDot,
                  index === selectedPhotoIndex && styles.paginationDotActive,
                ]}
                onPress={() => {
                  carouselRef.current?.scrollToIndex({ index, animated: true });
                  setSelectedPhotoIndex(index);
                }}
              />
            ))}
          </View>
        </View>
      </Modal>

      {/* Modal de Histórico de Itens Avulsos */}
      <Modal
        visible={inventoryModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setInventoryModalVisible(false)}
        statusBarTranslucent
      >
        <View style={styles.inventoryModalOverlay}>
          <View style={styles.inventoryModalContainer}>
            {/* Header do Modal */}
            <View style={styles.inventoryModalHeader}>
              <View style={styles.inventoryModalHeaderLeft}>
                <Ionicons name="bag" size={24} color={BotaLoveColors.primary} />
                <Text style={styles.inventoryModalTitle}>Meus Itens Avulsos</Text>
              </View>
              <TouchableOpacity 
                style={styles.inventoryCloseButton}
                onPress={() => setInventoryModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Conteúdo */}
            {loadingInventory ? (
              <View style={styles.inventoryLoading}>
                <ActivityIndicator size="large" color={BotaLoveColors.primary} />
                <Text style={styles.inventoryLoadingText}>Carregando...</Text>
              </View>
            ) : inventoryItems.length === 0 ? (
              <View style={styles.inventoryEmpty}>
                <Ionicons name="bag-outline" size={64} color="#DDD" />
                <Text style={styles.inventoryEmptyTitle}>Nenhum item disponível</Text>
                <Text style={styles.inventoryEmptyText}>
                  Você ainda não possui itens avulsos. Visite nossa loja para adquirir!
                </Text>
                <TouchableOpacity 
                  style={styles.inventoryStoreButton}
                  onPress={() => {
                    setInventoryModalVisible(false);
                    router.push('/store' as any);
                  }}
                >
                  <LinearGradient
                    colors={[BotaLoveColors.primary, BotaLoveColors.primaryDark]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.inventoryStoreButtonGradient}
                  >
                    <Ionicons name="cart" size={20} color="#FFF" />
                    <Text style={styles.inventoryStoreButtonText}>Ir para a Loja</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            ) : (
              <ScrollView style={styles.inventoryContent} showsVerticalScrollIndicator={false}>
                {/* Lista dinâmica de itens do inventário */}
                {inventoryItems.map((item) => (
                  <View key={item.itemId} style={styles.inventoryItem}>
                    <View style={[styles.inventoryIconBg, { backgroundColor: item.bgColor }]}>
                      <Ionicons name={item.icon as any} size={24} color={item.color} />
                    </View>
                    <View style={styles.inventoryItemInfo}>
                      <Text style={styles.inventoryItemName}>{item.itemName}</Text>
                      <Text style={styles.inventoryItemDesc}>Disponível para uso</Text>
                    </View>
                    <View style={[styles.inventoryQuantityBadge, { backgroundColor: item.color }]}>
                      <Text style={styles.inventoryQuantityText}>{item.quantity}</Text>
                    </View>
                  </View>
                ))}

                {/* Info */}
                <View style={styles.inventoryInfoBox}>
                  <Ionicons name="information-circle" size={20} color={BotaLoveColors.primary} />
                  <Text style={styles.inventoryInfoText}>
                    Adquira mais itens na nossa loja para aumentar suas chances de encontrar seu par ideal!
                  </Text>
                </View>

                {/* Botão ir para loja */}
                <TouchableOpacity 
                  style={styles.inventoryStoreButton}
                  onPress={() => {
                    setInventoryModalVisible(false);
                    router.push('/store' as any);
                  }}
                >
                  <LinearGradient
                    colors={[BotaLoveColors.primary, BotaLoveColors.primaryDark]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.inventoryStoreButtonGradient}
                  >
                    <Ionicons name="cart" size={20} color="#FFF" />
                    <Text style={styles.inventoryStoreButtonText}>Ir para a Loja</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      <PremiumModal
        visible={premiumModalVisible}
        onClose={() => setPremiumModalVisible(false)}
      />
    </View>
  );
}

function InfoItem({ icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <View style={styles.infoItem}>
      <View style={styles.infoItemHeader}>
        <Ionicons name={icon} size={18} color={BotaLoveColors.primary} />
        <Text style={styles.infoItemLabel}>{label}</Text>
      </View>
      <Text style={styles.infoItemValue}>{value}</Text>
    </View>
  );
}

function Tag({ text, color }: { text: string; color: string }) {
  return (
    <View style={[styles.tag, { borderColor: color }]}>
      <Text style={[styles.tagText, { color: color }]}>{text}</Text>
    </View>
  );
}

function MenuItem({ icon, title, onPress }: { icon: any; title: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <Ionicons name={icon} size={24} color={BotaLoveColors.secondary} style={styles.menuIcon} />
      <Text style={styles.menuTitle}>{title}</Text>
      <Ionicons name="chevron-forward" size={20} color={BotaLoveColors.neutralMedium} />
    </TouchableOpacity>
  );
}

function MenuItemPro({ 
  icon, 
  iconColor, 
  iconBg, 
  title, 
  subtitle, 
  onPress, 
  showBorder = false 
}: { 
  icon: any; 
  iconColor: string;
  iconBg: string;
  title: string; 
  subtitle: string;
  onPress: () => void;
  showBorder?: boolean;
}) {
  return (
    <TouchableOpacity 
      style={[styles.menuItemPro, showBorder && styles.menuItemProBorder]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.menuIconCircle, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={22} color={iconColor} />
      </View>
      <View style={styles.menuItemProContent}>
        <Text style={styles.menuItemProTitle}>{title}</Text>
        <Text style={styles.menuItemProSubtitle}>{subtitle}</Text>
      </View>
      <View style={styles.menuChevronContainer}>
        <Ionicons name="chevron-forward" size={20} color={BotaLoveColors.neutralMedium} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  
  // ==================== HERO SECTION - ESTILO TINDER ====================
  heroSection: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.55,
    position: 'relative',
  },
  heroSlide: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.55,
  },
  heroImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.55,
  },
  heroPlaceholder: {
    backgroundColor: '#E5E5E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 45,
  },
  heroContent: {
    gap: 8,
  },
  heroNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  heroName: {
    fontSize: isSmallDevice ? 30 : 36,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: -0.5,
  },
  heroAge: {
    fontSize: isSmallDevice ? 26 : 32,
    fontWeight: '400',
    color: '#FFF',
  },
  verifiedBadge: {
    marginLeft: 4,
  },
  heroInfoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  heroInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroInfoText: {
    fontSize: isSmallDevice ? 14 : 16,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  heroTopActions: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 40,
    right: 16,
    flexDirection: 'row',
    gap: 12,
  },
  heroActionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroPremiumBadge: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 40,
    left: 16,
    borderRadius: 20,
    overflow: 'hidden',
  },
  heroPremiumGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  heroPremiumText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  heroPhotoIndicators: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 40,
    left: 70,
    right: 70,
    flexDirection: 'row',
    gap: 4,
  },
  heroPhotoIndicator: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  heroPhotoIndicatorActive: {
    backgroundColor: '#FFF',
  },

  // ==================== ACTION BUTTONS ====================
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    marginTop: -25,
    marginBottom: 16,
    zIndex: 10,
    paddingTop: 8,
  },
  actionButtonSecondary: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  actionButtonPrimary: {
    width: 70,
    height: 70,
    borderRadius: 35,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: BotaLoveColors.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  actionButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonBoostActive: {
    backgroundColor: '#F3E5F5',
    borderWidth: 2,
    borderColor: '#9B59B6',
  },
  boostBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#9B59B6',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 26,
    alignItems: 'center',
  },
  boostBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },

  // ==================== PROFILE COMPLETION ====================
  profileCompletionCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    padding: 18,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  profileCompletionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  profileCompletionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: BotaLoveColors.secondary,
  },
  profileCompletionPercent: {
    fontSize: 16,
    fontWeight: '700',
    color: BotaLoveColors.primary,
  },
  profileCompletionBarBg: {
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },
  profileCompletionBar: {
    height: '100%',
    backgroundColor: BotaLoveColors.primary,
    borderRadius: 4,
  },
  profileCompletionSubtext: {
    fontSize: 13,
    color: BotaLoveColors.neutralDark,
  },

  // ==================== MODERN SECTIONS ====================
  modernSection: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    padding: 18,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  modernSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modernSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: BotaLoveColors.secondary,
  },
  modernSectionAction: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    borderRadius: 14,
  },
  modernSectionActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: BotaLoveColors.primary,
  },
  sectionTitleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionIconBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ==================== PHOTO GRID MODERN ====================
  photoGridModern: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  photoGridItem: {
    width: (SCREEN_WIDTH - 32 - 30) / 3,
    height: (SCREEN_WIDTH - 32 - 30) / 3,
    borderRadius: 12,
    overflow: 'hidden',
  },
  photoGridItemLarge: {
    width: (SCREEN_WIDTH - 32 - 20) / 3 * 2 + 10,
    height: (SCREEN_WIDTH - 32 - 20) / 3 * 2 + 10,
  },
  photoGridImage: {
    width: '100%',
    height: '100%',
  },
  photoMainIndicator: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: BotaLoveColors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  photoMainText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFF',
  },
  addPhotoGridItem: {
    width: (SCREEN_WIDTH - 32 - 30) / 3,
    height: (SCREEN_WIDTH - 32 - 30) / 3,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  addPhotoCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  addPhotoGridText: {
    fontSize: 12,
    fontWeight: '600',
    color: BotaLoveColors.neutralDark,
  },
  emptyPhotosModern: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  emptyPhotosIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  emptyPhotosModernTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: BotaLoveColors.secondary,
    marginBottom: 6,
  },
  emptyPhotosModernSubtext: {
    fontSize: 14,
    color: BotaLoveColors.neutralDark,
  },

  // ==================== BIO ====================
  bioModern: {
    fontSize: 16,
    color: BotaLoveColors.textPrimary,
    lineHeight: 24,
  },
  emptyBioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 16,
    paddingHorizontal: 14,
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  emptyBioText: {
    fontSize: 15,
    color: BotaLoveColors.neutralDark,
  },

  // ==================== INTERESTS MODERN ====================
  interestsModern: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  interestTagModern: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FFF3E0',
    borderWidth: 1,
    borderColor: BotaLoveColors.primary,
  },
  interestTagText: {
    fontSize: 14,
    fontWeight: '600',
    color: BotaLoveColors.primary,
  },
  emptyInterestsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 16,
    paddingHorizontal: 14,
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  emptyInterestsText: {
    fontSize: 15,
    color: BotaLoveColors.neutralDark,
  },

  // ==================== DETAILS CARD ====================
  detailsCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    padding: 18,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  detailsCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: BotaLoveColors.secondary,
    marginBottom: 16,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F8F8F8',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: '45%',
  },
  detailItemText: {
    fontSize: 14,
    fontWeight: '500',
    color: BotaLoveColors.textPrimary,
  },
  addDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    marginTop: 12,
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  addDetailsText: {
    fontSize: 14,
    fontWeight: '600',
    color: BotaLoveColors.primary,
  },

  // ==================== RURAL SECTIONS ====================
  ruralSectionsContainer: {
    gap: 16,
  },
  ruralSubsection: {
    gap: 10,
  },
  ruralSubsectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: BotaLoveColors.neutralDark,
  },
  ruralTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  ruralTag: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1.5,
    backgroundColor: '#E8F5E9',
  },
  ruralTagText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // ==================== PREFERENCES SECTION ====================
  preferencesContainer: {
    gap: 16,
  },
  preferenceSubsection: {
    gap: 10,
  },
  preferenceSubsectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: BotaLoveColors.neutralDark,
  },
  preferenceTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  preferenceTag: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1.5,
  },
  preferenceTagText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // ==================== GOAL TAGS ====================
  goalTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  goalTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FDEAEA',
  },
  goalTagText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E74C3C',
  },

  // ==================== PREMIUM CARD MODERN ====================
  premiumCardModern: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#D4AD63',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  premiumCardGradient: {
    padding: 20,
  },
  premiumCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  premiumCardIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  premiumCardText: {
    flex: 1,
    marginLeft: 14,
  },
  premiumCardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 4,
  },
  premiumCardSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },

  // ==================== LEGACY STYLES (mantidos para compatibilidade) ====================
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: CARD_PADDING,
    paddingBottom: isSmallDevice ? 22 : 28,
  },
  title: {
    fontSize: isSmallDevice ? 28 : 34,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: -0.5,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: isSmallDevice ? 12 : 14,
    paddingVertical: isSmallDevice ? 8 : 10,
    borderRadius: isSmallDevice ? 18 : 22,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  logoutText: {
    fontSize: isSmallDevice ? 13 : 14,
    color: '#FFF',
    fontWeight: '600',
  },
  profileCard: {
    backgroundColor: BotaLoveColors.backgroundWhite,
    padding: isSmallDevice ? 26 : 36,
    alignItems: 'center',
    marginBottom: isSmallDevice ? 10 : 14,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: isSmallDevice ? 18 : 24,
  },
  avatarRing: {
    padding: isSmallDevice ? 4 : 5,
    borderRadius: isSmallDevice ? 75 : 90,
    backgroundColor: '#FFF',
    ...Platform.select({
      ios: {
        shadowColor: BotaLoveColors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  avatar: {
    width: isSmallDevice ? 130 : 160,
    height: isSmallDevice ? 130 : 160,
    borderRadius: isSmallDevice ? 65 : 80,
    borderWidth: isSmallDevice ? 4 : 5,
    borderColor: BotaLoveColors.primary,
  },
  avatarPlaceholder: {
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  premiumBadgeAvatar: {
    position: 'absolute',
    bottom: isSmallDevice ? 4 : 6,
    right: isSmallDevice ? 4 : 6,
    borderRadius: isSmallDevice ? 22 : 26,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#D4AD63',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  premiumBadgeGradient: {
    width: isSmallDevice ? 42 : 52,
    height: isSmallDevice ? 42 : 52,
    borderRadius: isSmallDevice ? 21 : 26,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: isSmallDevice ? 3 : 4,
    borderColor: '#FFF',
  },
  name: {
    fontSize: isSmallDevice ? 26 : 32,
    fontWeight: '800',
    color: BotaLoveColors.secondary,
    marginBottom: isSmallDevice ? 10 : 14,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: isSmallDevice ? 7 : 9,
    paddingHorizontal: isSmallDevice ? 18 : 22,
    paddingVertical: isSmallDevice ? 9 : 11,
    borderRadius: isSmallDevice ? 22 : 26,
    marginBottom: isSmallDevice ? 18 : 22,
    ...Platform.select({
      ios: {
        shadowColor: '#D4AD63',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.35,
        shadowRadius: 6,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  premiumText: {
    fontSize: isSmallDevice ? 14 : 16,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 0.8,
  },
  profileInfoContainer: {
    width: '100%',
    gap: isSmallDevice ? 10 : 14,
    marginBottom: isSmallDevice ? 22 : 28,
  },
  infoRowEnhanced: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: isSmallDevice ? 10 : 14,
    paddingVertical: isSmallDevice ? 12 : 14,
    paddingHorizontal: isSmallDevice ? 14 : 18,
    backgroundColor: '#F9F9F9',
    borderRadius: isSmallDevice ? 14 : 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  iconCircle: {
    width: isSmallDevice ? 34 : 40,
    height: isSmallDevice ? 34 : 40,
    borderRadius: isSmallDevice ? 17 : 20,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: BotaLoveColors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  occupationEnhanced: {
    flex: 1,
    fontSize: isSmallDevice ? 15 : 17,
    color: BotaLoveColors.textPrimary,
    fontWeight: '600',
  },
  locationEnhanced: {
    flex: 1,
    fontSize: isSmallDevice ? 14 : 16,
    color: BotaLoveColors.neutralDark,
    fontWeight: '500',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  occupation: {
    fontSize: 16,
    color: BotaLoveColors.textPrimary,
    fontWeight: '500',
  },
  location: {
    fontSize: 15,
    color: BotaLoveColors.neutralDark,
    fontWeight: '500',
  },
  editButton: {
    width: '100%',
    borderRadius: isSmallDevice ? 28 : 34,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: BotaLoveColors.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  editButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: isSmallDevice ? 10 : 12,
    paddingVertical: isSmallDevice ? 16 : 18,
  },
  editButtonText: {
    fontSize: isSmallDevice ? 16 : 18,
    fontWeight: '700',
    color: BotaLoveColors.secondary,
    letterSpacing: -0.2,
  },
  section: {
    backgroundColor: BotaLoveColors.backgroundWhite,
    padding: isSmallDevice ? 18 : 24,
    marginBottom: isSmallDevice ? 10 : 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: isSmallDevice ? 10 : 12,
    marginBottom: isSmallDevice ? 16 : 20,
  },
  sectionTitle: {
    fontSize: isSmallDevice ? 18 : 21,
    fontWeight: '700',
    color: BotaLoveColors.secondary,
    letterSpacing: -0.2,
  },
  photosGrid: {
    flexDirection: 'row',
    gap: isSmallDevice ? 10 : 14,
  },
  emptyPhotosContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    borderStyle: 'dashed',
  },
  emptyPhotosText: {
    fontSize: 16,
    color: BotaLoveColors.neutralMedium,
    marginTop: 12,
    marginBottom: 16,
  },
  addPhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BotaLoveColors.primary,
  },
  addPhotoButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: BotaLoveColors.primary,
  },
  emptyStateContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  emptyStateText: {
    fontSize: 14,
    color: BotaLoveColors.neutralMedium,
    marginBottom: 10,
  },
  emptyStateButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BotaLoveColors.primary,
  },
  emptyStateButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: BotaLoveColors.primary,
  },
  emptyStateSectionContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  emptyStateSectionText: {
    fontSize: 16,
    fontWeight: '600',
    color: BotaLoveColors.secondary,
    marginTop: 12,
    textAlign: 'center',
  },
  emptyStateSectionSubtext: {
    fontSize: 13,
    color: BotaLoveColors.neutralMedium,
    marginTop: 6,
    marginBottom: 16,
    textAlign: 'center',
    lineHeight: 18,
  },
  completeSectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: BotaLoveColors.primary,
    borderRadius: 20,
  },
  completeSectionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  photoBox: {
    width: isSmallDevice ? 105 : 130,
    height: isSmallDevice ? 140 : 175,
    borderRadius: isSmallDevice ? 14 : 18,
    position: 'relative',
    overflow: 'hidden',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  mainPhotoBadge: {
    position: 'absolute',
    top: isSmallDevice ? 7 : 10,
    left: isSmallDevice ? 7 : 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: BotaLoveColors.primary,
    paddingHorizontal: isSmallDevice ? 9 : 11,
    paddingVertical: isSmallDevice ? 4 : 5,
    borderRadius: isSmallDevice ? 12 : 14,
    ...Platform.select({
      ios: {
        shadowColor: BotaLoveColors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  mainPhotoText: {
    color: '#FFF',
    fontSize: isSmallDevice ? 10 : 11,
    fontWeight: '700',
  },
  bio: {
    fontSize: isSmallDevice ? 14 : 16,
    color: BotaLoveColors.textPrimary,
    lineHeight: isSmallDevice ? 22 : 26,
    fontWeight: '500',
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: isSmallDevice ? 9 : 12,
  },
  interestTag: {
    backgroundColor: '#FFF9E6',
    paddingHorizontal: isSmallDevice ? 14 : 18,
    paddingVertical: isSmallDevice ? 10 : 12,
    borderRadius: isSmallDevice ? 18 : 22,
    borderWidth: 1.5,
    borderColor: BotaLoveColors.primary,
  },
  interestText: {
    fontSize: isSmallDevice ? 13 : 15,
    color: BotaLoveColors.secondary,
    fontWeight: '600',
  },
  premiumSection: {
    marginBottom: isSmallDevice ? 10 : 14,
    marginHorizontal: isSmallDevice ? 12 : 16,
    borderRadius: isSmallDevice ? 20 : 24,
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
  premiumGradient: {
    padding: isSmallDevice ? 26 : 32,
    alignItems: 'center',
  },
  premiumIconCircle: {
    width: isSmallDevice ? 58 : 70,
    height: isSmallDevice ? 58 : 70,
    borderRadius: isSmallDevice ? 29 : 35,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: isSmallDevice ? 14 : 18,
  },
  premiumTitle: {
    fontSize: isSmallDevice ? 26 : 30,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: isSmallDevice ? 8 : 10,
    letterSpacing: -0.5,
  },
  premiumDescription: {
    fontSize: isSmallDevice ? 14 : 16,
    color: '#FFF',
    textAlign: 'center',
    marginBottom: isSmallDevice ? 18 : 22,
    opacity: 0.95,
    fontWeight: '500',
    lineHeight: isSmallDevice ? 20 : 24,
  },
  premiumCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: isSmallDevice ? 8 : 10,
    backgroundColor: '#FFF',
    paddingHorizontal: isSmallDevice ? 26 : 32,
    paddingVertical: isSmallDevice ? 12 : 14,
    borderRadius: isSmallDevice ? 24 : 28,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  premiumCTAText: {
    fontSize: isSmallDevice ? 15 : 17,
    fontWeight: '700',
    color: BotaLoveColors.secondary,
  },
  menu: {
    backgroundColor: BotaLoveColors.backgroundWhite,
    marginBottom: isSmallDevice ? 10 : 14,
    borderRadius: isSmallDevice ? 16 : 20,
    marginHorizontal: isSmallDevice ? 12 : 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  menuContainer: {
    marginHorizontal: isSmallDevice ? 12 : 16,
    marginBottom: isSmallDevice ? 10 : 14,
  },
  menuSectionTitle: {
    fontSize: isSmallDevice ? 13 : 14,
    fontWeight: '600',
    color: BotaLoveColors.neutralDark,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: isSmallDevice ? 10 : 12,
    marginTop: isSmallDevice ? 8 : 10,
    marginLeft: 4,
  },
  menuCard: {
    backgroundColor: BotaLoveColors.backgroundWhite,
    borderRadius: isSmallDevice ? 16 : 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  menuItemPro: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: isSmallDevice ? 14 : 16,
    paddingHorizontal: isSmallDevice ? 14 : 18,
    backgroundColor: BotaLoveColors.backgroundWhite,
  },
  menuItemProBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuIconCircle: {
    width: isSmallDevice ? 44 : 48,
    height: isSmallDevice ? 44 : 48,
    borderRadius: isSmallDevice ? 12 : 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemProContent: {
    flex: 1,
    marginLeft: isSmallDevice ? 12 : 16,
  },
  menuItemProTitle: {
    fontSize: isSmallDevice ? 15 : 16,
    fontWeight: '600',
    color: BotaLoveColors.secondary,
    marginBottom: 2,
  },
  menuItemProSubtitle: {
    fontSize: isSmallDevice ? 12 : 13,
    color: BotaLoveColors.neutralDark,
    fontWeight: '400',
  },
  menuChevronContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BotaLoveColors.backgroundWhite,
    padding: isSmallDevice ? 16 : 18,
    borderRadius: isSmallDevice ? 14 : 16,
    marginBottom: isSmallDevice ? 10 : 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  menuIcon: {
    marginRight: isSmallDevice ? 12 : 16,
  },
  menuIconContainer: {
    width: isSmallDevice ? 44 : 48,
    height: isSmallDevice ? 44 : 48,
    borderRadius: isSmallDevice ? 22 : 24,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuTextContainer: {
    flex: 1,
    marginLeft: isSmallDevice ? 12 : 14,
  },
  menuTitle: {
    fontSize: isSmallDevice ? 15 : 17,
    fontWeight: '700',
    color: BotaLoveColors.secondary,
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: isSmallDevice ? 12 : 13,
    color: BotaLoveColors.neutralDark,
  },
  bottomSpacer: {
    height: 50,
  },
  footer: {
    padding: isSmallDevice ? 26 : 34,
    alignItems: 'center',
  },
  footerText: {
    fontSize: isSmallDevice ? 12 : 14,
    color: BotaLoveColors.neutralDark,
    fontWeight: '600',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: isSmallDevice ? 11 : 13,
    color: BotaLoveColors.neutralMedium,
    fontWeight: '500',
  },
  categorySection: {
    backgroundColor: BotaLoveColors.backgroundWhite,
    marginBottom: isSmallDevice ? 10 : 14,
    marginHorizontal: isSmallDevice ? 12 : 16,
    borderRadius: isSmallDevice ? 16 : 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  categorySectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: isSmallDevice ? 10 : 14,
    padding: isSmallDevice ? 16 : 20,
  },
  categorySectionTitle: {
    fontSize: isSmallDevice ? 18 : 21,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: -0.2,
  },
  infoGrid: {
    padding: isSmallDevice ? 14 : 18,
  },
  infoItem: {
    paddingVertical: isSmallDevice ? 12 : 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.04)',
  },
  infoItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: isSmallDevice ? 7 : 9,
    marginBottom: isSmallDevice ? 5 : 7,
  },
  infoItemLabel: {
    fontSize: isSmallDevice ? 12 : 14,
    color: BotaLoveColors.neutralDark,
    fontWeight: '600',
  },
  infoItemValue: {
    fontSize: isSmallDevice ? 14 : 16,
    color: BotaLoveColors.textPrimary,
    fontWeight: '500',
    marginLeft: isSmallDevice ? 24 : 28,
  },
  subsectionContainer: {
    padding: isSmallDevice ? 14 : 18,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.04)',
  },
  subsectionTitle: {
    fontSize: isSmallDevice ? 14 : 16,
    fontWeight: '700',
    color: BotaLoveColors.secondary,
    marginBottom: isSmallDevice ? 10 : 14,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: isSmallDevice ? 8 : 11,
  },
  tag: {
    paddingHorizontal: isSmallDevice ? 12 : 16,
    paddingVertical: isSmallDevice ? 7 : 9,
    borderRadius: isSmallDevice ? 14 : 18,
    borderWidth: 1.5,
    backgroundColor: '#FAFAFA',
  },
  tagText: {
    fontSize: isSmallDevice ? 12 : 14,
    fontWeight: '600',
  },
  // Photo overlay
  photoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: isSmallDevice ? 16 : 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: isSmallDevice ? 12 : 16,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  modalCloseButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCounter: {
    fontSize: isSmallDevice ? 16 : 18,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  carouselSlide: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  carouselImage: {
    width: SCREEN_WIDTH - 20,
    height: '100%',
    borderRadius: isSmallDevice ? 12 : 16,
  },
  carouselMainBadge: {
    position: 'absolute',
    bottom: isSmallDevice ? 20 : 30,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: BotaLoveColors.primary,
    paddingHorizontal: isSmallDevice ? 14 : 18,
    paddingVertical: isSmallDevice ? 8 : 10,
    borderRadius: isSmallDevice ? 20 : 24,
    ...Platform.select({
      ios: {
        shadowColor: BotaLoveColors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  carouselMainText: {
    fontSize: isSmallDevice ? 13 : 15,
    fontWeight: '700',
    color: '#FFF',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: isSmallDevice ? 20 : 30,
    gap: isSmallDevice ? 8 : 10,
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 40 : 30,
    left: 0,
    right: 0,
  },
  paginationDot: {
    width: isSmallDevice ? 8 : 10,
    height: isSmallDevice ? 8 : 10,
    borderRadius: isSmallDevice ? 4 : 5,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  paginationDotActive: {
    width: isSmallDevice ? 24 : 30,
    backgroundColor: BotaLoveColors.primary,
  },
  // Estilos para Produtor
  producerLabel: {
    fontSize: isSmallDevice ? 14 : 16,
    color: BotaLoveColors.primary,
    fontWeight: '600',
    marginTop: 4,
  },
  
  // ==================== MODAL DE INVENTÁRIO ====================
  inventoryModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  inventoryModalContainer: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: SCREEN_HEIGHT * 0.7,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  inventoryModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  inventoryModalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  inventoryModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  inventoryCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inventoryLoading: {
    paddingVertical: 40,
    alignItems: 'center',
    gap: 12,
  },
  inventoryLoadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  inventoryEmpty: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  inventoryEmptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  inventoryEmptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  inventoryContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  inventoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  inventoryIconBg: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inventoryItemInfo: {
    flex: 1,
    marginLeft: 14,
  },
  inventoryItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  inventoryItemDesc: {
    fontSize: 13,
    color: '#6B7280',
  },
  inventoryQuantityBadge: {
    backgroundColor: BotaLoveColors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    minWidth: 44,
    alignItems: 'center',
  },
  inventoryQuantityText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  inventoryInfoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF7E8',
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
    marginBottom: 16,
    gap: 10,
  },
  inventoryInfoText: {
    flex: 1,
    fontSize: 13,
    color: '#92400E',
    lineHeight: 18,
  },
  inventoryStoreButton: {
    marginBottom: 10,
  },
  inventoryStoreButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
  },
  inventoryStoreButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
});
