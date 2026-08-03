// Updated to use localStorage only - No Supabase dependency

// Mock Data Generator for initial local storage population
const generateMockStaff = () => {
  const serviceTypes = ['Nurse', 'Attendant', 'Elderly Care', 'Post-Surgery Care', 'Medical Support'];
  const shifts = ['12 Hours', '24 Hours'];
  const names = ['Aisha Khan', 'Rahul Verma', 'Sita Devi', 'Vikram Singh', 'Priya Patel', 'John David'];
  
  return names.map((name, i) => ({
    staff_id: `mock-staff-${i + 1}`,
    name,
    phone: `987654321${i}`,
    email: `${name.toLowerCase().replace(' ', '.')}@example.com`,
    photo_url: `https://i.pravatar.cc/150?u=${i}`,
    qualification: i % 2 === 0 ? 'B.Sc Nursing' : 'GDA Certified',
    experience_years: Math.floor(Math.random() * 10) + 1,
    service_types: [serviceTypes[i % 5], serviceTypes[(i + 1) % 5]],
    available_shifts: [shifts[i % 2]],
    pincode_coverage: ['560001', '560002', '560003'],
    verification_status: i === 0 ? 'pending' : 'verified',
    current_status: i === 1 ? 'Assigned' : 'Available',
    rating: (4 + Math.random()).toFixed(1),
    total_ratings: Math.floor(Math.random() * 50),
    completed_bookings: Math.floor(Math.random() * 100),
    joined_at: new Date().toISOString()
  }));
};

// --- CRUD Operations (LocalStorage) ---

export const getStaffList = async () => {
  // Simulate network delay for realism
  await new Promise(resolve => setTimeout(resolve, 300));
  
  let localData = localStorage.getItem('staff_db');
  if (!localData) {
    console.log("Initializing mock staff database...");
    const mock = generateMockStaff();
    localStorage.setItem('staff_db', JSON.stringify(mock));
    return mock;
  }
  return JSON.parse(localData);
};

export const createStaff = async (staffData) => {
  console.log("Creating new staff member:", staffData);
  await new Promise(resolve => setTimeout(resolve, 500));

  const newStaff = {
    ...staffData,
    staff_id: `staff-${Date.now()}`,
    joined_at: new Date().toISOString(),
    verification_status: 'pending',
    current_status: 'Offline', // Default for new staff
    rating: 0,
    total_ratings: 0,
    completed_bookings: 0
  };

  const existing = await getStaffList();
  const updated = [...existing, newStaff];
  localStorage.setItem('staff_db', JSON.stringify(updated));
  return newStaff;
};

export const updateStaff = async (staffId, updates) => {
  console.log(`Updating staff ${staffId}:`, updates);
  await new Promise(resolve => setTimeout(resolve, 300));

  const existing = await getStaffList();
  const index = existing.findIndex(s => s.staff_id === staffId);
  if (index !== -1) {
    existing[index] = { ...existing[index], ...updates };
    localStorage.setItem('staff_db', JSON.stringify(existing));
    return existing[index];
  }
  console.warn(`Staff ID ${staffId} not found.`);
  return null;
};

export const getStaffById = async (staffId) => {
  const existing = await getStaffList();
  return existing.find(s => s.staff_id === staffId);
};

export const updateStaffStatus = async (staffId, newStatus, reason = '') => {
  console.log(`Updating status for ${staffId} to ${newStatus}`);
  return await updateStaff(staffId, { 
    current_status: newStatus,
    last_status_update: new Date().toISOString(),
    status_reason: reason
  });
};

export const verifyStaff = async (staffId, status, notes) => {
  console.log(`Verifying staff ${staffId}: ${status}`);
  return await updateStaff(staffId, {
    verification_status: status,
    verified_at: status === 'verified' ? new Date().toISOString() : null,
    admin_notes: notes
  });
};