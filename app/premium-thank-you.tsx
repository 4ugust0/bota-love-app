/**
 * 🔥 BOTA LOVE APP - Premium Thank You
 * 
 * Página de agradecimento após assinatura Premium
 * 
 * @author Bota Love Team
 */

import { BotaLoveColors } from '@/constants/theme';
import { PREMIUM_PLANS } from '@/data/mockData';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function PremiumThankYouScreen() {
  const router = useRouter();
  const { planId, planTitle } = useLocalSearchParams<{ planId: string; planTitle: string }>();
  
  // Animações
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const confettiAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const plan = PREMIUM_PLANS.find(p => p.id === planId);

  useEffect(() => {
    // Sequência de animações
    Animated.sequence([
      // Animação do checkmark
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
      // Fade do conteúdo
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Confetti animation loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(confettiAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(confettiAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleGoToHome = () => {
    router.replace('/(tabs)');
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const getBillingCycleText = (cycle: string) => {
    switch (cycle) {
      case 'monthly': return 'mensal';
      case 'quarterly': return 'trimestral';
      case 'annual': return 'anual';
      default: return 'mensal';
    }
  };

  // Confetti particles
  const renderConfetti = () => {
    const confettiColors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
    const particles = [];
    
    for (let i = 0; i < 20; i++) {
      const randomX = Math.random() * SCREEN_WIDTH;
      const randomDelay = Math.random() * 1000;
      const randomDuration = 2000 + Math.random() * 1000;
      const randomColor = confettiColors[Math.floor(Math.random() * confettiColors.length)];
      
      particles.push(
        <Animated.View
          key={i}
          style={[
            styles.confettiParticle,
            {
              left: randomX,
              backgroundColor: randomColor,
              transform: [
                {
                  translateY: confettiAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-50, 800],
                  }),
                },
                {
                  rotate: confettiAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '720deg'],
                  }),
                },
              ],
              opacity: confettiAnim.interpolate({
                inputRange: [0, 0.8, 1],
                outputRange: [1, 1, 0],
              }),
            },
          ]}
        />
      );
    }
    
    return particles;
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FFF9F0', '#FFFFFF', '#FFF9F0']}
        style={styles.gradient}
      >
        {/* Confetti */}
        <View style={styles.confettiContainer}>
          {renderConfetti()}
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Success Icon */}
          <Animated.View
            style={[
              styles.iconContainer,
              {
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <LinearGradient
              colors={['#2ECC71', '#27AE60']}
              style={styles.iconCircle}
            >
              <Ionicons name="checkmark" size={60} color="#fff" />
            </LinearGradient>
          </Animated.View>

          {/* Title */}
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            <Text style={styles.title}>🎉 Parabéns!</Text>
            <Text style={styles.subtitle}>
              Sua assinatura foi ativada com sucesso
            </Text>
          </Animated.View>

          {/* Plan Card */}
          <Animated.View
            style={[
              styles.planCard,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.planBadge}>
              <Ionicons name="diamond" size={16} color="#fff" />
              <Text style={styles.planBadgeText}>PREMIUM</Text>
            </View>
            
            <Text style={styles.planName}>{planTitle || plan?.title}</Text>
            
            {plan && (
              <>
                <Text style={styles.planPrice}>
                  {formatCurrency(plan.price)}
                  <Text style={styles.planCycle}>
                    /{getBillingCycleText(plan.billing_cycle)}
                  </Text>
                </Text>
                
                <View style={styles.featuresList}>
                  {plan.features.slice(0, 3).map((feature, index) => (
                    <View key={index} style={styles.featureItem}>
                      <Ionicons name="checkmark-circle" size={18} color="#2ECC71" />
                      <Text style={styles.featureText}>{feature}</Text>
                    </View>
                  ))}
                </View>
              </>
            )}
          </Animated.View>

          {/* Email Notice */}
          <Animated.View
            style={[
              styles.emailNotice,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Ionicons name="mail" size={20} color={BotaLoveColors.primary} />
            <Text style={styles.emailText}>
              Enviamos um email de confirmação com os detalhes da sua assinatura
            </Text>
          </Animated.View>

          {/* Action Button */}
          <Animated.View
            style={[
              styles.buttonContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleGoToHome}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[BotaLoveColors.primary, '#C4956A']}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.buttonText}>Começar a usar</Text>
                <Ionicons name="heart" size={20} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>

            <Text style={styles.enjoyText}>
              Aproveite todos os recursos Premium! 💚
            </Text>
          </Animated.View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF9F0',
  },
  gradient: {
    flex: 1,
  },
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  confettiParticle: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  iconContainer: {
    marginBottom: 30,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2ECC71',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: BotaLoveColors.textPrimary,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  planCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    marginBottom: 25,
  },
  planBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BotaLoveColors.primary,
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    marginBottom: 15,
  },
  planBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  planName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: BotaLoveColors.textPrimary,
    marginBottom: 8,
  },
  planPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: BotaLoveColors.primary,
    marginBottom: 20,
  },
  planCycle: {
    fontSize: 16,
    fontWeight: 'normal',
    color: '#888',
  },
  featuresList: {
    width: '100%',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  featureText: {
    fontSize: 14,
    color: '#555',
    flex: 1,
  },
  emailNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9F0',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 12,
    gap: 12,
    marginBottom: 30,
  },
  emailText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  primaryButton: {
    width: '100%',
    borderRadius: 30,
    overflow: 'hidden',
    marginBottom: 15,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 10,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  enjoyText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
});
