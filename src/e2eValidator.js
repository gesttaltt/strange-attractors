// End-to-End Validation for Extended Prime System
import { generateSpiral } from './spiral.js';
import { projectSpiral } from './projection.js';
import { analyzeManifoldConvergence } from './analysis.js';
import { config } from './config.js';
import { EXTENDED_PRIMES } from './primes.js';

export class E2EValidator {
  constructor() {
    this.testResults = [];
    this.startTime = performance.now();
  }

  async runFullValidation() {
    console.log('🚀 Starting E2E validation of extended prime system...');
    
    const tests = [
      { name: 'Prime Generation', test: this.validatePrimeGeneration.bind(this) },
      { name: 'Spiral Generation', test: this.validateSpiralGeneration.bind(this) },
      { name: 'Projection System', test: this.validateProjection.bind(this) },
      { name: 'Harmonic Analysis', test: this.validateAnalysis.bind(this) },
      { name: 'Performance Metrics', test: this.validatePerformance.bind(this) },
      { name: 'Memory Management', test: this.validateMemory.bind(this) }
    ];

    for (const { name, test } of tests) {
      try {
        console.log(`🧪 Running ${name} test...`);
        const result = await test();
        this.testResults.push({ name, status: 'PASS', result });
        console.log(`✅ ${name}: PASSED`);
      } catch (error) {
        this.testResults.push({ name, status: 'FAIL', error: error.message });
        console.error(`❌ ${name}: FAILED -`, error.message);
      }
    }

    this.generateReport();
  }

  validatePrimeGeneration() {
    const primes = EXTENDED_PRIMES.slice(0, 200);
    
    // Validate prime count
    if (primes.length !== 200) {
      throw new Error(`Expected 200 primes, got ${primes.length}`);
    }

    // Validate first few primes
    const expectedFirst10 = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29];
    for (let i = 0; i < 10; i++) {
      if (primes[i] !== expectedFirst10[i]) {
        throw new Error(`Prime ${i}: expected ${expectedFirst10[i]}, got ${primes[i]}`);
      }
    }

    // Validate largest prime
    const largest = primes[primes.length - 1];
    if (largest < 1000) {
      throw new Error(`Largest prime ${largest} seems too small`);
    }

