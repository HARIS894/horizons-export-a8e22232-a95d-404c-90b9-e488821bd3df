import React, { useState } from 'react';
import { PhoneCall, Clock, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { submitCallbackRequest } from '@/utils/contactSubmissionHandler';

const CallbackRequest = () => {
  const { toast } = useToast();
  const [phone, setPhone] = useState('');
  const [time, setTime] = useState('ASAP');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      toast({ title: "Invalid Phone", description: "Please enter a valid number.", variant: "destructive" });
      return;
    }

    setLoading(true);
    const result = await submitCallbackRequest(phone, time);
    setLoading(false);

    if (result.success) {
      setSuccess(true);
      toast({ title: "Request Received", description: "We will call you shortly." });
    } else {
      toast({ title: "Error", description: "Failed to submit request.", variant: "destructive" });
    }
  };

  if (success) {
    return (
      <div className="text-center py-6 bg-green-50 rounded-xl border border-green-100">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <Check className="w-6 h-6 text-green-600" />
        </div>
        <h4 className="font-bold text-green-800">Request Confirmed!</h4>
        <p className="text-sm text-green-600">Expecting call: {time}</p>
        <Button variant="link" onClick={() => setSuccess(false)} className="text-green-700 text-xs mt-2">Request another</Button>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
      <div className="flex items-center gap-2 mb-4 text-[#6B46C1]">
         <PhoneCall className="w-5 h-5" />
         <h4 className="font-bold">Request a Callback</h4>
      </div>
      <p className="text-sm text-gray-500 mb-4">Too busy to call? We'll call you.</p>
      
      <form onSubmit={handleSubmit} className="space-y-3">
         <input 
            type="tel" 
            placeholder="Your Phone Number" 
            className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#6B46C1] outline-none"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
         />
         <div className="relative">
            <Clock className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" />
            <select 
               className="w-full p-2 pl-9 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#6B46C1] outline-none"
               value={time}
               onChange={(e) => setTime(e.target.value)}
            >
               <option value="ASAP">Call me ASAP</option>
               <option value="Morning">Morning (9 AM - 12 PM)</option>
               <option value="Afternoon">Afternoon (12 PM - 5 PM)</option>
               <option value="Evening">Evening (5 PM - 9 PM)</option>
            </select>
         </div>
         <Button type="submit" className="w-full bg-[#6B46C1] hover:bg-[#5a3da4] text-white" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin"/> : 'Schedule Call'}
         </Button>
      </form>
    </div>
  );
};

export default CallbackRequest;