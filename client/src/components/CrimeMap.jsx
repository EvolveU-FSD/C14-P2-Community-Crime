import React from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import CommunityBoundaries from "./CommunityBoundaries";

const CrimeMap = () => {
  return (
    <MapContainer
        center={[51.0447, -114.0719]} // Calgary center
        zoom={12}
        className="leaflet-container"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Add the community boundaries drawing. */}
        <CommunityBoundaries />
      </MapContainer>
  );
};

export default CrimeMap;