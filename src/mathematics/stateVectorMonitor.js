// 56D State Vector Monitor - Real-time Mathematical State Display
// Mathematical Significance: Foundation for all dynamical systems analysis

export class State56DMonitor {
  constructor(dataPipeline) {
    this.dataPipeline = dataPipeline;
    this.isActive = false;
    this.updateInterval = null;
    this.displayPanel = null;
    
    this.currentState = {
      spatial: { x: 0, y: 0, z: 0 },
      velocity: { u: 0, v: 0, w: 0 },
      harmonics: new Array(50).fill(0),
      metadata: {
        timeStep: 0,
        magnitude: 0,
        harmonicEnergy: 0
      }
    };

    this.displayConfig = {
      precision: 6,
      updateFrequency: 30, // Hz
      colorScheme: {
        spatial: '#3498db',     // Blue for position
        velocity: '#2ecc71',    // Green for velocity  
        harmonics: '#e74c3c',   // Red gradient for harmonics
        background: 'rgba(0,0,0,0.9)'
      }
    };

    this.createDisplayPanel();
    this.setupMathematicalSubscription();
  }

  createDisplayPanel() {
    const panel = document.createElement('div');
    panel.id = 'state56d-monitor';
    panel.style.cssText = `
      position: fixed; top: 80px; right: 20px; width: 320px; height: 600px;
      background: ${this.displayConfig.colorScheme.background}; 
      color: white; padding: 15px; border: 2px solid #3498db;
      border-radius: 10px; font-family: 'Courier New', monospace;
      font-size: 11px; line-height: 1.2; overflow-y: auto; z-index: 1001;
      box-shadow: 0 0 20px rgba(52, 152, 219, 0.3);
    `;

    panel.innerHTML = `
      <div style="color: #3498db; font-weight: bold; margin-bottom: 10px; text-align: center;">
        📊 56D STATE VECTOR MONITOR
      </div>
      <div id="state-content">
        <div style="color: #3498db; font-weight: bold;">SPATIAL COORDINATES:</div>
        <div id="spatial-coords"></div>
        
        <div style="color: #2ecc71; font-weight: bold; margin-top: 8px;">VELOCITY COORDINATES:</div>
        <div id="velocity-coords"></div>
        
        <div style="color: #e74c3c; font-weight: bold; margin-top: 8px;">HARMONIC OSCILLATORS:</div>
        <div id="harmonic-coords"></div>
        
        <div style="color: #f39c12; font-weight: bold; margin-top: 8px;">MATHEMATICAL METRICS:</div>
        <div id="math-metrics"></div>
      </div>
      
      <div style="margin-top: 10px; text-align: center;">
        <button id="toggle-monitor" style="
          padding: 5px 10px; background: #3498db; color: white; 
          border: none; border-radius: 3px; cursor: pointer; font-size: 10px;
        ">PAUSE</button>
        <button id="clear-monitor" style="
          padding: 5px 10px; background: #e74c3c; color: white; 
          border: none; border-radius: 3px; cursor: pointer; font-size: 10px; margin-left: 5px;
        ">CLEAR</button>
        <button id="close-monitor" style="
          padding: 5px 10px; background: #95a5a6; color: white; 
          border: none; border-radius: 3px; cursor: pointer; font-size: 10px; margin-left: 5px;
        ">CLOSE</button>
      </div>
    `;

    document.body.appendChild(panel);
    this.displayPanel = panel;

    // Setup button event handlers
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    const toggleBtn = document.getElementById('toggle-monitor');
    const clearBtn = document.getElementById('clear-monitor');
    const closeBtn = document.getElementById('close-monitor');

    toggleBtn?.addEventListener('click', () => {
      if (this.isActive) {
        this.stopMonitoring();
        toggleBtn.textContent = 'START';
        toggleBtn.style.background = '#2ecc71';
      } else {
        this.startMonitoring();
        toggleBtn.textContent = 'PAUSE';
        toggleBtn.style.background = '#3498db';
      }
    });

    clearBtn?.addEventListener('click', () => {
      this.clearDisplay();
    });

    closeBtn?.addEventListener('click', () => {
      this.destroy();
    });
  }

  setupMathematicalSubscription() {
    if (this.dataPipeline) {
      this.dataPipeline.subscribe('state56DMonitor', (enrichedState) => {
        this.updateStateDisplay(enrichedState);
      });
    }

    // Also listen for mathematical analysis results
    if (typeof window !== 'undefined') {
      window.addEventListener('mathematicalAnalysisUpdate', (event) => {
        this.updateMathematicalMetrics(event.detail.results);
      });
    }
  }

  updateStateDisplay(enrichedState) {
    if (!this.isActive || !enrichedState || !enrichedState.state) return;

    const state56D = enrichedState.state;
    const time = enrichedState.time;

    // Update internal state
    this.currentState.spatial = {
      x: state56D[0],
      y: state56D[1], 
      z: state56D[2]
    };

    this.currentState.velocity = {
      u: state56D[3],
      v: state56D[4],
      w: state56D[5]
    };

    this.currentState.harmonics = state56D.slice(6, 56);
    this.currentState.metadata.timeStep = time;

    // Calculate mathematical metrics
    this.updateMathematicalMetrics();

    // Update GUI display
    this.renderStateDisplay();
  }

