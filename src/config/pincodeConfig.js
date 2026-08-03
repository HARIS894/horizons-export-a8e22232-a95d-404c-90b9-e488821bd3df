// List of serviceable Indian pincodes and their approximate coordinates
export const serviceablePincodes = [
  { code: '110001', city: 'Delhi', lat: 28.6327, lng: 77.2197 },
  { code: '400001', city: 'Mumbai', lat: 18.9322, lng: 72.8347 },
  { code: '560001', city: 'Bangalore', lat: 12.9716, lng: 77.5946 },
  { code: '500001', city: 'Hyderabad', lat: 17.3850, lng: 78.4867 },
  { code: '411001', city: 'Pune', lat: 18.5204, lng: 73.8567 },
  { code: '380001', city: 'Ahmedabad', lat: 23.0225, lng: 72.5714 },
  { code: '600001', city: 'Chennai', lat: 13.0827, lng: 80.2707 },
  { code: '700001', city: 'Kolkata', lat: 22.5726, lng: 88.3639 }
];

export const SERVICE_RADIUS_KM = 15;

/**
 * Get pincode data by pincode code
 * @param {string} pincodeCode - The 6-digit pincode
 * @returns {object|null} - Pincode data object or null if not found
 */
export const getPincodeData = (pincodeCode) => {
  return serviceablePincodes.find(p => p.code === pincodeCode) || null;
};

/**
 * Check if a pincode is serviceable
 * @param {string} pincodeCode - The 6-digit pincode
 * @returns {boolean} - True if pincode is serviceable
 */
export const isServiceablePincode = (pincodeCode) => {
  return serviceablePincodes.some(p => p.code === pincodeCode);
};

/**
 * Get all serviceable cities
 * @returns {array} - Array of city names
 */
export const getServiceableCities = () => {
  return [...new Set(serviceablePincodes.map(p => p.city))];
};