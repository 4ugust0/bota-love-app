/**
 * 🔥 BOTA LOVE APP - Firebase Auth Service
 * 
 * Serviço de autenticação completo com:
 * - Registro com verificação de email
 * - Login/Logout
 * - Recuperação de senha
 * - Gerenciamento de sessão
 * 
 * @author Bota Love Team
 */

import {
    createUserWithEmailAndPassword,
    EmailAuthProvider,
    User as FirebaseAuthUser,
    onAuthStateChanged,
    reauthenticateWithCredential,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    signOut,
    updatePassword
} from 'firebase/auth';
import {
    doc,
    getDoc,
    serverTimestamp,
    setDoc,
    Timestamp,
    updateDoc,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { auth, firestore, functions } from './config';
import {
    COLLECTIONS,
    DiscoverySettings,
    FirebaseUser,
    NetworkRuralData,
    NotificationSettings,
    SubscriptionStatus,
    UserProfile,
    UserStats,
    UserSubscription,
} from './types';

// =============================================================================
// 📝 TIPOS
// =============================================================================

export type UserTypeAuth = 'agro' | 'simpatizante' | 'produtor';

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  birthDate?: Date;
  gender?: 'male' | 'female' | 'non_binary' | 'other';
  isAgroUser?: boolean;
  userType?: UserTypeAuth;
}

export interface LoginResult {
  success: boolean;
  user?: FirebaseUser;
  error?: string;
  requiresVerification?: boolean;
}

export interface AuthError {
  code: string;
  message: string;
}

// =============================================================================
// 🔐 FUNÇÕES DE AUTENTICAÇÃO
// =============================================================================

/**
 * Registra um novo usuário
 * 
 * IMPORTANTE: O email já foi verificado antes (na tela signup-verify-email)
 * usando a Cloud Function verifyEmailCode. Aqui só criamos a conta.
 */
export async function registerUser(data: RegisterData): Promise<LoginResult> {
  try {
    // 1. Criar usuário no Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      data.email,
      data.password
    );

    const uid = userCredential.user.uid;

    // 2. Criar documento do usuário no Firestore
    // Email já foi verificado no fluxo anterior, então emailVerified = true
    const userData = createInitialUserData(uid, data, null, null);
    
    // Marcar email como verificado já que passou pela verificação
    userData.emailVerified = true;
    userData.status = 'active';
    
    await setDoc(doc(firestore, COLLECTIONS.USERS, uid), userData);

    // 3. Marcar verificação de email como usada (opcional - para auditoria)
    try {
      const emailKey = data.email.toLowerCase().trim();
      const verificationRef = doc(firestore, 'email_verifications', emailKey);
      await updateDoc(verificationRef, {
        usedForRegistration: true,
        registeredUserId: uid,
        registeredAt: serverTimestamp(),
      });
    } catch (e) {
      // Não é crítico se falhar
      console.log('Não foi possível atualizar registro de verificação:', e);
    }

    return {
      success: true,
      user: { ...userData, id: uid } as FirebaseUser,
      requiresVerification: false, // Já verificado!
    };
  } catch (error: any) {
    console.error('Erro ao registrar usuário:', error);
    return {
      success: false,
      error: getAuthErrorMessage(error.code),
    };
  }
}

/**
 * Verifica o código de email
 */
