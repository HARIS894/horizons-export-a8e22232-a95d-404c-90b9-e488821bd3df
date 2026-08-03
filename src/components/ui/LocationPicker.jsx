import React, { useState, useEffect, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Circle } from '@react-google-maps/api';
import { MapPin, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SERVICE_RADIUS_KM } from '@/config/pincodeConfig';

const containerStyle = {
  width: '100%',
  height: '300px',
  borderRadius: '0.75rem'
};

const defaultCenter = {
  lat: 28.6139, // Delhi
  lng: 77.2090
};

const LocationPicker = ({ selectedLocation, onLocationSelect, apiKey }) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey || '' // Handle missing key gracefully
  });

  const [map, setMap] = useState(null);
  const [currentPosition, setCurrentPosition] = useState(defaultCenter);

  useEffect(() => {
    if (selectedLocation?.lat && selectedLocation?.lng) {
      setCurrentPosition({ lat: selectedLocation.lat, lng: selectedLocation.lng });
    }
  }, [selectedLocation]);

  const onLoad = useCallback(function callback(map) {
    setMap(map);
  }, []);

  const onUnmount = useCallback(function callback(map) {
    setMap(null);
  }, []);

  const handleMapClick = (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    onLocationSelect({ lat, lng });
  };

  const handleUseMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCurrentPosition(pos);
          onLocationSelect(pos);
          if (map) map.panTo(pos);
        },
        (error) => {
          console.error("Error getting location: ", error);
          alert("Could not access location. Please enable location services.");
        }
      );
    }
  };

  if (!apiKey) {
    return (
      <div className="w-full h-[300px] bg-gray-100 rounded-xl flex items-center justify-center border border-gray-300">
        <div className="text-center p-6">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500 font-medium">Map Unavailable</p>
          <p className="text-sm text-gray-400">Please enter address manually or add API key.</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return <div className="w-full h-[300px] bg-gray-100 rounded-xl animate-pulse"></div>;
  }

  return (
    <div className="relative">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={currentPosition}
        zoom={12}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onClick={handleMapClick}
        options={{
          streetViewControl: true,
          mapTypeControl: false,
          fullscreenControl: true,
        }}
      >
        {selectedLocation?.lat && (
          <>
            <Marker position={{ lat: selectedLocation.lat, lng: selectedLocation.lng }} />
            <Circle
              center={{ lat: selectedLocation.lat, lng: selectedLocation.lng }}
              radius={SERVICE_RADIUS_KM * 1000}
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
      </GoogleMap>
      
      <Button
        type="button"
        size="sm"
        onClick={handleUseMyLocation}
        className="absolute top-2 right-2 bg-white text-gray-700 hover:bg-gray-50 shadow-md z-10"
      >
        <Navigation className="w-4 h-4 mr-2 text-[#6B46C1]" />
        Use My Location
      </Button>
    </div>
  );
};

export default LocationPicker;