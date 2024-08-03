import * as THREE from 'three';
import { useEffect } from 'react';
//import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { gsap } from 'gsap';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import backgroundimage from './assets/background.jpg';

function Pve3d() {
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
        let waitforpaddle2 = false;
        let waitfor_ = false;
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
            velocity.set(1, 2, 2.5);
            waitforpaddle2 = false;
            waitfor_ = false;
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
            camera.position.add(new THREE.Vector3().subVectors(table.position, camera.position).multiplyScalar(0.1));
            initBallPos = ball.position.clone();
            paddle2.position.setZ(-2.5 * tableLength);
            paddle2.position.setX(0);
            paddle2.position.setY(-20);
            // Create a vector to hold the mouse position
            const mouse = new THREE.Vector2();
            let isListening = true;

            window.addEventListener('keydown', (event) => {
                if (event.key.toLowerCase() == 'r')
                    restart_game();
            });
            function onMouseMove(event: MouseEvent) {
                if (isListening) {
                    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
                    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
                    paddleX = mapRange(mouse.x, { min: -1, max: 1 }, { min: -120, max: 120 });
                    if (mouse.y > -0.4) {
                        paddleY = 10;
                        paddleZ = paddleZ = mapRange(mouse.y, { min: -0.4, max: 1 }, { min: -7, max: 80 });
                    }
                    else {
                        paddleY = mapRange(mouse.y, { min: -1, max: -0.4 }, { min: -20, max: 10 });
                        paddleZ = mapRange(mouse.y, { min: -1, max: -0.4 }, { min: -30, max: -7 });
                    }
                    paddle1?.position.set(paddleX + tableWidth / 2, paddleY - 10, -paddleZ + 60);
                    camera.position.y = mouse.y / 5 + 1.25;
                    camera.position.z = -mouse.y / 15 + 1.88;
                    camera.position.x = mouse.x + 0.75;
                    camera.position.add(new THREE.Vector3().subVectors(table.position, camera.position).multiplyScalar(0.1));
                    camera.lookAt(table.position);
                    animatePaddleRotation();
                }
            }
            function animatePaddleRotation() {
                const rotation = Math.atan2(Math.abs(paddleY), paddle1.position.x - tableWidth / 2);
                const rotation2 = Math.atan2(paddle2.position.y, paddle2.position.x - tableWidth / 2);
                const rotationz = Math.atan2(Math.abs(paddleY + 20), paddle1.position.x - tableWidth / 2);
                paddle1.rotation.y = rotation;
                // paddle2.rotation.y = rotation2;
                if (paddle1.position.x - tableWidth / 2 > 0)
                    paddle1.rotation.z = rotationz - Math.PI / 2;
                else
                    paddle1.rotation.z = -rotationz + Math.PI / 2;
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
            //AI for paddle 2
            //console.log(velocity.y);
            const speed = 3;
            const XdistanceToBall = ball.position.x - paddle2.position.x;
            const YdistanceToBall = ball.position.y - paddle2.position.y;
            const speedModifier = Math.min(Math.abs(XdistanceToBall) / 10, 1);
            paddle2.position.x += Math.sign(XdistanceToBall) * speed * speedModifier;
            //paddle2.position.y += Math.sign(YdistanceToBall) * speed * speedModifier;
            // HITBOXES
            const ballBox = new THREE.Box3().setFromObject(ball);
            const paddle1Box = new THREE.Box3().setFromObject(paddle1);
            paddle1Box.expandByScalar(0.01);
            const paddle2Box = new THREE.Box3().setFromObject(paddle2);
            paddle2Box.expandByScalar(0.01);
            const tableBox = new THREE.Box3().setFromObject(table);
            const gridBox = new THREE.Box3().setFromObject(grid);
            gridBox.expandByScalar(0.01);
            // set max velocity.y
            // if (Math.abs(velocity.y) > 2)
            //     velocity.y = Math.sign(velocity.y) * 2;

            // Move the ball
            ball.position.x += velocity.x;
            ball.position.y += velocity.y;
            ball.position.z += velocity.z;

            // Apply gravity
            if (velocity.y < 0)
                velocity.y += gravity * 0.9;
            else
                velocity.y += gravity;
            // Apply air resistance
            velocity.x -= Math.sign(velocity.x) * 0.02;
            velocity.z -= Math.sign(velocity.z) * 0.02;
            velocity.y -= Math.sign(velocity.y) * 0.02;
            // Check for collisions
            if (ballBox.intersectsBox(tableBox)) {
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
            if (ball.position.z > 1.5 * tableLength) {
                //player 1 scores
                restart_game();
            }
            if (ball.position.z < - (3.5 * tableLength)) {
                //player 2 scores
                restart_game();
            }
            if (ballBox.intersectsBox(paddle1Box)) {
                if (firstIntersectionPosition === null)
                    firstIntersectionPosition = paddle1.position.clone();
                else
                    lastIntersectionPosition = paddle1.position.clone();
                if (!waitforpaddle2)
                {
                    console.log('hit');
                    const relativePosition = ball.position.clone().sub(table.position);
                    velocity.z = -mapRange(relativePosition.z, { min: -3 * tableLength, max: tableLength }, {min: -5, max: 5 });
                    velocity.y = 1.6;
                    velocity.x = -mapRange(relativePosition.x - tableWidth / 2, { min: -tableWidth / 2, max: tableWidth / 2 }, { min: -2, max: 2 });
                    
                    gsap.to(paddle1.position, {
                        x: ball.position.x + 3,
                        y: ball.position.y,
                        z: ball.position.z + 3,
                        duration: 0.2,
                        onComplete: () => {
                            gsap.to(paddle1.position, {
                                x: paddleX + tableWidth / 2,
                                y: paddleY - 10,
                                z: -paddleZ + 60,
                                duration: 0.3
                            });
                        }
                    });
                    if (paddle1.rotation.y < 2.66 && paddle1.rotation.y > 0.52)
                    {
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
                }
                waitforpaddle2 = true;
            }
            else if (firstIntersectionPosition !== null && lastIntersectionPosition !== null && !waitfor_) {
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
            if (ballBox.intersectsBox(paddle2Box)) {
                waitforpaddle2 = false;
                waitfor_ = false;
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
                velocity.z = -mapRange(relativePosition.z, { min: -3 * tableLength, max: tableLength }, { min: -5, max: 5 });
                velocity.y = 1.6;
            }
            
            if (ballBox.intersectsBox(gridBox)) {
                waitforpaddle2 = false;
                waitfor_ = false;
                //make the ball bounce off the grid with lower velocity
                if (ballBox.getCenter(new THREE.Vector3()).y <= gridBox.max.y) // ball hits the grid
                {
                    while (ballBox.intersectsBox(gridBox)) {
                        ball.position.z -= Math.sign(velocity.z);
                        ballBox.setFromObject(ball);
                    }
                    velocity.z *= -0.2;
                    velocity.y *= 0;
                    velocity.x *= 0.2;

                }
                else if (ballBox.min.y <= gridBox.max.y) // ball hits the top of the grid
                {
                    while (ballBox.intersectsBox(gridBox)) {
                        ball.position.z -= Math.sign(velocity.z);
                        ballBox.setFromObject(ball);
                    }
                    velocity.y *= 0.7;
                    velocity.z *= 0.5;
                    velocity.x = Math.random() * 2 - 1;
                }
            }
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

export default Pve3d;