export async function verifyEmailCode(userId: string, code: string): Promise<{ success: boolean; error?: string }> {
  try {
    const userRef = doc(firestore, COLLECTIONS.USERS, userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return { success: false, error: 'Usuário não encontrado' };
    }

    const userData = userSnap.data() as FirebaseUser;

    // Verificar código
    if (userData.verificationCode !== code) {
      return { success: false, error: 'Código inválido' };
    }

    // Verificar expiração
    const expiry = userData.verificationCodeExpiry?.toDate();
    if (expiry && new Date() > expiry) {
      return { success: false, error: 'Código expirado. Solicite um novo.' };
    }

    // Atualizar status do usuário
    await updateDoc(userRef, {
      emailVerified: true,
      status: 'active',
      verificationCode: null,
      verificationCodeExpiry: null,
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error: any) {
    console.error('Erro ao verificar código:', error);
    return { success: false, error: 'Erro ao verificar código' };
  }
}

/**
 * Reenviar código de verificação
 */
export async function resendVerificationCode(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const userRef = doc(firestore, COLLECTIONS.USERS, userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return { success: false, error: 'Usuário não encontrado' };
    }

    const userData = userSnap.data() as FirebaseUser;

    // Gerar novo código
    const verificationCode = generateVerificationCode();
    const verificationExpiry = new Date();
    verificationExpiry.setMinutes(verificationExpiry.getMinutes() + 30);

    // Atualizar usuário
    await updateDoc(userRef, {
      verificationCode,
      verificationCodeExpiry: Timestamp.fromDate(verificationExpiry),
      updatedAt: serverTimestamp(),
    });

    // Enviar email
    const sendVerificationEmail = httpsCallable(functions, 'sendVerificationEmail');
    await sendVerificationEmail({
      userId,
      email: userData.email,
      name: userData.profile.name,
      code: verificationCode,
    });

    return { success: true };
  } catch (error: any) {
    console.error('Erro ao reenviar código:', error);
    return { success: false, error: 'Erro ao reenviar código' };
  }
}

/**
 * Login com email e senha
 */
export async function loginUser(email: string, password: string): Promise<LoginResult> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    // Buscar dados do usuário no Firestore
    const userRef = doc(firestore, COLLECTIONS.USERS, uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return { success: false, error: 'Dados do usuário não encontrados' };
    }

    const userData = userSnap.data() as FirebaseUser;

    // Verificar se email foi confirmado
    if (!userData.emailVerified) {
      return {
        success: false,
        requiresVerification: true,
        user: { ...userData, id: uid },
        error: 'Por favor, confirme seu email antes de continuar',
      };
    }

    // Verificar status da conta
    if (userData.status === 'suspended') {
      await signOut(auth);
      return { success: false, error: 'Conta suspensa. Entre em contato com o suporte.' };
    }

    // Chamar Cloud Function para verificações de login
    // (assinaturas expiradas, trial expirando, chats inativos, limpeza de dados)
    try {
      const onUserLogin = httpsCallable(functions, 'onUserLogin');
      const loginCheckResult = await onUserLogin({ userId: uid });
      console.log('Login check result:', loginCheckResult.data);
      
      // Os dados atualizados podem incluir notificações sobre:
      // - Assinatura expirada
      // - Trial expirando
      // - Chats inativos
    } catch (loginCheckError) {
      // Não bloquear o login se a verificação falhar
      console.warn('Erro na verificação de login (não crítico):', loginCheckError);
    }

    // Buscar dados atualizados do usuário após as verificações
    const updatedUserSnap = await getDoc(userRef);
    const updatedUserData = updatedUserSnap.exists() 
      ? updatedUserSnap.data() as FirebaseUser 
      : userData;

    return {
      success: true,
      user: { ...updatedUserData, id: uid },
    };
  } catch (error: any) {
    console.error('Erro ao fazer login:', error);
    
    // Garantir que o usuário seja deslogado em caso de erro
    try {
      await signOut(auth);
    } catch (signOutError) {
      console.error('Erro ao fazer signOut após falha no login:', signOutError);
    }
    
    return {
      success: false,
      error: getAuthErrorMessage(error.code),
    };
  }
}

/**
 * Logout
 */
export async function logoutUser(): Promise<void> {
  try {
    const currentUser = auth.currentUser;
    if (currentUser) {
      // Atualizar última atividade antes de sair
      const userRef = doc(firestore, COLLECTIONS.USERS, currentUser.uid);
      await updateDoc(userRef, {
        lastActive: serverTimestamp(),
      });
    }
    await signOut(auth);
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
    throw error;
  }
}

/**
 * Recuperar senha
 */
export async function resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error: any) {
    console.error('Erro ao enviar email de recuperação:', error);
    return {
      success: false,
      error: getAuthErrorMessage(error.code),
    };
  }
}

/**
 * Alterar senha
 */
export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = auth.currentUser;
    if (!user || !user.email) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    // Reautenticar usuário
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);

    // Alterar senha
    await updatePassword(user, newPassword);

    return { success: true };
  } catch (error: any) {
    console.error('Erro ao alterar senha:', error);
    return {
      success: false,
      error: getAuthErrorMessage(error.code),
    };
  }
}

/**
 * Observador de estado de autenticação
 */
export function onAuthStateChange(
  callback: (user: FirebaseAuthUser | null, userData: FirebaseUser | null) => void
): () => void {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      try {
        const userRef = doc(firestore, COLLECTIONS.USERS, firebaseUser.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const userData = { ...userSnap.data(), id: firebaseUser.uid } as FirebaseUser;
          callback(firebaseUser, userData);
        } else {
          callback(firebaseUser, null);
        }
      } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error);
        callback(firebaseUser, null);
      }
    } else {
      callback(null, null);
    }
  });
}

/**
 * Obter usuário atual
 */
export function getCurrentAuthUser(): FirebaseAuthUser | null {
  return auth.currentUser;
}

/**
 * Obter ID do usuário atual
 */
