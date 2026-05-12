import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View, Platform } from 'react-native';
import {
  useFonts,
  InstrumentSerif_400Regular,
  InstrumentSerif_400Regular_Italic,
} from '@expo-google-fonts/instrument-serif';
import { Inter_400Regular, Inter_500Medium } from '@expo-google-fonts/inter';
import {
  JetBrainsMono_400Regular,
  JetBrainsMono_500Medium,
} from '@expo-google-fonts/jetbrains-mono';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Notifications from 'expo-notifications';
import Navigation, { navigationRef } from './src/navigation';
import { LanguageProvider } from './src/i18n';
import AppSplash from './src/components/AppSplash';
import { rescheduleIfEnabled } from './src/notifications';

export default function App() {
  const [fontsLoaded] = useFonts({
    InstrumentSerif_400Regular,
    InstrumentSerif_400Regular_Italic,
    Inter_400Regular,
    Inter_500Medium,
    JetBrainsMono_400Regular,
    JetBrainsMono_500Medium,
  });

  const [splashVisible, setSplashVisible] = useState(true);
  const splashOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener(() => {
      if (navigationRef.isReady()) {
        (navigationRef as any).navigate('Main', { screen: 'CheckIn' });
      }
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (!fontsLoaded) return;
    rescheduleIfEnabled();
    const t = setTimeout(() => {
      Animated.timing(splashOpacity, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }).start(() => setSplashVisible(false));
    }, 1500);
    return () => clearTimeout(t);
  }, [fontsLoaded]);

  const inner = (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <LanguageProvider>
          {fontsLoaded && <Navigation />}
          {splashVisible && (
            <Animated.View style={[StyleSheet.absoluteFill, { opacity: splashOpacity, backgroundColor: '#eadfc3' }]}>
              <AppSplash />
            </Animated.View>
          )}
        </LanguageProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );

  if (Platform.OS === 'web') {
    return (
      <View style={styles.webOuter}>
        <View style={styles.webPhone}>{inner}</View>
      </View>
    );
  }

  return inner;
}

const styles = StyleSheet.create({
  webOuter: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#1c1c1c',
  },
  webPhone: {
    width: 400,
    flex: 1,
    overflow: 'hidden',
    // @ts-ignore — web-only shadow
    boxShadow: '0 0 60px rgba(0,0,0,0.5)',
  },
});
