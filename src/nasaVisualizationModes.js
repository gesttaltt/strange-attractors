// NASA Data Visualization Modes - Extends Silent Spiral with NASA data visualizations
// Integrates with existing VisualizationModeManager

import * as THREE from 'three';
import { nasaDataService } from './nasaDataService.js';
import { MathematicalColors } from './visualization/mathematicalColors.js';

export class NASAVisualizationModes {
  constructor(scene, modeManager) {
    this.scene = scene;
    this.modeManager = modeManager;
    this.mathColors = new MathematicalColors();
    this.currentNASAVisualization = null;
    this.nasaDataCache = new Map();
    this.animationClock = new THREE.Clock();
    
    // NASA-specific materials and textures
    this.nasaMaterials = {
      apod: null,
      mars: null,
      asteroid: null,
      spaceWeather: null
    };
    
    this.initializeNASAMaterials();
  }

  initializeNASAMaterials() {
    // APOD visualization material - cosmic colors
    this.nasaMaterials.apod = new THREE.PointsMaterial({
      size: 6.0,
      transparent: true,
      opacity: 0.8,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    });

    // Mars rover data material - red planet theme
    this.nasaMaterials.mars = new THREE.PointsMaterial({
      size: 4.0,
      transparent: true,
      opacity: 0.9,
      color: 0xff6b47,
      vertexColors: true,
      sizeAttenuation: true
    });

    // Asteroid visualization material - metallic appearance
    this.nasaMaterials.asteroid = new THREE.PointsMaterial({
      size: 8.0,
      transparent: true,
      opacity: 0.7,
      color: 0xcccccc,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    });

    // Space weather material - aurora-like colors
    this.nasaMaterials.spaceWeather = new THREE.PointsMaterial({
      size: 5.0,
      transparent: true,
      opacity: 0.85,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    });
  }

  async createAPODVisualization(date = null) {
    try {
      const apodData = await nasaDataService.fetchAPOD(date);
      const coordinates = nasaDataService.transformAPODToCoordinates(apodData);
      
      if (coordinates.length === 0) {
        console.warn('No APOD data to visualize');
        return null;
      }

      const visualization = this.createCosmicPointCloud(coordinates, 'apod', {
        title: apodData.title,
        date: apodData.date,
        explanation: apodData.explanation
      });

      this.nasaDataCache.set('apod', { data: apodData, visualization, timestamp: Date.now() });
      return visualization;
      
    } catch (error) {
      console.error('Failed to create APOD visualization:', error);
      return null;
    }
  }

  async createMarsRoverVisualization(sol = null, rover = 'curiosity') {
    try {
      const marsData = await nasaDataService.fetchMarsRoverPhotos(sol, rover);
      const coordinates = nasaDataService.transformMarsPhotosToCoordinates(marsData);
      
      if (coordinates.length === 0) {
        console.warn('No Mars rover data to visualize');
        return null;
      }

      const visualization = this.createMarsianPointCloud(coordinates, {
        rover: rover,
        sol: sol,
        photoCount: marsData.photos?.length || 0
      });

      this.nasaDataCache.set('mars', { data: marsData, visualization, timestamp: Date.now() });
      return visualization;
      
    } catch (error) {
      console.error('Failed to create Mars rover visualization:', error);
      return null;
    }
  }

  async createAsteroidVisualization(startDate = null, endDate = null) {
    try {
      const neoData = await nasaDataService.fetchNearEarthObjects(startDate, endDate);
      const coordinates = nasaDataService.transformNEOToCoordinates(neoData);
      
      if (coordinates.length === 0) {
        console.warn('No asteroid data to visualize');
        return null;
      }

      const visualization = this.createAsteroidPointCloud(coordinates, {
        dateRange: [startDate, endDate],
        asteroidCount: coordinates.length
      });

      this.nasaDataCache.set('asteroids', { data: neoData, visualization, timestamp: Date.now() });
      return visualization;
      
    } catch (error) {
      console.error('Failed to create asteroid visualization:', error);
      return null;
    }
  }

