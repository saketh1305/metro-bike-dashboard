// utils/routes.js
export const fetchRoutes = async (startCoords, endCoords) => {
    const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1Ijoic2FrZXRoMTMwNSIsImEiOiJjbTNvOGdmeGwwMHVvMmpwbTIwbDdtenN6In0.6wMiPlKmWL4oN3g86Ml60g';
  
    try {
      const url = `https://api.mapbox.com/directions/v5/mapbox/cycling/${startCoords.join(',')};${endCoords.join(',')}?alternatives=true&geometries=geojson&access_token=${MAPBOX_ACCESS_TOKEN}`;
      const response = await fetch(url);
      const data = await response.json();
  
      if (!data.routes || data.routes.length === 0) {
        throw new Error('No routes found.');
      }
  
      // Parse routes
      const routes = data.routes.map((route, index) => ({
        id: `route-${index}`,
        type: index === 0 ? 'recommended' : 'alternative',
        coordinates: route.geometry.coordinates,
        distance: route.distance,
        duration: route.duration,
      }));
  
      return routes;
    } catch (error) {
      console.error('Error fetching routes:', error);
      return [];
    }
  };
  