import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import AnimatedHourglass from './AnimatedHourglass';
import { theme } from '../theme';

export default function AppSplash() {
  return (
    <View style={styles.container}>
      <AnimatedHourglass size={120} fillPct={0.5} drain cycleMs={3000} animate />
      <Text style={styles.title}>life count down</Text>
    </View>
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
