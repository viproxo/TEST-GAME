import { StatusBar } from 'expo-status-bar';
import React, { useRef, useState, useEffect } from 'react';
import { StyleSheet, View, PanResponder, Animated, Dimensions } from 'react-native';
import VirtualJoystick from './components/VirtualJoystick';
import { startGameLoop, stopGameLoop } from './engine/gameLoop';
import { spawnEnemies } from './engine/spawn';

const { height, width } = Dimensions.get('window');
const baseSize = Math.min(height, width) * 0.15; // Base size is 15% of screen height (increased by 25%)
const thumbSize = Math.min(height, width) * 0.075; // Thumb size is 7.5% of screen height (increased by 25%)
const maxBaseSize = Math.min(height, width) * 0.225; // Max base size is 22.5% of the shorter side (increased by 25%)

// Adjust size based on screen size
const adjustedBaseSize = Math.min(baseSize, maxBaseSize);
const adjustedThumbSize = Math.min(thumbSize, maxBaseSize / 2); // Keep thumb half the base size




const playerSize = 30; // Größe des blauen Kreises

export default function App() {
  const [isVisible, setIsVisible] = useState(false);
  const joystickPosition = useRef({ x: 0, y: 0 });
  const thumbPosition = useRef(new Animated.ValueXY()).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current; // For glow effect

  const playerTranslate = useRef(new Animated.ValueXY({
    x: width / 2 - playerSize / 2,
    y: height / 2 - playerSize / 2,
  })).current;
const activeEnemies = useRef([]); // Ref to store active enemies


  // Game Loop Update Function
  const updateGame = (deltaTime) => {
    // 1. Spawn Enemies
    const newEnemies = spawnEnemies(deltaTime);
    if (newEnemies.length > 0) {
      activeEnemies.current = [...activeEnemies.current, ...newEnemies];
      console.log(`Spawned ${newEnemies.length} new enemies. Total enemies: ${activeEnemies.current.length}`);
    }

    // 2. Move Entities (Player and Enemies)
    // Player movement is handled by the PanResponder, but we could add other player logic here if needed.

    // Move Enemies (Placeholder - actual enemy movement logic will be added later)
    activeEnemies.current.forEach(enemy => {
      // Example: move enemies towards the player (simplified)
      // This will be implemented in detail later
      // enemy.position.x += ...
      // enemy.position.y += ...
    });


    // 3. Check Collisions (Placeholder - collision logic will be added later)
    // Check for collisions between player and enemies
    // If collision, trigger Game Over


    // 4. Check Game State (Placeholder - Game Over logic will be added later)
    // If Game Over, stop the game loop
    // stopGameLoop();
// Start and Stop Game Loop
  useEffect(() => {
    startGameLoop(updateGame);

    return () => {
      stopGameLoop();
    };
  }, []); // Empty dependency array means this effect runs once on mount and cleans up on unmount

    // 5. Update Rendering (Handled by Animated values and React Native rendering)
  };


  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (e, gestureState) => {
        joystickPosition.current = { x: gestureState.x0, y: gestureState.y0 };
        thumbPosition.setValue({ x: 0, y: 0 }); // Reset thumb position on new touch
        setIsVisible(true);
        Animated.timing(opacity, {
          toValue: 1,
          duration: 50,
          useNativeDriver: true,
        }).start();
        Animated.sequence([
          Animated.timing(scale, { toValue: 1.1, duration: 100, useNativeDriver: true }),
          Animated.timing(scale, { toValue: 1, duration: 100, useNativeDriver: true }),
        ]).start();
      },
      onPanResponderMove: (e, gestureState) => {
        const touchX = gestureState.moveX - joystickPosition.current.x;
        const touchY = gestureState.moveY - joystickPosition.current.y;
        const distance = Math.sqrt(touchX * touchX + touchY * touchY);
        const maxDistance = adjustedBaseSize / 2 - adjustedThumbSize / 2;

        if (distance <= maxDistance) {
          thumbPosition.setValue({ x: touchX, y: touchY });
        } else {
          const angle = Math.atan2(touchY, touchX);
          const limitedX = Math.cos(angle) * maxDistance;
          const limitedY = Math.sin(angle) * maxDistance;
          thumbPosition.setValue({ x: limitedX, y: limitedY });
        }

        // Implement glow effect based on deflection
        if (distance > maxDistance * 0.5) { // 50% deflection
          Animated.sequence([
            Animated.timing(glowOpacity, { toValue: 1, duration: 50, useNativeDriver: true }),
            Animated.timing(glowOpacity, { toValue: 0, duration: 100, useNativeDriver: true }),
          ]).start();
        }

        // Update player position based on thumb position for constant speed
        const thumbX = thumbPosition.__getValue().x;
        const thumbY = thumbPosition.__getValue().y;
        const thumbDistance = Math.sqrt(thumbX * thumbX + thumbY * thumbY);
        const maxThumbDistance = adjustedBaseSize / 2 - adjustedThumbSize / 2;

        if (thumbDistance > 0) {
          const angle = Math.atan2(thumbY, thumbX);
          const maxPlayerSpeed = 5; // Maximale Spielergeschwindigkeit in Pixel pro Frame (anpassen nach Bedarf)
          const speedFactor = Math.min(thumbDistance / maxThumbDistance, 1); // Normalisierte Auslenkung (0 bis 1)
          const currentMoveSpeed = maxPlayerSpeed * speedFactor;

          const moveX = Math.cos(angle) * currentMoveSpeed;
          const moveY = Math.sin(angle) * currentMoveSpeed;

          const currentPlayerPosition = playerTranslate.__getValue();
          let newPlayerX = currentPlayerPosition.x + moveX;
          let newPlayerY = currentPlayerPosition.y + moveY;

          // Limit player position to screen bounds
          newPlayerX = Math.max(0, Math.min(newPlayerX, width - playerSize));
          newPlayerY = Math.max(0, Math.min(newPlayerY, height - playerSize));

          playerTranslate.setValue({ x: newPlayerX, y: newPlayerY });
        }
      },
      onPanResponderRelease: () => {
        Animated.timing(thumbPosition, {
          toValue: { x: 0, y: 0 },
          duration: 120,
          useNativeDriver: true,
        }).start(() => {
          Animated.timing(opacity, {
            toValue: 0,
            duration: 100,
            useNativeDriver: true,
          }).start(() => setIsVisible(false));
        });
      },
    })
  ).current;


  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <StatusBar style="auto" />
      <Animated.View style={[
        styles.player,
        {
          width: playerSize,
          height: playerSize,
          borderRadius: playerSize / 2,
          transform: [
            { translateX: playerTranslate.x },
            { translateY: playerTranslate.y },
          ],
        },
      ]} />
      {/* Render Enemies Here (Placeholder) */}
      {/* {activeEnemies.current.map(enemy => (
        <Animated.View key={enemy.id} style={[
          styles.enemy,
          {
            width: 20, // Example size
            height: 20, // Example size
            borderRadius: 10, // Example size
            backgroundColor: 'red', // Example color
            position: 'absolute',
            left: enemy.position.x,
            top: enemy.position.y,
          },
        ]} />
      ))} */}

      {isVisible && joystickPosition.current && (
        <VirtualJoystick
          isVisible={isVisible}
          position={joystickPosition.current}
          thumbPosition={thumbPosition}
          opacity={opacity}
          scale={scale}
          glowOpacity={glowOpacity}
          adjustedBaseSize={adjustedBaseSize}
          adjustedThumbSize={adjustedThumbSize}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    // alignItems: 'center', // Entfernt, da Joystick absolute Position hat
    // justifyContent: 'center', // Entfernt, da Joystick absolute Position hat
  },
  player: {
    position: 'absolute',
    backgroundColor: 'green', // Spieler ist grün
  },
  // Add enemy styles later
  // enemy: {
  //   position: 'absolute',
  //   backgroundColor: 'red',
  // },
});
