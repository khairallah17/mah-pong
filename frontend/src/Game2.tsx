import * as THREE from 'three';
import { useEffect } from 'react';
//import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import backgroundimage from './assets/background.jpg';

function Game2() {
    useEffect(() => {
        const gameContainer = document.getElementById("game-container");
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
        let tableY : number;
        //let table: THREE.Mesh;
        const gravity = -0.04;
        let velocity = new THREE.Vector3(1, 1.5, 1);
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
            tableY = ball.position.y;
            //table = loadedscene.getObjectByName('table_plate_obj') as THREE.Mesh;
            // Create a vector to hold the mouse position
            const mouse = new THREE.Vector2();

            // Create a flag to track whether we should be listening to mousemove events
            let isListening = true;

           

            // Determine the range of x and y coordinates for the paddle
            const paddleXRange = { min: -75, max: 75 }; // replace with your actual range
            const paddleYRange = { min: -10, max: 10 }; // replace with your actual range
            const paddleZRange = { min: -10, max: 20 }; // replace with your actual range
            // Create a function to map the normalized mouse coordinates to this range
            function mapRange(value: number, fromRange: { min: number, max: number }, toRange: { min: number, max: number }): number {
                return (value - fromRange.min) * (toRange.max - toRange.min) / (fromRange.max - fromRange.min) + toRange.min;
            }
            // In your onMouseMove function...
            function onMouseMove(event: MouseEvent) {
                // Only update the paddle's position if isListening is true
                if (isListening) {
                    // Normalize the mouse position from -1 to 1
                    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
                    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

                    // Map the normalized mouse coordinates to the paddle's range
                    const paddleX = mapRange(mouse.x, { min: -1, max: 1 }, paddleXRange);
                    const paddleY = mapRange(mouse.y, { min: -1, max: 1 }, paddleYRange);
                    const paddleZ = mapRange(mouse.y, { min: -1, max: 1 }, paddleZRange);

                    // Use the mapped mouse position to set the position of Paddle_1
                    paddle1?.position.set(paddleX + 72.5, paddleY, -paddleZ + 60);
                    animatePaddleRotation();
                }
            }
            function animatePaddleRotation() {
                // Calculate the rotation based on the paddle's position
                const rotation = -Math.atan2(paddle1.position.y, paddle1.position.x - 72.5);
                const rotation2 = -Math.atan2(paddle2.position.y, paddle2.position.x - 72.5);

                // Update the paddle's rotation
                paddle1.rotation.y = rotation;
                paddle2.rotation.y = rotation2;

                // Request the next animation frame
                //requestAnimationFrame(animatePaddleRotation);
            }
            // Add the click event listener
            window.addEventListener('click', () => {
                isListening = !isListening;
                document.body.style.cursor = isListening ? 'none' : 'auto';
            });

             // Add the mousemove event listener
             window.addEventListener('mousemove', onMouseMove, false);

            //const box = new THREE.Box3().setFromObject(loadedscene);
            //const center = box.getCenter(new THREE.Vector3());
            //camera.lookAt(center);
            renderer.render(scene, camera);
            animate();
        }, undefined, function (error) {
            console.error('An error happened', error);
        });
        function animate() {
            // let tableWidth = table.geometry.boundingBox?.max.x;
            // let tableLength = table.geometry.boundingBox?.max.z;
            // let radius = ball.geometry.boundingSphere?.radius;
            let tableWidth = 145;
            let tableLength = 67;
            let radius = 0;
            ball.position.x += velocity.x;
            ball.position.y += velocity.y;
            ball.position.z += velocity.z;
            // Apply gravity
            velocity.y += gravity;

            // Check for collisions with table boundaries
            // Assuming tableWidth and tableLength are defined
            if (ball.position.x + radius > tableWidth || ball.position.x - radius < 0) {
                velocity.x *= -1;
            }
            if (ball.position.y - radius < tableY) {
                velocity.y *= -1;
                if (velocity.y > 0)
                    velocity.y = 1.5;
            }
            if (ball.position.z + radius > tableLength || ball.position.z - radius < -tableLength) {
                velocity.z *= -1;
            }
            requestAnimationFrame(animate);
            renderer.render(scene, camera);
        }
        return () => {
            // Cleanup code here
            gameContainer?.removeChild(renderer.domElement);
        };
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