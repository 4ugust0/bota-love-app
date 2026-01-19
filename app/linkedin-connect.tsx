import { BotaLoveColors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import {
    startLinkedInAuth,
    fetchLinkedInProfile,
    saveLinkedInToProfile,
    removeLinkedInFromProfile,
    LinkedInProfileData,
    isValidLinkedInUrl,
    getLinkedInAuthUrl,
} from '@/firebase/linkedinService';
import { auth } from '@/firebase/config';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    KeyboardAvoidingView,
    Linking,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

// Interface local para dados da UI
interface LinkedInDisplayData {
  id: string;
  fullName: string;
  profileUrl: string;
  profilePicture?: string;
  headline?: string;
  currentPosition?: string;
  company?: string;
  isVerified?: boolean;
  industry?: string;
  location?: string;
  summary?: string;
  lastSync?: Date;
}

export default function LinkedInConnectScreen() {
  const router = useRouter();
  const { hasNetworkRural, networkSubscription, currentUser } = useAuth();
  
  const [linkedInUrl, setLinkedInUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [linkedInData, setLinkedInData] = useState<LinkedInDisplayData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authMethod, setAuthMethod] = useState<'oauth' | 'url'>('url');
  
  // Animações
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(30))[0];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // Verificar se já tem LinkedIn conectado (networkRural.linkedIn)
    const linkedIn = (currentUser as any)?.networkRural?.linkedIn;
    if (linkedIn?.profileUrl) {
      setIsConnected(true);
      setLinkedInData({
        id: linkedIn.profileUrl,
        fullName: currentUser?.profile?.name || '',
        profileUrl: linkedIn.profileUrl,
        headline: linkedIn.currentPosition,
        currentPosition: linkedIn.currentPosition,
        company: linkedIn.company,
      });
    }
  }, [currentUser]);

  // Conectar via OAuth (abre o navegador)
  const handleOAuthConnect = async () => {
    setError(null);
    setIsLoading(true);

    try {
      // O OAuth abrirá o navegador e retornará via deep link
      await startLinkedInAuth();
      // Nota: O sucesso será tratado pelo handler de deep link
      Alert.alert(
        'Redirecionando...',
        'Você será redirecionado para o LinkedIn. Após autorizar, volte ao app.',
        [{ text: 'Entendi' }]
      );
    } catch (err: any) {
      setError(err.message || 'Erro ao conectar com o LinkedIn.');
    } finally {
      setIsLoading(false);
    }
  };

  // Conectar via URL do perfil (mais simples)
  const handleUrlConnect = async () => {
    setError(null);

    if (!linkedInUrl.trim()) {
      setError('Por favor, insira o link do seu perfil LinkedIn');
      return;
    }

    if (!isValidLinkedInUrl(linkedInUrl)) {
      setError('Link inválido. Use o formato: linkedin.com/in/seu-perfil');
      return;
    }

    if (!auth.currentUser) {
      setError('Usuário não autenticado');
      return;
    }

    setIsLoading(true);

    try {
      const normalizedUrl = linkedInUrl.startsWith('http') ? linkedInUrl : `https://${linkedInUrl}`;
      
      // Criar dados básicos a partir da URL
      const profileData: LinkedInProfileData = {
        id: normalizedUrl,
        firstName: currentUser?.profile?.name?.split(' ')[0] || '',
        lastName: currentUser?.profile?.name?.split(' ').slice(1).join(' ') || '',
        fullName: currentUser?.profile?.name || '',
        email: currentUser?.email || '',
        publicProfileUrl: normalizedUrl,
      };
      
      // Salvar no Firebase
      await saveLinkedInToProfile(auth.currentUser.uid, profileData);
      
      setLinkedInData({
        id: normalizedUrl,
        fullName: currentUser?.profile?.name || '',
        profileUrl: normalizedUrl,
      });
      setIsConnected(true);
      
      Alert.alert(
        '✅ LinkedIn Vinculado!',
        'Seu perfil LinkedIn foi vinculado ao seu perfil Network Rural.',
        [{ text: 'Entendi' }]
      );
    } catch (err: any) {
      setError(err.message || 'Erro ao vincular LinkedIn.');
    } finally {
      setIsLoading(false);
    }
  };

  // Desconectar LinkedIn
  const handleDisconnect = () => {
    Alert.alert(
      'Desconectar LinkedIn',
      'Tem certeza que deseja remover a integração com o LinkedIn? Seus dados profissionais não aparecerão mais no seu perfil.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Desconectar',
          style: 'destructive',
          onPress: async () => {
            if (!auth.currentUser) return;
            
            setIsLoading(true);
            try {
              await removeLinkedInFromProfile(auth.currentUser.uid);
              setLinkedInData(null);
              setIsConnected(false);
              setLinkedInUrl('');
              Alert.alert('Sucesso', 'LinkedIn desconectado com sucesso.');
            } catch (err) {
              Alert.alert('Erro', 'Não foi possível desconectar o LinkedIn.');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  // Atualizar dados do LinkedIn
  const handleRefresh = async () => {
    if (!linkedInData || !auth.currentUser) return;
    
    setIsLoading(true);
    try {
      // Re-autenticar para obter novos dados (abre OAuth)
      await handleOAuthConnect();
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível atualizar os dados.');
    } finally {
      setIsLoading(false);
    }
  };

  // Abrir LinkedIn no navegador
  const openLinkedIn = () => {
    if (linkedInData?.profileUrl) {
      Linking.openURL(linkedInData.profileUrl);
    } else {
      Linking.openURL('https://www.linkedin.com');
    }
  };

  // Se não tem assinatura ativa do Network Rural
  if (!hasNetworkRural) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={BotaLoveColors.secondary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Conectar LinkedIn</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.lockedContainer}>
          <View style={styles.lockedIcon}>
            <Ionicons name="lock-closed" size={60} color={BotaLoveColors.neutralMedium} />
          </View>
          <Text style={styles.lockedTitle}>Recurso Premium</Text>
          <Text style={styles.lockedText}>
            A integração com LinkedIn está disponível apenas para assinantes do Network Rural Premium.
          </Text>
          <TouchableOpacity
            style={styles.subscribeButton}
            onPress={() => router.push('/(tabs)/network-rural' as any)}
          >
            <LinearGradient
              colors={['#2ECC71', '#27AE60']}
              style={styles.subscribeGradient}
            >
              <MaterialCommunityIcons name="sprout" size={20} color="#FFF" />
              <Text style={styles.subscribeButtonText}>Ver Planos Network Rural</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={BotaLoveColors.secondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Conectar LinkedIn</Text>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            {/* Info Card */}
            <View style={styles.infoCard}>
              <LinearGradient
                colors={['#0A66C2', '#004182']}
                style={styles.infoGradient}
              >
                <Ionicons name="logo-linkedin" size={40} color="#FFF" />
                <View style={styles.infoText}>
                  <Text style={styles.infoTitle}>Integração com LinkedIn</Text>
                  <Text style={styles.infoSubtitle}>
                    Importe automaticamente seus dados profissionais
                  </Text>
                </View>
              </LinearGradient>
            </View>

            {/* Status de Conexão */}
            {isConnected && linkedInData ? (
              // LinkedIn Conectado - Mostrar dados
              <View style={styles.connectedSection}>
                <View style={styles.connectedHeader}>
                  <View style={styles.connectedBadge}>
                    <Ionicons name="checkmark-circle" size={20} color="#2ECC71" />
                    <Text style={styles.connectedBadgeText}>LinkedIn Conectado</Text>
                  </View>
                  <TouchableOpacity onPress={handleRefresh} disabled={isLoading}>
                    {isLoading ? (
                      <ActivityIndicator size="small" color={BotaLoveColors.primary} />
                    ) : (
                      <Ionicons name="refresh" size={22} color={BotaLoveColors.primary} />
                    )}
                  </TouchableOpacity>
                </View>

                {/* Dados do LinkedIn */}
                <View style={styles.profileCard}>
                  <View style={styles.profileHeader}>
                    <View style={styles.profileAvatar}>
                      <Ionicons name="person" size={32} color="#FFF" />
                    </View>
                    <View style={styles.profileInfo}>
                      <Text style={styles.profilePosition}>
                        {linkedInData.currentPosition || 'Cargo não informado'}
                      </Text>
                      <Text style={styles.profileCompany}>
                        {linkedInData.company || 'Empresa não informada'}
                      </Text>
                    </View>
                    {linkedInData.isVerified && (
                      <View style={styles.verifiedBadge}>
                        <Ionicons name="shield-checkmark" size={16} color="#2ECC71" />
                      </View>
                    )}
                  </View>

                  <View style={styles.profileDetails}>
                    <View style={styles.detailRow}>
                      <Ionicons name="briefcase-outline" size={18} color={BotaLoveColors.neutralMedium} />
                      <Text style={styles.detailText}>
                        {linkedInData.industry || 'Setor não informado'}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Ionicons name="location-outline" size={18} color={BotaLoveColors.neutralMedium} />
                      <Text style={styles.detailText}>
                        {linkedInData.location || 'Localização não informada'}
                      </Text>
                    </View>
                    {linkedInData.summary && (
                      <View style={styles.summarySection}>
                        <Text style={styles.summaryLabel}>Resumo Profissional</Text>
                        <Text style={styles.summaryText}>{linkedInData.summary}</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.lastSync}>
                    <Ionicons name="time-outline" size={14} color={BotaLoveColors.neutralMedium} />
                    <Text style={styles.lastSyncText}>
                      Última sincronização: {linkedInData.lastSync?.toLocaleDateString('pt-BR')}
                    </Text>
                  </View>
                </View>

                {/* Link do perfil */}
                <TouchableOpacity
                  style={styles.viewProfileButton}
                  onPress={() => Linking.openURL(linkedInData.profileUrl)}
                >
                  <Ionicons name="open-outline" size={18} color="#0A66C2" />
                  <Text style={styles.viewProfileText}>Ver perfil no LinkedIn</Text>
                </TouchableOpacity>

                {/* Botão Desconectar */}
                <TouchableOpacity
                  style={styles.disconnectButton}
                  onPress={handleDisconnect}
                >
                  <Ionicons name="unlink-outline" size={18} color="#E74C3C" />
                  <Text style={styles.disconnectText}>Desconectar LinkedIn</Text>
                </TouchableOpacity>
              </View>
            ) : (
              // LinkedIn não conectado - Mostrar formulário
              <View style={styles.connectSection}>
                <Text style={styles.sectionTitle}>Cole o link do seu perfil</Text>
                <Text style={styles.sectionSubtitle}>
                  Copie a URL do seu perfil LinkedIn e cole no campo abaixo
                </Text>

                {/* Input */}
                <View style={[styles.inputContainer, error && styles.inputError]}>
                  <Ionicons name="link" size={20} color={BotaLoveColors.neutralMedium} />
                  <TextInput
                    style={styles.input}
                    placeholder="linkedin.com/in/seu-perfil"
                    placeholderTextColor={BotaLoveColors.neutralMedium}
                    value={linkedInUrl}
                    onChangeText={(text) => {
                      setLinkedInUrl(text);
                      setError(null);
                    }}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="url"
                  />
                  {linkedInUrl.length > 0 && (
                    <TouchableOpacity onPress={() => setLinkedInUrl('')}>
                      <Ionicons name="close-circle" size={20} color={BotaLoveColors.neutralMedium} />
                    </TouchableOpacity>
                  )}
                </View>

                {/* Error message */}
                {error && (
                  <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={16} color="#E74C3C" />
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                )}

                {/* Botão Conectar */}
                <TouchableOpacity
                  style={[
                    styles.connectButton,
                    (!linkedInUrl.trim() || isLoading) && styles.connectButtonDisabled,
                  ]}
                  onPress={handleUrlConnect}
                  disabled={!linkedInUrl.trim() || isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <>
                      <Ionicons name="logo-linkedin" size={20} color="#FFF" />
                      <Text style={styles.connectButtonText}>Conectar LinkedIn</Text>
                    </>
                  )}
                </TouchableOpacity>

                {/* Help link */}
                <TouchableOpacity style={styles.helpLink} onPress={openLinkedIn}>
                  <Ionicons name="help-circle-outline" size={16} color={BotaLoveColors.primary} />
                  <Text style={styles.helpLinkText}>
                    Como encontrar o link do meu perfil?
                  </Text>
                </TouchableOpacity>

                {/* Instruções */}
                <View style={styles.instructionsCard}>
                  <Text style={styles.instructionsTitle}>📋 Como conectar:</Text>
                  <View style={styles.instructionStep}>
                    <View style={styles.stepNumber}>
                      <Text style={styles.stepNumberText}>1</Text>
                    </View>
                    <Text style={styles.stepText}>
                      Acesse seu perfil no LinkedIn
                    </Text>
                  </View>
                  <View style={styles.instructionStep}>
                    <View style={styles.stepNumber}>
                      <Text style={styles.stepNumberText}>2</Text>
                    </View>
                    <Text style={styles.stepText}>
                      Copie a URL da barra de endereço
                    </Text>
                  </View>
                  <View style={styles.instructionStep}>
                    <View style={styles.stepNumber}>
                      <Text style={styles.stepNumberText}>3</Text>
                    </View>
                    <Text style={styles.stepText}>
                      Cole o link no campo acima e clique em "Conectar"
                    </Text>
                  </View>
                </View>

                {/* Benefícios */}
                <View style={styles.benefitsSection}>
                  <Text style={styles.benefitsTitle}>✨ Ao conectar você ganha:</Text>
                  {[
                    'Exibição automática do seu cargo e empresa',
                    'Selo de perfil profissional verificado',
                    'Maior credibilidade nas conexões',
                    'Destaque nos resultados de busca',
                  ].map((benefit, index) => (
                    <View key={index} style={styles.benefitItem}>
                      <Ionicons name="checkmark-circle" size={16} color="#2ECC71" />
                      <Text style={styles.benefitText}>{benefit}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BotaLoveColors.backgroundLight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: BotaLoveColors.secondary,
  },
  placeholder: {
    width: 40,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  // Locked State
  lockedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  lockedIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: BotaLoveColors.neutralLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  lockedTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: BotaLoveColors.textPrimary,
    marginBottom: 8,
  },
  lockedText: {
    fontSize: 15,
    color: BotaLoveColors.neutralMedium,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  subscribeButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  subscribeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    gap: 8,
  },
  subscribeButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  // Info Card
  infoCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
  },
  infoGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  infoText: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 4,
  },
  infoSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
  },
  // Connected Section
  connectedSection: {
    gap: 16,
  },
  connectedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  connectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F8F0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 6,
  },
  connectedBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2ECC71',
  },
  profileCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0A66C2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 12,
  },
  profilePosition: {
    fontSize: 16,
    fontWeight: '700',
    color: BotaLoveColors.textPrimary,
    marginBottom: 2,
  },
  profileCompany: {
    fontSize: 14,
    color: BotaLoveColors.neutralDark,
  },
  verifiedBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E8F8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileDetails: {
    gap: 10,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  detailText: {
    fontSize: 14,
    color: BotaLoveColors.textPrimary,
  },
  summarySection: {
    marginTop: 8,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: BotaLoveColors.neutralMedium,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryText: {
    fontSize: 14,
    color: BotaLoveColors.neutralDark,
    lineHeight: 20,
  },
  lastSync: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
  },
  lastSyncText: {
    fontSize: 12,
    color: BotaLoveColors.neutralMedium,
  },
  viewProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F4FC',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  viewProfileText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0A66C2',
  },
  disconnectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  disconnectText: {
    fontSize: 14,
    color: '#E74C3C',
    fontWeight: '500',
  },
  // Connect Section
  connectSection: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: BotaLoveColors.textPrimary,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: BotaLoveColors.neutralMedium,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    borderWidth: 2,
    borderColor: '#E8E8E8',
  },
  inputError: {
    borderColor: '#E74C3C',
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: BotaLoveColors.textPrimary,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  errorText: {
    fontSize: 13,
    color: '#E74C3C',
  },
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0A66C2',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 10,
    marginTop: 8,
  },
  connectButtonDisabled: {
    backgroundColor: BotaLoveColors.neutralMedium,
  },
  connectButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  helpLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  helpLinkText: {
    fontSize: 13,
    color: BotaLoveColors.primary,
    fontWeight: '500',
  },
  instructionsCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginTop: 8,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: BotaLoveColors.textPrimary,
    marginBottom: 16,
  },
  instructionStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: BotaLoveColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFF',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: BotaLoveColors.textPrimary,
    lineHeight: 20,
  },
  benefitsSection: {
    backgroundColor: '#F0FFF5',
    borderRadius: 16,
    padding: 20,
    marginTop: 8,
  },
  benefitsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: BotaLoveColors.textPrimary,
    marginBottom: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  benefitText: {
    fontSize: 14,
    color: BotaLoveColors.neutralDark,
  },
});
