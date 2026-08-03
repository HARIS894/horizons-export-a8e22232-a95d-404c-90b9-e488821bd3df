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
    if (formData.message.length > 1000) newErrors.message = "Message too long (max 1000 chars)";
    if (!formData.privacy) newErrors.privacy = "You must agree to the privacy policy";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast({ title: "Validation Error", description: "Please fix the errors in the form.", variant: "destructive" });
      return;
    }

    setLoading(true);
    const result = await submitContactForm(formData);
    setLoading(false);

    if (result.success) {
      toast({ 
        title: "Message Sent!", 
        description: "We'll get back to you shortly. A confirmation has been sent to your email." 
      });
      setFormData({ name: '', email: '', phone: '', subject: 'General Inquiry', message: '', privacy: false });
      localStorage.removeItem('contactFormData');
    } else {
      toast({ 
        title: "Submission Failed", 
        description: result.error || "Something went wrong. Please try again.", 
        variant: "destructive" 
      });
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Full Name *</label>
            <input 
              type="text" 
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#6B46C1] outline-none transition-all ${errors.name ? 'border-red-500' : 'border-gray-200'}`}
              placeholder="John Doe"
              aria-label="Full Name"
            />
            {errors.name && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {errors.name}</p>}
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Email Address *</label>
            <input 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#6B46C1] outline-none transition-all ${errors.email ? 'border-red-500' : 'border-gray-200'}`}
              placeholder="john@example.com"
            />
            {errors.email && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {errors.email}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Phone Number (Optional)</label>
            <input 
              type="tel" 
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#6B46C1] outline-none transition-all ${errors.phone ? 'border-red-500' : 'border-gray-200'}`}
              placeholder="9876543210"
            />
            {errors.phone && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {errors.phone}</p>}
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Subject</label>
            <select 
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#6B46C1] outline-none transition-all"
            >
              <option>General Inquiry</option>
              <option>Booking Help</option>
              <option>Service Complaint</option>
              <option>Feedback</option>
              <option>Emergency</option>
              <option>Other</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Message *</label>
          <textarea 
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows={5}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#6B46C1] outline-none transition-all ${errors.message ? 'border-red-500' : 'border-gray-200'}`}
            placeholder="How can we help you today?"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>{errors.message ? <span className="text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {errors.message}</span> : "Min 20 characters"}</span>
            <span>{formData.message.length}/1000</span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="flex items-start gap-3 cursor-pointer">
            <input 
              type="checkbox" 
              name="privacy"
              checked={formData.privacy}
              onChange={handleChange}
              className="mt-1 w-4 h-4 text-[#6B46C1] rounded focus:ring-[#6B46C1]"
            />
            <span className="text-sm text-gray-600">
              I agree to the <a href="#" className="text-[#6B46C1] hover:underline">Privacy Policy</a> and authorize InstantCare to contact me regarding this inquiry.
            </span>
          </label>
          {errors.privacy && <p className="text-xs text-red-500">{errors.privacy}</p>}
        </div>

        <div className="flex gap-4 pt-2">
          <Button 
            type="submit" 
            className="flex-1 bg-gradient-to-r from-[#6B46C1] to-[#06B6D4] text-white hover:opacity-90"
            disabled={loading}
          >
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin"/> Sending...</> : <><Send className="w-4 h-4 mr-2" /> Send Message</>}
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => {
              if (window.confirm("Clear form?")) {
                setFormData({ name: '', email: '', phone: '', subject: 'General Inquiry', message: '', privacy: false });
                localStorage.removeItem('contactFormData');
              }
            }}
          >
            Clear
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ContactForm;