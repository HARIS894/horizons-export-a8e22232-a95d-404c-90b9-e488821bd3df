import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

const LocationSection = () => {
  const cities = [
    "Delhi", "Mumbai", "Bangalore", "Hyderabad", 
    "Pune", "Ahmedabad", "Chennai", "Kolkata"
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          
          {/* Map Placeholder Side */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="w-full lg:w-1/2"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl h-[400px] bg-gray-200 border border-gray-300">
              {/* Fake Map Graphic */}
              <div className="absolute inset-0 bg-[#e5e7eb] flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-16 h-16 text-[#6B46C1] mx-auto mb-4 animate-bounce" />
                  <p className="text-gray-500 font-medium">Interactive Map Placeholder</p>
                </div>
              </div>
              
              {/* Overlay Card */}
              <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-white/50">
                <div className="flex items-center gap-3">
                  <div className="bg-[#06B6D4] p-2 rounded-lg">
                    <Search className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Find Care Near You</h4>
                    <p className="text-xs text-gray-600">Enter your pincode to check availability</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Text Content Side */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="w-full lg:w-1/2"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
              Serving Major Cities Across <span className="text-[#6B46C1]">India</span>
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              We are expanding rapidly to bring quality healthcare to every doorstep. Currently serving these major metropolitan areas with rapid response times.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-2 gap-4 mb-8">
              {cities.map((city, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#06B6D4]"></div>
                  <span className="text-gray-700 font-medium">{city}</span>
                </div>
              ))}
            </div>

            <Button className="bg-[#6B46C1] hover:bg-[#55389e] text-white px-8 py-6 rounded-lg shadow-lg shadow-purple-200">
              Check Availability
            </Button>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default LocationSection;