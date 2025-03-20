/**
 * Oil Tanker Safety Routing - Main Client-Side JavaScript
 */


// Global variables
window.map = window.map || null;
window.directionsService = window.directionsService || null;
window.directionsRenderer = window.directionsRenderer || null;
window.markerOrigin = window.markerOrigin || null;
window.markerDestination = window.markerDestination || null;
window.activeSelection = window.activeSelection || null;
window.routePolylines = window.routePolylines || [];
window.currentRoutes = window.currentRoutes || [];

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Set up event listeners
  setupEventListeners();
});

/**
 * Initialize Google Maps
 */
window.initMap = function() {
  // Your existing map initialization code
  if (document.getElementById('map')) {
    window.map = new google.maps.Map(document.getElementById('map'), {
      center: { lat: 28.6139, lng: 77.2090 },
      zoom: 10,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    });
    
    // Other initialization logic
    if (typeof setupAutocomplete === 'function') setupAutocomplete();
    if (typeof setupMapPointSelection === 'function') setupMapPointSelection();
    if (typeof loadRestrictedZones === 'function') loadRestrictedZones();
  }
};

/**
 * Create a marker with support for AdvancedMarkerElement
 * @param {Object} position - Marker position
 * @param {Object} map - Google Maps instance
 * @param {string} title - Marker title
 * @param {string} content - Optional marker content
 * @returns {Object} - Marker instance
 */
function createMarker(position, map, title, content = null) {
  try {
    if (google.maps.marker && google.maps.marker.AdvancedMarkerElement) {
      const pinOptions = {
        glyph: title === 'Origin' ? 'O' : 'D',
        background: title === 'Origin' ? '#4CAF50' : '#FF0000',
        borderColor: title === 'Origin' ? '#2E7D32' : '#B71C1C'
      };

      const pin = new google.maps.marker.PinElement(pinOptions);
      
      const markerOptions = {
        map: map,
        position: position,
        title: title,
        content: pin.element
      };

      return new google.maps.marker.AdvancedMarkerElement(markerOptions);
    }

    // Fallback to traditional marker if AdvancedMarkerElement is not available
    return new google.maps.Marker({
      position: position,
      map: map,
      title: title,
      icon: {
        url: title === 'Origin' ? 
          'http://maps.google.com/mapfiles/ms/icons/green-dot.png' : 
          'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
      }
    });
  } catch (error) {
    console.error('Error creating marker:', error);
    // Fallback to basic marker
    return new google.maps.Marker({
      position: position,
      map: map,
      title: title
    });
  }
}

/**
 * Set up map point selection with Advanced Marker support
 */
// Improved Map Point Selection Script
// Improved Map Point Selection and Geocoding

// Improved Map Point Selection and Geocoding
// Global variables for markers and map
window.originMarker = null;
window.destinationMarker = null;
window.map = null;

