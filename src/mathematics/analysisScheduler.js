// Mathematical Analysis Scheduler for 30Hz Real-time Computation
// Manages continuous mathematical analysis during spiral evolution

import { Matrix } from 'ml-matrix';
import * as stats from 'simple-statistics';
import { evaluate, derivative } from 'mathjs';

export class MathematicalAnalysisScheduler {
  constructor(dataPipeline, updateFrequency = 30) {
    this.dataPipeline = dataPipeline;
    this.updateFrequency = updateFrequency;
    this.updateInterval = 1000 / updateFrequency; // ms
    
    this.analysisModules = new Map();
    this.schedulerInterval = null;
    this.isRunning = false;
    
    this.analysisResults = new Map();
    this.performanceMetrics = {
      analysisTime: 0,
      analysisCount: 0,
      avgAnalysisTime: 0,
      lastAnalysisTime: 0
    };

    this.setupDefaultAnalyzers();
  }

  setupDefaultAnalyzers() {
    // Register core mathematical analyzers
    this.registerAnalyzer('convergence', new ConvergenceAnalyzer());
    this.registerAnalyzer('derivatives', new DerivativeAnalyzer());
    this.registerAnalyzer('statistics', new StatisticalAnalyzer());
    this.registerAnalyzer('stability', new StabilityAnalyzer());
  }

  registerAnalyzer(name, analyzer) {
    if (!analyzer || typeof analyzer.analyze !== 'function') {
      throw new Error(`Analyzer ${name} must have analyze() method`);
    }
    
    this.analysisModules.set(name, analyzer);
    console.log(`🧮 Mathematical analyzer registered: ${name}`);
  }

  unregisterAnalyzer(name) {
    const removed = this.analysisModules.delete(name);
    if (removed) {
      console.log(`🧮 Mathematical analyzer removed: ${name}`);
    }
    return removed;
  }

  startScheduledAnalysis() {
    if (this.isRunning) {
      console.warn('⚠️ Mathematical analysis scheduler already running');
      return;
    }

    this.isRunning = true;
    this.schedulerInterval = setInterval(() => {
      this.runScheduledAnalysis();
    }, this.updateInterval);

    console.log(`🔄 Mathematical analysis scheduler started (${this.updateFrequency}Hz)`);
  }

  stopScheduledAnalysis() {
    if (this.schedulerInterval) {
      clearInterval(this.schedulerInterval);
      this.schedulerInterval = null;
    }
    this.isRunning = false;
    console.log('⏹️ Mathematical analysis scheduler stopped');
  }

  runScheduledAnalysis() {
    const analysisStart = performance.now();
    
    try {
      const currentState = this.dataPipeline.getCurrentState();
      const trajectoryWindow = this.dataPipeline.getTrajectoryWindow(100);
      
      if (!currentState || !trajectoryWindow || trajectoryWindow.length < 10) {
        return; // Insufficient data for analysis
      }

      const analysisContext = {
        currentState: currentState.state,
        timeStep: currentState.time,
        parameters: currentState.parameters,
        trajectory: trajectoryWindow.map(s => s.state),
        timePoints: trajectoryWindow.map(s => s.time)
      };

      // Run all registered analyzers
      const frameResults = {};
      this.analysisModules.forEach((analyzer, name) => {
        try {
          const result = analyzer.analyze(analysisContext);
          frameResults[name] = result;
        } catch (analyzerError) {
          console.error(`❌ Mathematical analyzer error (${name}):`, analyzerError);
          frameResults[name] = null;
        }
      });

      // Store results and update performance metrics
      this.analysisResults.set(performance.now(), frameResults);
      this.updatePerformanceMetrics(analysisStart);

      // Notify subscribers of new analysis results
      this.notifyAnalysisSubscribers(frameResults);

    } catch (error) {
      console.error('❌ Scheduled mathematical analysis failed:', error);
    }
  }

