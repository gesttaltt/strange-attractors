// NASA Data Service - Fetches and processes NASA data via MCP server
// Integrates with Silent Spiral visualization system

import { Client } from '@modelcontextprotocol/sdk/client/index.js';

export class NASADataService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.serverUrl = 'http://localhost:3000'; // Default NASA MCP server URL
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes cache
  }

  async connect(serverUrl = null) {
    if (serverUrl) this.serverUrl = serverUrl;
    
    try {
      // For browser environments, we'll use fetch-based transport
      this.client = new Client({
        name: "silent-spiral-nasa-client",
        version: "1.0.0",
      });

      console.log(`Connecting to NASA MCP server at ${this.serverUrl}`);
      this.isConnected = true;
      return true;
    } catch (error) {
      console.error('Failed to connect to NASA MCP server:', error);
      this.isConnected = false;
      return false;
    }
  }

  async fetchAPOD(date = null) {
    if (!this.isConnected) await this.connect();
    
    const cacheKey = `apod-${date || 'today'}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      // Make HTTP request directly since we're in browser
      const params = date ? `?date=${date}` : '';
      const response = await fetch(`${this.serverUrl}/nasa/apod${params}`);
      const data = await response.json();
      
      this.setCachedData(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Failed to fetch APOD:', error);
      return this.getFallbackAPOD();
    }
  }

  async fetchMarsRoverPhotos(sol = null, rover = 'curiosity') {
    if (!this.isConnected) await this.connect();
    
    const cacheKey = `mars-${rover}-${sol || 'latest'}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const params = sol ? `?sol=${sol}&rover=${rover}` : `?rover=${rover}`;
      const response = await fetch(`${this.serverUrl}/nasa/mars-photos${params}`);
      const data = await response.json();
      
      this.setCachedData(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Failed to fetch Mars rover photos:', error);
      return this.getFallbackMarsData();
    }
  }

  async fetchNearEarthObjects(startDate = null, endDate = null) {
    if (!this.isConnected) await this.connect();
    
    const cacheKey = `neo-${startDate}-${endDate}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      let params = '';
      if (startDate && endDate) {
        params = `?start_date=${startDate}&end_date=${endDate}`;
      }
      const response = await fetch(`${this.serverUrl}/nasa/neo${params}`);
      const data = await response.json();
      
      this.setCachedData(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Failed to fetch Near Earth Objects:', error);
      return this.getFallbackNEOData();
    }
  }

  async fetchSpaceWeatherData() {
    if (!this.isConnected) await this.connect();
    
    const cacheKey = 'space-weather';
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(`${this.serverUrl}/nasa/space-weather`);
      const data = await response.json();
      
      this.setCachedData(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Failed to fetch space weather data:', error);
      return this.getFallbackSpaceWeatherData();
    }
  }

  // Transform NASA data into mathematical coordinates for visualization
  transformAPODToCoordinates(apodData) {
    if (!apodData || !apodData.title) return [];
    
    const coordinates = [];
    const title = apodData.title;
    
    // Convert title characters to coordinates
    for (let i = 0; i < title.length; i++) {
      const charCode = title.charCodeAt(i);
      const angle = (i / title.length) * Math.PI * 2;
      const radius = (charCode / 255) * 50;
      
      coordinates.push([
        radius * Math.cos(angle),
        radius * Math.sin(angle),
        (charCode % 50) - 25,
        Math.sin(angle * 2) * 10,
        Math.cos(angle * 3) * 10,
        Math.sin(angle * 5) * 10,
        Math.cos(angle * 7) * 10,
        Math.sin(angle * 11) * 10,
        Math.cos(angle * 13) * 10,
        Math.sin(angle * 17) * 10,
        Math.cos(angle * 19) * 10,
        (Math.sin(angle * 23) * Math.cos(angle * 29)) * 10
      ]);
    }
    
    return coordinates;
  }

  transformNEOToCoordinates(neoData) {
    if (!neoData || !neoData.near_earth_objects) return [];
    
    const coordinates = [];
    
    Object.values(neoData.near_earth_objects).flat().forEach((neo, index) => {
      const distance = parseFloat(neo.close_approach_data?.[0]?.miss_distance?.kilometers || 1000000);
      const velocity = parseFloat(neo.close_approach_data?.[0]?.relative_velocity?.kilometers_per_second || 10);
      const diameter = parseFloat(neo.estimated_diameter?.kilometers?.estimated_diameter_average || 1);
      
      // Convert astronomical data to visualization coordinates
      const normalizedDistance = Math.log(distance) / Math.log(10000000) * 50;
      const normalizedVelocity = Math.min(velocity / 50, 1) * 30;
      const normalizedDiameter = Math.log(diameter + 1) * 10;
      
      const angle = (index / 10) * Math.PI * 2;
      
      coordinates.push([
        normalizedDistance * Math.cos(angle),
        normalizedDistance * Math.sin(angle),
        normalizedVelocity,
        Math.sin(angle * 2) * normalizedDiameter,
        Math.cos(angle * 3) * normalizedDiameter,
        Math.sin(angle * 5) * velocity / 10,
        Math.cos(angle * 7) * velocity / 10,
        Math.sin(angle * 11) * diameter * 5,
        Math.cos(angle * 13) * diameter * 5,
        Math.sin(angle * 17) * normalizedDistance / 5,
        Math.cos(angle * 19) * normalizedDistance / 5,
        (Math.sin(angle * 23) * Math.cos(angle * 29)) * normalizedVelocity
      ]);
    });
    
    return coordinates;
  }

  transformMarsPhotosToCoordinates(marsData) {
    if (!marsData || !marsData.photos) return [];
    
    const coordinates = [];
    
    marsData.photos.forEach((photo, index) => {
      const sol = photo.sol || 0;
      const earthDate = new Date(photo.earth_date);
      const dayOfYear = Math.floor((earthDate - new Date(earthDate.getFullYear(), 0, 0)) / 8.64e7);
      const camera = photo.camera?.name?.charCodeAt(0) || 65;
      
      const angle = (index / marsData.photos.length) * Math.PI * 2;
      const radius = (sol / 3000) * 40; // Normalize sol to radius
      
      coordinates.push([
        radius * Math.cos(angle),
        radius * Math.sin(angle),
        (dayOfYear / 365) * 20 - 10,
        Math.sin(angle * 2) * (camera / 10),
        Math.cos(angle * 3) * (camera / 10),
        Math.sin(angle * 5) * (sol / 100),
        Math.cos(angle * 7) * (sol / 100),
        Math.sin(angle * 11) * dayOfYear / 20,
        Math.cos(angle * 13) * dayOfYear / 20,
        Math.sin(angle * 17) * radius / 5,
        Math.cos(angle * 19) * radius / 5,
        (Math.sin(angle * 23) * Math.cos(angle * 29)) * (camera / 20)
      ]);
    });
    
    return coordinates;
  }

  // Cache management
  getCachedData(key) {
    const cached = this.cache.get(key);
    if (cached && (Date.now() - cached.timestamp < this.cacheTimeout)) {
      return cached.data;
    }
    return null;
  }

  setCachedData(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  // Fallback data for offline/error scenarios
  getFallbackAPOD() {
    return {
      title: "Beautiful Nebula",
      explanation: "A stunning view of cosmic beauty",
      url: "",
      date: new Date().toISOString().split('T')[0]
    };
  }

  getFallbackMarsData() {
    return {
      photos: Array.from({length: 10}, (_, i) => ({
        sol: 1000 + i * 100,
        earth_date: "2023-01-01",
        camera: { name: "NAVCAM" }
      }))
    };
  }

  getFallbackNEOData() {
    return {
      near_earth_objects: {
        "2023-01-01": Array.from({length: 5}, (_, i) => ({
          name: `Asteroid-${i}`,
          close_approach_data: [{
            miss_distance: { kilometers: "1000000" },
            relative_velocity: { kilometers_per_second: "20" }
          }],
          estimated_diameter: {
            kilometers: { estimated_diameter_average: "1.0" }
          }
        }))
      }
    };
  }

  getFallbackSpaceWeatherData() {
    return {
      solar_flares: [],
      geomagnetic_storms: [],
      solar_wind_speed: 400
    };
  }

  disconnect() {
    this.client = null;
    this.isConnected = false;
    this.cache.clear();
  }
}

export const nasaDataService = new NASADataService();