  updateMathematicalMetrics(analysisResults = null) {
    // Calculate state vector magnitude
    const spatial = Object.values(this.currentState.spatial);
    const velocity = Object.values(this.currentState.velocity);
    
    this.currentState.metadata.magnitude = Math.sqrt(
      spatial.reduce((sum, val) => sum + val*val, 0) +
      velocity.reduce((sum, val) => sum + val*val, 0)
    );

    // Calculate harmonic energy
    this.currentState.metadata.harmonicEnergy = Math.sqrt(
      this.currentState.harmonics.reduce((sum, h) => sum + h*h, 0)
    );

    // Add analysis results if available
    if (analysisResults) {
      this.currentState.metadata.convergenceRate = analysisResults.convergence?.convergenceRate || 0;
      this.currentState.metadata.stabilityScore = analysisResults.stability?.score || 0;
    }
  }

  renderStateDisplay() {
    const spatialDiv = document.getElementById('spatial-coords');
    const velocityDiv = document.getElementById('velocity-coords');
    const harmonicDiv = document.getElementById('harmonic-coords');
    const metricsDiv = document.getElementById('math-metrics');

    if (!spatialDiv || !velocityDiv || !harmonicDiv || !metricsDiv) return;

    // Render spatial coordinates
    spatialDiv.innerHTML = `
      <div>x: ${this.formatNumber(this.currentState.spatial.x)}</div>
      <div>y: ${this.formatNumber(this.currentState.spatial.y)}</div>
      <div>z: ${this.formatNumber(this.currentState.spatial.z)}</div>
    `;

    // Render velocity coordinates
    velocityDiv.innerHTML = `
      <div>u: ${this.formatNumber(this.currentState.velocity.u)}</div>
      <div>v: ${this.formatNumber(this.currentState.velocity.v)}</div>
      <div>w: ${this.formatNumber(this.currentState.velocity.w)}</div>
    `;

    // Render first 10 harmonics (scrollable for full 50)
    const visibleHarmonics = this.currentState.harmonics.slice(0, 10);
    harmonicDiv.innerHTML = visibleHarmonics.map((h, i) => 
      `<div>h${i+1}: ${this.formatNumber(h)} <span style="color: #95a5a6;">(p=${[2,3,5,7,11,13,17,19,23,29][i]})</span></div>`
    ).join('') + 
    `<div style="color: #95a5a6; margin-top: 5px;">... ${this.currentState.harmonics.length - 10} more harmonics</div>`;

    // Render mathematical metrics
    metricsDiv.innerHTML = `
      <div>Time: ${this.formatNumber(this.currentState.metadata.timeStep)}s</div>
      <div>|State|: ${this.formatNumber(this.currentState.metadata.magnitude)}</div>
      <div>Harmonic Energy: ${this.formatNumber(this.currentState.metadata.harmonicEnergy)}</div>
      <div>Conv. Rate: ${this.formatNumber(this.currentState.metadata.convergenceRate || 0)}</div>
      <div>Stability: ${this.formatNumber(this.currentState.metadata.stabilityScore || 0)}</div>
    `;
  }

  formatNumber(value, precision = null) {
    if (!isFinite(value)) return 'NaN';
    
    const p = precision || this.displayConfig.precision;
    const absVal = Math.abs(value);
    
    // Use scientific notation for very small or very large numbers
    if (absVal < Math.pow(10, -p) || absVal > Math.pow(10, p)) {
      return value.toExponential(3);
    }
    
    return value.toFixed(p);
  }

  startMonitoring() {
    this.isActive = true;
    console.log('📊 56D State Vector Monitor: ACTIVE');
  }

  stopMonitoring() {
    this.isActive = false;
    console.log('📊 56D State Vector Monitor: PAUSED');
  }

  clearDisplay() {
    this.currentState = {
      spatial: { x: 0, y: 0, z: 0 },
      velocity: { u: 0, v: 0, w: 0 },
      harmonics: new Array(50).fill(0),
      metadata: { timeStep: 0, magnitude: 0, harmonicEnergy: 0 }
    };
    this.renderStateDisplay();
    console.log('🧹 56D State display cleared');
  }

  show() {
    if (this.displayPanel) {
      this.displayPanel.style.display = 'block';
      this.startMonitoring();
    }
  }

  hide() {
    if (this.displayPanel) {
      this.displayPanel.style.display = 'none';
      this.stopMonitoring();
    }
  }

  destroy() {
    this.stopMonitoring();
    
    if (this.dataPipeline) {
      this.dataPipeline.unsubscribe('state56DMonitor');
    }

    if (this.displayPanel && this.displayPanel.parentElement) {
      this.displayPanel.remove();
    }

    console.log('🧹 56D State Vector Monitor destroyed');
  }
}

// Global access for console interaction and debugging
if (typeof window !== 'undefined') {
  window.State56DMonitor = State56DMonitor;
}