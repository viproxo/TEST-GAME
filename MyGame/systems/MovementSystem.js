import { Dimensions } from 'react-native';
import Bullet from '../components/Bullet'; // Import Bullet component

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const PLAYER_SIZE = 50; // Assuming player is 50x50

// Auto-fire settings
const FIRE_RATE = 1000; // milliseconds (1 second)
let lastFireTime = 0;
let bulletCounter = 0;

const findNearestEnemy = (player, entities) => {
  let nearestEnemy = null;
  let minDistanceSq = Infinity;

  if (!player || !player.position) return null;

  const [playerX, playerY] = player.position;

  for (const id in entities) {
    if (id.startsWith('enemy_')) {
      const enemy = entities[id];
      if (enemy && enemy.position) {
        const [enemyX, enemyY] = enemy.position;
        const distanceSq = (playerX - enemyX) ** 2 + (playerY - enemyY) ** 2;
        if (distanceSq < minDistanceSq) {
          minDistanceSq = distanceSq;
          nearestEnemy = { ...enemy, id }; // Include enemy id
        }
      }
    }
  }
  return nearestEnemy;
};


const MovementSystem = (entities, { time, input }) => {
  const player = entities.player;
  const controls = entities.controls; // Access controls data
  const currentTime = time.current;

  // Player Movement Logic
  if (player && player.position && controls && controls.joystick) {
    const { dx, dy } = controls.joystick;
    if (typeof dx === 'number' && typeof dy === 'number') {
      const speed = 5;
      let newX = player.position[0] + dx * speed;
      let newY = player.position[1] + dy * speed;

      newX = Math.max(PLAYER_SIZE / 2, Math.min(screenWidth - PLAYER_SIZE / 2, newX));
      newY = Math.max(PLAYER_SIZE / 2, Math.min(screenHeight - PLAYER_SIZE / 2, newY));

      player.position[0] = newX;
      player.position[1] = newY;
    }
  }

  // Player Auto-Fire Logic
  if (player && player.position && currentTime - lastFireTime > FIRE_RATE) {
    const nearestEnemy = findNearestEnemy(player, entities);

    if (nearestEnemy) {
      lastFireTime = currentTime;
      bulletCounter++;
      const bulletId = `bullet_${currentTime}_${bulletCounter}`;

      entities[bulletId] = {
        position: [...player.position], // Start at player's current center
        targetEnemyId: nearestEnemy.id, // Store ID of the target enemy
        speed: 7, // Bullets are faster
        renderer: Bullet, // Pass the component type
      };
    }
  }

  return entities;
};

export default MovementSystem;
