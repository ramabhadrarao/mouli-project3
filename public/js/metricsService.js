/**
 * Oil Tanker Safety Routing - Metrics Service
 * Handles metrics visualization and analysis
 */

/**
 * Initialize safety metrics chart
 * @param {string} elementId - Chart container element ID
 * @param {Array} data - Chart data
 */
function initSafetyChart(elementId, data) {
  // Check if chart element exists
  const chartElement = document.getElementById(elementId);
  if (!chartElement) return;
  
  // If no data provided, use sample data
  if (!data) {
    data = generateSampleSafetyData();
  }
  
  // Initialize chart if Tabler Charts is available
  if (window.Tabler && window.Tabler.Chart) {
    new window.Tabler.Chart(document.getElementById(elementId), {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: [
          {
            label: 'Overall Safety Score',
            backgroundColor: 'rgba(32, 107, 196, 0.1)',
            borderColor: 'rgba(32, 107, 196, 1)',
            data: data.overall
          },
          {
            label: 'School Zone Avoidance',
            backgroundColor: 'rgba(214, 51, 132, 0.1)',
            borderColor: 'rgba(214, 51, 132, 1)',
            data: data.schoolZone
          },
          {
            label: 'Residential Area Avoidance',
            backgroundColor: 'rgba(241, 196, 15, 0.1)',
            borderColor: 'rgba(241, 196, 15, 1)',
            data: data.residential
          }
        ]
      },
      options: {
        responsive: true,
        legend: {
          display: true,
          position: 'bottom'
        },
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true,
              max: 100
            }
          }]
        },
        elements: {
          line: {
            tension: 0.4
          }
        }
      }
    });
  }
}

/**
 * Generate sample safety data for charts
 * @returns {Object} - Sample data object
 */
function generateSampleSafetyData() {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const overall = [];
  const schoolZone = [];
  const residential = [];
  
  // Generate random data with an upward trend
  let baseScore = 75;
  
  for (let i = 0; i < 12; i++) {
    // Overall score improves over time (with some randomness)
    baseScore = Math.min(baseScore + (Math.random() * 2 - 0.5), 95);
    overall.push(baseScore);
    
    // School zone and residential metrics follow similar patterns with variations
    schoolZone.push(baseScore - 5 + (Math.random() * 10));
    residential.push(baseScore - 3 + (Math.random() * 8));
  }
  
  return {
    labels: months,
    overall,
    schoolZone,
    residential
  };
}

/**
 * Initialize hotspot map
 * @param {string} elementId - Map container element ID
 */
function initHotspotMap(elementId) {
  // Check if map element exists
  const mapElement = document.getElementById(elementId);
  if (!mapElement) return;
  
  // Create map instance
  const map = new google.maps.Map(mapElement, {
    center: { lat: 40.7128, lng: -74.0060 }, // Default center (New York)
    zoom: 11,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    mapTypeControl: true,
    mapTypeControlOptions: {
      style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
      position: google.maps.ControlPosition.TOP_RIGHT
    }
  });
  
  // Add sample hotspots
  addSampleHotspots(map);
}

/**
 * Add sample safety hotspots to map
 * @param {Object} map - Google Maps instance
 */
function addSampleHotspots(map) {
  // Sample hotspots data (would be fetched from API in a real app)
  const hotspots = [
    {
      position: { lat: 40.7128, lng: -74.0060 },
      intensity: 85,
      type: 'school'
    },
    {
      position: { lat: 40.7328, lng: -74.0260 },
      intensity: 65,
      type: 'residential'
    },
    {
      position: { lat: 40.7028, lng: -73.9960 },
      intensity: 90,
      type: 'hazmat'
    },
    {
      position: { lat: 40.7228, lng: -73.9860 },
      intensity: 75,
      type: 'weight'
    }
  ];
  
  // Add markers for each hotspot
  hotspots.forEach(hotspot => {
    // Determine color based on type
    let color;
    switch (hotspot.type) {
      case 'school':
        color = '#FF0000'; // Red
        break;
      case 'residential':
        color = '#FFA500'; // Orange
        break;
      case 'hazmat':
        color = '#800080'; // Purple
        break;
      case 'weight':
        color = '#008000'; // Green
        break;
      default:
        color = '#0000FF'; // Blue
    }
    
    // Create circle with size based on intensity
    const circle = new google.maps.Circle({
      strokeColor: color,
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: color,
      fillOpacity: 0.35,
      map: map,
      center: hotspot.position,
      radius: hotspot.intensity * 10
    });
    
    // Add info window
    const infoWindow = new google.maps.InfoWindow({
      content: `
        <div class="info-window">
          <h4>Safety Hotspot</h4>
          <p><strong>Type:</strong> ${hotspot.type.charAt(0).toUpperCase() + hotspot.type.slice(1)}</p>
          <p><strong>Risk Level:</strong> ${hotspot.intensity}%</p>
        </div>
      `
    });
    
    // Add click listener
    circle.addListener('click', function() {
      infoWindow.setPosition(circle.getCenter());
      infoWindow.open(map);
    });
  });
}

/**
 * Format safety score display
 * @param {number} score - Safety score
 * @returns {Object} - Formatted score with class and text
 */
function formatSafetyScore(score) {
  let colorClass, label;
  
  if (score >= 90) {
    colorClass = 'text-success';
    label = 'Excellent';
  } else if (score >= 80) {
    colorClass = 'text-success';
    label = 'Very Good';
  } else if (score >= 70) {
    colorClass = 'text-primary';
    label = 'Good';
  } else if (score >= 60) {
    colorClass = 'text-warning';
    label = 'Satisfactory';
  } else if (score >= 50) {
    colorClass = 'text-orange';
    label = 'Marginal';
  } else {
    colorClass = 'text-danger';
    label = 'Poor';
  }
  
  return {
    score: score.toFixed(1),
    colorClass,
    label
  };
}

// Initialize charts on dashboard page when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  // Initialize safety chart if we're on the dashboard page
  if (document.getElementById('safety-chart')) {
    initSafetyChart('safety-chart');
  }
  
  // Initialize hotspot map if we're on the dashboard page
  if (document.getElementById('hotspot-map')) {
    // Initialize map when Google Maps API is loaded
    if (window.google && window.google.maps) {
      initHotspotMap('hotspot-map');
    } else {
      // Set callback for when Maps API loads
      window.initHotspotMap = function() {
        initHotspotMap('hotspot-map');
      };
    }
  }
});
