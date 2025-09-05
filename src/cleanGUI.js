// Clean GUI - Pure presentation layer with proper SOLID architecture
// Single responsibility: GUI presentation only, no business logic

import * as dat from 'dat.gui';
import { NASAVisualizationModes } from './nasaVisualizationModes.js';

export class CleanGUI {
  constructor(mathematicalController) {
    this.mathController = mathematicalController;
    this.gui = null;
    this.isVisible = true;
    this.controllers = new Map();
    this.nasaVizModes = null;
    
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

    // Initialize NASA visualization modes
    this.initializeNASAModes();

    this.addCloseButton();
    this.setupParameterControls();
    this.setupPresetControls();
    this.setupAnalysisControls();
    this.setupVisualizationControls();
    this.setupNASAControls();
  }

  initializeNASAModes() {
    // Initialize NASA visualization modes with scene access
    if (window.scene && window.scene.scene) {
      this.nasaVizModes = new NASAVisualizationModes(
        window.scene.scene, 
        window.scene.modeManager
      );
    }
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

  setupNASAControls() {
    const nasaFolder = this.gui.addFolder('NASA Data Visualization');
    
    const nasaController = {
      serverUrl: 'http://localhost:3000',
      dataSource: 'apod',
      // APOD controls
      apodDate: '',
      // Mars rover controls  
      marsRover: 'curiosity',
      marsSol: '',
      // Asteroid controls
      asteroidStartDate: '',
      asteroidEndDate: '',
      // Actions
      connectToServer: () => this.handleNASAConnect(),
      fetchAndVisualize: () => this.handleNASAFetchAndVisualize(),
      clearVisualization: () => this.handleNASAClear()
    };

    // Server connection
    const connectionFolder = nasaFolder.addFolder('Connection');
    connectionFolder.add(nasaController, 'serverUrl').name('MCP Server URL');
    connectionFolder.add(nasaController, 'connectToServer').name('Connect to NASA Server');

    // Data source selection
    nasaFolder.add(nasaController, 'dataSource', ['apod', 'mars', 'asteroids', 'spaceWeather'])
      .name('Data Source')
      .onChange((source) => this.handleNASADataSourceChange(source));

    // APOD controls
    const apodFolder = nasaFolder.addFolder('APOD Settings');
    apodFolder.add(nasaController, 'apodDate').name('Date (YYYY-MM-DD)');

    // Mars rover controls
    const marsFolder = nasaFolder.addFolder('Mars Rover Settings');
    marsFolder.add(nasaController, 'marsRover', ['curiosity', 'opportunity', 'spirit']).name('Rover');
    marsFolder.add(nasaController, 'marsSol').name('Sol (Mars Day)');

    // Asteroid controls
    const asteroidFolder = nasaFolder.addFolder('Asteroid Settings');
    asteroidFolder.add(nasaController, 'asteroidStartDate').name('Start Date');
    asteroidFolder.add(nasaController, 'asteroidEndDate').name('End Date');

    // Action buttons
    nasaFolder.add(nasaController, 'fetchAndVisualize').name('Fetch & Visualize NASA Data');
    nasaFolder.add(nasaController, 'clearVisualization').name('Clear NASA Visualization');

    // Store controller reference for access in handlers
    this.nasaController = nasaController;
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

  // NASA-specific event handlers
  async handleNASAConnect() {
    if (!this.nasaVizModes) {
      console.error('NASA visualization modes not initialized');
      return;
    }

    try {
      const serverUrl = this.nasaController.serverUrl;
      console.log(`Connecting to NASA MCP server at ${serverUrl}...`);
      
      // Test connection by attempting to fetch APOD data
      const response = await fetch(`${serverUrl}/nasa/apod`);
      if (response.ok) {
        console.log('✅ Successfully connected to NASA MCP server');
        alert('Successfully connected to NASA MCP server!');
      } else {
        throw new Error('Server responded with error');
      }
    } catch (error) {
      console.error('Failed to connect to NASA MCP server:', error);
      alert('Failed to connect to NASA MCP server. Please check the URL and ensure the server is running.');
    }
  }

  async handleNASAFetchAndVisualize() {
    if (!this.nasaVizModes) {
      console.error('NASA visualization modes not initialized');
      return;
    }

    try {
      const { dataSource } = this.nasaController;
      console.log(`Fetching and visualizing NASA ${dataSource} data...`);

      let visualization = null;

      switch (dataSource) {
        case 'apod':
          const apodDate = this.nasaController.apodDate || null;
          visualization = await this.nasaVizModes.switchToNASAMode('apod', apodDate);
          break;
          
        case 'mars':
          const { marsRover, marsSol } = this.nasaController;
          const sol = marsSol ? parseInt(marsSol) : null;
          visualization = await this.nasaVizModes.switchToNASAMode('mars', sol, marsRover);
          break;
          
        case 'asteroids':
          const { asteroidStartDate, asteroidEndDate } = this.nasaController;
          visualization = await this.nasaVizModes.switchToNASAMode('asteroids', asteroidStartDate, asteroidEndDate);
          break;
          
        case 'spaceWeather':
          visualization = await this.nasaVizModes.switchToNASAMode('spaceWeather');
          break;
          
        default:
          console.warn('Unknown NASA data source:', dataSource);
          return;
      }

      if (visualization) {
        console.log(`✅ NASA ${dataSource} visualization created successfully`);
        alert(`NASA ${dataSource.toUpperCase()} data visualization created!`);
      } else {
        throw new Error('Failed to create visualization');
      }
      
    } catch (error) {
      console.error('Failed to fetch and visualize NASA data:', error);
      alert(`Failed to visualize NASA data: ${error.message}`);
    }
  }

  handleNASAClear() {
    if (this.nasaVizModes) {
      this.nasaVizModes.dispose();
      console.log('NASA visualization cleared');
      alert('NASA visualization cleared!');
    }
  }

  handleNASADataSourceChange(source) {
    console.log(`NASA data source changed to: ${source}`);
    // Could add source-specific UI updates here if needed
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
    // Clean up NASA visualization modes
    if (this.nasaVizModes) {
      this.nasaVizModes.dispose();
      this.nasaVizModes = null;
    }
    
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