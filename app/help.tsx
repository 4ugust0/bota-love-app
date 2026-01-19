import { BotaLoveColors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function HelpScreen() {
  const router = useRouter();

  const helpTopics = [
    {
      icon: 'person-circle-outline' as const,
      title: 'Como funciona o Bota Love?',
      description: 'Aprenda como criar seu perfil e encontrar matches',
    },
    {
      icon: 'heart-outline' as const,
      title: 'Como dar match?',
      description: 'Entenda o sistema de likes, super likes e matches',
    },
    {
      icon: 'chatbubble-outline' as const,
      title: 'Como enviar mensagens?',
      description: 'Saiba como conversar com seus matches',
    },
    {
      icon: 'star-outline' as const,
      title: 'O que é o plano Premium?',
      description: 'Descubra os benefícios de ser Premium',
    },
    {
      icon: 'shield-checkmark-outline' as const,
      title: 'Segurança e Privacidade',
      description: 'Como mantemos seus dados seguros',
    },
    {
      icon: 'flag-outline' as const,
      title: 'Denunciar um perfil',
      description: 'Como reportar comportamentos inadequados',
    },
  ];

  const contactOptions = [
    {
      icon: 'mail-outline' as const,
      title: 'Email',
      value: 'suporte@botalove.com.br',
      action: () => Linking.openURL('mailto:suporte@botalove.com.br'),
    },
    {
      icon: 'logo-whatsapp' as const,
      title: 'WhatsApp',
      value: '(62) 99999-9999',
      action: () => Linking.openURL('https://wa.me/5562999999999'),
    },
    {
      icon: 'logo-instagram' as const,
      title: 'Instagram',
      value: '@botalove',
      action: () => Linking.openURL('https://instagram.com/botalove'),
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={BotaLoveColors.secondary} />
        </TouchableOpacity>
        <Text style={styles.title}>Ajuda e Suporte</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Help Topics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Perguntas Frequentes</Text>
          {helpTopics.map((topic, index) => (
            <TouchableOpacity key={index} style={styles.topicItem}>
              <View style={styles.topicIcon}>
                <Ionicons name={topic.icon} size={24} color={BotaLoveColors.primary} />
              </View>
              <View style={styles.topicContent}>
                <Text style={styles.topicTitle}>{topic.title}</Text>
                <Text style={styles.topicDescription}>{topic.description}</Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={BotaLoveColors.neutralMedium}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Contact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Entre em Contato</Text>
          <Text style={styles.sectionSubtitle}>
            Nossa equipe está disponível para ajudar você!
          </Text>
          {contactOptions.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={styles.contactItem}
              onPress={option.action}
            >
              <View style={styles.contactIcon}>
                <Ionicons name={option.icon} size={24} color={BotaLoveColors.secondary} />
              </View>
              <View style={styles.contactContent}>
                <Text style={styles.contactTitle}>{option.title}</Text>
                <Text style={styles.contactValue}>{option.value}</Text>
              </View>
              <Ionicons
                name="open-outline"
                size={20}
                color={BotaLoveColors.neutralMedium}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* App Info */}
        <View style={styles.infoSection}>
          <Text style={styles.infoText}>Bota Love - Versão 1.0.0</Text>
          <Text style={styles.infoText}>© 2025 Bota Love. Todos os direitos reservados.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BotaLoveColors.neutralLight,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: BotaLoveColors.backgroundWhite,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: BotaLoveColors.secondary,
  },
  placeholder: {
    width: 32,
  },
  section: {
    backgroundColor: BotaLoveColors.backgroundWhite,
    marginTop: 16,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: BotaLoveColors.secondary,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: BotaLoveColors.neutralDark,
    marginBottom: 16,
  },
  topicItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: BotaLoveColors.neutralLight,
  },
  topicIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${BotaLoveColors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  topicContent: {
    flex: 1,
  },
  topicTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: BotaLoveColors.secondary,
    marginBottom: 4,
  },
  topicDescription: {
    fontSize: 14,
    color: BotaLoveColors.neutralDark,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: BotaLoveColors.neutralLight,
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: BotaLoveColors.neutralLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactContent: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: BotaLoveColors.secondary,
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 14,
    color: BotaLoveColors.primary,
  },
  infoSection: {
    padding: 20,
    alignItems: 'center',
    marginTop: 16,
  },
  infoText: {
    fontSize: 12,
    color: BotaLoveColors.neutralDark,
    marginBottom: 4,
    textAlign: 'center',
  },
});
