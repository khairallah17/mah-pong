import * as THREE from 'three';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

type Vector3 = THREE.Vector3;
type Scene = THREE.Scene;
type PerspectiveCamera = THREE.PerspectiveCamera;
type WebGLRenderer = THREE.WebGLRenderer;
type Mesh = THREE.Mesh;
type Box3 = THREE.Box3;

function Pve3d() {
    const gameContainerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const gameContainer = gameContainerRef.current;

        // Constants
        const GRAVITY = -0.09;
        const INITIAL_VELOCITY = new THREE.Vector3(1, 2, 2.5);
        const TABLE_DIMENSIONS = { width: 148, length: 67 };
        let waitforpaddle2 = false;
        let waitfor_ = false;

        // Scene Setup
        const scene = new THREE.Scene();
        const camera = createCamera();
        const renderer = createRenderer(gameContainer);

        const mouse = new THREE.Vector2();
        let isListening = true;

        // Objects
        let paddle1: Mesh, paddle2: Mesh, ball: Mesh, table: Mesh, grid: Mesh;
        let velocity = INITIAL_VELOCITY.clone();
        let paddlePositionDiff = new THREE.Vector3(0, 0, 0);
        let firstIntersectionPosition: Vector3 | null = null;
        let lastIntersectionPosition: Vector3 | null = null;
        let initBallPos: Vector3;

        // Load Scene and Start Animation
        loadScene(scene, (objects) => {
            ({ paddle1, paddle2, ball, table, grid } = objects);
            initBallPos = ball.position.clone();
            paddle1.rotation.set(0, 0, 0);
            paddle2.rotation.set(0, 0, 0);
            setInitialPaddle2Position(paddle2, TABLE_DIMENSIONS);
            addLights(scene);
            startGameListeners(mouse, paddle1, camera, table, paddle2, velocity, renderer, scene);
            animate();
        });

        function createCamera(): PerspectiveCamera {
            const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            camera.position.set(0.75, 1.25, 1.88);
            camera.rotation.x = -0.5;
            return camera;
        }

        function createRenderer(container: HTMLDivElement | null): WebGLRenderer {
            const renderer = new THREE.WebGLRenderer();
            renderer.setSize(window.innerWidth, window.innerHeight);
            if (container && container.childNodes.length === 0) {
                container.appendChild(renderer.domElement);
            }
            window.addEventListener('resize', () => onWindowResize(camera, renderer));
            return renderer;
        }

        function onError(err: unknown): void {
            if (err instanceof ErrorEvent) {
                console.error('An error happened:', err.message);
            } else {
                console.error('An unknown error occurred:', err);
            }
        }        

        function loadScene(scene: Scene, callback: (objects: {
            paddle1: Mesh,
            paddle2: Mesh,
            ball: Mesh,
            table: Mesh,
            grid: Mesh
        }) => void): void {
            const loader = new GLTFLoader();
            loader.load('../models/scene.glb', (gltf) => {
                const loadedScene = gltf.scene;
                scene.add(loadedScene);
                const objects = {
                    paddle1: loadedScene.getObjectByName('Paddle_1') as Mesh,
                    paddle2: loadedScene.getObjectByName('Paddle_2') as Mesh,
                    ball: loadedScene.getObjectByName('Ball') as Mesh,
                    table: loadedScene.getObjectByName('table_plate') as Mesh,
                    grid: loadedScene.getObjectByName('table_grid') as Mesh
                };
                callback(objects);
            }, undefined, onError);
        }

        function setInitialPaddle2Position(paddle2: Mesh, tableDimensions: { width: number, length: number }): void {
            paddle2.position.set(0, -20, -2.5 * tableDimensions.length);
        }

        function addLights(scene: Scene): void {
            const light = new THREE.AmbientLight(0xffffff, 3);
            light.position.set(0, 10, 0);
            light.castShadow = true;
            scene.add(light);
        }

        function startGameListeners(
            mouse: THREE.Vector2,
            paddle1: Mesh,
            camera: PerspectiveCamera,
            table: Mesh,
            paddle2: Mesh,
            velocity: Vector3,
            renderer: WebGLRenderer,
            scene: Scene
        ): void {
            window.addEventListener('keydown', onRestartKey);
            window.addEventListener('click', () => onToggleListening());
            window.addEventListener('mousemove', (event) => onMouseMove(event, mouse, paddle1, camera, table));
        }

        function onWindowResize(camera: PerspectiveCamera, renderer: WebGLRenderer): void {
            renderer.setSize(window.innerWidth, window.innerHeight);
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.render(scene, camera);
        }

        function onRestartKey(event: KeyboardEvent): void {
            if (event.key.toLowerCase() === 'r') {
                restartGame(ball, velocity, paddlePositionDiff, initBallPos);
            }
        }

        function onToggleListening(): void {
            isListening = !isListening;
            document.body.style.cursor = isListening ? 'none' : 'auto';
        }

        function onMouseMove(
            event: MouseEvent,
            mouse: THREE.Vector2,
            paddle1: Mesh,
            camera: PerspectiveCamera,
            table: Mesh
        ): void {
            if (isListening) {
                updateMousePosition(event, mouse);
                updatePaddle1Position(mouse, paddle1, TABLE_DIMENSIONS, camera, table);
            }
        }

        function updateMousePosition(event: MouseEvent, mouse: THREE.Vector2): void {
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        }

        function mapRange(value: number, from: { min: number, max: number }, to: { min: number, max: number }): number {
            return (value - from.min) * (to.max - to.min) / (from.max - from.min) + to.min;
        }

        function updatePaddle1Position(
            mouse: THREE.Vector2,
            paddle1: Mesh,
            tableDimensions: { width: number, length: number },
            camera: PerspectiveCamera,
            table: Mesh
        ): void {
            const paddleX = mapRange(mouse.x, { min: -1, max: 1 }, { min: -120, max: 120 });
            let paddleY, paddleZ;

            if (mouse.y > -0.4) {
                paddleY = 10;
                paddleZ = mapRange(mouse.y, { min: -0.4, max: 1 }, { min: -7, max: 80 });
            } else {
                paddleY = mapRange(mouse.y, { min: -1, max: -0.4 }, { min: -20, max: 10 });
                paddleZ = mapRange(mouse.y, { min: -1, max: -0.4 }, { min: -30, max: -7 });
            }

            paddle1.position.set(paddleX + tableDimensions.width / 2, paddleY - 10, -paddleZ + 60);
            updateCameraPosition(mouse, camera, table);
            animatePaddleRotation(paddle1, tableDimensions.width);
        }

        function updateCameraPosition(mouse: THREE.Vector2, camera: PerspectiveCamera, table: Mesh): void {
            camera.position.set(mouse.x + 0.75, mouse.y / 5 + 1.25, -mouse.y / 15 + 1.88);
            camera.position.add(new THREE.Vector3().subVectors(table.position, camera.position).multiplyScalar(0.1));
            camera.lookAt(table.position);
        }

        function animatePaddleRotation(paddle1: Mesh, tableWidth: number): void {
            const rotation = Math.atan2(Math.abs(paddle1.position.y + 10), paddle1.position.x - tableWidth / 2);
            const rotationz = Math.atan2(Math.abs(paddle1.position.y + 20), paddle1.position.x - tableWidth / 2);
            paddle1.rotation.y = rotation;
            if (paddle1.position.x - tableWidth / 2 > 0) {
                paddle1.rotation.z = rotationz - Math.PI / 2;
            } else {
                paddle1.rotation.z = -rotationz + Math.PI / 2;
            }
        }

        function animate(): void {
            // Update AI for paddle 2
            updatePaddle2AI();
        
            // Move the ball
            moveBall();
        
            // Apply physics effects
            applyGravity();
            applyAirResistance();
        
            // Handle collisions with the table, paddles, and grid
            handleCollisions();
        
            // Render the scene and request the next frame
            renderer.render(scene, camera);
            requestAnimationFrame(animate);
        }
        
        function updatePaddle2AI(): void {
            const speed = 3;
            const XdistanceToBall = ball.position.x - paddle2.position.x;
            const speedModifier = Math.min(Math.abs(XdistanceToBall) / 10, 1);
            paddle2.position.x += Math.sign(XdistanceToBall) * speed * speedModifier;
            // Optionally enable Y-axis movement
            // paddle2.position.y += Math.sign(YdistanceToBall) * speed * speedModifier;
        }
        
        function moveBall(): void {
            ball.position.x += velocity.x;
            ball.position.y += velocity.y;
            ball.position.z += velocity.z;
        }
        
        function applyGravity(): void {
            if (velocity.y < 0)
                velocity.y += GRAVITY * 0.9;
            else
                velocity.y += GRAVITY;
        }
        
        function applyAirResistance(): void {
            velocity.x -= Math.sign(velocity.x) * 0.02;
            velocity.z -= Math.sign(velocity.z) * 0.02;
            velocity.y -= Math.sign(velocity.y) * 0.02;
        }
        
        function handleCollisions(): void {
            const ballBox = new THREE.Box3().setFromObject(ball);
            const paddle1Box = new THREE.Box3().setFromObject(paddle1).expandByScalar(0.01);
            const paddle2Box = new THREE.Box3().setFromObject(paddle2).expandByScalar(0.01);
            const tableBox = new THREE.Box3().setFromObject(table);
            const gridBox = new THREE.Box3().setFromObject(grid).expandByScalar(0.01);
        
            if (ballBox.intersectsBox(tableBox)) {
                handleTableCollision(ballBox, tableBox);
            }
        
            if (ball.position.z > 1.5 * TABLE_DIMENSIONS.length) {
                // Player 1 scores
                restartGame(ball, velocity, paddlePositionDiff, initBallPos);
            } else if (ball.position.z < -(3.5 * TABLE_DIMENSIONS.length)) {
                // Player 2 scores
                restartGame(ball, velocity, paddlePositionDiff, initBallPos);
            }
        
            if (ballBox.intersectsBox(paddle1Box)) {
                handlePaddle1Collision(ballBox, paddle1Box);
            }

            handleSpin();

            if (ballBox.intersectsBox(paddle2Box)) {
                handlePaddle2Collision(ballBox, paddle2Box);
            }
        
            if (ballBox.intersectsBox(gridBox)) {
                handleGridCollision(ballBox, gridBox);
            }
        }
        
        function handleSpin(): void {
            if (firstIntersectionPosition !== null && lastIntersectionPosition !== null && !waitfor_) {
                paddlePositionDiff = lastIntersectionPosition.clone().sub(firstIntersectionPosition);
                //set max value for paddlePositionDiff
                if (Math.abs(paddlePositionDiff.x) > 13)
                    paddlePositionDiff.x = Math.sign(paddlePositionDiff.x) * 13;
                if (Math.abs(paddlePositionDiff.z) > 13)
                    paddlePositionDiff.z = Math.sign(paddlePositionDiff.z) * 13;
                console.log(paddlePositionDiff, waitfor_);
                waitfor_ = true;
                firstIntersectionPosition = null;
                lastIntersectionPosition = null;
            }
            velocity.x -= paddlePositionDiff.x / 200;
            velocity.z -= paddlePositionDiff.z / 500;
        }

        function handleTableCollision(ballBox: THREE.Box3, tableBox: THREE.Box3): void {
            paddlePositionDiff.set(0, 0, 0);
            waitforpaddle2 = false;
            waitfor_ = false;
        
            // Move the ball out of the intersection
            while (ballBox.intersectsBox(tableBox)) {
                ball.position.y += 1;
                ballBox.setFromObject(ball);
            }
        
            velocity.y *= -1;
        }
        
        function handlePaddle1Collision(ballBox: THREE.Box3, paddleBox: THREE.Box3): void {
            if (firstIntersectionPosition === null)
                firstIntersectionPosition = paddle1.position.clone();
            else
                lastIntersectionPosition = paddle1.position.clone();
        
            if (!waitforpaddle2) {
                console.log('hit');
                const relativePosition = ball.position.clone().sub(table.position);
                velocity.z = -mapRange(relativePosition.z, { min: -3 * TABLE_DIMENSIONS.length, max: TABLE_DIMENSIONS.length }, { min: -5, max: 5 });
                velocity.y = 1.8;
                velocity.x = -mapRange(relativePosition.x - TABLE_DIMENSIONS.width / 2, { min: -TABLE_DIMENSIONS.width / 2, max: TABLE_DIMENSIONS.width / 2 }, { min: -2, max: 2 });
        
                //animatePaddle1();
        
                if (paddle1.rotation.y < 2.66 && paddle1.rotation.y > 0.52) {//
                    animatePaddle1Rotation();
                }
            }
        
            waitforpaddle2 = true;
        }
        
        function handlePaddle2Collision(ballBox: THREE.Box3, paddleBox: THREE.Box3): void {
            waitforpaddle2 = false;
            waitfor_ = false;
            paddlePositionDiff.set(0, 0, 0);
        
            const relativePosition: THREE.Vector3 = ball.position.clone().sub(table.position);
            velocity.x = -mapRange(relativePosition.x - TABLE_DIMENSIONS.width / 2, { min: -TABLE_DIMENSIONS.width / 2, max: TABLE_DIMENSIONS.width / 2 }, { min: -1, max: 1 });
        
            if (velocity.x > 0.35) {
                velocity.x = -1 + Math.random() * (velocity.x - (-1));
            } else if (velocity.x < -0.35) {
                velocity.x = velocity.x + Math.random() * (1 - velocity.x);
            } else {
                velocity.x = Math.random() * 2 - 1;
            }
        
            velocity.z = -mapRange(relativePosition.z, { min: -3 * TABLE_DIMENSIONS.length, max: TABLE_DIMENSIONS.length }, { min: -5, max: 5 });
            velocity.y = 1.8;
        }
        
        function handleGridCollision(ballBox: THREE.Box3, gridBox: THREE.Box3): void {
            waitforpaddle2 = false;
            waitfor_ = false;
        
            if (ballBox.getCenter(new THREE.Vector3()).y <= gridBox.max.y) {
                while (ballBox.intersectsBox(gridBox)) {
                    ball.position.z -= Math.sign(velocity.z);
                    ballBox.setFromObject(ball);
                }
                velocity.z *= -0.2;
                velocity.y *= 0;
                velocity.x *= 0.2;
            } else if (ballBox.min.y <= gridBox.max.y) {
                while (ballBox.intersectsBox(gridBox)) {
                    ball.position.z -= Math.sign(velocity.z);
                    ballBox.setFromObject(ball);
                }
                velocity.y *= 0.7;
                velocity.z *= 0.5;
                velocity.x = Math.random() * 2 - 1;
            }
        }
        
        // function animatePaddle1(): void {
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
        
        function animatePaddle1Rotation(): void {
            gsap.to(paddle1.rotation, {
                y: paddle1.rotation.y / 100,
                duration: 0.1,
                onComplete: () => {
                    gsap.to(paddle1.rotation, {
                        y: paddle1.rotation.y * 100,
                        duration: 0.3
                    });
                }
            });
        }

        function restartGame(ball: Mesh, velocity: Vector3, paddlePositionDiff: Vector3, initBallPos: Vector3): void {
            velocity.copy(INITIAL_VELOCITY);
            paddlePositionDiff.set(0, 0, 0);
            ball.position.copy(initBallPos);
        }

        return () => {
            if (gameContainer) {
                gameContainer.removeChild(renderer.domElement);
            }
            window.removeEventListener('resize', () => onWindowResize(camera, renderer));
            window.removeEventListener('keydown', onRestartKey);
            window.removeEventListener('click', onToggleListening);
            window.removeEventListener('mousemove', (event) => onMouseMove(event, mouse, paddle1, camera, table));
        };
    }, []);

    return <div ref={gameContainerRef} id="game-container" style={{
        margin: 0,
        padding: 0,
        position: 'absolute',
        top: 0,
        left: 0
    }}
    />;
}

export default Pve3d;
