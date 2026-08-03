// Task 1: LocationDetectionService
import { reverseGeocode } from './locationUtils';

export const detectUserLocation = async (apiKey) => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser"));
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 30000,
      maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        let addressDetails = { address: '', pincode: '' };
        
        try {
          if (apiKey) {
            const result = await reverseGeocode(latitude, longitude, apiKey);
            if (result) addressDetails = result;
          }
        } catch (error) {
          console.warn('Reverse geocoding failed, returning coordinates only.');
        }

        const locationData = {
          latitude,
          longitude,
          address: addressDetails.address,
          pincode: addressDetails.pincode,
          timestamp: Date.now()
        };

        // Auto-save to localStorage if consent given (handled by component logic usually, but helper here)
        try {
           const privacySettings = JSON.parse(localStorage.getItem('privacySettings') || '{}');
           if (privacySettings.shareLocation) {
              localStorage.setItem('lastKnownLocation', JSON.stringify(locationData));
           }
        } catch (e) {
           // Ignore storage errors
        }

        resolve(locationData);
      },
      (error) => {
        let errorMessage = "Unknown error occurred.";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location permission denied. Please enable it or enter address manually.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out. Please try again.";
            break;
        }
        reject(new Error(errorMessage));
      },
      options
    );
  });
};