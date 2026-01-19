import { BotaLoveColors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width } = Dimensions.get('window');

export default function OnboardingFinalScreen() {
  const router = useRouter();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animação de entrada
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 50,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Animação de pulso contínuo no ícone
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Animação de brilho pulsante
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleFinish = () => {
    // Animação de saída
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => {
      router.push('/signup-name');
    });
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[BotaLoveColors.secondary, '#1a0a00', '#000000']}
        style={StyleSheet.absoluteFillObject}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* Progress */}
        <Animated.View
          style={[styles.progressContainer, { opacity: fadeAnim }]}
        >
          <View style={styles.progressBar}>
            <Animated.View style={[styles.progressFill, { width: '100%' }]}>
              <LinearGradient
                colors={['#FFD700', BotaLoveColors.primary, '#FF69B4']}
                style={StyleSheet.absoluteFillObject}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            </Animated.View>
          </View>
          <Text style={styles.progressText}>Etapa 4 de 4 - 100% Concluído! 🎉</Text>
        </Animated.View>

        {/* Icon com efeitos premium */}
        <Animated.View
          style={[
            styles.iconContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: Animated.multiply(scaleAnim, pulseAnim) }],
            },
          ]}
        >
          {/* Círculos de brilho */}
          <Animated.View
            style={[
              styles.glowRing,
              {
                opacity: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.3, 0.8],
                }),
                transform: [
                  {
                    scale: glowAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.3],
                    }),
                  },
                ],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.glowRing2,
              {
                opacity: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.2, 0.5],
                }),
                transform: [
                  {
                    scale: glowAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.5],
                    }),
                  },
                ],
              },
            ]}
          />
          <LinearGradient
            colors={['#FFD700', BotaLoveColors.primary, '#FF69B4']}
            style={styles.iconGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="checkmark-circle" size={110} color="#FFF" />
          </LinearGradient>
        </Animated.View>

        {/* Text */}
        <Animated.View
          style={[
            styles.textContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Text style={styles.title}>Tudo pronto!</Text>
          <Text style={styles.subtitle}>
            Quanto mais claras forem suas escolhas,{'\n'}
            mais certeiras serão suas conexões!
          </Text>

          <View style={styles.tipsContainer}>
            <View style={styles.tipCard}>
              <LinearGradient
                colors={['rgba(249, 168, 37, 0.15)', 'rgba(249, 168, 37, 0.05)']}
                style={styles.tipCardGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.tipIconCircle}>
                  <Ionicons name="shield-checkmark" size={36} color={BotaLoveColors.primary} />
                </View>
                <Text style={styles.tipText}>Perfil verificado</Text>
                <Text style={styles.tipDescription}>Sua conta será protegida e autenticada</Text>
              </LinearGradient>
            </View>

            <View style={styles.tipCard}>
              <LinearGradient
                colors={['rgba(231, 76, 60, 0.15)', 'rgba(231, 76, 60, 0.05)']}
                style={styles.tipCardGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={[styles.tipIconCircle, { backgroundColor: 'rgba(231, 76, 60, 0.2)' }]}>
                  <Ionicons name="heart" size={36} color="#E74C3C" />
                </View>
                <Text style={styles.tipText}>Conexões certeiras</Text>
                <Text style={styles.tipDescription}>Matches baseados nas suas preferências</Text>
              </LinearGradient>
            </View>

            <View style={styles.tipCard}>
              <LinearGradient
                colors={['rgba(255, 215, 0, 0.15)', 'rgba(255, 215, 0, 0.05)']}
                style={styles.tipCardGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={[styles.tipIconCircle, { backgroundColor: 'rgba(255, 215, 0, 0.2)' }]}>
                  <Ionicons name="star" size={36} color="#FFD700" />
                </View>
                <Text style={styles.tipText}>Experiência única</Text>
                <Text style={styles.tipDescription}>Recursos exclusivos para o agro</Text>
              </LinearGradient>
            </View>
          </View>
        </Animated.View>

        {/* Button */}
        <Animated.View
          style={[
            styles.buttonContainer,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.finishButton}
            onPress={handleFinish}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#FFD700', BotaLoveColors.primary, '#FF69B4']}
              style={styles.finishButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.finishButtonText}>Criar Minha Conta</Text>
              <Ionicons name="arrow-forward-circle" size={32} color="#FFF" />
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  content: {
    paddingTop: 80,
    paddingHorizontal: 24,
    zIndex: 3,
  },
  progressContainer: {
    marginBottom: 40,
  },
  progressBar: {
    height: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 5,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  progressText: {
    fontSize: 15,
    color: '#FFF',
    textAlign: 'center',
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 40,
    position: 'relative',
  },
  glowRing: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: BotaLoveColors.primary,
  },
  glowRing2: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: '#FFD700',
  },
  iconGradient: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: BotaLoveColors.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.8,
    shadowRadius: 30,
    elevation: 20,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 17,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 35,
    paddingHorizontal: 10,
  },
  tipsContainer: {
    width: '100%',
    gap: 16,
    marginBottom: 30,
  },
  tipCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  tipCardGradient: {
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  tipIconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(249, 168, 37, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    letterSpacing: 0.3,
    marginBottom: 6,
    textAlign: 'center',
  },
  tipDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.75)',
    textAlign: 'center',
    lineHeight: 20,
  },
  buttonContainer: {
    paddingBottom: 40,
  },
  finishButton: {
    borderRadius: 32,
    overflow: 'hidden',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.8,
    shadowRadius: 24,
    elevation: 16,
  },
  finishButtonGradient: {
    flexDirection: 'row',
    paddingVertical: 22,
    paddingHorizontal: 36,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  finishButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});