// Initialize map and point selection
function initMapPointSelection() {
  const mapElement = document.getElementById('map');
  const originInput = document.getElementById('origin-input');
  const destinationInput = document.getElementById('destination-input');
  const pickOriginBtn = document.getElementById('pick-origin');
  const pickDestinationBtn = document.getElementById('pick-destination');

  // Validate elements exist
  if (!mapElement || !originInput || !destinationInput || 
      !pickOriginBtn || !pickDestinationBtn) {
    console.error('Required map elements not found');
    return;
  }

  // Initialize map if not already done
  // Update the map initialization in initMapPointSelection function
  if (!window.map) {
    window.map = new google.maps.Map(mapElement, {
      center: { lat: 28.6139, lng: 77.2090 }, // New Delhi coordinates
      zoom: 10,
      mapTypeId: 'roadmap',
      mapId: '2acd1a3656e18ffa' // Add this line - replace with your actual Map ID
    });
    console.log('Map initialized successfully');
  }

  // Geocoder for address lookup
  const geocoder = new google.maps.Geocoder();

  // Function to create or update marker
  function createMarker(location, type) {
    // Remove existing marker
    const existingMarker = type === 'origin' ? window.originMarker : window.destinationMarker;
    if (existingMarker) {
      existingMarker.setMap(null);
    }

    // Create new marker
    const marker = new google.maps.Marker({
      position: location,
      map: window.map,
      title: type === 'origin' ? 'Origin Point' : 'Destination Point',
      icon: type === 'origin' 
        ? 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
        : 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
    });

    // Store marker globally
    if (type === 'origin') {
      window.originMarker = marker;
    } else {
      window.destinationMarker = marker;
    }

    // Center map on marker
    window.map.setCenter(location);
    window.map.setZoom(10);

    return marker;
  }

  // Handle map click for point selection
  let currentSelectionMode = null;
  window.map.addListener('click', function(event) {
    if (!currentSelectionMode) return;

    const clickedLocation = event.latLng;

    // Perform reverse geocoding
    geocoder.geocode({ location: clickedLocation }, (results, status) => {
      if (status === 'OK' && results[0]) {
        // Create marker
        const marker = createMarker(clickedLocation, currentSelectionMode);

        // Update input field with full address
        const input = currentSelectionMode === 'origin' ? originInput : destinationInput;
        input.value = results[0].formatted_address;

        // Store geocoded location data
        if (currentSelectionMode === 'origin') {
          window.originAddress = results[0].formatted_address;
          window.originLocation = {
            lat: clickedLocation.lat(),
            lng: clickedLocation.lng()
          };
        } else {
          window.destinationAddress = results[0].formatted_address;
          window.destinationLocation = {
            lat: clickedLocation.lat(),
            lng: clickedLocation.lng()
          };
        }
      } else {
        console.error('Geocoding failed:', status);
        
        // Fallback to lat/lng if geocoding fails
        const input = currentSelectionMode === 'origin' ? originInput : destinationInput;
        input.value = `${clickedLocation.lat()}, ${clickedLocation.lng()}`;
        
        // Still create marker
        createMarker(clickedLocation, currentSelectionMode);
      }

      // Reset selection mode
      currentSelectionMode = null;
      mapElement.style.cursor = 'default';
    });
  });

  // Set up click listeners for select buttons
  pickOriginBtn.addEventListener('click', () => {
    currentSelectionMode = 'origin';
    mapElement.style.cursor = 'crosshair';
  });

  pickDestinationBtn.addEventListener('click', () => {
    currentSelectionMode = 'destination';
    mapElement.style.cursor = 'crosshair';
  });

  // Set up autocomplete for input fields
  const originAutocomplete = new google.maps.places.Autocomplete(originInput, {
    types: ['geocode']
  });
  const destinationAutocomplete = new google.maps.places.Autocomplete(destinationInput, {
    types: ['geocode']
  });

  // Handle place selection from autocomplete
  originAutocomplete.addListener('place_changed', () => {
    const place = originAutocomplete.getPlace();
    if (place.geometry) {
      // Create marker specifically for origin
      const marker = createMarker(place.geometry.location, 'origin');
      
      // Ensure input shows full address
      originInput.value = place.formatted_address || place.name;

      // Store geocoded location data
      window.originAddress = place.formatted_address || place.name;
      window.originLocation = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng()
      };
    }
  });

  // Unique place changed listeners for destination
  destinationAutocomplete.addListener('place_changed', () => {
    const place = destinationAutocomplete.getPlace();
    if (place.geometry) {
      // Create marker specifically for destination
      const marker = createMarker(place.geometry.location, 'destination');
      
      // Ensure input shows full address
      destinationInput.value = place.formatted_address || place.name;

      // Store geocoded location data
      window.destinationAddress = place.formatted_address || place.name;
      window.destinationLocation = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng()
      };
    }
  });

  // Global methods to get selected locations
  window.getSelectedOrigin = () => window.originLocation;
  window.getSelectedDestination = () => window.destinationLocation;
}

// Attach to window for global access
window.initMapPointSelection = initMapPointSelection;

// Add event listener to ensure initialization
document.addEventListener('DOMContentLoaded', () => {
  // Check if Google Maps is loaded
  if (window.google && window.google.maps) {
    initMapPointSelection();
  } else {
    console.warn('Google Maps API not loaded. Waiting for initialization.');
  }
});

/**
 * Set up event listeners for the application
 */
