import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Phone, CheckCircle2, MapPin, ShieldCheck, Clock3 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const HeroSection = ({ onFindNearby }) => {
  const trustPoints = [
    '100% Verified Nurses',
    '24/7 Emergency Support',
    'PAN India Care Coverage'
  ];

  const stats = [
    { value: '5K+', label: 'Verified Professionals' },
    { value: '24/7', label: 'Rapid Response' },
    { value: '4.9/5', label: 'Patient Rating' }
  ];

  return (
    <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(124,58,237,0.12),_transparent_38%),linear-gradient(135deg,_rgba(124,58,237,0.06)_0%,_rgba(255,255,255,1)_100%)] py-20 sm:py-24 lg:py-32">
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(124,58,237,0.03)_1px,transparent_1px),linear-gradient(180deg,rgba(124,58,237,0.03)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
      <div className="container-custom relative z-10">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="order-2 text-center lg:order-1 lg:text-left"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-[#7C3AED]/20 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#7C3AED] shadow-sm backdrop-blur">
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[#7C3AED]" />
              Premium Home Healthcare
            </div>

            <h1 className="mt-6 text-4xl font-bold leading-[1.08] tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              Premium <span className="text-[#7C3AED]">Nursing Care</span> and
              <br className="hidden lg:block" />
              Medical Support at Your Doorstep
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600 sm:text-xl lg:mx-0">
              From 24/7 nurse visits to ICU-level support, we deliver trusted, compassionate care for recovery, elder support and emergencies across India.
            </p>

            <div className="mx-auto mt-8 flex w-full max-w-xl flex-col gap-3 sm:mx-0 sm:flex-row lg:justify-start">
              <Link to="/book" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full rounded-xl bg-[#7C3AED] px-8 py-7 text-lg font-bold text-white shadow-lg shadow-purple-200 transition-all hover:bg-[#6D28D9] hover:shadow-xl sm:w-auto"
                >
                  Book Premium Care <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>

              <a
                href="https://wa.me/918976286053?text=Hi%20InstantCare%2C%20I%20need%20immediate%20healthcare%20service.%20Please%20help%21"
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto"
              >
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full rounded-xl border-[#7C3AED] bg-white px-8 py-7 text-lg font-bold text-[#7C3AED] shadow-sm transition-all hover:bg-purple-50 sm:w-auto"
                >
                  <Phone className="mr-2 h-5 w-5" /> WhatsApp Care Team
                </Button>
              </a>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <Button
                onClick={onFindNearby}
                variant="ghost"
                className="justify-center rounded-full border border-[#7C3AED]/20 bg-white/70 px-5 py-3 font-semibold text-[#7C3AED] shadow-sm backdrop-blur hover:bg-purple-50"
              >
                <MapPin className="mr-2 h-4 w-4" /> Find Nearby Nurse & Staff
              </Button>
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-x-5 gap-y-3 text-sm font-medium text-gray-600 lg:justify-start">
              {trustPoints.map((point) => (
                <div key={point} className="flex items-center gap-2 rounded-full bg-white/80 px-3 py-2 shadow-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  {point}
                </div>
              ))}
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {stats.map((item) => (
                <div key={item.label} className="rounded-2xl border border-purple-100 bg-white/90 px-4 py-4 text-center shadow-sm">
                  <p className="text-xl font-bold text-[#7C3AED]">{item.value}</p>
                  <p className="mt-1 text-sm text-gray-600">{item.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative order-1 flex justify-center lg:order-2"
          >
            <div className="relative w-full max-w-xl">
              <div className="absolute inset-0 -translate-x-4 -translate-y-4 rounded-[2rem] bg-[#7C3AED]/10 blur-3xl" />
              <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white p-3 shadow-[0_30px_90px_-20px_rgba(124,58,237,0.35)]">
                <img
                  src="https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                  alt="Professional nurse providing compassionate home healthcare support"
                  className="h-[420px] w-full rounded-[1.5rem] object-cover sm:h-[500px]"
                />
                <div className="absolute bottom-6 left-6 right-6 rounded-2xl border border-white/70 bg-white/90 p-4 shadow-lg backdrop-blur">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#7C3AED]">Trusted Care</p>
                      <p className="text-base font-semibold text-gray-900">Same-day nursing support with verified professionals</p>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
                      <ShieldCheck className="h-4 w-4" /> 4.9/5 Rated
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-6 -left-4 hidden rounded-2xl border border-gray-100 bg-white px-4 py-3 shadow-xl sm:flex sm:items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-[#7C3AED]">
                  <Clock3 className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Available 24/7</p>
                  <p className="text-sm text-gray-500">Rapid response for emergencies</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;