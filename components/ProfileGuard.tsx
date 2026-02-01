/**
 * 🔥 BOTA LOVE APP - Profile Guard
 * 
 * Componente que verifica se o perfil está completo e bloqueia
 * a navegação caso esteja incompleto, redirecionando para
 * a página de edição de perfil.
 * 
 * @author Bota Love Team
 */

import { BotaLoveColors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { UserProfile } from '@/firebase/types';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Dimensions,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width } = Dimensions.get('window');

// =============================================================================
// 📝 TIPOS
// =============================================================================

interface ProfileGuardProps {
  children: React.ReactNode;
}

interface MissingField {
  key: string;
  label: string;
  priority: number;
}

// =============================================================================
// 🔍 VALIDAÇÃO DE PERFIL
// =============================================================================

/**
 * Lista de campos obrigatórios para o perfil estar completo
 */
const REQUIRED_FIELDS: MissingField[] = [
  { key: 'photos', label: 'Fotos do perfil (mínimo 1)', priority: 1 },
  { key: 'bio', label: 'Biografia', priority: 2 },
  { key: 'birthDate', label: 'Data de nascimento', priority: 3 },
  { key: 'gender', label: 'Gênero', priority: 4 },
  { key: 'genderPreference', label: 'Preferência de gênero', priority: 5 },
  { key: 'city', label: 'Cidade atual', priority: 6 },
  { key: 'state', label: 'Estado', priority: 7 },
  { key: 'lookingForGoals', label: 'O que procura no app', priority: 8 },
  { key: 'nationality', label: 'Nacionalidade', priority: 9 },
  { key: 'livingPreference', label: 'Onde prefere morar', priority: 10 },
  { key: 'ruralValues', label: 'Valores rurais', priority: 11 },
  { key: 'sexualOrientation', label: 'Orientação sexual', priority: 12 },
];

/**
 * Verifica quais campos obrigatórios estão faltando
 */
export function checkMissingFields(profile: UserProfile | undefined): MissingField[] {
  if (!profile) return REQUIRED_FIELDS;

  const missing: MissingField[] = [];

  // Fotos
  if (!profile.photos || profile.photos.length === 0) {
    missing.push(REQUIRED_FIELDS.find(f => f.key === 'photos')!);
  }

  // Bio
  if (!profile.bio || profile.bio.trim().length < 10) {
    missing.push(REQUIRED_FIELDS.find(f => f.key === 'bio')!);
  }

  // Data de nascimento
  if (!profile.birthDate) {
    missing.push(REQUIRED_FIELDS.find(f => f.key === 'birthDate')!);
  }

  // Gênero
  if (!profile.gender) {
    missing.push(REQUIRED_FIELDS.find(f => f.key === 'gender')!);
  }

  // Preferência de gênero
  if (!profile.genderPreference) {
    missing.push(REQUIRED_FIELDS.find(f => f.key === 'genderPreference')!);
  }

  // Cidade
  if (!profile.city || profile.city.trim().length === 0) {
    missing.push(REQUIRED_FIELDS.find(f => f.key === 'city')!);
  }

  // Estado
  if (!profile.state || profile.state.trim().length === 0) {
    missing.push(REQUIRED_FIELDS.find(f => f.key === 'state')!);
  }

  // O que procura (novos campos)
  if (!profile.lookingForGoals || profile.lookingForGoals.length === 0) {
    missing.push(REQUIRED_FIELDS.find(f => f.key === 'lookingForGoals')!);
  }

  // Nacionalidade
  if (!profile.nationality) {
    missing.push(REQUIRED_FIELDS.find(f => f.key === 'nationality')!);
  }

  // Onde prefere morar
  if (!profile.livingPreference) {
    missing.push(REQUIRED_FIELDS.find(f => f.key === 'livingPreference')!);
  }

  // Valores rurais
  if (!profile.ruralValues || profile.ruralValues.length === 0) {
    missing.push(REQUIRED_FIELDS.find(f => f.key === 'ruralValues')!);
  }

  // Orientação sexual
  if (!profile.sexualOrientation) {
    missing.push(REQUIRED_FIELDS.find(f => f.key === 'sexualOrientation')!);
  }

  return missing.filter(Boolean).sort((a, b) => a.priority - b.priority);
}

