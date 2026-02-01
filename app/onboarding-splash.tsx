import { BotaLoveColors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Dimensions,
    FlatList,
    Image,
    ImageSourcePropType,
    NativeScrollEvent,
    NativeSyntheticEvent,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, {
    Easing,
    FadeIn,
    FadeInDown,
    interpolate,
    SharedValue,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
import Svg, { Defs, Path, Stop, LinearGradient as SvgGradient } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

// 🖼️ Imagens do onboarding - serão selecionadas aleatoriamente
const ONBOARDING_IMAGES: ImageSourcePropType[] = [
  require('@/assets/images/onboarding/1.jpeg'),
  require('@/assets/images/onboarding/2.jpeg'),
  require('@/assets/images/onboarding/3.jpeg'),
  require('@/assets/images/onboarding/4.jpeg'),
  require('@/assets/images/onboarding/5.jpeg'),
  require('@/assets/images/onboarding/6.jpeg'),
  require('@/assets/images/onboarding/7.jpeg'),
  require('@/assets/images/onboarding/8.jpeg'),
  require('@/assets/images/onboarding/9.jpeg'),
  require('@/assets/images/onboarding/10.jpeg'),
  require('@/assets/images/onboarding/11.jpeg'),
  require('@/assets/images/onboarding/12.jpeg'),
  require('@/assets/images/onboarding/13.jpeg'),
  require('@/assets/images/onboarding/14.jpeg'),
];

// 🔀 Função para embaralhar array
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// ⏱️ Intervalo do carrossel automático (em ms)
const CAROUSEL_INTERVAL = 4000;

// 🌆 Cidades/regiões do agronegócio brasileiro
const REGIONS = [
  'GOIÂNIA',
  'RIO VERDE',
  'UBERLÂNDIA',
  'CUIABÁ',
  'RIBEIRÃO PRETO',
  'SINOP',
  'RONDONÓPOLIS',
  'LUCAS DO RIO VERDE',
  'SORRISO',
  'CASCAVEL',
];

// 🎨 Cores premium
const splashColors = {
  primary: '#D4AD63', // Dourado elegante
  overlay: 'rgba(212, 173, 99, 0.4)',
  text: '#FFFFFF',
  shadow: 'rgba(0, 0, 0, 0.3)',
  locationBg: 'rgba(0, 0, 0, 0.7)',
  gradientStart: 'rgba(212, 173, 99, 0.6)',
  gradientEnd: 'rgba(212, 173, 99, 0.2)',
  darkOverlay: 'rgba(31, 19, 12, 0.5)',
};

/**
 * 🎭 Componente SVG para efeito gráfico circular elegante
 */
const CircleOverlay: React.FC<{ animatedProgress: SharedValue<number> }> = ({ animatedProgress }) => {
  const AnimatedPath = Animated.createAnimatedComponent(Path);
  
  const animatedProps = useAnimatedStyle(() => ({
    opacity: interpolate(animatedProgress.value, [0, 1], [0, 0.9]),
    transform: [{ scale: interpolate(animatedProgress.value, [0, 1], [0.8, 1]) }],
  }));

  return (
    <Animated.View style={[styles.svgOverlay, animatedProps]}>
      <Svg height={height} width={width} style={StyleSheet.absoluteFillObject}>
        <Defs>
          <SvgGradient id="circleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={splashColors.gradientStart} />
            <Stop offset="50%" stopColor={splashColors.primary} stopOpacity="0.5" />
            <Stop offset="100%" stopColor={splashColors.gradientEnd} />
          </SvgGradient>
        </Defs>
        
        {/* Arco decorativo superior */}
        <Path
          d={`M ${width * 0.1} ${height * 0.15} 
              Q ${width * 0.5} ${height * -0.05}, ${width * 0.9} ${height * 0.15}`}
          stroke="url(#circleGrad)"
          strokeWidth="50"
          fill="none"
          strokeLinecap="round"
        />
        
        {/* Arco decorativo lateral esquerdo */}
        <Path
          d={`M ${width * -0.1} ${height * 0.3}
              Q ${width * 0.05} ${height * 0.5}, ${width * -0.05} ${height * 0.7}`}
          stroke="url(#circleGrad)"
          strokeWidth="40"
          fill="none"
          strokeLinecap="round"
        />
        
        {/* Elemento circular central decorativo */}
        <Path
          d={`M ${width * 0.85} ${height * 0.25}
              A ${width * 0.3} ${width * 0.3} 0 0 1 ${width * 1.05} ${height * 0.55}`}
          stroke="url(#circleGrad)"
          strokeWidth="35"
          fill="none"
          strokeLinecap="round"
          opacity={0.7}
        />
      </Svg>
    </Animated.View>
  );
};

/**
 * 🌟 Componente de partículas brilhantes animadas
 */
const SparkleParticles: React.FC = () => {
  const sparkleOpacity = useSharedValue(0);

  useEffect(() => {
    sparkleOpacity.value = withDelay(
      1000,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 1500 }),
          withTiming(0.3, { duration: 1500 })
        ),
        -1,
        true
      )
    );
  }, []);

  const sparkleStyle = useAnimatedStyle(() => ({
    opacity: sparkleOpacity.value,
  }));

  return (
    <Animated.View style={[styles.sparkleContainer, sparkleStyle]}>
      {[...Array(6)].map((_, i) => (
        <View
          key={i}
          style={[
            styles.sparkle,
            {
              top: `${15 + Math.random() * 70}%`,
              left: `${10 + Math.random() * 80}%`,
              width: 4 + Math.random() * 6,
              height: 4 + Math.random() * 6,
            },
          ]}
        />
      ))}
    </Animated.View>
  );
};

