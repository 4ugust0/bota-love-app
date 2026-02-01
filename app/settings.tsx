/**
 * 🔥 BOTA LOVE APP - Settings Screen
 * 
 * Tela de configurações do usuário com opções de:
 * - Alterar senha
 * - Notificações
 * - Privacidade
 * - Conta
 * 
 * @author Bota Love Team
 */

import { BotaLoveColors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { changePassword } from '@/firebase/authService';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function SettingsScreen() {
  const router = useRouter();
  const { currentUser, logout } = useAuth();
  const [changePasswordModalVisible, setChangePasswordModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const handleChangePassword = async () => {
    // Validações
    if (!currentPassword) {
      Alert.alert('Atenção', 'Digite sua senha atual');
      return;
    }
    if (!newPassword) {
      Alert.alert('Atenção', 'Digite a nova senha');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Atenção', 'A nova senha deve ter pelo menos 6 caracteres');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Atenção', 'As senhas não coincidem');
      return;
    }

    setIsChangingPassword(true);

    try {
      const result = await changePassword(currentPassword, newPassword);

      if (result.success) {
        Alert.alert(
          'Sucesso! 🔐',
          'Sua senha foi alterada com sucesso.',
          [{ text: 'OK', onPress: () => {
            setChangePasswordModalVisible(false);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
          }}]
        );
      } else {
        Alert.alert('Erro', result.error || 'Não foi possível alterar a senha');
      }
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao alterar a senha');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Excluir Conta',
      'Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: () => {
            // TODO: Implementar exclusão de conta
            Alert.alert('Em breve', 'A funcionalidade de exclusão de conta será implementada em breve.');
          }
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair da sua conta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sair', 
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/login');
          }
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[BotaLoveColors.secondary, '#1a0a00']}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Configurações</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Conta */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Conta</Text>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => setChangePasswordModalVisible(true)}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#E3F2FD' }]}>
                <Ionicons name="lock-closed" size={20} color="#1976D2" />
              </View>
              <Text style={styles.menuItemText}>Alterar Senha</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={BotaLoveColors.neutralMedium} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#E8F5E9' }]}>
                <Ionicons name="mail" size={20} color="#388E3C" />
              </View>
              <View>
                <Text style={styles.menuItemText}>Email</Text>
                <Text style={styles.menuItemSubtext}>{currentUser?.email}</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Privacidade */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacidade</Text>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/discovery-settings' as any)}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#FFF3E0' }]}>
                <Ionicons name="eye" size={20} color={BotaLoveColors.primary} />
              </View>
              <Text style={styles.menuItemText}>Configurações de Descoberta</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={BotaLoveColors.neutralMedium} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#FCE4EC' }]}>
                <Ionicons name="shield-checkmark" size={20} color="#C2185B" />
              </View>
              <Text style={styles.menuItemText}>Dados e Privacidade</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={BotaLoveColors.neutralMedium} />
          </TouchableOpacity>
        </View>

        {/* Preferências Agrolove - Filtro Avançado Premium */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Preferências Agrolove</Text>
            <View style={styles.premiumBadge}>
              <Text style={styles.premiumBadgeText}>PREMIUM</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.agroloveCard}
            onPress={() => router.push('/agrolove-preferences' as any)}
          >
            <LinearGradient
              colors={['#FFF8E1', '#FFFDE7']}
              style={styles.agroloveCardGradient}
            >
              <View style={styles.agroloveCardContent}>
                <View style={styles.agroloveIconContainer}>
                  <Text style={styles.agroloveIcon}>🌾</Text>
                </View>
                <View style={styles.agroloveTextContainer}>
                  <Text style={styles.agroloveTitle}>Filtro Avançado do Agro</Text>
                  <Text style={styles.agroloveDescription}>
                    Encontre pessoas com as preferências que você procura
                  </Text>
                  <View style={styles.agrolovePrice}>
                    <Text style={styles.agrolovePriceText}>R$ 39,90</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={24} color={BotaLoveColors.primary} />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Suporte */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Suporte</Text>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/help' as any)}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#E0F7FA' }]}>
                <Ionicons name="help-circle" size={20} color="#00838F" />
              </View>
              <Text style={styles.menuItemText}>Ajuda e Suporte</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={BotaLoveColors.neutralMedium} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/terms' as any)}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#F3E5F5' }]}>
                <Ionicons name="document-text" size={20} color="#7B1FA2" />
              </View>
              <Text style={styles.menuItemText}>Termos e Privacidade</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={BotaLoveColors.neutralMedium} />
          </TouchableOpacity>
        </View>

        {/* Ações da Conta */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ações</Text>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={handleLogout}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#FFF3E0' }]}>
                <Ionicons name="log-out" size={20} color={BotaLoveColors.primary} />
              </View>
              <Text style={styles.menuItemText}>Sair da Conta</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={handleDeleteAccount}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#FFEBEE' }]}>
                <Ionicons name="trash" size={20} color="#D32F2F" />
              </View>
              <Text style={[styles.menuItemText, { color: '#D32F2F' }]}>Excluir Conta</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Versão */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Bota Love v1.0.0</Text>
        </View>
      </ScrollView>

      {/* Modal de Alterar Senha */}
      <Modal
        visible={changePasswordModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setChangePasswordModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalContainer}
        >
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setChangePasswordModalVisible(false)}>
              <Ionicons name="close" size={28} color={BotaLoveColors.secondary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Alterar Senha</Text>
            <View style={{ width: 28 }} />
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Senha Atual</Text>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Digite sua senha atual"
                  placeholderTextColor="#999"
                  secureTextEntry={!showCurrentPassword}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                  style={styles.eyeButton}
                >
                  <Ionicons
                    name={showCurrentPassword ? 'eye-off' : 'eye'}
                    size={22}
                    color="#999"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nova Senha</Text>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Digite a nova senha"
                  placeholderTextColor="#999"
                  secureTextEntry={!showNewPassword}
                  value={newPassword}
                  onChangeText={setNewPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowNewPassword(!showNewPassword)}
                  style={styles.eyeButton}
                >
                  <Ionicons
                    name={showNewPassword ? 'eye-off' : 'eye'}
                    size={22}
                    color="#999"
                  />
                </TouchableOpacity>
              </View>
              <Text style={styles.inputHint}>Mínimo de 6 caracteres</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Confirmar Nova Senha</Text>
              <TextInput
                style={styles.input}
                placeholder="Confirme a nova senha"
                placeholderTextColor="#999"
                secureTextEntry={!showNewPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </View>

            <TouchableOpacity
              style={[styles.savePasswordButton, isChangingPassword && styles.saveButtonDisabled]}
              onPress={handleChangePassword}
              disabled={isChangingPassword}
            >
              {isChangingPassword ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.savePasswordButtonText}>Alterar Senha</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#FFF',
    marginTop: 12,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: BotaLoveColors.neutralMedium,
    paddingHorizontal: 20,
    paddingVertical: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemText: {
    fontSize: 16,
    color: BotaLoveColors.secondary,
  },
  menuItemSubtext: {
    fontSize: 13,
    color: BotaLoveColors.neutralMedium,
    marginTop: 2,
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  versionText: {
    fontSize: 13,
    color: BotaLoveColors.neutralMedium,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 20 : 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: BotaLoveColors.secondary,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: BotaLoveColors.secondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: BotaLoveColors.secondary,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  passwordInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: BotaLoveColors.secondary,
  },
  eyeButton: {
    padding: 16,
  },
  inputHint: {
    fontSize: 12,
    color: BotaLoveColors.neutralMedium,
    marginTop: 6,
  },
  savePasswordButton: {
    backgroundColor: BotaLoveColors.primary,
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  savePasswordButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Agrolove Preferences styles
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  premiumBadge: {
    backgroundColor: BotaLoveColors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  premiumBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  agroloveCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: BotaLoveColors.primary,
  },
  agroloveCardGradient: {
    padding: 16,
  },
  agroloveCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  agroloveIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    shadowColor: BotaLoveColors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  agroloveIcon: {
    fontSize: 28,
  },
  agroloveTextContainer: {
    flex: 1,
  },
  agroloveTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: BotaLoveColors.secondary,
    marginBottom: 4,
  },
  agroloveDescription: {
    fontSize: 12,
    color: BotaLoveColors.textSecondary,
    lineHeight: 18,
    marginBottom: 6,
  },
  agrolovePrice: {
    backgroundColor: BotaLoveColors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  agrolovePriceText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFF',
  },
});
