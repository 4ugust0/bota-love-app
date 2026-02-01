/**
 * 🔥 BOTA LOVE APP - Location Service
 * 
 * Serviço para gerenciamento de localização dinâmica,
 * busca de cidades e integração com GPS.
 * 
 * @author Bota Love Team
 */

import * as Location from 'expo-location';

// =============================================================================
// 📝 TIPOS
// =============================================================================

export interface City {
  id: string;
  name: string;
  state: string;
  stateCode: string;
  population?: number;
  latitude: number;
  longitude: number;
}

export interface StateData {
  code: string;
  name: string;
  region: string;
}

export interface LocationResult {
  success: boolean;
  city?: string;
  state?: string;
  stateCode?: string;
  latitude?: number;
  longitude?: number;
  error?: string;
}

// =============================================================================
// 🌎 DADOS DOS ESTADOS BRASILEIROS
// =============================================================================

export const BRAZILIAN_STATES: StateData[] = [
  { code: 'AC', name: 'Acre', region: 'Norte' },
  { code: 'AL', name: 'Alagoas', region: 'Nordeste' },
  { code: 'AP', name: 'Amapá', region: 'Norte' },
  { code: 'AM', name: 'Amazonas', region: 'Norte' },
  { code: 'BA', name: 'Bahia', region: 'Nordeste' },
  { code: 'CE', name: 'Ceará', region: 'Nordeste' },
  { code: 'DF', name: 'Distrito Federal', region: 'Centro-Oeste' },
  { code: 'ES', name: 'Espírito Santo', region: 'Sudeste' },
  { code: 'GO', name: 'Goiás', region: 'Centro-Oeste' },
  { code: 'MA', name: 'Maranhão', region: 'Nordeste' },
  { code: 'MT', name: 'Mato Grosso', region: 'Centro-Oeste' },
  { code: 'MS', name: 'Mato Grosso do Sul', region: 'Centro-Oeste' },
  { code: 'MG', name: 'Minas Gerais', region: 'Sudeste' },
  { code: 'PA', name: 'Pará', region: 'Norte' },
  { code: 'PB', name: 'Paraíba', region: 'Nordeste' },
  { code: 'PR', name: 'Paraná', region: 'Sul' },
  { code: 'PE', name: 'Pernambuco', region: 'Nordeste' },
  { code: 'PI', name: 'Piauí', region: 'Nordeste' },
  { code: 'RJ', name: 'Rio de Janeiro', region: 'Sudeste' },
  { code: 'RN', name: 'Rio Grande do Norte', region: 'Nordeste' },
  { code: 'RS', name: 'Rio Grande do Sul', region: 'Sul' },
  { code: 'RO', name: 'Rondônia', region: 'Norte' },
  { code: 'RR', name: 'Roraima', region: 'Norte' },
  { code: 'SC', name: 'Santa Catarina', region: 'Sul' },
  { code: 'SP', name: 'São Paulo', region: 'Sudeste' },
  { code: 'SE', name: 'Sergipe', region: 'Nordeste' },
  { code: 'TO', name: 'Tocantins', region: 'Norte' },
];

// =============================================================================
// 🏙️ PRINCIPAIS CIDADES POR ESTADO (Cidades do Agro)
// =============================================================================

