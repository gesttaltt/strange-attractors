// Silent Spiral 12D Cathedral equations with extended prime harmonics
import { EXTENDED_PRIMES, calculateHarmonicCoupling, getHarmonicWeight } from './primes.js';

export function generateSpiral(params, steps=20000, dt=0.01) {
  try {
    // Validate inputs
    if (!params || typeof params !== 'object') {
      throw new Error('Parameters must be provided as an object');
    }
    
    if (!Number.isInteger(steps) || steps < 1 || steps > 100000) {
      throw new Error('Steps must be an integer between 1 and 100000');
    }
    
    if (typeof dt !== 'number' || dt <= 0 || dt > 1) {
      throw new Error('Time step dt must be a positive number <= 1');
    }

    const { alpha, beta, gamma, omega, eta, theta, delta } = params;
    
    // Validate parameters exist and are numbers
    [alpha, beta, gamma, omega, eta, theta, delta].forEach((param, i) => {
      const names = ['alpha', 'beta', 'gamma', 'omega', 'eta', 'theta', 'delta'];
      if (typeof param !== 'number' || isNaN(param)) {
        throw new Error(`Parameter ${names[i]} must be a valid number`);
      }
    });

    // Use first 50 primes for numerical stability with extended harmonics
    const primes = EXTENDED_PRIMES.slice(0, 50);
    const numHarmonics = primes.length;
    
    console.log(`🌀 Generating spiral with ${numHarmonics} prime harmonics (up to prime ${primes[primes.length-1]})`);
    
    // Harmonic amplitude scaling based on prime frequency
    const harmonicScales = primes.map((prime, i) => getHarmonicWeight(prime, i, numHarmonics));
    
    let [x,y,z,u,v,w] = [0.1,0.1,0.1,0,0,0];
    let harmonics = new Array(numHarmonics).fill(0);
    const points = [];

  for (let i=0; i<steps; i++) {
    const phi = Math.cos(omega*i*dt) + eta*Math.cos(theta);
    const phi_dot = -omega * Math.sin(omega*i*dt);

    // Position updates
    const dx = u;
    const dy = v;
    const dz = w;

    // Advanced harmonic coupling with cross-frequency interactions (reduced strength)
    const harmonicCoupling = calculateHarmonicCoupling(harmonics, primes, i * dt, 0.001);
    
    const du = -alpha*u + Math.cos(y)*v + phi_dot + harmonicCoupling;
    const dv = -beta*v + Math.cos(z)*w + phi_dot + harmonicCoupling * 0.8;
    const dw = -gamma*w + Math.cos(x)*u + phi_dot + harmonicCoupling * 1.2;

    // Optimized harmonic evolution with weighted scaling
    const dharmonics = [];
    for (let j = 0; j < numHarmonics; j++) {
      const prime = primes[j];
      const scale = harmonicScales[j];
      const isEven = j % 2 === 0;
      
      // Phase-shifted harmonic oscillations
      const phaseShift = (j * Math.PI) / numHarmonics;
      const harmonicDriver = isEven ? 
        Math.sin(prime * Math.PI * phi + phaseShift) : 
        Math.cos(prime * Math.PI * phi + phaseShift);
        
      // Nonlinear coupling between harmonics (reduced)
      const couplingTerm = j > 0 ? harmonics[j-1] * harmonics[j] * 0.0001 : 0;
      
      // Apply clamping to prevent numerical explosion
      dharmonics[j] = Math.tanh(harmonicDriver * scale - delta * harmonics[j] + couplingTerm);
    }

    // Euler step
    x += dx*dt; y += dy*dt; z += dz*dt;
    u += du*dt; v += dv*dt; w += dw*dt;
    for (let j = 0; j < numHarmonics; j++) {
      harmonics[j] += dharmonics[j] * dt;
    }

    points.push([x, y, z, u, v, w, ...harmonics]);
    
    // Check for numerical instability
    if (!isFinite(x) || !isFinite(y) || !isFinite(z) || 
        !isFinite(u) || !isFinite(v) || !isFinite(w) || 
        harmonics.some(h => !isFinite(h))) {
      console.warn(`Numerical instability detected at step ${i}. Consider reducing time step or adjusting parameters.`);
      break;
    }
  }
  return points;
  } catch (error) {
    console.error('Error in generateSpiral:', error);
    throw error;
  }
}
