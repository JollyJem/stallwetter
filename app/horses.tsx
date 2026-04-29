import { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { Link, useFocusEffect } from 'expo-router';
import { listHorses, deleteHorse, type Horse } from '@/lib/storage';

const RISK_LABEL: Record<Horse['risk'], string> = {
  low: 'Niedriges Risiko',
  medium: 'Mittleres Risiko',
  high: 'Hohes Risiko (Hufrehe)',
};

export default function HorsesScreen() {
  const [horses, setHorses] = useState<Horse[]>([]);

  const load = useCallback(async () => {
    setHorses(await listHorses());
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onDelete = (h: Horse) => {
    Alert.alert('Pferd löschen?', `${h.name} wirklich entfernen?`, [
      { text: 'Abbrechen', style: 'cancel' },
      {
        text: 'Löschen',
        style: 'destructive',
        onPress: async () => {
          await deleteHorse(h.id);
          await load();
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Link href="/horses/new" asChild>
        <Pressable style={styles.addButton}>
          <Text style={styles.addButtonText}>+ Pferd hinzufügen</Text>
        </Pressable>
      </Link>

      {horses.length === 0 ? (
        <Text style={styles.empty}>Noch keine Pferde angelegt.</Text>
      ) : (
        horses.map(h => (
          <View key={h.id} style={styles.card}>
            <Text style={styles.name}>{h.name}</Text>
            <Text style={styles.meta}>{RISK_LABEL[h.risk]}</Text>
            <Text style={styles.meta}>
              {h.clipped ? '✂️ geschoren' : '🐎 ungeschoren'}
              {h.sensitive ? ' · empfindlich' : ''}
            </Text>
            <Text style={styles.coords}>
              📍 {h.lat.toFixed(2)}, {h.lng.toFixed(2)}
            </Text>
            <Pressable onPress={() => onDelete(h)} style={styles.deleteButton}>
              <Text style={styles.deleteText}>Löschen</Text>
            </Pressable>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 16, paddingBottom: 40 },
  addButton: {
    backgroundColor: '#10b981',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  addButtonText: { color: 'white', fontSize: 17, fontWeight: '700' },
  empty: { fontSize: 16, color: '#6b7280', textAlign: 'center', marginTop: 24 },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 4,
  },
  name: { fontSize: 20, fontWeight: '800', color: '#111', marginBottom: 4 },
  meta: { fontSize: 14, color: '#4b5563' },
  coords: { fontSize: 13, color: '#9ca3af', marginTop: 4 },
  deleteButton: {
    marginTop: 12,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#fef2f2',
  },
  deleteText: { color: '#ef4444', fontWeight: '600' },
});