export const MAJOR_CITIES_BY_STATE: Record<string, City[]> = {
  'GO': [
    { id: 'go-goiania', name: 'Goiânia', state: 'Goiás', stateCode: 'GO', latitude: -16.6869, longitude: -49.2648 },
    { id: 'go-rio-verde', name: 'Rio Verde', state: 'Goiás', stateCode: 'GO', latitude: -17.7927, longitude: -50.9189 },
    { id: 'go-anapolis', name: 'Anápolis', state: 'Goiás', stateCode: 'GO', latitude: -16.3281, longitude: -48.9534 },
    { id: 'go-jatai', name: 'Jataí', state: 'Goiás', stateCode: 'GO', latitude: -17.8819, longitude: -51.7144 },
    { id: 'go-itumbiara', name: 'Itumbiara', state: 'Goiás', stateCode: 'GO', latitude: -18.4098, longitude: -49.2157 },
    { id: 'go-catalao', name: 'Catalão', state: 'Goiás', stateCode: 'GO', latitude: -18.1661, longitude: -47.9461 },
    { id: 'go-cristalina', name: 'Cristalina', state: 'Goiás', stateCode: 'GO', latitude: -16.7675, longitude: -47.6133 },
  ],
  'MT': [
    { id: 'mt-cuiaba', name: 'Cuiabá', state: 'Mato Grosso', stateCode: 'MT', latitude: -15.6014, longitude: -56.0979 },
    { id: 'mt-sinop', name: 'Sinop', state: 'Mato Grosso', stateCode: 'MT', latitude: -11.8639, longitude: -55.5092 },
    { id: 'mt-rondonopolis', name: 'Rondonópolis', state: 'Mato Grosso', stateCode: 'MT', latitude: -16.4673, longitude: -54.6372 },
    { id: 'mt-lucas-rio-verde', name: 'Lucas do Rio Verde', state: 'Mato Grosso', stateCode: 'MT', latitude: -13.0500, longitude: -55.9119 },
    { id: 'mt-sorriso', name: 'Sorriso', state: 'Mato Grosso', stateCode: 'MT', latitude: -12.5458, longitude: -55.7147 },
    { id: 'mt-primavera-leste', name: 'Primavera do Leste', state: 'Mato Grosso', stateCode: 'MT', latitude: -15.5600, longitude: -54.2969 },
    { id: 'mt-tangara-serra', name: 'Tangará da Serra', state: 'Mato Grosso', stateCode: 'MT', latitude: -14.6229, longitude: -57.4936 },
  ],
  'MS': [
    { id: 'ms-campo-grande', name: 'Campo Grande', state: 'Mato Grosso do Sul', stateCode: 'MS', latitude: -20.4697, longitude: -54.6201 },
    { id: 'ms-dourados', name: 'Dourados', state: 'Mato Grosso do Sul', stateCode: 'MS', latitude: -22.2208, longitude: -54.8058 },
    { id: 'ms-tres-lagoas', name: 'Três Lagoas', state: 'Mato Grosso do Sul', stateCode: 'MS', latitude: -20.7850, longitude: -51.7018 },
    { id: 'ms-ponta-pora', name: 'Ponta Porã', state: 'Mato Grosso do Sul', stateCode: 'MS', latitude: -22.5359, longitude: -55.7256 },
    { id: 'ms-navirai', name: 'Naviraí', state: 'Mato Grosso do Sul', stateCode: 'MS', latitude: -23.0631, longitude: -54.1897 },
  ],
  'SP': [
    { id: 'sp-sao-paulo', name: 'São Paulo', state: 'São Paulo', stateCode: 'SP', latitude: -23.5505, longitude: -46.6333 },
    { id: 'sp-ribeirao-preto', name: 'Ribeirão Preto', state: 'São Paulo', stateCode: 'SP', latitude: -21.1775, longitude: -47.8103 },
    { id: 'sp-campinas', name: 'Campinas', state: 'São Paulo', stateCode: 'SP', latitude: -22.9099, longitude: -47.0626 },
    { id: 'sp-piracicaba', name: 'Piracicaba', state: 'São Paulo', stateCode: 'SP', latitude: -22.7338, longitude: -47.6476 },
    { id: 'sp-barretos', name: 'Barretos', state: 'São Paulo', stateCode: 'SP', latitude: -20.5574, longitude: -48.5697 },
    { id: 'sp-aracatuba', name: 'Araçatuba', state: 'São Paulo', stateCode: 'SP', latitude: -21.2089, longitude: -50.4328 },
    { id: 'sp-presidente-prudente', name: 'Presidente Prudente', state: 'São Paulo', stateCode: 'SP', latitude: -22.1207, longitude: -51.3882 },
  ],
  'MG': [
    { id: 'mg-belo-horizonte', name: 'Belo Horizonte', state: 'Minas Gerais', stateCode: 'MG', latitude: -19.9167, longitude: -43.9345 },
    { id: 'mg-uberlandia', name: 'Uberlândia', state: 'Minas Gerais', stateCode: 'MG', latitude: -18.9186, longitude: -48.2772 },
    { id: 'mg-uberaba', name: 'Uberaba', state: 'Minas Gerais', stateCode: 'MG', latitude: -19.7486, longitude: -47.9319 },
    { id: 'mg-patos-minas', name: 'Patos de Minas', state: 'Minas Gerais', stateCode: 'MG', latitude: -18.5789, longitude: -46.5181 },
    { id: 'mg-patrocinio', name: 'Patrocínio', state: 'Minas Gerais', stateCode: 'MG', latitude: -18.9442, longitude: -46.9928 },
    { id: 'mg-lavras', name: 'Lavras', state: 'Minas Gerais', stateCode: 'MG', latitude: -21.2453, longitude: -45.0008 },
  ],
  'PR': [
    { id: 'pr-curitiba', name: 'Curitiba', state: 'Paraná', stateCode: 'PR', latitude: -25.4290, longitude: -49.2671 },
    { id: 'pr-londrina', name: 'Londrina', state: 'Paraná', stateCode: 'PR', latitude: -23.3103, longitude: -51.1628 },
    { id: 'pr-maringa', name: 'Maringá', state: 'Paraná', stateCode: 'PR', latitude: -23.4273, longitude: -51.9375 },
    { id: 'pr-cascavel', name: 'Cascavel', state: 'Paraná', stateCode: 'PR', latitude: -24.9578, longitude: -53.4595 },
    { id: 'pr-ponta-grossa', name: 'Ponta Grossa', state: 'Paraná', stateCode: 'PR', latitude: -25.0949, longitude: -50.1628 },
    { id: 'pr-toledo', name: 'Toledo', state: 'Paraná', stateCode: 'PR', latitude: -24.7243, longitude: -53.7431 },
  ],
  'RS': [
    { id: 'rs-porto-alegre', name: 'Porto Alegre', state: 'Rio Grande do Sul', stateCode: 'RS', latitude: -30.0346, longitude: -51.2177 },
    { id: 'rs-passo-fundo', name: 'Passo Fundo', state: 'Rio Grande do Sul', stateCode: 'RS', latitude: -28.2576, longitude: -52.4091 },
    { id: 'rs-santa-maria', name: 'Santa Maria', state: 'Rio Grande do Sul', stateCode: 'RS', latitude: -29.6842, longitude: -53.8069 },
    { id: 'rs-bage', name: 'Bagé', state: 'Rio Grande do Sul', stateCode: 'RS', latitude: -31.3311, longitude: -54.1069 },
    { id: 'rs-pelotas', name: 'Pelotas', state: 'Rio Grande do Sul', stateCode: 'RS', latitude: -31.7654, longitude: -52.3376 },
  ],
  'SC': [
    { id: 'sc-florianopolis', name: 'Florianópolis', state: 'Santa Catarina', stateCode: 'SC', latitude: -27.5954, longitude: -48.5480 },
    { id: 'sc-chapeco', name: 'Chapecó', state: 'Santa Catarina', stateCode: 'SC', latitude: -27.1004, longitude: -52.6152 },
    { id: 'sc-joinville', name: 'Joinville', state: 'Santa Catarina', stateCode: 'SC', latitude: -26.3045, longitude: -48.8487 },
    { id: 'sc-lages', name: 'Lages', state: 'Santa Catarina', stateCode: 'SC', latitude: -27.8157, longitude: -50.3269 },
  ],
  'BA': [
    { id: 'ba-salvador', name: 'Salvador', state: 'Bahia', stateCode: 'BA', latitude: -12.9714, longitude: -38.5014 },
    { id: 'ba-barreiras', name: 'Barreiras', state: 'Bahia', stateCode: 'BA', latitude: -12.1528, longitude: -44.9900 },
    { id: 'ba-luis-eduardo-magalhaes', name: 'Luís Eduardo Magalhães', state: 'Bahia', stateCode: 'BA', latitude: -12.0931, longitude: -45.7853 },
    { id: 'ba-feira-santana', name: 'Feira de Santana', state: 'Bahia', stateCode: 'BA', latitude: -12.2669, longitude: -38.9667 },
  ],
  'TO': [
    { id: 'to-palmas', name: 'Palmas', state: 'Tocantins', stateCode: 'TO', latitude: -10.2491, longitude: -48.3243 },
    { id: 'to-araguaina', name: 'Araguaína', state: 'Tocantins', stateCode: 'TO', latitude: -7.1908, longitude: -48.2074 },
    { id: 'to-gurupi', name: 'Gurupi', state: 'Tocantins', stateCode: 'TO', latitude: -11.7279, longitude: -49.0683 },
  ],
  'PI': [
    { id: 'pi-teresina', name: 'Teresina', state: 'Piauí', stateCode: 'PI', latitude: -5.0920, longitude: -42.8038 },
    { id: 'pi-uruçui', name: 'Uruçuí', state: 'Piauí', stateCode: 'PI', latitude: -7.2297, longitude: -44.5561 },
    { id: 'pi-bom-jesus', name: 'Bom Jesus', state: 'Piauí', stateCode: 'PI', latitude: -9.0747, longitude: -44.3586 },
  ],
  'MA': [
    { id: 'ma-sao-luis', name: 'São Luís', state: 'Maranhão', stateCode: 'MA', latitude: -2.5307, longitude: -44.3068 },
    { id: 'ma-balsas', name: 'Balsas', state: 'Maranhão', stateCode: 'MA', latitude: -7.5325, longitude: -46.0356 },
    { id: 'ma-imperatriz', name: 'Imperatriz', state: 'Maranhão', stateCode: 'MA', latitude: -5.5188, longitude: -47.4777 },
  ],
  'PA': [
    { id: 'pa-belem', name: 'Belém', state: 'Pará', stateCode: 'PA', latitude: -1.4558, longitude: -48.4902 },
    { id: 'pa-paragominas', name: 'Paragominas', state: 'Pará', stateCode: 'PA', latitude: -2.9664, longitude: -47.3522 },
    { id: 'pa-maraba', name: 'Marabá', state: 'Pará', stateCode: 'PA', latitude: -5.3687, longitude: -49.1178 },
    { id: 'pa-santarem', name: 'Santarém', state: 'Pará', stateCode: 'PA', latitude: -2.4431, longitude: -54.7083 },
  ],
  'RO': [
    { id: 'ro-porto-velho', name: 'Porto Velho', state: 'Rondônia', stateCode: 'RO', latitude: -8.7612, longitude: -63.9039 },
    { id: 'ro-ji-parana', name: 'Ji-Paraná', state: 'Rondônia', stateCode: 'RO', latitude: -10.8853, longitude: -61.9517 },
    { id: 'ro-vilhena', name: 'Vilhena', state: 'Rondônia', stateCode: 'RO', latitude: -12.7403, longitude: -60.1429 },
  ],
  'RJ': [
    { id: 'rj-rio-janeiro', name: 'Rio de Janeiro', state: 'Rio de Janeiro', stateCode: 'RJ', latitude: -22.9068, longitude: -43.1729 },
    { id: 'rj-campos-goytacazes', name: 'Campos dos Goytacazes', state: 'Rio de Janeiro', stateCode: 'RJ', latitude: -21.7545, longitude: -41.3244 },
  ],
  'DF': [
    { id: 'df-brasilia', name: 'Brasília', state: 'Distrito Federal', stateCode: 'DF', latitude: -15.7801, longitude: -47.9292 },
  ],
  'CE': [
    { id: 'ce-fortaleza', name: 'Fortaleza', state: 'Ceará', stateCode: 'CE', latitude: -3.7172, longitude: -38.5433 },
    { id: 'ce-sobral', name: 'Sobral', state: 'Ceará', stateCode: 'CE', latitude: -3.6861, longitude: -40.3517 },
  ],
  'PE': [
    { id: 'pe-recife', name: 'Recife', state: 'Pernambuco', stateCode: 'PE', latitude: -8.0476, longitude: -34.8770 },
    { id: 'pe-petrolina', name: 'Petrolina', state: 'Pernambuco', stateCode: 'PE', latitude: -9.3891, longitude: -40.5028 },
  ],
  'AL': [
    { id: 'al-maceio', name: 'Maceió', state: 'Alagoas', stateCode: 'AL', latitude: -9.6658, longitude: -35.7353 },
  ],
  'SE': [
    { id: 'se-aracaju', name: 'Aracaju', state: 'Sergipe', stateCode: 'SE', latitude: -10.9472, longitude: -37.0731 },
  ],
  'PB': [
    { id: 'pb-joao-pessoa', name: 'João Pessoa', state: 'Paraíba', stateCode: 'PB', latitude: -7.1195, longitude: -34.8450 },
  ],
  'RN': [
    { id: 'rn-natal', name: 'Natal', state: 'Rio Grande do Norte', stateCode: 'RN', latitude: -5.7945, longitude: -35.2110 },
    { id: 'rn-mossoro', name: 'Mossoró', state: 'Rio Grande do Norte', stateCode: 'RN', latitude: -5.1878, longitude: -37.3442 },
  ],
  'ES': [
    { id: 'es-vitoria', name: 'Vitória', state: 'Espírito Santo', stateCode: 'ES', latitude: -20.3155, longitude: -40.3128 },
    { id: 'es-linhares', name: 'Linhares', state: 'Espírito Santo', stateCode: 'ES', latitude: -19.3948, longitude: -40.0720 },
  ],
  'AM': [
    { id: 'am-manaus', name: 'Manaus', state: 'Amazonas', stateCode: 'AM', latitude: -3.1190, longitude: -60.0217 },
  ],
  'AC': [
    { id: 'ac-rio-branco', name: 'Rio Branco', state: 'Acre', stateCode: 'AC', latitude: -9.9747, longitude: -67.8107 },
  ],
  'AP': [
    { id: 'ap-macapa', name: 'Macapá', state: 'Amapá', stateCode: 'AP', latitude: 0.0349, longitude: -51.0694 },
  ],
  'RR': [
    { id: 'rr-boa-vista', name: 'Boa Vista', state: 'Roraima', stateCode: 'RR', latitude: 2.8235, longitude: -60.6758 },
  ],
};

