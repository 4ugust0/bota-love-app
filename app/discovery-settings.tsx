import { BotaLoveColors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const { width } = Dimensions.get('window');

// Limites por plano
const PLAN_LIMITS = {
  bronze: {
    maxDistance: 150,
    canChangeDistance: false,
    botaEventLimit: 5,
    checkinLimit: 5,
  },
  silver: {
    maxDistance: 300,
    canChangeDistance: true,
    botaEventLimit: 15,
    checkinLimit: 15,
  },
  gold: {
    maxDistance: 500,
    canChangeDistance: true,
    botaEventLimit: 30,
    checkinLimit: 30,
  },
  premium: {
    maxDistance: 1000,
    canChangeDistance: true,
    botaEventLimit: -1, // ilimitado
    checkinLimit: -1, // ilimitado
  },
};

// Lista de estados brasileiros
const ESTADOS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

export default function DiscoverySettingsScreen() {
  const router = useRouter();
  const { currentUser, hasPremium, updateDiscoverySettings } = useAuth();
  
  // Estado de loading e salvamento
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  
  // Estados da tela - Localização
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [distance, setDistance] = useState(150);
  const [ageMin, setAgeMin] = useState(18);
  const [ageMax, setAgeMax] = useState(45);
  const [showOutsideDistance, setShowOutsideDistance] = useState(false);
  const [showOutsideAgeRange, setShowOutsideAgeRange] = useState(false);
  const [genderInterest, setGenderInterest] = useState<'men' | 'women' | 'both'>('women');
  
  // Filtros adicionais - Correspondentes ao perfil
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedProfessions, setSelectedProfessions] = useState<string[]>([]);
  const [selectedRuralActivities, setSelectedRuralActivities] = useState<string[]>([]);
  const [selectedPropertySize, setSelectedPropertySize] = useState<string[]>([]);
  const [selectedAnimals, setSelectedAnimals] = useState<string[]>([]);
  const [selectedCrops, setSelectedCrops] = useState<string[]>([]);
  const [selectedMusicalStyles, setSelectedMusicalStyles] = useState<string[]>([]);
  const [selectedHobbies, setSelectedHobbies] = useState<string[]>([]);
  const [selectedPets, setSelectedPets] = useState<string[]>([]);
  const [selectedEducation, setSelectedEducation] = useState<string[]>([]);
  const [selectedChildren, setSelectedChildren] = useState<string[]>([]);

  // Modal de seleção
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalOptions, setModalOptions] = useState<string[]>([]);
  const [modalSelected, setModalSelected] = useState<string[]>([]);
  const [modalSetter, setModalSetter] = useState<((items: string[]) => void) | null>(null);

  // Função para obter localização via GPS
  const getCurrentLocation = async () => {
    setIsGettingLocation(true);
    try {
      // Solicitar permissão
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permissão negada',
          'Para usar sua localização atual, você precisa permitir o acesso à localização do dispositivo.',
          [{ text: 'OK' }]
        );
        setIsGettingLocation(false);
        return;
      }

      // Obter localização
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude: lat, longitude: lng } = location.coords;
      setLatitude(lat);
      setLongitude(lng);

      // Tentar obter cidade/estado via geocoding reverso
      try {
        const [address] = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
        
        if (address) {
          if (address.region) {
            // Converter nome do estado para sigla
            const stateMapping: { [key: string]: string } = {
              'Acre': 'AC', 'Alagoas': 'AL', 'Amapá': 'AP', 'Amazonas': 'AM',
              'Bahia': 'BA', 'Ceará': 'CE', 'Distrito Federal': 'DF', 'Espírito Santo': 'ES',
              'Goiás': 'GO', 'Maranhão': 'MA', 'Mato Grosso': 'MT', 'Mato Grosso do Sul': 'MS',
              'Minas Gerais': 'MG', 'Pará': 'PA', 'Paraíba': 'PB', 'Paraná': 'PR',
              'Pernambuco': 'PE', 'Piauí': 'PI', 'Rio de Janeiro': 'RJ', 'Rio Grande do Norte': 'RN',
              'Rio Grande do Sul': 'RS', 'Rondônia': 'RO', 'Roraima': 'RR', 'Santa Catarina': 'SC',
              'São Paulo': 'SP', 'Sergipe': 'SE', 'Tocantins': 'TO'
            };
            const stateAbbrev = stateMapping[address.region] || address.region;
            setSelectedState(stateAbbrev);
          }
          if (address.city || address.subregion) {
            setSelectedCity(address.city || address.subregion || '');
          }
        }
      } catch (geoError) {
        console.log('Erro no geocoding reverso:', geoError);
        // Mesmo se o geocoding falhar, temos lat/lng
      }

      Alert.alert('Sucesso', 'Localização atualizada!');
    } catch (error) {
      console.error('Erro ao obter localização:', error);
      Alert.alert(
        'Erro',
        'Não foi possível obter sua localização. Verifique se o GPS está ativado e tente novamente.'
      );
    } finally {
      setIsGettingLocation(false);
    }
  };

  // Carregar dados salvos do Firestore
  useEffect(() => {
    if (currentUser?.discoverySettings) {
      const settings = currentUser.discoverySettings;
      
      // Localização
      setSelectedState(settings.state || currentUser.profile?.state || '');
      setSelectedCity(settings.city || currentUser.profile?.city || '');
      setLatitude(settings.latitude || null);
      setLongitude(settings.longitude || null);
      setDistance(settings.distanceRadius || 150);
      setAgeMin(settings.ageRange?.min || 18);
      setAgeMax(settings.ageRange?.max || 45);
      setShowOutsideDistance(settings.showOutsideDistance || false);
      setShowOutsideAgeRange(settings.showOutsideAgeRange || false);
      setGenderInterest(settings.genderInterest || 'women');
      
      // Filtros avançados - Correspondentes ao perfil
      setSelectedInterests(settings.selectedInterests || []);
      setSelectedProfessions(settings.selectedProfessions || []);
      setSelectedRuralActivities(settings.selectedRuralActivities || []);
      setSelectedPropertySize(settings.selectedPropertySize || []);
      setSelectedAnimals(settings.selectedAnimals || []);
      setSelectedCrops(settings.selectedCrops || []);
      setSelectedMusicalStyles(settings.selectedMusicalStyles || []);
      setSelectedHobbies(settings.selectedHobbies || []);
      setSelectedPets(settings.selectedPets || []);
      setSelectedEducation(settings.selectedEducation || []);
      setSelectedChildren(settings.selectedChildren || []);
    } else if (currentUser?.profile) {
      // Se não tem discovery settings, usar dados do perfil como padrão
      setSelectedState(currentUser.profile.state || '');
      setSelectedCity(currentUser.profile.city || '');
    }
    setIsLoading(false);
  }, [currentUser]);

  // Obter limites do plano atual - simulando com base no premium
  const currentPlan = hasPremium ? 'premium' : 'bronze';
  const planLimits = PLAN_LIMITS[currentPlan as keyof typeof PLAN_LIMITS] || PLAN_LIMITS.bronze;

  const handleSave = async () => {
    if (!currentUser) {
      Alert.alert('Erro', 'Usuário não encontrado');
      return;
    }
    
    setIsSaving(true);
    
    try {
      await updateDiscoverySettings({
        // Localização
        state: selectedState,
        city: selectedCity,
        latitude: latitude || undefined,
        longitude: longitude || undefined,
        distanceRadius: Math.round(distance),
        ageRange: { min: Math.round(ageMin), max: Math.round(ageMax) },
        showOutsideDistance,
        showOutsideAgeRange,
        genderInterest,
        showMe: true,
        onlyVerified: false,
        onlyWithPhotos: false,
        
        // Filtros avançados - Correspondentes ao perfil
        selectedInterests,
        selectedProfessions,
        selectedRuralActivities,
        selectedPropertySize,
        selectedAnimals,
        selectedCrops,
        selectedMusicalStyles,
        selectedHobbies,
        selectedPets,
        selectedEducation,
        selectedChildren,
      });
      
      Alert.alert(
        'Sucesso! 🎉',
        'Suas preferências de descoberta foram salvas!',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error: any) {
      console.error('Erro ao salvar configurações:', error);
      Alert.alert('Erro', 'Não foi possível salvar as configurações. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleFilter = (filter: string, currentFilters: string[], setFilters: (filters: string[]) => void) => {
    if (currentFilters.includes(filter)) {
      setFilters(currentFilters.filter(f => f !== filter));
    } else {
      setFilters([...currentFilters, filter]);
    }
  };

  // Opções dos filtros - Iguais ao perfil
  const FILTER_OPTIONS = {
    interests: [
      'Viagens', 'Música', 'Esportes', 'Leitura', 'Culinária',
      'Fotografia', 'Arte', 'Cinema', 'Tecnologia', 'Natureza',
      'Animais', 'Festas', 'Família', 'Empreendedorismo', 'Voluntariado'
    ],
    professions: [
      'Produtor(a) Rural', 'Empresário(a) do Agronegócio', 'Engenheiro(a) Agrônomo(a)',
      'Médico(a) Veterinário(a) – Grandes Animais', 'Médico(a) Veterinário(a) – Pequenos Animais',
      'Médico(a) Veterinário(a) – Animais Exóticos', 'Zootecnista', 'Técnico(a) em Agropecuária',
      'Estudante de Engenharia Agronômica', 'Estudante de Medicina Veterinária',
      'Estudante de Zootecnia', 'Estudante de Técnico em Agropecuária',
      'Trabalhadores do Agronegócio', 'Outro'
    ],
    ruralActivities: [
      'Agricultura', 'Agronegócio', 'Agroindústria', 'Pecuária de Corte',
      'Pecuária de Leite', 'Clínica de Pequenos Animais', 'Clínica de Grandes Animais', 'Outros'
    ],
    propertySize: [
      'Pequena', 'Média', 'Grande', 'Latifúndio'
    ],
    animals: [
      'Bovinos', 'Equinos', 'Suínos', 'Ovinos', 'Caprinos', 'Aves', 'Peixes', 'Outros'
    ],
    crops: [
      'Soja', 'Milho', 'Algodão', 'Café', 'Cana-de-açúcar', 'Feijão', 'Arroz',
      'Trigo', 'Frutas', 'Hortaliças', 'Outros'
    ],
    musicalStyles: [
      'Sertanejo', 'Modão', 'Country', 'Outros'
    ],
    hobbies: [
      'Cavalgada', 'Prova de Laço/Tambor', 'Pescaria', 'Rodeio',
      'Festa de Peão', 'Colheita', 'Feira de Agronegócios', 'Shows', 'Outros'
    ],
    pets: [
      'Cachorros', 'Gatos', 'Cavalos', 'Aves', 'Peixes', 'Outros', 'Não tenho'
    ],
    education: [
      'Ensino Fundamental', 'Ensino Médio', 'Técnico', 'Superior Incompleto',
      'Superior Completo', 'Pós-graduação', 'Mestrado', 'Doutorado'
    ],
    children: [
      'Não tenho filhos', 'Tenho filhos', 'Quero ter filhos', 'Não quero filhos', 'Ainda não sei'
    ],
  };

  // Abrir modal de seleção
  const openFilterModal = (
    title: string, 
    options: string[], 
    selected: string[], 
    setter: (items: string[]) => void
  ) => {
    setModalTitle(title);
    setModalOptions(options);
    setModalSelected([...selected]);
    setModalSetter(() => setter);
    setModalVisible(true);
  };

  // Toggle item na modal
  const toggleModalItem = (item: string) => {
    setModalSelected(prev => 
      prev.includes(item) 
        ? prev.filter(i => i !== item) 
        : [...prev, item]
    );
  };

  // Confirmar seleção da modal
  const confirmModalSelection = () => {
    if (modalSetter) {
      modalSetter(modalSelected);
    }
    setModalVisible(false);
  };

  const getGenderInterestLabel = () => {
    switch (genderInterest) {
      case 'men': return 'Homens';
      case 'women': return 'Mulheres';
      case 'both': return 'Ambos';
      default: return 'Selecionar';
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={BotaLoveColors.primary} />
        <Text style={styles.loadingText}>Carregando configurações...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[BotaLoveColors.primary, '#E8960F']}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ajustes de Descoberta</Text>
        <View style={styles.headerPlaceholder} />
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false}>
     
        {/* Localização */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="location" size={24} color={BotaLoveColors.primary} />
            <Text style={styles.sectionTitle}>Localização</Text>
          </View>

          {/* Botão para usar localização atual */}
          <TouchableOpacity 
            style={styles.gpsButton}
            onPress={getCurrentLocation}
            disabled={isGettingLocation}
          >
            <LinearGradient
              colors={[BotaLoveColors.primary, '#E8960F']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gpsGradient}
            >
              {isGettingLocation ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Ionicons name="navigate" size={20} color="#FFF" />
              )}
              <Text style={styles.gpsButtonText}>
                {isGettingLocation ? 'Obtendo localização...' : 'Usar minha localização atual'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {latitude && longitude && (
            <View style={styles.coordinatesInfo}>
              <Ionicons name="checkmark-circle" size={16} color="#27AE60" />
              <Text style={styles.coordinatesText}>
                Localização GPS salva
              </Text>
            </View>
          )}

          <View style={styles.locationCard}>
            <View style={styles.locationRow}>
              <Ionicons name="earth" size={20} color={BotaLoveColors.secondary} />
              <Text style={styles.locationLabel}>Estado:</Text>
              <Text style={styles.locationValue}>{selectedState || 'Não definido'}</Text>
            </View>
            <TouchableOpacity style={styles.changeButton}>
              <Text style={styles.changeButtonText}>Alterar</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.locationCard}>
            <View style={styles.locationRow}>
              <Ionicons name="pin" size={20} color={BotaLoveColors.secondary} />
              <Text style={styles.locationLabel}>Cidade:</Text>
              <Text style={styles.locationValue}>{selectedCity || 'Não definida'}</Text>
            </View>
            <TouchableOpacity style={styles.changeButton}>
              <Text style={styles.changeButtonText}>Adicionar novo local</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Distância Máxima */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="navigate-circle" size={24} color={BotaLoveColors.primary} />
            <Text style={styles.sectionTitle}>Distância máxima</Text>
          </View>

          <View style={styles.distanceCard}>
            <Text style={styles.distanceValue}>{Math.round(distance)}km</Text>
            <Slider
              style={styles.slider}
              minimumValue={10}
              maximumValue={planLimits.maxDistance}
              step={1}
              value={distance}
              onValueChange={(value) => setDistance(Math.round(value))}
              minimumTrackTintColor={BotaLoveColors.primary}
              maximumTrackTintColor="#E0E0E0"
              thumbTintColor={BotaLoveColors.primary}
              disabled={!planLimits.canChangeDistance}
            />
            {!planLimits.canChangeDistance && (
              <View style={styles.planWarning}>
                <Ionicons name="lock-closed" size={16} color="#E74C3C" />
                <Text style={styles.planWarningText}>
                  Plano Bronze: raio fixo de 150km
                </Text>
                <TouchableOpacity onPress={() => router.push('/store' as any)}>
                  <Text style={styles.upgradeLink}>Fazer upgrade</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Toggle - Mostrar perfis fora do raio */}
          <View style={styles.toggleCard}>
            <View style={styles.toggleLeft}>
              <Ionicons name="eye-outline" size={22} color={BotaLoveColors.secondary} />
              <View style={styles.toggleTextContainer}>
                <Text style={styles.toggleTitle}>Mostrar pessoas mais longe de mim</Text>
                <Text style={styles.toggleSubtitle}>
                  Se eu ficar sem perfis pra ver
                </Text>
              </View>
            </View>
            <Switch
              value={showOutsideDistance}
              onValueChange={setShowOutsideDistance}
              trackColor={{ false: '#E0E0E0', true: BotaLoveColors.primary }}
              thumbColor="#FFF"
            />
          </View>
        </View>

        {/* Interesse em */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="male-female" size={24} color={BotaLoveColors.primary} />
            <Text style={styles.sectionTitle}>Tem interesse em</Text>
          </View>
          <View style={styles.genderOptionsContainer}>
            <TouchableOpacity 
              style={[
                styles.genderOption, 
                genderInterest === 'women' && styles.genderOptionSelected
              ]}
              onPress={() => setGenderInterest('women')}
            >
              <Ionicons 
                name="female" 
                size={24} 
                color={genderInterest === 'women' ? '#FFF' : BotaLoveColors.secondary} 
              />
              <Text style={[
                styles.genderOptionText,
                genderInterest === 'women' && styles.genderOptionTextSelected
              ]}>Mulheres</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.genderOption, 
                genderInterest === 'men' && styles.genderOptionSelected
              ]}
              onPress={() => setGenderInterest('men')}
            >
              <Ionicons 
                name="male" 
                size={24} 
                color={genderInterest === 'men' ? '#FFF' : BotaLoveColors.secondary} 
              />
              <Text style={[
                styles.genderOptionText,
                genderInterest === 'men' && styles.genderOptionTextSelected
              ]}>Homens</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.genderOption, 
                genderInterest === 'both' && styles.genderOptionSelected
              ]}
              onPress={() => setGenderInterest('both')}
            >
              <Ionicons 
                name="male-female" 
                size={24} 
                color={genderInterest === 'both' ? '#FFF' : BotaLoveColors.secondary} 
              />
              <Text style={[
                styles.genderOptionText,
                genderInterest === 'both' && styles.genderOptionTextSelected
              ]}>Ambos</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Faixa Etária */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="calendar" size={24} color={BotaLoveColors.primary} />
            <Text style={styles.sectionTitle}>Faixa etária</Text>
          </View>

          <View style={styles.ageCard}>
            <Text style={styles.ageValue}>{ageMin} - {ageMax}</Text>
            <View style={styles.ageSliders}>
              <View style={styles.ageSliderRow}>
                <Text style={styles.ageLabel}>Mínima: {ageMin}</Text>
                <Slider
                  style={styles.ageSlider}
                  minimumValue={18}
                  maximumValue={100}
                  value={ageMin}
                  onValueChange={setAgeMin}
                  minimumTrackTintColor={BotaLoveColors.primary}
                  maximumTrackTintColor="#E0E0E0"
                  thumbTintColor={BotaLoveColors.primary}
                  step={1}
                />
              </View>
              <View style={styles.ageSliderRow}>
                <Text style={styles.ageLabel}>Máxima: {ageMax}</Text>
                <Slider
                  style={styles.ageSlider}
                  minimumValue={18}
                  maximumValue={100}
                  value={ageMax}
                  onValueChange={setAgeMax}
                  minimumTrackTintColor={BotaLoveColors.primary}
                  maximumTrackTintColor="#E0E0E0"
                  thumbTintColor={BotaLoveColors.primary}
                  step={1}
                />
              </View>
            </View>
          </View>

          {/* Toggle - Mostrar fora da faixa etária */}
          <View style={styles.toggleCard}>
            <View style={styles.toggleLeft}>
              <Ionicons name="eye-outline" size={22} color={BotaLoveColors.secondary} />
              <View style={styles.toggleTextContainer}>
                <Text style={styles.toggleTitle}>Mostrar pessoas um pouco fora da</Text>
                <Text style={styles.toggleTitle}>minha faixa etária se eu ficar sem</Text>
                <Text style={styles.toggleTitle}>perfis pra ver</Text>
              </View>
            </View>
            <Switch
              value={showOutsideAgeRange}
              onValueChange={setShowOutsideAgeRange}
              trackColor={{ false: '#E0E0E0', true: BotaLoveColors.primary }}
              thumbColor="#FFF"
            />
          </View>
        </View>

        {/* Filtros Adicionais - Correspondentes ao Perfil */}
        <View style={styles.filtersHeader}>
          <Ionicons name="options" size={24} color={BotaLoveColors.primary} />
          <Text style={styles.filtersHeaderTitle}>Filtros Avançados</Text>
        </View>

        <FilterSection
          icon="heart"
          title="Interesses"
          selectedCount={selectedInterests.length}
          onPress={() => openFilterModal('Interesses', FILTER_OPTIONS.interests, selectedInterests, setSelectedInterests)}
        />

        <FilterSection
          icon="briefcase"
          title="Profissão / Área"
          selectedCount={selectedProfessions.length}
          onPress={() => openFilterModal('Profissão / Área de Estudo', FILTER_OPTIONS.professions, selectedProfessions, setSelectedProfessions)}
        />

        <FilterSection
          icon="leaf"
          title="Atividade Rural"
          selectedCount={selectedRuralActivities.length}
          onPress={() => openFilterModal('Atividade Rural', FILTER_OPTIONS.ruralActivities, selectedRuralActivities, setSelectedRuralActivities)}
        />

        <FilterSection
          icon="business"
          title="Porte da Propriedade"
          selectedCount={selectedPropertySize.length}
          onPress={() => openFilterModal('Porte da Propriedade', FILTER_OPTIONS.propertySize, selectedPropertySize, setSelectedPropertySize)}
        />

        <FilterSection
          icon="paw"
          title="Animais"
          selectedCount={selectedAnimals.length}
          onPress={() => openFilterModal('Animais', FILTER_OPTIONS.animals, selectedAnimals, setSelectedAnimals)}
        />

        <FilterSection
          icon="nutrition"
          title="Culturas / Lavouras"
          selectedCount={selectedCrops.length}
          onPress={() => openFilterModal('Culturas / Lavouras', FILTER_OPTIONS.crops, selectedCrops, setSelectedCrops)}
        />

        <FilterSection
          icon="musical-notes"
          title="Estilo Musical"
          selectedCount={selectedMusicalStyles.length}
          onPress={() => openFilterModal('Estilo Musical', FILTER_OPTIONS.musicalStyles, selectedMusicalStyles, setSelectedMusicalStyles)}
        />

        <FilterSection
          icon="bicycle"
          title="Hobbies Rurais"
          selectedCount={selectedHobbies.length}
          onPress={() => openFilterModal('Hobbies Rurais', FILTER_OPTIONS.hobbies, selectedHobbies, setSelectedHobbies)}
        />

        <FilterSection
          icon="paw"
          title="Pets"
          selectedCount={selectedPets.length}
          onPress={() => openFilterModal('Pets', FILTER_OPTIONS.pets, selectedPets, setSelectedPets)}
        />

        <FilterSection
          icon="school"
          title="Formação"
          selectedCount={selectedEducation.length}
          onPress={() => openFilterModal('Formação', FILTER_OPTIONS.education, selectedEducation, setSelectedEducation)}
        />

        <FilterSection
          icon="people"
          title="Filhos"
          selectedCount={selectedChildren.length}
          onPress={() => openFilterModal('Filhos', FILTER_OPTIONS.children, selectedChildren, setSelectedChildren)}
        />

        {/* Botão Salvar */}
        <TouchableOpacity 
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]} 
          onPress={handleSave}
          disabled={isSaving}
        >
          <LinearGradient
            colors={['#27AE60', '#229954']}
            style={styles.saveGradient}
          >
            {isSaving ? (
              <>
                <ActivityIndicator size="small" color="#FFF" />
                <Text style={styles.saveText}>Salvando...</Text>
              </>
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={24} color="#FFF" />
                <Text style={styles.saveText}>Salvar Preferências</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Modal de Seleção de Filtros */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Header da Modal */}
            <View style={styles.modalHeader}>
              <TouchableOpacity 
                style={styles.modalCloseButton}
                onPress={() => setModalVisible(false)}
              >
                <Ionicons name="close" size={24} color={BotaLoveColors.secondary} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>{modalTitle}</Text>
              <View style={styles.modalCloseButton} />
            </View>

            {/* Lista de Opções */}
            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              <Text style={styles.modalSubtitle}>
                Selecione as opções para filtrar perfis
              </Text>
              <View style={styles.modalOptionsContainer}>
                {modalOptions.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.modalOption,
                      modalSelected.includes(option) && styles.modalOptionSelected
                    ]}
                    onPress={() => toggleModalItem(option)}
                  >
                    <Text style={[
                      styles.modalOptionText,
                      modalSelected.includes(option) && styles.modalOptionTextSelected
                    ]}>
                      {option}
                    </Text>
                    {modalSelected.includes(option) && (
                      <Ionicons name="checkmark-circle" size={20} color="#FFF" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* Footer com botões */}
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.modalClearButton}
                onPress={() => setModalSelected([])}
              >
                <Text style={styles.modalClearButtonText}>Limpar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalConfirmButton}
                onPress={confirmModalSelection}
              >
                <LinearGradient
                  colors={[BotaLoveColors.primary, '#E8960F']}
                  style={styles.modalConfirmGradient}
                >
                  <Text style={styles.modalConfirmButtonText}>
                    Confirmar ({modalSelected.length})
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Componente de Seção de Filtro
interface FilterSectionProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  selectedCount: number;
  onPress: () => void;
}

