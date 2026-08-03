import React from 'react';
import { motion } from 'framer-motion';
import { MousePointerClick, MapPin, UserCheck } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      id: 1,
      icon: MousePointerClick,
      title: "Choose Service",
      description: "Select the specific healthcare service you need from our options."
    },
    {
      id: 2,
      icon: MapPin,
      title: "Share Location & Pincode",
      description: "Provide your address so we can locate the nearest professional."
    },
    {
      id: 3,
      icon: UserCheck,
      title: "Nurse Assigned Near You",
      description: "Our system instantly assigns a verified professional to your location."
    }
  ];

  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="container-custom">
        <div className="text-center mb-20">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Simple 3-step process to get professional care at your doorstep.
          </p>
        </div>

        <div className="relative max-w-5xl mx-auto">
          {/* Connector Line (Desktop) */}
          <div className="hidden lg:block absolute top-[40px] left-[100px] right-[100px] h-0.5 bg-gray-200 z-0"></div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-8 relative z-10">
            {steps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                className="flex flex-col items-center text-center bg-white"
              >
                <div className="relative mb-8">
                  <div className="w-20 h-20 rounded-full bg-white border-4 border-[#7C3AED] flex items-center justify-center shadow-lg z-10 relative">
                    <span className="text-2xl font-bold text-[#7C3AED]">{step.id}</span>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {step.title}
                </h3>
                
                <p className="text-gray-600 leading-relaxed text-sm max-w-xs mx-auto">
                  {step.description}
                </p>

                <div className="mt-6 w-12 h-1 bg-purple-100 rounded-full"></div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;