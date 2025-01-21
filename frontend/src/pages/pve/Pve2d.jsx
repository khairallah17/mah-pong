import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { useEffect, useRef, useState, useContext } from 'react';
import GameSettingsButton from '../../components/pvp/Customize2d'; 
import GameScore from '../../components/pvp/GameScore';
import { ColorContext } from '../../context/ColorContext';

export default function Pve2d() {
  // Default single-player scoreboard
  const [{ score1, score2 }, setScores] = useState({ score1: 0, score2: 0 });
  const [winner, setWinner] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const countdownRef = useRef(false);

  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const paddle1Ref = useRef(null);
  const paddle2Ref = useRef(null);
  const ballRef = useRef(null);
  const tableRef = useRef(null);
  const tableAddonsRef = useRef(null);
  const isPausedRef = useRef(true);
  const collisionsRef = useRef(0);
  const winnerRef = useRef(null);

  // Color context
  const { tableMainColor, tableSecondaryColor, paddlesColor } = useContext(ColorContext);

  // Vector controlling ball motion
  let ballDirection = new THREE.Vector3(1, 0, 1);

  const aiInterval = useRef(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden'; // Disable scrolling

    const gameContainer = document.getElementById('game-container');
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 2.5, 2.5);
    camera.lookAt(scene.position);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    gameContainer?.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.75;
    controls.enableZoom = true;
    controls.mouseButtons = {
      LEFT: THREE.MOUSE.ROTATE,
      MIDDLE: THREE.MOUSE.DOLLY,
      RIGHT: null
    };

    // Background
    createSpaceBackground(scene);

    // Table
    const table = createTable();
    tableRef.current = table;

    // Table add-ons (stripes, legs, etc.)
    const tableAddons = createTableAddons();
    tableAddonsRef.current = tableAddons;

    // Paddles
    const { paddle1, paddle2 } = createPaddles();
    paddle1Ref.current = paddle1;
    paddle2Ref.current = paddle2;

    // Ball
    const ball = createBall();
    ballRef.current = ball;

    // Lights
    scene.add(table, tableAddons, paddle1, paddle2, ball, new THREE.AmbientLight(0xffffff, 0.5));
    scene.add(createLight());

    document.addEventListener('keydown', onDocumentKeyDown);
    document.addEventListener('keyup', onDocumentKeyUp);
    window.addEventListener('resize', onWindowResize);

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);
      if (winnerRef.current) {
        return;
      }
      if (!isPausedRef.current) {
        ball.position.add(ballDirection.clone().multiplyScalar(0.02));
        handleCollisions(ball, paddle1, paddle2);
      }
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    function onAIKeyDown(direction) {
      // Similar logic to onDocumentKeyDown, but for paddle2
      if (!paddle2Ref.current.userData.keyPressed && (direction === 'up' || direction === 'down')) {
        paddle2Ref.current.userData.keyPressed = true;
        const moveDirection = direction === 'up' ? -1 : 1;
        const PADDLE_SPEED = 0.1;
        const intervalId = setInterval(() => {
          if (winnerRef.current) return; // Stop if there's a winner
          const paddle2Geometry = paddle2Ref.current.geometry;
          const tableGeometry = tableRef.current.geometry;
          const newPosition = paddle2Ref.current.position.z + moveDirection * PADDLE_SPEED;
          const halfPaddleWidth = paddle2Geometry.parameters.depth / 2;
          const tableLimit = tableRef.current.position.z + tableGeometry.parameters.depth / 2;
          if (Math.abs(newPosition) + Math.abs(halfPaddleWidth) <= tableLimit) {
            paddle2Ref.current.position.z = newPosition;
          }
        }, 30);
        paddle2Ref.current.userData.intervalId = intervalId;
      }
    }

    function onAIKeyUp(direction) {
      // Similar logic to onDocumentKeyUp, but for paddle2
      if ((direction === 'up' || 'down') && paddle2Ref.current.userData.keyPressed) {
        paddle2Ref.current.userData.keyPressed = false;
        clearInterval(paddle2Ref.current.userData.intervalId);
      }
    }

    aiInterval.current = setInterval(() => {
      const distanceToPaddle2 = paddle2Ref.current.position.x - ball.position.x;
      const timeToPaddle2 = distanceToPaddle2 / (ballDirection.x || 0.00001);
      const predictedPosition = ball.position.z + ballDirection.z * timeToPaddle2; // Predict ball position
      const moveDirection = predictedPosition > paddle2Ref.current.position.z ? 'down' : 'up';
      const distanceZ = Math.abs(predictedPosition - paddle2Ref.current.position.z);
      const pressDuration = 200 + distanceZ * 100;
      onAIKeyDown(moveDirection);
      setTimeout(() => onAIKeyUp(moveDirection), pressDuration);
    }, 1000);

    startCountdown();

    return () => {
      document.body.style.overflow = 'auto';
      document.removeEventListener('keydown', onDocumentKeyDown);
      document.removeEventListener('keyup', onDocumentKeyUp);
      window.removeEventListener('resize', onWindowResize);
      if (gameContainer && renderer.domElement) {
        gameContainer.removeChild(renderer.domElement);
      }
      renderer.dispose();
      clearInterval(aiInterval.current);
    };
  }, []);

  // Color watchers
  useEffect(() => {
    if (tableRef.current) {
      tableRef.current.material.color.set(tableMainColor);
    }
    if (tableAddonsRef.current) {
      tableAddonsRef.current.children.forEach((child, index) => {
        if (index < 5) {
          child.material.color.set(tableSecondaryColor);
        }
      });
    }
    if (paddle1Ref.current && paddle2Ref.current) {
      paddle1Ref.current.material.color.set(paddlesColor);
      paddle2Ref.current.material.color.set(paddlesColor);
    }
  }, [tableMainColor, tableSecondaryColor, paddlesColor]);

  // Handle collisions
  function handleCollisions(ball, paddle1, paddle2) {
    const paddle1Box = new THREE.Box3().setFromObject(paddle1);
    const paddle2Box = new THREE.Box3().setFromObject(paddle2);
    const ballSphere = new THREE.Sphere(ball.position, ball.geometry.parameters.radius);

    // Left paddle bounce
    if (paddle1Box.intersectsSphere(ballSphere)) {
      const paddleCenter = new THREE.Vector3();
      paddle1Box.getCenter(paddleCenter);
      ballDirection.z = (ballSphere.center.z - paddleCenter.z) * 1.5;
      ballDirection.x *= -1;
      ball.position.x += 0.05;
      ballDirection.setLength(ballDirection.length() * 1.02);
    }

    // Right paddle bounce (AI)
    if (paddle2Box.intersectsSphere(ballSphere)) {
      const paddleCenter = new THREE.Vector3();
      paddle2Box.getCenter(paddleCenter);
      ballDirection.z = (ballSphere.center.z - paddleCenter.z) * 1.5;
      ballDirection.x *= -1;
      ball.position.x -= 0.05;
      ballDirection.setLength(ballDirection.length() * 1.02);
    }

    // Goals
    const goalLeft = new THREE.Box3(new THREE.Vector3(-3, -1, -1.5), new THREE.Vector3(-2.5, 1, 1.5));
    const goalRight = new THREE.Box3(new THREE.Vector3(2.5, -1, -1.5), new THREE.Vector3(3, 1, 1.5));

    if (goalLeft.intersectsSphere(ballSphere)) {
      isPausedRef.current = true;
      setScores(prev => {
        const updated = { score1: prev.score1, score2: prev.score2 + 1 };
        if (updated.score2 >= 5) {
          winnerRef.current = 'Computer';
          setWinner('Computer');
        }
        return updated;
      });
      if (!winnerRef.current)
        restartGame(ball);
    }

    if (goalRight.intersectsSphere(ballSphere)) {
      isPausedRef.current = true;
      setScores(prev => {
        const updated = { score1: prev.score1 + 1, score2: prev.score2 };
        if (updated.score1 >= 5) {
          winnerRef.current = 'You';
          setWinner('You');
        }
        return updated;
      });
      if (!winnerRef.current)
        restartGame(ball);
    }

    // Bounce off top/bottom edges
    if (ball.position.z < -1.5 || ball.position.z > 1.5) {
      ballDirection.z *= -1;
    }
  }

  // Restart the ball & paddles
  function restartGame(ball) {
    ball.position.set(0, 0.1, 0);
    paddle1Ref.current.position.set(-2.5, 0.1, 0);
    paddle2Ref.current.position.set(2.5, 0.1, 0);
    ballDirection.set(1, 0, 1);
    startCountdown();
  }

  // Key handling
  let keyPressed = false;
  function onDocumentKeyDown(event) {
    if (!keyPressed && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
      keyPressed = true;
      const moveDirection = event.key === 'ArrowUp' ? -1 : 1;
      const PADDLE_SPEED = 0.1;
      const intervalId = setInterval(() => {
        if (winnerRef.current) return; // Stop if there's a winner
        const paddle1Geometry = paddle1Ref.current.geometry;
        const tableGeometry = tableRef.current.geometry;
        const newPosition = paddle1Ref.current.position.z + moveDirection * PADDLE_SPEED;
        const halfPaddleWidth = paddle1Geometry.parameters.depth / 2;
        const tableLimit = tableRef.current.position.z + tableGeometry.parameters.depth / 2;
        if (Math.abs(newPosition) + Math.abs(halfPaddleWidth) <= tableLimit) {
          paddle1Ref.current.position.z = newPosition;
        }
      }, 30);
      paddle1Ref.current.userData.intervalId = intervalId;
    }
  }

  function onDocumentKeyUp(event) {
    if ((event.key === 'ArrowUp' || event.key === 'ArrowDown') && keyPressed) {
      keyPressed = false;
      clearInterval(paddle1Ref.current.userData.intervalId);
    }
  }

  // Window resize
  function onWindowResize() {
    if (rendererRef.current && cameraRef.current) {
      cameraRef.current.aspect = window.innerWidth / window.innerHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    }
  }

  // Create objects
  function createSpaceBackground(scene) {
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.1 });
    const starsVertices = [];
    for (let i = 0; i < 3000; i++) {
      starsVertices.push(
        (Math.random() - 0.5) * 2000,
        (Math.random() - 0.5) * 2000,
        (Math.random() - 0.5) * 2000
      );
    }
    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
    const starField = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(starField);
    scene.userData.stars = starField;
  }
  function createTable() {
    const geom = new THREE.BoxGeometry(5, 0.1, 3);
    const mat = new THREE.MeshStandardMaterial({ color: tableMainColor });
    const tbl = new THREE.Mesh(geom, mat);
    tbl.receiveShadow = true;
    return tbl;
  }
  function createTableAddons() {
    const stripeColor = tableSecondaryColor;
    const stripeThickness = 0.05;
    const stripes = [
      new THREE.Mesh(new THREE.BoxGeometry(5, 0.02, stripeThickness), new THREE.MeshStandardMaterial({ color: stripeColor })),
      new THREE.Mesh(new THREE.BoxGeometry(5, 0.02, stripeThickness), new THREE.MeshStandardMaterial({ color: stripeColor })),
      new THREE.Mesh(new THREE.BoxGeometry(stripeThickness, 0.02, 3), new THREE.MeshStandardMaterial({ color: stripeColor })),
      new THREE.Mesh(new THREE.BoxGeometry(stripeThickness, 0.02, 3), new THREE.MeshStandardMaterial({ color: stripeColor })),
      new THREE.Mesh(new THREE.BoxGeometry(stripeThickness, 0.02, 3), new THREE.MeshStandardMaterial({ color: stripeColor })),
    ];
    stripes[0].position.set(0, 0.06, 1.5);
    stripes[1].position.set(0, 0.06, -1.5);
    stripes[2].position.set(2.5, 0.06, 0);
    stripes[3].position.set(-2.5, 0.06, 0);
    stripes[4].position.set(0, 0.06, 0);

    // New modern legs
    const legGeometry = new THREE.BoxGeometry(0.1, 1, 0.1);
    const legMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const legs = [
      new THREE.Mesh(legGeometry, legMaterial),
      new THREE.Mesh(legGeometry, legMaterial),
      new THREE.Mesh(legGeometry, legMaterial),
      new THREE.Mesh(legGeometry, legMaterial),
    ];
    legs[0].position.set(2.4, -0.55, 1.4);
    legs[1].position.set(-2.4, -0.55, 1.4);
    legs[2].position.set(2.4, -0.55, -1.4);
    legs[3].position.set(-2.4, -0.55, -1.4);

    const group = new THREE.Group();
    group.add(...stripes, ...legs);
    return group;
  }
  function createPaddles() {
    const geom = new THREE.BoxGeometry(0.2, 0.02, 1);
    const mat = new THREE.MeshStandardMaterial({ color: paddlesColor });
    const paddle1 = new THREE.Mesh(geom, mat);
    paddle1.position.set(-2.5, 0.1, 0);

    const paddle2 = new THREE.Mesh(geom, mat);
    paddle2.position.set(2.5, 0.1, 0);

    return { paddle1, paddle2 };
  }
  function createBall() {
    const geometry = new THREE.SphereGeometry(0.1, 32, 32);
    const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const ball = new THREE.Mesh(geometry, material);
    ball.position.set(0, 0.1, 0);
    ball.castShadow = true;
    return ball;
  }
  function createLight() {
    const light = new THREE.DirectionalLight(0xffffff, 3);
    light.position.set(10, 10, 0);
    light.castShadow = true;
    return light;
  }

  function startCountdown() {
    if (countdownRef.current) return;
    countdownRef.current = true;
    setCountdown(3);
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          clearInterval(countdownInterval);
          isPausedRef.current = false;
          countdownRef.current = false;
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  }

  return (
    <>
      <GameSettingsButton />
      {winner && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-900/95 p-8 rounded-lg text-center">
          <h2 className="text-2xl font-bold text-white mb-4">{winner} Wins!</h2>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Play Again
          </button>
        </div>
      )}
      {countdown !== null && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-900/95 p-8 rounded-lg text-center">
          <h2 className="text-2xl font-bold text-white mb-4">{countdown}</h2>
        </div>
      )}
      <div id="game-container">
        <GameScore
          player1={{
            username: 'You',
            avatar: '/player1.png?height=40&width=40',
            score: score1
          }}
          player2={{
            username: 'Computer',
            avatar: '/player2.png?height=40&width=40',
            score: score2
          }}
        />
      </div>
    </>
  );
}