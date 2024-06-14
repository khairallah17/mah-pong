import * as THREE from 'three';
import { useEffect } from 'react';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
// import backgroundimage from './assets/background.jpg';

function Game2() {
    useEffect(() => {
        const gameContainer = document.getElementById("game-container");
        const loader = new GLTFLoader();
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 0.785;
        camera.position.y = 1.4;
        camera.position.x = 2.512;
        camera.rotation.x = 0;
        camera.rotation.y = 1.5;
        camera.rotation.z = -12;
        camera.lookAt(scene.position);
        const renderer = new THREE.WebGLRenderer();
        const controls = new OrbitControls(camera, renderer.domElement);
        renderer.setSize(window.innerWidth, window.innerHeight);
        gameContainer?.appendChild(renderer.domElement);
        window.addEventListener('resize', () => {
            renderer.setSize(window.innerWidth, window.innerHeight);
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.render(scene, camera);
        });
        loader.load('../models/sec.glb', (gltf) => {
            const loadedscene = gltf.scene;
            // Add your scene to your Three.js scene here
            loadedscene.position.set(0, 0, 0);
            loadedscene.rotation.set(0, 160, 0);
            scene.add(loadedscene);
            const light = new THREE.AmbientLight(0xffffff, 3);
            light.position.set(0, 10, 0);
            light.castShadow = true;
            scene.add(light);
            const box = new THREE.Box3().setFromObject(loadedscene);
            const center = box.getCenter(new THREE.Vector3());
            camera.lookAt(center);
            renderer.render(scene, camera);
        }, undefined, function (error) {
            console.error('An error happened', error);
        });
        function animate() {
            requestAnimationFrame(animate);
            controls.update();
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