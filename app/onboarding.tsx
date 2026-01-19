import { BotaLoveColors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

// Slides do onboarding estilo Inner Circle
const ONBOARDING_SLIDES = [
  {
    id: 1,
    image: require('@/assets/images/onboarding/1.jpeg'),
    title: 'Bota Love',
    subtitle: 'GOIÂNIA',
    description: 'Conecte-se com pessoas que compartilham sua paixão pelo agro',
  },
  {
    id: 2,
    image: require('@/assets/images/onboarding/2.jpeg'),
    title: 'Eventos Exclusivos',
    subtitle: 'RIO VERDE',
    description: 'Participe de rodeios, exposições e festas do agro',
  },
  {
    id: 3,
    image: require('@/assets/images/onboarding/3.jpeg'),
    title: 'Amor no Campo',
    subtitle: 'UBERLÂNDIA',
    description: 'Encontre alguém que vive e respira o campo como você',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<any>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleNext = () => {
    if (currentIndex < ONBOARDING_SLIDES.length - 1) {
      const nextIndex = currentIndex + 1;
      scrollViewRef.current?.scrollTo({
        x: nextIndex * width,
        animated: true,
      });
      setCurrentIndex(nextIndex);
    } else {
      router.replace('/login');
    }
  };

  const handleSkip = () => {
    router.replace('/login');
  };

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    {
      useNativeDriver: false,
      listener: (event: any) => {
        const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
        setCurrentIndex(slideIndex);
      },
    }
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Skip button */}
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>Pular</Text>
      </TouchableOpacity>

      {/* Slides */}
      <Animated.ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        {ONBOARDING_SLIDES.map((slide, index) => (
          <View key={slide.id} style={styles.slide}>
            <Image
              source={slide.image}
              style={styles.backgroundImage}
              resizeMode="cover"
            />
            <LinearGradient
              colors={['rgba(31, 19, 12, 0.4)', 'rgba(31, 19, 12, 0.85)', 'rgba(31, 19, 12, 0.95)']}
              locations={[0, 0.5, 1]}
              style={styles.gradient}
            >
              <View style={styles.content}>
                {/* Logo apenas no primeiro slide */}
                {index === 0 && (
                  <View style={styles.logoContainer}>
                    <Text style={styles.logo}>🤠</Text>
                  </View>
                )}

                <View style={styles.textContainer}>
                  <Text style={styles.title}>{slide.title}</Text>
                  
                  <View style={styles.cityBadge}>
                    <Text style={styles.cityText}>{slide.subtitle}</Text>
                  </View>
                  
                  <Text style={styles.description}>{slide.description}</Text>
                </View>

                {/* Features apenas no primeiro slide */}
                {index === 0 && (
                  <View style={styles.featuresContainer}>
                    <View style={styles.featureItem}>
                      <Ionicons name="shield-checkmark" size={20} color={BotaLoveColors.primary} />
                      <Text style={styles.featureText}>Perfis verificados</Text>
                    </View>
                    <View style={styles.featureItem}>
                      <Ionicons name="people" size={20} color={BotaLoveColors.primary} />
                      <Text style={styles.featureText}>Comunidade exclusiva</Text>
                    </View>
                    <View style={styles.featureItem}>
                      <Ionicons name="calendar" size={20} color={BotaLoveColors.primary} />
                      <Text style={styles.featureText}>Eventos do agro</Text>
                    </View>
                  </View>
                )}
              </View>
            </LinearGradient>
          </View>
        ))}
      </Animated.ScrollView>

      {/* Pagination dots - estilo Inner Circle */}
      <View style={styles.paginationContainer}>
        {ONBOARDING_SLIDES.map((_, index) => {
          const inputRange = [
            (index - 1) * width,
            index * width,
            (index + 1) * width,
          ];

          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [8, 24, 8],
            extrapolate: 'clamp',
          });

          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              key={index}
              style={[
                styles.dot,
                {
                  width: dotWidth,
                  opacity,
                },
              ]}
            />
          );
        })}
      </View>

      {/* Button - Começar ou Próximo */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.mainButton} onPress={handleNext}>
          <LinearGradient
            colors={[BotaLoveColors.primary, BotaLoveColors.primaryDark]}
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.buttonText}>
              {currentIndex === ONBOARDING_SLIDES.length - 1 ? 'Começar' : 'Próximo'}
            </Text>
            <Ionicons 
              name={currentIndex === ONBOARDING_SLIDES.length - 1 ? 'arrow-forward' : 'chevron-forward'} 
              size={22} 
              color={BotaLoveColors.textPrimary} 
            />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BotaLoveColors.textPrimary,
  },
  skipButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 50,
    right: 24,
    zIndex: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  skipText: {
    fontSize: 15,
    fontWeight: '600',
    color: BotaLoveColors.textLight,
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    width,
    height,
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  gradient: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 200,
    paddingHorizontal: 32,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    fontSize: 72,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: BotaLoveColors.textLight,
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  cityBadge: {
    backgroundColor: BotaLoveColors.primary,
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 20,
  },
  cityText: {
    fontSize: 15,
    fontWeight: '800',
    color: BotaLoveColors.textPrimary,
    letterSpacing: 2,
  },
  description: {
    fontSize: 18,
    color: BotaLoveColors.textLight,
    textAlign: 'center',
    lineHeight: 26,
    opacity: 0.95,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  featuresContainer: {
    gap: 12,
    marginTop: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  featureText: {
    fontSize: 15,
    color: BotaLoveColors.textLight,
    fontWeight: '600',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 140,
    left: 0,
    right: 0,
    gap: 6,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: BotaLoveColors.primary,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 50 : 30,
    paddingTop: 20,
  },
  mainButton: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 18,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: BotaLoveColors.textPrimary,
  },
});
