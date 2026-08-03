import { getStaffById } from './staffUtils';

export const validateAssignment = async (staffId, bookingDetails) => {
  const staff = await getStaffById(staffId);
  
  if (!staff) {
    return { isValid: false, error: 'Staff member not found.' };
  }

  // 1. Verify Verification Status
  if (staff.verification_status !== 'verified') {
    return { isValid: false, error: 'Staff member is not verified.' };
  }

  // 2. Verify Current Availability
  // Note: We might allow "Assigned" staff to be booked for future dates, 
  // but for immediate/emergency, they must be "Available".
  // This simple logic assumes immediate assignment.
  if (['On Leave', 'Inactive', 'Blocked'].includes(staff.current_status)) {
    return { isValid: false, error: `Staff is currently ${staff.current_status}.` };
  }

  if (staff.current_status === 'Assigned') {
    // In a real app, check date overlaps. For now, strict single assignment.
    return { isValid: false, error: 'Staff is already assigned to another booking.' };
  }

  // 3. Verify Shift Capability
  if (bookingDetails.shiftType && !staff.available_shifts.includes(bookingDetails.shiftType)) {
    return { isValid: false, error: `Staff does not cover ${bookingDetails.shiftType} shifts.` };
  }

  // 4. Verify Service Capability
  // Simplified matching: Check if one of the staff's service types matches
  const hasServiceMatch = staff.service_types.some(type => 
    bookingDetails.serviceType.toLowerCase().includes(type.toLowerCase()) || 
    type.toLowerCase().includes(bookingDetails.serviceType.toLowerCase())
  );
  
  if (!hasServiceMatch) {
    // Soft warning or strict error depending on policy.
    // return { isValid: false, error: 'Staff service expertise does not match booking requirement.' };
  }

  return { isValid: true };
};