import React from 'react';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HeroSection from '@/components/HeroSection';
import ServiceCards from '@/components/ServiceCards';
import HowItWorks from '@/components/HowItWorks';
import WhyChooseUs from '@/components/WhyChooseUs';
import NearbyNurseFinder from '@/components/NearbyNurseFinder';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Phone, MapPin } from 'lucide-react';

const CityBadge = ({ city }) => (
  <div className="bg-white px-6 py-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:border-purple-200 hover:shadow-md transition-all group cursor-default">
     <div className="flex items-center gap-3">
        <MapPin className="w-5 h-5 text-gray-400 group-hover:text-purple-500 transition-colors" />
        <span className="font-bold text-gray-700 group-hover:text-purple-700 transition-colors">{city}</span>
     </div>
     <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">Available</span>
  </div>
);

const CTASection = () => (
  <section className="py-20 bg-gradient-to-r from-purple-600 to-cyan-600 text-white relative overflow-hidden">
     <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
     <div className="container-custom relative z-10 text-center">
        <h2 className="text-3xl lg:text-5xl font-bold mb-6">Ready to Book a Nurse?</h2>
        <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
           Get the care you need, when you need it. Our team is ready to assist you.
        </p>
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
           <Link to="/book">
              <Button className="bg-white text-purple-700 hover:bg-gray-100 h-14 px-10 text-lg rounded-full font-bold shadow-xl">
                 Book Now
              </Button>
           </Link>
           <div className="flex items-center gap-3 text-lg font-medium bg-white/10 px-6 py-3 rounded-full backdrop-blur-sm">
              <Phone className="w-6 h-6" />
              <span>+91 89489 89353</span>
           </div>
        </div>
     </div>
  </section>
);

const HomePage = () => {
  const ogImage = "https://horizons-cdn.hostinger.com/a8e22232-a95d-404c-90b9-e488821bd3df/e5cc0df1efbb4be6faf5d180e168f0cb.jpg";

  const handleFindNearby = () => {
    const element = document.getElementById('nearby-nurse');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      <Helmet>
        <title>InstantCare – Home Healthcare & Nurse at Home</title>
        <meta name="description" content="Book instant nurse, doctor, staff & maid services in your location. 24/7 emergency healthcare available. Verified professionals near you." />
        <meta name="keywords" content="instant nurse, emergency healthcare, doctor on demand, home healthcare, nurse at home, 24/7 healthcare, instant staff, maid service, healthcare services near me" />
        
        {/* Open Graph */}
        <meta property="og:title" content="InstantCare – Home Healthcare & Nurse at Home" />
        <meta property="og:description" content="Providing 12 Hours & 24 Hours trained nurses at home since 2021. Book verified healthcare professionals instantly." />
        <meta property="og:image" content={ogImage} />
        <meta property="og:url" content="https://instantcare.in/" />
        <meta property="og:type" content="website" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="InstantCare – Home Healthcare & Nurse at Home" />
        <meta name="twitter:description" content="Providing 12 Hours & 24 Hours trained nurses at home since 2021." />
        <meta name="twitter:image" content={ogImage} />
        <meta name="twitter:site" content="@instantcare24_7" />
      </Helmet>
      
      <Navbar />
      <main>
        <HeroSection onFindNearby={handleFindNearby} />
        <NearbyNurseFinder />
        <ServiceCards />
        <HowItWorks />
        <WhyChooseUs />
        
        <section className="py-20 bg-white">
           <div className="container-custom">
              <div className="text-center mb-12">
                 <h2 className="text-3xl font-bold text-gray-900 mb-4">Cities We Serve</h2>
                 <p className="text-gray-600">Providing top-quality healthcare across major cities</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
                 {['Bangalore', 'Mumbai', 'Hyderabad', 'Chennai', 'Delhi'].map(city => (
                    <CityBadge key={city} city={city} />
                 ))}
              </div>
           </div>
        </section>

        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;