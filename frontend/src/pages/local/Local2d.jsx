import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { useEffect, useRef, useState, useContext } from 'react';
import GameSettingsButton from '../../components/pvp/Customize2d'; 
import GameScore from '../../components/pvp/GameScore';
import { ColorContext } from '../../context/ColorContext';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Local2d() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const matchId = queryParams.get('match_id');
  const player1 = queryParams.get('player1') ? queryParams.get('player1') : 'player 1';
  const player2 = queryParams.get('player2') ? queryParams.get('player2') : 'player 2';
  const [winner, setWinner] = useState('');
  const winnerRef = useRef(null);

  const handleWinnerSelection = (winner) => {
    setWinner(winner);
    setTimeout(() => {
      navigate(`/dashboard/tournament/local?winner=${winner}&match_id=${matchId}`);
    }, 0);
  };

  const [{ score1, score2 }, setScores] = useState({ score1: 0, score2: 0 });

  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const paddle1Ref = useRef(null);
  const paddle2Ref = useRef(null);
  const ballRef = useRef(null);
  const tableRef = useRef(null);
  const tableAddonsRef = useRef(null);
  const isPausedRef = useRef(true);

  const [gameEnd, setGameEnd] = useState(false)

  const { tableMainColor, tableSecondaryColor, paddlesColor } = useContext(ColorContext);

  let ballDirection = new THREE.Vector3(1, 0, 1);

  useEffect(() => {
    document.body.style.overflow = 'hidden';

    const gameContainer = document.getElementById('game-container');
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 2.5, 2.5);
    camera.lookAt(scene.position);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    gameContainer?.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enableZoom = true;
    controls.mouseButtons = {
      LEFT: THREE.MOUSE.ROTATE,
      MIDDLE: THREE.MOUSE.DOLLY,
      RIGHT: null
    };

    createSpaceBackground(scene);

    const table = createTable();
    tableRef.current = table;

    const tableAddons = createTableAddons();
    tableAddonsRef.current = tableAddons;

    const { paddle1, paddle2 } = createPaddles();
    paddle1Ref.current = paddle1;
    paddle2Ref.current = paddle2;

    const ball = createBall();
    ballRef.current = ball;

    scene.add(table, tableAddons, paddle1, paddle2, ball, new THREE.AmbientLight(0xffffff, 0.5));
    scene.add(createLight());

    document.addEventListener('keydown', onDocumentKeyDown);
    document.addEventListener('keyup', onDocumentKeyUp);
    window.addEventListener('resize', onWindowResize);

    const animate = () => {
      requestAnimationFrame(animate);
      if (winnerRef.current) {
        return;
      }
      if (!isPausedRef.current) {
        ball.position.add(ballDirection.clone().multiplyScalar(0.03));
        handleCollisions(ball, paddle1, paddle2);
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      document.body.style.overflow = 'auto';
      document.removeEventListener('keydown', onDocumentKeyDown);
      document.removeEventListener('keyup', onDocumentKeyUp);
      window.removeEventListener('resize', onWindowResize);
      if (gameContainer && renderer.domElement) {
        gameContainer.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

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

  useEffect(() => {
    const storedMatches = JSON.parse(localStorage.getItem('matches'));
    if (matchId && storedMatches) {
      const currentMatch = storedMatches.find(m => m.id === parseInt(matchId));
      if (currentMatch && currentMatch.winner) {
        navigate('/dashboard/tournament/local');
      }
    }
  }, [matchId, navigate]);

  function handleCollisions(ball, paddle1, paddle2) {
    const paddle1Box = new THREE.Box3().setFromObject(paddle1);
    const paddle2Box = new THREE.Box3().setFromObject(paddle2);
    const ballSphere = new THREE.Sphere(ball.position, ball.geometry.parameters.radius);

    if (paddle1Box.intersectsSphere(ballSphere)) {
      const paddleCenter = new THREE.Vector3();
      paddle1Box.getCenter(paddleCenter);
      ballDirection.z = (ballSphere.center.z - paddleCenter.z) * 1.5;
      ballDirection.x *= -1;
      ball.position.x += 0.05;
      ballDirection.setLength(ballDirection.length() * 1.02);
    }

    if (paddle2Box.intersectsSphere(ballSphere)) {
      const paddleCenter = new THREE.Vector3();
      paddle2Box.getCenter(paddleCenter);
      ballDirection.z = (ballSphere.center.z - paddleCenter.z) * 1.5;
      ballDirection.x *= -1;
      ball.position.x -= 0.05;
      ballDirection.setLength(ballDirection.length() * 1.02);
    }

    const goalLeft = new THREE.Box3(new THREE.Vector3(-3, -1, -1.5), new THREE.Vector3(-2.5, 1, 1.5));
    const goalRight = new THREE.Box3(new THREE.Vector3(2.5, -1, -1.5), new THREE.Vector3(3, 1, 1.5));

    if (goalLeft.intersectsSphere(ballSphere)) {
      isPausedRef.current = true;
      setScores(prev => {
        const updated = { score1: prev.score1, score2: prev.score2 + 1 };
        if (updated.score2 >= 5) {
          setWinner(player2);
          winnerRef.current = player2
          if (matchId)
            handleWinnerSelection(player2);
        }
        return updated;
      });
      restartGame(ball);
    }

    if (goalRight.intersectsSphere(ballSphere)) {
      isPausedRef.current = true;
      setScores(prev => {
        const updated = { score1: prev.score1 + 1, score2: prev.score2 };
        if (updated.score1 >= 5) {
          setWinner(player1);
          winnerRef.current = player1
          if (matchId)
            handleWinnerSelection(player1);
        }
        return updated;
      });
      restartGame(ball);
    }

    if (ball.position.z < -1.5 || ball.position.z > 1.5) {
      ballDirection.z *= -1;
    }
  }

  function restartGame(ball) {
    ball.position.set(0, 0.1, 0);
    paddle1Ref.current.position.set(-2.5, 0.1, 0);
    paddle2Ref.current.position.set(2.5, 0.1, 0);
    ballDirection.set(1, 0, 1);
  }

  let keyPressed = { KeyW: false, ArrowDown: false, ArrowUp: false, KeyS: false };

  function onDocumentKeyDown(event) {
    if ((event.code === 'KeyW' || event.code === 'KeyS') && !keyPressed[event.code]) {
      keyPressed[event.code] = true;
      clearInterval(paddle1Ref.current.userData.intervalId)
      const moveDirection = event.code === 'KeyW' ? -1 : 1;
      const PADDLE_SPEED = 0.07;
      const intervalId = setInterval(() => {
        if (winner) return;
        isPausedRef.current = false;
        const paddleRef = paddle1Ref;
        const paddleGeometry = paddleRef.current.geometry;
        const tableGeometry = tableRef.current.geometry;
        const newPosition = paddleRef.current.position.z + moveDirection * PADDLE_SPEED;
        const halfPaddleWidth = paddleGeometry.parameters.depth / 2;
        const tableLimit = tableRef.current.position.z + tableGeometry.parameters.depth / 2;
        if (Math.abs(newPosition) + Math.abs(halfPaddleWidth) <= tableLimit) {
          paddleRef.current.position.z = newPosition;
        }
        paddleRef.current.userData.intervalId = intervalId;
      }, 30);
    }

    if ((event.code === 'ArrowUp' || event.code === 'ArrowDown') && !keyPressed[event.code]) {
      keyPressed[event.code] = true;
      clearInterval(paddle2Ref.current.userData.intervalId)
      const moveDirection = event.code === 'ArrowDown' ? 1 : -1;
      const PADDLE_SPEED = 0.07;
      const intervalId = setInterval(() => {
        if (winner) return;
        isPausedRef.current = false;
        const paddleRef = paddle2Ref;
        const paddleGeometry = paddleRef.current.geometry;
        const tableGeometry = tableRef.current.geometry;
        const newPosition = paddleRef.current.position.z + moveDirection * PADDLE_SPEED;
        const halfPaddleWidth = paddleGeometry.parameters.depth / 2;
        const tableLimit = tableGeometry.parameters.depth / 2;
        if (Math.abs(newPosition) + Math.abs(halfPaddleWidth) <= tableLimit) {
          paddleRef.current.position.z = newPosition;
        }
        paddleRef.current.userData.intervalId = intervalId;
      }, 30);
    }
  }

  function onDocumentKeyUp(event) {
    if ((event.code === 'KeyW' || event.code === 'KeyS')) {
      keyPressed[event.code] = false;
      clearInterval(paddle1Ref.current.userData.intervalId);
    }

    if ((event.code === 'ArrowUp' || event.code === 'ArrowDown')) {
      keyPressed[event.code] = false;
      clearInterval(paddle2Ref.current.userData.intervalId);
    }
  }

  function onWindowResize() {
    if (rendererRef.current && cameraRef.current) {
      cameraRef.current.aspect = window.innerWidth / window.innerHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    }
  }

  function createSpaceBackground(scene) {
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.2 });
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



    const group = new THREE.Group();
    group.add(...stripes);
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

  return (
    <>
      <GameSettingsButton />
      {winner && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-900/95 p-8 rounded-lg text-center">
          <h2 className="text-2xl font-bold text-white mb-4">{winner} Wins!</h2>
          <button
            onClick={() => navigate(0)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Restart Game
          </button>
        </div>
      )}
      <div id="game-container">
        <GameScore
          player1={{
            username: player1? player1 : "player1",
            avatar: '/player1.png?height=40&width=40',
            score: score1
          }}
          player2={{
            username: player2? player2 : "player2",
            avatar: '/player2.png?height=40&width=40',
            score: score2
          }}
        />
      </div>
    </>
  );
}