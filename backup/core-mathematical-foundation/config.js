// Centralized Configuration Management
// Provides validation, presets, and parameter management

export class ConfigManager {
  static DEFAULT_PARAMS = {
    alpha: 0.1,
    beta: 0.1,
    gamma: 0.1,
    omega: 1.0,
    eta: 0.1,
    theta: 0.0,
    delta: 0.02, // Reduced for stability with extended harmonics
    steps: 15000, // Increased for better convergence analysis
    dt: 0.015 // Slightly reduced for numerical stability
  };

  static PARAM_RANGES = {
    alpha: { min: 0.01, max: 0.5, step: 0.01 },
    beta: { min: 0.01, max: 0.5, step: 0.01 },
    gamma: { min: 0.01, max: 0.5, step: 0.01 },
    omega: { min: 0.1, max: 5.0, step: 0.1 },
    eta: { min: 0, max: 1.0, step: 0.01 },
    theta: { min: 0, max: Math.PI * 2, step: 0.01 },
    delta: { min: 0.01, max: 0.2, step: 0.01 },
    steps: { min: 1000, max: 50000, step: 1000 },
    dt: { min: 0.001, max: 0.1, step: 0.001 }
  };

  static PRESETS = {
    'Default Cathedral': {
      alpha: 0.1, beta: 0.1, gamma: 0.1, omega: 1.0, 
      eta: 0.1, theta: 0.0, delta: 0.02, steps: 15000, dt: 0.015
    },
    'Harmonic Resonance': {
      alpha: 0.05, beta: 0.08, gamma: 0.12, omega: 2.0, 
      eta: 0.6, theta: 1.57, delta: 0.015, steps: 12000, dt: 0.012
    },
    'Chaotic Spiral': {
      alpha: 0.25, beta: 0.15, gamma: 0.3, omega: 3.5, 
      eta: 0.8, theta: 3.14, delta: 0.025, steps: 10000, dt: 0.01
    },
    'Gentle Waves': {
      alpha: 0.02, beta: 0.03, gamma: 0.02, omega: 0.5, 
      eta: 0.2, theta: 0.5, delta: 0.015, steps: 20000, dt: 0.018
    },
    'Mathematical Beauty': {
      alpha: 0.15, beta: 0.11, gamma: 0.13, omega: 1.618, 
      eta: 0.382, theta: 2.618, delta: 0.02, steps: 15000, dt: 0.015
    }
  };

  constructor() {
    this.params = { ...ConfigManager.DEFAULT_PARAMS };
    this.observers = [];
    this.notificationTimeout = null;
    this.pendingUpdates = new Set();
  }

  validateParam(name, value) {
    const range = ConfigManager.PARAM_RANGES[name];
    if (!range) {
      throw new Error(`Unknown parameter: ${name}`);
    }

    if (typeof value !== 'number' || isNaN(value)) {
      throw new Error(`Parameter ${name} must be a number`);
    }

    if (value < range.min || value > range.max) {
      throw new Error(`Parameter ${name} must be between ${range.min} and ${range.max}`);
    }

    return true;
  }

  setParam(name, value) {
    this.validateParam(name, value);
    this.params[name] = value;
    this.notifyObservers(name, value);
  }

  getParam(name) {
    return this.params[name];
  }

  getAllParams() {
    return { ...this.params };
  }

  loadPreset(presetName) {
    const preset = ConfigManager.PRESETS[presetName];
    if (!preset) {
      throw new Error(`Unknown preset: ${presetName}`);
    }

    // Validate all preset parameters before applying
    Object.entries(preset).forEach(([name, value]) => {
      this.validateParam(name, value);
    });

    // Apply all parameters atomically
    Object.entries(preset).forEach(([name, value]) => {
      this.params[name] = value;
    });

    // Add stability validation for extended harmonics
    this.validateSystemStability();

    this.debouncedNotifyObservers('preset', presetName);
  }

  validateSystemStability() {
    const { omega, delta, dt } = this.params;
    
    // Check for potential numerical instability with 50 harmonics
    const maxFrequency = omega * 229; // Largest prime in first 50
    const nyquistLimit = 1 / (2 * dt);
    
    if (maxFrequency > nyquistLimit * 0.1) {
      console.warn('⚠️ High frequency content may cause instability. Consider reducing omega or increasing dt.');
    }
    
    if (delta > 0.1) {
      console.warn('⚠️ Large delta value may cause numerical issues with extended harmonics.');
    }
  }

  addObserver(callback) {
    this.observers.push(callback);
  }

  removeObserver(callback) {
    this.observers = this.observers.filter(obs => obs !== callback);
  }

  debouncedNotifyObservers(paramName, value) {
    this.pendingUpdates.add(paramName);
    
    if (this.notificationTimeout) {
      clearTimeout(this.notificationTimeout);
    }
    
    this.notificationTimeout = setTimeout(() => {
      const updates = Array.from(this.pendingUpdates);
      this.pendingUpdates.clear();
      this.notificationTimeout = null;
      
      this.observers.forEach(callback => {
        try {
          callback(paramName, value, this.params, updates);
        } catch (error) {
          console.error('Observer error:', error);
        }
      });
    }, 50); // 50ms debounce
  }

  notifyObservers(paramName, value) {
    this.observers.forEach(callback => {
      try {
        callback(paramName, value, this.params);
      } catch (error) {
        console.error('Observer error:', error);
      }
    });
  }

  reset() {
    this.params = { ...ConfigManager.DEFAULT_PARAMS };
    this.notifyObservers('reset', null);
  }
}

export const config = new ConfigManager();