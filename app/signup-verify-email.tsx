import { BotaLoveColors } from '@/constants/theme';
import { useSignup } from '@/contexts/SignupContext';
import { app } from '@/firebase/config';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { getFunctions, httpsCallable } from 'firebase/functions';
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

export default function SignupVerifyEmailScreen() {
  const router = useRouter();
  const { signupData, setEmailVerified } = useSignup();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [error, setError] = useState('');
  const inputRefs = useRef<(TextInput | null)[]>([]);
  
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

    // Timer para reenviar código
    const timer = setInterval(() => {
      setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleCodeChange = (text: string, index: number) => {
    // Apenas números
    if (text && !/^\d+$/.test(text)) return;

    setError(''); // Limpar erro ao digitar
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    // Auto-focus no próximo campo
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Verificar automaticamente quando todos os campos estiverem preenchidos
    if (newCode.every(digit => digit !== '') && !isVerifying) {
      handleVerify(newCode.join(''));
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (verificationCode?: string) => {
    const codeToVerify = verificationCode || code.join('');
    
    if (codeToVerify.length !== 6) {
      setError('Por favor, digite o código de 6 dígitos');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      // Chamar Cloud Function para verificar código (não requer autenticação)
      const functions = getFunctions(app, 'southamerica-east1');
      const verifyEmailCodeFn = httpsCallable(functions, 'verifyEmailCode');
      
      // Verificar o código
      const result = await verifyEmailCodeFn({
        email: signupData.email,
        code: codeToVerify,
      });

      const data = result.data as { success: boolean; message?: string; verified?: boolean };
      
      if (data.success && data.verified) {
        setEmailVerified(true);
        // Ir direto para a próxima tela sem alert
        router.push('/signup-password');
      } else {
        setError(data.message || 'Código inválido');
      }
    } catch (err: any) {
      console.error('Erro ao verificar código:', err);
      const errorMessage = err.message || '';
      
      // Mostrar mensagens específicas do backend
      if (errorMessage.includes('incorreto') || errorMessage.includes('expirado') || 
          errorMessage.includes('tentativas') || errorMessage.includes('encontrado')) {
        setError(errorMessage);
      } else {
        setError('Erro ao verificar o código. Tente novamente.');
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    if (resendTimer > 0) return;

    try {
      const functions = getFunctions(app, 'southamerica-east1');
      const sendVerificationEmail = httpsCallable(functions, 'sendVerificationEmail');
      
      await sendVerificationEmail({
        email: signupData.email,
        name: signupData.name || 'Usuário',
      });

      Alert.alert('Código reenviado', `Um novo código foi enviado para ${signupData.email}`);
      setResendTimer(60);
      setCode(['', '', '', '', '', '']);
      setError('');
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      console.error('Erro ao reenviar código:', err);
      
      const errorMessage = err.message || '';
      if (errorMessage.includes('Limite') || errorMessage.includes('Aguarde')) {
        Alert.alert('Aguarde', errorMessage);
      } else {
        Alert.alert('Erro', 'Não foi possível reenviar o código. Tente novamente.');
      }
    }
  };

  const isCodeComplete = code.every(digit => digit !== '');

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
              <View style={[styles.progressFill, { width: '50%' }]} />
            </View>
            <Text style={styles.progressText}>Etapa 3 de 5</Text>
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
              <View style={styles.iconCircle}>
                <Ionicons name="mail-open" size={60} color={BotaLoveColors.primary} />
              </View>
            </View>
            <Text style={styles.title}>Verifique seu e-mail</Text>
            <Text style={styles.subtitle}>
              Enviamos um código de 6 dígitos para{'\n'}
              <Text style={styles.emailText}>{signupData.email || 'seu e-mail'}</Text>
            </Text>
          </Animated.View>

          {/* Code Input */}
          <Animated.View
            style={[
              styles.codeContainer,
              {
                opacity: fadeAnim,
              },
            ]}
          >
            <View style={styles.codeInputs}>
              {code.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => {
                    inputRefs.current[index] = ref;
                  }}
                  style={[
                    styles.codeInput,
                    digit && styles.codeInputFilled,
                    error && styles.codeInputError,
                  ]}
                  value={digit}
                  onChangeText={(text) => handleCodeChange(text, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  keyboardType="number-pad"
                  maxLength={1}
                  selectTextOnFocus
                  autoFocus={index === 0}
                />
              ))}
            </View>

            {/* Error Message */}
            {error ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={18} color="#E74C3C" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Resend Code */}
            <View style={styles.resendContainer}>
              <Text style={styles.resendText}>Não recebeu o código?</Text>
              <TouchableOpacity
                onPress={handleResendCode}
                disabled={resendTimer > 0}
              >
                <Text
                  style={[
                    styles.resendButton,
                    resendTimer > 0 && styles.resendButtonDisabled,
                  ]}
                >
                  {resendTimer > 0
                    ? `Reenviar em ${resendTimer}s`
                    : 'Reenviar código'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Info */}
            <View style={styles.infoBox}>
              <Ionicons name="information-circle" size={20} color={BotaLoveColors.primary} />
              <Text style={styles.infoText}>
                O código expira em 10 minutos
              </Text>
            </View>
          </Animated.View>

          {/* Verify Button */}
          <TouchableOpacity
            style={[
              styles.verifyButton,
              (!isCodeComplete || isVerifying) && styles.verifyButtonDisabled,
            ]}
            onPress={() => handleVerify()}
            disabled={!isCodeComplete || isVerifying}
          >
            <LinearGradient
              colors={
                isCodeComplete && !isVerifying
                  ? [BotaLoveColors.primary, '#d89515']
                  : ['#666', '#444']
              }
              style={styles.verifyButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {isVerifying ? (
                <>
                  <Text style={styles.verifyButtonText}>Verificando...</Text>
                  <Ionicons name="sync" size={24} color="#FFF" />
                </>
              ) : (
                <>
                  <Text style={styles.verifyButtonText}>Verificar</Text>
                  <Ionicons name="checkmark-circle" size={24} color="#FFF" />
                </>
              )}
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
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(249, 168, 37, 0.15)',
    justifyContent: 'center',
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
  emailText: {
    color: BotaLoveColors.primary,
    fontWeight: '700',
  },
  codeContainer: {
    flex: 1,
    alignItems: 'center',
  },
  codeInputs: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  codeInput: {
    width: 50,
    height: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
  },
  codeInputFilled: {
    backgroundColor: 'rgba(249, 168, 37, 0.15)',
    borderColor: BotaLoveColors.primary,
  },
  codeInputError: {
    borderColor: '#E74C3C',
    backgroundColor: 'rgba(231, 76, 60, 0.1)',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(231, 76, 60, 0.1)',
    borderRadius: 8,
  },
  errorText: {
    color: '#E74C3C',
    fontSize: 14,
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  resendText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 8,
  },
  resendButton: {
    fontSize: 16,
    fontWeight: '700',
    color: BotaLoveColors.primary,
  },
  resendButtonDisabled: {
    color: 'rgba(255, 255, 255, 0.4)',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(249, 168, 37, 0.1)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(249, 168, 37, 0.3)',
  },
  infoText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  verifyButton: {
    marginBottom: 40,
    borderRadius: 30,
    overflow: 'hidden',
  },
  verifyButtonDisabled: {
    opacity: 0.5,
  },
  verifyButtonGradient: {
    flexDirection: 'row',
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  verifyButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
});
