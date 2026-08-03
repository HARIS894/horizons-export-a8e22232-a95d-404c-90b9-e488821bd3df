import React from 'react';
import { UserCheck, Clock, Award } from 'lucide-react';
import { motion } from 'framer-motion';

const StaffAvailabilityCard = ({ availability }) => {
  if (!availability) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-purple-50 to-cyan-50 border border-purple-100 rounded-xl p-4 mt-4"
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="bg-green-100 p-1.5 rounded-full">
          <UserCheck className="w-4 h-4 text-green-600" />
        </div>
        <h4 className="font-semibold text-gray-900">Staff Available in Your Area</h4>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-gray-500 mb-1">Available Staff</p>
          <p className="font-bold text-[#6B46C1] text-lg">{availability.count} Professionals</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Est. Arrival</p>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4 text-orange-500" />
            <span className="font-bold text-gray-900">{availability.arrivalMinutes} mins</span>
          </div>
        </div>
      </div>
      
      <div className="mt-3 pt-3 border-t border-purple-100">
        <p className="text-xs text-gray-500 mb-2">Qualifications</p>
        <div className="flex flex-wrap gap-2">
          {availability.qualifications.map((qual, index) => (
            <span key={index} className="px-2 py-1 bg-white rounded-md text-xs font-medium text-gray-600 shadow-sm border border-gray-100 flex items-center">
              <Award className="w-3 h-3 mr-1 text-[#06B6D4]" />
              {qual}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default StaffAvailabilityCard;