export function getCurrentUserId(): string | null {
  return auth.currentUser?.uid || null;
}

// =============================================================================
// 🛠️ FUNÇÕES AUXILIARES
// =============================================================================

/**
 * Gera código de verificação de 6 dígitos
 */
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Cria dados iniciais do usuário
 */
function createInitialUserData(
  uid: string,
  data: RegisterData,
  verificationCode: string | null,
  verificationExpiry: Date | null
): Omit<FirebaseUser, 'id'> {
  const now = Timestamp.now();
  
  // Calcular idade se birthDate existir
  let age = 18; // Default
  let birthTimestamp: Timestamp | null = null;
  
  if (data.birthDate) {
    birthTimestamp = Timestamp.fromDate(data.birthDate);
    const today = new Date();
    const birth = data.birthDate;
    age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
  }

  const profile: UserProfile = {
    name: data.name,
    birthDate: birthTimestamp,
    age,
    gender: data.gender || 'other',
    genderPreference: 'all',
    bio: '',
    photos: [],
    city: '',
    state: '',
    occupation: '',
    interests: [],
    relationshipGoals: [],
    isAgroUser: data.isAgroUser ?? false,
    agroAreas: [],
  };

  const subscription: UserSubscription = {
    status: 'none' as SubscriptionStatus,
    plan: 'free',
    startDate: null,
    endDate: null,
    trialEndDate: null,
    autoRenew: false,
    lastPaymentId: null,
  };

  const networkRural: NetworkRuralData = {
    isActive: false,
    subscription: {
      status: 'none' as SubscriptionStatus,
      plan: null,
      startDate: null,
      endDate: null,
      trialEndDate: null,
    },
    goals: [],
    lookingFor: [],
  };

  const notificationSettings: NotificationSettings = {
    pushEnabled: true,
    matchNotifications: true,
    messageNotifications: true,
    likeNotifications: true,
    marketingNotifications: false,
    emailNotifications: true,
  };

  const discoverySettings: DiscoverySettings = {
    showMe: true,
    ageRange: { min: 18, max: 50 },
    distanceRadius: 100,
    onlyVerified: false,
    onlyWithPhotos: true,
    // Localização (será preenchida depois)
    state: '',
    city: '',
    showOutsideDistance: false,
    showOutsideAgeRange: false,
    // Interesse
    genderInterest: 'both',
    // Filtros avançados - Correspondentes ao Perfil (vazios por padrão)
    selectedInterests: [],
    selectedProfessions: [],
    selectedRuralActivities: [],
    selectedPropertySize: [],
    selectedAnimals: [],
    selectedCrops: [],
    selectedMusicalStyles: [],
    selectedHobbies: [],
    selectedPets: [],
    selectedEducation: [],
    selectedChildren: [],
  };

  const stats: UserStats = {
    totalLikes: 0,
    totalMatches: 0,
    totalMessages: 0,
    profileViews: 0,
    superLikesReceived: 0,
  };

  // Construir objeto base
  const userData: Record<string, any> = {
    email: data.email,
    emailVerified: false,
    userType: data.userType || 'simpatizante',
    profile,
    status: 'pending',
    createdAt: now,
    updatedAt: now,
    lastActive: now,
    subscription,
    networkRural,
    notificationSettings,
    fcmTokens: [],
    discoverySettings,
    stats,
  };

  // Adicionar campos opcionais apenas se não forem undefined
  if (verificationCode) {
    userData.verificationCode = verificationCode;
  }
  if (verificationExpiry) {
    userData.verificationCodeExpiry = Timestamp.fromDate(verificationExpiry);
  }

  return userData as Omit<FirebaseUser, 'id'>;
}

/**
 * Traduz códigos de erro do Firebase Auth
 */
function getAuthErrorMessage(code: string): string {
  const messages: Record<string, string> = {
    'auth/email-already-in-use': 'Este email já está em uso',
    'auth/invalid-email': 'Email inválido',
    'auth/weak-password': 'A senha deve ter pelo menos 6 caracteres',
    'auth/user-not-found': 'Usuário não encontrado',
    'auth/wrong-password': 'Senha incorreta',
    'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde',
    'auth/user-disabled': 'Conta desativada',
    'auth/network-request-failed': 'Erro de conexão. Verifique sua internet',
    'auth/invalid-credential': 'Credenciais inválidas',
    'auth/requires-recent-login': 'Por favor, faça login novamente',
  };

  return messages[code] || 'Erro desconhecido. Tente novamente.';
}

// =============================================================================
// 📤 EXPORTS
// =============================================================================

export {
    auth,
    FirebaseAuthUser
};

