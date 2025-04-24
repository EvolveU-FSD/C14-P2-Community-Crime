import { useMap } from "react-leaflet";
import { useFilters } from "../context/FilterContext";
import { useEffect } from "react";

// Create a new component to handle bounds updates
export default function BoundsUpdater({ group }) {
  const map = useMap();
  const { filters } = useFilters();

  useEffect(() => {
    if (group.current) {
      const bounds = group.current.getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [map, group, filters]);

  return null;
}