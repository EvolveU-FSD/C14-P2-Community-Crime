import { useRef } from "react";
import { FeatureGroup } from "react-leaflet";
import BoundsUpdater from "./BoundsUpdater";

export default function BoundsControl({ isLoading }) {
  const featureGroupRef = useRef(null);

  return (
    <FeatureGroup ref={featureGroupRef}>
      <BoundsUpdater group={featureGroupRef} isLoading={isLoading} />
    </FeatureGroup>
  );
}