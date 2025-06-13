// Entity dimensions (can be moved to entity definitions later)
const SIZES = {
  player: { width: 40, height: 40 }, // From Player.js (50x50 was in component, let's use 40x40 for consistency in logic)
  enemy: { width: 40, height: 40 },  // From Enemy.js
  bullet: { width: 10, height: 10 }, // From Bullet.js
};

const BULLET_DAMAGE = 10;
const ENEMY_CONTACT_DAMAGE = 10; // Damage player takes from enemy contact
const ENEMY_DEFEAT_SCORE = 10; // Points for defeating a standard enemy

// AABB Collision Detection Function
const checkAABBCollision = (entityA, entityB, sizeA, sizeB) => {
  if (!entityA.position || !entityB.position) return false;

  const [ax, ay] = entityA.position;
  const [bx, by] = entityB.position;

  // Calculate the AABB boundaries for entityA
  const aLeft = ax - sizeA.width / 2;
  const aRight = ax + sizeA.width / 2;
  const aTop = ay - sizeA.height / 2;
  const aBottom = ay + sizeA.height / 2;

  // Calculate the AABB boundaries for entityB
  const bLeft = bx - sizeB.width / 2;
  const bRight = bx + sizeB.width / 2;
  const bTop = by - sizeB.height / 2;
  const bBottom = by + sizeB.height / 2;

  // Check for overlap
  return aLeft < bRight && aRight > bLeft && aTop < bBottom && aBottom > bTop;
};

const CollisionSystem = (entities, { time, dispatch }) => {
  const player = entities.player;
  const bulletsToDelete = [];
  const enemiesToDamage = {}; // { enemyId: totalDamage }
  const enemiesToDelete = [];

  // 1. Bullet vs. Enemy Collisions
  for (const bulletId in entities) {
    if (bulletId.startsWith('bullet_')) {
      const bullet = entities[bulletId];
      if (!bullet || bullet.collided) continue; // Skip already processed bullets

      for (const enemyId in entities) {
        if (enemyId.startsWith('enemy_')) {
          const enemy = entities[enemyId];
          if (!enemy || enemy.health <= 0) continue; // Skip dead or dying enemies

          if (checkAABBCollision(bullet, enemy, SIZES.bullet, SIZES.enemy)) {
            // Mark bullet for deletion
            bullet.collided = true; // Or add to bulletsToDelete immediately
            bulletsToDelete.push(bulletId);

            // Accumulate damage for the enemy for this frame
            enemiesToDamage[enemyId] = (enemiesToDamage[enemyId] || 0) + BULLET_DAMAGE;

            // Optional: If a bullet can only hit one enemy, break inner loop
            // break;
          }
        }
      }
    }
  }

  // 2. Player vs. Enemy Collisions
  if (player && player.position && player.health > 0) {
    for (const enemyId in entities) {
      if (enemyId.startsWith('enemy_')) {
        const enemy = entities[enemyId];
        if (!enemy || enemy.health <= 0) continue; // Skip dead enemies

        if (checkAABBCollision(player, enemy, SIZES.player, SIZES.enemy)) {
          // For now, apply damage directly. Could add invulnerability later.
          if (!player.isInvulnerable) { // Check for invulnerability if implemented
             player.health -= ENEMY_CONTACT_DAMAGE;
             console.log(`Player hit by ${enemyId}! Player health: ${player.health}`);
            // TODO: Add invulnerability timer if desired
            // player.isInvulnerable = true;
            // player.invulnerabilityEndTime = time.current + PLAYER_INVULNERABILITY_DURATION;
          }
        }
      }
    }
  }

  // --- Entity Updates based on Collisions ---

  // Apply accumulated damage to enemies and mark for deletion if health <= 0
  for (const enemyId in enemiesToDamage) {
    const enemy = entities[enemyId];
    if (enemy) {
      enemy.health -= enemiesToDamage[enemyId];
      console.log(`Enemy ${enemyId} took ${enemiesToDamage[enemyId]} damage, health: ${enemy.health}`);
      if (enemy.health <= 0) {
        enemiesToDelete.push(enemyId);
      }
    }
  }

  // Delete collided bullets
  bulletsToDelete.forEach(id => delete entities[id]);

  // Delete defeated enemies
  enemiesToDelete.forEach(id => {
    console.log(`Enemy ${id} defeated and removed.`);
    delete entities[id];
    // Dispatch score event when an enemy is actually deleted due to health <= 0
    dispatch({ type: "ADD_SCORE", points: ENEMY_DEFEAT_SCORE });
  });

  // Check for Game Over
  if (player && player.health <= 0 && !player.isGameOverNotified) { // Ensure event is dispatched only once
    player.isGameOverNotified = true; // Mark that game over has been processed for the player
    console.log("GAME OVER - Player health depleted.");
    dispatch({ type: "GAME_OVER" }); // Dispatch a game over event
  }

  return entities;
};

export default CollisionSystem;
