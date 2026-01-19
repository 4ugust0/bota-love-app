/**
 * 🔥 BOTA LOVE APP - Location Permission Hook
 * 
 * Hook para gerenciar permissões e obtenção OBRIGATÓRIA de localização
 * - A localização é OBRIGATÓRIA para usar o app
 * - Bloqueia o acesso até o usuário ativar
 * - Salva a localização automaticamente no perfil
 * 
 * @author Bota Love Team
 */

import { useAuth } from '@/contexts/AuthContext';
import * as Location from 'expo-location';
import { useSegments } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Alert, Linking, Platform } from 'react-native';

interface LocationData {
  latitude: number;
  longitude: number;
  state?: string;
  city?: string;
}

// Mapeamento de nomes de estados para siglas
const STATE_MAPPING: { [key: string]: string } = {
  'Acre': 'AC', 'Alagoas': 'AL', 'Amapá': 'AP', 'Amazonas': 'AM',
  'Bahia': 'BA', 'Ceará': 'CE', 'Distrito Federal': 'DF', 'Espírito Santo': 'ES',
  'Goiás': 'GO', 'Maranhão': 'MA', 'Mato Grosso': 'MT', 'Mato Grosso do Sul': 'MS',
  'Minas Gerais': 'MG', 'Pará': 'PA', 'Paraíba': 'PB', 'Paraná': 'PR',
  'Pernambuco': 'PE', 'Piauí': 'PI', 'Rio de Janeiro': 'RJ', 'Rio Grande do Norte': 'RN',
  'Rio Grande do Sul': 'RS', 'Rondônia': 'RO', 'Roraima': 'RR', 'Santa Catarina': 'SC',
  'São Paulo': 'SP', 'Sergipe': 'SE', 'Tocantins': 'TO'
};

// Rotas que NÃO devem ser bloqueadas (fluxo de signup/login/onboarding)
const ALLOWED_ROUTES = [
  'onboarding',
  'login',
  'signup',
  'signup-email',
  'signup-name',
  'signup-password',
  'signup-terms',
  'signup-verify-email',
  'signup-confirm',
  'onboarding-profile',
  'onboarding-gender',
  'onboarding-goals',
  'onboarding-orientation',
  'onboarding-final',
  'forgot-password',
  'terms',
];

export function useLocationPermission() {
  const { currentUser, updateDiscoverySettings, isAuthenticated } = useAuth();
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  
  // Obter segmentos da rota atual
  const segments = useSegments();
  const currentRoute = segments[0] || '';

  /**
   * Verificar se está em uma rota permitida (signup/login/onboarding)
   */
  const isOnAllowedRoute = useMemo(() => {
    return ALLOWED_ROUTES.some(route => currentRoute.includes(route));
  }, [currentRoute]);

  /**
   * Verificar se o usuário tem localização configurada
   */
  const hasLocation = useMemo(() => {
    if (!currentUser?.discoverySettings) return false;
    const { latitude, longitude } = currentUser.discoverySettings;
    return !!(latitude && longitude);
  }, [currentUser?.discoverySettings]);

  /**
   * Verificar se precisa mostrar a tela de localização obrigatória
   * - Só mostra se estiver autenticado
   * - E não tiver localização
   * - E NÃO estiver em rota de signup/login/onboarding
   */
  const needsLocationSetup = useMemo(() => {
    // Se está em rota permitida, não bloqueia
    if (isOnAllowedRoute) return false;
    // Só mostra se estiver autenticado e não tiver localização
    return isAuthenticated && !hasLocation;
  }, [isAuthenticated, hasLocation, isOnAllowedRoute]);

  /**
   * Obter a localização atual do usuário
   */
  const getCurrentLocation = useCallback(async (): Promise<LocationData | null> => {
    console.log('📍 Iniciando obtenção de localização...');
    setIsGettingLocation(true);
    setPermissionDenied(false);
    
    try {
      // Verificar/solicitar permissão
      console.log('📍 Solicitando permissão de localização...');
      const { status } = await Location.requestForegroundPermissionsAsync();
      console.log('📍 Status da permissão:', status);
      
      if (status !== 'granted') {
        console.log('📍 Permissão de localização negada');
        setPermissionDenied(true);
        setIsGettingLocation(false);
        return null;
      }

      // Obter localização com timeout
      console.log('📍 Obtendo posição atual...');
      const location = await Promise.race([
        Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        }),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Timeout ao obter localização')), 15000)
        )
      ]);

      console.log('📍 Localização obtida:', location.coords);
      const { latitude, longitude } = location.coords;
      let locationData: LocationData = { latitude, longitude };

      // Tentar obter cidade/estado via geocoding reverso
      try {
        console.log('📍 Fazendo geocoding reverso...');
        const [address] = await Location.reverseGeocodeAsync({ latitude, longitude });
        
        if (address) {
          console.log('📍 Endereço obtido:', address);
          if (address.region) {
            const stateAbbrev = STATE_MAPPING[address.region] || address.region;
            locationData.state = stateAbbrev;
          }
          if (address.city || address.subregion) {
            locationData.city = address.city || address.subregion || undefined;
          }
        }
      } catch (geoError) {
        console.log('📍 Erro no geocoding reverso:', geoError);
        // Mesmo se o geocoding falhar, temos lat/lng
      }

      console.log('📍 Localização final:', locationData);
      return locationData;
    } catch (error: any) {
      console.error('📍 Erro ao obter localização:', error?.message || error);
      setIsGettingLocation(false);
      return null;
    } finally {
      setIsGettingLocation(false);
    }
  }, []);

  /**
   * Salvar localização nos discovery settings
   */
  const saveLocationToProfile = useCallback(async (locationData: LocationData): Promise<boolean> => {
    try {
      await updateDiscoverySettings({
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        state: locationData.state || '',
        city: locationData.city || '',
      });
      console.log('Localização salva com sucesso');
      return true;
    } catch (error) {
      console.error('Erro ao salvar localização:', error);
      return false;
    }
  }, [updateDiscoverySettings]);

  /**
   * Ativar localização (chamado pelo botão da tela obrigatória)
   */
  const activateLocation = useCallback(async (): Promise<boolean> => {
    console.log('📍 activateLocation chamado');
    try {
      const locationData = await getCurrentLocation();
      console.log('📍 Dados de localização recebidos:', locationData);
      
      if (locationData) {
        const saved = await saveLocationToProfile(locationData);
        console.log('📍 Localização salva:', saved);
        if (saved) {
          Alert.alert('Sucesso! 🎉', 'Sua localização foi configurada com sucesso!');
        }
        return saved;
      } else {
        // Se não conseguiu obter localização e não foi por permissão negada
        if (!permissionDenied) {
          Alert.alert(
            'Erro',
            'Não foi possível obter sua localização. Verifique se o GPS está ativado e tente novamente.',
            [{ text: 'OK' }]
          );
        }
        return false;
      }
    } catch (error: any) {
      console.error('📍 Erro em activateLocation:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao obter a localização. Tente novamente.');
      return false;
    }
  }, [getCurrentLocation, saveLocationToProfile, permissionDenied]);

  /**
   * Abrir configurações do dispositivo
   */
  const openSettings = useCallback(() => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  }, []);

  return {
    isGettingLocation,
    hasLocation,
    needsLocationSetup,
    permissionDenied,
    getCurrentLocation,
    activateLocation,
    saveLocationToProfile,
    openSettings,
  };
}