  updatePerformanceMetrics(analysisStart) {
    const analysisTime = performance.now() - analysisStart;
    this.performanceMetrics.analysisTime = analysisTime;
    this.performanceMetrics.analysisCount++;
    this.performanceMetrics.lastAnalysisTime = analysisStart;
    
    // Calculate rolling average
    const alpha = 0.1; // Exponential moving average factor
    this.performanceMetrics.avgAnalysisTime = 
      alpha * analysisTime + (1 - alpha) * this.performanceMetrics.avgAnalysisTime;

    // Performance warning for slow analysis
    if (analysisTime > this.updateInterval * 0.8) {
      console.warn(`⚠️ Mathematical analysis slow: ${analysisTime.toFixed(2)}ms (target: ${this.updateInterval}ms)`);
    }
  }

  notifyAnalysisSubscribers(results) {
    // Emit custom event for GUI components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('mathematicalAnalysisUpdate', {
        detail: {
          results: results,
          timestamp: performance.now(),
          analysisCount: this.performanceMetrics.analysisCount
        }
      }));
    }
  }

  getLatestResults(analyzerName = null) {
    const latestTimestamp = Math.max(...this.analysisResults.keys());
    const latestResults = this.analysisResults.get(latestTimestamp);
    
    return analyzerName ? latestResults?.[analyzerName] : latestResults;
  }

  getPerformanceMetrics() {
    return {
      ...this.performanceMetrics,
      updateFrequency: this.updateFrequency,
      isRunning: this.isRunning,
      registeredAnalyzers: Array.from(this.analysisModules.keys())
    };
  }

  destroy() {
    this.stopScheduledAnalysis();
    this.analysisModules.clear();
    this.analysisResults.clear();
    console.log('🧹 Mathematical analysis scheduler destroyed');
  }
}

// Core mathematical analyzer classes
export class ConvergenceAnalyzer {
  analyze(context) {
    const { trajectory, timePoints } = context;
    
    if (trajectory.length < 50) return null;
    
    // Calculate spatial spread for convergence analysis
    const spatialSpreads = this.calculateSpatialSpreads(trajectory);
    const convergenceRate = this.estimateConvergenceRate(spatialSpreads, timePoints);
    
    return {
      currentSpread: spatialSpreads[spatialSpreads.length - 1],
      convergenceRate: convergenceRate,
      classification: this.classifyConvergence(convergenceRate),
      timestamp: performance.now()
    };
  }

  calculateSpatialSpreads(trajectory) {
    return trajectory.map(state => {
      const spatial = state.slice(0, 3); // x, y, z coordinates
      const centroid = [
        spatial.reduce((sum, _, i) => sum + trajectory.map(s => s[i]).reduce((a,b) => a+b) / trajectory.length, 0) / 3
      ];
      
      // Calculate spread from centroid
      return Math.sqrt(spatial.reduce((sum, coord, i) => 
        sum + Math.pow(coord - centroid[i % 3], 2), 0) / 3);
    });
  }

  estimateConvergenceRate(spreads, timePoints) {
    if (spreads.length < 10) return 0;
    
    // Linear regression on log(spread) vs time
    const logSpreads = spreads.map(s => Math.log(Math.max(s, 1e-10)));
    const regression = stats.linearRegression(timePoints.map((t, i) => [t, logSpreads[i]]));
    
    return regression.m; // Slope = convergence rate
  }

  classifyConvergence(rate) {
    if (rate < -0.01) return 'Strong';
    if (rate < -0.001) return 'Moderate';
    if (rate < 0) return 'Weak';
    return 'Divergent';
  }
}

export class DerivativeAnalyzer {
  analyze(context) {
    const { currentState, parameters } = context;
    
    if (!currentState || !parameters) return null;
    
    // Extract current coordinates
    const [x, y, z, u, v, w, ...harmonics] = currentState;
    const { alpha, beta, gamma, omega, eta, theta, delta } = parameters;
    
    // Calculate derivatives (matching spiral.js computation)
    const phi = Math.cos(omega * context.timeStep) + eta * Math.cos(theta);
    const phi_dot = -omega * Math.sin(omega * context.timeStep);
    
    // Position derivatives
    const spatialDerivatives = { dx: u, dy: v, dz: w };
    
    // Velocity derivatives (simplified for real-time computation)
    const velocityDerivatives = {
      du: -alpha * u + Math.cos(y) * v + phi_dot,
      dv: -beta * v + Math.cos(z) * w + phi_dot,
      dw: -gamma * w + Math.cos(x) * u + phi_dot
    };

    // Harmonic derivative magnitudes
    const harmonicDerivatives = harmonics.map((h, i) => {
      return Math.abs(Math.sin(2 * Math.PI * phi) - delta * h); // Simplified
    });

    return {
      spatial: spatialDerivatives,
      velocity: velocityDerivatives,
      harmonics: harmonicDerivatives,
      magnitudes: {
        spatial: Math.sqrt(u*u + v*v + w*w),
        velocity: Math.sqrt(velocityDerivatives.du**2 + velocityDerivatives.dv**2 + velocityDerivatives.dw**2),
        harmonics: Math.sqrt(harmonicDerivatives.reduce((sum, h) => sum + h*h, 0))
      },
      timestamp: performance.now()
    };
  }
}