function FilterSection({ icon, title, selectedCount, onPress }: FilterSectionProps) {
  return (
    <View style={styles.section}>
      <TouchableOpacity style={styles.filterCard} onPress={onPress}>
        <View style={styles.filterLeft}>
          <Ionicons name={icon} size={22} color={BotaLoveColors.neutralDark} />
          <Text style={styles.filterTitle}>{title}</Text>
        </View>
        <View style={styles.filterRight}>
          {selectedCount > 0 && (
            <View style={styles.selectedBadge}>
              <Text style={styles.selectedBadgeText}>{selectedCount}</Text>
            </View>
          )}
          <Text style={styles.filterAction}>Selecionar</Text>
          <Ionicons name="chevron-forward" size={20} color={BotaLoveColors.neutralDark} />
        </View>
      </TouchableOpacity>
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
  eventsBanner: {
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  eventsGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  eventsTextContainer: {
    flex: 1,
  },
  eventsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  eventsSubtitle: {
    fontSize: 14,
    color: '#FFF',
    opacity: 0.9,
  },
  section: {
    backgroundColor: '#FFF',
    marginTop: 12,
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: BotaLoveColors.secondary,
  },
  gpsButton: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  gpsGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 10,
  },
  gpsButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFF',
  },
  coordinatesInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  coordinatesText: {
    fontSize: 13,
    color: '#27AE60',
    fontWeight: '500',
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationLabel: {
    fontSize: 15,
    color: BotaLoveColors.neutralDark,
  },
  locationValue: {
    fontSize: 15,
    fontWeight: '600',
    color: BotaLoveColors.secondary,
  },
  changeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
  },
  changeButtonText: {
    fontSize: 13,
    color: BotaLoveColors.primary,
    fontWeight: '600',
  },
  distanceCard: {
    backgroundColor: '#FAFAFA',
    padding: 20,
    borderRadius: 12,
  },
  distanceValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: BotaLoveColors.primary,
    textAlign: 'center',
    marginBottom: 12,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  planWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
    padding: 12,
    backgroundColor: '#FFE5E5',
    borderRadius: 8,
  },
  planWarningText: {
    fontSize: 13,
    color: '#E74C3C',
    fontWeight: '500',
  },
  upgradeLink: {
    fontSize: 13,
    color: BotaLoveColors.primary,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    marginTop: 12,
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  toggleTextContainer: {
    flex: 1,
  },
  toggleTitle: {
    fontSize: 14,
    color: BotaLoveColors.secondary,
    fontWeight: '500',
  },
  toggleSubtitle: {
    fontSize: 12,
    color: BotaLoveColors.neutralDark,
    marginTop: 2,
  },
  selectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
  },
  selectCardText: {
    fontSize: 16,
    color: BotaLoveColors.secondary,
    fontWeight: '500',
  },
  ageCard: {
    backgroundColor: '#FAFAFA',
    padding: 20,
    borderRadius: 12,
  },
  ageValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: BotaLoveColors.primary,
    textAlign: 'center',
    marginBottom: 20,
  },
  ageSliders: {
    gap: 16,
  },
  ageSliderRow: {
    gap: 8,
  },
  ageLabel: {
    fontSize: 14,
    color: BotaLoveColors.neutralDark,
    fontWeight: '500',
  },
  ageSlider: {
    width: '100%',
    height: 40,
  },
  filterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  filterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  filterTitle: {
    fontSize: 16,
    color: BotaLoveColors.secondary,
  },
  filterRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectedBadge: {
    backgroundColor: BotaLoveColors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 24,
    alignItems: 'center',
  },
  selectedBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  filterAction: {
    fontSize: 14,
    color: BotaLoveColors.neutralDark,
  },
  saveButton: {
    marginHorizontal: 20,
    marginTop: 24,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  saveText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: BotaLoveColors.neutralDark,
  },
  genderOptionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  genderOption: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    gap: 8,
  },
  genderOptionSelected: {
    borderColor: BotaLoveColors.primary,
    backgroundColor: BotaLoveColors.primary,
  },
  genderOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: BotaLoveColors.secondary,
  },
  genderOptionTextSelected: {
    color: '#FFF',
  },
  bottomSpacer: {
    height: 40,
  },
  // Estilos do header de filtros
  filtersHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 8,
    backgroundColor: '#F5F5F5',
  },
  filtersHeaderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: BotaLoveColors.secondary,
  },
  // Estilos da Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: BotaLoveColors.secondary,
  },
  modalContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  modalOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingBottom: 20,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  modalOptionSelected: {
    backgroundColor: BotaLoveColors.primary,
    borderColor: BotaLoveColors.primary,
  },
  modalOptionText: {
    fontSize: 14,
    color: BotaLoveColors.secondary,
    fontWeight: '500',
  },
  modalOptionTextSelected: {
    color: '#FFF',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    gap: 12,
  },
  modalClearButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BotaLoveColors.primary,
    alignItems: 'center',
  },
  modalClearButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: BotaLoveColors.primary,
  },
  modalConfirmButton: {
    flex: 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalConfirmGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalConfirmButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
});
