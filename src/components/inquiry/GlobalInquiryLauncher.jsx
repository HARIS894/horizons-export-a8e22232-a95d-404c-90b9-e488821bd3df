import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CalendarHeart, FileText, ShieldCheck, X } from 'lucide-react';
import InquiryForm from '@/components/inquiry/InquiryForm';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { onOpenInquiryRequest, requestOpenInquiry } from '@/utils/inquiryUtils';

const GlobalInquiryLauncher = () => {
  const [open, setOpen] = useState(false);
  const [prefill, setPrefill] = useState({});
  const [showHint, setShowHint] = useState(true);

  useEffect(() => {
    const unsubscribe = onOpenInquiryRequest((detail) => {
      setPrefill(detail.prefill || {});
      setOpen(true);
    });

    const timer = setTimeout(() => setShowHint(false), 7000);
    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  return (
    <>
      <div className="fixed bottom-6 left-6 z-[130] flex max-w-[250px] flex-col items-start gap-3">
        <AnimatePresence>
          {showHint ? (
            <motion.div initial={{ opacity: 0, x: -12, scale: 0.96 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: -12, scale: 0.96 }} className="relative rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 shadow-[0_18px_50px_rgba(15,23,42,0.12)] backdrop-blur">
              <button type="button" className="absolute right-2 top-2 rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700" onClick={() => setShowHint(false)} aria-label="Dismiss inquiry hint">
                <X className="h-3.5 w-3.5" />
              </button>
              <p className="pr-5 text-sm font-semibold text-slate-900">Need coordinated healthcare support?</p>
              <p className="mt-1 text-xs leading-6 text-slate-500">Open the care inquiry form from anywhere and share reports, timing and medical context in one place.</p>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <Button type="button" onClick={() => requestOpenInquiry()} className="h-auto rounded-full bg-[linear-gradient(135deg,_#7C3AED_0%,_#0EA5E9_100%)] px-5 py-4 text-sm font-semibold text-white shadow-[0_20px_50px_rgba(124,58,237,0.32)] hover:opacity-95">
            <CalendarHeart className="mr-2 h-4 w-4" /> Open Care Inquiry
          </Button>
        </motion.div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[92vh] max-w-5xl overflow-y-auto rounded-[2rem] border border-slate-200 bg-[linear-gradient(180deg,_#f8fbff_0%,_#ffffff_100%)] p-0 shadow-[0_30px_90px_rgba(15,23,42,0.24)]">
          <div className="border-b border-slate-200 bg-white/90 px-6 py-5 backdrop-blur">
            <DialogHeader className="text-left">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#7C3AED]/15 bg-purple-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-[#7C3AED]">
                <ShieldCheck className="h-3.5 w-3.5" /> InstantCare Inquiry System
              </div>
              <DialogTitle className="text-2xl font-bold text-slate-900">Professional healthcare inquiry</DialogTitle>
              <DialogDescription className="max-w-2xl text-sm leading-7 text-slate-600">
                Share patient details, medical reports, preferred timing and location once. The same reusable payload is ready for admin review now and API integration later.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-500">
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2"><FileText className="h-3.5 w-3.5" /> Email and WhatsApp payloads included</span>
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2"><ShieldCheck className="h-3.5 w-3.5" /> No backend connection yet</span>
            </div>
          </div>
          <div className="p-6 sm:p-8">
            <InquiryForm
              source="global-inquiry-launcher"
              title="Create a care inquiry from any page"
              description="This form is available across the site for urgent requests, planned care setup, doctor coordination and report-based triage."
              hideContainer
              initialOverrides={prefill}
              onSubmitted={() => setPrefill({})}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GlobalInquiryLauncher;