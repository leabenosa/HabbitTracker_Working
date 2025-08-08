import React, { useState, useEffect, JSX } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Habit, HabitStatus, loadHabits, saveHabits } from '../storage/habitStorage';
import { useIsFocused } from '@react-navigation/native';

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

export default function AddHabitScreen(): JSX.Element {
  const [habit, setHabit] = useState('');
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

  const persistAndSet = async (newList: Habit[]) => {
    setHabits(newList);
    await saveHabits(newList);
  };

  const addHabit = async () => {
    if (!habit.trim()) {
      Alert.alert('Please enter a habit name');
      return;
    }
    const newItem: Habit = {
      id: Date.now().toString(),
      name: habit.trim(),
      date: formatIso(selectedDate),
      status: 'pending' as HabitStatus,
    };
    const updated = [newItem, ...habits];
    await persistAndSet(updated);
    setHabit('');
  };

  const markDone = async (id: string) => {
    const updated = habits.map((h) =>
      h.id === id ? { ...h, status: 'done' as HabitStatus } : h
    );
    await persistAndSet(updated);
  };

  const deleteAllForDate = async () => {
    Alert.alert(
      'Delete All Habits',
      `Delete ALL habits for ${formatIso(selectedDate)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const filtered = habits.filter(h => h.date !== formatIso(selectedDate));
            await persistAndSet(filtered);
          },
        },
      ]
    );
  };

  const filteredHabits = habits.filter(
    (h) => h.date === formatIso(selectedDate) && h.status === 'pending'
  );

  const weekDays = getCurrentWeekDates();

  const formattedToday = formatDisplayDate(currentDate);

  return (
    <View style={styles.container}>

      {/* Current Date display */}
      <Text style={styles.currentDate}>{formattedToday}</Text>

      <View style={styles.weekRow}>
        {weekDays.map((day) => {
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

      <Text style={styles.title}>Add New Habit</Text>

      <TextInput
        style={styles.input}
        value={habit}
        onChangeText={setHabit}
        placeholder="Enter habit..."
        placeholderTextColor="#7e57c2"
      />
      <TouchableOpacity style={styles.addButton} onPress={addHabit} activeOpacity={0.7}>
        <Text style={styles.addButtonText}>Add Habit</Text>
      </TouchableOpacity>

      <FlatList
        data={filteredHabits}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.empty}>No pending habits for this date</Text>}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.habitText}>{item.name}</Text>
            <TouchableOpacity
              style={styles.doneButton}
              onPress={() => markDone(item.id)}
              activeOpacity={0.7}
            >
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {filteredHabits.length > 0 && (
        <TouchableOpacity
          style={styles.deleteAllButton}
          onPress={deleteAllForDate}
          activeOpacity={0.7}
        >
          <Text style={styles.deleteAllButtonText}>Delete All</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const darkViolet = '#512da8';
const lightViolet = '#d1c4e9';
const backgroundViolet = '#f3e5f5';
const redColor = '#e53935';

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    backgroundColor: backgroundViolet 
  },
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
    marginBottom: 16 
  },
  dayBox: {
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#e1bee7'
  },
  daySelected: {
    backgroundColor: darkViolet 
  },
  dayText: { 
    fontSize: 12, 
    color: darkViolet, 
    fontWeight: 'bold' 
  },
  dateText: { 
    fontSize: 14, 
    color: darkViolet 
  },
  dayTextSelected: {
    color: '#fff' 
  },
  title: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    marginBottom: 10, 
    color: '#311b92' 
  },
  input: { 
    borderWidth: 1, 
    borderColor: lightViolet,
    padding: 8, 
    marginBottom: 10, 
    borderRadius: 5, 
    backgroundColor: '#fff', 
    color: '#311b92' 
  },
  addButton: { 
    backgroundColor: darkViolet, 
    paddingVertical: 10, 
    borderRadius: 6, 
    marginBottom: 20, 
    alignItems: 'center' 
  },
  addButtonText: {
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 16 
  },
  empty: { 
    textAlign: 'center', 
    marginTop: 20,
    color: '#311b92' 
  },
  item: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingVertical: 10, 
    borderBottomWidth: 1, 
    borderColor: lightViolet 
  },
  habitText: { 
    fontSize: 14, 
    color: '#311b92', 
    flex: 1
  },
  doneButton: { 
    backgroundColor: darkViolet, 
    paddingVertical: 6, 
    paddingHorizontal: 10, 
    borderRadius: 8 
  },
  doneButtonText: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 13 
  },
  deleteAllButton: {
    backgroundColor: redColor,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center',
  },
  deleteAllButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
