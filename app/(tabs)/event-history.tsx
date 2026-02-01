import { BotaLoveColors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { deleteEvent, Event, getEventPayments, renewEvent, simulateEventPayment, subscribeToProducerEvents } from '@/firebase/eventService';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isSmallDevice = SCREEN_WIDTH < 375;
const CARD_PADDING = isSmallDevice ? 14 : 18;

export default function EventHistoryScreen() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const [filter, setFilter] = useState<'all' | 'active' | 'pending' | 'highlighted'>('all');
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [eventPayments, setEventPayments] = useState<any[]>([]);
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [renewDuration, setRenewDuration] = useState(30);
  const [renewHighlight, setRenewHighlight] = useState(false);
  const [renewHighlightDays, setRenewHighlightDays] = useState(15);
  const [isProcessingRenew, setIsProcessingRenew] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showHighlightModal, setShowHighlightModal] = useState(false);
  const [highlightDays, setHighlightDays] = useState(15);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Carregar eventos do produtor
  useEffect(() => {
    if (!currentUser?.id) return;

    const unsubscribe = subscribeToProducerEvents(currentUser.id, (producerEvents) => {
      setEvents(producerEvents);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser?.id]);

  const filteredEvents = events.filter((event) => {
    if (filter === 'all') return true;
    if (filter === 'highlighted') return event.isHighlighted;
    return event.status === filter;
  });

  const handleEditEvent = (eventId: string) => {
    // Navegar para create-event com o ID do evento para edição
    router.push(`/(tabs)/create-event?editId=${eventId}` as any);
  };

  const handlePayEvent = (event: Event) => {
    setSelectedEvent(event);
    setShowPaymentModal(true);
  };

  const processPayment = async () => {
    if (!selectedEvent || !currentUser?.id) return;

    setIsProcessingPayment(true);
    try {
      const durationPrices: { [key: number]: number } = {
        15: 49.90,
        30: 89.90,
        60: 159.90,
        90: 219.90,
      };
      
      const highlightPrices: { [key: number]: number } = {
        15: 29.90,
        30: 49.90,
        60: 79.90,
        90: 99.90,
      };

      const durationPrice = durationPrices[selectedEvent.durationDays] || 89.90;
      const highlightPrice = selectedEvent.isHighlighted && selectedEvent.highlightDays 
        ? highlightPrices[selectedEvent.highlightDays] 
        : 0;

      const result = await simulateEventPayment(
        selectedEvent.id,
        currentUser.id,
        durationPrice,
        highlightPrice,
        selectedEvent.durationDays,
        selectedEvent.highlightDays
      );

      if (result.success) {
        Alert.alert(
          '✅ Pagamento Confirmado',
          'Seu evento foi ativado com sucesso!',
          [{ text: 'OK', onPress: () => setShowPaymentModal(false) }]
        );
      } else {
        Alert.alert('Erro', result.error || 'Não foi possível processar o pagamento');
      }
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao processar o pagamento');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleHighlightEvent = (event: Event) => {
    setSelectedEvent(event);
    setHighlightDays(15);
    setShowHighlightModal(true);
  };

  const processHighlight = async () => {
    if (!selectedEvent || !currentUser?.id) return;

    setIsProcessingPayment(true);
    try {
      const highlightPrices: { [key: number]: number } = {
        15: 29.90,
        30: 49.90,
        60: 79.90,
        90: 99.90,
      };

      const highlightPrice = highlightPrices[highlightDays] || 29.90;

      // Usar a função de renovação para adicionar destaque
      const result = await renewEvent(
        selectedEvent.id,
        currentUser.id,
        selectedEvent.durationDays, // Mantém a duração atual
        highlightDays,
        true // Ativa o destaque
      );

      if (result.success) {
        Alert.alert(
          '⭐ Destaque Ativado',
          `Seu evento foi destacado por ${highlightDays} dias!`,
          [{ text: 'OK', onPress: () => setShowHighlightModal(false) }]
        );
      } else {
        Alert.alert('Erro', result.error || 'Não foi possível adicionar o destaque');
      }
    } catch (error) {
      console.error('Erro ao adicionar destaque:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao processar o destaque');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleDeleteEvent = async (eventId: string, eventTitle: string) => {
    Alert.alert(
      'Excluir Evento',
      `Tem certeza que deseja excluir "${eventTitle}"?\n\nEsta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive', 
          onPress: async () => {
            setIsDeletingId(eventId);
            try {
              const result = await deleteEvent(eventId);
              if (result.success) {
                Alert.alert('Sucesso', 'Evento excluído com sucesso!');
              } else {
                Alert.alert('Erro', result.error || 'Não foi possível excluir o evento');
              }
            } catch (error) {
              console.error('Erro ao excluir evento:', error);
              Alert.alert('Erro', 'Ocorreu um erro ao excluir o evento');
            } finally {
              setIsDeletingId(null);
            }
          }
        },
      ]
    );
  };

  const handleViewStats = async (event: Event) => {
    setSelectedEvent(event);
    try {
      const payments = await getEventPayments(event.id);
      setEventPayments(payments);
    } catch (error) {
      console.error('Erro ao carregar pagamentos:', error);
    }
    setShowStatsModal(true);
  };

  const handleRenewEvent = (event: Event) => {
    setSelectedEvent(event);
    setRenewDuration(30);
    setRenewHighlight(false);
    setRenewHighlightDays(15);
    setShowRenewModal(true);
  };

  const processRenewal = async () => {
    if (!selectedEvent || !currentUser?.id) return;

    setIsProcessingRenew(true);
    try {
      const result = await renewEvent(
        selectedEvent.id,
        currentUser.id,
        renewDuration,
        renewHighlight ? renewHighlightDays : undefined,
        renewHighlight
      );

      if (result.success) {
        Alert.alert(
          '✅ Renovação Concluída',
          `Evento renovado com sucesso!\n\nDuração: ${renewDuration} dias${renewHighlight ? `\nDestaque: ${renewHighlightDays} dias` : ''}`,
          [{ text: 'OK', onPress: () => setShowRenewModal(false) }]
        );
      } else {
        Alert.alert('Erro', result.error || 'Não foi possível renovar o evento');
      }
    } catch (error) {
      console.error('Erro ao renovar evento:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao processar a renovação');
    } finally {
      setIsProcessingRenew(false);
    }
  };

  const calculateDaysRemaining = (expiresAt: any) => {
    if (!expiresAt) return 0;
    const expiry = expiresAt?.toDate ? expiresAt.toDate() : new Date(expiresAt);
    const now = new Date();
    const diff = expiry.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return Math.max(0, days);
  };

  const isEventExpired = (event: Event) => {
    return calculateDaysRemaining(event.expiresAt) === 0;
  };

  const getRenewalPrice = () => {
    const durationPrices: { [key: number]: number } = {
      15: 49.90,
      30: 89.90,
      60: 159.90,
      90: 219.90,
    };
    
    const highlightPrices: { [key: number]: number } = {
      15: 29.90,
      30: 49.90,
      60: 79.90,
      90: 99.90,
    };

    const durationPrice = durationPrices[renewDuration] || 89.90;
    const highlightPrice = renewHighlight ? (highlightPrices[renewHighlightDays] || 29.90) : 0;
    return { durationPrice, highlightPrice, total: durationPrice + highlightPrice };
  };

  const getStatusBadge = (status: string, event: Event) => {
    const daysRemaining = calculateDaysRemaining(event.expiresAt);
    
    if (status === 'active') {
      if (daysRemaining === 0) {
        return (
          <View style={styles.statusBadgeExpired}>
            <Text style={styles.statusBadgeTextExpired}>Expirado</Text>
          </View>
        );
      }
      
      const isExpiringSoon = daysRemaining <= 7;
      return (
        <View style={[styles.statusBadgeActive, isExpiringSoon && styles.statusBadgeWarning]}>
          <Text style={[styles.statusBadgeTextActive, isExpiringSoon && styles.statusBadgeTextWarning]}>
            {daysRemaining}d restantes
          </Text>
        </View>
      );
    }
    return (
      <View style={styles.statusBadgeInactive}>
        <Text style={styles.statusBadgeTextInactive}>Aguardando Pagamento</Text>
      </View>
    );
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Data não informada';
    const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('pt-BR');
  };

  // Placeholder image para eventos sem imagem
  const getEventImage = (event: Event) => {
    if (event.coverImage) return { uri: event.coverImage };
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

  if (isLoading) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={[BotaLoveColors.primary, BotaLoveColors.primaryDark]} style={styles.header}>
          <Text style={styles.headerTitle}>📋 Meus Eventos</Text>
          <Text style={styles.headerSubtitle}>Gerencie seus eventos publicados</Text>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BotaLoveColors.primary} />
          <Text style={styles.loadingText}>Carregando eventos...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[BotaLoveColors.primary, BotaLoveColors.primaryDark]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>📋 Meus Eventos</Text>
        <Text style={styles.headerSubtitle}>Gerencie seus eventos publicados</Text>
      </LinearGradient>

      {/* Filter Tabs */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filterScrollView}
        contentContainerStyle={styles.filterScrollContent}
      >
        <TouchableOpacity
          style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
          onPress={() => setFilter('all')}
        >
          <Ionicons 
            name="grid-outline" 
            size={16} 
            color={filter === 'all' ? '#FFF' : BotaLoveColors.neutralDark} 
          />
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            Todos
          </Text>
          <View style={[styles.filterBadge, filter === 'all' && styles.filterBadgeActive]}>
            <Text style={[styles.filterBadgeText, filter === 'all' && styles.filterBadgeTextActive]}>
              {events.length}
            </Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.filterTab, filter === 'active' && styles.filterTabActive]}
          onPress={() => setFilter('active')}
        >
          <Ionicons 
            name="checkmark-circle-outline" 
            size={16} 
            color={filter === 'active' ? '#FFF' : BotaLoveColors.neutralDark} 
          />
          <Text style={[styles.filterText, filter === 'active' && styles.filterTextActive]}>
            Ativos
          </Text>
          <View style={[styles.filterBadge, filter === 'active' && styles.filterBadgeActive]}>
            <Text style={[styles.filterBadgeText, filter === 'active' && styles.filterBadgeTextActive]}>
              {events.filter(e => e.status === 'active').length}
            </Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.filterTab, filter === 'pending' && styles.filterTabActive]}
          onPress={() => setFilter('pending')}
        >
          <Ionicons 
            name="time-outline" 
            size={16} 
            color={filter === 'pending' ? '#FFF' : BotaLoveColors.neutralDark} 
          />
          <Text style={[styles.filterText, filter === 'pending' && styles.filterTextActive]}>
            Pendentes
          </Text>
          <View style={[styles.filterBadge, filter === 'pending' && styles.filterBadgeActive]}>
            <Text style={[styles.filterBadgeText, filter === 'pending' && styles.filterBadgeTextActive]}>
              {events.filter(e => e.status === 'pending').length}
            </Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.filterTab, filter === 'highlighted' && styles.filterTabHighlighted]}
          onPress={() => setFilter('highlighted')}
        >
          <Ionicons 
            name="star" 
            size={16} 
            color={filter === 'highlighted' ? '#FFF' : BotaLoveColors.primary} 
          />
          <Text style={[styles.filterText, filter === 'highlighted' && styles.filterTextHighlighted]}>
            Destacados
          </Text>
          <View style={[styles.filterBadge, filter === 'highlighted' && styles.filterBadgeHighlighted]}>
            <Text style={[styles.filterBadgeText, filter === 'highlighted' && styles.filterBadgeTextActive]}>
              {events.filter(e => e.isHighlighted).length}
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.eventsContainer}>
          {filteredEvents.map((event) => (
            <View key={event.id} style={[
              styles.eventCard,
              event.isHighlighted && styles.eventCardHighlighted
            ]}>
              {/* Badge de Destaque */}
              {event.isHighlighted && (
                <View style={styles.highlightBadge}>
                  <LinearGradient
                    colors={[BotaLoveColors.primary, BotaLoveColors.primaryDark]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.highlightBadgeGradient}
                  >
                    <Ionicons name="star" size={14} color="#FFF" />
                    <Text style={styles.highlightBadgeText}>EM DESTAQUE</Text>
                  </LinearGradient>
                </View>
              )}
              
              <Image source={getEventImage(event)} style={styles.eventImage} />
              
              <View style={styles.eventContent}>
                <View style={styles.eventHeader}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  {getStatusBadge(event.status, event)}
                </View>

                {/* Alerta de Expiração */}
                {isEventExpired(event) && event.status === 'active' && (
                  <View style={styles.expiredAlert}>
                    <Ionicons name="warning" size={18} color="#E74C3C" />
                    <Text style={styles.expiredAlertText}>Este evento expirou!</Text>
                    <TouchableOpacity
                      style={styles.renewNowButton}
                      onPress={() => handleRenewEvent(event)}
                    >
                      <Text style={styles.renewNowButtonText}>Renovar Agora</Text>
                    </TouchableOpacity>
                  </View>
                )}

                <View style={styles.eventDetail}>
                  <Ionicons name="calendar" size={16} color={BotaLoveColors.neutralDark} />
                  <Text style={styles.eventDetailText}>
                    {formatDate(event.eventDate)} às {event.eventTime}
                  </Text>
                </View>

                <View style={styles.eventDetail}>
                  <Ionicons name="location" size={16} color={BotaLoveColors.neutralDark} />
                  <Text style={styles.eventDetailText}>
                    {event.venueName} - {event.city}/{event.state}
                  </Text>
                </View>

                <View style={styles.eventDetail}>
                  <Ionicons name="people" size={16} color={BotaLoveColors.neutralDark} />
                  <Text style={styles.eventDetailText}>
                    {event.interested}/{event.capacity} interessados
                  </Text>
                </View>

                {/* Métricas */}
                <View style={styles.metricsRow}>
                  <View style={styles.metricItem}>
                    <Ionicons name="eye" size={14} color="#3498DB" />
                    <Text style={styles.metricValue}>{event.views}</Text>
                    <Text style={styles.metricLabel}>views</Text>
                  </View>
                  <View style={styles.metricItem}>
                    <Ionicons name="heart" size={14} color="#E74C3C" />
                    <Text style={styles.metricValue}>{event.interested}</Text>
                    <Text style={styles.metricLabel}>interessados</Text>
                  </View>
                  <View style={styles.metricItem}>
                    <Ionicons name="time" size={14} color={BotaLoveColors.primary} />
                    <Text style={styles.metricValue}>{event.durationDays}d</Text>
                    <Text style={styles.metricLabel}>duração</Text>
                  </View>
                </View>

                {event.status === 'active' && (
                  <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                      <View 
                        style={[
                          styles.progressFill, 
                          { width: `${Math.min((event.interested / event.capacity) * 100, 100)}%` }
                        ]} 
                      />
                    </View>
                    <Text style={styles.progressText}>
                      {Math.round((event.interested / event.capacity) * 100)}% de interesse
                    </Text>
                  </View>
                )}

                <View style={styles.eventActions}>
                  {/* Botão de Pagamento para eventos pendentes */}
                  {event.status === 'pending' && (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.actionButtonPayment]}
                      onPress={() => handlePayEvent(event)}
                    >
                      <Ionicons name="card" size={18} color="#27AE60" />
                      <Text style={styles.actionButtonPaymentText}>Pagar</Text>
                    </TouchableOpacity>
                  )}

                  {/* Botão de Estatísticas */}
                  {event.status === 'active' && (
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleViewStats(event)}
                    >
                      <Ionicons name="stats-chart" size={18} color="#3498DB" />
                    </TouchableOpacity>
                  )}

                  {/* Botão de Editar */}
                  {!isEventExpired(event) && event.status === 'pending' && (
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleEditEvent(event.id)}
                    >
                      <Ionicons name="create" size={18} color={BotaLoveColors.primary} />
                    </TouchableOpacity>
                  )}

                  {/* Botão de Renovar para eventos expirados */}
                  {isEventExpired(event) && event.status === 'active' && (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.actionButtonRenew]}
                      onPress={() => handleRenewEvent(event)}
                    >
                      <Ionicons name="refresh" size={18} color="#27AE60" />
                      <Text style={styles.actionButtonRenewText}>Renovar</Text>
                    </TouchableOpacity>
                  )}

                  {/* Botão de Destacar (para eventos ativos sem destaque) */}
                  {event.status === 'active' && !event.isHighlighted && !isEventExpired(event) && (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.actionButtonHighlight]}
                      onPress={() => handleHighlightEvent(event)}
                    >
                      <Ionicons name="star" size={18} color="BotaLoveColors.primary" />
                    </TouchableOpacity>
                  )}

                  {/* Botão de Excluir */}
                  <TouchableOpacity
                    style={[styles.actionButton, isDeletingId === event.id && styles.actionButtonDisabled]}
                    onPress={() => handleDeleteEvent(event.id, event.title)}
                    disabled={isDeletingId === event.id}
                  >
                    {isDeletingId === event.id ? (
                      <ActivityIndicator size="small" color="#E74C3C" />
                    ) : (
                      <Ionicons name="trash" size={18} color="#E74C3C" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}

          {filteredEvents.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={64} color={BotaLoveColors.neutralDark} />
              <Text style={styles.emptyTitle}>Nenhum evento encontrado</Text>
              <Text style={styles.emptyText}>
                {filter === 'all' 
                  ? 'Você ainda não criou nenhum evento'
                  : `Nenhum evento ${filter === 'active' ? 'ativo' : 'pendente'} no momento`
                }
              </Text>
              <TouchableOpacity
                style={styles.createNewButton}
                onPress={() => router.push('/(tabs)/create-event' as any)}
              >
                <LinearGradient
                  colors={['#27AE60', '#229954']}
                  style={styles.createNewGradient}
                >
                  <Ionicons name="add-circle" size={20} color="#FFF" />
                  <Text style={styles.createNewText}>Criar Novo Evento</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Modal de Estatísticas */}
      <Modal
        visible={showStatsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowStatsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.statsModal}>
            <LinearGradient
              colors={[BotaLoveColors.primary, BotaLoveColors.primaryDark]}
              style={styles.statsModalHeader}
            >
              <Text style={styles.statsModalTitle}>📊 Estatísticas</Text>
              <Text style={styles.statsModalSubtitle}>{selectedEvent?.title}</Text>
              <TouchableOpacity 
                style={styles.closeModalButton}
                onPress={() => setShowStatsModal(false)}
              >
                <Ionicons name="close" size={24} color="#FFF" />
              </TouchableOpacity>
            </LinearGradient>

            <ScrollView style={styles.statsModalContent}>
              {/* Métricas principais */}
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Ionicons name="eye" size={28} color="#3498DB" />
                  <Text style={styles.statValue}>{selectedEvent?.views || 0}</Text>
                  <Text style={styles.statLabel}>Visualizações</Text>
                </View>
                <View style={styles.statCard}>
                  <Ionicons name="heart" size={28} color="#E74C3C" />
                  <Text style={styles.statValue}>{selectedEvent?.interested || 0}</Text>
                  <Text style={styles.statLabel}>Interessados</Text>
                </View>
                <View style={styles.statCard}>
                  <Ionicons name="people" size={28} color="#27AE60" />
                  <Text style={styles.statValue}>{selectedEvent?.capacity || 0}</Text>
                  <Text style={styles.statLabel}>Capacidade</Text>
                </View>
                <View style={styles.statCard}>
                  <Ionicons name="time" size={28} color="BotaLoveColors.primary" />
                  <Text style={styles.statValue}>{selectedEvent?.durationDays || 0}d</Text>
                  <Text style={styles.statLabel}>Duração</Text>
                </View>
              </View>

              {/* Informações do evento */}
              <View style={styles.statsSection}>
                <Text style={styles.statsSectionTitle}>Informações do Evento</Text>
                <View style={styles.statsInfoRow}>
                  <Text style={styles.statsInfoLabel}>Status:</Text>
                  <Text style={[
                    styles.statsInfoValue,
                    { color: selectedEvent?.status === 'active' ? '#27AE60' : BotaLoveColors.primary }
                  ]}>
                    {selectedEvent?.status === 'active' ? 'Ativo' : 'Pendente'}
                  </Text>
                </View>
                <View style={styles.statsInfoRow}>
                  <Text style={styles.statsInfoLabel}>Data:</Text>
                  <Text style={styles.statsInfoValue}>{formatDate(selectedEvent?.eventDate)}</Text>
                </View>
                <View style={styles.statsInfoRow}>
                  <Text style={styles.statsInfoLabel}>Local:</Text>
                  <Text style={styles.statsInfoValue}>{selectedEvent?.city}/{selectedEvent?.state}</Text>
                </View>
                <View style={styles.statsInfoRow}>
                  <Text style={styles.statsInfoLabel}>Destaque:</Text>
                  <Text style={styles.statsInfoValue}>
                    {selectedEvent?.isHighlighted ? `Sim (${selectedEvent.highlightDays} dias)` : 'Não'}
                  </Text>
                </View>
              </View>

              {/* Histórico de pagamentos */}
              <View style={styles.statsSection}>
                <Text style={styles.statsSectionTitle}>Histórico de Pagamentos</Text>
                {eventPayments.length === 0 ? (
                  <Text style={styles.noPaymentsText}>Nenhum pagamento registrado</Text>
                ) : (
                  eventPayments.map((payment, index) => (
                    <View key={index} style={styles.paymentItem}>
                      <View style={styles.paymentInfo}>
                        <Ionicons name="checkmark-circle" size={20} color="#27AE60" />
                        <View>
                          <Text style={styles.paymentAmount}>
                            R$ {payment.totalAmount?.toFixed(2).replace('.', ',')}
                          </Text>
                          <Text style={styles.paymentDate}>
                            {formatDate(payment.createdAt)}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.paymentBadge}>
                        <Text style={styles.paymentBadgeText}>{payment.status}</Text>
                      </View>
                    </View>
                  ))
                )}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal de Renovação */}
      <Modal
        visible={showRenewModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowRenewModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.renewModal}>
            <LinearGradient
              colors={['#27AE60', '#229954']}
              style={styles.renewModalHeader}
            >
              <Text style={styles.renewModalTitle}>🔄 Renovar Evento</Text>
              <Text style={styles.renewModalSubtitle}>{selectedEvent?.title}</Text>
              <TouchableOpacity 
                style={styles.closeModalButton}
                onPress={() => setShowRenewModal(false)}
              >
                <Ionicons name="close" size={24} color="#FFF" />
              </TouchableOpacity>
            </LinearGradient>

            <ScrollView style={styles.renewModalContent}>
              {/* Duração */}
              <View style={styles.renewSection}>
                <Text style={styles.renewSectionTitle}>⏰ Duração da Publicação</Text>
                <View style={styles.optionsGrid}>
                  {[15, 30, 60, 90].map((days) => (
                    <TouchableOpacity
                      key={days}
                      style={[
                        styles.optionCard,
                        renewDuration === days && styles.optionCardSelected,
                      ]}
                      onPress={() => setRenewDuration(days)}
                    >
                      <Text style={[
                        styles.optionDays,
                        renewDuration === days && styles.optionDaysSelected,
                      ]}>
                        {days} dias
                      </Text>
                      <Text style={[
                        styles.optionPrice,
                        renewDuration === days && styles.optionPriceSelected,
                      ]}>
                        R$ {days === 15 ? '49,90' : days === 30 ? '89,90' : days === 60 ? '159,90' : '219,90'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Destaque */}
              <View style={styles.renewSection}>
                <View style={styles.renewSectionHeader}>
                  <Text style={styles.renewSectionTitle}>⭐ Destacar Evento</Text>
                  <TouchableOpacity
                    style={[styles.toggleSwitch, renewHighlight && styles.toggleSwitchActive]}
                    onPress={() => setRenewHighlight(!renewHighlight)}
                  >
                    <View style={[styles.toggleThumb, renewHighlight && styles.toggleThumbActive]} />
                  </TouchableOpacity>
                </View>
                
                {renewHighlight && (
                  <View style={styles.optionsGrid}>
                    {[15, 30, 60, 90].map((days) => (
                      <TouchableOpacity
                        key={days}
                        style={[
                          styles.optionCard,
                          styles.optionCardHighlight,
                          renewHighlightDays === days && styles.optionCardHighlightSelected,
                        ]}
                        onPress={() => setRenewHighlightDays(days)}
                      >
                        <Text style={[
                          styles.optionDays,
                          renewHighlightDays === days && styles.optionDaysSelected,
                        ]}>
                          {days} dias
                        </Text>
                        <Text style={[
                          styles.optionPrice,
                          renewHighlightDays === days && styles.optionPriceSelected,
                        ]}>
                          R$ {days === 15 ? '29,90' : days === 30 ? '49,90' : days === 60 ? '79,90' : '99,90'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Resumo */}
              <View style={styles.renewSummary}>
                <Text style={styles.renewSummaryTitle}>Resumo da Renovação</Text>
                <View style={styles.renewSummaryRow}>
                  <Text style={styles.renewSummaryLabel}>Duração ({renewDuration} dias):</Text>
                  <Text style={styles.renewSummaryValue}>R$ {getRenewalPrice().durationPrice.toFixed(2).replace('.', ',')}</Text>
                </View>
                {renewHighlight && (
                  <View style={styles.renewSummaryRow}>
                    <Text style={styles.renewSummaryLabel}>Destaque ({renewHighlightDays} dias):</Text>
                    <Text style={styles.renewSummaryValue}>R$ {getRenewalPrice().highlightPrice.toFixed(2).replace('.', ',')}</Text>
                  </View>
                )}
                <View style={[styles.renewSummaryRow, styles.renewSummaryTotal]}>
                  <Text style={styles.renewSummaryTotalLabel}>Total:</Text>
                  <Text style={styles.renewSummaryTotalValue}>R$ {getRenewalPrice().total.toFixed(2).replace('.', ',')}</Text>
                </View>
              </View>

              {/* Botões */}
              <View style={styles.renewActions}>
                <TouchableOpacity
                  style={styles.renewCancelButton}
                  onPress={() => setShowRenewModal(false)}
                  disabled={isProcessingRenew}
                >
                  <Text style={styles.renewCancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.renewConfirmButton, isProcessingRenew && styles.renewConfirmButtonDisabled]}
                  onPress={processRenewal}
                  disabled={isProcessingRenew}
                >
                  <LinearGradient
                    colors={isProcessingRenew ? ['#95A5A6', '#7F8C8D'] : ['#27AE60', '#229954']}
                    style={styles.renewConfirmGradient}
                  >
                    {isProcessingRenew ? (
                      <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                      <>
                        <Ionicons name="checkmark-circle" size={20} color="#FFF" />
                        <Text style={styles.renewConfirmButtonText}>Confirmar Renovação</Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal de Pagamento */}
      <Modal
        visible={showPaymentModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPaymentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.renewModal}>
            <LinearGradient
              colors={['#27AE60', '#229954']}
              style={styles.renewModalHeader}
            >
              <Text style={styles.renewModalTitle}>💳 Confirmar Pagamento</Text>
              <Text style={styles.renewModalSubtitle}>{selectedEvent?.title}</Text>
              <TouchableOpacity 
                style={styles.closeModalButton}
                onPress={() => setShowPaymentModal(false)}
              >
                <Ionicons name="close" size={24} color="#FFF" />
              </TouchableOpacity>
            </LinearGradient>

            <ScrollView style={styles.renewModalContent}>
              {/* Resumo do Evento */}
              <View style={styles.renewSection}>
                <Text style={styles.renewSectionTitle}>📋 Resumo do Evento</Text>
                <View style={styles.statsInfoRow}>
                  <Text style={styles.statsInfoLabel}>Duração:</Text>
                  <Text style={styles.statsInfoValue}>{selectedEvent?.durationDays} dias</Text>
                </View>
                {selectedEvent?.isHighlighted && (
                  <View style={styles.statsInfoRow}>
                    <Text style={styles.statsInfoLabel}>Destaque:</Text>
                    <Text style={styles.statsInfoValue}>{selectedEvent?.highlightDays} dias</Text>
                  </View>
                )}
              </View>

              {/* Resumo do Pagamento */}
              <View style={styles.renewSummary}>
                <Text style={styles.renewSummaryTitle}>Resumo do Pagamento</Text>
                <View style={styles.renewSummaryRow}>
                  <Text style={styles.renewSummaryLabel}>Duração ({selectedEvent?.durationDays} dias):</Text>
                  <Text style={styles.renewSummaryValue}>
                    R$ {(() => {
                      const prices: { [key: number]: number } = { 15: 49.90, 30: 89.90, 60: 159.90, 90: 219.90 };
                      return (prices[selectedEvent?.durationDays || 30] || 89.90).toFixed(2).replace('.', ',');
                    })()}
                  </Text>
                </View>
                {selectedEvent?.isHighlighted && selectedEvent?.highlightDays && (
                  <View style={styles.renewSummaryRow}>
                    <Text style={styles.renewSummaryLabel}>Destaque ({selectedEvent.highlightDays} dias):</Text>
                    <Text style={styles.renewSummaryValue}>
                      R$ {(() => {
                        const prices: { [key: number]: number } = { 15: 29.90, 30: 49.90, 60: 79.90, 90: 99.90 };
                        return (prices[selectedEvent.highlightDays] || 29.90).toFixed(2).replace('.', ',');
                      })()}
                    </Text>
                  </View>
                )}
                <View style={[styles.renewSummaryRow, styles.renewSummaryTotal]}>
                  <Text style={styles.renewSummaryTotalLabel}>Total:</Text>
                  <Text style={styles.renewSummaryTotalValue}>
                    R$ {(() => {
                      const durationPrices: { [key: number]: number } = { 15: 49.90, 30: 89.90, 60: 159.90, 90: 219.90 };
                      const highlightPrices: { [key: number]: number } = { 15: 29.90, 30: 49.90, 60: 79.90, 90: 99.90 };
                      const duration = durationPrices[selectedEvent?.durationDays || 30] || 89.90;
                      const highlight = selectedEvent?.isHighlighted && selectedEvent?.highlightDays 
                        ? highlightPrices[selectedEvent.highlightDays] || 0 
                        : 0;
                      return (duration + highlight).toFixed(2).replace('.', ',');
                    })()}
                  </Text>
                </View>
              </View>

              {/* Botões */}
              <View style={styles.renewActions}>
                <TouchableOpacity
                  style={styles.renewCancelButton}
                  onPress={() => setShowPaymentModal(false)}
                  disabled={isProcessingPayment}
                >
                  <Text style={styles.renewCancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.renewConfirmButton, isProcessingPayment && styles.renewConfirmButtonDisabled]}
                  onPress={processPayment}
                  disabled={isProcessingPayment}
                >
                  <LinearGradient
                    colors={isProcessingPayment ? ['#95A5A6', '#7F8C8D'] : ['#27AE60', '#229954']}
                    style={styles.renewConfirmGradient}
                  >
                    {isProcessingPayment ? (
                      <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                      <>
                        <Ionicons name="card" size={20} color="#FFF" />
                        <Text style={styles.renewConfirmButtonText}>Confirmar Pagamento</Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal de Destaque */}
      <Modal
        visible={showHighlightModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowHighlightModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.renewModal}>
            <LinearGradient
              colors={[BotaLoveColors.primary, BotaLoveColors.primaryDark]}
              style={styles.renewModalHeader}
            >
              <Text style={styles.renewModalTitle}>⭐ Destacar Evento</Text>
              <Text style={styles.renewModalSubtitle}>{selectedEvent?.title}</Text>
              <TouchableOpacity 
                style={styles.closeModalButton}
                onPress={() => setShowHighlightModal(false)}
              >
                <Ionicons name="close" size={24} color="#FFF" />
              </TouchableOpacity>
            </LinearGradient>

            <ScrollView style={styles.renewModalContent}>
              {/* Duração do Destaque */}
              <View style={styles.renewSection}>
                <Text style={styles.renewSectionTitle}>⏰ Duração do Destaque</Text>
                <View style={styles.optionsGrid}>
                  {[15, 30, 60, 90].map((days) => (
                    <TouchableOpacity
                      key={days}
                      style={[
                        styles.optionCard,
                        styles.optionCardHighlight,
                        highlightDays === days && styles.optionCardHighlightSelected,
                      ]}
                      onPress={() => setHighlightDays(days)}
                    >
                      <Text style={[
                        styles.optionDays,
                        highlightDays === days && styles.optionDaysSelected,
                      ]}>
                        {days} dias
                      </Text>
                      <Text style={[
                        styles.optionPrice,
                        highlightDays === days && styles.optionPriceSelected,
                      ]}>
                        R$ {days === 15 ? '29,90' : days === 30 ? '49,90' : days === 60 ? '79,90' : '99,90'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Resumo */}
              <View style={styles.renewSummary}>
                <Text style={styles.renewSummaryTitle}>Resumo do Destaque</Text>
                <View style={styles.renewSummaryRow}>
                  <Text style={styles.renewSummaryLabel}>Destaque ({highlightDays} dias):</Text>
                  <Text style={styles.renewSummaryValue}>
                    R$ {(() => {
                      const prices: { [key: number]: number } = { 15: 29.90, 30: 49.90, 60: 79.90, 90: 99.90 };
                      return (prices[highlightDays] || 29.90).toFixed(2).replace('.', ',');
                    })()}
                  </Text>
                </View>
                <View style={[styles.renewSummaryRow, styles.renewSummaryTotal]}>
                  <Text style={styles.renewSummaryTotalLabel}>Total:</Text>
                  <Text style={styles.renewSummaryTotalValue}>
                    R$ {(() => {
                      const prices: { [key: number]: number } = { 15: 29.90, 30: 49.90, 60: 79.90, 90: 99.90 };
                      return (prices[highlightDays] || 29.90).toFixed(2).replace('.', ',');
                    })()}
                  </Text>
                </View>
              </View>

              {/* Benefícios do Destaque */}
              <View style={styles.renewSection}>
                <Text style={styles.renewSectionTitle}>✨ Benefícios do Destaque</Text>
                <View style={styles.benefitItem}>
                  <Ionicons name="star" size={20} color="BotaLoveColors.primary" />
                  <Text style={styles.benefitText}>Aparece no topo da lista</Text>
                </View>
                <View style={styles.benefitItem}>
                  <Ionicons name="eye" size={20} color="#3498DB" />
                  <Text style={styles.benefitText}>Maior visibilidade</Text>
                </View>
                <View style={styles.benefitItem}>
                  <Ionicons name="trending-up" size={20} color="#27AE60" />
                  <Text style={styles.benefitText}>Mais interessados</Text>
                </View>
              </View>

              {/* Botões */}
              <View style={styles.renewActions}>
                <TouchableOpacity
                  style={styles.renewCancelButton}
                  onPress={() => setShowHighlightModal(false)}
                  disabled={isProcessingPayment}
                >
                  <Text style={styles.renewCancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.renewConfirmButton, isProcessingPayment && styles.renewConfirmButtonDisabled]}
                  onPress={processHighlight}
                  disabled={isProcessingPayment}
                >
                  <LinearGradient
                    colors={isProcessingPayment ? ['#95A5A6', '#7F8C8D'] : [BotaLoveColors.primary, BotaLoveColors.primaryDark]}
                    style={styles.renewConfirmGradient}
                  >
                    {isProcessingPayment ? (
                      <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                      <>
                        <Ionicons name="star" size={20} color="#FFF" />
                        <Text style={styles.renewConfirmButtonText}>Confirmar Destaque</Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    paddingBottom: isSmallDevice ? 20 : 28,
    paddingHorizontal: CARD_PADDING,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: isSmallDevice ? 26 : 30,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: isSmallDevice ? 14 : 15,
    color: '#FFF',
    opacity: 0.92,
    fontWeight: '500',
  },
  filterScrollView: {
    marginTop: isSmallDevice ? 10 : 14,
    marginBottom: isSmallDevice ? 10 : 14,
    height: isSmallDevice ? 54 : 58,
  },
  filterScrollContent: {
    paddingLeft: isSmallDevice ? 12 : 16,
    paddingRight: isSmallDevice ? 12 : 16,
    gap: isSmallDevice ? 8 : 10,
    alignItems: 'center',
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: isSmallDevice ? 44 : 48,
    paddingHorizontal: isSmallDevice ? 14 : 16,
    borderRadius: 24,
    backgroundColor: '#F5F5F5',
    gap: 6,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  filterTabActive: {
    backgroundColor: BotaLoveColors.primary,
    borderColor: BotaLoveColors.primary,
    ...Platform.select({
      ios: {
        shadowColor: BotaLoveColors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  filterTabHighlighted: {
    backgroundColor: BotaLoveColors.primary,
    borderColor: BotaLoveColors.primary,
    ...Platform.select({
      ios: {
        shadowColor: BotaLoveColors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  filterText: {
    fontSize: isSmallDevice ? 13 : 14,
    fontWeight: '600',
    color: BotaLoveColors.neutralDark,
  },
  filterTextActive: {
    color: '#FFF',
    fontWeight: '700',
  },
  filterTextHighlighted: {
    color: '#FFF',
    fontWeight: '700',
  },
  filterBadge: {
    backgroundColor: '#E0E0E0',
    borderRadius: 12,
    minWidth: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  filterBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  filterBadgeHighlighted: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  filterBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: BotaLoveColors.neutralDark,
  },
  filterBadgeTextActive: {
    color: '#FFF',
  },
  eventsContainer: {
    padding: isSmallDevice ? 12 : 16,
  },
  eventCard: {
    backgroundColor: BotaLoveColors.backgroundWhite,
    borderRadius: isSmallDevice ? 18 : 22,
    marginBottom: isSmallDevice ? 16 : 20,
    overflow: 'hidden',
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  eventCardHighlighted: {
    borderWidth: 3,
    borderColor: BotaLoveColors.primary,
    ...Platform.select({
      ios: {
        shadowColor: BotaLoveColors.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 14,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  highlightBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
    borderRadius: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: BotaLoveColors.primary,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.4,
        shadowRadius: 6,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  highlightBadgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  highlightBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  eventImage: {
    width: '100%',
    height: isSmallDevice ? 130 : 150,
  },
  eventContent: {
    padding: isSmallDevice ? 16 : 20,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: isSmallDevice ? 14 : 16,
  },
  eventTitle: {
    fontSize: isSmallDevice ? 17 : 19,
    fontWeight: '700',
    color: BotaLoveColors.secondary,
    flex: 1,
    marginRight: isSmallDevice ? 10 : 12,
    letterSpacing: -0.2,
  },
  statusBadgeActive: {
    backgroundColor: '#E8F8F0',
    paddingHorizontal: isSmallDevice ? 10 : 12,
    paddingVertical: isSmallDevice ? 5 : 6,
    borderRadius: isSmallDevice ? 12 : 14,
    borderWidth: 1.5,
    borderColor: '#27AE60',
  },
  statusBadgeTextActive: {
    fontSize: isSmallDevice ? 11 : 12,
    fontWeight: '700',
    color: '#27AE60',
  },
  statusBadgeWarning: {
    backgroundColor: '#FFF9E6',
    borderColor: BotaLoveColors.primary,
  },
  statusBadgeTextWarning: {
    color: BotaLoveColors.primary,
  },
  statusBadgeExpired: {
    backgroundColor: '#FFEBEE',
    paddingHorizontal: isSmallDevice ? 10 : 12,
    paddingVertical: isSmallDevice ? 5 : 6,
    borderRadius: isSmallDevice ? 12 : 14,
    borderWidth: 1.5,
    borderColor: '#E74C3C',
  },
  statusBadgeTextExpired: {
    fontSize: isSmallDevice ? 11 : 12,
    fontWeight: '700',
    color: '#E74C3C',
  },
  statusBadgeInactive: {
    backgroundColor: '#FFF9E6',
    paddingHorizontal: isSmallDevice ? 10 : 12,
    paddingVertical: isSmallDevice ? 5 : 6,
    borderRadius: isSmallDevice ? 12 : 14,
    borderWidth: 1.5,
    borderColor: '#D4AD63',
  },
  statusBadgeTextInactive: {
    fontSize: isSmallDevice ? 10 : 11,
    fontWeight: '700',
    color: BotaLoveColors.primaryDark,
  },
  eventDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: isSmallDevice ? 8 : 10,
    marginBottom: isSmallDevice ? 8 : 10,
  },
  eventDetailText: {
    fontSize: isSmallDevice ? 13 : 14,
    color: BotaLoveColors.neutralDark,
    fontWeight: '500',
  },
  progressContainer: {
    marginTop: isSmallDevice ? 14 : 16,
    marginBottom: isSmallDevice ? 16 : 20,
  },
  progressBar: {
    height: isSmallDevice ? 8 : 10,
    backgroundColor: '#E8E8E8',
    borderRadius: isSmallDevice ? 4 : 5,
    overflow: 'hidden',
    marginBottom: isSmallDevice ? 6 : 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#27AE60',
    borderRadius: isSmallDevice ? 4 : 5,
  },
  progressText: {
    fontSize: isSmallDevice ? 12 : 13,
    color: BotaLoveColors.neutralDark,
    textAlign: 'right',
    fontWeight: '600',
  },
  eventActions: {
    flexDirection: 'row',
    gap: isSmallDevice ? 10 : 14,
    paddingTop: isSmallDevice ? 14 : 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: isSmallDevice ? 12 : 14,
    backgroundColor: '#F7F7F7',
    borderRadius: isSmallDevice ? 10 : 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 3,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: isSmallDevice ? 50 : 70,
    paddingHorizontal: isSmallDevice ? 32 : 44,
  },
  emptyTitle: {
    fontSize: isSmallDevice ? 19 : 22,
    fontWeight: '800',
    color: BotaLoveColors.secondary,
    marginTop: isSmallDevice ? 16 : 20,
    marginBottom: isSmallDevice ? 8 : 10,
    letterSpacing: -0.3,
  },
  emptyText: {
    fontSize: isSmallDevice ? 14 : 16,
    color: BotaLoveColors.neutralDark,
    textAlign: 'center',
    lineHeight: isSmallDevice ? 21 : 24,
    marginBottom: isSmallDevice ? 24 : 28,
  },
  createNewButton: {
    borderRadius: isSmallDevice ? 14 : 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#27AE60',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  createNewGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: isSmallDevice ? 8 : 10,
    paddingHorizontal: isSmallDevice ? 22 : 28,
    paddingVertical: isSmallDevice ? 14 : 16,
  },
  createNewText: {
    fontSize: isSmallDevice ? 15 : 17,
    fontWeight: '700',
    color: '#FFF',
  },
  bottomSpacer: {
    height: isSmallDevice ? 35 : 50,
  },
  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: BotaLoveColors.neutralDark,
    fontWeight: '500',
  },
  // Métricas
  metricsRow: {
    flexDirection: 'row',
    marginTop: 12,
    marginBottom: 12,
    gap: 12,
  },
  metricItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F7F7F7',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '700',
    color: BotaLoveColors.secondary,
  },
  metricLabel: {
    fontSize: 11,
    color: BotaLoveColors.neutralDark,
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  actionButtonRenew: {
    flexDirection: 'row',
    gap: 6,
    backgroundColor: '#E8F8F0',
  },
  actionButtonRenewText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#27AE60',
  },
  actionButtonPayment: {
    flexDirection: 'row',
    gap: 6,
    backgroundColor: '#E8F8F0',
    flex: 1.5,
  },
  actionButtonPaymentText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#27AE60',
  },
  actionButtonHighlight: {
    backgroundColor: '#FFF4E5',
  },
  expiredAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 10,
    gap: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E74C3C',
  },
  expiredAlertText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#E74C3C',
  },
  renewNowButton: {
    backgroundColor: '#27AE60',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  renewNowButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFF',
  },
  // Modal de Estatísticas
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  statsModal: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
  },
  statsModalHeader: {
    paddingTop: 24,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  statsModalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 4,
  },
  statsModalSubtitle: {
    fontSize: 14,
    color: '#FFF',
    opacity: 0.9,
    textAlign: 'center',
  },
  closeModalButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsModalContent: {
    padding: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    width: '47%',
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: BotaLoveColors.secondary,
  },
  statLabel: {
    fontSize: 12,
    color: BotaLoveColors.neutralDark,
    fontWeight: '500',
  },
  statsSection: {
    marginBottom: 20,
  },
  statsSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: BotaLoveColors.secondary,
    marginBottom: 12,
  },
  statsInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  statsInfoLabel: {
    fontSize: 14,
    color: BotaLoveColors.neutralDark,
  },
  statsInfoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: BotaLoveColors.secondary,
  },
  noPaymentsText: {
    fontSize: 14,
    color: BotaLoveColors.neutralDark,
    textAlign: 'center',
    paddingVertical: 20,
  },
  paymentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  paymentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  paymentAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: BotaLoveColors.secondary,
  },
  paymentDate: {
    fontSize: 12,
    color: BotaLoveColors.neutralDark,
  },
  paymentBadge: {
    backgroundColor: '#27AE60',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  paymentBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFF',
    textTransform: 'uppercase',
  },
  // Modal de Renovação
  renewModal: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  renewModalHeader: {
    paddingTop: 24,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  renewModalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 4,
  },
  renewModalSubtitle: {
    fontSize: 14,
    color: '#FFF',
    opacity: 0.9,
    textAlign: 'center',
  },
  renewModalContent: {
    padding: 20,
  },
  renewSection: {
    marginBottom: 24,
  },
  renewSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  renewSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: BotaLoveColors.secondary,
    marginBottom: 12,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  optionCard: {
    width: '48%',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionCardSelected: {
    backgroundColor: '#E8F8F0',
    borderColor: '#27AE60',
  },
  optionCardHighlight: {
    backgroundColor: '#FFF9E6',
  },
  optionCardHighlightSelected: {
    backgroundColor: '#FFF4E5',
    borderColor: BotaLoveColors.primary,
  },
  optionDays: {
    fontSize: 16,
    fontWeight: '700',
    color: BotaLoveColors.secondary,
    marginBottom: 4,
  },
  optionDaysSelected: {
    color: '#27AE60',
  },
  optionPrice: {
    fontSize: 14,
    color: BotaLoveColors.neutralDark,
    fontWeight: '500',
  },
  optionPriceSelected: {
    color: '#27AE60',
    fontWeight: '700',
  },
  toggleSwitch: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E0E0E0',
    padding: 2,
    justifyContent: 'center',
  },
  toggleSwitchActive: {
    backgroundColor: '#27AE60',
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFF',
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
  renewSummary: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  renewSummaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: BotaLoveColors.secondary,
    marginBottom: 12,
  },
  renewSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  renewSummaryLabel: {
    fontSize: 14,
    color: BotaLoveColors.neutralDark,
  },
  renewSummaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: BotaLoveColors.secondary,
  },
  renewSummaryTotal: {
    borderTopWidth: 2,
    borderTopColor: '#E0E0E0',
    marginTop: 8,
    paddingTop: 12,
  },
  renewSummaryTotalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: BotaLoveColors.secondary,
  },
  renewSummaryTotalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#27AE60',
  },
  renewActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  renewCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
  },
  renewCancelButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: BotaLoveColors.neutralDark,
  },
  renewConfirmButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  renewConfirmButtonDisabled: {
    opacity: 0.6,
  },
  renewConfirmGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  renewConfirmButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
  },
  // Benefícios do Destaque
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    marginBottom: 8,
  },
  benefitText: {
    fontSize: 14,
    color: BotaLoveColors.secondary,
    fontWeight: '500',
    flex: 1,
  },
});
