import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { 
  Clock, Heart, User, Activity, CheckCircle, 
  ChevronDown, ChevronUp, Stethoscope, Zap
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';

const ServicesPage = () => {
  const [expandedId, setExpandedId] = useState(null);
  const ogImage = "https://horizons-cdn.hostinger.com/a8e22232-a95d-404c-90b9-e488821bd3df/e5cc0df1efbb4be6faf5d180e168f0cb.jpg";

  const services = [
    { 
      id: 1, 
      title: "Nurse at Home (12H)", 
      icon: Clock,
      shortDesc: "Professional nursing care for 12-hour shifts, ideal for day or night monitoring.",
      fullDesc: "Dedicated nursing support for 12-hour shifts. Perfect for post-operative recovery, chronic illness management, and medication administration during the day or night.",
      features: ["Vital signs monitoring", "Medication administration", "Wound dressing", "Injection service"],
      shifts: ["Day Shift (8AM - 8PM)", "Night Shift (8PM - 8AM)"],
      pricing: "Contact for pricing"
    },
    { 
      id: 2, 
      title: "Nurse at Home (24H)", 
      icon: Heart,
      shortDesc: "Round-the-clock nursing support for critical patients requiring constant care.",
      fullDesc: "24/7 continuous nursing care for patients who need constant medical attention. Includes ICU-level care at home with dedicated staff rotation.",
      features: ["24/7 Monitoring", "ICU-level care", "Emergency management", "Detailed daily reports"],
      shifts: ["24 Hours (Resident Nurse)"],
      pricing: "Contact for pricing"
    },
    { 
      id: 3, 
      title: "Elderly Care", 
      icon: User,
      shortDesc: "Compassionate companionship and daily living assistance for seniors.",
      fullDesc: "Dedicated caregivers to help your elderly loved ones with daily activities, ensuring they live with dignity, hygiene, and comfort in their own homes.",
      features: ["Bathing & Grooming", "Mobility assistance", "Medication reminders", "Companionship"],
      shifts: ["12 Hours", "24 Hours"],
      pricing: "Contact for pricing"
    },
    { 
      id: 4, 
      title: "Patient Attendant", 
      icon: Activity,
      shortDesc: "Trained attendants for bedridden patients needing mobility and hygiene support.",
      fullDesc: "Trained attendants for patients who need assistance with basic needs like feeding, sponging, changing diapers, and moving around the house.",
      features: ["Sponge bath", "Diaper changing", "Feeding assistance", "Walking support"],
      shifts: ["12 Hours", "24 Hours"],
      pricing: "Contact for pricing"
    },
    { 
      id: 5, 
      title: "Post Hospital Care", 
      icon: Stethoscope,
      shortDesc: "Seamless transition medical support after hospital discharge.",
      fullDesc: "Bridge the gap between hospital and home. We follow discharge summaries to provide the exact medical care and rehabilitation exercises prescribed by doctors.",
      features: ["Discharge summary follow-up", "Rehabilitation", "Doctor coordination", "Recovery tracking"],
      shifts: ["Customizable"],
      pricing: "Contact for pricing"
    },
    { 
      id: 6, 
      title: "Emergency Healthcare", 
      icon: Zap,
      shortDesc: "Immediate dispatch of nurses for urgent medical situations.",
      fullDesc: "Rapid response team for urgent requirements. We dispatch the nearest available nurse to stabilize the patient and provide first aid or urgent care.",
      features: ["Rapid response", "First aid", "Vitals stabilization", "Doctor connect"],
      shifts: ["On-Demand"],
      pricing: "Standard Emergency Fee"
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFB] font-sans">
      <Helmet>
        <title>Our Services – InstantCare Home Healthcare</title>
        <meta name="description" content="Explore our wide range of home healthcare services including Nurse at Home (12H/24H), Elderly Care, Patient Attendant, Post Hospital Care, and Emergency Healthcare." />
        
        {/* Open Graph */}
        <meta property="og:title" content="Our Services – InstantCare Home Healthcare" />
        <meta property="og:description" content="Professional nursing, elderly care, and patient attendant services at your doorstep." />
        <meta property="og:url" content="https://instantcare.in/services" />
        <meta property="og:image" content={ogImage} />
        <meta property="og:type" content="website" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Our Services – InstantCare Home Healthcare" />
        <meta name="twitter:description" content="Professional nursing, elderly care, and patient attendant services at your doorstep." />
        <meta name="twitter:image" content={ogImage} />
      </Helmet>
      
      <Navbar />
      
      {/* Header */}
      <div className="bg-white pt-32 pb-16 px-4 text-center border-b border-gray-100">
         <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">Our Services</h1>
         <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Professional healthcare services tailored for you and your family.
         </p>
      </div>

      {/* Grid */}
      <div className="container-custom py-16">
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
               <motion.div 
                 key={service.id}
                 layout
                 className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden hover:shadow-hover hover:-translate-y-1 transition-all duration-300"
               >
                  <div className="p-8">
                     <div className="w-14 h-14 bg-purple-50 rounded-xl flex items-center justify-center mb-6 text-[#7C3AED]">
                        <service.icon className="w-7 h-7" />
                     </div>
                     <h3 className="text-xl font-bold text-gray-900 mb-3">{service.title}</h3>
                     <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                        {service.shortDesc}
                     </p>
                     
                     <div className="space-y-3 mb-8">
                        {service.features.map((f, i) => (
                           <div key={i} className="flex items-center gap-2 text-sm text-gray-500">
                              <CheckCircle className="w-4 h-4 text-green-500 shrink-0" /> {f}
                           </div>
                        ))}
                     </div>

                     <div className="flex gap-3">
                        <Link to="/book" className="flex-1">
                           <Button className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl font-semibold">
                              Book Now
                           </Button>
                        </Link>
                        <button 
                           onClick={() => setExpandedId(expandedId === service.id ? null : service.id)}
                           className="px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600 transition-colors text-sm font-medium flex items-center gap-2"
                        >
                           Learn More {expandedId === service.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                     </div>
                  </div>

                  <AnimatePresence>
                     {expandedId === service.id && (
                        <motion.div 
                           initial={{ height: 0, opacity: 0 }}
                           animate={{ height: "auto", opacity: 1 }}
                           exit={{ height: 0, opacity: 0 }}
                           className="border-t border-gray-100 bg-gray-50 px-8 py-6 text-sm"
                        >
                           <p className="text-gray-700 mb-4 leading-relaxed">{service.fullDesc}</p>
                           <div className="mb-2">
                              <span className="font-bold text-gray-900 block mb-2">Available Shifts:</span>
                              <div className="flex flex-wrap gap-2">
                                 {service.shifts.map((s, i) => (
                                    <span key={i} className="bg-white px-3 py-1 rounded-full border border-gray-200 text-xs font-medium text-gray-600">
                                       {s}
                                    </span>
                                 ))}
                              </div>
                           </div>
                        </motion.div>
                     )}
                  </AnimatePresence>
               </motion.div>
            ))}
         </div>
      </div>
      <Footer />
    </div>
  );
};

export default ServicesPage;