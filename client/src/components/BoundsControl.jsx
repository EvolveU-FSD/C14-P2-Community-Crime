import { useRef } from "react";
import { FeatureGroup } from "react-leaflet";
import BoundsUpdater from "./BoundsUpdater";

export default function BoundsControl({ isLoading, hasBoundaries, children }) {
  const featureGroupRef = useRef(null);

  return (
    <FeatureGroup ref={featureGroupRef}>
      {children}
      <BoundsUpdater
        group={featureGroupRef}
        isLoading={isLoading} 
        hasBoundaries={hasBoundaries}
      />
    </FeatureGroup>
  );
}