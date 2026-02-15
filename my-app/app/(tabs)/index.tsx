import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import ParallaxScrollView from '@/components/parallax-scroll-view';

export default function HomeScreen() {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Floating Animation (Up & Down)
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -20,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 3D Rotate Animation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 6000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const rotateY = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#0f2027', dark: '#0f2027' }}
    >
      <View style={styles.container}>
        <Animated.View
          style={[
            styles.card,
            {
              transform: [
                { translateY: floatAnim },
                { perspective: 1000 },
                { rotateY },
              ],
            },
          ]}
        >
          <Text style={styles.title}>Welcome ApDev 🚀</Text>
          <Text style={styles.subtitle}>
            Let's Build Something Amazing
          </Text>
        </Animated.View>
      </View>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  card: {
    width: 300,
    height: 200,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1e3c72',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 14,
    color: '#ddd',
    marginTop: 10,
  },
});
