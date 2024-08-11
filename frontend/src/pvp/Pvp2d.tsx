import * as THREE from 'three';
import { useEffect, useState, useRef } from 'react';

interface Pvp2dProps {
    username: string;
}

function Pvp2d({ username }: Pvp2dProps) {
    let isPlayer1 = true;
    const wsRef = useRef<WebSocket | null>(null);
    let keyPressed = false;
    const intervalIdRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (username && !wsRef.current) {
            wsRef.current = new WebSocket('ws://localhost:8000/ws/matchmaking/');
            wsRef.current.onopen = () => {
                console.log('WebSocket connection established');
                wsRef.current!.send(JSON.stringify({ type: 'set_username', username }));
            };
            wsRef.current.onmessage = (event) => {
                const message = JSON.parse(event.data);
                if (message.opponent === '0') {
                    isPlayer1 = false;
                }
                if (message.type === 'match_found') {
                    startGame();
                }
            };
            wsRef.current.onclose = () => console.log('WebSocket connection closed');
            wsRef.current.onerror = (e) => console.error('WebSocket error:', e);
        }

        const startGame = () => {
            console.log('Game started, player 1:', isPlayer1);
            const gameContainer = document.getElementById('game-container');
            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            camera.position.set(0, 5, 5);
            camera.lookAt(scene.position);

            const renderer = new THREE.WebGLRenderer();
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.shadowMap.enabled = true;
            gameContainer?.appendChild(renderer.domElement);

            window.addEventListener('resize', onWindowResize);

            function onWindowResize() {
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(window.innerWidth, window.innerHeight);
            }

            const paddleSpeed = 0.05;
            const table = createTable();
            const ball = createBall();
            const { paddle1, paddle2 } = createPaddles(isPlayer1);

            scene.add(table, ball, paddle1, paddle2);
            scene.add(createLight());

            let isPaused = true;
            let ballDirection = new THREE.Vector3(1, 0, 1);

            const paddle1Box = new THREE.Box3().setFromObject(paddle1);
            const paddle2Box = new THREE.Box3().setFromObject(paddle2);

            document.addEventListener('keydown', onDocumentKeyDown);
            document.addEventListener('keyup', onDocumentKeyUp);

            function restartGame() {
                ball.position.set(0, 0.1, 0);
                ballDirection.set(1, 0, 1);
                isPaused = true;
            }

            function onDocumentKeyDown(event: KeyboardEvent) {
                if (!keyPressed) {
                    keyPressed = true;
                    const moveDirection = event.key === 'ArrowUp' ? -1 : event.key === 'ArrowDown' ? 1 : 0;
                    if (moveDirection !== 0) {
                        intervalIdRef.current = setInterval(() => {
                            const playerId = isPlayer1 ? 1 : 2;
                            wsRef.current!.send(JSON.stringify({
                                type: 'game_event',
                                event: moveDirection === -1 ? 'player_move_up' : 'player_move_down',
                                data: {
                                    player_id: playerId,
                                    position: paddle1.position,
                                },
                            }));
                            const newPosition = paddle1.position.z + moveDirection * paddleSpeed;
                            const halfPaddleWidth = paddle1.geometry.parameters.depth / 2;
                            const tableLimit = table.position.z + table.geometry.parameters.depth / 2;
                            if (Math.abs(newPosition) + Math.abs(halfPaddleWidth) < tableLimit) {
                                paddle1.position.z = newPosition;
                                isPaused = false;
                            }
                        }, 30);
                    }
                }
            }

            function onDocumentKeyUp(event: KeyboardEvent) {
                if (keyPressed && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
                    keyPressed = false;
                    if (intervalIdRef.current) {
                        clearInterval(intervalIdRef.current);
                    }
                }
            }

            wsRef.current!.onmessage = function (event) {
                const data = JSON.parse(event.data);
                const moveDirection = data.event === 'player_move_up' ? -1 : data.event === 'player_move_down' ? 1 : 0;
                if (moveDirection !== 0) {
                    const newPosition = paddle2.position.z + moveDirection * paddleSpeed;
                    const halfPaddleWidth = paddle2.geometry.parameters.depth / 2;
                    const tableLimit = table.position.z + table.geometry.parameters.depth / 2;
                    if (Math.abs(newPosition) + Math.abs(halfPaddleWidth) < tableLimit) {
                        paddle2.position.z = newPosition;
                        isPaused = false;
                    }
                }
            };

            const animate = function () {
                if (isPaused) {
                    requestAnimationFrame(animate);
                    return;
                }
                requestAnimationFrame(animate);

                ball.position.add(ballDirection.clone().multiplyScalar(0.05));

                paddle1Box.setFromObject(paddle1);
                paddle2Box.setFromObject(paddle2);

                const ballSphere = new THREE.Sphere(ball.position, ball.geometry.parameters.radius);
                const goal1 = new THREE.Box3(new THREE.Vector3(-3, -1, -1.5), new THREE.Vector3(-2.5, 1, 1.5));
                const goal2 = new THREE.Box3(new THREE.Vector3(2.5, -1, -1.5), new THREE.Vector3(3, 1, 1.5));

                if (paddle1Box.intersectsSphere(ballSphere)) {
                    ballDirection.x *= -1;
                    ball.position.x += 0.05 * (isPlayer1 ? 1 : -1);
                } else if (paddle2Box.intersectsSphere(ballSphere)) {
                    const paddle2Center = new THREE.Vector3();
                    paddle2Box.getCenter(paddle2Center);
                    const ballPaddleZDiff = ballSphere.center.z - paddle2Center.z;
                    console.log(ballPaddleZDiff);//
                    ballDirection.x *= -1;
                    ball.position.x -= 0.05 * (isPlayer1 ? 1 : -1);
                }

                if (goal1.intersectsSphere(ballSphere) || goal2.intersectsSphere(ballSphere)) {
                    isPaused = true;
                    restartGame();
                }

                if (ball.position.z < -1.5 || ball.position.z > 1.5) {
                    ballDirection.z *= -1;
                }

                renderer.render(scene, camera);
            };

            animate();

            return () => {
                window.removeEventListener('resize', onWindowResize);
                document.removeEventListener('keydown', onDocumentKeyDown);
                document.removeEventListener('keyup', onDocumentKeyUp);
                gameContainer?.removeChild(renderer.domElement);
            };
        };

        return () => {
            if (wsRef.current) {
                wsRef.current.close();
                wsRef.current = null;
            }
        };
    }, [username]);

    const createTable = () => {
        const geometry = new THREE.BoxGeometry(5, 0.1, 3);
        const material = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
        const table = new THREE.Mesh(geometry, material);
        table.receiveShadow = true;
        return table;
    };

    const createBall = () => {
        const geometry = new THREE.SphereGeometry(0.1, 32, 32);
        const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
        const ball = new THREE.Mesh(geometry, material);
        ball.position.set(0, 0.1, 0);
        ball.castShadow = true;
        return ball;
    };

    const createPaddles = (isPlayer1: boolean) => {
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
        light.position.set(0, 10, 0);
        light.castShadow = true;
        return light;
    };

    return (
        <div
            id="game-container"
            style={{
                margin: 0,
                padding: 0,
                position: 'absolute',
                top: 0,
                left: 0,
            }}
        />
    );
}

export default Pvp2d;
