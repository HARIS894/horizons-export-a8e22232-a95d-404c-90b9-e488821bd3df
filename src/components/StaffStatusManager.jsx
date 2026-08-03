import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Circle, ChevronDown, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { updateStaffStatus } from '@/utils/staffUtils';
import { useToast } from '@/components/ui/use-toast';

const STATUS_OPTIONS = [
  { value: 'Available', color: 'text-green-500', bg: 'bg-green-100' },
  { value: 'Assigned', color: 'text-blue-500', bg: 'bg-blue-100' },
  { value: 'On Break', color: 'text-yellow-500', bg: 'bg-yellow-100' },
  { value: 'On Leave', color: 'text-orange-500', bg: 'bg-orange-100' },
  { value: 'Offline', color: 'text-gray-500', bg: 'bg-gray-100' }
];

const StaffStatusManager = ({ staffId, currentStatus, onStatusChange, isReadOnly = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const activeOption = STATUS_OPTIONS.find(o => o.value === currentStatus) || STATUS_OPTIONS[4];

  const handleStatusChange = async (newStatus) => {
    if (newStatus === currentStatus) {
      setIsOpen(false);
      return;
    }

    // Prevention logic: Cannot manually set to "Available" if currently "Assigned" without completing job
    if (currentStatus === 'Assigned' && newStatus === 'Available') {
      toast({
        title: "Action Restricted",
        description: "Cannot switch to Available while Assigned. Please complete the booking first.",
        variant: "destructive"
      });
      setIsOpen(false);
      return;
    }

    setLoading(true);
    try {
      await updateStaffStatus(staffId, newStatus);
      if (onStatusChange) onStatusChange(newStatus);
      toast({
        title: "Status Updated",
        description: `Status changed to ${newStatus}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative inline-block text-left">
      <Button
        variant="ghost"
        disabled={isReadOnly || loading}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${activeOption.bg} border-transparent hover:border-gray-300 transition-all`}
      >
        <Circle className={`w-3 h-3 fill-current ${activeOption.color}`} />
        <span className={`font-medium ${activeOption.color}`}>
          {loading ? 'Updating...' : currentStatus}
        </span>
        {!isReadOnly && <ChevronDown className={`w-4 h-4 ${activeOption.color}`} />}
      </Button>

      {isOpen && !isReadOnly && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 border border-gray-100 py-1 origin-top-right animate-in fade-in zoom-in duration-200">
          {STATUS_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => handleStatusChange(option.value)}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors gap-2"
            >
              <Circle className={`w-2 h-2 fill-current ${option.color}`} />
              <span className="flex-1 text-left">{option.value}</span>
              {currentStatus === option.value && <Check className="w-4 h-4 text-[#6B46C1]" />}
            </button>
          ))}
          <div className="border-t border-gray-100 mt-1 pt-1 px-2 pb-1">
             <p className="text-[10px] text-gray-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Auto-locks when Assigned
             </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffStatusManager;