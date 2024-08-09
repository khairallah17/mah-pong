import * as THREE from 'three';
import { useEffect, useState, useRef } from 'react';

interface Pvp2dProps {
    username: string;
}

function Pvp2d({ username }: Pvp2dProps) {
    const [isLoading, setIsLoading] = useState(true);
    const wsRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        if (username && !wsRef.current) {
            wsRef.current = new WebSocket('ws://localhost:8000/ws/matchmaking/');
            wsRef.current.onopen = () => {
                console.log('WebSocket connection established');
                wsRef.current!.send(JSON.stringify({ type: 'set_username', username }));
                console.log('Username sent:', username);
            };
            wsRef.current.onmessage = (event) => {
                const message = JSON.parse(event.data);
                console.log(message);
                if (message.type === 'match_found') {
                    setIsLoading(false);
                    startGame();
                }
            };
            wsRef.current.onclose = () => {
                console.log('WebSocket connection closed');
            }
        }

        const startGame = () => {
            const gameContainer = document.getElementById("game-container");
            let restartEvent = new KeyboardEvent('keydown', { key: 'r' });
            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            camera.position.z = 5;
            camera.position.y = 5;
            camera.lookAt(scene.position);

            const renderer = new THREE.WebGLRenderer();
            renderer.setSize(window.innerWidth, window.innerHeight);
            gameContainer?.appendChild(renderer.domElement);

            window.addEventListener('resize', onWindowResize, false);

            function onWindowResize() {
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(window.innerWidth, window.innerHeight);
                renderer.render(scene, camera);
            }

            renderer.shadowMap.enabled = true;

            const tableGeometry = new THREE.BoxGeometry(5, 0.1, 3);
            const tableMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
            const table = new THREE.Mesh(tableGeometry, tableMaterial);
            table.castShadow = false;
            table.receiveShadow = true;
            scene.add(table);

            const ballGeometry = new THREE.SphereGeometry(0.1, 32, 32);
            const ballMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
            const ball = new THREE.Mesh(ballGeometry, ballMaterial);
            ball.position.set(0, 0.1, 0);
            ball.castShadow = true;
            ball.receiveShadow = true;
            scene.add(ball);

            const paddleGeometry = new THREE.BoxGeometry(0.2, 0.02, 1);
            const paddleMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
            const paddle1 = new THREE.Mesh(paddleGeometry, paddleMaterial);
            paddle1.position.set(-2.5, 0.1, 0);
            paddle1.castShadow = true;
            paddle1.receiveShadow = true;
            scene.add(paddle1);

            const paddle2 = new THREE.Mesh(paddleGeometry, paddleMaterial);
            paddle2.position.set(2.5, 0.1, 0);
            paddle2.castShadow = true;
            paddle2.receiveShadow = true;
            scene.add(paddle2);

            const light = new THREE.DirectionalLight(0xffffff, 3);
            light.position.set(0, 10, 0);
            light.castShadow = true;
            scene.add(light);

            let isPaused = false;
            let ballDirection = new THREE.Vector3(1, 0, 1);
            const paddle1Box = new THREE.Box3().setFromObject(paddle1);
            const paddle2Box = new THREE.Box3().setFromObject(paddle2);

            document.addEventListener('keydown', onDocumentKeyDown, false);

            function onDocumentKeyDown(event: KeyboardEvent) {

                if (event.key === 'ArrowUp') {
                    wsRef.current!.send(JSON.stringify({
                        'type': 'game_event',
                        'event': 'player_move_up',
                        'data': {
                            'player_id': 1,
                            'position': paddle1.position
                        }
                    }));
                    if (paddle1.position.z - paddle1.geometry.parameters.depth / 2 > table.position.z - table.geometry.parameters.depth / 2)
                        paddle1.position.z -= 0.2;
                } else if (event.key === 'ArrowDown') {
                    wsRef.current!.send(JSON.stringify({
                        'type': 'game_event',
                        'event': 'player_move_down',
                        'data': {
                            'player_id': 1,
                            'position': paddle1.position
                        }
                    }));
                    if (paddle1.position.z + paddle1.geometry.parameters.depth / 2 < table.position.z + table.geometry.parameters.depth / 2)
                        paddle1.position.z += 0.2;
                }
            }
            if (!wsRef.current)
            {
                console.error('WebSocket connection not established 3');
                return;
            }
            wsRef.current.onmessage = function (event) {
                const data = JSON.parse(event.data);
                console.log(data);
                if (data.event === 'player_move_up') {
                    if (paddle2.position.z - paddle2.geometry.parameters.depth / 2 > table.position.z - table.geometry.parameters.depth / 2)
                        paddle2.position.z -= 0.2;
                } else if (data.event === 'player_move_down') {
                    if (paddle2.position.z + paddle2.geometry.parameters.depth / 2 < table.position.z + table.geometry.parameters.depth / 2)
                        paddle2.position.z += 0.2;
                } else if (data.event === 'game_restart') {
                    ball.position.set(0, 0.1, 0);
                    ballDirection.set(1, 0, 1);
                    paddle1.position.set(-2.5, 0.1, 0);
                    paddle2.position.set(2.5, 0.1, 0);
                    renderer.render(scene, camera);
                }
            };

            wsRef.current.onerror = function (e) {
                console.error('WebSocket error:', e);
            };

            wsRef.current.onclose = function (e) {
                console.log('WebSocket connection closed:', e);
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
                    ball.position.x += 0.05;
                } else if (paddle2Box.intersectsSphere(ballSphere)) {
                    ballDirection.x *= -1;
                    ball.position.x -= 0.05;
                }

                if (goal1.intersectsSphere(ballSphere) || goal2.intersectsSphere(ballSphere)) {
                    wsRef.current!.send(JSON.stringify({ 'type': 'game_event', 'event': 'game_restart' }));
                    isPaused = true;
                    document.dispatchEvent(restartEvent);
                }

                if (ball.position.z < -1.5 || ball.position.z > 1.5) {
                    ballDirection.z *= -1;
                }

                renderer.render(scene, camera);
            };

            animate();

            return () => {
                gameContainer?.removeChild(renderer.domElement);
                window.removeEventListener('resize', onWindowResize, false);
                document.removeEventListener('keydown', onDocumentKeyDown, false);
            };
        };

        return () => {
            if (wsRef.current) {
                wsRef.current.close();
                wsRef.current = null;
            }
        };
    }, [username]);

    return <div id="game-container" style={{
        margin: 0,
        padding: 0,
        position: 'absolute',
        top: 0,
        left: 0
    }} />;
}

export default Pvp2d;