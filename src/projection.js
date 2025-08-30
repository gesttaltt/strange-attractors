import { PCA } from 'ml-pca';

// Temporal-Dimensional Projection: project 12D -> 3D + encodings
export function projectSpiral(points) {
  const pca = new PCA(points);
  const proj = pca.predict(points, {nComponents:3}).to2DArray();

  const X = proj.map(p => p[0]);
  const Y = proj.map(p => p[1]);
  const Z = proj.map(p => p[2]);

  // Use h1-h6 for encodings
  const h1 = points.map(p => p[6]);
  const h2 = points.map(p => p[7]);
  const h3 = points.map(p => p[8]);
  const h4 = points.map(p => p[9]);
  const h5 = points.map(p => p[10]);
  const h6 = points.map(p => p[11]);

  const color = h1.map((v,i) => [h1[i],h2[i],h3[i]]);
  const size = h4.map(v => Math.abs(v)*2 + 1);
  const opacity = h5.map(v => 0.5 + 0.5*Math.tanh(v));

  return {X,Y,Z,color,size,opacity};
}
