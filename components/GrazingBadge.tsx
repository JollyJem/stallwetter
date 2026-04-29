import { View, Text, StyleSheet } from 'react-native';
import type { GrazingResult } from '@/lib/decision';

const labels: Record<GrazingResult['grazing'], string> = {
  safe: 'Weidegang sicher',
  caution: 'Vorsicht beim Weiden',
  risky: 'Kein Weidegang',
};

const colors: Record<GrazingResult['grazing'], string> = {
  safe: '#10b981',
  caution: '#f59e0b',
  risky: '#ef4444',
};

export function GrazingBadge({ result }: { result: GrazingResult }) {
  return (
    <View style={[styles.badge, { backgroundColor: colors[result.grazing] }]}>
      <Text style={styles.text}>🌱 {labels[result.grazing]}</Text>
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
