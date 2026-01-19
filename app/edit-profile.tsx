import { BotaLoveColors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { uploadProfilePhoto } from '@/firebase/storageService';
import { getModerationErrorMessage, moderateImage } from '@/services/imageModeration';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const { width } = Dimensions.get('window');

interface PhotoItem {
  id: string;
  uri: string;
  isUploading?: boolean;
  isValidating?: boolean; // Nova flag para indicar validação em andamento
  isNew?: boolean; // Se é uma foto nova (local) ou já está no Firebase
}

export default function EditProfileScreen() {
  const router = useRouter();
  const { currentUser, updateProfile, updatePhotos, userType } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  
  const isProducer = userType === 'producer';
  
  // Estados básicos (usados por todos)
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  
  // Estados para Informações Básicas (não usados por produtor)
  const [birthDate, setBirthDate] = useState('');
  const [birthCity, setBirthCity] = useState('');
  const [height, setHeight] = useState('');
  const [children, setChildren] = useState('');
  const [currentCity, setCurrentCity] = useState('');
  const [currentState, setCurrentState] = useState('');
  const [education, setEducation] = useState('');
  const [institution, setInstitution] = useState('');
  const [occupation, setOccupation] = useState('');
  const [professions, setProfessions] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  
  // Estados para Vida Rural
  const [ruralActivities, setRuralActivities] = useState<string[]>([]);
  const [propertySize, setPropertySize] = useState<string[]>([]);
  const [animals, setAnimals] = useState<string[]>([]);
  const [crops, setCrops] = useState<string[]>([]);
  
  // Estados para Preferências
  const [musicalStyles, setMusicalStyles] = useState<string[]>([]);
  const [hobbies, setHobbies] = useState<string[]>([]);
  const [personalTastes, setPersonalTastes] = useState<string[]>([]);
  const [pets, setPets] = useState<string[]>([]);

  // Função helper para obter ícone apropriado para animais de criação
  const getAnimalIcon = (animalName: string): string => {
    const iconMap: { [key: string]: string } = {
      'Bovinos': 'nutrition-outline',
      'Equinos': 'ribbon-outline', 
      'Aves': 'egg-outline',
      'Caprinos': 'leaf-outline',
      'Ovinos': 'cloud-outline',
      'Suínos': 'fast-food-outline',
      'Cão e Gato': 'paw-outline',
      'Animais Exóticos': 'sparkles-outline',
      'Outros': 'ellipsis-horizontal-outline'
    };
    return iconMap[animalName] || 'paw-outline';
  };

  // Função helper para obter ícone apropriado para pets
  const getPetIcon = (petName: string): string => {
    const iconMap: { [key: string]: string } = {
      'Cavalo': 'ribbon-outline',
      'Bovino': 'nutrition-outline',
      'Aves': 'egg-outline',
      'Cão': 'paw-outline',
      'Gato': 'paw-outline',
      'Outros': 'ellipsis-horizontal-outline'
    };
    return iconMap[petName] || 'paw-outline';
  };

  // Carregar dados do usuário atual
  useEffect(() => {
    if (currentUser?.profile) {
      const profile = currentUser.profile;
      
      // Carregar nome
      setName(profile.name || '');
      
      // Carregar bio
      setBio(profile.bio || '');
      
      // Carregar fotos existentes
      if (profile.photos?.length > 0) {
        setPhotos(profile.photos.map((uri, index) => ({
          id: `existing_${index}`,
          uri,
          isNew: false,
        })));
      }
      
      // Não carregar outros dados se for produtor
      if (isProducer) return;
      
      // Carregar Informações Básicas (apenas para usuários regulares)
      setCurrentCity(profile.city || '');
      setCurrentState(profile.state || '');
      setOccupation(profile.occupation || '');
      setInterests(profile.interests || []);
      setBirthCity(profile.birthCity || '');
      setHeight(profile.height || '');
      setChildren(profile.children || '');
      setEducation(profile.education || '');
      setInstitution(profile.institution || '');
      setProfessions(profile.professions || []);
      
      // Carregar data de nascimento
      if (profile.birthDate) {
        const date = profile.birthDate.toDate ? profile.birthDate.toDate() : new Date(profile.birthDate.seconds * 1000);
        setSelectedDate(date);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        setBirthDate(`${day}/${month}/${year}`);
      }
      
      // Carregar Vida Rural
      setRuralActivities(profile.ruralActivities || []);
      setPropertySize(profile.propertySize || []);
      setAnimals(profile.animals || []);
      setCrops(profile.crops || []);
      
      // Carregar Preferências
      setMusicalStyles(profile.musicalStyles || []);
      setHobbies(profile.hobbies || []);
      setPersonalTastes(profile.personalTastes || []);
      setPets(profile.pets || []);
    }
  }, [currentUser]);

  const pickImage = async () => {
    if (photos.length >= 6) {
      Alert.alert('Limite de fotos', 'Você pode adicionar no máximo 6 fotos.');
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos de permissão para acessar suas fotos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (!result.canceled) {
      const photoId = Date.now().toString();
      const imageUri = result.assets[0].uri;
      
      // Adicionar foto temporária com flag de validação
      const tempPhoto: PhotoItem = {
        id: photoId,
        uri: imageUri,
        isNew: true,
        isValidating: true,
      };
      
      setPhotos([...photos, tempPhoto]);
      
      // Validar imagem com GPT-4o Vision
      try {
        console.log('🤖 Validando imagem com IA...');
        
        const moderationResult = await moderateImage(imageUri);
        
        if (moderationResult.isApproved) {
          // ✅ Imagem aprovada
          console.log('✅ Imagem aprovada pela moderação');
          
          // Remover flag de validação (foto aprovada, apenas remove o loading)
          setPhotos(prevPhotos =>
            prevPhotos.map(p =>
              p.id === photoId ? { ...p, isValidating: false } : p
            )
          );
        } else {
          // ❌ Imagem rejeitada
          console.log('❌ Imagem rejeitada pela moderação:', moderationResult.reason);
          
          // Remover a foto rejeitada
          setPhotos(prevPhotos => prevPhotos.filter(p => p.id !== photoId));
          
          // Mostrar mensagem detalhada ao usuário
          const errorMessage = getModerationErrorMessage(moderationResult);
          
          Alert.alert(
            'Foto Não Aprovada ❌',
            errorMessage,
            [{ text: 'Entendi' }]
          );
        }
        
      } catch (error: any) {
        console.error('❌ Erro na validação da imagem:', error);
        
        // Remover a foto em caso de erro
        setPhotos(prevPhotos => prevPhotos.filter(p => p.id !== photoId));
        
        Alert.alert(
          'Erro na Validação',
          'Não foi possível validar a imagem. Por favor, tente novamente ou escolha outra foto.',
          [{ text: 'OK' }]
        );
      }
    }
  };

  const removePhoto = async (id: string) => {
    const photoToRemove = photos.find(p => p.id === id);
    
    // Remover da lista local imediatamente
    setPhotos(photos.filter(photo => photo.id !== id));
    
    // Se não for uma foto nova, ela será removida do Firebase ao salvar
  };

  const handleSave = async () => {
    if (!currentUser) {
      Alert.alert('Erro', 'Usuário não encontrado');
      return;
    }

    // Validação simplificada para produtor
    if (isProducer) {
      if (!name.trim()) {
        Alert.alert('Erro', 'Por favor, preencha o nome');
        return;
      }
    }

    setIsSaving(true);
    
    try {
      // 1. Upload das fotos novas (produtor só tem 1 foto)
      const uploadedPhotos: string[] = [];
      const existingPhotos: string[] = [];
      
      const photosToProcess = isProducer ? photos.slice(0, 1) : photos;
      
      for (let i = 0; i < photosToProcess.length; i++) {
        const photo = photosToProcess[i];
        
        if (photo.isNew) {
          // Fazer upload da foto nova
          const uploadResult = await uploadProfilePhoto(currentUser.id, photo.uri, i);
          
          if (uploadResult.success && uploadResult.url) {
            uploadedPhotos.push(uploadResult.url);
          } else {
            console.error('Erro no upload da foto:', uploadResult.error);
            Alert.alert('Erro', `Falha ao fazer upload da foto ${i + 1}`);
          }
        } else {
          // Manter a URL da foto existente
          existingPhotos.push(photo.uri);
        }
      }
      
      // Combinar fotos existentes com as novas
      const allPhotoUrls = [...existingPhotos, ...uploadedPhotos];
      
      // 2. Atualizar fotos no Firestore
      if (allPhotoUrls.length > 0) {
        await updatePhotos(allPhotoUrls);
      }
      
      // Para produtor, atualizar apenas nome e bio
      if (isProducer) {
        await updateProfile({
          name: name.trim(),
          bio: bio.trim(),
        });
        
        Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
        router.back();
        setIsSaving(false);
        return;
      }
      
      // 3. Calcular idade se tiver data de nascimento (apenas usuários regulares)
      let calculatedAge = currentUser.profile?.age || 0;
      if (birthDate && selectedDate) {
        calculatedAge = calculateAge(selectedDate);
      }
      
      // Debug: verificar interesses antes de salvar
      console.log('🔍 Interesses a serem salvos:', interests);
      console.log('🔍 Todos os dados do perfil:', {
        bio,
        occupation,
        interests,
        professions,
      });
      
      // 4. Atualizar todos os dados do perfil (usuários regulares)
      await updateProfile({
        // Informações Básicas
        bio,
        birthDate: birthDate ? { seconds: Math.floor(selectedDate.getTime() / 1000), nanoseconds: 0 } as any : null,
        age: calculatedAge,
        birthCity,
        height,
        children,
        city: currentCity,
        state: currentState,
        education,
        institution,
        occupation,
        professions,
        interests,
        
        // Vida Rural
        ruralActivities,
        propertySize,
        animals,
        crops,
        
        // Preferências
        musicalStyles,
        hobbies,
        personalTastes,
        pets,
        
        // Flag de perfil completo
        profileCompleted: true,
      });
      
      console.log('✅ Perfil salvo com sucesso! Interesses:', interests);
      
      Alert.alert(
        'Sucesso! 🎉',
        'Seu perfil foi atualizado com sucesso.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
      
    } catch (error: any) {
      console.error('Erro ao salvar perfil:', error);
      Alert.alert('Erro', 'Não foi possível salvar o perfil. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleSelection = (item: string, list: string[], setList: (items: string[]) => void, multiple = true) => {
    if (multiple) {
      if (list.includes(item)) {
        setList(list.filter(i => i !== item));
      } else {
        setList([...list, item]);
      }
    } else {
      setList([item]);
    }
  };

  // Funções para modal de visualização de fotos
  const openPhotoModal = (index: number) => {
    setSelectedPhotoIndex(index);
    setShowPhotoModal(true);
  };

  const closePhotoModal = () => {
    setShowPhotoModal(false);
    setSelectedPhotoIndex(null);
  };

  const navigatePhoto = (direction: 'prev' | 'next') => {
    if (selectedPhotoIndex === null) return;
    
    if (direction === 'prev' && selectedPhotoIndex > 0) {
      setSelectedPhotoIndex(selectedPhotoIndex - 1);
    } else if (direction === 'next' && selectedPhotoIndex < photos.length - 1) {
      setSelectedPhotoIndex(selectedPhotoIndex + 1);
    }
  };

  // Função para reordenar fotos via drag and drop
  const handleDragEnd = useCallback(({ data }: { data: PhotoItem[] }) => {
    setPhotos(data);
  }, []);

  // Renderizar item arrastável
  const renderDraggablePhoto = useCallback(({ item, drag, isActive, getIndex }: RenderItemParams<PhotoItem>) => {
    const index = getIndex() ?? 0;
    
    return (
      <ScaleDecorator>
        <TouchableOpacity
          style={[
            styles.photoBox,
            isActive && styles.photoBoxDragging,
          ]}
          onLongPress={drag}
          onPress={() => openPhotoModal(index)}
          activeOpacity={0.9}
          delayLongPress={150}
        >
          <Image source={{ uri: item.uri }} style={styles.photoImage} />
          
          {/* Badge de foto principal */}
          {index === 0 && (
            <View style={styles.mainPhotoBadge}>
              <Ionicons name="star" size={12} color="#FFF" />
              <Text style={styles.mainPhotoText}>Principal</Text>
            </View>
          )}
          
          {/* Indicador de posição */}
          <View style={styles.photoPositionBadge}>
            <Text style={styles.photoPositionText}>{index + 1}</Text>
          </View>
          
          {/* Indicador de validação com IA */}
          {item.isValidating && (
            <View style={styles.validatingOverlay}>
              <ActivityIndicator size="large" color={BotaLoveColors.primary} />
            </View>
          )}
          
          {/* Indicador de arrastar */}
          {!item.isValidating && (
            <View style={styles.dragIndicator}>
              <Ionicons name="menu" size={16} color="#FFF" />
            </View>
          )}
          
          {/* Botão de remover (desabilitado durante validação) */}
          {!item.isValidating && (
            <TouchableOpacity
              style={styles.removePhotoButton}
              onPress={() => removePhoto(item.id)}
            >
              <Ionicons name="close-circle" size={28} color="#E74C3C" />
            </TouchableOpacity>
          )}
        </TouchableOpacity>
      </ScaleDecorator>
    );
  }, [openPhotoModal, removePhoto]);

  const calculateAge = (date: Date): number => {
    const today = new Date();
    let age = today.getFullYear() - date.getFullYear();
    const monthDiff = today.getMonth() - date.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={isProducer ? ['#9B59B6', '#8E44AD'] : [BotaLoveColors.secondary, '#1a0a00']}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          disabled={isSaving}
        >
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Perfil</Text>
        <TouchableOpacity 
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Text style={styles.saveButtonText}>Salvar</Text>
          )}
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Perfil Simplificado para Produtor */}
        {isProducer ? (
          <>
            {/* Foto do Produtor */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="image" size={24} color="#9B59B6" />
                <Text style={styles.sectionTitle}>Foto do Perfil</Text>
              </View>
              <Text style={styles.sectionSubtitle}>
                Adicione uma foto para seu avatar
              </Text>

              <View style={styles.producerPhotoContainer}>
                {photos.length > 0 ? (
                  <View style={styles.producerPhotoWrapper}>
                    <Image source={{ uri: photos[0].uri }} style={styles.producerPhoto} />
                    <TouchableOpacity
                      style={styles.removeProducerPhotoButton}
                      onPress={() => removePhoto(photos[0].id)}
                    >
                      <Ionicons name="close-circle" size={28} color="#E74C3C" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.addProducerPhotoBox}
                    onPress={pickImage}
                  >
                    <Ionicons name="camera" size={48} color="#9B59B6" />
                    <Text style={styles.addProducerPhotoText}>Adicionar Foto</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Nome do Produtor */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="person" size={24} color="#9B59B6" />
                <Text style={styles.sectionTitle}>Nome</Text>
              </View>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Seu nome ou nome da empresa"
                placeholderTextColor={BotaLoveColors.neutralMedium}
              />
            </View>

            {/* Bio do Produtor */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="document-text" size={24} color="#9B59B6" />
                <Text style={styles.sectionTitle}>Sobre (Opcional)</Text>
              </View>
              <TextInput
                style={[styles.input, styles.bioInput]}
                value={bio}
                onChangeText={setBio}
                placeholder="Conte um pouco sobre você ou sua empresa..."
                placeholderTextColor={BotaLoveColors.neutralMedium}
                multiline
                numberOfLines={4}
                maxLength={500}
              />
              <Text style={styles.charCount}>{bio.length}/500</Text>
            </View>
          </>
        ) : (
          <>
            {/* Perfil Completo para Usuários Regulares */}
            {/* Seção de Fotos */}
            <View style={styles.photoSection}>
              <View style={styles.photoSectionHeader}>
                <View style={styles.photoSectionTitleRow}>
                  <Ionicons name="images" size={24} color={BotaLoveColors.primary} />
                  <Text style={styles.photoSectionTitle}>Suas Fotos</Text>
                </View>
                <Text style={styles.photoSectionSubtitle}>
                  Segure e arraste para reordenar • A primeira foto será sua principal
                </Text>
              </View>

              <GestureHandlerRootView style={styles.photoGridWrapper}>
                <View style={styles.photoGridContainer}>
                  {/* Grid 3x2 estilo Tinder */}
                  <View style={styles.photoGridRow}>
                    {/* Foto Principal (maior) */}
                    <View style={styles.mainPhotoSlot}>
                      {photos[0] ? (
                        <TouchableOpacity
                          style={[styles.photoSlot, styles.mainPhotoSlotInner]}
                          onLongPress={() => {/* drag handled by DraggableFlatList */}}
                          onPress={() => openPhotoModal(0)}
                          activeOpacity={0.9}
                        >
                          <Image source={{ uri: photos[0].uri }} style={styles.photoSlotImage} />
                          <LinearGradient
                            colors={['transparent', 'rgba(0,0,0,0.6)']}
                            style={styles.photoGradient}
                          />
                          <View style={styles.mainBadge}>
                            <Ionicons name="star" size={14} color="#FFF" />
                            <Text style={styles.mainBadgeText}>Principal</Text>
                          </View>
                          {photos[0].isValidating && (
                            <View style={styles.validatingOverlay}>
                              <ActivityIndicator size="large" color={BotaLoveColors.primary} />
                            </View>
                          )}
                          <TouchableOpacity
                            style={styles.photoRemoveBtn}
                            onPress={() => removePhoto(photos[0].id)}
                          >
                            <Ionicons name="close-circle" size={26} color="#FFF" />
                          </TouchableOpacity>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity
                          style={[styles.photoSlot, styles.photoSlotEmpty, styles.mainPhotoSlotInner]}
                          onPress={pickImage}
                        >
                          <View style={styles.addPhotoCircle}>
                            <Ionicons name="add" size={32} color={BotaLoveColors.primary} />
                          </View>
                          <Text style={styles.addPhotoLabel}>Adicionar</Text>
                        </TouchableOpacity>
                      )}
                    </View>

                    {/* Coluna direita com 2 fotos menores */}
                    <View style={styles.smallPhotosColumn}>
                      {[1, 2].map((idx) => (
                        <View key={idx} style={styles.smallPhotoSlot}>
                          {photos[idx] ? (
                            <TouchableOpacity
                              style={styles.photoSlot}
                              onPress={() => openPhotoModal(idx)}
                              activeOpacity={0.9}
                            >
                              <Image source={{ uri: photos[idx].uri }} style={styles.photoSlotImage} />
                              <View style={styles.photoIndexBadge}>
                                <Text style={styles.photoIndexText}>{idx + 1}</Text>
                              </View>
                              {photos[idx].isValidating && (
                                <View style={styles.validatingOverlay}>
                                  <ActivityIndicator size="small" color={BotaLoveColors.primary} />
                                </View>
                              )}
                              <TouchableOpacity
                                style={styles.photoRemoveBtnSmall}
                                onPress={() => removePhoto(photos[idx].id)}
                              >
                                <Ionicons name="close-circle" size={22} color="#FFF" />
                              </TouchableOpacity>
                            </TouchableOpacity>
                          ) : (
                            <TouchableOpacity
                              style={[styles.photoSlot, styles.photoSlotEmpty]}
                              onPress={pickImage}
                            >
                              <Ionicons name="add" size={24} color={BotaLoveColors.primary} />
                            </TouchableOpacity>
                          )}
                        </View>
                      ))}
                    </View>
                  </View>

                  {/* Segunda linha com 3 fotos */}
                  <View style={styles.photoGridRowBottom}>
                    {[3, 4, 5].map((idx) => (
                      <View key={idx} style={styles.bottomPhotoSlot}>
                        {photos[idx] ? (
                          <TouchableOpacity
                            style={styles.photoSlot}
                            onPress={() => openPhotoModal(idx)}
                            activeOpacity={0.9}
                          >
                            <Image source={{ uri: photos[idx].uri }} style={styles.photoSlotImage} />
                            <View style={styles.photoIndexBadge}>
                              <Text style={styles.photoIndexText}>{idx + 1}</Text>
                            </View>
                            {photos[idx]?.isValidating && (
                              <View style={styles.validatingOverlay}>
                                <ActivityIndicator size="small" color={BotaLoveColors.primary} />
                              </View>
                            )}
                            <TouchableOpacity
                              style={styles.photoRemoveBtnSmall}
                              onPress={() => removePhoto(photos[idx].id)}
                            >
                              <Ionicons name="close-circle" size={22} color="#FFF" />
                            </TouchableOpacity>
                          </TouchableOpacity>
                        ) : (
                          <TouchableOpacity
                            style={[styles.photoSlot, styles.photoSlotEmpty]}
                            onPress={pickImage}
                          >
                            <Ionicons name="add" size={24} color={BotaLoveColors.primary} />
                          </TouchableOpacity>
                        )}
                      </View>
                    ))}
                  </View>
                </View>

                {/* Dica de reordenação */}
                <View style={styles.photoTipContainer}>
                  <Ionicons name="information-circle" size={16} color={BotaLoveColors.neutralMedium} />
                  <Text style={styles.photoTipText}>
                    Toque para visualizar • A foto principal aparece no descobrir
                  </Text>
                </View>
              </GestureHandlerRootView>
            </View>

        {/* 1. INFORMAÇÕES BÁSICAS */}
        <View style={styles.categoryCard}>
          <LinearGradient
            colors={['#FFD700', BotaLoveColors.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.categoryHeader}
          >
            <Ionicons name="person-circle" size={28} color="#FFF" />
            <Text style={styles.categoryTitle}>Informações Básicas</Text>
          </LinearGradient>

          {/* Biografia */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Biografia</Text>
            <Text style={styles.fieldHelper}>Conte um pouco sobre você</Text>
            <View style={styles.textAreaContainer}>
              <Ionicons name="text" size={20} color={BotaLoveColors.secondary} style={styles.textAreaIcon} />
              <TextInput
                style={styles.textArea}
                placeholder="Ex: Apaixonado pelo campo, amo cavalos e música sertaneja..."
                placeholderTextColor="#999"
                value={bio}
                onChangeText={setBio}
                multiline
                numberOfLines={4}
                maxLength={500}
                textAlignVertical="top"
              />
            </View>
            <Text style={styles.charCounter}>{bio.length}/500 caracteres</Text>
          </View>

          {/* Profissão (Campo Livre) */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Profissão</Text>
            <Text style={styles.fieldHelper}>Digite sua profissão atual</Text>
            <TouchableOpacity style={styles.inputButton}>
              <Ionicons name="briefcase" size={20} color={BotaLoveColors.secondary} />
              <TextInput
                style={styles.input}
                placeholder="Ex: Engenheiro Agrônomo, Produtor Rural..."
                placeholderTextColor="#999"
                value={occupation}
                onChangeText={setOccupation}
              />
            </TouchableOpacity>
          </View>

          {/* Data de Nascimento */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Data de Nascimento</Text>
            <TouchableOpacity 
              style={styles.inputButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar" size={20} color={BotaLoveColors.secondary} />
              <Text style={[styles.input, !birthDate && styles.placeholderText]}>
                {birthDate || 'Selecione sua data de nascimento'}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#999" />
            </TouchableOpacity>
            {birthDate && (
              <Text style={styles.helperText}>
                Idade: {calculateAge(selectedDate)} anos
              </Text>
            )}
            {showDatePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event: DateTimePickerEvent, date?: Date) => {
                  setShowDatePicker(Platform.OS === 'ios');
                  if (date) {
                    setSelectedDate(date);
                    const day = date.getDate().toString().padStart(2, '0');
                    const month = (date.getMonth() + 1).toString().padStart(2, '0');
                    const year = date.getFullYear();
                    setBirthDate(`${day}/${month}/${year}`);
                  }
                }}
                maximumDate={new Date(new Date().setFullYear(new Date().getFullYear() - 18))}
                minimumDate={new Date(1920, 0, 1)}
                locale="pt-BR"
              />
            )}
            {showDatePicker && Platform.OS === 'ios' && (
              <TouchableOpacity 
                style={styles.datePickerDoneButton}
                onPress={() => setShowDatePicker(false)}
              >
                <Text style={styles.datePickerDoneText}>Confirmar</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Cidade de Nascimento */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Cidade de Nascimento</Text>
            <TouchableOpacity style={styles.inputButton}>
              <Ionicons name="location" size={20} color={BotaLoveColors.secondary} />
              <TextInput
                style={styles.input}
                placeholder="Buscar cidade..."
                placeholderTextColor="#999"
                value={birthCity}
                onChangeText={setBirthCity}
              />
            </TouchableOpacity>
          </View>

          {/* Altura */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Altura</Text>
            <TouchableOpacity style={styles.inputButton}>
              <Ionicons name="resize" size={20} color={BotaLoveColors.secondary} />
              <TextInput
                style={styles.input}
                placeholder="Ex: 175 cm"
                placeholderTextColor="#999"
                value={height}
                onChangeText={setHeight}
                keyboardType="numeric"
              />
            </TouchableOpacity>
          </View>

          {/* Filhos */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Filhos</Text>
            <View style={styles.radioGroup}>
              {['Tenho filhos', 'Pretendo ter filhos', 'Não tenho filhos'].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.radioButton,
                    children === option && styles.radioButtonSelected
                  ]}
                  onPress={() => setChildren(option)}
                >
                  <View style={styles.radioCircle}>
                    {children === option && <View style={styles.radioCircleInner} />}
                  </View>
                  <Text style={[
                    styles.radioText,
                    children === option && styles.radioTextSelected
                  ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Cidade Atual */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Cidade Atual (residência, trabalho ou estudo)</Text>
            <TouchableOpacity style={styles.inputButton}>
              <Ionicons name="navigate" size={20} color={BotaLoveColors.secondary} />
              <TextInput
                style={styles.input}
                placeholder="Buscar cidade..."
                placeholderTextColor="#999"
                value={currentCity}
                onChangeText={setCurrentCity}
              />
            </TouchableOpacity>
          </View>

          {/* Formação / Educação */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Formação / Educação</Text>
            <View style={styles.dropdownContainer}>
              {['Nível Médio', 'Nível Técnico', 'Graduação', 'Pós-Graduação', 'Mestrado', 'Doutorado', 'Pós-Doutorado'].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.dropdownItem,
                    education === option && styles.dropdownItemSelected
                  ]}
                  onPress={() => setEducation(option)}
                >
                  <Text style={[
                    styles.dropdownText,
                    education === option && styles.dropdownTextSelected
                  ]}>
                    {option}
                  </Text>
                  {education === option && (
                    <Ionicons name="checkmark-circle" size={20} color={BotaLoveColors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Instituição de Formação */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Instituição de Formação / Estudo</Text>
            <TouchableOpacity style={styles.inputButton}>
              <Ionicons name="school" size={20} color={BotaLoveColors.secondary} />
              <TextInput
                style={styles.input}
                placeholder="Buscar instituição..."
                placeholderTextColor="#999"
                value={institution}
                onChangeText={setInstitution}
              />
            </TouchableOpacity>
          </View>

          {/* Profissão / Área de Estudo */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Profissão / Área de Estudo</Text>
            <Text style={styles.fieldHelper}>Selecione uma ou mais opções</Text>
            <View style={styles.chipsContainer}>
              {[
                'Produtor(a) Rural',
                'Empresário(a) do Agronegócio',
                'Engenheiro(a) Agrônomo(a)',
                'Médico(a) Veterinário(a) – Grandes Animais',
                'Médico(a) Veterinário(a) – Pequenos Animais',
                'Médico(a) Veterinário(a) – Animais Exóticos',
                'Zootecnista',
                'Técnico(a) em Agropecuária',
                'Estudante de Engenharia Agronômica',
                'Estudante de Medicina Veterinária',
                'Estudante de Zootecnia',
                'Estudante de Técnico em Agropecuária',
                'Trabalhadores do Agronegócio',
                'Outro'
              ].map((profession) => (
                <TouchableOpacity
                  key={profession}
                  style={[
                    styles.chip,
                    professions.includes(profession) && styles.chipSelected
                  ]}
                  onPress={() => toggleSelection(profession, professions, setProfessions)}
                >
                  <Text style={[
                    styles.chipText,
                    professions.includes(profession) && styles.chipTextSelected
                  ]}>
                    {profession}
                  </Text>
                  {professions.includes(profession) && (
                    <Ionicons name="checkmark-circle" size={16} color="#FFF" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Interesses */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Interesses</Text>
            <Text style={styles.fieldHelper}>Selecione seus interesses</Text>
            <View style={styles.chipsContainer}>
              {[
                'Viagens',
                'Música',
                'Esportes',
                'Leitura',
                'Culinária',
                'Fotografia',
                'Arte',
                'Cinema',
                'Tecnologia',
                'Natureza',
                'Animais',
                'Festas',
                'Família',
                'Empreendedorismo',
                'Voluntariado'
              ].map((interest) => (
                <TouchableOpacity
                  key={interest}
                  style={[
                    styles.chip,
                    interests.includes(interest) && styles.chipSelected
                  ]}
                  onPress={() => toggleSelection(interest, interests, setInterests)}
                >
                  <Text style={[
                    styles.chipText,
                    interests.includes(interest) && styles.chipTextSelected
                  ]}>
                    {interest}
                  </Text>
                  {interests.includes(interest) && (
                    <Ionicons name="checkmark-circle" size={16} color="#FFF" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* 2. VIDA RURAL */}
        <View style={styles.categoryCard}>
          <LinearGradient
            colors={['#27AE60', '#229954']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.categoryHeader}
          >
            <Ionicons name="leaf" size={28} color="#FFF" />
            <Text style={styles.categoryTitle}>Vida Rural</Text>
          </LinearGradient>

          {/* Atividade Rural ou Médica Atual */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Atividade Rural ou Médica Atual</Text>
            <Text style={styles.fieldHelper}>Seleção múltipla</Text>
            <View style={styles.cardsGrid}>
              {[
                { name: 'Agricultura', icon: 'nutrition' },
                { name: 'Agronegócio', icon: 'briefcase' },
                { name: 'Agroindústria', icon: 'business' },
                { name: 'Pecuária de Corte', icon: 'paw' },
                { name: 'Pecuária de Leite', icon: 'water' },
                { name: 'Clínica de Pequenos Animais', icon: 'medical' },
                { name: 'Clínica de Grandes Animais', icon: 'medkit' },
                { name: 'Outros', icon: 'ellipsis-horizontal' }
              ].map((activity) => (
                <TouchableOpacity
                  key={activity.name}
                  style={[
                    styles.iconCard,
                    ruralActivities.includes(activity.name) && styles.iconCardSelected
                  ]}
                  onPress={() => toggleSelection(activity.name, ruralActivities, setRuralActivities)}
                >
                  <View style={[
                    styles.iconCircle,
                    ruralActivities.includes(activity.name) && styles.iconCircleSelected
                  ]}>
                    <Ionicons 
                      name={activity.icon as any} 
                      size={28} 
                      color={ruralActivities.includes(activity.name) ? '#FFF' : BotaLoveColors.primary} 
                    />
                  </View>
                  <Text style={[
                    styles.iconCardText,
                    ruralActivities.includes(activity.name) && styles.iconCardTextSelected
                  ]}>
                    {activity.name}
                  </Text>
                  {ruralActivities.includes(activity.name) && (
                    <View style={styles.checkBadge}>
                      <Ionicons name="checkmark" size={12} color="#FFF" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Porte da Propriedade / Atividade */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Porte da Propriedade / Atividade</Text>
            <Text style={styles.fieldHelper}>Seleção múltipla</Text>
            <View style={styles.chipsContainer}>
              {[
                'Sítio',
                'Fazenda',
                'Chácara',
                'Pequeno Produtor',
                'Grande Produtor',
                'Cooperado',
                'Clínica/Consultório Veterinário',
                'Não desejo informar',
                'Outros'
              ].map((size) => (
                <TouchableOpacity
                  key={size}
                  style={[
                    styles.chip,
                    propertySize.includes(size) && styles.chipSelected
                  ]}
                  onPress={() => toggleSelection(size, propertySize, setPropertySize)}
                >
                  <Text style={[
                    styles.chipText,
                    propertySize.includes(size) && styles.chipTextSelected
                  ]}>
                    {size}
                  </Text>
                  {propertySize.includes(size) && (
                    <Ionicons name="checkmark-circle" size={16} color="#FFF" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Animais que Trabalha ou Cria */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Animais que Trabalha ou Cria</Text>
            <Text style={styles.fieldHelper}>Seleção múltipla</Text>
            <View style={styles.cardsGrid}>
              {[
                { name: 'Bovinos', icon: 'cow', library: 'material' },
                { name: 'Equinos', icon: 'horse', library: 'material' },
                { name: 'Aves', icon: 'bird', library: 'material' },
                { name: 'Caprinos', icon: 'food-steak', library: 'material' },
                { name: 'Ovinos', icon: 'sheep', library: 'material' },
                { name: 'Suínos', icon: 'pig', library: 'material' },
                { name: 'Cão e Gato', icon: 'dog', library: 'material' },
                { name: 'Animais Exóticos', icon: 'snake', library: 'material' },
                { name: 'Outros', icon: 'dots-horizontal', library: 'material' }
              ].map((animal) => (
                <TouchableOpacity
                  key={animal.name}
                  style={[
                    styles.iconCard,
                    animals.includes(animal.name) && styles.iconCardSelected
                  ]}
                  onPress={() => toggleSelection(animal.name, animals, setAnimals)}
                >
                  <View style={[
                    styles.iconCircle,
                    animals.includes(animal.name) && styles.iconCircleSelected
                  ]}>
                    <MaterialCommunityIcons 
                      name={animal.icon as any} 
                      size={28} 
                      color={animals.includes(animal.name) ? '#FFF' : '#27AE60'} 
                    />
                  </View>
                  <Text style={[
                    styles.iconCardText,
                    animals.includes(animal.name) && styles.iconCardTextSelected
                  ]}>
                    {animal.name}
                  </Text>
                  {animals.includes(animal.name) && (
                    <View style={styles.checkBadge}>
                      <Ionicons name="checkmark" size={12} color="#FFF" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Preferências de Culturas e Plantio */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Preferências de Culturas e Plantio</Text>
            <Text style={styles.fieldHelper}>Seleção múltipla</Text>
            <View style={styles.chipsContainer}>
              {['Soja', 'Milho', 'Sorgo', 'Outros'].map((crop) => (
                <TouchableOpacity
                  key={crop}
                  style={[
                    styles.chip,
                    crops.includes(crop) && styles.chipSelected
                  ]}
                  onPress={() => toggleSelection(crop, crops, setCrops)}
                >
                  <Ionicons 
                    name="leaf" 
                    size={16} 
                    color={crops.includes(crop) ? '#FFF' : '#27AE60'} 
                  />
                  <Text style={[
                    styles.chipText,
                    crops.includes(crop) && styles.chipTextSelected
                  ]}>
                    {crop}
                  </Text>
                  {crops.includes(crop) && (
                    <Ionicons name="checkmark-circle" size={16} color="#FFF" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* 3. PREFERÊNCIAS RURAIS */}
        <View style={styles.categoryCard}>
          <LinearGradient
            colors={['#E74C3C', '#C0392B']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.categoryHeader}
          >
            <Ionicons name="heart-circle" size={28} color="#FFF" />
            <Text style={styles.categoryTitle}>Preferências Rurais</Text>
          </LinearGradient>

          {/* Estilo Musical */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Estilo Musical</Text>
            <Text style={styles.fieldHelper}>Seleção múltipla</Text>
            <View style={styles.cardsGrid}>
              {[
                { name: 'Sertanejo', icon: 'musical-notes' },
                { name: 'Modão', icon: 'musical-note' },
                { name: 'Country', icon: 'musical-notes' },
                { name: 'Outros', icon: 'ellipsis-horizontal' }
              ].map((style) => (
                <TouchableOpacity
                  key={style.name}
                  style={[
                    styles.iconCard,
                    musicalStyles.includes(style.name) && styles.iconCardSelected
                  ]}
                  onPress={() => toggleSelection(style.name, musicalStyles, setMusicalStyles)}
                >
                  <View style={[
                    styles.iconCircle,
                    musicalStyles.includes(style.name) && styles.iconCircleSelected
                  ]}>
                    <Ionicons 
                      name={style.icon as any} 
                      size={28} 
                      color={musicalStyles.includes(style.name) ? '#FFF' : '#E74C3C'} 
                    />
                  </View>
                  <Text style={[
                    styles.iconCardText,
                    musicalStyles.includes(style.name) && styles.iconCardTextSelected
                  ]}>
                    {style.name}
                  </Text>
                  {musicalStyles.includes(style.name) && (
                    <View style={styles.checkBadge}>
                      <Ionicons name="checkmark" size={12} color="#FFF" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Hobbies Rurais */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Hobbies Rurais</Text>
            <Text style={styles.fieldHelper}>Seleção múltipla</Text>
            <View style={styles.chipsContainer}>
              {[
                'Cavalgada',
                'Prova de Laço/Tambor',
                'Pescaria',
                'Rodeio',
                'Festa de Peão',
                'Colheita',
                'Feira de Agronegócios',
                'Shows',
                'Outros'
              ].map((hobby) => (
                <TouchableOpacity
                  key={hobby}
                  style={[
                    styles.chip,
                    hobbies.includes(hobby) && styles.chipSelected
                  ]}
                  onPress={() => toggleSelection(hobby, hobbies, setHobbies)}
                >
                  <Text style={[
                    styles.chipText,
                    hobbies.includes(hobby) && styles.chipTextSelected
                  ]}>
                    {hobby}
                  </Text>
                  {hobbies.includes(hobby) && (
                    <Ionicons name="checkmark-circle" size={16} color="#FFF" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Gostos Pessoais */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Gostos Pessoais</Text>
            <Text style={styles.fieldHelper}>Seleção múltipla</Text>
            <View style={styles.chipsContainer}>
              {[
                'Cozinhar no fogão a lenha',
                'Churrasco',
                'Moda de Viola',
                'Shows Sertanejos',
                'Outros'
              ].map((taste) => (
                <TouchableOpacity
                  key={taste}
                  style={[
                    styles.chip,
                    personalTastes.includes(taste) && styles.chipSelected
                  ]}
                  onPress={() => toggleSelection(taste, personalTastes, setPersonalTastes)}
                >
                  <Text style={[
                    styles.chipText,
                    personalTastes.includes(taste) && styles.chipTextSelected
                  ]}>
                    {taste}
                  </Text>
                  {personalTastes.includes(taste) && (
                    <Ionicons name="checkmark-circle" size={16} color="#FFF" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Animais de Estimação */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Animais de Estimação</Text>
            <Text style={styles.fieldHelper}>Seleção múltipla</Text>
            <View style={styles.cardsGrid}>
              {[
                { name: 'Cavalo', icon: 'horse', library: 'material' },
                { name: 'Bovino', icon: 'cow', library: 'material' },
                { name: 'Aves', icon: 'bird', library: 'material' },
                { name: 'Cão', icon: 'dog', library: 'material' },
                { name: 'Gato', icon: 'cat', library: 'material' },
                { name: 'Outros', icon: 'dots-horizontal', library: 'material' }
              ].map((pet) => (
                <TouchableOpacity
                  key={pet.name}
                  style={[
                    styles.iconCard,
                    pets.includes(pet.name) && styles.iconCardSelected
                  ]}
                  onPress={() => toggleSelection(pet.name, pets, setPets)}
                >
                  <View style={[
                    styles.iconCircle,
                    pets.includes(pet.name) && styles.iconCircleSelected
                  ]}>
                    <MaterialCommunityIcons 
                      name={pet.icon as any} 
                      size={28} 
                      color={pets.includes(pet.name) ? '#FFF' : '#E74C3C'} 
                    />
                  </View>
                  <Text style={[
                    styles.iconCardText,
                    pets.includes(pet.name) && styles.iconCardTextSelected
                  ]}>
                    {pet.name}
                  </Text>
                  {pets.includes(pet.name) && (
                    <View style={styles.checkBadge}>
                      <Ionicons name="checkmark" size={12} color="#FFF" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Botão de Salvar no final */}
        <TouchableOpacity 
          style={styles.saveButtonBottom}
          onPress={handleSave}
          disabled={isSaving}
        >
          <LinearGradient
            colors={['#FFD700', BotaLoveColors.primary, '#FF69B4']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.saveButtonGradient}
          >
            {isSaving ? (
              <>
                <ActivityIndicator size="small" color="#FFF" />
                <Text style={styles.saveButtonBottomText}>Salvando...</Text>
              </>
            ) : (
              <>
                <Text style={styles.saveButtonBottomText}>Salvar Perfil</Text>
                <Ionicons name="checkmark-circle" size={24} color="#FFF" />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
          </>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Modal de Visualização de Foto */}
      <Modal
        visible={showPhotoModal}
        transparent={true}
        animationType="fade"
        onRequestClose={closePhotoModal}
      >
        <View style={styles.modalContainer}>
          {/* Fundo escuro */}
          <TouchableOpacity 
            style={styles.modalBackdrop} 
            activeOpacity={1}
            onPress={closePhotoModal}
          />
          
          {/* Conteúdo da Modal */}
          <View style={styles.modalContent}>
            {/* Botão de Fechar */}
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={closePhotoModal}
            >
              <Ionicons name="close" size={32} color="#FFF" />
            </TouchableOpacity>

            {/* Imagem Centralizada */}
            {selectedPhotoIndex !== null && (
              <>
                <Image 
                  source={{ uri: photos[selectedPhotoIndex].uri }} 
                  style={styles.modalImage}
                  resizeMode="contain"
                />

                {/* Badge de Foto Principal */}
                {selectedPhotoIndex === 0 && (
                  <View style={styles.modalPhotoBadge}>
                    <Ionicons name="star" size={16} color="#FFF" />
                    <Text style={styles.modalBadgeText}>Foto Principal</Text>
                  </View>
                )}

                {/* Navegação entre fotos */}
                {photos.length > 1 && (
                  <>
                    {selectedPhotoIndex > 0 && (
                      <TouchableOpacity 
                        style={[styles.navButton, styles.navButtonLeft]}
                        onPress={() => navigatePhoto('prev')}
                      >
                        <Ionicons name="chevron-back" size={32} color="#FFF" />
                      </TouchableOpacity>
                    )}
                    
                    {selectedPhotoIndex < photos.length - 1 && (
                      <TouchableOpacity 
                        style={[styles.navButton, styles.navButtonRight]}
                        onPress={() => navigatePhoto('next')}
                      >
                        <Ionicons name="chevron-forward" size={32} color="#FFF" />
                      </TouchableOpacity>
                    )}

                    {/* Indicador de posição */}
                    <View style={styles.photoIndicator}>
                      {photos.map((_, index) => (
                        <View
                          key={index}
                          style={[
                            styles.indicatorDot,
                            index === selectedPhotoIndex && styles.indicatorDotActive
                          ]}
                        />
                      ))}
                    </View>
                  </>
                )}
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
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
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    minWidth: 70,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: '#FFF',
    padding: 20,
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: BotaLoveColors.secondary,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  gestureContainer: {
    marginBottom: 16,
  },
  // === NOVO GRID DE FOTOS ESTILO TINDER ===
  photoSection: {
    backgroundColor: '#FFF',
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  photoSectionHeader: {
    marginBottom: 16,
  },
  photoSectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  photoSectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: BotaLoveColors.secondary,
  },
  photoSectionSubtitle: {
    fontSize: 13,
    color: BotaLoveColors.neutralMedium,
    marginLeft: 34,
  },
  photoGridWrapper: {
    alignItems: 'center',
  },
  photoGridContainer: {
    width: '100%',
  },
  photoGridRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  mainPhotoSlot: {
    flex: 2,
  },
  mainPhotoSlotInner: {
    height: (width - 64) * 0.65,
  },
  smallPhotosColumn: {
    flex: 1,
    gap: 8,
  },
  smallPhotoSlot: {
    flex: 1,
  },
  photoGridRowBottom: {
    flexDirection: 'row',
    gap: 8,
  },
  bottomPhotoSlot: {
    flex: 1,
    height: (width - 64) / 3 - 4,
  },
  photoSlot: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
    position: 'relative',
  },
  photoSlotEmpty: {
    borderWidth: 2,
    borderColor: BotaLoveColors.primary,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(218, 165, 32, 0.08)',
  },
  photoSlotImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  photoGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 60,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  mainBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: BotaLoveColors.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  mainBadgeText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
  photoIndexBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoIndexText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  photoRemoveBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 15,
  },
  photoRemoveBtnSmall: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 12,
  },
  addPhotoCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(218, 165, 32, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  addPhotoLabel: {
    fontSize: 12,
    color: BotaLoveColors.primary,
    fontWeight: '600',
  },
  photoTipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingHorizontal: 4,
  },
  photoTipText: {
    fontSize: 12,
    color: BotaLoveColors.neutralMedium,
    flex: 1,
  },
  // === FIM GRID DE FOTOS ===
  photosGridHorizontal: {
    gap: 12,
    paddingRight: 12,
  },
  photosGridContainer: {
    paddingBottom: 12,
  },
  photosGridRow: {
    gap: 12,
    marginBottom: 12,
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  photoBox: {
    width: (width - 64) / 3,
    height: (width - 64) / 3 * 1.3,
    borderRadius: 12,
    position: 'relative',
    backgroundColor: '#f0f0f0',
    marginRight: 12,
  },
  photoBoxDragging: {
    transform: [{ scale: 1.08 }],
    shadowColor: BotaLoveColors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 15,
    borderWidth: 2,
    borderColor: BotaLoveColors.primary,
  },
  addPhotoBoxInline: {
    width: (width - 64) / 3,
    height: (width - 64) / 3 * 1.3,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: BotaLoveColors.primary,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(218, 165, 32, 0.1)',
    marginTop: 12,
  },
  photoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  photoPositionBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoPositionText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  dragIndicator: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainPhotoBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: BotaLoveColors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  mainPhotoText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '600',
  },
  removePhotoButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FFF',
    borderRadius: 14,
  },
  // Overlay de validação com IA
  validatingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPhotoBox: {
    width: (width - 64) / 3,
    height: (width - 64) / 3 * 1.3,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: BotaLoveColors.primary,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  addPhotoText: {
    marginTop: 8,
    fontSize: 12,
    color: BotaLoveColors.secondary,
    fontWeight: '600',
  },
  categoryCard: {
    backgroundColor: '#FFF',
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 20,
  },
  categoryTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
  },
  fieldContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: BotaLoveColors.secondary,
    marginBottom: 12,
  },
  fieldHelper: {
    fontSize: 12,
    color: '#999',
    marginBottom: 12,
  },
  inputButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FAFAFA',
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: BotaLoveColors.textPrimary,
    paddingVertical: 14,
  },
  bioInput: {
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FAFAFA',
  },
  textAreaContainer: {
    flexDirection: 'row',
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FAFAFA',
    minHeight: 120,
  },
  textAreaIcon: {
    marginTop: 2,
    marginRight: 10,
  },
  textArea: {
    flex: 1,
    fontSize: 15,
    color: BotaLoveColors.textPrimary,
    minHeight: 100,
  },
  charCounter: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 6,
  },
  helperText: {
    fontSize: 13,
    color: BotaLoveColors.primary,
    marginTop: 8,
    fontWeight: '600',
  },
  placeholderText: {
    color: '#999',
  },
  datePickerDoneButton: {
    backgroundColor: BotaLoveColors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: 'center',
    marginTop: 12,
  },
  datePickerDoneText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  radioGroup: {
    gap: 12,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    backgroundColor: '#FAFAFA',
  },
  radioButtonSelected: {
    borderColor: BotaLoveColors.primary,
    backgroundColor: '#FFF9E6',
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#CCC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: BotaLoveColors.primary,
  },
  radioText: {
    flex: 1,
    fontSize: 15,
    color: BotaLoveColors.textPrimary,
  },
  radioTextSelected: {
    fontWeight: '600',
    color: BotaLoveColors.secondary,
  },
  dropdownContainer: {
    gap: 8,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    backgroundColor: '#FAFAFA',
  },
  dropdownItemSelected: {
    borderColor: BotaLoveColors.primary,
    backgroundColor: '#FFF9E6',
  },
  dropdownText: {
    fontSize: 15,
    color: BotaLoveColors.textPrimary,
  },
  dropdownTextSelected: {
    fontWeight: '600',
    color: BotaLoveColors.secondary,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    backgroundColor: '#FAFAFA',
  },
  chipSelected: {
    borderColor: BotaLoveColors.primary,
    backgroundColor: BotaLoveColors.primary,
  },
  chipText: {
    fontSize: 14,
    color: BotaLoveColors.textPrimary,
    fontWeight: '500',
  },
  chipTextSelected: {
    color: '#FFF',
    fontWeight: '600',
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  iconCard: {
    width: (width - 64) / 3,
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    backgroundColor: '#FAFAFA',
    position: 'relative',
  },
  iconCardSelected: {
    borderColor: BotaLoveColors.primary,
    backgroundColor: '#FFF9E6',
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  iconCircleSelected: {
    backgroundColor: BotaLoveColors.primary,
    borderColor: BotaLoveColors.primary,
  },
  iconCardText: {
    fontSize: 12,
    color: BotaLoveColors.textPrimary,
    textAlign: 'center',
    fontWeight: '500',
  },
  iconCardTextSelected: {
    fontWeight: '700',
    color: BotaLoveColors.secondary,
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#27AE60',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonBottom: {
    marginHorizontal: 20,
    marginTop: 30,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
  },
  saveButtonBottomText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  bottomSpacer: {
    height: 40,
  },
  // Estilos da Modal de Visualização de Foto
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
  },
  modalContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    right: 20,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: width,
    height: width * 1.3,
    borderRadius: 0,
  },
  modalPhotoBadge: {
    position: 'absolute',
    bottom: 100,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BotaLoveColors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  modalBadgeText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  navButton: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },
  navButtonLeft: {
    left: 20,
  },
  navButtonRight: {
    right: 20,
  },
  photoIndicator: {
    position: 'absolute',
    bottom: 40,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  indicatorDotActive: {
    backgroundColor: BotaLoveColors.primary,
    width: 24,
  },
  // Estilos para Produtor
  producerPhotoContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  producerPhotoWrapper: {
    position: 'relative',
  },
  producerPhoto: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#F0F0F0',
  },
  removeProducerPhotoButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#FFF',
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  addProducerPhotoBox: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#F8F9FA',
    borderWidth: 2,
    borderColor: '#9B59B6',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  addProducerPhotoText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9B59B6',
  },
  charCount: {
    fontSize: 12,
    color: BotaLoveColors.neutralMedium,
    textAlign: 'right',
    marginTop: 8,
  },
});
