import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Phone, CheckCircle2, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

const HeroSection = ({ onFindNearby }) => {
  return (
    <section className="relative pt-28 pb-16 lg:pt-32 lg:pb-24 overflow-hidden bg-gradient-to-b from-purple-50/50 to-white">
      <div className="container-custom relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left order-2 lg:order-1"
          >
            <div className="inline-flex items-center gap-2 bg-purple-100 text-[#7C3AED] px-4 py-1.5 rounded-full text-xs font-bold mb-6 tracking-wide uppercase">
              <span className="w-2 h-2 rounded-full bg-[#7C3AED] animate-pulse"></span>
              Verified Home Healthcare
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-[1.15] tracking-tight">
  Complete <span className="text-[#7C3AED]">Healthcare</span>
  <br className="hidden lg:block" />
  At Your Doorstep
</h1>
            
            <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto lg:mx-0 font-light leading-relaxed">
              24/7 Nurses, Doctors, ICU Care, Physiotherapy, Lab Tests, Ambulance, Elder Care and Complete Home Healthcare Services across India.
            </p>

            <div className="flex flex-col gap-4 w-full max-w-md mx-auto lg:mx-0">
               <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center w-full">
                  <Link to="/book" className="w-full sm:w-auto">
                     <Button 
                        size="lg" 
                        className="w-full sm:w-auto bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl px-8 py-7 text-lg font-bold shadow-soft hover:shadow-lg transition-all"
                     >
                        Book Nurse Now <ArrowRight className="ml-2 w-5 h-5" />
                     </Button>
                  </Link>
                  <a href="https://wa.me/918976286053?text=Hi%20InstantCare%2C%20I%20need%20immediate%20healthcare%20service.%20Please%20help%21" target="_blank" rel="noreferrer" className="w-full sm:w-auto">
                     <Button 
                        variant="outline" 
                        size="lg" 
                        className="w-full sm:w-auto border-[#7C3AED] text-[#7C3AED] hover:bg-purple-50 bg-white rounded-xl px-8 py-7 text-lg font-bold shadow-sm"
                     >
                        <Phone className="mr-2 w-5 h-5" /> Call / WhatsApp Now
                     </Button>
                  </a>
               </div>
               
               <Button 
                  onClick={onFindNearby}
                  variant="outline" 
                  size="lg" 
                  className="w-full border-[#7C3AED] text-[#7C3AED] hover:bg-purple-50 bg-white/80 backdrop-blur-sm rounded-xl py-6 font-bold shadow-sm mt-1"
               >
                  <MapPin className="mr-2 w-5 h-5" /> Find Nearby Nurse & Staff
               </Button>
            </div>

            <div className="mt-10 flex flex-wrap justify-center lg:justify-start gap-x-6 gap-y-3 text-sm font-medium text-gray-500">
  <div className="flex items-center gap-2">
    <CheckCircle2 className="w-5 h-5 text-green-500" />
    100% Verified Nurses
  </div>

  <div className="flex items-center gap-2">
    <CheckCircle2 className="w-5 h-5 text-green-500" />
    24/7 Emergency Booking
  </div>

  <div className="flex items-center gap-2">
    <CheckCircle2 className="w-5 h-5 text-green-500" />
    PAN India Healthcare
  </div>
</div>
          </motion.div>
          {/* Hero Illustration */}
          <motion.div
             initial={{ opacity: 0, x: 30 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ duration: 0.6, delay: 0.2 }}
             className="relative order-1 lg:order-2 flex justify-center"
          >
             <div className="relative rounded-3xl overflow-hidden shadow-2xl max-w-md lg:max-w-full">
               <div className="absolute inset-0 bg-gradient-to-tr from-[#7C3AED]/20 to-transparent z-10 pointer-events-none mix-blend-multiply"></div>
               <img 
                 src="https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                 alt="Compassionate Nurse caring for patient" 
                 className="w-full h-auto object-cover transform hover:scale-105 transition-transform duration-700"
               />
             </div>
             {/* Floating Badge */}
             <div className="absolute -bottom-6 -left-6 lg:bottom-10 lg:-left-10 bg-white p-4 rounded-2xl shadow-xl border border-gray-100 z-20 hidden sm:block animate-bounce" style={{ animationDuration: '3s' }}>
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                      <CheckCircle2 className="w-6 h-6" />
                   </div>
                   <div>
                      <p className="font-bold text-gray-900">4.9/5 Rating</p>
                      <p className="text-xs text-gray-500">Trusted by 76+ Families</p>
                   </div>
                </div>
             </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;