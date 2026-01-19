/**
 * 🎯 "O AGRO É MATCH" - Premium Match Animation
 * 
 * Animação exclusiva de match com coração formado pela junção de duas metades,
 * cada uma preenchida com a foto de um usuário.
 * 
 * Conceito: O Agro é Match ❤️
 * 
 * Fases da animação:
 * 1. APROXIMAÇÃO - Metades entram lateralmente
 * 2. ENCAIXE - Overshoot + retorno (sensação física de encaixe)
 * 3. CONFIRMAÇÃO - Pulse + glow
 */

import { BotaLoveColors } from '@/constants/theme';
import { FontFamily, FontSize } from '@/constants/typography';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    Easing,
    Image,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

// Tamanho do coração
const HEART_SIZE = 260;
const HALF_HEART = HEART_SIZE / 2;

// Tipo genérico para usuários (aceita User e FirebaseUser)
interface MatchUser {
  id: string;
  profile?: {
    name: string;
    photos: string[];
  };
  // Propriedades do tipo User legado
  name?: string;
  photos?: string[];
}

interface MatchAnimationProps {
  currentUser: MatchUser;
  matchedUser: MatchUser;
  onClose: () => void;
  onSendMessage: () => void;
}

/**
 * Componente HeartHalf - Renderiza metade do coração com foto
 */
const HeartHalf = ({ 
  photo, 
  side, 
  animatedX 
}: { 
  photo: string; 
  side: 'left' | 'right'; 
  animatedX: Animated.Value | Animated.AnimatedAddition<number>;
}) => {
  const isLeft = side === 'left';
  
  return (
    <Animated.View
      style={[
        styles.heartHalf,
        isLeft ? styles.heartHalfLeft : styles.heartHalfRight,
        {
          transform: [{ translateX: animatedX as any }],
        },
      ]}
    >
      {/* Container da foto com máscara de coração */}
      <View style={[
        styles.heartMaskContainer,
        isLeft ? styles.heartMaskLeft : styles.heartMaskRight,
      ]}>
        <Image
          source={{ uri: photo }}
          style={[
            styles.heartPhoto,
            isLeft ? styles.heartPhotoLeft : styles.heartPhotoRight,
          ]}
          resizeMode="cover"
        />
        {/* Overlay sutil com cor do tema */}
        <View style={[
          styles.heartOverlay,
          isLeft ? styles.heartMaskLeft : styles.heartMaskRight,
        ]} />
      </View>
    </Animated.View>
  );
};

