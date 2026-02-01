/**
 * 🔥 BOTA LOVE APP - Signup Birthdate Screen
 * 
 * Tela para o usuário informar sua data de nascimento
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
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function SignupBirthdateScreen() {
  const router = useRouter();
  const { signupData, setBirthdate: saveBirthdateToContext } = useSignup();
  
  // Estado para dia, mês e ano separados
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [error, setError] = useState('');
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  
  // Refs para os inputs
  const monthRef = useRef<TextInput>(null);
  const yearRef = useRef<TextInput>(null);

  useEffect(() => {
    // Se já tem data salva, preencher os campos
    if (signupData.birthdate) {
      const date = new Date(signupData.birthdate);
      setDay(date.getDate().toString().padStart(2, '0'));
      setMonth((date.getMonth() + 1).toString().padStart(2, '0'));
      setYear(date.getFullYear().toString());
    }
    
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

  const handleDayChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    if (cleaned.length <= 2) {
      setDay(cleaned);
      setError('');
      if (cleaned.length === 2) {
        monthRef.current?.focus();
      }
    }
  };

  const handleMonthChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    if (cleaned.length <= 2) {
      setMonth(cleaned);
      setError('');
      if (cleaned.length === 2) {
        yearRef.current?.focus();
      }
    }
  };

  const handleYearChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    if (cleaned.length <= 4) {
      setYear(cleaned);
      setError('');
    }
  };

  const validateDate = (): boolean => {
    const dayNum = parseInt(day, 10);
    const monthNum = parseInt(month, 10);
    const yearNum = parseInt(year, 10);
    
    if (!day || !month || !year) {
      setError('Preencha a data completa');
      return false;
    }
    
    if (dayNum < 1 || dayNum > 31) {
      setError('Dia inválido');
      return false;
    }
    
    if (monthNum < 1 || monthNum > 12) {
      setError('Mês inválido');
      return false;
    }
    
    if (yearNum < 1900 || yearNum > new Date().getFullYear()) {
      setError('Ano inválido');
      return false;
    }
    
    // Verificar se a data é válida
    const date = new Date(yearNum, monthNum - 1, dayNum);
    if (date.getDate() !== dayNum || date.getMonth() !== monthNum - 1) {
      setError('Data inválida');
      return false;
    }
    
    // Verificar idade mínima (18 anos)
    const today = new Date();
    let age = today.getFullYear() - yearNum;
    const monthDiff = today.getMonth() - (monthNum - 1);
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dayNum)) {
      age--;
    }
    
    if (age < 18) {
      setError('Você precisa ter pelo menos 18 anos');
      return false;
    }
    
    if (age > 120) {
      setError('Data de nascimento inválida');
      return false;
    }
    
    return true;
  };

  const calculateAge = (): number | null => {
    if (!day || !month || !year || year.length < 4) return null;
    
    const dayNum = parseInt(day, 10);
    const monthNum = parseInt(month, 10);
    const yearNum = parseInt(year, 10);
    
    const today = new Date();
    let age = today.getFullYear() - yearNum;
    const monthDiff = today.getMonth() - (monthNum - 1);
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dayNum)) {
      age--;
    }
    
    return age >= 0 && age <= 120 ? age : null;
  };

  const handleContinue = () => {
    if (!validateDate()) return;
    
    const dayNum = parseInt(day, 10);
    const monthNum = parseInt(month, 10);
    const yearNum = parseInt(year, 10);
    
    // Salvar como string ISO
    const birthdate = new Date(yearNum, monthNum - 1, dayNum).toISOString();
    saveBirthdateToContext(birthdate);
    
    router.push('/signup-gender-preference');
  };

  const age = calculateAge();
  const isComplete = day.length === 2 && month.length === 2 && year.length === 4;

  return (
    <LinearGradient colors={['#1a0a00', '#000000']} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={styles.content}>
            {/* Progress */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '30%' }]} />
              </View>
              <Text style={styles.progressText}>Etapa 2 de 6</Text>
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

              <Text style={styles.emoji}>🎂</Text>
              <Text style={styles.title}>Quando você nasceu?</Text>
              <Text style={styles.subtitle}>
                Sua idade será exibida no seu perfil
              </Text>
            </Animated.View>

            {/* Date Input */}
            <Animated.View
              style={[
                styles.inputContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <View style={styles.dateInputRow}>
                <View style={styles.dateInputWrapper}>
                  <Text style={styles.dateLabel}>Dia</Text>
                  <TextInput
                    style={styles.dateInput}
                    placeholder="DD"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    value={day}
                    onChangeText={handleDayChange}
                    keyboardType="number-pad"
                    maxLength={2}
                  />
                </View>

                <Text style={styles.dateSeparator}>/</Text>

                <View style={styles.dateInputWrapper}>
                  <Text style={styles.dateLabel}>Mês</Text>
                  <TextInput
                    ref={monthRef}
                    style={styles.dateInput}
                    placeholder="MM"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    value={month}
                    onChangeText={handleMonthChange}
                    keyboardType="number-pad"
                    maxLength={2}
                  />
                </View>

                <Text style={styles.dateSeparator}>/</Text>

                <View style={[styles.dateInputWrapper, styles.yearWrapper]}>
                  <Text style={styles.dateLabel}>Ano</Text>
                  <TextInput
                    ref={yearRef}
                    style={styles.dateInput}
                    placeholder="AAAA"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    value={year}
                    onChangeText={handleYearChange}
                    keyboardType="number-pad"
                    maxLength={4}
                  />
                </View>
              </View>

              {error ? (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={18} color="#FF6B6B" />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : age !== null && age >= 18 ? (
                <View style={styles.agePreview}>
                  <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
                  <Text style={styles.ageText}>
                    Você tem {age} anos
                  </Text>
                </View>
              ) : null}
            </Animated.View>

            {/* Info */}
            <Animated.View
              style={[
                styles.infoContainer,
                { opacity: fadeAnim },
              ]}
            >
              <View style={styles.infoItem}>
                <Ionicons name="shield-checkmark" size={20} color={BotaLoveColors.primary} />
                <Text style={styles.infoText}>
                  Sua data de nascimento é usada para calcular sua idade
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="lock-closed" size={20} color={BotaLoveColors.primary} />
                <Text style={styles.infoText}>
                  Apenas sua idade será exibida, não a data completa
                </Text>
              </View>
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
                  !isComplete && styles.continueButtonDisabled,
                ]}
                onPress={handleContinue}
                disabled={!isComplete}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={
                    isComplete
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
        </ScrollView>
      </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
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
    marginBottom: 40,
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
  inputContainer: {
    marginBottom: 30,
  },
  dateInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  dateInputWrapper: {
    alignItems: 'center',
  },
  yearWrapper: {
    flex: 1,
    maxWidth: 100,
  },
  dateLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  dateInput: {
    width: 70,
    height: 60,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
    color: '#FFF',
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
  },
  dateSeparator: {
    fontSize: 32,
    color: 'rgba(255,255,255,0.3)',
    marginHorizontal: 12,
    marginBottom: 10,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    padding: 12,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderRadius: 8,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 14,
    marginLeft: 8,
  },
  agePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    padding: 12,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: 8,
  },
  ageText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  infoContainer: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 30,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginLeft: 12,
    lineHeight: 20,
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
