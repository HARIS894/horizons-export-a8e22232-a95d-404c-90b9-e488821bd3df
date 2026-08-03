import { serviceablePincodes } from '@/config/pincodeConfig';

export const validatePatientName = (name) => {
  const regex = /^[a-zA-Z\s]{3,50}$/;
  if (!name) return { isValid: false, error: 'Patient name is required' };
  if (!regex.test(name)) return { isValid: false, error: 'Name must be 3-50 characters, alphabets only' };
  return { isValid: true, error: '' };
};

export const validateMobileNumber = (mobile) => {
  const regex = /^[6-9]\d{9}$/;
  if (!mobile) return { isValid: false, error: 'Mobile number is required' };
  if (!regex.test(mobile)) return { isValid: false, error: 'Enter valid 10-digit mobile number' };
  return { isValid: true, error: '' };
};

export const validateOTP = (otp) => {
  const regex = /^\d{6}$/;
  if (!otp) return { isValid: false, error: 'OTP is required' };
  if (!regex.test(otp)) return { isValid: false, error: 'OTP must be 6 digits' };
  return { isValid: true, error: '' };
};

export const validatePincode = (pincode) => {
  const regex = /^\d{6}$/;
  if (!pincode) return { isValid: false, error: 'Pincode is required' };
  if (!regex.test(pincode)) return { isValid: false, error: 'Enter valid 6-digit pincode' };
  
  const isServiceable = serviceablePincodes.some(p => p.code === pincode);
  if (!isServiceable) return { isValid: false, error: 'Sorry, we do not serve this area yet' };
  
  return { isValid: true, error: '' };
};

export const validateAddress = (address) => {
  if (!address) return { isValid: false, error: 'Address is required' };
  if (address.length < 20) return { isValid: false, error: 'Address is too short (min 20 chars)' };
  if (address.length > 200) return { isValid: false, error: 'Address is too long (max 200 chars)' };
  return { isValid: true, error: '' };
};

export const validateStartDate = (dateString, isEmergency) => {
  if (!dateString) return { isValid: false, error: 'Start date is required' };
  
  const selectedDate = new Date(dateString);
  const now = new Date();
  const minTime = new Date(now.getTime() + (isEmergency ? 2 * 60 * 60 * 1000 : 0)); // +2 hours for emergency

  if (selectedDate < minTime) {
    return { 
      isValid: false, 
      error: isEmergency ? 'Emergency booking requires at least 2 hours notice' : 'Date cannot be in the past' 
    };
  }
  return { isValid: true, error: '' };
};

export const validateServiceType = (service) => {
  if (!service) return { isValid: false, error: 'Please select a service' };
  return { isValid: true, error: '' };
};

export const validateShiftType = (shift) => {
  if (!shift) return { isValid: false, error: 'Please select shift duration' };
  return { isValid: true, error: '' };
};