/**
 * 🔥 BOTA LOVE APP - Onboarding Goals Screen
 * 
 * Tela de seleção "O que você procura por aqui?"
 * Aparece após a seleção "Sou agro ou simpatizante do agro"
 * 
 * @author Bota Love Team
 */

import { BotaLoveColors } from '@/constants/theme';
import { useSignup } from '@/contexts/SignupContext';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
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

// =============================================================================
// 📝 TIPOS E CONSTANTES
// =============================================================================

interface GoalOption {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap | keyof typeof MaterialCommunityIcons.glyphMap;
  iconType: 'ionicons' | 'material';
  color: string;
}

const GOAL_OPTIONS: GoalOption[] = [
  {
    id: 'amizade_agro',
    title: 'Amizade no Agro',
    description: 'Conhecer pessoas e fazer novas amizades',
    icon: 'people',
    iconType: 'ionicons',
    color: '#4CAF50',
  },
  {
    id: 'namoro_agro',
    title: 'Namoro no Agro',
    description: 'Encontrar um relacionamento sério',
    icon: 'heart',
    iconType: 'ionicons',
    color: '#E91E63',
  },
  {
    id: 'casamento_agro',
    title: 'Casamento no Agro',
    description: 'Buscar um parceiro para a vida toda',
    icon: 'diamond',
    iconType: 'ionicons',
    color: '#9C27B0',
  },
  {
    id: 'eventos_agro',
    title: 'Eventos no Agro',
    description: 'Participar de festas e eventos rurais',
    icon: 'calendar',
    iconType: 'ionicons',
    color: '#FF9800',
  },
  {
    id: 'network_agro',
    title: 'Network no Agro',
    description: 'Expandir conexões profissionais',
    icon: 'briefcase',
    iconType: 'ionicons',
    color: '#2196F3',
  },
];

// =============================================================================
// 🎯 COMPONENTE PRINCIPAL
// =============================================================================

export default function OnboardingLookingForScreen() {
  const router = useRouter();
  const { signupData, setUserType } = useSignup();
  
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [networkEnabled, setNetworkEnabled] = useState(false);
  
  // Animações
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const toggleGoal = (goalId: string) => {
    setSelectedGoals(prev => {
      if (prev.includes(goalId)) {
        // Se desmarcar network_agro, desativa automaticamente
        if (goalId === 'network_agro') {
          setNetworkEnabled(false);
        }
        return prev.filter(id => id !== goalId);
      } else {
        // Se selecionar network_agro, ativa automaticamente
        if (goalId === 'network_agro') {
          setNetworkEnabled(true);
        }
        return [...prev, goalId];
      }
    });
  };

  const handleContinue = () => {
    if (selectedGoals.length === 0) return;
    
    // Salvar as seleções no contexto/storage para uso posterior
    // TODO: Adicionar ao SignupContext os campos lookingForGoals e networkEnabled
    
    // Continuar para próxima etapa do cadastro
    router.push('/signup-name');
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
      >
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

          <View style={styles.titleContainer}>
            <Text style={styles.emoji}>🎯</Text>
            <Text style={styles.title}>O que você procura por aqui?</Text>
            <Text style={styles.subtitle}>
              Selecione uma ou mais opções para personalizarmos sua experiência
            </Text>
          </View>
        </Animated.View>

        {/* Opções */}
        <Animated.View
          style={[
            styles.optionsContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {GOAL_OPTIONS.map((goal, index) => {
            const isSelected = selectedGoals.includes(goal.id);
            
            return (
              <TouchableOpacity
                key={goal.id}
                style={[
                  styles.optionCard,
                  isSelected && styles.optionCardSelected,
                  { borderColor: isSelected ? goal.color : 'rgba(255,255,255,0.1)' },
                ]}
                onPress={() => toggleGoal(goal.id)}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: isSelected ? goal.color : 'rgba(255,255,255,0.1)' },
                  ]}
                >
                  {goal.iconType === 'ionicons' ? (
                    <Ionicons
                      name={goal.icon as keyof typeof Ionicons.glyphMap}
                      size={28}
                      color={isSelected ? '#FFF' : goal.color}
                    />
                  ) : (
                    <MaterialCommunityIcons
                      name={goal.icon as keyof typeof MaterialCommunityIcons.glyphMap}
                      size={28}
                      color={isSelected ? '#FFF' : goal.color}
                    />
                  )}
                </View>

                <View style={styles.optionTextContainer}>
                  <Text style={[styles.optionTitle, isSelected && styles.optionTitleSelected]}>
                    {goal.title}
                  </Text>
                  <Text style={styles.optionDescription}>{goal.description}</Text>
                </View>

                <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                  {isSelected && <Ionicons name="checkmark" size={18} color="#FFF" />}
                </View>
              </TouchableOpacity>
            );
          })}
        </Animated.View>

        {/* Botão Continuar */}
        <Animated.View
          style={[
            styles.buttonContainer,
            { opacity: fadeAnim },
          ]}
        >
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
              <Text style={styles.continueButtonText}>
                Continuar
              </Text>
              <Ionicons name="arrow-forward" size={24} color="#FFF" />
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.selectionCount}>
            {selectedGoals.length === 0
              ? 'Selecione pelo menos uma opção'
              : `${selectedGoals.length} ${selectedGoals.length === 1 ? 'opção selecionada' : 'opções selecionadas'}`}
          </Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

// =============================================================================
// 🎨 ESTILOS
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
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
  titleContainer: {
    alignItems: 'center',
  },
  emoji: {
    fontSize: 50,
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: 22,
  },
  optionsContainer: {
    gap: 12,
    marginBottom: 24,
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
  optionCardSelected: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 4,
  },
  optionTitleSelected: {
    fontWeight: '700',
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
    borderColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  checkboxSelected: {
    backgroundColor: BotaLoveColors.primary,
    borderColor: BotaLoveColors.primary,
  },
  buttonContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  continueButton: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: BotaLoveColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
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
    gap: 10,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
  selectionCount: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 16,
  },
});
