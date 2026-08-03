import React, { useState } from 'react';
import { Search, MapPin, Phone, Loader2, User, Clock, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

const NearbyNurseFinder = () => {
  const [pincode, setPincode] = useState('');
  const [loading, setLoading] = useState(false);
  const [nurses, setNurses] = useState([]);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setError(null);
    setSearched(false);
    setNurses([]);

    // Validation: 6 digits only
    if (!/^\d{6}$/.test(pincode)) {
      setError("Please enter a valid 6-digit pincode");
      return;
    }

    setLoading(true);

    try {
      const { data, error: apiError } = await supabase
        .from('nurses')
        .select('*')
        .eq('pincode', pincode)
        .eq('availability', true);

      if (apiError) throw apiError;

      setNurses(data || []);
      setSearched(true);
    } catch (err) {
      console.error("Search error:", err);
      setError("Unable to search. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="nearby-nurse" className="py-16 bg-[#F8FAFB]">
      <div className="container-custom mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Find Nearby Nurse & Staff</h2>
            <p className="text-gray-600">Enter your pincode to check real-time availability of healthcare professionals in your area.</p>
          </div>

          {/* Search Box */}
          <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100 mb-10">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-grow">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => {
                    // Allow only numbers and max 6 chars
                    const val = e.target.value.replace(/\D/g, '');
                    if (val.length <= 6) setPincode(val);
                  }}
                  placeholder="Enter 6-digit Pincode"
                  className="w-full pl-12 pr-4 h-12 rounded-lg border border-gray-200 focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 outline-none transition-all text-gray-900 placeholder:text-gray-400 font-medium"
                />
              </div>
              <Button 
                type="submit" 
                disabled={loading}
                className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white h-12 px-8 rounded-lg font-bold shadow-md min-w-[140px]"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Search className="w-4 h-4 mr-2" /> Search</>}
              </Button>
            </form>
            
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4" /> {error}
              </motion.div>
            )}
          </div>

          {/* Results Area */}
          <div className="min-h-[100px]">
            {loading && (
              <div className="flex justify-center py-12">
                <Loader2 className="w-10 h-10 text-[#7C3AED] animate-spin" />
              </div>
            )}

            {!loading && searched && nurses.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12 bg-white rounded-2xl border border-gray-100 shadow-sm p-8"
              >
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Staff Available Nearby</h3>
                <p className="text-gray-600 max-w-lg mx-auto leading-relaxed">
                  Nearby all nurses are with patients. No availability for today. Please submit your inquiry. In emergency, we will arrange staff as soon as available. Thank you for your patience.
                </p>
                <div className="mt-6">
                  <Button 
                    variant="outline"
                    onClick={() => window.location.href = '/contact'}
                    className="border-[#7C3AED] text-[#7C3AED] hover:bg-purple-50"
                  >
                    Submit Inquiry
                  </Button>
                </div>
              </motion.div>
            )}

            {!loading && searched && nurses.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {nurses.map((nurse) => (
                    <motion.div
                      key={nurse.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all group"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center text-[#7C3AED] font-bold text-lg">
                            {nurse.name ? nurse.name.charAt(0) : 'N'}
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900">{nurse.name || 'Available Nurse'}</h3>
                            <p className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full inline-block mt-1">
                              {nurse.role || 'Healthcare Staff'}
                            </p>
                          </div>
                        </div>
                        <span className="w-2.5 h-2.5 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                      </div>
                      
                      <div className="space-y-2 mb-5">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span>{nurse.pincode}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span>{nurse.shift || 'Available Now'}</span>
                        </div>
                      </div>

                      <a href={`tel:${nurse.phone}`}>
                        <Button className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-lg h-11 font-semibold shadow-sm group-hover:shadow-md transition-all">
                          <Phone className="w-4 h-4 mr-2" /> Call Now
                        </Button>
                      </a>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default NearbyNurseFinder;