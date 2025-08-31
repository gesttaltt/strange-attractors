import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { generateSpiral } from './spiral.js';
import { projectSpiral } from './projection.js';
import { config } from './config.js';
import { VisualizationModeManager } from './visualizationModes.js';

export function initScene() {
  const canvas = document.getElementById('spiral-canvas');
  if (!canvas) {
    throw new Error('Canvas element with id "spiral-canvas" not found');
  }

  // Check for WebGL support
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance"
  });
  
  if (!renderer) {
    throw new Error('WebGL not supported. Please use a modern browser.');
  }

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);
  
  // Add lighting system for 3D depth perception
  const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
  scene.add(ambientLight);
  
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(50, 50, 50);
  directionalLight.castShadow = false; // Keep shadows off for performance
  scene.add(directionalLight);
  
  // Add subtle rim lighting
  const rimLight = new THREE.DirectionalLight(0x4444ff, 0.2);
  rimLight.position.set(-50, -50, -50);
  scene.add(rimLight);
  
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 0.1, 1000);
  camera.position.set(120, 60, 120);
  camera.lookAt(0, 0, 0);

  // Add orbit controls for intuitive 3D navigation
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.screenSpacePanning = false;
  controls.minDistance = 2;
  controls.maxDistance = 500;
  controls.maxPolarAngle = Math.PI;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.5;

  try {
    const params = config.getAllParams();
    const points = generateSpiral(params, params.steps, params.dt);
    const {X,Y,Z,color,size,opacity} = projectSpiral(points);

    // Prepare color array for visualization modes
    const colors = [];
    for (let i=0; i<X.length; i++){
      colors.push((color[i][0]%1+1)%1, (color[i][1]%1+1)%1, (color[i][2]%1+1)%1);
    }

    // Create visualization mode manager
    const modeManager = new VisualizationModeManager(scene, null);
    const spiral = modeManager.switchMode('line', X, Y, Z, colors, size, opacity);

  window.addEventListener('resize', () => {
    try {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    } catch (error) {
      console.error('Error during resize:', error);
    }
  });

  return {scene, camera, renderer, spiral, controls, ambientLight, directionalLight, rimLight, modeManager};
  } catch (error) {
    console.error('Error initializing scene:', error);
    // Fallback: create basic scene without spiral
    const geometry = new THREE.BufferGeometry();
    const material = new THREE.LineBasicMaterial({color: 0xffffff, linewidth: 2});
    const spiral = new THREE.Line(geometry, material);
    scene.add(spiral);
    const fallbackControls = new OrbitControls(camera, renderer.domElement);
    return {scene, camera, renderer, spiral, controls: fallbackControls, ambientLight: null, directionalLight: null, rimLight: null, modeManager: null};
  }
}

export function animate(scene, camera, renderer, spiral, controls) {
  function render(time){
    // Update orbit controls for smooth damping
    if (controls) {
      controls.update();
    }
    
    // Update spiral geometry if data exists
    if (spiral.userData && spiral.userData.X) {
      const {X,Y,Z,geometry} = spiral.userData;
      const positions = geometry.attributes.position.array;
      for(let i=0;i<X.length;i++){
        positions[3*i] = X[i];
        positions[3*i+1] = Y[i];
        positions[3*i+2] = Z[i];
      }
      geometry.attributes.position.needsUpdate = true;
    }
    
    // Remove manual rotation - OrbitControls handles this better
    // spiral.rotation.y += 0.001* time*0.01;
    // spiral.rotation.x += 0.0005* time*0.01;
    
    renderer.render(scene,camera);
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}
