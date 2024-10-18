import * as THREE from 'three';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

function Pve3d() {
    const gameContainerRef = useRef(null);

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
        let paddle1, paddle2, ball, table, grid;
        let velocity = INITIAL_VELOCITY.clone();
        let paddlePositionDiff = new THREE.Vector3(0, 0, 0);
        let firstIntersectionPosition = null;
        let lastIntersectionPosition = null;
        let initBallPos;

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

        function createCamera() {
            const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            camera.position.set(0.75, 1.25, 1.88);
            camera.rotation.x = -0.5;
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
            loader.load('../assets/models/scene.glb', (gltf) => {
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

        function setInitialPaddle2Position(paddle2, tableDimensions) {
            paddle2.position.set(0, -20, -2.5 * tableDimensions.length);
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
                restartGame(ball, velocity, paddlePositionDiff, initBallPos);
            }
        }

        function onToggleListening() {
            isListening = !isListening;
            document.body.style.cursor = isListening ? 'none' : 'auto';
        }

        function onMouseMove(event, mouse, paddle1, camera, table) {
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

        function updateCameraPosition(mouse, camera, table) {
            camera.position.set(mouse.x + 0.75, mouse.y / 5 + 1.25, -mouse.y / 15 + 1.88);
            camera.position.add(new THREE.Vector3().subVectors(table.position, camera.position).multiplyScalar(0.1));
            camera.lookAt(table.position);
        }

        function animatePaddleRotation(paddle1, tableWidth) {
            const rotation = Math.atan2(Math.abs(paddle1.position.y + 10), paddle1.position.x - tableWidth / 2);
            const rotationz = Math.atan2(Math.abs(paddle1.position.y + 20), paddle1.position.x - tableWidth / 2);
            paddle1.rotation.y = rotation;
            if (paddle1.position.x - tableWidth / 2 > 0) {
                paddle1.rotation.z = rotationz - Math.PI / 2;
            } else {
                paddle1.rotation.z = -rotationz + Math.PI / 2;
            }
        }

        function animate() {
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

        function updatePaddle2AI() {
            const speed = 3;
            const XdistanceToBall = ball.position.x - paddle2.position.x;
            const speedModifier = Math.min(Math.abs(XdistanceToBall) / 10, 1);
            paddle2.position.x += Math.sign(XdistanceToBall) * speed * speedModifier;
        }

        function moveBall() {
            ball.position.x += velocity.x;
            ball.position.y += velocity.y;
            ball.position.z += velocity.z;
        }

        function applyGravity() {
            if (velocity.y < 0)
                velocity.y += GRAVITY * 0.9;
            else
                velocity.y += GRAVITY;
        }

        function applyAirResistance() {
            velocity.x -= Math.sign(velocity.x) * 0.02;
            velocity.z -= Math.sign(velocity.z) * 0.02;
            velocity.y -= Math.sign(velocity.y) * 0.02;
        }

        function handleCollisions() {
            const ballBox = new THREE.Box3().setFromObject(ball);
            const paddle1Box = new THREE.Box3().setFromObject(paddle1).expandByScalar(0.01);
            const paddle2Box = new THREE.Box3().setFromObject(paddle2).expandByScalar(0.01);
            const tableBox = new THREE.Box3().setFromObject(table);
            const gridBox = new THREE.Box3().setFromObject(grid);

            if (ballBox.intersectsBox(paddle1Box)) {
                velocity.x += paddlePositionDiff.x * 0.01;
                velocity.y -= paddlePositionDiff.y * 0.05;
                velocity.z = -velocity.z;
                firstIntersectionPosition = paddle1.position.clone();
            }

            if (ballBox.intersectsBox(paddle2Box) && !waitforpaddle2) {
                velocity.x = (ball.position.x - paddle2.position.x) / 10;
                velocity.y = (ball.position.y - paddle2.position.y) / 10;
                velocity.z = -velocity.z;
                lastIntersectionPosition = paddle2.position.clone();
                waitforpaddle2 = true;
                setTimeout(() => {
                    waitforpaddle2 = false;
                }, 500);
            }

            if (ballBox.intersectsBox(tableBox)) {
                velocity.z = -velocity.z;
                if (ball.position.y < -9) velocity.y = Math.abs(velocity.y);
            }

            if (ballBox.intersectsBox(gridBox)) {
                velocity.z = -velocity.z;
            }
        }

        function restartGame(ball, velocity, paddlePositionDiff, initBallPos) {
            ball.position.copy(initBallPos);
            velocity.copy(INITIAL_VELOCITY);
            paddlePositionDiff.set(0, 0, 0);
        }
    }, []);

    return <div className="gameContainer" ref={gameContainerRef}></div>;
}

export default Pve3d;