// =============================================================================
// 🔍 FUNÇÕES DE BUSCA
// =============================================================================

/**
 * Busca cidades por estado
 */
export function getCitiesByState(stateCode: string): City[] {
  return MAJOR_CITIES_BY_STATE[stateCode] || [];
}

/**
 * Busca cidades por nome (autocomplete)
 */
export function searchCities(query: string, stateCode?: string): City[] {
  const normalizedQuery = query.toLowerCase().trim();
  
  if (normalizedQuery.length < 2) return [];
  
  let allCities: City[] = [];
  
  if (stateCode) {
    allCities = MAJOR_CITIES_BY_STATE[stateCode] || [];
  } else {
    allCities = Object.values(MAJOR_CITIES_BY_STATE).flat();
  }
  
  return allCities
    .filter(city => 
      city.name.toLowerCase().includes(normalizedQuery) ||
      city.state.toLowerCase().includes(normalizedQuery)
    )
    .sort((a, b) => {
      // Prioriza cidades que começam com a query
      const aStartsWith = a.name.toLowerCase().startsWith(normalizedQuery);
      const bStartsWith = b.name.toLowerCase().startsWith(normalizedQuery);
      
      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;
      
      return a.name.localeCompare(b.name);
    })
    .slice(0, 10); // Limita a 10 resultados
}

