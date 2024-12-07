import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './mapPage.css';

// Required to fix default icon issues with Leaflet
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

L.Marker.prototype.options.icon = DefaultIcon;

const MapPage = () => {
  return (
    <div className="map-page">
      <h1>Bike Sharing Map</h1>
      <MapContainer center={[34.0522, -118.2437]} zoom={13} className="map-container">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={[34.0522, -118.2437]}>
          <Popup>
            Welcome to Los Angeles! <br /> Explore bike-sharing stations here.
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default MapPage;
