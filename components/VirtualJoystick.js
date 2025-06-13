import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, PanResponder, Animated, Dimensions } from 'react-native';

const VirtualJoystick = ({ isVisible, position, thumbPosition, opacity, scale, glowOpacity, adjustedBaseSize, adjustedThumbSize }) => {

  if (!isVisible || !position || !thumbPosition || !opacity || !scale || !glowOpacity || !adjustedBaseSize || !adjustedThumbSize) {
    return null;
  }

  return (
    <View style={[styles.container, { left: position.x - adjustedBaseSize / 2, top: position.y - adjustedBaseSize / 2 }]}>
      <Animated.View
        style={[
          styles.joystickBase,
          {
            width: adjustedBaseSize,
            height: adjustedBaseSize,
            borderRadius: adjustedBaseSize / 2,
            opacity: opacity,
            transform: [{ scale: scale }],
          },
        ]}
      >
         <Animated.View
            style={[
              styles.joystickBaseGlow,
              {
                width: adjustedBaseSize,
                height: adjustedBaseSize,
                borderRadius: adjustedBaseSize / 2,
                opacity: glowOpacity,
              },
            ]}
          />
        <Animated.View
          style={[
            styles.joystickThumb,
            {
              width: adjustedThumbSize,
              height: adjustedThumbSize,
              borderRadius: adjustedThumbSize / 2,
              transform: [
                { translateX: thumbPosition.x },
                { translateY: thumbPosition.y },
              ],
            },
          ]}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
  },
  joystickBase: {
    backgroundColor: 'rgba(128, 128, 128, 0.4)', // 40% transparency
    justifyContent: 'center',
    alignItems: 'center',
  },
   joystickBaseGlow: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 0, 0.5)', // Yellow glow, 50% opacity
  },
  joystickThumb: {
    backgroundColor: 'rgba(128, 128, 128, 0.6)', // 60% opacity
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default VirtualJoystick;