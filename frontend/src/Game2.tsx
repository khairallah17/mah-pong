import * as THREE from 'three';
import { useEffect } from 'react';
//import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
// import backgroundimage from './assets/background.jpg';

function Game2() {
    useEffect(() => {
        const gameContainer = document.getElementById("game-container");
        const loader = new GLTFLoader();
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = -1.48;
        camera.position.y = 1.09;
        camera.position.x = -0.45;
        camera.rotation.x = -2.59;
        camera.rotation.y = 0.188;
        camera.rotation.z = 3.02;
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
        console.log(camera.position);
        console.log(camera.rotation);
        loader.load('../models/latest.glb', (gltf) => {
            const loadedscene = gltf.scene;
            loadedscene.traverse((object) => {
                console.log(object.name);
            });
            loadedscene.position.set(0, 0, 0);
            loadedscene.rotation.set(0, 160, 0);
            scene.add(loadedscene);
            const light = new THREE.AmbientLight(0xffffff, 3);
            light.position.set(0, 10, 0);
            light.castShadow = true;
            scene.add(light);
            loadedscene.getObjectByName('Paddle_1')?.rotation.set(0, 0, 0);
            loadedscene.getObjectByName('Paddle_2')?.rotation.set(0, 0, 0);
            // Create a vector to hold the mouse position
            const mouse = new THREE.Vector2();

            // Create a flag to track whether we should be listening to mousemove events
            let isListening = true;

            // Add the mousemove event listener
            window.addEventListener('mousemove', onMouseMove, false);

            // Determine the range of x and y coordinates for the paddle
            const paddleXRange = { min: -60, max: 60 }; // replace with your actual range
            const paddleYRange = { min: -10, max: 10 }; // replace with your actual range

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

                    // Use the mapped mouse position to set the position of Paddle_1
                    const paddle1 = loadedscene.getObjectByName('Paddle_1') as THREE.Object3D | undefined;
                    paddle1?.position.set(paddleX + 72.5, paddleY, 50);
                }
            }

            // Add the click event listener
            window.addEventListener('click', () => {
                // Toggle the value of isListening
                isListening = !isListening;
            });

            // Rest of your code...
            camera.position.z = -1.48;
            camera.position.y = 1.09;
            camera.position.x = -0.45;
            camera.rotation.x = -2.59;
            camera.rotation.y = 0.188;
            camera.rotation.z = 3.02;
            //const box = new THREE.Box3().setFromObject(loadedscene);
            //const center = box.getCenter(new THREE.Vector3());
            //camera.lookAt(center);
            renderer.render(scene, camera);
        }, undefined, function (error) {
            console.error('An error happened', error);
        });
        function animate() {
            requestAnimationFrame(animate);
            //controls.update();
            // console.log(camera.position);
            // console.log(camera.rotation);
            renderer.render(scene, camera);
        }
        animate();
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