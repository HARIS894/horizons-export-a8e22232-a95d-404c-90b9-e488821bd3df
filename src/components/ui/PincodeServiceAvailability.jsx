// Task 3: PincodeServiceAvailability
import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { serviceablePincodes } from '@/config/pincodeConfig';
import { Button } from '@/components/ui/button';

const PincodeServiceAvailability = ({ pincode, onChange, autoDetect = false }) => {
  const [status, setStatus] = useState('idle'); // idle, checking, available, limited, unavailable
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (pincode && pincode.length === 6) {
      checkAvailability(pincode);
    } else {
      setStatus('idle');
      setMessage('');
    }
  }, [pincode]);

  const checkAvailability = (code) => {
    setStatus('checking');
    setTimeout(() => {
      const area = serviceablePincodes.find(p => p.code === code);
      if (area) {
        setStatus('available');
        setMessage(`Great! We have full coverage in ${area.city}.`);
      } else {
        // Simple mock logic for "limited" vs "unavailable"
        const nearby = serviceablePincodes.find(p => p.code.substring(0,3) === code.substring(0,3));
        if (nearby) {
           setStatus('limited');
           setMessage(`Limited service. We are fully active in nearby ${nearby.city}.`);
        } else {
           setStatus('unavailable');
           setMessage('Sorry, we do not serve this area yet.');
        }
      }
    }, 600);
  };

  const getStatusColor = () => {
    switch(status) {
      case 'available': return 'bg-green-50 border-green-200 text-green-700';
      case 'limited': return 'bg-yellow-50 border-yellow-200 text-yellow-700';
      case 'unavailable': return 'bg-red-50 border-red-200 text-red-700';
      default: return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  const getIcon = () => {
     switch(status) {
        case 'available': return <CheckCircle2 className="w-5 h-5 text-green-600" />;
        case 'limited': return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
        case 'unavailable': return <XCircle className="w-5 h-5 text-red-600" />;
        case 'checking': return <Loader2 className="w-5 h-5 animate-spin text-purple-600" />;
        default: return null;
     }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">Pincode</label>
      <div className="relative">
        <input 
          type="text" 
          maxLength={6}
          value={pincode}
          onChange={(e) => onChange(e.target.value.replace(/\D/g,''))}
          className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6B46C1] outline-none transition-all"
          placeholder="Enter 6-digit pincode"
        />
        <div className="absolute right-3 top-3">
           {getIcon()}
        </div>
      </div>
      
      {status !== 'idle' && (
        <div className={`p-3 rounded-lg border text-sm flex items-start gap-2 ${getStatusColor()}`}>
          <div className="mt-0.5">{getIcon()}</div>
          <p>{message}</p>
        </div>
      )}
      
      {status === 'unavailable' && (
         <div className="text-xs text-gray-500">
            Suggested: Try 110001 (Delhi) or 560001 (Bangalore) for demo.
         </div>
      )}
    </div>
  );
};

export default PincodeServiceAvailability;