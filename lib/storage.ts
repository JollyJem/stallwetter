// Local horse profiles via AsyncStorage.
// Replace with API + Postgres in Step 6 — keeps the same shape.

import AsyncStorage from '@react-native-async-storage/async-storage';

export type Horse = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  clipped: boolean;
  sensitive: boolean;
  risk: 'low' | 'medium' | 'high';
};

const KEY = 'stallwetter:horses';

export async function listHorses(): Promise<Horse[]> {
  const raw = await AsyncStorage.getItem(KEY);
  return raw ? (JSON.parse(raw) as Horse[]) : [];
}

export async function addHorse(input: Omit<Horse, 'id'>): Promise<Horse> {
  const horses = await listHorses();
  const horse: Horse = {
    ...input,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  };
  horses.push(horse);
  await AsyncStorage.setItem(KEY, JSON.stringify(horses));
  return horse;
}

export async function deleteHorse(id: string): Promise<void> {
  const horses = await listHorses();
  await AsyncStorage.setItem(KEY, JSON.stringify(horses.filter(h => h.id !== id)));
}
