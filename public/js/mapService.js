/**
 * Oil Tanker Safety Routing - Map Service
 * Handles map-specific functionalities
 */

// Global variables for map features
window.schoolZoneMarkers = [];
window.hazmatRestrictionMarkers = [];
window.residentialAreaMarkers = [];
window.map = null; // Store map reference globally

/**
 * Create a marker with advanced marker support
 * @param {Object} position - Marker position
 * @param {Object} map - Google Maps instance
 * @param {string} title - Marker title
 * @param {Object} options - Additional marker options
 * @returns {Object} - Marker instance
 */
function createMarker(position, map, title, options = {}) {
  try {
    if (google.maps.marker && google.maps.marker.AdvancedMarkerElement) {
      const pinOptions = {
        background: options.color || '#4285f4',
        borderColor: options.borderColor || options.color || '#4285f4',
        glyphColor: options.glyphColor || 'white',
        scale: options.scale || 1
      };

      const pin = new google.maps.marker.PinElement(pinOptions);

      const markerOptions = {
        position: position,
        map: map,
        title: title
      };

      if (pin && pin.element) {
        markerOptions.content = pin.element;
      }

      const marker = new google.maps.marker.AdvancedMarkerElement(markerOptions);

      // Add click listener if provided
      if (options.onClick) {
        marker.addEventListener('click', options.onClick);
      }

      return marker;
    }

    // Fallback to traditional marker
    return new google.maps.Marker({
      position: position,
      map: map,
      title: title,
      icon: options.icon
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
 * Initialize map and map features
 */
// Update the initMap function
function initMap() {
  const mapElement = document.getElementById('map');
  if (!mapElement) {
    console.error('Map element not found');
    return;
  }

  try {
    // Wait for Google Maps to be fully loaded
    if (typeof google === 'undefined' || typeof google.maps === 'undefined') {
      setTimeout(initMap, 100);
      return;
    }

    window.map = new google.maps.Map(mapElement, {
      center: { lat: 28.6139, lng: 77.2090 },
      zoom: 10,
      mapId: '2acd1a3656e18ffa',
      mapTypeId: 'roadmap'
    });

    console.log('Map initialized successfully');
    
    // Initialize other map features
    if (typeof setupAutocomplete === 'function') setupAutocomplete();
    if (typeof loadRestrictedZones === 'function') loadRestrictedZones();
  } catch (error) {
    console.error('Map initialization error:', error);
  }
}

// Make sure initMap is globally accessible
window.initMap = initMap;

/**
 * Get user's current location and add marker
 * @param {Object} map - Google Maps instance
 */
function getCurrentLocation(map) {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const currentPosition = { 
          lat: position.coords.latitude, 
          lng: position.coords.longitude 
        };

        console.log('Got current position:', currentPosition);

        // Create marker using advanced marker method
        const locationMarker = createMarker(
          currentPosition,
          map,
          'Your Current Location',
          {
            color: '#4CAF50', // Green color for current location
            icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
          }
        );

        // Center the map on the user's location
        map.setCenter(currentPosition);
      },
      (error) => {
        let errorMessage = 'Unable to fetch your current location.';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by the user.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'The request to get user location timed out.';
            break;
        }
        console.error('Error getting current position:', errorMessage);
        showToast(errorMessage, 'error');
      }
    );
  } else {
    console.error('Geolocation is not supported by this browser.');
    showToast('Geolocation is not supported by your browser.', 'error');
  }
}

/**
 * Load map features based on bounds
 * @param {Object} map - Google Maps instance
 * @param {Object} bounds - Map bounds
 */
function loadMapFeatures(map, bounds) {
  console.log('Loading map features with bounds:', bounds);
  loadSchoolZones(map, bounds);
  loadHazmatRestrictions(map, bounds);
}

/**
 * Load and display school zones
 * @param {Object} map - Google Maps instance
 * @param {Object} bounds - Map bounds
 */
