import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { useEffect, useRef, useState, useContext } from 'react';
import GameSettingsButton from '../../components/pvp/Customize2d';
import GameScore from '../../components/pvp/GameScore';
import { ColorContext } from '../../context/ColorContext';
import { useNavigate } from 'react-router-dom';
import '../../i18n';
import { useTranslation } from 'react-i18next';

export default function Pvp2d() {

  const navigate = useNavigate();
  const { t } = useTranslation();
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
  const wsRef = useRef(null);
  let token = localStorage.getItem('authtoken');
  const accessToken = JSON.parse(token).access;
  const [inviteCode, setInviteCode] = useState(new URLSearchParams(window.location.search).get('invite'));
  const [matchId, setMatchId] = useState(new URLSearchParams(window.location.search).get('match_id'));
  const [isMatched, setIsMatched] = useState(false);
  const [isPlayer1, setIsPlayer1] = useState(true);
  const [gameState, setGameState] = useState(null);
  const [names, setNames] = useState({ player1: 'You', player2: 'Opponent' });
  const winnerRef = useRef(null);
  const isPlayer1Ref = useRef(true);
  const [processingResults, setProcessingResults] = useState(false);
  const [opponentDisconnected, setOpponentDisconnected] = useState(false);

  const { tableMainColor, tableSecondaryColor, paddlesColor } = useContext(ColorContext);

  const ballDirectionRef = useRef(new THREE.Vector3(1, 0, 1));
  const ballSpeedRef = useRef(0.01);

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
    controls.dampingFactor = 0.75;
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
      if (opponentDisconnected) return;
      
      if (!isPausedRef.current) {
        ball.position.add(ballDirectionRef.current.clone().multiplyScalar(ballSpeedRef.current));
        // handleCollisions(ball, paddle1, paddle2);
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
  }, [isMatched, opponentDisconnected]);

  useEffect(() => {
    if (token && !wsRef.current) {
      const wsUrl = `ws://localhost:8000/ws/pvp2d/?token=${accessToken}${inviteCode ? `&invite=${inviteCode}` : ''}${matchId ? `&match_id=${matchId}` : ''}`;
      wsRef.current = new WebSocket(wsUrl);
      wsRef.current.onopen = () => {
        console.log('WebSocket connection established');
      };
      wsRef.current.onmessage = async (event) => {
        const message = JSON.parse(event.data);
        console.log('WebSocket message:', message);
        if (message.type === 'token_expired') {
          console.log('Token expired, refreshing...');
          const newToken = await refreshToken();
          if (newToken) {
            localStorage.setItem('authtoken', JSON.stringify(newToken));
            wsManagerInstance.close();
            wsManagerInstance.setUrl('ws://localhost:8002/ws/notifications/?token=' + newToken?.access);
            wsManagerInstance.connect(handleMessage);
            console.log('WebSocket connection established with new token');
          } else {
            localStorage.removeItem('authtoken');
            navigate('/login');
          }
        }
        if (message.type === 'match_found') {
          setNames({ player1: message.names.player1, player2: message.names.player2 });
          setIsMatched(true);
          setIsPlayer1(message.player_id === '1');
          isPlayer1Ref.current = message.player_id === '1';
          startCountdown();
        } else if (message.type === 'game_state') {
          setGameState(message.game_state);
        } else if (message.type === 'opponent_disconnected') {
          setOpponentDisconnected(true);
        } else if (message.type === 'game_end') {
          setProcessingResults(false);
          setWinner(winnerRef.current);
        }
      };
      wsRef.current.onclose = () => {
        console.log('WebSocket connection closed');
      };
      wsRef.current.onerror = (e) => console.error('WebSocket error:', e);
    }

    const refreshToken = async () => {
      let refreshtokenUrl = "http://localhost:8001/api/token/refresh/"
      try {
        const response = await fetch(refreshtokenUrl, {
          method: 'POST',
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          return data;
        } else {
          return null;
        }
      } catch (error) {
        console.error('Failed to refresh token:', error);
        return null;
      }
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [token, inviteCode, matchId]);

  useEffect(() => {
    if (gameState) {
      isPausedRef.current = gameState.is_paused;
      ballDirectionRef.current.set(gameState.ball_direction_x, 0, gameState.ball_direction_z);
      ballSpeedRef.current = gameState.ball_speed / 10;
      if (isPlayer1Ref.current)
        paddle2Ref.current.position.z = gameState.paddle2_z;
      else
        paddle1Ref.current.position.z = gameState.paddle1_z;
      ballRef.current.position.set(gameState.ball_x, 0.1, gameState.ball_z);
      if (isPausedRef.current) {
        if (gameState.scoreP1 >= 5 || gameState.scoreP2 >= 5) {
          winnerRef.current = gameState.scoreP1 >= 5 ? t('Player') + ' 1' : t('Player')+' 2';
          wsRef.current.send(JSON.stringify({ type: 'game_event', event: 'end' }));
          setProcessingResults(true);
        } else if (!countdownRef.current) {
          startCountdown();
        }
        setScores({ score1: gameState.scoreP1, score2: gameState.scoreP2 });
      }
    }
  }, [gameState]);

  const startCountdown = () => {
    countdownRef.current = true;
    setCountdown(3);
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          clearInterval(countdownInterval);
          wsRef.current.send(JSON.stringify({ type: 'game_event', event: 'start' }));
          countdownRef.current = false;
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

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

  let keyPressed = false;
  function onDocumentKeyDown(event) {
    if (!keyPressed && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
      keyPressed = true;
      const moveDirection = event.key === 'ArrowUp' ? -1 : 1;
      const PADDLE_SPEED = 0.1;
      const intervalId = setInterval(() => {
        if (winnerRef.current || (gameState && gameState.is_paused)) return;
        const paddleRef = isPlayer1Ref.current ? paddle1Ref : paddle2Ref; // Use the correct paddle ref
        const paddleGeometry = paddleRef.current.geometry;
        const tableGeometry = tableRef.current.geometry;
        const newPosition = paddleRef.current.position.z + moveDirection * PADDLE_SPEED;
        const halfPaddleWidth = paddleGeometry.parameters.depth / 2;
        const tableLimit = tableRef.current.position.z + tableGeometry.parameters.depth / 2;
        if (Math.abs(newPosition) + Math.abs(halfPaddleWidth) <= tableLimit) {
          paddleRef.current.position.z = newPosition;
          wsRef.current.send(JSON.stringify({
            type: 'game_event',
            event: 'player_move',
            player_id: isPlayer1Ref.current ? '1' : '2', // Use the ref
            position: newPosition
          }));
        }
      }, 30);
      (isPlayer1Ref.current ? paddle1Ref : paddle2Ref).current.userData.intervalId = intervalId;
    }
  }

  function onDocumentKeyUp(event) {
    if ((event.key === 'ArrowUp' || event.key === 'ArrowDown') && keyPressed) {
      keyPressed = false;
      clearInterval((isPlayer1Ref.current ? paddle1Ref : paddle2Ref).current.userData.intervalId);
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

    const legGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1, 32);
    const legMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
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

  return (
    <>
      <GameSettingsButton />
      {!isMatched && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-2xl">
          <h1>{t('Waiting for opponent...')}</h1>
        </div>
      )}
      {winner && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-900/95 p-8 rounded-lg text-center">
          <h2 className="text-2xl font-bold text-white mb-4">{winner} {t('Wins!')}</h2>
          {!matchId && (
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              {t('Play Again')}
            </button>
          )}
          {matchId && (
            <button
              onClick={() => navigate('/dashboard/tournament/live')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mt-4"
            >
              {t('Back to Tournament')}
            </button>
          )}
        </div>
      )}
      {opponentDisconnected && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-900/95 p-8 rounded-lg text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Opponent Disconnected</h2>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      )}
      {isMatched && (
        <div id="game-container">
          <GameScore
            player1={{
              username: names.player1,
              avatar: '/player1.png?height=40&width=40',
              score: score1
            }}
            player2={{
              username: names.player2,
              avatar: '/player2.png?height=40&width=40',
              score: score2
            }}
          />
        </div>
      )}
      {countdown !== null && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-900/95 p-8 rounded-lg text-center">
          <h2 className="text-2xl font-bold text-white mb-4">{countdown}</h2>
        </div>
      )}
      {processingResults && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-900/95 p-8 rounded-lg text-center">
          <h2 className="text-2xl font-bold text-white mb-4">{t('Processing game results...')}</h2>
          <div className="loader border-t-white border-2 border-solid rounded-full w-8 h-8 animate-spin mx-auto"></div>
        </div>
      )}
    </>
  );
}