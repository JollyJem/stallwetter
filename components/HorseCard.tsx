import { View, Text, StyleSheet } from 'react-native';
import { BlanketBadge } from './BlanketBadge';
import { GrazingBadge } from './GrazingBadge';
import type { BlanketResult, GrazingResult } from '@/lib/decision';

type Props = {
  name: string;
  blanket: BlanketResult;
  grazing: GrazingResult;
};

export function HorseCard({ name, blanket, grazing }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.name}>{name}</Text>

      <BlanketBadge result={blanket} />
      <Text style={styles.reason}>{blanket.reason}</Text>

      <View style={styles.spacer} />

      <GrazingBadge result={grazing} />
      <Text style={styles.reason}>{grazing.reason}</Text>
      {grazing.bestWindow !== '—' && (
        <Text style={styles.window}>Bestes Zeitfenster: {grazing.bestWindow}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 8,
  },
  name: { fontSize: 22, fontWeight: '800', marginBottom: 6, color: '#111' },
  reason: { color: '#4b5563', fontSize: 14, lineHeight: 20 },
  spacer: { height: 8 },
  window: { color: '#374151', fontSize: 13, fontWeight: '600', marginTop: 4 },
});
