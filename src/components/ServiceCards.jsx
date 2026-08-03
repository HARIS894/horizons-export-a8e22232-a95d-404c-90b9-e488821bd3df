import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Heart, User, Activity, Check, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const ServiceCards = () => {
  const services = [
    {
      icon: Clock,
      title: 'Nurse at Home (12H)',
      description: 'Professional nursing care for 12-hour day or night shifts. Ideal for post-op recovery and medication management.',
      features: ['Vital Monitoring', 'Medication Management', 'Wound Dressing', 'Injection Service']
    },
    {
      icon: Clock,
      title: 'Nurse at Home (24H)',
      description: 'Round-the-clock nursing support for critical patients requiring continuous medical attention and monitoring.',
      features: ['24/7 Monitoring', 'ICU-level Care', 'Emergency Support', 'Daily Reports']
    },
    {
      icon: User,
      title: 'Elderly Care',
      description: 'Compassionate assistance for seniors with daily activities, hygiene, and companionship in their own homes.',
      features: ['Bathing & Hygiene', 'Mobility Support', 'Feeding Assistance', 'Companionship']
    },
    {
      icon: Activity,
      title: 'Patient Attendant',
      description: 'Trained attendants for bedridden or recovering patients needing help with basic needs and mobility.',
      features: ['Personal Hygiene', 'Position Changing', 'Basic Vitals', 'Walking Assistance']
    },
    {
      icon: Heart,
      title: 'Post Hospital Care',
      description: 'Seamless transition from hospital to home with professional medical support to prevent readmission.',
      features: ['Recovery Planning', 'Doctor Coordination', 'Rehabilitation', 'Diet Monitoring']
    },
    {
      icon: PlusCircle,
      title: 'Emergency Healthcare',
      description: 'Immediate nursing dispatch for urgent medical situations at home. Fast response guaranteed.',
      features: ['Rapid Response', 'First Aid', 'Vitals Stabilization', 'Doctor Connect']
    }
  ];

  return (
    <section id="services" className="py-24 bg-[#F8FAFB]">
      <div className="container-custom">
        <div className="text-center mb-16">
          <span className="text-[#7C3AED] font-bold text-sm uppercase tracking-wider block mb-2">Our Expertise</span>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">Comprehensive Healthcare Services</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Tailored medical care plans delivered by certified professionals in the comfort of your home.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="bg-white rounded-2xl p-6 lg:p-8 shadow-soft hover:shadow-hover hover:-translate-y-1 transition-all duration-300 border border-gray-100 flex flex-col h-full"
            >
              <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center mb-6 text-[#7C3AED]">
                <service.icon className="w-8 h-8" strokeWidth={1.5} />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {service.title}
              </h3>
              
              <p className="text-gray-600 mb-6 text-sm leading-relaxed flex-grow">
                {service.description}
              </p>

              <div className="space-y-2 mb-8">
                {service.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-500">
                    <Check className="w-4 h-4 text-green-500 shrink-0" /> {feature}
                  </div>
                ))}
              </div>
              
              <div className="flex items-center gap-4 mt-auto pt-4 border-t border-gray-50">
                <Link to="/book" className="flex-1">
                  <Button className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold">
                    Book Now
                  </Button>
                </Link>
                <Link to="/services" className="text-sm font-semibold text-gray-500 hover:text-[#7C3AED] transition-colors">
                  Learn More
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServiceCards;