# Silent Spiral 12D - API Documentation

## Configuration API (`config.js`)

### ConfigManager Class

The `ConfigManager` class provides centralized parameter management with validation and observer pattern support.

#### Static Properties

##### `DEFAULT_PARAMS`
```javascript
static DEFAULT_PARAMS = {
  alpha: 0.1,    // Velocity damping coefficient
  beta: 0.1,     // Velocity damping coefficient  
  gamma: 0.1,    // Velocity damping coefficient
  omega: 1.0,    // Primary oscillation frequency
  eta: 0.1,      // Modulation amplitude
  theta: 0.0,    // Phase offset
  delta: 0.05,   // Harmonic damping coefficient
  steps: 10000,  // Number of integration steps
  dt: 0.02       // Time step size
}
```

##### `PARAM_RANGES`
```javascript
static PARAM_RANGES = {
  alpha: { min: 0.01, max: 0.5, step: 0.01 },
  beta: { min: 0.01, max: 0.5, step: 0.01 },
  gamma: { min: 0.01, max: 0.5, step: 0.01 },
  omega: { min: 0.1, max: 5.0, step: 0.1 },
  eta: { min: 0, max: 1.0, step: 0.01 },
  theta: { min: 0, max: 6.28, step: 0.01 },
  delta: { min: 0.01, max: 0.2, step: 0.01 },
  steps: { min: 1000, max: 50000, step: 1000 },
  dt: { min: 0.001, max: 0.1, step: 0.001 }
}
```

##### `PRESETS`
```javascript
static PRESETS = {
  'Default Cathedral': { /* default parameters */ },
  'Harmonic Resonance': { /* resonance parameters */ },
  'Chaotic Spiral': { /* chaos parameters */ },
  'Gentle Waves': { /* smooth parameters */ },
  'Mathematical Beauty': { /* golden ratio parameters */ }
}
```

#### Constructor

```javascript
new ConfigManager()
```
Creates a new configuration manager instance with default parameters.

#### Methods

##### `validateParam(name, value)`
```javascript
validateParam(name: string, value: number): boolean
```
**Parameters:**
- `name`: Parameter name
- `value`: Parameter value to validate

**Returns:** `true` if valid

**Throws:** `Error` if parameter is invalid

**Example:**
```javascript
try {
  config.validateParam('alpha', 0.5);
  console.log('Valid parameter');
} catch (error) {
  console.error('Invalid:', error.message);
}
```

##### `setParam(name, value)`
```javascript
setParam(name: string, value: number): void
```
**Parameters:**
- `name`: Parameter name
- `value`: Parameter value

**Throws:** `Error` if parameter is invalid

**Example:**
```javascript
config.setParam('omega', 2.5);
```

##### `getParam(name)`
```javascript
getParam(name: string): number
```
**Parameters:**
- `name`: Parameter name

**Returns:** Parameter value

**Example:**
```javascript
const omega = config.getParam('omega');
```

##### `getAllParams()`
```javascript
getAllParams(): object
```
**Returns:** Copy of all parameters

**Example:**
```javascript
const params = config.getAllParams();
console.log(params.alpha); // 0.1
```

##### `loadPreset(presetName)`
```javascript
loadPreset(presetName: string): void
```
**Parameters:**
- `presetName`: Name of preset to load

**Throws:** `Error` if preset not found

**Example:**
```javascript
config.loadPreset('Harmonic Resonance');
```

##### `addObserver(callback)`
```javascript
addObserver(callback: function): void
```
**Parameters:**
- `callback`: Function called on parameter changes

**Callback Signature:**
```javascript
(paramName: string, value: any, allParams: object) => void
```

**Example:**
```javascript
config.addObserver((name, value, params) => {
  console.log(`${name} changed to ${value}`);
});
```

##### `removeObserver(callback)`
```javascript
removeObserver(callback: function): void
```
**Parameters:**
- `callback`: Observer function to remove

##### `reset()`
```javascript
reset(): void
```
Resets all parameters to default values and notifies observers.

## Mathematical API (`spiral.js`)

### `generateSpiral(params, steps, dt)`
```javascript
generateSpiral(
  params: object, 
  steps: number = 20000, 
  dt: number = 0.01
): number[][]
```

