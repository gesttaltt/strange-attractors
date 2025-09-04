// Prime number generation and utilities for manifold harmonics

function sieveOfEratosthenes(limit) {
  const sieve = new Array(limit + 1).fill(true);
  sieve[0] = sieve[1] = false;
  
  for (let i = 2; i * i <= limit; i++) {
    if (sieve[i]) {
      for (let j = i * i; j <= limit; j += i) {
        sieve[j] = false;
      }
    }
  }
  
  const primes = [];
  for (let i = 2; i <= limit; i++) {
    if (sieve[i]) primes.push(i);
  }
  
  return primes;
}

// Generate primes up to 1000 for extensive harmonic analysis
export const EXTENDED_PRIMES = sieveOfEratosthenes(1000);

// Categorize primes by harmonic behavior
export const PRIME_CATEGORIES = {
  // Low frequency fundamentals (first 10 primes)
  fundamentals: EXTENDED_PRIMES.slice(0, 10),
  
  // Mid-range harmonics (primes 11-50)
  midRange: EXTENDED_PRIMES.slice(10, 50),
  
  // High frequency overtones (primes 51-100) 
  overtones: EXTENDED_PRIMES.slice(50, 100),
  
  // Ultra-high frequencies (primes 101+)
  ultraHigh: EXTENDED_PRIMES.slice(100)
};

// Optimized harmonic weight function
export function getHarmonicWeight(prime, index, totalPrimes) {
  // Strong exponential decay for numerical stability
  const decayFactor = Math.exp(-index / (totalPrimes * 0.1));
  
  // Reduced resonance enhancement
  const resonanceBoost = isPrimeResonant(prime) ? 1.1 : 1.0;
  
  // Much smaller scale to prevent overflow
  const frequencyScale = 1 / (prime * prime); // Quadratic decay
  
  // Additional clamping for stability
  const weight = decayFactor * resonanceBoost * frequencyScale;
  return Math.min(weight, 0.01); // Hard limit
}

function isPrimeResonant(prime) {
  // Special resonance for primes in arithmetic progressions
  const resonantPrimes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47];
  return resonantPrimes.includes(prime);
}

// Advanced harmonic coupling functions
export function calculateHarmonicCoupling(harmonics, primes, time, couplingStrength = 0.001) {
  let coupling = 0;
  const numHarmonics = Math.min(harmonics.length, primes.length);
  
  // Direct harmonic coupling with clamping
  for (let i = 0; i < numHarmonics; i++) {
    const weight = getHarmonicWeight(primes[i], i, numHarmonics);
    const term = harmonics[i] * weight * Math.cos(primes[i] * time * 0.001);
    coupling += Math.tanh(term); // Prevent overflow
  }
  
  // Simplified cross-harmonic coupling (first 5 harmonics only)
  for (let i = 0; i < Math.min(5, numHarmonics); i++) {
    for (let j = i + 1; j < Math.min(5, numHarmonics); j++) {
      const crossCoupling = Math.tanh(harmonics[i]) * Math.tanh(harmonics[j]) * 
                           Math.sin((primes[i] + primes[j]) * time * 0.0001);
      coupling += crossCoupling * 0.0001;
    }
  }
  
  // Final clamping
  return Math.tanh(coupling * couplingStrength);
}

// Analyze prime density distribution
export function analyzePrimeDensity(maxPrime = 1000) {
  const primes = sieveOfEratosthenes(maxPrime);
  const densityWindows = [];
  const windowSize = 100;
  
  for (let start = 0; start < maxPrime; start += windowSize) {
    const end = Math.min(start + windowSize, maxPrime);
    const windowPrimes = primes.filter(p => p >= start && p < end);
    densityWindows.push({
      range: `${start}-${end}`,
      count: windowPrimes.length,
      density: windowPrimes.length / windowSize
    });
  }
  
  return {
    totalPrimes: primes.length,
    averageDensity: primes.length / maxPrime,
    densityWindows
  };
}

console.log(`🔢 Generated ${EXTENDED_PRIMES.length} primes up to 1000`);
console.log(`   Fundamentals: ${PRIME_CATEGORIES.fundamentals.length} primes`);
console.log(`   Mid-range: ${PRIME_CATEGORIES.midRange.length} primes`);  
console.log(`   Overtones: ${PRIME_CATEGORIES.overtones.length} primes`);
console.log(`   Ultra-high: ${PRIME_CATEGORIES.ultraHigh.length} primes`);