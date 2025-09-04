// Silent Spiral v3.0 - Clean Simple Foundation
// Minimal working implementation focusing on mathematical core

import { initScene, animate } from './visualization.js';
import { config } from './config.js';
import { MathematicalController } from './mathematicalController.js';
import { CleanGUI } from './cleanGUI.js';

try {
  console.log('Initializing Silent Spiral v3.0 - Clean Architecture');
  
  // Initialize core mathematical visualization
  const scene = initScene();
  
  // Initialize mathematical controller (business logic)
  const mathController = new MathematicalController(config, scene);
  
  // Initialize clean GUI (presentation layer)
  const gui = new CleanGUI(mathController);
  
  // Start animation loop with shader animation support
  animate(scene.scene, scene.camera, scene.renderer, scene.spiral, scene.controls, scene.modeManager);
  
  // Global access for mathematical framework
  window.config = config;
  window.scene = scene;
  window.mathController = mathController;
  window.gui = gui;
  
  console.log('Silent Spiral v3.0 Mathematical Foundation Ready');
  console.log('Mathematical framework operational');
  console.log('56-dimensional mathematical analysis active');
  
} catch (error) {
  console.error('Initialization failed:', error);
  
  // Minimal fallback
  document.body.innerHTML = `
    <div style="color: white; padding: 20px; font-family: Arial; text-align: center;">
      <h2>Silent Spiral v3.0</h2>
      <p>Mathematical framework initialization failed</p>
      <p>Error: ${error.message}</p>
      <p>Check console for details</p>
    </div>
  `;
}