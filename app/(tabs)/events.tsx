import { BotaLoveColors } from '@/constants/theme';
import { Event, subscribeToActiveEvents } from '@/firebase/eventService';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const isSmallDevice = SCREEN_WIDTH < 375;
const isMediumDevice = SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 414;
const BANNER_WIDTH = SCREEN_WIDTH - (isSmallDevice ? 32 : 40);
const CARD_PADDING = isSmallDevice ? 16 : 20;

const EVENT_TYPES = [
  { id: 'todos', label: 'Todos', icon: 'grid' },
  { id: 'feira', label: 'Feiras', icon: 'business' },
  { id: 'rodeio', label: 'Rodeios', icon: 'trophy' },
  { id: 'exposicao', label: 'Exposições', icon: 'ribbon' },
  { id: 'show', label: 'Shows', icon: 'musical-notes' },
  { id: 'leilao', label: 'Leilões', icon: 'hammer' },
  { id: 'congresso', label: 'Congressos', icon: 'people' },
];

export default function EventsScreen() {
  const [searchText, setSearchText] = useState('');
  const [selectedType, setSelectedType] = useState('todos');
  const [showFilters, setShowFilters] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar eventos do Firestore
  useEffect(() => {
    const unsubscribe = subscribeToActiveEvents((activeEvents) => {
      setEvents(activeEvents);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Filtrar eventos por tipo e busca
  const filteredEvents = events.filter((event) => {
    const matchesType = selectedType === 'todos' || event.eventType === selectedType;
    const matchesSearch = searchText === '' || 
      event.title.toLowerCase().includes(searchText.toLowerCase()) ||
      event.city.toLowerCase().includes(searchText.toLowerCase()) ||
      event.state.toLowerCase().includes(searchText.toLowerCase());
    return matchesType && matchesSearch;
  });

  // Eventos em destaque (isHighlighted = true)
  const featuredEvents = filteredEvents.filter(event => event.isHighlighted);
  
  // Eventos normais
  const nearbyEvents = filteredEvents.filter(event => !event.isHighlighted);

  const formatDate = (timestamp: any) => {
    const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    const day = date.getDate();
    const month = date.toLocaleDateString('pt-BR', { month: 'short' });
    return { day, month };
  };

  const getEventTypeIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      rodeio: '🤠',
      exposicao: '🐂',
      balada: '🎉',
      encontro: '🤝',
      feira: '🏪',
      show: '🎤',
      leilao: '🔨',
      congresso: '👥',
      circuito: '🏆',
      festa: '🎉',
    };
    return icons[type] || '📅';
  };

  // Placeholder image para eventos sem imagem
  const getEventImage = (event: Event) => {
    if (event.coverImage) return { uri: event.coverImage };
    // Imagens placeholder baseadas no tipo
    const placeholders: { [key: string]: string } = {
      show: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800',
      feira: 'https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=800',
      rodeio: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800',
      leilao: 'https://images.unsplash.com/photo-1555992336-03a23c7b20ee?w=800',
      circuito: 'https://images.unsplash.com/photo-1531259683007-016a7b628fc3?w=800',
      festa: 'https://images.unsplash.com/photo-1496843916299-590492c751f4?w=800',
      congresso: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
    };
    return { uri: placeholders[event.eventType] || 'https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?w=800' };
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Eventos</Text>
        <TouchableOpacity style={styles.mapButton}>
          <Ionicons name="map-outline" size={24} color={BotaLoveColors.secondary} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={BotaLoveColors.neutralDark} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por região, data, tipo"
            placeholderTextColor={BotaLoveColors.neutralDark}
            value={searchText}
            onChangeText={setSearchText}
          />
          <TouchableOpacity onPress={() => setShowFilters(!showFilters)}>
            <Ionicons 
              name={showFilters ? "funnel" : "funnel-outline"} 
              size={20} 
              color={showFilters ? BotaLoveColors.primary : BotaLoveColors.neutralDark} 
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[0]}
      >
        {/* Filtros por tipo */}
        <View style={styles.filtersWrapper}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filters}
          >
            {EVENT_TYPES.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.filterChip,
                  selectedType === type.id && styles.filterChipActive,
                ]}
                onPress={() => setSelectedType(type.id)}
              >
                <Ionicons 
                  name={type.icon as any} 
                  size={16} 
                  color={selectedType === type.id ? '#FFF' : BotaLoveColors.secondary} 
                />
                <Text
                  style={[
                    styles.filterChipText,
                    selectedType === type.id && styles.filterChipTextActive,
                  ]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Eventos em Destaque */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Eventos em Destaque</Text>
            <Ionicons name="star" size={20} color={BotaLoveColors.primary} />
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={BotaLoveColors.primary} />
            </View>
          ) : featuredEvents.length === 0 ? (
            <View style={styles.emptyFeatured}>
              <Text style={styles.emptyFeaturedText}>Nenhum evento em destaque no momento</Text>
            </View>
          ) : (
            <FlatList
              data={featuredEvents}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.featuredList}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                const { day, month } = formatDate(item.eventDate);
                return (
                  <TouchableOpacity style={styles.featuredCard}>
                    <Image source={getEventImage(item)} style={styles.featuredImage} />
                    <LinearGradient
                      colors={['transparent', 'rgba(0,0,0,0.9)']}
                      style={styles.featuredGradient}
                    />
                    
                    {/* Badge de destaque */}
                    <View style={styles.featuredBadge}>
                      <Ionicons name="star" size={12} color="#FFF" />
                      <Text style={styles.featuredBadgeText}>DESTAQUE</Text>
                    </View>

                    {/* Data */}
                    <View style={styles.featuredDate}>
                      <Text style={styles.featuredDay}>{day}</Text>
                      <Text style={styles.featuredMonth}>{month}</Text>
                    </View>

                    {/* Info */}
                    <View style={styles.featuredInfo}>
                      <View style={styles.featuredTypeRow}>
                        <Text style={styles.featuredTypeIcon}>{getEventTypeIcon(item.eventType)}</Text>
                        <Text style={styles.featuredType}>{item.eventType.toUpperCase()}</Text>
                      </View>
                      <Text style={styles.featuredTitle}>{item.title}</Text>
                      <View style={styles.featuredLocationRow}>
                        <Ionicons name="location" size={14} color="#FFF" />
                        <Text style={styles.featuredLocation}>{item.city}, {item.state}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          )}
        </View>

        {/* Eventos Perto de Você */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Eventos perto de você</Text>
            <Ionicons name="navigate" size={20} color={BotaLoveColors.primary} />
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={BotaLoveColors.primary} />
            </View>
          ) : nearbyEvents.length === 0 ? (
            <View style={styles.emptyEvents}>
              <Ionicons name="calendar-outline" size={48} color={BotaLoveColors.neutralDark} />
              <Text style={styles.emptyEventsTitle}>Nenhum evento encontrado</Text>
              <Text style={styles.emptyEventsText}>
                {events.length === 0 
                  ? 'Seja o primeiro a publicar um evento!' 
                  : 'Tente ajustar os filtros de busca'}
              </Text>
            </View>
          ) : (
            nearbyEvents.map((event) => {
              const { day, month } = formatDate(event.eventDate);
              return (
                <TouchableOpacity key={event.id} style={styles.eventCard}>
                  <Image source={getEventImage(event)} style={styles.eventThumbnail} />
                  
                  <View style={styles.eventContent}>
                    <View style={styles.eventHeader}>
                      <View style={styles.eventDate}>
                        <Text style={styles.eventDay}>{day}</Text>
                        <Text style={styles.eventMonth}>{month}</Text>
                      </View>

                      <View style={styles.eventType}>
                        <Text style={styles.eventTypeIcon}>{getEventTypeIcon(event.eventType)}</Text>
                        <Text style={styles.eventTypeText}>{event.eventType.toUpperCase()}</Text>
                      </View>
                    </View>

                    <Text style={styles.eventTitle}>{event.title}</Text>
                    
                    <View style={styles.eventLocationRow}>
                      <Ionicons name="location-outline" size={14} color={BotaLoveColors.neutralDark} />
                      <Text style={styles.eventLocation}>{event.venueName}, {event.city}</Text>
                    </View>

                    <Text style={styles.eventDescription} numberOfLines={2}>
                      {event.description}
                    </Text>

                    <View style={styles.eventFooter}>
                      <Text style={styles.eventPrice}>
                        {event.ticketPrice ? `R$ ${event.ticketPrice.toFixed(2).replace('.', ',')}` : 'Gratuito'}
                      </Text>
                      <TouchableOpacity style={styles.interestButton} activeOpacity={0.8}>
                        <Text style={styles.interestButtonText}>Tenho interesse</Text>
                        <Ionicons name="arrow-forward" size={isSmallDevice ? 12 : 14} color="#FFF" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BotaLoveColors.backgroundLight,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: CARD_PADDING,
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingBottom: isSmallDevice ? 16 : 20,
    backgroundColor: BotaLoveColors.backgroundWhite,
    borderBottomWidth: 0,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  title: {
    fontSize: isSmallDevice ? 28 : 32,
    fontWeight: '800',
    color: BotaLoveColors.textPrimary,
    letterSpacing: -0.5,
  },
  mapButton: {
    width: isSmallDevice ? 40 : 48,
    height: isSmallDevice ? 40 : 48,
    borderRadius: isSmallDevice ? 20 : 24,
    backgroundColor: BotaLoveColors.neutralLight,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: BotaLoveColors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  searchContainer: {
    paddingHorizontal: CARD_PADDING,
    paddingVertical: isSmallDevice ? 12 : 16,
    backgroundColor: BotaLoveColors.backgroundWhite,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BotaLoveColors.neutralLight,
    borderRadius: isSmallDevice ? 14 : 16,
    paddingHorizontal: isSmallDevice ? 14 : 18,
    height: isSmallDevice ? 48 : 54,
    gap: isSmallDevice ? 10 : 14,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  searchInput: {
    flex: 1,
    fontSize: isSmallDevice ? 14 : 15,
    color: BotaLoveColors.textPrimary,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  filtersWrapper: {
    backgroundColor: BotaLoveColors.backgroundWhite,
    paddingBottom: isSmallDevice ? 12 : 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.04)',
  },
  filters: {
    paddingHorizontal: CARD_PADDING,
    gap: isSmallDevice ? 6 : 10,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: isSmallDevice ? 14 : 18,
    height: isSmallDevice ? 36 : 40,
    borderRadius: isSmallDevice ? 18 : 20,
    backgroundColor: BotaLoveColors.backgroundWhite,
    gap: isSmallDevice ? 5 : 7,
    borderWidth: 1.5,
    borderColor: BotaLoveColors.neutralLight,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  filterChipActive: {
    backgroundColor: BotaLoveColors.primary,
    borderColor: BotaLoveColors.primary,
    ...Platform.select({
      ios: {
        shadowColor: BotaLoveColors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  filterChipText: {
    fontSize: isSmallDevice ? 12 : 13,
    fontWeight: '600',
    color: BotaLoveColors.secondary,
  },
  filterChipTextActive: {
    color: '#FFF',
  },
  section: {
    marginBottom: isSmallDevice ? 24 : 32,
    marginTop: isSmallDevice ? 16 : 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: CARD_PADDING,
    marginBottom: isSmallDevice ? 14 : 18,
  },
  sectionTitle: {
    fontSize: isSmallDevice ? 18 : 20,
    fontWeight: '700',
    color: BotaLoveColors.textPrimary,
    letterSpacing: -0.3,
  },
  featuredList: {
    paddingLeft: CARD_PADDING,
    gap: isSmallDevice ? 12 : 16,
  },
  featuredCard: {
    width: BANNER_WIDTH,
    height: isSmallDevice ? 240 : (isMediumDevice ? 270 : 300),
    borderRadius: isSmallDevice ? 18 : 24,
    overflow: 'hidden',
    marginRight: isSmallDevice ? 12 : 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  featuredImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  featuredGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '65%',
  },
  featuredBadge: {
    position: 'absolute',
    top: isSmallDevice ? 12 : 16,
    right: isSmallDevice ? 12 : 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BotaLoveColors.primary,
    paddingHorizontal: isSmallDevice ? 10 : 14,
    paddingVertical: isSmallDevice ? 5 : 7,
    borderRadius: isSmallDevice ? 16 : 20,
    gap: 4,
    ...Platform.select({
      ios: {
        shadowColor: BotaLoveColors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  featuredBadgeText: {
    fontSize: isSmallDevice ? 10 : 11,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 0.8,
  },
  featuredDate: {
    position: 'absolute',
    top: isSmallDevice ? 12 : 16,
    left: isSmallDevice ? 12 : 16,
    backgroundColor: 'rgba(255,255,255,0.97)',
    width: isSmallDevice ? 52 : 64,
    height: isSmallDevice ? 52 : 64,
    borderRadius: isSmallDevice ? 12 : 14,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  featuredDay: {
    fontSize: isSmallDevice ? 20 : 26,
    fontWeight: '800',
    color: BotaLoveColors.primary,
    lineHeight: isSmallDevice ? 24 : 30,
  },
  featuredMonth: {
    fontSize: isSmallDevice ? 10 : 12,
    fontWeight: '700',
    color: BotaLoveColors.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  featuredInfo: {
    position: 'absolute',
    bottom: isSmallDevice ? 16 : 22,
    left: isSmallDevice ? 16 : 22,
    right: isSmallDevice ? 16 : 22,
  },
  featuredTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: isSmallDevice ? 5 : 7,
    marginBottom: isSmallDevice ? 6 : 10,
  },
  featuredTypeIcon: {
    fontSize: isSmallDevice ? 14 : 17,
  },
  featuredType: {
    fontSize: isSmallDevice ? 10 : 12,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.95)',
    letterSpacing: 1.2,
  },
  featuredTitle: {
    fontSize: isSmallDevice ? 20 : 26,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: isSmallDevice ? 6 : 10,
    letterSpacing: -0.3,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  featuredLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: isSmallDevice ? 4 : 6,
  },
  featuredLocation: {
    fontSize: isSmallDevice ? 13 : 15,
    color: 'rgba(255,255,255,0.92)',
    fontWeight: '500',
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: BotaLoveColors.backgroundWhite,
    borderRadius: isSmallDevice ? 14 : 18,
    marginHorizontal: CARD_PADDING,
    marginBottom: isSmallDevice ? 12 : 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  eventThumbnail: {
    width: isSmallDevice ? 90 : 105,
    height: '100%',
    minHeight: isSmallDevice ? 150 : 170,
    backgroundColor: BotaLoveColors.neutralLight,
  },
  eventContent: {
    flex: 1,
    padding: isSmallDevice ? 10 : 14,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: isSmallDevice ? 6 : 8,
  },
  eventDate: {
    backgroundColor: BotaLoveColors.neutralLight,
    paddingHorizontal: isSmallDevice ? 8 : 10,
    paddingVertical: isSmallDevice ? 4 : 6,
    borderRadius: isSmallDevice ? 6 : 8,
    alignItems: 'center',
    minWidth: isSmallDevice ? 40 : 46,
  },
  eventDay: {
    fontSize: isSmallDevice ? 13 : 15,
    fontWeight: '800',
    color: BotaLoveColors.primary,
  },
  eventMonth: {
    fontSize: isSmallDevice ? 8 : 9,
    fontWeight: '700',
    color: BotaLoveColors.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.2,
  },
  eventType: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BotaLoveColors.neutralLight,
    paddingHorizontal: isSmallDevice ? 6 : 8,
    paddingVertical: isSmallDevice ? 3 : 4,
    borderRadius: isSmallDevice ? 5 : 6,
    gap: 3,
  },
  eventTypeIcon: {
    fontSize: isSmallDevice ? 10 : 11,
  },
  eventTypeText: {
    fontSize: isSmallDevice ? 8 : 9,
    fontWeight: '700',
    color: BotaLoveColors.secondary,
    letterSpacing: 0.3,
  },
  eventTitle: {
    fontSize: isSmallDevice ? 13 : 15,
    fontWeight: '700',
    color: BotaLoveColors.textPrimary,
    marginBottom: isSmallDevice ? 3 : 5,
    letterSpacing: -0.2,
  },
  eventLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: isSmallDevice ? 3 : 4,
    marginBottom: isSmallDevice ? 4 : 6,
  },
  eventLocation: {
    fontSize: isSmallDevice ? 10 : 11,
    color: BotaLoveColors.neutralDark,
    fontWeight: '500',
  },
  eventDescription: {
    fontSize: isSmallDevice ? 10 : 11,
    color: BotaLoveColors.textSecondary,
    lineHeight: isSmallDevice ? 14 : 16,
    marginBottom: isSmallDevice ? 6 : 10,
    opacity: 0.85,
  },
  eventFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 'auto',
    paddingTop: isSmallDevice ? 10 : 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.04)',
    gap: isSmallDevice ? 8 : 12,
  },
  eventPrice: {
    fontSize: isSmallDevice ? 13 : 15,
    fontWeight: '800',
    color: BotaLoveColors.primary,
    flex: 1,
  },
  interestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: isSmallDevice ? 4 : 6,
    paddingHorizontal: isSmallDevice ? 10 : 12,
    paddingVertical: isSmallDevice ? 8 : 9,
    backgroundColor: BotaLoveColors.primary,
    borderRadius: isSmallDevice ? 8 : 10,
    ...Platform.select({
      ios: {
        shadowColor: BotaLoveColors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  interestButtonText: {
    fontSize: isSmallDevice ? 10 : 11,
    fontWeight: '700',
    color: '#FFF',
  },
  bottomSpacer: {
    height: isSmallDevice ? 90 : 100,
  },
  // Loading e Empty States
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyFeatured: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: BotaLoveColors.neutralLight,
    borderRadius: 12,
    marginHorizontal: CARD_PADDING,
  },
  emptyFeaturedText: {
    fontSize: 14,
    color: BotaLoveColors.neutralDark,
    fontWeight: '500',
  },
  emptyEvents: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BotaLoveColors.backgroundWhite,
    borderRadius: 16,
    marginHorizontal: CARD_PADDING,
    gap: 12,
  },
  emptyEventsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: BotaLoveColors.secondary,
  },
  emptyEventsText: {
    fontSize: 14,
    color: BotaLoveColors.neutralDark,
    textAlign: 'center',
  },
});
