/**
 * 🔥 BOTA LOVE APP - Complete Profile Modal
 * 
 * Modal que aparece quando o usuário faz login mas tem perfil incompleto
 * Permite completar: fotos, bio, interesses, localização, etc.
 * 
 * @author Bota Love Team
 */

import { BotaLoveColors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { auth, storage } from '@/firebase/config';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// =============================================================================
// 📝 TIPOS
// =============================================================================

interface CompleteProfileModalProps {
  visible: boolean;
  onClose: () => void;
  onComplete: () => void;
}

interface ProfileData {
  photos: string[];
  bio: string;
  age: number | null;
  city: string;
  state: string;
  occupation: string;
  interests: string[];
  gender: 'male' | 'female' | 'non_binary' | 'other' | '';
  lookingFor: 'male' | 'female' | 'all' | '';
}

// =============================================================================
// 🎨 INTERESSES DISPONÍVEIS
// =============================================================================

const AVAILABLE_INTERESTS = [
  'Agronegócio', 'Cavalos', 'Rodeio', 'Fazenda', 'Natureza',
  'Música Sertaneja', 'Dança', 'Viagens', 'Gastronomia', 'Vinhos',
  'Esportes', 'Academia', 'Pets', 'Fotografia', 'Arte',
  'Leitura', 'Cinema', 'Séries', 'Aventura', 'Praia',
];

const STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
];

const GENDERS = [
  { value: 'male' as const, label: 'Homem' },
  { value: 'female' as const, label: 'Mulher' },
  { value: 'non_binary' as const, label: 'Não-binário' },
  { value: 'other' as const, label: 'Outro' },
];

const LOOKING_FOR = [
  { value: 'male' as const, label: 'Homens' },
  { value: 'female' as const, label: 'Mulheres' },
  { value: 'all' as const, label: 'Ambos' },
];

// =============================================================================
// 🎭 COMPONENTE PRINCIPAL
// =============================================================================

