import React, { useState, useEffect } from 'react';
import { Send, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { submitContactForm } from '@/utils/contactSubmissionHandler';

const ContactForm = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Inquiry',
    message: '',
    privacy: false
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const saved = localStorage.getItem('contactFormData');
    if (saved) {
      try {
        setFormData(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load saved form data");
      }
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newVal = type === 'checkbox' ? checked : value;
    
    const updatedData = { ...formData, [name]: newVal };
    setFormData(updatedData);
    localStorage.setItem('contactFormData', JSON.stringify(updatedData));
    
    // Clear error on change
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (formData.name.length < 3) newErrors.name = "Name must be at least 3 characters";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Invalid email format";
    if (formData.phone && !/^\d{10}$/.test(formData.phone)) newErrors.phone = "Phone must be 10 digits";
    if (formData.message.length < 20) newErrors.message = "Message must be at least 20 characters";
    import React from 'react';
    import InquiryForm from '@/components/inquiry/InquiryForm';
  };

              name="subject"
        <InquiryForm
          source="embedded-contact-form"
          title="Share your care requirement"
          description="Use this structured inquiry form when you need a callback, a care estimate, document review, or service planning support."
        />