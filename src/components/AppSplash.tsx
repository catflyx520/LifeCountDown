import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import AnimatedHourglass from './AnimatedHourglass';
import { theme } from '../theme';

export default function AppSplash() {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      <AnimatedHourglass size={120} fillPct={0.5} drain cycleMs={3000} animate />
      <Text style={styles.title}>life count down</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  title: {
    fontFamily: 'serif',
    fontSize: 22,
    color: theme.fg,
    letterSpacing: 4,
  },
});
