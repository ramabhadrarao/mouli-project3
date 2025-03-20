const express = require('express');
const router = express.Router();
const routeCalculator = require('../services/routeCalculator');
const safetyEvaluator = require('../services/safetyEvaluator');
const axios = require('axios');
const routingService = require('../services/routingService');

// Function to calculate safety score
function calculateSafetyScore(route) {
  // Extract route details for calculations
  const legs = route.legs[0];
  const steps = legs.steps;
  
  // Initialize safety metrics
  const safetyMetrics = {
    schoolZoneRisk: {
      score: calculateSchoolZoneRisk(steps),
      weight: 0.25
    },
    residentialExposure: {
      score: calculateResidentialExposure(steps),
      weight: 0.2
    },
    roadQualityRisk: {
      score: calculateRoadQualityRisk(steps),
      weight: 0.15
    },
    weatherRisk: {
      score: calculateWeatherRisk(legs),
      weight: 0.15
    },
    trafficCongestionRisk: {
      score: calculateTrafficRisk(legs),
      weight: 0.15
    },
    emergencyAccess: {
      score: calculateEmergencyAccess(steps),
      weight: 0.1
    }
  };

  // Calculate overall safety score
  const overallScore = Object.entries(safetyMetrics).reduce((total, [key, metric]) => {
    return total + (metric.score * metric.weight);
  }, 0);

  return {
    safetyMetrics,
    overallScore
  };
}

// Helper functions for safety calculations
function calculateSchoolZoneRisk(steps) {
  let riskScore = 100;
  steps.forEach(step => {
    // Check for nearby schools and school zones
    if (step.html_instructions.toLowerCase().includes('school')) {
      riskScore -= 20;
    }
    // Consider time of day for school hours
    const hour = new Date().getHours();
    if (hour >= 7 && hour <= 16) { // School hours
      riskScore -= 10;
    }
  });
  return Math.max(riskScore, 0);
}

function calculateResidentialExposure(steps) {
  let exposureScore = 100;
  steps.forEach(step => {
    // Check for residential areas
    if (step.html_instructions.toLowerCase().includes('residential')) {
      exposureScore -= 15;
    }
    // Consider population density
    if (step.distance.value < 500) { // Short segments indicate dense areas
      exposureScore -= 10;
    }
  });
  return Math.max(exposureScore, 0);
}

function calculateRoadQualityRisk(steps) {
  let qualityScore = 100;
  steps.forEach(step => {
    // Check road types
    if (step.html_instructions.toLowerCase().includes('highway')) {
      qualityScore += 10; // Highways typically have better maintenance
    }
    if (step.html_instructions.toLowerCase().includes('unpaved')) {
      qualityScore -= 30;
    }
    // Consider road segments
    if (step.maneuver === 'roundabout' || step.maneuver === 'turn') {
      qualityScore -= 5; // More complex road segments
    }
  });
  return Math.max(Math.min(qualityScore, 100), 0);
}

function calculateWeatherRisk(legs) {
  // Start with base score
  let weatherScore = 90;
  
  // Consider route duration and time of day
  const duration = legs.duration.value;
  const hour = new Date().getHours();
  
  // Night time driving
  if (hour < 6 || hour > 18) {
    weatherScore -= 15;
  }
  
  // Long duration routes have higher weather risk
  if (duration > 7200) { // More than 2 hours
    weatherScore -= 10;
  }
  
  return Math.max(weatherScore, 0);
}

function calculateTrafficRisk(legs) {
  let trafficScore = 100;
  
  // Compare duration in traffic vs normal duration
  if (legs.duration_in_traffic && legs.duration) {
    const trafficRatio = legs.duration_in_traffic.value / legs.duration.value;
    if (trafficRatio > 1.5) {
      trafficScore -= 30; // Heavy traffic
    } else if (trafficRatio > 1.2) {
      trafficScore -= 15; // Moderate traffic
    }
  }
  
  return Math.max(trafficScore, 0);
}

function calculateEmergencyAccess(steps) {
  let accessScore = 100;
  steps.forEach(step => {
    // Check for emergency access factors
    if (step.html_instructions.toLowerCase().includes('tunnel')) {
      accessScore -= 20;
    }
    if (step.html_instructions.toLowerCase().includes('bridge')) {
      accessScore -= 10;
    }
    // Consider distance from main roads
    if (!step.html_instructions.toLowerCase().includes('highway') && 
        !step.html_instructions.toLowerCase().includes('main')) {
      accessScore -= 5;
    }
  });
  return Math.max(accessScore, 0);
}

// Calculate routes
router.post('/calculate-routes', async (req, res) => {
  try {
    const { origin, destination } = req.body;

    // Add validation
    if (!origin || !destination) {
      return res.status(400).json({
        success: false,
        message: 'Origin and destination are required'
      });
    }

    // Log the request data for debugging
    console.log('Calculate routes request:', {
      origin,
      destination,
      apiKey: process.env.GOOGLE_MAPS_API_KEY ? 'Set' : 'Not set'
    });

    const routes = await routingService.calculateSafeRoutes(
      {
        lat: parseFloat(origin.lat || origin.split(',')[0]),
        lng: parseFloat(origin.lng || origin.split(',')[1])
      },
      {
        lat: parseFloat(destination.lat || destination.split(',')[0]),
        lng: parseFloat(destination.lng || destination.split(',')[1])
      },
      req.body
    );

    res.json({
      success: true,
      routes
    });
  } catch (error) {
    console.error('Route calculation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to calculate routes'
    });
  }
});

// Get detailed metrics for a specific route
router.get('/route-metrics/:routeId', async (req, res) => {
  try {
    const { routeId } = req.params;
    
    // Generate sample metrics
    const metrics = {
      basicMetrics: {
        distance: '16 km',
        duration: '65 minutes',
        trafficDuration: '85 minutes',
        fuelConsumption: '39 liters',
        co2Emissions: '109 kg',
        averageSpeed: '66 km/h'
      },
      safetyPercentages: {
        schoolZoneRisk: 80,
        residentialExposure: 75,
        roadQualityRisk: 85,
        weatherRisk: 70,
        trafficCongestionRisk: 75,
        emergencyAccess: 60
      },
      restrictions: {
        hazmat: [
          { 
            location: 'Bridge', 
            description: 'No flammable liquids at approximately 40% of route' 
          }
        ],
        speed: [
          { 
            location: 'School zone', 
            limit: '30 km/h at approximately 30% of route' 
          }
        ],
        weight: []
      }
    };
    
    res.json({
      success: true,
      metrics
    });
  } catch (error) {
    console.error('Error fetching route metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve route metrics',
      error: error.message
    });
  }
});
// Get hazmat restrictions for an area
router.get('/hazmat-restrictions', async (req, res) => {
  try {
    const { bounds } = req.query;
    const restrictions = await routeCalculator.getHazmatRestrictions(bounds);
    
    res.json({
      success: true,
      restrictions
    });
  } catch (error) {
    console.error('Error fetching hazmat restrictions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve hazmat restrictions',
      error: error.message
    });
  }
});

// Get school zones for an area
router.get('/school-zones', async (req, res) => {
  try {
    const { bounds } = req.query;
    const schoolZones = await routeCalculator.getSchoolZones(bounds);
    
    res.json({
      success: true,
      schoolZones
    });
  } catch (error) {
    console.error('Error fetching school zones:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve school zones',
      error: error.message
    });
  }
});

module.exports = router;
