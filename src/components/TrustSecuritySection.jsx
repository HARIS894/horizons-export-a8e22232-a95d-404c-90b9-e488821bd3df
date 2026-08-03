import React from 'react';
import { ShieldCheck, Lock, Award, Clock } from 'lucide-react';

const TrustSecuritySection = () => {
  const badges = [
    { 
      icon: ShieldCheck, 
      title: "HIPAA Compliant", 
      desc: "Meets international privacy standards",
      color: "text-blue-600", 
      bg: "bg-blue-50" 
    },
    { 
      icon: Lock, 
      title: "Encrypted Data", 
      desc: "256-bit SSL secure transmission",
      color: "text-green-600", 
      bg: "bg-green-50" 
    },
    { 
      icon: Award, 
      title: "Verified Provider", 
      desc: "Background checked staff only",
      color: "text-purple-600", 
      bg: "bg-purple-50" 
    },
    { 
      icon: Clock, 
      title: "24/7 Support", 
      desc: "Always here when you need us",
      color: "text-orange-600", 
      bg: "bg-orange-50" 
    },
  ];

  return (
    <div className="py-8 border-t border-gray-100">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {badges.map((badge, index) => (
          <div key={index} className="flex flex-col items-center text-center p-4 rounded-xl hover:bg-gray-50 transition-colors">
            <div className={`w-12 h-12 rounded-full ${badge.bg} flex items-center justify-center mb-3`}>
              <badge.icon className={`w-6 h-6 ${badge.color}`} />
            </div>
            <h4 className="font-bold text-gray-900 text-sm mb-1">{badge.title}</h4>
            <p className="text-xs text-gray-500">{badge.desc}</p>
          </div>
        ))}
      </div>
      
      <div className="flex justify-center gap-6 mt-8 text-xs text-gray-400">
        <a href="#" className="hover:text-gray-600">Privacy Policy</a>
        <span>•</span>
        <a href="#" className="hover:text-gray-600">Terms of Service</a>
        <span>•</span>
        <a href="#" className="hover:text-gray-600">Patient Rights</a>
      </div>
    </div>
  );
};

export default TrustSecuritySection;