import { Dimensions } from 'react-native';
import Enemy from '../components/Enemy'; // Assuming Enemy component is in components folder

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const ENEMY_SIZE = 40; // Must match the size in Enemy.js for accurate edge spawning

let lastSpawnTime = {};
let enemyCounter = 0;
let gameJustReset = true; // Flag to indicate if game was just reset

// Wave Configuration
const WAVES = [
  { duration: 60, interval: 3000, numEnemies: 1, id: "wave1" },
  { duration: 60, interval: 2000, numEnemies: 1, id: "wave2" },
  { duration: Infinity, interval: 1500, numEnemies: 1, id: "wave3_fast_single" },
  // Example for later: { duration: Infinity, interval: 3000, numEnemies: 2, id: "wave3_double" },
];

const EnemySpawningSystem = (entities, { time, dispatch }) => {
  const gameTime = entities.gameStats ? entities.gameStats.time : 0;
  const engineTime = time.current;

  // Reset spawn timers if game just reset
  if (gameTime <= 1 && gameJustReset) { // Check if time is at start and flag is true
    lastSpawnTime = {};
    enemyCounter = 0; // Also reset enemy counter for unique IDs per game session
    gameJustReset = false; // Consume the flag
  } else if (gameTime > 1) {
    gameJustReset = true; // Ready the flag for the next potential reset
  }

  let currentWaveConfig = null;
  let accumulatedDuration = 0;

  for (const wave of WAVES) {
    if (gameTime < accumulatedDuration + wave.duration) {
      currentWaveConfig = wave;
      break;
    }
    accumulatedDuration += wave.duration;
  }

  if (!currentWaveConfig) {
    currentWaveConfig = WAVES[WAVES.length - 1];
  }

  if (lastSpawnTime[currentWaveConfig.id] === undefined) {
    lastSpawnTime[currentWaveConfig.id] = engineTime;
  }

  if (engineTime - (lastSpawnTime[currentWaveConfig.id] || 0) > currentWaveConfig.interval) {
    lastSpawnTime[currentWaveConfig.id] = engineTime;

    for (let i = 0; i < currentWaveConfig.numEnemies; i++) {
      enemyCounter++;
      // Using engineTime + counter + i for more robust unique ID, especially if multiple enemies spawn in same tick
      const enemyId = `enemy_${engineTime}_${enemyCounter}_${i}`;
      let x, y;
      const edge = Math.floor(Math.random() * 4);

      switch (edge) {
        case 0: x = Math.random() * (screenWidth - ENEMY_SIZE) + ENEMY_SIZE / 2; y = ENEMY_SIZE / 2; break;
        case 1: x = screenWidth - ENEMY_SIZE / 2; y = Math.random() * (screenHeight - ENEMY_SIZE) + ENEMY_SIZE / 2; break;
        case 2: x = Math.random() * (screenWidth - ENEMY_SIZE) + ENEMY_SIZE / 2; y = screenHeight - ENEMY_SIZE / 2; break;
        default:x = ENEMY_SIZE / 2; y = Math.random() * (screenHeight - ENEMY_SIZE) + ENEMY_SIZE / 2; break;
      }

      entities[enemyId] = {
        position: [x, y],
        health: 30,
        speed: 1,
        renderer: Enemy,
      };
    }
  }

  return entities;
};

export default EnemySpawningSystem;
