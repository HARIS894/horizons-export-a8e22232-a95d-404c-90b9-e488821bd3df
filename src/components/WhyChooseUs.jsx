import React from 'react';
import { motion } from 'framer-motion';
import { Clock, ShieldCheck, HeartHandshake, UserCheck, Banknote, History } from 'lucide-react';

const WhyChooseUs = () => {
  const features = [
    {
      icon: History,
      title: "Established in 2021",
      description: "Years of dedicated service providing reliable healthcare to families across major cities."
    },
    {
      icon: ShieldCheck,
      title: "Verified & Trained Staff",
      description: "Rigorous background checks and medical training for every nurse and caregiver."
    },
    {
      icon: Clock,
      title: "12/24 Hours Availability",
      description: "Flexible shift options to suit your specific care needs, day or night."
    },
    {
      icon: UserCheck,
      title: "Fast Coordination",
      description: "Quick turnaround time for staff assignment, often within hours of booking."
    },
    {
      icon: Banknote,
      title: "Transparent Pricing",
      description: "Clear, upfront costs with no hidden charges. Affordable quality care."
    },
    {
      icon: HeartHandshake,
      title: "Trusted by Families",
      description: "Thousands of satisfied families trust us with the health of their loved ones."
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Why Choose InstantCare?</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Serving families with trusted home healthcare since 2021. We prioritize safety, compassion, and professional excellence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="bg-white rounded-2xl p-8 border border-gray-100 shadow-soft hover:shadow-hover hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className="w-14 h-14 rounded-xl bg-purple-50 flex items-center justify-center mb-6 group-hover:bg-[#7C3AED] transition-colors duration-300">
                <feature.icon className="w-7 h-7 text-[#7C3AED] group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;