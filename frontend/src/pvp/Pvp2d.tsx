import * as THREE from 'three';
import { useEffect, useRef, useState } from 'react';

interface Pvp2dProps {
    username: string;
}

function Pvp2d({ username }: Pvp2dProps) {
    const wsRef = useRef<WebSocket | null>(null);
    const [gameState, setGameState] = useState<any>(null);
    const gameStateRef = useRef<any>(null); // Ref to store the latest gameState
    let isMatched = false;
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const paddle1Ref = useRef<THREE.Mesh | null>(null);
    const paddle2Ref = useRef<THREE.Mesh | null>(null);
    const ballRef = useRef<THREE.Mesh | null>(null);

    useEffect(() => {
        if (username && !wsRef.current) {
            wsRef.current = new WebSocket('ws://localhost:8000/ws/matchmaking/');
            wsRef.current.onopen = () => {
                console.log('WebSocket connection established');
                wsRef.current!.send(JSON.stringify({ type: 'set_username', username }));
                console.log("username set to: ", username);
            };
            wsRef.current.onmessage = (event) => {
                const message = JSON.parse(event.data);
                console.log(message);
                if (message.type === 'match_found') {
                    isMatched = true;
                } else if (message.type === 'game_state') {
                    setGameState(message.state);
                    gameStateRef.current = message.state; // Update the ref with the latest gameState
                    console.log("game state set to: ", message.state);
                }
            };
            wsRef.current.onclose = () => console.log('WebSocket connection closed');
            wsRef.current.onerror = (e) => console.error('WebSocket error:', e);
        }

        document.addEventListener('keydown', onDocumentKeyDown);

        function onDocumentKeyDown(event: KeyboardEvent) {
            if (isMatched && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
                wsRef.current!.send(JSON.stringify({
                    type: 'game_event',
                    event: event.key === 'ArrowUp' ? 'player_move_up' : 'player_move_down'
                }));
            }
        }

        return () => {
            if (wsRef.current) {
                wsRef.current.close();
                wsRef.current = null;
            }
            document.removeEventListener('keydown', onDocumentKeyDown);
        };
    }, [username, isMatched]);

    useEffect(() => {
        if (!rendererRef.current) {
            const gameContainer = document.getElementById('game-container');
            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            camera.position.set(0, 5, 5);
            camera.lookAt(scene.position);

            const renderer = new THREE.WebGLRenderer();
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.shadowMap.enabled = true;
            gameContainer?.appendChild(renderer.domElement);
            rendererRef.current = renderer;

            const table = createTable();
            const paddle1 = createPaddle();
            const paddle2 = createPaddle();
            const ball = createBall();

            paddle1.position.set(-2.5, 0.1, 0);
            paddle2.position.set(2.5, 0.1, 0);
            paddle1Ref.current = paddle1;
            paddle2Ref.current = paddle2;
            ballRef.current = ball;

            scene.add(table, paddle1, paddle2, ball);
            scene.add(createLight());

            const animate = function () {
                requestAnimationFrame(animate);
                if (gameStateRef.current) {
                    console.log("gamestate exists");
                    updateScene(gameStateRef.current);
                }
                renderer.render(scene, camera);
            };

            animate();
        }

        const updateScene = (state: any) => {
            if (paddle1Ref.current && paddle2Ref.current && ballRef.current) {
                paddle1Ref.current.position.z = state.paddle1_z;
                paddle2Ref.current.position.z = state.paddle2_z;
                ballRef.current.position.x = state.ball_x;
                ballRef.current.position.z = state.ball_z;
            }
        };
    }, []);

    const createTable = () => {
        const geometry = new THREE.BoxGeometry(5, 0.1, 3);
        const material = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
        const table = new THREE.Mesh(geometry, material);
        table.receiveShadow = true;
        return table;
    };

    const createPaddle = () => {
        const geometry = new THREE.BoxGeometry(0.1, 0.2, 1);
        const material = new THREE.MeshStandardMaterial({ color: 0x00FF00 });
        const paddle = new THREE.Mesh(geometry, material);
        paddle.castShadow = true;
        paddle.receiveShadow = true;
        return paddle;
    };

    const createBall = () => {
        const geometry = new THREE.SphereGeometry(0.1, 32, 32);
        const material = new THREE.MeshStandardMaterial({ color: 0xFF0000 });
        const ball = new THREE.Mesh(geometry, material);
        ball.castShadow = true;
        ball.receiveShadow = true;
        return ball;
    };

    const createLight = () => {
        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(5, 10, 7.5);
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
                width: '100%',
                height: '100%',
            }}
        />
    );
}

export default Pvp2d;