export class StatisticalAnalyzer {
  analyze(context) {
    const { trajectory } = context;
    
    if (trajectory.length < 20) return null;

    // Statistical analysis of 56D trajectory
    const statistics = {};
    
    // Spatial coordinates statistics
    for (let dim = 0; dim < 6; dim++) {
      const values = trajectory.map(state => state[dim]);
      statistics[`dim_${dim}`] = {
        mean: stats.mean(values),
        variance: stats.variance(values),
        stddev: stats.standardDeviation(values),
        min: Math.min(...values),
        max: Math.max(...values)
      };
    }

    // Harmonic statistics (first 10 harmonics for performance)
    for (let h = 0; h < Math.min(10, 50); h++) {
      const harmonicIndex = 6 + h;
      const values = trajectory.map(state => state[harmonicIndex]);
      statistics[`harmonic_${h}`] = {
        rms: Math.sqrt(stats.mean(values.map(v => v*v))),
        variance: stats.variance(values),
        energy: stats.mean(values.map(v => v*v))
      };
    }

    return {
      dimensions: statistics,
      trajectoryLength: trajectory.length,
      timestamp: performance.now()
    };
  }
}

export class StabilityAnalyzer {
  analyze(context) {
    const { currentState, parameters } = context;
    
    if (!currentState || !parameters) return null;

    const { omega, delta, dt, alpha, beta, gamma } = parameters;
    
    // Numerical stability assessment
    const maxHarmonicFreq = omega * 229; // Largest prime in 50-harmonic system
    const nyquistLimit = 1 / (2 * dt);
    
    const stabilityMetrics = {
      nyquistRatio: maxHarmonicFreq / (nyquistLimit * 0.1),
      dampingMin: Math.min(alpha, beta, gamma),
      harmonicDecay: delta,
      stateFinite: currentState.every(val => isFinite(val))
    };

    const stabilityScore = this.calculateStabilityScore(stabilityMetrics);
    
    return {
      metrics: stabilityMetrics,
      score: stabilityScore,
      status: this.getStabilityStatus(stabilityScore),
      warnings: this.generateStabilityWarnings(stabilityMetrics),
      timestamp: performance.now()
    };
  }

  calculateStabilityScore(metrics) {
    let score = 1.0;
    
    if (metrics.nyquistRatio > 1.0) score *= 0.5;
    if (metrics.dampingMin < 0.005) score *= 0.7;
    if (metrics.harmonicDecay > 0.1) score *= 0.8;
    if (!metrics.stateFinite) score = 0.0;
    
    return Math.max(0, Math.min(1, score));
  }

  getStabilityStatus(score) {
    if (score > 0.8) return 'Stable';
    if (score > 0.5) return 'Marginal';
    if (score > 0.2) return 'Unstable';
    return 'Critical';
  }

  generateStabilityWarnings(metrics) {
    const warnings = [];
    
    if (metrics.nyquistRatio > 1.0) {
      warnings.push('High frequency content may cause instability');
    }
    if (metrics.dampingMin < 0.005) {
      warnings.push('Low damping parameters may cause divergence');
    }
    if (metrics.harmonicDecay > 0.1) {
      warnings.push('High harmonic decay may affect convergence');
    }
    if (!metrics.stateFinite) {
      warnings.push('CRITICAL: Non-finite values detected');
    }
    
    return warnings;
  }
}

// Global access for debugging and console interaction
if (typeof window !== 'undefined') {
  window.MathematicalAnalysisScheduler = MathematicalAnalysisScheduler;
}