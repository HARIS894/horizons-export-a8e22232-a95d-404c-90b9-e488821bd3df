// Task 5: NearMeServicesSection
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, ArrowRight, Star, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { detectUserLocation } from '@/utils/locationDetectionService';
import { getStaffList } from '@/utils/staffUtils';
import { calculateDistance } from '@/utils/distanceUtils';
import { useNavigate } from 'react-router-dom';

const NearMeServicesSection = () => {
  const [location, setLocation] = useState(null);
  const [nearbyStaff, setNearbyStaff] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Attempt auto-detection if previously allowed
    const privacy = JSON.parse(localStorage.getItem('privacySettings') || '{}');
    if (privacy.shareLocation) {
       handleDetectLocation();
    }
  }, []);

  const handleDetectLocation = async () => {
    setLoading(true);
    try {
      const loc = await detectUserLocation();
      setLocation(loc);
      
      // Fetch and sort staff
      const allStaff = await getStaffList();
      // Add fake coords for demo
      const staffWithDist = allStaff.map(s => ({
         ...s,
         lat: loc.latitude + (Math.random() - 0.5) * 0.1,
         lng: loc.longitude + (Math.random() - 0.5) * 0.1
      })).map(s => ({
         ...s,
         distance: calculateDistance(loc.latitude, loc.longitude, s.lat, s.lng)
      })).sort((a,b) => a.distance - b.distance).slice(0, 4);
      
      setNearbyStaff(staffWithDist);
    } catch (e) {
      console.log('Location detection skipped or failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-10">
           <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Find Care Near You</h2>
              <p className="text-gray-600 max-w-xl">
                 Locate professional healthcare staff available in your immediate vicinity for quick response times.
              </p>
           </div>
           
           {!location ? (
              <Button 
                onClick={handleDetectLocation} 
                disabled={loading}
                className="bg-[#6B46C1] text-white hover:bg-[#5839a3]"
              >
                 {loading ? 'Locating...' : 'Use My Location'} <MapPin className="w-4 h-4 ml-2" />
              </Button>
           ) : (
              <div className="text-right">
                 <p className="text-sm text-gray-500">Near</p>
                 <p className="font-semibold text-[#6B46C1] flex items-center gap-1">
                    <MapPin className="w-4 h-4" /> {location.pincode || 'Current Location'}
                 </p>
              </div>
           )}
        </div>

        {location && (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {nearbyStaff.map((staff, idx) => (
                 <motion.div
                    key={staff.staff_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white rounded-xl shadow-md border border-gray-100 p-5 hover:shadow-lg transition-shadow"
                 >
                    <div className="flex justify-between items-start mb-4">
                       <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                          <img src={staff.photo_url} alt={staff.name} className="w-full h-full object-cover"/>
                       </div>
                       <div className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">
                          {staff.distance} km
                       </div>
                    </div>
                    
                    <h3 className="font-bold text-gray-900">{staff.name}</h3>
                    <p className="text-sm text-gray-500 mb-3">{staff.qualification}</p>
                    
                    <div className="flex items-center gap-3 text-sm text-gray-600 mb-4">
                       <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-400 fill-current"/> {staff.rating}</span>
                       <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> {Math.round(staff.distance * 2 + 15)}m</span>
                    </div>
                    
                    <Button 
                       variant="outline" 
                       className="w-full border-[#6B46C1] text-[#6B46C1] hover:bg-purple-50"
                       onClick={() => navigate('/smart-booking')}
                    >
                       Book Now
                    </Button>
                 </motion.div>
              ))}
           </div>
        )}
        
        {!location && !loading && (
           <div className="bg-gray-50 rounded-xl p-10 text-center border border-dashed border-gray-300">
              <MapPin className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Enable location to see available staff in your area</p>
           </div>
        )}
      </div>
    </section>
  );
};

export default NearMeServicesSection;