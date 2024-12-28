import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { useEffect, useRef, useState } from 'react';
import GameSettingsButton from './Customize2d';
import bgi from '../assets/spaaacu.jpg';

function Pvp2d() {
    const wsRef = useRef(null);
    const [{ score1, score2 }, setScores] = useState({ score1: 0, score2: 0 });
    const winnerRef = useRef(null);
    const [gameState, setGameState] = useState(null);
    const [isMatched, setIsMatched] = useState(false);
    let keyPressed = false;
    const [isPlayer1, setIsPlayer1] = useState(true);
    let ballDirection = new THREE.Vector3(1, 0, 1);
    const PADDLE_SPEED = 0.05;
    const intervalIdRef = useRef(null);
    const rendererRef = useRef(null);
    const cameraRef = useRef(null);
    const paddle1Ref = useRef(null);
    const paddle2Ref = useRef(null);
    const ballRef = useRef(null);
    const tableRef = useRef(null);
    const isPausedRef = useRef(true);
    let token = localStorage.getItem('authtoken');

    useEffect(() => {
        if (winnerRef.current) {
            isPausedRef.current = true;
        }
    }, [winnerRef.current]);

    useEffect(() => {
        if (token && !wsRef.current) {
            const accessToken = JSON.parse(localStorage.getItem('authtoken')).access;
            wsRef.current = new WebSocket('ws://localhost:8000/ws/matchmaking/?token=' + accessToken);
            wsRef.current.onopen = () => {
                console.log('WebSocket connection established');
            };
            wsRef.current.onmessage = async (event) => {
                const message = JSON.parse(event.data);
                if (message.type === 'token_expired') {
                    const newToken = await refreshToken();
                    if (newToken) {
                        localStorage.setItem('authtoken', JSON.stringify(newToken));
                        wsRef.current = new WebSocket('ws://localhost:8000/ws/matchmaking/?token=' + newToken.access);
                        console.log('WebSocket connection established with new token');
                    } else {
                        localStorage.removeItem('authtoken');
                        window.location.href = '/login';
                    }
                }
                if (message.type === 'match_found') {
                    if (message.score && message.score.player1 && message.score.player2)
                        setScores({ score1: message.score.player1, score2: message.score.player2 });
                    if (message.player_id === '2')
                        setIsPlayer1(false);
                    setIsMatched(true);
                    console.log("match found with player_id: ", message.player_id, "isPlayer1: ", isPlayer1);
                } else if (message.type === 'game_event') {
                    updateScene(message.event);
                } 
                if (message.event === 'score_update') {
                    setScores(message.score);
                }
                // else if (message.type === 'game_state') {
                //     setGameState(message.game_state);
                // }
            };
            wsRef.current.onclose = () => {
                console.log('WebSocket connection closed')};
                // window.location.href = '/dashboard';
            wsRef.current.onerror = (e) => console.error('WebSocket error:', e);
        }
        return () => {

            if (wsRef.current) {
                wsRef.current.close();
                wsRef.current = null;
            }
        };
    }, [token]);

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

    useEffect(() => {
        if (!rendererRef.current && isMatched) {
            const gameContainer = document.getElementById('game-container');
            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            camera.position.set(0, 5, 5);
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
            controls.dampingFactor = 0.25;
            controls.enableZoom = true;

            const table = createTable();
            const tableaddons = createTableAddons();
            const { paddle1, paddle2 } = createPaddles(isPlayer1);
            const ball = createBall();

            paddle1Ref.current = paddle1;
            paddle2Ref.current = paddle2;
            ballRef.current = ball;
            tableRef.current = table;
            // const backgroundImage = new THREE.TextureLoader().load(bgi);
            // backgroundImage.encoding = THREE.sRGBEncoding;
            // scene.background = backgroundImage;

            const alight = new THREE.AmbientLight(0xffffff, 0.5);
            scene.add(table, tableaddons, paddle1, paddle2, ball, alight);
            scene.add(createLight());

            document.addEventListener('keydown', onDocumentKeyDown);
            document.addEventListener('keyup', onDocumentKeyUp);
            window.addEventListener('resize', onWindowResize);
            document.addEventListener('visibilitychange', handleVisibilityChange);

            const animate = function () {
                if (isPausedRef.current) {
                    controls.update();
                    requestAnimationFrame(animate);
                    renderer.render(scene, camera);
                    return;
                }
                requestAnimationFrame(animate);
                ball.position.add(ballDirection.clone().multiplyScalar(0.05));

                const paddle1Box = new THREE.Box3().setFromObject(paddle1);
                const paddle2Box = new THREE.Box3().setFromObject(paddle2);
                const ballSphere = new THREE.Sphere(ball.position, ball.geometry.parameters.radius);
                const goal1 = new THREE.Box3(new THREE.Vector3(-3, -1, -1.5), new THREE.Vector3(-2.5, 1, 1.5));
                const goal2 = new THREE.Box3(new THREE.Vector3(2.5, -1, -1.5), new THREE.Vector3(3, 1, 1.5));

                if (paddle1Box.intersectsSphere(ballSphere)) {
                    const paddle1Center = new THREE.Vector3();
                    paddle1Box.getCenter(paddle1Center);
                    const ballPaddleZDiff = ballSphere.center.z - paddle1Center.z;
                    ballDirection.z = ballPaddleZDiff * 1.5;
                    ballDirection.x *= -1;
                    ball.position.x += 0.05 * (isPlayer1 ? 1 : -1);
                } else if (paddle2Box.intersectsSphere(ballSphere)) {
                    const paddle2Center = new THREE.Vector3();
                    paddle2Box.getCenter(paddle2Center);
                    const ballPaddleZDiff = ballSphere.center.z - paddle2Center.z;
                    ballDirection.z = ballPaddleZDiff * 1.5;
                    ballDirection.x *= -1;
                    ball.position.x -= 0.05 * (isPlayer1 ? 1 : -1);
                }

                if (goal1.intersectsSphere(ballSphere)) {
                    isPausedRef.current = true;
                    setScores(prevScores => {
                        const newScores = { score1: prevScores.score1, score2: prevScores.score2 + 1 };
                        wsRef.current.send(JSON.stringify({
                            type: 'game_event',
                            event: 'score_update',
                            scoreP1: newScores.score1,
                            scoreP2: newScores.score2,
                        }));
                        if (newScores.score2 >= 10) {
                            winnerRef.current = 'Player 2'
                            wsRef.current.send(JSON.stringify({
                                type: 'game_event',
                                event: 'game_over',
                                winner: 'Player 2',
                                scoreP1: newScores.score1,
                                scoreP2: newScores.score2,
                            }));
                        }
                        return newScores;
                    });

                    restartGame(ball);
                }

                if (goal2.intersectsSphere(ballSphere)) {
                    isPausedRef.current = true;
                    setScores(prevScores => {
                        const newScores = { score1: prevScores.score1 + 1, score2: prevScores.score2 };
                        if (newScores.score1 >= 10) {
                            winnerRef.current = 'Player 1'
                            wsRef.current.send(JSON.stringify({
                                type: 'game_event',
                                event: 'game_over',
                                winner: 'Player 1',
                                scoreP1: newScores.score1,
                                scoreP2: newScores.score2,
                            }));
                        }
                        wsRef.current.send(JSON.stringify({
                            type: 'game_event',
                            event: 'score_update',
                            scoreP1: newScores.score1,
                            scoreP2: newScores.score2,
                        }));
                        return newScores;
                    });
                    restartGame(ball);
                }

                if (ball.position.z < -1.5 || ball.position.z > 1.5) {
                    ballDirection.z *= -1;
                }
                renderer.render(scene, camera);
            };

            animate();
        }
        return () => {
            document.removeEventListener('keydown', onDocumentKeyDown);
            document.removeEventListener('keyup', onDocumentKeyUp);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('resize', onWindowResize);
        }
    }, [isMatched, isPlayer1, gameState]);

    function restartGame(ball) {
        ball.position.set(0, 0.1, 0);
        paddle1Ref.current.position.set(isPlayer1 ? -2.5 : 2.5, 0.1, 0);
        paddle2Ref.current.position.set(isPlayer1 ? 2.5 : -2.5, 0.1, 0);
        ballDirection.set(1, 0, 1);
        isPausedRef.current = true;
    }

    const onWindowResize = () => {
        if (rendererRef.current && cameraRef.current) {
            cameraRef.current.aspect = window.innerWidth / window.innerHeight;
            cameraRef.current.updateProjectionMatrix();
            rendererRef.current.setSize(window.innerWidth, window.innerHeight);
        }
    };

    const onDocumentKeyUp = (event) => {
        if (keyPressed && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
            keyPressed = false;
            if (intervalIdRef.current) {
                clearInterval(intervalIdRef.current);
            }
        }
    };

    const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
            document.removeEventListener('keydown', onDocumentKeyDown);
            document.removeEventListener('keyup', onDocumentKeyUp);

            // Show popup alert or loading animation
            const popup = document.createElement('div');
            popup.id = 'reconnecting-popup';
            popup.style.position = 'fixed';
            popup.style.top = '50%';
            popup.style.left = '50%';
            popup.style.transform = 'translate(-50%, -50%)';
            popup.style.padding = '20px';
            popup.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
            popup.style.color = 'white';
            popup.style.fontSize = '20px';
            popup.style.zIndex = '1000';
            popup.innerText = 'Reconnecting...';
            document.body.appendChild(popup);

            setTimeout(() => {
                document.addEventListener('keydown', onDocumentKeyDown);
                document.addEventListener('keyup', onDocumentKeyUp);

                // Hide popup alert or loading animation
                document.body.removeChild(popup);
            }, 1000);
        }
    };

    const onDocumentKeyDown = (event) => {
        if (!keyPressed) {
            keyPressed = true;
            const moveDirection = event.key === 'ArrowUp' ? -1 : event.key === 'ArrowDown' ? 1 : 0;
            if (moveDirection !== 0) {
                intervalIdRef.current = setInterval(() => {
                    const paddle1Geometry = paddle1Ref.current.geometry;
                    const tableGeometry = tableRef.current.geometry;
                    const newPosition = paddle1Ref.current.position.z + moveDirection * PADDLE_SPEED;
                    const halfPaddleWidth = paddle1Geometry.parameters.depth / 2;
                    const tableLimit = tableRef.current.position.z + tableGeometry.parameters.depth / 2;
                    if (Math.abs(newPosition) + Math.abs(halfPaddleWidth) < tableLimit && winnerRef.current === null) {
                        wsRef.current.send(JSON.stringify({
                            type: 'game_event',
                            event: moveDirection === -1 ? 'player_move_up' : 'player_move_down',
                            player_id: isPlayer1 ? 1 : 2,
                        }));
                        isPausedRef.current = false;
                        paddle1Ref.current.position.z = newPosition;
                    }
                }, 30);
            }
        }
    };

    const updateScene = (event) => {
        if (isPausedRef.current && document.visibilityState === 'visible' && event !== 'game_over' && event !== 'score_update') {
            isPausedRef.current = false;
        }
        if (paddle1Ref.current && paddle2Ref.current) {
            if (event === 'player_move_up') {
                paddle2Ref.current.position.z -= PADDLE_SPEED;
            } else if (event === 'player_move_down') {
                paddle2Ref.current.position.z += PADDLE_SPEED;
            }
        }
    };

    const createTable = () => {
        const geometry = new THREE.BoxGeometry(5, 0.1, 3);
        const material = new THREE.MeshStandardMaterial({ color: 0x228B22 });
        const table = new THREE.Mesh(geometry, material);
        table.receiveShadow = true;
        return table;
    };

    const createTableAddons = () => {
        const stripeColor = 0x000000; // Same color as paddles
        const stripeThickness = 0.05;

        const stripes = [
            new THREE.Mesh(new THREE.BoxGeometry(5, 0.02, stripeThickness), new THREE.MeshStandardMaterial({ color: stripeColor })),  // Top edge
            new THREE.Mesh(new THREE.BoxGeometry(5, 0.02, stripeThickness), new THREE.MeshStandardMaterial({ color: stripeColor })),  // Bottom edge
            new THREE.Mesh(new THREE.BoxGeometry(stripeThickness, 0.02, 3), new THREE.MeshStandardMaterial({ color: stripeColor })),  // Right edge
            new THREE.Mesh(new THREE.BoxGeometry(stripeThickness, 0.02, 3), new THREE.MeshStandardMaterial({ color: stripeColor })),  // Left edge
            new THREE.Mesh(new THREE.BoxGeometry(stripeThickness, 0.02, 3), new THREE.MeshStandardMaterial({ color: stripeColor })),  // Center stripe
        ];

        stripes[0].position.set(0, 0.06, 1.5);    // Top edge
        stripes[1].position.set(0, 0.06, -1.5);   // Bottom edge
        stripes[2].position.set(2.5, 0.06, 0);    // Right edge
        stripes[3].position.set(-2.5, 0.06, 0);   // Left edge
        stripes[4].position.set(0, 0.06, 0);     // Center stripe

        const legGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1, 32);
        const legMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
        const legs = [
            new THREE.Mesh(legGeometry, legMaterial),
            new THREE.Mesh(legGeometry, legMaterial),
            new THREE.Mesh(legGeometry, legMaterial),
            new THREE.Mesh(legGeometry, legMaterial),
        ];

        legs[0].position.set(2.4, -0.55, 1.4);  // Front-right
        legs[1].position.set(-2.4, -0.55, 1.4); // Front-left
        legs[2].position.set(2.4, -0.55, -1.4); // Back-right
        legs[3].position.set(-2.4, -0.55, -1.4); // Back-left

        const tableAddons = new THREE.Group();
        tableAddons.add(...stripes, ...legs);
        return tableAddons;
    }

    const createBall = () => {
        const geometry = new THREE.SphereGeometry(0.1, 32, 32);
        const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
        const ball = new THREE.Mesh(geometry, material);
        ball.position.set(0, 0.1, 0);
        ball.castShadow = true;
        return ball;
    };

    const createPaddles = (isPlayer1) => {
        const geometry = new THREE.BoxGeometry(0.2, 0.02, 1);
        const material = new THREE.MeshStandardMaterial({ color: 0x000000 });
        const paddle1 = new THREE.Mesh(geometry, material);
        const paddle2 = new THREE.Mesh(geometry, material);

        paddle1.position.set(isPlayer1 ? -2.5 : 2.5, 0.1, 0);
        paddle2.position.set(isPlayer1 ? 2.5 : -2.5, 0.1, 0);

        paddle1.castShadow = paddle2.castShadow = true;

        return { paddle1, paddle2 };
    };

    const createLight = () => {
        const light = new THREE.DirectionalLight(0xffffff, 3);
        light.position.set(10, 10, 0);
        light.castShadow = true;
        return light;
    };

    return (
        <>
            <GameSettingsButton />
            {!isMatched && <h1>Looking for an opponent...</h1>}
            {winnerRef.current && (
                <div className="popup">
                    <h2>{winnerRef.current} Wins!</h2>
                    <button onClick={() => window.location.reload()}>Restart Game</button>
                </div>
            )}
            {isMatched && <div id="game-container">
                <div id="score1">Player 1: {score1}</div>
                <div id="score2">Player 2: {score2}</div>
            </div>}
            
        </>
    );
}

export default Pvp2d;
