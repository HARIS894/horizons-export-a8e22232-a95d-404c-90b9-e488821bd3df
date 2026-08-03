export const saveFormToLocalStorage = (formData) => {
  localStorage.setItem('smartBookingForm', JSON.stringify(formData));
};

export const loadFormFromLocalStorage = () => {
  const saved = localStorage.getItem('smartBookingForm');
  return saved ? JSON.parse(saved) : null;
};

export const clearFormStorage = () => {
  localStorage.removeItem('smartBookingForm');
};

export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  // Ensure +91 format
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) return `+91${cleaned}`;
  if (cleaned.length === 12 && cleaned.startsWith('91')) return `+${cleaned}`;
  return phone;
};