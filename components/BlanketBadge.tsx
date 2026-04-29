import { View, Text, StyleSheet } from 'react-native';
import type { BlanketResult } from '@/lib/decision';

const labels: Record<BlanketResult['blanket'], string> = {
  no: 'Keine Decke',
  light: 'Leichte Decke (100 g)',
  medium: 'Mitteldecke (200 g)',
  heavy: 'Winterdecke (300 g+)',
};

const colors: Record<BlanketResult['blanket'], string> = {
  no: '#10b981',
  light: '#3b82f6',
  medium: '#f59e0b',
  heavy: '#ef4444',
};

export function BlanketBadge({ result }: { result: BlanketResult }) {
  return (
    <View style={[styles.badge, { backgroundColor: colors[result.blanket] }]}>
      <Text style={styles.text}>🛡️ {labels[result.blanket]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  text: { color: 'white', fontSize: 18, fontWeight: '700' },
});
