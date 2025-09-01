// Comprehensive Debugging System for Silent Spiral 12D
import { generateSpiral } from './spiral.js';
import { projectSpiral } from './projection.js';
import { config } from './config.js';
import { EXTENDED_PRIMES } from './primes.js';
import { E2EValidator } from './e2eValidator.js';

export class SpiralDebugger {
  constructor() {
    this.debugResults = {};
    this.issues = [];
  }

  async runFullDiagnostics() {
    console.log('🔍 STARTING COMPREHENSIVE SPIRAL DIAGNOSTICS');
    console.log('=' .repeat(60));
    
    try {
      // Step 1: Test Prime System
      await this.debugPrimeSystem();
      
      // Step 2: Test Spiral Generation
      await this.debugSpiralGeneration();
      
      // Step 3: Test Projection System
      await this.debugProjectionSystem();
      
      // Step 4: Test Coordinate Scales
      await this.debugCoordinateScales();
      
      // Step 5: Test Geometry Creation
      await this.debugGeometryCreation();
      
      // Step 6: Test Three.js Scene
      await this.debugThreeJSScene();
      
      // Step 7: Test Scene Content
      await this.debugSceneContent();
      
      // Step 8: Run E2E Validation
      await this.debugE2EValidation();
      
      this.generateDiagnosticReport();
      
    } catch (error) {
      console.error('🚨 CRITICAL ERROR IN DIAGNOSTICS:', error);
      this.issues.push({
        severity: 'CRITICAL',
        component: 'DIAGNOSTICS',
        message: error.message,
        stack: error.stack
      });
    }
    
    return this.debugResults;
  }

  async debugPrimeSystem() {
    console.log('\n🔢 Testing Prime System...');
    
    try {
      const primes = EXTENDED_PRIMES.slice(0, 200);
      
      this.debugResults.primes = {
        count: primes.length,
        first10: primes.slice(0, 10),
        last10: primes.slice(-10),
        largest: primes[primes.length - 1],
        expectedCount: 200,
        status: primes.length === 200 ? 'PASS' : 'FAIL'
      };
      
      console.log(`   ✅ Generated ${primes.length} primes (expected 200)`);
      console.log(`   📊 Range: ${primes[0]} to ${primes[primes.length - 1]}`);
      console.log(`   🎯 First 10: [${primes.slice(0, 10).join(', ')}]`);
      
      if (primes.length !== 200) {
        this.issues.push({
          severity: 'HIGH',
          component: 'PRIME_GENERATION',
          message: `Expected 200 primes, got ${primes.length}`
        });
      }
      
    } catch (error) {
      this.issues.push({
        severity: 'CRITICAL',
        component: 'PRIME_GENERATION',
        message: error.message
      });
      console.error('   ❌ Prime system error:', error.message);
    }
  }

