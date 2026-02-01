import { BotaLoveColors } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
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

export default function SignupScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const handleSignup = () => {
    console.log('handleSignup called');
    console.log('Form values:', { name, email, password, confirmPassword, acceptedTerms });

    if (!name.trim()) {
      Alert.alert('Erro', 'Preencha o nome completo');
      return;
    }

    if (!email.trim()) {
      Alert.alert('Erro', 'Preencha o e-mail');
      return;
    }

    if (!password) {
      Alert.alert('Erro', 'Preencha a senha');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Erro', 'A senha deve ter no mínimo 6 caracteres');
      return;
    }

    if (!confirmPassword) {
      Alert.alert('Erro', 'Confirme sua senha');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return;
    }

    if (!acceptedTerms) {
      Alert.alert('Erro', 'Você precisa aceitar os Termos de Responsabilidade');
      return;
    }

    // Sucesso - navegar para onboarding
    console.log('Signup successful, navigating to onboarding-profile');
    router.push('/onboarding-profile');
  };

  const handleReadTerms = () => {
    // TODO: Open terms modal or screen
    Alert.alert(
      'Termos de Responsabilidade',
      'Ao usar o Bota Love, você concorda em:\n\n• Fornecer informações verdadeiras\n• Respeitar outros usuários\n• Não usar o app para fins ilícitos\n• Manter a privacidade de terceiros\n• Seguir as diretrizes da comunidade\n\nO Bota Love reserva o direito de suspender contas que violem estes termos.'
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

          {/* Signup Card */}
          <View style={styles.card}>
            <Text style={styles.title}>Criar conta</Text>
            <Text style={styles.subtitle}>Junte-se ao Bota Love</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nome completo</Text>
              <TextInput
                style={styles.input}
                placeholder="Seu nome"
                placeholderTextColor={BotaLoveColors.neutralMedium}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                autoComplete="name"
              />
            </View>

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
                placeholder="Mínimo 6 caracteres"
                placeholderTextColor={BotaLoveColors.neutralMedium}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="password"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirmar senha</Text>
              <TextInput
                style={styles.input}
                placeholder="Digite a senha novamente"
                placeholderTextColor={BotaLoveColors.neutralMedium}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoComplete="password"
              />
            </View>

            {/* Terms checkbox */}
            <View style={styles.termsContainer}>
              <TouchableOpacity
                style={styles.checkbox}
                onPress={() => setAcceptedTerms(!acceptedTerms)}
              >
                <View
                  style={[
                    styles.checkboxBox,
                    acceptedTerms && styles.checkboxBoxChecked,
                  ]}
                >
                  {acceptedTerms && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.termsText}>
                  Aceito os{' '}
                  <Text style={styles.termsLink} onPress={handleReadTerms}>
                    Termos de Responsabilidade
                  </Text>
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={styles.signupButton} 
              onPress={handleSignup}
              activeOpacity={0.7}
            >
              <Text style={styles.signupButtonText}>Criar conta</Text>
            </TouchableOpacity>

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Já tem uma conta? </Text>
              <TouchableOpacity onPress={() => router.back()}>
                <Text style={styles.loginLink}>Entrar</Text>
              </TouchableOpacity>
            </View>
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
    paddingVertical: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 120,
    height: 120,
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
    marginBottom: 40,
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
    marginBottom: 25,
  },
  inputContainer: {
    marginBottom: 16,
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
  termsContainer: {
    marginVertical: 20,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: BotaLoveColors.secondary,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxBoxChecked: {
    backgroundColor: BotaLoveColors.primary,
    borderColor: BotaLoveColors.primary,
  },
  checkmark: {
    color: BotaLoveColors.textLight,
    fontSize: 16,
    fontWeight: 'bold',
  },
  termsText: {
    fontSize: 14,
    color: BotaLoveColors.textPrimary,
    flex: 1,
  },
  termsLink: {
    color: BotaLoveColors.secondary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  signupButton: {
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
  signupButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: BotaLoveColors.textLight,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
    color: BotaLoveColors.neutralDark,
  },
  loginLink: {
    fontSize: 14,
    color: BotaLoveColors.secondary,
    fontWeight: '600',
  },
});
