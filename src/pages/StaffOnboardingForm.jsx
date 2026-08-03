import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle, Upload, Save } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FormStepIndicator from '@/components/ui/FormStepIndicator';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { createStaff } from '@/utils/staffUtils';

const StaffOnboardingForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const TOTAL_STEPS = 5;

  const [formData, setFormData] = useState({
    name: '', phone: '', email: '', photo: null,
    idType: 'Aadhaar', idNumber: '', idFile: null,
    qualification: '', experience: '', serviceTypes: [],
    shifts: [], pincodes: '',
    emergencyName: '', emergencyPhone: '', address: '', bankAccount: ''
  });

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'file') {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
    } else if (type === 'checkbox') {
      let updatedList = [...(formData[name] || [])];
      if (checked) updatedList.push(value);
      else updatedList = updatedList.filter(item => item !== value);
      setFormData(prev => ({ ...prev, [name]: updatedList }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
      // Auto-save logic could go here
    }
  };

  const validateStep = (step) => {
    // Basic validation implementation
    if (step === 1) {
      if (formData.name.length < 3) { toast({ title: "Error", description: "Name must be at least 3 chars", variant: "destructive" }); return false; }
      if (!/^[6-9]\d{9}$/.test(formData.phone)) { toast({ title: "Error", description: "Invalid Phone Number", variant: "destructive" }); return false; }
    }
    return true;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Convert Pincodes string to array
      const processedData = {
        ...formData,
        pincode_coverage: formData.pincodes.split(',').map(p => p.trim()),
        experience_years: parseInt(formData.experience) || 0,
        available_shifts: formData.shifts,
        service_types: formData.serviceTypes
        // Note: File uploads would need to be handled separately in a real app (upload to storage -> get URL)
      };

      await createStaff(processedData);
      
      toast({ title: "Registration Successful!", description: "Your profile is under verification." });
      navigate('/admin/login'); // Redirect to login or success page
    } catch (error) {
      toast({ title: "Submission Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Basic Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} className="p-3 border rounded-lg w-full" />
              <input type="tel" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} className="p-3 border rounded-lg w-full" />
              <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} className="p-3 border rounded-lg w-full" />
            </div>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">Upload Profile Photo</p>
              <input type="file" name="photo" onChange={handleChange} className="hidden" id="photo-upload" />
              <label htmlFor="photo-upload" className="absolute inset-0 cursor-pointer"></label>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">ID Verification</h2>
            <select name="idType" value={formData.idType} onChange={handleChange} className="p-3 border rounded-lg w-full">
              <option value="Aadhaar">Aadhaar Card</option>
              <option value="PAN">PAN Card</option>
              <option value="VoterID">Voter ID</option>
            </select>
            <input type="text" name="idNumber" placeholder="ID Number" value={formData.idNumber} onChange={handleChange} className="p-3 border rounded-lg w-full" />
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">Upload ID Proof (Front & Back)</p>
            </div>
          </div>
        );
      case 3:
         return (
            <div className="space-y-4">
               <h2 className="text-xl font-semibold">Professional Info</h2>
               <div className="grid grid-cols-2 gap-4">
                  <input type="text" name="qualification" placeholder="Qualification (e.g., B.Sc Nursing)" value={formData.qualification} onChange={handleChange} className="p-3 border rounded-lg w-full" />
                  <input type="number" name="experience" placeholder="Exp (Years)" value={formData.experience} onChange={handleChange} className="p-3 border rounded-lg w-full" />
               </div>
               <div className="space-y-2">
                  <label className="font-medium">Service Types</label>
                  <div className="grid grid-cols-2 gap-2">
                     {['Nurse', 'Attendant', 'Elderly Care', 'Post-Surgery', 'Medical Support'].map(type => (
                        <label key={type} className="flex items-center space-x-2 p-2 border rounded hover:bg-gray-50">
                           <input type="checkbox" name="serviceTypes" value={type} checked={formData.serviceTypes.includes(type)} onChange={handleChange} />
                           <span>{type}</span>
                        </label>
                     ))}
                  </div>
               </div>
            </div>
         );
      case 4:
         return (
            <div className="space-y-4">
               <h2 className="text-xl font-semibold">Availability</h2>
               <div className="flex gap-4">
                  {['12 Hours', '24 Hours'].map(shift => (
                     <label key={shift} className="flex items-center space-x-2 p-3 border rounded-lg w-full cursor-pointer hover:bg-gray-50">
                        <input type="checkbox" name="shifts" value={shift} checked={formData.shifts.includes(shift)} onChange={handleChange} />
                        <span>{shift}</span>
                     </label>
                  ))}
               </div>
               <div>
                  <label className="block mb-2 font-medium">Service Pincodes (comma separated)</label>
                  <input type="text" name="pincodes" placeholder="560001, 560002..." value={formData.pincodes} onChange={handleChange} className="p-3 border rounded-lg w-full" />
               </div>
            </div>
         );
      case 5:
         return (
            <div className="space-y-4">
               <h2 className="text-xl font-semibold">Emergency & Address</h2>
               <input type="text" name="emergencyName" placeholder="Emergency Contact Name" value={formData.emergencyName} onChange={handleChange} className="p-3 border rounded-lg w-full" />
               <input type="tel" name="emergencyPhone" placeholder="Emergency Contact Phone" value={formData.emergencyPhone} onChange={handleChange} className="p-3 border rounded-lg w-full" />
               <textarea name="address" placeholder="Current Residential Address" value={formData.address} onChange={handleChange} className="p-3 border rounded-lg w-full" rows={3}></textarea>
               <input type="text" name="bankAccount" placeholder="Bank Account Number (Optional)" value={formData.bankAccount} onChange={handleChange} className="p-3 border rounded-lg w-full" />
            </div>
         );
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-24 pb-16 px-4 max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900">Join Our Care Team</h1>
            <p className="text-gray-600">Register as a healthcare professional</p>
          </div>

          <FormStepIndicator 
             currentStep={currentStep} 
             totalSteps={TOTAL_STEPS} 
             steps={[{title:'Basic'}, {title:'ID'}, {title:'Pro'}, {title:'Work'}, {title:'Extra'}]} 
          />

          <AnimatePresence mode="wait">
             <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="min-h-[300px]"
             >
                {renderStep()}
             </motion.div>
          </AnimatePresence>

          <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
             <Button variant="outline" onClick={() => setCurrentStep(p => Math.max(1, p-1))} disabled={currentStep === 1}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
             </Button>
             
             {currentStep < TOTAL_STEPS ? (
                <Button onClick={handleNext} className="bg-[#6B46C1] text-white">
                   Next <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
             ) : (
                <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-gradient-to-r from-[#6B46C1] to-[#06B6D4] text-white">
                   {isSubmitting ? 'Submitting...' : 'Submit Application'} <CheckCircle className="w-4 h-4 ml-2" />
                </Button>
             )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default StaffOnboardingForm;