/**
 * 🚀 Tela principal de Onboarding Splash Premium
 */
export default function OnboardingSplashScreen() {
  const router = useRouter();
  const { currentUser, isLoading: authLoading } = useAuth();
  
  // 🔀 Estado para imagens embaralhadas do carrossel
  const [shuffledImages] = useState(() => shuffleArray(ONBOARDING_IMAGES));
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  
  // Estado para região - muda conforme o carrossel
  const currentRegion = REGIONS[currentIndex % REGIONS.length];
  const [imageLoaded, setImageLoaded] = useState(false);

  // 🎬 Valores de animação
  const backgroundScale = useSharedValue(1.15);
  const overlayProgress = useSharedValue(0);
  const contentOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.8);
  const pulseValue = useSharedValue(1);

  // 🎠 Auto-scroll do carrossel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % shuffledImages.length;
        flatListRef.current?.scrollToIndex({
          index: nextIndex,
          animated: true,
        });
        return nextIndex;
      });
    }, CAROUSEL_INTERVAL);

    return () => clearInterval(interval);
  }, [shuffledImages.length]);

  // 📜 Handler para scroll manual
  const handleScrollEnd = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(newIndex);
  }, []);

  // ✨ Iniciar animações quando a imagem carregar
  useEffect(() => {
    if (imageLoaded) {
      // Animação de zoom out suave do background
      backgroundScale.value = withTiming(1, {
        duration: 4000,
        easing: Easing.out(Easing.cubic),
      });

      // Animação do overlay gráfico
      overlayProgress.value = withDelay(
        300,
        withTiming(1, {
          duration: 2000,
          easing: Easing.out(Easing.quad),
        })
      );

      // Animação do conteúdo
      contentOpacity.value = withDelay(
        500,
        withTiming(1, {
          duration: 1500,
          easing: Easing.out(Easing.quad),
        })
      );

      // Animação do logo
      logoScale.value = withDelay(
        600,
        withTiming(1, {
          duration: 1200,
          easing: Easing.out(Easing.back(1.5)),
        })
      );

      // Efeito de pulsação sutil contínua
      pulseValue.value = withDelay(
        2000,
        withRepeat(
          withSequence(
            withTiming(1.02, { duration: 2000 }),
            withTiming(1, { duration: 2000 })
          ),
          -1,
          true
        )
      );
    }
  }, [imageLoaded]);

  // 📱 Estilos animados
  const backgroundAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: backgroundScale.value }],
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ scale: pulseValue.value }],
  }));

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: interpolate(logoScale.value, [0.8, 1], [0, 1]),
  }));

  // 🔄 Navegação para a tela de login
  const handleContinue = useCallback(() => {
    if (currentUser) {
      // Usuário logado - vai para as tabs
      router.replace('/(tabs)');
    } else {
      // Usuário não logado - vai para login
      router.replace('/login');
    }
  }, [currentUser, router]);

  // 🖼️ Handler para quando a imagem carregar
  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  // Memoize o nome do app formatado
  const appNameFormatted = useMemo(() => (
    <>
      <Text style={styles.appNameFirst}>Bota</Text>
      {'\n'}
      <Text style={styles.appNameSecond}>Love</Text>
    </>
  ), []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* 🎠 Carrossel de imagens */}
      <Animated.View style={[styles.backgroundContainer, backgroundAnimatedStyle]}>
        <FlatList
          ref={flatListRef}
          data={shuffledImages}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEnabled={true}
          bounces={false}
          decelerationRate="fast"
          snapToInterval={width}
          snapToAlignment="start"
          onMomentumScrollEnd={handleScrollEnd}
          onScrollEndDrag={handleScrollEnd}
          keyExtractor={(_, index) => index.toString()}
          getItemLayout={(_, index) => ({
            length: width,
            offset: width * index,
            index,
          })}
          renderItem={({ item, index }) => (
            <Image
              source={item}
              style={styles.carouselImage}
              resizeMode="cover"
              onLoad={index === 0 ? handleImageLoad : undefined}
            />
          )}
        />
      </Animated.View>

      {/* 🔵 Indicadores do carrossel */}
      <View style={styles.carouselIndicators}>
        {shuffledImages.map((_, index) => (
          <View
            key={index}
            style={[
              styles.indicator,
              currentIndex === index && styles.indicatorActive,
            ]}
          />
        ))}
      </View>

      {/* 🌫️ Gradient overlay para legibilidade */}
      <LinearGradient
        colors={[
          'rgba(0, 0, 0, 0.3)',
          'rgba(31, 19, 12, 0.2)',
          'rgba(31, 19, 12, 0.6)',
          'rgba(31, 19, 12, 0.9)',
        ]}
        locations={[0, 0.3, 0.6, 1]}
        style={styles.gradientOverlay}
      />

      {/* ✨ Efeito gráfico SVG circular */}
      <CircleOverlay animatedProgress={overlayProgress} />

      {/* 🌟 Partículas brilhantes */}
      <SparkleParticles />

      {/* 📝 Conteúdo central - Subido */}
      <Animated.View style={[styles.contentContainer, contentAnimatedStyle]}>
        {/* Logo/Nome do App */}
        <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
          <Text style={styles.appName}>
            {appNameFormatted}
          </Text>
          
          {/* Subtítulo elegante */}
          <Text style={styles.tagline}>Amor no Campo</Text>
        </Animated.View>

        {/* 📍 Tag de localização */}
        <Animated.View 
          entering={FadeInDown.delay(1200).duration(800).springify()}
          style={styles.locationTag}
        >
          <View style={styles.locationDot} />
          <Text style={styles.locationText}>{currentRegion}</Text>
        </Animated.View>
      </Animated.View>

      {/* 🔘 Botão de Continuar */}
      <Animated.View 
        entering={FadeIn.delay(1800).duration(1000)}
        style={styles.bottomContainer}
      >
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={[splashColors.primary, '#B8924F']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.buttonGradient}
          >
            <Text style={styles.buttonText}>Começar</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Texto de termos */}
        <Text style={styles.termsText}>
          Ao continuar, você concorda com nossos{' '}
          <Text style={styles.termsLink}>Termos de Uso</Text>
        </Text>
      </Animated.View>

      {/* 🔒 Indicador de carregamento durante autenticação */}
      {authLoading && (
        <View style={styles.loadingOverlay}>
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BotaLoveColors.textPrimary,
  },
  
  // Background
  backgroundContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  carouselImage: {
    width: width,
    height: height,
  },
  carouselIndicators: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    zIndex: 5,
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  indicatorActive: {
    width: 20,
    backgroundColor: splashColors.primary,
  },
  
  // Overlays
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  svgOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  
  // Sparkles
  sparkleContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
  },
  sparkle: {
    position: 'absolute',
    borderRadius: 50,
    backgroundColor: splashColors.primary,
    shadowColor: splashColors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 5,
  },
  
  // Content
  contentContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: height * 0.18, // Posicionar logo abaixo do arco dourado
    paddingBottom: 180,
    zIndex: 3,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  appName: {
    fontSize: 56,
    fontWeight: '900',
    color: splashColors.text,
    textAlign: 'center',
    letterSpacing: 3,
    lineHeight: 64,
    textShadowColor: splashColors.shadow,
    textShadowOffset: { width: 2, height: 3 },
    textShadowRadius: 6,
  },
  appNameFirst: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontWeight: '400',
    fontStyle: 'italic',
  },
  appNameSecond: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontWeight: '700',
  },
  tagline: {
    fontSize: 18,
    fontWeight: '400',
    color: splashColors.primary,
    letterSpacing: 4,
    marginTop: 16,
    textTransform: 'uppercase',
    textShadowColor: splashColors.shadow,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    textAlign: 'center',
  },
  
  // Location Tag
  locationTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: splashColors.locationBg,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(212, 173, 99, 0.3)',
    marginTop: 60,
    gap: 10,
  },
  locationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: splashColors.primary,
  },
  locationText: {
    color: splashColors.text,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 2,
  },
  
  // Bottom Container
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 50 : 32,
    zIndex: 4,
  },
  continueButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: splashColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: BotaLoveColors.textPrimary,
    letterSpacing: 1,
  },
  termsText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 18,
  },
  termsLink: {
    color: splashColors.primary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  
  // Loading
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  loadingText: {
    color: splashColors.text,
    fontSize: 16,
    fontWeight: '600',
  },
});