/**
 * Busca cidade por coordenadas (reverse geocoding)
 */
export function findNearestCity(latitude: number, longitude: number): City | null {
  const allCities = Object.values(MAJOR_CITIES_BY_STATE).flat();
  
  let nearestCity: City | null = null;
  let minDistance = Infinity;
  
  for (const city of allCities) {
    const distance = calculateDistance(latitude, longitude, city.latitude, city.longitude);
    
    if (distance < minDistance) {
      minDistance = distance;
      nearestCity = city;
    }
  }
  
  // Retorna apenas se a cidade mais próxima estiver dentro de 100km
  if (minDistance <= 100) {
    return nearestCity;
  }
  
  return null;
}

/**
 * Calcula distância entre duas coordenadas (Haversine)
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Raio da Terra em km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

// =============================================================================
// 📍 FUNÇÕES DE LOCALIZAÇÃO GPS
// =============================================================================

/**
 * Solicita permissão de localização
 */
export async function requestLocationPermission(): Promise<boolean> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Erro ao solicitar permissão de localização:', error);
    return false;
  }
}

/**
 * Verifica se a permissão de localização foi concedida
 */
export async function checkLocationPermission(): Promise<boolean> {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Erro ao verificar permissão de localização:', error);
    return false;
  }
}

/**
 * Obtém a localização atual do usuário
 */
