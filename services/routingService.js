const { Client } = require('@googlemaps/google-maps-services-js');

class RoutingService {
  constructor() {
    this.client = new Client({});
    this.apiKey = process.env.GOOGLE_MAPS_API_KEY;
    
    // Validate API key on initialization
    if (!this.apiKey) {
      console.error('Google Maps API key is not configured in environment variables');
    } else {
      console.log('Google Maps API key loaded successfully');
    }
  }

  async calculateSafeRoutes(origin, destination, preferences) {
    try {
      console.log('Calculating routes with API key:', this.apiKey);
      
      const directionsResponse = await this.client.directions({
        params: {
          origin: `${origin.lat},${origin.lng}`,
          destination: `${destination.lat},${destination.lng}`,
          alternatives: true,
          mode: 'driving',
          avoid: this.getAvoidOptions(preferences),
          key: this.apiKey
        },
        timeout: 10000 // Increased timeout to 10 seconds
      });

      console.log('Directions API Response Status:', directionsResponse.data.status);

      if (directionsResponse.data.status === 'REQUEST_DENIED') {
        console.error('API Error Details:', directionsResponse.data.error_message);
        throw new Error(`Route calculation request denied: ${directionsResponse.data.error_message}`);
      }

      if (directionsResponse.data.status !== 'OK') {
        throw new Error(`Failed to calculate routes: ${directionsResponse.data.status}`);
      }

      return this.processRoutes(directionsResponse.data.routes);
    } catch (error) {
      console.error('Route calculation error:', error);
      throw new Error(error.message || 'Failed to calculate routes');
    }
  }

  getAvoidOptions(preferences) {
    const avoidOptions = [];
    if (preferences.avoidHighways) avoidOptions.push('highways');
    if (preferences.avoidTolls) avoidOptions.push('tolls');
    return avoidOptions;
  }

  processRoutes(routes) {
    return routes.map(route => ({
      path: this.decodePath(route.overview_polyline.points),
      bounds: route.bounds,
      distance: route.legs[0].distance,
      duration: route.legs[0].duration,
      steps: route.legs[0].steps
    }));
  }

  decodePath(encoded) {
    const poly = [];
    let index = 0, len = encoded.length;
    let lat = 0, lng = 0;

    while (index < len) {
      let b, shift = 0, result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lng += dlng;

      poly.push({ lat: lat / 1e5, lng: lng / 1e5 });
    }
    return poly;
  }
}

module.exports = new RoutingService();