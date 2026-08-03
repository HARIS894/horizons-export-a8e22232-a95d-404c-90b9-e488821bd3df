import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Check, Loader2, Info, MapPin, User, Phone, AlertTriangle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';

const BookNursePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [bookingRef, setBookingRef] = useState('');
  const ogImage = "https://horizons-cdn.hostinger.com/a8e22232-a95d-404c-90b9-e488821bd3df/e5cc0df1efbb4be6faf5d180e168f0cb.jpg";
  
  const [formData, setFormData] = useState({
    patientName: '',
    mobileNumber: '',
    serviceType: 'Nurse (12H)',
    shiftType: 'Day Shift',
    urgencyLevel: 'Normal',
    isEmergency: false,
    startDate: '',
    endDate: '',
    pincode: '',
    address: '',
    specialInstructions: '',
    termsAccepted: false
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const saved = localStorage.getItem('bookingFormDraft');
    if (saved) {
      setFormData(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('bookingFormDraft', JSON.stringify(formData));
  }, [formData]);

  const validate = () => {
    const newErrors = {};
    if (formData.patientName.length < 3) newErrors.patientName = "Name must be at least 3 characters";
    if (!/^\d{10}$/.test(formData.mobileNumber)) newErrors.mobileNumber = "Enter valid 10-digit mobile number";
    if (!formData.startDate) newErrors.startDate = "Start date is required";
    if (!/^\d{6}$/.test(formData.pincode)) newErrors.pincode = "Enter valid 6-digit pincode";
    if (formData.address.length < 10) newErrors.address = "Address must be at least 10 characters";
    if (!formData.termsAccepted) newErrors.termsAccepted = "You must accept terms & conditions";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
       toast({ title: "Please fill required fields", variant: "destructive" });
       return;
    }
    
    setLoading(true);

    // Auto-assignment logic
    try {
      console.log('Attempting to auto-assign nurse matching pincode:', formData.pincode);
      
      // 1 & 2. Query available nurses
      const { data: availableNurses, error: searchError } = await supabase
        .from('nurses')
        .select('*')
        .eq('pincode', formData.pincode)
        .eq('status', 'available')
        .limit(1);

      if (searchError) {
        console.error("Error searching for nurses:", searchError);
      } else if (availableNurses && availableNurses.length > 0) {
        const nurse = availableNurses[0];
        console.log("Found available nurse:", nurse.id);

        // 3. Update nurse status and create assignment
        // Using Promise.all for atomic-like operation (though not strictly atomic without transaction)
        
        // Update nurse status
        const { error: updateError } = await supabase
          .from('nurses')
          .update({ status: 'busy' })
          .eq('id', nurse.id);

        if (updateError) {
          console.error("Failed to update nurse status:", updateError);
        } else {
          // Create assignment
          const { error: assignError } = await supabase
            .from('assignments')
            .insert({
              nurse_id: nurse.id,
              patient_name: formData.patientName,
              pincode: formData.pincode
            });

          if (assignError) {
            console.error("Failed to create assignment record:", assignError);
            // Optional: Revert nurse status if assignment fails (complex to handle here perfectly without backend functions)
          } else {
            console.log("Successfully assigned nurse", nurse.id, "to patient", formData.patientName);
          }
        }
      } else {
        console.log("No available nurses found for pincode:", formData.pincode);
      }
    } catch (err) {
      // 4. Log error but continue
      console.error("Unexpected error in assignment logic:", err);
    }
    
    // 5. Save inquiry normally using existing logic (setTimeout simulation)
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      const ref = `REF-${Math.floor(10000 + Math.random() * 90000)}`;
      setBookingRef(ref);
      localStorage.removeItem('bookingFormDraft');
      window.scrollTo(0, 0);
    }, 2000);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#F8FAFB] flex flex-col font-sans">
        <Helmet>
          <title>Booking Confirmed – InstantCare</title>
          <meta name="robots" content="noindex" />
        </Helmet>
        <Navbar />
        <div className="flex-grow flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white w-full max-w-md p-8 rounded-2xl shadow-soft text-center border border-gray-100"
          >
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
            <p className="text-gray-600 mb-6 text-sm">Your request has been received. Our team will contact you shortly.</p>
            
            <div className="bg-gray-50 p-4 rounded-xl text-left mb-6 border border-gray-100">
               <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-500">Reference:</span>
                  <span className="font-mono font-bold text-gray-900">{bookingRef}</span>
               </div>
               <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Service:</span>
                  <span className="font-medium text-gray-900">{formData.serviceType}</span>
               </div>
            </div>

            <Button onClick={() => navigate('/')} className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl py-4 font-bold h-auto">
               Go Home
            </Button>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFB] flex flex-col font-sans">
      <Helmet>
        <title>Book a Nurse – InstantCare Home Healthcare</title>
        <meta name="description" content="Easily book a nurse, doctor, or attendant for home care. Fast, reliable, and verified healthcare professionals assigned to your location." />
        
        {/* Open Graph */}
        <meta property="og:title" content="Book a Nurse – InstantCare Home Healthcare" />
        <meta property="og:description" content="Instant booking for nurses and caregivers. Verified staff, 24/7 availability." />
        <meta property="og:url" content="https://instantcare.in/book" />
        <meta property="og:image" content={ogImage} />
        <meta property="og:type" content="website" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Book a Nurse – InstantCare Home Healthcare" />
        <meta name="twitter:description" content="Instant booking for nurses and caregivers. Verified staff, 24/7 availability." />
        <meta name="twitter:image" content={ogImage} />
      </Helmet>
      
      <Navbar />
      
      <div className="flex-grow pt-28 pb-16 px-4">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">Book a Service</h1>
            <p className="text-gray-600 text-sm">Fill in the details below to schedule your appointment.</p>
          </div>

          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden max-w-[500px] mx-auto"
          >
            {/* Info Box */}
            <div className="bg-[#DBEAFE] border-l-4 border-[#06B6D4] px-6 py-4 flex items-start gap-3">
               <Info className="w-5 h-5 text-[#06B6D4] mt-0.5 shrink-0" />
               <p className="text-sm text-blue-900">
                 The nearest available staff will be assigned automatically based on your location.
               </p>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-5">
               
               {/* Emergency Checkbox */}
               <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                  <label className="flex items-start gap-3 cursor-pointer">
                     <input 
                        type="checkbox" 
                        className="mt-1 w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                        checked={formData.isEmergency}
                        onChange={(e) => setFormData({...formData, isEmergency: e.target.checked, urgencyLevel: e.target.checked ? 'High' : 'Normal'})}
                     />
                     <div>
                        <span className="block font-bold text-gray-900 text-sm">This is an emergency</span>
                        <span className="text-xs text-gray-500">Prioritize my request for immediate attention.</span>
                     </div>
                  </label>
               </div>

               {/* Personal Info */}
               <div className="space-y-4">
                  <div>
                     <label className="block text-sm font-semibold text-gray-700 mb-1.5">Patient Name <span className="text-red-500">*</span></label>
                     <input 
                        type="text" 
                        className={`input-field ${errors.patientName ? 'border-red-300' : ''}`}
                        placeholder="Full Name"
                        value={formData.patientName}
                        onChange={(e) => setFormData({...formData, patientName: e.target.value})}
                     />
                     {errors.patientName && <p className="text-xs text-red-500 mt-1">{errors.patientName}</p>}
                  </div>

                  <div>
                     <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mobile Number <span className="text-red-500">*</span></label>
                     <input 
                        type="tel" 
                        className={`input-field ${errors.mobileNumber ? 'border-red-300' : ''}`}
                        placeholder="10-digit number"
                        value={formData.mobileNumber}
                        onChange={(e) => setFormData({...formData, mobileNumber: e.target.value})}
                        maxLength={10}
                     />
                     {errors.mobileNumber && <p className="text-xs text-red-500 mt-1">{errors.mobileNumber}</p>}
                  </div>
               </div>

               {/* Service & Shift */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                     <label className="block text-sm font-semibold text-gray-700 mb-1.5">Service Type</label>
                     <select 
                       className="input-field"
                       value={formData.serviceType}
                       onChange={(e) => setFormData({...formData, serviceType: e.target.value})}
                     >
                        <option>Nurse (12H)</option>
                        <option>Nurse (24H)</option>
                        <option>Doctor Consultation</option>
                        <option>Patient Attendant</option>
                        <option>Elderly Care</option>
                        <option>Maid/Housekeeping</option>
                     </select>
                  </div>
                  <div>
                     <label className="block text-sm font-semibold text-gray-700 mb-1.5">Shift Type</label>
                     <select 
                       className="input-field"
                       value={formData.shiftType}
                       onChange={(e) => setFormData({...formData, shiftType: e.target.value})}
                     >
                        <option>Day Shift</option>
                        <option>Night Shift</option>
                        <option>24 Hours</option>
                     </select>
                  </div>
               </div>

               {/* Dates */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                     <label className="block text-sm font-semibold text-gray-700 mb-1.5">Start Date <span className="text-red-500">*</span></label>
                     <input 
                        type="date" 
                        className={`input-field ${errors.startDate ? 'border-red-300' : ''}`}
                        min={new Date().toISOString().split('T')[0]}
                        value={formData.startDate}
                        onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                     />
                     {errors.startDate && <p className="text-xs text-red-500 mt-1">{errors.startDate}</p>}
                  </div>
                  <div>
                     <label className="block text-sm font-semibold text-gray-700 mb-1.5">End Date (Optional)</label>
                     <input 
                        type="date" 
                        className="input-field"
                        min={formData.startDate || new Date().toISOString().split('T')[0]}
                        value={formData.endDate}
                        onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                     />
                  </div>
               </div>

               {/* Location */}
               <div className="space-y-4">
                  <div>
                     <label className="block text-sm font-semibold text-gray-700 mb-1.5">Pincode <span className="text-red-500">*</span></label>
                     <input 
                        type="text" 
                        className={`input-field ${errors.pincode ? 'border-red-300' : ''}`}
                        placeholder="6-digit pincode"
                        maxLength={6}
                        value={formData.pincode}
                        onChange={(e) => setFormData({...formData, pincode: e.target.value})}
                     />
                     {errors.pincode && <p className="text-xs text-red-500 mt-1">{errors.pincode}</p>}
                  </div>

                  <div>
                     <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Address <span className="text-red-500">*</span></label>
                     <textarea 
                        className={`input-field min-h-[100px] resize-none ${errors.address ? 'border-red-300' : ''}`}
                        placeholder="House no, Building, Street, Landmark"
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                     ></textarea>
                     {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
                  </div>
               </div>
               
               {/* Special Instructions */}
               <div>
                   <label className="block text-sm font-semibold text-gray-700 mb-1.5">Special Instructions (Optional)</label>
                   <textarea 
                      className="input-field min-h-[80px] resize-none"
                      placeholder="Any specific medical conditions or needs..."
                      value={formData.specialInstructions}
                      onChange={(e) => setFormData({...formData, specialInstructions: e.target.value})}
                   ></textarea>
               </div>

               {/* Terms */}
               <div>
                  <label className="flex items-start gap-3 cursor-pointer group">
                     <input 
                        type="checkbox" 
                        className="mt-1 w-4 h-4 rounded border-gray-300 text-[#7C3AED] focus:ring-[#7C3AED]"
                        checked={formData.termsAccepted}
                        onChange={(e) => setFormData({...formData, termsAccepted: e.target.checked})}
                     />
                     <span className={`text-sm ${errors.termsAccepted ? 'text-red-500' : 'text-gray-600'}`}>
                        I agree to the Terms & Conditions and consent to the privacy policy.
                     </span>
                  </label>
               </div>

               <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full h-12 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl shadow-md text-lg font-bold mt-2"
               >
                  {loading ? (
                     <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processing...</>
                  ) : (
                     'Book Nurse'
                  )}
               </Button>
            </form>
          </motion.div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default BookNursePage;