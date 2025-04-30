import { useState, useRef, useEffect } from 'react';
import { useMap, Marker } from 'react-leaflet';
import { useFilters } from '../context/FilterContext';
import L from 'leaflet';
import '../styles/LocationButton.css';

export default function LocationButton() {
  // State declarations
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showError, setShowError] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [showMarker, setShowMarker] = useState(false);
  
  // References
  const markerTimeoutRef = useRef(null);
  
  // Hooks
  const map = useMap();
  const { setFilters } = useFilters();

  // Create a custom div icon for the user location marker
  const pulseIcon = L.divIcon({
    className: 'user-location-marker',
    html: '<div class="pulse"></div>',
    iconSize: [20, 20]
  });

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (markerTimeoutRef.current) {
        clearTimeout(markerTimeoutRef.current);
      }
    };
  }, []);

  // Handle the error message timer
  useEffect(() => {
    let errorTimer;
    if (showError) {
      errorTimer = setTimeout(() => setShowError(false), 5000);
    }
    return () => clearTimeout(errorTimer);
  }, [showError]);

  // Handle marker display timer
  useEffect(() => {
    if (showMarker && userLocation) {
      // Remove the marker after 5 seconds
      markerTimeoutRef.current = setTimeout(() => {
        setShowMarker(false);
      }, 5000);
    }
    return () => {
      if (markerTimeoutRef.current) {
        clearTimeout(markerTimeoutRef.current);
      }
    };
  }, [showMarker, userLocation]);

  const handleFindMyLocation = () => {
    setIsLoading(true);
    setError(null);
    setShowError(false);
    setShowMarker(false);
    
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setShowError(true);
      setIsLoading(false);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // First, check which community contains this location
          const response = await fetch('/api/getCommunityByLocation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ latitude, longitude })
          });
          
          if (!response.ok) {
            throw new Error('Failed to determine your community');
          }
          
          const data = await response.json();
          console.log('API response:', data);
          
          if (data.success && data.community) {
            console.log('Found community:', data.community);
            
            // Set user location to show marker
            setUserLocation([latitude, longitude]);
            setShowMarker(true);
            
            // Fly to the location
            map.flyTo([latitude, longitude], 15, {
              animate: true,
              duration: 1
            });
            
            // Found the community - set it in filters
            setFilters(prev => ({
              ...prev,
              communitiesListFilter: [{
                value: data.community.commCode,
                label: data.community.name
              }]
            }));
          } else {
            setError('Your location is not within any Calgary community boundary');
            setShowError(true);
            
            // Still show the location even if not in a community
            setUserLocation([latitude, longitude]);
            setShowMarker(true);
            
            // Fly to the location anyway
            map.flyTo([latitude, longitude], 15, {
              animate: true, 
              duration: 1
            });
          }
        } catch (err) {
          console.error('Error finding community:', err);
          setError(err.message || 'Failed to find your community');
          setShowError(true);
        } finally {
          setIsLoading(false);
        }
      },
      (err) => {
        console.error('Geolocation error:', err);
        let errorMessage = 'Unable to determine your location';
        
        switch(err.code) {
          case 1: // PERMISSION_DENIED
            errorMessage = 'Location access denied. Please enable location services.';
            break;
          case 2: // POSITION_UNAVAILABLE
            errorMessage = 'Your location is currently unavailable.';
            break;
          case 3: // TIMEOUT
            errorMessage = 'Location request timed out.';
            break;
          default:
            errorMessage = `Geolocation error: ${err.message}`;
        }
        
        setError(errorMessage);
        setShowError(true);
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  return (
    <>
      <div className="location-button-container">
        <button 
          className={`location-button ${isLoading ? 'loading' : ''}`}
          onClick={handleFindMyLocation}
          disabled={isLoading}
          title="Find my location"
          aria-label="Find my location"
        >
          {isLoading ? (
            <div className="spinner"></div>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
              <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0 0 13 3.06V1h-2v2.06A8.994 8.994 0 0 0 3.06 11H1v2h2.06A8.994 8.994 0 0 0 11 20.94V23h2v-2.06A8.994 8.994 0 0 0 20.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>
            </svg>
          )}
        </button>
        {showError && error && (
          <div className="location-error">{error}</div>
        )}
      </div>

      {/* User location marker using React-Leaflet */}
      {showMarker && userLocation && (
        <Marker 
          position={userLocation}
          icon={pulseIcon}
        />
      )}
    </>
  );
}