export default function CompleteProfileModal({
  visible,
  onClose,
  onComplete,
}: CompleteProfileModalProps) {
  const { currentUser, updateProfile, updatePhotos } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  
  const [profileData, setProfileData] = useState<ProfileData>({
    photos: currentUser?.profile?.photos || [],
    bio: currentUser?.profile?.bio || '',
    age: currentUser?.profile?.age || null,
    city: currentUser?.profile?.city || '',
    state: currentUser?.profile?.state || '',
    occupation: currentUser?.profile?.occupation || '',
    interests: currentUser?.profile?.interests || [],
    gender: currentUser?.profile?.gender || '',
    lookingFor: currentUser?.profile?.genderPreference || '',
  });

  const totalSteps = 4;

  // ===========================================================================
  // 📸 UPLOAD DE FOTOS
  // ===========================================================================

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!permissionResult.granted) {
      Alert.alert('Permissão necessária', 'Precisamos de acesso às suas fotos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await uploadPhoto(result.assets[0].uri);
    }
  };

  const uploadPhoto = async (uri: string) => {
    if (!auth.currentUser) return;
    
    setUploadingPhoto(true);
    try {
      // Converter URI para blob
      const response = await fetch(uri);
      const blob = await response.blob();
      
      // Nome único para o arquivo
      const filename = `users/${auth.currentUser.uid}/photos/${Date.now()}.jpg`;
      const storageRef = ref(storage, filename);
      
      // Upload para Storage
      await uploadBytes(storageRef, blob);
      
      // Obter URL de download
      const downloadURL = await getDownloadURL(storageRef);
      
      // Adicionar ao array de fotos
      setProfileData(prev => ({
        ...prev,
        photos: [...prev.photos, downloadURL],
      }));
      
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      Alert.alert('Erro', 'Não foi possível fazer upload da foto');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const removePhoto = (index: number) => {
    setProfileData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
  };

  // ===========================================================================
  // 🎯 INTERESSES
  // ===========================================================================

  const toggleInterest = (interest: string) => {
    setProfileData(prev => {
      const hasInterest = prev.interests.includes(interest);
      if (hasInterest) {
        return { ...prev, interests: prev.interests.filter(i => i !== interest) };
      } else if (prev.interests.length < 5) {
        return { ...prev, interests: [...prev.interests, interest] };
      }
      return prev;
    });
  };

  // ===========================================================================
  // ✅ VALIDAÇÃO E SALVAMENTO
  // ===========================================================================

  const validateStep = () => {
    switch (currentStep) {
      case 1: // Fotos
        if (profileData.photos.length === 0) {
          Alert.alert('Atenção', 'Adicione pelo menos uma foto');
          return false;
        }
        return true;
      case 2: // Info básica
        if (!profileData.age || !profileData.gender || !profileData.lookingFor) {
          Alert.alert('Atenção', 'Preencha todos os campos');
          return false;
        }
        if (profileData.age < 18 || profileData.age > 99) {
          Alert.alert('Atenção', 'Idade deve ser entre 18 e 99 anos');
          return false;
        }
        return true;
      case 3: // Localização e profissão
        if (!profileData.city || !profileData.state) {
          Alert.alert('Atenção', 'Preencha cidade e estado');
          return false;
        }
        return true;
      case 4: // Bio e interesses
        if (profileData.interests.length === 0) {
          Alert.alert('Atenção', 'Selecione pelo menos um interesse');
          return false;
        }
        return true;
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleSave();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Atualizar fotos
      if (profileData.photos.length > 0) {
        await updatePhotos(profileData.photos);
      }
      
      // Atualizar perfil
      await updateProfile({
        bio: profileData.bio,
        age: profileData.age || 18,
        city: profileData.city,
        state: profileData.state,
        occupation: profileData.occupation,
        interests: profileData.interests,
        gender: profileData.gender as 'male' | 'female' | 'non_binary' | 'other',
        genderPreference: profileData.lookingFor as 'male' | 'female' | 'all',
        profileCompleted: true,
      });
      
      Alert.alert(
        'Perfil Completo! 🎉',
        'Seu perfil foi atualizado com sucesso. Agora você pode explorar o app!',
        [{ text: 'Vamos lá!', onPress: onComplete }]
      );
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      Alert.alert('Erro', 'Não foi possível salvar o perfil');
    } finally {
      setIsLoading(false);
    }
  };

  // ===========================================================================
  // 🎨 RENDERIZAÇÃO DOS STEPS
  // ===========================================================================

  const renderStep1_Photos = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>📸 Suas Fotos</Text>
      <Text style={styles.stepSubtitle}>
        Adicione até 6 fotos para seu perfil
      </Text>
      
      <View style={styles.photosGrid}>
        {[...Array(6)].map((_, index) => {
          const photo = profileData.photos[index];
          return (
            <TouchableOpacity
              key={index}
              style={[styles.photoBox, index === 0 && styles.mainPhotoBox]}
              onPress={photo ? undefined : pickImage}
              disabled={uploadingPhoto}
            >
              {photo ? (
                <>
                  <Image source={{ uri: photo }} style={styles.photo} />
                  <TouchableOpacity
                    style={styles.removePhotoBtn}
                    onPress={() => removePhoto(index)}
                  >
                    <Ionicons name="close-circle" size={24} color="#FF4444" />
                  </TouchableOpacity>
                  {index === 0 && (
                    <View style={styles.mainPhotoBadge}>
                      <Text style={styles.mainPhotoText}>Principal</Text>
                    </View>
                  )}
                </>
              ) : (
                <View style={styles.addPhotoPlaceholder}>
                  {uploadingPhoto ? (
                    <ActivityIndicator color={BotaLoveColors.primary} />
                  ) : (
                    <>
                      <Ionicons name="add" size={32} color={BotaLoveColors.primary} />
                      <Text style={styles.addPhotoText}>Adicionar</Text>
                    </>
                  )}
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const renderStep2_BasicInfo = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>👤 Informações Básicas</Text>
      <Text style={styles.stepSubtitle}>Conte um pouco sobre você</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Idade</Text>
        <TextInput
          style={styles.input}
          placeholder="Sua idade"
          placeholderTextColor="rgba(255,255,255,0.4)"
          keyboardType="numeric"
          maxLength={2}
          value={profileData.age?.toString() || ''}
          onChangeText={(text) => setProfileData(prev => ({
            ...prev,
            age: text ? parseInt(text) : null,
          }))}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Gênero</Text>
        <View style={styles.optionsRow}>
          {GENDERS.map((g) => (
            <TouchableOpacity
              key={g.value}
              style={[
                styles.optionButton,
                profileData.gender === g.value && styles.optionButtonSelected,
              ]}
              onPress={() => setProfileData(prev => ({ ...prev, gender: g.value }))}
            >
              <Text style={[
                styles.optionText,
                profileData.gender === g.value && styles.optionTextSelected,
              ]}>
                {g.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Interessado em</Text>
        <View style={styles.optionsRow}>
          {LOOKING_FOR.map((l) => (
            <TouchableOpacity
              key={l.value}
              style={[
                styles.optionButton,
                profileData.lookingFor === l.value && styles.optionButtonSelected,
              ]}
              onPress={() => setProfileData(prev => ({ ...prev, lookingFor: l.value }))}
            >
              <Text style={[
                styles.optionText,
                profileData.lookingFor === l.value && styles.optionTextSelected,
              ]}>
                {l.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderStep3_Location = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>📍 Onde você mora?</Text>
      <Text style={styles.stepSubtitle}>Para encontrar pessoas próximas</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Cidade</Text>
        <TextInput
          style={styles.input}
          placeholder="Sua cidade"
          placeholderTextColor="rgba(255,255,255,0.4)"
          value={profileData.city}
          onChangeText={(text) => setProfileData(prev => ({ ...prev, city: text }))}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Estado</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.statesRow}>
            {STATES.map((state) => (
              <TouchableOpacity
                key={state}
                style={[
                  styles.stateButton,
                  profileData.state === state && styles.stateButtonSelected,
                ]}
                onPress={() => setProfileData(prev => ({ ...prev, state }))}
              >
                <Text style={[
                  styles.stateText,
                  profileData.state === state && styles.stateTextSelected,
                ]}>
                  {state}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Profissão (opcional)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Produtor Rural, Veterinário..."
          placeholderTextColor="rgba(255,255,255,0.4)"
          value={profileData.occupation}
          onChangeText={(text) => setProfileData(prev => ({ ...prev, occupation: text }))}
        />
      </View>
    </View>
  );

  const renderStep4_Interests = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>❤️ Seus Interesses</Text>
      <Text style={styles.stepSubtitle}>
        Selecione até 5 interesses ({profileData.interests.length}/5)
      </Text>
      
      <View style={styles.interestsGrid}>
        {AVAILABLE_INTERESTS.map((interest) => {
          const isSelected = profileData.interests.includes(interest);
          return (
            <TouchableOpacity
              key={interest}
              style={[
                styles.interestChip,
                isSelected && styles.interestChipSelected,
              ]}
              onPress={() => toggleInterest(interest)}
            >
              <Text style={[
                styles.interestText,
                isSelected && styles.interestTextSelected,
              ]}>
                {interest}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={[styles.inputGroup, { marginTop: 20 }]}>
        <Text style={styles.inputLabel}>Bio (opcional)</Text>
        <TextInput
          style={[styles.input, styles.bioInput]}
          placeholder="Escreva algo sobre você..."
          placeholderTextColor="rgba(255,255,255,0.4)"
          multiline
          numberOfLines={4}
          maxLength={500}
          value={profileData.bio}
          onChangeText={(text) => setProfileData(prev => ({ ...prev, bio: text }))}
        />
        <Text style={styles.charCount}>{profileData.bio.length}/500</Text>
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1_Photos();
      case 2: return renderStep2_BasicInfo();
      case 3: return renderStep3_Location();
      case 4: return renderStep4_Interests();
      default: return null;
    }
  };

  // ===========================================================================
  // 🎨 RENDER PRINCIPAL
  // ===========================================================================

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <LinearGradient
        colors={['#1a0a00', '#000000']}
        style={styles.container}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Complete seu Perfil</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${(currentStep / totalSteps) * 100}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              Etapa {currentStep} de {totalSteps}
            </Text>
          </View>

          {/* Content */}
          <ScrollView 
            style={styles.content}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {renderCurrentStep()}
          </ScrollView>

          {/* Navigation Buttons */}
          <View style={styles.navigation}>
            {currentStep > 1 && (
              <TouchableOpacity
                style={styles.backButton}
                onPress={handleBack}
              >
                <Ionicons name="arrow-back" size={24} color="#FFF" />
                <Text style={styles.backButtonText}>Voltar</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={[styles.nextButton, currentStep === 1 && { flex: 1 }]}
              onPress={handleNext}
              disabled={isLoading}
            >
              <LinearGradient
                colors={[BotaLoveColors.primary, '#E8960F']}
                style={styles.nextButtonGradient}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <>
                    <Text style={styles.nextButtonText}>
                      {currentStep === totalSteps ? 'Concluir' : 'Próximo'}
                    </Text>
                    <Ionicons 
                      name={currentStep === totalSteps ? 'checkmark' : 'arrow-forward'} 
                      size={24} 
                      color="#FFF" 
                    />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </Modal>
  );
}

// =============================================================================
// 🎨 ESTILOS
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  progressContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: BotaLoveColors.primary,
    borderRadius: 3,
  },
  progressText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  stepContainer: {
    paddingBottom: 100,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 24,
  },
  
  // Photos
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  photoBox: {
    width: (SCREEN_WIDTH - 64) / 3,
    height: (SCREEN_WIDTH - 64) / 3 * 1.33,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  mainPhotoBox: {
    width: (SCREEN_WIDTH - 52) / 2,
    height: (SCREEN_WIDTH - 52) / 2 * 1.33,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  removePhotoBtn: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
  },
  mainPhotoBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: BotaLoveColors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  mainPhotoText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  addPhotoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
    borderStyle: 'dashed',
    borderRadius: 12,
  },
  addPhotoText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginTop: 4,
  },
  
  // Inputs
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 16,
    color: '#FFF',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  bioInput: {
    height: 120,
    textAlignVertical: 'top',
  },
  charCount: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
  },
  
  // Options
  optionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  optionButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
  },
  optionButtonSelected: {
    backgroundColor: BotaLoveColors.primary,
    borderColor: BotaLoveColors.primary,
  },
  optionText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '500',
  },
  optionTextSelected: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  
  // States
  statesRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  stateButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  stateButtonSelected: {
    backgroundColor: BotaLoveColors.primary,
    borderColor: BotaLoveColors.primary,
  },
  stateText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  stateTextSelected: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  
  // Interests
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  interestChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  interestChipSelected: {
    backgroundColor: BotaLoveColors.primary,
    borderColor: BotaLoveColors.primary,
  },
  interestText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  interestTextSelected: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  
  // Navigation
  navigation: {
    flexDirection: 'row',
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    gap: 12,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
    gap: 8,
  },
  backButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    flex: 2,
    borderRadius: 30,
    overflow: 'hidden',
  },
  nextButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  nextButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
