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
    { name: 'About', path: '/#about' }, // Assuming About section on home or separate page if requested later
    { name: 'Contact', path: '/contact' }
  ];

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 h-[56px] md:h-[60px] flex items-center bg-white ${
        scrolled ? 'shadow-soft' : ''
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex justify-between items-center h-full">
          {/* Logo Section */}
          <Logo />

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-sm font-medium transition-colors relative hover:text-[#7C3AED] ${
                  location.pathname === link.path ? 'text-[#7C3AED] font-semibold' : 'text-[#1F2937]'
                }`}
              >
                {link.name}
              </Link>
            ))}

            <Link to="/book">
              <Button 
                className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl px-6 py-2 h-10 font-semibold shadow-sm transition-all duration-200"
              >
                Book Now
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-[56px] right-0 bottom-0 w-[280px] bg-white shadow-xl z-40 border-l border-gray-100 md:hidden flex flex-col"
          >
            <div className="px-5 py-6 space-y-4 flex flex-col h-full overflow-y-auto">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`block px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                    location.pathname === link.path 
                      ? 'bg-purple-50 text-[#7C3AED] font-semibold' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <div className="mt-auto pb-8 space-y-3 px-2">
                 <Link to="/book" onClick={() => setIsOpen(false)} className="block w-full">
                   <Button className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl py-6 text-lg font-bold shadow-md">
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