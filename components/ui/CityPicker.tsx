/**
 * 🔥 BOTA LOVE APP - City Picker Component
 * 
 * Componente para seleção dinâmica de cidades.
 * Busca automática baseada em localização e busca por nome.
 * 
 * @author Bota Love Team
 */

import { BotaLoveColors } from '@/constants/theme';
import {
    BRAZILIAN_STATES,
    City,
    getCitiesByState,
    getCurrentLocation,
    searchCities,
    StateData,
} from '@/services/locationService';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

// =============================================================================
// 📝 TIPOS
// =============================================================================

interface CityPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (city: string, state: string, stateCode: string) => void;
  initialCity?: string;
  initialState?: string;
  title?: string;
  placeholder?: string;
}

// =============================================================================
// 🎯 COMPONENTE PRINCIPAL
// =============================================================================

export default function CityPicker({
  visible,
  onClose,
  onSelect,
  initialCity = '',
  initialState = '',
  title = 'Selecionar Cidade',
  placeholder = 'Buscar cidade...',
}: CityPickerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState(initialState);
  const [cities, setCities] = useState<City[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showStates, setShowStates] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // Carrega cidades quando muda o estado
  useEffect(() => {
    if (selectedState) {
      setCities(getCitiesByState(selectedState));
    } else {
      setCities([]);
    }
  }, [selectedState]);

  // Busca cidades quando digita
  useEffect(() => {
    if (searchQuery.length >= 2) {
      const results = searchCities(searchQuery, selectedState || undefined);
      setCities(results);
    } else if (selectedState) {
      setCities(getCitiesByState(selectedState));
    }
  }, [searchQuery, selectedState]);

  // Usar localização atual
  const handleUseCurrentLocation = async () => {
    setIsGettingLocation(true);
    try {
      const result = await getCurrentLocation();
      
      if (result.success && result.city) {
        onSelect(result.city, result.state || '', result.stateCode || '');
        onClose();
      } else {
        // Mostrar alerta se não conseguiu
        console.warn('Não foi possível obter localização:', result.error);
      }
    } catch (error) {
      console.error('Erro ao obter localização:', error);
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleSelectCity = (city: City) => {
    onSelect(city.name, city.state, city.stateCode);
    onClose();
  };

  const handleSelectState = (state: StateData) => {
    setSelectedState(state.code);
    setShowStates(false);
    setSearchQuery('');
  };

  const renderCityItem = ({ item }: { item: City }) => (
    <TouchableOpacity
      style={styles.cityItem}
      onPress={() => handleSelectCity(item)}
    >
      <View style={styles.cityIconContainer}>
        <Ionicons name="location" size={20} color={BotaLoveColors.primary} />
      </View>
      <View style={styles.cityInfo}>
        <Text style={styles.cityName}>{item.name}</Text>
        <Text style={styles.cityState}>{item.state} - {item.stateCode}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#999" />
    </TouchableOpacity>
  );

  const renderStateItem = ({ item }: { item: StateData }) => (
    <TouchableOpacity
      style={[
        styles.stateItem,
        selectedState === item.code && styles.stateItemSelected,
      ]}
      onPress={() => handleSelectState(item)}
    >
      <Text
        style={[
          styles.stateText,
          selectedState === item.code && styles.stateTextSelected,
        ]}
      >
        {item.code} - {item.name}
      </Text>
      {selectedState === item.code && (
        <Ionicons name="checkmark-circle" size={20} color={BotaLoveColors.primary} />
      )}
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Botão de usar localização atual */}
        <TouchableOpacity
          style={styles.locationButton}
          onPress={handleUseCurrentLocation}
          disabled={isGettingLocation}
        >
          {isGettingLocation ? (
            <ActivityIndicator size="small" color={BotaLoveColors.primary} />
          ) : (
            <Ionicons name="navigate" size={22} color={BotaLoveColors.primary} />
          )}
          <Text style={styles.locationButtonText}>
            {isGettingLocation ? 'Obtendo localização...' : 'Usar minha localização atual'}
          </Text>
        </TouchableOpacity>

        {/* Seletor de Estado */}
        <TouchableOpacity
          style={styles.stateSelector}
          onPress={() => setShowStates(!showStates)}
        >
          <Text style={styles.stateSelectorLabel}>Estado:</Text>
          <Text style={styles.stateSelectorValue}>
            {selectedState
              ? BRAZILIAN_STATES.find(s => s.code === selectedState)?.name || selectedState
              : 'Todos os estados'}
          </Text>
          <Ionicons
            name={showStates ? 'chevron-up' : 'chevron-down'}
            size={20}
            color="#666"
          />
        </TouchableOpacity>

        {/* Lista de Estados (quando expandido) */}
        {showStates && (
          <View style={styles.statesListContainer}>
            <FlatList
              data={[{ code: '', name: 'Todos os estados', region: '' }, ...BRAZILIAN_STATES]}
              renderItem={renderStateItem}
              keyExtractor={(item) => item.code || 'all'}
              style={styles.statesList}
              showsVerticalScrollIndicator={false}
            />
          </View>
        )}

        {/* Campo de Busca */}
        {!showStates && (
          <>
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder={placeholder}
                placeholderTextColor="#999"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCorrect={false}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color="#999" />
                </TouchableOpacity>
              )}
            </View>

            {/* Lista de Cidades */}
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={BotaLoveColors.primary} />
                <Text style={styles.loadingText}>Buscando cidades...</Text>
              </View>
            ) : cities.length > 0 ? (
              <FlatList
                data={cities}
                renderItem={renderCityItem}
                keyExtractor={(item) => item.id}
                style={styles.citiesList}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.citiesListContent}
              />
            ) : searchQuery.length >= 2 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="search-outline" size={48} color="#ccc" />
                <Text style={styles.emptyText}>Nenhuma cidade encontrada</Text>
                <Text style={styles.emptySubtext}>
                  Tente buscar com outro nome ou selecione um estado
                </Text>
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="location-outline" size={48} color="#ccc" />
                <Text style={styles.emptyText}>
                  {selectedState
                    ? 'Busque por uma cidade'
                    : 'Selecione um estado ou busque uma cidade'}
                </Text>
                <Text style={styles.emptySubtext}>
                  Digite pelo menos 2 caracteres para buscar
                </Text>
              </View>
            )}
          </>
        )}
      </View>
    </Modal>
  );
}

// =============================================================================
// 🎨 ESTILOS
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  headerSpacer: {
    width: 40,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: 'rgba(249, 168, 37, 0.1)',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    gap: 12,
  },
  locationButtonText: {
    fontSize: 15,
    color: BotaLoveColors.primary,
    fontWeight: '500',
  },
  stateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#F5F5F5',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
  },
  stateSelectorLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  stateSelectorValue: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  statesListContainer: {
    flex: 1,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    backgroundColor: '#F9F9F9',
    overflow: 'hidden',
  },
  statesList: {
    flex: 1,
  },
  stateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  stateItemSelected: {
    backgroundColor: 'rgba(249, 168, 37, 0.1)',
  },
  stateText: {
    fontSize: 15,
    color: '#333',
  },
  stateTextSelected: {
    fontWeight: '600',
    color: BotaLoveColors.primary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    height: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
  },
  citiesList: {
    flex: 1,
    marginTop: 12,
  },
  citiesListContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  cityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  cityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(249, 168, 37, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cityInfo: {
    flex: 1,
  },
  cityName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  cityState: {
    fontSize: 13,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});
