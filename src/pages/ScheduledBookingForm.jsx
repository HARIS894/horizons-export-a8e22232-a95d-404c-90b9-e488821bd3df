import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Calendar, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const ScheduledBookingForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    serviceType: '',
    patientName: '',
    email: '',
    phone: '',
    bookingDate: '',
    bookingTime: '',
    location: '',
    medicalHistory: '',
    nurseGender: ''
  });
  const [errors, setErrors] = useState({});

  const serviceTypes = [
    '12-Hour Nursing Care',
    '24-Hour Nursing Care',
    'Home Healthcare',
    'Post-Surgery Care',
    'Elderly Care',
    'Chronic Disease Management'
  ];

  const steps = [
    { number: 1, title: 'Service Selection' },
    { number: 2, title: 'Patient Details' },
    { number: 3, title: 'Schedule' },
    { number: 4, title: 'Review & Confirm' }
  ];

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.serviceType) {
        newErrors.serviceType = 'Please select a service type';
      }
    }

    if (step === 2) {
      if (!formData.patientName.trim()) {
        newErrors.patientName = 'Patient name is required';
      }
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email';
      }
      if (!formData.phone.trim()) {
        newErrors.phone = 'Phone number is required';
      } else if (!/^\+?[\d\s-()]{10,}$/.test(formData.phone)) {
        newErrors.phone = 'Please enter a valid phone number';
      }
    }

    if (step === 3) {
      if (!formData.bookingDate) {
        newErrors.bookingDate = 'Please select a date';
      } else {
        const selectedDate = new Date(formData.bookingDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate < today) {
          newErrors.bookingDate = 'Please select a future date';
        }
      }
      if (!formData.bookingTime) {
        newErrors.bookingTime = 'Please select a time';
      }
      if (!formData.location.trim()) {
        newErrors.location = 'Location is required';
      }
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

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) {
      return;
    }

    setLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      const booking = {
        id: `SCH-${Date.now()}`,
        ...formData,
        status: 'pending',
        type: 'scheduled',
        createdAt: new Date().toISOString()
      };

      const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
      bookings.push(booking);
      localStorage.setItem('bookings', JSON.stringify(bookings));

      toast({
        title: 'Booking Confirmed!',
        description: 'Your appointment has been scheduled successfully.',
        variant: 'default'
      });

      navigate('/booking-confirmation', { state: { booking } });
    } catch (error) {
      toast({
        title: 'Booking Failed',
        description: 'Please try again or contact support.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label htmlFor="serviceType" className="block text-sm font-medium text-gray-700 mb-2">
                Select Service Type <span className="text-red-600">*</span>
              </label>
              <select
                id="serviceType"
                name="serviceType"
                value={formData.serviceType}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white ${
                  errors.serviceType ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Choose a service</option>
                {serviceTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              {errors.serviceType && (
                <p className="text-red-600 text-sm mt-1">{errors.serviceType}</p>
              )}
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Service Details:</h4>
              <p className="text-sm text-blue-800">
                Select the type of care you need. Our certified nurses will provide professional
                healthcare services in the comfort of your home.
              </p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
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
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white ${
                  errors.patientName ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.patientName && (
                <p className="text-red-600 text-sm mt-1">{errors.patientName}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address <span className="text-red-600">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="patient@example.com"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.email && (
                <p className="text-red-600 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number <span className="text-red-600">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 (555) 123-4567"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.phone && (
                <p className="text-red-600 text-sm mt-1">{errors.phone}</p>
              )}
            </div>

            <div>
              <label htmlFor="medicalHistory" className="block text-sm font-medium text-gray-700 mb-2">
                Medical History / Notes
              </label>
              <textarea
                id="medicalHistory"
                name="medicalHistory"
                value={formData.medicalHistory}
                onChange={handleChange}
                placeholder="Any relevant medical conditions, allergies, or special requirements"
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white resize-none"
              />
            </div>

            <div>
              <label htmlFor="nurseGender" className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Nurse Gender (Optional)
              </label>
              <select
                id="nurseGender"
                name="nurseGender"
                value={formData.nurseGender}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
              >
                <option value="">No preference</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
              </select>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label htmlFor="bookingDate" className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Date <span className="text-red-600">*</span>
              </label>
              <input
                type="date"
                id="bookingDate"
                name="bookingDate"
                value={formData.bookingDate}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white ${
                  errors.bookingDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.bookingDate && (
                <p className="text-red-600 text-sm mt-1">{errors.bookingDate}</p>
              )}
            </div>

            <div>
              <label htmlFor="bookingTime" className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Time <span className="text-red-600">*</span>
              </label>
              <input
                type="time"
                id="bookingTime"
                name="bookingTime"
                value={formData.bookingTime}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white ${
                  errors.bookingTime ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.bookingTime && (
                <p className="text-red-600 text-sm mt-1">{errors.bookingTime}</p>
              )}
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                Service Location <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Enter complete address"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white ${
                  errors.location ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.location && (
                <p className="text-red-600 text-sm mt-1">{errors.location}</p>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="font-semibold text-lg text-blue-900 mb-4">Review Your Booking</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-blue-200">
                  <span className="text-blue-800 font-medium">Service Type:</span>
                  <span className="text-blue-900">{formData.serviceType}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-blue-200">
                  <span className="text-blue-800 font-medium">Patient Name:</span>
                  <span className="text-blue-900">{formData.patientName}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-blue-200">
                  <span className="text-blue-800 font-medium">Email:</span>
                  <span className="text-blue-900">{formData.email}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-blue-200">
                  <span className="text-blue-800 font-medium">Phone:</span>
                  <span className="text-blue-900">{formData.phone}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-blue-200">
                  <span className="text-blue-800 font-medium">Date & Time:</span>
                  <span className="text-blue-900">
                    {new Date(formData.bookingDate).toLocaleDateString()} at {formData.bookingTime}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-blue-200">
                  <span className="text-blue-800 font-medium">Location:</span>
                  <span className="text-blue-900 text-right">{formData.location}</span>
                </div>
                {formData.nurseGender && (
                  <div className="flex justify-between py-2 border-b border-blue-200">
                    <span className="text-blue-800 font-medium">Nurse Preference:</span>
                    <span className="text-blue-900 capitalize">{formData.nurseGender}</span>
                  </div>
                )}
                {formData.medicalHistory && (
                  <div className="py-2">
                    <span className="text-blue-800 font-medium block mb-2">Medical Notes:</span>
                    <p className="text-blue-900 text-sm">{formData.medicalHistory}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-900">
                By confirming this booking, you agree to our terms of service and privacy policy.
                A confirmation email will be sent to {formData.email}.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Helmet>
        <title>Schedule Booking - InstantCare</title>
        <meta name="description" content="Schedule professional home healthcare services with InstantCare. Book certified nurses for your loved ones." />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Progress Steps */}
              <div className="mb-8">
                <div className="flex items-center justify-between">
                  {steps.map((step, index) => (
                    <React.Fragment key={step.number}>
                      <div className="flex flex-col items-center flex-1">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                            currentStep >= step.number
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 text-gray-600'
                          }`}
                        >
                          {currentStep > step.number ? (
                            <CheckCircle className="w-6 h-6" />
                          ) : (
                            step.number
                          )}
                        </div>
                        <span className="text-xs mt-2 text-gray-600 text-center hidden sm:block">
                          {step.title}
                        </span>
                      </div>
                      {index < steps.length - 1 && (
                        <div
                          className={`h-1 flex-1 transition-colors ${
                            currentStep > step.number ? 'bg-blue-600' : 'bg-gray-200'
                          }`}
                        />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Form Card */}
              <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {steps[currentStep - 1].title}
                  </h1>
                  <Button
                    variant="ghost"
                    onClick={() => navigate('/')}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {renderStepContent()}
                  </motion.div>
                </AnimatePresence>

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    disabled={currentStep === 1 || loading}
                    className="text-gray-700 border-gray-300"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>

                  {currentStep < 4 ? (
                    <Button
                      onClick={handleNext}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Next
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Confirming...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5 mr-2" />
                          Confirm Booking
                        </>
                      )}
                    </Button>
                  )}
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

export default ScheduledBookingForm;