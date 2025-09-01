import { initScene, animate } from './visualization.js';
import { setupControls } from './controls.js';
import { StatusMonitor } from './statusMonitor.js';
import { MathematicalDataPipeline } from './mathematics/mathDataPipeline.js';
import { MathematicalAnalysisScheduler } from './mathematics/analysisScheduler.js';
import { State56DMonitor } from './mathematics/stateVectorMonitor.js';
import './analysis.js';
import './e2eValidator.js';
import './presetValidator.js';

try {
  console.log('🚀 Initializing Silent Spiral v2.0.0-stable with Phase 1 Mathematical Infrastructure...');
  
  // Initialize mathematical infrastructure first
  console.log('🧮 Phase 1: Setting up mathematical infrastructure...');
  const mathDataPipeline = new MathematicalDataPipeline();
  const mathAnalysisScheduler = new MathematicalAnalysisScheduler(mathDataPipeline);
  const state56DMonitor = new State56DMonitor(mathDataPipeline);
  
  // Initialize the 3D scene with mathematical integration
  const { scene, camera, renderer, spiral, controls, ambientLight, directionalLight, rimLight, modeManager } = initScene(mathDataPipeline);
  
  // Initialize status monitor with mathematical enhancements
  const statusMonitor = new StatusMonitor();
  
  // Set up GUI controls with mathematical infrastructure
  try {
    setupControls(spiral, controls, ambientLight, directionalLight, rimLight, modeManager, mathDataPipeline, state56DMonitor);
  } catch (controlsError) {
    console.error('GUI controls failed to initialize:', controlsError);
    console.log('Application will continue without GUI controls');
  }
  
  // Start mathematical analysis system
  mathAnalysisScheduler.startScheduledAnalysis();
  state56DMonitor.startMonitoring();
  
  // Start animation loop with mathematical monitoring
  animate(scene, camera, renderer, spiral, controls, statusMonitor);
  
  // Global access for mathematical debugging
  window.mathPipeline = mathDataPipeline;
  window.mathScheduler = mathAnalysisScheduler;
  window.stateMonitor = state56DMonitor;
  
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
