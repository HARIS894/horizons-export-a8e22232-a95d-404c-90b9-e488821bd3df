import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Bot, CalendarDays, ChevronDown, MessageCircleMore, Phone, Send, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const questions = [
  { key: 'name', label: '1. What is your name?', type: 'text', placeholder: 'Enter your full name', required: true },
  { key: 'country', label: '2. Which country are you calling from?', type: 'text', placeholder: 'e.g. USA, UK, UAE, India', required: true },
  { key: 'patientLocation', label: '3. Where is the patient located?', type: 'text', placeholder: 'City or address', required: true },
  { key: 'pincode', label: '4. What is the pincode?', type: 'text', placeholder: 'Enter 6-digit pincode', required: true },
  { key: 'medicalCondition', label: '5. What is the medical condition?', type: 'text', placeholder: 'e.g. Cancer care, ICU recovery, stroke', required: true },
  { key: 'patientAge', label: '6. What is the patient age?', type: 'text', placeholder: 'e.g. 72', required: true },
  { key: 'emergency', label: '7. Is this an emergency?', type: 'select', options: ['No', 'Yes'], required: true },
  { key: 'homeNurseNeeded', label: '8. Do you need a home nurse?', type: 'select', options: ['No', 'Yes'], required: true },
  { key: 'doctorVisit', label: '9. Do you need a doctor visit?', type: 'select', options: ['No', 'Yes'], required: true },
  { key: 'preferredTime', label: '10. What is your preferred time?', type: 'text', placeholder: 'e.g. Today evening, tomorrow morning', required: true },
  { key: 'phone', label: '11. What is your phone number?', type: 'tel', placeholder: 'Enter phone number', required: true },
  { key: 'email', label: '12. What is your email address?', type: 'email', placeholder: 'Enter email address', required: true },
  { key: 'additionalNotes', label: '13. Any additional notes?', type: 'textarea', placeholder: 'Tell us more about the care requirement', required: false },
];

const HealthAIChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    country: '',
    patientLocation: '',
    pincode: '',
    medicalCondition: '',
    patientAge: '',
    emergency: 'No',
    homeNurseNeeded: 'No',
    doctorVisit: 'No',
    preferredTime: '',
    phone: '',
    email: '',
    additionalNotes: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const currentQuestion = questions[step];
  const progress = ((step + 1) / questions.length) * 100;

  const handleChange = (value) => {
    setFormData((prev) => ({ ...prev, [currentQuestion.key]: value }));
  };

  const goNext = () => {
    const value = formData[currentQuestion.key]?.toString().trim();
    if (currentQuestion.required && !value) return;

    if (step < questions.length - 1) {
      setStep((prev) => prev + 1);
      return;
    }

    setSubmitted(true);
  };

  const goBack = () => {
    if (step > 0) {
      setStep((prev) => prev - 1);
    }
  };

  const handleSubmit = () => {
    const message = [
      'Hello InstantCare, I would like to request a healthcare consultation.',
      '',
      `Name: ${formData.name || 'Not provided'}`,
      `Country: ${formData.country || 'Not provided'}`,
      `Patient Location: ${formData.patientLocation || 'Not provided'}`,
      `Pincode: ${formData.pincode || 'Not provided'}`,
      `Medical Condition: ${formData.medicalCondition || 'Not provided'}`,
      `Patient Age: ${formData.patientAge || 'Not provided'}`,
      `Emergency: ${formData.emergency || 'No'}`,
      `Home Nurse Needed: ${formData.homeNurseNeeded || 'No'}`,
      `Doctor Visit: ${formData.doctorVisit || 'No'}`,
      `Preferred Time: ${formData.preferredTime || 'Not provided'}`,
      `Phone: ${formData.phone || 'Not provided'}`,
      `Email: ${formData.email || 'Not provided'}`,
      `Additional Notes: ${formData.additionalNotes || 'Not provided'}`,
      '',
      'Please contact me with the next steps.',
    ].join('\n');

    const url = `https://wa.me/919876543210?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const resetAssistant = () => {
    setStep(0);
    setSubmitted(false);
    setFormData({
      name: '',
      country: '',
      patientLocation: '',
      pincode: '',
      medicalCondition: '',
      patientAge: '',
      emergency: 'No',
      homeNurseNeeded: 'No',
      doctorVisit: 'No',
      preferredTime: '',
      phone: '',
      email: '',
      additionalNotes: '',
    });
  };

  const renderInput = () => {
    if (currentQuestion.type === 'select') {
      return (
        <div className="grid gap-3 sm:grid-cols-2">
          {currentQuestion.options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => handleChange(option)}
              className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${formData[currentQuestion.key] === option ? 'border-[#7C3AED] bg-[#7C3AED] text-white' : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-[#7C3AED]/40 hover:bg-purple-50'}`}
            >
              {option}
            </button>
          ))}
        </div>
      );
    }

    if (currentQuestion.type === 'textarea') {
      return (
        <textarea
          value={formData[currentQuestion.key]}
          onChange={(event) => handleChange(event.target.value)}
          placeholder={currentQuestion.placeholder}
          rows={5}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none ring-0"
        />
      );
    }

    return (
      <input
        type={currentQuestion.type}
        value={formData[currentQuestion.key]}
        onChange={(event) => handleChange(event.target.value)}
        placeholder={currentQuestion.placeholder}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none ring-0"
      />
    );
  };

  return (
    <>
      {!isOpen && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          onClick={() => setIsOpen(true)}
          className="fixed bottom-24 right-6 z-[140] flex h-14 w-14 items-center justify-center rounded-full bg-[#7C3AED] text-white shadow-2xl transition-all hover:scale-110 hover:bg-[#6D28D9]"
        >
          <Bot className="h-8 w-8" />
        </motion.button>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            className="fixed bottom-6 right-6 z-[150] flex h-[680px] w-[92vw] max-w-[430px] flex-col overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_25px_80px_rgba(15,23,42,0.2)]"
          >
            <div className="flex items-center justify-between bg-gradient-to-r from-[#7C3AED] to-[#38BDF8] px-4 py-4 text-white">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-purple-100">Healthcare Lead Assistant</p>
                <h3 className="mt-1 text-lg font-semibold">One question at a time</h3>
              </div>
              <button type="button" onClick={() => setIsOpen(false)} className="rounded-full p-2 hover:bg-white/10">
                <ChevronDown className="h-5 w-5" />
              </button>
            </div>

            <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
              <div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-500">
                <span>Step {step + 1} of {questions.length}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-200">
                <div className="h-2 rounded-full bg-gradient-to-r from-[#7C3AED] to-[#38BDF8]" style={{ width: `${progress}%` }} />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-[linear-gradient(180deg,_#ffffff_0%,_#f8faff_100%)] p-4">
              {!submitted ? (
                <>
                  <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#7C3AED]">
                      <Sparkles className="h-4 w-4" />
                      InstantCare lead capture
                    </div>
                    <h4 className="text-lg font-semibold text-slate-900">{currentQuestion.label}</h4>
                    <div className="mt-4">{renderInput()}</div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3">
                    <Button type="button" variant="outline" className="rounded-full border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700" onClick={goBack} disabled={step === 0}>
                      <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                    <Button type="button" className="rounded-full bg-[#7C3AED] px-4 py-3 text-sm font-semibold text-white hover:bg-[#6D28D9]" onClick={goNext}>
                      {step < questions.length - 1 ? 'Next' : 'Send to WhatsApp'}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-4 text-emerald-700">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <Send className="h-4 w-4" />
                      Your enquiry is ready
                    </div>
                    <p className="mt-2 text-sm leading-7">We have gathered your details and are ready to send them to our care team.</p>
                  </div>

                  <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
                    <h4 className="text-lg font-semibold text-slate-900">Formatted WhatsApp Message</h4>
                    <pre className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-slate-600">{[
                      `Name: ${formData.name || 'Not provided'}`,
                      `Country: ${formData.country || 'Not provided'}`,
                      `Patient Location: ${formData.patientLocation || 'Not provided'}`,
                      `Pincode: ${formData.pincode || 'Not provided'}`,
                      `Medical Condition: ${formData.medicalCondition || 'Not provided'}`,
                      `Patient Age: ${formData.patientAge || 'Not provided'}`,
                      `Emergency: ${formData.emergency}`,
                      `Home Nurse Needed: ${formData.homeNurseNeeded}`,
                      `Doctor Visit: ${formData.doctorVisit}`,
                      `Preferred Time: ${formData.preferredTime || 'Not provided'}`,
                      `Phone: ${formData.phone || 'Not provided'}`,
                      `Email: ${formData.email || 'Not provided'}`,
                      `Additional Notes: ${formData.additionalNotes || 'Not provided'}`,
                    ].join('\n')}</pre>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-slate-200 bg-white p-4">
              {!submitted ? (
                <div className="flex flex-wrap gap-3">
                  <a href="tel:+919876543210" className="flex-1">
                    <Button type="button" variant="outline" className="w-full rounded-full border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700">
                      <Phone className="mr-2 h-4 w-4" /> Call Now
                    </Button>
                  </a>
                  <button type="button" onClick={() => navigate('/book')} className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                    <CalendarDays className="mr-2 inline h-4 w-4" /> Book Assessment
                  </button>
                  <button type="button" onClick={handleSubmit} className="flex-1 rounded-full bg-[#7C3AED] px-4 py-3 text-sm font-semibold text-white hover:bg-[#6D28D9]">
                    <MessageCircleMore className="mr-2 inline h-4 w-4" /> Talk to Advisor
                  </button>
                </div>
              ) : (
                <div className="flex flex-wrap gap-3">
                  <Button type="button" className="flex-1 rounded-full bg-[#7C3AED] px-4 py-3 text-sm font-semibold text-white hover:bg-[#6D28D9]" onClick={handleSubmit}>
                    <MessageCircleMore className="mr-2 inline h-4 w-4" /> Send to WhatsApp
                  </Button>
                  <Button type="button" variant="outline" className="flex-1 rounded-full border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700" onClick={resetAssistant}>
                    Start Again
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default HealthAIChatBot;