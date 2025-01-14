import * as THREE from 'three';
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import GameScore from '../../components/pvp/GameScore';
import { ScrollRestoration } from 'react-router-dom';

function Pve3d() {
    const gameContainerRef = useRef(null);
    const rendererRef = useRef(null);
    const paddle2Ref = useRef(null);
    const paddle1Ref = useRef(null);
    const ballRef = useRef(null);
    const paddlePositionDiffRef = useRef(null);
    const velocityRef = useRef(null);
    const isPausedRef = useRef(true);
    const [showPopup, setShowPopup] = useState(false);
    const [countdown, setCountdown] = useState(3);
    const countdownRef = useRef(null);
    const [{ score1, score2 }, setScores] = useState({ score1: 0, score2: 0 });
    const winnerRef = useRef(null);
    const GRAVITY = -0.0006;
    const INITIAL_VELOCITY = new THREE.Vector3(0, 0.005, 0.015);
    const TABLE_DIMENSIONS = { width: 1.45, length: 2.6 };
    const initBallPos = new THREE.Vector3(0, 1, 0);
    let waitforpaddle2 = false;

    useEffect(() => {
        if (!rendererRef.current) {
            const gameContainer = gameContainerRef.current;

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
                paddle1.position.set(0, 1, 1);
                paddle2.position.set(0, 1, -1);
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
                        paddle1: loadedScene.getObjectByName('Paddle_1'),
                        paddle2: loadedScene.getObjectByName('Paddle_2'),
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
                    restartGame();
                }
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

                paddle1.position.set(paddleX, paddleY, paddleZ);
                updateCameraPosition(mouse, camera, table);
                animatePaddleRotation(paddle1, paddle2);
            }

            function updateCameraPosition(mouse, camera, table) {
                camera.position.set(mouse.x, mouse.y / 5 + 1.25, -mouse.y / 15 + 2);
                camera.position.add(new THREE.Vector3().subVectors(table.position, camera.position).multiplyScalar(0.1));
                camera.lookAt(table.position);
            }

            function animatePaddleRotation(paddle1, paddle2) {
                let rotationy = Math.atan2(Math.abs(paddle1.position.y), paddle1.position.x * 5);
                let rotationz = Math.atan2(Math.abs(paddle1.position.y), paddle1.position.x);
                paddle1.rotation.y = rotationy;
                if (paddle1.position.x > 0) {
                    paddle1.rotation.z = rotationz - Math.PI / 2;
                } else {
                    paddle1.rotation.z = -rotationz + Math.PI / 2;
                }
                rotationy = Math.atan2(Math.abs(paddle2.position.y), paddle2.position.x * 5);
                rotationz = Math.atan2(Math.abs(paddle2.position.y), paddle2.position.x);
                paddle2.rotation.y = -rotationy;
                if (paddle2.position.x > 0) {
                    paddle2.rotation.z = rotationz - Math.PI / 2;
                } else {
                    paddle2.rotation.z = -rotationz + Math.PI / 2;
                }
            }

            function animate() {
                if (isPausedRef.current) {
                    requestAnimationFrame(animate);
                    renderer.render(scene, camera);
                    return;
                }

                updatePaddle2AI();
                applyGravity();
                moveBall();

                handleCollisions();

                renderer.render(scene, camera);
                requestAnimationFrame(animate);
            }

            function updatePaddle2AI() {
                const speed = 0.5;
                const XdistanceToBall = ball.position.x - paddle2.position.x;
                const YdistanceToBall = ball.position.y - paddle2.position.y;
                const XspeedModifier = Math.min(Math.abs(XdistanceToBall) / 10, 1);
                const YspeedModifier = Math.min(Math.abs(YdistanceToBall) / 10, 1);
                paddle2.position.x += Math.sign(XdistanceToBall) * speed * XspeedModifier;
                paddle2.position.y += Math.sign(YdistanceToBall) * 0.05 * YspeedModifier;
            }

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
                        if (newScores.score1 >= 10) {
                            winnerRef.current = 'Player 1'
                            isPausedRef.current = true;
                            setShowPopup(true);
                        } else {
                            restartGame();
                        }
                        return newScores;
                    });
                } else if (ball.position.z < -1.5) {
                    // Player 2 scores
                    setScores(prevScores => {
                        const newScores = { score1: prevScores.score1, score2: prevScores.score2 + 1 };
                        if (newScores.score2 >= 10) {
                            winnerRef.current = 'Player 2'
                            isPausedRef.current = true;
                            setShowPopup(true);
                        } else {
                            restartGame();
                        }
                        return newScores;
                    });
                } else if (ball.position.y < 0.2) {
                    restartGame();
                }

                if (ballBox.intersectsBox(paddle1Box)) {
                    handlePaddle1Collision(ballBox, paddle1Box);
                }

                handleSpin();

                if (ballBox.intersectsBox(paddle2Box)) {
                    handlePaddle2Collision(ballBox, paddle2Box);
                }
            }

            function handleSpin() {
                if (firstIntersectionPosition !== null && lastIntersectionPosition !== null) {
                    paddlePositionDiffRef.current = lastIntersectionPosition.clone().sub(firstIntersectionPosition);
                    //set max value for paddlePositionDiff
                    if (Math.abs(paddlePositionDiffRef.current.x) > 13)
                        paddlePositionDiffRef.current.x = Math.sign(paddlePositionDiffRef.current.x) * 13;
                    if (Math.abs(paddlePositionDiffRef.current.z) > 13)
                        paddlePositionDiffRef.current.z = Math.sign(paddlePositionDiffRef.current.z) * 13;
                    console.log(paddlePositionDiffRef.current);
                    firstIntersectionPosition = null;
                    lastIntersectionPosition = null;
                }
                velocity.x -= paddlePositionDiffRef.current.x / 200;
                velocity.z -= paddlePositionDiffRef.current.z / 500;
            }

            function handleTableCollision(ballBox, tableBox) {
                waitforpaddle2 = false;
                paddlePositionDiffRef.current.set(0, 0, 0);
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
                    velocity.z = -mapRange(relativePosition.z, { min: -1.5, max: 1.5 }, { min: -0.04, max: 0.04 });
                    velocity.y = 0.017;
                    velocity.x = -mapRange(relativePosition.x, { min: -TABLE_DIMENSIONS.width / 2, max: TABLE_DIMENSIONS.width / 2 }, { min: -0.02, max: 0.02 });

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
                velocity.z = -mapRange(relativePosition.z, { min: -1.5, max: 1.5 }, { min: -0.04, max: 0.04 });
                velocity.y = 0.017;
                velocity.x = -mapRange(relativePosition.x, { min: -TABLE_DIMENSIONS.width / 2, max: TABLE_DIMENSIONS.width / 2 }, { min: -0.02, max: 0.02 });

                if (paddle1.rotation.y < 2.66 && paddle1.rotation.y > 0.52) {
                    collisionAnimation(paddle2);
                }
                velocity.y *= 0.8;
                velocity.z *= 0.8;
                velocity.x *= 0.8;
            }

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

            function restartGame() {
                console.log('restart');
                velocityRef.current?.copy(INITIAL_VELOCITY);
                paddlePositionDiffRef.current?.set(0, 0, 0);
                ballRef.current?.position.copy(initBallPos);
                isPausedRef.current = true;
                startCountdown();
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
                scene.clear();
            };
        }
    }, []);

    return (
        <>
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
            <GameScore
                player1={{
                    username: 'You',
                    avatar: '/player1.png?height=40&width=40',
                    score: score2
                }}
                player2={{
                    username: 'Computer',
                    avatar: '/player2.png?height=40&width=40',
                    score: score1
                }}
            />
        </>
    );
}

export default Pve3d;
