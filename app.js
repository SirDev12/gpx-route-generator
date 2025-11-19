// ================================
// GPX Route Generator - Main Application
// ================================

// Global Variables
let map;
let routeMarkers = [];
let routePoints = [];
let polyline;
let lightTileLayer;
let darkTileLayer;

// ================================
// Map Initialization
// ================================

function initMap() {
    // Initialize map centered on Bandung
    map = L.map('map').setView([-6.9175, 107.6191], 13);

    // Light mode tile layer
    lightTileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
    });

    // Dark mode tile layer
    darkTileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors',
        className: 'tile-dark'
    });

    // Add default light tile layer
    lightTileLayer.addTo(map);

    // Add search functionality
    const provider = new window.GeoSearch.OpenStreetMapProvider();
    const searchControl = new window.GeoSearch.GeoSearchControl({
        provider: provider,
        style: 'bar',
        showMarker: false,
        autoClose: true,
        keepResult: true,
        searchLabel: 'Search locations in Bandung...'
    });
    map.addControl(searchControl);

    // Map click event to add markers
    map.on('click', function(e) {
        addMarker(e.latlng);
    });
}

// ================================
// Marker & Route Management
// ================================

function addMarker(latlng) {
    const marker = L.marker(latlng, { draggable: true });
    marker.addTo(map);
    routeMarkers.push(marker);

    // Update on drag
    marker.on('dragend', function() {
        updateRouteAndStats();
    });

    updateRouteAndStats();
}

function updateRouteAndStats() {
    // Update routePoints from markers
    routePoints = routeMarkers.map(m => {
        const ll = m.getLatLng();
        return { lat: ll.lat, lon: ll.lng };
    });

    // Remove old polyline
    if (polyline) map.removeLayer(polyline);

    // Draw new polyline
    if (routePoints.length > 1) {
        const latlngs = routePoints.map(p => [p.lat, p.lon]);
        polyline = L.polyline(latlngs, { color: '#FC4C02', weight: 4 }).addTo(map);
    }

    // Update stats display
    document.getElementById('pointCount').innerText = routePoints.length;
    document.getElementById('distanceDisplay').innerText = calculateTotalDistance().toFixed(2);
}

function calculateTotalDistance() {
    let distance = 0;
    for (let i = 1; i < routePoints.length; i++) {
        distance += haversine(
            routePoints[i-1].lat, routePoints[i-1].lon,
            routePoints[i].lat, routePoints[i].lon
        );
    }
    return distance / 1000; // Convert to km
}

// Haversine formula for distance calculation
function haversine(lat1, lon1, lat2, lon2) {
    const R = 6371000; // Earth radius in meters
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

function toRad(deg) {
    return deg * (Math.PI / 180);
}

// ================================
// Action Buttons
// ================================

// Undo button
document.getElementById('undoBtn').addEventListener('click', () => {
    if (routeMarkers.length > 0) {
        const lastMarker = routeMarkers.pop();
        map.removeLayer(lastMarker);
        updateRouteAndStats();
        updateStatusMessage('Last point removed.', 'info');
    } else {
        updateStatusMessage('No points to remove.', 'error');
    }
});

// Reset button
document.getElementById('resetBtn').addEventListener('click', () => {
    for (let marker of routeMarkers) {
        map.removeLayer(marker);
    }
    routeMarkers = [];
    document.getElementById('laps').value = 1;
    updateRouteAndStats();
    updateStatusMessage('Route has been reset. Click on the map to create a new route.', 'info');
});

// Generate GPX button
document.getElementById('generateBtn').addEventListener('click', async () => {
    if (routePoints.length < 2) {
        updateStatusMessage('Please create a route with at least 2 points.', 'error');
        return;
    }

    const pace = document.getElementById('pace').value;
    const activity = document.getElementById('activity').value;
    const laps = document.getElementById('laps').value;
    
    updateStatusMessage('Processing your route... Please wait.', 'processing');
    
    try {
        const response = await fetch('http://127.0.0.1:5000/generate_gpx', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                points: routePoints, 
                pace_minutes: parseFloat(pace),
                activity_type: activity,
                laps: parseInt(laps)
            })
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.statusText}`);
        }
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `activity_${activity}_${laps}laps_${Date.now()}.gpx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        
        updateStatusMessage('GPX file successfully created and downloaded!', 'success');
    } catch (error) {
        console.error('Error:', error);
        updateStatusMessage('Failed to create GPX file. Make sure the backend server is running.', 'error');
    }
});