function loadSchoolZones(map, bounds) {
  // Clear existing markers
  clearMarkers(window.schoolZoneMarkers);

  console.log('Fetching school zones with bounds:', bounds);

  // Fetch school zones from API
  fetch(`/api/school-zones?bounds=${encodeURIComponent(JSON.stringify(bounds))}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      if (!data.success) {
        throw new Error(data.message || 'Failed to load school zones');
      }

      console.log('Received school zones:', data.schoolZones);

      // Add school zones to map
      data.schoolZones.forEach((zone) => {
        try {
          // Create circle for school zone
          const circle = new google.maps.Circle({
            strokeColor: '#FF0000',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#FF0000',
            fillOpacity: 0.1,
            map: map,
            center: { lat: zone.location.lat, lng: zone.location.lng },
            radius: zone.radius
          });

          // Create info window
          const infoWindow = new google.maps.InfoWindow({
            content: `
              <div class="info-window">
                <h4>${zone.name}</h4>
                <p><strong>Operation Hours:</strong> ${zone.operationHours}</p>
                <p><strong>Radius:</strong> ${zone.radius} meters</p>
              </div>
            `
          });

          // Add click listener
          circle.addListener('click', function () {
            infoWindow.setPosition(circle.getCenter());
            infoWindow.open(map);
          });

          // Add to collection
          window.schoolZoneMarkers.push(circle);
        } catch (error) {
          console.error('Error adding school zone to map:', error, zone);
        }
      });
    })
    .catch((error) => {
      console.error('Error loading school zones:', error);
      showToast('Failed to load school zones. Please try refreshing the page.', 'error');
    });
}

/**
 * Load and display hazmat restrictions
 * @param {Object} map - Google Maps instance
 * @param {Object} bounds - Map bounds
 */
function loadHazmatRestrictions(map, bounds) {
  // Clear existing markers
  clearMarkers(window.hazmatRestrictionMarkers);

  console.log('Fetching hazmat restrictions with bounds:', bounds);

  // Fetch hazmat restrictions from API
  fetch(`/api/hazmat-restrictions?bounds=${encodeURIComponent(JSON.stringify(bounds))}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      if (!data.success) {
        throw new Error(data.message || 'Failed to load hazmat restrictions');
      }

      console.log('Received hazmat restrictions:', data.restrictions);

      // Add hazmat restrictions to map
      data.restrictions.forEach((restriction) => {
        try {
          // Create marker using advanced marker method
          const marker = createMarker(
            { lat: restriction.location.lat, lng: restriction.location.lng },
            map,
            restriction.name,
            {
              color: '#800080', // Purple for hazmat
              icon: 'http://maps.google.com/mapfiles/ms/icons/purple-dot.png'
            }
          );

          // Create info window
          const infoWindow = new google.maps.InfoWindow({
            content: `
              <div class="info-window">
                <h4>${restriction.name}</h4>
                <p><strong>Type:</strong> ${restriction.type}</p>
                <p><strong>Classes Restricted:</strong> ${restriction.classes.join(', ')}</p>
                <p><strong>Description:</strong> ${restriction.description}</p>
              </div>
            `
          });

          // Add click listener
          marker.addListener('click', function() {
            infoWindow.open(map, marker);
          });

          // Add to collection
          window.hazmatRestrictionMarkers.push(marker);
        } catch (error) {
          console.error('Error adding hazmat restriction to map:', error, restriction);
        }
      });
    })
    .catch((error) => {
      console.error('Error loading hazmat restrictions:', error);
      showToast('Failed to load hazmat restrictions. Please try refreshing the page.', 'error');
    });
}

/**
 * Clear markers from a collection
 * @param {Array} markerArray - Array of markers to clear
 */
function clearMarkers(markerArray) {
  try {
    markerArray.forEach(marker => {
      try {
        if (marker instanceof google.maps.marker.AdvancedMarkerElement) {
          marker.map = null;
        } else {
          marker.setMap(null);
        }
      } catch (error) {
        console.error('Error clearing individual marker:', error);
      }
    });
    markerArray.length = 0;
  } catch (error) {
    console.error('Error clearing markers:', error);
  }
}

/**
 * Create map legend
 * @param {Object} map - Google Maps instance
 */
