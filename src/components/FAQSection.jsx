import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, Search, HelpCircle } from 'lucide-react';
import { getFAQSchema } from '@/utils/seoUtils';

const defaultFaqs = [
  {
    question: 'How quickly can you respond to emergencies?',
    answer: 'We treat emergencies with the highest priority. For critical situations, our response team activates immediately, and we aim to dispatch the nearest medical professional within minutes. Our service is available 24/7.'
  },
  {
    question: 'What areas do you serve?',
    answer: 'We currently serve major metropolitan areas including Bangalore, Delhi, Mumbai, Hyderabad, and Pune. We typically cover a radius of 15km from our city hubs to ensure quick response times.'
  },
  {
    question: 'How do I book a service?',
    answer: "You can book a service easily through our 'Smart Booking' form on the website, via our mobile app, or by calling our 24/7 hotline directly. We also offer WhatsApp booking for convenience."
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit/debit cards, UPI (Google Pay, PhonePe, Paytm), Net Banking, and cash on service completion (for select services). Secure online payments are recommended for faster processing.'
  },
  {
    question: 'Is my medical information secure?',
    answer: 'Absolutely. We are fully HIPAA compliant and use industry-standard encryption for all data transmission and storage. Your medical history and personal details are strictly confidential and shared only with your assigned healthcare provider.'
  },
  {
    question: 'Can I choose my preferred staff?',
    answer: 'Yes! Our platform allows you to view profiles of available staff, including their experience, ratings, and specialties. You can request a specific professional, subject to their availability.'
  }
];

const FAQSection = ({
  items = defaultFaqs,
  title = 'Frequently Asked Questions',
  description = 'Helpful answers for families planning home healthcare support.',
  showSearch = true,
  className = ''
}) => {
  const [openIndex, setOpenIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFaqs = (items || []).filter((faq) =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const schema = getFAQSchema(filteredFaqs.length > 0 ? filteredFaqs : items);

  return (
    <div className={`rounded-[1.75rem] border border-gray-100 bg-white p-8 shadow-[0_16px_40px_rgba(15,23,42,0.05)] ${className}`}>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>

      <div className="mb-8 flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.3em] text-[#7C3AED]">
            <HelpCircle className="h-5 w-5" />
            FAQ
          </div>
          <h3 className="mt-3 text-2xl font-bold text-gray-900">{title}</h3>
          <p className="mt-2 text-sm leading-7 text-gray-600">{description}</p>
        </div>

        {showSearch && (
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search FAQs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-full border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-700 outline-none transition focus:border-[#7C3AED] focus:ring-2 focus:ring-purple-100"
            />
          </div>
        )}
      </div>

      <div className="space-y-4">
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map((faq, index) => (
            <div key={faq.question} className="overflow-hidden rounded-2xl border border-gray-100 transition-colors hover:border-purple-100">
              <button
                type="button"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="flex w-full items-center justify-between bg-slate-50 px-5 py-4 text-left transition-colors hover:bg-slate-100"
                aria-expanded={openIndex === index}
              >
                <span className="font-semibold text-gray-900">{faq.question}</span>
                {openIndex === index ? (
                  <Minus className="h-5 w-5 shrink-0 text-[#7C3AED]" />
                ) : (
                  <Plus className="h-5 w-5 shrink-0 text-gray-400" />
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
                    <div className="border-t border-gray-100 bg-white px-5 py-4 text-sm leading-7 text-gray-600">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))
        ) : (
          <div className="rounded-2xl bg-slate-50 py-8 text-center text-gray-500">
            No matching FAQs found. Please contact support.
          </div>
        )}
      </div>
    </div>
  );
};

export default FAQSection;