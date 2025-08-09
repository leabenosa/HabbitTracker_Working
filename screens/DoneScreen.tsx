import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Habit, loadHabits, saveHabits } from '../storage/habitStorage';
import { useIsFocused } from '@react-navigation/native';

function formatIso(date: Date) {
  // Return local date string yyyy-mm-dd
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
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

function DoneItem({
  item,
  onDelete,
}: {
  item: Habit;
  onDelete: (id: string) => void;
}) {
  return (
    <View style={styles.item}>
      <Text style={styles.habitText}>{item.name}</Text>
      <TouchableOpacity
        style={styles.revertButton}
        onPress={() => onDelete(item.id)}
      >
        <Text style={styles.revertText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );
}

function DoneFooter({
  onDeleteAll,
  visible,
}: {
  onDeleteAll: () => void;
  visible: boolean;
}) {
  if (!visible) return null;
  return (
    <TouchableOpacity
      style={styles.deleteAllButton}
      onPress={onDeleteAll}
      activeOpacity={0.7}
    >
      <Text style={styles.deleteAllButtonText}>Delete All</Text>
    </TouchableOpacity>
  );
}

export default function DoneScreen() {
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
    const interval = setInterval(() => setCurrentDate(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const deleteHabit = async (id: string) => {
    Alert.alert(
      'Delete Habit',
      'Are you sure you want to delete this habit?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const filtered = habits.filter((h) => h.id !== id);
            await saveHabits(filtered);
            setHabits(filtered);
          },
        },
      ]
    );
  };

  const deleteAllDoneForDate = () => {
    Alert.alert(
      'Delete All Done Habits',
      `Are you sure you want to delete ALL done habits for ${formatIso(
        selectedDate
      )}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const filtered = habits.filter(
              (h) => !(h.date === formatIso(selectedDate) && h.status === 'done')
            );
            await saveHabits(filtered);
            setHabits(filtered);
          },
        },
      ]
    );
  };

  const weekDays = getCurrentWeekDates();

  const doneForDate = habits.filter(
    (h) => h.date === formatIso(selectedDate) && h.status === 'done'
  );

  const formattedToday = formatDisplayDate(currentDate);

  return (
    <View style={styles.container}>
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
              <Text
                style={[styles.dayText, isSelected && styles.dayTextSelected]}
              >
                {day.toLocaleDateString(undefined, { weekday: 'short' })}
              </Text>
              <Text
                style={[styles.dateText, isSelected && styles.dayTextSelected]}
              >
                {day.getDate()}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.title}>Done</Text>

      <FlatList
        data={doneForDate}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.empty}>No done habits for this date</Text>
        }
        renderItem={({ item }) => (
          <DoneItem item={item} onDelete={deleteHabit} />
        )}
        ListFooterComponent={
          <DoneFooter
            onDeleteAll={deleteAllDoneForDate}
            visible={doneForDate.length > 0}
          />
        }
      />
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
    backgroundColor: backgroundViolet,
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
  dayText: {
    fontSize: 12,
    color: darkViolet,
    fontWeight: 'bold',
  },
  dateText: {
    fontSize: 14,
    color: darkViolet,
  },
  dayTextSelected: {
    color: '#fff',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#311b92',
  },
  empty: {
    textAlign: 'center',
    marginTop: 20,
    color: '#311b92',
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: lightViolet,
  },
  habitText: {
    fontSize: 14,
    color: '#311b92',
  },
  revertButton: {
    backgroundColor: '#7f8c8d',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  revertText: {
    color: '#fff',
    fontWeight: '600',
  },
  deleteAllButton: {
    backgroundColor: redColor,
    paddingVertical: 10,
    borderRadius: 4,
    marginTop: 20,
    alignItems: 'center',
    width: 140,
    alignSelf: 'center',
  },
  deleteAllButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
});
