import { BotaLoveColors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    Dimensions,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isSmallDevice = SCREEN_WIDTH < 375;
const CARD_PADDING = isSmallDevice ? 16 : 20;

// Categorias de exploração
const EXPLORE_CATEGORIES = [
  { id: '1', title: 'Eventos', icon: 'calendar', color: '#E74C3C', route: '/(tabs)/events' },
  { id: '2', title: 'Matches', icon: 'heart', color: '#FF69B4', route: '/(tabs)/matches' },
  { id: '3', title: 'Mensagens', icon: 'chatbubbles', color: '#3498DB', route: '/(tabs)/chat' },
  { id: '4', title: 'Loja', icon: 'cart', color: '#9B59B6', route: '/(tabs)/store' },
];

// Dicas de utilização
const TIPS = [
  { id: '1', title: 'Complete seu perfil', desc: 'Perfis completos têm 3x mais matches', icon: 'person-circle' },
  { id: '2', title: 'Adicione fotos', desc: 'Mostre seu dia a dia no campo', icon: 'images' },
  { id: '3', title: 'Participe de eventos', desc: 'Conheça pessoas ao vivo', icon: 'calendar' },
];

export default function ExploreScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[BotaLoveColors.secondary, '#1a0a00']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Explorar</Text>
        <Text style={styles.headerSubtitle}>Descubra novas conexões do agro</Text>
      </LinearGradient>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acesso Rápido</Text>
          <View style={styles.categoriesGrid}>
            {EXPLORE_CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={styles.categoryCard}
                onPress={() => router.push(category.route as any)}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={[category.color, `${category.color}CC`]}
                  style={styles.categoryGradient}
                >
                  <View style={styles.categoryIconContainer}>
                    <Ionicons name={category.icon as any} size={isSmallDevice ? 28 : 34} color="#FFF" />
                  </View>
                  <Text style={styles.categoryTitle}>{category.title}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Dicas */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Dicas para você</Text>
            <Ionicons name="bulb" size={22} color={BotaLoveColors.primary} />
          </View>
          
          {TIPS.map((tip, index) => (
            <TouchableOpacity 
              key={tip.id} 
              style={[styles.tipCard, index === TIPS.length - 1 && styles.tipCardLast]}
              activeOpacity={0.8}
            >
              <View style={styles.tipIconContainer}>
                <Ionicons name={tip.icon as any} size={isSmallDevice ? 22 : 26} color={BotaLoveColors.primary} />
              </View>
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>{tip.title}</Text>
                <Text style={styles.tipDesc}>{tip.desc}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={BotaLoveColors.neutralMedium} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Estatísticas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Suas Estatísticas</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <LinearGradient
                colors={[BotaLoveColors.primary, BotaLoveColors.primaryDark]}
                style={styles.statGradient}
              >
                <Text style={styles.statNumber}>82</Text>
                <Text style={styles.statLabel}>Matches</Text>
              </LinearGradient>
            </View>
            <View style={styles.statCard}>
              <LinearGradient
                colors={['#3498DB', '#2980B9']}
                style={styles.statGradient}
              >
                <Text style={styles.statNumber}>24</Text>
                <Text style={styles.statLabel}>Conversas</Text>
              </LinearGradient>
            </View>
            <View style={styles.statCard}>
              <LinearGradient
                colors={['#E74C3C', '#C0392B']}
                style={styles.statGradient}
              >
                <Text style={styles.statNumber}>5</Text>
                <Text style={styles.statLabel}>Eventos</Text>
              </LinearGradient>
            </View>
          </View>
        </View>

        {/* Banner Premium */}
        <TouchableOpacity style={styles.premiumBanner} activeOpacity={0.9}>
          <LinearGradient
            colors={['#E5C88A', BotaLoveColors.primary, '#B8944D']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.premiumGradient}
          >
            <View style={styles.premiumIconContainer}>
              <Ionicons name="star" size={isSmallDevice ? 32 : 38} color="#FFF" />
            </View>
            <View style={styles.premiumContent}>
              <Text style={styles.premiumTitle}>Seja Premium</Text>
              <Text style={styles.premiumDesc}>Destaque-se e encontre seu par ideal</Text>
            </View>
            <Ionicons name="arrow-forward-circle" size={28} color="#FFF" />
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingBottom: isSmallDevice ? 24 : 32,
    paddingHorizontal: CARD_PADDING,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: isSmallDevice ? 30 : 36,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: isSmallDevice ? 14 : 16,
    color: '#FFF',
    opacity: 0.9,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: isSmallDevice ? 16 : 22,
  },
  section: {
    paddingHorizontal: CARD_PADDING,
    marginBottom: isSmallDevice ? 24 : 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: isSmallDevice ? 14 : 18,
  },
  sectionTitle: {
    fontSize: isSmallDevice ? 19 : 22,
    fontWeight: '700',
    color: BotaLoveColors.secondary,
    letterSpacing: -0.3,
    marginBottom: isSmallDevice ? 14 : 18,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: isSmallDevice ? 12 : 16,
  },
  categoryCard: {
    width: (SCREEN_WIDTH - (CARD_PADDING * 2) - (isSmallDevice ? 12 : 16)) / 2,
    aspectRatio: 1.3,
    borderRadius: isSmallDevice ? 18 : 22,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  categoryGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: isSmallDevice ? 16 : 20,
  },
  categoryIconContainer: {
    width: isSmallDevice ? 56 : 68,
    height: isSmallDevice ? 56 : 68,
    borderRadius: isSmallDevice ? 28 : 34,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: isSmallDevice ? 10 : 14,
  },
  categoryTitle: {
    fontSize: isSmallDevice ? 15 : 17,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: -0.2,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BotaLoveColors.backgroundWhite,
    padding: isSmallDevice ? 16 : 20,
    borderRadius: isSmallDevice ? 14 : 18,
    marginBottom: isSmallDevice ? 10 : 14,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  tipCardLast: {
    marginBottom: 0,
  },
  tipIconContainer: {
    width: isSmallDevice ? 48 : 56,
    height: isSmallDevice ? 48 : 56,
    borderRadius: isSmallDevice ? 24 : 28,
    backgroundColor: '#FFF9E6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: isSmallDevice ? 14 : 18,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: isSmallDevice ? 15 : 17,
    fontWeight: '700',
    color: BotaLoveColors.secondary,
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  tipDesc: {
    fontSize: isSmallDevice ? 13 : 14,
    color: BotaLoveColors.neutralDark,
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: isSmallDevice ? 10 : 14,
  },
  statCard: {
    flex: 1,
    borderRadius: isSmallDevice ? 16 : 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  statGradient: {
    paddingVertical: isSmallDevice ? 20 : 26,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: isSmallDevice ? 28 : 34,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: isSmallDevice ? 12 : 13,
    fontWeight: '600',
    color: '#FFF',
    opacity: 0.92,
  },
  premiumBanner: {
    marginHorizontal: CARD_PADDING,
    borderRadius: isSmallDevice ? 20 : 24,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: BotaLoveColors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  premiumGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: isSmallDevice ? 20 : 26,
    paddingHorizontal: isSmallDevice ? 18 : 24,
  },
  premiumIconContainer: {
    width: isSmallDevice ? 56 : 68,
    height: isSmallDevice ? 56 : 68,
    borderRadius: isSmallDevice ? 28 : 34,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: isSmallDevice ? 14 : 18,
  },
  premiumContent: {
    flex: 1,
  },
  premiumTitle: {
    fontSize: isSmallDevice ? 19 : 22,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  premiumDesc: {
    fontSize: isSmallDevice ? 13 : 14,
    color: '#FFF',
    opacity: 0.92,
    fontWeight: '500',
  },
  bottomSpacer: {
    height: isSmallDevice ? 35 : 50,
  },
});