**Parameters:**
- `params`: Object containing spiral parameters
- `steps`: Number of integration steps (1-100000)
- `dt`: Time step size (0.001-1.0)

**Returns:** Array of 12D points `[[x,y,z,u,v,w,h1,h2,h3,h4,h5,h6], ...]`

**Throws:** 
- `Error` if parameters are invalid
- `Error` if numerical instability detected

**Example:**
```javascript
const params = {
  alpha: 0.1, beta: 0.1, gamma: 0.1,
  omega: 1.0, eta: 0.1, theta: 0.0, delta: 0.05
};

try {
  const points = generateSpiral(params, 10000, 0.02);
  console.log(`Generated ${points.length} points`);
} catch (error) {
  console.error('Spiral generation failed:', error);
}
```

**Mathematical System:**
The function implements a 12-dimensional dynamical system:

```
Position: dx/dt = u, dy/dt = v, dz/dt = w
Velocity: du/dt = -α·u + cos(y)·v + φ̇
          dv/dt = -β·v + cos(z)·w + φ̇  
          dw/dt = -γ·w + cos(x)·u + φ̇
Harmonics: dh₁/dt = sin(2π·φ) - δ·h₁
          dh₂/dt = cos(3π·φ) - δ·h₂
          ...
Where: φ = cos(ω·t) + η·cos(θ)
       φ̇ = -ω·sin(ω·t)
```

## Projection API (`projection.js`)

### `projectSpiral(points)`
```javascript
projectSpiral(points: number[][]): object
```

**Parameters:**
- `points`: Array of 12D points from `generateSpiral()`

**Returns:** Object with projected data:
```javascript
{
  X: number[],      // X coordinates (PCA component 1)
  Y: number[],      // Y coordinates (PCA component 2)  
  Z: number[],      // Z coordinates (PCA component 3)
  color: number[][], // RGB color values [h1,h2,h3]
  size: number[],   // Point sizes from h4
  opacity: number[] // Point opacity from h5
}
```

**Example:**
```javascript
const points = generateSpiral(params, 10000, 0.02);
const {X, Y, Z, color, size, opacity} = projectSpiral(points);

console.log(`Projected to ${X.length} 3D points`);
console.log(`Color range: ${color[0]} to ${color[color.length-1]}`);
```

**Projection Method:**
- Uses Principal Component Analysis (PCA) to reduce 12D → 3D
- Preserves maximum variance in the data
- Color mapping: h₁,h₂,h₃ → RGB channels
- Size mapping: |h₄| → point size  
- Opacity mapping: tanh(h₅) → transparency

## Visualization API (`visualization.js`)

### `initScene()`
```javascript
initScene(): object
```

**Returns:** Object with Three.js components:
```javascript
{
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera,
  renderer: THREE.WebGLRenderer,
  spiral: THREE.Points
}
```

**Features:**
- WebGL capability detection with fallback
- High-performance renderer configuration
- Responsive design support
- Error boundary protection

**Example:**
```javascript
try {
  const {scene, camera, renderer, spiral} = initScene();
  console.log('Scene initialized successfully');
} catch (error) {
  console.error('Scene initialization failed:', error);
}
```

### `animate(scene, camera, renderer, spiral)`
```javascript
animate(
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera, 
  renderer: THREE.WebGLRenderer,
  spiral: THREE.Points
): void
```

**Parameters:**
- `scene`: Three.js scene object
- `camera`: Three.js camera object
- `renderer`: Three.js renderer object
- `spiral`: Three.js points object

**Behavior:**
- Starts continuous animation loop
- Applies automatic rotation to spiral
- Updates geometry positions each frame
- Uses `requestAnimationFrame` for smooth animation

## Visualization Modes API (`visualizationModes.js`)

### `VisualizationModeManager` Class

The `VisualizationModeManager` class provides switchable 3D rendering modes for enhanced visualization.

#### Constructor
```javascript
new VisualizationModeManager(scene: THREE.Scene, spiral: THREE.Object3D)
```

#### Methods

##### `switchMode(mode, X, Y, Z, colors, size, opacity)`
```javascript
switchMode(
  mode: string,
  X: number[],
  Y: number[], 
  Z: number[],
  colors: number[],
  size: number[],
  opacity: number[]
): THREE.Object3D
```

