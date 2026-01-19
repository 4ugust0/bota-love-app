import { BotaLoveColors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function PublishEventScreen() {
  const router = useRouter();
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventPrice, setEventPrice] = useState('');

  const handlePublish = () => {
    if (!eventName || !eventDate || !eventLocation) {
      Alert.alert('Erro', 'Preencha os campos obrigatórios');
      return;
    }

    Alert.alert(
      'Evento Publicado!',
      `${eventName} foi publicado com sucesso. Você será redirecionado para o painel de produtor.`,
      [
        {
          text: 'OK',
          onPress: () => router.replace('/(tabs)'),
        },
      ]
    );
  };

  return (
    <LinearGradient
      colors={[BotaLoveColors.neutralLight, BotaLoveColors.backgroundWhite]}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={28} color={BotaLoveColors.secondary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Publicar Evento</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            <View style={styles.welcomeSection}>
              <View style={styles.iconCircle}>
                <Ionicons name="calendar" size={48} color={BotaLoveColors.primary} />
              </View>
              <Text style={styles.welcomeTitle}>Bem-vindo, Produtor!</Text>
              <Text style={styles.welcomeText}>
                Publique seu primeiro evento e comece a vender ingressos para a
                comunidade Bota Love
              </Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                Nome do evento <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Rodeio de São João"
                placeholderTextColor={BotaLoveColors.neutralMedium}
                value={eventName}
                onChangeText={setEventName}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                Data do evento <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="DD/MM/AAAA"
                placeholderTextColor={BotaLoveColors.neutralMedium}
                value={eventDate}
                onChangeText={setEventDate}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                Local <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Cidade - Estado"
                placeholderTextColor={BotaLoveColors.neutralMedium}
                value={eventLocation}
                onChangeText={setEventLocation}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Descrição</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Descreva seu evento..."
                placeholderTextColor={BotaLoveColors.neutralMedium}
                value={eventDescription}
                onChangeText={setEventDescription}
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Valor do ingresso</Text>
              <TextInput
                style={styles.input}
                placeholder="R$ 0,00"
                placeholderTextColor={BotaLoveColors.neutralMedium}
                value={eventPrice}
                onChangeText={setEventPrice}
                keyboardType="numeric"
              />
            </View>

            <TouchableOpacity style={styles.publishButton} onPress={handlePublish}>
              <LinearGradient
                colors={[BotaLoveColors.primary, '#d89515']}
                style={styles.publishButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="checkmark-circle" size={24} color="#FFF" />
                <Text style={styles.publishButtonText}>Publicar Evento</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

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
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: BotaLoveColors.backgroundWhite,
    borderBottomWidth: 1,
    borderBottomColor: BotaLoveColors.neutralLight,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: BotaLoveColors.secondary,
  },
  scrollContent: {
    paddingVertical: 20,
  },
  card: {
    backgroundColor: BotaLoveColors.backgroundWhite,
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 30,
    paddingBottom: 30,
    borderBottomWidth: 1,
    borderBottomColor: BotaLoveColors.neutralLight,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: BotaLoveColors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: BotaLoveColors.secondary,
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 15,
    color: BotaLoveColors.neutralDark,
    textAlign: 'center',
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: BotaLoveColors.secondary,
    marginBottom: 8,
  },
  required: {
    color: '#E74C3C',
  },
  input: {
    backgroundColor: BotaLoveColors.neutralLight,
    borderWidth: 1,
    borderColor: BotaLoveColors.neutralMedium,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: BotaLoveColors.textPrimary,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  publishButton: {
    marginTop: 10,
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: BotaLoveColors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  publishButtonGradient: {
    flexDirection: 'row',
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  publishButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
});
