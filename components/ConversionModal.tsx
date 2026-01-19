/**
 * 🎯 BOTA LOVE APP - Modal de Conversão
 * 
 * Exibe mensagens de conversão quando limites são atingidos
 * Sem avisos prévios - aparece apenas no momento do bloqueio
 * 
 * @author Bota Love Team
 */

import { BotaLoveColors } from '@/constants/theme';
import { ConversionTrigger } from '@/data/freePlanService';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    Dimensions,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ConversionModalProps {
  visible: boolean;
  trigger: ConversionTrigger | null;
  onClose: () => void;
}

export default function ConversionModal({ visible, trigger, onClose }: ConversionModalProps) {
  const router = useRouter();
  
  if (!trigger) return null;
  
  const handleSubscribe = () => {
    onClose();
    // Navegar para tela de assinatura/loja
    router.push('/store');
  };
  
  // Ícones por tipo de trigger
  const icons: Record<ConversionTrigger['type'], string> = {
    messages: '💬',
    views: '👀',
    likes: '💚',
    filters: '🔍',
    profile: '👤',
  };
  
  // Cores de gradiente por tipo
  const gradients: Record<ConversionTrigger['type'], string[]> = {
    messages: ['#667eea', '#764ba2'],
    views: ['#f093fb', '#f5576c'],
    likes: ['#4facfe', '#00f2fe'],
    filters: ['#43e97b', '#38f9d7'],
    profile: ['#fa709a', '#fee140'],
  };
  
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Ícone animado */}
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={gradients[trigger.type] as [string, string]}
              style={styles.iconGradient}
            >
              <Text style={styles.icon}>{icons[trigger.type]}</Text>
            </LinearGradient>
          </View>
          
          {/* Título */}
          <Text style={styles.title}>{trigger.title}</Text>
          
          {/* Mensagem principal */}
          <Text style={styles.message}>{trigger.message}</Text>
          
          {/* Benefícios rápidos */}
          <View style={styles.benefitsContainer}>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>✨</Text>
              <Text style={styles.benefitText}>Sem limites</Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>💎</Text>
              <Text style={styles.benefitText}>Recursos exclusivos</Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>🚀</Text>
              <Text style={styles.benefitText}>Mais matches</Text>
            </View>
          </View>
          
          {/* Botões */}
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleSubscribe}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[BotaLoveColors.primary, BotaLoveColors.primaryDark]}
              style={styles.buttonGradient}
            >
              <Text style={styles.primaryButtonText}>{trigger.ctaText}</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={styles.secondaryButtonText}>Agora não</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ============================================
// 💬 COMPONENTE DE BLOQUEIO DE CHAT
// ============================================

interface ChatBlockedOverlayProps {
  onPress: () => void;
}

export function ChatBlockedOverlay({ onPress }: ChatBlockedOverlayProps) {
  return (
    <TouchableOpacity 
      style={chatStyles.overlay} 
      onPress={onPress}
      activeOpacity={0.95}
    >
      <LinearGradient
        colors={['rgba(102, 126, 234, 0.95)', 'rgba(118, 75, 162, 0.95)']}
        style={chatStyles.gradient}
      >
        <Text style={chatStyles.icon}>💬</Text>
        <Text style={chatStyles.message}>
          Continue a conversa com o chat ilimitado, assine um Plano e destrave tudo!!!
        </Text>
        <View style={chatStyles.button}>
          <Text style={chatStyles.buttonText}>Ver Planos</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

// ============================================
// 🔒 COMPONENTE DE INPUT BLOQUEADO
// ============================================

interface BlockedInputProps {
  onPress: () => void;
}

export function BlockedChatInput({ onPress }: BlockedInputProps) {
  return (
    <TouchableOpacity 
      style={inputStyles.container} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={inputStyles.inputMock}>
        <Text style={inputStyles.lockIcon}>🔒</Text>
        <Text style={inputStyles.text}>
          Continue a conversa com o chat ilimitado, assine um Plano e destrave tudo!!!
        </Text>
      </View>
      <View style={inputStyles.sendButton}>
        <Text style={inputStyles.sendIcon}>🚀</Text>
      </View>
    </TouchableOpacity>
  );
}

// ============================================
// 📊 ESTILOS
// ============================================

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 28,
    width: SCREEN_WIDTH - 48,
    maxWidth: 380,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 15,
  },
  iconContainer: {
    marginBottom: 20,
  },
  iconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: BotaLoveColors.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: BotaLoveColors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  benefitsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 28,
    paddingHorizontal: 8,
  },
  benefitItem: {
    alignItems: 'center',
    flex: 1,
  },
  benefitIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  benefitText: {
    fontSize: 12,
    color: BotaLoveColors.textSecondary,
    textAlign: 'center',
  },
  primaryButton: {
    width: '100%',
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  secondaryButton: {
    paddingVertical: 12,
  },
  secondaryButtonText: {
    color: BotaLoveColors.textSecondary,
    fontSize: 15,
    fontWeight: '500',
  },
});

const chatStyles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradient: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  icon: {
    fontSize: 64,
    marginBottom: 20,
  },
  message: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 26,
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 25,
  },
  buttonText: {
    color: '#667eea',
    fontSize: 16,
    fontWeight: '700',
  },
});

const inputStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F8F9FA',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  inputMock: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: BotaLoveColors.primary,
  },
  lockIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  text: {
    flex: 1,
    fontSize: 13,
    color: BotaLoveColors.primary,
    fontWeight: '500',
  },
  sendButton: {
    marginLeft: 12,
    backgroundColor: BotaLoveColors.primary,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendIcon: {
    fontSize: 20,
  },
});
