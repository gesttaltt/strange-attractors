import * as THREE from 'three';
import * as dat from 'dat.gui';
import { generateSpiral } from './spiral.js';
import { projectSpiral } from './projection.js';
import { config, ConfigManager } from './config.js';
import { analyzeManifoldConvergence } from './analysis.js';
import { EXTENDED_PRIMES } from './primes.js';

// Error notification system
function showErrorNotification(message) {
  const errorDiv = document.createElement('div');
  errorDiv.style.cssText = `
    position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
    background: rgba(255,0,0,0.9); color: white; padding: 20px;
    border-radius: 8px; z-index: 2000; font-family: monospace;
    border: 2px solid #ff4444; max-width: 400px; text-align: center;
  `;
  errorDiv.innerHTML = `
    <div style="font-weight: bold; margin-bottom: 10px;">⚠️ Error</div>
    <div>${message}</div>
    <button onclick="this.parentElement.remove()" style="
      margin-top: 15px; padding: 8px 16px; background: #fff; color: #000;
      border: none; border-radius: 4px; cursor: pointer;
    ">OK</button>
  `;
  document.body.appendChild(errorDiv);
  
  // Auto-remove after 10 seconds
  setTimeout(() => {
    if (errorDiv.parentElement) {
      errorDiv.remove();
    }
  }, 10000);
}

