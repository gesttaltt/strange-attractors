// Mathematical Color System - Beautiful harmonic color mapping
// Pure color computation for mathematical visualization

import * as THREE from 'three';

export class MathematicalColors {
  constructor() {
    this.goldenAngle = 137.5; // Golden angle for optimal color distribution
    this.colorPalettes = this.createMathematicalPalettes();
  }

  createMathematicalPalettes() {
    return {
      deepSpace: {
        background: new THREE.Color('#0a0a1a'),
        harmonicGold: new THREE.Color('#ffd700'),
        resonanceCyan: new THREE.Color('#00ffff'),
        phaseViolet: new THREE.Color('#8a2be2'),
        convergencePink: new THREE.Color('#ff1493'),
        stabilityBlue: new THREE.Color('#4169e1')
      },
      
      primeSpectrum: {
        low: new THREE.Color('#ff6b35'),      // Orange for low primes
        mid: new THREE.Color('#f7931e'),      // Gold for mid primes  
        high: new THREE.Color('#00d4ff'),     // Cyan for high primes
        ultra: new THREE.Color('#b19cd9')     // Purple for ultra high primes
      }
    };
  }

  // Generate harmonic color based on mathematical properties
  getHarmonicColor(harmonicValue, harmonicIndex, primeValue) {
    // Use golden angle for optimal color distribution
    const hue = (harmonicIndex * this.goldenAngle) % 360;
    
    // Map harmonic amplitude to saturation
    const saturation = Math.min(0.9, 0.3 + Math.abs(harmonicValue) * 0.6);
    
    // Map harmonic energy to lightness
    const lightness = Math.min(0.8, 0.2 + Math.abs(harmonicValue) * 0.6);
    
    const color = new THREE.Color();
    color.setHSL(hue / 360, saturation, lightness);
    
    return color;
  }

  // Generate color progression for spiral trajectory
  getTrajectoryColors(harmonicData, trajectoryLength) {
    const colors = [];
    
    for (let i = 0; i < trajectoryLength; i++) {
      const progress = i / trajectoryLength;
      const harmonics = harmonicData[i] || [];
      
      // Dominant harmonic determines base hue
      const dominantHarmonic = this.findDominantHarmonic(harmonics);
      const baseHue = (dominantHarmonic * this.goldenAngle) % 360;
      
      // Trajectory progress affects saturation and lightness
      const saturation = 0.7 + Math.sin(progress * Math.PI) * 0.3;
      const lightness = 0.4 + Math.cos(progress * Math.PI * 2) * 0.2;
      
      const color = new THREE.Color();
      color.setHSL(baseHue / 360, saturation, lightness);
      colors.push(color.r, color.g, color.b);
    }
    
    return new Float32Array(colors);
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

  // Create mathematical color texture for shaders
  createHarmonicColorTexture(harmonicData) {
    const width = 256;
    const height = 1;
    const data = new Uint8Array(width * height * 4);
    
    for (let i = 0; i < width; i++) {
      const harmonic = (i / width) * 50; // Map to 50 harmonics
      const color = this.getHarmonicColor(harmonicData[Math.floor(harmonic)] || 0, harmonic, 0);
      
      const index = i * 4;
      data[index] = Math.floor(color.r * 255);     // R
      data[index + 1] = Math.floor(color.g * 255); // G  
      data[index + 2] = Math.floor(color.b * 255); // B
      data[index + 3] = 255;                       // A
    }
    
    const texture = new THREE.DataTexture(data, width, height, THREE.RGBAFormat);
    texture.needsUpdate = true;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    
    return texture;
  }

  // Update color texture with new harmonic data
  updateHarmonicTexture(texture, harmonicData) {
    if (!texture || !harmonicData) return;
    
    const data = texture.image.data;
    const width = texture.image.width;
    
    for (let i = 0; i < width; i++) {
      const harmonic = (i / width) * 50;
      const color = this.getHarmonicColor(harmonicData[Math.floor(harmonic)] || 0, harmonic, 0);
      
      const index = i * 4;
      data[index] = Math.floor(color.r * 255);
      data[index + 1] = Math.floor(color.g * 255);
      data[index + 2] = Math.floor(color.b * 255);
    }
    
    texture.needsUpdate = true;
  }

  // Get mathematical lighting color
  getMathematicalLightColor(harmonicData) {
    const dominant = this.findDominantHarmonic(harmonicData);
    const hue = (dominant * this.goldenAngle) % 360;
    
    const color = new THREE.Color();
    color.setHSL(hue / 360, 0.8, 0.6);
    
    return color;
  }
}