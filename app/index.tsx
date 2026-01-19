import { BotaLoveColors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();

  // Enquanto verifica autenticação, mostra loading
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: BotaLoveColors.primary }}>
        <ActivityIndicator size="large" color="#FFF" />
      </View>
    );
  }

  // Se já está autenticado, vai direto para o app
  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  // Se não está autenticado, vai para onboarding
  return <Redirect href="/onboarding" />;
}
