import * as THREE from 'three';
import { useEffect } from 'react';
//import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { gsap } from 'gsap';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import backgroundimage from './assets/background.jpg';

function Game2() {
    useEffect(() => {
        const gameContainer = document.getElementById("game-container");
        let restartEvent = new KeyboardEvent('keydown', { key: 'r' });
        const loader = new GLTFLoader();
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.x = 0.75;
        camera.position.y = 1.5;
        camera.position.z = 1.88;
        camera.rotation.x = -0.5;
        // camera.rotation.x = -2.59;
        // camera.rotation.y = 0.188;
        // camera.rotation.z = 3.02;
        const texture = new THREE.TextureLoader().load(backgroundimage);
        scene.background = texture;
        //camera.lookAt(scene.position);
        const renderer = new THREE.WebGLRenderer();
        //const controls = new OrbitControls(camera, renderer.domElement);
        renderer.setSize(window.innerWidth, window.innerHeight);
        gameContainer?.appendChild(renderer.domElement);
        window.addEventListener('resize', () => {
            renderer.setSize(window.innerWidth, window.innerHeight);
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.render(scene, camera);
        });
        let paddle1: THREE.Object3D;
        let paddle2: THREE.Object3D;
        let ball: THREE.Object3D;
        let table: THREE.Object3D;
        let grid: THREE.Object3D;
        const paddleXRange = { min: -120, max: 120 };
        const paddleYRange = { min: -20, max: 10 };
        const paddleZRange = { min: -10, max: 80 };
        let paddleX = 0;
        let paddleY = 0;
        let paddleZ = 0;
        //let table: THREE.Mesh;
        const gravity = -0.04;
        let velocity = new THREE.Vector3(1, 1.5, 3);
        console.log(camera.position);
        console.log(camera.rotation);
        loader.load('../models/latest.glb', (gltf) => {
            const loadedscene = gltf.scene;
            loadedscene.traverse((object) => {
                console.log(object.name);
            });
            loadedscene.position.set(0, 0, 0);
            loadedscene.rotation.set(0, 0, 0);
            scene.add(loadedscene);
            const light = new THREE.AmbientLight(0xffffff, 3);
            light.position.set(0, 10, 0);
            light.castShadow = true;
            scene.add(light);
            loadedscene.getObjectByName('Paddle_1')?.rotation.set(0, 0, 0);
            loadedscene.getObjectByName('Paddle_2')?.rotation.set(0, 0, 0);
            paddle1 = loadedscene.getObjectByName('Paddle_1') as THREE.Object3D;
            paddle2 = loadedscene.getObjectByName('Paddle_2') as THREE.Object3D;
            ball = loadedscene.getObjectByName('Ball') as THREE.Object3D;
            table = loadedscene.getObjectByName('table_plate') as THREE.Object3D;
            grid = loadedscene.getObjectByName('table_grid') as THREE.Object3D;
            // Create a vector to hold the mouse position
            const mouse = new THREE.Vector2();
            let isListening = true;

            function restart_game() {
                ball.position.x = 0;
                ball.position.y = 0;
                ball.position.z = 0;
                velocity = new THREE.Vector3(1, 1.5, 3);
            }
            window.addEventListener('keydown', (event) => {
                if (event.key.toLowerCase() == 'r')
                    restart_game();
            });
            function mapRange(value: number, fromRange: { min: number, max: number }, toRange: { min: number, max: number }): number {
                return (value - fromRange.min) * (toRange.max - toRange.min) / (fromRange.max - fromRange.min) + toRange.min;
            }
            function onMouseMove(event: MouseEvent) {
                if (isListening) {
                    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
                    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
                    paddleX = mapRange(mouse.x, { min: -1, max: 1 }, paddleXRange);
                    paddleY = mapRange(mouse.y, { min: -1, max: 1 }, paddleYRange);
                    paddleZ = mapRange(mouse.y, { min: -1, max: 1 }, paddleZRange);
                    paddle1?.position.set(paddleX + 72.5, paddleY, -paddleZ + 60);
                    animatePaddleRotation();
                }
            }
            function animatePaddleRotation() {
                const rotation = -Math.atan2(paddle1.position.y, paddle1.position.x - 72.5);
                const rotation2 = -Math.atan2(paddle2.position.y, paddle2.position.x - 72.5);
                paddle1.rotation.y = rotation;
                paddle2.rotation.y = rotation2;
            }
            window.addEventListener('click', () => {
                isListening = !isListening;
                document.body.style.cursor = isListening ? 'none' : 'auto';
            });
            window.addEventListener('mousemove', onMouseMove, false);
            renderer.render(scene, camera);
            animate();
        }, undefined, function (error) {
            console.error('An error happened', error);
        });
        function animate() {
            const offsetX = 0;
            const offsetY = 5;
            const offsetZ = 10;
            //camera.position.x = paddle1.position.x + offsetX;
            //camera.position.y = paddle1.position.y + offsetY;
            //camera.position.z = paddle1.position.z + offsetZ;
            //camera.lookAt(ball.position);
            const ballBox = new THREE.Box3().setFromObject(ball);
            const paddle1Box = new THREE.Box3().setFromObject(paddle1);
            paddle1Box.expandByScalar(0.05);
            const paddle2Box = new THREE.Box3().setFromObject(paddle2);
            paddle2Box.expandByScalar(0.05);
            const tableBox = new THREE.Box3().setFromObject(table);
            const gridBox = new THREE.Box3().setFromObject(grid);
            let tableWidth = 145;
            let tableLength = 67;
            ball.position.x += velocity.x;
            ball.position.y += velocity.y;
            ball.position.z += velocity.z;
            // Apply gravity
            velocity.y += gravity;
            // Check for collisions with table boundaries
            // Assuming tableWidth and tableLength are defined
            if (ball.position.x > tableWidth || ball.position.x < 0) {
                velocity.x *= -1;
            }
            if (ballBox.intersectsBox(tableBox)) {
                // Move the ball out of the intersection
                while (ballBox.intersectsBox(tableBox)) {
                    ball.position.y -= Math.sign(velocity.y);
                    ballBox.setFromObject(ball);
                }

                // Reverse the velocity
                velocity.y *= -1;
                if (velocity.y > 0)
                    velocity.y = 1.5;

            }
            if (ball.position.z > tableLength){
                //player 1 scores
                document.dispatchEvent(restartEvent);
            }
            if (ball.position.z < - (3 * tableLength)) {
                //player 2 scores
                document.dispatchEvent(restartEvent);
            }
            if (ballBox.intersectsBox(paddle1Box)) {
                const relativePosition = ball.position.clone().sub(paddle1.position);
                velocity.x = relativePosition.x;
                velocity.z = relativePosition.z;
                // velocity.y *= -1;

                const maxVelocityX = 0.5;
                const maxVelocityZ = 4;
                if (Math.abs(velocity.x) > maxVelocityX) {
                    velocity.x = Math.sign(velocity.x) * maxVelocityX;
                }
                if (Math.abs(velocity.z) > maxVelocityZ) {
                    velocity.z = Math.sign(velocity.z) * maxVelocityZ;
                }
                gsap.to(paddle1.scale, {
                    x: Math.PI / 4,
                    z: 120,
                    y: 120,
                    duration: 0.1,
                    onComplete: () => {
                        gsap.to(paddle1.scale, {
                            x: 100,
                            y: 100,
                            z: 100,
                            duration: 0.1
                        });
                    }
                });
            }
            if (ballBox.intersectsBox(paddle2Box)) {
                const relativePosition = ball.position.clone().sub(paddle2.position);
                velocity.x = relativePosition.x;
                velocity.z = relativePosition.z;
                // velocity.y *= -1;

                const maxVelocityX = 0.5;
                const maxVelocityZ = 4;
                if (Math.abs(velocity.x) > maxVelocityX) {
                    velocity.x = Math.sign(velocity.x) * maxVelocityX;
                }
                if (Math.abs(velocity.z) > maxVelocityZ) {
                    velocity.z = Math.sign(velocity.z) * maxVelocityZ;
                }
                gsap.to(paddle1.scale, {
                    x: Math.PI / 4,
                    z: 120,
                    y: 120,
                    duration: 0.1,
                    onComplete: () => {
                        gsap.to(paddle1.scale, {
                            x: 100,
                            y: 100,
                            z: 100,
                            duration: 0.1
                        });
                    }
                });
            }
            // if (ballBox.intersectsBox(gridBox)) {
            //     velocity.y *= -1;
            // }
            requestAnimationFrame(animate);
            renderer.render(scene, camera);
            return () => {
                // Cleanup code here
                gameContainer?.removeChild(renderer.domElement);
            };
        }
    }, []);

    return <div id="game-container" style={{
        margin: 0,
        padding: 0,
        position: 'absolute',
        top: 0,
        left: 0
    }} />;
}

export default Game2;