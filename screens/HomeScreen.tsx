import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';

export default function HomeScreen() {
  const [confettiKey, setConfettiKey] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setConfettiKey((prev) => prev + 1);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>
        Welcome to Your Habit Tracker! 🎯{"\n"}
        Stay consistent and reach your goals every day.
      </Text>

      <Image
        source={require('../assets/CatWave.gif')}
        style={styles.gif}
      />

     
      <ConfettiCannon
        key={confettiKey} 
        count={80} 
        origin={{ x: 0, y: 0 }}
        explosionSpeed={400}
        fallSpeed={3000}
        fadeOut={true}
      />
    </View>
  );
}

const backgroundViolet = '#f3e5f5';
const textViolet = '#311b92';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: backgroundViolet,
    padding: 20,
  },
  welcome: {
    fontSize: 22,
    fontWeight: 'bold',
    color: textViolet,
    textAlign: 'center',
    lineHeight: 30,
    marginBottom: 30,  
  },
  gif: {
    width: 200,
    height: 200,
    marginBottom: 20,  
  },
});
