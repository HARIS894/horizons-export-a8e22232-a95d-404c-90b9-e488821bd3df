import { SERVICE_RADIUS_KM } from '@/config/pincodeConfig';

export const reverseGeocode = async (lat, lng, apiKey) => {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
    );
    const data = await response.json();
    if (data.status === 'OK' && data.results[0]) {
      // Extract pincode and address
      const address = data.results[0].formatted_address;
      const pincodeComponent = data.results[0].address_components.find(c => c.types.includes('postal_code'));
      const pincode = pincodeComponent ? pincodeComponent.long_name : '';
      return { address, pincode };
    }
    throw new Error('Geocoding failed');
  } catch (error) {
    console.error('Reverse geocode error:', error);
    return null;
  }
};

export const validateServiceRadius = (centerLat, centerLng, userLat, userLng) => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(userLat - centerLat);
  const dLng = deg2rad(userLng - centerLng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(centerLat)) * Math.cos(deg2rad(userLat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d <= SERVICE_RADIUS_KM;
};

const deg2rad = (deg) => {
  return deg * (Math.PI / 180);
};

export const getStaffAvailability = (pincode) => {
  // Mock data simulation based on pincode
  if (!pincode) return null;
  
  const seed = parseInt(pincode.substring(3));
  const count = (seed % 5) + 2; // Random count between 2-6
  const arrival = (seed % 30) + 30; // Random minutes 30-60
  
  return {
    count,
    arrivalMinutes: arrival,
    qualifications: ['Certified Nurse', 'BLS Certified', 'ICU Trained']
  };
};

export const calculateEstimatedArrival = (startDateTime) => {
  // Logic to calculate arrival window
  const start = new Date(startDateTime);
  const arrivalWindowStart = new Date(start.getTime() - 30 * 60000); // 30 mins before
  return arrivalWindowStart;
};