import React from 'react';
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import CallbackRequest from './CallbackRequest';

const SocialMediaSection = () => {
  const socials = [
    { icon: Facebook, name: "Facebook", link: "#", color: "hover:text-blue-600" },
    { icon: Twitter, name: "Twitter", link: "#", color: "hover:text-sky-500" },
    { icon: Instagram, name: "Instagram", link: "#", color: "hover:text-pink-600" },
    { icon: Linkedin, name: "LinkedIn", link: "#", color: "hover:text-blue-700" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
      <div className="bg-gradient-to-r from-[#6B46C1] to-[#06B6D4] rounded-2xl p-8 text-white shadow-lg">
        <h3 className="text-2xl font-bold mb-4">Connect With Us</h3>
        <p className="mb-8 opacity-90">Follow our social channels for health tips, company news, and community stories.</p>
        
        <div className="flex gap-4">
          {socials.map((social, idx) => (
            <a 
              key={idx} 
              href={social.link} 
              className={`w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white hover:scale-110 transition-all duration-300 group`}
              aria-label={social.name}
            >
              <social.icon className={`w-6 h-6 text-white group-hover:text-[#6B46C1]`} />
            </a>
          ))}
        </div>
        
        <div className="mt-8 pt-8 border-t border-white/20">
           <p className="text-sm opacity-75">Join our community of 50,000+ happy families.</p>
        </div>
      </div>

      <div>
         <CallbackRequest />
      </div>
    </div>
  );
};

export default SocialMediaSection;