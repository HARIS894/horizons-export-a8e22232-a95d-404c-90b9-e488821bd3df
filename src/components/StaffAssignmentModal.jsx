import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserCheck, Star, MapPin, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getMatchingStaff } from '@/utils/staffMatchingService';
import { validateAssignment } from '@/utils/assignmentValidator';
import { useToast } from '@/components/ui/use-toast';

const StaffAssignmentModal = ({ isOpen, onClose, booking, onAssign }) => {
  const [matchingStaff, setMatchingStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && booking) {
      fetchMatches();
    }
  }, [isOpen, booking]);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const matches = await getMatchingStaff(booking.pincode, booking.serviceType, booking.shiftType);
      setMatchingStaff(matches);
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to load matching staff", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedStaff) return;

    // Validate double assignment prevention
    const validation = await validateAssignment(selectedStaff.staff_id, booking);
    if (!validation.isValid) {
      toast({ 
        title: "Assignment Failed", 
        description: validation.error, 
        variant: "destructive" 
      });
      return;
    }

    onAssign(selectedStaff);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-purple-50 to-white">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Assign Staff</h2>
            <p className="text-sm text-gray-500">
               Booking: {booking.serviceType} for {booking.patientName} ({booking.pincode})
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto">
           {loading ? (
             <div className="space-y-4">
               {[1,2,3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse"/>)}
             </div>
           ) : matchingStaff.length === 0 ? (
             <div className="text-center py-10">
               <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                 <UserCheck className="w-8 h-8 text-gray-400" />
               </div>
               <h3 className="text-lg font-medium text-gray-900">No matching staff found</h3>
               <p className="text-gray-500">Try expanding the search radius or changing criteria.</p>
             </div>
           ) : (
             <div className="space-y-4">
               <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Recommended Matches</h3>
               {matchingStaff.map((staff) => (
                 <div 
                   key={staff.staff_id}
                   onClick={() => setSelectedStaff(staff)}
                   className={`flex items-center p-4 rounded-xl border-2 transition-all cursor-pointer hover:shadow-md ${
                     selectedStaff?.staff_id === staff.staff_id 
                     ? 'border-[#6B46C1] bg-purple-50' 
                     : 'border-gray-100 hover:border-purple-200 bg-white'
                   }`}
                 >
                   <img src={staff.photo_url} alt={staff.name} className="w-12 h-12 rounded-full object-cover mr-4" />
                   
                   <div className="flex-1">
                     <div className="flex justify-between items-start">
                       <div>
                         <h4 className="font-bold text-gray-900">{staff.name}</h4>
                         <p className="text-xs text-gray-500">{staff.qualification} • {staff.experience_years} Years Exp</p>
                       </div>
                       <div className="flex items-center bg-yellow-100 px-2 py-0.5 rounded text-xs font-bold text-yellow-700">
                         <Star className="w-3 h-3 mr-1 fill-yellow-700" /> {staff.rating}
                       </div>
                     </div>
                     
                     <div className="flex gap-4 mt-2 text-sm text-gray-600">
                       <span className="flex items-center gap-1">
                         <MapPin className="w-3 h-3 text-[#06B6D4]" /> 
                         {staff.matchMetrics.distanceKm} km away
                       </span>
                       <span className="flex items-center gap-1">
                         <Clock className="w-3 h-3 text-green-600" /> 
                         Arrives in ~{staff.matchMetrics.arrivalMinutes} mins
                       </span>
                     </div>
                   </div>
                   
                   <div className="ml-4">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                         selectedStaff?.staff_id === staff.staff_id ? 'border-[#6B46C1]' : 'border-gray-300'
                      }`}>
                         {selectedStaff?.staff_id === staff.staff_id && <div className="w-2 h-2 rounded-full bg-[#6B46C1]" />}
                      </div>
                   </div>
                 </div>
               ))}
             </div>
           )}
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            className="bg-[#6B46C1] text-white hover:bg-[#55389e]" 
            disabled={!selectedStaff}
            onClick={handleAssign}
          >
            Assign Selected Staff
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default StaffAssignmentModal;