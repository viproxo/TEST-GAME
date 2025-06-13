import React from 'react';
import { View, StyleSheet } from 'react-native';

const Enemy = ({ position }) => {
  // Position is the center of the enemy. Adjust for rendering.
  // Assuming enemy size is 40x40 for this example.
  const x = position ? position[0] - 20 : 0;
  const y = position ? position[1] - 20 : 0;

  return (
    <View style={[styles.enemy, { left: x, top: y }]} />
  );
};

const styles = StyleSheet.create({
  enemy: {
    position: 'absolute',
    width: 40,
    height: 40,
    backgroundColor: 'red',
  },
});

export default Enemy;
