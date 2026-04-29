import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Switch,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import { addHorse, type Horse } from '@/lib/storage';

export default function NewHorseScreen() {
  const [name, setName] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [clipped, setClipped] = useState(false);
  const [sensitive, setSensitive] = useState(false);
  const [risk, setRisk] = useState<Horse['risk']>('low');
  const [locating, setLocating] = useState(false);
  const [saving, setSaving] = useState(false);

  const useLocation = async () => {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Standort verweigert', 'Bitte erlaube den Standortzugriff in den Einstellungen.');
        return;
      }
      const pos = await Location.getCurrentPositionAsync({});
      setCoords({
        lat: Math.round(pos.coords.latitude * 100) / 100,
        lng: Math.round(pos.coords.longitude * 100) / 100,
      });
    } catch (e) {
      Alert.alert('Fehler', e instanceof Error ? e.message : 'Standort konnte nicht ermittelt werden.');
    } finally {
      setLocating(false);
    }
  };

  const onSave = async () => {
    if (!name.trim()) {
      Alert.alert('Name fehlt', 'Bitte gib einen Namen für das Pferd ein.');
      return;
    }
    if (!coords) {
      Alert.alert('Standort fehlt', 'Bitte ermittle den Standort des Stalls.');
      return;
    }
    setSaving(true);
    try {
      await addHorse({ name: name.trim(), ...coords, clipped, sensitive, risk });
      router.back();
    } catch (e) {
      Alert.alert('Fehler', e instanceof Error ? e.message : 'Speichern fehlgeschlagen.');
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="z.B. Lotte"
        autoCapitalize="words"
      />

      <Text style={styles.label}>Standort des Stalls</Text>
      {coords ? (
        <Text style={styles.coords}>
          📍 {coords.lat.toFixed(2)}, {coords.lng.toFixed(2)}
        </Text>
      ) : (
        <Text style={styles.hint}>Noch nicht ermittelt</Text>
      )}
      <Pressable style={styles.gpsButton} onPress={useLocation} disabled={locating}>
        {locating ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.gpsButtonText}>📍 Aktuellen Standort verwenden</Text>
        )}
      </Pressable>

      <View style={styles.row}>
        <Text style={styles.toggleLabel}>Geschoren</Text>
        <Switch value={clipped} onValueChange={setClipped} />
      </View>

      <View style={styles.row}>
        <Text style={styles.toggleLabel}>Empfindlich (alt / dünn / krank)</Text>
        <Switch value={sensitive} onValueChange={setSensitive} />
      </View>

      <Text style={styles.label}>Hufrehe-Risiko</Text>
      <View style={styles.riskRow}>
        {(['low', 'medium', 'high'] as const).map(r => (
          <Pressable
            key={r}
            style={[styles.riskButton, risk === r && styles.riskButtonActive]}
            onPress={() => setRisk(r)}
          >
            <Text style={[styles.riskButtonText, risk === r && styles.riskButtonTextActive]}>
              {r === 'low' ? 'Niedrig' : r === 'medium' ? 'Mittel' : 'Hoch'}
            </Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.hint}>
        Hoch = Hufrehe-Vorgeschichte, EMS oder Cushing.{'\n'}
        Mittel = leichtfutternd, Pony-Rasse, Übergewicht.
      </Text>

      <Pressable style={styles.saveButton} onPress={onSave} disabled={saving}>
        {saving ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.saveButtonText}>Speichern</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 16, paddingBottom: 40 },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
    marginTop: 16,
    marginBottom: 6,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 17,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  coords: { fontSize: 16, color: '#111', paddingVertical: 8 },
  hint: { fontSize: 13, color: '#6b7280', marginTop: 4, lineHeight: 18 },
  gpsButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  gpsButtonText: { color: 'white', fontSize: 16, fontWeight: '700' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    marginTop: 12,
    borderTopWidth: 1,
    borderColor: '#e5e7eb',
  },
  toggleLabel: { fontSize: 16, color: '#111', flex: 1, paddingRight: 12 },
  riskRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  riskButton: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  riskButtonActive: { borderColor: '#10b981', backgroundColor: '#ecfdf5' },
  riskButtonText: { fontSize: 15, fontWeight: '600', color: '#374151' },
  riskButtonTextActive: { color: '#065f46' },
  saveButton: {
    backgroundColor: '#10b981',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  saveButtonText: { color: 'white', fontSize: 18, fontWeight: '800' },
});