  async debugSpiralGeneration() {
    console.log('\n🌀 Testing Spiral Generation...');
    
    try {
      const params = config.getAllParams();
      console.log(`   📋 Using parameters:`, {
        alpha: params.alpha,
        beta: params.beta,
        gamma: params.gamma,
        omega: params.omega,
        eta: params.eta,
        theta: params.theta,
        delta: params.delta,
        steps: params.steps,
        dt: params.dt
      });
      
      // Test with smaller step count first
      const testSteps = 1000;
      const points = generateSpiral(params, testSteps, params.dt);
      
      this.debugResults.spiral = {
        totalPoints: points.length,
        expectedPoints: testSteps,
        dimensions: points[0]?.length || 0,
        expectedDimensions: 206, // 6 + 200 harmonics
        samplePoint: points[0]?.slice(0, 6), // x,y,z,u,v,w
        finalPoint: points[points.length - 1]?.slice(0, 6),
        harmonicSample: points[0]?.slice(6, 16), // First 10 harmonics
        status: points.length > 0 ? 'PASS' : 'FAIL'
      };
      
      console.log(`   ✅ Generated ${points.length} points (expected ${testSteps})`);
      console.log(`   📏 Dimensions: ${points[0]?.length} (expected 206)`);
      console.log(`   🎯 Sample point [x,y,z,u,v,w]: [${points[0]?.slice(0, 6).map(n => n.toFixed(6)).join(', ')}]`);
      console.log(`   🎵 First 5 harmonics: [${points[0]?.slice(6, 11).map(n => n.toFixed(6)).join(', ')}]`);
      
      // Check for numerical stability
      const lastPoint = points[points.length - 1];
      const hasInstability = lastPoint.some(val => !isFinite(val));
      
      if (hasInstability) {
        this.issues.push({
          severity: 'CRITICAL',
          component: 'SPIRAL_GENERATION',
          message: 'Numerical instability detected in spiral generation'
        });
      }
      
      if (points[0]?.length !== 206) {
        this.issues.push({
          severity: 'HIGH',
          component: 'SPIRAL_GENERATION',
          message: `Incorrect dimensions: expected 206, got ${points[0]?.length}`
        });
      }
      
    } catch (error) {
      this.issues.push({
        severity: 'CRITICAL',
        component: 'SPIRAL_GENERATION',
        message: error.message
      });
      console.error('   ❌ Spiral generation error:', error.message);
    }
  }

  async debugProjectionSystem() {
    console.log('\n📐 Testing Projection System...');
    
    try {
      const params = config.getAllParams();
      const points = generateSpiral(params, 500, params.dt);
      const projection = projectSpiral(points);
      
      this.debugResults.projection = {
        inputPoints: points.length,
        outputLength: projection.X?.length || 0,
        hasAllFields: !!(projection.X && projection.Y && projection.Z && projection.color && projection.size && projection.opacity),
        sampleCoordinates: {
          X: projection.X?.slice(0, 5),
          Y: projection.Y?.slice(0, 5),
          Z: projection.Z?.slice(0, 5)
        },
        coordinateRanges: {
          X: projection.X ? { min: Math.min(...projection.X), max: Math.max(...projection.X) } : null,
          Y: projection.Y ? { min: Math.min(...projection.Y), max: Math.max(...projection.Y) } : null,
          Z: projection.Z ? { min: Math.min(...projection.Z), max: Math.max(...projection.Z) } : null
        },
        colorSample: projection.color?.slice(0, 3),
        sizeSample: projection.size?.slice(0, 5),
        opacitySample: projection.opacity?.slice(0, 5),
        status: projection.X?.length > 0 ? 'PASS' : 'FAIL'
      };
      
      console.log(`   ✅ Projected ${points.length} → ${projection.X?.length} points`);
      console.log(`   📊 X range: ${projection.X ? Math.min(...projection.X).toFixed(3) : 'N/A'} to ${projection.X ? Math.max(...projection.X).toFixed(3) : 'N/A'}`);
      console.log(`   📊 Y range: ${projection.Y ? Math.min(...projection.Y).toFixed(3) : 'N/A'} to ${projection.Y ? Math.max(...projection.Y).toFixed(3) : 'N/A'}`);
      console.log(`   📊 Z range: ${projection.Z ? Math.min(...projection.Z).toFixed(3) : 'N/A'} to ${projection.Z ? Math.max(...projection.Z).toFixed(3) : 'N/A'}`);
      console.log(`   🎨 Sample colors: [${projection.color?.[0]?.map(n => n.toFixed(3)).join(', ') || 'N/A'}]`);
      
      // Check for projection issues
      if (!projection.X || projection.X.length === 0) {
        this.issues.push({
          severity: 'CRITICAL',
          component: 'PROJECTION',
          message: 'Projection system failed to generate coordinates'
        });
      }
      
      // Check for extreme coordinate values
      const maxCoordinate = Math.max(
        projection.X ? Math.max(...projection.X.map(Math.abs)) : 0,
        projection.Y ? Math.max(...projection.Y.map(Math.abs)) : 0,
        projection.Z ? Math.max(...projection.Z.map(Math.abs)) : 0
      );
      
      if (maxCoordinate > 1000) {
        this.issues.push({
          severity: 'MEDIUM',
          component: 'PROJECTION',
          message: `Coordinates may be too large for Three.js rendering: max ${maxCoordinate.toFixed(2)}`
        });
      }
      
      if (maxCoordinate < 0.001) {
        this.issues.push({
          severity: 'HIGH',
          component: 'PROJECTION',
          message: `Coordinates may be too small for Three.js rendering: max ${maxCoordinate.toFixed(6)}`
        });
      }
      
    } catch (error) {
      this.issues.push({
        severity: 'CRITICAL',
        component: 'PROJECTION',
        message: error.message
      });
      console.error('   ❌ Projection error:', error.message);
    }
  }

