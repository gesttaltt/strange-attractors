// Manifold Convergence Analysis with Extended Prime Harmonics
import { generateSpiral } from './spiral.js';
import { config } from './config.js';
import { EXTENDED_PRIMES, analyzePrimeDensity } from './primes.js';

export function analyzeManifoldConvergence(params, steps = 20000) {
  console.log('🔬 Analyzing manifold convergence with extended prime harmonics...');
  
  const points = generateSpiral(params, steps, params.dt);
  
  // Calculate dimensional variance for each harmonic
  const harmonicVariances = [];
  const numHarmonics = points[0].length - 6; // Exclude x,y,z,u,v,w
  const primes = EXTENDED_PRIMES.slice(0, numHarmonics);
  
  for (let h = 0; h < numHarmonics; h++) {
    const harmonicValues = points.map(p => p[6 + h]);
    const mean = harmonicValues.reduce((sum, val) => sum + val, 0) / harmonicValues.length;
    const variance = harmonicValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / harmonicValues.length;
    const rms = Math.sqrt(variance);
    harmonicVariances.push({ 
      prime: primes[h] || 0, 
      variance, 
      rms,
      frequency: primes[h] * Math.PI,
      index: h
    });
  }
  
  // Analyze final coil shape characteristics
  const finalSegment = points.slice(-1000); // Last 1000 points
  const initialSegment = points.slice(0, 1000); // First 1000 points
  
  // Calculate spatial distribution changes
  const finalSpatialSpread = calculateSpatialSpread(finalSegment);
  const initialSpatialSpread = calculateSpatialSpread(initialSegment);
  
  // Calculate harmonic convergence rate
  const convergenceRate = calculateConvergenceRate(points);
  
  // Analyze prime density impact
  const primeDensity = analyzePrimeDensity(primes[primes.length - 1]);
  
  console.log('📊 Extended Manifold Analysis Results:');
  console.log(`   Total harmonics: ${numHarmonics} (primes 2 to ${primes[primes.length-1]})`);
  console.log(`   Prime density: ${(primeDensity.averageDensity * 100).toFixed(2)}%`);
  console.log(`   Initial spatial spread: ${initialSpatialSpread.toFixed(4)}`);
  console.log(`   Final spatial spread: ${finalSpatialSpread.toFixed(4)}`);
  console.log(`   Convergence ratio: ${(finalSpatialSpread/initialSpatialSpread).toFixed(4)}`);
  console.log(`   Convergence rate: ${convergenceRate.toFixed(6)}`);
  
  // Identify dominant harmonic frequencies
  const dominantHarmonics = harmonicVariances
    .sort((a, b) => b.rms - a.rms)
    .slice(0, 10);
  
  console.log('🎵 Dominant harmonic frequencies (top 10):');
  dominantHarmonics.forEach((h, i) => {
    console.log(`   ${i+1}. Prime ${h.prime} (index ${h.index}): RMS = ${h.rms.toFixed(6)}, freq = ${h.frequency.toFixed(2)}`);
  });
  
  // Harmonic energy distribution analysis
  const totalEnergy = harmonicVariances.reduce((sum, h) => sum + h.rms, 0);
  const energyDistribution = harmonicVariances.map(h => ({
    prime: h.prime,
    energyPercent: (h.rms / totalEnergy * 100).toFixed(2)
  })).slice(0, 20);
  
  console.log('⚡ Energy distribution (first 20 harmonics):');
  energyDistribution.forEach((h, i) => {
    console.log(`   Prime ${h.prime}: ${h.energyPercent}% of total energy`);
  });
  
  return {
    harmonicVariances,
    spatialConvergence: finalSpatialSpread/initialSpatialSpread,
    convergenceRate,
    dominantHarmonics,
    totalPoints: points.length
  };
}

function calculateSpatialSpread(segment) {
  const centroid = [0, 0, 0];
  segment.forEach(p => {
    centroid[0] += p[0];
    centroid[1] += p[1];
    centroid[2] += p[2];
  });
  centroid[0] /= segment.length;
  centroid[1] /= segment.length;
  centroid[2] /= segment.length;
  
  let totalDistance = 0;
  segment.forEach(p => {
    const dx = p[0] - centroid[0];
    const dy = p[1] - centroid[1];
    const dz = p[2] - centroid[2];
    totalDistance += Math.sqrt(dx*dx + dy*dy + dz*dz);
  });
  
  return totalDistance / segment.length;
}

function calculateConvergenceRate(points) {
  const windowSize = 1000;
  const spreads = [];
  
  for (let i = 0; i < points.length - windowSize; i += windowSize) {
    const segment = points.slice(i, i + windowSize);
    spreads.push(calculateSpatialSpread(segment));
  }
  
  if (spreads.length < 2) return 0;
  
  // Linear regression on log(spread) vs time to find convergence rate
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
  spreads.forEach((spread, i) => {
    const x = i;
    const y = Math.log(spread);
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumXX += x * x;
  });
  
  const n = spreads.length;
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  
  return slope; // Negative slope indicates convergence
}

// Auto-run analysis when module loads
if (typeof window !== 'undefined') {
  window.analyzeManifold = () => {
    const params = config.getAllParams();
    return analyzeManifoldConvergence(params);
  };
}