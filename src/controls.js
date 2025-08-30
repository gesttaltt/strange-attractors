import * as THREE from 'three';
import * as dat from 'dat.gui';
import { generateSpiral } from './spiral.js';
import { projectSpiral } from './projection.js';
import { config, ConfigManager } from './config.js';

export function setupControls(spiral, controls, ambientLight, directionalLight, rimLight, modeManager){
  const gui = new dat.GUI();
  
  // Add preset selector
  const presetController = {
    preset: 'Default Cathedral'
  };
  
  const presetFolder = gui.addFolder('Presets');
  presetFolder.add(presetController, 'preset', Object.keys(ConfigManager.PRESETS))
    .onChange((presetName) => {
      try {
        config.loadPreset(presetName);
        updateAllControllers();
      } catch (error) {
        console.error('Failed to load preset:', error);
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

  const updateSpiral = () => {
    try {
      loadingDiv.style.display = 'block';
      
      setTimeout(() => {
        try {
          const currentParams = config.getAllParams();
          const points = generateSpiral(currentParams, currentParams.steps, currentParams.dt);
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
          }
        } catch (error) {
          console.error('Failed to update spiral:', error);
          alert('Failed to generate spiral. Please check your parameters.');
        } finally {
          loadingDiv.style.display = 'none';
        }
      }, 50);
    } catch (error) {
      console.error('Update spiral error:', error);
      loadingDiv.style.display = 'none';
    }
  };

  const updateAllControllers = () => {
    const currentParams = config.getAllParams();
    Object.keys(controllers).forEach(key => {
      controllers[key].setValue(currentParams[key]);
    });
  };

  // Add parameter controllers with validation
  Object.entries(ConfigManager.PARAM_RANGES).forEach(([key, range]) => {
    if (key === 'steps' || key === 'dt') return; // Skip these for now
    
    controllers[key] = gui.add(params, key, range.min, range.max, range.step)
      .onChange((value) => {
        try {
          config.setParam(key, value);
          updateSpiral();
        } catch (error) {
          console.error(`Invalid ${key}:`, error);
        }
      });
  });

  // Advanced settings folder
  const advancedFolder = gui.addFolder('Advanced Settings');
  controllers.steps = advancedFolder.add(params, 'steps', 1000, 50000, 1000).onChange((value) => {
    try {
      config.setParam('steps', value);
      updateSpiral();
    } catch (error) {
      console.error('Invalid steps:', error);
    }
  });
  
  controllers.dt = advancedFolder.add(params, 'dt', 0.001, 0.1, 0.001).onChange((value) => {
    try {
      config.setParam('dt', value);
      updateSpiral();
    } catch (error) {
      console.error('Invalid dt:', error);
    }
  });

  // Reset button
  const resetController = { reset: () => {
    config.reset();
    updateAllControllers();
    updateSpiral();
  }};
  gui.add(resetController, 'reset');

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
        .onChange((mode) => {
          try {
            const currentParams = config.getAllParams();
            const points = generateSpiral(currentParams, currentParams.steps, currentParams.dt);
            const {X,Y,Z,color,size,opacity} = projectSpiral(points);
            
            const colors = [];
            for (let i=0; i<X.length; i++){
              colors.push((color[i][0]%1+1)%1, (color[i][1]%1+1)%1, (color[i][2]%1+1)%1);
            }
            
            const newSpiral = modeManager.switchMode(mode, X, Y, Z, colors, size, opacity);
            // Update the spiral reference for other functions
            Object.assign(spiral, newSpiral);
            spiral.userData = newSpiral.userData;
          } catch (error) {
            console.error('Failed to switch visualization mode:', error);
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

  // Subscribe to config changes
  config.addObserver((paramName, value) => {
    if (paramName === 'preset' || paramName === 'reset') {
      updateSpiral();
    }
  });
}
