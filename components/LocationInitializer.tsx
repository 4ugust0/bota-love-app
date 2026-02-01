/**
 * 🔥 BOTA LOVE APP - Location Initializer
 * 
 * Componente que BLOQUEIA o app até o usuário configurar a localização.
 * A localização é OBRIGATÓRIA para usar o Bota Love.
 * Oferece GPS automático ou seleção manual.
 * 
 * @author Bota Love Team
 */

import { BotaLoveColors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useLocationPermission } from '@/hooks/useLocationPermission';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

// Lista de estados brasileiros
const ESTADOS = [
  { sigla: 'AC', nome: 'Acre' },
  { sigla: 'AL', nome: 'Alagoas' },
  { sigla: 'AP', nome: 'Amapá' },
  { sigla: 'AM', nome: 'Amazonas' },
  { sigla: 'BA', nome: 'Bahia' },
  { sigla: 'CE', nome: 'Ceará' },
  { sigla: 'GO', nome: 'Goiás' },
  { sigla: 'DF', nome: 'Distrito Federal' },
  { sigla: 'ES', nome: 'Espírito Santo' },
  { sigla: 'MA', nome: 'Maranhão' },
  { sigla: 'MT', nome: 'Mato Grosso' },
  { sigla: 'MS', nome: 'Mato Grosso do Sul' },
  { sigla: 'MG', nome: 'Minas Gerais' },
  { sigla: 'PA', nome: 'Pará' },
  { sigla: 'PB', nome: 'Paraíba' },
  { sigla: 'PR', nome: 'Paraná' },
  { sigla: 'PE', nome: 'Pernambuco' },
  { sigla: 'PI', nome: 'Piauí' },
  { sigla: 'RJ', nome: 'Rio de Janeiro' },
  { sigla: 'RN', nome: 'Rio Grande do Norte' },
  { sigla: 'RS', nome: 'Rio Grande do Sul' },
  { sigla: 'RO', nome: 'Rondônia' },
  { sigla: 'RR', nome: 'Roraima' },
  { sigla: 'SC', nome: 'Santa Catarina' },
  { sigla: 'SP', nome: 'São Paulo' },
  { sigla: 'SE', nome: 'Sergipe' },
  { sigla: 'TO', nome: 'Tocantins' },
];

// Coordenadas centrais de cada estado (aproximadas)
const STATE_COORDINATES: { [key: string]: { lat: number; lng: number } } = {
  'AC': { lat: -9.0238, lng: -70.8120 },
  'AL': { lat: -9.5713, lng: -36.7820 },
  'AP': { lat: 0.9020, lng: -52.0030 },
  'AM': { lat: -3.4168, lng: -65.8561 },
  'BA': { lat: -12.5797, lng: -41.7007 },
  'CE': { lat: -5.4984, lng: -39.3206 },
  'DF': { lat: -15.7801, lng: -47.9292 },
  'ES': { lat: -19.1834, lng: -40.3089 },
  'GO': { lat: -15.8270, lng: -49.8362 },
  'MA': { lat: -5.4200, lng: -45.4400 },
  'MT': { lat: -12.6819, lng: -56.9211 },
  'MS': { lat: -20.7722, lng: -54.7852 },
  'MG': { lat: -18.5122, lng: -44.5550 },
  'PA': { lat: -3.4168, lng: -52.2166 },
  'PB': { lat: -7.2400, lng: -36.7820 },
  'PR': { lat: -24.8947, lng: -51.5506 },
  'PE': { lat: -8.3190, lng: -37.9990 },
  'PI': { lat: -7.7183, lng: -42.7289 },
  'RJ': { lat: -22.2533, lng: -42.8789 },
  'RN': { lat: -5.7945, lng: -36.3547 },
  'RS': { lat: -29.7547, lng: -53.2225 },
  'RO': { lat: -10.9472, lng: -62.8278 },
  'RR': { lat: 2.7376, lng: -61.3686 },
  'SC': { lat: -27.2423, lng: -50.2189 },
  'SP': { lat: -22.2608, lng: -48.7297 },
  'SE': { lat: -10.5741, lng: -37.3857 },
  'TO': { lat: -10.1753, lng: -48.2982 },
};

interface LocationInitializerProps {
  children: React.ReactNode;
}

