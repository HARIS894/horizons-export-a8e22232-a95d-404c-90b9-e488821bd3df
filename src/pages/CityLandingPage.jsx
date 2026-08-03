// Task 4: Dynamic CityLandingPage
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Star, Shield, Clock, Phone, ArrowRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import BreadcrumbNavigation from '@/components/BreadcrumbNavigation';
import { Button } from '@/components/ui/button';
import { getLocalBusinessSchema, getFAQSchema } from '@/utils/seoUtils';

const cityData = {
  "delhi": { name: "Delhi", phone: "011-9876543210", address: "Connaught Place, New Delhi" },
  "mumbai": { name: "Mumbai", phone: "022-9876543210", address: "Bandra West, Mumbai" },
  "bangalore": { name: "Bangalore", phone: "080-9876543210", address: "Indiranagar, Bangalore" },
  "hyderabad": { name: "Hyderabad", phone: "040-9876543210", address: "Banjara Hills, Hyderabad" },
  "chennai": { name: "Chennai", phone: "044-9876543210", address: "T. Nagar, Chennai" },
  "kolkata": { name: "Kolkata", phone: "033-9876543210", address: "Park Street, Kolkata" },
  "pune": { name: "Pune", phone: "020-9876543210", address: "Koregaon Park, Pune" },
  "ahmedabad": { name: "Ahmedabad", phone: "079-9876543210", address: "Satellite, Ahmedabad" },
  "jaipur": { name: "Jaipur", phone: "0141-9876543210", address: "C-Scheme, Jaipur" },
  "lucknow": { name: "Lucknow", phone: "0522-9876543210", address: "Hazratganj, Lucknow" },
  "chandigarh": { name: "Chandigarh", phone: "0172-9876543210", address: "Sector 17, Chandigarh" },
  "indore": { name: "Indore", phone: "0731-9876543210", address: "Vijay Nagar, Indore" },
  "surat": { name: "Surat", phone: "0261-9876543210", address: "Vesu, Surat" },
  "vadodara": { name: "Vadodara", phone: "0265-9876543210", address: "Alkapuri, Vadodara" },
  "nagpur": { name: "Nagpur", phone: "0712-9876543210", address: "Civil Lines, Nagpur" }
};

const CityLandingPage = () => {
  const { city } = useParams();
  const normalizedCity = city?.toLowerCase() || 'bangalore';
  const cityInfo = cityData[normalizedCity] || cityData['bangalore'];
  const formattedCityName = cityInfo.name;

  const localFAQs = [
    { question: `Is home nursing available in ${formattedCityName}?`, answer: `Yes, InstantCare provides professional home nursing services across all major areas in ${formattedCityName}.` },
    { question: `How fast can I get a nurse in ${formattedCityName}?`, answer: "We can usually dispatch a nurse to your location within 2 hours of booking." },
    { question: `Do you provide elderly care in ${formattedCityName}?`, answer: `Absolutely. We have specialized geriatric care attendants available in ${formattedCityName}.` },
    { question: `Are your ${formattedCityName} staff verified?`, answer: "Yes, all our staff undergo strict background checks and police verification." }
  ];

  return (
    <>
      <SEO 
        title={`Home Healthcare Services in ${formattedCityName} - Available 24/7 | InstantCare`}
        description={`Book trusted home healthcare services in ${formattedCityName}. Professional nurses, elderly care, and patient attendants available 24/7 in ${formattedCityName}. Call ${cityInfo.phone}.`}
        keywords={`home nursing ${formattedCityName}, elderly care ${formattedCityName}, patient attendant ${formattedCityName}, physiotherapy ${formattedCityName}`}
        schemas={[
          getLocalBusinessSchema(formattedCityName, cityInfo.address),
          getFAQSchema(localFAQs)
        ]}
      />

      <div className="min-h-screen bg-white">
        <Navbar />
        <BreadcrumbNavigation />

        {/* Hero */}
        <div className="relative bg-[#6B46C1] py-20 overflow-hidden">
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-6">
                 Home Healthcare Services in {formattedCityName}
              </h1>
              <p className="text-xl text-purple-100 max-w-2xl mx-auto mb-8">
                 Professional medical support delivered to your doorstep in {formattedCityName}. Available 24/7.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                 <Link to="/smart-booking">
                    <Button className="bg-white text-[#6B46C1] hover:bg-gray-100 font-bold px-8 py-6 rounded-full text-lg">
                       Book Now in {formattedCityName}
                    </Button>
                 </Link>
                 <Button variant="outline" className="border-white text-white hover:bg-white/10 px-8 py-6 rounded-full text-lg">
                    <Phone className="w-5 h-5 mr-2" /> {cityInfo.phone}
                 </Button>
              </div>
           </div>
        </div>

        {/* Why Choose Us */}
        <section className="py-16 bg-gray-50">
           <div className="max-w-7xl mx-auto px-4">
              <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Why Choose InstantCare in {formattedCityName}?</h2>
              <div className="grid md:grid-cols-3 gap-8">
                 {[
                    { icon: Clock, title: "24/7 Availability", desc: `Round-the-clock support for ${formattedCityName} residents.` },
                    { icon: Shield, title: "Verified Staff", desc: "Background checked professionals you can trust." },
                    { icon: MapPin, title: "Local Presence", desc: `Strong network of caregivers across ${formattedCityName}.` }
                 ].map((item, i) => (
                    <div key={i} className="bg-white p-6 rounded-xl shadow-sm text-center">
                       <item.icon className="w-12 h-12 text-[#6B46C1] mx-auto mb-4" />
                       <h3 className="font-bold text-xl mb-2">{item.title}</h3>
                       <p className="text-gray-600">{item.desc}</p>
                    </div>
                 ))}
              </div>
           </div>
        </section>

        {/* Local Testimonials */}
        <section className="py-16">
           <div className="max-w-7xl mx-auto px-4">
              <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">What {formattedCityName} Residents Say</h2>
              <div className="grid md:grid-cols-2 gap-8">
                 <div className="bg-white border p-6 rounded-xl shadow-md">
                    <div className="flex text-yellow-400 mb-2"><Star/><Star/><Star/><Star/><Star/></div>
                    <p className="text-gray-600 italic mb-4">"The nurse provided for my father in {formattedCityName} was exceptional. Very professional and caring."</p>
                    <p className="font-bold">- Rajesh K., {formattedCityName}</p>
                 </div>
                 <div className="bg-white border p-6 rounded-xl shadow-md">
                    <div className="flex text-yellow-400 mb-2"><Star/><Star/><Star/><Star/><Star/></div>
                    <p className="text-gray-600 italic mb-4">"Quick response time. I needed an attendant urgently in {formattedCityName} and InstantCare delivered."</p>
                    <p className="font-bold">- Priya M., {formattedCityName}</p>
                 </div>
              </div>
           </div>
        </section>

        {/* Local FAQ */}
        <section className="py-16 bg-gray-50">
           <div className="max-w-3xl mx-auto px-4">
              <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Frequently Asked Questions</h2>
              <div className="space-y-4">
                 {localFAQs.map((faq, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-lg shadow-sm">
                       <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                       <p className="text-gray-600">{faq.answer}</p>
                    </div>
                 ))}
              </div>
           </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default CityLandingPage;