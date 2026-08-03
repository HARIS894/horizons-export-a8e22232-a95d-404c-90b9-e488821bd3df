// Task 6: StaffAvailabilityDisplay
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { User, Clock, MapPin, Star } from 'lucide-react';
import { calculateDistance, estimateArrivalTime, getDistanceColor } from '@/utils/distanceUtils';
import { getStaffList } from '@/utils/staffUtils';

const StaffAvailabilityDisplay = ({ userLocation, serviceType }) => {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userLocation?.lat && serviceType) {
      loadNearbyStaff();
    }
  }, [userLocation, serviceType]);

  const loadNearbyStaff = async () => {
    setLoading(true);
    // Mock logic to fetch staff and calculate distances
    const allStaff = await getStaffList();
    // Simulate coordinates for mock staff relative to user
    const staffWithLoc = allStaff.map((staff, i) => {
      // Random offset for demo
      const latOffset = (Math.random() - 0.5) * 0.1;
      const lngOffset = (Math.random() - 0.5) * 0.1;
      return {
        ...staff,
        lat: userLocation.lat + latOffset,
        lng: userLocation.lng + lngOffset
      };
    });

    const processed = staffWithLoc.map(staff => {
      const dist = calculateDistance(userLocation.lat, userLocation.lng, staff.lat, staff.lng);
      return {
        ...staff,
        distance: dist,
        arrivalTime: estimateArrivalTime(dist)
      };
    }).filter(s => s.distance < 20) // Only within 20km
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 3); // Top 3

    setStaffList(processed);
    setLoading(false);
  };

  if (!userLocation?.lat) return null;

  return (
    <div className="mt-4 space-y-3">
      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
        <User className="w-4 h-4 text-[#6B46C1]" /> Nearby Professionals
      </h3>
      
      {loading ? (
        <div className="space-y-2">
          {[1,2].map(i => <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />)}
        </div>
      ) : staffList.length > 0 ? (
        <div className="grid gap-3">
          {staffList.map((staff) => (
            <motion.div 
              key={staff.staff_id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm flex justify-between items-center"
            >
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold">
                    {staff.name[0]}
                 </div>
                 <div>
                    <p className="font-medium text-sm text-gray-900">{staff.name}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                       <span className="flex items-center gap-0.5"><Star className="w-3 h-3 text-yellow-400 fill-current"/> {staff.rating}</span>
                       <span>• {staff.qualification}</span>
                    </div>
                 </div>
              </div>
              <div className="text-right">
                 <div className={`text-xs px-2 py-0.5 rounded-full inline-block font-medium mb-1 ${getDistanceColor(staff.distance)}`}>
                    {staff.distance} km
                 </div>
                 <p className="text-xs text-gray-500 flex items-center justify-end gap-1">
                    <Clock className="w-3 h-3" /> ~{staff.arrivalTime} min
                 </p>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center p-4 bg-gray-50 rounded-lg text-gray-500 text-sm">
          No staff currently available in immediate vicinity. We can still arrange service from our central hub (approx 60 mins).
        </div>
      )}
    </div>
  );
};

export default StaffAvailabilityDisplay;