export async function getCurrentLocation(): Promise<LocationResult> {
  try {
    const hasPermission = await checkLocationPermission();
    
    if (!hasPermission) {
      const granted = await requestLocationPermission();
      if (!granted) {
        return {
          success: false,
          error: 'Permissão de localização negada',
        };
      }
    }
    
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    
    const { latitude, longitude } = location.coords;
    
    // Tenta encontrar a cidade mais próxima
    const nearestCity = findNearestCity(latitude, longitude);
    
    if (nearestCity) {
      return {
        success: true,
        city: nearestCity.name,
        state: nearestCity.state,
        stateCode: nearestCity.stateCode,
        latitude,
        longitude,
      };
    }
    
    // Se não encontrou cidade próxima, usa reverse geocoding do Expo
    try {
      const [geocoded] = await Location.reverseGeocodeAsync({ latitude, longitude });
      
      if (geocoded) {
        return {
          success: true,
          city: geocoded.city || geocoded.subregion || 'Cidade não identificada',
          state: geocoded.region || '',
          stateCode: geocoded.isoCountryCode === 'BR' ? (geocoded.region?.substring(0, 2).toUpperCase() || '') : '',
          latitude,
          longitude,
        };
      }
    } catch (geoError) {
      console.warn('Erro no reverse geocoding:', geoError);
    }
    
    return {
      success: true,
      city: 'Localização obtida',
      state: '',
      stateCode: '',
      latitude,
      longitude,
    };
    
  } catch (error: any) {
    console.error('Erro ao obter localização:', error);
    return {
      success: false,
      error: error.message || 'Erro ao obter localização',
    };
  }
}

/**
 * Obtém o estado a partir do código
 */
export function getStateByCode(code: string): StateData | undefined {
  return BRAZILIAN_STATES.find(s => s.code === code.toUpperCase());
}

/**
 * Obtém todos os estados de uma região
 */
export function getStatesByRegion(region: string): StateData[] {
  return BRAZILIAN_STATES.filter(s => s.region === region);
}

// =============================================================================
// 🎯 EXPORTS
// =============================================================================

export default {
  BRAZILIAN_STATES,
  MAJOR_CITIES_BY_STATE,
  getCitiesByState,
  searchCities,
  findNearestCity,
  requestLocationPermission,
  checkLocationPermission,
  getCurrentLocation,
  getStateByCode,
  getStatesByRegion,
};