// ================================
// Status Message Helper
// ================================

function updateStatusMessage(message, type = 'info') {
    const statusEl = document.getElementById('statusMessage');
    const iconMap = {
        'info': 'ℹ️',
        'success': '✅',
        'error': '❌',
        'processing': '⏳'
    };
    
    statusEl.className = type === 'info' ? 'info-message' : `status-message ${type}`;
    statusEl.innerHTML = `<span class="info-icon">${iconMap[type] || iconMap.info}</span><span>${message}</span>`;
}

// ================================
// Dark Mode Toggle
// ================================

const themeToggle = document.getElementById('themeToggle');

function setMode(mode) {
    if (mode === 'dark') {
        document.body.classList.add('dark-mode');
        themeToggle.innerHTML = '☀️ Light Mode';
        if (map.hasLayer(lightTileLayer)) map.removeLayer(lightTileLayer);
        map.addLayer(darkTileLayer);
        localStorage.setItem('theme', 'dark');
    } else {
        document.body.classList.remove('dark-mode');
        themeToggle.innerHTML = '🌙 Dark Mode';
        if (map.hasLayer(darkTileLayer)) map.removeLayer(darkTileLayer);
        map.addLayer(lightTileLayer);
        localStorage.setItem('theme', 'light');
    }
}

themeToggle.addEventListener('click', () => {
    const currentMode = localStorage.getItem('theme') || 'light';
    setMode(currentMode === 'dark' ? 'light' : 'dark');
});

// ================================
// Favorites Management
// ================================

