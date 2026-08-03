import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowLeft, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const EmergencyBookingForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    serviceType: '',
    patientName: '',
    phone: '',
    location: '',
    emergencyDescription: ''
  });
  const [errors, setErrors] = useState({});

  const serviceTypes = [
    'Emergency Nursing Care',
    'Immediate Medical Attention',
    'Post-Surgery Emergency',
    'Chronic Condition Crisis',
    'Other Medical Emergency'
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.serviceType) {
      newErrors.serviceType = 'Please select a service type';
    }
    if (!formData.patientName.trim()) {
      newErrors.patientName = 'Patient name is required';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s-()]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }
    if (!formData.emergencyDescription.trim()) {
      newErrors.emergencyDescription = 'Please describe the emergency';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields correctly.',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      const booking = {
        id: `EMG-${Date.now()}`,
        ...formData,
        status: 'pending',
        bookingDate: new Date().toISOString(),
        type: 'emergency',
        createdAt: new Date().toISOString()
      };

      // Store in localStorage (will be Supabase in production)
      const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
      bookings.push(booking);
      localStorage.setItem('bookings', JSON.stringify(bookings));

      toast({
        title: 'Emergency Booking Submitted!',
        description: 'A nurse will contact you within 15 minutes.',
        variant: 'default'
      });

      navigate('/booking-confirmation', { state: { booking } });
    } catch (error) {
      toast({
        title: 'Booking Failed',
        description: 'Please try again or call our emergency hotline.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Emergency Booking - InstantCare</title>
        <meta name="description" content="Book emergency home healthcare services with InstantCare. Get immediate nurse assistance." />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Header */}
              <div className="bg-red-50 border-l-4 border-red-600 p-4 mb-6 rounded-r-lg">
                <div className="flex items-start">
                  <AlertCircle className="w-6 h-6 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-lg font-semibold text-red-900">Emergency Booking</h3>
                    <p className="text-sm text-red-700 mt-1">
                      For life-threatening emergencies, call 911 immediately. This form is for urgent home healthcare needs.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-2xl font-bold text-gray-900">Emergency Service Request</h1>
                  <Button
                    variant="ghost"
                    onClick={() => navigate('/')}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Service Type */}
                  <div>
                    <label htmlFor="serviceType" className="block text-sm font-medium text-gray-700 mb-2">
                      Service Type <span className="text-red-600">*</span>
                    </label>
                    <select
                      id="serviceType"
                      name="serviceType"
                      value={formData.serviceType}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900 bg-white ${
                        errors.serviceType ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select emergency service</option>
                      {serviceTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    {errors.serviceType && (
                      <p className="text-red-600 text-sm mt-1">{errors.serviceType}</p>
                    )}
                  </div>

                  {/* Patient Name */}
                  <div>
                    <label htmlFor="patientName" className="block text-sm font-medium text-gray-700 mb-2">
                      Patient Name <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      id="patientName"
                      name="patientName"
                      value={formData.patientName}
                      onChange={handleChange}
                      placeholder="Enter patient's full name"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900 bg-white ${
                        errors.patientName ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.patientName && (
                      <p className="text-red-600 text-sm mt-1">{errors.patientName}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Phone <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+1 (555) 123-4567"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900 bg-white ${
                        errors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.phone && (
                      <p className="text-red-600 text-sm mt-1">{errors.phone}</p>
                    )}
                  </div>

                  {/* Location */}
                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                      Location/Address <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="Enter complete address with landmarks"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900 bg-white ${
                        errors.location ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.location && (
                      <p className="text-red-600 text-sm mt-1">{errors.location}</p>
                    )}
                  </div>

                  {/* Emergency Description */}
                  <div>
                    <label htmlFor="emergencyDescription" className="block text-sm font-medium text-gray-700 mb-2">
                      Emergency Description <span className="text-red-600">*</span>
                    </label>
                    <textarea
                      id="emergencyDescription"
                      name="emergencyDescription"
                      value={formData.emergencyDescription}
                      onChange={handleChange}
                      placeholder="Describe the emergency situation, symptoms, and any immediate concerns"
                      rows={4}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900 bg-white resize-none ${
                        errors.emergencyDescription ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.emergencyDescription && (
                      <p className="text-red-600 text-sm mt-1">{errors.emergencyDescription}</p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <Button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 text-lg"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Phone className="mr-2 w-5 h-5" />
                          Submit Emergency Request
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate('/')}
                      disabled={loading}
                      className="sm:w-auto text-gray-700 border-gray-300 py-3"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>

                {/* Emergency Hotline */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-900 text-center">
                    <Phone className="inline w-4 h-4 mr-2" />
                    24/7 Emergency Hotline: <span className="font-bold">+1 (800) 123-4567</span>
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default EmergencyBookingForm;