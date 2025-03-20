const axios = require('axios');

// Google Maps API key from environment variables
const API_KEY = process.env.GOOGLE_MAPS_API_KEY;

/**
 * Route Calculator Service
 * Handles all interactions with mapping APIs to generate routes
 */
const routeCalculator = {
  /**
   * Calculate routes between two points
   * @param {string} origin - Starting point
   * @param {string} destination - Ending point
   * @param {Object} options - Route options (avoid highways, tolls, etc.)
   * @returns {Promise<Array>} - Array of possible routes
   */
  calculateRoutes: async (origin, destination, options = {}) => {
    try {
      // Construct Google Maps Directions API URL
      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&alternatives=true&key=${API_KEY}`;
      
      // Add options to URL if specified
      const params = new URLSearchParams();
      if (options.avoidHighways) params.append('avoid', 'highways');
      if (options.avoidTolls) params.append('avoid', 'tolls');
      
      // Log the constructed URL for debugging
      console.log('Requesting Google Maps API with URL:', `${url}&${params.toString()}`);
      
      // Make API request
      const response = await axios.get(`${url}&${params.toString()}`);
      
      // Log the response status and data for debugging
      console.log('Google Maps API response status:', response.data.status);
      console.log('Google Maps API response routes count:', response.data.routes ? response.data.routes.length : 0);

      if (response.data.status !== 'OK') {
        throw new Error(`Direction API error: ${response.data.status} - ${response.data.error_message || 'No additional details'}`);
      }
      
      // Process and return routes
      return response.data.routes.map((route, index) => ({
        routeId: `route-${Date.now()}-${index}`,
        summary: route.summary,
        distance: route.legs.reduce((total, leg) => total + leg.distance.value, 0),
        duration: route.legs.reduce((total, leg) => total + leg.duration.value, 0),
        polyline: route.overview_polyline.points,
        bounds: route.bounds,
        legs: route.legs,
        steps: route.legs.flatMap(leg => leg.steps),
        index
      }));
    } catch (error) {
      console.error('Error calculating routes:', error.message);
      console.error('Stack trace:', error.stack);
      throw new Error('Failed to calculate routes. Please check the server logs for more details.');
    }
  },
  
  /**
   * Get hazmat restrictions within a geographic area
   * @param {Object} bounds - Geographic bounds
   * @returns {Promise<Array>} - Array of restriction objects
   */
  getHazmatRestrictions: async (bounds) => {
    try {
      // Parse bounds if it's a string
      let parsedBounds = bounds;
      if (typeof bounds === 'string') {
        try {
          parsedBounds = JSON.parse(bounds);
        } catch (e) {
          console.error('Error parsing bounds:', e);
          parsedBounds = null;
        }
      }
      
      // Default bounds if none provided or invalid
      if (!parsedBounds || !parsedBounds.northeast || !parsedBounds.southwest) {
        console.log('Using default bounds for hazmat restrictions');
        parsedBounds = {
          northeast: { lat: 40.7831, lng: -73.9712 }, // NYC area
          southwest: { lat: 40.7031, lng: -74.0479 }
        };
      }
      
      // In a real app, you would query a database or external API
      // For demo purposes, we'll return mock data
      return [
        {
          id: 'hazmat-1',
          type: 'tunnel',
          classes: ['3', '8'],
          location: {
            lat: parsedBounds.northeast.lat - 0.02,
            lng: parsedBounds.northeast.lng - 0.02
          },
          name: 'Downtown Tunnel',
          description: 'No flammable or corrosive materials'
        },
        {
          id: 'hazmat-2',
          type: 'bridge',
          classes: ['9'],
          location: {
            lat: parsedBounds.southwest.lat + 0.02,
            lng: parsedBounds.southwest.lng + 0.02
          },
          name: 'Harbor Bridge',
          description: 'Miscellaneous dangerous goods restrictions'
        }
      ];
    } catch (error) {
      console.error('Error fetching hazmat restrictions:', error);
      // Return empty array instead of throwing to avoid breaking the UI
      return [];
    }
  },
  
  /**
   * Get school zones within a geographic area
   * @param {Object} bounds - Geographic bounds
   * @returns {Promise<Array>} - Array of school zone objects
   */
  getSchoolZones: async (bounds) => {
    try {
      // Parse bounds if it's a string
      let parsedBounds = bounds;
      if (typeof bounds === 'string') {
        try {
          parsedBounds = JSON.parse(bounds);
        } catch (e) {
          console.error('Error parsing bounds:', e);
          parsedBounds = null;
        }
      }
      
      // Default bounds if none provided or invalid
      if (!parsedBounds || !parsedBounds.northeast || !parsedBounds.southwest) {
        console.log('Using default bounds for school zones');
        parsedBounds = {
          northeast: { lat: 40.7831, lng: -73.9712 }, // NYC area
          southwest: { lat: 40.7031, lng: -74.0479 }
        };
      }
      
      // In a real app, you would query a database or external API
      // For demo purposes, we'll return mock data
      return [
        {
          id: 'school-1',
          name: 'Central Elementary School',
          location: {
            lat: parsedBounds.northeast.lat - 0.01,
            lng: parsedBounds.northeast.lng - 0.01
          },
          radius: 300, // meters
          operationHours: '7:30 AM - 4:30 PM'
        },
        {
          id: 'school-2',
          name: 'Westside High School',
          location: {
            lat: parsedBounds.southwest.lat + 0.01,
            lng: parsedBounds.southwest.lng + 0.01
          },
          radius: 400, // meters
          operationHours: '7:00 AM - 5:00 PM'
        }
      ];
    } catch (error) {
      console.error('Error fetching school zones:', error);
      // Return empty array instead of throwing to avoid breaking the UI
      return [];
    }
  }
};

module.exports = routeCalculator;