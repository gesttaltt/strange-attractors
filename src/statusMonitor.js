// Real-time Performance and Status Monitor for Extended Prime System
export class StatusMonitor {
  constructor() {
    this.metrics = {
      harmonicCount: 0,
      renderTime: 0,
      memoryUsage: 0,
      convergenceRate: 0,
      dominantPrime: 0,
      frameRate: 0
    };
    
    this.lastFrameTime = performance.now();
    this.frameCount = 0;
    this.createStatusPanel();
  }

  createStatusPanel() {
    const statusDiv = document.createElement('div');
    statusDiv.id = 'status-monitor';
    statusDiv.style.cssText = `
      position: fixed; bottom: 20px; left: 20px; width: 280px;
      background: rgba(0,0,0,0.8); color: #00ff00; padding: 12px;
      border: 1px solid #00ff00; border-radius: 8px; font-family: monospace;
      font-size: 11px; line-height: 1.3; z-index: 999;
      box-shadow: 0 0 10px rgba(0,255,0,0.2);
    `;

    statusDiv.innerHTML = `
      <div style="color: #00ffff; font-weight: bold; margin-bottom: 8px;">
        📊 SYSTEM STATUS
      </div>
      <div id="status-content">
        Initializing extended prime system...
      </div>
    `;

    document.body.appendChild(statusDiv);
    this.statusDiv = statusDiv;
    this.contentDiv = document.getElementById('status-content');
  }

  updateMetrics(harmonicCount, renderTime, convergenceData = null) {
    this.metrics.harmonicCount = harmonicCount;
    this.metrics.renderTime = renderTime;
    
    // Calculate frame rate
    const currentTime = performance.now();
    this.frameCount++;
    if (currentTime - this.lastFrameTime >= 1000) {
      this.metrics.frameRate = this.frameCount;
      this.frameCount = 0;
      this.lastFrameTime = currentTime;
    }

    // Estimate memory usage (rough approximation)
    this.metrics.memoryUsage = (harmonicCount * 8 * 4) / 1024; // KB

    if (convergenceData) {
      this.metrics.convergenceRate = convergenceData.convergenceRate;
      this.metrics.dominantPrime = convergenceData.dominantHarmonics?.[0]?.prime || 0;
    }

    this.updateDisplay();
  }

  updateDisplay() {
    const { harmonicCount, renderTime, memoryUsage, convergenceRate, dominantPrime, frameRate } = this.metrics;
    
    // Performance status indicators
    const performanceStatus = renderTime < 50 ? '🟢' : renderTime < 200 ? '🟡' : '🔴';
    const memoryStatus = memoryUsage < 1000 ? '🟢' : memoryUsage < 5000 ? '🟡' : '🔴';
    const convergenceStatus = Math.abs(convergenceRate) > 0.01 ? '📉' : '📊';

    this.contentDiv.innerHTML = `
      <div style="color: #ffff00;">
        ${performanceStatus} Harmonics: ${harmonicCount}
        <br>
        ${performanceStatus} Render: ${renderTime.toFixed(1)}ms
        <br>
        ${memoryStatus} Memory: ~${memoryUsage.toFixed(0)}KB
        <br>
        🎯 FPS: ${frameRate}
      </div>
      <div style="color: #ff8800; margin-top: 6px;">
        ${convergenceStatus} Convergence: ${convergenceRate.toFixed(6)}
        <br>
        🎵 Dominant: Prime ${dominantPrime}
      </div>
      <div style="color: #8888ff; margin-top: 6px; font-size: 10px;">
        ${this.getStatusMessage()}
      </div>
    `;
  }

  getStatusMessage() {
    const { harmonicCount, renderTime, convergenceRate } = this.metrics;
    
    if (harmonicCount >= 200) {
      return '⚡ Maximum prime harmonics active';
    } else if (harmonicCount >= 100) {
      return '🔥 High-dimensional manifold mode';
    } else if (renderTime > 200) {
      return '⚠️ Performance impact detected';
    } else if (Math.abs(convergenceRate) > 0.05) {
      return '📈 Rapid manifold convergence';
    } else {
      return '✅ System operating normally';
    }
  }

  hide() {
    if (this.statusDiv) {
      this.statusDiv.style.display = 'none';
    }
  }

  show() {
    if (this.statusDiv) {
      this.statusDiv.style.display = 'block';
    }
  }

  destroy() {
    if (this.statusDiv) {
      this.statusDiv.remove();
    }
  }
}