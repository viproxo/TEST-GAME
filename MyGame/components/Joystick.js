import React from 'react';
import { View, StyleSheet } from 'react-native';
import Joystick from 'react-native-virtual-joystick';

const GameJoystick = ({ onMove }) => {
  return (
    <View style={styles.joystickContainer}>
      <Joystick
        radius={75} // Size of the joystick area
        innerRadius={35} // Size of the joystick handle
        color="#DDDDDD" // Color of the joystick area
        innerColor="#AAAAAA" // Color of the joystick handle
        onMove={(data) => onMove(data)} // Callback for movement
      />
    </View>
  );
};

const styles = StyleSheet.create({
  joystickContainer: {
    position: 'absolute',
    bottom: 50, // Position it at the bottom of the screen
    left: 50,  // Position it to the left
    // Ensure it overlays other content if necessary
    zIndex: 10,
  },
});

export default GameJoystick;
