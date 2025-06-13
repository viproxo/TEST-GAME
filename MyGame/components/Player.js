import React from 'react';
import { View, StyleSheet } from 'react-native';

const Player = ({ position }) => {
  const x = position[0] - 25; // Assuming player size is 50x50, adjust for center
  const y = position[1] - 25;

  return (
    <View style={[styles.player, { left: x, top: y }]} />
  );
};

const styles = StyleSheet.create({
  player: {
    position: 'absolute',
    width: 50,
    height: 50,
    backgroundColor: 'blue',
  },
});

export default Player;
