import React from 'react';
import { Helmet } from 'react-helmet';
import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Calendar, MapPin, Phone, Download, Share2, ShieldCheck, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const BookingConfirmationPage = () => {
  const location = useLocation();
  const booking = location.state?.booking;

  // Fallback if accessed directly
  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Booking Found</h2>
          <Link to="/">
            <Button>Return Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const {
    bookingRef,
    serviceType,
    shiftType,
    startDate,
    fullAddress,
    patientName,
    mobileNumber,
    isEmergency,
    staff
  } = booking;

  return (
    <>
      <Helmet>
        <title>Booking Confirmed - InstantCare</title>
      </Helmet>
      
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl overflow-hidden"
          >
            {/* Success Header */}
            <div className={`p-8 text-center ${isEmergency ? 'bg-red-50' : 'bg-green-50'}`}>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${isEmergency ? 'bg-red-100' : 'bg-green-100'}`}
              >
                <CheckCircle className={`w-10 h-10 ${isEmergency ? 'text-red-600' : 'text-green-600'}`} />
              </motion.div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
              <p className="text-gray-600">Your reference number is:</p>
              <div className="mt-2 inline-block bg-white px-4 py-2 rounded-lg border border-gray-200 font-mono text-xl font-bold tracking-wider text-[#6B46C1] select-all cursor-pointer" onClick={() => navigator.clipboard.writeText(bookingRef)}>
                {bookingRef}
              </div>
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Booking Details */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Booking Details</h3>
                
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="bg-purple-50 p-2 rounded-lg h-fit">
                      <ShieldCheck className="w-5 h-5 text-[#6B46C1]" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Service</p>
                      <p className="font-medium text-gray-900">{serviceType} {shiftType ? `(${shiftType})` : ''}</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="bg-purple-50 p-2 rounded-lg h-fit">
                      <Calendar className="w-5 h-5 text-[#6B46C1]" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Start Date</p>
                      <p className="font-medium text-gray-900">{new Date(startDate).toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="bg-purple-50 p-2 rounded-lg h-fit">
                      <MapPin className="w-5 h-5 text-[#6B46C1]" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-medium text-gray-900">{fullAddress}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="bg-purple-50 p-2 rounded-lg h-fit">
                      <Phone className="w-5 h-5 text-[#6B46C1]" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Contact</p>
                      <p className="font-medium text-gray-900">{patientName} | {mobileNumber}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Assigned Staff & Actions */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Assigned Staff</h3>
                
                {staff ? (
                   <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                      <div className="flex items-center gap-3 mb-3">
                         <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center">
                            <span className="font-bold text-blue-700">RN</span>
                         </div>
                         <div>
                            <p className="font-bold text-gray-900">Nurse Assigned</p>
                            <p className="text-sm text-gray-600">Arriving in {staff.arrivalMinutes} mins</p>
                         </div>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                         <p className="flex items-center gap-2"><ShieldCheck className="w-3 h-3 text-green-600"/> Background Verified</p>
                         <p className="flex items-center gap-2"><ShieldCheck className="w-3 h-3 text-green-600"/> Fully Vaccinated</p>
                      </div>
                   </div>
                ) : (
                   <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-100">
                      <p className="text-yellow-800 font-medium flex items-center gap-2">
                         <Clock className="w-4 h-4"/> Allocation in progress
                      </p>
                      <p className="text-sm text-yellow-700 mt-1">We are assigning the best professional for you. You will receive an SMS shortly.</p>
                   </div>
                )}

                <div className="pt-4 space-y-3">
                  <h4 className="font-medium text-gray-900">What happens next?</h4>
                  <ul className="text-sm text-gray-600 space-y-2 list-disc pl-4">
                    <li>You will receive a confirmation SMS & Email.</li>
                    <li>The assigned staff will contact you before arrival.</li>
                    <li>Please keep medical reports handy if applicable.</li>
                  </ul>
                </div>

                <div className="flex gap-3 pt-4">
                   <Button variant="outline" className="flex-1">
                      <Download className="w-4 h-4 mr-2"/> PDF
                   </Button>
                   <Button variant="outline" className="flex-1">
                      <Share2 className="w-4 h-4 mr-2"/> Share
                   </Button>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-6 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-sm text-gray-500">Need immediate help? Call <strong>+91-9876543210</strong></p>
              <Link to="/">
                 <Button>Return to Home</Button>
              </Link>
            </div>
          </motion.div>
        </div>
        
        <Footer />
      </div>
    </>
  );
};

export default BookingConfirmationPage;