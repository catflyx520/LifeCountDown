import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { theme, fonts } from '../theme';
import { loadUser } from '../storage';
import { RootStackParamList, MainTabParamList } from '../types';
import { useT } from '../i18n';

// Screens
import OnboardingScreen from '../screens/OnboardingScreen';
import AgeScreen from '../screens/AgeScreen';
import ModeScreen from '../screens/ModeScreen';
import ManualScreen from '../screens/ManualScreen';
import QuizScreen from '../screens/QuizScreen';
import DashboardScreen from '../screens/DashboardScreen';
import FiguresScreen from '../screens/FiguresScreen';
import CapsuleScreen from '../screens/CapsuleScreen';
import HourglassScreen from '../screens/HourglassScreen';
import WidgetPreviewScreen from '../screens/WidgetPreviewScreen';
import CommunityScreen from '../screens/CommunityScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// SVG-free tab icons using Unicode / text glyphs
function TabIcon({ name, active }: { name: string; active: boolean }) {
  const icons: Record<string, string> = {
    Dashboard: '⌂',
    Figures: '◎',
    Capsule: '◉',
    Community: '◈',
    Settings: '⊙',
  };
  return (
    <Text style={{ fontSize: 20, color: active ? theme.accent : theme.muted }}>
      {icons[name] ?? '●'}
    </Text>
  );
}

function MainTabs() {
  const { s } = useT();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
          borderTopWidth: 1,
          height: 72,
          paddingBottom: 12,
          paddingTop: 8,
        },
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.muted,
        tabBarLabelStyle: {
          fontFamily: fonts.mono,
          fontSize: 8,
          letterSpacing: 1.5,
          textTransform: 'uppercase',
        },
        tabBarIcon: ({ focused }) => (
          <TabIcon name={route.name} active={focused} />
        ),
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ tabBarLabel: s.tabDashboard }} />
      <Tab.Screen name="Figures" component={FiguresScreen} options={{ tabBarLabel: s.tabFigures }} />
      <Tab.Screen name="Capsule" component={CapsuleScreen} options={{ tabBarLabel: s.tabCapsule }} />
      <Tab.Screen name="Community" component={CommunityScreen} options={{ tabBarLabel: s.tabCommunity }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ tabBarLabel: s.tabSettings }} />
    </Tab.Navigator>
  );
}

export default function Navigation() {
  const [initialRoute, setInitialRoute] = useState<keyof RootStackParamList | null>(null);

  useEffect(() => {
    loadUser().then(u => {
      if (u.mode !== null && u.daysLeft > 0) {
        setInitialRoute('Main');
      } else if (u.age !== 28 || u.birthdate) {
        // Age was set but mode was not — resume from Mode screen
        setInitialRoute('Mode');
      } else {
        setInitialRoute('Onboarding');
      }
    });
  }, []);

  if (!initialRoute) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={theme.accent} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={initialRoute}>
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Age" component={AgeScreen} />
        <Stack.Screen name="Mode" component={ModeScreen} />
        <Stack.Screen name="Manual" component={ManualScreen} />
        <Stack.Screen name="Quiz" component={QuizScreen} />
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen name="Hourglass" component={HourglassScreen} />
        <Stack.Screen name="WidgetPreview" component={WidgetPreviewScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
