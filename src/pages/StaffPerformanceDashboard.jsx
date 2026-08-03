import React from 'react';
import { TrendingUp, Users, Star, Clock } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const StaffPerformanceDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
         <h1 className="text-3xl font-bold text-gray-900 mb-8">Performance Analytics</h1>
         
         {/* KPI Cards */}
         <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
               <div className="flex justify-between items-start mb-4">
                  <div>
                     <p className="text-gray-500 text-sm">Avg Rating</p>
                     <h3 className="text-3xl font-bold text-gray-900">4.8</h3>
                  </div>
                  <div className="p-2 bg-yellow-100 rounded-lg text-yellow-600">
                     <Star className="w-6 h-6" />
                  </div>
               </div>
               <p className="text-sm text-green-600 flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" /> +0.2 this month
               </p>
            </div>
            {/* ... other cards placeholder ... */}
             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
               <div className="flex justify-between items-start mb-4">
                  <div>
                     <p className="text-gray-500 text-sm">Jobs Done</p>
                     <h3 className="text-3xl font-bold text-gray-900">1,240</h3>
                  </div>
                  <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                     <Users className="w-6 h-6" />
                  </div>
               </div>
            </div>
         </div>

         {/* Chart Placeholders */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-80 flex items-center justify-center">
               <p className="text-gray-400">Bookings Trend Chart Placeholder</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-80 flex items-center justify-center">
               <p className="text-gray-400">Customer Satisfaction Chart Placeholder</p>
            </div>
         </div>
      </div>
      <Footer />
    </div>
  );
};

export default StaffPerformanceDashboard;