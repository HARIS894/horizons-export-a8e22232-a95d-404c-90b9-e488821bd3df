// Task 8: LocationPrivacyManager
import React, { useState, useEffect } from 'react';
import { Shield, Lock, Trash2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const LocationPrivacyManager = ({ onConsentChange }) => {
  const [consent, setConsent] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const settings = JSON.parse(localStorage.getItem('privacySettings') || '{}');
    if (settings.shareLocation) {
      setConsent(true);
      if (onConsentChange) onConsentChange(true);
    }
  }, []);

  const handleToggle = (e) => {
    const isChecked = e.target.checked;
    setConsent(isChecked);
    
    const settings = JSON.parse(localStorage.getItem('privacySettings') || '{}');
    settings.shareLocation = isChecked;
    localStorage.setItem('privacySettings', JSON.stringify(settings));
    
    if (onConsentChange) onConsentChange(isChecked);
    
    if (isChecked) {
      toast({ title: "Location Access Enabled", description: "We will use your location to find nearby services." });
    } else {
      toast({ title: "Location Access Disabled", description: "You can enter your location manually." });
    }
  };

  const clearHistory = () => {
    localStorage.removeItem('lastKnownLocation');
    toast({ title: "History Cleared", description: "Local location history has been removed." });
  };

  return (
    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-sm">
      <div className="flex items-center gap-2 mb-3 text-[#6B46C1] font-semibold">
        <Shield className="w-4 h-4" />
        <h3>Privacy & Location Settings</h3>
      </div>
      
      <p className="text-gray-600 mb-3 text-xs leading-relaxed">
        We use your location only to connect you with nearby healthcare professionals. 
        Your data is encrypted and automatically deleted after service completion.
      </p>

      <div className="flex items-start gap-3 mb-4">
        <input 
          type="checkbox" 
          id="locationConsent" 
          checked={consent} 
          onChange={handleToggle}
          className="mt-1 w-4 h-4 text-[#6B46C1] rounded focus:ring-[#6B46C1]"
        />
        <label htmlFor="locationConsent" className="cursor-pointer text-gray-700">
          I agree to share my location to find nearby services.
        </label>
      </div>

      <div className="flex justify-between items-center pt-2 border-t border-gray-200">
        <div className="flex items-center gap-1 text-xs text-green-600">
          <Lock className="w-3 h-3" /> Secure Connection
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={clearHistory}
          className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 px-2 text-xs"
        >
          <Trash2 className="w-3 h-3 mr-1" /> Clear History
        </Button>
      </div>
    </div>
  );
};

export default LocationPrivacyManager;