  async debugCoordinateScales() {
    console.log('\n📏 Testing Coordinate Scales...');
    
    try {
      const params = config.getAllParams();
      const points = generateSpiral(params, 1000, params.dt);
      const projection = projectSpiral(points);
      
      if (!projection.X || !projection.Y || !projection.Z) {
        throw new Error('No projection data available for coordinate analysis');
      }
      
      const coordinates = [projection.X, projection.Y, projection.Z];
      const scales = coordinates.map(coord => ({
        min: Math.min(...coord),
        max: Math.max(...coord),
        range: Math.max(...coord) - Math.min(...coord),
        mean: coord.reduce((a, b) => a + b, 0) / coord.length,
        absMax: Math.max(...coord.map(Math.abs))
      }));
      
      this.debugResults.coordinateScales = {
        X: scales[0],
        Y: scales[1],
        Z: scales[2],
        overallScale: Math.max(...scales.map(s => s.absMax)),
        rangeRatio: Math.max(...scales.map(s => s.range)) / Math.min(...scales.map(s => s.range))
      };
      
      console.log('   📐 Coordinate Analysis:');
      ['X', 'Y', 'Z'].forEach((axis, i) => {
        const s = scales[i];
        console.log(`     ${axis}: range ${s.min.toFixed(3)} to ${s.max.toFixed(3)} (span: ${s.range.toFixed(3)}, mean: ${s.mean.toFixed(3)})`);
      });
      
      const overallScale = Math.max(...scales.map(s => s.absMax));
      console.log(`   🎯 Overall scale: ${overallScale.toFixed(3)}`);
      
      // Check for rendering scale issues
      if (overallScale < 1) {
        console.log(`   ⚠️  Coordinates may be too small for optimal Three.js rendering`);
        this.issues.push({
          severity: 'MEDIUM',
          component: 'COORDINATE_SCALE',
          message: `Small coordinate scale detected: ${overallScale.toFixed(6)}. Consider scaling up.`
        });
      } else if (overallScale > 100) {
        console.log(`   ⚠️  Coordinates may be too large for optimal Three.js rendering`);
        this.issues.push({
          severity: 'MEDIUM',
          component: 'COORDINATE_SCALE',
          message: `Large coordinate scale detected: ${overallScale.toFixed(2)}. Consider scaling down.`
        });
      } else {
        console.log(`   ✅ Coordinate scale appears appropriate for Three.js rendering`);
      }
      
    } catch (error) {
      this.issues.push({
        severity: 'HIGH',
        component: 'COORDINATE_SCALE',
        message: error.message
      });
      console.error('   ❌ Coordinate scale error:', error.message);
    }
  }

