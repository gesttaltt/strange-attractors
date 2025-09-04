import * as THREE from 'three';
import { MathematicalColors } from './visualization/mathematicalColors.js';
import { MathematicalShaderMaterials } from './visualization/shaderMaterials.js';

export class VisualizationModeManager {
  constructor(scene, spiral) {
    this.scene = scene;
    this.currentSpiral = spiral;
    this.currentMode = 'line';
    this.lastData = null;
    this.harmonicCount = 0;
    this.performanceMetrics = {
      lastRenderTime: 0,
      frameCount: 0,
      harmonicDimensions: 0
    };
    
    // Initialize mathematical visualization systems
    this.mathColors = new MathematicalColors();
    this.shaderMaterials = new MathematicalShaderMaterials();
    this.harmonicTexture = null;
    this.clock = new THREE.Clock();
  }

  createPointCloud(X, Y, Z, colors, harmonicData = null) {
    const positions = [];
    const colorArray = [];
    const harmonicValues = [];
    const harmonicIndices = [];
    
    for (let i = 0; i < X.length; i++) {
      positions.push(X[i], Y[i], Z[i]);
      colorArray.push(colors[3*i], colors[3*i+1], colors[3*i+2]);
      
      // Extract harmonic data for shader
      if (harmonicData && harmonicData[i]) {
        const dominantHarmonic = this.findDominantHarmonic(harmonicData[i]);
        harmonicValues.push(harmonicData[i][dominantHarmonic] || 0);
        harmonicIndices.push(dominantHarmonic);
      } else {
        harmonicValues.push(0);
        harmonicIndices.push(0);
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colorArray, 3));
    geometry.setAttribute('harmonicValue', new THREE.Float32BufferAttribute(harmonicValues, 1));
    geometry.setAttribute('harmonicIndex', new THREE.Float32BufferAttribute(harmonicIndices, 1));

    // Use beautiful shader material instead of basic PointsMaterial
    const material = this.shaderMaterials.createHarmonicPointMaterial(this.harmonicTexture);

    return new THREE.Points(geometry, material);
  }
  
  findDominantHarmonic(harmonics) {
    if (!harmonics || harmonics.length === 0) return 0;
    
    let maxAmplitude = 0;
    let dominantIndex = 0;
    
    for (let i = 0; i < harmonics.length; i++) {
      const amplitude = Math.abs(harmonics[i]);
      if (amplitude > maxAmplitude) {
        maxAmplitude = amplitude;
        dominantIndex = i;
      }
    }
    
    return dominantIndex;
  }

