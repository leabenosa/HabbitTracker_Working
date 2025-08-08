// storage/habitStorage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export type HabitStatus = 'pending' | 'done' | 'undone';

export type Habit = {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
  status: HabitStatus;
};

const HABITS_KEY = 'HABITS_V1';

export async function loadHabits(): Promise<Habit[]> {
  try {
    const raw = await AsyncStorage.getItem(HABITS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('loadHabits error', e);
    return [];
  }
}

export async function saveHabits(habits: Habit[]): Promise<void> {
  try {
    await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(habits));
  } catch (e) {
    console.error('saveHabits error', e);
  }
}