export function setupControls(spiral, controls, ambientLight, directionalLight, rimLight, modeManager, mathDataPipeline = null, state56DMonitor = null){
  const gui = new dat.GUI();
  
  // Add preset selector
  const presetController = {
    preset: 'Default Cathedral'
  };
  
  const presetFolder = gui.addFolder('Presets');
  presetFolder.add(presetController, 'preset', Object.keys(ConfigManager.PRESETS))
    .onChange(async (presetName) => {
      try {
        console.log(`🎚️ Loading preset: ${presetName}`);
        
        // Load preset with enhanced validation
        config.loadPreset(presetName);
        
        // Controllers will be updated by observer, but add fallback
        setTimeout(() => {
          updateAllControllers();
        }, 100);
        
        console.log('✅ Preset loaded successfully');
      } catch (error) {
        console.error('❌ Failed to load preset:', error);
        
        // Show user-friendly error
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
          position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
          background: rgba(255,0,0,0.8); color: white; padding: 10px 20px;
          border-radius: 5px; z-index: 2000; font-family: Arial;
        `;
        errorDiv.textContent = `Failed to load preset "${presetName}": ${error.message}`;
        document.body.appendChild(errorDiv);
        setTimeout(() => errorDiv.remove(), 5000);
      }
    });
  presetFolder.open();

  const controllers = {};
  const params = config.getAllParams();

  // Add loading indicator
  const loadingDiv = document.createElement('div');
  loadingDiv.style.cssText = `
    position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
    background: rgba(0,0,0,0.8); color: white; padding: 20px;
    border-radius: 5px; display: none; z-index: 1000;
  `;
  loadingDiv.textContent = 'Generating spiral...';
  document.body.appendChild(loadingDiv);

  const updateSpiral = async () => {
    if (updateSpiral.isRunning) {
      console.log('Spiral update already in progress, skipping...');
      return;
    }
    
    updateSpiral.isRunning = true;
    
    try {
      loadingDiv.style.display = 'block';
      
      // Use requestAnimationFrame instead of setTimeout for better performance
      await new Promise(resolve => requestAnimationFrame(resolve));
      
      const currentParams = config.getAllParams();
      console.log('🔄 Updating spiral with params:', currentParams);
      
      const points = generateSpiral(currentParams, currentParams.steps, currentParams.dt, mathDataPipeline);
      const {X,Y,Z,color,size,opacity} = projectSpiral(points);
      
      if (modeManager) {
        // Use mode manager for dynamic updates
        const colors = [];
        for (let i=0; i<X.length; i++){
          colors.push((color[i][0]%1+1)%1, (color[i][1]%1+1)%1, (color[i][2]%1+1)%1);
        }
        const newSpiral = modeManager.updateGeometry(X, Y, Z, colors, size, opacity);
        Object.assign(spiral, newSpiral);
        spiral.userData = newSpiral.userData;
        console.log('✅ Spiral updated via mode manager');
      } else {
        // Fallback to manual geometry update
        const positions = [];
        const colors = [];
        for(let i=0;i<X.length;i++){
          positions.push(X[i], Y[i], Z[i]);
          colors.push((color[i][0]%1+1)%1, (color[i][1]%1+1)%1, (color[i][2]%1+1)%1);
        }
        spiral.geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions,3));
        spiral.geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors,3));
        spiral.geometry.attributes.position.needsUpdate = true;
        spiral.geometry.attributes.color.needsUpdate = true;
        console.log('✅ Spiral updated via manual geometry');
      }
    } catch (error) {
      console.error('❌ Failed to update spiral:', error);
      // Show user-friendly error without alert popup
      const errorDiv = document.createElement('div');
      errorDiv.style.cssText = `
        position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
        background: rgba(255,0,0,0.8); color: white; padding: 10px 20px;
        border-radius: 5px; z-index: 2000; font-family: Arial;
      `;
      errorDiv.textContent = 'Failed to generate spiral. Check parameters and try again.';
      document.body.appendChild(errorDiv);
      setTimeout(() => errorDiv.remove(), 5000);
    } finally {
      loadingDiv.style.display = 'none';
      updateSpiral.isRunning = false;
    }
  };

  const updateAllControllers = () => {
    try {
      const currentParams = config.getAllParams();
      Object.keys(controllers).forEach(key => {
        try {
          if (controllers[key] && typeof controllers[key].setValue === 'function') {
            controllers[key].setValue(currentParams[key]);
          }
        } catch (controllerError) {
          console.warn(`⚠️ Failed to update controller ${key}:`, controllerError);
        }
      });
      console.log('🎛️ Controllers updated successfully');
    } catch (error) {
      console.error('❌ Failed to update controllers:', error);
    }
  };

  // Add parameter controllers with validation
  Object.entries(ConfigManager.PARAM_RANGES).forEach(([key, range]) => {
    if (key === 'steps' || key === 'dt') return; // Skip these for now
    
    controllers[key] = gui.add(params, key, range.min, range.max, range.step)
      .onChange(async (value) => {
        try {
          config.setParam(key, value);
          await updateSpiral();
        } catch (error) {
          console.error(`❌ Invalid ${key}:`, error);
          // Reset to previous valid value
          controllers[key].setValue(config.getParam(key));
        }
      });
  });

  // Advanced settings folder
  const advancedFolder = gui.addFolder('Advanced Settings');
  controllers.steps = advancedFolder.add(params, 'steps', 1000, 50000, 1000).onChange(async (value) => {
    try {
      config.setParam('steps', value);
      await updateSpiral();
    } catch (error) {
      console.error('❌ Invalid steps:', error);
      controllers.steps.setValue(config.getParam('steps'));
    }
  });
  
  controllers.dt = advancedFolder.add(params, 'dt', 0.001, 0.1, 0.001).onChange(async (value) => {
    try {
      config.setParam('dt', value);
      await updateSpiral();
    } catch (error) {
      console.error('❌ Invalid dt:', error);
      controllers.dt.setValue(config.getParam('dt'));
    }
  });

  // Reset button
  const resetController = { reset: async () => {
    try {
      console.log('🔄 Resetting to default parameters...');
      config.reset();
      updateAllControllers();
      await updateSpiral();
      console.log('✅ Reset completed successfully');
    } catch (error) {
      console.error('❌ Failed to reset:', error);
    }
  }};
  gui.add(resetController, 'reset');

  // Mathematical Infrastructure Panel (Phase 1)
  const mathFolder = gui.addFolder('Mathematical Infrastructure');
  const mathController = {
    streamingActive: false,
    analysisFrequency: 30,
    stateMonitorVisible: false,
    
    toggleStreaming: () => {
      if (mathDataPipeline) {
        if (mathController.streamingActive) {
          mathDataPipeline.stopStreaming();
          mathController.streamingActive = false;
          console.log('⏹️ Mathematical data streaming stopped');
        } else {
          mathDataPipeline.startStreaming();
          mathController.streamingActive = true;
          console.log('🔄 Mathematical data streaming started');
        }
      }
    },
    
    toggleStateMonitor: () => {
      if (state56DMonitor) {
        if (mathController.stateMonitorVisible) {
          state56DMonitor.hide();
          mathController.stateMonitorVisible = false;
        } else {
          state56DMonitor.show();
          mathController.stateMonitorVisible = true;
        }
      }
    },
    
    showPipelineStats: () => {
      if (mathDataPipeline) {
        const stats = mathDataPipeline.getStreamingStats();
        console.log('📊 Mathematical Pipeline Statistics:', stats);
      }
    }
  };
  
  mathFolder.add(mathController, 'toggleStreaming').name('🔄 Toggle Data Streaming');
  mathFolder.add(mathController, 'toggleStateMonitor').name('📊 Toggle 56D Monitor');
  mathFolder.add(mathController, 'showPipelineStats').name('📈 Pipeline Stats');
  mathFolder.open();

  // Prime Analysis Panel (Enhanced)
  const analysisFolder = gui.addFolder('Mathematical Analysis');
  const analysisController = {
    harmonicCount: EXTENDED_PRIMES.slice(0, 50).length,
    maxPrime: EXTENDED_PRIMES[49],
    analyzeNow: () => {
      const currentParams = config.getAllParams();
      console.log('🔬 Starting comprehensive manifold analysis...');
      const results = analyzeManifoldConvergence(currentParams);
      
      // Display results in UI
      createAnalysisDisplay(results);
    },
    clearAnalysis: () => {
      const existingDisplay = document.getElementById('analysis-display');
      if (existingDisplay) {
        existingDisplay.remove();
      }
    },
    
    showCurrentState: () => {
      if (mathDataPipeline) {
        const currentState = mathDataPipeline.getCurrentState();
        if (currentState) {
          console.log('📊 Current 56D State:', {
            spatial: currentState.state.slice(0, 3),
            velocity: currentState.state.slice(3, 6),
            harmonics: currentState.state.slice(6, 16), // First 10 harmonics
            time: currentState.time
          });
        }
      }
    }
  };
  
  analysisFolder.add(analysisController, 'harmonicCount').name('Total Harmonics').listen();
  analysisFolder.add(analysisController, 'maxPrime').name('Highest Prime').listen();
  analysisFolder.add(analysisController, 'analyzeNow').name('🔬 Analyze Manifold');
  analysisFolder.add(analysisController, 'showCurrentState').name('📊 Show Current State');
  analysisFolder.add(analysisController, 'clearAnalysis').name('Clear Results');
  analysisFolder.open();

  // Add 3D visualization controls
  if (controls && ambientLight && directionalLight) {
    const visualizationFolder = gui.addFolder('3D Visualization');
    
    // Visualization mode selector
    if (modeManager) {
      const modeParams = {
        mode: 'line'
      };
      
      visualizationFolder.add(modeParams, 'mode', ['points', 'line', 'tube'])
        .name('Rendering Mode')
        .onChange(async (mode) => {
          try {
            console.log(`🎨 Switching to ${mode} mode...`);
            const currentParams = config.getAllParams();
            const points = generateSpiral(currentParams, currentParams.steps, currentParams.dt, mathDataPipeline);
            const {X,Y,Z,color,size,opacity} = projectSpiral(points);
            
            const colors = [];
            for (let i=0; i<X.length; i++){
              colors.push((color[i][0]%1+1)%1, (color[i][1]%1+1)%1, (color[i][2]%1+1)%1);
            }
            
            const newSpiral = modeManager.switchMode(mode, X, Y, Z, colors, size, opacity);
            // Update the spiral reference for other functions
            Object.assign(spiral, newSpiral);
            spiral.userData = newSpiral.userData;
            console.log(`✅ Switched to ${mode} mode successfully`);
          } catch (error) {
            console.error('❌ Failed to switch visualization mode:', error);
          }
        });
    }
    
    // Camera controls
    const cameraParams = {
      autoRotate: controls.autoRotate,
      autoRotateSpeed: controls.autoRotateSpeed,
      resetCamera: () => {
        controls.reset();
      }
    };
    
    visualizationFolder.add(cameraParams, 'autoRotate').onChange((value) => {
      controls.autoRotate = value;
    });
    
    visualizationFolder.add(cameraParams, 'autoRotateSpeed', 0.1, 5.0).onChange((value) => {
      controls.autoRotateSpeed = value;
    });
    
    visualizationFolder.add(cameraParams, 'resetCamera').name('Reset Camera');
    
    // Lighting controls
    const lightingFolder = visualizationFolder.addFolder('Lighting');
    
    lightingFolder.add(ambientLight, 'intensity', 0, 1, 0.1)
      .name('Ambient Light')
      .onChange(() => {}); // Auto-updates
      
    lightingFolder.add(directionalLight, 'intensity', 0, 2, 0.1)
      .name('Main Light')
      .onChange(() => {});
      
    lightingFolder.add(directionalLight.position, 'x', -100, 100, 5)
      .name('Light X')
      .onChange(() => {});
      
    lightingFolder.add(directionalLight.position, 'y', -100, 100, 5)
      .name('Light Y')
      .onChange(() => {});
      
    lightingFolder.add(directionalLight.position, 'z', -100, 100, 5)
      .name('Light Z')
      .onChange(() => {});
    
    visualizationFolder.open();
  }

  // Subscribe to config changes with improved handling
  config.addObserver(async (paramName, value, allParams, pendingUpdates) => {
    if (paramName === 'preset' || paramName === 'reset') {
      console.log(`🔄 Config change: ${paramName} = ${value}`);
      
      // Update all controllers first
      updateAllControllers();
      
      // Then update spiral
      try {
        await updateSpiral();
      } catch (error) {
        console.error('❌ Observer failed to update spiral:', error);
      }
    }
  });

  // Analysis display creation function
  function createAnalysisDisplay(results) {
    // Remove existing display
    const existingDisplay = document.getElementById('analysis-display');
    if (existingDisplay) {
      existingDisplay.remove();
    }

    // Create analysis overlay
    const analysisDiv = document.createElement('div');
    analysisDiv.id = 'analysis-display';
    analysisDiv.style.cssText = `
      position: fixed; top: 20px; right: 20px; width: 400px; max-height: 80vh;
      background: rgba(0,0,0,0.9); color: #00ff00; padding: 20px;
      border: 2px solid #00ff00; border-radius: 10px; font-family: monospace;
      font-size: 12px; line-height: 1.4; overflow-y: auto; z-index: 1000;
      box-shadow: 0 0 20px rgba(0,255,0,0.3);
    `;

    const content = `
      <h3 style="color: #00ffff; margin-top: 0;">🔬 MANIFOLD CONVERGENCE ANALYSIS</h3>
      
      <div style="color: #ffff00;">
        <strong>SYSTEM STATUS:</strong><br>
        • Harmonic Dimensions: ${results.harmonicVariances.length}<br>
        • Total Points: ${results.totalPoints}<br>
        • Spatial Convergence: ${(results.spatialConvergence * 100).toFixed(2)}%<br>
        • Convergence Rate: ${results.convergenceRate.toFixed(6)}<br>
      </div>

      <div style="margin-top: 15px; color: #ff8800;">
        <strong>DOMINANT FREQUENCIES:</strong><br>
        ${results.dominantHarmonics.slice(0, 5).map((h, i) => 
          `${i+1}. Prime ${h.prime}: RMS=${h.rms.toFixed(4)}`
        ).join('<br>')}
      </div>

      <div style="margin-top: 15px; color: #8888ff;">
        <strong>ENERGY DISTRIBUTION:</strong><br>
        ${results.harmonicVariances.slice(0, 8).map((h, i) => {
          const energy = (h.rms / results.harmonicVariances.reduce((s, h) => s + h.rms, 0) * 100);
          return `Prime ${h.prime}: ${energy.toFixed(1)}%`;
        }).join('<br>')}
      </div>

      <div style="margin-top: 15px; color: #ff88ff;">
        <strong>CONVERGENCE PATTERN:</strong><br>
        ${results.spatialConvergence < 0.1 ? 
          '✓ Strong convergence to quasi-continuum' : 
          results.spatialConvergence < 0.5 ? 
          '⚠ Moderate convergence detected' : 
          '✗ Manifold shows divergent behavior'
        }
      </div>

      <button onclick="this.parentElement.remove()" style="
        margin-top: 15px; padding: 8px 16px; background: #ff4444; color: white; 
        border: none; border-radius: 5px; cursor: pointer; font-family: monospace;
      ">CLOSE</button>
    `;

    analysisDiv.innerHTML = content;
    document.body.appendChild(analysisDiv);

    // Auto-close after 30 seconds
    setTimeout(() => {
      if (document.getElementById('analysis-display')) {
        analysisDiv.remove();
      }
    }, 30000);
  }
}
