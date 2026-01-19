import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';

const { width, height } = Dimensions.get('window');

interface SuperLikeAnimationProps {
  onComplete?: () => void;
}

export default function SuperLikeAnimation({ onComplete }: SuperLikeAnimationProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const star1 = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const star2 = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const star3 = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const star4 = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const star5 = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const mainAnimation = Animated.sequence([
      // Fade in e scale up
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 4,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      // Explosão das estrelas
      Animated.parallel([
        Animated.timing(star1, {
          toValue: { x: -80, y: -120 },
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(star2, {
          toValue: { x: 80, y: -120 },
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(star3, {
          toValue: { x: -100, y: 0 },
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(star4, {
          toValue: { x: 100, y: 0 },
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(star5, {
          toValue: { x: 0, y: 120 },
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
      // Fade out
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]);

    mainAnimation.start(() => {
      onComplete?.();
    });
  }, []);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const StarIcon = ({ animatedValue }: { animatedValue: Animated.ValueXY }) => (
    <Animated.View
      style={[
        styles.starContainer,
        {
          transform: [
            { translateX: animatedValue.x },
            { translateY: animatedValue.y },
          ],
          opacity: opacityAnim,
        },
      ]}
    >
      <Ionicons name="star" size={24} color="#5DADE2" />
    </Animated.View>
  );

  return (
    <View style={styles.container} pointerEvents="none">
      <Animated.View
        style={[
          styles.mainStar,
          {
            transform: [{ scale: scaleAnim }, { rotate }],
            opacity: opacityAnim,
          },
        ]}
      >
        <View style={styles.starBackground}>
          <Ionicons name="star" size={100} color="#5DADE2" />
        </View>
        <View style={styles.starGlow}>
          <Ionicons name="star" size={120} color="rgba(93, 173, 226, 0.3)" />
        </View>
      </Animated.View>

      <StarIcon animatedValue={star1} />
      <StarIcon animatedValue={star2} />
      <StarIcon animatedValue={star3} />
      <StarIcon animatedValue={star4} />
      <StarIcon animatedValue={star5} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: width,
    height: height,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  mainStar: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  starBackground: {
    position: 'absolute',
  },
  starGlow: {
    position: 'absolute',
  },
  starContainer: {
    position: 'absolute',
  },
});