// Load favorites from localStorage
function loadFavorites() {
    const favorites = JSON.parse(localStorage.getItem('routeFavorites') || '[]');
    const favoritesList = document.getElementById('favoritesList');
    
    if (favorites.length === 0) {
        favoritesList.innerHTML = `
            <div class="empty-favorites">
                <div class="empty-favorites-icon">⭐</div>
                <p>No favorite routes yet.<br>Save your routes to access them quickly!</p>
            </div>
        `;
        return;
    }

    favoritesList.innerHTML = favorites.map((fav, index) => {
        const distance = calculateRouteDistance(fav.points);
        return `
            <div class="favorite-item" data-index="${index}">
                <div class="favorite-header">
                    <div class="favorite-name">
                        <span>${getActivityIcon(fav.activity)}</span>
                        <span>${fav.name}</span>
                    </div>
                    <button class="favorite-delete" data-index="${index}" onclick="deleteFavorite(event, ${index})">
                        ×
                    </button>
                </div>
                ${fav.description ? `<div class="favorite-description">${fav.description}</div>` : ''}
                <div class="favorite-stats">
                    <div class="favorite-stat">
                        <span>📍</span>
                        <span>${fav.points.length} points</span>
                    </div>
                    <div class="favorite-stat">
                        <span>📏</span>
                        <span>${distance} km</span>
                    </div>
                    <div class="favorite-stat">
                        <span>🔄</span>
                        <span>${fav.laps} lap${fav.laps > 1 ? 's' : ''}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // Add click events to load routes
    document.querySelectorAll('.favorite-item').forEach(item => {
        item.addEventListener('click', function(e) {
            if (!e.target.classList.contains('favorite-delete')) {
                const index = this.dataset.index;
                loadFavoriteRoute(index);
            }
        });
    });
}

// Get activity icon
function getActivityIcon(activity) {
    const icons = {
        'Run': '🏃',
        'Ride': '🚴',
        'Walk': '🚶'
    };
    return icons[activity] || '🏃';
}

// Calculate route distance for display
function calculateRouteDistance(points) {
    let distance = 0;
    for (let i = 1; i < points.length; i++) {
        distance += haversine(points[i-1].lat, points[i-1].lon, points[i].lat, points[i].lon);
    }
    return (distance / 1000).toFixed(2);
}

// Load a favorite route onto the map
function loadFavoriteRoute(index) {
    const favorites = JSON.parse(localStorage.getItem('routeFavorites') || '[]');
    const favorite = favorites[index];
    
    if (!favorite) return;

    // Clear existing route
    for (let marker of routeMarkers) {
        map.removeLayer(marker);
    }
    routeMarkers = [];

    // Load the favorite route points
    favorite.points.forEach(point => {
        addMarker(L.latLng(point.lat, point.lon));
    });

    // Set the settings
    document.getElementById('pace').value = favorite.pace;
    document.getElementById('activity').value = favorite.activity;
    document.getElementById('laps').value = favorite.laps;

    updateRouteAndStats();
    
    // Fit map to route bounds
    if (routeMarkers.length > 0) {
        const group = L.featureGroup(routeMarkers);
        map.fitBounds(group.getBounds().pad(0.1));
    }

    updateStatusMessage(`Loaded route: ${favorite.name}`, 'success');
}

// Delete a favorite route
window.deleteFavorite = function(event, index) {
    event.stopPropagation();
    
    if (confirm('Are you sure you want to delete this favorite route?')) {
        const favorites = JSON.parse(localStorage.getItem('routeFavorites') || '[]');
        favorites.splice(index, 1);
        localStorage.setItem('routeFavorites', JSON.stringify(favorites));
        loadFavorites();
        updateStatusMessage('Favorite route deleted.', 'info');
    }
};

// Save current route as favorite
document.getElementById('saveRouteBtn').addEventListener('click', () => {
    if (routePoints.length < 2) {
        updateStatusMessage('Please create a route with at least 2 points before saving.', 'error');
        return;
    }
    
    // Show modal
    document.getElementById('saveModal').classList.add('show');
    document.getElementById('routeName').value = '';
    document.getElementById('routeDescription').value = '';
    document.getElementById('routeName').focus();
});

// Modal close handlers
document.getElementById('closeModal').addEventListener('click', () => {
    document.getElementById('saveModal').classList.remove('show');
});

document.getElementById('cancelSave').addEventListener('click', () => {
    document.getElementById('saveModal').classList.remove('show');
});

// Click outside modal to close
document.getElementById('saveModal').addEventListener('click', (e) => {
    if (e.target.id === 'saveModal') {
        document.getElementById('saveModal').classList.remove('show');
    }
});

// Confirm save
document.getElementById('confirmSave').addEventListener('click', () => {
    const name = document.getElementById('routeName').value.trim();
    const description = document.getElementById('routeDescription').value.trim();

    if (!name) {
        alert('Please enter a route name.');
        return;
    }

    const favorites = JSON.parse(localStorage.getItem('routeFavorites') || '[]');
    
    const newFavorite = {
        id: Date.now(),
        name: name,
        description: description,
        points: routePoints,
        pace: document.getElementById('pace').value,
        activity: document.getElementById('activity').value,
        laps: document.getElementById('laps').value,
        createdAt: new Date().toISOString()
    };

    favorites.push(newFavorite);
    localStorage.setItem('routeFavorites', JSON.stringify(favorites));
    
    document.getElementById('saveModal').classList.remove('show');
    loadFavorites();
    updateStatusMessage(`Route "${name}" saved successfully!`, 'success');
});

// ================================
// Initialization
// ================================

// Initialize map on page load
document.addEventListener('DOMContentLoaded', () => {
    initMap();
    
    // Load saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        setMode(savedTheme);
    } else {
        setMode('light');
    }
    
    // Load favorites
    loadFavorites();
});