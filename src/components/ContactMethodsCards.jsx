import React from 'react';
import { Phone, Mail, MessageCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const ContactMethodsCards = () => {
  const methods = [
    {
      icon: Phone,
      title: "Phone Support",
      desc: "Call us anytime for assistance",
      action: "Call Now",
      link: "tel:+911234567890",
      detail: "+91 12345 67890",
      status: "24/7 Available",
      color: "text-blue-600",
      bg: "bg-blue-50",
      btnVariant: "outline"
    },
    {
      icon: MessageCircle,
      title: "WhatsApp Chat",
      desc: "Chat with our support team",
      action: "Start Chat",
      link: "https://wa.me/911234567890",
      detail: "Usually replies in 5 mins",
      status: "Online Now",
      color: "text-green-600",
      bg: "bg-green-50",
      btnVariant: "outline"
    },
    {
      icon: Mail,
      title: "Email Support",
      desc: "Send us detailed queries",
      action: "Send Email",
      link: "mailto:support@instantcare.com",
      detail: "support@instantcare.com",
      status: "Replies within 2 hours",
      color: "text-purple-600",
      bg: "bg-purple-50",
      btnVariant: "outline"
    },
    {
      icon: AlertCircle,
      title: "Emergency",
      desc: "For medical emergencies",
      action: "Call Immediately",
      link: "tel:102",
      detail: "Priority Hotline: 102",
      status: "24/7 Critical Care",
      color: "text-red-600",
      bg: "bg-red-50",
      borderColor: "border-red-200",
      btnVariant: "destructive"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {methods.map((method, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`relative p-6 rounded-xl bg-white shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border ${method.borderColor || 'border-gray-100'}`}
        >
          <div className={`w-12 h-12 rounded-lg ${method.bg} flex items-center justify-center mb-4`}>
            <method.icon className={`w-6 h-6 ${method.color}`} />
          </div>
          
          <h3 className="text-lg font-bold text-gray-900 mb-2">{method.title}</h3>
          <p className="text-gray-500 text-sm mb-4">{method.desc}</p>
          
          <div className="mb-6">
             <p className="font-semibold text-gray-900">{method.detail}</p>
             <p className={`text-xs font-medium mt-1 ${method.color}`}>{method.status}</p>
          </div>

          <a href={method.link} target="_blank" rel="noreferrer">
            <Button className={`w-full group ${method.btnVariant === 'destructive' ? 'bg-red-600 hover:bg-red-700 text-white' : 'border-[#6B46C1] text-[#6B46C1] hover:bg-purple-50'}`} variant={method.btnVariant === 'destructive' ? 'default' : 'outline'}>
              {method.action}
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </a>
        </motion.div>
      ))}
    </div>
  );
};

export default ContactMethodsCards;