  createConnectedLine(X, Y, Z, colors, harmonicData = null) {
    const positions = [];
    const harmonicColors = [];
    
    for (let i = 0; i < X.length; i++) {
      positions.push(X[i], Y[i], Z[i]);
      
      // Enhanced harmonic color mapping
      if (harmonicData && harmonicData[i]) {
        const harmonicColor = this.mathColors.getHarmonicColor(
          harmonicData[i][0] || 0,
          i,
          0
        );
        harmonicColors.push(harmonicColor.r, harmonicColor.g, harmonicColor.b);
      } else {
        harmonicColors.push(colors[3*i], colors[3*i+1], colors[3*i+2]);
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('harmonicColor', new THREE.Float32BufferAttribute(harmonicColors, 3));

    // Use beautiful shader material for enhanced line visualization
    const material = this.shaderMaterials.createHarmonicLineMaterial();

    return new THREE.Line(geometry, material);
  }

  createTubeGeometry(X, Y, Z, colors, size) {
    try {
      // Create points for curve
      const points = [];
      for (let i = 0; i < X.length; i++) {
        points.push(new THREE.Vector3(X[i], Y[i], Z[i]));
      }

      // Create smooth curve through points
      const curve = new THREE.CatmullRomCurve3(points);
      
      // Average tube radius from size parameter
      const avgRadius = size ? size.reduce((a, b) => a + b, 0) / size.length * 0.5 : 1.0;
      
      // Create tube geometry
      const geometry = new THREE.TubeGeometry(
        curve,
        Math.min(X.length - 1, 200), // Tube segments (limited for performance)
        Math.max(0.5, avgRadius),     // Tube radius
        8,                            // Radial segments
        false                         // Not closed
      );

      // Apply colors to tube faces
      const faceColors = [];
      const faceCount = geometry.index.count / 3;
      for (let i = 0; i < faceCount; i++) {
        const colorIndex = Math.floor((i / faceCount) * colors.length / 3);
        faceColors.push(
          colors[colorIndex * 3],
          colors[colorIndex * 3 + 1], 
          colors[colorIndex * 3 + 2]
        );
      }

      // Use beautiful shader material for enhanced tube visualization
      const material = this.shaderMaterials.createHarmonicTubeMaterial();

      return new THREE.Mesh(geometry, material);
    } catch (error) {
      console.warn('Tube geometry failed, falling back to line:', error);
      return this.createConnectedLine(X, Y, Z, colors);
    }
  }

  switchMode(mode, X, Y, Z, colors, size, opacity, harmonicData = null) {
    const startTime = performance.now();
    
    // Remove current visualization with proper cleanup
    if (this.currentSpiral) {
      this.scene.remove(this.currentSpiral);
      this.currentSpiral.geometry?.dispose();
      this.currentSpiral.material?.dispose();
    }

    // Update harmonic count for performance optimization
    this.harmonicCount = harmonicData ? harmonicData.length : (X.length > 0 ? X[0].length - 6 : 0);
    this.performanceMetrics.harmonicDimensions = this.harmonicCount;

    // Create new visualization based on mode
    let newSpiral;
    switch (mode) {
      case 'points':
        newSpiral = this.createPointCloud(X, Y, Z, colors, harmonicData);
        break;
      case 'line':
      default:
        newSpiral = this.createConnectedLine(X, Y, Z, colors, harmonicData);
        mode = 'line';
    }

    // Store extended data for future updates
    newSpiral.userData = { 
      X, Y, Z, size, opacity, 
      geometry: newSpiral.geometry,
      harmonicCount: this.harmonicCount,
      harmonicData: harmonicData
    };
    
    // Add to scene
    this.scene.add(newSpiral);
    this.currentSpiral = newSpiral;
    this.currentMode = mode;
    
    // Performance metrics
    const renderTime = performance.now() - startTime;
    this.performanceMetrics.lastRenderTime = renderTime;
    this.performanceMetrics.frameCount++;
    
    if (renderTime > 100 || this.harmonicCount > 100) {
      console.log(`🎨 Visualization updated: ${mode} mode, ${this.harmonicCount} harmonics, ${renderTime.toFixed(2)}ms`);
    }
    
    return newSpiral;
  }

  createOptimizedTube(X, Y, Z, colors, size) {
    // Optimized tube for high harmonic counts - subsample for performance
    const subsampleRate = Math.max(1, Math.floor(X.length / 1000));
    const subsampledX = X.filter((_, i) => i % subsampleRate === 0);
    const subsampledY = Y.filter((_, i) => i % subsampleRate === 0);
    const subsampledZ = Z.filter((_, i) => i % subsampleRate === 0);
    const subsampledColors = colors.filter((_, i) => Math.floor(i/3) % subsampleRate === 0);
    const subsampledSize = size ? size.filter((_, i) => i % subsampleRate === 0) : null;
    
    console.log(`🔧 Subsampling: ${X.length} → ${subsampledX.length} points for tube rendering`);
    
    return this.createTubeGeometry(subsampledX, subsampledY, subsampledZ, subsampledColors, subsampledSize);
  }

  getCurrentMode() {
    return this.currentMode;
  }

  updateGeometry(X, Y, Z, colors, size, opacity, harmonicData = null) {
    // Update the current visualization with new data and harmonic information
    return this.switchMode(this.currentMode, X, Y, Z, colors, size, opacity, harmonicData);
  }

  // Update shader materials with time for animation
  updateShaderAnimation() {
    const deltaTime = this.clock.getDelta();
    this.shaderMaterials.updateMaterials(deltaTime);
  }

  // Clean up resources
  destroy() {
    if (this.shaderMaterials) {
      this.shaderMaterials.dispose();
    }
    if (this.harmonicTexture) {
      this.harmonicTexture.dispose();
    }
  }
}