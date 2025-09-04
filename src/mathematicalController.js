// Mathematical Controller - Pure business logic for mathematical operations
// Handles all mathematical computation without GUI concerns

import { generateSpiral } from './spiral.js';
import { projectSpiral } from './projection.js';
import { analyzeManifoldConvergence } from './analysis.js';

export class MathematicalController {
  constructor(config, scene) {
    this.config = config;
    this.scene = scene;
  }

  // Pure mathematical operation - no GUI concerns
  regenerateSpiral() {
    try {
      const currentParams = this.config.getAllParams();
      const points = generateSpiral(currentParams, currentParams.steps, currentParams.dt);
      const {X, Y, Z, color, size, opacity} = projectSpiral(points);
      
      return { X, Y, Z, color, size, opacity, points };
    } catch (error) {
      console.error('Mathematical computation failed:', error);
      return null;
    }
  }

  // Pure mathematical operation - update visualization with harmonic data
  updateVisualization(visualData) {
    try {
      if (!visualData || !this.scene.modeManager) return false;

      const { X, Y, Z, color, size, opacity, points } = visualData;
      const colors = [];
      for (let i = 0; i < X.length; i++) {
        colors.push((color[i][0] % 1 + 1) % 1, (color[i][1] % 1 + 1) % 1, (color[i][2] % 1 + 1) % 1);
      }
      
      // Extract harmonic data for beautiful visualization
      const harmonicData = points ? points.map(point => point.slice(6)) : null;
      
      const newSpiral = this.scene.modeManager.updateGeometry(X, Y, Z, colors, size, opacity, harmonicData);
      Object.assign(this.scene.spiral, newSpiral);
      this.scene.spiral.userData = newSpiral.userData;
      
      return true;
    } catch (error) {
      console.error('Visualization update failed:', error);
      return false;
    }
  }

  // Combined operation - regenerate and update
  updateSpiralVisualization() {
    const visualData = this.regenerateSpiral();
    if (visualData) {
      const success = this.updateVisualization(visualData);
      if (success) {
        console.log('Spiral updated successfully');
      }
    }
  }

  // Pure mathematical operation - change visualization mode
  changeVisualizationMode(mode) {
    try {
      const visualData = this.regenerateSpiral();
      if (!visualData || !this.scene.modeManager) return false;

      const { X, Y, Z, color, size, opacity, points } = visualData;
      const colors = [];
      for (let i = 0; i < X.length; i++) {
        colors.push((color[i][0] % 1 + 1) % 1, (color[i][1] % 1 + 1) % 1, (color[i][2] % 1 + 1) % 1);
      }
      
      // Extract harmonic data for beautiful visualization
      const harmonicData = points ? points.map(point => point.slice(6)) : null;
      
      this.scene.modeManager.switchMode(mode, X, Y, Z, colors, size, opacity, harmonicData);
      return true;
    } catch (error) {
      console.error('Visualization mode change failed:', error);
      return false;
    }
  }

  // Pure mathematical operation - run analysis
  runMathematicalAnalysis() {
    try {
      const results = analyzeManifoldConvergence(this.config.getAllParams());
      console.log('Mathematical Analysis Results:', results);
      return results;
    } catch (error) {
      console.error('Analysis failed:', error);
      return null;
    }
  }

  // Pure data operation - export mathematical data
  exportMathematicalData() {
    try {
      const data = {
        parameters: this.config.getAllParams(),
        timestamp: new Date().toISOString(),
        version: 'Silent Spiral v3.0 Clean Foundation'
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `silent-spiral-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      console.log('Data exported successfully');
      return true;
    } catch (error) {
      console.error('Export failed:', error);
      return false;
    }
  }
}