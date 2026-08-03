// Updated to use localStorage only - No Supabase dependency

export const saveBookingLocation = async (bookingId, locationData) => {
  console.log(`Saving location for booking ${bookingId}:`, locationData);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const { latitude, longitude, pincode, address } = locationData;
  
  // Update bookings in localStorage
  const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
  const index = bookings.findIndex(b => b.id === bookingId || b.bookingRef === bookingId);
  
  if (index !== -1) {
    bookings[index] = {
      ...bookings[index],
      latitude,
      longitude,
      pincode,
      full_address: address,
      location_verified: true,
      updated_at: new Date().toISOString()
    };
    localStorage.setItem('bookings', JSON.stringify(bookings));
    return bookings[index];
  }
  
  console.warn("Booking not found for location update:", bookingId);
  return null;
};

export const updateStaffLocation = async (staffId, lat, lng) => {
  console.log(`Tracking staff ${staffId}: ${lat}, ${lng}`);
  
  const staffTracking = JSON.parse(localStorage.getItem('staff_tracking') || '[]');
  const newEntry = {
    staff_id: staffId,
    latitude: lat,
    longitude: lng,
    timestamp: new Date().toISOString()
  };
  
  staffTracking.push(newEntry);
  localStorage.setItem('staff_tracking', JSON.stringify(staffTracking));
  
  return newEntry;
};

export const deleteLocationData = async (bookingId) => {
  console.log(`Deleting location data for booking ${bookingId}`);
  
  const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
  const index = bookings.findIndex(b => b.id === bookingId || b.bookingRef === bookingId);
  
  if (index !== -1) {
    bookings[index] = {
      ...bookings[index],
      latitude: null, 
      longitude: null,
      location_verified: false
    };
    localStorage.setItem('bookings', JSON.stringify(bookings));
    return true;
  }
  return false;
};

export const getAvailableStaffByLocation = async (pincode, serviceType) => {
  // Use the staffUtils logic basically, but filtering specifically here
  const allStaff = JSON.parse(localStorage.getItem('staff_db') || '[]');
  
  return allStaff.filter(staff => 
    staff.pincode_coverage && 
    staff.pincode_coverage.includes(pincode) &&
    staff.service_types && 
    staff.service_types.includes(serviceType) &&
    staff.current_status === 'Available'
  );
};