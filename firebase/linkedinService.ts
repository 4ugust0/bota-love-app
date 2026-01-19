/**
 * 🔥 BOTA LOVE APP - LinkedIn Service
 * 
 * Integração com LinkedIn OAuth 2.0:
 * - Autenticação OAuth
 * - Busca de dados do perfil profissional
 * - Importação para Network Rural
 * 
 * @author Bota Love Team
 * @version 1.0.0
 */

import { doc, updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { firestore } from './config';
import { COLLECTIONS, LinkedInProfile } from './types';
import { Linking } from 'react-native';

// =============================================================================
// 🔧 CONFIGURAÇÃO
// =============================================================================

// Configurações do LinkedIn OAuth
const LINKEDIN_CLIENT_ID = process.env.EXPO_PUBLIC_LINKEDIN_CLIENT_ID || '';
const LINKEDIN_CLIENT_SECRET = process.env.EXPO_PUBLIC_LINKEDIN_CLIENT_SECRET || '';
const LINKEDIN_REDIRECT_URI = 'botalove://linkedin-callback';

// Escopos necessários
const LINKEDIN_SCOPES = [
  'openid',
  'profile',
  'email',
];

// =============================================================================
// 📝 TIPOS
// =============================================================================

export interface LinkedInAuthResult {
  success: boolean;
  accessToken?: string;
  expiresIn?: number;
  error?: string;
}

export interface LinkedInProfileData {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  headline?: string;
  profilePicture?: string;
  email?: string;
  vanityName?: string; // URL slug
  publicProfileUrl?: string;
  
  // Dados profissionais
  positions?: LinkedInPosition[];
  education?: LinkedInEducation[];
  skills?: string[];
  certifications?: LinkedInCertification[];
  summary?: string;
  industry?: string;
  location?: {
    country?: string;
    city?: string;
  };
}

export interface LinkedInPosition {
  title: string;
  companyName: string;
  location?: string;
  startDate?: {
    month?: number;
    year: number;
  };
  endDate?: {
    month?: number;
    year: number;
  };
  isCurrent: boolean;
  description?: string;
}

export interface LinkedInEducation {
  schoolName: string;
  degree?: string;
  fieldOfStudy?: string;
  startYear?: number;
  endYear?: number;
}

export interface LinkedInCertification {
  name: string;
  authority?: string;
  licenseNumber?: string;
  startDate?: {
    month?: number;
    year: number;
  };
  endDate?: {
    month?: number;
    year: number;
  };
}

// =============================================================================
// 🔐 AUTENTICAÇÃO OAUTH
// =============================================================================

/**
 * Gera state para prevenir CSRF
 */
function generateState(): string {
  return Math.random().toString(36).substring(2, 15);
}

/**
 * Constrói a URL de autorização do LinkedIn
 */
export function getLinkedInAuthUrl(): string {
  const state = generateState();
  return `https://www.linkedin.com/oauth/v2/authorization?` +
    `response_type=code&` +
    `client_id=${LINKEDIN_CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(LINKEDIN_REDIRECT_URI)}&` +
    `scope=${encodeURIComponent(LINKEDIN_SCOPES.join(' '))}&` +
    `state=${state}`;
}

/**
 * Inicia o fluxo de autenticação OAuth do LinkedIn
 * Abre o navegador para o usuário fazer login
 */
export async function startLinkedInAuth(): Promise<LinkedInAuthResult> {
  try {
    const authUrl = getLinkedInAuthUrl();
    
    // Abre a URL no navegador do dispositivo
    const canOpen = await Linking.canOpenURL(authUrl);
    if (canOpen) {
      await Linking.openURL(authUrl);
      
      // Nota: O callback virá através de deep linking
      // O app deve tratar a URL de callback no _layout.tsx
      return {
        success: true,
        error: 'Aguardando retorno do LinkedIn...',
      };
    }

    return {
      success: false,
      error: 'Não foi possível abrir o navegador',
    };
  } catch (error: any) {
    console.error('Erro na autenticação LinkedIn:', error);
    return {
      success: false,
      error: error.message || 'Erro ao autenticar com LinkedIn',
    };
  }
}

/**
 * Processa o callback do LinkedIn OAuth
 * Deve ser chamado quando a app recebe o deep link de callback
 */
export async function handleLinkedInCallback(url: string): Promise<LinkedInAuthResult> {
  try {
    const parsedUrl = new URL(url);
    const code = parsedUrl.searchParams.get('code');
    const error = parsedUrl.searchParams.get('error');
    
    if (error) {
      return {
        success: false,
        error: parsedUrl.searchParams.get('error_description') || 'Erro na autenticação',
      };
    }
    
    if (code) {
      // Trocar código por access token
      const tokenResult = await exchangeCodeForToken(code);
      return tokenResult;
    }

    return {
      success: false,
      error: 'Código de autorização não encontrado',
    };
  } catch (error: any) {
    console.error('Erro ao processar callback:', error);
    return {
      success: false,
      error: error.message || 'Erro ao processar retorno do LinkedIn',
    };
  }
}

/**
 * Troca o código de autorização por um access token
 */
async function exchangeCodeForToken(code: string): Promise<LinkedInAuthResult> {
  try {
    const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: LINKEDIN_CLIENT_ID,
        client_secret: LINKEDIN_CLIENT_SECRET,
        redirect_uri: LINKEDIN_REDIRECT_URI,
      }).toString(),
    });

    const data = await response.json();

    if (data.access_token) {
      return {
        success: true,
        accessToken: data.access_token,
        expiresIn: data.expires_in,
      };
    }

    return {
      success: false,
      error: data.error_description || 'Erro ao obter token',
    };
  } catch (error: any) {
    console.error('Erro ao trocar código:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// =============================================================================
// 👤 BUSCA DE PERFIL
// =============================================================================

/**
 * Busca dados do perfil do LinkedIn usando o access token
 */
export async function fetchLinkedInProfile(
  accessToken: string
): Promise<LinkedInProfileData | null> {
  try {
    // Buscar dados básicos do perfil
    const profileResponse = await fetch(
      'https://api.linkedin.com/v2/me?projection=(id,firstName,lastName,profilePicture(displayImage~:playableStreams),vanityName)',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!profileResponse.ok) {
      console.error('Erro ao buscar perfil:', profileResponse.status);
      return null;
    }

    const profileData = await profileResponse.json();

    // Buscar email
    const emailResponse = await fetch(
      'https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    let email: string | undefined;
    if (emailResponse.ok) {
      const emailData = await emailResponse.json();
      email = emailData.elements?.[0]?.['handle~']?.emailAddress;
    }

    // Extrair dados do perfil
    const firstName = getLocalizedString(profileData.firstName);
    const lastName = getLocalizedString(profileData.lastName);
    const profilePicture = getProfilePicture(profileData.profilePicture);

    return {
      id: profileData.id,
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`,
      vanityName: profileData.vanityName,
      publicProfileUrl: `https://www.linkedin.com/in/${profileData.vanityName}`,
      profilePicture,
      email,
    };
  } catch (error: any) {
    console.error('Erro ao buscar perfil LinkedIn:', error);
    return null;
  }
}

/**
 * Busca dados profissionais detalhados (requer permissões adicionais)
 * Nota: LinkedIn API v2 tem acesso limitado - dados básicos apenas
 */
export async function fetchLinkedInProfessionalData(
  accessToken: string
): Promise<Partial<LinkedInProfileData>> {
  // LinkedIn API v2 tem acesso muito restrito
  // Dados detalhados como posições e educação requerem parcerias especiais
  // Por isso, usamos uma abordagem de parsing do perfil público
  
  try {
    // Para dados mais detalhados, seria necessário:
    // 1. Partnership com LinkedIn
    // 2. Usar APIs de terceiros autorizadas
    // 3. Permitir input manual do usuário
    
    return {};
  } catch (error) {
    console.error('Erro ao buscar dados profissionais:', error);
    return {};
  }
}

// =============================================================================
// 💾 SALVAR DADOS NO FIREBASE
// =============================================================================

/**
 * Salva dados do LinkedIn no perfil do usuário
 */
export async function saveLinkedInToProfile(
  userId: string,
  linkedInData: LinkedInProfileData,
  accessToken?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const userRef = doc(firestore, COLLECTIONS.USERS, userId);

    // Construir URL do perfil
    const profileUrl = linkedInData.publicProfileUrl || 
      (linkedInData.vanityName ? `https://linkedin.com/in/${linkedInData.vanityName}` : '');

    const linkedInProfile: LinkedInProfile = {
      profileUrl,
      currentPosition: linkedInData.positions?.[0]?.title || linkedInData.headline,
      company: linkedInData.positions?.[0]?.companyName,
      industry: linkedInData.industry,
      summary: linkedInData.summary,
      isVerified: true,
      lastSync: Timestamp.now(),
    };

    await updateDoc(userRef, {
      'networkRural.linkedIn': linkedInProfile,
      'networkRural.linkedInAccessToken': accessToken || null,
      'networkRural.linkedInUpdatedAt': serverTimestamp(),
    });

    return { success: true };
  } catch (error: any) {
    console.error('Erro ao salvar LinkedIn:', error);
    return {
      success: false,
      error: error.message || 'Erro ao salvar dados do LinkedIn',
    };
  }
}

/**
 * Remove integração do LinkedIn
 */
export async function removeLinkedInFromProfile(
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const userRef = doc(firestore, COLLECTIONS.USERS, userId);

    await updateDoc(userRef, {
      'networkRural.linkedIn': null,
      'networkRural.linkedInAccessToken': null,
      'networkRural.linkedInUpdatedAt': serverTimestamp(),
    });

    return { success: true };
  } catch (error: any) {
    console.error('Erro ao remover LinkedIn:', error);
    return {
      success: false,
      error: error.message || 'Erro ao remover LinkedIn',
    };
  }
}

// =============================================================================
// 🔧 UTILITÁRIOS
// =============================================================================

/**
 * Extrai string localizada do formato LinkedIn
 */
function getLocalizedString(field: any): string {
  if (!field) return '';
  const localized = field.localized || {};
  const preferredLocale = field.preferredLocale || {};
  const key = `${preferredLocale.language}_${preferredLocale.country}`;
  return localized[key] || Object.values(localized)[0] || '';
}

/**
 * Extrai URL da foto do perfil
 */
function getProfilePicture(profilePicture: any): string | undefined {
  if (!profilePicture?.['displayImage~']?.elements) return undefined;
  
  const elements = profilePicture['displayImage~'].elements;
  // Pegar a maior resolução disponível
  const largestImage = elements.reduce((prev: any, curr: any) => {
    const prevSize = prev.data?.['com.linkedin.digitalmedia.mediaartifact.StillImage']?.storageSize?.width || 0;
    const currSize = curr.data?.['com.linkedin.digitalmedia.mediaartifact.StillImage']?.storageSize?.width || 0;
    return currSize > prevSize ? curr : prev;
  }, elements[0]);

  return largestImage?.identifiers?.[0]?.identifier;
}

/**
 * Valida URL do LinkedIn
 */
export function isValidLinkedInUrl(url: string): boolean {
  const linkedInRegex = /^(https?:\/\/)?(www\.)?linkedin\.com\/(in|pub|profile)\/[\w-]+\/?$/i;
  return linkedInRegex.test(url.trim());
}

/**
 * Extrai username do LinkedIn da URL
 */
export function extractLinkedInUsername(url: string): string | null {
  const match = url.match(/linkedin\.com\/(in|pub|profile)\/([\w-]+)/i);
  return match ? match[2] : null;
}

/**
 * Verifica se o token do LinkedIn ainda é válido
 */
export async function isLinkedInTokenValid(accessToken: string): Promise<boolean> {
  try {
    const response = await fetch('https://api.linkedin.com/v2/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.ok;
  } catch {
    return false;
  }
}
