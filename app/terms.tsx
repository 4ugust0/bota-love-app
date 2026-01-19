import { BotaLoveColors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function TermsScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={BotaLoveColors.secondary} />
        </TouchableOpacity>
        <Text style={styles.title}>Termos e Privacidade</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {/* Termos de Uso */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Termos de Uso</Text>
          <Text style={styles.sectionDate}>Atualizado em 01/12/2025</Text>

          <Text style={styles.paragraph}>
            Bem-vindo ao Bota Love! Ao usar nosso aplicativo, você concorda com os seguintes
            termos e condições:
          </Text>

          <Text style={styles.subtitle}>1. Aceitação dos Termos</Text>
          <Text style={styles.paragraph}>
            Ao acessar e usar o Bota Love, você aceita e concorda em ficar vinculado a estes
            Termos de Uso. Se você não concordar com qualquer parte destes termos, não deverá
            usar o aplicativo.
          </Text>

          <Text style={styles.subtitle}>2. Uso do Serviço</Text>
          <Text style={styles.paragraph}>
            O Bota Love é uma plataforma de relacionamentos voltada para pessoas do meio
            agropecuário. Você deve ter pelo menos 18 anos de idade para usar nossos serviços.
          </Text>

          <Text style={styles.subtitle}>3. Conduta do Usuário</Text>
          <Text style={styles.paragraph}>
            Você concorda em não usar o Bota Love para qualquer finalidade ilegal ou proibida.
            Você não deve assediar, intimidar ou difamar outros usuários.
          </Text>

          <Text style={styles.subtitle}>4. Conteúdo do Usuário</Text>
          <Text style={styles.paragraph}>
            Você é responsável pelo conteúdo que publica no aplicativo, incluindo fotos,
            biografia e mensagens. Reservamo-nos o direito de remover qualquer conteúdo que
            viole nossas políticas.
          </Text>

          <Text style={styles.subtitle}>5. Planos Premium</Text>
          <Text style={styles.paragraph}>
            Oferecemos planos de assinatura premium com recursos adicionais. Os pagamentos são
            processados de forma segura e as assinaturas podem ser canceladas a qualquer
            momento.
          </Text>
        </View>

        {/* Política de Privacidade */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Política de Privacidade</Text>
          <Text style={styles.sectionDate}>Atualizado em 01/12/2025</Text>

          <Text style={styles.paragraph}>
            Sua privacidade é importante para nós. Esta política explica como coletamos,
            usamos e protegemos suas informações pessoais.
          </Text>

          <Text style={styles.subtitle}>1. Informações que Coletamos</Text>
          <Text style={styles.paragraph}>
            Coletamos informações que você nos fornece diretamente, como nome, idade, fotos,
            localização, biografia e interesses. Também coletamos dados de uso do aplicativo.
          </Text>

          <Text style={styles.subtitle}>2. Como Usamos suas Informações</Text>
          <Text style={styles.paragraph}>
            Usamos suas informações para fornecer e melhorar nossos serviços, mostrar perfis
            compatíveis, processar pagamentos e enviar notificações relevantes.
          </Text>

          <Text style={styles.subtitle}>3. Compartilhamento de Informações</Text>
          <Text style={styles.paragraph}>
            Suas informações de perfil são visíveis para outros usuários do aplicativo. Não
            vendemos suas informações pessoais para terceiros.
          </Text>

          <Text style={styles.subtitle}>4. Segurança</Text>
          <Text style={styles.paragraph}>
            Implementamos medidas de segurança para proteger suas informações contra acesso
            não autorizado, alteração ou destruição.
          </Text>

          <Text style={styles.subtitle}>5. Seus Direitos</Text>
          <Text style={styles.paragraph}>
            Você tem o direito de acessar, corrigir ou excluir suas informações pessoais a
            qualquer momento através das configurações do aplicativo.
          </Text>

          <Text style={styles.subtitle}>6. Cookies e Tecnologias Similares</Text>
          <Text style={styles.paragraph}>
            Usamos cookies e tecnologias similares para melhorar a experiência do usuário e
            analisar o uso do aplicativo.
          </Text>

          <Text style={styles.subtitle}>7. Alterações nesta Política</Text>
          <Text style={styles.paragraph}>
            Podemos atualizar esta política periodicamente. Notificaremos você sobre
            alterações significativas através do aplicativo.
          </Text>
        </View>

        {/* Contato */}
        <View style={styles.contactSection}>
          <Ionicons name="mail-outline" size={24} color={BotaLoveColors.primary} />
          <Text style={styles.contactText}>
            Dúvidas? Entre em contato: suporte@botalove.com.br
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2025 Bota Love. Todos os direitos reservados.</Text>
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
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: BotaLoveColors.backgroundWhite,
    padding: 20,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: BotaLoveColors.secondary,
    marginBottom: 4,
  },
  sectionDate: {
    fontSize: 12,
    color: BotaLoveColors.neutralDark,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: BotaLoveColors.secondary,
    marginTop: 16,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 14,
    color: BotaLoveColors.textPrimary,
    lineHeight: 22,
    marginBottom: 12,
  },
  contactSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BotaLoveColors.backgroundWhite,
    padding: 20,
    marginTop: 16,
    gap: 12,
  },
  contactText: {
    fontSize: 14,
    color: BotaLoveColors.textPrimary,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: BotaLoveColors.neutralDark,
    textAlign: 'center',
  },
});
