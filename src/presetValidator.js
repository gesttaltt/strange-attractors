// Comprehensive Preset Validation System
import { generateSpiral } from './spiral.js';
import { projectSpiral } from './projection.js';
import { config, ConfigManager } from './config.js';

export class PresetValidator {
  constructor() {
    this.validationResults = new Map();
    this.lastValidated = null;
  }

  async validatePreset(presetName, maxSteps = 1000) {
    console.log(`🧪 Validating preset: ${presetName}`);
    
    const preset = ConfigManager.PRESETS[presetName];
    if (!preset) {
      throw new Error(`Preset "${presetName}" not found`);
    }

    const testParams = { ...ConfigManager.DEFAULT_PARAMS, ...preset };
    const validationStart = performance.now();

    try {
      // Test 1: Parameter validation
      Object.entries(testParams).forEach(([name, value]) => {
        if (name === 'steps' || name === 'dt') return; // Skip these for basic validation
        const range = ConfigManager.PARAM_RANGES[name];
        if (range && (value < range.min || value > range.max)) {
          throw new Error(`Parameter ${name}=${value} outside valid range [${range.min}, ${range.max}]`);
        }
      });

      // Test 2: Numerical stability check
      const stabilityCheck = this.checkNumericalStability(testParams);
      if (!stabilityCheck.stable) {
        console.warn(`⚠️ Stability warning for ${presetName}: ${stabilityCheck.warning}`);
      }

      // Test 3: Small-scale spiral generation
      console.log(`  🔄 Testing spiral generation (${maxSteps} steps)...`);
      const points = generateSpiral(testParams, maxSteps, testParams.dt);
      
      if (!points || points.length === 0) {
        throw new Error('No spiral points generated');
      }

      // Test 4: Check for numerical instability
      const finalPoint = points[points.length - 1];
      const hasNaN = finalPoint.some(coord => !isFinite(coord));
      if (hasNaN) {
        throw new Error('Numerical instability detected (NaN/Infinity values)');
      }

      // Test 5: Projection validation
      console.log(`  📊 Testing projection system...`);
      const {X, Y, Z} = projectSpiral(points);
      
      if (!X || !Y || !Z || X.length === 0) {
        throw new Error('Projection failed');
      }

      const projectionHasNaN = [...X, ...Y, ...Z].some(coord => !isFinite(coord));
      if (projectionHasNaN) {
        throw new Error('Projection contains invalid coordinates');
      }

      // Test 6: Performance analysis
      const validationTime = performance.now() - validationStart;
      const performance_metrics = {
        generationTime: validationTime,
        pointsGenerated: points.length,
        dimensionsUsed: points[0].length,
        coordinateRanges: {
          X: [Math.min(...X), Math.max(...X)],
          Y: [Math.min(...Y), Math.max(...Y)],
          Z: [Math.min(...Z), Math.max(...Z)]
        }
      };

      const result = {
        preset: presetName,
        status: 'VALID',
        warnings: stabilityCheck.stable ? [] : [stabilityCheck.warning],
        performance: performance_metrics,
        timestamp: new Date().toISOString()
      };

      this.validationResults.set(presetName, result);
      console.log(`✅ Preset ${presetName} validation: PASSED (${validationTime.toFixed(1)}ms)`);
      
      return result;

    } catch (error) {
      const failureResult = {
        preset: presetName,
        status: 'INVALID',
        error: error.message,
        parameters: testParams,
        timestamp: new Date().toISOString()
      };

      this.validationResults.set(presetName, failureResult);
      console.error(`❌ Preset ${presetName} validation: FAILED - ${error.message}`);
      
      return failureResult;
    }
  }

  checkNumericalStability(params) {
    const { omega, delta, dt, alpha, beta, gamma } = params;
    
    // Check Nyquist stability for harmonic system
    const maxHarmonicFreq = omega * 229; // Largest prime in 50-harmonic system
    const nyquistLimit = 1 / (2 * dt);
    
    if (maxHarmonicFreq > nyquistLimit * 0.1) {
      return {
        stable: false,
        warning: `High frequency content (${maxHarmonicFreq.toFixed(1)} > ${(nyquistLimit * 0.1).toFixed(1)}). Reduce omega or increase dt.`
      };
    }

    // Check damping parameters
    const minDamping = Math.min(alpha, beta, gamma);
    if (minDamping < 0.005) {
      return {
        stable: false,
        warning: `Low damping (${minDamping}) may cause divergence. Increase alpha/beta/gamma.`
      };
    }

    // Check harmonic decay
    if (delta > 0.1) {
      return {
        stable: false,
        warning: `High delta (${delta}) may cause rapid harmonic decay.`
      };
    }

    return { stable: true };
  }

  async validateAllPresets() {
    console.log('🔬 Starting comprehensive preset validation...');
    const results = [];
    
    for (const presetName of Object.keys(ConfigManager.PRESETS)) {
      const result = await this.validatePreset(presetName);
      results.push(result);
    }

    const validPresets = results.filter(r => r.status === 'VALID').length;
    const invalidPresets = results.filter(r => r.status === 'INVALID').length;

    console.log(`\n📊 Preset Validation Summary:`);
    console.log(`   ✅ Valid: ${validPresets}`);
    console.log(`   ❌ Invalid: ${invalidPresets}`);
    console.log(`   📈 Success Rate: ${((validPresets / results.length) * 100).toFixed(1)}%`);

    if (invalidPresets > 0) {
      console.log('\n❌ Invalid Presets:');
      results.filter(r => r.status === 'INVALID').forEach(r => {
        console.log(`   • ${r.preset}: ${r.error}`);
      });
    }

    return results;
  }

  async testPresetSwitching() {
    console.log('🔄 Testing preset switching sequences...');
    
    const presets = Object.keys(ConfigManager.PRESETS);
    const originalPreset = config.getAllParams();

    try {
      // Test switching to each preset
      for (let i = 0; i < presets.length; i++) {
        const presetName = presets[i];
        console.log(`  🎛️ Switching to: ${presetName}`);
        
        try {
          config.loadPreset(presetName);
          await new Promise(resolve => setTimeout(resolve, 100)); // Allow debounce
          
          // Quick generation test
          const params = config.getAllParams();
          const points = generateSpiral(params, 500, params.dt);
          
          if (!points || points.length === 0) {
            throw new Error(`No points generated for ${presetName}`);
          }
          
          console.log(`    ✅ ${presetName}: ${points.length} points, ${points[0].length} dims`);
          
        } catch (error) {
          console.error(`    ❌ ${presetName}: ${error.message}`);
          throw new Error(`Preset switching failed at ${presetName}: ${error.message}`);
        }
      }

      console.log('✅ All preset switching tests passed');
      return true;

    } catch (error) {
      console.error('❌ Preset switching test failed:', error);
      
      // Restore original parameters
      Object.entries(originalPreset).forEach(([name, value]) => {
        config.params[name] = value;
      });
      
      throw error;
    }
  }

  getValidationReport() {
    const results = Array.from(this.validationResults.values());
    return {
      totalPresets: results.length,
      validPresets: results.filter(r => r.status === 'VALID').length,
      invalidPresets: results.filter(r => r.status === 'INVALID').length,
      results: results
    };
  }
}

// Global access for testing
if (typeof window !== 'undefined') {
  const presetValidator = new PresetValidator();
  
  window.validateAllPresets = () => presetValidator.validateAllPresets();
  window.testPresetSwitching = () => presetValidator.testPresetSwitching();
  window.presetValidator = presetValidator;
}