import React from 'react';
import { motion } from 'framer-motion';
import { Clock3, HeartPulse, UserRound, Activity, Check, Stethoscope, ShieldCheck, Ambulance, FlaskConical, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const ServiceCards = () => {
  const services = [
    {
      icon: Clock3,
      title: 'Nurse at Home (12 Hours)',
      description: 'Dedicated nursing support for recovery, medication schedules, and post-procedure care with a focused 12-hour plan.',
      features: ['Vital Monitoring', 'Medication Support', 'Wound Care', 'Injection Service'],
      badge: '24×7 Available'
    },
    {
      icon: Clock3,
      title: 'Nurse at Home (24 Hours)',
      description: 'Round-the-clock care for patients needing continuous observation, comfort, and clinical attention at home.',
      features: ['Continuous Monitoring', 'ICU-Style Support', 'Emergency Response', 'Daily Clinical Updates'],
      badge: '24×7 Available'
    },
    {
      icon: Activity,
      title: 'ICU at Home',
      description: 'Specialized critical care support at home with advanced monitoring and expert medical coordination.',
      features: ['Critical Care', 'Equipment Setup', 'Doctor Coordination', 'Rapid Escalation'],
      badge: '24×7 Available'
    },
    {
      icon: HeartPulse,
      title: 'Elder Care',
      description: 'Compassionate senior care focused on mobility, hygiene, wellness, and emotional comfort in familiar surroundings.',
      features: ['Mobility Assistance', 'Hygiene Care', 'Nutrition Support', 'Companionship'],
      badge: '24×7 Available'
    },
    {
      icon: UserRound,
      title: 'Patient Attendant',
      description: 'Trained attendants for bedridden or recovering patients needing dependable daily support and repositioning.',
      features: ['Personal Care', 'Positioning Support', 'Basic Vitals', 'Walking Help'],
      badge: '24×7 Available'
    },
    {
      icon: Stethoscope,
      title: 'Doctor Visit',
      description: 'In-home doctor consultations for diagnosis, treatment guidance, and follow-up care without clinic travel.',
      features: ['Doctor Consultation', 'Prescription Support', 'Follow-Up Advice', 'Home Visits'],
      badge: '24×7 Available'
    },
    {
      icon: Ambulance,
      title: 'Ambulance',
      description: 'Emergency transportation with trained support for safe and timely hospital transfers.',
      features: ['Emergency Transfer', 'Safety Support', 'Bedside Handling', 'Hospital Coordination'],
      badge: '24×7 Available'
    },
    {
      icon: FlaskConical,
      title: 'Lab Tests',
      description: 'Convenient sample collection and diagnostic support in the privacy of your home.',
      features: ['Sample Collection', 'Fast Reporting', 'Home Convenience', 'Pathology Support'],
      badge: '24×7 Available'
    },
    {
      icon: ShieldCheck,
      title: 'Post Hospital Care',
      description: 'Seamless recovery support after discharge, designed to reduce complications and improve confidence at home.',
      features: ['Recovery Planning', 'Doctor Coordination', 'Rehab Guidance', 'Diet Monitoring'],
      badge: '24×7 Available'
    }
  ];

  return (
    <section id="services" className="bg-[linear-gradient(180deg,_#f8f5ff_0%,_#ffffff_100%)] py-20 sm:py-24 lg:py-28">
      <div className="container-custom">
        <div className="mx-auto mb-12 max-w-3xl text-center lg:mb-16">
          <span className="mb-3 block text-sm font-semibold uppercase tracking-[0.3em] text-[#7C3AED]">Our Expertise</span>
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
            Premium Healthcare Services at Home
          </h2>
          <p className="text-lg leading-8 text-gray-600 sm:text-xl">
            Trusted clinical support for recovery, elder care, emergencies and specialist treatment delivered with compassion.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08, duration: 0.45 }}
              whileHover={{ y: -6, scale: 1.01 }}
              className="flex h-full flex-col rounded-[1.75rem] border border-purple-100 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.06)] transition-all duration-300 hover:shadow-[0_24px_60px_rgba(124,58,237,0.14)] lg:p-7"
            >
              <div className="mb-5 flex items-start justify-between gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#A78BFA] text-white shadow-lg shadow-purple-100">
                  <service.icon className="h-7 w-7" strokeWidth={1.7} />
                </div>
                <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-green-700">
                  {service.badge}
                </span>
              </div>

              <h3 className="mb-3 text-xl font-bold text-gray-900">{service.title}</h3>
              <p className="mb-5 flex-grow text-sm leading-7 text-gray-600">{service.description}</p>

              <div className="mb-6 space-y-2.5">
                {service.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                    <Check className="h-4 w-4 shrink-0 text-green-500" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <div className="mt-auto flex items-center gap-3 border-t border-gray-100 pt-4">
                <Link to="/book" className="flex-1">
                  <Button className="w-full rounded-full bg-[#7C3AED] px-4 py-5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#6D28D9]">
                    Book Now
                  </Button>
                </Link>
                <Link to="/services" className="inline-flex items-center gap-1 text-sm font-semibold text-gray-600 transition-colors hover:text-[#7C3AED]">
                  Learn More <ArrowRight className="h-4 w-4" />
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