/**
 * 🔥 BOTA LOVE APP - Signup Gender Preference Screen
 * 
 * Tela para o usuário escolher quem deseja ver:
 * - Homens
 * - Mulheres
 * - Ambos
 * 
 * @author Bota Love Team
 */

import { BotaLoveColors } from '@/constants/theme';
import { useSignup } from '@/contexts/SignupContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width } = Dimensions.get('window');

type GenderPreference = 'men' | 'women' | 'both' | null;

interface PreferenceOption {
  id: GenderPreference;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

const PREFERENCE_OPTIONS: PreferenceOption[] = [
  {
    id: 'women',
    title: 'Mulheres',
    description: 'Ver apenas perfis femininos',
    icon: 'woman',
    color: '#E91E63',
  },
  {
    id: 'men',
    title: 'Homens',
    description: 'Ver apenas perfis masculinos',
    icon: 'man',
    color: '#2196F3',
  },
  {
    id: 'both',
    title: 'Ambos',
    description: 'Ver todos os perfis',
    icon: 'people',
    color: '#9C27B0',
  },
];

export default function SignupGenderPreferenceScreen() {
  const router = useRouter();
  const { signupData, setGenderPreference: savePreferenceToContext } = useSignup();
  
  const [selectedPreference, setSelectedPreference] = useState<GenderPreference>(
    signupData.genderPreference || null
  );
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnims = useRef(
    PREFERENCE_OPTIONS.reduce((acc, opt) => {
      if (opt.id) acc[opt.id] = new Animated.Value(1);
      return acc;
    }, {} as Record<string, Animated.Value>)
  ).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleSelectPreference = (preference: GenderPreference) => {
    if (!preference) return;
    setSelectedPreference(preference);
    
    // Animação de seleção
    Animated.sequence([
      Animated.timing(scaleAnims[preference], {
        toValue: 1.05,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnims[preference], {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleContinue = () => {
    if (!selectedPreference) return;
    
    savePreferenceToContext(selectedPreference);
    router.push('/signup-email');
  };

  return (
    <LinearGradient colors={['#1a0a00', '#000000']} style={styles.container}>
      <View style={styles.content}>
        {/* Progress */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '40%' }]} />
          </View>
          <Text style={styles.progressText}>Etapa 3 de 6</Text>
        </View>

        {/* Header */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>

          <Text style={styles.emoji}>💕</Text>
          <Text style={styles.title}>Quem você quer conhecer?</Text>
          <Text style={styles.subtitle}>
            Escolha quem você gostaria de ver no app
          </Text>
        </Animated.View>

        {/* Options */}
        <Animated.View
          style={[
            styles.optionsContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {PREFERENCE_OPTIONS.map((option) => {
            if (!option.id) return null;
            const isSelected = selectedPreference === option.id;
            
            return (
              <TouchableOpacity
                key={option.id}
                activeOpacity={0.8}
                onPress={() => handleSelectPreference(option.id)}
                style={styles.optionButton}
              >
                <Animated.View
                  style={[
                    styles.optionCard,
                    isSelected && {
                      borderColor: option.color,
                      backgroundColor: `${option.color}15`,
                    },
                    { transform: [{ scale: scaleAnims[option.id] }] },
                  ]}
                >
                  <View
                    style={[
                      styles.iconContainer,
                      { backgroundColor: isSelected ? option.color : `${option.color}20` },
                    ]}
                  >
                    <Ionicons
                      name={option.icon}
                      size={32}
                      color={isSelected ? '#FFF' : option.color}
                    />
                  </View>

                  <View style={styles.optionTextContainer}>
                    <Text
                      style={[
                        styles.optionTitle,
                        isSelected && { color: option.color },
                      ]}
                    >
                      {option.title}
                    </Text>
                    <Text style={styles.optionDescription}>
                      {option.description}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.checkbox,
                      isSelected && {
                        backgroundColor: option.color,
                        borderColor: option.color,
                      },
                    ]}
                  >
                    {isSelected && (
                      <Ionicons name="checkmark" size={18} color="#FFF" />
                    )}
                  </View>
                </Animated.View>
              </TouchableOpacity>
            );
          })}
        </Animated.View>

        {/* Info */}
        <Animated.View
          style={[
            styles.infoContainer,
            { opacity: fadeAnim },
          ]}
        >
          <Ionicons name="information-circle" size={20} color={BotaLoveColors.primary} />
          <Text style={styles.infoText}>
            Você pode alterar essa preferência a qualquer momento nas configurações
          </Text>
        </Animated.View>

        {/* Continue Button */}
        <Animated.View
          style={[
            styles.buttonContainer,
            { opacity: fadeAnim },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.continueButton,
              !selectedPreference && styles.continueButtonDisabled,
            ]}
            onPress={handleContinue}
            disabled={!selectedPreference}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={
                selectedPreference
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
        </Animated.View>
      </View>
    </LinearGradient>
  );
}

// =============================================================================
// 🎨 ESTILOS
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  progressContainer: {
    marginBottom: 30,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: BotaLoveColors.primary,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
  },
  header: {
    marginBottom: 30,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emoji: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    lineHeight: 22,
  },
  optionsContainer: {
    flex: 1,
  },
  optionButton: {
    marginBottom: 16,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    marginLeft: 10,
    lineHeight: 18,
  },
  buttonContainer: {
    marginTop: 'auto',
  },
  continueButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
    marginRight: 8,
  },
});
