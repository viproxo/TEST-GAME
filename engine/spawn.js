import enemiesData from '../data/enemies.json';
import wavesData from '../data/waves.json';

let gameTime = 0;
let waveIndex = 0;

export function spawnEnemies(deltaTime) {
  gameTime += deltaTime;

  const enemiesToSpawn = [];

  // Check if it's time for the next wave
  if (waveIndex < wavesData.length && gameTime >= wavesData[waveIndex].time) {
    const wave = wavesData[waveIndex];
    console.log(`Spawning wave ${waveIndex} at time ${gameTime.toFixed(2)}s`);

    // Spawn enemies for the current wave
    wave.types.forEach(enemyType => {
      const enemyData = enemiesData.find(enemy => enemy.type === enemyType);
      if (enemyData) {
        // Create a new enemy instance (simplified for now)
        const newEnemy = {
          id: Math.random().toString(36).substring(7), // Simple unique ID
          type: enemyData.type,
          hp: enemyData.hp,
          speed: enemyData.speed,
          position: { x: 0, y: 0 }, // Placeholder position
          // Add other properties like radius, etc. later
        };
        enemiesToSpawn.push(newEnemy);
      }
    });

    waveIndex++; // Move to the next wave
  }

  return enemiesToSpawn; // Return list of newly spawned enemies
}

// Optional: Reset spawn state for a new game
export function resetSpawn() {
  gameTime = 0;
  waveIndex = 0;
}