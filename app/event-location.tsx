import { BotaLoveColors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useInventoryItemByName } from '@/firebase/planSubscriptionService';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width } = Dimensions.get('window');

// Mock de eventos próximos com coordenadas
const MOCK_EVENTS = [
  {
    id: '1',
    name: 'Festa do Peão de Goiânia',
    image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800',
    date: '15 de Dezembro',
    distance: 12,
    attendees: 245,
    latitude: -16.6799,
    longitude: -49.2550,
    radius: 2, // km de raio para check-in
  },
  {
    id: '2',
    name: 'Rodeio Show 2025',
    image: 'https://images.unsplash.com/photo-1598387993281-cecf8b71a8f8?w=800',
    date: '20 de Dezembro',
    distance: 28,
    attendees: 189,
    latitude: -16.7330,
    longitude: -49.2690,
    radius: 3,
  },
  {
    id: '3',
    name: 'Expo Agro Goiás',
    image: 'https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?w=800',
    date: '5 de Janeiro',
    distance: 45,
    attendees: 312,
    latitude: -16.6868,
    longitude: -49.2648,
    radius: 5,
  },
];

// Função para calcular distância em km usando Haversine
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

export default function EventLocationScreen() {
  const router = useRouter();
  const { hasPremium, currentUser } = useAuth();
  
  // Controle de uso dos recursos
  const [botaEventCount, setBotaEventCount] = useState(0);
  const [checkinCount, setCheckinCount] = useState(0);
  const [confirmedEvents, setConfirmedEvents] = useState<string[]>([]);
  const [checkedInEvents, setCheckedInEvents] = useState<string[]>([]);
  
  // Estado de localização
  const [userLocation, setUserLocation] = useState<{latitude: number; longitude: number} | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  
  // Limites por plano
  const BOTA_EVENT_LIMIT = hasPremium ? -1 : 5; // -1 = ilimitado
  const CHECKIN_LIMIT = hasPremium ? -1 : 5;
  
  // Obter localização do usuário
  const getUserLocation = async (): Promise<{latitude: number; longitude: number} | null> => {
    try {
      setLoadingLocation(true);
      
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permissão Necessária',
          'Precisamos da sua localização para verificar sua presença no evento.'
        );
        return null;
      }
      
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      
      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      
      setUserLocation(coords);
      return coords;
    } catch (error) {
      console.error('Erro ao obter localização:', error);
      Alert.alert('Erro', 'Não foi possível obter sua localização.');
      return null;
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleBotaNoEvento = async (eventId: string) => {
    if (!currentUser?.id) {
      Alert.alert('Erro', 'Você precisa estar logado');
      return;
    }
    
    // Verificar se já confirmou presença
    if (confirmedEvents.includes(eventId)) {
      Alert.alert('Já confirmado!', 'Você já confirmou presença neste evento.');
      return;
    }
    
    // Verificar limite de uso
    if (BOTA_EVENT_LIMIT !== -1 && botaEventCount >= BOTA_EVENT_LIMIT) {
      // Tentar consumir do inventário
      const consumeResult = await useInventoryItemByName(currentUser.id, 'Bota no Evento', 1);
      if (!consumeResult.success) {
        Alert.alert(
          'Limite Atingido',
          'Você atingiu o limite de "Bota no Evento" do seu plano. Deseja comprar pacotes adicionais?',
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Ver Pacotes', onPress: () => router.push('/store' as any) },
          ]
        );
        return;
      }
      console.log(`✅ Bota no Evento usado do inventário! Restante: ${consumeResult.remaining}`);
    }
    
    const event = MOCK_EVENTS.find(e => e.id === eventId);
    
    setBotaEventCount(botaEventCount + 1);
    setConfirmedEvents([...confirmedEvents, eventId]);
    
    Alert.alert(
      '🎉 Presença Confirmada!',
      `Você confirmou presença em "${event?.name}"!\n\nVocê será notificado quando outros participantes também confirmarem.`,
      [{ text: 'Maravilha!' }]
    );
  };

  const handleCheckinAgro = async (eventId: string) => {
    if (!currentUser?.id) {
      Alert.alert('Erro', 'Você precisa estar logado');
      return;
    }
    
    // Verificar se já fez check-in
    if (checkedInEvents.includes(eventId)) {
      Alert.alert('Check-in já realizado!', 'Você já fez check-in neste evento.');
      return;
    }
    
    const event = MOCK_EVENTS.find(e => e.id === eventId);
    if (!event) return;
    
    // Obter localização do usuário
    const location = await getUserLocation();
    if (!location) return;
    
    // Calcular distância até o evento
    const distance = calculateDistance(
      location.latitude, 
      location.longitude,
      event.latitude,
      event.longitude
    );
    
    // Verificar se está dentro do raio do evento
    if (distance > event.radius) {
      Alert.alert(
        'Muito Longe!',
        `Você está a ${distance.toFixed(1)}km do evento.\n\nPara fazer check-in, você precisa estar a no máximo ${event.radius}km do local.`,
        [{ text: 'Entendi' }]
      );
      return;
    }

    // Se for premium com limite ilimitado, apenas fazer check-in
    if (CHECKIN_LIMIT === -1) {
      setCheckinCount(checkinCount + 1);
      setCheckedInEvents([...checkedInEvents, eventId]);
      Alert.alert(
        '✅ Check-in Realizado!',
        `Você fez check-in em "${event.name}"!\n\nSeu perfil agora aparece em destaque para outros participantes.`
      );
      return;
    }

    // Consumir item Checkin Agro do inventário
    const consumeResult = await useInventoryItemByName(currentUser.id, 'Checkin Agro', 1);
    if (!consumeResult.success) {
      console.log('❌ Sem Checkin Agro disponível:', consumeResult.error);
      Alert.alert(
        'Limite Atingido',
        'Você não tem "Checkin Agro" disponível. Deseja comprar pacotes adicionais?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Ver Pacotes', onPress: () => router.push('/store' as any) },
        ]
      );
      return;
    }
    
    console.log(`✅ Checkin Agro usado! Restante: ${consumeResult.remaining}`);
    setCheckinCount(checkinCount + 1);
    setCheckedInEvents([...checkedInEvents, eventId]);
    Alert.alert(
      '✅ Check-in Realizado!',
      `Você fez check-in em "${event.name}"!\n\nSeu perfil agora aparece em destaque para outros participantes.`
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#27AE60', '#229954']}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Localização de Eventos</Text>
        <View style={styles.headerPlaceholder} />
      </LinearGradient>

      {/* Usage Stats */}
      <View style={styles.usageCard}>
        <View style={styles.usageStat}>
          <Ionicons name="leaf" size={24} color={BotaLoveColors.primary} />
          <View style={styles.usageInfo}>
            <Text style={styles.usageLabel}>Bota no Evento</Text>
            <Text style={styles.usageCount}>
              {BOTA_EVENT_LIMIT === -1 ? 'Ilimitado' : `${botaEventCount}/${BOTA_EVENT_LIMIT}`}
            </Text>
          </View>
        </View>
        <View style={styles.usageStat}>
          <Ionicons name="checkmark-circle" size={24} color="#27AE60" />
          <View style={styles.usageInfo}>
            <Text style={styles.usageLabel}>Checkin Agro</Text>
            <Text style={styles.usageCount}>
              {CHECKIN_LIMIT === -1 ? 'Ilimitado' : `${checkinCount}/${CHECKIN_LIMIT}`}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.eventsContainer}>
          {MOCK_EVENTS.map((event) => (
            <View key={event.id} style={styles.eventCard}>
              <Image source={{ uri: event.image }} style={styles.eventImage} />
              
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.8)']}
                style={styles.eventGradient}
              />

              <View style={styles.eventInfo}>
                <Text style={styles.eventName}>{event.name}</Text>
                <View style={styles.eventDetails}>
                  <View style={styles.eventDetail}>
                    <Ionicons name="calendar" size={16} color="#FFF" />
                    <Text style={styles.eventDetailText}>{event.date}</Text>
                  </View>
                  <View style={styles.eventDetail}>
                    <Ionicons name="navigate" size={16} color="#FFF" />
                    <Text style={styles.eventDetailText}>{event.distance} km</Text>
                  </View>
                  <View style={styles.eventDetail}>
                    <Ionicons name="people" size={16} color="#FFF" />
                    <Text style={styles.eventDetailText}>{event.attendees} pessoas</Text>
                  </View>
                </View>
              </View>

              <View style={styles.eventActions}>
                <TouchableOpacity
                  style={styles.botaButton}
                  onPress={() => handleBotaNoEvento(event.id)}
                >
                  <LinearGradient
                    colors={['#D4AD63', '#B8944D']}
                    style={styles.botaGradient}
                  >
                    <Ionicons name="leaf" size={20} color="#FFF" />
                    <Text style={styles.botaText}>Bota no Evento</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.checkinButton}
                  onPress={() => handleCheckinAgro(event.id)}
                >
                  <LinearGradient
                    colors={['#27AE60', '#229954']}
                    style={styles.checkinGradient}
                  >
                    <Ionicons name="checkmark-circle" size={20} color="#FFF" />
                    <Text style={styles.checkinText}>Checkin Agro</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {!hasPremium && (
          <View style={styles.upgradeSection}>
            <LinearGradient
              colors={['#E5C88A', BotaLoveColors.primary]}
              style={styles.upgradeGradient}
            >
              <Ionicons name="star" size={32} color="#FFF" />
              <Text style={styles.upgradeTitle}>Recursos Ilimitados</Text>
              <Text style={styles.upgradeText}>
                Com o plano Premium, use "Bota no Evento" e "Checkin Agro" sem limites!
              </Text>
              <TouchableOpacity
                style={styles.upgradeButton}
                onPress={() => router.push('/store' as any)}
              >
                <Text style={styles.upgradeButtonText}>Ver Planos Premium</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  headerPlaceholder: {
    width: 40,
  },
  usageCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    marginHorizontal: 12,
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  usageStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  usageInfo: {
    gap: 2,
  },
  usageLabel: {
    fontSize: 13,
    color: BotaLoveColors.neutralDark,
  },
  usageCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: BotaLoveColors.secondary,
  },
  eventsContainer: {
    padding: 12,
    gap: 16,
  },
  eventCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  eventImage: {
    width: '100%',
    height: 200,
  },
  eventGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 100,
    height: 150,
  },
  eventInfo: {
    position: 'absolute',
    bottom: 100,
    left: 16,
    right: 16,
  },
  eventName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  eventDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  eventDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  eventDetailText: {
    fontSize: 13,
    color: '#FFF',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  eventActions: {
    flexDirection: 'row',
    padding: 12,
    gap: 12,
  },
  botaButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  botaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  botaText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFF',
  },
  checkinButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  checkinGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  checkinText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFF',
  },
  upgradeSection: {
    marginHorizontal: 12,
    marginTop: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  upgradeGradient: {
    padding: 24,
    alignItems: 'center',
  },
  upgradeTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 12,
    marginBottom: 8,
  },
  upgradeText: {
    fontSize: 15,
    color: '#FFF',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
    opacity: 0.95,
  },
  upgradeButton: {
    backgroundColor: '#FFF',
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 24,
  },
  upgradeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: BotaLoveColors.primary,
  },
  bottomSpacer: {
    height: 40,
  },
});
