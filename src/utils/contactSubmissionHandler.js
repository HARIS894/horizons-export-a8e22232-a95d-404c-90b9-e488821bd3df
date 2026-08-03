// Updated to use localStorage only - No Supabase dependency

export const submitContactForm = async (formData) => {
  console.log("Submitting contact form to localStorage:", formData);

  try {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const existingContacts = JSON.parse(localStorage.getItem('contacts') || '[]');
    
    const newContact = {
      contact_id: `contact-${Date.now()}`,
      ...formData,
      status: 'new',
      created_at: new Date().toISOString()
    };

    existingContacts.push(newContact);
    localStorage.setItem('contacts', JSON.stringify(existingContacts));
    
    console.log("Contact saved successfully:", newContact);
    return { success: true };
  } catch (error) {
    console.error('Error submitting contact form:', error);
    return { success: false, error: error.message };
  }
};

export const submitCallbackRequest = async (phone, preferredTime) => {
  console.log("Submitting callback request to localStorage:", { phone, preferredTime });

  try {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const existingRequests = JSON.parse(localStorage.getItem('callback_requests') || '[]');
    
    const newRequest = {
      request_id: `req-${Date.now()}`,
      phone,
      preferred_time: preferredTime,
      status: 'pending',
      created_at: new Date().toISOString()
    };

    existingRequests.push(newRequest);
    localStorage.setItem('callback_requests', JSON.stringify(existingRequests));

    console.log("Callback request saved successfully:", newRequest);
    return { success: true };
  } catch (error) {
    console.error('Error submitting callback request:', error);
    return { success: false, error: error.message };
  }
};