export default function MatchAnimation({
  currentUser,
  matchedUser,
  onClose,
  onSendMessage,
}: MatchAnimationProps) {
  // === ANIMAÇÕES ===
  
  // Fase 1: Aproximação lateral das metades
  const leftHalfX = useRef(new Animated.Value(-width * 0.5)).current;
  const rightHalfX = useRef(new Animated.Value(width * 0.5)).current;
  
  // Fase 2: Encaixe (overshoot) - movimento extra após aproximação
  const encaixeLeftX = useRef(new Animated.Value(0)).current;
  const encaixeRightX = useRef(new Animated.Value(0)).current;
  
  // Fase 3: Pulse de confirmação
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  // Brilho/Glow
  const glowAnim = useRef(new Animated.Value(0)).current;
  const glowPulse = useRef(new Animated.Value(0)).current;
  
  // Texto "O Agro é Match"
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(40)).current;
  const textScale = useRef(new Animated.Value(0.8)).current;
  
  // Background fade
  const bgOpacity = useRef(new Animated.Value(0)).current;
  
  // Botões
  const buttonsOpacity = useRef(new Animated.Value(0)).current;
  const buttonsTranslateY = useRef(new Animated.Value(60)).current;

  // Ícone do coração central
  const heartIconScale = useRef(new Animated.Value(0)).current;
  const heartIconOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Sequência completa da animação premium
    runMatchAnimation();
  }, []);

  const runMatchAnimation = async () => {
    // Background fade in suave
    Animated.timing(bgOpacity, {
      toValue: 1,
      duration: 400,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    await delay(300);

    // === FASE 1: APROXIMAÇÃO ===
    // Movimento suave das metades em direção ao centro
    Animated.parallel([
      Animated.timing(leftHalfX, {
        toValue: 0,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(rightHalfX, {
        toValue: 0,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    await delay(750);

    // === FASE 2: ENCAIXE (CRÍTICO - OVERSHOOT + RETORNO) ===
    // Este é o momento mágico - as metades ultrapassam e voltam
    // criando sensação de PRESSÃO e ENCAIXE FÍSICO
    
    // Haptic feedback no momento do encaixe
    triggerHaptic('impact');

    Animated.parallel([
      // Metade esquerda: ultrapassa para direita, depois volta
      Animated.sequence([
        Animated.timing(encaixeLeftX, {
          toValue: 8, // Ultrapassa 8px para direita
          duration: 80,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.spring(encaixeLeftX, {
          toValue: 0,
          friction: 6,
          tension: 300,
          useNativeDriver: true,
        }),
      ]),
      // Metade direita: ultrapassa para esquerda, depois volta
      Animated.sequence([
        Animated.timing(encaixeRightX, {
          toValue: -8, // Ultrapassa 8px para esquerda
          duration: 80,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.spring(encaixeRightX, {
          toValue: 0,
          friction: 6,
          tension: 300,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    await delay(150);

    // Glow aparece após encaixe
    Animated.timing(glowAnim, {
      toValue: 1,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    // Ícone do coração aparece no centro
    Animated.parallel([
      Animated.spring(heartIconScale, {
        toValue: 1,
        friction: 5,
        tension: 100,
        useNativeDriver: true,
      }),
      Animated.timing(heartIconOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    await delay(200);

    // === FASE 3: CONFIRMAÇÃO (PULSE) ===
    // Segundo haptic - feedback de sucesso
    triggerHaptic('success');

    // Pulse do coração completo
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
      { iterations: -1 } // Loop infinito
    ).start();

    // Glow pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glowPulse, {
          toValue: 0,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
      { iterations: -1 }
    ).start();

    await delay(300);

    // === TEXTO "O AGRO É MATCH" ===
    Animated.parallel([
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(textTranslateY, {
        toValue: 0,
        friction: 8,
        tension: 60,
        useNativeDriver: true,
      }),
      Animated.spring(textScale, {
        toValue: 1,
        friction: 6,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start();

    await delay(400);

    // === BOTÕES ===
    Animated.parallel([
      Animated.timing(buttonsOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(buttonsTranslateY, {
        toValue: 0,
        friction: 8,
        tension: 50,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Helper para delays
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // Helper para haptic feedback
  const triggerHaptic = (type: 'impact' | 'success') => {
    if (Platform.OS === 'web') return;
    
    if (type === 'impact') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  // Combina animações de aproximação + encaixe
  const leftTotalX = Animated.add(leftHalfX, encaixeLeftX);
  const rightTotalX = Animated.add(rightHalfX, encaixeRightX);

  // Interpolação do glow
  const glowScale = glowPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.15],
  });

  const glowOpacity = Animated.multiply(
    glowAnim,
    glowPulse.interpolate({
      inputRange: [0, 1],
      outputRange: [0.4, 0.7],
    })
  );

  return (
    <Animated.View style={[styles.container, { opacity: bgOpacity }]}>
      {/* Background gradiente escuro com tom terroso agro */}
      <LinearGradient
        colors={['#0d0705', '#1f120b', '#2a1510', '#1f120b', '#0d0705']}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        locations={[0, 0.25, 0.5, 0.75, 1]}
      />

      {/* Partículas decorativas douradas */}
      <View style={styles.particlesContainer} pointerEvents="none">
        {[...Array(16)].map((_, i) => (
          <Animated.View
            key={i}
            style={[
              styles.particle,
              {
                left: `${5 + (i * 6)}%`,
                top: `${10 + ((i * 17) % 70)}%`,
                width: 4 + (i % 4) * 2,
                height: 4 + (i % 4) * 2,
                borderRadius: 2 + (i % 4),
                opacity: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.2 + (i % 5) * 0.1],
                }),
                transform: [{
                  scale: glowAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 0.8 + (i % 3) * 0.3],
                  }),
                }],
              },
            ]}
          />
        ))}
      </View>

      {/* Container principal do conteúdo */}
      <View style={styles.content}>
        
        {/* === CORAÇÃO COM FOTOS DOS USUÁRIOS === */}
        <Animated.View 
          style={[
            styles.heartMainContainer,
            {
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          {/* Glow atrás do coração */}
          <Animated.View 
            style={[
              styles.heartGlow,
              {
                opacity: glowOpacity,
                transform: [{ scale: glowScale }],
              },
            ]}
          />

          {/* Container das duas metades */}
          <View style={styles.heartHalvesContainer}>
            {/* Metade esquerda - Foto do usuário atual */}
            <HeartHalf 
              photo={currentUser.profile?.photos?.[0] || currentUser.photos?.[0] || ''}
              side="left"
              animatedX={leftTotalX}
            />

            {/* Metade direita - Foto do match */}
            <HeartHalf 
              photo={matchedUser.profile?.photos?.[0] || matchedUser.photos?.[0] || ''}
              side="right"
              animatedX={rightTotalX}
            />
          </View>

          {/* Ícone de coração central (aparece após encaixe) */}
          <Animated.View 
            style={[
              styles.heartIconContainer,
              {
                opacity: heartIconOpacity,
                transform: [{ scale: heartIconScale }],
              },
            ]}
          >
            <View style={styles.heartIconGlow}>
              <Ionicons name="heart" size={44} color={BotaLoveColors.primary} />
            </View>
          </Animated.View>

          {/* Borda decorativa do coração */}
          <View style={styles.heartBorder} pointerEvents="none" />
        </Animated.View>

        {/* === TEXTO "O AGRO É MATCH" === */}
        <Animated.View
          style={[
            styles.textContainer,
            {
              opacity: textOpacity,
              transform: [
                { translateY: textTranslateY },
                { scale: textScale },
              ],
            },
          ]}
        >
          <Text style={styles.matchTitle}>O Agro é Match</Text>
          <View style={styles.namesRow}>
            <Text style={styles.matchNames}>
              {(currentUser.profile?.name || currentUser.name || '').split(' ')[0]}
            </Text>
            <Ionicons 
              name="heart" 
              size={18} 
              color={BotaLoveColors.primary} 
              style={styles.heartBetweenNames}
            />
            <Text style={styles.matchNames}>
              {(matchedUser.profile?.name || matchedUser.name || '').split(' ')[0]}
            </Text>
          </View>
        </Animated.View>

        {/* === BOTÕES === */}
        <Animated.View
          style={[
            styles.buttonsContainer,
            {
              opacity: buttonsOpacity,
              transform: [{ translateY: buttonsTranslateY }],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.sendMessageButton}
            onPress={onSendMessage}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[BotaLoveColors.primary, BotaLoveColors.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientButton}
            >
              <Ionicons name="chatbubble-ellipses" size={22} color={BotaLoveColors.secondary} />
              <Text style={styles.sendMessageText}>Enviar mensagem</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.keepPlayingButton}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={styles.keepPlayingText}>Continuar explorando</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Botão de fechar */}
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <View style={styles.closeButtonInner}>
          <Ionicons name="close" size={26} color="#FFF" />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: width,
    height: height,
    zIndex: 2000,
  },
  particlesContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  particle: {
    position: 'absolute',
    backgroundColor: BotaLoveColors.primary,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },

  // === CORAÇÃO ===
  heartMainContainer: {
    width: HEART_SIZE,
    height: HEART_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  heartGlow: {
    position: 'absolute',
    width: HEART_SIZE + 80,
    height: HEART_SIZE + 80,
    borderRadius: (HEART_SIZE + 80) / 2,
    backgroundColor: BotaLoveColors.primary,
    shadowColor: BotaLoveColors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 60,
    elevation: 30,
  },
  heartHalvesContainer: {
    width: HEART_SIZE,
    height: HEART_SIZE,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  heartHalf: {
    width: HALF_HEART,
    height: HEART_SIZE,
    overflow: 'hidden',
  },
  heartHalfLeft: {
    // Estilos específicos para metade esquerda
  },
  heartHalfRight: {
    // Estilos específicos para metade direita
  },
  heartMaskContainer: {
    width: HALF_HEART,
    height: HEART_SIZE,
    overflow: 'hidden',
  },
  heartMaskLeft: {
    borderTopLeftRadius: HEART_SIZE * 0.5,
    borderBottomLeftRadius: HEART_SIZE * 0.08,
    borderBottomRightRadius: HEART_SIZE * 0.5,
  },
  heartMaskRight: {
    borderTopRightRadius: HEART_SIZE * 0.5,
    borderBottomRightRadius: HEART_SIZE * 0.08,
    borderBottomLeftRadius: HEART_SIZE * 0.5,
  },
  heartPhoto: {
    width: HEART_SIZE,
    height: HEART_SIZE,
  },
  heartPhotoLeft: {
    marginLeft: 0,
  },
  heartPhotoRight: {
    marginLeft: -HALF_HEART,
  },
  heartOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(249, 168, 37, 0.08)',
  },
  heartBorder: {
    position: 'absolute',
    width: HEART_SIZE - 4,
    height: HEART_SIZE - 4,
    borderRadius: HEART_SIZE / 2,
    borderWidth: 3,
    borderColor: BotaLoveColors.primary,
    opacity: 0.6,
  },
  heartIconContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartIconGlow: {
    padding: 12,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: BotaLoveColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
  },

  // === TEXTO ===
  textContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  matchTitle: {
    fontSize: FontSize.titleLG,
    fontFamily: FontFamily.playfairMedium,
    color: BotaLoveColors.primary,
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 1,
    textShadowColor: 'rgba(249, 168, 37, 0.6)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 15,
  },
  namesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  matchNames: {
    fontSize: FontSize.bodyLG,
    fontFamily: FontFamily.montserratCondensedSemiBold,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  heartBetweenNames: {
    marginHorizontal: 10,
  },

  // === BOTÕES ===
  buttonsContainer: {
    width: '100%',
    gap: 14,
    paddingHorizontal: 10,
  },
  sendMessageButton: {
    borderRadius: 50,
    overflow: 'hidden',
    shadowColor: BotaLoveColors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  gradientButton: {
    flexDirection: 'row',
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  sendMessageText: {
    color: BotaLoveColors.secondary,
    fontSize: 17,
    fontFamily: FontFamily.montserratExtraBold,
    letterSpacing: 0.3,
  },
  keepPlayingButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  keepPlayingText: {
    color: '#FFF',
    fontSize: 15,
    fontFamily: FontFamily.montserratCondensedSemiBold,
    letterSpacing: 0.3,
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
  },
  closeButtonInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(80, 41, 20, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