**Parameters:**
- `mode`: Visualization mode ('points', 'line', 'tube')
- `X, Y, Z`: 3D coordinate arrays from PCA projection
- `colors`: RGB color array for vertex coloring
- `size`: Point/tube size array from h₄ harmonic
- `opacity`: Transparency array from h₅ harmonic

**Returns:** Three.js object (Points, Line, or Mesh)

**Visualization Modes:**
- **'points'**: Individual particles using THREE.Points + PointsMaterial
- **'line'**: Connected path using THREE.Line + LineBasicMaterial  
- **'tube'**: Volumetric form using THREE.Mesh + TubeGeometry + MeshPhongMaterial

##### `updateGeometry(X, Y, Z, colors, size, opacity)`
```javascript
updateGeometry(
  X: number[],
  Y: number[], 
  Z: number[],
  colors: number[],
  size: number[],
  opacity: number[]
): THREE.Object3D
```
Updates current visualization with new data while preserving the selected mode.

##### `getCurrentMode()`
```javascript
getCurrentMode(): string
```
Returns the currently active visualization mode.

**Example Usage:**
```javascript
import { VisualizationModeManager } from './visualizationModes.js';

const modeManager = new VisualizationModeManager(scene, null);

// Switch to tube mode with spiral data
const spiral = modeManager.switchMode('tube', X, Y, Z, colors, size, opacity);

// Update with new parameters
const newSpiral = modeManager.updateGeometry(newX, newY, newZ, newColors, newSize, newOpacity);
```

## Controls API (`controls.js`)

### `setupControls(spiral, controls, ambientLight, directionalLight, rimLight, modeManager)`
```javascript
setupControls(
  spiral: THREE.Object3D,
  controls: OrbitControls,
  ambientLight: THREE.AmbientLight,
  directionalLight: THREE.DirectionalLight, 
  rimLight: THREE.DirectionalLight,
  modeManager: VisualizationModeManager
): void
```

**Parameters:**
- `spiral`: Three.js object to control
- `controls`: OrbitControls instance for 3D navigation
- `ambientLight`: Ambient lighting object
- `directionalLight`: Main directional light
- `rimLight`: Rim lighting for edge enhancement
- `modeManager`: Visualization mode manager for mode switching

**Features:**
- Creates dat.GUI interface
- Adds preset selector dropdown
- Implements parameter controllers with validation
- Provides loading indicators
- Includes reset functionality
- Subscribes to configuration changes

**GUI Structure:**
```
Silent Spiral Controls
├── Presets
│   └── Preset Selector
├── Basic Parameters  
│   ├── alpha (0.01 - 0.5)
│   ├── beta (0.01 - 0.5)
│   ├── gamma (0.01 - 0.5)
│   ├── omega (0.1 - 5.0)
│   ├── eta (0.0 - 1.0)
│   ├── theta (0.0 - 6.28)
│   └── delta (0.01 - 0.2)
├── Advanced Settings
│   ├── steps (1000 - 50000)
│   └── dt (0.001 - 0.1)
└── Reset Button
```

## Error Handling

### Common Error Types

#### Parameter Validation Errors
```javascript
// Invalid parameter name
config.setParam('invalid', 0.5);
// Error: Unknown parameter: invalid

// Value out of range  
config.setParam('alpha', 2.0);
// Error: Parameter alpha must be between 0.01 and 0.5

// Invalid type
config.setParam('omega', 'invalid');
// Error: Parameter omega must be a number
```

#### Spiral Generation Errors
```javascript
// Invalid parameters object
generateSpiral(null);
// Error: Parameters must be provided as an object

// Steps out of range
generateSpiral(params, -100);
// Error: Steps must be an integer between 1 and 100000

// Invalid time step
generateSpiral(params, 1000, -0.1);
// Error: Time step dt must be a positive number <= 1
```

#### Preset Errors
```javascript
// Unknown preset
config.loadPreset('Unknown Preset');
// Error: Unknown preset: Unknown Preset
```

### Error Recovery
All functions include error boundaries:
- Input validation prevents invalid states
- Numerical instability detection stops runaway calculations  
- Fallback behaviors maintain application stability
- User-friendly error messages guide correction

## Usage Examples

