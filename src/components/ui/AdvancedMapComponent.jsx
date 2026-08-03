// Task 2: AdvancedMapComponent
import React, { useState, useEffect, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Circle, InfoWindow } from '@react-google-maps/api';
import { MapPin, Navigation, Layers, Maximize } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SERVICE_RADIUS_KM } from '@/config/pincodeConfig';
import { reverseGeocode } from '@/utils/locationUtils';

const containerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '0.75rem'
};

const defaultCenter = {
  lat: 28.6139, // Delhi
  lng: 77.2090
};

const mapOptions = {
  streetViewControl: true,
  mapTypeControl: true,
  fullscreenControl: true,
  zoomControl: true,
  styles: [
    {
      featureType: "poi.medical",
      stylers: [{ visibility: "on" }, { color: "#ffbdce" }]
    }
  ]
};

const AdvancedMapComponent = ({ 
  userLocation, 
  staffLocations = [], 
  onLocationSelect, 
  apiKey,
  serviceRadius = SERVICE_RADIUS_KM 
}) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey || ''
  });

  const [map, setMap] = useState(null);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [currentPosition, setCurrentPosition] = useState(defaultCenter);

  useEffect(() => {
    if (userLocation?.lat && userLocation?.lng) {
      setCurrentPosition({ lat: userLocation.lat, lng: userLocation.lng });
    }
  }, [userLocation]);

  const onLoad = useCallback(function callback(map) {
    setMap(map);
  }, []);

  const onUnmount = useCallback(function callback(map) {
    setMap(null);
  }, []);

  const handleMapClick = async (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    
    // Reverse geocode explicitly on pin drop
    if (onLocationSelect) {
      const result = await reverseGeocode(lat, lng, apiKey);
      onLocationSelect({ 
        lat, 
        lng, 
        address: result?.address || '', 
        pincode: result?.pincode || '' 
      });
    }
  };

  if (!apiKey) {
    return (
      <div className="w-full h-[400px] bg-gray-100 rounded-xl flex items-center justify-center border border-gray-300">
        <div className="text-center p-6">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500 font-medium">Map Unavailable</p>
          <p className="text-sm text-gray-400">Please add API Key to .env</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return <div className="w-full h-[400px] bg-gray-100 rounded-xl animate-pulse flex items-center justify-center text-gray-400">Loading Maps...</div>;
  }

  return (
    <div className="relative rounded-xl overflow-hidden shadow-md border border-gray-200">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={currentPosition}
        zoom={12}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onClick={handleMapClick}
        options={mapOptions}
      >
        {/* User Location Marker (Blue) */}
        {userLocation?.lat && (
          <>
            <Marker 
              position={{ lat: userLocation.lat, lng: userLocation.lng }}
              icon={{
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 10,
                fillColor: "#4285F4",
                fillOpacity: 1,
                strokeColor: "white",
                strokeWeight: 2,
              }}
              title="Your Location"
            />
            {/* Service Radius Circle */}
            <Circle
              center={{ lat: userLocation.lat, lng: userLocation.lng }}
              radius={serviceRadius * 1000}
              options={{
                strokeColor: '#06B6D4',
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: '#06B6D4',
                fillOpacity: 0.1,
              }}
            />
          </>
        )}

        {/* Staff Markers (Green) */}
        {staffLocations.map((staff, idx) => (
          <Marker
            key={idx}
            position={{ lat: staff.lat, lng: staff.lng }}
            icon={{
              path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
              scale: 6,
              fillColor: "#10B981", // Green
              fillOpacity: 1,
              strokeColor: "white",
              strokeWeight: 1,
            }}
            onClick={() => setSelectedMarker(staff)}
          />
        ))}

        {/* Info Window for Selected Staff */}
        {selectedMarker && (
          <InfoWindow
            position={{ lat: selectedMarker.lat, lng: selectedMarker.lng }}
            onCloseClick={() => setSelectedMarker(null)}
          >
            <div className="p-2 min-w-[150px]">
              <h4 className="font-bold text-gray-900">{selectedMarker.name}</h4>
              <p className="text-xs text-gray-600">{selectedMarker.role}</p>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-yellow-500">★</span>
                <span className="text-xs font-medium">{selectedMarker.rating}</span>
              </div>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
      
      <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-md shadow-sm text-xs font-medium text-gray-600">
        Click on map to adjust location
      </div>
    </div>
  );
};

export default AdvancedMapComponent;