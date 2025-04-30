import React from 'react';
import { MapContainer, TileLayer, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import CommunityBoundaries from "./CommunityBoundaries";
import LocationButton from "./LocationButton";
import '../styles/CrimeMap.css';

export default function CrimeMap() {
  return (
    <MapContainer
      center={[51.0447, -114.0719]} // Calgary center
      zoom={12}
      className="leaflet-container"
      zoomControl={false} // Disable default zoom control
    >
      <ZoomControl position="bottomright" />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Add the community boundaries */}
      <CommunityBoundaries />
      
      {/* Add location button */}
      <LocationButton />
    </MapContainer>
  );
}