### Basic Usage
```javascript
import { config } from './config.js';
import { generateSpiral } from './spiral.js';
import { projectSpiral } from './projection.js';

// Set parameters
config.setParam('omega', 2.0);
config.setParam('eta', 0.5);

// Generate spiral
const params = config.getAllParams();
const points = generateSpiral(params);

// Project to 3D
const {X, Y, Z, color} = projectSpiral(points);
```

### Advanced Usage with Observers
```javascript
// Subscribe to parameter changes
config.addObserver((name, value, allParams) => {
  if (name === 'omega') {
    console.log(`Frequency changed to ${value}`);
    // Regenerate spiral automatically
    updateVisualization();
  }
});

// Load preset and observe changes
config.loadPreset('Chaotic Spiral');
// Observer will be called for 'preset' event
```

### Error Handling Best Practices
```javascript
function safeSpiral() {
  try {
    // Validate configuration
    const params = config.getAllParams();
    
    // Generate with error handling
    const points = generateSpiral(params, 10000, 0.02);
    
    // Project with fallback
    const projection = projectSpiral(points);
    
    return projection;
  } catch (error) {
    console.error('Spiral generation failed:', error);
    
    // Return default/fallback data
    return {
      X: [0], Y: [0], Z: [0], 
      color: [[1,1,1]], size: [1], opacity: [1]
    };
  }
}
```

## NASA Integration API

### `NASADataService` Class

The `NASADataService` provides interface to NASA data through the NASA MCP server.

#### Constructor
```javascript
new NASADataService()
```
Creates a new NASA data service with default configuration.

#### Connection Methods

##### `connect(serverUrl)`
```javascript
connect(serverUrl?: string): Promise<boolean>
```
**Parameters:**
- `serverUrl`: NASA MCP server URL (default: 'http://localhost:3000')

**Returns:** Promise resolving to connection success

**Example:**
```javascript
const success = await nasaDataService.connect('http://localhost:3000');
if (success) {
  console.log('Connected to NASA MCP server');
}
```

#### Data Fetching Methods

##### `fetchAPOD(date)`
```javascript
fetchAPOD(date?: string): Promise<object>
```
**Parameters:**
- `date`: Date in YYYY-MM-DD format (optional, defaults to today)

**Returns:** APOD data object:
```javascript
{
  title: string,
  explanation: string,
  url: string,
  date: string
}
```

##### `fetchMarsRoverPhotos(sol, rover)`
```javascript
fetchMarsRoverPhotos(sol?: number, rover?: string): Promise<object>
```
**Parameters:**
- `sol`: Mars Sol (day) number (optional)
- `rover`: Rover name - 'curiosity', 'opportunity', 'spirit' (default: 'curiosity')

**Returns:** Mars rover data object with photos array

##### `fetchNearEarthObjects(startDate, endDate)`
```javascript
fetchNearEarthObjects(startDate?: string, endDate?: string): Promise<object>
```
**Parameters:**
- `startDate`: Start date in YYYY-MM-DD format (optional)
- `endDate`: End date in YYYY-MM-DD format (optional)

**Returns:** Near Earth Objects data with orbital information

##### `fetchSpaceWeatherData()`
```javascript
fetchSpaceWeatherData(): Promise<object>
```
**Returns:** Current space weather data including solar activity

#### Data Transformation Methods

##### `transformAPODToCoordinates(apodData)`
```javascript
transformAPODToCoordinates(apodData: object): number[][]
```
**Parameters:**
- `apodData`: APOD data object from fetchAPOD()

**Returns:** Array of 12D coordinate arrays for mathematical visualization

**Algorithm:** Converts title characters to harmonic coordinates using character codes and trigonometric functions

##### `transformNEOToCoordinates(neoData)`
```javascript
transformNEOToCoordinates(neoData: object): number[][]
```
**Parameters:**
- `neoData`: Near Earth Objects data from fetchNearEarthObjects()

**Returns:** Array of 12D coordinates representing asteroid properties

**Algorithm:** Maps distance, velocity, and diameter to 12D space with orbital mechanics

##### `transformMarsPhotosToCoordinates(marsData)`
```javascript
transformMarsPhotosToCoordinates(marsData: object): number[][]
```
**Parameters:**
- `marsData`: Mars rover data from fetchMarsRoverPhotos()

**Returns:** Array of 12D coordinates representing mission timeline and camera data

