import React from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, Heart, Shield } from 'lucide-react';
import Logo from './Logo';

const quickLinks = [
  { label: 'Home', to: '/' },
  { label: 'Our Services', to: '/services' },
  { label: 'Book a Nurse', to: '/book' },
  { label: 'Contact Us', to: '/contact' },
  { label: 'About Us', to: '/#about' },
];

const serviceLinks = [
  { label: 'Nurse at Home (12/24H)', to: '/services/home-nursing' },
  { label: 'Elderly Care', to: '/services/elder-care' },
  { label: 'Patient Attendant', to: '/services/patient-attendant' },
  { label: 'Post Hospital Care', to: '/services/post-discharge-care' },
  { label: 'Baby Care & Mother Care', to: '/services/mother-care' },
];

const linkBaseClass = 'group flex items-center justify-between rounded-2xl px-3 py-2 text-sm text-slate-600 transition-all hover:bg-white/80 hover:text-[#7C3AED]';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const location = useLocation();

  const isActiveLink = (to) => {
    if (to === '/#about') {
      return location.pathname === '/';
    }

    return location.pathname === to;
  };

  return (
    <footer className="relative overflow-hidden border-t border-slate-200 bg-[linear-gradient(180deg,_#f8faff_0%,_#ffffff_100%)] text-slate-600">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top_left,_rgba(124,58,237,0.14),_transparent_48%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.12),_transparent_40%)]" />
      <div className="container-custom relative pt-10 pb-8">
        <div className="rounded-[2rem] border border-slate-200/80 bg-white/90 p-8 shadow-[0_24px_70px_rgba(15,23,42,0.06)] backdrop-blur lg:p-10">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-[1.2fr_0.9fr_0.9fr_1fr] lg:gap-8 mb-12">
          
          {/* Column 1: Brand & About */}
          <div className="space-y-6">
            <Logo />
            <p className="max-w-sm text-sm leading-7 text-slate-600">
              InstantCare connects families with verified nursing professionals and dependable care coordination for premium home healthcare support.
            </p>
            <div className="flex flex-wrap gap-3">
               <div className="flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
                  <Shield className="w-3.5 h-3.5" /> 100% Certified
               </div>
               <div className="flex items-center gap-1.5 rounded-full border border-purple-100 bg-purple-50 px-3 py-1.5 text-xs font-medium text-purple-700">
                  <Heart className="w-3.5 h-3.5" /> Verified Staff
               </div>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="mb-5 text-lg font-bold text-slate-900">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => {
                const isActive = isActiveLink(link.to);

                return (
                  <li key={link.to}>
                    <NavLink
                      to={link.to}
                      className={`${linkBaseClass} ${isActive ? 'bg-purple-50 text-[#7C3AED] shadow-[inset_0_0_0_1px_rgba(124,58,237,0.10)]' : ''}`}
                    >
                      <span>{link.label}</span>
                      <span className={`text-xs uppercase tracking-[0.24em] transition-colors ${isActive ? 'text-[#7C3AED]/70' : 'text-slate-300 group-hover:text-[#7C3AED]/60'}`}>Go</span>
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Column 3: Services */}
          <div>
             <h3 className="mb-5 text-lg font-bold text-slate-900">Services</h3>
             <ul className="space-y-2">
               {serviceLinks.map((link) => (
                 <li key={link.to}>
                   <Link to={link.to} className={linkBaseClass}>
                     <span>{link.label}</span>
                     <span className="text-xs uppercase tracking-[0.24em] text-slate-300 transition-colors group-hover:text-[#7C3AED]/60">Open</span>
                   </Link>
                 </li>
               ))}
             </ul>
          </div>

          {/* Column 4: Contact Info */}
          <div>
            <h3 className="mb-5 text-lg font-bold text-slate-900">Contact Us</h3>
            <ul className="mb-6 space-y-4">
              <li className="flex items-start gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[#7C3AED]" />
                <span className="text-sm leading-7 text-slate-600">Near Fortis Hospital, Goregaon Link Road, Nahur West, Mumbai - 400078</span>
              </li>
              <li className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                <Phone className="h-5 w-5 shrink-0 text-[#7C3AED]" />
                <a href="tel:+918976286053" className="text-sm font-medium text-slate-600 transition-colors hover:text-[#7C3AED]">+91 89762 86053</a>
              </li>
              <li className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                <Mail className="h-5 w-5 shrink-0 text-[#7C3AED]" />
                <a href="mailto:support@instantcare.in" className="break-all text-sm text-slate-600 transition-colors hover:text-[#7C3AED]">support@instantcare.in</a>
              </li>
            </ul>
            
             <div className="flex gap-3">
               <a href="https://www.instagram.com/instantcare24_7/" target="_blank" rel="noreferrer" className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 transition-all hover:bg-[#7C3AED] hover:text-white">
                 <Instagram className="w-4 h-4" />
               </a>
               <a href="https://www.linkedin.com/in/instantcare-health-wealth-3516173a1/" target="_blank" rel="noreferrer" className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 transition-all hover:bg-[#7C3AED] hover:text-white">
                 <Linkedin className="w-4 h-4" />
               </a>
               <a href="#" className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 transition-all hover:bg-[#7C3AED] hover:text-white">
                 <Facebook className="w-4 h-4" />
               </a>
               <a href="#" className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 transition-all hover:bg-[#7C3AED] hover:text-white">
                 <Twitter className="w-4 h-4" />
               </a>
             </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-slate-100 pt-8 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
          <p>© {currentYear} InstantCare. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="#" className="transition-colors hover:text-[#7C3AED]">Privacy Policy</Link>
            <Link to="#" className="transition-colors hover:text-[#7C3AED]">Terms of Service</Link>
          </div>
        </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;