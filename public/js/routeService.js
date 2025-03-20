/**
 * Oil Tanker Safety Routing - Route Service
 * Handles route-specific functionalities
 */

/**
 * Format route distance for display
 * @param {number} distance - Distance in meters
 * @returns {string} - Formatted distance string
 */
function formatDistance(distance) {
  if (distance < 1000) {
    return `${distance.toFixed(0)} m`;
  } else {
    return `${(distance / 1000).toFixed(2)} km`;
  }
}

/**
 * Format route duration for display
 * @param {number} duration - Duration in seconds
 * @returns {string} - Formatted duration string
 */
function formatDuration(duration) {
  if (duration < 60) {
    return `${duration.toFixed(0)} sec`;
  } else if (duration < 3600) {
    return `${Math.floor(duration / 60)} min`;
  } else {
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    return `${hours} hr ${minutes} min`;
  }
}

/**
 * Get color for a route based on safety score
 * @param {number} score - Safety score (lower is better)
 * @returns {string} - CSS color value
 */
function getRouteColor(score) {
  // Normalize score to 0-100 scale (assuming max score is 100)
  const normalizedScore = Math.min(score, 100);
  
  // Calculate RGB values
  // Lower scores (safer) are more green, higher scores (less safe) are more red
  const red = Math.floor(255 * (normalizedScore / 100));
  const green = Math.floor(255 * (1 - normalizedScore / 100));
  
  return `rgb(${red}, ${green}, 0)`;
}

/**
 * Generate a unique route ID
 * @returns {string} - Unique route ID
 */
function generateRouteId() {
  return `route-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

/**
 * Get tanker specifications based on type
 * @param {string} tankerType - Type of tanker (small, medium, large)
 * @returns {Object} - Tanker specifications
 */
function getTankerSpecs(tankerType) {
  const specs = {
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
  };
  
  return specs[tankerType] || specs.medium;
}

/**
 * Calculate estimated fuel consumption
 * @param {number} distance - Distance in meters
 * @param {string} tankerType - Type of tanker
 * @returns {number} - Fuel consumption in liters
 */
function calculateFuelConsumption(distance, tankerType) {
  // Conversion factors (liters per 100km)
  const fuelEfficiency = {
    'small': 25,
    'medium': 35,
    'large': 45
  };
  
  // Calculate consumption
  const distanceKm = distance / 1000;
  const consumption = (distanceKm / 100) * (fuelEfficiency[tankerType] || fuelEfficiency.medium);
  
  return Math.round(consumption);
}

/**
 * Calculate CO2 emissions
 * @param {number} fuelConsumption - Fuel consumption in liters
 * @returns {number} - CO2 emissions in kg
 */
function calculateCO2Emissions(fuelConsumption) {
  // Diesel CO2 emission factor: 2.68 kg CO2 per liter
  return Math.round(fuelConsumption * 2.68);
}

/**
 * Generate explanation for route selection
 * @param {Object} route - Route object with safety metrics
 * @returns {string} - Explanation text
 */
function generateRouteExplanation(route) {
  if (!route || !route.safetyMetrics) {
    return 'No safety metrics available for this route.';
  }
  
  // Get the top 3 best and worst metrics
  const metrics = Object.entries(route.safetyMetrics).map(([key, value]) => ({
    key,
    name: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
    score: value.score,
    weight: value.weight,
    weightedScore: value.score * value.weight
  }));
  
  // Sort by weighted score (lower is better)
  metrics.sort((a, b) => a.weightedScore - b.weightedScore);
  
  // Get best and worst factors
  const bestFactors = metrics.slice(0, 3);
  const worstFactors = metrics.slice(-3);
  
  // Generate explanation
  let explanation = `This route was selected based on a comprehensive safety analysis. `;
  
  // Add best factors
  explanation += `The route performs particularly well in terms of ${bestFactors.map(m => m.name.toLowerCase()).join(', ')}, `;
  
  // Add worst factors if they exist
  if (worstFactors.length > 0) {
    explanation += `but has some limitations regarding ${worstFactors.map(m => m.name.toLowerCase()).join(', ')}. `;
  }
  
  // Add distance and time info
  explanation += `The route covers ${formatDistance(route.distance)} and takes approximately ${formatDuration(route.duration)} under normal traffic conditions.`;
  
  return explanation;
}
