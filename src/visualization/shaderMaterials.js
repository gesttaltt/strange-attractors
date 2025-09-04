// Shader Materials - Custom Three.js materials for beautiful mathematical visualization
// Clean separation: Pure Three.js material creation

import * as THREE from 'three';

export class MathematicalShaderMaterials {
  constructor() {
    this.time = 0;
    this.materials = {};
    this.uniforms = this.createUniforms();
  }

  createUniforms() {
    return {
      time: { value: 0 },
      harmonicIntensity: { value: 1.0 },
      colorPalette: { value: null },
      size: { value: 2.0 }
    };
  }

  // Beautiful point visualization with harmonic pulsing
  createHarmonicPointMaterial(harmonicTexture) {
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: this.uniforms.time,
        harmonicData: { value: harmonicTexture },
        size: this.uniforms.size,
        intensity: this.uniforms.harmonicIntensity
      },
      
      vertexShader: `
        attribute float harmonicValue;
        attribute float harmonicIndex;
        uniform float time;
        uniform float size;
        varying float vHarmonicValue;
        varying float vHarmonicIndex;
        varying vec3 vPosition;
        
        void main() {
          vHarmonicValue = harmonicValue;
          vHarmonicIndex = harmonicIndex;
          vPosition = position;
          
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          
          // Enhanced sparkle pulsing with multiple frequencies
          float sparkle = 1.0 + sin(vHarmonicIndex * time * 2.0 + vHarmonicValue * 15.0) * 0.5;
          float twinkle = 1.0 + sin(vHarmonicIndex * time * 5.0) * 0.3;
          float shimmer = 1.0 + sin(time * 8.0 + vHarmonicIndex) * 0.2;
          
          gl_PointSize = size * sparkle * twinkle * shimmer * (3.0 + abs(vHarmonicValue) * 4.0);
          
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      
      fragmentShader: `
        uniform float time;
        varying float vHarmonicValue;
        varying float vHarmonicIndex;
        varying vec3 vPosition;
        
        void main() {
          vec2 uv = gl_PointCoord;
          vec2 center = vec2(0.5);
          float dist = distance(uv, center);
          
          // Enhanced sparkle star pattern for light emission
          float star = 1.0 / (1.0 + pow(dist * 10.0, 2.0));
          
          // Add bright cross sparkle pattern
          float crossH = exp(-pow((uv.x - 0.5) * 25.0, 2.0));
          float crossV = exp(-pow((uv.y - 0.5) * 25.0, 2.0));
          float cross = max(crossH, crossV) * 0.8;
          
          // Enhanced mathematical sparkle timing
          float sparkleTime = time * 4.0 + vHarmonicIndex * 0.3;
          float sparkleIntensity = 0.6 + sin(sparkleTime) * 0.4;
          float twinkle = 0.8 + sin(sparkleTime * 2.0) * 0.2;
          
          // Dynamic color shifting for sparkle effect
          float hue = mod(vHarmonicIndex * 137.5 + time * 30.0, 360.0) / 360.0;
          float saturation = 0.9 + sin(time * 3.0) * 0.1;
          float lightness = 0.5 + abs(vHarmonicValue) * 0.4 + sparkleIntensity * 0.3;
          
          // HSL to RGB conversion
          vec3 harmonicColor = hslToRgb(vec3(hue, saturation, lightness));
          
          // Combine patterns for intense sparkle light emission
          float sparkleGlow = max(star, cross) * sparkleIntensity * twinkle;
          
          // Bright light emission effect
          harmonicColor *= (2.0 + sparkleGlow * 2.0);
          
          // Enhanced alpha for better light emission
          float alpha = sparkleGlow * (0.8 + abs(vHarmonicValue));
          
          gl_FragColor = vec4(harmonicColor, alpha);
        }
        
        // HSL to RGB conversion function
        vec3 hslToRgb(vec3 hsl) {
          float h = hsl.x * 6.0;
          float s = hsl.y;
          float l = hsl.z;
          
          float c = (1.0 - abs(2.0 * l - 1.0)) * s;
          float x = c * (1.0 - abs(mod(h, 2.0) - 1.0));
          float m = l - c / 2.0;
          
          vec3 rgb;
          if (h < 1.0) rgb = vec3(c, x, 0.0);
          else if (h < 2.0) rgb = vec3(x, c, 0.0);
          else if (h < 3.0) rgb = vec3(0.0, c, x);
          else if (h < 4.0) rgb = vec3(0.0, x, c);
          else if (h < 5.0) rgb = vec3(x, 0.0, c);
          else rgb = vec3(c, 0.0, x);
          
          return rgb + m;
        }
      `,
      
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    
    this.materials.harmonicPoints = material;
    return material;
  }

  // Beautiful line visualization with flowing colors
  createHarmonicLineMaterial() {
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: this.uniforms.time,
        intensity: this.uniforms.harmonicIntensity
      },
      
      vertexShader: `
        attribute vec3 harmonicColor;
        varying vec3 vHarmonicColor;
        varying vec3 vPosition;
        
