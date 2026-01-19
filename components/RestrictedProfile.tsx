/**
 * 👤 BOTA LOVE APP - Componente de Perfil Restrito
 * 
 * Exibe perfis com informações limitadas para usuários do plano gratuito
 * Com indicadores visuais e CTAs para upgrade
 * 
 * @author Bota Love Team
 */

import { BotaLoveColors } from '@/constants/theme';
import { ProfileVisibility } from '@/data/freePlanService';
import { User } from '@/data/mockData';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
    Dimensions,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ============================================
// 👤 CARD DE PERFIL RESTRITO
// ============================================

interface RestrictedProfileCardProps {
  user: Partial<User>;
  visibility: ProfileVisibility;
  hasPremium: boolean;
  onPress: () => void;
  onUpgradePress: () => void;
}

export function RestrictedProfileCard({
  user,
  visibility,
  hasPremium,
  onPress,
  onUpgradePress,
}: RestrictedProfileCardProps) {
  const photo = user.photos?.[0] || 'https://via.placeholder.com/400';
  
  return (
    <TouchableOpacity 
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.9}
    >
      {/* Foto Principal */}
      <Image source={{ uri: photo }} style={styles.photo} />
      
      {/* Overlay de Informações */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.gradient}
      >
        <View style={styles.infoContainer}>
          {/* Nome e Idade */}
          <View style={styles.nameRow}>
            <Text style={styles.name}>
              {user.name}{user.age ? `, ${user.age}` : ''}
            </Text>
          </View>
          
          {/* Cidade e Distância */}
          <View style={styles.locationRow}>
            {user.city && (
              <Text style={styles.location}>
                📍 {user.city}{user.distance ? ` • ${user.distance}km` : ''}
              </Text>
            )}
          </View>
          
          {/* Bio (truncada para não-premium) */}
          {user.bio && (
            <Text style={styles.bio} numberOfLines={2}>
              {user.bio}
            </Text>
          )}
          
          {/* Banner de informações bloqueadas (apenas para não-premium) */}
          {!hasPremium && (
            <TouchableOpacity 
              style={styles.lockedBanner}
              onPress={onUpgradePress}
              activeOpacity={0.8}
            >
              <Text style={styles.lockedIcon}>🔒</Text>
              <View style={styles.lockedTextContainer}>
                <Text style={styles.lockedTitle}>Veja o perfil completo</Text>
                <Text style={styles.lockedSubtitle}>Bio, interesses, fotos e mais</Text>
              </View>
              <Text style={styles.lockedArrow}>›</Text>
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>
      
      {/* Badge de fotos extras bloqueadas */}
      {!hasPremium && user.photos && user.photos.length > 1 && (
        <View style={styles.photoBadge}>
          <Text style={styles.photoBadgeText}>
            🔒 +{user.photos.length - 1} fotos
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// ============================================
// 📋 SEÇÃO DE INFORMAÇÕES BLOQUEADAS
// ============================================

interface LockedInfoSectionProps {
  title: string;
  items: string[];
  onUpgradePress: () => void;
}

export function LockedInfoSection({ title, items, onUpgradePress }: LockedInfoSectionProps) {
  return (
    <View style={sectionStyles.container}>
      <Text style={sectionStyles.title}>{title}</Text>
      
      <TouchableOpacity 
        style={sectionStyles.lockedContent}
        onPress={onUpgradePress}
        activeOpacity={0.8}
      >
        <View style={sectionStyles.blurredItems}>
          {items.slice(0, 3).map((item, index) => (
            <View key={index} style={sectionStyles.blurredItem}>
              <Text style={sectionStyles.blurredText}>••••••</Text>
            </View>
          ))}
        </View>
        
        <View style={sectionStyles.overlay}>
          <Text style={sectionStyles.lockIcon}>🔒</Text>
          <Text style={sectionStyles.overlayText}>Desbloqueie com Premium</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

// ============================================
// 🖼️ GALERIA DE FOTOS COM BLOQUEIO
// ============================================

interface RestrictedPhotoGalleryProps {
  photos: string[];
  hasPremium: boolean;
  onUpgradePress: () => void;
}

export function RestrictedPhotoGallery({ 
  photos, 
  hasPremium, 
  onUpgradePress 
}: RestrictedPhotoGalleryProps) {
  const visiblePhotos = hasPremium ? photos : [photos[0]];
  const lockedCount = photos.length - 1;
  
  return (
    <View style={galleryStyles.container}>
      {/* Primeira foto sempre visível */}
      <Image source={{ uri: photos[0] }} style={galleryStyles.mainPhoto} />
      
      {/* Grid de fotos extras */}
      {hasPremium ? (
        <View style={galleryStyles.grid}>
          {photos.slice(1).map((photo, index) => (
            <Image 
              key={index} 
              source={{ uri: photo }} 
              style={galleryStyles.gridPhoto} 
            />
          ))}
        </View>
      ) : (
        // Fotos bloqueadas
        lockedCount > 0 && (
          <TouchableOpacity 
            style={galleryStyles.lockedGrid}
            onPress={onUpgradePress}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['rgba(102, 126, 234, 0.9)', 'rgba(118, 75, 162, 0.9)']}
              style={galleryStyles.lockedGradient}
            >
              <Text style={galleryStyles.lockedEmoji}>🔒</Text>
              <Text style={galleryStyles.lockedCount}>+{lockedCount}</Text>
              <Text style={galleryStyles.lockedLabel}>fotos</Text>
            </LinearGradient>
          </TouchableOpacity>
        )
      )}
    </View>
  );
}

// ============================================
// 📊 ESTILOS - CARD
// ============================================

const styles = StyleSheet.create({
  card: {
    width: SCREEN_WIDTH - 32,
    height: SCREEN_WIDTH * 1.2,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#F0F0F0',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  location: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.9)',
  },
  bio: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 20,
    marginBottom: 12,
  },
  lockedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },
  lockedIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  lockedTextContainer: {
    flex: 1,
  },
  lockedTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  lockedSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  lockedArrow: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '300',
  },
  photoBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  photoBadgeText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

// ============================================
// 📊 ESTILOS - SEÇÃO
// ============================================

const sectionStyles = StyleSheet.create({
  container: {
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: BotaLoveColors.textPrimary,
    marginBottom: 12,
  },
  lockedContent: {
    position: 'relative',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    minHeight: 80,
  },
  blurredItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    opacity: 0.3,
  },
  blurredItem: {
    backgroundColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  blurredText: {
    fontSize: 14,
    color: '#999',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  overlayText: {
    fontSize: 14,
    fontWeight: '600',
    color: BotaLoveColors.primary,
  },
});

// ============================================
// 📊 ESTILOS - GALERIA
// ============================================

const galleryStyles = StyleSheet.create({
  container: {
    padding: 16,
  },
  mainPhoto: {
    width: '100%',
    height: 300,
    borderRadius: 16,
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  gridPhoto: {
    width: (SCREEN_WIDTH - 48) / 3,
    height: (SCREEN_WIDTH - 48) / 3,
    borderRadius: 12,
  },
  lockedGrid: {
    width: '100%',
    height: 100,
    borderRadius: 12,
    overflow: 'hidden',
  },
  lockedGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  lockedEmoji: {
    fontSize: 24,
    marginRight: 8,
  },
  lockedCount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginRight: 4,
  },
  lockedLabel: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
  },
});
