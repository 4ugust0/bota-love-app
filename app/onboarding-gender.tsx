import { BotaLoveColors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Animated,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

type Gender = 'man' | 'woman' | 'other' | null;

export default function OnboardingGenderScreen() {
  const router = useRouter();
  const [selectedGender, setSelectedGender] = useState<Gender>(null);
  const [scaleAnims] = useState({
    man: new Animated.Value(1),
    woman: new Animated.Value(1),
    other: new Animated.Value(1),
  });

  const handleSelectGender = (gender: Gender) => {
    if (!gender) return;
    setSelectedGender(gender);
    
    // Animação de "salto"
    Animated.sequence([
      Animated.timing(scaleAnims[gender], {
        toValue: 1.15,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnims[gender], {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleContinue = () => {
    if (!selectedGender) return;
    // TODO: Salvar no backend/AsyncStorage
    router.push('/onboarding-orientation');
  };

  const GenderOption = ({
    type,
    icon,
    label,
    color,
  }: {
    type: Gender;
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    color: string;
  }) => {
    if (!type) return null;
    const isSelected = selectedGender === type;

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => handleSelectGender(type)}
        style={styles.optionButton}
      >
        <Animated.View
          style={[
            styles.optionCard,
            isSelected && { borderColor: color },
            { transform: [{ scale: scaleAnims[type] }] },
          ]}
        >
          <View style={[styles.iconCircle, { backgroundColor: color + '20' }]}>
            <Ionicons name={icon} size={48} color={color} />
          </View>
          <Text style={[styles.optionLabel, isSelected && { color: color }]}>
            {label}
          </Text>
          {isSelected && (
            <View style={[styles.checkBadge, { backgroundColor: color }]}>
              <Ionicons name="checkmark" size={20} color="#FFF" />
            </View>
          )}
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient colors={['#1a0a00', '#000000']} style={styles.container}>
      <View style={styles.content}>
        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#FFF" />
        </TouchableOpacity>

        {/* Progress */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '25%' }]} />
          </View>
          <Text style={styles.progressText}>1 de 4</Text>
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Qual o seu gênero?</Text>
          <Text style={styles.subtitle}>
            Escolha a opção que melhor representa você
          </Text>
        </View>

        {/* Options */}
        <View style={styles.optionsContainer}>
          <GenderOption
            type="man"
            icon="male"
            label="Homem"
            color="#4A90E2"
          />
          <GenderOption
            type="woman"
            icon="female"
            label="Mulher"
            color="#E91E63"
          />
          <GenderOption
            type="other"
            icon="transgender"
            label="Outro / Prefiro não informar"
            color="#9C27B0"
          />
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          style={[
            styles.continueButton,
            !selectedGender && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!selectedGender}
        >
          <LinearGradient
            colors={
              selectedGender
                ? [BotaLoveColors.primary, '#d89515']
                : ['#666', '#444']
            }
            style={styles.continueButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.continueButtonText}>Continuar</Text>
            <Ionicons name="arrow-forward" size={24} color="#FFF" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  progressContainer: {
    marginBottom: 30,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: BotaLoveColors.primary,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
  },
  optionsContainer: {
    flex: 1,
    gap: 20,
  },
  optionButton: {
    width: '100%',
  },
  optionCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
    position: 'relative',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  optionLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: BotaLoveColors.secondary,
    flex: 1,
  },
  checkBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueButton: {
    marginTop: 20,
    marginBottom: 40,
    borderRadius: 30,
    overflow: 'hidden',
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueButtonGradient: {
    flexDirection: 'row',
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
});
