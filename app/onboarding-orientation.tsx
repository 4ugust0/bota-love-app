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

type Orientation = 'heterosexual' | 'homosexual' | 'other' | null;

export default function OnboardingOrientationScreen() {
  const router = useRouter();
  const [selectedOrientation, setSelectedOrientation] = useState<Orientation>(null);
  const [scaleAnims] = useState({
    heterosexual: new Animated.Value(1),
    homosexual: new Animated.Value(1),
    other: new Animated.Value(1),
  });

  const handleSelectOrientation = (orientation: Orientation) => {
    if (!orientation) return;
    setSelectedOrientation(orientation);
    
    // Animação de contorno brilhante
    Animated.sequence([
      Animated.timing(scaleAnims[orientation], {
        toValue: 1.08,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnims[orientation], {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleContinue = () => {
    if (!selectedOrientation) return;
    router.push('/onboarding-goals');
  };

  const OrientationOption = ({
    type,
    icon,
    label,
    color,
  }: {
    type: Orientation;
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    color: string;
  }) => {
    if (!type) return null;
    const isSelected = selectedOrientation === type;

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => handleSelectOrientation(type)}
        style={styles.optionButton}
      >
        <Animated.View
          style={[
            styles.optionCard,
            isSelected && { 
              borderColor: color,
              shadowColor: color,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.5,
              shadowRadius: 12,
              elevation: 8,
            },
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
              <Ionicons name="checkmark-circle" size={36} color="#FFF" />
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
            <View style={[styles.progressFill, { width: '50%' }]} />
          </View>
          <Text style={styles.progressText}>2 de 4</Text>
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Qual é a sua orientação sexual?</Text>
          <Text style={styles.subtitle}>
            Isso nos ajuda a encontrar conexões compatíveis
          </Text>
        </View>

        {/* Options */}
        <View style={styles.optionsContainer}>
          <OrientationOption
            type="heterosexual"
            icon="heart"
            label="Heterossexual"
            color="#E74C3C"
          />
          <OrientationOption
            type="homosexual"
            icon="heart-circle"
            label="Homossexual"
            color="#9B59B6"
          />
          <OrientationOption
            type="other"
            icon="help-circle"
            label="Prefiro não informar"
            color="#95A5A6"
          />
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          style={[
            styles.continueButton,
            !selectedOrientation && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!selectedOrientation}
        >
          <LinearGradient
            colors={
              selectedOrientation
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
    fontSize: 30,
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
    position: 'absolute',
    top: 12,
    right: 12,
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
