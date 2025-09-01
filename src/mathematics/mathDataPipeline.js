// Mathematical Data Pipeline for Real-time 56D Analysis
// Foundation for continuous mathematical monitoring during spiral evolution

export class CircularBuffer {
  constructor(capacity = 1000) {
    this.capacity = capacity;
    this.buffer = new Array(capacity);
    this.head = 0;
    this.size = 0;
  }

  add(data) {
    this.buffer[this.head] = data;
    this.head = (this.head + 1) % this.capacity;
    if (this.size < this.capacity) {
      this.size++;
    }
  }

  getLast(count = 1) {
    if (count <= 0 || this.size === 0) return [];
    
    const result = [];
    let index = (this.head - 1 + this.capacity) % this.capacity;
    
    for (let i = 0; i < Math.min(count, this.size); i++) {
      result.unshift(this.buffer[index]);
      index = (index - 1 + this.capacity) % this.capacity;
    }
    
    return result;
  }

  getAll() {
    if (this.size === 0) return [];
    
    const result = [];
    let index = (this.head - this.size + this.capacity) % this.capacity;
    
    for (let i = 0; i < this.size; i++) {
      result.push(this.buffer[index]);
      index = (index + 1) % this.capacity;
    }
    
    return result;
  }

  clear() {
    this.size = 0;
    this.head = 0;
  }
}

export class MathematicalDataPipeline {
  constructor() {
    this.stateBuffer = new CircularBuffer(1000);
    this.subscribers = new Map();
    this.isStreaming = false;
    this.streamingStats = {
      totalStates: 0,
      avgStateSize: 0,
      streamingRate: 0,
      lastUpdate: 0
    };
  }

  // Stream 56D state during spiral generation
  streamState(state56D, timeStep, parameters = null) {
    if (!this.isStreaming || !state56D || state56D.length !== 56) {
      return;
    }

    const enrichedState = {
      state: [...state56D], // Copy to prevent mutation
      time: timeStep,
      parameters: parameters ? {...parameters} : null,
      timestamp: performance.now(),
      derivatives: null // Will be computed by subscribers
    };

    this.stateBuffer.add(enrichedState);
    this.updateStreamingStats(enrichedState);
    this.notifySubscribers(enrichedState);
  }

  // Subscribe to real-time mathematical analysis
  subscribe(subscriberId, callback) {
    if (typeof callback !== 'function') {
      throw new Error('Subscriber callback must be a function');
    }
    
    this.subscribers.set(subscriberId, callback);
    console.log(`📊 Mathematical subscriber registered: ${subscriberId}`);
  }

  unsubscribe(subscriberId) {
    const removed = this.subscribers.delete(subscriberId);
    if (removed) {
      console.log(`📊 Mathematical subscriber removed: ${subscriberId}`);
    }
    return removed;
  }

  // Notify all mathematical analysis subscribers
  notifySubscribers(enrichedState) {
    this.subscribers.forEach((callback, subscriberId) => {
      try {
        callback(enrichedState);
      } catch (error) {
        console.error(`❌ Mathematical subscriber error (${subscriberId}):`, error);
      }
    });
  }

  // Enable/disable streaming
  startStreaming() {
    this.isStreaming = true;
    this.streamingStats.lastUpdate = performance.now();
    console.log('🔄 Mathematical data streaming started');
  }

  stopStreaming() {
    this.isStreaming = false;
    console.log('⏹️ Mathematical data streaming stopped');
  }

  // Get current mathematical state
  getCurrentState() {
    const recent = this.stateBuffer.getLast(1);
    return recent.length > 0 ? recent[0] : null;
  }

  // Get trajectory window for sliding analysis
  getTrajectoryWindow(windowSize = 100) {
    return this.stateBuffer.getLast(windowSize);
  }

  // Get all buffered trajectory data
  getFullTrajectory() {
    return this.stateBuffer.getAll();
  }

  // Update streaming performance statistics
  updateStreamingStats(enrichedState) {
    this.streamingStats.totalStates++;
    this.streamingStats.avgStateSize = enrichedState.state.length;
    
    const now = performance.now();
    if (now - this.streamingStats.lastUpdate > 1000) {
      // Calculate streaming rate over last second
      const statesInLastSecond = this.stateBuffer.getLast(100).filter(
        state => (now - state.timestamp) < 1000
      ).length;
      
      this.streamingStats.streamingRate = statesInLastSecond;
      this.streamingStats.lastUpdate = now;
    }
  }

  // Get streaming performance metrics
  getStreamingStats() {
    return {
      ...this.streamingStats,
      bufferUtilization: this.stateBuffer.size / this.stateBuffer.capacity,
      subscriberCount: this.subscribers.size,
      isActive: this.isStreaming
    };
  }

  // Mathematical analysis utilities
  extractDimensionHistory(dimensionIndex, windowSize = 100) {
    const window = this.getTrajectoryWindow(windowSize);
    return window.map(enrichedState => ({
      value: enrichedState.state[dimensionIndex],
      time: enrichedState.time,
      timestamp: enrichedState.timestamp
    }));
  }

  extractMultiDimensionHistory(dimensionIndices, windowSize = 100) {
    const window = this.getTrajectoryWindow(windowSize);
    return window.map(enrichedState => {
      const values = {};
      dimensionIndices.forEach((index, i) => {
        values[`dim_${index}`] = enrichedState.state[index];
      });
      return {
        values,
        time: enrichedState.time,
        timestamp: enrichedState.timestamp
      };
    });
  }

  // Clean up resources
  destroy() {
    this.stopStreaming();
    this.subscribers.clear();
    this.stateBuffer.clear();
    console.log('🧹 Mathematical data pipeline destroyed');
  }
}

// Global access for debugging and console interaction
if (typeof window !== 'undefined') {
  window.MathematicalDataPipeline = MathematicalDataPipeline;
}