  createCosmicPointCloud(coordinates, type, metadata) {
    const positions = [];
    const colors = [];
    const sizes = [];

    coordinates.forEach((coord, index) => {
      // Extract 3D position from 12D coordinates
      positions.push(coord[0], coord[1], coord[2]);
      
      // Generate cosmic colors based on harmonic components
      const harmonicIntensity = Math.sqrt(
        coord[3] * coord[3] + coord[4] * coord[4] + coord[5] * coord[5]
      );
      
      const cosmicColor = this.getCosmicColor(harmonicIntensity, index, metadata.title);
      colors.push(cosmicColor.r, cosmicColor.g, cosmicColor.b);
      
      // Size based on dimensional complexity
      const dimensionalComplexity = Math.sqrt(
        coord.slice(6).reduce((sum, val) => sum + val * val, 0)
      );
      sizes.push(Math.max(2, Math.min(12, dimensionalComplexity + 4)));
    });

    return this.createNASAPointCloud(positions, colors, sizes, this.nasaMaterials.apod, metadata);
  }

  createMarsianPointCloud(coordinates, metadata) {
    const positions = [];
    const colors = [];
    const sizes = [];

    coordinates.forEach((coord, index) => {
      positions.push(coord[0], coord[1], coord[2]);
      
      // Mars-themed colors with red base
      const marsColor = this.getMarsColor(coord, index);
      colors.push(marsColor.r, marsColor.g, marsColor.b);
      
      // Size based on sol (Mars day) and camera data
      const solFactor = Math.abs(coord[6]) / 10;
      sizes.push(Math.max(2, Math.min(10, solFactor + 3)));
    });

    return this.createNASAPointCloud(positions, colors, sizes, this.nasaMaterials.mars, metadata);
  }

  createAsteroidPointCloud(coordinates, metadata) {
    const positions = [];
    const colors = [];
    const sizes = [];

    coordinates.forEach((coord, index) => {
      positions.push(coord[0], coord[1], coord[2]);
      
      // Asteroid colors based on velocity and distance
      const asteroidColor = this.getAsteroidColor(coord, index);
      colors.push(asteroidColor.r, asteroidColor.g, asteroidColor.b);
      
      // Size based on estimated diameter and velocity
      const velocity = Math.abs(coord[2]);
      const diameter = Math.sqrt(coord[3] * coord[3] + coord[4] * coord[4]);
      sizes.push(Math.max(3, Math.min(15, velocity + diameter + 2)));
    });

    return this.createNASAPointCloud(positions, colors, sizes, this.nasaMaterials.asteroid, metadata);
  }

  createNASAPointCloud(positions, colors, sizes, material, metadata) {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

    // Custom shader material for NASA visualization
    const nasaMaterial = material.clone();
    nasaMaterial.uniforms = {
      time: { value: 0.0 },
      pointScale: { value: window.innerHeight / 2.0 }
    };

    // Add shader animation support
    const pointCloud = new THREE.Points(geometry, nasaMaterial);
    pointCloud.userData = {
      type: 'nasa',
      metadata: metadata,
      animationData: {
        startTime: Date.now(),
        rotationSpeed: 0.001,
        pulseSpeed: 0.002
      }
    };

    return pointCloud;
  }

  getCosmicColor(intensity, index, title) {
    // Generate colors based on title hash and harmonic intensity
    const titleHash = title ? this.hashString(title) : 0;
    const baseHue = (titleHash + index * 0.1) % 1.0;
    const saturation = Math.min(1.0, 0.5 + intensity * 0.5);
    const lightness = Math.min(1.0, 0.3 + intensity * 0.7);

    return this.hslToRgb(baseHue, saturation, lightness);
  }