  async debugGeometryCreation() {
    console.log('\n🎨 Testing Three.js Geometry Creation...');
    
    try {
      // Simulate the geometry creation process without Three.js
      const params = config.getAllParams();
      const points = generateSpiral(params, 100, params.dt);
      const projection = projectSpiral(points);
      
      if (!projection.X || !projection.Y || !projection.Z) {
        throw new Error('No projection data for geometry creation');
      }
      
      // Prepare color array like the visualization system does
      const colors = [];
      for (let i = 0; i < projection.X.length; i++) {
        const colorValues = projection.color[i] || [0, 0, 0];
        colors.push(
          (colorValues[0] % 1 + 1) % 1,
          (colorValues[1] % 1 + 1) % 1,
          (colorValues[2] % 1 + 1) % 1
        );
      }
      
      // Test positions array creation
      const positions = [];
      for (let i = 0; i < projection.X.length; i++) {
        positions.push(projection.X[i], projection.Y[i], projection.Z[i]);
      }
      
      this.debugResults.geometry = {
        pointCount: projection.X.length,
        positionArrayLength: positions.length,
        colorArrayLength: colors.length,
        expectedPositions: projection.X.length * 3,
        expectedColors: projection.X.length * 3,
        samplePositions: positions.slice(0, 9), // First 3 points
        sampleColors: colors.slice(0, 9), // First 3 colors
        positionsValid: positions.every(p => isFinite(p)),
        colorsValid: colors.every(c => isFinite(c) && c >= 0 && c <= 1),
        status: positions.length > 0 && colors.length > 0 ? 'PASS' : 'FAIL'
      };
      
      console.log(`   ✅ Created geometry arrays for ${projection.X.length} points`);
      console.log(`   📊 Positions array: ${positions.length} values (expected ${projection.X.length * 3})`);
      console.log(`   🎨 Colors array: ${colors.length} values (expected ${projection.X.length * 3})`);
      console.log(`   🔢 Sample positions: [${positions.slice(0, 6).map(n => n.toFixed(3)).join(', ')}]`);
      console.log(`   🌈 Sample colors: [${colors.slice(0, 6).map(n => n.toFixed(3)).join(', ')}]`);
      
      // Validate arrays
      const invalidPositions = positions.filter(p => !isFinite(p));
      const invalidColors = colors.filter(c => !isFinite(c) || c < 0 || c > 1);
      
      if (invalidPositions.length > 0) {
        this.issues.push({
          severity: 'CRITICAL',
          component: 'GEOMETRY_CREATION',
          message: `${invalidPositions.length} invalid position values detected`
        });
      }
      
      if (invalidColors.length > 0) {
        this.issues.push({
          severity: 'HIGH',
          component: 'GEOMETRY_CREATION',
          message: `${invalidColors.length} invalid color values detected`
        });
      }
      
      if (positions.length === 0) {
        this.issues.push({
          severity: 'CRITICAL',
          component: 'GEOMETRY_CREATION',
          message: 'No positions generated for geometry'
        });
      }
      
    } catch (error) {
      this.issues.push({
        severity: 'CRITICAL',
        component: 'GEOMETRY_CREATION',
        message: error.message
      });
      console.error('   ❌ Geometry creation error:', error.message);
    }
  }

