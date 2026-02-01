import {
  Montserrat_600SemiBold,
  Montserrat_800ExtraBold,
} from '@expo-google-fonts/montserrat';
import {
  PlayfairDisplay_400Regular,
  PlayfairDisplay_400Regular_Italic,
  PlayfairDisplay_500Medium,
  useFonts,
} from '@expo-google-fonts/playfair-display';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { LocationInitializer } from '@/components/LocationInitializer';
import ProfileGuard from '@/components/ProfileGuard';
import { AuthProvider } from '@/contexts/AuthContext';
import { FreePlanProvider } from '@/contexts/FreePlanContext';
import { SignupProvider } from '@/contexts/SignupContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

// Previne o splash screen de esconder automaticamente
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  // Nova tela splash premium como ponto inicial
  initialRouteName: 'onboarding-splash',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  // 🎨 Carregamento das fontes premium do sistema tipográfico
  const [fontsLoaded, fontError] = useFonts({
    // Playfair Display - Títulos elegantes e sofisticados
    'PlayfairDisplay-Regular': PlayfairDisplay_400Regular,
    'PlayfairDisplay-Medium': PlayfairDisplay_500Medium,
    'PlayfairDisplay-Italic': PlayfairDisplay_400Regular_Italic,

    // Montserrat - Informações e interesses de impacto
    // Nota: Montserrat Condensed não está disponível no Expo Google Fonts
    // Usamos Montserrat SemiBold como fallback
    'MontserratCondensed-SemiBold': Montserrat_600SemiBold,
    'Montserrat-ExtraBold': Montserrat_800ExtraBold,
  });

  // Esconde o splash screen quando as fontes carregarem
  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Aguarda o carregamento das fontes
  if (!fontsLoaded && !fontError) {
    return null;
  }

  // Log de erro de fonte (apenas desenvolvimento)
  if (fontError) {
    console.warn('Erro ao carregar fontes:', fontError);
  }

  return (
    <AuthProvider>
      <SignupProvider>
        <FreePlanProvider>
          <LocationInitializer>
            <ProfileGuard>
              <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                <Stack>
                  {/* 🌟 Nova splash screen premium - primeira tela */}
                  <Stack.Screen name="onboarding-splash" options={{ headerShown: false, animation: 'fade' }} />
                  <Stack.Screen name="onboarding" options={{ headerShown: false }} />
                  <Stack.Screen name="login" options={{ headerShown: false }} />
                  <Stack.Screen name="signup" options={{ headerShown: false }} />
                  <Stack.Screen name="forgot-password" options={{ headerShown: false }} />
                  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                  <Stack.Screen name="chat/[id]" options={{ headerShown: false }} />
                  <Stack.Screen name="profile-detail/[id]" options={{ headerShown: false }} />
                  <Stack.Screen name="notifications" options={{ headerShown: false }} />
                  <Stack.Screen name="help" options={{ headerShown: false }} />
                  <Stack.Screen name="terms" options={{ headerShown: false }} />
                  <Stack.Screen name="store" options={{ headerShown: false }} />
                  <Stack.Screen name="onboarding-profile" options={{ headerShown: false }} />
                  <Stack.Screen name="onboarding-gender" options={{ headerShown: false }} />
                  <Stack.Screen name="onboarding-goals" options={{ headerShown: false }} />
                  <Stack.Screen name="onboarding-looking-for" options={{ headerShown: false }} />
                  <Stack.Screen name="onboarding-final" options={{ headerShown: false }} />
                  <Stack.Screen name="onboarding-orientation" options={{ headerShown: false }} />
                  <Stack.Screen name="signup-confirm" options={{ headerShown: false }} />
                  <Stack.Screen name="signup-email" options={{ headerShown: false }} />
                  <Stack.Screen name="signup-name" options={{ headerShown: false }} />
                  <Stack.Screen name="signup-birthdate" options={{ headerShown: false }} />
                  <Stack.Screen name="signup-gender-preference" options={{ headerShown: false }} />
                  <Stack.Screen name="signup-password" options={{ headerShown: false }} />
                  <Stack.Screen name="signup-terms" options={{ headerShown: false }} />
                  <Stack.Screen name="edit-profile" options={{ headerShown: false }} />
                  <Stack.Screen name="discovery-settings" options={{ headerShown: false }} />
                  <Stack.Screen name="advanced-filters" options={{ headerShown: false }} />
                  <Stack.Screen name="event-location" options={{ headerShown: false }} />
                  <Stack.Screen name="signup-verify-email" options={{ headerShown: false }} />
                  <Stack.Screen name="plans" options={{ headerShown: false }} />
                  <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
                  <Stack.Screen name="linkedin-connect" options={{ headerShown: false }} />
                  <Stack.Screen name="premium-checkout" options={{ headerShown: false }} />
                  <Stack.Screen name="premium-thank-you" options={{ headerShown: false }} />
                  <Stack.Screen name="settings" options={{ headerShown: false }} />
                  <Stack.Screen name="agrolove-preferences" options={{ headerShown: false }} />
                </Stack>
                <StatusBar style="auto" />
              </ThemeProvider>
            </ProfileGuard>
          </LocationInitializer>
        </FreePlanProvider>
      </SignupProvider>
    </AuthProvider>
  );
}
