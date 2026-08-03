import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Siren } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const EmergencyBanner = () => {
  return (
    <section className="bg-gradient-to-r from-red-600 via-orange-500 to-red-600 py-12 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          
          <div className="flex items-center gap-6">
            <div className="bg-white/20 p-4 rounded-full animate-pulse">
              <Siren className="w-10 h-10 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Need Immediate Care?</h2>
              <p className="text-red-100 text-lg">Our emergency response team is ready 24/7.</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <a href="tel:+911234567890" className="group">
              <Button size="lg" className="bg-white text-red-600 hover:bg-red-50 font-bold text-lg px-8 py-6 rounded-full w-full sm:w-auto">
                <Phone className="mr-2 w-5 h-5 group-hover:animate-wiggle" />
                Call +91-1234-567-890
              </Button>
            </a>
            <Link to="/emergency-booking">
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 hover:text-white font-bold text-lg px-8 py-6 rounded-full w-full sm:w-auto">
                Book Emergency
              </Button>
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
};

export default EmergencyBanner;