import { BotaLoveColors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width } = Dimensions.get('window');

type Goal = 'amizade' | 'namoro' | 'casamento' | 'eventos' | 'network';

export default function OnboardingGoalsScreen() {
  const router = useRouter();
  const [selectedGoals, setSelectedGoals] = useState<Goal[]>([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(50)).current;
  const titleScaleAnim = useRef(new Animated.Value(0.8)).current;
  const sparkleAnims = useRef(
    Array.from({ length: 6 }, () => new Animated.Value(0))
  ).current;
  
  const [scaleAnims] = useState({
    amizade: new Animated.Value(1),
    namoro: new Animated.Value(1),
    casamento: new Animated.Value(1),
    eventos: new Animated.Value(1),
    network: new Animated.Value(1),
  });

  useEffect(() => {
    // Animação de entrada
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(titleScaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 500,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Animação de estrelas piscando
    sparkleAnims.forEach((anim, index) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * 300),
          Animated.timing(anim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });
  }, []);

  const Sparkle = ({ index }: { index: number }) => {
    const opacity = sparkleAnims[index].interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0.2, 1, 0.2],
    });

    const scale = sparkleAnims[index].interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0.5, 1.2, 0.5],
    });

    const positions = [
      { top: 120, left: 30 },
      { top: 140, right: 40 },
      { top: 200, left: 60 },
      { top: 180, right: 70 },
      { top: 250, left: 50 },
      { top: 240, right: 50 },
    ];

    return (
      <Animated.View
        style={[
          styles.sparkle,
          positions[index],
          { opacity, transform: [{ scale }] },
        ]}
      >
        <Ionicons name="star" size={16} color={BotaLoveColors.primary} />
      </Animated.View>
    );
  };

  const handleSelectGoal = (goal: Goal) => {
    if (selectedGoals.includes(goal)) {
      // Remover seleção
      setSelectedGoals(selectedGoals.filter((g) => g !== goal));
    } else if (selectedGoals.length < 2) {
      // Adicionar (máximo 2)
      setSelectedGoals([...selectedGoals, goal]);
      
      // Se selecionou Network, mostrar alerta sobre assinatura
      if (goal === 'network') {
        Alert.alert(
          '🌱 Network Rural',
          'Assine e coloque seus dados profissionais do seu LinkedIn!\n\nConecte-se com profissionais do agro de todo o Brasil.',
          [
            {
              text: 'Ver Planos',
              onPress: () => {
                // Redireciona para a loja com foco no Network Rural
                router.push('/(tabs)/store' as any);
              },
            },
            {
              text: 'Continuar',
              style: 'cancel',
            },
          ]
        );
      }
      
      // Animação de selo ✓ + vibração explosiva
      Animated.sequence([
        Animated.spring(scaleAnims[goal], {
          toValue: 1.15,
          friction: 2,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnims[goal], {
          toValue: 1,
          friction: 4,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const handleContinue = () => {
    if (selectedGoals.length === 0) return;
    
    // Animação de saída
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      router.push('/onboarding-final');
    });
  };

  const GoalOption = ({
    type,
    icon,
    label,
    color,
    description,
  }: {
    type: Goal;
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    color: string;
    description: string;
  }) => {
    const isSelected = selectedGoals.includes(type);
    const isDisabled = !isSelected && selectedGoals.length >= 2;

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => handleSelectGoal(type)}
        disabled={isDisabled}
        style={[styles.optionButton, isDisabled && { opacity: 0.5 }]}
      >
        <Animated.View
          style={[
            styles.optionCard,
            { transform: [{ scale: scaleAnims[type] }] },
          ]}
        >
          <LinearGradient
            colors={
              isSelected
                ? [color, color + 'CC']
                : ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']
            }
            style={[
              styles.cardGradient,
              isSelected && styles.cardGradientSelected,
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View
              style={[
                styles.iconCircle,
                {
                  backgroundColor: isSelected
                    ? 'rgba(255, 255, 255, 0.25)'
                    : color + '20',
                  borderColor: isSelected ? 'rgba(255, 255, 255, 0.4)' : color + '40',
                },
              ]}
            >
              <Ionicons
                name={icon}
                size={42}
                color={isSelected ? '#FFF' : color}
              />
            </View>
            
            <Text
              style={[
                styles.optionLabel,
                { color: isSelected ? '#FFF' : '#DDD' },
              ]}
            >
              {label}
            </Text>
            
            <Text
              style={[
                styles.optionDescription,
                { color: isSelected ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.5)' },
              ]}
            >
              {description}
            </Text>

            {isSelected && (
              <Animated.View style={styles.checkmarkBadge}>
                <View style={styles.checkmarkCircle}>
                  <Ionicons name="checkmark-circle" size={36} color="#FFF" />
                </View>
              </Animated.View>
            )}
          </LinearGradient>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[BotaLoveColors.secondary, '#1a0a00', '#000000']}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Estrelas piscando */}
      <View style={styles.sparklesContainer}>
        {sparkleAnims.map((_, index) => (
          <Sparkle key={index} index={index} />
        ))}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* Back Button */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={28} color="#FFF" />
          </TouchableOpacity>
        </Animated.View>

        {/* Progress */}
        <Animated.View
          style={[styles.progressContainer, { opacity: fadeAnim }]}
        >
          <View style={styles.progressBar}>
            <Animated.View style={[styles.progressFill, { width: '75%' }]}>
              <LinearGradient
                colors={[BotaLoveColors.primary, '#e89b1f']}
                style={StyleSheet.absoluteFillObject}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            </Animated.View>
          </View>
          <Text style={styles.progressText}>Etapa 3 de 4 - 75%</Text>
        </Animated.View>

        {/* Header */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ scale: titleScaleAnim }],
            },
          ]}
        >
          <View style={styles.titleIconContainer}>
            <Ionicons name="heart-circle" size={64} color={BotaLoveColors.primary} />
          </View>
          <Text style={styles.title}>O que você procura?</Text>
          <Text style={styles.subtitle}>
            Escolha até 2 objetivos para{' '}encontrar conexões perfeitas
          </Text>
          <View style={styles.counterBadge}>
            <Ionicons name="checkmark-done" size={18} color="#FFF" style={{ marginRight: 6 }} />
            <Text style={styles.counterText}>
              {selectedGoals.length} / 2 selecionadas
            </Text>
          </View>
        </Animated.View>

        {/* Options Grid */}
        <Animated.View
          style={[
            styles.optionsGrid,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideUpAnim }],
            },
          ]}
        >
          <GoalOption
            type="amizade"
            icon="people"
            label="Amizade"
            description="Encontrar parceiros de trabalho"
            color="#27AE60"
          />
          <GoalOption
            type="namoro"
            icon="heart"
            label="Namoro"
            description="Relacionamento sério"
            color="#E74C3C"
          />
          <GoalOption
            type="casamento"
            icon="heart-circle"
            label="Casamento"
            description="Alguém para a vida toda"
            color="#F39C12"
          />
          <GoalOption
            type="eventos"
            icon="calendar"
            label="Eventos"
            description="Participar de encontros"
            color="#E67E22"
          />
          <GoalOption
            type="network"
            icon="git-network"
            label="Networking"
            description="Expandir contatos profissionais"
            color="#3498DB"
          />
        </Animated.View>

        {/* Continue Button */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <TouchableOpacity
            style={[
              styles.continueButton,
              selectedGoals.length === 0 && styles.continueButtonDisabled,
            ]}
            onPress={handleContinue}
            disabled={selectedGoals.length === 0}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={
                selectedGoals.length > 0
                  ? [BotaLoveColors.primary, '#d89515']
                  : ['#666', '#444']
              }
              style={styles.continueButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.continueButtonText}>Avançar para o Final</Text>
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
  sparklesContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  sparkle: {
    position: 'absolute',
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
  backButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  progressContainer: {
    marginBottom: 30,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 4,
    marginBottom: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    fontWeight: '600',
  },
  header: {
    marginBottom: 30,
    alignItems: 'center',
  },
  titleIconContainer: {
    marginBottom: 16,
    shadowColor: BotaLoveColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
  },
  title: {
    fontSize: 34,
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
    marginBottom: 20,
  },
  counterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(249, 168, 37, 0.25)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: BotaLoveColors.primary,
    shadowColor: BotaLoveColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  counterText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFF',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    marginBottom: 20,
  },
  optionButton: {
    width: '48%',
  },
  optionCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  cardGradient: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 160,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    position: 'relative',
  },
  cardGradientSelected: {
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: BotaLoveColors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 2,
  },
  optionLabel: {
    fontSize: 17,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  optionDescription: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 4,
  },
  checkmarkBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  checkmarkCircle: {
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderRadius: 18,
    padding: 1,
  },
  continueButton: {
    marginTop: 10,
    marginBottom: 20,
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    letterSpacing: 0.5,
  },
});
