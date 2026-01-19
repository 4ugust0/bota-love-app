import { BotaLoveColors } from '@/constants/theme';
import { getSubscriptionStatusColor, NetworkRuralSubscription } from '@/data/networkRuralService';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

interface NetworkBadgeProps {
  subscription: NetworkRuralSubscription;
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  showLabel?: boolean;
}

/**
 * Selo "Network Ativo" para exibir no perfil do usuário
 * Aparece quando o usuário tem assinatura ativa do Network Rural
 */
export function NetworkActiveBadge({
  subscription,
  size = 'medium',
  style,
  showLabel = true,
}: NetworkBadgeProps) {
  const isActive = subscription.status === 'active' || 
                   subscription.status === 'lifetime' || 
                   subscription.status === 'trial';

  if (!isActive) return null;

  const sizeConfig = {
    small: { icon: 12, fontSize: 10, padding: 4, paddingH: 8 },
    medium: { icon: 14, fontSize: 12, padding: 6, paddingH: 10 },
    large: { icon: 18, fontSize: 14, padding: 8, paddingH: 14 },
  };

  const config = sizeConfig[size];
  const statusColor = getSubscriptionStatusColor(subscription);

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: statusColor + '20',
          paddingVertical: config.padding,
          paddingHorizontal: config.paddingH,
        },
        style,
      ]}
    >
      <MaterialCommunityIcons 
        name="sprout" 
        size={config.icon} 
        color={statusColor} 
      />
      {showLabel && (
        <Text style={[styles.badgeText, { fontSize: config.fontSize, color: statusColor }]}>
          Network Ativo
        </Text>
      )}
    </View>
  );
}

/**
 * Selo de foto para overlay na foto principal do perfil
 */
export function NetworkPhotoOverlay({
  subscription,
  style,
}: {
  subscription: NetworkRuralSubscription;
  style?: ViewStyle;
}) {
  const isActive = subscription.status === 'active' || 
                   subscription.status === 'lifetime' || 
                   subscription.status === 'trial';

  if (!isActive) return null;

  return (
    <View style={[styles.photoOverlay, style]}>
      <LinearGradient
        colors={['#2ECC71', '#27AE60']}
        style={styles.photoOverlayGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <MaterialCommunityIcons name="sprout" size={14} color="#FFF" />
      </LinearGradient>
    </View>
  );
}

/**
 * Tag fixa que aparece no perfil indicando interesse em networking
 */
export function NetworkInterestTag({ style }: { style?: ViewStyle }) {
  return (
    <View style={[styles.interestTag, style]}>
      <MaterialCommunityIcons name="handshake" size={14} color={BotaLoveColors.primary} />
      <Text style={styles.interestTagText}>
        Interessado em conexões profissionais (Network Rural)
      </Text>
    </View>
  );
}

/**
 * Indicador de status da assinatura do Network Rural
 */
export function NetworkStatusIndicator({
  subscription,
  style,
}: {
  subscription: NetworkRuralSubscription;
  style?: ViewStyle;
}) {
  const statusColor = getSubscriptionStatusColor(subscription);
  
  const getStatusText = () => {
    switch (subscription.status) {
      case 'trial':
        return 'Período de teste';
      case 'active':
        return 'Assinatura ativa';
      case 'lifetime':
        return 'Plano vitalício';
      case 'expired':
        return 'Expirado';
      default:
        return 'Inativo';
    }
  };

  const getStatusIcon = (): keyof typeof Ionicons.glyphMap => {
    switch (subscription.status) {
      case 'trial':
        return 'time-outline';
      case 'active':
        return 'checkmark-circle';
      case 'lifetime':
        return 'infinite';
      case 'expired':
        return 'close-circle';
      default:
        return 'help-circle-outline';
    }
  };

  return (
    <View style={[styles.statusIndicator, style]}>
      <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
      <Ionicons name={getStatusIcon()} size={16} color={statusColor} />
      <Text style={[styles.statusText, { color: statusColor }]}>
        {getStatusText()}
      </Text>
    </View>
  );
}

/**
 * Badge de destaque no feed para assinantes ativos
 */
export function NetworkFeedHighlight({
  subscription,
  style,
}: {
  subscription: NetworkRuralSubscription;
  style?: ViewStyle;
}) {
  const isActive = subscription.status === 'active' || 
                   subscription.status === 'lifetime';

  if (!isActive) return null;

  return (
    <View style={[styles.feedHighlight, style]}>
      <LinearGradient
        colors={['#2ECC71', '#27AE60']}
        style={styles.feedHighlightGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <MaterialCommunityIcons name="sprout" size={12} color="#FFF" />
        <Text style={styles.feedHighlightText}>Network Rural</Text>
      </LinearGradient>
    </View>
  );
}

/**
 * Badge de LinkedIn verificado
 */
export function LinkedInVerifiedBadge({
  size = 'medium',
  style,
}: {
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
}) {
  const sizeConfig = {
    small: 16,
    medium: 20,
    large: 26,
  };

  return (
    <View style={[styles.linkedInBadge, style]}>
      <Ionicons name="logo-linkedin" size={sizeConfig[size]} color="#0A66C2" />
      <Ionicons 
        name="checkmark-circle" 
        size={sizeConfig[size] * 0.5} 
        color="#2ECC71" 
        style={styles.linkedInCheck}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    gap: 4,
  },
  badgeText: {
    fontWeight: '600',
  },
  photoOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  photoOverlayGradient: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  interestTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BotaLoveColors.primary + '15',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 8,
  },
  interestTagText: {
    fontSize: 12,
    color: BotaLoveColors.primaryDark,
    fontWeight: '500',
    flex: 1,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  feedHighlight: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  feedHighlightGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    gap: 4,
  },
  feedHighlightText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFF',
  },
  linkedInBadge: {
    position: 'relative',
  },
  linkedInCheck: {
    position: 'absolute',
    bottom: -2,
    right: -2,
  },
});
