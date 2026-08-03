import React from 'react';
import { Clock, Heart, Shield, Users } from 'lucide-react';

const ContactInformationSection = () => {
  const responseTimes = [
    { method: "Phone Support", time: "Immediate", bestFor: "Emergencies & Urgent Help", available: "24/7" },
    { method: "WhatsApp", time: "~5 Minutes", bestFor: "Quick Questions", available: "24/7" },
    { method: "Email", time: "< 2 Hours", bestFor: "Detailed Inquiries", available: "24/7" },
    { method: "Emergency Hotline", time: "Immediate", bestFor: "Medical Critical Care", available: "24/7" },
  ];

  return (
    <div className="space-y-8">
      {/* Response Time Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gray-50 p-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#6B46C1]" /> Response Times
          </h3>
          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Currently helping 42 customers
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-medium">
              <tr>
                <th className="p-4">Contact Method</th>
                <th className="p-4">Avg. Response</th>
                <th className="p-4 hidden sm:table-cell">Best For</th>
                <th className="p-4">Availability</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {responseTimes.map((item, i) => (
                <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4 font-medium text-gray-900">{item.method}</td>
                  <td className="p-4 text-[#6B46C1] font-semibold">{item.time}</td>
                  <td className="p-4 text-gray-500 hidden sm:table-cell">{item.bestFor}</td>
                  <td className="p-4 text-green-600 font-medium">{item.available}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Why Contact Us */}
      <div className="bg-gradient-to-br from-[#6B46C1]/5 to-[#06B6D4]/5 rounded-2xl p-8 border border-purple-100">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Why InstantCare?</h3>
        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-pink-500 shrink-0">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">We Care About You</h4>
              <p className="text-sm text-gray-600 mt-1">Your health and well-being are our top priorities. We treat every inquiry with compassion and urgency.</p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-blue-500 shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Safe & Confidential</h4>
              <p className="text-sm text-gray-600 mt-1">All your communications are encrypted and HIPAA compliant. Your privacy is guaranteed.</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-purple-500 shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Expert Support Team</h4>
              <p className="text-sm text-gray-600 mt-1">Our support staff are medically trained professionals ready to guide you to the right care.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactInformationSection;