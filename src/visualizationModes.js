import * as THREE from 'three';

export class VisualizationModeManager {
  constructor(scene, spiral) {
    this.scene = scene;
    this.currentSpiral = spiral;
    this.currentMode = 'line';
    this.lastData = null;
  }

  createPointCloud(X, Y, Z, colors) {
    const positions = [];
    const colorArray = [];
    
    for (let i = 0; i < X.length; i++) {
      positions.push(X[i], Y[i], Z[i]);
      colorArray.push(colors[3*i], colors[3*i+1], colors[3*i+2]);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colorArray, 3));

    const material = new THREE.PointsMaterial({
      vertexColors: true,
      size: 2.0,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true
    });

    return new THREE.Points(geometry, material);
  }

  createConnectedLine(X, Y, Z, colors) {
    const positions = [];
    const colorArray = [];
    
    for (let i = 0; i < X.length; i++) {
      positions.push(X[i], Y[i], Z[i]);
      colorArray.push(colors[3*i], colors[3*i+1], colors[3*i+2]);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colorArray, 3));

    const material = new THREE.LineBasicMaterial({
      vertexColors: true,
      linewidth: 2,
      transparent: true,
      opacity: 0.8
    });

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

      const material = new THREE.MeshPhongMaterial({
        vertexColors: false,
        color: 0xffffff,
        shininess: 30,
        transparent: true,
        opacity: 0.9,
        side: THREE.DoubleSide
      });

      return new THREE.Mesh(geometry, material);
    } catch (error) {
      console.warn('Tube geometry failed, falling back to line:', error);
      return this.createConnectedLine(X, Y, Z, colors);
    }
  }

  switchMode(mode, X, Y, Z, colors, size, opacity) {
    // Remove current visualization
    if (this.currentSpiral) {
      this.scene.remove(this.currentSpiral);
      this.currentSpiral.geometry?.dispose();
      this.currentSpiral.material?.dispose();
    }

    // Create new visualization based on mode
    let newSpiral;
    switch (mode) {
      case 'points':
        newSpiral = this.createPointCloud(X, Y, Z, colors);
        break;
      case 'line':
        newSpiral = this.createConnectedLine(X, Y, Z, colors);
        break;
      case 'tube':
        newSpiral = this.createTubeGeometry(X, Y, Z, colors, size);
        break;
      default:
        newSpiral = this.createConnectedLine(X, Y, Z, colors);
        mode = 'line';
    }

    // Store data for future updates
    newSpiral.userData = { X, Y, Z, size, opacity, geometry: newSpiral.geometry };
    
    // Add to scene
    this.scene.add(newSpiral);
    this.currentSpiral = newSpiral;
    this.currentMode = mode;
    
    return newSpiral;
  }

  getCurrentMode() {
    return this.currentMode;
  }

  updateGeometry(X, Y, Z, colors, size, opacity) {
    // Update the current visualization with new data
    return this.switchMode(this.currentMode, X, Y, Z, colors, size, opacity);
  }
}