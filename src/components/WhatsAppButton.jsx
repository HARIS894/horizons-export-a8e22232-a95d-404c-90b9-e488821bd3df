import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X } from 'lucide-react';

const WhatsAppButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);

  // Show button after scrolling down a bit
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(true); // Always visible for easy access, but could toggle
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    
    // Auto-hide tooltip after 5 seconds
    const timer = setTimeout(() => {
      setShowTooltip(false);
    }, 5000);

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
      clearTimeout(timer);
    };
  }, []);

  const whatsappLink = "https://wa.me/918976286053?text=Hi%20InstantCare%2C%20I%20need%20immediate%20healthcare%20service.%20Please%20help%21";

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-2">
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white px-4 py-2 rounded-xl shadow-xl border border-gray-100 relative mr-2 mb-2 max-w-[200px]"
          >
            <button 
              onClick={(e) => { e.stopPropagation(); setShowTooltip(false); }}
              className="absolute -top-2 -right-2 bg-gray-100 rounded-full p-1 hover:bg-gray-200"
            >
              <X className="w-3 h-3 text-gray-500" />
            </button>
            <p className="text-sm font-semibold text-gray-800">Need help instantly?</p>
            <p className="text-xs text-gray-500">Chat with our 24/7 support team.</p>
            <div className="absolute bottom-[-6px] right-6 w-3 h-3 bg-white border-b border-r border-gray-100 transform rotate-45"></div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.a
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="relative group flex items-center justify-center w-14 h-14 bg-[#25D366] rounded-full shadow-lg hover:shadow-green-500/30 transition-all duration-300"
      >
        <MessageCircle className="w-8 h-8 text-white fill-current" />
        
        {/* Pulse Effect */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-75 animate-ping -z-10"></span>
        
        {/* Status Badge */}
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
        </div>

        {/* Hover Label */}
        <div className="absolute right-full mr-3 bg-gray-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          24/7 Available
        </div>
      </motion.a>
    </div>
  );
};

export default WhatsAppButton;