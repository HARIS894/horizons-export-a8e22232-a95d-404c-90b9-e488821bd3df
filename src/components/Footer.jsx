import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, Heart, Shield } from 'lucide-react';
import Logo from './Logo';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white text-gray-600 border-t border-gray-200">
      <div className="container-custom pt-12 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 mb-12">
          
          {/* Column 1: Brand & About */}
          <div className="space-y-6">
            <Logo />
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
              InstantCare connects you with verified and trained nursing professionals for reliable home healthcare services. Serving families with care since 2021.
            </p>
            <div className="flex gap-4">
               <div className="flex items-center gap-1.5 text-xs font-medium bg-green-50 text-green-700 px-3 py-1.5 rounded-full border border-green-100">
                  <Shield className="w-3.5 h-3.5" /> 100% Certified
               </div>
               <div className="flex items-center gap-1.5 text-xs font-medium bg-purple-50 text-purple-700 px-3 py-1.5 rounded-full border border-purple-100">
                  <Heart className="w-3.5 h-3.5" /> Verified Staff
               </div>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-gray-900 font-bold text-lg mb-6">Quick Links</h3>
            <ul className="space-y-3 text-sm">
              <li><Link to="/" className="hover:text-[#7C3AED] transition-colors block py-1">Home</Link></li>
              <li><Link to="/services" className="hover:text-[#7C3AED] transition-colors block py-1">Our Services</Link></li>
              <li><Link to="/book" className="hover:text-[#7C3AED] transition-colors block py-1">Book a Nurse</Link></li>
              <li><Link to="/contact" className="hover:text-[#7C3AED] transition-colors block py-1">Contact Us</Link></li>
              <li><Link to="/#about" className="hover:text-[#7C3AED] transition-colors block py-1">About Us</Link></li>
            </ul>
          </div>

          {/* Column 3: Services */}
          <div>
             <h3 className="text-gray-900 font-bold text-lg mb-6">Services</h3>
             <ul className="space-y-3 text-sm">
               <li><Link to="/services" className="hover:text-[#7C3AED] transition-colors block py-1">Nurse at Home (12/24H)</Link></li>
               <li><Link to="/services" className="hover:text-[#7C3AED] transition-colors block py-1">Elderly Care</Link></li>
               <li><Link to="/services" className="hover:text-[#7C3AED] transition-colors block py-1">Patient Attendant</Link></li>
               <li><Link to="/services" className="hover:text-[#7C3AED] transition-colors block py-1">Post Hospital Care</Link></li>
               <li><Link to="/services" className="hover:text-[#7C3AED] transition-colors block py-1">Baby Care & Mother Care</Link></li>
             </ul>
          </div>

          {/* Column 4: Contact Info */}
          <div>
            <h3 className="text-gray-900 font-bold text-lg mb-6">Contact Us</h3>
            <ul className="space-y-4 mb-6">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#7C3AED] mt-0.5 shrink-0" />
                <span className="text-sm text-gray-500 leading-relaxed">Near Fortis Hospital, Goregaon Link Road, Nahur West, Mumbai – 400078</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#7C3AED] shrink-0" />
                <a href="tel:+918948989353" className="text-sm text-gray-500 hover:text-[#7C3AED] transition-colors font-medium">+91 89489 89353</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#7C3AED] shrink-0" />
                <a href="mailto:instantnurseservice@gmail.com" className="text-sm text-gray-500 hover:text-[#7C3AED] transition-colors break-all">instantnurseservice@gmail.com</a>
              </li>
            </ul>
            
             <div className="flex gap-3">
               <a href="https://www.instagram.com/instantcare24_7/" target="_blank" rel="noreferrer" className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-[#7C3AED] hover:text-white transition-all text-gray-500">
                 <Instagram className="w-4 h-4" />
               </a>
               <a href="https://www.linkedin.com/in/instantcare-health-wealth-3516173a1/" target="_blank" rel="noreferrer" className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-[#7C3AED] hover:text-white transition-all text-gray-500">
                 <Linkedin className="w-4 h-4" />
               </a>
               <a href="#" className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-[#7C3AED] hover:text-white transition-all text-gray-500">
                 <Facebook className="w-4 h-4" />
               </a>
               <a href="#" className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-[#7C3AED] hover:text-white transition-all text-gray-500">
                 <Twitter className="w-4 h-4" />
               </a>
             </div>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
          <p>© {currentYear} InstantCare. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="#" className="hover:text-[#7C3AED] transition-colors">Privacy Policy</Link>
            <Link to="#" className="hover:text-[#7C3AED] transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;