/**
 * Verifica se o perfil está completo
 */
export function isProfileComplete(profile: UserProfile | undefined): boolean {
  if (!profile) return false;
  
  // Se já foi marcado como completo e tem os campos essenciais
  if (profile.profileCompleted) {
    // Verificação básica
    const hasPhotos = !!(profile.photos && profile.photos.length > 0);
    const hasBio = !!(profile.bio && profile.bio.trim().length >= 10);
    const hasCity = !!(profile.city && profile.city.trim().length > 0);
    
    return hasPhotos && hasBio && hasCity;
  }
  
  return false;
}

// =============================================================================
// 🎯 COMPONENTE PRINCIPAL
// =============================================================================

export default function ProfileGuard({ children }: ProfileGuardProps) {
  const router = useRouter();
  const { currentUser, isAuthenticated, userType } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [missingFields, setMissingFields] = useState<MissingField[]>([]);

  useEffect(() => {
    // Só verifica se o usuário está autenticado e não é produtor
    if (isAuthenticated && currentUser && userType !== 'producer') {
      const missing = checkMissingFields(currentUser.profile);
      
      if (missing.length > 0 && !currentUser.profile?.profileCompleted) {
        setMissingFields(missing);
        setShowModal(true);
      } else {
        setShowModal(false);
      }
    }
  }, [currentUser, isAuthenticated, userType]);

  const handleCompleteProfile = () => {
    setShowModal(false);
    router.push('/edit-profile');
  };

  // Se não está autenticado ou é produtor, renderiza normalmente
  if (!isAuthenticated || userType === 'producer') {
    return <>{children}</>;
  }

  return (
    <>
      {children}

      {/* Modal de Perfil Incompleto */}
      <Modal
        visible={showModal}
        animationType="fade"
        transparent
        onRequestClose={() => {}} // Não permite fechar
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <LinearGradient
              colors={[BotaLoveColors.primary, '#d89515']}
              style={styles.modalHeader}
            >
              <View style={styles.iconContainer}>
                <Ionicons name="person-circle" size={60} color="#FFF" />
              </View>
              <Text style={styles.modalTitle}>Complete seu Perfil</Text>
            </LinearGradient>

            <View style={styles.modalContent}>
              <Text style={styles.modalDescription}>
                Para encontrar seu par perfeito, você precisa completar seu perfil.
                Preencha as informações abaixo:
              </Text>

              <View style={styles.missingFieldsContainer}>
                {missingFields.slice(0, 5).map((field, index) => (
                  <View key={field.key} style={styles.missingFieldItem}>
                    <View style={styles.missingFieldNumber}>
                      <Text style={styles.missingFieldNumberText}>{index + 1}</Text>
                    </View>
                    <Text style={styles.missingFieldText}>{field.label}</Text>
                  </View>
                ))}
                
                {missingFields.length > 5 && (
                  <Text style={styles.moreFieldsText}>
                    +{missingFields.length - 5} campos adicionais
                  </Text>
                )}
              </View>

              <TouchableOpacity
                style={styles.completeButton}
                onPress={handleCompleteProfile}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[BotaLoveColors.primary, '#d89515']}
                  style={styles.completeButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.completeButtonText}>Completar Perfil</Text>
                  <Ionicons name="arrow-forward" size={22} color="#FFF" />
                </LinearGradient>
              </TouchableOpacity>

              <Text style={styles.infoText}>
                <Ionicons name="information-circle" size={14} color="#999" />
                {' '}Você não pode navegar no app até completar seu perfil
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

// =============================================================================
// 🎨 ESTILOS
// =============================================================================

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: width - 40,
    backgroundColor: '#FFF',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  modalHeader: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  iconContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
  },
  modalContent: {
    padding: 24,
  },
  modalDescription: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  missingFieldsContainer: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  missingFieldItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  missingFieldNumber: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: BotaLoveColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  missingFieldNumberText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFF',
  },
  missingFieldText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  moreFieldsText: {
    fontSize: 13,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 8,
    textAlign: 'center',
  },
  completeButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: BotaLoveColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    marginBottom: 16,
  },
  completeButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 10,
  },
  completeButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFF',
  },
  infoText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});