function setupEventListeners() {
  // Update the form submission handler
  const routeForm = document.getElementById('route-form');
  if (routeForm) {
    routeForm.addEventListener('submit', function(e) {
      e.preventDefault();
      console.log('Route form submitted');
      calculateRoutes();
    });
  } else {
    console.error('Route form not found');
  }

  // Set up point selection buttons
  const pickOriginBtn = document.getElementById('pick-origin');
  const pickDestinationBtn = document.getElementById('pick-destination');

  if (pickOriginBtn) {
    pickOriginBtn.addEventListener('click', function() {
      window.activeSelection = 'origin';
    });
  }

  if (pickDestinationBtn) {
    pickDestinationBtn.addEventListener('click', function() {
      window.activeSelection = 'destination';
    });
  }
}

function calculateRoutes() {
  try {
    // Validate inputs
    if (!window.originLocation || !window.destinationLocation) {
      showToast('Please select both origin and destination points', 'error');
      return;
    }

    // Show loading state
    const resultsContainer = document.getElementById('route-results');
    if (resultsContainer) {
      resultsContainer.innerHTML = '<div class="loading">Calculating safest routes...</div>';
    }

    // Prepare request data
    const requestData = {
      origin: {
        lat: window.originLocation.lat,
        lng: window.originLocation.lng
      },
      destination: {
        lat: window.destinationLocation.lat,
        lng: window.destinationLocation.lng
      },
      preferences: {
        tankerType: document.getElementById('tanker-type')?.value || 'standard',
        hazmatClass: document.getElementById('hazmat-class')?.value || 'class1',
        avoidHighways: document.getElementById('avoid-highways')?.checked || false,
        avoidTolls: document.getElementById('avoid-tolls')?.checked || false
      }
    };

    // Make API request
    fetch('/api/calculate-routes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    })
    .then(response => response.json())
    .then(data => {
      console.log('Route calculation response:', data);
      if (!data.success) {
        throw new Error(data.message || 'Failed to calculate routes');
      }
      displayRoutes(data.routes);
    })
    .catch(error => {
      console.error('Route calculation error:', error);
      showToast(error.message || 'Failed to calculate routes', 'error');
      if (resultsContainer) {
        resultsContainer.innerHTML = `
          <div class="alert alert-danger">
            Failed to calculate routes: ${error.message}
          </div>
        `;
      }
    });
  } catch (error) {
    console.error('Route calculation error:', error);
    showToast('An unexpected error occurred', 'error');
  }
}

function displayRoutes(routes) {
  // Clear existing routes
  clearRoutes();
  
  // Check if Google Maps is available
  if (!window.google || !window.google.maps) {
    console.error('Google Maps API not loaded');
    return;
  }

  // Display each route as a polyline
  routes.forEach(route => {
    // Decode the polyline
    const path = window.google.maps.geometry.encoding.decodePath(route.polyline);
    
    // Create polyline
    const polyline = new window.google.maps.Polyline({
      path: path,
      strokeColor: route.color || '#3498db',
      strokeOpacity: route.isSafest ? 1.0 : 0.7,
      strokeWeight: route.isSafest ? 6 : 4,
      map: window.map,
      zIndex: route.isSafest ? 10 : 1
    });
    
    // Store route ID with the polyline
    polyline.routeId = route.routeId;
    
    // Add click listener
    polyline.addListener('click', function() {
      showRouteDetails(this.routeId);
    });
    
    // Add to the collection
    window.routePolylines.push(polyline);
  });
  
  // Fit map to show all routes
  if (routes.length > 0 && routes[0].bounds) {
    const bounds = new window.google.maps.LatLngBounds(
      new window.google.maps.LatLng(
        routes[0].bounds.southwest.lat,
        routes[0].bounds.southwest.lng
      ),
      new window.google.maps.LatLng(
        routes[0].bounds.northeast.lat,
        routes[0].bounds.northeast.lng
      )
    );
    window.map.fitBounds(bounds);
  }
  
  // Add origin and destination markers
  if (window.originLocation) {
    window.originMarker = createMarker(
      window.originLocation,
      window.map,
      'Origin',
      '<div class="marker-content origin-marker">Origin</div>'
    );
  }
  
  if (window.destinationLocation) {
    window.destinationMarker = createMarker(
      window.destinationLocation,
      window.map,
      'Destination',
      '<div class="marker-content destination-marker">Destination</div>'
    );
  }
}

/**
 * Display route list in the sidebar
 * @param {Array} routes - Array of route objects
 */
function displayRouteList(routes) {
  const container = document.getElementById('route-results');
  
  if (!container) return;
  
  let html = '<div class="route-list">';
  
  routes.forEach((route, index) => {
    const distanceKm = (route.distance / 1000).toFixed(2);
    const durationMin = Math.floor(route.duration / 60);
    
    html += `
      <div class="card route-card ${route.isSafest ? 'safest-route' : ''} mb-3">
        <div class="card-status-top bg-success"></div>
        <div class="card-body">
          <h3 class="card-title">
            ${route.isSafest ? '<span class="badge bg-success me-2">Safest</span>' : `<span class="badge bg-secondary me-2">Route ${index + 1}</span>`}
            <span>${route.summary || `Route ${index + 1}`}</span>
          </h3>
          <div class="route-metrics">
            <div class="route-metric">
              <i class="ti ti-ruler"></i>
              <span>${distanceKm} km</span>
            </div>
            <div class="route-metric">
              <i class="ti ti-clock"></i>
              <span>${durationMin} min</span>
            </div>
            <div class="route-metric">
              <i class="ti ti-shield"></i>
              <span>Safety: ${route.safetyScore.toFixed(2)}</span>
            </div>
          </div>
          <button class="btn btn-primary btn-sm mt-3 view-route-details" data-route-id="${route.routeId}">
            View Details
          </button>
        </div>
      </div>
    `;
  });
  
  html += '</div>';
  container.innerHTML = html;
}

/**
 * Show detailed metrics for a specific route
 * @param {string} routeId - Route identifier
 */
function showRouteDetails(routeId) {
  // Highlight the selected route on the map
  highlightRoute(routeId);
  
  // Find the route in the current routes
  const route = window.currentRoutes.find(r => r.routeId === routeId);
  
  if (!route) {
    console.error('Route not found:', routeId);
    return;
  }
  
  // Get the details container
  const container = document.getElementById('route-details');
  
  if (!container) return;
  
  // Show loading state
  container.innerHTML = '<div class="loading">Loading route details...</div>';
  
  // Fetch detailed metrics from the API
  fetch(`/api/route-metrics/${routeId}`)
    .then(response => response.json())
    .then(data => {
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch route details');
      }
      
      const metrics = data.metrics;
      
      // Display route details
      container.innerHTML = `
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">
              ${route.isSafest ? '<span class="badge bg-success me-2">Safest Route</span>' : ''}
              ${route.summary || 'Route Details'}
            </h3>
          </div>
          <div class="card-body">
            <div class="mb-4">
              <h4 class="mb-3">Route Justification</h4>
              <p>${route.justification}</p>
            </div>
            
            <h4 class="mb-3">Basic Metrics</h4>
            <div class="metrics-grid mb-4">
              <div class="metric-item">
                <div class="metric-title">Distance</div>
                <div class="metric-value">${metrics.basicMetrics.distance}</div>
              </div>
              <div class="metric-item">
                <div class="metric-title">Duration</div>
                <div class="metric-value">${metrics.basicMetrics.duration}</div>
              </div>
              <div class="metric-item">
                <div class="metric-title">Duration in Traffic</div>
                <div class="metric-value">${metrics.basicMetrics.trafficDuration}</div>
              </div>
              <div class="metric-item">
                <div class="metric-title">Fuel Consumption (est.)</div>
                <div class="metric-value">${metrics.basicMetrics.fuelConsumption}</div>
              </div>
              <div class="metric-item">
                <div class="metric-title">CO₂ Emissions (est.)</div>
                <div class="metric-value">${metrics.basicMetrics.co2Emissions}</div>
              </div>
              <div class="metric-item">
                <div class="metric-title">Average Speed</div>
                <div class="metric-value">${metrics.basicMetrics.averageSpeed}</div>
              </div>
            </div>
            
            <h4 class="mb-3">Safety Metrics</h4>
            <div class="safety-metrics mb-4">
              ${Object.entries(metrics.safetyPercentages).map(([key, value]) => {
                const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                return `
                  <div class="safety-metric">
                    <div class="safety-label">${label}</div>
                    <div class="safety-bar">
                      <div class="safety-fill" style="width: ${value}%;"></div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
            
            ${metrics.restrictions.hazmat.length > 0 ? `
              <h4 class="mb-3">Hazmat Restrictions</h4>
              <ul class="mb-4">
                ${metrics.restrictions.hazmat.map(r => `
                  <li><strong>${r.location}:</strong> ${r.description}</li>
                `).join('')}
              </ul>
            ` : ''}
            
            ${metrics.restrictions.speed.length > 0 ? `
              <h4 class="mb-3">Speed Restrictions</h4>
              <ul class="mb-4">
                ${metrics.restrictions.speed.map(r => `
                  <li><strong>${r.location}:</strong> ${r.limit}</li>
                `).join('')}
              </ul>
            ` : ''}
            
            ${metrics.restrictions.weight.length > 0 ? `
              <h4 class="mb-3">Weight Restrictions</h4>
              <ul class="mb-4">
                ${metrics.restrictions.weight.map(r => `
                  <li><strong>${r.location}:</strong> ${r.limit}</li>
                `).join('')}
              </ul>
            ` : ''}
          </div>
        </div>
      `;
    })
    .catch(error => {
      console.error('Error:', error);
      container.innerHTML = '<div class="alert alert-danger">Failed to load route details. Please try again.</div>';
    });
}

/**
 * Highlight a specific route on the map
 * @param {string} routeId - Route identifier
 */
function highlightRoute(routeId) {
  window.routePolylines.forEach(polyline => {
    const isSelected = polyline.routeId === routeId;
    const route = window.currentRoutes.find(r => r.routeId === polyline.routeId);
    
    polyline.setOptions({
      strokeOpacity: isSelected ? 1.0 : 0.5,
      strokeWeight: isSelected ? 6 : 4,
      zIndex: isSelected ? 10 : 1
    });
  });
}

/**
 * Clear all routes from the map
 */
function clearRoutes() {
  window.routePolylines.forEach(polyline => {
    polyline.setMap(null);
  });
  window.routePolylines = [];
}

/**
 * Load and display restricted zones on the map
 */
function loadRestrictedZones() {
  // In a real app, you would fetch this data from the server
  // For demo purposes, we'll add some example zones
  
  // Add some school zones
  const schoolZones = [
    { lat: 40.7128, lng: -74.0260, radius: 300 },
    { lat: 40.7328, lng: -74.0160, radius: 250 }
  ];
  
  schoolZones.forEach(zone => {
    new google.maps.Circle({
      strokeColor: '#FF0000',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#FF0000',
      fillOpacity: 0.1,
      map: window.map,
      center: { lat: zone.lat, lng: zone.lng },
      radius: zone.radius
    });
  });
  
  // Add residential areas
  const residentialAreas = [
    { lat: 40.7228, lng: -74.0060, radius: 500 },
    { lat: 40.7028, lng: -73.9760, radius: 600 }
  ];
  
  residentialAreas.forEach(area => {
    new google.maps.Circle({
      strokeColor: '#FFA500',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#FFA500',
      fillOpacity: 0.1,
      map: window.map,
      center: { lat: area.lat, lng: area.lng },
      radius: area.radius
    });
  });
}

/**
 * Show a toast notification
 * @param {string} message - Toast message
 * @param {string} type - Toast type (success, info, warning, error)
 */
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <div class="toast-header">
      <strong class="me-auto">${type.charAt(0).toUpperCase() + type.slice(1)}</strong>
      <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
    <div class="toast-body">${message}</div>
  `;
  
  document.body.appendChild(toast);
  
  const bsToast = new bootstrap.Toast(toast);
  bsToast.show();
  
  toast.addEventListener('hidden.bs.toast', function() {
    document.body.removeChild(toast);
  });
}