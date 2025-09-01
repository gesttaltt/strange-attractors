import { PCA } from 'ml-pca';

// Temporal-Dimensional Projection: project 206D -> 3D + encodings
export function projectSpiral(points) {
  console.log(`🔄 Projecting ${points.length} points with ${points[0].length} dimensions...`);
  
  let X, Y, Z;
  
  try {
    // Handle high-dimensional data with preprocessing
    if (points[0].length > 50) {
      console.log('⚡ High-dimensional data detected, using optimized projection...');
      
      // Pre-reduce dimensions using selective sampling for PCA stability
      const sampledData = points.map(point => {
        // Keep all base coordinates (x,y,z,u,v,w) + every 5th harmonic
        const sampled = point.slice(0, 6); // Base coordinates
        for (let i = 6; i < point.length; i += 5) {
          sampled.push(point[i]);
        }
        return sampled;
      });
      
      console.log(`📊 Reduced dimensions: ${points[0].length} → ${sampledData[0].length}`);
      const pca = new PCA(sampledData);
      const proj = pca.predict(sampledData, {nComponents:3}).to2DArray();
      
      X = proj.map(p => p[0] * 10); // Scale up for visibility
      Y = proj.map(p => p[1] * 10);
      Z = proj.map(p => p[2] * 10);
      
      console.log(`✅ Projection complete. Coordinate ranges: X[${Math.min(...X).toFixed(2)}, ${Math.max(...X).toFixed(2)}], Y[${Math.min(...Y).toFixed(2)}, ${Math.max(...Y).toFixed(2)}], Z[${Math.min(...Z).toFixed(2)}, ${Math.max(...Z).toFixed(2)}]`);
      
    } else {
      // Standard PCA for lower dimensions
      console.log('📊 Using standard PCA projection...');
      const pca = new PCA(points);
      const proj = pca.predict(points, {nComponents:3}).to2DArray();
      
      X = proj.map(p => p[0]);
      Y = proj.map(p => p[1]);
      Z = proj.map(p => p[2]);
    }
  } catch (error) {
    console.error('❌ Projection failed:', error);
    // Fallback: use first 3 coordinates directly
    console.log('🔄 Using fallback direct coordinate projection...');
    X = points.map(p => p[0]);
    Y = points.map(p => p[1]); 
    Z = points.map(p => p[2]);
  }

  // Use first 6 harmonics for encodings (backwards compatible)
  const h1 = points.map(p => p[6] || 0);
  const h2 = points.map(p => p[7] || 0);
  const h3 = points.map(p => p[8] || 0);
  const h4 = points.map(p => p[9] || 0);
  const h5 = points.map(p => p[10] || 0);
  const h6 = points.map(p => p[11] || 0);
  
  // Use additional harmonics for enhanced visual complexity
  const harmonicSum = points.map(p => {
    let sum = 0;
    for (let i = 6; i < p.length; i++) {
      sum += (p[i] || 0) * Math.cos(i * 0.1);
    }
    return sum * 0.1;
  });

  const color = h1.map((v,i) => [
    (h1[i] + harmonicSum[i] * 0.5) % 1,
    (h2[i] + harmonicSum[i] * 0.3) % 1,
    (h3[i] + harmonicSum[i] * 0.7) % 1
  ]);
  const size = h4.map((v,i) => Math.abs(v + harmonicSum[i] * 0.2)*2 + 1);
  const opacity = h5.map((v,i) => 0.5 + 0.5*Math.tanh(v + harmonicSum[i] * 0.1));

  return {X,Y,Z,color,size,opacity};
}
