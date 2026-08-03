import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, MoreVertical, ShieldCheck, ShieldAlert, Eye, Edit, UserX } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StaffStatusManager from '@/components/StaffStatusManager';
import { Button } from '@/components/ui/button';
import { getStaffList } from '@/utils/staffUtils';

const StaffManagementDashboard = () => {
  const navigate = useNavigate();
  const [staffList, setStaffList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');

  useEffect(() => {
    loadStaff();
  }, []);

  const loadStaff = async () => {
    const data = await getStaffList();
    setStaffList(data);
  };

  const filteredStaff = staffList.filter(staff => {
    const matchesSearch = staff.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          staff.phone.includes(searchTerm);
    const matchesFilter = filterType === 'All' || staff.service_types.includes(filterType);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Staff Management</h1>
            <p className="text-gray-600">Manage your healthcare professionals</p>
          </div>
          <Button onClick={() => navigate('/staff/onboard')} className="bg-[#6B46C1] text-white">
             + Add New Staff
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
           <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-gray-500 text-sm font-medium">Total Staff</h3>
              <p className="text-2xl font-bold text-gray-900">{staffList.length}</p>
           </div>
           <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-gray-500 text-sm font-medium">Active Now</h3>
              <p className="text-2xl font-bold text-green-600">{staffList.filter(s => s.current_status === 'Available').length}</p>
           </div>
           <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-gray-500 text-sm font-medium">Assigned</h3>
              <p className="text-2xl font-bold text-blue-600">{staffList.filter(s => s.current_status === 'Assigned').length}</p>
           </div>
           <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-gray-500 text-sm font-medium">Pending Verification</h3>
              <p className="text-2xl font-bold text-orange-600">{staffList.filter(s => s.verification_status === 'pending').length}</p>
           </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-wrap gap-4 items-center justify-between">
           <div className="relative flex-1 min-w-[300px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input 
                 type="text" 
                 placeholder="Search by name, phone..." 
                 className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#6B46C1]"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
           <div className="flex gap-2">
              <select 
                 className="p-2 border rounded-lg text-sm text-gray-700 focus:outline-none"
                 value={filterType}
                 onChange={(e) => setFilterType(e.target.value)}
              >
                 <option value="All">All Services</option>
                 <option value="Nurse">Nurses</option>
                 <option value="Attendant">Attendants</option>
                 <option value="Elderly Care">Elderly Care</option>
              </select>
           </div>
        </div>

        {/* Staff Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
           <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                 <thead>
                    <tr className="bg-gray-50 text-gray-600 text-sm font-semibold border-b border-gray-200">
                       <th className="p-4">Staff Member</th>
                       <th className="p-4">Qualification</th>
                       <th className="p-4">Status</th>
                       <th className="p-4">Verification</th>
                       <th className="p-4">Performance</th>
                       <th className="p-4 text-right">Actions</th>
                    </tr>
                 </thead>
                 <tbody>
                    {filteredStaff.map((staff) => (
                       <tr key={staff.staff_id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                          <td className="p-4">
                             <div className="flex items-center gap-3">
                                <img src={staff.photo_url} alt="" className="w-10 h-10 rounded-full object-cover bg-gray-200" />
                                <div>
                                   <p className="font-semibold text-gray-900">{staff.name}</p>
                                   <p className="text-xs text-gray-500">{staff.phone}</p>
                                </div>
                             </div>
                          </td>
                          <td className="p-4">
                             <p className="text-sm text-gray-900">{staff.qualification}</p>
                             <p className="text-xs text-gray-500">{staff.experience_years} Years Exp</p>
                          </td>
                          <td className="p-4">
                             <StaffStatusManager 
                                staffId={staff.staff_id} 
                                currentStatus={staff.current_status} 
                                onStatusChange={loadStaff}
                             />
                          </td>
                          <td className="p-4">
                             {staff.verification_status === 'verified' ? (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                   <ShieldCheck className="w-3 h-3 mr-1" /> Verified
                                </span>
                             ) : (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                                   <ShieldAlert className="w-3 h-3 mr-1" /> Pending
                                </span>
                             )}
                          </td>
                          <td className="p-4">
                             <div className="flex items-center gap-1">
                                <span className="text-sm font-bold">{staff.rating}</span>
                                <span className="text-xs text-gray-400">/5.0</span>
                             </div>
                             <p className="text-xs text-gray-500">{staff.completed_bookings} Jobs</p>
                          </td>
                          <td className="p-4 text-right">
                             <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="sm" onClick={() => navigate(`/staff/profile/${staff.staff_id}`)}>
                                   <Eye className="w-4 h-4 text-gray-500" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                   <Edit className="w-4 h-4 text-gray-500" />
                                </Button>
                             </div>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>

      </div>
      <Footer />
    </div>
  );
};

export default StaffManagementDashboard;