    return {
      totalPrimes: primes.length,
      largestPrime: largest,
      firstTen: primes.slice(0, 10)
    };
  }

  validateSpiralGeneration() {
    const params = config.getAllParams();
    const points = generateSpiral(params, 1000, params.dt);

    // Validate point structure
    if (!points || points.length === 0) {
      throw new Error('No spiral points generated');
    }

    // Validate harmonic dimensions
    const expectedDimensions = 6 + 200; // x,y,z,u,v,w + 200 harmonics
    if (points[0].length !== expectedDimensions) {
      throw new Error(`Expected ${expectedDimensions} dimensions, got ${points[0].length}`);
    }

    // Validate numerical stability
    const lastPoint = points[points.length - 1];
    for (let i = 0; i < lastPoint.length; i++) {
      if (!isFinite(lastPoint[i])) {
        throw new Error(`Numerical instability detected in dimension ${i}`);
      }
    }

    return {
      totalPoints: points.length,
      dimensions: points[0].length,
      harmonicDimensions: points[0].length - 6,
      finalPoint: lastPoint.slice(0, 6) // Just x,y,z,u,v,w for logging
    };
  }

  validateProjection() {
    const params = config.getAllParams();
    const points = generateSpiral(params, 500, params.dt);
    const projection = projectSpiral(points);

    // Validate projection structure
    const requiredFields = ['X', 'Y', 'Z', 'color', 'size', 'opacity'];
    for (const field of requiredFields) {
      if (!projection[field]) {
        throw new Error(`Missing projection field: ${field}`);
      }
    }

    // Validate array lengths
    const length = projection.X.length;
    if (projection.Y.length !== length || projection.Z.length !== length) {
      throw new Error('Projection array length mismatch');
    }

    // Validate color format
    if (projection.color.length !== length || !Array.isArray(projection.color[0])) {
      throw new Error('Invalid color array format');
    }

    return {
      projectionLength: length,
      colorFormat: projection.color[0].length,
      sampleValues: {
        X: projection.X.slice(0, 3),
        Y: projection.Y.slice(0, 3),
        Z: projection.Z.slice(0, 3)
      }
    };
  }

  validateAnalysis() {
    const params = config.getAllParams();
    const analysis = analyzeManifoldConvergence(params, 1000);

    // Validate analysis structure
    const requiredFields = ['harmonicVariances', 'spatialConvergence', 'convergenceRate', 'dominantHarmonics'];
    for (const field of requiredFields) {
      if (analysis[field] === undefined) {
        throw new Error(`Missing analysis field: ${field}`);
      }
    }

    // Validate harmonic analysis
    if (!Array.isArray(analysis.harmonicVariances) || analysis.harmonicVariances.length === 0) {
      throw new Error('Invalid harmonic variances');
    }

    // Validate convergence metrics
    if (typeof analysis.convergenceRate !== 'number' || !isFinite(analysis.convergenceRate)) {
      throw new Error('Invalid convergence rate');
    }

    return {
      totalHarmonics: analysis.harmonicVariances.length,
      convergenceRate: analysis.convergenceRate,
      spatialConvergence: analysis.spatialConvergence,
      dominantCount: analysis.dominantHarmonics.length
    };
  }

  validatePerformance() {
    const startTime = performance.now();
    
    // Test large spiral generation
    const params = config.getAllParams();
    const points = generateSpiral(params, 5000, params.dt);
    const projection = projectSpiral(points);
    
    const generationTime = performance.now() - startTime;

    if (generationTime > 5000) { // 5 seconds threshold
      throw new Error(`Performance degradation: ${generationTime}ms for 5000 points`);
    }

    // Test memory efficiency
    const estimatedMemory = points.length * points[0].length * 8; // bytes
    if (estimatedMemory > 50 * 1024 * 1024) { // 50MB threshold
      throw new Error(`Memory usage too high: ~${(estimatedMemory / 1024 / 1024).toFixed(1)}MB`);
    }

    return {
      generationTime: generationTime.toFixed(2),
      pointsPerSecond: Math.round(points.length / (generationTime / 1000)),
      estimatedMemoryMB: (estimatedMemory / 1024 / 1024).toFixed(2)
    };
  }

  validateMemory() {
    // Test memory cleanup
    const initialHeap = performance.memory ? performance.memory.usedJSHeapSize : 0;
    
    // Generate and discard multiple spirals
    for (let i = 0; i < 10; i++) {
      const params = config.getAllParams();
      const points = generateSpiral(params, 1000, params.dt);
      // Intentionally don't store references to test GC
    }

    // Force garbage collection if available
    if (window.gc) {
      window.gc();
    }

    const finalHeap = performance.memory ? performance.memory.usedJSHeapSize : 0;
    const heapGrowth = finalHeap - initialHeap;

    // Allow up to 10MB growth for multiple generations
    if (heapGrowth > 10 * 1024 * 1024) {
      console.warn(`Potential memory leak: ${(heapGrowth / 1024 / 1024).toFixed(2)}MB growth`);
    }

    return {
      initialHeapMB: (initialHeap / 1024 / 1024).toFixed(2),
      finalHeapMB: (finalHeap / 1024 / 1024).toFixed(2),
      heapGrowthMB: (heapGrowth / 1024 / 1024).toFixed(2)
    };
  }

  generateReport() {
    const totalTime = performance.now() - this.startTime;
    const passedTests = this.testResults.filter(t => t.status === 'PASS').length;
    const failedTests = this.testResults.filter(t => t.status === 'FAIL').length;

    console.log('\n🏁 E2E VALIDATION REPORT');
    console.log('='.repeat(50));
    console.log(`⏱️  Total Time: ${totalTime.toFixed(2)}ms`);
    console.log(`✅ Passed: ${passedTests}`);
    console.log(`❌ Failed: ${failedTests}`);
    console.log(`📊 Success Rate: ${((passedTests / this.testResults.length) * 100).toFixed(1)}%`);
    
    console.log('\n📋 Detailed Results:');
    this.testResults.forEach(({ name, status, result, error }) => {
      console.log(`${status === 'PASS' ? '✅' : '❌'} ${name}`);
      if (result) {
        console.log(`   ${JSON.stringify(result, null, 2).replace(/\n/g, '\n   ')}`);
      }
      if (error) {
        console.log(`   Error: ${error}`);
      }
    });

    console.log('\n🎯 SYSTEM VALIDATION:', failedTests === 0 ? 'COMPLETE' : 'ISSUES DETECTED');
    
    return {
      passed: passedTests,
      failed: failedTests,
      totalTime,
      results: this.testResults
    };
  }
}

// Auto-export for console access
if (typeof window !== 'undefined') {
  window.runE2EValidation = async () => {
    const validator = new E2EValidator();
    return await validator.runFullValidation();
  };
}