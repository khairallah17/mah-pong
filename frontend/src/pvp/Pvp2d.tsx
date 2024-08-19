import * as THREE from 'three';
import { useEffect, useRef, useState } from 'react';

interface Pvp2dProps {
    username: string;
}

function Pvp2d({ username }: Pvp2dProps) {
    const wsRef = useRef<WebSocket | null>(null);
    //const gameStateRef = useRef<any>(null);
    const [gameState, setGameState] = useState<any>(null);
    const [isMatched, setIsMatched] = useState(false);
    let keyPressed = false;
    const [isPlayer1, setIsPlayer1] = useState(true)
    let ballDirection = new THREE.Vector3(1, 0, 1);
    const PADDLE_SPEED = 0.05;
    const intervalIdRef = useRef<NodeJS.Timeout | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const paddle1Ref = useRef<THREE.Mesh | null>(null);
    const paddle2Ref = useRef<THREE.Mesh | null>(null);
    const ballRef = useRef<THREE.Mesh | null>(null);
    const tableRef = useRef<THREE.Mesh | null>(null);
    const isPausedRef = useRef<boolean>(true);

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
                //console.log(message);
                if (message.type === 'match_found') {
                    setIsMatched(true)
                    if (message.player_id === '2')
                        setIsPlayer1(false)
                    console.log("match found with player_id: ", message.player_id, "isPlayer1: ", isPlayer1);
                } else if (message.type === 'game_state') {
                    //gameStateRef.current = message.game_state;
                    setGameState(message.game_state);
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
    }, [username]);

    useEffect(() => {
        if (gameState) {
            console.log("gamestate exists");
            updateScene(gameState);
        }
    }, [gameState]);

    useEffect(() => {
        if (!rendererRef.current && isMatched) {
            const gameContainer = document.getElementById('game-container');
            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            camera.position.set(0, 5, 5);
            camera.lookAt(scene.position);
            cameraRef.current = camera; // Store the camera reference

            const renderer = new THREE.WebGLRenderer();
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.shadowMap.enabled = true;
            gameContainer?.appendChild(renderer.domElement);
            rendererRef.current = renderer;

            const table = createTable();
            const { paddle1, paddle2 } = createPaddles(isPlayer1);
            const ball = createBall();

            paddle1Ref.current = paddle1;
            paddle2Ref.current = paddle2;
            ballRef.current = ball;
            tableRef.current = table;

            scene.add(table, paddle1, paddle2, ball);
            scene.add(createLight());

            document.addEventListener('keydown', onDocumentKeyDown);
            document.addEventListener('keyup', onDocumentKeyUp);
            window.addEventListener('resize', onWindowResize);

            const animate = function () {
                if (isPausedRef.current) {
                    requestAnimationFrame(animate);
                    return;
                }
                requestAnimationFrame(animate);
                // ball.position.add(ballDirection.clone().multiplyScalar(0.05));

                // const paddle1Box = new THREE.Box3().setFromObject(paddle1);
                // const paddle2Box = new THREE.Box3().setFromObject(paddle2);
                // const ballSphere = new THREE.Sphere(ball.position, ball.geometry.parameters.radius);
                // const goal1 = new THREE.Box3(new THREE.Vector3(-3, -1, -1.5), new THREE.Vector3(-2.5, 1, 1.5));
                // const goal2 = new THREE.Box3(new THREE.Vector3(2.5, -1, -1.5), new THREE.Vector3(3, 1, 1.5));

                // if (paddle1Box.intersectsSphere(ballSphere)) {
                //     ballDirection.x *= -1;
                //     ball.position.x += 0.05 * (isPlayer1 ? 1 : -1);
                // } else if (paddle2Box.intersectsSphere(ballSphere)) {
                //     const paddle2Center = new THREE.Vector3();
                //     paddle2Box.getCenter(paddle2Center);
                //     const ballPaddleZDiff = ballSphere.center.z - paddle2Center.z;
                //     //console.log(ballPaddleZDiff);//
                //     ballDirection.x *= -1;
                //     ball.position.x -= 0.05 * (isPlayer1 ? 1 : -1);
                // }

                // if (goal1.intersectsSphere(ballSphere) || goal2.intersectsSphere(ballSphere)) {
                //     isPausedRef.current = true;
                //     restartGame(ball);
                // }

                // if (ball.position.z < -1.5 || ball.position.z > 1.5) {
                //     ballDirection.z *= -1;
                // }
                renderer.render(scene, camera);
            };

            animate();
        }
        return () => {
            // window.removeEventListener('resize', onWindowResize);
            // document.removeEventListener('keydown', onDocumentKeyDown);
            // document.removeEventListener('keyup', onDocumentKeyUp);
            // const gameContainer = document.getElementById('game-container');
            // if (rendererRef.current && gameContainer) {
            //     gameContainer.removeChild(rendererRef.current.domElement);
            // }
        };
    }, [isMatched, isPlayer1, gameState]);

    function restartGame(ball: THREE.Mesh) {
        ball.position.set(0, 0.1, 0);
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

    const onDocumentKeyUp = (event: KeyboardEvent) => {
        if (keyPressed && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
            keyPressed = false;
            if (intervalIdRef.current) {
                clearInterval(intervalIdRef.current);
            }
        }
    };
    
    const onDocumentKeyDown = (event: KeyboardEvent) => {
        if (!keyPressed) {
            keyPressed = true;
            const moveDirection = event.key === 'ArrowUp' ? -1 : event.key === 'ArrowDown' ? 1 : 0;
            if (moveDirection !== 0) {
                intervalIdRef.current = setInterval(() => {
                    wsRef.current!.send(JSON.stringify({
                        type: 'game_event',
                        event: moveDirection === -1 ? 'player_move_up' : 'player_move_down',
                        player_id: isPlayer1 ? 1 : 2,
                        //position: paddle1Ref.current?.position,
                    }));
                    isPausedRef.current = false;
                    // const paddle1Geometry = paddle1Ref.current!.geometry as THREE.BoxGeometry;
                    const tableGeometry = tableRef.current!.geometry as THREE.BoxGeometry;
                    // const newPosition = paddle1Ref.current!.position.z + moveDirection * PADDLE_SPEED;
                    // const halfPaddleWidth = paddle1Geometry.parameters.depth / 2;
                    const tableLimit = tableRef.current!.position.z + tableGeometry.parameters.depth / 2;
                    console.log("tableLimit: ", tableLimit);
                    // if (Math.abs(newPosition) + Math.abs(halfPaddleWidth) < tableLimit) {
                    //     paddle1Ref.current!.position.z = newPosition;
                    // }
                }, 30);
            }
        }
    };

    const updateScene = (state: any) => {
        console.log(state);
        if (paddle1Ref.current && paddle2Ref.current && ballRef.current && !isPausedRef.current) {
            console.log("updating scene");
            paddle1Ref.current.position.z = state.paddle1_z;
            paddle2Ref.current.position.z = state.paddle2_z;
            ballRef.current.position.x = state.ball_x;
            ballRef.current.position.z = state.ball_z;
            isPausedRef.current = state.is_paused;
        }
    };

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
                width: '100%',
                height: '100%',
            }}
        />
    );
}

export default Pvp2d;