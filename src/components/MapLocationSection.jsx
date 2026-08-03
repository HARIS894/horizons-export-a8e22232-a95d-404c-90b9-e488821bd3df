import React, { useState } from 'react';
import { MapPin, Navigation, Clock, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

const offices = [
  { id: 1, name: "Headquarters (Bangalore)", lat: 12.9716, lng: 77.5946, address: "123 Healthcare Ave, Tech Park, Bangalore, KA 560001", phone: "080-1234-5678" },
  { id: 2, name: "Regional Office (Delhi)", lat: 28.6139, lng: 77.2090, address: "45 Medical Plaza, Connaught Place, New Delhi, DL 110001", phone: "011-9876-5432" },
  { id: 3, name: "Branch Office (Mumbai)", lat: 19.0760, lng: 72.8777, address: "789 Wellness Tower, Bandra West, Mumbai, MH 400050", phone: "022-4567-8901" }
];

const containerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '0.75rem'
};

const MapLocationSection = () => {
  const [activeOffice, setActiveOffice] = useState(offices[0]);
  
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
  });

  const [map, setMap] = React.useState(null);

  const onLoad = React.useCallback(function callback(map) {
    setMap(map);
  }, []);

  const onUnmount = React.useCallback(function callback(map) {
    setMap(null);
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-3">
        {/* Info Panel */}
        <div className="p-8 lg:border-r border-gray-100 bg-gray-50 flex flex-col h-[500px]">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#6B46C1]" /> Our Locations
          </h3>
          
          <div className="space-y-2 mb-6 flex-1 overflow-y-auto pr-2">
            {offices.map((office) => (
              <div 
                key={office.id}
                onClick={() => setActiveOffice(office)}
                className={`p-4 rounded-xl cursor-pointer transition-all ${
                  activeOffice.id === office.id 
                    ? 'bg-white shadow-md border-l-4 border-[#6B46C1]' 
                    : 'hover:bg-gray-100 border-l-4 border-transparent'
                }`}
              >
                <h4 className={`font-semibold ${activeOffice.id === office.id ? 'text-[#6B46C1]' : 'text-gray-900'}`}>
                  {office.name}
                </h4>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{office.address}</p>
              </div>
            ))}
          </div>

          <div className="mt-auto border-t border-gray-200 pt-6 space-y-4">
             <div className="flex gap-3 text-sm text-gray-600">
                <MapPin className="w-4 h-4 text-[#06B6D4] shrink-0" />
                <p>{activeOffice.address}</p>
             </div>
             <div className="flex gap-3 text-sm text-gray-600">
                <Clock className="w-4 h-4 text-[#06B6D4] shrink-0" />
                <p>Mon-Sat: 9:00 AM - 8:00 PM<br/>Sun: Emergency Only</p>
             </div>
             <div className="flex gap-3 text-sm text-gray-600">
                <Phone className="w-4 h-4 text-[#06B6D4] shrink-0" />
                <p>{activeOffice.phone}</p>
             </div>

             <a 
               href={`https://www.google.com/maps/dir/?api=1&destination=${activeOffice.lat},${activeOffice.lng}`} 
               target="_blank" 
               rel="noreferrer"
               className="block mt-4"
             >
               <Button className="w-full bg-[#6B46C1] hover:bg-[#5a3da4] text-white">
                 <Navigation className="w-4 h-4 mr-2" /> Get Directions
               </Button>
             </a>
          </div>
        </div>

        {/* Map Panel */}
        <div className="lg:col-span-2 h-[500px] relative bg-gray-200">
          {isLoaded ? (
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={{ lat: activeOffice.lat, lng: activeOffice.lng }}
              zoom={14}
              onLoad={onLoad}
              onUnmount={onUnmount}
              options={{
                 streetViewControl: true,
                 mapTypeControl: false,
                 fullscreenControl: true,
                 zoomControl: true,
              }}
            >
              {offices.map(office => (
                 <Marker 
                    key={office.id}
                    position={{ lat: office.lat, lng: office.lng }}
                    animation={activeOffice.id === office.id ? window.google.maps.Animation.BOUNCE : null}
                    icon={activeOffice.id === office.id ? null : {
                       path: window.google.maps.SymbolPath.CIRCLE,
                       scale: 7,
                       fillColor: "#9CA3AF",
                       fillOpacity: 1,
                       strokeWeight: 1,
                       strokeColor: "white",
                    }}
                 />
              ))}
            </GoogleMap>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-500">
              <div className="text-center">
                 <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
                 <p>Loading Maps...</p>
                 <p className="text-xs mt-2">API Key Required</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapLocationSection;