import { BotaLoveColors } from '@/constants/theme';
import { UserType, useSignup } from '@/contexts/SignupContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width } = Dimensions.get('window');

type ProfileType = 'agro' | 'simpatizante' | 'produtor' | null;

export default function OnboardingProfileScreen() {
  const router = useRouter();
  const { setUserType, setIsAgroUser } = useSignup();
  const [selectedProfile, setSelectedProfile] = useState<ProfileType>(null);
  
  // Animações
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(50)).current;
  const logoScaleAnim = useRef(new Animated.Value(0)).current;
  const particleAnims = useRef(
    Array.from({ length: 8 }, () => new Animated.Value(0))
  ).current;
  
  const [cardScales] = useState({
    agro: new Animated.Value(1),
    simpatizante: new Animated.Value(1),
    produtor: new Animated.Value(1),
  });

  useEffect(() => {
    // Animação de entrada
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(logoScaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 600,
        delay: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Animação de partículas flutuantes
    particleAnims.forEach((anim, index) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * 200),
          Animated.timing(anim, {
            toValue: 1,
            duration: 3000 + index * 500,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 3000 + index * 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });
  }, []);

  const handleSelectProfile = (profile: ProfileType) => {
    if (!profile) return;
    setSelectedProfile(profile);
    
    // Animação de pulso no card selecionado
    Animated.sequence([
      Animated.spring(cardScales[profile], {
        toValue: 1.05,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(cardScales[profile], {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleContinue = () => {
    if (!selectedProfile) return;

    // Salvar tipo de usuário no contexto
    setUserType(selectedProfile as UserType);
    
    // Definir se é usuário agro
    const isAgro = selectedProfile === 'agro';
    setIsAgroUser(isAgro);

    // Animação de saída
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Todos os tipos de usuário seguem o mesmo fluxo de cadastro
      // A diferenciação de visão acontece no login
      router.push('/signup-name');
    });
  };

  const Particle = ({ index }: { index: number }) => {
    const translateY = particleAnims[index].interpolate({
      inputRange: [0, 1],
      outputRange: [0, -800],
    });

    const translateX = particleAnims[index].interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, (index % 2 === 0 ? 50 : -50), 0],
    });

    const opacity = particleAnims[index].interpolate({
      inputRange: [0, 0.2, 0.8, 1],
      outputRange: [0, 1, 1, 0],
    });

    const colors = [BotaLoveColors.primary, '#8BC34A', '#FFC107', '#FF9800'];
    const icons: (keyof typeof Ionicons.glyphMap)[] = ['leaf', 'heart', 'star', 'flower'];

    return (
      <Animated.View
        style={[
          styles.particle,
          {
            left: (index * width) / 8,
            transform: [{ translateY }, { translateX }],
            opacity,
          },
        ]}
      >
        <Ionicons name={icons[index % 4]} size={24} color={colors[index % 4]} />
      </Animated.View>
    );
  };

  const ProfileCard = ({ 
    type, 
    title, 
    icon, 
    gradient,
    description,
    badge,
  }: { 
    type: ProfileType; 
    title: string; 
    icon: keyof typeof Ionicons.glyphMap;
    gradient: string[];
    description: string;
    badge?: string;
  }) => {
    if (!type) return null;
    const isSelected = selectedProfile === type;
    
    return (
      <Animated.View
        style={{
          transform: [{ scale: cardScales[type] }],
          opacity: fadeAnim,
        }}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => handleSelectProfile(type)}
        >
          <View style={[styles.card, isSelected && styles.cardSelected]}>
            <LinearGradient
              colors={isSelected ? gradient as [string, string, ...string[]] : ['#FFF', '#FFF']}
              style={styles.cardGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {badge && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{badge}</Text>
                </View>
              )}

              <View style={[
                styles.iconContainer, 
                isSelected && styles.iconContainerSelected
              ]}>
                <Ionicons 
                  name={icon} 
                  size={56} 
                  color={isSelected ? '#FFF' : gradient[0]} 
                />
              </View>
              
              <Text style={[styles.cardTitle, isSelected && styles.cardTitleSelected]}>
                {title}
              </Text>
              
              <Text style={[styles.cardDescription, isSelected && styles.cardDescriptionSelected]}>
                {description}
              </Text>

              {isSelected && (
                <Animated.View style={styles.checkmarkContainer}>
                  <View style={styles.checkmarkCircle}>
                    <Ionicons name="checkmark-circle" size={40} color="#FFF" />
                  </View>
                </Animated.View>
              )}
            </LinearGradient>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Background Gradient */}
      <LinearGradient
        colors={[BotaLoveColors.secondary, '#1a0a00', '#000000']}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Partículas animadas */}
      <View style={styles.particlesContainer}>
        {particleAnims.map((_, index) => (
          <Particle key={index} index={index} />
        ))}
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* Logo animado */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: logoScaleAnim }],
            },
          ]}
        >
          <View style={styles.logoCircle}>
            <Image
              source={require('@/assets/images/logotipo/logotipo.jpeg')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
        </Animated.View>

        {/* Header */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideUpAnim }],
            },
          ]}
        >
          <Text style={styles.title}>Quem é você no Agro?</Text>
          <Text style={styles.subtitle}>
            Escolha uma opção para desbloquear{'\n'}sua jornada no Bota Love
          </Text>
        </Animated.View>

        {/* Cards */}
        <Animated.View
          style={[
            styles.cardsContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideUpAnim }],
            },
          ]}
        >
          <ProfileCard
            type="agro"
            title="SOU AGRO"
            icon="leaf"
            gradient={[BotaLoveColors.primary, '#e89b1f']}
            description="Trabalho no campo e vivo o agronegócio"
            badge="🌾 POPULAR"
          />

          <ProfileCard
            type="simpatizante"
            title="SIMPATIZANTE AGRO"
            icon="heart"
            gradient={['#8BC34A', '#689F38']}
            description="Admiro o agro e quero fazer parte"
          />

          <ProfileCard
            type="produtor"
            title="PRODUTOR DE EVENTOS"
            icon="calendar"
            gradient={[BotaLoveColors.secondary, '#3d2614']}
            description="Organizo eventos para a comunidade"
            badge="💼 NEGÓCIOS"
          />
        </Animated.View>

        {/* Button */}
        <Animated.View
          style={{
            opacity: fadeAnim,
          }}
        >
          <TouchableOpacity
            style={[
              styles.continueButton,
              !selectedProfile && styles.continueButtonDisabled,
            ]}
            onPress={handleContinue}
            disabled={!selectedProfile}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={
                selectedProfile
                  ? [BotaLoveColors.primary, '#d89515']
                  : ['#666', '#444']
              }
              style={styles.continueButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.continueButtonText}>Começar Jornada</Text>
              <Ionicons name="arrow-forward-circle" size={28} color="#FFF" />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  particlesContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  particle: {
    position: 'absolute',
    bottom: -100,
  },
  scrollView: {
    flex: 1,
    zIndex: 2,
  },
  scrollContent: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(249, 168, 37, 0.2)',
    borderWidth: 4,
    borderColor: BotaLoveColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: BotaLoveColors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 12,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  header: {
    marginBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    lineHeight: 24,
  },
  cardsContainer: {
    gap: 16,
    marginBottom: 20,
  },
  card: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  cardSelected: {
    borderColor: BotaLoveColors.primary,
    shadowColor: BotaLoveColors.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.8,
    shadowRadius: 24,
    elevation: 16,
  },
  cardGradient: {
    padding: 24,
    alignItems: 'center',
    minHeight: 140,
    justifyContent: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FFF',
  },
  iconContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(249, 168, 37, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(249, 168, 37, 0.3)',
  },
  iconContainerSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: BotaLoveColors.secondary,
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  cardTitleSelected: {
    color: '#FFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  cardDescription: {
    fontSize: 13,
    color: BotaLoveColors.neutralDark,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 8,
  },
  cardDescriptionSelected: {
    color: 'rgba(255, 255, 255, 0.95)',
  },
  checkmarkContainer: {
    position: 'absolute',
    top: 12,
    left: 12,
  },
  checkmarkCircle: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 20,
    padding: 2,
  },
  continueButton: {
    marginBottom: 40,
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: BotaLoveColors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 12,
  },
  continueButtonDisabled: {
    opacity: 0.5,
    shadowOpacity: 0,
  },
  continueButtonGradient: {
    flexDirection: 'row',
    paddingVertical: 20,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  continueButtonText: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#FFF',
    letterSpacing: 0.5,
  },
});
