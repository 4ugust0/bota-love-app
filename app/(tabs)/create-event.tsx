import { BotaLoveColors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { createEvent, EventType, getEventById, simulateEventPayment, updateEvent } from '@/firebase/eventService';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isSmallDevice = SCREEN_WIDTH < 375;
const isMediumDevice = SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 414;
const CARD_PADDING = isSmallDevice ? 14 : 18;

// Tipos de eventos
const EVENT_TYPES = [
  { id: 'show', label: 'Show', icon: '🎤' },
  { id: 'feira', label: 'Feira Agropecuária', icon: '🏪' },
  { id: 'rodeio', label: 'Rodeio', icon: '🤠' },
  { id: 'leilao', label: 'Leilão', icon: '🔨' },
  { id: 'circuito', label: 'Circuito', icon: '🏆' },
  { id: 'festa', label: 'Festa Regional', icon: '🎉' },
  { id: 'congresso', label: 'Congresso Agro', icon: '👥' },
];

// Duração do evento
const EVENT_DURATIONS = [
  { id: 15, label: '15 dias', price: 549.00, description: 'Exposição por 15 dias' },
  { id: 30, label: '30 dias', price: 1059.00, description: 'Exposição por 30 dias', popular: true },
  { id: 60, label: '60 dias', price: 1879.00, description: 'Exposição por 60 dias' },
  { id: 90, label: '90 dias', price: 3199.00, description: 'Exposição por 90 dias' },
];

// Duração do destaque (opcional)
const HIGHLIGHT_DURATIONS = [
  { id: 15, label: '15 dias', price: 149.00 },
  { id: 30, label: '30 dias', price: 249.00, popular: true },
  { id: 60, label: '60 dias', price: 399.00 },
  { id: 90, label: '90 dias', price: 529.00 },
];

export default function CreateEventScreen() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const params = useLocalSearchParams<{ editId?: string }>();
  
  // Modo de edição
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [isLoadingEvent, setIsLoadingEvent] = useState(false);
  
  // Estados do formulário - Informações básicas
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventType, setEventType] = useState('');
  const [externalLink, setExternalLink] = useState('');
  const [capacity, setCapacity] = useState('');
  const [ticketPrice, setTicketPrice] = useState('');
  
  // Data e horário
  const [eventDate, setEventDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  // Localização
  const [venueName, setVenueName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  
  // Duração e destaque
  const [selectedDuration, setSelectedDuration] = useState(30); // 30 dias por padrão
  const [isHighlightEnabled, setIsHighlightEnabled] = useState(false);
  const [selectedHighlight, setSelectedHighlight] = useState(30);

  // Estados de loading e modal de pagamento
  const [isLoading, setIsLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingEventId, setPendingEventId] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Cálculo de valores
  const getEventDurationPrice = () => {
    return EVENT_DURATIONS.find(d => d.id === selectedDuration)?.price || 0;
  };

  const getHighlightPrice = () => {
    if (!isHighlightEnabled) return 0;
    return HIGHLIGHT_DURATIONS.find(h => h.id === selectedHighlight)?.price || 0;
  };

  const getTotalPrice = () => {
    return getEventDurationPrice() + getHighlightPrice();
  };

  // Carregar dados do evento quando em modo de edição
  useEffect(() => {
    const loadEventData = async () => {
      if (params.editId && currentUser) {
        setIsLoadingEvent(true);
        try {
          const eventData = await getEventById(params.editId);
          if (eventData) {
            setIsEditMode(true);
            setEditingEventId(params.editId);
            
            // Preencher formulário com dados do evento
            setTitle(eventData.title);
            setDescription(eventData.description);
            setEventType(eventData.eventType);
            setExternalLink(eventData.externalLink || '');
            setCapacity(eventData.capacity?.toString() || '');
            setTicketPrice(eventData.ticketPrice?.toString() || '');
            
            // Data e horário
            if (eventData.eventDate instanceof Date) {
              setEventDate(eventData.eventDate);
            } else if (eventData.eventDate?.toDate) {
              setEventDate(eventData.eventDate.toDate());
            }
            
            // Localização
            setVenueName(eventData.venueName);
            setAddress(eventData.address || '');
            setCity(eventData.city);
            setState(eventData.state);
            setZipCode(eventData.zipCode || '');
            
            // Plano e destaque (não editáveis, mas mantidos para exibição)
            setSelectedDuration(eventData.durationDays || 30);
            setIsHighlightEnabled(eventData.isHighlighted || false);
            if (eventData.highlightDays) {
              setSelectedHighlight(eventData.highlightDays);
            }
          }
        } catch (error) {
          console.error('Erro ao carregar evento:', error);
          Alert.alert('Erro', 'Não foi possível carregar os dados do evento');
        } finally {
          setIsLoadingEvent(false);
        }
      }
    };

    loadEventData();
  }, [params.editId, currentUser]);

  // Limpar formulário
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setEventType('');
    setExternalLink('');
    setCapacity('');
    setTicketPrice('');
    setEventDate(new Date());
    setTime(new Date());
    setVenueName('');
    setAddress('');
    setCity('');
    setState('');
    setZipCode('');
    setSelectedDuration(30);
    setIsHighlightEnabled(false);
    setSelectedHighlight(30);
    setPendingEventId(null);
  };

  // Processar pagamento simulado
  const handlePayment = async () => {
    if (!pendingEventId) return;

    setIsProcessingPayment(true);
    
    try {
      const result = await simulateEventPayment(
        pendingEventId,
        currentUser?.id || '',
        getEventDurationPrice(),
        getHighlightPrice(),
        selectedDuration,
        isHighlightEnabled ? selectedHighlight : undefined
      );

      if (result.success) {
        setShowPaymentModal(false);
        Alert.alert(
          'Pagamento Confirmado! 🎉',
          `Seu evento "${title}" foi publicado com sucesso!\n\nID do pagamento: ${result.paymentId}`,
          [
            {
              text: 'Ver Meus Eventos',
              onPress: () => {
                resetForm();
                router.push('/(tabs)/event-history' as any);
              },
            },
          ]
        );
      } else {
        Alert.alert('Erro', result.error || 'Não foi possível processar o pagamento');
      }
    } catch (error) {
      console.error('Erro no pagamento:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao processar o pagamento');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleCreateEvent = async () => {
    // Validação básica
    if (!title || !description || !eventType || !venueName || !city || !state) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios (*)');
      return;
    }

    if (!currentUser) {
      Alert.alert('Erro', 'Você precisa estar logado para criar um evento');
      return;
    }

    setIsLoading(true);

    try {
      // Formatar hora
      const hours = time.getHours().toString().padStart(2, '0');
      const minutes = time.getMinutes().toString().padStart(2, '0');
      const eventTime = `${hours}:${minutes}`;

      // Modo de edição - atualizar evento
      if (isEditMode && editingEventId) {
        const result = await updateEvent(
          editingEventId,
          currentUser.id,
          {
            title,
            description,
            eventType: eventType as EventType,
            externalLink: externalLink || undefined,
            eventDate,
            eventTime,
            venueName,
            address,
            city,
            state,
            zipCode: zipCode || undefined,
            capacity: parseInt(capacity) || 100,
            ticketPrice: ticketPrice ? parseFloat(ticketPrice.replace(',', '.')) : undefined,
          }
        );

        if (result.success) {
          Alert.alert(
            'Evento Atualizado! 🎉',
            'As alterações foram salvas com sucesso.',
            [
              {
                text: 'OK',
                onPress: () => {
                  resetForm();
                  router.push('/(tabs)/event-history' as any);
                },
              },
            ]
          );
        } else {
          Alert.alert('Erro', result.error || 'Não foi possível atualizar o evento');
        }
        setIsLoading(false);
        return;
      }

      // Modo de criação - criar evento no Firestore
      const result = await createEvent({
        producerId: currentUser.id,
        producerName: currentUser.profile.name,
        title,
        description,
        eventType: eventType as EventType,
        externalLink: externalLink || undefined,
        eventDate,
        eventTime,
        venueName,
        address,
        city,
        state,
        zipCode: zipCode || undefined,
        capacity: parseInt(capacity) || 100,
        ticketPrice: ticketPrice ? parseFloat(ticketPrice.replace(',', '.')) : undefined,
        durationDays: selectedDuration,
        highlightDays: isHighlightEnabled ? selectedHighlight : undefined,
        isHighlighted: isHighlightEnabled,
      });

      if (result.success && result.eventId) {
        setPendingEventId(result.eventId);
        setShowPaymentModal(true);
      } else {
        Alert.alert('Erro', result.error || 'Não foi possível criar o evento');
      }
    } catch (error) {
      console.error('Erro ao criar evento:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao criar o evento');
    } finally {
      setIsLoading(false);
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setEventDate(selectedDate);
    }
  };

  const onTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      setTime(selectedTime);
    }
  };

  return (
    <View style={styles.container}>
      {/* Loading de carregamento do evento */}
      {isLoadingEvent && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={BotaLoveColors.primary} />
          <Text style={styles.loadingText}>Carregando evento...</Text>
        </View>
      )}
      
      {/* Header */}
      <LinearGradient
        colors={[BotaLoveColors.primary, BotaLoveColors.primaryDark]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>{isEditMode ? '✏️ Editar Evento' : '📅 Cadastrar Evento'}</Text>
        <Text style={styles.headerSubtitle}>{isEditMode ? 'Atualize as informações do seu evento' : 'Divulgue seu evento no Bota Love'}</Text>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          {/* Informações Básicas */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="information-circle" size={24} color={BotaLoveColors.primary} />
              <Text style={styles.sectionTitle}>Informações Básicas</Text>
            </View>

            {/* Tipo de Evento */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tipo de Evento *</Text>
              <View style={styles.eventTypesGrid}>
                {EVENT_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type.id}
                    style={[
                      styles.eventTypeCard,
                      eventType === type.id && styles.eventTypeCardActive,
                    ]}
                    onPress={() => setEventType(type.id)}
                  >
                    <Text style={styles.eventTypeIcon}>{type.icon}</Text>
                    <Text style={[
                      styles.eventTypeLabel,
                      eventType === type.id && styles.eventTypeLabelActive,
                    ]}>
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Título do Evento *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Rodeio de Rio Verde 2024"
                value={title}
                onChangeText={setTitle}
                placeholderTextColor={BotaLoveColors.neutralDark}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Descrição *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Descreva seu evento detalhadamente..."
                value={description}
                onChangeText={setDescription}
                placeholderTextColor={BotaLoveColors.neutralDark}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Link Externo</Text>
              <Text style={styles.helperText}>
                Link para site, Instagram, venda de ingressos, etc.
              </Text>
              <TextInput
                style={styles.input}
                placeholder="https://..."
                value={externalLink}
                onChangeText={setExternalLink}
                placeholderTextColor={BotaLoveColors.neutralDark}
                keyboardType="url"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.row}>
              <View style={styles.rowItem}>
                <Text style={styles.label}>Capacidade</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: 500"
                  value={capacity}
                  onChangeText={setCapacity}
                  placeholderTextColor={BotaLoveColors.neutralDark}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.rowItem}>
                <Text style={styles.label}>Preço do Ingresso</Text>
                <TextInput
                  style={styles.input}
                  placeholder="R$ 0,00"
                  value={ticketPrice}
                  onChangeText={setTicketPrice}
                  placeholderTextColor={BotaLoveColors.neutralDark}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          {/* Data e Horário */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="calendar" size={24} color={BotaLoveColors.primary} />
              <Text style={styles.sectionTitle}>Data e Horário</Text>
            </View>

            <View style={styles.dateTimeRow}>
              <View style={styles.dateTimeGroup}>
                <Text style={styles.label}>Data do Evento *</Text>
                <TouchableOpacity
                  style={styles.dateTimeButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Ionicons name="calendar-outline" size={20} color={BotaLoveColors.secondary} />
                  <Text style={styles.dateTimeText}>
                    {eventDate.toLocaleDateString('pt-BR')}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.dateTimeGroup}>
                <Text style={styles.label}>Horário *</Text>
                <TouchableOpacity
                  style={styles.dateTimeButton}
                  onPress={() => setShowTimePicker(true)}
                >
                  <Ionicons name="time-outline" size={20} color={BotaLoveColors.secondary} />
                  <Text style={styles.dateTimeText}>
                    {time.toTimeString().split(' ')[0].substring(0, 5)}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={eventDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onDateChange}
                minimumDate={new Date()}
              />
            )}

            {showTimePicker && (
              <DateTimePicker
                value={time}
                mode="time"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onTimeChange}
              />
            )}
          </View>

          {/* Localização */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="location" size={24} color={BotaLoveColors.primary} />
              <Text style={styles.sectionTitle}>Localização</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nome do Local *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Parque de Exposições"
                value={venueName}
                onChangeText={setVenueName}
                placeholderTextColor={BotaLoveColors.neutralDark}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Endereço</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Rua Principal, 123"
                value={address}
                onChangeText={setAddress}
                placeholderTextColor={BotaLoveColors.neutralDark}
              />
            </View>

            <View style={styles.row}>
              <View style={styles.rowItem}>
                <Text style={styles.label}>Cidade *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Cidade"
                  value={city}
                  onChangeText={setCity}
                  placeholderTextColor={BotaLoveColors.neutralDark}
                />
              </View>

              <View style={styles.rowItemSmall}>
                <Text style={styles.label}>Estado *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="UF"
                  value={state}
                  onChangeText={(text) => setState(text.toUpperCase())}
                  placeholderTextColor={BotaLoveColors.neutralDark}
                  maxLength={2}
                  autoCapitalize="characters"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>CEP</Text>
              <TextInput
                style={styles.input}
                placeholder="00000-000"
                value={zipCode}
                onChangeText={setZipCode}
                placeholderTextColor={BotaLoveColors.neutralDark}
                keyboardType="numeric"
                maxLength={9}
              />
            </View>
          </View>

          {/* Duração do Anúncio - Oculto em modo de edição */}
          {!isEditMode ? (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="timer" size={24} color={BotaLoveColors.primary} />
                <Text style={styles.sectionTitle}>Duração do Anúncio</Text>
              </View>

              <Text style={[styles.helperText, { marginBottom: 16 }]}>
                Escolha por quanto tempo seu evento ficará visível no app
              </Text>

              <View style={styles.durationGrid}>
              {EVENT_DURATIONS.map((duration) => (
                <TouchableOpacity
                  key={duration.id}
                  style={[
                    styles.durationCard,
                    selectedDuration === duration.id && styles.durationCardActive,
                  ]}
                  onPress={() => setSelectedDuration(duration.id)}
                >
                  {duration.popular && (
                    <View style={styles.popularBadge}>
                      <Text style={styles.popularBadgeText}>POPULAR</Text>
                    </View>
                  )}
                  <Text style={[
                    styles.durationLabel,
                    selectedDuration === duration.id && styles.durationLabelActive,
                  ]}>
                    {duration.label}
                  </Text>
                  <Text style={[
                    styles.durationPrice,
                    selectedDuration === duration.id && styles.durationPriceActive,
                  ]}>
                    R$ {duration.price.toFixed(2).replace('.', ',')}
                  </Text>
                  <Text style={[
                    styles.durationDescription,
                    selectedDuration === duration.id && styles.durationDescriptionActive,
                  ]}>
                    {duration.description}
                  </Text>
                  {selectedDuration === duration.id && (
                    <View style={styles.checkIcon}>
                      <Ionicons name="checkmark-circle" size={24} color={BotaLoveColors.primary} />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
          ) : (
            <View style={styles.section}>
              <View style={styles.editModeNotice}>
                <Ionicons name="information-circle" size={24} color={BotaLoveColors.primary} />
                <View style={styles.editModeNoticeText}>
                  <Text style={styles.editModeNoticeTitle}>Plano do Evento</Text>
                  <Text style={styles.editModeNoticeDescription}>
                    O plano de duração e destaque não pode ser alterado durante a edição. Use a opção "Renovar" nos Meus Eventos para modificar o plano.
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Destaque (Opcional) - Oculto em modo de edição */}
          {!isEditMode && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="star" size={24} color={BotaLoveColors.primary} />
              <Text style={styles.sectionTitle}>Destaque (Opcional)</Text>
            </View>

            <View style={styles.highlightToggleContainer}>
              <View style={styles.highlightToggleInfo}>
                <Text style={styles.highlightToggleTitle}>Ativar Destaque</Text>
                <Text style={styles.highlightToggleDescription}>
                  Seu evento aparecerá em banners no topo e em formato de carrossel
                </Text>
              </View>
              <Switch
                value={isHighlightEnabled}
                onValueChange={setIsHighlightEnabled}
                trackColor={{ false: '#E0E0E0', true: BotaLoveColors.primaryLight }}
                thumbColor={isHighlightEnabled ? BotaLoveColors.primary : '#F4F4F4'}
              />
            </View>

            {isHighlightEnabled && (
              <>
                <Text style={[styles.helperText, { marginTop: 16, marginBottom: 16 }]}>
                  Escolha a duração do destaque
                </Text>

                <View style={styles.highlightGrid}>
                  {HIGHLIGHT_DURATIONS.map((highlight) => (
                    <TouchableOpacity
                      key={highlight.id}
                      style={[
                        styles.highlightCard,
                        selectedHighlight === highlight.id && styles.highlightCardActive,
                      ]}
                      onPress={() => setSelectedHighlight(highlight.id)}
                    >
                      {highlight.popular && (
                        <View style={styles.highlightPopularBadge}>
                          <Ionicons name="star" size={12} color="#FFF" />
                        </View>
                      )}
                      <Text style={[
                        styles.highlightLabel,
                        selectedHighlight === highlight.id && styles.highlightLabelActive,
                      ]}>
                        {highlight.label}
                      </Text>
                      <Text style={[
                        styles.highlightPrice,
                        selectedHighlight === highlight.id && styles.highlightPriceActive,
                      ]}>
                        +R$ {highlight.price.toFixed(2).replace('.', ',')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}
          </View>
          )}

          {/* Resumo de Valores - Oculto em modo de edição */}
          {!isEditMode && (
          <View style={styles.summarySection}>
            <LinearGradient
              colors={[BotaLoveColors.primaryLight, BotaLoveColors.primary]}
              style={styles.summaryGradient}
            >
              <Text style={styles.summaryTitle}>Resumo do Investimento</Text>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Duração ({selectedDuration} dias)</Text>
                <Text style={styles.summaryValue}>
                  R$ {getEventDurationPrice().toFixed(2).replace('.', ',')}
                </Text>
              </View>

              {isHighlightEnabled && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Destaque ({selectedHighlight} dias)</Text>
                  <Text style={styles.summaryValue}>
                    R$ {getHighlightPrice().toFixed(2).replace('.', ',')}
                  </Text>
                </View>
              )}

              <View style={styles.summaryDivider} />

              <View style={styles.summaryTotal}>
                <Text style={styles.summaryTotalLabel}>Total</Text>
                <Text style={styles.summaryTotalValue}>
                  R$ {getTotalPrice().toFixed(2).replace('.', ',')}
                </Text>
              </View>

              <View style={styles.summaryBenefits}>
                <View style={styles.benefitRow}>
                  <Ionicons name="checkmark-circle" size={16} color="#FFF" />
                  <Text style={styles.benefitText}>Visível por {selectedDuration} dias</Text>
                </View>
                {isHighlightEnabled && (
                  <View style={styles.benefitRow}>
                    <Ionicons name="star" size={16} color="#FFF" />
                    <Text style={styles.benefitText}>Banner destaque por {selectedHighlight} dias</Text>
                  </View>
                )}
                <View style={styles.benefitRow}>
                  <Ionicons name="location" size={16} color="#FFF" />
                  <Text style={styles.benefitText}>Ordenação por proximidade</Text>
                </View>
                <View style={styles.benefitRow}>
                  <Ionicons name="link" size={16} color="#FFF" />
                  <Text style={styles.benefitText}>Link externo incluído</Text>
                </View>
              </View>
            </LinearGradient>
          </View>
          )}

          {/* Botões de Ação */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.createButton, isLoading && styles.createButtonDisabled]}
              onPress={handleCreateEvent}
              disabled={isLoading}
            >
              <LinearGradient
                colors={isLoading ? ['#999', '#777'] : [BotaLoveColors.primary, BotaLoveColors.primaryDark]}
                style={styles.createGradient}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <>
                    <Ionicons name={isEditMode ? "checkmark-circle" : "card"} size={22} color="#FFF" />
                    <Text style={styles.createButtonText}>
                      {isEditMode ? 'Salvar Alterações' : 'Prosseguir para Pagamento'}
                    </Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {!isEditMode && (
          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={20} color="#3498DB" />
            <Text style={styles.infoText}>
              Após o pagamento, seu evento será publicado imediatamente. 
              {isHighlightEnabled && ' O destaque será ativado automaticamente.'}
            </Text>
          </View>
          )}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Modal de Pagamento Simulado */}
      <Modal
        visible={showPaymentModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPaymentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.paymentModal}>
            <LinearGradient
              colors={[BotaLoveColors.primary, BotaLoveColors.primaryDark]}
              style={styles.paymentModalHeader}
            >
              <Ionicons name="card" size={40} color="#FFF" />
              <Text style={styles.paymentModalTitle}>Pagamento</Text>
              <Text style={styles.paymentModalSubtitle}>Confirme para publicar seu evento</Text>
            </LinearGradient>

            <View style={styles.paymentModalContent}>
              <View style={styles.paymentSummary}>
                <Text style={styles.paymentEventTitle}>{title}</Text>
                
                <View style={styles.paymentRow}>
                  <Text style={styles.paymentLabel}>Duração ({selectedDuration} dias)</Text>
                  <Text style={styles.paymentValue}>R$ {getEventDurationPrice().toFixed(2).replace('.', ',')}</Text>
                </View>

                {isHighlightEnabled && (
                  <View style={styles.paymentRow}>
                    <Text style={styles.paymentLabel}>Destaque ({selectedHighlight} dias)</Text>
                    <Text style={styles.paymentValue}>R$ {getHighlightPrice().toFixed(2).replace('.', ',')}</Text>
                  </View>
                )}

                <View style={styles.paymentDivider} />

                <View style={styles.paymentTotalRow}>
                  <Text style={styles.paymentTotalLabel}>Total</Text>
                  <Text style={styles.paymentTotalValue}>R$ {getTotalPrice().toFixed(2).replace('.', ',')}</Text>
                </View>
              </View>

              <View style={styles.simulatedBadge}>
                <Ionicons name="flask" size={16} color="#E67E22" />
                <Text style={styles.simulatedText}>Pagamento Simulado (ambiente de teste)</Text>
              </View>

              <View style={styles.paymentActions}>
                <TouchableOpacity
                  style={styles.cancelPaymentButton}
                  onPress={() => setShowPaymentModal(false)}
                  disabled={isProcessingPayment}
                >
                  <Text style={styles.cancelPaymentText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.confirmPaymentButton, isProcessingPayment && styles.confirmPaymentButtonDisabled]}
                  onPress={handlePayment}
                  disabled={isProcessingPayment}
                >
                  <LinearGradient
                    colors={isProcessingPayment ? ['#999', '#777'] : ['#27AE60', '#219653']}
                    style={styles.confirmPaymentGradient}
                  >
                    {isProcessingPayment ? (
                      <ActivityIndicator color="#FFF" size="small" />
                    ) : (
                      <>
                        <Ionicons name="checkmark-circle" size={20} color="#FFF" />
                        <Text style={styles.confirmPaymentText}>Confirmar</Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
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
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingBottom: isSmallDevice ? 22 : 28,
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
    opacity: 0.95,
    fontWeight: '500',
  },
  form: {
    padding: isSmallDevice ? 14 : 18,
  },
  section: {
    backgroundColor: BotaLoveColors.backgroundWhite,
    borderRadius: isSmallDevice ? 18 : 22,
    padding: isSmallDevice ? 18 : 24,
    marginBottom: isSmallDevice ? 14 : 18,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: isSmallDevice ? 10 : 14,
    marginBottom: isSmallDevice ? 18 : 24,
    paddingBottom: isSmallDevice ? 12 : 16,
    borderBottomWidth: 1.5,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  sectionTitle: {
    fontSize: isSmallDevice ? 17 : 19,
    fontWeight: '700',
    color: BotaLoveColors.secondary,
    letterSpacing: -0.2,
  },
  inputGroup: {
    marginBottom: isSmallDevice ? 16 : 20,
  },
  label: {
    fontSize: isSmallDevice ? 13 : 14,
    fontWeight: '700',
    color: BotaLoveColors.secondary,
    marginBottom: isSmallDevice ? 8 : 10,
  },
  helperText: {
    fontSize: isSmallDevice ? 12 : 13,
    color: BotaLoveColors.neutralDark,
    marginBottom: isSmallDevice ? 8 : 10,
    lineHeight: isSmallDevice ? 17 : 19,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#F8F8F8',
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.06)',
    borderRadius: isSmallDevice ? 14 : 16,
    paddingHorizontal: isSmallDevice ? 14 : 18,
    paddingVertical: isSmallDevice ? 14 : 16,
    fontSize: isSmallDevice ? 14 : 15,
    color: BotaLoveColors.textPrimary,
    fontWeight: '500',
  },
  textArea: {
    minHeight: isSmallDevice ? 110 : 130,
    paddingTop: isSmallDevice ? 14 : 16,
    textAlignVertical: 'top',
  },
  // Tipos de evento
  eventTypesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: isSmallDevice ? 8 : 12,
  },
  eventTypeCard: {
    width: (SCREEN_WIDTH - (isSmallDevice ? 88 : 108)) / 3,
    aspectRatio: 1,
    backgroundColor: '#F8F8F8',
    borderRadius: isSmallDevice ? 14 : 16,
    borderWidth: 2,
    borderColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    padding: isSmallDevice ? 6 : 10,
  },
  eventTypeCardActive: {
    backgroundColor: '#FFF9E6',
    borderColor: BotaLoveColors.primary,
    ...Platform.select({
      ios: {
        shadowColor: BotaLoveColors.primary,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  eventTypeIcon: {
    fontSize: isSmallDevice ? 28 : 34,
    marginBottom: isSmallDevice ? 5 : 7,
  },
  eventTypeLabel: {
    fontSize: isSmallDevice ? 10 : 11,
    fontWeight: '600',
    color: BotaLoveColors.neutralDark,
    textAlign: 'center',
  },
  eventTypeLabelActive: {
    color: BotaLoveColors.secondary,
    fontWeight: '700',
  },
  // Data e horário
  dateTimeRow: {
    flexDirection: 'row',
    gap: isSmallDevice ? 10 : 14,
  },
  dateTimeGroup: {
    flex: 1,
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: isSmallDevice ? 8 : 12,
    backgroundColor: '#F8F8F8',
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.06)',
    borderRadius: isSmallDevice ? 14 : 16,
    paddingHorizontal: isSmallDevice ? 14 : 18,
    paddingVertical: isSmallDevice ? 14 : 16,
  },
  dateTimeText: {
    fontSize: isSmallDevice ? 14 : 15,
    color: BotaLoveColors.secondary,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    gap: isSmallDevice ? 10 : 14,
    marginBottom: isSmallDevice ? 16 : 20,
  },
  rowItem: {
    flex: 1,
  },
  rowItemSmall: {
    width: isSmallDevice ? 90 : 110,
  },
  // Aviso de modo de edição
  editModeNotice: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    borderRadius: 14,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#90CAF9',
  },
  editModeNoticeText: {
    flex: 1,
  },
  editModeNoticeTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: BotaLoveColors.secondary,
    marginBottom: 4,
  },
  editModeNoticeDescription: {
    fontSize: 13,
    color: BotaLoveColors.neutralDark,
    lineHeight: 19,
  },
  // Duração do anúncio
  durationGrid: {
    gap: isSmallDevice ? 10 : 14,
  },
  durationCard: {
    backgroundColor: '#F8F8F8',
    borderRadius: isSmallDevice ? 14 : 16,
    borderWidth: 2,
    borderColor: 'transparent',
    padding: isSmallDevice ? 16 : 20,
    position: 'relative',
  },
  durationCardActive: {
    backgroundColor: '#FFF9E6',
    borderColor: BotaLoveColors.primary,
    ...Platform.select({
      ios: {
        shadowColor: BotaLoveColors.primary,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  popularBadge: {
    position: 'absolute',
    top: isSmallDevice ? 10 : 14,
    right: isSmallDevice ? 10 : 14,
    backgroundColor: BotaLoveColors.primary,
    paddingHorizontal: isSmallDevice ? 10 : 12,
    paddingVertical: isSmallDevice ? 4 : 5,
    borderRadius: isSmallDevice ? 12 : 14,
    ...Platform.select({
      ios: {
        shadowColor: BotaLoveColors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  popularBadgeText: {
    fontSize: isSmallDevice ? 9 : 10,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 0.8,
  },
  durationLabel: {
    fontSize: isSmallDevice ? 15 : 17,
    fontWeight: '700',
    color: BotaLoveColors.secondary,
    marginBottom: isSmallDevice ? 4 : 6,
  },
  durationLabelActive: {
    color: BotaLoveColors.primary,
  },
  durationPrice: {
    fontSize: isSmallDevice ? 22 : 26,
    fontWeight: '800',
    color: BotaLoveColors.secondary,
    marginBottom: isSmallDevice ? 4 : 6,
  },
  durationPriceActive: {
    color: BotaLoveColors.primary,
  },
  durationDescription: {
    fontSize: isSmallDevice ? 12 : 13,
    color: BotaLoveColors.neutralDark,
    fontWeight: '500',
  },
  durationDescriptionActive: {
    color: BotaLoveColors.secondary,
  },
  checkIcon: {
    position: 'absolute',
    top: isSmallDevice ? 10 : 14,
    right: isSmallDevice ? 10 : 14,
  },
  // Destaque
  highlightToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8F8F8',
    padding: isSmallDevice ? 16 : 20,
    borderRadius: isSmallDevice ? 14 : 16,
  },
  highlightToggleInfo: {
    flex: 1,
    marginRight: isSmallDevice ? 14 : 18,
  },
  highlightToggleTitle: {
    fontSize: isSmallDevice ? 15 : 17,
    fontWeight: '700',
    color: BotaLoveColors.secondary,
    marginBottom: isSmallDevice ? 4 : 6,
  },
  highlightToggleDescription: {
    fontSize: isSmallDevice ? 12 : 13,
    color: BotaLoveColors.neutralDark,
    lineHeight: isSmallDevice ? 17 : 19,
    fontWeight: '500',
  },
  highlightGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: isSmallDevice ? 10 : 14,
  },
  highlightCard: {
    width: (SCREEN_WIDTH - (isSmallDevice ? 72 : 88)) / 2,
    backgroundColor: '#F8F8F8',
    borderRadius: isSmallDevice ? 14 : 16,
    borderWidth: 2,
    borderColor: 'transparent',
    padding: isSmallDevice ? 16 : 20,
    position: 'relative',
  },
  highlightCardActive: {
    backgroundColor: '#FFF9E6',
    borderColor: BotaLoveColors.primary,
    ...Platform.select({
      ios: {
        shadowColor: BotaLoveColors.primary,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  highlightPopularBadge: {
    position: 'absolute',
    top: isSmallDevice ? 8 : 10,
    right: isSmallDevice ? 8 : 10,
    width: isSmallDevice ? 24 : 28,
    height: isSmallDevice ? 24 : 28,
    borderRadius: isSmallDevice ? 12 : 14,
    backgroundColor: BotaLoveColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: BotaLoveColors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  highlightLabel: {
    fontSize: isSmallDevice ? 15 : 17,
    fontWeight: '700',
    color: BotaLoveColors.secondary,
    marginBottom: isSmallDevice ? 4 : 6,
  },
  highlightLabelActive: {
    color: BotaLoveColors.primary,
  },
  highlightPrice: {
    fontSize: isSmallDevice ? 18 : 22,
    fontWeight: '800',
    color: BotaLoveColors.secondary,
  },
  highlightPriceActive: {
    color: BotaLoveColors.primary,
  },
  // Resumo
  summarySection: {
    marginBottom: isSmallDevice ? 16 : 20,
    borderRadius: isSmallDevice ? 18 : 22,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: BotaLoveColors.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 14,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  summaryGradient: {
    padding: isSmallDevice ? 20 : 26,
  },
  summaryTitle: {
    fontSize: isSmallDevice ? 18 : 22,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: isSmallDevice ? 16 : 20,
    letterSpacing: -0.3,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: isSmallDevice ? 10 : 14,
  },
  summaryLabel: {
    fontSize: isSmallDevice ? 13 : 15,
    color: '#FFF',
    opacity: 0.92,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: isSmallDevice ? 15 : 17,
    fontWeight: '700',
    color: '#FFF',
  },
  summaryDivider: {
    height: 1.5,
    backgroundColor: '#FFF',
    opacity: 0.35,
    marginVertical: isSmallDevice ? 12 : 16,
  },
  summaryTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: isSmallDevice ? 16 : 20,
  },
  summaryTotalLabel: {
    fontSize: isSmallDevice ? 17 : 20,
    fontWeight: '800',
    color: '#FFF',
  },
  summaryTotalValue: {
    fontSize: isSmallDevice ? 26 : 32,
    fontWeight: '800',
    color: '#FFF',
  },
  summaryBenefits: {
    gap: isSmallDevice ? 8 : 10,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: isSmallDevice ? 8 : 10,
  },
  benefitText: {
    fontSize: isSmallDevice ? 12 : 14,
    color: '#FFF',
    opacity: 0.95,
    fontWeight: '500',
  },
  // Ações
  actionsContainer: {
    marginBottom: isSmallDevice ? 16 : 20,
  },
  createButton: {
    borderRadius: isSmallDevice ? 16 : 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: BotaLoveColors.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  createButtonDisabled: {
    opacity: 0.7,
  },
  createGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: isSmallDevice ? 8 : 10,
    paddingVertical: isSmallDevice ? 18 : 22,
  },
  createButtonText: {
    fontSize: isSmallDevice ? 16 : 18,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: -0.2,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: isSmallDevice ? 10 : 14,
    backgroundColor: '#E8F4FD',
    padding: isSmallDevice ? 16 : 20,
    borderRadius: isSmallDevice ? 14 : 16,
    borderLeftWidth: isSmallDevice ? 4 : 5,
    borderLeftColor: '#3498DB',
  },
  infoText: {
    flex: 1,
    fontSize: isSmallDevice ? 12 : 14,
    color: BotaLoveColors.secondary,
    lineHeight: isSmallDevice ? 18 : 21,
    fontWeight: '500',
  },
  bottomSpacer: {
    height: isSmallDevice ? 35 : 50,
  },
  // Modal de Pagamento
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  paymentModal: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    width: '100%',
    maxWidth: 400,
    overflow: 'hidden',
  },
  paymentModalHeader: {
    paddingVertical: 30,
    alignItems: 'center',
    gap: 8,
  },
  paymentModalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
  },
  paymentModalSubtitle: {
    fontSize: 14,
    color: '#FFF',
    opacity: 0.9,
  },
  paymentModalContent: {
    padding: 24,
  },
  paymentSummary: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  paymentEventTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: BotaLoveColors.secondary,
    marginBottom: 16,
    textAlign: 'center',
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  paymentLabel: {
    fontSize: 14,
    color: BotaLoveColors.neutralDark,
  },
  paymentValue: {
    fontSize: 14,
    fontWeight: '600',
    color: BotaLoveColors.secondary,
  },
  paymentDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 12,
  },
  paymentTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentTotalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: BotaLoveColors.secondary,
  },
  paymentTotalValue: {
    fontSize: 22,
    fontWeight: '800',
    color: BotaLoveColors.primary,
  },
  simulatedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFF3E0',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  simulatedText: {
    fontSize: 12,
    color: '#E67E22',
    fontWeight: '600',
  },
  paymentActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelPaymentButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: BotaLoveColors.neutralLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelPaymentText: {
    fontSize: 16,
    fontWeight: '600',
    color: BotaLoveColors.neutralDark,
  },
  confirmPaymentButton: {
    flex: 1.5,
    borderRadius: 12,
    overflow: 'hidden',
  },
  confirmPaymentButtonDisabled: {
    opacity: 0.7,
  },
  confirmPaymentGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  confirmPaymentText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
});
