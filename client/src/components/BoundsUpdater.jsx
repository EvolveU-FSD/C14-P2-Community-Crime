import { useMap } from "react-leaflet";
import { useFilters } from "../context/FilterContext";
import { useEffect, useState } from "react";

// Create a new component to handle bounds updates
export default function BoundsUpdater({ group, isLoading, hasBoundaries }) {
  const map = useMap();
  const { filters } = useFilters();
  const [debounceTimer, setDebounceTimer] = useState(null);

  useEffect(() => {
    // Clear previous timer if one exists.
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    // // Only proceed if: Loading is complete, there are boundaries to show, FeatureGroup exists.
    if (!isLoading && hasBoundaries && group?.current) {
      const timer = setTimeout(() => {
        try {
          // Get the bounds from the featuregroup.
          const bounds = group.current.getBounds();

          // Only update if the bounds are valid.
          if (bounds.isValid()) {
            console.log("Updating with valid bounds.");
            map.fitBounds(bounds, {
              padding: [5, 5],
              animate: true,
              duration: 0.5
            });
          } else {
            console.log("Invalid bounds. No update.");
          }
        } catch (error) {
          console.error(`Error updating bounds: ${error}`);
        }
      }, 50); // 50ms delay to check updates are complete.

      // Store the timer reference.
      setDebounceTimer(timer);
    }

    // Clean everything up.
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
    
    // if (group.current) {
    //   const bounds = group.current.getBounds();
    //   if (bounds.isValid()) {
    //     map.fitBounds(bounds, { padding: [50, 50] });
    //   }
    // }
  }, [map, group, filters, isLoading, hasBoundaries]);

  return null;
}