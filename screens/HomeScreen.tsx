import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  Animated,
  type FlatList,
  type ViewToken
} from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';

const { width } = Dimensions.get('window');

const images = [
  { id: '1', src: require('../assets/images/goal1.jpg') },
  { id: '2', src: require('../assets/images/goal2.jpg') },
  { id: '3', src: require('../assets/images/goal3.jpg') },
  { id: '4', src: require('../assets/images/goal4.jpg') },
  { id: '5', src: require('../assets/images/goal5.jpg') },
  { id: '6', src: require('../assets/images/goal6.jpg') },
];

const ITEM_WIDTH = width * 0.6; 
const ITEM_SPACING = (width - ITEM_WIDTH) / 2;

export default function HomeScreen() {
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList<{ id: string; src: any }> | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [confettiKey, setConfettiKey] = useState(0);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setCurrentIndex(viewableItems[0].index!);
      }
    }
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  useEffect(() => {
    const interval = setInterval(() => {
      let nextIndex = (currentIndex + 1) % images.length;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    }, 3000);
    return () => clearInterval(interval);
  }, [currentIndex]);

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

      <Animated.FlatList
        ref={flatListRef}
        data={images}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={ITEM_WIDTH}
        decelerationRate="fast"
        bounces={false}
        contentContainerStyle={{
          paddingHorizontal: ITEM_SPACING,
        }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}

        renderItem={({ item, index }) => {
          const inputRange = [
            (index - 1) * ITEM_WIDTH,
            index * ITEM_WIDTH,
            (index + 1) * ITEM_WIDTH,
          ];

          const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.75, 1.3, 0.75],  
          });

          const zIndex = scrollX.interpolate({
            inputRange,
            outputRange: [1, 10, 1],  
          });

          return (
            <Animated.View
              style={[
                { width: ITEM_WIDTH, transform: [{ scale }], zIndex },
                styles.itemContainer,
              ]}
            >
              <View style={styles.imageContainer}>
                <Image source={item.src} style={styles.image} />
              </View>
            </Animated.View>
          );
        }}
      />

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
    backgroundColor: backgroundViolet,
    padding: 20,
    alignItems: 'center',
  },
  welcome: {
    fontSize: 22,
    fontWeight: 'bold',
    color: textViolet,
    textAlign: 'center',
    lineHeight: 30,
    marginBottom: 20,
    marginTop: 50,
  },
  gif: {
    position: 'absolute',
    bottom: 70,
    alignSelf: 'center',
    width: 200,
    height: 200,
    marginTop: 20,
  },
  imageContainer: {
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#eee',
    bottom: -50,
  },
  image: {
    width: '100%',
    height: width * 0.8,
    resizeMode: 'cover',
  },
  itemContainer: {
    marginHorizontal: 10, 
  },
});
