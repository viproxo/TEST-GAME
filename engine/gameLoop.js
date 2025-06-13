let lastUpdateTime = 0;
let gameRunning = false;

export function startGameLoop(updateCallback) {
  gameRunning = true;
  const loop = (timestamp) => {
    if (!gameRunning) return;

    const deltaTime = (timestamp - lastUpdateTime) / 1000; // Sekunden
    lastUpdateTime = timestamp;

    updateCallback(deltaTime); // z. B. Spiel aktualisieren

    requestAnimationFrame(loop);
  };

  requestAnimationFrame((timestamp) => {
    lastUpdateTime = timestamp;
    loop(timestamp);
  });
}

export function stopGameLoop() {
  gameRunning = false;
}