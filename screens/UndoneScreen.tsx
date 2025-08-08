import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Habit, HabitStatus, loadHabits, saveHabits } from '../storage/habitStorage';
import { useIsFocused } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';

function formatIso(date: Date) {
  return date.toISOString().split('T')[0];
}

function formatDisplayDate(date: Date) {
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function getCurrentWeekDates() {
  const today = new Date();
  const day = today.getDay();
  const mondayOffset = (day === 0 ? -6 : 1) - day;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push(d);
  }
  return days;
}

export default function UndoneScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      (async () => {
        const loaded = await loadHabits();
        setHabits(loaded);
      })();
    }
  }, [isFocused]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const markDone = async (id: string) => {
    const updated = habits.map(h =>
      h.id === id ? { ...h, status: 'done' as HabitStatus } : h
    );
    await saveHabits(updated);
    setHabits(updated);
    navigation.navigate('DoneScreen');
  };

  const deleteAllHabits = () => {
    Alert.alert(
      'Delete All Habits',
      'Are you sure you want to delete all habits?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await saveHabits([]);
            setHabits([]);
          },
        },
      ],
      { cancelable: true }
    );
  };

  const weekDays = getCurrentWeekDates();

  const undoneForDate = habits.filter(
    h => h.date === formatIso(selectedDate) && (h.status === 'undone' || h.status === 'pending')
  );

  const formattedToday = formatDisplayDate(currentDate);

  return (
    <View style={styles.container}>

      {/* Current Date display */}
      <Text style={styles.currentDate}>{formattedToday}</Text>

      <View style={styles.weekRow}>
        {weekDays.map(day => {
          const iso = formatIso(day);
          const isSelected = iso === formatIso(selectedDate);
          return (
            <TouchableOpacity
              key={iso}
              style={[styles.dayBox, isSelected && styles.daySelected]}
              onPress={() => setSelectedDate(day)}
            >
              <Text style={[styles.dayText, isSelected && styles.dayTextSelected]}>
                {day.toLocaleDateString(undefined, { weekday: 'short' })}
              </Text>
              <Text style={[styles.dateText, isSelected && styles.dayTextSelected]}>
                {day.getDate()}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.title}>Undone</Text>

      <FlatList
        data={undoneForDate}
        keyExtractor={item => item.id}
        ListEmptyComponent={<Text style={styles.empty}>No undone habits for this date</Text>}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.habitText}>{item.name}</Text>
            <TouchableOpacity
              style={styles.revertButton}
              onPress={() => markDone(item.id)}
            >
              <Text style={styles.revertText}>Mark as Done</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <TouchableOpacity style={styles.deleteAllButton} onPress={deleteAllHabits}>
        <Text style={styles.deleteAllText}>Delete All Habits</Text>
      </TouchableOpacity>
    </View>
  );
}

const darkViolet = '#512da8';
const lightViolet = '#d1c4e9';
const backgroundViolet = '#f3e5f5';

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: backgroundViolet },
  currentDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#311b92',
    marginBottom: 12,
    textAlign: 'center',
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dayBox: {
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#e1bee7',
  },
  daySelected: {
    backgroundColor: darkViolet,
  },
  dayText: { fontSize: 12, color: darkViolet, fontWeight: 'bold' },
  dateText: { fontSize: 14, color: darkViolet },
  dayTextSelected: { color: '#fff' },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#311b92' },
  empty: { textAlign: 'center', marginTop: 20, color: '#311b92' },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: lightViolet,
  },
  habitText: { fontSize: 14, color: '#311b92' },
  revertButton: {
    backgroundColor: '#7f8c8d',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  revertText: { color: '#fff', fontWeight: '600' },

  deleteAllButton: {
    backgroundColor: '#d32f2f',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center',
  },
  deleteAllText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
