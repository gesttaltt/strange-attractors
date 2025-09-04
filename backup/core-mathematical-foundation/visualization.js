import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { generateSpiral } from './spiral.js';
import { projectSpiral } from './projection.js';
import { config } from './config.js';
import { VisualizationModeManager } from './visualizationModes.js';

export function initScene(mathDataPipeline = null) {
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

  let spiral, modeManager;
  
  try {
    console.log('🌀 Initializing spiral generation...');
    const params = config.getAllParams();
    console.log('📋 Using parameters:', params);
    
    const points = generateSpiral(params, params.steps, params.dt, mathDataPipeline);
    console.log(`📊 Generated ${points.length} spiral points with ${points[0]?.length || 0} dimensions`);
    
    const {X,Y,Z,color,size,opacity} = projectSpiral(points);
    console.log(`📐 Projected to ${X?.length || 0} 3D points`);
    console.log(`📏 Coordinate ranges: X[${Math.min(...X)?.toFixed(3)} to ${Math.max(...X)?.toFixed(3)}], Y[${Math.min(...Y)?.toFixed(3)} to ${Math.max(...Y)?.toFixed(3)}], Z[${Math.min(...Z)?.toFixed(3)} to ${Math.max(...Z)?.toFixed(3)}]`);

    // Prepare color array for visualization modes
    const colors = [];
    for (let i=0; i<X.length; i++){
      colors.push((color[i][0]%1+1)%1, (color[i][1]%1+1)%1, (color[i][2]%1+1)%1);
    }
    console.log(`🎨 Prepared ${colors.length} color values`);

    // Create visualization mode manager
    modeManager = new VisualizationModeManager(scene, null);
    spiral = modeManager.switchMode('line', X, Y, Z, colors, size, opacity);
    console.log('✅ Spiral visualization created and added to scene');
    
    // Calculate bounding box for camera positioning
    const maxCoord = Math.max(
      Math.max(...X.map(Math.abs)),
      Math.max(...Y.map(Math.abs)),
      Math.max(...Z.map(Math.abs))
    );
    console.log(`📏 Spiral bounding sphere radius: ${maxCoord.toFixed(3)}`);
    console.log(`📷 Camera distance: ${camera.position.length().toFixed(3)}`);
    console.log(`📍 Camera position: (${camera.position.x.toFixed(1)}, ${camera.position.y.toFixed(1)}, ${camera.position.z.toFixed(1)})`);
    
    // Suggest better camera position if needed
    const suggestedDistance = maxCoord * 3; // Good rule of thumb
    if (camera.position.length() < suggestedDistance * 0.5 || camera.position.length() > suggestedDistance * 5) {
      console.log(`💡 Suggested camera distance: ${suggestedDistance.toFixed(1)} (current: ${camera.position.length().toFixed(1)})`);
      
      // Auto-adjust camera position for better visibility
      const currentDir = camera.position.clone().normalize();
      camera.position.copy(currentDir.multiplyScalar(suggestedDistance));
      camera.lookAt(0, 0, 0);
      console.log(`🔧 Auto-adjusted camera to: (${camera.position.x.toFixed(1)}, ${camera.position.y.toFixed(1)}, ${camera.position.z.toFixed(1)})`);
    }

  } catch (error) {
    console.error('❌ Error during spiral creation:', error);
    // Fallback: create basic scene without spiral
    const geometry = new THREE.BufferGeometry();
    const material = new THREE.LineBasicMaterial({color: 0xffffff, linewidth: 2});
    spiral = new THREE.Line(geometry, material);
    scene.add(spiral);
    console.log('⚠️  Using fallback empty geometry');
    modeManager = null;
  }

  // Window resize handler (outside of spiral generation try-catch)
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

  // Expose scene for debugging
  if (typeof window !== 'undefined') {
    window.debugScene = scene;
    window.debugCamera = camera;
    window.debugRenderer = renderer;
    window.debugSpiral = spiral;
  }

  return {scene, camera, renderer, spiral, controls, ambientLight, directionalLight, rimLight, modeManager};
}

export function animate(scene, camera, renderer, spiral, controls, statusMonitor = null) {
  let frameStart = performance.now();
  
  function render(time){
    const renderStart = performance.now();
    
    // Update orbit controls for smooth damping
    if (controls) {
      controls.update();
    }
    
    // Update spiral geometry if data exists (this is typically static, but kept for dynamic updates)
    if (spiral && spiral.userData && spiral.userData.X && spiral.geometry && spiral.geometry.attributes && spiral.geometry.attributes.position) {
      try {
        const {X,Y,Z} = spiral.userData;
        const positions = spiral.geometry.attributes.position.array;
        if (positions && positions.length >= X.length * 3) {
          for(let i=0;i<X.length;i++){
            positions[3*i] = X[i];
            positions[3*i+1] = Y[i];
            positions[3*i+2] = Z[i];
          }
          spiral.geometry.attributes.position.needsUpdate = true;
        }
      } catch (updateError) {
        // Silently handle geometry update errors to prevent animation loop breaks
      }
    }
    
    // Remove manual rotation - OrbitControls handles this better
    // spiral.rotation.y += 0.001* time*0.01;
    // spiral.rotation.x += 0.0005* time*0.01;
    
    renderer.render(scene,camera);
    
    // Update status monitor if available
    if (statusMonitor && spiral.userData) {
      const renderTime = performance.now() - renderStart;
      const harmonicCount = spiral.userData.harmonicCount || 0;
      statusMonitor.updateMetrics(harmonicCount, renderTime);
    }
    
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}