### `NASAVisualizationModes` Class

The `NASAVisualizationModes` creates specialized visualizations for NASA data.

#### Constructor
```javascript
new NASAVisualizationModes(scene: THREE.Scene, modeManager: VisualizationModeManager)
```

#### Visualization Methods

##### `switchToNASAMode(nasaType, ...params)`
```javascript
switchToNASAMode(nasaType: string, ...params: any[]): Promise<THREE.Object3D>
```
**Parameters:**
- `nasaType`: Type of NASA data - 'apod', 'mars', 'asteroids', 'spaceWeather'
- `...params`: Type-specific parameters

**NASA Type Parameters:**
- `'apod'`: date (optional)
- `'mars'`: sol, rover (optional)
- `'asteroids'`: startDate, endDate (optional)
- `'spaceWeather'`: none

**Returns:** Promise resolving to Three.js visualization object

##### `createAPODVisualization(date)`
```javascript
createAPODVisualization(date?: string): Promise<THREE.Object3D>
```
Creates cosmic point cloud visualization from APOD data with harmonic color mapping.

##### `createMarsRoverVisualization(sol, rover)`
```javascript
createMarsRoverVisualization(sol?: number, rover?: string): Promise<THREE.Object3D>
```
Creates Mars-themed visualization with red planet color palette.

##### `createAsteroidVisualization(startDate, endDate)`
```javascript
createAsteroidVisualization(startDate?: string, endDate?: string): Promise<THREE.Object3D>
```
Creates asteroid field visualization with velocity/distance-based styling.

#### Animation Methods

##### `updateNASAAnimation()`
```javascript
updateNASAAnimation(): void
```
Updates NASA visualization animations including rotation and pulsing effects.

#### Utility Methods

##### `getCachedNASAData(type)`
```javascript
getCachedNASAData(type: string): object | null
```
**Parameters:**
- `type`: Data type - 'apod', 'mars', 'asteroids'

**Returns:** Cached data or null if not cached

##### `clearNASACache()`
```javascript
clearNASACache(): void
```
Clears all cached NASA data.

##### `dispose()`
```javascript
dispose(): void
```
Cleans up NASA visualizations and releases GPU resources.

### Enhanced GUI Methods

The `CleanGUI` class now includes NASA-specific controls:

##### `handleNASAConnect()`
```javascript
handleNASAConnect(): Promise<void>
```
Tests connection to NASA MCP server and provides user feedback.

##### `handleNASAFetchAndVisualize()`
```javascript
handleNASAFetchAndVisualize(): Promise<void>
```
Fetches NASA data based on current settings and creates visualization.

##### `handleNASAClear()`
```javascript
handleNASAClear(): void
```
Removes current NASA visualization from scene.

## NASA Integration Usage Examples

### Complete APOD Workflow
```javascript
import { nasaDataService } from './nasaDataService.js';
import { NASAVisualizationModes } from './nasaVisualizationModes.js';

// Setup
const nasaViz = new NASAVisualizationModes(scene, modeManager);

// Connect and visualize
await nasaDataService.connect();
const visualization = await nasaViz.switchToNASAMode('apod', '2024-01-01');
```

### Mars Rover Timeline Visualization
```javascript
// Visualize Curiosity rover Sol 1000 data
const marsViz = await nasaViz.switchToNASAMode('mars', 1000, 'curiosity');

// The visualization shows mission timeline as radius
// Camera data as harmonic components
// Earth date cycles as Z-axis variation
```

### Asteroid Approach Visualization
```javascript
// Visualize asteroids approaching Earth in January 2024
const asteroidViz = await nasaViz.switchToNASAMode('asteroids', '2024-01-01', '2024-01-31');

// Distance from Earth mapped to radius
// Velocity mapped to color intensity
// Size mapped to point scale
```

### Error Handling with NASA Data
```javascript
try {
  await nasaDataService.connect('http://localhost:3000');
  const viz = await nasaViz.switchToNASAMode('apod');
  
  if (viz) {
    console.log('NASA visualization created successfully');
  }
} catch (error) {
  console.error('NASA integration failed:', error);
  // Falls back to mathematical visualization mode
}
```

This API provides a robust foundation for both mathematical visualization and NASA data integration with comprehensive error handling, parameter validation, and extensible architecture.