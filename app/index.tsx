import { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { Link, useFocusEffect } from 'expo-router';
import { listHorses, type Horse } from '@/lib/storage';
import { fetchWeather } from '@/lib/weather';
import { decide, type BlanketResult, type GrazingResult } from '@/lib/decision';

type Row = {
  horse: Horse;
  blanket: BlanketResult;
  grazing: GrazingResult;
};

const BLANKET_LABEL: Record<BlanketResult['blanket'], string> = {
  no: 'Keine Decke',
  light: 'Leichte Decke',
  medium: 'Mittlere Decke',
  heavy: 'Dicke Decke',
};

const BLANKET_COLOR: Record<BlanketResult['blanket'], string> = {
  no: '#10b981',
  light: '#f59e0b',
  medium: '#ea580c',
  heavy: '#1e3a8a',
};

const GRAZING_LABEL: Record<GrazingResult['grazing'], string> = {
  safe: 'Weide OK',
  caution: 'Vorsicht',
  risky: 'Kein Gras',
};

const GRAZING_COLOR: Record<GrazingResult['grazing'], string> = {
  safe: '#10b981',
  caution: '#f59e0b',
  risky: '#dc2626',
};

export default function TodayScreen() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const horses = await listHorses();
      if (horses.length === 0) {
        setRows([]);
        return;
      }
      const cache = new Map<string, Awaited<ReturnType<typeof fetchWeather>>>();
      const result: Row[] = [];
      for (const h of horses) {
        const key = `${h.lat.toFixed(2)},${h.lng.toFixed(2)}`;
        if (!cache.has(key)) cache.set(key, await fetchWeather(h.lat, h.lng));
        const d = decide(h, cache.get(key)!);
        result.push({ horse: h, blanket: d.blanket, grazing: d.grazing });
      }
      setRows(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unbekannter Fehler');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load();
    }, [load])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load();
  }, [load]);

  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
        <Pressable
          style={styles.primaryButton}
          onPress={() => {
            setLoading(true);
            load();
          }}
        >
          <Text style={styles.primaryButtonText}>Erneut versuchen</Text>
        </Pressable>
      </View>
    );
  }

  if (rows.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.empty}>Noch keine Pferde angelegt.</Text>
        <Link href="/horses/new" asChild>
          <Pressable style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Erstes Pferd hinzufügen</Text>
          </Pressable>
        </Link>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={styles.heading}>Heute</Text>

      {rows.map(row => (
        <View key={row.horse.id} style={styles.card}>
          <Text style={styles.name}>{row.horse.name}</Text>

          <View
            style={[styles.decision, { backgroundColor: BLANKET_COLOR[row.blanket.blanket] }]}
          >
            <Text style={styles.decisionLabel}>Decke</Text>
            <Text style={styles.decisionValue}>{BLANKET_LABEL[row.blanket.blanket]}</Text>
          </View>

          <View
            style={[styles.decision, { backgroundColor: GRAZING_COLOR[row.grazing.grazing] }]}
          >
            <Text style={styles.decisionLabel}>Weide</Text>
            <Text style={styles.decisionValue}>{GRAZING_LABEL[row.grazing.grazing]}</Text>
          </View>
        </View>
      ))}

      <Link href="/horses" asChild>
        <Pressable style={styles.manageButton}>
          <Text style={styles.manageButtonText}>Pferde verwalten</Text>
        </Pressable>
      </Link>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 16, paddingBottom: 40 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
    backgroundColor: '#f9fafb',
  },

  heading: { fontSize: 34, fontWeight: '900', marginBottom: 20, color: '#111' },
  empty: { fontSize: 18, color: '#4b5563', textAlign: 'center' },
  error: { fontSize: 18, color: '#ef4444', textAlign: 'center' },

  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 14,
  },
  name: { fontSize: 28, fontWeight: '900', color: '#111' },

  decision: {
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  decisionLabel: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  decisionValue: {
    color: 'white',
    fontSize: 30,
    fontWeight: '900',
    textAlign: 'center',
  },

  primaryButton: {
    backgroundColor: '#10b981',
    paddingVertical: 18,
    paddingHorizontal: 28,
    borderRadius: 14,
    alignItems: 'center',
    minWidth: 240,
  },
  primaryButtonText: { color: 'white', fontSize: 18, fontWeight: '800' },

  manageButton: {
    backgroundColor: 'white',
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#111',
    marginTop: 8,
  },
  manageButtonText: { color: '#111', fontSize: 18, fontWeight: '800' },
});
