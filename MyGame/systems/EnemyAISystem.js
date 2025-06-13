const EnemyAISystem = (entities, { time }) => {
  const player = entities.player;

  if (!player || !player.position) {
    return entities; // No player to target
  }

  const [playerX, playerY] = player.position;

  for (const id in entities) {
    if (id.startsWith('enemy_')) {
      const enemy = entities[id];
      if (enemy && enemy.position && typeof enemy.speed === 'number') {
        const [enemyX, enemyY] = enemy.position;

        // Calculate direction vector
        let dx = playerX - enemyX;
        let dy = playerY - enemyY;

        // Normalize the vector
        const magnitude = Math.sqrt(dx * dx + dy * dy);

        if (magnitude > 0) { // Avoid division by zero if enemy is already at player's position
          dx /= magnitude;
          dy /= magnitude;

          // Move enemy
          enemy.position[0] += dx * enemy.speed;
          enemy.position[1] += dy * enemy.speed;
        }
      }
    }
  }

  return entities;
};

export default EnemyAISystem;
