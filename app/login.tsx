import { BotaLoveColors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
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

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await login(email, password);
      
      if (result.success) {
        // Login bem-sucedido
        router.push('/(tabs)');
      } else if (result.requiresVerification) {
        // Email não verificado - redirecionar para verificação
        setError('Por favor, verifique seu email antes de continuar');
        router.push('/signup-verify-email');
      } else {
        // Tratar erro específico
        const errorMessage = result.error || 'Erro ao fazer login';
        
        if (errorMessage.includes('credencial') || errorMessage.includes('senha')) {
          setError('E-mail ou senha incorretos');
        } else if (errorMessage.includes('não encontrado')) {
          setError('Usuário não encontrado');
        } else if (errorMessage.includes('tentativas')) {
          setError('Muitas tentativas. Tente novamente mais tarde');
        } else if (errorMessage.includes('suspensa')) {
          setError('Conta suspensa. Entre em contato com o suporte');
        } else {
          setError(errorMessage);
        }
      }
    } catch (err: any) {
      console.error('Erro inesperado no login:', err);
      setError('Erro ao fazer login. Tente novamente');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = () => {
    // Primeiro vai para o onboarding de perfil gamificado
    router.push('/onboarding-profile');
  };

  const handleForgotPassword = () => {
    router.push('/forgot-password');
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
              source={require('@/assets/images/logotipo/logotipo.jpeg')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          {/* Login Card */}
          <View style={styles.card}>
            <Text style={styles.title}>Bem-vindo de volta!</Text>
            <Text style={styles.subtitle}>Entre para continuar</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>E-mail</Text>
              <TextInput
                style={styles.input}
                placeholder="seu@email.com"
                placeholderTextColor={BotaLoveColors.neutralMedium}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Senha</Text>
              <TextInput
                style={styles.input}
                placeholder="Digite sua senha"
                placeholderTextColor={BotaLoveColors.neutralMedium}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="password"
              />
            </View>

            <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Esqueceu a senha?</Text>
            </TouchableOpacity>

            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <TouchableOpacity 
              style={[styles.loginButton, loading && styles.loginButtonDisabled]} 
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={styles.loginButtonText}>
                {loading ? 'Entrando...' : 'Entrar'}
              </Text>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>ou</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity style={styles.signupButton} onPress={handleSignup}>
              <Text style={styles.signupButtonText}>Criar conta</Text>
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
    justifyContent: 'center',
    paddingVertical: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 180,
    height: 180,
  },
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: BotaLoveColors.secondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: BotaLoveColors.neutralDark,
    textAlign: 'center',
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: BotaLoveColors.secondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: BotaLoveColors.neutralLight,
    borderWidth: 1,
    borderColor: BotaLoveColors.neutralMedium,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: BotaLoveColors.textPrimary,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: BotaLoveColors.secondary,
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: BotaLoveColors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: BotaLoveColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: BotaLoveColors.textLight,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: BotaLoveColors.neutralMedium,
  },
  dividerText: {
    marginHorizontal: 10,
    fontSize: 14,
    color: BotaLoveColors.neutralDark,
  },
  signupButton: {
    borderWidth: 2,
    borderColor: BotaLoveColors.secondary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  signupButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: BotaLoveColors.secondary,
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    textAlign: 'center',
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
});
