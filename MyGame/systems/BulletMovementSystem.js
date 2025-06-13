import { Dimensions } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const BULLET_SIZE = 10; // Matches Bullet.js, for off-screen check

const BulletMovementSystem = (entities, { time }) => {
  for (const id in entities) {
    if (id.startsWith('bullet_')) {
      const bullet = entities[id];
      // If bullet has collided (marked by CollisionSystem), or has no position, skip/delete.
      if (!bullet || !bullet.position || bullet.collided) {
        // CollisionSystem will handle deletion of 'collided' bullets primarily,
        // but this ensures they stop moving immediately.
        // If it's marked collided but not yet deleted by CollisionSystem,
        // it might be good to remove it here too, or ensure CollisionSystem runs first.
        // For now, if 'collided' is true, we just stop processing its movement.
        // Actual deletion logic for collided bullets is primarily in CollisionSystem.
        if (bullet && bullet.collided) {
            // Optionally, delete here if CollisionSystem hasn't run yet this tick for this bullet
            // delete entities[id];
        }
        continue;
      }

      const targetEnemy = entities[bullet.targetEnemyId];

      if (targetEnemy && targetEnemy.position && targetEnemy.health > 0) { // Also check if target is alive
        const [bulletX, bulletY] = bullet.position;
        const [targetX, targetY] = targetEnemy.position;

        let dx = targetX - bulletX;
        let dy = targetY - bulletY;

        const magnitude = Math.sqrt(dx * dx + dy * dy);

        if (magnitude > 0) { // Target is still some distance away
          dx /= magnitude;
          dy /= magnitude;

          bullet.position[0] += dx * bullet.speed;
          bullet.position[1] += dy * bullet.speed;

          // Check if bullet is off-screen
          if (
            bullet.position[0] < -BULLET_SIZE ||
            bullet.position[0] > screenWidth + BULLET_SIZE ||
            bullet.position[1] < -BULLET_SIZE ||
            bullet.position[1] > screenHeight + BULLET_SIZE
          ) {
            delete entities[id]; // Remove off-screen bullet
            continue; // Move to next bullet
          }
        } else {
          // Bullet has reached target's previous position or very close (magnitude is 0 or near 0)
          // CollisionSystem should handle the actual hit and damage.
          // We can mark it here or let CollisionSystem deal with it.
          // For simplicity, if it's at the exact spot, CollisionSystem will pick it up.
          // If it's extremely close, it might pass through if speed is high.
          // To be safe, if magnitude is very small, consider it a hit for movement purposes.
          // However, the primary collision/damage is in CollisionSystem.
          // Here, we just ensure it doesn't fly past if target is already dead by next tick.
        }
      } else {
        // Target enemy no longer exists (e.g. health <=0 and removed by CollisionSystem in a previous tick or same tick but earlier system)
        // or target has no position.
        delete entities[id]; // Remove bullet whose target is gone
      }
    }
  }
  return entities;
};

export default BulletMovementSystem;
