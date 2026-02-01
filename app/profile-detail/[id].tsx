import { BotaLoveColors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { MOCK_USERS } from '@/data/mockData';
import { likeUser } from '@/firebase/matchService';
import { useInventoryItemByName } from '@/firebase/planSubscriptionService';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
    Alert,
    Dimensions,
    FlatList,
    Image,
    Modal,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const ICONS = {
  abrePorteira: require('@/assets/images/icons/abre-porteira.png'),
  fechaPorteira: require('@/assets/images/icons/fecha-porteira.png'),
  superAgroUnlocked: require('@/assets/images/icons/super-agro-unlocked.png'),
  superAgroBlock: require('@/assets/images/icons/super-agro-block.png'),
  correioUnlocked: require('@/assets/images/icons/correio-da-roça-unlocked.png'),
  correioBlock: require('@/assets/images/icons/correio-da-roça-block.png'),
  retornoUnlocked: require('@/assets/images/icons/retorno-da-estrada-livre-unlocked.png'),
  retornoBlock: require('@/assets/images/icons/retorno-da-estrada-livre-block.png'),
};

const { width, height } = Dimensions.get('window');

export default function ProfileDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { hasPremium } = useAuth();
  const userId = params.id as string;
  const user = MOCK_USERS.find((u) => u.id === userId);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showReportModal, setShowReportModal] = useState(false);
  const carouselRef = useRef<FlatList>(null);

  if (!user) {
    return null;
  }

  const profileData = {
    height: '1,78m',
    children: 'Nao tem filhos',
    education: 'Ensino Superior',
    smoking: 'Nao fuma',
    drinking: 'Socialmente',
    religion: 'Catolico',
    zodiacSign: 'Leao',
    relationshipGoals: ['namoro', 'casamento'],
    ruralActivities: ['Pecuaria', 'Agricultura'],
    propertySize: 'Media propriedade (50-200 ha)',
    animals: ['Bovinos', 'Equinos', 'Caes'],
    crops: ['Soja', 'Milho'],
    musicalStyles: ['Sertanejo', 'Country', 'Forro'],
    hobbies: ['Cavalgada', 'Pesca', 'Churrasco'],
    personalTastes: ['Vida no campo', 'Animais', 'Natureza'],
    pets: ['Cachorro', 'Gato'],
    agroAreas: user.agroAreas || ['Pecuaria de Corte', 'Graos'],
  };

  const handleRespond = () => {
    Alert.alert('Responder', 'Enviar mensagem para ' + user.name);
  };

  const handleLike = () => {
    Alert.alert('Curtiu!', 'Voce curtiu ' + user.name);
  };

  const handleDislike = () => {
    router.back();
  };

  const handleSuperAgro = async () => {
    if (!currentUser?.id) {
      Alert.alert('Erro', 'Você precisa estar logado');
      return;
    }
    
    // Verificar e consumir item Super Agro do inventário
    const consumeResult = await useInventoryItemByName(currentUser.id, 'Super Agro', 1);
    if (!consumeResult.success) {
      console.log('❌ Sem Super Agro disponível:', consumeResult.error);
      Alert.alert(
        'Super Agro',
        'Você não tem Super Agro disponível. Deseja comprar mais?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Comprar', onPress: () => router.push('/store') },
        ]
      );
      return;
    }
    
    console.log(`✅ Super Agro usado! Restante: ${consumeResult.remaining}`);
    
    // Registrar super like no Firebase
    try {
      const result = await likeUser(currentUser.id, user.id, true);
      if (result.isMatch) {
        Alert.alert('🎉 Match!', `Você e ${user.name} deram match!`);
      } else {
        Alert.alert('Super Agro! ⭐', `Você deu Super Agro em ${user.name}`);
      }
    } catch (error) {
      console.error('Erro ao dar super agro:', error);
      Alert.alert('Super Agro! ⭐', `Você deu Super Agro em ${user.name}`);
    }
  };

  const handleBlock = () => {
    Alert.alert('Bloquear', 'Tem certeza que deseja bloquear ' + user.name + '?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Bloquear', style: 'destructive', onPress: () => router.back() },
    ]);
  };

  const handleReport = () => {
    setShowReportModal(true);
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentPhotoIndex(viewableItems[0].index || 0);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const translateGoal = (goal: string) => {
    const translations: { [key: string]: string } = {
      'amizade': 'Amizade',
      'namoro': 'Namoro',
      'casamento': 'Casamento',
      'eventos': 'Eventos',
      'network': 'Networking',
    };
    return translations[goal] || goal;
  };

  const getGoalIcon = (goal: string) => {
    const icons: { [key: string]: string } = {
      'amizade': 'people',
      'namoro': 'heart',
      'casamento': 'diamond',
      'eventos': 'calendar',
      'network': 'briefcase',
    };
    return icons[goal] || 'heart';
  };

  const getAnimalIcon = (animal: string): string => {
    const animalIcons: { [key: string]: string } = {
      'Bovinos': 'cow',
      'Equinos': 'horse',
      'Suinos': 'pig',
      'Ovinos': 'sheep',
      'Aves': 'bird',
      'Caprinos': 'goat',
      'Peixes': 'fish',
      'Caes': 'dog',
      'Gatos': 'cat',
      'Cachorro': 'dog',
      'Gato': 'cat',
      'Passaro': 'bird',
    };
    return animalIcons[animal] || 'paw';
  };

  // Ícones para atividades rurais
  const getRuralActivityIcon = (activity: string): string => {
    const activityIcons: { [key: string]: string } = {
      'Agricultura': 'corn',
      'Pecuária': 'cow',
      'Pecuária de Corte': 'cow',
      'Pecuária de Leite': 'cow',
      'Pecuária Leiteira': 'cow',
      'Clínica de Pequenos Animais': 'dog',
      'Clínica de Grandes Animais': 'horse',
      'Veterinária': 'paw',
      'Avicultura': 'bird',
      'Suinocultura': 'pig',
      'Ovinocultura': 'sheep',
      'Caprinocultura': 'goat',
      'Piscicultura': 'fish',
      'Apicultura': 'bee',
      'Silvicultura': 'tree',
    };
    return activityIcons[activity] || 'tractor-variant';
  };

  // Ícones para culturas/plantio
  const getCropIcon = (crop: string): string => {
    const cropIcons: { [key: string]: string } = {
      'Soja': 'sprout',
      'Milho': 'corn',
      'Sorgo': 'barley',
      'Trigo': 'barley',
      'Arroz': 'grain',
      'Feijão': 'seed',
      'Café': 'coffee',
      'Cana': 'grass',
      'Algodão': 'flower',
      'Outros': 'leaf',
    };
    return cropIcons[crop] || 'sprout';
  };

  const renderPhotoItem = ({ item, index }: { item: string; index: number }) => (
    <View style={styles.photoSlide}>
      <Image source={{ uri: item }} style={styles.heroPhoto} />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.heroGradient}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <FlatList
            ref={carouselRef}
            data={user.photos}
            renderItem={renderPhotoItem}
            keyExtractor={(item, index) => 'photo-' + index}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
          />

          <View style={styles.photoIndicators}>
            {user.photos.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.photoIndicator,
                  index === currentPhotoIndex && styles.photoIndicatorActive,
                ]}
              />
            ))}
          </View>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={28} color="#FFF" />
          </TouchableOpacity>

          <View style={styles.topActions}>
            <TouchableOpacity style={styles.topActionButton} onPress={handleBlock}>
              <Ionicons name="ban-outline" size={22} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.topActionButton} onPress={handleReport}>
              <Ionicons name="flag-outline" size={22} color="#FFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.photoCounter}>
            <Ionicons name="images" size={16} color="#FFF" />
            <Text style={styles.photoCounterText}>
              {currentPhotoIndex + 1}/{user.photos.length}
            </Text>
          </View>

          <View style={styles.infoOverlay}>
            <View style={styles.nameRow}>
              <Text style={styles.userName}>
                {user.name}, {user.age}
              </Text>
              <TouchableOpacity style={styles.respondButton} onPress={handleRespond}>
                <Ionicons name="chatbubble" size={18} color="#FFF" />
                <Text style={styles.respondButtonText}>Responder</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.locationRow}>
              <Ionicons name="location" size={16} color="#FFF" />
              <Text style={styles.location}>
                {user.city}, {user.state}
                {user.distance && ' - ' + user.distance + ' km'}
              </Text>
            </View>
            <View style={styles.occupationRow}>
              <Ionicons name="briefcase" size={16} color="#FFF" />
              <Text style={styles.occupation}>{user.occupation}</Text>
            </View>
          </View>
        </View>

        <View style={styles.swipeHint}>
          <Ionicons name="swap-horizontal" size={16} color={BotaLoveColors.neutralMedium} />
          <Text style={styles.swipeHintText}>Deslize para ver mais fotos</Text>
        </View>

        <View style={styles.sectionCard}>
          <LinearGradient
            colors={[BotaLoveColors.primary, BotaLoveColors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.sectionHeaderGradient}
          >
            <Ionicons name="search" size={22} color="#FFF" />
            <Text style={styles.sectionHeaderText}>Estou procurando</Text>
          </LinearGradient>
          <View style={styles.sectionContent}>
            <View style={styles.goalsContainer}>
              {profileData.relationshipGoals.map((goal, index) => (
                <View key={index} style={styles.goalTag}>
                  <Ionicons name={getGoalIcon(goal) as any} size={18} color={BotaLoveColors.primary} />
                  <Text style={styles.goalText}>{translateGoal(goal)}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person-outline" size={22} color={BotaLoveColors.primary} />
            <Text style={styles.sectionTitle}>Sobre</Text>
          </View>
          <Text style={styles.bio}>{user.bio}</Text>
        </View>

        <View style={styles.sectionCard}>
          <LinearGradient
            colors={[BotaLoveColors.primary, BotaLoveColors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.sectionHeaderGradient}
          >
            <Ionicons name="information-circle" size={22} color="#FFF" />
            <Text style={styles.sectionHeaderText}>Informacoes Basicas</Text>
          </LinearGradient>
          
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <View style={[styles.infoIconCircle, { backgroundColor: '#FFF5E6' }]}>
                <Ionicons name="navigate" size={18} color={BotaLoveColors.primary} />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Distancia</Text>
                <Text style={styles.infoValue}>{user.distance} km</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <View style={[styles.infoIconCircle, { backgroundColor: '#FFF5E6' }]}>
                <MaterialCommunityIcons name="ruler" size={18} color={BotaLoveColors.primary} />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Altura</Text>
                <Text style={styles.infoValue}>{profileData.height}</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <View style={[styles.infoIconCircle, { backgroundColor: '#FFF5E6' }]}>
                <Ionicons name="people" size={18} color={BotaLoveColors.primary} />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Filhos</Text>
                <Text style={styles.infoValue}>{profileData.children}</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <View style={[styles.infoIconCircle, { backgroundColor: '#FFF5E6' }]}>
                <Ionicons name="school" size={18} color={BotaLoveColors.primary} />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Formacao</Text>
                <Text style={styles.infoValue}>{profileData.education}</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <View style={[styles.infoIconCircle, { backgroundColor: '#FFF5E6' }]}>
                <Ionicons name="briefcase" size={18} color={BotaLoveColors.primary} />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Profissao</Text>
                <Text style={styles.infoValue}>{user.occupation}</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <View style={[styles.infoIconCircle, { backgroundColor: '#FFF5E6' }]}>
                <Ionicons name="star-outline" size={18} color={BotaLoveColors.primary} />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Signo</Text>
                <Text style={styles.infoValue}>{profileData.zodiacSign}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <LinearGradient
            colors={['#27AE60', '#229954']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.sectionHeaderGradient}
          >
            <Ionicons name="leaf" size={22} color="#FFF" />
            <Text style={styles.sectionHeaderText}>Estilo de Vida</Text>
          </LinearGradient>
          
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <View style={[styles.infoIconCircle, { backgroundColor: '#F0FFF4' }]}>
                <Ionicons name="wine" size={18} color="#27AE60" />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Bebida</Text>
                <Text style={styles.infoValue}>{profileData.drinking}</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <View style={[styles.infoIconCircle, { backgroundColor: '#F0FFF4' }]}>
                <MaterialCommunityIcons name="smoking-off" size={18} color="#27AE60" />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Fumante</Text>
                <Text style={styles.infoValue}>{profileData.smoking}</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <View style={[styles.infoIconCircle, { backgroundColor: '#F0FFF4' }]}>
                <Ionicons name="heart" size={18} color="#27AE60" />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Religiao</Text>
                <Text style={styles.infoValue}>{profileData.religion}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <LinearGradient
            colors={['#8B4513', '#A0522D']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.sectionHeaderGradient}
          >
            <MaterialCommunityIcons name="tractor" size={22} color="#FFF" />
            <Text style={styles.sectionHeaderText}>Vida Rural</Text>
          </LinearGradient>
          
          <View style={styles.sectionContent}>
            <View style={styles.subSection}>
              <Text style={styles.subSectionTitle}>Atividades</Text>
              <View style={styles.tagsContainer}>
                {profileData.ruralActivities.map((activity, index) => (
                  <View key={index} style={styles.ruralTag}>
                    <MaterialCommunityIcons name={getRuralActivityIcon(activity) as any} size={16} color="#8B4513" />
                    <Text style={styles.ruralTagText}>{activity}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.subSection}>
              <Text style={styles.subSectionTitle}>Propriedade</Text>
              <View style={styles.propertyBadge}>
                <MaterialCommunityIcons name="home-variant" size={18} color="#8B4513" />
                <Text style={styles.propertyText}>{profileData.propertySize}</Text>
              </View>
            </View>

            <View style={styles.subSection}>
              <Text style={styles.subSectionTitle}>Animais</Text>
              <View style={styles.tagsContainer}>
                {profileData.animals.map((animal, index) => (
                  <View key={index} style={styles.animalTag}>
                    <MaterialCommunityIcons name={getAnimalIcon(animal) as any} size={18} color="#8B4513" />
                    <Text style={styles.animalTagText}>{animal}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.subSection}>
              <Text style={styles.subSectionTitle}>Culturas</Text>
              <View style={styles.tagsContainer}>
                {profileData.crops.map((crop, index) => (
                  <View key={index} style={styles.cropTag}>
                    <MaterialCommunityIcons name={getCropIcon(crop) as any} size={16} color="#27AE60" />
                    <Text style={styles.cropTagText}>{crop}</Text>
                  </View>
                ))}
              </View>
            </View>

            {profileData.agroAreas.length > 0 && (
              <View style={styles.subSection}>
                <Text style={styles.subSectionTitle}>Areas de Atuacao</Text>
                <View style={styles.tagsContainer}>
                  {profileData.agroAreas.map((area, index) => (
                    <View key={index} style={styles.agroTag}>
                      <Ionicons name="leaf" size={14} color="#27AE60" />
                      <Text style={styles.agroTagText}>{area}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        </View>

        <View style={styles.sectionCard}>
          <LinearGradient
            colors={['#9B59B6', '#8E44AD']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.sectionHeaderGradient}
          >
            <Ionicons name="musical-notes" size={22} color="#FFF" />
            <Text style={styles.sectionHeaderText}>Preferencias</Text>
          </LinearGradient>
          
          <View style={styles.sectionContent}>
            <View style={styles.subSection}>
              <Text style={styles.subSectionTitle}>Estilos Musicais</Text>
              <View style={styles.tagsContainer}>
                {profileData.musicalStyles.map((style, index) => (
                  <View key={index} style={styles.musicTag}>
                    <Ionicons name="musical-note" size={14} color="#9B59B6" />
                    <Text style={styles.musicTagText}>{style}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.subSection}>
              <Text style={styles.subSectionTitle}>Hobbies</Text>
              <View style={styles.tagsContainer}>
                {profileData.hobbies.map((hobby, index) => (
                  <View key={index} style={styles.hobbyTag}>
                    <Ionicons name="heart" size={14} color="#E74C3C" />
                    <Text style={styles.hobbyTagText}>{hobby}</Text>
                  </View>
                ))}
              </View>
            </View>

            {profileData.pets.length > 0 && (
              <View style={styles.subSection}>
                <Text style={styles.subSectionTitle}>Pets</Text>
                <View style={styles.tagsContainer}>
                  {profileData.pets.map((pet, index) => (
                    <View key={index} style={styles.petTag}>
                      <MaterialCommunityIcons name={getAnimalIcon(pet) as any} size={16} color="#E67E22" />
                      <Text style={styles.petTagText}>{pet}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="heart-outline" size={22} color={BotaLoveColors.primary} />
            <Text style={styles.sectionTitle}>Interesses</Text>
          </View>
          <View style={styles.interestsContainer}>
            {user.interests.map((interest, index) => (
              <View key={index} style={styles.interestTag}>
                <Text style={styles.interestText}>{interest}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.inviteSection}>
          <LinearGradient
            colors={['#9B59B6', '#8E44AD']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.inviteGradient}
          >
            <Ionicons name="people" size={32} color="#FFF" />
            <Text style={styles.inviteTitle}>Chame seus amigos pra dar match de cupido</Text>
            <Text style={styles.inviteSubtitle}>Compartilhe o Bota Love e ajude seus amigos a encontrarem o amor no campo</Text>
            <TouchableOpacity style={styles.inviteButton}>
              <Ionicons name="share-social" size={20} color="#9B59B6" />
              <Text style={styles.inviteButtonText}>Convidar</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <View style={styles.actionBar}>
        <LinearGradient
          colors={['#FFFFFF', '#F8F9FA']}
          style={styles.actionBarGradient}
        >
          <TouchableOpacity
            style={styles.retornoButton}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Image 
              source={hasPremium ? ICONS.retornoUnlocked : ICONS.retornoBlock} 
              style={styles.actionIconXSmall} 
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dislikeButton}
            onPress={handleDislike}
            activeOpacity={0.8}
          >
            <Image source={ICONS.fechaPorteira} style={styles.actionIconSmall} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.superAgroButton}
            onPress={handleSuperAgro}
            activeOpacity={0.8}
          >
            <Image 
              source={hasPremium ? ICONS.superAgroUnlocked : ICONS.superAgroBlock} 
              style={styles.actionIconMedium} 
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.likeButton}
            onPress={handleLike}
            activeOpacity={0.8}
          >
            <Image source={ICONS.abrePorteira} style={styles.actionIconLarge} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.correioButton}
            onPress={handleRespond}
            activeOpacity={0.8}
          >
            <Image 
              source={hasPremium ? ICONS.correioUnlocked : ICONS.correioBlock} 
              style={styles.actionIconMedium} 
            />
          </TouchableOpacity>
        </LinearGradient>
      </View>

      <Modal
        visible={showReportModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowReportModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Denunciar Perfil</Text>
            <Text style={styles.modalText}>Por que voce esta denunciando este perfil?</Text>
            
            <TouchableOpacity style={styles.modalOption}>
              <Text style={styles.modalOptionText}>Perfil falso</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.modalOption}>
              <Text style={styles.modalOptionText}>Comportamento inadequado</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.modalOption}>
              <Text style={styles.modalOptionText}>Fotos improprias</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.modalOption}>
              <Text style={styles.modalOptionText}>Spam ou golpe</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.modalCancelButton}
              onPress={() => setShowReportModal(false)}
            >
              <Text style={styles.modalCancelText}>Cancelar</Text>
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
    backgroundColor: '#F5F5F5',
  },
  heroSection: {
    width: width,
    height: height * 0.65,
    position: 'relative',
  },
  photoSlide: {
    width: width,
    height: height * 0.65,
  },
  heroPhoto: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heroGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '60%',
  },
  photoIndicators: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 80,
  },
  photoIndicator: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: 2,
  },
  photoIndicatorActive: {
    backgroundColor: '#FFF',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  topActions: {
    position: 'absolute',
    top: 80,
    right: 20,
    flexDirection: 'row',
    gap: 12,
  },
  topActionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  photoCounter: {
    position: 'absolute',
    top: 130,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  photoCounterText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  infoOverlay: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  userName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    flex: 1,
  },
  respondButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BotaLoveColors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  respondButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  location: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '500',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  occupationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  occupation: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '500',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  swipeHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    backgroundColor: '#FFF',
  },
  swipeHintText: {
    fontSize: 13,
    color: BotaLoveColors.neutralMedium,
  },
  sectionCard: {
    backgroundColor: '#FFF',
    marginTop: 10,
    marginHorizontal: 10,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionHeaderGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  sectionHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 20,
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: BotaLoveColors.secondary,
  },
  sectionContent: {
    padding: 20,
    paddingTop: 16,
  },
  bio: {
    fontSize: 15,
    color: BotaLoveColors.textPrimary,
    lineHeight: 24,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  goalsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  goalTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFF5E6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: BotaLoveColors.primary,
  },
  goalText: {
    fontSize: 15,
    fontWeight: '600',
    color: BotaLoveColors.secondary,
  },
  infoGrid: {
    padding: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  infoIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    color: BotaLoveColors.secondary,
    fontWeight: '600',
  },
  subSection: {
    marginBottom: 16,
  },
  subSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: BotaLoveColors.secondary,
    marginBottom: 10,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  ruralTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FDF5E6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#DEB887',
  },
  ruralTagText: {
    fontSize: 13,
    color: '#8B4513',
    fontWeight: '500',
  },
  propertyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FDF5E6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DEB887',
    alignSelf: 'flex-start',
  },
  propertyText: {
    fontSize: 14,
    color: '#8B4513',
    fontWeight: '600',
  },
  animalTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF8F0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#DEB887',
  },
  animalTagText: {
    fontSize: 13,
    color: '#8B4513',
    fontWeight: '500',
  },
  cropTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0FFF4',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#90EE90',
  },
  cropTagText: {
    fontSize: 13,
    color: '#228B22',
    fontWeight: '500',
  },
  agroTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0FFF4',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#90EE90',
  },
  agroTagText: {
    fontSize: 13,
    color: '#228B22',
    fontWeight: '500',
  },
  musicTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F5F0FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#DDA0DD',
  },
  musicTagText: {
    fontSize: 13,
    color: '#9B59B6',
    fontWeight: '500',
  },
  hobbyTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF0F0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FFB6C1',
  },
  hobbyTagText: {
    fontSize: 13,
    color: '#E74C3C',
    fontWeight: '500',
  },
  petTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF8F0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FFDAB9',
  },
  petTagText: {
    fontSize: 13,
    color: '#E67E22',
    fontWeight: '500',
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  interestTag: {
    backgroundColor: '#FFF5E6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: BotaLoveColors.primary,
  },
  interestText: {
    fontSize: 14,
    color: BotaLoveColors.secondary,
    fontWeight: '600',
  },
  inviteSection: {
    marginTop: 10,
    marginHorizontal: 10,
    marginBottom: 12,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  inviteGradient: {
    padding: 24,
    alignItems: 'center',
  },
  inviteTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  inviteSubtitle: {
    fontSize: 13,
    color: '#FFF',
    textAlign: 'center',
    opacity: 0.9,
    marginBottom: 20,
    lineHeight: 20,
  },
  inviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  inviteButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#9B59B6',
  },
  bottomSpacer: {
    height: 140,
  },
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -8 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
      },
      android: {
        elevation: 20,
      },
    }),
  },
  actionBarGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: Platform.OS === 'android' ? 28 : 40,
    paddingHorizontal: 20,
    gap: 16,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  retornoButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#F39C12',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#F39C12',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  dislikeButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#C0392B',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#C0392B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  actionIconXSmall: {
    width: 34,
    height: 34,
    resizeMode: 'contain',
  },
  actionIconSmall: {
    width: 42,
    height: 42,
    resizeMode: 'contain',
  },
  actionIconMedium: {
    width: 48,
    height: 48,
    resizeMode: 'contain',
  },
  actionIconLarge: {
    width: 56,
    height: 56,
    resizeMode: 'contain',
  },
  superAgroButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#B8944D',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#B8944D',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  likeButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#27AE60',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  correioButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#5D4037',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#3498DB',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 24,
    width: width - 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: BotaLoveColors.secondary,
    marginBottom: 8,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 15,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalOption: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalOptionText: {
    fontSize: 16,
    color: BotaLoveColors.textPrimary,
  },
  modalCancelButton: {
    marginTop: 16,
    paddingVertical: 14,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: BotaLoveColors.secondary,
  },
});
