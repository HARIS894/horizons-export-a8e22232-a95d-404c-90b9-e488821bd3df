import React from 'react';
import { Shield, Check, X, Eye } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';

const VerificationDashboard = () => {
  // Mock Data
  const pendingStaff = [
    { id: 1, name: 'Priya Sharma', docType: 'Nursing Certificate', submitted: '2 hours ago' },
    { id: 2, name: 'Amit Verma', docType: 'Aadhaar Card', submitted: '5 hours ago' },
    { id: 3, name: 'Sneha Gupta', docType: 'Background Check', submitted: '1 day ago' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Compliance & Verification</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Queue Column */}
           <div className="lg:col-span-2 space-y-6">
              <h2 className="font-semibold text-lg flex items-center gap-2">
                 <Shield className="w-5 h-5 text-[#6B46C1]" /> Pending Verifications ({pendingStaff.length})
              </h2>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                 {pendingStaff.map((item, index) => (
                    <div key={item.id} className={`p-6 flex items-center justify-between ${index !== pendingStaff.length -1 ? 'border-b border-gray-100' : ''}`}>
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                             {item.name[0]}
                          </div>
                          <div>
                             <h3 className="font-semibold text-gray-900">{item.name}</h3>
                             <p className="text-sm text-gray-500">{item.docType} • {item.submitted}</p>
                          </div>
                       </div>
                       <div className="flex gap-2">
                          <Button size="sm" variant="outline"><Eye className="w-4 h-4 mr-2" /> Review</Button>
                          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white"><Check className="w-4 h-4" /></Button>
                          <Button size="sm" variant="destructive"><X className="w-4 h-4" /></Button>
                       </div>
                    </div>
                 ))}
              </div>
           </div>

           {/* Stats Column */}
           <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                 <h3 className="font-semibold text-gray-900 mb-4">Verification Stats</h3>
                 <div className="space-y-4">
                    <div className="flex justify-between items-center">
                       <span className="text-gray-600">Verified this week</span>
                       <span className="font-bold text-green-600">24</span>
                    </div>
                    <div className="flex justify-between items-center">
                       <span className="text-gray-600">Rejected</span>
                       <span className="font-bold text-red-600">3</span>
                    </div>
                    <div className="flex justify-between items-center">
                       <span className="text-gray-600">Pending</span>
                       <span className="font-bold text-orange-600">12</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default VerificationDashboard;