import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Habit = {
  id: string;
  title: string;
  done: boolean;
};

type HabitContextType = {
  habits: Habit[];
  addHabit: (title: string) => void;
  toggleHabit: (id: string) => void;
  removeHabit: (id: string) => void;
};

const HabitContext = createContext<HabitContextType | undefined>(undefined);

export const HabitProvider = ({ children }: { children: ReactNode }) => {
  const [habits, setHabits] = useState<Habit[]>([]);

  const addHabit = (title: string) => {
    setHabits(prev => [...prev, { id: Date.now().toString(), title, done: false }]);
  };

  const toggleHabit = (id: string) => {
    setHabits(prev =>
      prev.map(h => (h.id === id ? { ...h, done: !h.done } : h))
    );
  };

  const removeHabit = (id: string) => {
    setHabits(prev => prev.filter(h => h.id !== id));
  };

  return (
    <HabitContext.Provider value={{ habits, addHabit, toggleHabit, removeHabit }}>
      {children}
    </HabitContext.Provider>
  );
};

export const useHabits = () => {
  const context = useContext(HabitContext);
  if (!context) throw new Error('useHabits must be used within a HabitProvider');
  return context;
};
