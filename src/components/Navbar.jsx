import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Logo from './Logo';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
    { name: 'Healthcare Library', path: '/healthcare-library' },
    { name: 'Contact', path: '/contact' }
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'shadow-[0_10px_30px_rgba(124,58,237,0.12)]' : 'shadow-none'
      }`}
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className={`mt-3 rounded-full border border-white/70 bg-white/80 px-3 py-2 shadow-[0_10px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl transition-all duration-300 md:px-4 ${scrolled ? 'shadow-[0_16px_45px_rgba(124,58,237,0.14)]' : ''}`}>
          <div className="flex h-[54px] items-center justify-between md:h-[60px]">
            <Logo />

            <div className="hidden items-center gap-2 md:flex">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path || (link.path === '/#about' && location.pathname === '/');

                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`relative rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 hover:text-[#7C3AED] ${
                      isActive ? 'text-[#7C3AED]' : 'text-slate-700'
                    }`}
                  >
                    <span className="relative z-10">{link.name}</span>
                    {isActive && (
                      <span className="absolute inset-0 rounded-full bg-purple-100/80" />
                    )}
                  </Link>
                );
              })}

              <Link to="/book" className="ml-2">
                <Button className="h-10 rounded-full bg-[#7C3AED] px-6 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(124,58,237,0.25)] transition-all duration-200 hover:bg-[#6D28D9] hover:shadow-[0_12px_30px_rgba(124,58,237,0.3)]">
                  Book Now
                </Button>
              </Link>
            </div>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white/80 text-slate-700 transition-all duration-200 hover:border-[#7C3AED]/30 hover:bg-purple-50 hover:text-[#7C3AED] md:hidden"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', stiffness: 280, damping: 26 }}
            className="fixed right-0 top-[74px] bottom-0 z-40 w-[285px] border-l border-purple-100 bg-white/95 shadow-[0_20px_60px_rgba(15,23,42,0.16)] backdrop-blur-xl md:hidden"
          >
            <div className="flex h-full flex-col overflow-y-auto px-5 py-6">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path || (link.path === '/#about' && location.pathname === '/');

                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className={`mb-2 rounded-2xl px-4 py-3 text-base font-semibold transition-all duration-200 ${
                      isActive
                        ? 'bg-purple-50 text-[#7C3AED] shadow-sm'
                        : 'text-slate-700 hover:bg-slate-50 hover:text-[#7C3AED]'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}

              <div className="mt-auto space-y-3 px-1 pb-2">
                <Link to="/book" onClick={() => setIsOpen(false)} className="block w-full">
                  <Button className="w-full rounded-2xl bg-[#7C3AED] py-6 text-lg font-bold text-white shadow-[0_10px_25px_rgba(124,58,237,0.25)] hover:bg-[#6D28D9]">
                    Book Nurse Now
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;