function createMapLegend(map) {
  try {
    const legend = document.createElement('div');
    legend.className = 'map-legend';
    legend.innerHTML = `
      <h4>Map Legend</h4>
      <div class="legend-item">
        <span class="legend-color" style="background-color: rgba(255, 0, 0, 0.2); border: 2px solid rgb(255, 0, 0);"></span>
        <span>School Zone</span>
      </div>
      <div class="legend-item">
        <span class="legend-color" style="background-color: rgba(255, 165, 0, 0.2); border: 2px solid rgb(255, 165, 0);"></span>
        <span>Residential Area</span>
      </div>
      <div class="legend-item">
        <span class="legend-color" style="background-color: rgba(128, 0, 128, 0.2); border: 2px solid rgb(128, 0, 128);"></span>
        <span>Hazmat Restricted</span>
      </div>
      <div class="legend-item">
        <span class="legend-color" style="background-color: rgba(0, 128, 0, 0.2); border: 2px solid rgb(0, 128, 0);"></span>
        <span>Weight Restricted</span>
      </div>
    `;

    // Apply custom styles
    legend.style.backgroundColor = 'white';
    legend.style.padding = '10px';
    legend.style.margin = '10px';
    legend.style.borderRadius = '3px';
    legend.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';

    // Add legend to map
    map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(legend);
  } catch (error) {
    console.error('Error creating map legend:', error);
  }
}

/**
 * Show toast notification
 * @param {string} message - Message to display
 * @param {string} type - Type of toast
 */
function showToast(message, type = 'info') {
  try {
    // Create toast container if it doesn't exist
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'toast-container';
      toastContainer.style.position = 'fixed';
      toastContainer.style.bottom = '20px';
      toastContainer.style.right = '20px';
      toastContainer.style.zIndex = '1000';
      document.body.appendChild(toastContainer);
    }

    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = message;

    // Style toast based on type
    toast.style.padding = '10px 15px';
    toast.style.margin = '5px 0';
    toast.style.borderRadius = '4px';
    toast.style.color = 'white';
    toast.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';

    switch (type) {
      case 'success':
        toast.style.backgroundColor = '#4CAF50';
        break;
      case 'error':
        toast.style.backgroundColor = '#F44336';
        break;
      case 'warning':
        toast.style.backgroundColor = '#FF9800';
        break;
      default:
        toast.style.backgroundColor = '#2196F3';
    }

    // Add to container
    toastContainer.appendChild(toast);

    // Remove after delay
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.5s ease';
      setTimeout(() => {
        toast.remove();
      }, 500);
    }, 3000);
  } catch (error) {
    console.error('Error showing toast:', error);
  }
}

// Global exports for map-related functions
window.initMap = initMap;
window.createMarker = createMarker;
window.getCurrentLocation = getCurrentLocation;
window.loadMapFeatures = loadMapFeatures;
window.loadSchoolZones = loadSchoolZones;
window.loadHazmatRestrictions = loadHazmatRestrictions;
window.clearMarkers = clearMarkers;
window.showToast = showToast;

// Update marker creation
// Remove the duplicate createMarker function at the bottom of the file and update the main one
function createMarker(position, map, title, options = {}) {
  try {
    if (google.maps.marker && google.maps.marker.AdvancedMarkerElement) {
      const pinOptions = {
        background: options.color || '#4285f4',
        borderColor: options.borderColor || options.color || '#4285f4',
        glyphColor: options.glyphColor || 'white',
        scale: options.scale || 1
      };

      const pin = new google.maps.marker.PinElement(pinOptions);

      const markerOptions = {
        position: position,
        map: map,
        title: title
      };

      if (pin && pin.element) {
        markerOptions.content = pin.element;
      }

      const marker = new google.maps.marker.AdvancedMarkerElement(markerOptions);

      // Add click listener if provided
      if (options.onClick) {
        marker.addEventListener('click', options.onClick);
      }

      return marker;
    }

    // Fallback to traditional marker
    return new google.maps.Marker({
      position: position,
      map: map,
      title: title,
      icon: options.icon
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

// Remove this duplicate function at the bottom of the file
// function createMarker(position, map, options = {}) { ... }