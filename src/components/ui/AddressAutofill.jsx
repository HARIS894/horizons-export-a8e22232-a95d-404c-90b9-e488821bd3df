// Task 7: AddressAutofillComponent
import React from 'react';
import { MapPin } from 'lucide-react';

const AddressAutofill = ({ value, onChange, placeholder, error, loading }) => {
  return (
    <div className="relative">
      <textarea 
         name="fullAddress"
         value={value}
         onChange={onChange}
         className={`w-full p-3 pl-10 border rounded-lg focus:ring-2 focus:ring-[#6B46C1] outline-none ${error ? 'border-red-500' : 'border-gray-300'} ${loading ? 'bg-gray-50' : ''}`}
         placeholder={placeholder}
         rows={3}
      />
      <MapPin className={`absolute left-3 top-3 w-5 h-5 ${loading ? 'text-[#6B46C1] animate-bounce' : 'text-gray-400'}`} />
      {loading && (
         <span className="absolute right-3 top-3 text-xs text-[#6B46C1] font-medium">Auto-filling...</span>
      )}
    </div>
  );
};

export default AddressAutofill;