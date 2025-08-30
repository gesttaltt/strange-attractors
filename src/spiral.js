// Silent Spiral 12D Cathedral equations
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

    let [x,y,z,u,v,w,h1,h2,h3,h4,h5,h6] = [0.1,0.1,0.1,0,0,0,0,0,0,0,0,0];
    const points = [];

  for (let i=0; i<steps; i++) {
    const phi = Math.cos(omega*i*dt) + eta*Math.cos(theta);
    const phi_dot = -omega * Math.sin(omega*i*dt);

    // Position updates
    const dx = u;
    const dy = v;
    const dz = w;

    // Velocity updates
    const du = -alpha*u + Math.cos(y)*v + phi_dot;
    const dv = -beta*v + Math.cos(z)*w + phi_dot;
    const dw = -gamma*w + Math.cos(x)*u + phi_dot;

    // Harmonics
    const dh1 = Math.sin(2*Math.PI*phi) - delta*h1;
    const dh2 = Math.cos(3*Math.PI*phi) - delta*h2;
    const dh3 = Math.sin(5*Math.PI*phi) - delta*h3;
    const dh4 = Math.cos(7*Math.PI*phi) - delta*h4;
    const dh5 = Math.sin(11*Math.PI*phi) - delta*h5;
    const dh6 = Math.cos(13*Math.PI*phi) - delta*h6;

    // Euler step
    x += dx*dt; y += dy*dt; z += dz*dt;
    u += du*dt; v += dv*dt; w += dw*dt;
    h1 += dh1*dt; h2 += dh2*dt; h3 += dh3*dt;
    h4 += dh4*dt; h5 += dh5*dt; h6 += dh6*dt;

    points.push([x,y,z,u,v,w,h1,h2,h3,h4,h5,h6]);
    
    // Check for numerical instability
    if (!isFinite(x) || !isFinite(y) || !isFinite(z) || 
        !isFinite(u) || !isFinite(v) || !isFinite(w)) {
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