export function LocationInitializer({ children }: LocationInitializerProps) {
  const { updateDiscoverySettings, userType } = useAuth();
  const {
    needsLocationSetup,
    isGettingLocation,
    permissionDenied,
    activateLocation,
    openSettings,
  } = useLocationPermission();

  // Estados para seleção manual
  const [showManualModal, setShowManualModal] = useState(false);
  const [selectedState, setSelectedState] = useState('');
  const [manualCity, setManualCity] = useState('');
  const [isSavingManual, setIsSavingManual] = useState(false);
  const [gpsError, setGpsError] = useState(false);

  // Handler para ativar GPS
  const handleActivateGPS = async () => {
    setGpsError(false);
    const success = await activateLocation();
    if (!success && !permissionDenied) {
      setGpsError(true);
    }
  };

  // Handler para salvar localização manual
  const handleSaveManualLocation = async () => {
    if (!selectedState) {
      Alert.alert('Atenção', 'Por favor, selecione seu estado.');
      return;
    }

    setIsSavingManual(true);
    try {
      const coords = STATE_COORDINATES[selectedState] || { lat: -15.7801, lng: -47.9292 };
      
      await updateDiscoverySettings({
        state: selectedState,
        city: manualCity || 'Não informada',
        latitude: coords.lat,
        longitude: coords.lng,
      });
      
      setShowManualModal(false);
      Alert.alert('Sucesso! 🎉', 'Sua localização foi configurada!');
    } catch (error) {
      console.error('Erro ao salvar localização manual:', error);
      Alert.alert('Erro', 'Não foi possível salvar a localização. Tente novamente.');
    } finally {
      setIsSavingManual(false);
    }
  };

  // Produtores de eventos não precisam configurar localização
  // Eles gerenciam eventos, não precisam de descoberta de pessoas
  if (userType === 'producer') {
    return <>{children}</>;
  }

  // Se não precisa configurar localização, mostra o app normalmente
  if (!needsLocationSetup) {
    return <>{children}</>;
  }

  // Tela de localização obrigatória
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[BotaLoveColors.primary, BotaLoveColors.primaryDark, BotaLoveColors.primaryDark]}
        style={styles.gradient}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo/Ícone */}
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <Ionicons name="location" size={80} color={BotaLoveColors.primary} />
            </View>
          </View>

          {/* Título */}
          <Text style={styles.title}>Configure sua Localização</Text>
          
          {/* Descrição */}
          <Text style={styles.description}>
            Para encontrar pessoas próximas a você e participar de eventos rurais na sua região, 
            o <Text style={styles.bold}>Bota Love</Text> precisa saber onde você está.
          </Text>

          {/* Benefícios */}
          <View style={styles.benefitsContainer}>
            <View style={styles.benefitRow}>
              <Ionicons name="people" size={24} color="#FFF" />
              <Text style={styles.benefitText}>Encontre pessoas na sua região</Text>
            </View>
            <View style={styles.benefitRow}>
              <Ionicons name="calendar" size={24} color="#FFF" />
              <Text style={styles.benefitText}>Descubra eventos rurais próximos</Text>
            </View>
            <View style={styles.benefitRow}>
              <Ionicons name="heart" size={24} color="#FFF" />
              <Text style={styles.benefitText}>Matches mais relevantes</Text>
            </View>
          </View>

          {/* Mensagem de erro GPS */}
          {(gpsError || permissionDenied) && (
            <View style={styles.warningContainer}>
              <Ionicons name="warning" size={20} color="#D4AD63" />
              <Text style={styles.warningText}>
                {permissionDenied 
                  ? 'Você negou a permissão de localização. Use a opção manual abaixo ou abra as configurações.'
                  : 'Não foi possível obter sua localização automaticamente. Use a opção manual abaixo.'}
              </Text>
            </View>
          )}

          {/* Botão GPS */}
          <TouchableOpacity
            style={[styles.button, isGettingLocation && styles.buttonDisabled]}
            onPress={permissionDenied ? openSettings : handleActivateGPS}
            disabled={isGettingLocation}
            activeOpacity={0.8}
          >
            {isGettingLocation ? (
              <>
                <ActivityIndicator size="small" color={BotaLoveColors.primary} />
                <Text style={styles.buttonText}>Obtendo localização...</Text>
              </>
            ) : permissionDenied ? (
              <>
                <Ionicons name="settings" size={22} color={BotaLoveColors.primary} />
                <Text style={styles.buttonText}>Abrir Configurações</Text>
              </>
            ) : (
              <>
                <Ionicons name="navigate" size={22} color={BotaLoveColors.primary} />
                <Text style={styles.buttonText}>Usar GPS Automático</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Separador */}
          <View style={styles.separatorContainer}>
            <View style={styles.separatorLine} />
            <Text style={styles.separatorText}>ou</Text>
            <View style={styles.separatorLine} />
          </View>

          {/* Botão Manual */}
          <TouchableOpacity
            style={styles.buttonSecondary}
            onPress={() => setShowManualModal(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="map" size={22} color="#FFF" />
            <Text style={styles.buttonSecondaryText}>Selecionar Manualmente</Text>
          </TouchableOpacity>

          {/* Nota de privacidade */}
          <View style={styles.privacyContainer}>
            <Ionicons name="shield-checkmark" size={16} color="rgba(255,255,255,0.7)" />
            <Text style={styles.privacyText}>
              Sua localização é usada apenas para melhorar sua experiência. 
              Nunca compartilhamos seus dados com terceiros.
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>

      {/* Modal de Seleção Manual */}
      <Modal
        visible={showManualModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowManualModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecione sua Localização</Text>
              <TouchableOpacity onPress={() => setShowManualModal(false)}>
                <Ionicons name="close" size={28} color={BotaLoveColors.secondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              {/* Seleção de Estado */}
              <Text style={styles.inputLabel}>Estado *</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={selectedState}
                  onValueChange={(value) => setSelectedState(value)}
                  style={styles.picker}
                >
                  <Picker.Item label="Selecione um estado" value="" />
                  {ESTADOS.map((estado) => (
                    <Picker.Item 
                      key={estado.sigla} 
                      label={`${estado.nome} (${estado.sigla})`} 
                      value={estado.sigla} 
                    />
                  ))}
                </Picker>
              </View>

              {/* Campo de Cidade */}
              <Text style={styles.inputLabel}>Cidade (opcional)</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="business" size={20} color={BotaLoveColors.neutralMedium} />
                <TextInput
                  style={styles.textInput}
                  value={manualCity}
                  onChangeText={setManualCity}
                  placeholder="Digite sua cidade"
                  placeholderTextColor={BotaLoveColors.neutralMedium}
                />
              </View>

              <Text style={styles.helperText}>
                * A localização será usada para encontrar pessoas e eventos próximos a você.
              </Text>
            </ScrollView>

            {/* Botão Salvar */}
            <TouchableOpacity
              style={[styles.saveButton, (!selectedState || isSavingManual) && styles.saveButtonDisabled]}
              onPress={handleSaveManualLocation}
              disabled={!selectedState || isSavingManual}
            >
              {isSavingManual ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={22} color="#FFF" />
                  <Text style={styles.saveButtonText}>Confirmar Localização</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 30,
    paddingTop: height * 0.08,
    paddingBottom: 40,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 24,
  },
  iconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  bold: {
    fontWeight: 'bold',
  },
  benefitsContainer: {
    width: '100%',
    marginBottom: 24,
    gap: 12,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  benefitText: {
    fontSize: 14,
    color: '#FFF',
    fontWeight: '500',
    flex: 1,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,215,0,0.2)',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 173, 99, 0.4)',
  },
  warningText: {
    fontSize: 13,
    color: '#D4AD63',
    flex: 1,
    lineHeight: 18,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#FFF',
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 30,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonDisabled: {
    opacity: 0.8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: BotaLoveColors.primary,
  },
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 20,
    gap: 12,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  separatorText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
  },
  buttonSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 30,
    width: '100%',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  buttonSecondaryText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  privacyContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 24,
    paddingHorizontal: 10,
  },
  privacyText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    flex: 1,
    lineHeight: 18,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: height * 0.7,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: BotaLoveColors.secondary,
  },
  modalContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: BotaLoveColors.secondary,
    marginBottom: 8,
  },
  pickerContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  picker: {
    height: 50,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: BotaLoveColors.secondary,
    paddingVertical: 14,
  },
  helperText: {
    fontSize: 12,
    color: BotaLoveColors.neutralMedium,
    lineHeight: 18,
    marginTop: 8,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: BotaLoveColors.primary,
    paddingVertical: 16,
    marginHorizontal: 20,
    marginBottom: 30,
    borderRadius: 30,
  },
  saveButtonDisabled: {
    backgroundColor: BotaLoveColors.neutralMedium,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
});
