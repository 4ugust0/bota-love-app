/**
 * 🎨 EXEMPLOS DE USO DO SISTEMA TIPOGRÁFICO PREMIUM
 * 
 * Este arquivo demonstra como utilizar corretamente o sistema
 * tipográfico Inner Circle Premium em React Native.
 */

import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import Typography, {
    FontFamily,
    FontSize,
    TypographyColors,
    combineTypography
} from '@/constants/typography';

/**
 * 📌 EXEMPLO 1: Usando o componente ThemedText
 * Forma mais simples e recomendada
 */
export function ExampleThemedText() {
  return (
    <View style={styles.section}>
      {/* ⭐ Título Principal */}
      <ThemedText variant="title">
        Boa tarde, Roberta
      </ThemedText>
      
      <ThemedText variant="titleMedium">
        Comece novas conexões
      </ThemedText>
      
      {/* 🖤 Informações de Perfil */}
      <ThemedText variant="profileInfo">
        IDADE 42 – FERNANDO – EMPRESÁRIO
      </ThemedText>
      
      <ThemedText variant="profileInfoDark">
        SÃO PAULO, SP – 1.82M
      </ThemedText>
      
      {/* 🟧 Interesses Grandes (Impacto) */}
      <ThemedText variant="interestPrimary">
        SHOWS
      </ThemedText>
      
      <ThemedText variant="interestPrimary">
        RESTAURANTES
      </ThemedText>
      
      {/* 🟡 Interesses Cursivos */}
      <ThemedText variant="interestSecondary">
        academia · festas · festivais
      </ThemedText>
      
      <ThemedText variant="interestSecondaryAccent">
        viagens · música · gastronomia
      </ThemedText>
    </View>
  );
}

/**
 * 📌 EXEMPLO 2: Usando Typography diretamente em StyleSheet
 * Para casos onde você precisa de mais controle
 */
export function ExampleDirectTypography() {
  return (
    <View style={styles.section}>
      {/* Usando estilo diretamente */}
      <ThemedText style={Typography.title}>
        Título com estilo direto
      </ThemedText>
      
      {/* Combinando estilos */}
      <ThemedText style={combineTypography(Typography.profileInfo, { 
        color: TypographyColors.accent 
      })}>
        INFORMAÇÃO PERSONALIZADA
      </ThemedText>
      
      {/* Estilo customizado baseado nos tokens */}
      <ThemedText style={customStyles.customTitle}>
        Título Customizado
      </ThemedText>
    </View>
  );
}

/**
 * 📌 EXEMPLO 3: Card de Perfil Premium
 * Demonstração completa de hierarquia visual
 */
export function ProfileCardExample() {
  return (
    <View style={styles.profileCard}>
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.gradient}
      >
        {/* Nome e idade - Título */}
        <ThemedText variant="titleLarge" style={{ color: '#FFF' }}>
          Fernando, 42
        </ThemedText>
        
        {/* Informações - Subtítulo */}
        <ThemedText variant="profileInfo">
          EMPRESÁRIO · SÃO PAULO
        </ThemedText>
        
        {/* Interesse Principal */}
        <ThemedText variant="interestPrimary">
          SHOWS
        </ThemedText>
        
        {/* Interesses Secundários */}
        <ThemedText variant="interestSecondary">
          gastronomia · viagens · vinhos
        </ThemedText>
      </LinearGradient>
    </View>
  );
}

/**
 * 📌 EXEMPLO 4: Tela de Boas-Vindas Premium
 */
export function WelcomeScreenExample() {
  const userName = 'Roberta';
  const greeting = 'Boa tarde';
  
  return (
    <View style={styles.welcomeContainer}>
      {/* Saudação elegante */}
      <ThemedText variant="title">
        {greeting}, {userName}
      </ThemedText>
      
      {/* Subtítulo motivacional */}
      <ThemedText variant="interestSecondary" style={{ color: TypographyColors.darkSecondary }}>
        Encontre sua conexão especial
      </ThemedText>
      
      {/* Call to action */}
      <ThemedText variant="button">
        EXPLORAR PERFIS
      </ThemedText>
    </View>
  );
}

/**
 * 📌 EXEMPLO 5: Lista de Interesses
 */
export function InterestsListExample() {
  const primaryInterests = ['SHOWS', 'RESTAURANTES', 'VIAGENS'];
  const secondaryInterests = ['academia', 'festas', 'festivais', 'música'];
  
  return (
    <View style={styles.section}>
      {/* Interesses Principais */}
      <View style={styles.interestRow}>
        {primaryInterests.map((interest, index) => (
          <ThemedText 
            key={index} 
            variant="interestPrimary"
            style={styles.interestTag}
          >
            {interest}
          </ThemedText>
        ))}
      </View>
      
      {/* Interesses Secundários */}
      <ThemedText variant="interestSecondary">
        {secondaryInterests.join(' · ')}
      </ThemedText>
    </View>
  );
}

/**
 * 📌 EXEMPLO 6: Formulário com Labels
 */
export function FormLabelsExample() {
  return (
    <View style={styles.section}>
      <ThemedText variant="label">
        SEU NOME
      </ThemedText>
      
      <ThemedText variant="body">
        Digite seu nome completo
      </ThemedText>
      
      <ThemedText variant="labelSmall">
        CAMPO OBRIGATÓRIO
      </ThemedText>
      
      <ThemedText variant="link">
        Precisa de ajuda?
      </ThemedText>
    </View>
  );
}

// ============================================
// 📐 ESTILOS
// ============================================

const styles = StyleSheet.create({
  section: {
    padding: 20,
    gap: 12,
  },
  profileCard: {
    width: '100%',
    height: 400,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#333',
  },
  gradient: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 20,
    gap: 8,
  },
  welcomeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    gap: 16,
  },
  interestRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  interestTag: {
    marginBottom: 8,
  },
});

/**
 * Estilos customizados baseados nos tokens
 */
const customStyles = StyleSheet.create({
  customTitle: {
    fontFamily: FontFamily.playfairMedium,
    fontSize: FontSize.titleMD,
    lineHeight: FontSize.titleMD * 1.15,
    color: TypographyColors.secondary,
  },
});

export default {
  ExampleThemedText,
  ExampleDirectTypography,
  ProfileCardExample,
  WelcomeScreenExample,
  InterestsListExample,
  FormLabelsExample,
};
