import React, { useState } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { GameEngine } from 'react-native-game-engine';
import Player from './components/Player'; // Import the Player component
import GameJoystick from './components/Joystick'; // Import the Joystick component
import MovementSystem from './systems/MovementSystem'; // Import the MovementSystem
import EnemySpawningSystem from './systems/EnemySpawningSystem'; // Import the EnemySpawningSystem
import EnemyAISystem from './systems/EnemyAISystem'; // Import the EnemyAISystem
import BulletMovementSystem from './systems/BulletMovementSystem'; // Import the BulletMovementSystem
import CollisionSystem from './systems/CollisionSystem'; // Import the CollisionSystem
import { Text } from 'react-native'; // Import Text for Game Over

// Simple system that logs a message
const LoggingSystem = (entities, { time }) => {
  // console.log("Game Loop Running - Delta:", time.delta); // Comment out for cleaner logs
  return entities;
};

// Basic GameWorld component
const GameWorld = (props) => {
  // The GameEngine passes the entities to the renderer as props
  const entities = props.entities;

  return (
    <View style={styles.gameContainer}>
      {Object.keys(entities).map(key => {
        const entity = entities[key];
        if (entity.renderer && typeof entity.renderer === 'function') {
          // Ensure position is passed correctly if the entity has one
          // And it's a component type (function or class)
          const RendererComponent = entity.renderer;
          return <RendererComponent key={key} {...entity} />;
        } else if (React.isValidElement(entity.renderer)) {
          // If it's already a React element
          return React.cloneElement(entity.renderer, { key: key, ...entity });
        }
        return null;
      })}
    </View>
  );
};

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function App() {
  const [joystickData, setJoystickData] = useState(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0); // Score state
  const [gameStartTime, setGameStartTime] = useState(0); // For game time tracking
  const [elapsedGameTime, setElapsedGameTime] = useState(0); // To display on game over

  const gameEngineRef = React.useRef(null);

  // Function to create fresh initial entities
  const createInitialEntities = () => ({
    player: {
      position: [screenWidth / 2, screenHeight / 2],
      health: 100,
      renderer: Player,
    },
    controls: { joystick: null },
    // We can add global game state like score here if systems need to read it directly,
    // but dispatching events for changes like score is often cleaner.
    // For now, score is managed in App.js state.
  });

  const [entities, setEntities] = useState(createInitialEntities());

  // Update joystick data and elapsed game time in entities
  React.useEffect(() => {
    let intervalId;
    if (!isGameOver) {
      // Update elapsed game time every second
      intervalId = setInterval(() => {
        setElapsedGameTime(prevTime => prevTime + 1);
      }, 1000);
      // Initial set of gameStartTime
      if (elapsedGameTime === 0) setGameStartTime(Date.now());
    } else {
      // Clear interval if game is over
      if (intervalId) clearInterval(intervalId);
    }

    setEntities(prevEntities => ({
      ...prevEntities,
      controls: { joystick: joystickData },
      gameStats: { score: score, time: elapsedGameTime } // Pass current score and time
    }));

    return () => {
      if (intervalId) clearInterval(intervalId); // Cleanup interval on component unmount or isGameOver change
    };
  }, [joystickData, isGameOver, score, elapsedGameTime]); // Rerun when joystickData, isGameOver, score or elapsedGameTime changes

  // Effect for setting initial gameStartTime when game starts/resets
  React.useEffect(() => {
    if (!isGameOver && elapsedGameTime === 0) { // Only set on very start or after reset where elapsedGameTime is 0
      setGameStartTime(Date.now());
    }
  }, [isGameOver, elapsedGameTime]);

  const onEvent = (e) => {
    if (e.type === "GAME_OVER") {
      setIsGameOver(true);
      // elapsedGameTime is already being updated by the interval, or use final calculation if preferred:
      // setElapsedGameTime(Math.floor((Date.now() - gameStartTime) / 1000));
      if (gameEngineRef.current) {
        gameEngineRef.current.stop();
      }
      console.log("App: GAME_OVER event received.");
    } else if (e.type === "ADD_SCORE") {
      setScore(prevScore => prevScore + e.points);
    }
  };

  // Order of systems matters
  const gameSystems = [
    LoggingSystem,
    MovementSystem,       // Player movement & bullet spawning
    EnemySpawningSystem,
    EnemyAISystem,
    BulletMovementSystem,
    CollisionSystem,      // Handles collisions, damage, entity removal, and GAME_OVER/ADD_SCORE events
  ];

  const resetGame = () => {
    setScore(0);
    setElapsedGameTime(0); // Reset elapsed time, which also resets gameStartTime via useEffect
    setEntities(createInitialEntities()); // Resets player health, etc.
    setIsGameOver(false);
    // gameStartTime will be reset by the useEffect listening to isGameOver and elapsedGameTime

    if (gameEngineRef.current) {
      const newEntities = createInitialEntities();
      setEntities(newEntities); // Ensure App's state for entities is also fresh
      gameEngineRef.current.swapEntities(newEntities);
      gameEngineRef.current.start();
    }
    console.log("App: Game reset.");
  };

  if (isGameOver) {
    return (
      <View style={styles.container}>
        <Text style={styles.gameOverText}>GAME OVER</Text>
        <Text style={styles.finalScoreText}>Final Score: {score}</Text>
        <Text style={styles.finalScoreText}>Time: {elapsedGameTime}s</Text>
        <Text style={styles.restartButton} onPress={resetGame}>Restart</Text>
        <Text style={styles.mainMenuButton} onPress={resetGame}>Main Menu (Restarts)</Text>
      </View>
    );
  }

  // Determine current wave for display
  let currentWave = 1;
  if (elapsedGameTime > 120) {
    currentWave = 3;
  } else if (elapsedGameTime > 60) {
    currentWave = 2;
  }

  return (
    <View style={styles.container}>
      <GameEngine
        ref={gameEngineRef}
        style={styles.gameCanvas}
        systems={gameSystems}
        entities={entities} // entities now includes gameStats: { score, time }
        renderer={GameWorld}
        onEvent={onEvent}
        running={!isGameOver}
      />
      {!isGameOver && (
        <>
          {entities.player && (
            <Text style={styles.healthText}>
              Health: {entities.player.health}
            </Text>
          )}
          <Text style={styles.scoreText}>
            Score: {score}
          </Text>
          <Text style={styles.waveText}> {/* Wave Display UI */}
            Wave: {currentWave}
          </Text>
        </>
      )}
      <GameJoystick onMove={setJoystickData} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  gameCanvas: {
    flex: 1,
  },
  gameContainer: {
    flex: 1,
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  gameOverText: {
    color: 'white',
    fontSize: 48,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: '40%',
  },
  finalScoreText: {
    color: 'white',
    fontSize: 22,
    textAlign: 'center',
    marginTop: 10,
  },
  restartButton: {
    color: 'white',
    fontSize: 24,
    textAlign: 'center',
    marginTop: 30,
    padding: 10,
    borderWidth: 1,
    borderColor: 'white',
    alignSelf: 'center',
  },
  mainMenuButton: {
    color: 'gray',
    fontSize: 20,
    textAlign: 'center',
    marginTop: 15,
    padding: 8,
    borderWidth: 1,
    borderColor: 'gray',
    alignSelf: 'center',
    width: 200,
  },
  healthText: {
    position: 'absolute',
    top: 40,
    left: 10,
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    zIndex: 20,
  },
  scoreText: {
    position: 'absolute',
    top: 40,
    right: 10,
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    zIndex: 20,
  },
  waveText: { // Style for Wave display
    position: 'absolute',
    top: 60, // Below health/score
    left: 10,
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    zIndex: 20,
  }
});
