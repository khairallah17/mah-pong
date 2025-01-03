import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { useEffect, useRef, useState } from 'react';
import GameSettingsButton from '../../components/pvp/Customize2d';
import GameScore from '../../components/pvp/GameScore';

function Pvp2d() {
    const wsRef = useRef(null);
    const [{ score1, score2 }, setScores] = useState({ score1: 0, score2: 0 });
    const [{ username1, username2 }, setUsernames] = useState({ username1: '', username2: '' });
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
    const accessToken = JSON.parse(token).access;

    useEffect(() => {
        if (winnerRef.current) {
            isPausedRef.current = true;
        }
    }, [winnerRef.current]);

    useEffect(() => {
        if (token && !wsRef.current) {
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
                    console.log("message: ", message);
                    if (message.names && message.names.player1 && message.names.player2)
                        {
                            console.log("usernames: ", message.names.player1, message.names.player2);
                            setUsernames({ username1: message.names.player1, username2: message.names.player2 });
                        }
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
                console.log('WebSocket connection closed')
            };
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
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ refresh: JSON.parse(token).refresh })
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            console.log('New access token:', data.access);
            return data.access;
        } catch (error) {
            console.error('Error refreshing token:', error);
        }
    };

    useEffect(() => {
        if (!rendererRef.current && isMatched) {
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
            const tableaddons = createTableAddons();
            const { paddle1, paddle2 } = createPaddles(isPlayer1);
            const ball = createBall();

            paddle1Ref.current = paddle1;
            paddle2Ref.current = paddle2;
            ballRef.current = ball;
            tableRef.current = table;

            const alight = new THREE.AmbientLight(0xffffff, 0.5);
            scene.add(table, tableaddons, paddle1, paddle2, ball, alight);
            scene.add(createLight());

            document.addEventListener('keydown', onDocumentKeyDown);
            document.addEventListener('keyup', onDocumentKeyUp);
            window.addEventListener('resize', onWindowResize);
            document.addEventListener('visibilitychange', handleVisibilityChange);

            const animate = function () {

                // Rotate stars
                if (scene.userData.stars) {
                    scene.userData.stars.rotation.y += 0.0001;
                }

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
                        if (newScores.score2 >= 10) {
                            winnerRef.current = 'Player 2'
                            if (isPlayer1) {
                                wsRef.current.send(JSON.stringify({
                                    type: 'game_event',
                                    event: 'game_over',
                                    winner: 'Player 2',
                                    scoreP1: newScores.score1,
                                    scoreP2: newScores.score2,
                                }));
                                // handleMatchResult(username2, true);
                                // handleMatchResult(username1, false);
                            }
                        }
                        else {
                            wsRef.current.send(JSON.stringify({
                                type: 'game_event',
                                event: 'score_update',
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
                            if (!isPlayer1) {
                                wsRef.current.send(JSON.stringify({
                                    type: 'game_event',
                                    event: 'game_over',
                                    winner: 'Player 1',
                                    scoreP1: newScores.score1,
                                    scoreP2: newScores.score2,
                                }));
                                // handleMatchResult(username2, false);
                                // handleMatchResult(username1, true);
                            }
                        }
                        else {
                            wsRef.current.send(JSON.stringify({
                                type: 'game_event',
                                event: 'score_update',
                                scoreP1: newScores.score1,
                                scoreP2: newScores.score2,
                            }));
                        }
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

    const updateUserData = async (username, data) => {
        try {
            const response = await fetch(`http://localhost:8001/api/user-info/${username}/`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const responseData = await response.json();
            console.log('User data updated successfully:', responseData);
        } catch (error) {
            console.error('Error updating user data:', error);
        }
    };

    // Example usage
    const handleMatchResult = (username, isWin) => {
        const data = {
            nblose: isWin ? 0 : 1,
            nbwin: isWin ? 1 : 0,
            // score: ,
        };

        updateUserData(username, data);
    };

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

    const createSpaceBackground = (scene) => {
        // Create starfield
        const starsGeometry = new THREE.BufferGeometry();
        const starsMaterial = new THREE.PointsMaterial({
            color: 0xFFFFFF,
            size: 0.1,
            sizeAttenuation: true
        });

        const starsVertices = [];
        for (let i = 0; i < 10000; i++) {
            const x = (Math.random() - 0.5) * 2000;
            const y = (Math.random() - 0.5) * 2000;
            const z = (Math.random() - 0.5) * 2000;
            starsVertices.push(x, y, z);
        }

        starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
        const starField = new THREE.Points(starsGeometry, starsMaterial);
        scene.add(starField);
        scene.userData.stars = starField;

        // Create space nebula
        const textureLoader = new THREE.TextureLoader();
        const spaceTexture = textureLoader.load('/spae-nebula.jpg');
        const spaceMaterial = new THREE.MeshBasicMaterial({
            map: spaceTexture,
            side: THREE.BackSide
        });
        const spaceGeometry = new THREE.SphereGeometry(1000, 32, 32);
        const spaceMesh = new THREE.Mesh(spaceGeometry, spaceMaterial);
        scene.add(spaceMesh);
    };

    const onDocumentKeyUp = (event) => {
        if (keyPressed && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
            keyPressed = false;
            if (intervalIdRef.current) {
                clearInterval(intervalIdRef.current);
            }
        }
    };

    const resetCameraPos = () => {
        cameraRef.current.position.set(0, 2.5, 2.5);
        cameraRef.current.lookAt(0, 0, 0);
    };
    const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
            document.removeEventListener('keydown', onDocumentKeyDown);
            document.removeEventListener('keyup', onDocumentKeyUp);

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
        if (event.key.toLowerCase() === 'r')
            resetCameraPos();
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
        if (event === 'opponent_disconnected') {
            // Show popup alert or loading animation then redirect to dashboard
        }
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
            {!isMatched && (
                <h1 className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-2xl">
                    Looking for an opponent...
                </h1>
            )}
            {winnerRef.current && (
                <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-900/95 p-8 rounded-lg text-center">
                    <h2 className="text-2xl font-bold text-white mb-4">{winnerRef.current} Wins!</h2>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                        Restart Game
                    </button>
                    {/* maybe redirect to dashboard here instead after showing a popup alert or animation*/}
                </div>
            )}
            {isMatched && (
                <div id="game-container">
                    <GameScore
                        player1={{
                            username: username1,
                            avatar: "/player1.png?height=40&width=40",
                            score: score1
                        }}
                        player2={{
                            username: username2,
                            avatar: "/player2.png?height=40&width=40",
                            score: score2
                        }}
                    />
                </div>
            )}
        </>
    );
}

export default Pvp2d;
