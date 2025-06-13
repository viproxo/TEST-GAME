import React from 'react';
import { View, StyleSheet } from 'react-native';

const Bullet = ({ position }) => {
  // Position is the center of the bullet. Adjust for rendering.
  // Assuming bullet size is 10x10 for this example.
  const x = position ? position[0] - 5 : 0;
  const y = position ? position[1] - 5 : 0;

  return (
    <View style={[styles.bullet, { left: x, top: y }]} />
  );
};

const styles = StyleSheet.create({
  bullet: {
    position: 'absolute',
    width: 10,
    height: 10,
    backgroundColor: 'yellow',
    borderRadius: 5, // Make it a circle
  },
});

export default Bullet;
