/**
 * Safety Evaluator Service
 * Evaluates safety metrics for tanker routes based on various factors
 */
const safetyEvaluator = {
  /**
   * Tanker specifications based on type
   */
  tankerSpecs: {
    'small': {
      capacity: 10000, // liters
      weight: 15000,   // kg when full
      width: 2.5,      // meters
      height: 3.2,     // meters
      length: 8.5,     // meters
      safeSpeed: 80    // km/h max safe speed
    },
    'medium': {
      capacity: 25000,
      weight: 30000,
      width: 2.6,
      height: 3.5,
      length: 12,
      safeSpeed: 70
    },
    'large': {
      capacity: 40000,
      weight: 45000,
      width: 2.8,
      height: 3.8,
      length: 16.5,
      safeSpeed: 60
    }
  },

  /**
   * Evaluate safety for multiple routes
   * @param {Array} routes - Array of route objects
   * @param {string} tankerType - Type of tanker (small, medium, large)
   * @param {string} hazmatClass - Hazardous material class
   * @returns {Promise<Array>} - Array of routes with safety scores
   */
  evaluateRoutes: async (routes, tankerType, hazmatClass) => {
    try {
      // Get tanker specifications
      const specs = safetyEvaluator.tankerSpecs[tankerType] || safetyEvaluator.tankerSpecs.medium;
      
      // Evaluate each route
      const evaluatedRoutes = routes.map(route => {
        // Calculate safety metrics
        const safetyMetrics = safetyEvaluator.calculateSafetyMetrics(route, specs, hazmatClass);
        
        // Calculate total safety score (lower is better)
        const safetyScore = Object.values(safetyMetrics).reduce((total, metric) => {
          return total + (metric.score * metric.weight);
        }, 0);
        
        // Add justification for the route
        const justification = safetyEvaluator.generateJustification(safetyMetrics);
        
        // Return enhanced route object
        return {
          ...route,
          safetyScore,
          safetyMetrics,
          justification,
          isSafest: false, // Will be set after comparing all routes
          color: safetyEvaluator.getSafetyColor(safetyScore)
        };
      });
      
      // Sort by safety score (lowest/safest first)
      evaluatedRoutes.sort((a, b) => a.safetyScore - b.safetyScore);
      
      // Mark the safest route
      if (evaluatedRoutes.length > 0) {
        evaluatedRoutes[0].isSafest = true;
      }
      
      return evaluatedRoutes;
    } catch (error) {
      console.error('Error evaluating routes:', error);
      throw error;
    }
  },
  
  /**
   * Calculate safety metrics for a route
   * @param {Object} route - Route object
   * @param {Object} specs - Tanker specifications
   * @param {string} hazmatClass - Hazardous material class
   * @returns {Object} - Safety metrics
   */
  calculateSafetyMetrics: (route, specs, hazmatClass) => {
    // In a real app, this would analyze actual data from the route
    // For demo purposes, we'll use simulated scores
    
    return {
      schoolZoneProximity: {
        score: Math.random() * 10,
        weight: 2.0,
        description: 'Proximity to school zones'
      },
      residentialDensity: {
        score: Math.random() * 10,
        weight: 1.5,
        description: 'Population density in residential areas'
      },
      roadGrade: {
        score: Math.random() * 10,
        weight: 1.8,
        description: 'Steepness of road inclines'
      },
      sharpTurns: {
        score: Math.random() * 10,
        weight: 1.6,
        description: 'Presence of sharp turns'
      },
      roadWidth: {
        score: Math.random() * 10,
        weight: 1.7,
        description: 'Road width constraints'
      },
      hazmatRestrictions: {
        score: Math.random() * 10,
        weight: 2.5,
        description: 'Hazmat transport restrictions'
      },
      speedSafety: {
        score: Math.random() * 10,
        weight: 1.4,
        description: 'Speed limits vs. safe tanker speeds'
      },
      trafficDensity: {
        score: Math.random() * 10,
        weight: 1.3,
        description: 'Traffic congestion'
      },
      emergencyAccess: {
        score: Math.random() * 10,
        weight: 1.5,
        description: 'Access for emergency services'
      },
      weatherRisks: {
        score: Math.random() * 10,
        weight: 1.4,
        description: 'Weather-related risk factors'
      }
    };
  },
  
  /**
   * Generate justification text for route safety
   * @param {Object} metrics - Safety metrics
   * @returns {string} - Justification text
   */
  generateJustification: (metrics) => {
    // Sort metrics by weighted score (highest impact first)
    const sortedMetrics = Object.entries(metrics)
      .map(([key, metric]) => ({
        key,
        ...metric,
        weightedScore: metric.score * metric.weight
      }))
      .sort((a, b) => a.weightedScore - b.weightedScore);
    
    // Generate text for best and worst factors
    const bestFactors = sortedMetrics.slice(0, 3)
      .map(metric => `${metric.description} (good)`)
      .join(', ');
      
    const worstFactors = sortedMetrics.slice(-3)
      .map(metric => `${metric.description} (concerning)`)
      .join(', ');
    
    return `This route was evaluated based on multiple safety factors. The most favorable aspects are: ${bestFactors}. Areas of concern include: ${worstFactors}.`;
  },
  
  /**
   * Get detailed metrics for a route
   * @param {string} routeId - Route identifier
   * @returns {Promise<Object>} - Detailed metrics
   */
  getDetailedMetrics: async (routeId) => {
    try {
      // In a real app, you would retrieve stored route data
      // For demo purposes, we'll return mock data
      
      return {
        basicMetrics: {
          distance: Math.floor(Math.random() * 50) + 10 + ' km',
          duration: Math.floor(Math.random() * 60) + 30 + ' minutes',
          trafficDuration: Math.floor(Math.random() * 90) + 40 + ' minutes',
          fuelConsumption: Math.floor(Math.random() * 40) + 20 + ' liters',
          co2Emissions: Math.floor(Math.random() * 100) + 50 + ' kg',
          averageSpeed: Math.floor(Math.random() * 30) + 50 + ' km/h',
          turnCount: Math.floor(Math.random() * 15) + 5,
          trafficLights: Math.floor(Math.random() * 20) + 10,
          highwayDistance: Math.floor(Math.random() * 20) + 5 + ' km',
          localRoadDistance: Math.floor(Math.random() * 15) + 5 + ' km',
          maxElevationChange: Math.floor(Math.random() * 300) + 50 + ' m',
          populationExposure: Math.floor(Math.random() * 50000) + 10000 + ' people'
        },
        
        safetyPercentages: {
          schoolZoneRisk: Math.floor(Math.random() * 100),
          residentialExposure: Math.floor(Math.random() * 100),
          roadQualityRisk: Math.floor(Math.random() * 100),
          weatherRisk: Math.floor(Math.random() * 100),
          trafficCongestionRisk: Math.floor(Math.random() * 100),
          emergencyAccess: Math.floor(Math.random() * 100)
        },
        
        restrictions: {
          hazmat: [
            Math.random() > 0.5 ? {
              location: 'Bridge at approximately 40% of route',
              description: 'No flammable liquids'
            } : null,
            Math.random() > 0.7 ? {
              location: 'Tunnel at approximately 75% of route',
              description: 'No corrosive substances'
            } : null
          ].filter(Boolean),
          
          speed: [
            Math.random() > 0.3 ? {
              location: 'School zone at approximately 30% of route',
              limit: '30 km/h'
            } : null,
            Math.random() > 0.5 ? {
              location: 'Residential area at approximately 60% of route',
              limit: '40 km/h'
            } : null
          ].filter(Boolean),
          
          weight: [
            Math.random() > 0.6 ? {
              location: 'Old bridge at approximately 50% of route',
              limit: '30 tons'
            } : null
          ].filter(Boolean)
        }
      };
    } catch (error) {
      console.error('Error getting detailed metrics:', error);
      throw error;
    }
  },
  
  /**
   * Get color for route based on safety score
   * @param {number} score - Safety score
   * @returns {string} - CSS color value
   */
  getSafetyColor: (score) => {
    // Normalize score to 0-100 range (assuming max possible score is 100)
    const normalizedScore = Math.min(score, 100);
    
    // Calculate RGB values
    // Lower scores (safer) are more green, higher scores (less safe) are more red
    const red = Math.floor(255 * (normalizedScore / 100));
    const green = Math.floor(255 * (1 - normalizedScore / 100));
    
    return `rgb(${red}, ${green}, 0)`;
  }
};

module.exports = safetyEvaluator;
