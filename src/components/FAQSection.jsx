import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, Search, HelpCircle } from 'lucide-react';

const faqs = [
  {
    question: "How quickly can you respond to emergencies?",
    answer: "We treat emergencies with the highest priority. For critical situations, our response team activates immediately, and we aim to dispatch the nearest medical professional within minutes. Our service is available 24/7."
  },
  {
    question: "What areas do you serve?",
    answer: "We currently serve major metropolitan areas including Bangalore, Delhi, Mumbai, Hyderabad, and Pune. We typically cover a radius of 15km from our city hubs to ensure quick response times."
  },
  {
    question: "How do I book a service?",
    answer: "You can book a service easily through our 'Smart Booking' form on the website, via our mobile app, or by calling our 24/7 hotline directly. We also offer WhatsApp booking for convenience."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit/debit cards, UPI (Google Pay, PhonePe, Paytm), Net Banking, and cash on service completion (for select services). Secure online payments are recommended for faster processing."
  },
  {
    question: "Is my medical information secure?",
    answer: "Absolutely. We are fully HIPAA compliant and use industry-standard encryption for all data transmission and storage. Your medical history and personal details are strictly confidential and shared only with your assigned healthcare provider."
  },
  {
    question: "Can I choose my preferred staff?",
    answer: "Yes! Our platform allows you to view profiles of available staff, including their experience, ratings, and specialties. You can request a specific professional, subject to their availability."
  }
];

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
           <HelpCircle className="w-6 h-6 text-[#6B46C1]" /> Frequently Asked Questions
        </h3>
        <div className="relative w-full md:w-64">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
           <input 
              type="text" 
              placeholder="Search FAQs..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#6B46C1]"
           />
        </div>
      </div>

      <div className="space-y-4">
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map((faq, index) => (
            <div 
              key={index}
              className="border border-gray-100 rounded-xl overflow-hidden hover:border-purple-100 transition-colors"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex justify-between items-center p-5 text-left bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <span className="font-semibold text-gray-900">{faq.question}</span>
                {openIndex === index ? (
                  <Minus className="w-5 h-5 text-[#6B46C1] shrink-0" />
                ) : (
                  <Plus className="w-5 h-5 text-gray-400 shrink-0" />
                )}
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="p-5 pt-0 bg-gray-50 text-gray-600 text-sm leading-relaxed border-t border-gray-100">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
             No matching FAQs found. Please contact support.
          </div>
        )}
      </div>

      <div className="mt-6 text-center">
        <a href="#" className="text-[#6B46C1] hover:underline text-sm font-medium">View Full FAQ Knowledge Base →</a>
      </div>
    </div>
  );
};

export default FAQSection;