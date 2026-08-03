import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShieldCheck, MapPin, Phone, Mail, Calendar, Star, Clock, AlertTriangle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StaffStatusManager from '@/components/StaffStatusManager';
import { Button } from '@/components/ui/button';
import { getStaffById } from '@/utils/staffUtils';

const StaffProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [staff, setStaff] = useState(null);

  useEffect(() => {
    const fetchStaff = async () => {
      // For demo, if no ID provided or not found, just get the first one from mock
      const data = await getStaffById(id || 'mock-staff-1'); 
      setStaff(data);
    };
    fetchStaff();
  }, [id]);

  if (!staff) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
         <Button variant="ghost" className="mb-6" onClick={() => navigate(-1)}>← Back</Button>
         
         <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
            {/* Header Banner */}
            <div className="h-32 bg-gradient-to-r from-[#6B46C1] to-[#06B6D4]"></div>
            
            <div className="px-8 pb-8">
               <div className="relative flex justify-between items-end -mt-12 mb-6">
                  <div className="flex items-end gap-6">
                     <div className="relative">
                        <img src={staff.photo_url} alt={staff.name} className="w-32 h-32 rounded-xl border-4 border-white shadow-md object-cover bg-gray-200" />
                        {staff.verification_status === 'verified' && (
                           <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-1.5 rounded-full border-2 border-white" title="Verified Staff">
                              <ShieldCheck className="w-5 h-5" />
                           </div>
                        )}
                     </div>
                     <div className="mb-1">
                        <h1 className="text-3xl font-bold text-gray-900">{staff.name}</h1>
                        <p className="text-gray-500 flex items-center gap-2">
                           {staff.qualification} • {staff.experience_years} Years Experience
                        </p>
                     </div>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                     <StaffStatusManager staffId={staff.staff_id} currentStatus={staff.current_status} />
                     <div className="flex gap-2">
                        <Button variant="outline" size="sm">Edit Profile</Button>
                        <Button variant="destructive" size="sm">Block Staff</Button>
                     </div>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Left Col: Info */}
                  <div className="col-span-1 space-y-6">
                     <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                        <h3 className="font-semibold text-gray-900 mb-4">Contact Info</h3>
                        <ul className="space-y-3 text-sm">
                           <li className="flex items-center gap-3 text-gray-600">
                              <Phone className="w-4 h-4 text-[#6B46C1]" /> {staff.phone}
                           </li>
                           <li className="flex items-center gap-3 text-gray-600">
                              <Mail className="w-4 h-4 text-[#6B46C1]" /> {staff.email}
                           </li>
                           <li className="flex items-start gap-3 text-gray-600">
                              <MapPin className="w-4 h-4 text-[#6B46C1] mt-0.5" /> 
                              <span>Service Areas: {staff.pincode_coverage.join(', ')}</span>
                           </li>
                        </ul>
                     </div>

                     <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                        <h3 className="font-semibold text-gray-900 mb-4">Emergency Contact</h3>
                        <p className="text-sm font-medium">Mrs. Parent Name</p>
                        <p className="text-sm text-gray-500">Relation: Mother</p>
                        <p className="text-sm text-[#6B46C1] mt-1">+91 98765 43210</p>
                     </div>
                  </div>

                  {/* Right Col: Details */}
                  <div className="col-span-2 space-y-8">
                     {/* Performance Stats */}
                     <div className="grid grid-cols-3 gap-4">
                        <div className="p-4 border rounded-xl bg-purple-50 border-purple-100 text-center">
                           <div className="text-3xl font-bold text-[#6B46C1] mb-1">{staff.rating}</div>
                           <div className="flex justify-center mb-1">
                              {[1,2,3,4,5].map(i => <Star key={i} className={`w-3 h-3 ${i <= Math.round(staff.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />)}
                           </div>
                           <p className="text-xs text-gray-500">Average Rating</p>
                        </div>
                        <div className="p-4 border rounded-xl bg-blue-50 border-blue-100 text-center">
                           <div className="text-3xl font-bold text-blue-600 mb-1">{staff.completed_bookings}</div>
                           <p className="text-xs text-gray-500">Jobs Completed</p>
                        </div>
                        <div className="p-4 border rounded-xl bg-green-50 border-green-100 text-center">
                           <div className="text-3xl font-bold text-green-600 mb-1">100%</div>
                           <p className="text-xs text-gray-500">Response Rate</p>
                        </div>
                     </div>

                     {/* Services */}
                     <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-3">Service Expertise</h3>
                        <div className="flex flex-wrap gap-2">
                           {staff.service_types.map(tag => (
                              <span key={tag} className="px-3 py-1 bg-gray-100 rounded-full text-sm font-medium text-gray-700">
                                 {tag}
                              </span>
                           ))}
                        </div>
                     </div>

                     {/* Shifts */}
                     <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-3">Available Shifts</h3>
                        <div className="flex gap-4">
                           {staff.available_shifts.map(shift => (
                              <div key={shift} className="flex items-center gap-2 p-3 border rounded-lg bg-white shadow-sm">
                                 <Clock className="w-4 h-4 text-[#06B6D4]" />
                                 <span className="text-sm font-medium">{shift}</span>
                              </div>
                           ))}
                        </div>
                     </div>

                     {/* Recent Activity (Mock) */}
                     <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-3">Recent Activity</h3>
                        <div className="space-y-4">
                           <div className="flex gap-4 items-start pb-4 border-b border-gray-100">
                              <div className="p-2 bg-green-100 rounded-lg text-green-600">
                                 <CheckCircleSmall />
                              </div>
                              <div>
                                 <p className="font-medium text-gray-900">Completed 12hr Nursing Shift</p>
                                 <p className="text-sm text-gray-500">Patient: Rajesh Kumar • Yesterday</p>
                              </div>
                           </div>
                        </div>
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

// Helper icon
const CheckCircleSmall = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;

export default StaffProfilePage;