        void main() {
          vHarmonicColor = harmonicColor;
          vPosition = position;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      
      fragmentShader: `
        uniform float time;
        uniform float intensity;
        varying vec3 vHarmonicColor;
        varying vec3 vPosition;
        
        void main() {
          // Flowing color effect along trajectory
          float flow = sin(vPosition.x * 0.1 + vPosition.y * 0.1 + time * 2.0) * 0.3 + 0.7;
          
          // Enhanced harmonic color with glow
          vec3 color = vHarmonicColor * flow * intensity;
          float alpha = 0.7 + flow * 0.3;
          
          gl_FragColor = vec4(color, alpha);
        }
      `,
      
      transparent: true,
      linewidth: 3
    });
    
    this.materials.harmonicLine = material;
    return material;
  }

  // Beautiful tube visualization with iridescent harmonic mapping
  createHarmonicTubeMaterial() {
    const material = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.3,
      roughness: 0.2,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide,
      
      onBeforeCompile: (shader) => {
        shader.uniforms.time = this.uniforms.time;
        shader.uniforms.harmonicIntensity = this.uniforms.harmonicIntensity;
        
        shader.vertexShader = shader.vertexShader.replace(
          '#include <common>',
          `
          #include <common>
          varying vec3 vWorldPosition;
          uniform float time;
          `
        );
        
        shader.vertexShader = shader.vertexShader.replace(
          '#include <worldpos_vertex>',
          `
          #include <worldpos_vertex>
          vWorldPosition = worldPosition.xyz;
          `
        );
        
        shader.fragmentShader = shader.fragmentShader.replace(
          '#include <common>',
          `
          #include <common>
          varying vec3 vWorldPosition;
          uniform float time;
          uniform float harmonicIntensity;
          
          vec3 hslToRgb(vec3 hsl) {
            float h = hsl.x * 6.0;
            float s = hsl.y;
            float l = hsl.z;
            
            float c = (1.0 - abs(2.0 * l - 1.0)) * s;
            float x = c * (1.0 - abs(mod(h, 2.0) - 1.0));
            float m = l - c / 2.0;
            
            vec3 rgb;
            if (h < 1.0) rgb = vec3(c, x, 0.0);
            else if (h < 2.0) rgb = vec3(x, c, 0.0);
            else if (h < 3.0) rgb = vec3(0.0, c, x);
            else if (h < 4.0) rgb = vec3(0.0, x, c);
            else if (h < 5.0) rgb = vec3(x, 0.0, c);
            else rgb = vec3(c, 0.0, x);
            
            return rgb + m;
          }
          `
        );
        
        shader.fragmentShader = shader.fragmentShader.replace(
          'vec4 diffuseColor = vec4( diffuse, opacity );',
          `
          // Mathematical iridescence based on position and time
          float mathPhase = vWorldPosition.x * 0.1 + vWorldPosition.y * 0.1 + time * 0.5;
          float hue = mod(mathPhase * 57.2958, 360.0) / 360.0; // Mathematical constant
          
          vec3 iridescent = hslToRgb(vec3(hue, 0.8, 0.5));
          vec3 finalColor = mix(diffuse, iridescent, harmonicIntensity * 0.7);
          
          vec4 diffuseColor = vec4(finalColor, opacity);
          `
        );
      }
    });
    
    this.materials.harmonicTube = material;
    return material;
  }

  // Update materials with current time for animation
  updateMaterials(deltaTime) {
    this.time += deltaTime;
    this.uniforms.time.value = this.time;
    
    // Update all material uniforms
    Object.values(this.materials).forEach(material => {
      if (material.uniforms && material.uniforms.time) {
        material.uniforms.time.value = this.time;
      }
    });
  }

  // Set harmonic intensity for all materials
  setHarmonicIntensity(intensity) {
    this.uniforms.harmonicIntensity.value = intensity;
    
    Object.values(this.materials).forEach(material => {
      if (material.uniforms && material.uniforms.harmonicIntensity) {
        material.uniforms.harmonicIntensity.value = intensity;
      }
    });
  }

  // Clean up materials
  dispose() {
    Object.values(this.materials).forEach(material => {
      if (material.dispose) {
        material.dispose();
      }
    });
    this.materials = {};
  }
}