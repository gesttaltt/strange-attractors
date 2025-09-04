// Clean GUI - Pure presentation layer with proper SOLID architecture
// Single responsibility: GUI presentation only, no business logic

import * as dat from 'dat.gui';

export class CleanGUI {
  constructor(mathematicalController) {
    this.mathController = mathematicalController;
    this.gui = null;
    this.isVisible = true;
    this.controllers = new Map();
    
    this.loadStyles();
    this.createGUI();
  }

  loadStyles() {
    // Load modular CSS for clean separation
    if (!document.querySelector('link[href*="styles/index.css"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = '/src/styles/index.css';
      document.head.appendChild(link);
    }
  }

  createGUI() {
    this.gui = new dat.GUI();
    this.gui.domElement.className = 'simple-gui';

    this.addCloseButton();
    this.setupParameterControls();
    this.setupPresetControls();
    this.setupAnalysisControls();
    this.setupVisualizationControls();
  }

  addCloseButton() {
    const closeButton = document.createElement('button');
    closeButton.textContent = '×';
    closeButton.className = 'gui-close-button';
    closeButton.onclick = () => this.toggle();
    this.gui.domElement.appendChild(closeButton);
  }

  setupParameterControls() {
    const mathFolder = this.gui.addFolder('Mathematical Parameters');
    const params = this.mathController.config.getAllParams();
    
    // Define parameter configurations
    const parameterConfigs = [
      { name: 'alpha', min: 0.01, max: 0.5, step: 0.01 },
      { name: 'beta', min: 0.01, max: 0.5, step: 0.01 },
      { name: 'gamma', min: 0.01, max: 0.5, step: 0.01 },
      { name: 'omega', min: 0.1, max: 5.0, step: 0.1 },
      { name: 'eta', min: 0, max: 1.0, step: 0.01 },
      { name: 'theta', min: 0, max: Math.PI * 2, step: 0.01 },
      { name: 'delta', min: 0.01, max: 0.2, step: 0.01 }
    ];

    // Create parameter controls with clean delegation
    parameterConfigs.forEach(config => {
      const controller = mathFolder.add(params, config.name, config.min, config.max, config.step)
        .onChange((value) => this.handleParameterChange(config.name, value));
      
      this.controllers.set(config.name, controller);
    });
    
    mathFolder.open();
  }

  setupPresetControls() {
    const presetFolder = this.gui.addFolder('Presets');
    const presetController = { preset: 'Default Cathedral' };
    
    presetFolder.add(presetController, 'preset', [
      'Default Cathedral', 'Harmonic Resonance', 'Chaotic Spiral',
      'Gentle Waves', 'Mathematical Beauty'
    ]).onChange((presetName) => this.handlePresetChange(presetName));
    
    presetFolder.open();
  }

  setupAnalysisControls() {
    const analysisFolder = this.gui.addFolder('Analysis Tools');
    
    const analysisController = {
      runAnalysis: () => this.handleAnalysisRequest(),
      exportData: () => this.handleDataExport()
    };

    analysisFolder.add(analysisController, 'runAnalysis').name('Run Analysis');
    analysisFolder.add(analysisController, 'exportData').name('Export Data');
  }

  setupVisualizationControls() {
    const vizFolder = this.gui.addFolder('Visualization');
    const vizController = { mode: 'line' };
    
    vizFolder.add(vizController, 'mode', ['points', 'line'])
      .name('Render Mode')
      .onChange((mode) => this.handleVisualizationChange(mode));
  }

  // Clean event handlers - delegate to controller
  handleParameterChange(paramName, value) {
    try {
      this.mathController.config.setParam(paramName, value);
      this.mathController.updateSpiralVisualization();
    } catch (error) {
      console.error(`Parameter change failed: ${paramName}`, error);
    }
  }

  handlePresetChange(presetName) {
    try {
      this.mathController.config.loadPreset(presetName);
      this.updateAllControllers();
      this.mathController.updateSpiralVisualization();
    } catch (error) {
      console.error('Preset change failed:', error);
    }
  }

  handleAnalysisRequest() {
    this.mathController.runMathematicalAnalysis();
  }

  handleDataExport() {
    this.mathController.exportMathematicalData();
  }

  handleVisualizationChange(mode) {
    this.mathController.changeVisualizationMode(mode);
  }

  // Pure presentation methods
  updateAllControllers() {
    const currentParams = this.mathController.config.getAllParams();
    this.controllers.forEach((controller, paramName) => {
      if (currentParams[paramName] !== undefined) {
        controller.setValue(currentParams[paramName]);
      }
    });
  }

  show() {
    if (this.gui && this.gui.domElement) {
      this.gui.domElement.style.display = 'block';
      this.isVisible = true;
    }
  }

  hide() {
    if (this.gui && this.gui.domElement) {
      this.gui.domElement.style.display = 'none';
      this.isVisible = false;
    }
  }

  toggle() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  destroy() {
    if (this.gui) {
      this.gui.destroy();
      this.gui = null;
    }
    
    // Remove CSS link if added
    const cssLink = document.querySelector('link[href*="gui.css"]');
    if (cssLink) {
      cssLink.remove();
    }
  }
}

// Global access for console control
if (typeof window !== 'undefined') {
  window.CleanGUI = CleanGUI;
}