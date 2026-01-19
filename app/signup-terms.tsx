import { BotaLoveColors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useSignup } from '@/contexts/SignupContext';
import { functions } from '@/firebase/config';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { httpsCallable } from 'firebase/functions';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function SignupTermsScreen() {
  const router = useRouter();
  const { signupData, resetSignup } = useSignup();
  const { register } = useAuth();
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const checkAnim = useRef(new Animated.Value(0)).current;

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

  const handleToggleTerms = () => {
    setAcceptedTerms(!acceptedTerms);
    
    Animated.spring(checkAnim, {
      toValue: !acceptedTerms ? 1 : 0,
      friction: 4,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handleFinish = async () => {
    if (!acceptedTerms) return;
    
    setIsLoading(true);

    try {
      // Criar conta no Firebase com userType e isAgroUser
      const result = await register({
        email: signupData.email,
        password: signupData.password,
        name: signupData.name,
        userType: signupData.userType,
        isAgroUser: signupData.isAgroUser,
      });

      if (result.success) {
        // Enviar email de boas-vindas (não bloqueante)
        try {
          const sendWelcomeEmail = httpsCallable(functions, 'sendWelcomeEmail');
          sendWelcomeEmail({
            email: signupData.email,
            name: signupData.name,
          }).catch(err => console.warn('Erro ao enviar email de boas-vindas:', err));
        } catch (e) {
          console.warn('Erro ao chamar sendWelcomeEmail:', e);
        }

        // Limpar dados do signup
        resetSignup();
        
        // Ir direto para a tela inicial (home/tabs)
        router.replace('/(tabs)');
      } else {
        Alert.alert('Erro', result.error || 'Não foi possível criar a conta');
      }
    } catch (err: any) {
      console.error('Erro ao criar conta:', err);
      Alert.alert('Erro', 'Ocorreu um erro ao criar sua conta. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
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
            <View style={[styles.progressFill, { width: '100%' }]} />
          </View>
          <Text style={styles.progressText}>Etapa 5 de 5 - Última etapa! 🎉</Text>
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
            <Ionicons name="document-text" size={80} color={BotaLoveColors.primary} />
          </View>
          <Text style={styles.title}>Termos de Uso</Text>
          <Text style={styles.subtitle}>
            Leia e aceite para finalizar seu cadastro
          </Text>
        </Animated.View>

        {/* Terms Content */}
        <Animated.View
          style={[
            styles.termsContainer,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <ScrollView
            style={styles.termsScroll}
            contentContainerStyle={styles.termsContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.termsTitle}>Termos de Responsabilidade</Text>
            
            <Text style={styles.termsText}>
              Ao usar o Bota Love, você concorda em:
            </Text>

            <View style={styles.termItem}>
              <Ionicons name="checkmark-circle" size={20} color={BotaLoveColors.primary} />
              <Text style={styles.termText}>
                Fornecer informações verdadeiras e atualizadas
              </Text>
            </View>

            <View style={styles.termItem}>
              <Ionicons name="checkmark-circle" size={20} color={BotaLoveColors.primary} />
              <Text style={styles.termText}>
                Respeitar outros usuários e suas opiniões
              </Text>
            </View>

            <View style={styles.termItem}>
              <Ionicons name="checkmark-circle" size={20} color={BotaLoveColors.primary} />
              <Text style={styles.termText}>
                Não usar o app para fins ilícitos ou prejudiciais
              </Text>
            </View>

            <View style={styles.termItem}>
              <Ionicons name="checkmark-circle" size={20} color={BotaLoveColors.primary} />
              <Text style={styles.termText}>
                Manter a privacidade de terceiros
              </Text>
            </View>

            <View style={styles.termItem}>
              <Ionicons name="checkmark-circle" size={20} color={BotaLoveColors.primary} />
              <Text style={styles.termText}>
                Seguir as diretrizes da comunidade agro
              </Text>
            </View>

            <Text style={styles.termsFooter}>
              O Bota Love reserva o direito de suspender contas que violem estes termos.
            </Text>
          </ScrollView>
        </Animated.View>

        {/* Accept Checkbox */}
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={handleToggleTerms}
          activeOpacity={0.8}
        >
          <Animated.View
            style={[
              styles.checkbox,
              acceptedTerms && styles.checkboxChecked,
              {
                transform: [{ scale: checkAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.1],
                })}],
              },
            ]}
          >
            {acceptedTerms && (
              <Ionicons name="checkmark" size={24} color="#FFF" />
            )}
          </Animated.View>
          <Text style={styles.checkboxLabel}>
            Li e aceito os Termos de Responsabilidade
          </Text>
        </TouchableOpacity>

        {/* Finish Button */}
        <TouchableOpacity
          style={[
            styles.finishButton,
            (!acceptedTerms || isLoading) && styles.finishButtonDisabled,
          ]}
          onPress={handleFinish}
          disabled={!acceptedTerms || isLoading}
        >
          <LinearGradient
            colors={
              acceptedTerms && !isLoading
                ? [BotaLoveColors.primary, '#d89515']
                : ['#666', '#444']
            }
            style={styles.finishButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {isLoading ? (
              <>
                <Ionicons name="sync" size={24} color="#FFF" />
                <Text style={styles.finishButtonText}>Criando conta...</Text>
              </>
            ) : (
              <>
                <Ionicons name="checkmark-done" size={24} color="#FFF" />
                <Text style={styles.finishButtonText}>Finalizar Cadastro</Text>
              </>
            )}
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
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontWeight: '600',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
  },
  termsContainer: {
    flex: 1,
    marginBottom: 20,
  },
  termsScroll: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  termsContent: {
    padding: 20,
  },
  termsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: BotaLoveColors.primary,
    marginBottom: 16,
  },
  termsText: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 16,
    lineHeight: 22,
  },
  termItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  termText: {
    flex: 1,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
  },
  termsFooter: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 20,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  checkbox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: BotaLoveColors.primary,
    borderColor: BotaLoveColors.primary,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 15,
    color: '#FFF',
    fontWeight: '500',
    lineHeight: 20,
  },
  finishButton: {
    marginBottom: 40,
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: BotaLoveColors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 12,
  },
  finishButtonDisabled: {
    opacity: 0.5,
  },
  finishButtonGradient: {
    flexDirection: 'row',
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  finishButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
});
