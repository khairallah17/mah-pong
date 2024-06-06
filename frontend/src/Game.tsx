import * as THREE from 'three';
import { useEffect } from 'react';
import backgroundimage from './assets/background.jpg';

function Game() {
	useEffect(() => {
		const gameContainer = document.getElementById("game-container");
		let restartEvent = new KeyboardEvent('keydown', { key: 'r' });

		const scene = new THREE.Scene();
		const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
		camera.position.z = 5;
		camera.position.y = 5;
		camera.lookAt(scene.position);
		const renderer = new THREE.WebGLRenderer();
		renderer.setSize(window.innerWidth, window.innerHeight);
		gameContainer?.appendChild(renderer.domElement);
		const loader = new THREE.TextureLoader();
		loader.load(backgroundimage, (texture) => {
			scene.background = texture;
		});
		window.addEventListener('resize', () => {

			renderer.setSize(window.innerWidth, window.innerHeight);


			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
			renderer.render(scene, camera);
		});
		renderer.shadowMap.enabled = true;
		const tableGeometry = new THREE.BoxGeometry(5, 0.1, 3);
		const tableMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
		const table = new THREE.Mesh(tableGeometry, tableMaterial);
		table.castShadow = false;
		table.receiveShadow = true;
		scene.add(table);


		const ballGeometry = new THREE.SphereGeometry(0.1, 32, 32);
		const ballMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
		const ball = new THREE.Mesh(ballGeometry, ballMaterial);
		ball.position.set(0, 0.1, 0);
		ball.castShadow = true;
		ball.receiveShadow = true;
		scene.add(ball);


		const paddleGeometry = new THREE.BoxGeometry(0.2, 0.02, 1);
		const paddleMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
		const paddle1 = new THREE.Mesh(paddleGeometry, paddleMaterial);
		paddle1.position.set(-2.5, 0.1, 0);
		paddle1.castShadow = true;
		paddle1.receiveShadow = true;
		scene.add(paddle1);
		const paddle2 = new THREE.Mesh(paddleGeometry, paddleMaterial);
		paddle2.position.set(2.5, 0.1, 0);
		paddle2.castShadow = true;
		paddle2.receiveShadow = true;
		scene.add(paddle2);

		const light = new THREE.DirectionalLight(0xffffff, 3);
		light.position.set(0, 10, 0);
		light.castShadow = true;
		scene.add(light);

		let isPaused = false;
		document.addEventListener('keydown', (event) => {
			if (event.key === 'p') {
				isPaused = !isPaused;
			} else if (event.key === 'r') {
				isPaused = true;
				ball.position.set(0, 0.1, 0);
				ballDirection.set(1, 0, 1);

				paddle1.position.set(-2.5, 0.1, 0);
				paddle2.position.set(2.5, 0.1, 0);
				renderer.render(scene, camera);
			} if (event.key === 'ArrowUp') {
				isPaused = false;
				if (paddle1.position.z - paddle1.geometry.parameters.depth / 2 > table.position.z - table.geometry.parameters.depth / 2)
					paddle1.position.z -= 0.2;
			} else if (event.key === 'ArrowDown') {
				isPaused = false;
				if (paddle1.position.z + paddle1.geometry.parameters.depth / 2 < table.position.z + table.geometry.parameters.depth / 2)
					paddle1.position.z += 0.2;
			}
		});
		document.addEventListener('click', () => {
			if (isPaused)
				isPaused = false;
			else
				isPaused = true;
		})


		let ballDirection = new THREE.Vector3(1, 0, 1);
		const paddle1Box = new THREE.Box3().setFromObject(paddle1);
		const paddle2Box = new THREE.Box3().setFromObject(paddle2);


		const animate = function () {
			if (isPaused) {
				requestAnimationFrame(animate);
				return;
			}
			requestAnimationFrame(animate);


			ball.position.add(ballDirection.clone().multiplyScalar(0.05));


			paddle1Box.setFromObject(paddle1);
			paddle2Box.setFromObject(paddle2);


			const ballSphere = new THREE.Sphere(ball.position, ball.geometry.parameters.radius);
			const goal1 = new THREE.Box3(new THREE.Vector3(-3, -1, -1.5), new THREE.Vector3(-2.5, 1, 1.5));
			const goal2 = new THREE.Box3(new THREE.Vector3(2.5, -1, -1.5), new THREE.Vector3(3, 1, 1.5));
			if (paddle1Box.intersectsSphere(ballSphere)) {
				ballDirection.x *= -1;
				ball.position.x += 0.05;
			} else if (paddle2Box.intersectsSphere(ballSphere)) {
				ballDirection.x *= -1;
				ball.position.x -= 0.05;
			} if (goal1.intersectsSphere(ballSphere) || goal2.intersectsSphere(ballSphere)) {
				isPaused = true;
				document.dispatchEvent(restartEvent);
			}
			if (ball.position.z < -1.5 || ball.position.z > 1.5) {
				ballDirection.z *= -1;
			}
			renderer.render(scene, camera);
		};
		animate();
		return () => {
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

export default Game;