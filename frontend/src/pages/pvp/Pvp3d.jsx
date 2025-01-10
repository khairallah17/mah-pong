import * as THREE from 'three';
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import GameScore from '../../components/pvp/GameScore';

function Pve3d() {
    const gameContainerRef = useRef(null);
    const rendererRef = useRef(null);
    const paddle2Ref = useRef(null);
    const paddle1Ref = useRef(null);
    const ballRef = useRef(null);
    const paddlePositionDiffRef = useRef(null);
    const velocityRef = useRef(null);
    const wsRef = useRef(null);
    const isPausedRef = useRef(true);
    const [isMatched, setIsMatched] = useState(false);
    const [isPlayer1, setIsPlayer1] = useState(true);
    const [showPopup, setShowPopup] = useState(false);
    const [countdown, setCountdown] = useState(3);
    const [isPlayerReady, setIsPlayerReady] = useState(false);
    const [opponentReady, setOpponentReady] = useState(false);
    const countdownRef = useRef(null);
    const [{ score1, score2 }, setScores] = useState({ score1: 0, score2: 0 });
    const [{ username1, username2 }, setUsernames] = useState({ username1: '', username2: '' });
    const winnerRef = useRef(null);
    const GRAVITY = -0.0012;
    const INITIAL_VELOCITY = new THREE.Vector3(0.005, 0.01, 0.025);
    const TABLE_DIMENSIONS = { width: 1.45, length: 2.6 };
    const isPlayer1Ref = useRef(isPlayer1);
    const initBallPos = new THREE.Vector3(0, 1, 0);
    let token = localStorage.getItem('authtoken');

    useEffect(() => {
        isPlayer1Ref.current = isPlayer1;
    }, [isPlayer1]);

    useEffect(() => {
        if (token && !wsRef.current) {
            const accessToken = JSON.parse(localStorage.getItem('authtoken')).access;
            wsRef.current = new WebSocket('ws://localhost:8000/ws/matchmaking/?token=' + accessToken);
            wsRef.current.onopen = () => {
                console.log('WebSocket connection established');
                wsRef.current.send(JSON.stringify({ type: 'player_ready' }));
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
                    setIsMatched(true);
                    if (message.player_id === '2') setIsPlayer1(false);
                    if (message.score && message.score.player1 && message.score.player2)
                        setScores({ score1: message.score.player1, score2: message.score.player2 });
                    if (message.names && message.names.player1 && message.names.player2)
                        setUsernames({ username1: message.names.player1, username2: message.names.player2 });
                } else if (message.type === 'player_ready') {
                    setOpponentReady(true);
                } else if (message.type === 'game_event') {
                    if (message.event === 'restart') restartGame(new THREE.Vector3(0, 1, 0));
                    else updateScene(message.event, message.position, message.spin);
                } else if (message.type === 'game_state') {
                    //gameStateRef.current = message.game_state;
                    //setGameState(message.game_state);
                }
            };
            wsRef.current.onclose = () => console.log('WebSocket connection closed');
            wsRef.current.onerror = (e) => console.error('WebSocket error:', e);
        }

        return () => {
            if (wsRef.current) {
                wsRef.current.close();
                wsRef.current = null;
            }
        };
    }, [token]);

    useEffect(() => {
        if (isMatched && isPlayerReady && opponentReady) {
            startCountdown();
        }
    }, [isMatched, isPlayerReady, opponentReady]);

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


    const updateScene = (event, position, spin) => {
        if (event === 'player_move') {
            paddle2Ref.current.position.set(position.x, position.y, position.z);
        }
        else if (event === 'spin') {
            paddlePositionDiffRef.current?.set(spin.x, spin.y, spin.z);
        }
        // animatePaddleRotation(paddle1Ref.current, paddle2Ref.current);
    };
    function animatePaddleRotation(paddle1, paddle2) {
        let rotationy = Math.atan2(Math.abs(paddle1.position.y), paddle1.position.x * 5);
        let rotationz = Math.atan2(Math.abs(paddle1.position.y), paddle1.position.x);
        paddle1.rotation.y = isPlayer1Ref.current ? rotationy : -rotationy;
        if (paddle1.position.x > 0) {
            paddle1.rotation.z = rotationz - Math.PI / 2;
        } else {
            paddle1.rotation.z = -rotationz + Math.PI / 2;
        }
        rotationy = Math.atan2(Math.abs(paddle2.position.y), paddle2.position.x * 5);
        rotationz = Math.atan2(Math.abs(paddle2.position.y), paddle2.position.x);
        paddle2.rotation.y = isPlayer1Ref.current ? -rotationy : rotationy;
        if (paddle2.position.x > 0) {
            paddle2.rotation.z = rotationz - Math.PI / 2;
        } else {
            paddle2.rotation.z = -rotationz + Math.PI / 2;
        }
    }

    function startCountdown() {
        if (isPausedRef.current) {
            setShowPopup(true);
            setCountdown(3);
            if (countdownRef.current) clearInterval(countdownRef.current);
            countdownRef.current = setInterval(() => {
                setCountdown(prevCountdown => {
                    if (prevCountdown === 1) {
                        clearInterval(countdownRef.current);
                        setShowPopup(false);
                        isPausedRef.current = false;
                    }
                    return prevCountdown - 1;
                });
            }, 1000);
        }
    }

    useEffect(() => {
        if (!rendererRef.current && isMatched) {
            const gameContainer = gameContainerRef.current;

            let waitforpaddle2 = false;

            // Scene Setup
            const scene = new THREE.Scene();
            const camera = createCamera();
            const renderer = createRenderer(gameContainer);

            const mouse = new THREE.Vector2();
            let isListening = true;

            // Objects
            let paddle1, paddle2, ball, table, grid;
            let velocity = INITIAL_VELOCITY.clone();
            let paddlePositionDiff = new THREE.Vector3(0, 0, 0);
            let firstIntersectionPosition = null;
            let lastIntersectionPosition = null;
            velocityRef.current = velocity;
            paddlePositionDiffRef.current = paddlePositionDiff;

            // Load Scene and Start Animation
            loadScene(scene, (objects) => {
                ({ paddle1, paddle2, ball, table, grid } = objects);
                paddle2Ref.current = paddle2;
                paddle1Ref.current = paddle1;
                ball.position.copy(initBallPos);
                ballRef.current = ball;
                if (!isPlayer1) {
                    paddle1.position.set(0, 1, -1);
                    paddle2.position.set(0, 1, 1);
                }
                else {
                    paddle1.position.set(0, 1, 1);
                    paddle2.position.set(0, 1, -1);
                }
                const tablebox = new THREE.Box3().setFromObject(table);
                console.log(tablebox.min.z, tablebox.max.z);
                addLights(scene);
                startGameListeners(mouse, paddle1, camera, table, paddle2, velocity, renderer, scene);
                animate();
                startCountdown();
            });

            function createCamera() {
                const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
                camera.position.set(0, 1.25, 2);
                if (!isPlayer1) {
                    camera.position.set(0, 1.25, -2);
                }
                return camera;
            }

            function createRenderer(container) {
                const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
                renderer.setPixelRatio(window.devicePixelRatio);
                renderer.setSize(window.innerWidth, window.innerHeight);
                if (container && container.childNodes.length === 0) {
                    container.appendChild(renderer.domElement);
                }
                window.addEventListener('resize', () => onWindowResize(camera, renderer));
                return renderer;
            }

            function onError(err) {
                if (err instanceof ErrorEvent) {
                    console.error('An error happened:', err.message);
                } else {
                    console.error('An unknown error occurred:', err);
                }
            }

            function loadScene(scene, callback) {
                const loader = new GLTFLoader();
                loader.load('../../models/loadedscene.glb', (gltf) => {
                    const loadedScene = gltf.scene;
                    scene.add(loadedScene);
                    const objects = {
                        paddle1: isPlayer1 ? loadedScene.getObjectByName('Paddle_1') : loadedScene.getObjectByName('Paddle_2'),
                        paddle2: isPlayer1 ? loadedScene.getObjectByName('Paddle_2') : loadedScene.getObjectByName('Paddle_1'),
                        ball: loadedScene.getObjectByName('Ball'),
                        table: loadedScene.getObjectByName('table_plate'),
                        grid: loadedScene.getObjectByName('table_grid')
                    };
                    callback(objects);
                }, undefined, onError);
            }

            function addLights(scene) {
                const light = new THREE.AmbientLight(0xffffff, 3);
                light.position.set(0, 10, 0);
                light.castShadow = true;
                scene.add(light);
            }

            function startGameListeners(
                mouse,
                paddle1,
                camera,
                table,
                paddle2,
                velocity,
                renderer,
                scene
            ) {
                // document.addEventListener('visibilitychange', handleVisibilityChange);
                window.addEventListener('keydown', onRestartKey);
                window.addEventListener('click', () => onToggleListening());
                window.addEventListener('mousemove', (event) => onMouseMove(event, mouse, paddle1, camera, table));
            }

            function onWindowResize(camera, renderer) {
                renderer.setSize(window.innerWidth, window.innerHeight);
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
                renderer.render(scene, camera);
            }

            function onRestartKey(event) {
                if (event.key.toLowerCase() === 'r') {
                    wsRef.current.send(JSON.stringify({
                        type: 'game_event',
                        event: 'restart',
                    }));
                }
                restartGame();
            }

            function onToggleListening() {
                isListening = !isListening;
                document.body.style.cursor = isListening ? 'none' : 'auto';
            }

            function onMouseMove(
                event,
                mouse,
                paddle1,
                camera,
                table
            ) {
                if (isListening) {
                    wsRef.current.send(JSON.stringify({
                        type: 'game_event',
                        event: 'player_move',
                        player_id: isPlayer1 ? 1 : 2,
                        position: paddle1.position,
                    }));
                    updateMousePosition(event, mouse);
                    updatePaddle1Position(mouse, paddle1, TABLE_DIMENSIONS, camera, table);

                }
            }

            function updateMousePosition(event, mouse) {
                mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
                mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            }

            function mapRange(value, from, to) {
                return (value - from.min) * (to.max - to.min) / (from.max - from.min) + to.min;
            }

            function updatePaddle1Position(
                mouse,
                paddle1,
                tableDimensions,
                camera,
                table
            ) {
                let paddleX = mapRange(mouse.x, { min: -1, max: 1 }, { min: -1, max: 1 });
                let paddleY, paddleZ;

                if (mouse.y > -0.4) {
                    paddleY = 1;
                    paddleZ = mapRange(mouse.y, { min: -0.4, max: 1 }, { min: 1.3, max: 0.3 });
                } else {
                    paddleY = mapRange(mouse.y, { min: -1, max: -0.4 }, { min: 0.5, max: 1 });
                    paddleZ = mapRange(mouse.y, { min: -1, max: -0.4 }, { min: 1.6, max: 1.3 });
                }

                if (!isPlayer1) {
                    if (mouse.y > -0.4) {
                        paddleZ = mapRange(mouse.y, { min: -0.4, max: 1 }, { min: -1.3, max: -0.3 });
                    } else {
                        paddleZ = mapRange(mouse.y, { min: -1, max: -0.4 }, { min: -1.6, max: -1.3 });
                    }
                    paddleX = -paddleX;
                }

                paddle1.position.set(paddleX, paddleY, paddleZ);
                updateCameraPosition(mouse, camera, table);
                animatePaddleRotation(paddle1, paddle2);
            }

            function updateCameraPosition(mouse, camera, table) {
                camera.position.set(mouse.x, mouse.y / 5 + 1.25, -mouse.y / 15 + 2);
                if (!isPlayer1) {
                    camera.position.set(-mouse.x, mouse.y / 5 + 1.25, -mouse.y / 15 - 2);
                }
                camera.position.add(new THREE.Vector3().subVectors(table.position, camera.position).multiplyScalar(0.1));
                camera.lookAt(table.position);
            }

            function animate() {
                // updatePaddle2AI();
                if (isPausedRef.current) {
                    requestAnimationFrame(animate);
                    renderer.render(scene, camera);
                    return;
                }

                applyGravity();
                moveBall();

                //applyAirResistance();

                handleCollisions();

                renderer.render(scene, camera);
                requestAnimationFrame(animate);
            }

            // function updatePaddle2AI() {
            //     const speed = 3;
            //     const XdistanceToBall = ball.position.x - paddle2.position.x;
            //     const speedModifier = Math.min(Math.abs(XdistanceToBall) / 10, 1);
            //     paddle2.position.x += Math.sign(XdistanceToBall) * speed * speedModifier;
            //     // Optionally enable Y-axis movement
            //     // paddle2.position.y += Math.sign(YdistanceToBall) * speed * speedModifier;
            // }

            function moveBall() {
                ball.position.x += velocity.x;
                ball.position.y += velocity.y;
                ball.position.z += velocity.z;
            }

            function applyGravity() {
                velocity.y += GRAVITY;
            }

            function handleCollisions() {
                const ballBox = new THREE.Box3().setFromObject(ball);
                const paddle1Box = new THREE.Box3().setFromObject(paddle1).expandByScalar(0.01);
                const paddle2Box = new THREE.Box3().setFromObject(paddle2).expandByScalar(0.01);
                const tableBox = new THREE.Box3().setFromObject(table);
                const gridBox = new THREE.Box3().setFromObject(grid).expandByScalar(0.01);

                if (ballBox.intersectsBox(tableBox)) {
                    handleTableCollision(ballBox, tableBox);
                }

                if (ball.position.z > 1.5) {
                    // Player 1 scores
                    setScores(prevScores => {
                        const newScores = { score1: prevScores.score1 + 1, score2: prevScores.score2 };
                        if (newScores.score2 >= 10) {
                            if (isPlayer1) {
                                wsRef.current.send(JSON.stringify({
                                    type: 'game_event',
                                    event: 'game_over',
                                    winner: 'Player 1',
                                    scoreP1: newScores.score1,
                                    scoreP2: newScores.score2,
                                }));
                            }
                            winnerRef.current = 'Player 1'
                            isPausedRef.current = true;
                            setShowPopup(true);
                        }
                        else {
                            wsRef.current.send(JSON.stringify({
                                type: 'game_event',
                                event: 'score_update',
                                scoreP1: newScores.score1,
                                scoreP2: newScores.score2,
                            }));
                            wsRef.current.send(JSON.stringify({
                                type: 'game_event',
                                event: 'restart',
                            }));
                            restartGame();
                        }
                        return newScores;
                    });
                } else if (ball.position.z < -1.5) {
                    // Player 2 scores
                    setScores(prevScores => {
                        const newScores = { score1: prevScores.score1, score2: prevScores.score2 + 1};
                        if (newScores.score2 >= 10) {
                            if (isPlayer1) {
                                wsRef.current.send(JSON.stringify({
                                    type: 'game_event',
                                    event: 'game_over',
                                    winner: 'Player 2',
                                    scoreP1: newScores.score1,
                                    scoreP2: newScores.score2,
                                }));
                            }
                            winnerRef.current = 'Player 2'
                            isPausedRef.current = true;
                            setShowPopup(true);
                        }
                        else {
                            wsRef.current.send(JSON.stringify({
                                type: 'game_event',
                                event: 'score_update',
                                scoreP1: newScores.score1,
                                scoreP2: newScores.score2,
                            }));
                            wsRef.current.send(JSON.stringify({
                                type: 'game_event',
                                event: 'restart',
                            }));
                            restartGame();
                        }
                        return newScores;
                    });
                } else if (ball.position.y < 0.2) {
                    wsRef.current.send(JSON.stringify({
                        type: 'game_event',
                        event: 'restart',
                    }));
                    restartGame();
                }

                if (ballBox.intersectsBox(paddle1Box)) {
                    handlePaddle1Collision(ballBox, paddle1Box);
                }

                //handleSpin();

                if (ballBox.intersectsBox(paddle2Box)) {
                    handlePaddle2Collision(ballBox, paddle2Box);
                }

                // if (ballBox.intersectsBox(gridBox)) {
                //     handleGridCollision(ballBox, gridBox);
                // }
            }

            function handleSpin() {
                if (firstIntersectionPosition !== null && lastIntersectionPosition !== null) {
                    paddlePositionDiff = lastIntersectionPosition.clone().sub(firstIntersectionPosition);
                    //set max value for paddlePositionDiff
                    if (Math.abs(paddlePositionDiff.x) > 13)
                        paddlePositionDiff.x = Math.sign(paddlePositionDiff.x) * 13;
                    if (Math.abs(paddlePositionDiff.z) > 13)
                        paddlePositionDiff.z = Math.sign(paddlePositionDiff.z) * 13;
                    console.log(paddlePositionDiff);
                    firstIntersectionPosition = null;
                    lastIntersectionPosition = null;
                    wsRef.current.send(JSON.stringify({
                        type: 'game_event',
                        event: 'spin',
                        spin: { x: paddlePositionDiff.x, y: paddlePositionDiff.y, z: paddlePositionDiff.z },
                    }));
                }
                velocity.x -= paddlePositionDiff.x / 200;
                velocity.z -= paddlePositionDiff.z / 500;
            }

            function handleTableCollision(ballBox, tableBox) {
                paddlePositionDiff.set(0, 0, 0);
                waitforpaddle2 = false;

                // Move the ball out of the intersection
                while (ballBox.intersectsBox(tableBox)) {
                    ball.position.y += 0.01;
                    ballBox.setFromObject(ball);
                }

                velocity.y *= -0.9;
            }

            function handlePaddle1Collision(ballBox, paddleBox) {
                if (firstIntersectionPosition === null)
                    firstIntersectionPosition = paddle1.position.clone();
                else
                    lastIntersectionPosition = paddle1.position.clone();

                if (!waitforpaddle2) {
                    console.log('hit');
                    const relativePosition = ball.position.clone().sub(table.position);
                    velocity.z = -mapRange(relativePosition.z, { min: -1.5, max: 1.5 }, { min: -0.08, max: 0.08 });
                    velocity.y = 0.018;
                    velocity.x = -mapRange(relativePosition.x, { min: -TABLE_DIMENSIONS.width / 2, max: TABLE_DIMENSIONS.width / 2 }, { min: -0.039, max: 0.039 });

                    //animatePaddle1();

                    if (paddle1.rotation.y < 2.66 && paddle1.rotation.y > 0.52) {
                        collisionAnimation(paddle1);
                    }
                    velocity.y *= 0.8;
                    velocity.z *= 0.8;
                    velocity.x *= 0.8;
                }
                waitforpaddle2 = true;
            }

            function handlePaddle2Collision(ballBox, paddleBox) {
                waitforpaddle2 = false;

                const relativePosition = ball.position.clone().sub(table.position);
                velocity.z = -mapRange(relativePosition.z, { min: -1.5, max: 1.5 }, { min: -0.08, max: 0.08 });
                velocity.y = 0.018;
                velocity.x = -mapRange(relativePosition.x, { min: -TABLE_DIMENSIONS.width / 2, max: TABLE_DIMENSIONS.width / 2 }, { min: -0.039, max: 0.039 });

                // if (velocity.x > 0.35) {
                //     velocity.x = -1 + Math.random() * (velocity.x - (-1));
                // } else if (velocity.x < -0.35) {
                //     velocity.x = velocity.x + Math.random() * (1 - velocity.x);
                // } else {
                //     velocity.x = Math.random() * 2 - 1;
                // }
                if (paddle1.rotation.y < 2.66 && paddle1.rotation.y > 0.52) {
                    collisionAnimation(paddle2);
                }
                velocity.y *= 0.8;
                velocity.z *= 0.8;
                velocity.x *= 0.8;
            }

            function handleGridCollision(ballBox, gridBox) {
                waitforpaddle2 = false;

                if (ballBox.getCenter(new THREE.Vector3()).y <= gridBox.max.y) {
                    while (ballBox.intersectsBox(gridBox)) {
                        ball.position.z -= Math.sign(velocity.z);
                        ballBox.setFromObject(ball);
                    }
                    velocity.z *= -0.002;
                    velocity.y = 0;
                    velocity.x *= 0.002;
                } else if (ballBox.min.y <= gridBox.max.y) {
                    while (ballBox.intersectsBox(gridBox)) {
                        ball.position.z -= Math.sign(velocity.z);
                        ballBox.setFromObject(ball);
                    }
                    velocity.y *= 0.07;
                    velocity.z *= 0.05;
                    velocity.x = Math.random() * 2 - 1;
                }
            }

            // function animatePaddle1() {
            //     gsap.to(paddle1.position, {
            //         x: ball.position.x + 3,
            //         y: ball.position.y,
            //         z: ball.position.z + 3,
            //         duration: 0.2,
            //         onComplete: () => {
            //             gsap.to(paddle1.position, {
            //                 x: paddleX + TABLE_DIMENSIONS.width / 2,
            //                 y: paddleY - 10,
            //                 z: -paddleZ + 60,
            //                 duration: 0.3
            //             });
            //         }
            //     });
            // }

            function collisionAnimation(paddle) {
                gsap.to(paddle.rotation, {
                    y: paddle.rotation.y / 100,
                    duration: 0.1,
                    onComplete: () => {
                        gsap.to(paddle.rotation, {
                            y: paddle.rotation.y * 100,
                            duration: 0.3
                        });
                    }
                });
            }

            return () => {
                window.removeEventListener('resize', () => onWindowResize(camera, renderer));
                window.removeEventListener('keydown', onRestartKey);
                window.removeEventListener('click', onToggleListening);
                window.removeEventListener('mousemove', (event) => onMouseMove(event, mouse, paddle1, camera, table));
                console.log('cleanup');
                if (gameContainer && renderer.domElement) {
                    gameContainer.removeChild(renderer.domElement);
                }
                renderer.dispose();

                // document.removeEventListener('visibilitychange', handleVisibilityChange);
                scene.clear();
            };
        }
    }, [isMatched, isPlayer1]);

    // const handleVisibilityChange = () => {
    //     if (document.visibilityState === 'visible') {
    //         document.removeEventListener('keydown', onDocumentKeyDown);
    //         document.removeEventListener('keyup', onDocumentKeyUp);

    //         // Show popup alert or loading animation
    //         const popup = document.createElement('div');
    //         popup.id = 'reconnecting-popup';
    //         popup.style.position = 'fixed';
    //         popup.style.top = '50%';
    //         popup.style.left = '50%';
    //         popup.style.transform = 'translate(-50%, -50%)';
    //         popup.style.padding = '20px';
    //         popup.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    //         popup.style.color = 'white';
    //         popup.style.fontSize = '20px';
    //         popup.style.zIndex = '1000';
    //         popup.innerText = 'Reconnecting...';
    //         document.body.appendChild(popup);

    //         setTimeout(() => {
    //             document.addEventListener('keydown', onDocumentKeyDown);
    //             document.addEventListener('keyup', onDocumentKeyUp);

    //             // Hide popup alert or loading animation
    //             document.body.removeChild(popup);
    //         }, 1000);
    //     }
    // };

    function handleScoreUpdate(newScores) {
        setScores(newScores);
        wsRef.current.send(JSON.stringify({
            type: 'game_event',
            event: 'score_update',
            scoreP1: newScores.score1,
            scoreP2: newScores.score2,
        }));
    }

    function handleGameOver(winner) {
        winnerRef.current = winner;
        wsRef.current.send(JSON.stringify({
            type: 'game_event',
            event: 'game_over',
            winner: winner,
            scoreP1: score1,
            scoreP2: score2,
        }));
    }

    function restartGame() {
        console.log('restart');
        velocityRef.current?.copy(INITIAL_VELOCITY);
        paddlePositionDiffRef.current?.set(0, 0, 0);
        // paddle1Ref.current?.position.set(0, 1, 1);
        // paddle2Ref.current?.position.set(0, 1, -1);
        ballRef.current?.position.copy(initBallPos);
        isPausedRef.current = true;
        startCountdown();
    }

    return (
        <>
            {!isMatched && <h1>Looking for an opponent...</h1>}
            {winnerRef.current && (
                <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-900/95 p-8 rounded-lg text-center">
                    <h2 className="text-2xl font-bold text-white mb-4">{winnerRef.current} Wins!</h2>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                        Restart Game
                    </button>
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
            <div ref={gameContainerRef} id="game-container" style={{
                margin: 0,
                padding: 0,
                position: 'absolute',
                top: 0,
                left: 0
            }}
            >
                {showPopup && <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    padding: '20px',
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    color: 'white',
                    fontSize: '20px',
                    zIndex: '1000'
                }}
                >
                    {countdown}
                </div>}
                {winnerRef.current && (
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        padding: '20px',
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        color: 'white',
                        fontSize: '20px',
                        zIndex: '1000',
                        textAlign: 'center'
                    }}>
                        <h2>{winnerRef.current} Wins!</h2>
                        <button onClick={() => {
                            setScores({ score1: 0, score2: 0 });
                            winnerRef.current = null;
                            restartGame();
                        }}>Play Again</button>
                        <button onClick={() => window.location.href = '/Dashboard'}>Quit</button>
                    </div>
                )}
            </div>
        </>
    );
}

export default Pve3d;