  async debugThreeJSScene() {
    console.log('\n🎭 Testing Three.js Scene State...');
    
    try {
      // Check if Three.js globals are available
      if (typeof window === 'undefined' || !window.THREE) {
        throw new Error('Three.js not available in global scope');
      }
      
      // Check for scene elements
      const canvas = document.getElementById('spiral-canvas');
      if (!canvas) {
        throw new Error('Canvas element not found');
      }
      
      // Check WebGL support
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        throw new Error('WebGL not supported');
      }
      
      this.debugResults.threeJS = {
        canvasFound: !!canvas,
        canvasSize: canvas ? `${canvas.width}x${canvas.height}` : 'N/A',
        webGLSupported: !!gl,
        webGLRenderer: gl ? gl.getParameter(gl.RENDERER) : 'N/A',
        webGLVersion: gl ? gl.getParameter(gl.VERSION) : 'N/A',
        status: 'PASS'
      };
      
      console.log(`   ✅ Canvas element found: ${canvas.width}x${canvas.height}`);
      console.log(`   ✅ WebGL supported: ${gl.getParameter(gl.RENDERER)}`);
      console.log(`   📊 WebGL version: ${gl.getParameter(gl.VERSION)}`);
      
    } catch (error) {
      this.debugResults.threeJS = {
        status: 'FAIL',
        error: error.message
      };
      this.issues.push({
        severity: 'CRITICAL',
        component: 'THREE_JS_SCENE',
        message: error.message
      });
      console.error('   ❌ Three.js scene error:', error.message);
    }
  }

  async debugSceneContent() {
    console.log('\n🏗️ Testing Scene Content...');
    
    try {
      // This requires access to the scene object created in visualization.js
      // We'll add a hook to store the scene globally for debugging
      if (typeof window === 'undefined' || !window.debugScene) {
        console.log('   ⚠️  Scene not available for debugging (run after scene initialization)');
        this.debugResults.sceneContent = {
          status: 'SKIP',
          message: 'Scene not available for inspection'
        };
        return;
      }
      
      const scene = window.debugScene;
      const childCount = scene.children.length;
      const spiralObjects = scene.children.filter(child => 
        child.type === 'Line' || child.type === 'Points' || child.type === 'Mesh'
      );
      
      this.debugResults.sceneContent = {
        totalChildren: childCount,
        spiralObjects: spiralObjects.length,
        objectTypes: scene.children.map(child => child.type),
        hasVisibleObjects: spiralObjects.some(obj => obj.visible),
        status: spiralObjects.length > 0 ? 'PASS' : 'FAIL'
      };
      
      console.log(`   📊 Scene children: ${childCount}`);
      console.log(`   🎨 Spiral objects: ${spiralObjects.length}`);
      console.log(`   📋 Object types: [${scene.children.map(child => child.type).join(', ')}]`);
      console.log(`   👁️  Visible objects: ${spiralObjects.filter(obj => obj.visible).length}/${spiralObjects.length}`);
      
      if (spiralObjects.length === 0) {
        this.issues.push({
          severity: 'CRITICAL',
          component: 'SCENE_CONTENT',
          message: 'No spiral objects found in scene'
        });
      }
      
      // Check individual spiral object properties
      spiralObjects.forEach((obj, i) => {
        console.log(`   🔍 Object ${i}: type=${obj.type}, visible=${obj.visible}, vertices=${obj.geometry?.attributes?.position?.count || 0}`);
        if (obj.geometry && obj.geometry.attributes.position) {
          const positions = obj.geometry.attributes.position.array;
          if (positions.length === 0) {
            this.issues.push({
              severity: 'HIGH',
              component: 'SCENE_CONTENT',
              message: `Object ${i} has empty geometry`
            });
          }
        }
      });
      
    } catch (error) {
      this.debugResults.sceneContent = {
        status: 'FAIL',
        error: error.message
      };
      this.issues.push({
        severity: 'HIGH',
        component: 'SCENE_CONTENT',
        message: error.message
      });
      console.error('   ❌ Scene content error:', error.message);
    }
  }

  async debugE2EValidation() {
    console.log('\n🧪 Running E2E Validation...');
    
    try {
      const validator = new E2EValidator();
      const results = await validator.runFullValidation();
      
      this.debugResults.e2e = {
        totalTests: results.results.length,
        passedTests: results.passed,
        failedTests: results.failed,
        successRate: (results.passed / results.results.length * 100).toFixed(1),
        totalTime: results.totalTime.toFixed(2),
        failedTestNames: results.results.filter(r => r.status === 'FAIL').map(r => r.name),
        status: results.failed === 0 ? 'PASS' : 'FAIL'
      };
      
      console.log(`   📊 E2E Results: ${results.passed}/${results.results.length} tests passed`);
      console.log(`   ⏱️  Total time: ${results.totalTime.toFixed(2)}ms`);
      
      if (results.failed > 0) {
        console.log(`   ❌ Failed tests: ${results.results.filter(r => r.status === 'FAIL').map(r => r.name).join(', ')}`);
        this.issues.push({
          severity: 'HIGH',
          component: 'E2E_VALIDATION',
          message: `${results.failed} E2E tests failed: ${results.results.filter(r => r.status === 'FAIL').map(r => r.name).join(', ')}`
        });
      } else {
        console.log(`   ✅ All E2E tests passed!`);
      }
      
    } catch (error) {
      this.issues.push({
        severity: 'HIGH',
        component: 'E2E_VALIDATION',
        message: error.message
      });
      console.error('   ❌ E2E validation error:', error.message);
    }
  }

  generateDiagnosticReport() {
    console.log('\n' + '='.repeat(60));
    console.log('🏁 COMPREHENSIVE DIAGNOSTIC REPORT');
    console.log('='.repeat(60));
    
    const totalIssues = this.issues.length;
    const criticalIssues = this.issues.filter(i => i.severity === 'CRITICAL').length;
    const highIssues = this.issues.filter(i => i.severity === 'HIGH').length;
    const mediumIssues = this.issues.filter(i => i.severity === 'MEDIUM').length;
    
    console.log(`📊 ISSUE SUMMARY:`);
    console.log(`   🚨 Critical: ${criticalIssues}`);
    console.log(`   ⚠️  High: ${highIssues}`);
    console.log(`   📝 Medium: ${mediumIssues}`);
    console.log(`   📊 Total: ${totalIssues}`);
    
    if (totalIssues === 0) {
      console.log('\n✅ NO ISSUES DETECTED - SYSTEM APPEARS HEALTHY');
      console.log('   If the spiral is still not visible, check:');
      console.log('   • Camera position and zoom level');
      console.log('   • Browser console for WebGL errors');
      console.log('   • Canvas element visibility');
    } else {
      console.log('\n🔍 DETAILED ISSUE ANALYSIS:');
      this.issues.forEach((issue, i) => {
        const icon = issue.severity === 'CRITICAL' ? '🚨' : 
                    issue.severity === 'HIGH' ? '⚠️' : '📝';
        console.log(`\n${icon} Issue ${i + 1}: ${issue.component}`);
        console.log(`   Severity: ${issue.severity}`);
        console.log(`   Message: ${issue.message}`);
        if (issue.stack) {
          console.log(`   Stack: ${issue.stack.split('\n')[0]}`);
        }
      });
      
      console.log('\n🎯 RECOMMENDED ACTIONS:');
      
      if (criticalIssues > 0) {
        console.log('   1. Address CRITICAL issues first - these prevent basic functionality');
      }
      if (highIssues > 0) {
        console.log('   2. Fix HIGH priority issues - these likely cause visibility problems');
      }
      if (mediumIssues > 0) {
        console.log('   3. Consider MEDIUM issues for optimization');
      }
    }
    
    console.log('\n📋 COMPONENT STATUS:');
    Object.entries(this.debugResults).forEach(([component, result]) => {
      const status = result.status || 'UNKNOWN';
      const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '❓';
      console.log(`   ${icon} ${component.toUpperCase()}: ${status}`);
    });
    
    console.log('\n🔧 NEXT DEBUGGING STEPS:');
    console.log('   1. Run: window.spiralDebugger.debugResults to inspect detailed results');
    console.log('   2. Run: window.runE2EValidation() for additional validation');
    console.log('   3. Check browser developer tools Network tab for failed imports');
    console.log('   4. Verify WebGL support: window.WebGLRenderingContext');
    
    return {
      totalIssues,
      criticalIssues,
      highIssues,
      mediumIssues,
      issues: this.issues,
      results: this.debugResults
    };
  }
}

// Export for global access
if (typeof window !== 'undefined') {
  window.spiralDebugger = new SpiralDebugger();
  window.runSpiralDiagnostics = () => window.spiralDebugger.runFullDiagnostics();
}

export { SpiralDebugger };