import MatchAnimation from '@/components/MatchAnimation';
import PremiumModal from '@/components/PremiumModal';
import SuperLikeAnimation from '@/components/SuperLikeAnimation';
import { BotaLoveColors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { MOCK_USERS, User } from '@/data/mockData';
import {
    canViewProfile,
    getRemainingViews,
    getUserPlan,
    incrementViewCount,
    UPGRADE_MESSAGES,
} from '@/data/viewLimitsService';
import { sendMisterioMessage } from '@/firebase/chatService';
import { DiscoveryUser, getDiscoveryFeed } from '@/firebase/discoveryService';
import { likeUser, passUser, sendCorreioDaRoca } from '@/firebase/matchService';
import { useInventoryItemByName } from '@/firebase/planSubscriptionService';
import { DiscoverySettings } from '@/firebase/types';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Redirect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    Image,
    Modal,
    PanResponder,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

// Ícones PNG das funcionalidades
const ICONS = {
  abrePorteira: require('@/assets/images/icons/abre-porteira.png'),
  fechaPorteira: require('@/assets/images/icons/fecha-porteira.png'),
  superAgroUnlocked: require('@/assets/images/icons/super-agro-unlocked.png'),
  superAgroBlock: require('@/assets/images/icons/super-agro-block.png'),
  correioUnlocked: require('@/assets/images/icons/correio-da-roça-unlocked.png'),
  correioBlock: require('@/assets/images/icons/correio-da-roça-block.png'),
  retornoUnlocked: require('@/assets/images/icons/retorno-da-estrada-livre-unlocked.png'),
  retornoBlock: require('@/assets/images/icons/retorno-da-estrada-livre-block.png'),
  misterioUnlocked: require('@/assets/images/icons/misterio-do-campo-unlocked.png'),
  misterioBlock: require('@/assets/images/icons/misterio-do-campo-block.png'),
};

const { width, height } = Dimensions.get('window');
const SWIPE_THRESHOLD = width * 0.25;
const CARD_HEIGHT = height * 0.82;

// Função para converter DiscoveryUser para User (compatibilidade)
const convertDiscoveryUserToUser = (discoveryUser: DiscoveryUser): User => ({
  id: discoveryUser.id,
  name: discoveryUser.name,
  age: discoveryUser.age,
  city: discoveryUser.city,
  state: discoveryUser.state,
  bio: discoveryUser.bio,
  photos: discoveryUser.photos,
  interests: discoveryUser.interests || [],
  occupation: discoveryUser.occupation,
  hasPremium: false, // Usuários reais não têm essa flag visível
  distance: discoveryUser.distance,
  likedYou: discoveryUser.hasLikedMe,
  isAgroUser: discoveryUser.isAgroUser,
  relationshipGoals: discoveryUser.relationshipGoals as any,
});

export default function HomeScreen() {
  const router = useRouter();
  const { currentUser, hasPremium, userType } = useAuth();
  
  // Redireciona produtores para a tela de eventos
  if (userType === 'producer') {
    return <Redirect href="/(tabs)/events" />;
  }
  
  // Estados principais
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [premiumModalVisible, setPremiumModalVisible] = useState(false);
  const [premiumFeature, setPremiumFeature] = useState('');
  const [showSuperLikeAnim, setShowSuperLikeAnim] = useState(false);
  const [showMatchAnim, setShowMatchAnim] = useState(false);
  const [matchedUser, setMatchedUser] = useState<User | null>(null);
  const [matchChatId, setMatchChatId] = useState<string | null>(null);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [showCorreioModal, setShowCorreioModal] = useState(false);
  const [correioMessage, setCorreioMessage] = useState('');
  const [sendingCorreio, setSendingCorreio] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  
  // Estados do Mistério do Campo
  const [showMisterioModal, setShowMisterioModal] = useState(false);
  const [misterioMessage, setMisterioMessage] = useState('');
  const [sendingMisterio, setSendingMisterio] = useState(false);
  
  const userPlan = getUserPlan(hasPremium);
  const remainingViews = getRemainingViews(currentUser?.id || 'user-0', userPlan);

  const position = useRef(new Animated.ValueXY()).current;
  const swipeIconOpacity = useRef(new Animated.Value(0)).current;

  // Animações dos botões
  const buttonScale0 = useRef(new Animated.Value(0)).current;
  const buttonScale1 = useRef(new Animated.Value(0)).current;
  const buttonScale2 = useRef(new Animated.Value(0)).current;
  const buttonScale3 = useRef(new Animated.Value(0)).current;
  const buttonScale4 = useRef(new Animated.Value(0)).current;
  const buttonTranslateY = useRef(new Animated.Value(100)).current;
  const buttonRotate = useRef(new Animated.Value(0)).current;

  // Função para carregar usuários do Firebase + Mock como fallback
  const loadDiscoveryUsers = useCallback(async () => {
    setIsLoadingUsers(true);
    
    try {
      // Configurações de descoberta do usuário atual ou padrão
      const discoverySettings: DiscoverySettings = currentUser?.discoverySettings || {
        distanceRadius: 100, // 100km padrão
        ageRange: { min: 18, max: 60 },
        genderInterest: 'both',
        showOutsideDistance: true,
        showOutsideAgeRange: true,
        onlyVerified: false,
        onlyWithPhotos: false,
        showMe: true,
      };
      
      // Buscar usuários reais do Firebase
      let realUsers: User[] = [];
      
      if (currentUser?.id) {
        console.log('🔍 Buscando usuários reais do Firebase...');
        const discoveryUsers = await getDiscoveryFeed(
          currentUser.id,
          discoverySettings,
          50 // máximo de resultados
        );
        
        // Converter para o tipo User
        realUsers = discoveryUsers.map(convertDiscoveryUserToUser);
        console.log(`✅ ${realUsers.length} usuários reais encontrados`);
      }
      
      // Obter usuários mock (excluindo o usuário atual)
      const mockUsers = MOCK_USERS.filter(
        (u) => u.id !== currentUser?.id && u.id !== 'user-free'
      );
      
      // Combinar: usuários reais primeiro, depois mock
      // Remover mocks que tenham o mesmo ID de usuários reais (evitar duplicatas)
      const realUserIds = new Set(realUsers.map(u => u.id));
      const filteredMockUsers = mockUsers.filter(u => !realUserIds.has(u.id));
      
      const combinedUsers = [...realUsers, ...filteredMockUsers];
      
      console.log(`📊 Total de usuários para exibir: ${combinedUsers.length} (${realUsers.length} reais + ${filteredMockUsers.length} mock)`);
      
      setUsers(combinedUsers);
      setCurrentIndex(0);
    } catch (error) {
      console.error('❌ Erro ao carregar usuários:', error);
      // Em caso de erro, usar apenas mock
      const mockUsers = MOCK_USERS.filter(
        (u) => u.id !== currentUser?.id && u.id !== 'user-free'
      );
      setUsers(mockUsers);
      setCurrentIndex(0);
    } finally {
      setIsLoadingUsers(false);
    }
  }, [currentUser]);

  // Carregar usuários quando o componente montar ou currentUser mudar
  useEffect(() => {
    loadDiscoveryUsers();
  }, [loadDiscoveryUsers]);

  useEffect(() => {
    // Animação de entrada dos botões
    Animated.stagger(80, [
      Animated.parallel([
        Animated.spring(buttonTranslateY, {
          toValue: 0,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.spring(buttonScale0, {
          toValue: 1,
          tension: 50,
          friction: 7,
          delay: 0,
          useNativeDriver: true,
        }),
      ]),
      Animated.spring(buttonScale1, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.spring(buttonScale2, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.spring(buttonScale3, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.spring(buttonScale4, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const rotate = position.x.interpolate({
    inputRange: [-width / 2, 0, width / 2],
    outputRange: ['-10deg', '0deg', '10deg'],
    extrapolate: 'clamp',
  });

  const likeOpacity = position.x.interpolate({
    inputRange: [0, SWIPE_THRESHOLD],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const dislikeOpacity = position.x.interpolate({
    inputRange: [-SWIPE_THRESHOLD, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  // Variáveis para detectar tap vs swipe
  const touchStart = useRef({ x: 0, y: 0, time: 0 });

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => {
      touchStart.current = {
        x: evt.nativeEvent.pageX,
        y: evt.nativeEvent.pageY,
        time: Date.now(),
      };
    },
    onPanResponderMove: (_, gesture) => {
      position.setValue({ x: gesture.dx, y: gesture.dy });
    },
    onPanResponderRelease: (evt, gesture) => {
      const touchEnd = {
        x: evt.nativeEvent.pageX,
        y: evt.nativeEvent.pageY,
        time: Date.now(),
      };
      
      const dx = Math.abs(touchEnd.x - touchStart.current.x);
      const dy = Math.abs(touchEnd.y - touchStart.current.y);
      const duration = touchEnd.time - touchStart.current.time;
      
      // Se foi um toque rápido e sem movimento significativo = TAP
      if (dx < 10 && dy < 10 && duration < 300) {
        handleCardTap();
        return;
      }
      
      // Caso contrário, processa como swipe
      if (gesture.dx > SWIPE_THRESHOLD) {
        forceSwipe('right');
      } else if (gesture.dx < -SWIPE_THRESHOLD) {
        forceSwipe('left');
      } else {
        resetPosition();
      }
    },
  });

  const handleCardTap = () => {
    const user = users[currentIndex];
    if (user) {
      router.push(`/profile-detail/${user.id}`);
    }
  };

  const forceSwipe = (direction: 'left' | 'right') => {
    const x = direction === 'right' ? width + 100 : -width - 100;
    Animated.timing(position, {
      toValue: { x, y: 0 },
      duration: 250,
      useNativeDriver: false,
    }).start(() => onSwipeComplete(direction));
  };

  const onSwipeComplete = async (direction: 'left' | 'right') => {
    const action = direction === 'right' ? 'like' : 'dislike';
    const swipedUser = users[currentIndex];
    console.log(`${action} on ${swipedUser?.name}`);
    
    // Verificar limite de visualizações antes de avançar
    if (!canViewProfile(currentUser?.id || 'user-0', userPlan)) {
      setShowLimitModal(true);
      position.setValue({ x: 0, y: 0 });
      return;
    }
    
    // Incrementar contador de visualizações
    incrementViewCount(currentUser?.id || 'user-0', userPlan);
    
    // Chamar Firebase para registrar like ou pass
    if (currentUser?.id && swipedUser?.id) {
      try {
        if (direction === 'right') {
          // Like - verificar se deu match
          console.log(`💖 Enviando like: ${currentUser.id} -> ${swipedUser.id}`);
          const result = await likeUser(currentUser.id, swipedUser.id, false);
          console.log('💖 Resultado do like:', result);
          if (result.isMatch && result.chatId) {
            setMatchedUser(swipedUser);
            setMatchChatId(result.chatId);
            setShowMatchAnim(true);
          }
        } else {
          // Pass
          console.log(`👎 Enviando pass: ${currentUser.id} -> ${swipedUser.id}`);
          await passUser(currentUser.id, swipedUser.id);
        }
      } catch (error) {
        console.error('❌ Erro ao processar swipe:', error);
      }
    }
    
    position.setValue({ x: 0, y: 0 });
    setCurrentIndex(currentIndex + 1);
  };

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: false,
    }).start();
  };

  const handleLike = () => forceSwipe('right');
  const handleDislike = () => forceSwipe('left');

  const handleSuperLike = async () => {
    if (!hasPremium) {
      setPremiumFeature('Super Like');
      setPremiumModalVisible(true);
      return;
    }
    
    const superLikedUser = users[currentIndex];
    
    // Verificar e consumir item Super Agro do inventário
    if (currentUser?.id) {
      const consumeResult = await useInventoryItemByName(currentUser.id, 'Super Agro', 1);
      if (!consumeResult.success) {
        // Se não tem item, mostrar modal premium para comprar
        console.log('❌ Sem Super Agro disponível:', consumeResult.error);
        setPremiumFeature('Super Agro');
        setPremiumModalVisible(true);
        return;
      }
      console.log(`✅ Super Agro usado! Restante: ${consumeResult.remaining}`);
    }
    
    setShowSuperLikeAnim(true);
    
    // Chamar Firebase com Super Like
    if (currentUser?.id && superLikedUser?.id) {
      try {
        const result = await likeUser(currentUser.id, superLikedUser.id, true);
        
        setTimeout(() => {
          setShowSuperLikeAnim(false);
          if (result.isMatch && result.chatId) {
            setMatchedUser(superLikedUser);
            setMatchChatId(result.chatId);
            setShowMatchAnim(true);
          }
          position.setValue({ x: 0, y: 0 });
          setCurrentIndex(currentIndex + 1);
        }, 2000);
      } catch (error) {
        console.error('Erro ao dar super like:', error);
        setShowSuperLikeAnim(false);
        position.setValue({ x: 0, y: 0 });
        setCurrentIndex(currentIndex + 1);
      }
    } else {
      setTimeout(() => {
        setShowSuperLikeAnim(false);
        position.setValue({ x: 0, y: 0 });
        setCurrentIndex(currentIndex + 1);
      }, 2000);
    }
  };

  const handleBoost = () => {
    if (!hasPremium) {
      setPremiumFeature('Correio da Roça');
      setPremiumModalVisible(true);
      return;
    }
    setCorreioMessage('');
    setShowCorreioModal(true);
  };

  const handleSendCorreio = async () => {
    if (!currentUser?.id || !users[currentIndex]) return;
    
    const targetUser = users[currentIndex];
    
    if (!correioMessage.trim()) {
      Alert.alert('Atenção', 'Digite uma mensagem para enviar!');
      return;
    }
    
    setSendingCorreio(true);
    
    try {
      // Consumir item Correio da Roça do inventário
      const consumeResult = await useInventoryItemByName(currentUser.id, 'Correio da Roça', 1);
      if (!consumeResult.success) {
        console.log('❌ Sem Correio da Roça disponível:', consumeResult.error);
        Alert.alert(
          'Correio da Roça',
          'Você não tem Correio da Roça disponível. Deseja comprar mais?',
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Comprar', onPress: () => router.push('/store') },
          ]
        );
        setSendingCorreio(false);
        return;
      }
      
      console.log(`✅ Correio da Roça usado! Restante: ${consumeResult.remaining}`);
      
      // Enviar correio
      const result = await sendCorreioDaRoca(currentUser.id, targetUser.id, correioMessage.trim());
      
      if (result.success) {
        Alert.alert(
          '📬 Correio Enviado!',
          `Sua mensagem foi enviada para ${targetUser.name}. Aguarde a resposta!`
        );
        setShowCorreioModal(false);
        setCorreioMessage('');
        // Avançar para o próximo perfil
        setCurrentIndex(currentIndex + 1);
      } else {
        Alert.alert('Erro', result.error || 'Não foi possível enviar o correio');
      }
    } catch (error) {
      console.error('Erro ao enviar correio:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao enviar a mensagem');
    } finally {
      setSendingCorreio(false);
    }
  };

  // =========================================================================
  // 🎭 MISTÉRIO DO CAMPO - Mensagem anônima com foto desfocada
  // =========================================================================
  
  const handleOpenMisterio = () => {
    if (!hasPremium) {
      setPremiumFeature('Mistério do Campo');
      setPremiumModalVisible(true);
      return;
    }
    setMisterioMessage('');
    setShowMisterioModal(true);
  };

  const handleSendMisterio = async () => {
    if (!currentUser?.id || !users[currentIndex]) return;
    
    const targetUser = users[currentIndex];
    
    if (!misterioMessage.trim()) {
      Alert.alert('Atenção', 'Digite uma mensagem misteriosa para enviar!');
      return;
    }
    
    setSendingMisterio(true);
    
    try {
      // Consumir item Mistério do Campo do inventário
      const consumeResult = await useInventoryItemByName(currentUser.id, 'Mistério do Campo', 1);
      if (!consumeResult.success) {
        console.log('❌ Sem Mistério do Campo disponível:', consumeResult.error);
        Alert.alert(
          'Mistério do Campo',
          'Você não tem Mistério do Campo disponível. Deseja comprar mais?',
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Comprar', onPress: () => router.push('/store') },
          ]
        );
        setSendingMisterio(false);
        return;
      }
      
      console.log(`✅ Mistério do Campo usado! Restante: ${consumeResult.remaining}`);
      
      // Enviar mistério
      const result = await sendMisterioMessage({
        senderId: currentUser.id,
        recipientId: targetUser.id,
        message: misterioMessage.trim(),
        senderName: currentUser.profile?.name || 'Alguém',
        senderPhotoUrl: currentUser.profile?.photos?.[0] || '',
      });
      
      if (result.success) {
        Alert.alert(
          '🎭 Mistério Enviado!',
          `Sua mensagem misteriosa foi enviada para ${targetUser.name}!\n\nSua identidade será revelada em 24h ou se ela pagar R$1,99 para descobrir antes.`
        );
        setShowMisterioModal(false);
        setMisterioMessage('');
        // Avançar para o próximo perfil
        setCurrentIndex(currentIndex + 1);
      } else {
        Alert.alert('Erro', result.error || 'Não foi possível enviar a mensagem misteriosa');
      }
    } catch (error) {
      console.error('Erro ao enviar mistério:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao enviar a mensagem');
    } finally {
      setSendingMisterio(false);
    }
  };

  const handleUndo = async () => {
    // Retorno da Estrada Livre - Volta para o perfil anterior
    if (!hasPremium) {
      setPremiumFeature('Retorno da Estrada Livre');
      setPremiumModalVisible(true);
      return;
    }
    
    // Só pode voltar se não estiver no primeiro perfil
    if (currentIndex > 0) {
      // Verificar e consumir item Voltar Perfil do inventário
      if (currentUser?.id) {
        const consumeResult = await useInventoryItemByName(currentUser.id, 'Voltar Perfil', 1);
        if (!consumeResult.success) {
          console.log('❌ Sem Voltar Perfil disponível:', consumeResult.error);
          setPremiumFeature('Voltar Perfil');
          setPremiumModalVisible(true);
          return;
        }
        console.log(`✅ Voltar Perfil usado! Restante: ${consumeResult.remaining}`);
      }
      
      setCurrentIndex(currentIndex - 1);
      position.setValue({ x: 0, y: 0 });
    }
  };

  const renderCard = (user: User, index: number) => {
    if (index < currentIndex) return null;
    if (index === currentIndex) {
      return (
        <Animated.View
          {...panResponder.panHandlers}
          style={[
            styles.card,
            {
              transform: [
                { translateX: position.x },
                { translateY: position.y },
                { rotate },
              ],
            },
          ]}
          key={user.id}
        >
          {/* Swipe Indicator - Like (Right) - Porteira Aberta */}
          <Animated.View
            style={[
              styles.swipeIndicator,
              styles.swipeIndicatorRight,
              { opacity: likeOpacity },
            ]}
          >
            <View style={styles.swipeIconContainer}>
              <View style={styles.swipeIconCircle}>
                <Image source={ICONS.abrePorteira} style={styles.swipeIconImage} />
              </View>
              <Text style={styles.swipeText}>ABRIR PORTEIRA</Text>
              <Text style={styles.swipeSubtext}>Bem-vindo(a)!</Text>
            </View>
          </Animated.View>

          {/* Swipe Indicator - Dislike (Left) - Porteira Fechada */}
          <Animated.View
            style={[
              styles.swipeIndicator,
              styles.swipeIndicatorLeft,
              { opacity: dislikeOpacity },
            ]}
          >
            <View style={styles.swipeIconContainer}>
              <View style={styles.swipeIconCircle}>
                <Image source={ICONS.fechaPorteira} style={styles.swipeIconImage} />
              </View>
              <Text style={styles.swipeText}>FECHAR PORTEIRA</Text>
              <Text style={styles.swipeSubtext}>Trilhas diferentes</Text>
            </View>
          </Animated.View>

          <Image source={{ uri: user.photos[0] }} style={styles.cardImage} />
          
          {/* Gradiente na parte inferior */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.85)']}
            style={styles.cardGradient}
            pointerEvents="none"
          />

          {/* Informações do card */}
          <View style={styles.cardInfo} pointerEvents="none">
            <View style={styles.cardNameRow}>
              <Text style={styles.cardName}>
                {user.name}, {user.age}
              </Text>
              {/* Selo Rural - Usuário Agro */}
              {user.isAgroUser && (
                <View style={styles.seloRuralBadge}>
                  <Ionicons name="leaf" size={12} color="#FFF" />
                  <Text style={styles.seloRuralText}>Agro</Text>
                </View>
              )}
              {user.likedYou && (
                <View style={styles.likedYouBadge}>
                  <Ionicons name="heart" size={14} color="#FFF" />
                  <Text style={styles.likedYouText}>Curtiu você</Text>
                </View>
              )}
            </View>
            
            <View style={styles.cardLocationRow}>
              <Ionicons name="location" size={16} color={BotaLoveColors.primary} />
              <Text style={styles.cardCity}>
                {user.city}, {user.state}
                {user.distance && ` · ${user.distance} km`}
              </Text>
            </View>

            <View style={styles.cardOccupationRow}>
              <Ionicons name="briefcase" size={15} color={BotaLoveColors.primary} />
              <Text style={styles.cardOccupation}>{user.occupation}</Text>
            </View>

            <Text style={styles.cardBio} numberOfLines={2}>
              {user.bio}
            </Text>

            <View style={styles.interestsContainer}>
              {user.interests.slice(0, 3).map((interest, i) => (
                <View key={i} style={styles.interestTag}>
                  <Text style={styles.interestText}>{interest}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Indicador de fotos */}
          {user.photos.length > 1 && (
            <View style={styles.photoIndicator}>
              <Ionicons name="images" size={16} color="#FFF" />
              <Text style={styles.photoCount}>{user.photos.length}</Text>
            </View>
          )}
        </Animated.View>
      );
    }

    return (
      <View style={[styles.card, styles.nextCard]} key={user.id}>
        <Image source={{ uri: user.photos[0] }} style={styles.cardImage} />
      </View>
    );
  };

  // Tela de carregamento
  if (isLoadingUsers) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BotaLoveColors.primary} />
          <Text style={styles.loadingText}>Buscando perfis na sua região...</Text>
          <Text style={styles.loadingSubtext}>Isso pode levar alguns segundos</Text>
        </View>
      </View>
    );
  }

  if (currentIndex >= users.length) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>💚</Text>
          <Text style={styles.emptyTitle}>Não há mais perfis!</Text>
          <Text style={styles.emptyText}>
            Volte mais tarde para ver novos perfis do agro na sua região.
          </Text>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={loadDiscoveryUsers}
          >
            <Text style={styles.resetButtonText}>Buscar novamente</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Cards */}
      <View style={styles.cardsContainer}>
        {users.map((user, index) => renderCard(user, index)).reverse()}
      </View>

      {/* Action Buttons - Redesigned for Rural Theme */}
      <Animated.View 
        style={[
          styles.actionsContainer,
          {
            transform: [{ translateY: buttonTranslateY }],
          },
        ]}
      >
        {/* Retorno da Estrada Livre (Undo) */}
        <Animated.View
          style={{
            transform: [{ scale: buttonScale0 }],
          }}
        >
          <TouchableOpacity 
            style={[styles.actionButton, styles.retornoButton, currentIndex === 0 && styles.buttonDisabled]} 
            onPress={handleUndo}
            activeOpacity={0.7}
            disabled={!hasPremium && currentIndex === 0}
          >
            <Image 
              source={hasPremium ? ICONS.retornoUnlocked : ICONS.retornoBlock} 
              style={styles.actionIconSmall} 
            />
          </TouchableOpacity>
        </Animated.View>

        {/* Botão Fechar Porteira (Rejeitar) */}
        <Animated.View
          style={{
            transform: [{ scale: buttonScale1 }],
          }}
        >
          <TouchableOpacity 
            style={[styles.actionButton, styles.rejectButton]} 
            onPress={handleDislike}
            activeOpacity={0.7}
          >
            <Image source={ICONS.fechaPorteira} style={styles.actionIconReject} />
          </TouchableOpacity>
        </Animated.View>

        {/* Super Agro */}
        <Animated.View
          style={{
            transform: [{ scale: buttonScale2 }],
          }}
        >
          <TouchableOpacity
            style={[styles.actionButton, styles.superAgroButton]}
            onPress={handleSuperLike}
            activeOpacity={0.7}
          >
            <Image 
              source={hasPremium ? ICONS.superAgroUnlocked : ICONS.superAgroBlock} 
              style={styles.actionIconMedium} 
            />
          </TouchableOpacity>
        </Animated.View>

        {/* Botão Abrir Porteira (Curtir) */}
        <Animated.View
          style={{
            transform: [{ scale: buttonScale3 }],
          }}
        >
          <TouchableOpacity
            style={[styles.actionButton, styles.likeButtonRural]}
            onPress={handleLike}
            activeOpacity={0.7}
          >
            <Image source={ICONS.abrePorteira} style={styles.actionIconLarge} />
          </TouchableOpacity>
        </Animated.View>

        {/* Correio da Roça (Mensagem Direta) */}
        <Animated.View
          style={{
            transform: [{ scale: buttonScale4 }],
          }}
        >
          <TouchableOpacity
            style={[styles.actionButton, styles.correioButton]}
            onPress={handleBoost}
            activeOpacity={0.7}
          >
            <Image 
              source={hasPremium ? ICONS.correioUnlocked : ICONS.correioBlock} 
              style={styles.actionIconMedium} 
            />
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>

      {/* Premium Modal */}
      <PremiumModal
        visible={premiumModalVisible}
        onClose={() => setPremiumModalVisible(false)}
        feature={premiumFeature}
      />

      {/* Super Like Animation */}
      {showSuperLikeAnim && (
        <SuperLikeAnimation onComplete={() => setShowSuperLikeAnim(false)} />
      )}

      {/* Match Animation */}
      {showMatchAnim && matchedUser && currentUser && (
        <MatchAnimation
          currentUser={currentUser}
          matchedUser={matchedUser}
          onClose={() => {
            setShowMatchAnim(false);
            setMatchedUser(null);
          }}
          onSendMessage={() => {
            setShowMatchAnim(false);
            const chatId = matchChatId;
            setMatchedUser(null);
            setMatchChatId(null);
            if (chatId) {
              router.push(`/chat/${chatId}`);
            }
          }}
        />
      )}

      {/* Modal Correio da Roça */}
      <Modal
        visible={showCorreioModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCorreioModal(false)}
      >
        <View style={styles.correioModalOverlay}>
          <View style={styles.correioModalContainer}>
            <LinearGradient
              colors={['#1e3a5f', '#2c5f8d']}
              style={styles.correioModalGradient}
            >
              {/* Header */}
              <View style={styles.correioModalHeader}>
                <View style={styles.correioIconCircle}>
                  <Ionicons name="mail" size={48} color="#FFF" />
                </View>
                <Text style={styles.correioModalTitle}>
                  📬 Correio da Roça
                </Text>
                <Text style={styles.correioModalSubtitle}>
                  Chame atenção com as Primeiras Impressões
                </Text>
              </View>

              {/* User Preview */}
              {users[currentIndex] && (
                <View style={styles.correioUserPreview}>
                  <Image 
                    source={{ uri: users[currentIndex].photos[0] }} 
                    style={styles.correioUserImage}
                  />
                  <View style={styles.correioUserInfo}>
                    <Text style={styles.correioUserName}>
                      {users[currentIndex].name}
                    </Text>
                    <Text style={styles.correioUserCity}>
                      {users[currentIndex].city}, {users[currentIndex].state}
                    </Text>
                  </View>
                </View>
              )}

              {/* Message Input */}
              <View style={styles.correioInputContainer}>
                <TextInput
                  style={styles.correioInput}
                  placeholder="Sua mensagem..."
                  placeholderTextColor="#999"
                  multiline
                  numberOfLines={3}
                  value={correioMessage}
                  onChangeText={setCorreioMessage}
                  maxLength={500}
                  editable={!sendingCorreio}
                />
                <TouchableOpacity 
                  style={[styles.correioSendButton, sendingCorreio && { opacity: 0.6 }]}
                  onPress={handleSendCorreio}
                  disabled={sendingCorreio}
                >
                  <LinearGradient
                    colors={['#3498DB', '#2980B9']}
                    style={styles.correioSendGradient}
                  >
                    {sendingCorreio ? (
                      <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                      <Text style={styles.correioSendText}>Enviar</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              {/* Info */}
              <View style={styles.correioInfo}>
                <Ionicons name="information-circle" size={20} color="#3498DB" />
                <Text style={styles.correioInfoText}>
                  Mande uma mensagem. Confira se deu match.
                </Text>
              </View>

              {/* Close Button */}
              <TouchableOpacity
                style={styles.correioCloseButton}
                onPress={() => setShowCorreioModal(false)}
              >
                <Ionicons name="close" size={28} color="#FFF" />
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </View>
      </Modal>

      {/* Modal Mistério do Campo */}
      <Modal
        visible={showMisterioModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowMisterioModal(false)}
      >
        <View style={styles.correioModalOverlay}>
          <View style={styles.correioModalContainer}>
            <LinearGradient
              colors={['#8E44AD', '#6C3483', '#512E5F']}
              style={styles.correioModalGradient}
            >
              {/* Header */}
              <View style={styles.correioModalHeader}>
                <View style={[styles.correioModalIcon, { backgroundColor: '#9B59B6' }]}>
                  <Ionicons name="help-circle" size={32} color="#FFF" />
                </View>
                <Text style={styles.correioModalTitle}>
                  🎭 Mistério do Campo
                </Text>
                <Text style={styles.correioModalSubtitle}>
                  Envie uma mensagem anônima com sua foto desfocada!
                </Text>
              </View>

              {/* User Preview */}
              {users[currentIndex] && (
                <View style={styles.correioUserPreview}>
                  <Image 
                    source={{ uri: users[currentIndex].photos[0] }} 
                    style={styles.correioUserImage}
                  />
                  <View style={styles.correioUserInfo}>
                    <Text style={styles.correioUserName}>
                      {users[currentIndex].name}
                    </Text>
                    <Text style={styles.correioUserCity}>
                      {users[currentIndex].city}, {users[currentIndex].state}
                    </Text>
                  </View>
                </View>
              )}

              {/* Message Input */}
              <View style={styles.correioInputContainer}>
                <TextInput
                  style={styles.correioInput}
                  placeholder="Sua mensagem misteriosa..."
                  placeholderTextColor="#999"
                  multiline
                  numberOfLines={3}
                  value={misterioMessage}
                  onChangeText={setMisterioMessage}
                  maxLength={500}
                  editable={!sendingMisterio}
                />
                <TouchableOpacity 
                  style={[styles.correioSendButton, sendingMisterio && { opacity: 0.6 }]}
                  onPress={handleSendMisterio}
                  disabled={sendingMisterio}
                >
                  <LinearGradient
                    colors={['#9B59B6', '#8E44AD']}
                    style={styles.correioSendGradient}
                  >
                    {sendingMisterio ? (
                      <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                      <Text style={styles.correioSendText}>Enviar Mistério</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              {/* Info */}
              <View style={styles.correioInfo}>
                <Ionicons name="information-circle" size={20} color="#9B59B6" />
                <Text style={styles.correioInfoText}>
                  Sua identidade será revelada em 24h ou se a pessoa pagar R$1,99 para descobrir antes.
                </Text>
              </View>

              {/* Close Button */}
              <TouchableOpacity
                style={styles.correioCloseButton}
                onPress={() => setShowMisterioModal(false)}
              >
                <Ionicons name="close" size={28} color="#FFF" />
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </View>
      </Modal>

      {/* Modal de Limite Atingido */}
      <Modal
        visible={showLimitModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLimitModal(false)}
      >
        <View style={styles.limitModalOverlay}>
          <View style={styles.limitModalContainer}>
            <LinearGradient
              colors={['#E5C88A', BotaLoveColors.primary, '#B8944D']}
              style={styles.limitModalGradient}
            >
              {/* Ícone */}
              <View style={styles.limitIconCircle}>
                <Ionicons name="eye-off" size={48} color="#FFF" />
              </View>

              {/* Título */}
              <Text style={styles.limitModalTitle}>
                {UPGRADE_MESSAGES.bronze.title}
              </Text>

              {/* Mensagem */}
              <Text style={styles.limitModalMessage}>
                {UPGRADE_MESSAGES.bronze.message}
              </Text>

              {/* Botões */}
              <View style={styles.limitModalActions}>
                <TouchableOpacity
                  style={styles.limitModalCloseButton}
                  onPress={() => setShowLimitModal(false)}
                >
                  <Text style={styles.limitModalCloseText}>Voltar Amanhã</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.limitModalUpgradeButton}
                  onPress={() => {
                    setShowLimitModal(false);
                    setPremiumFeature('Perfis Ilimitados');
                    setPremiumModalVisible(true);
                  }}
                >
                  <LinearGradient
                    colors={['#27AE60', '#229954']}
                    style={styles.limitModalUpgradeGradient}
                  >
                    <Ionicons name="rocket" size={20} color="#FFF" />
                    <Text style={styles.limitModalUpgradeText}>
                      {UPGRADE_MESSAGES.bronze.buttonText}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              {/* Close X */}
              <TouchableOpacity
                style={styles.limitModalXButton}
                onPress={() => setShowLimitModal(false)}
              >
                <Ionicons name="close" size={28} color="#FFF" />
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F0E8',
  },
  cardsContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 0,
  },
  card: {
    position: 'absolute',
    width: width,
    height: CARD_HEIGHT,
    borderRadius: 0,
    backgroundColor: BotaLoveColors.backgroundWhite,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    overflow: 'hidden',
  },
  nextCard: {
    transform: [{ scale: 0.96 }],
    opacity: 0.5,
  },
  cardImageTouchable: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '55%',
  },
  swipeIndicator: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  swipeIndicatorRight: {
    right: 0,
  },
  swipeIndicatorLeft: {
    left: 0,
  },
  swipeIconContainer: {
    alignItems: 'center',
    gap: 8,
  },
  swipeIconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  swipeIconImage: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
  },
  swipeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
    letterSpacing: 2,
    marginTop: 8,
  },
  swipeSubtext: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
    letterSpacing: 1,
  },
  cardInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 24,
  },
  cardNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 6,
    flexWrap: 'wrap',
  },
  cardName: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#FFF',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  seloRuralBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#27AE60',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  seloRuralText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FFF',
    letterSpacing: 0.3,
  },
  likedYouBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E74C3C',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  likedYouText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  cardLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  cardCity: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  cardOccupationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  cardOccupation: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  cardBio: {
    fontSize: 15,
    color: '#FFF',
    marginBottom: 10,
    lineHeight: 21,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  interestTag: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  interestText: {
    fontSize: 13,
    color: '#FFF',
    fontWeight: '700',
  },
  detailsButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 20,
  },
  detailsButtonInner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: BotaLoveColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
    borderWidth: 3,
    borderColor: '#FFF',
  },
  photoIndicator: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  photoCount: {
    fontSize: 14,
    color: '#FFF',
    fontWeight: '700',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 24,
    paddingTop: 16,
    gap: 14,
  },
  actionButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  rejectButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFF',
  },
  retornoButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  actionIconSmall: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
  },
  actionIconMedium: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
  },
  actionIconLarge: {
    width: 42,
    height: 42,
    resizeMode: 'contain',
  },
  actionIconReject: {
    width: 36,
    height: 36,
    resizeMode: 'contain',
  },
  superAgroButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFF',
  },
  superAgroGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  likeButtonRural: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#FFF',
  },
  likeButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  correioButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFF',
  },
  correioGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  superLikeButton: {
    backgroundColor: '#5DADE2',
    borderColor: '#3498DB',
  },
  likeButton: {
    backgroundColor: '#2ECC71',
    width: 70,
    height: 70,
    borderRadius: 35,
    borderColor: '#27AE60',
  },
  boostButton: {
    backgroundColor: '#9B59B6',
    borderColor: '#8E44AD',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: BotaLoveColors.secondary,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: BotaLoveColors.neutralDark,
    textAlign: 'center',
    marginBottom: 30,
  },
  resetButton: {
    backgroundColor: BotaLoveColors.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 24,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: BotaLoveColors.textLight,
  },
  // Loading State
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: BotaLoveColors.secondary,
    marginTop: 20,
    textAlign: 'center',
  },
  loadingSubtext: {
    fontSize: 14,
    color: BotaLoveColors.neutralDark,
    marginTop: 8,
    textAlign: 'center',
  },
  // Modal Correio da Roça
  correioModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  correioModalContainer: {
    width: width - 48,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  },
  correioModalGradient: {
    padding: 24,
    paddingTop: 32,
  },
  correioModalHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  correioIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  correioModalTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  correioModalSubtitle: {
    fontSize: 16,
    color: '#FFF',
    opacity: 0.9,
    textAlign: 'center',
  },
  correioUserPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  correioUserImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    borderColor: '#FFF',
  },
  correioUserInfo: {
    flex: 1,
    marginLeft: 16,
  },
  correioUserName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  correioUserCity: {
    fontSize: 15,
    color: '#FFF',
    opacity: 0.85,
  },
  correioInputContainer: {
    marginBottom: 20,
  },
  correioInput: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: BotaLoveColors.textPrimary,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(52, 152, 219, 0.3)',
  },
  correioSendButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#3498DB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  correioSendGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  correioSendText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  correioInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(52, 152, 219, 0.4)',
  },
  correioInfoText: {
    flex: 1,
    fontSize: 14,
    color: '#FFF',
    fontWeight: '600',
  },
  correioCloseButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Modal de Limite de Visualizações
  limitModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  limitModalContainer: {
    width: width - 48,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  },
  limitModalGradient: {
    padding: 32,
    alignItems: 'center',
  },
  limitIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  limitModalTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  limitModalMessage: {
    fontSize: 15,
    color: '#FFF',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 28,
    opacity: 0.95,
  },
  limitModalActions: {
    width: '100%',
    gap: 12,
  },
  limitModalCloseButton: {
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  limitModalCloseText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  limitModalUpgradeButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#27AE60',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
  limitModalUpgradeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
  },
  limitModalUpgradeText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#FFF',
  },
  limitModalXButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
