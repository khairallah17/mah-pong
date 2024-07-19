import * as THREE from 'three';
import { useEffect } from 'react';
//import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { gsap } from 'gsap';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import backgroundimage from './assets/background.jpg';

function Game2() {
    useEffect(() => {
        const gameContainer = document.getElementById("game-container");
        const loader = new GLTFLoader();
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.x = 0.75;
        camera.position.y = 1.25;
        camera.position.z = 1.88;
        camera.rotation.x = -0.5;
        //const texture = new THREE.TextureLoader().load(backgroundimage);
        //scene.background = texture;
        //camera.lookAt(scene.position);
        const renderer = new THREE.WebGLRenderer();
        //const controls = new OrbitControls(camera, renderer.domElement);
        renderer.setSize(window.innerWidth, window.innerHeight);
        if (gameContainer && gameContainer.childNodes.length == 0)
            gameContainer.appendChild(renderer.domElement);
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
        let isIntersecting1 = false;
        let isIntersecting2 = false;
        let firstIntersectionPosition: THREE.Vector3 | null = null;
        let lastIntersectionPosition: THREE.Vector3 | null = null;
        let paddlePositionDiff = new THREE.Vector3(0, 0, 0);
        let paddleX = 0;
        let paddleY = 0;
        let paddleZ = 0;
        let initBallPos: THREE.Vector3;
        const gravity = -0.09;
        let velocity = new THREE.Vector3(1, 2, 3);
        let tableWidth = 148;
        let tableLength = 67;
        function mapRange(value: number, fromRange: { min: number, max: number }, toRange: { min: number, max: number }): number {
            return (value - fromRange.min) * (toRange.max - toRange.min) / (fromRange.max - fromRange.min) + toRange.min;
        }
        function restart_game() {
            ball.position.set(initBallPos.x, initBallPos.y, initBallPos.z);
            paddlePositionDiff.set(0, 0, 0);
            velocity.set(1, 2, 3);
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
            paddle2.position.setZ(-2.5 * tableLength);
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
                    if (mouse.y > 0) {
                        paddleY = 2;
                        paddleZ = paddleZ = mapRange(mouse.y, { min: 0, max: 1 }, { min: -3, max: 80 });
                    }
                    else {
                        paddleY = mapRange(mouse.y, { min: -1, max: 0 }, { min: -20, max: 2 });
                        paddleZ = mapRange(mouse.y, { min: -1, max: 0 }, { min: -30, max: -3 });
                    }
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
            paddle1Box.expandByScalar(0.03);
            const paddle2Box = new THREE.Box3().setFromObject(paddle2);
            paddle2Box.expandByScalar(0.03);
            const tableBox = new THREE.Box3().setFromObject(table);
            const gridBox = new THREE.Box3().setFromObject(grid);
            ball.position.x += velocity.x;
            ball.position.y += velocity.y;
            ball.position.z += velocity.z;
            // Apply gravity
            velocity.y += gravity;
            // Apply air resistance
            velocity.multiplyScalar(0.99);
            // if (ball.position.x > tableWidth || ball.position.x < 0) {
            //     velocity.x *= -1;
            // }
            if (ballBox.intersectsBox(tableBox)) {
                paddlePositionDiff.set(0, 0, 0);
                // Move the ball out of the intersection
                while (ballBox.intersectsBox(tableBox)) {
                    ball.position.y -= Math.sign(velocity.y);
                    ballBox.setFromObject(ball);
                }
                velocity.y *= -1;
                if (velocity.y > 0)
                    velocity.y = 2;

            }
            if (ball.position.z > 1.5 * tableLength) {
                //player 1 scores
                restart_game();
            }
            if (ball.position.z < - (3.5 * tableLength)) {
                //player 2 scores
                restart_game();
            }
            if (ballBox.intersectsBox(paddle1Box)) {
                if (firstIntersectionPosition === null) {
                    firstIntersectionPosition = paddle1.position.clone();
                }
                lastIntersectionPosition = paddle1.position.clone();
                const relativePosition = ball.position.clone().sub(table.position);
                velocity.z = -mapRange(relativePosition.z, { min: -3 * tableLength, max: tableLength }, { min: -6, max: 6 });
                velocity.y = 1;
                velocity.x = -mapRange(relativePosition.x - tableWidth / 2, { min: -tableWidth / 2, max: tableWidth / 2 }, { min: -3, max: 3 });
                gsap.to(paddle1.scale, {
                    x: 120,
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
                gsap.to(paddle1.position, {
                    x: ball.position.x + 3,
                    y: ball.position.y + 3,
                    z: ball.position.z + 3,
                    duration: 0.1,
                    onComplete: () => {
                        gsap.to(paddle1.position, {
                            x: paddleX + tableWidth / 2,
                            y: paddleY,
                            z: -paddleZ + 60,
                            duration: 0.1
                        });
                    }
                });
            }
            else if (firstIntersectionPosition !== null && lastIntersectionPosition !== null) {
                paddlePositionDiff = lastIntersectionPosition.clone().sub(firstIntersectionPosition);
                console.log(paddlePositionDiff);
                firstIntersectionPosition = null;
                lastIntersectionPosition = null;
            }
            velocity.x -= paddlePositionDiff.x / 200;
            velocity.y -= paddlePositionDiff.y / 200;
            velocity.z -= paddlePositionDiff.z / 200;
            if (ballBox.intersectsBox(paddle2Box)) {
                paddlePositionDiff.set(0, 0, 0);
                let relativePosition: THREE.Vector3 = ball.position.clone().sub(table.position);
                velocity.x = -mapRange(relativePosition.x - tableWidth / 2, { min: -tableWidth / 2, max: tableWidth / 2 }, { min: -1, max: 1 });
                if (velocity.x > 0.35) {
                    //random value between velocity.x and -1
                    velocity.x = -1 + Math.random() * (velocity.x - (-1));
                }
                else if (velocity.x < -0.35) {
                    velocity.x = velocity.x + Math.random() * (1 - velocity.x);
                }
                else {
                    velocity.x = Math.random() * 2 - 1;
                }
                // if (velocity.x < 0.35 && velocity.x > -0.35)
                //     velocity.x += Math.sign(velocity.x) * -1;
                //if v > 
                //if (counter % 2 == 0)
                velocity.z = -mapRange(relativePosition.z, { min: -3 * tableLength, max: tableLength }, { min: -6, max: 6 });
                velocity.y = 2;

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