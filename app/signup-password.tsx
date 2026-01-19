import { BotaLoveColors } from '@/constants/theme';
import { useSignup } from '@/contexts/SignupContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
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

export default function SignupPasswordScreen() {
  const router = useRouter();
  const { signupData, setPassword: savePasswordToContext } = useSignup();
  const [password, setPassword] = useState(signupData.password || '');
  const [showPassword, setShowPassword] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

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

  const getPasswordStrength = () => {
    if (password.length === 0) return { text: '', color: '#666', width: 0 };
    if (password.length < 6) return { text: 'Muito fraca', color: '#E74C3C', width: 25 };
    if (password.length < 8) return { text: 'Fraca', color: '#E67E22', width: 50 };
    if (password.length < 10) return { text: 'Boa', color: '#F39C12', width: 75 };
    return { text: 'Forte', color: '#27AE60', width: 100 };
  };

  const strength = getPasswordStrength();

  const handleContinue = () => {
    if (password.length < 6) {
      Alert.alert('Senha muito curta', 'Use pelo menos 6 caracteres');
      return;
    }
    // Salvar senha no contexto
    savePasswordToContext(password);
    router.push('/signup-confirm');
  };

  return (
    <LinearGradient colors={['#1a0a00', '#000000']} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
        <View style={styles.content}>
          {/* Back Button */}
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={28} color="#FFF" />
          </TouchableOpacity>

          {/* Progress */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '80%' }]} />
            </View>
            <Text style={styles.progressText}>Etapa 4 de 5</Text>
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
            <View style={styles.iconContainer}>
              <Ionicons name="lock-closed" size={80} color={BotaLoveColors.primary} />
            </View>
            <Text style={styles.title}>Crie uma senha segura</Text>
            <Text style={styles.subtitle}>
              Proteja sua conta com uma senha forte
            </Text>
          </Animated.View>

          {/* Input */}
          <Animated.View
            style={[
              styles.inputContainer,
              {
                opacity: fadeAnim,
              },
            ]}
          >
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.input}
                placeholder="Mínimo 6 caracteres"
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoFocus
                returnKeyType="next"
                onSubmitEditing={handleContinue}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={24}
                  color="rgba(255, 255, 255, 0.6)"
                />
              </TouchableOpacity>
            </View>

            {/* Password Strength */}
            {password.length > 0 && (
              <View style={styles.strengthContainer}>
                <View style={styles.strengthBar}>
                  <View
                    style={[
                      styles.strengthFill,
                      { width: `${strength.width}%`, backgroundColor: strength.color },
                    ]}
                  />
                </View>
                <Text style={[styles.strengthText, { color: strength.color }]}>
                  {strength.text}
                </Text>
              </View>
            )}

            <Text style={styles.hint}>
              Use letras, números e símbolos para mais segurança
            </Text>
          </Animated.View>

          {/* Continue Button */}
          <TouchableOpacity
            style={[
              styles.continueButton,
              password.length < 6 && styles.continueButtonDisabled,
            ]}
            onPress={handleContinue}
            disabled={password.length < 6}
          >
            <LinearGradient
              colors={
                password.length >= 6
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
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

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
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
    justifyContent: 'space-between',
    minHeight: 600,
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
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    marginBottom: 24,
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
  inputContainer: {
    flex: 1,
  },
  passwordContainer: {
    position: 'relative',
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 20,
    paddingRight: 60,
    fontSize: 20,
    color: '#FFF',
    textAlign: 'center',
    fontWeight: '600',
  },
  eyeButton: {
    position: 'absolute',
    right: 20,
    top: 20,
    padding: 4,
  },
  strengthContainer: {
    marginTop: 16,
  },
  strengthBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    marginBottom: 8,
  },
  strengthFill: {
    height: '100%',
    borderRadius: 3,
  },
  strengthText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  hint: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 20,
  },
  continueButton: {
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
