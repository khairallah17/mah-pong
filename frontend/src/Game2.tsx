import * as THREE from 'three';
import { useEffect } from 'react';
//import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { gsap } from 'gsap';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import backgroundimage from './assets/background.jpg';

function Game2() {
    useEffect(() => {
        const gameContainer = document.getElementById("game-container");
        let counter = 0;
        const loader = new GLTFLoader();
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.x = 0.75;
        camera.position.y = 1.25;
        camera.position.z = 1.88;
        camera.rotation.x = -0.5;
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
        let paddleX = 0;
        let paddleY = 0;
        let paddleZ = 0;
        let initBallPos: THREE.Vector3;
        const gravity = -0.04;
        let velocity = new THREE.Vector3(1, 1.5, 3);
        let tableWidth = 148;
        let tableLength = 67;
        function mapRange(value: number, fromRange: { min: number, max: number }, toRange: { min: number, max: number }): number {
            return (value - fromRange.min) * (toRange.max - toRange.min) / (fromRange.max - fromRange.min) + toRange.min;
        }
        function restart_game() {
            ball.position.set(initBallPos.x, initBallPos.y, initBallPos.z);
            velocity.set(1, 1.5, 3);
        }
        loader.load('../models/latest.glb', (gltf) => {
            const loadedscene = gltf.scene;
            loadedscene.traverse((object) => {
                console.log(object.name);
            });
            scene.add(loadedscene);
            loadedscene.position.set(0, 0, 0);
            loadedscene.rotation.set(0, 0, 0);
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
            initBallPos = ball.position.clone();
            // Create a vector to hold the mouse position
            const mouse = new THREE.Vector2();
            let isListening = true;
            paddle2.position.z = - 170;

            window.addEventListener('keydown', (event) => {
                if (event.key.toLowerCase() == 'r')
                    restart_game();
            });
            function onMouseMove(event: MouseEvent) {
                if (isListening) {
                    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
                    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
                    paddleX = mapRange(mouse.x, { min: -1, max: 1 }, { min: -120, max: 120 });
                    if (mouse.y > 0)
                        paddleY = 10;
                    else
                        paddleY = mapRange(mouse.y, { min: -1, max: 0 }, { min: -10, max: 10 });
                    paddleZ = mapRange(mouse.y, { min: -1, max: 1 }, { min: -30, max: 80 });
                    paddle1?.position.set(paddleX + tableWidth / 2, paddleY, -paddleZ + 60);
                    camera.position.y = mouse.y / 5 + 1.25;
                    camera.position.z = -mouse.y / 5 + 1.88;
                    camera.position.x = mouse.x + 0.75;
                    camera.lookAt(table.position);
                    animatePaddleRotation();
                }
            }
            function animatePaddleRotation() {
                const rotation = Math.atan2(paddle1.position.y, paddle1.position.x - tableWidth / 2);
                const rotation2 = Math.atan2(paddle2.position.y, paddle2.position.x - tableWidth / 2);
                // paddle1.rotation.y = rotation;
                // paddle2.rotation.y = rotation2;
                paddle1.rotation.z = rotation - Math.PI / 2;
                //paddle2.rotation.z = rotation2 + Math.PI / 2;
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
            const speed = 2;
            const distanceToBall = ball.position.x - paddle2.position.x;
            const speedModifier = Math.min(Math.abs(distanceToBall) / 10, 1);
            paddle2.position.x += Math.sign(distanceToBall) * speed * speedModifier;
            const ballBox = new THREE.Box3().setFromObject(ball);
            const paddle1Box = new THREE.Box3().setFromObject(paddle1);
            paddle1Box.expandByScalar(0.05);
            const paddle2Box = new THREE.Box3().setFromObject(paddle2);
            paddle2Box.expandByScalar(0.05);
            const tableBox = new THREE.Box3().setFromObject(table);
            const gridBox = new THREE.Box3().setFromObject(grid);
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
                restart_game();
            }
            if (ball.position.z < - (3 * tableLength)) {
                //player 2 scores
                restart_game();
            }
            if (ballBox.intersectsBox(paddle1Box)) {
                const relativePosition = ball.position.clone().sub(table.position);
                velocity.x = -mapRange(relativePosition.x - tableWidth / 2, { min: -tableWidth / 2, max: tableWidth / 2 }, { min: -2, max: 2 });
                velocity.z = -mapRange(relativePosition.z,  { min: -3 * tableLength, max: tableLength }, { min: -3, max: 3 });
                velocity.y = 1;

                const maxVelocityZ = 3;
                if (Math.abs(velocity.z) > maxVelocityZ) {
                    velocity.z = Math.sign(velocity.z) * maxVelocityZ;
                }
                gsap.to(paddle1.scale, {
                    x: 120,
                    z: 120,
                    y: Math.PI / 4,
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
                let relativePosition = ball.position.clone().sub(table.position);
                velocity.x = -mapRange(relativePosition.x - tableWidth / 2, { min: -tableWidth / 2, max: tableWidth / 2 }, { min: -1, max: 1 });
                if (counter % 3 === 0)
                {
                    relativePosition = ball.position.clone().sub(paddle1.position);
                    velocity.x = -mapRange(relativePosition.x, { min: -tableWidth, max: tableWidth}, { min: -1, max: 1 });
                    console.log(counter);
                }
                console.log(counter);
                counter++;
                velocity.z = -mapRange(relativePosition.z,  { min: -3 * tableLength, max: tableLength }, { min: -3, max: 3 });
                velocity.y = 1;

                const maxVelocityZ = 3;
                if (Math.abs(velocity.z) > maxVelocityZ) {
                    velocity.z = Math.sign(velocity.z) * maxVelocityZ;
                }
                gsap.to(paddle2.scale, {
                    x: 120,
                    z: 120,
                    y: Math.PI / 4,
                    duration: 0.1,
                    onComplete: () => {
                        gsap.to(paddle2.scale, {
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
                renderer.dispose();
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