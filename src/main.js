import { initScene, animate } from './visualization.js';
import { setupControls } from './controls.js';
import { StatusMonitor } from './statusMonitor.js';
import './analysis.js';
import './e2eValidator.js';
import './presetValidator.js';

try {
  // Initialize the 3D scene with lighting and controls
  const { scene, camera, renderer, spiral, controls, ambientLight, directionalLight, rimLight, modeManager } = initScene();
  
  // Initialize status monitor for extended prime system
  const statusMonitor = new StatusMonitor();
  
  // Set up GUI controls (non-critical for basic visualization)
  try {
    setupControls(spiral, controls, ambientLight, directionalLight, rimLight, modeManager);
  } catch (controlsError) {
    console.error('GUI controls failed to initialize:', controlsError);
    console.log('Application will continue without GUI controls');
  }
  
  // Start animation loop with status monitoring
  animate(scene, camera, renderer, spiral, controls, statusMonitor);
  
  // Auto-run diagnostics after a short delay to allow scene to settle
  setTimeout(() => {
    console.log('🔍 Auto-running spiral diagnostics...');
    if (window.runSpiralDiagnostics) {
      window.runSpiralDiagnostics().catch(err => {
        console.error('Diagnostics failed:', err);
      });
    }
  }, 2000);
  
} catch (error) {
  console.error('Fatal error during application initialization:', error);
  
  // Display error message to user
  document.body.innerHTML = `
    <div style="color: white; padding: 20px; font-family: Arial;">
      <h2>Silent Spiral 12D - Initialization Error</h2>
      <p>Failed to initialize the application: ${error.message}</p>
      <p>Please check browser console for more details.</p>
      <p>Requirements:</p>
      <ul>
        <li>Modern browser with WebGL support</li>
        <li>Hardware acceleration enabled</li>
        <li>JavaScript enabled</li>
      </ul>
    </div>
  `;
}
