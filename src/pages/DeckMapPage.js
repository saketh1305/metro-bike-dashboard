import React, { useEffect, useState } from 'react';
import DeckGL from '@deck.gl/react';
import { Map } from 'react-map-gl';
import { IconLayer, PathLayer } from '@deck.gl/layers';
import { fetchBikeStations, fetchDailyUsage, fetchMonthlyUsage } from '../utils/dataReader';
import './mapPage.css';
import StationInfoPanel from './StationInfoPanel';
import RouteStatsTooltip from './RouteStatsTooltip';
import { HeatmapLayer } from '@deck.gl/aggregation-layers';
import ElevationChart from './ElevationChart';;


const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1Ijoic2FrZXRoMTMwNSIsImEiOiJjbTNvOGdmeGwwMHVvMmpwbTIwbDdtenN6In0.6wMiPlKmWL4oN3g86Ml60g';

const INITIAL_VIEW_STATE = {
  longitude: -118.2437,
  latitude: 34.0522,
  zoom: 12,
  pitch: 0,
  bearing: 0,
};

const DeckMapPage = () => {
  const [bikeStations, setBikeStations] = useState([]);
  const [startLocation, setStartLocation] = useState('');
  const [endLocation, setEndLocation] = useState('');
  const [mapView, setMapView] = useState(INITIAL_VIEW_STATE);
  const [filteredStations, setFilteredStations] = useState([]);
  const [selectedStart, setSelectedStart] = useState(null);
  const [selectedEnd, setSelectedEnd] = useState(null);
  const [showSelectionCard, setShowSelectionCard] = useState(false);
  const [highlightedLocations, setHighlightedLocations] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [usageData, setUsageData] = useState(null);
  const [hoveredRoute, setHoveredRoute] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [expandedRoute, setExpandedRoute] = useState(null);
  const [selectedOverlay, setSelectedOverlay] = useState(null); 
  const [showElevationChart, setShowElevationChart] = useState(false);
  const [elevationData, setElevationData] = useState([]);

  



  useEffect(() => {
    fetchBikeStations()
      .then((data) => {
        const parsedData = data.map((station) => ({
          ...station,
          latitude: parseFloat(station.latitude),
          longitude: parseFloat(station.longitude),
          bikes_available: parseInt(station.bikes_available, 10),
        }));
        setBikeStations(parsedData);
      })
      .catch((error) => console.error('Error loading bike station data:', error));
  }, []);

  const geocodeLocation = async (location) => {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(location)}.json?access_token=${MAPBOX_ACCESS_TOKEN}`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.features && data.features.length > 0) {
      return data.features[0].center; // Return [longitude, latitude]
    }
    return null;
  };

  const handleOverlaySelection = (overlayType) => {
    if (!expandedRoute) {
      alert('Please expand a route to apply overlays.');
      return;
    }
    setSelectedOverlay(overlayType); // Update overlay type (e.g., 'pollution', 'crime', 'elevation')
    if (overlayType === 'elevation') {
      handleElevationOverlay(expandedRoute); // Trigger elevation overlay for the expanded route
    } else {
      setShowElevationChart(false); // Hide elevation chart for other overlays
    }
  };
  

  const handleExpandRoute = (route) => {
    if (!route || !route.coordinates || route.coordinates.length === 0) return;
  
    // Calculate bounding box of the route
    const lats = route.coordinates.map(coord => coord[1]);
    const lngs = route.coordinates.map(coord => coord[0]);
  
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
  
    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;
  
    // Adjust zoom level to fit the bounding box
    const zoom = 14; // Adjust zoom for closer view
    setMapView({
      longitude: centerLng,
      latitude: centerLat,
      zoom: zoom,
      pitch: 45, // Optional: Add pitch for better perspective
      bearing: 0,
    });
  
    setExpandedRoute(route); // Save the route in state for expanded view options
    setSelectedOverlay(null); // Reset overlay selection when expanding a new route
  };
  
  

  const handleSearch = async () => {
    if (!startLocation || !endLocation) {
      alert('Please enter both starting and ending locations.');
      return;
    }

    try {
      const startCoords = await geocodeLocation(startLocation);
      const endCoords = await geocodeLocation(endLocation);

      if (!startCoords || !endCoords) {
        alert('Failed to find locations. Please check your input.');
        return;
      }

      const filterNearest = (coords) =>
        bikeStations
          .map((station) => ({
            ...station,
            distance: Math.sqrt(
              Math.pow(station.longitude - coords[0], 2) +
              Math.pow(station.latitude - coords[1], 2)
            ),
          }))
          .sort((a, b) => a.distance - b.distance)
          .slice(0, 5);

      const nearestToStart = filterNearest(startCoords);
      const nearestToEnd = filterNearest(endCoords);

      setFilteredStations([...nearestToStart, ...nearestToEnd]);

      setHighlightedLocations([
        { type: 'start', coords: startCoords },
        { type: 'end', coords: endCoords },
      ]);

      const center = [
        (startCoords[0] + endCoords[0]) / 2,
        (startCoords[1] + endCoords[1]) / 2,
      ];
      setMapView({ ...mapView, longitude: center[0], latitude: center[1], zoom: 13 });

      setSelectedStart(null);
      setSelectedEnd(null);
      setShowSelectionCard(false);
    } catch (error) {
      console.error('Error during search:', error);
    }
  };

  const handleStationClick = (station) => {
    setShowSelectionCard(true);
    if (!selectedStart) {
      setSelectedStart(station);
    } else if (!selectedEnd) {
      setSelectedEnd(station);
    }
    const stationId = station.id;
    const dailyUsage = fetchDailyUsage(stationId); // Replace with actual data fetch logic
    const monthlyUsage = fetchMonthlyUsage(stationId); // Replace with actual data fetch logic

    setUsageData({ daily: dailyUsage, monthly: monthlyUsage });
    setSelectedStation(station);
  };

  const handleClosePanel = () => {
    setSelectedStation(null);
    setUsageData(null);
  };

  const handleUndoSelection = (type) => {
    if (type === 'start') setSelectedStart(null);
    if (type === 'end') setSelectedEnd(null);
    if (!selectedStart && !selectedEnd) setShowSelectionCard(false);
  };

  const handleFetchRoutes = async () => {
    if (!selectedStart || !selectedEnd) {
      alert('Please select both a start and end station.');
      return;
    }
  
    const startCoords = [selectedStart.longitude, selectedStart.latitude];
    const endCoords = [selectedEnd.longitude, selectedEnd.latitude];
    const url = `https://api.mapbox.com/directions/v5/mapbox/cycling/${startCoords.join(',')};${endCoords.join(',')}?alternatives=true&geometries=geojson&overview=full&access_token=${MAPBOX_ACCESS_TOKEN}`;
  
    try {
      const response = await fetch(url);
      const data = await response.json();
  
      if (!data.routes || data.routes.length === 0) {
        alert('No routes found.');
        return;
      }
  
      // Average cycling speed (15 km/h) converted to m/s
      const averageSpeed = 15 * 1000 / 3600;
  
      // Parse routes and calculate ETA, distance, and dummy traffic levels
      const fetchedRoutes = data.routes.map((route, index) => {
        const distance = route.distance; // Distance in meters
        const eta = (distance / averageSpeed).toFixed(2); // ETA in seconds
  
        // Generate dummy traffic levels
        const trafficLevels = route.geometry.coordinates.map((_, idx) => {
          const traffic = idx % 3 === 0 ? 'High' : idx % 3 === 1 ? 'Moderate' : 'Low';
          return { index: idx, traffic };
        });
  
        return {
          id: `route-${index}`,
          type: index === 0 ? 'recommended' : 'alternative',
          coordinates: route.geometry.coordinates,
          distance: (distance / 1000).toFixed(2) + ' km', // Convert to km
          eta: (eta / 60).toFixed(2) + ' min', // Convert to minutes
          trafficLevels,
        };
      });
  
      // Assign route colors dynamically based on ETA
      const sortedRoutes = fetchedRoutes.sort(
        (a, b) => parseFloat(a.eta) - parseFloat(b.eta) // Sort by ETA
      );
      sortedRoutes[0].color = [0, 0, 255]; // Blue for fastest
      sortedRoutes[1].color = [0, 255, 0]; // Green for recommended
  
      setRoutes(sortedRoutes);
  
      setFilteredStations([]); // Focus on start and end stations only
    } catch (error) {
      console.error('Error fetching routes:', error);
    }
  };

  const getPollutionData = (route) => {
    if (!route || !route.coordinates) return [];
  
    // Generate pollution data for each coordinate in the route
    return route.coordinates.map((coord, index) => {
      let weight;
  
      // Assign pollution levels based on segment index (example logic)
      if (index % 3 === 0) {
        weight = 20; // Low pollution
      } else if (index % 3 === 1) {
        weight = 50; // Moderate pollution
      } else {
        weight = 80; // High pollution
      }
  
      return { coordinates: coord, weight };
    });
  };
  
  const getPollutionHeatmapLayer = () => {
    if (selectedOverlay !== 'pollution') return null;
  
    const pollutionData = expandedRoute ? getPollutionData(expandedRoute) : [];
  
    return new HeatmapLayer({
      id: `pollution-heatmap-${expandedRoute?.id}`, // Unique ID for each route's heatmap
      data: pollutionData,
      getPosition: (d) => d.coordinates,
      getWeight: (d) => d.weight,
      radiusPixels: 50,
      intensity: 1,
      threshold: 0.3,
      colorRange: [
        [0, 255, 0],   // Low Pollution - Green
        [255, 255, 0], // Medium Pollution - Yellow
        [255, 0, 0],   // High Pollution - Red
      ],
    });
  };
  

  const getCrimeData = (route) => {
    if (!route || !route.coordinates) return [];
    
    // Generate continuous crime severity values
    return route.coordinates
      .filter((_, index) => index % 20 === 0 | index %7 ==0) // Sparse points: every 20th coordinate
      .map((coord, index) => {
        const baseCrimeLevel = 20; // Minimum crime severity
        const crimeRange = 60; // Range of crime severity (20 to 80)
        
        // Use a smooth variation based on index
        const randomPercentage = baseCrimeLevel + 
          Math.floor(
            Math.abs(Math.sin(index / 5)) * crimeRange // Sine function for smooth variation
          );
        
        const crimeTypes = ['Theft', 'Vandalism', 'Assault', 'Burglary'];
        const randomCrimeType = crimeTypes[Math.floor(Math.random() * crimeTypes.length)];
  
        return {
          coordinates: coord,
          crimeType: randomCrimeType,
          crimePercentage: randomPercentage, // Continuous values
        };
      });
  };
  

  const getCrimeHeatmapLayer = () => {
    if (selectedOverlay !== 'crime') return null;
  
    const crimeData = expandedRoute ? getCrimeData(expandedRoute) : [];
  
    return new HeatmapLayer({
      id: `crime-heatmap-${expandedRoute?.id}`, // Unique ID for each route's heatmap
      data: crimeData,
      getPosition: (d) => d.coordinates,
      getWeight: (d) => d.crimePercentage, // Use crime percentage for intensity
      radiusPixels: 60,
      intensity: 1,
      threshold: 0.2,
      colorRange: [
        [0, 0, 255],   // Low crime - Blue
        [255, 165, 0], // Moderate crime - Orange
        [255, 0, 0],   // High crime - Red
      ],
    });
  };


  const handleElevationOverlay = (route) => {
    if (!route) return;
  
    // Static example data, you can generate route-specific elevation data if available
    const staticElevationData = route.coordinates.map((_, index) => ({
      distance: index, // Example distances
      elevation: 100 + Math.sin(index) * 20, // Example elevation pattern
    }));
  
    setElevationData(staticElevationData);
    setShowElevationChart(true);
  };

  const layers = [
    // Highlight start and end locations during filtering
    new IconLayer({
      id: 'highlight-layer',
      data: highlightedLocations,
      pickable: false,
      getPosition: (d) => d.coords,
      getIcon: (d) => ({
        url: d.type === 'start' ? '/icons/start-icon.png' : '/icons/end-icon.png',
        width: 128,
        height: 128,
        anchorY: 128,
      }),
      getSize: 60,
    }),
    // Stations
    new IconLayer({
      id: 'station-layer',
      data:
        routes.length > 0
          ? [selectedStart, selectedEnd].filter(Boolean)
          : filteredStations.length > 0
          ? filteredStations
          : bikeStations,
      pickable: true,
      getPosition: (d) => [d.longitude, d.latitude],
      getIcon: () => ({
        url: '/icons/bike-icon.png',
        width: 128,
        height: 128,
        anchorY: 128,
      }),
      getSize: (d) =>
        d.bikes_available ? Math.min(d.bikes_available * 5, 100) : 40, // Size based on bikes available
      onClick: (info) => handleStationClick(info.object),
    }),
    // Routes
    new PathLayer({
      id: 'route-layer',
      data: routes,
      getPath: (d) => d.coordinates,
      getColor: (d) => (d.type === 'recommended' ? [0, 0, 255] : [0, 255, 0]),
      getWidth: 30,
      pickable: true,
      onHover: (info) => {
        if (info.object) {
          setHoveredRoute(info.object);
          setTooltipPosition({ x: info.x, y: info.y });
        } else {
          setHoveredRoute(null);
        }
      },
    }),

    selectedOverlay === 'pollution' && getPollutionHeatmapLayer(),
    selectedOverlay === 'crime' && getCrimeHeatmapLayer(),

  ].filter(Boolean);

  return (
    <div className="deck-map-page">
      <div className="search-panel">
        <label className="search-label">Start Location:</label>
        <input
          type="text"
          placeholder="Enter starting location"
          value={startLocation}
          onChange={(e) => setStartLocation(e.target.value)}
          className="search-input"
        />
        <label className="search-label">End Location:</label>
        <input
          type="text"
          placeholder="Enter destination"
          value={endLocation}
          onChange={(e) => setEndLocation(e.target.value)}
          className="search-input"
        />
        <button onClick={handleSearch} className="search-button">
          Search
        </button>
      </div>

      {showSelectionCard && (
        <div className="selection-card">
          <h4 className="selection-title">Selected Stations</h4>
          <p className="selection-item">
            Start Station: {selectedStart ? selectedStart.name : 'Not Selected'}
            {selectedStart && (
              <button
                className="undo-button"
                onClick={() => handleUndoSelection('start')}
              >
                Undo
              </button>
            )}
          </p>
          <p className="selection-item">
            End Station: {selectedEnd ? selectedEnd.name : 'Not Selected'}
            {selectedEnd && (
              <button
                className="undo-button"
                onClick={() => handleUndoSelection('end')}
              >
                Undo
              </button>
            )}
          </p>
          {selectedStart && selectedEnd && (
            <button onClick={handleFetchRoutes} className="fetch-routes-button">
              Show Routes
            </button>
          )}
        </div>
      )}

      <StationInfoPanel
        station={selectedStation}
        usageData={usageData}
        onClose={handleClosePanel}
      />
      <RouteStatsTooltip
        route={hoveredRoute}
        x={tooltipPosition.x}
        y={tooltipPosition.y}
        onExpand={handleExpandRoute}
        onOverlaySelect={handleOverlaySelection} // Pass overlay selection handler
      />

      {showElevationChart && (
        <ElevationChart
          data={elevationData} // Pass the elevationData state
          onClose={() => setShowElevationChart(false)} // Handle close action
        />
      )}


      
      <DeckGL
        initialViewState={mapView}
        controller={true}
        layers={layers}
        className="deckgl-container"
      >
        <Map
          mapStyle="mapbox://styles/mapbox/streets-v11"
          mapboxAccessToken={MAPBOX_ACCESS_TOKEN}
        />
      </DeckGL>
    </div>
  );
};

export default DeckMapPage;






