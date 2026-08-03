import React from 'react';
import { Link } from 'react-router-dom';

const Logo = ({ className = "" }) => {
  return (
    <Link to="/" className={`flex items-center gap-3 group no-underline ${className}`}>
      <img 
        src="https://horizons-cdn.hostinger.com/a8e22232-a95d-404c-90b9-e488821bd3df/e5cc0df1efbb4be6faf5d180e168f0cb.jpg" 
        alt="InstantCare Logo" 
        className="w-10 h-10 md:w-[50px] md:h-[50px] object-contain transition-transform duration-300 group-hover:scale-105"
      />
      <div className="flex flex-col">
        <span className="font-heading font-bold text-xl md:text-2xl text-gray-900 leading-none tracking-tight group-hover:text-[#7C3AED] transition-colors">
          INSTANT-CARE
        </span>
        <span className="text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-wide leading-none mt-0.5">
          Home Healthcare 24/7 Support & Coordination
        </span>
      </div>
    </Link>
  );
};

export default Logo;