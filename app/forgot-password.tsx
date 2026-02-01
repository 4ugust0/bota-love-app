import { BotaLoveColors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { getFunctions, httpsCallable } from 'firebase/functions';
import React, { useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

// =============================================================================
// 📝 TIPOS
// =============================================================================

type Step = 'email' | 'code' | 'password' | 'success';

// =============================================================================
// 🎯 COMPONENTE PRINCIPAL
// =============================================================================

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const functions = getFunctions(undefined, 'southamerica-east1');
  
  // Estados
  const [currentStep, setCurrentStep] = useState<Step>('email');
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Refs para inputs do código
  const codeInputRefs = useRef<(TextInput | null)[]>([]);

  // ===========================================================================
  // 📧 ETAPA 1: ENVIAR CÓDIGO
  // ===========================================================================
  
  const handleSendCode = async () => {
    if (!email.trim()) {
      setErrorMessage('Digite seu email');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage('Digite um email válido');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    
    try {
      const sendPasswordResetCode = httpsCallable(functions, 'sendPasswordResetCode');
      const result = await sendPasswordResetCode({ email: email.toLowerCase() });
      const data = result.data as { success: boolean; message: string };
      
      if (data.success) {
        setCurrentStep('code');
        Alert.alert('Código Enviado! 📧', 'Verifique seu email e digite o código de 6 dígitos.');
      }
    } catch (error: any) {
      console.error('Erro ao enviar código:', error);
      const message = error?.message || 'Não foi possível enviar o código. Tente novamente.';
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  // ===========================================================================
  // 🔢 ETAPA 2: VERIFICAR CÓDIGO
  // ===========================================================================
  
  const handleCodeChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return;
    
    // Limpar erro quando começar a digitar novamente
    if (errorMessage) {
      setErrorMessage('');
    }
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-avançar para próximo input
    if (value && index < 5) {
      codeInputRefs.current[index + 1]?.focus();
    }
  };

  const handleCodeKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !code[index] && index > 0) {
      codeInputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyCode = async () => {
    const fullCode = code.join('');
    
    if (fullCode.length !== 6) {
      setErrorMessage('Digite o código completo de 6 dígitos');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    
    try {
      const verifyPasswordResetCode = httpsCallable(functions, 'verifyPasswordResetCode');
      const result = await verifyPasswordResetCode({ 
        email: email.toLowerCase(),
        code: fullCode,
      });
      const data = result.data as { success: boolean; message: string; resetToken?: string };
      
      if (data.success && data.resetToken) {
        setResetToken(data.resetToken);
        setCurrentStep('password');
        setErrorMessage('');
      }
    } catch (error: any) {
      console.error('Erro ao verificar código:', error);
      const message = error?.message || 'Código inválido ou expirado.';
      setErrorMessage(message);
      // Limpar código
      setCode(['', '', '', '', '', '']);
      codeInputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setCode(['', '', '', '', '', '']);
    setErrorMessage('');
    await handleSendCode();
  };

  // ===========================================================================
  // 🔐 ETAPA 3: NOVA SENHA
  // ===========================================================================
  
  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      setErrorMessage('Preencha todos os campos');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('As senhas não coincidem');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    
    try {
      const resetPassword = httpsCallable(functions, 'resetPassword');
      const result = await resetPassword({
        email: email.toLowerCase(),
        resetToken,
        newPassword,
      });
      const data = result.data as { success: boolean; message: string };
      
      if (data.success) {
        setCurrentStep('success');
      }
    } catch (error: any) {
      console.error('Erro ao redefinir senha:', error);
      const message = error?.message || 'Não foi possível redefinir a senha. Tente novamente.';
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  // ===========================================================================
  // 🎨 RENDERIZAÇÃO
  // ===========================================================================

  const renderEmailStep = () => (
    <View style={styles.card}>
      <View style={styles.iconHeader}>
        <Ionicons name="mail-outline" size={48} color={BotaLoveColors.primary} />
      </View>
      
      <Text style={styles.title}>Esqueceu a senha?</Text>
      <Text style={styles.subtitle}>
        Vamos te ajudar a recuperar o acesso
      </Text>

      <Text style={styles.description}>
        Digite seu e-mail cadastrado e enviaremos um código para redefinir sua senha.
      </Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>E-mail</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="mail" size={20} color={BotaLoveColors.neutralMedium} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="seu@email.com"
            placeholderTextColor={BotaLoveColors.neutralMedium}
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (errorMessage) setErrorMessage('');
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            editable={!isLoading}
          />
        </View>
      </View>

      {errorMessage ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={20} color="#E74C3C" />
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      ) : null}

      <TouchableOpacity
        style={[styles.primaryButton, (!email || isLoading) && styles.buttonDisabled]}
        onPress={handleSendCode}
        disabled={!email || isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.primaryButtonText}>Enviar código</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
        <Text style={styles.cancelButtonText}>Voltar ao login</Text>
      </TouchableOpacity>
    </View>
  );

  const renderCodeStep = () => (
    <View style={styles.card}>
      <View style={styles.iconHeader}>
        <Ionicons name="keypad-outline" size={48} color={BotaLoveColors.primary} />
      </View>
      
      <Text style={styles.title}>Digite o código</Text>
      <Text style={styles.subtitle}>
        Enviamos um código de 6 dígitos para
      </Text>
      <Text style={styles.emailHighlight}>{email}</Text>

      <View style={styles.codeContainer}>
        {code.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => {
              codeInputRefs.current[index] = ref;
            }}
            style={[
              styles.codeInput,
              digit && styles.codeInputFilled,
              errorMessage && styles.codeInputError,
            ]}
            value={digit}
            onChangeText={(value) => handleCodeChange(value, index)}
            onKeyPress={({ nativeEvent }) => handleCodeKeyPress(nativeEvent.key, index)}
            keyboardType="number-pad"
            maxLength={1}
            editable={!isLoading}
            selectTextOnFocus
          />
        ))}
      </View>

      {errorMessage ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={20} color="#E74C3C" />
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      ) : null}

      <TouchableOpacity
        style={[styles.primaryButton, (code.join('').length !== 6 || isLoading) && styles.buttonDisabled]}
        onPress={handleVerifyCode}
        disabled={code.join('').length !== 6 || isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.primaryButtonText}>Verificar código</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.resendButton} 
        onPress={handleResendCode}
        disabled={isLoading}
      >
        <Text style={styles.resendButtonText}>Não recebeu? Reenviar código</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.cancelButton} onPress={() => {
        setCurrentStep('email');
        setErrorMessage('');
      }}>
        <Ionicons name="arrow-back" size={18} color={BotaLoveColors.secondary} />
        <Text style={styles.cancelButtonText}>Alterar email</Text>
      </TouchableOpacity>
    </View>
  );

  const renderPasswordStep = () => (
    <View style={styles.card}>
      <View style={styles.iconHeader}>
        <Ionicons name="lock-closed-outline" size={48} color={BotaLoveColors.primary} />
      </View>
      
      <Text style={styles.title}>Nova senha</Text>
      <Text style={styles.subtitle}>
        Crie uma nova senha segura para sua conta
      </Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Nova senha</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="lock-closed" size={20} color={BotaLoveColors.neutralMedium} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Mínimo 6 caracteres"
            placeholderTextColor={BotaLoveColors.neutralMedium}
            value={newPassword}
            onChangeText={(text) => {
              setNewPassword(text);
              if (errorMessage) setErrorMessage('');
            }}
            secureTextEntry={!showPassword}
            editable={!isLoading}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons 
              name={showPassword ? 'eye-off' : 'eye'} 
              size={20} 
              color={BotaLoveColors.neutralMedium} 
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Confirmar senha</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="lock-closed" size={20} color={BotaLoveColors.neutralMedium} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Digite novamente"
            placeholderTextColor={BotaLoveColors.neutralMedium}
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              if (errorMessage) setErrorMessage('');
            }}
            secureTextEntry={!showConfirmPassword}
            editable={!isLoading}
          />
          <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
            <Ionicons 
              name={showConfirmPassword ? 'eye-off' : 'eye'} 
              size={20} 
              color={BotaLoveColors.neutralMedium} 
            />
          </TouchableOpacity>
        </View>
      </View>

      {errorMessage ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={20} color="#E74C3C" />
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      ) : newPassword && confirmPassword && newPassword !== confirmPassword ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={20} color="#E74C3C" />
          <Text style={styles.errorText}>As senhas não coincidem</Text>
        </View>
      ) : null}

      <TouchableOpacity
        style={[styles.primaryButton, (!newPassword || !confirmPassword || newPassword !== confirmPassword || isLoading) && styles.buttonDisabled]}
        onPress={handleResetPassword}
        disabled={!newPassword || !confirmPassword || newPassword !== confirmPassword || isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.primaryButtonText}>Redefinir senha</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderSuccessStep = () => (
    <View style={styles.card}>
      <View style={styles.successIconContainer}>
        <LinearGradient
          colors={[BotaLoveColors.primary, '#27AE60']}
          style={styles.successIconCircle}
        >
          <Ionicons name="checkmark" size={50} color="#FFF" />
        </LinearGradient>
      </View>
      
      <Text style={styles.successTitle}>Senha redefinida!</Text>
      <Text style={styles.successMessage}>
        Sua senha foi alterada com sucesso.{'\n'}
        Agora você pode fazer login com a nova senha.
      </Text>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => router.replace('/login')}
      >
        <Ionicons name="log-in-outline" size={20} color="#FFF" style={{ marginRight: 8 }} />
        <Text style={styles.primaryButtonText}>Ir para o login</Text>
      </TouchableOpacity>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'email':
        return renderEmailStep();
      case 'code':
        return renderCodeStep();
      case 'password':
        return renderPasswordStep();
      case 'success':
        return renderSuccessStep();
      default:
        return renderEmailStep();
    }
  };

  // Indicador de progresso
  const renderProgressIndicator = () => {
    if (currentStep === 'success') return null;
    
    const steps = ['email', 'code', 'password'];
    const currentIndex = steps.indexOf(currentStep);
    
    return (
      <View style={styles.progressContainer}>
        {steps.map((step, index) => (
          <View key={step} style={styles.progressStep}>
            <View style={[
              styles.progressDot,
              index <= currentIndex && styles.progressDotActive,
            ]}>
              {index < currentIndex ? (
                <Ionicons name="checkmark" size={12} color="#FFF" />
              ) : (
                <Text style={[
                  styles.progressDotText,
                  index <= currentIndex && styles.progressDotTextActive,
                ]}>
                  {index + 1}
                </Text>
              )}
            </View>
            {index < steps.length - 1 && (
              <View style={[
                styles.progressLine,
                index < currentIndex && styles.progressLineActive,
              ]} />
            )}
          </View>
        ))}
      </View>
    );
  };

  return (
    <LinearGradient
      colors={[BotaLoveColors.neutralLight, BotaLoveColors.primaryLight, BotaLoveColors.primary]}
      locations={[0, 0.7, 1]}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image
              source={require('@/assets/images/logotipo/logotipo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          {/* Progress Indicator */}
          {renderProgressIndicator()}

          {/* Current Step */}
          {renderCurrentStep()}
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
    justifyContent: 'center',
    paddingVertical: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  // Progress Indicator
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    paddingHorizontal: 40,
  },
  progressStep: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressDotActive: {
    backgroundColor: BotaLoveColors.primary,
  },
  progressDotText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFF',
  },
  progressDotTextActive: {
    color: '#FFF',
  },
  progressLine: {
    width: 40,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 5,
  },
  progressLineActive: {
    backgroundColor: BotaLoveColors.primary,
  },
  // Card
  card: {
    backgroundColor: BotaLoveColors.backgroundWhite,
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  iconHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: BotaLoveColors.secondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: BotaLoveColors.neutralDark,
    textAlign: 'center',
    marginBottom: 5,
  },
  emailHighlight: {
    fontSize: 15,
    fontWeight: '600',
    color: BotaLoveColors.primary,
    textAlign: 'center',
    marginBottom: 25,
  },
  description: {
    fontSize: 14,
    color: BotaLoveColors.neutralDark,
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 20,
  },
  // Inputs
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: BotaLoveColors.secondary,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BotaLoveColors.neutralLight,
    borderWidth: 1,
    borderColor: BotaLoveColors.neutralMedium,
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: BotaLoveColors.textPrimary,
  },
  // Code Input
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
    paddingHorizontal: 10,
  },
  codeInput: {
    width: 45,
    height: 55,
    borderWidth: 2,
    borderColor: BotaLoveColors.neutralMedium,
    borderRadius: 12,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: BotaLoveColors.secondary,
    backgroundColor: BotaLoveColors.neutralLight,
  },
  codeInputFilled: {
    borderColor: BotaLoveColors.primary,
    backgroundColor: '#FFF9E6',
  },
  codeInputError: {
    borderColor: '#E74C3C',
    backgroundColor: '#FFEBEE',
  },
  // Error Container
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#E74C3C',
    gap: 10,
  },
  errorText: {
    color: '#E74C3C',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  // Buttons
  primaryButton: {
    backgroundColor: BotaLoveColors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginBottom: 15,
    shadowColor: BotaLoveColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  cancelButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  cancelButtonText: {
    fontSize: 15,
    color: BotaLoveColors.secondary,
    fontWeight: '600',
  },
  resendButton: {
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  resendButtonText: {
    fontSize: 14,
    color: BotaLoveColors.primary,
    fontWeight: '600',
  },
  // Success
  successIconContainer: {
    alignItems: 'center',
    marginBottom: 25,
  },
  successIconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: BotaLoveColors.secondary,
    textAlign: 'center',
    marginBottom: 15,
  },
  successMessage: {
    fontSize: 16,
    color: BotaLoveColors.neutralDark,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
});
