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

export default function SignupConfirmScreen() {
  const router = useRouter();
  const { signupData } = useSignup();
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // Pega a senha do contexto
  const originalPassword = signupData.password;

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

  const passwordsMatch = confirmPassword === originalPassword && confirmPassword.length > 0;

  const handleContinue = () => {
    if (!passwordsMatch) {
      Alert.alert('Senhas não coincidem', 'As senhas precisam ser iguais');
      return;
    }
    router.push('/signup-terms');
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
              <Ionicons name="shield-checkmark" size={80} color={BotaLoveColors.primary} />
            </View>
            <Text style={styles.title}>Confirme sua senha</Text>
            <Text style={styles.subtitle}>
              Digite novamente para ter certeza
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
                style={[
                  styles.input,
                  confirmPassword.length > 0 && (passwordsMatch ? styles.inputSuccess : styles.inputError),
                ]}
                placeholder="Digite a senha novamente"
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPassword}
                autoFocus
                returnKeyType="done"
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
              
              {confirmPassword.length > 0 && (
                <View style={styles.matchIcon}>
                  {passwordsMatch ? (
                    <Ionicons name="checkmark-circle" size={28} color="#27AE60" />
                  ) : (
                    <Ionicons name="close-circle" size={28} color="#E74C3C" />
                  )}
                </View>
              )}
            </View>

            {confirmPassword.length > 0 && (
              <Text style={[styles.matchText, { color: passwordsMatch ? '#27AE60' : '#E74C3C' }]}>
                {passwordsMatch ? '✓ Senhas coincidem' : '✗ Senhas não coincidem'}
              </Text>
            )}
          </Animated.View>

          {/* Continue Button */}
          <TouchableOpacity
            style={[
              styles.continueButton,
              !passwordsMatch && styles.continueButtonDisabled,
            ]}
            onPress={handleContinue}
            disabled={!passwordsMatch}
          >
            <LinearGradient
              colors={
                passwordsMatch
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
    paddingRight: 100,
    fontSize: 20,
    color: '#FFF',
    textAlign: 'center',
    fontWeight: '600',
  },
  inputSuccess: {
    borderColor: '#27AE60',
  },
  inputError: {
    borderColor: '#E74C3C',
  },
  eyeButton: {
    position: 'absolute',
    right: 60,
    top: 20,
    padding: 4,
  },
  matchIcon: {
    position: 'absolute',
    right: 20,
    top: 18,
  },
  matchText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 16,
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
