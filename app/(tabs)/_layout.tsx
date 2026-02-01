import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HapticTab } from '@/components/haptic-tab';
import { BotaLoveColors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { userType, isAgroUser } = useAuth();
  const isProducer = userType === 'producer';
  const insets = useSafeAreaInsets();

  // Calcular padding bottom baseado na safe area do dispositivo
  const bottomPadding = Math.max(insets.bottom, Platform.OS === 'android' ? 10 : 5);
  const tabBarHeight = 60 + bottomPadding;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: BotaLoveColors.primary,
        tabBarInactiveTintColor: BotaLoveColors.neutralMedium,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: BotaLoveColors.backgroundWhite,
          borderTopWidth: 1,
          borderTopColor: '#E8E8E8',
          height: tabBarHeight,
          paddingBottom: bottomPadding,
          paddingTop: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 10,
        },
        tabBarShowLabel: false,
      }}
      initialRouteName={isProducer ? 'events' : 'index'}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="fire" size={28} color={color} />,
          href: isProducer ? null : undefined,
        }}
      />
      <Tabs.Screen
        name="matches"
        options={{
          title: '',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="heart" size={28} color={color} />,
          href: isProducer ? null : undefined,
        }}
      />
      <Tabs.Screen
        name="store"
        options={{
          title: '',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="cart" size={28} color={color} />,
          href: isProducer ? null : undefined,
        }}
      />
      <Tabs.Screen
        name="network-rural"
        options={{
          title: '',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="sprout" size={28} color={color} />,
          // Só aparece para usuários "Sou Agro" e que não são produtores
          href: isAgroUser && !isProducer ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          title: '',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="calendar" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="create-event"
        options={{
          title: '',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="plus-circle" size={28} color={color} />,
          href: isProducer ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="event-history"
        options={{
          title: '',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="clipboard-text" size={28} color={color} />,
          href: isProducer ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="account" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          href: null, // Hidden tab
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          href: null, // Hidden tab
        }}
      />
    </Tabs>
  );
}