  getMarsColor(coord, index) {
    // Mars-themed color palette
    const redBase = 0.8 + Math.sin(index * 0.1) * 0.2;
    const greenBase = 0.3 + Math.abs(coord[3]) * 0.1;
    const blueBase = 0.1 + Math.abs(coord[4]) * 0.05;

    return {
      r: Math.min(1.0, redBase),
      g: Math.min(1.0, greenBase),
      b: Math.min(1.0, blueBase)
    };
  }

  getAsteroidColor(coord, index) {
    // Asteroid colors based on velocity and distance
    const velocity = Math.abs(coord[2]);
    const distance = Math.sqrt(coord[0] * coord[0] + coord[1] * coord[1]);
    
    const hue = (velocity / 50) % 1.0;
    const saturation = Math.min(1.0, distance / 100);
    const lightness = 0.4 + (velocity / 100);

    return this.hslToRgb(hue, saturation, lightness);
  }

  hslToRgb(h, s, l) {
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h * 6) % 2 - 1));
    const m = l - c / 2;

    let r, g, b;
    if (h < 1/6) { r = c; g = x; b = 0; }
    else if (h < 2/6) { r = x; g = c; b = 0; }
    else if (h < 3/6) { r = 0; g = c; b = x; }
    else if (h < 4/6) { r = 0; g = x; b = c; }
    else if (h < 5/6) { r = x; g = 0; b = c; }
    else { r = c; g = 0; b = x; }

    return {
      r: r + m,
      g: g + m,
      b: b + m
    };
  }

  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash) / 2147483647; // Normalize to [0, 1]
  }

  async switchToNASAMode(nasaType, ...params) {
    // Remove current NASA visualization
    if (this.currentNASAVisualization) {
      this.scene.remove(this.currentNASAVisualization);
      this.currentNASAVisualization.geometry?.dispose();
      this.currentNASAVisualization.material?.dispose();
    }

    let visualization = null;

    switch (nasaType) {
      case 'apod':
        visualization = await this.createAPODVisualization(params[0]);
        break;
      case 'mars':
        visualization = await this.createMarsRoverVisualization(params[0], params[1]);
        break;
      case 'asteroids':
        visualization = await this.createAsteroidVisualization(params[0], params[1]);
        break;
      default:
        console.warn('Unknown NASA visualization type:', nasaType);
        return null;
    }

    if (visualization) {
      this.scene.add(visualization);
      this.currentNASAVisualization = visualization;
      console.log(`NASA ${nasaType} visualization created with ${visualization.geometry.attributes.position.count} points`);
    }

    return visualization;
  }

  updateNASAAnimation() {
    if (!this.currentNASAVisualization) return;

    const elapsedTime = this.animationClock.getElapsedTime();
    const animData = this.currentNASAVisualization.userData.animationData;

    // Update material uniforms for shader animation
    if (this.currentNASAVisualization.material.uniforms) {
      this.currentNASAVisualization.material.uniforms.time.value = elapsedTime;
    }

    // Gentle rotation animation
    this.currentNASAVisualization.rotation.y += animData.rotationSpeed;
    this.currentNASAVisualization.rotation.x += animData.rotationSpeed * 0.3;

    // Subtle scale pulsing
    const pulseScale = 1.0 + Math.sin(elapsedTime * animData.pulseSpeed) * 0.05;
    this.currentNASAVisualization.scale.setScalar(pulseScale);
  }

  getCachedNASAData(type) {
    return this.nasaDataCache.get(type);
  }

  clearNASACache() {
    this.nasaDataCache.clear();
  }

  dispose() {
    if (this.currentNASAVisualization) {
      this.scene.remove(this.currentNASAVisualization);
      this.currentNASAVisualization.geometry?.dispose();
      this.currentNASAVisualization.material?.dispose();
    }

    Object.values(this.nasaMaterials).forEach(material => {
      if (material) material.dispose();
    });

    this.clearNASACache();
  }
}