import React from 'react';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import ServiceCards from '@/components/ServiceCards';
import HowItWorks from '@/components/HowItWorks';
import LocationSection from '@/components/LocationSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import WhyChooseUs from '@/components/WhyChooseUs';
import EmergencyBanner from '@/components/EmergencyBanner';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { getOrganizationSchema, getFAQSchema, getAggregateRatingSchema } from '@/utils/seoUtils';

const LandingPage = () => {
  const commonFAQs = [
    { question: "What services do you offer?", answer: "We offer home nursing, elderly care, post-surgery care, physiotherapy, and baby care services." },
    { question: "How do I book?", answer: "You can book via our website using the Smart Booking form or call our 24/7 hotline." },
    { question: "Are your staff verified?", answer: "Yes, all our staff undergo rigorous background checks and medical certification verification." },
    { question: "Do you offer 24/7 service?", answer: "Yes, we provide 24/7 home healthcare support for emergencies and scheduled visits." },
    { question: "What areas do you serve?", answer: "We serve 15+ major Indian cities including Delhi, Mumbai, Bangalore, and Hyderabad." }
  ];

  return (
    <>
      <SEO 
        title="InstantCare - 24/7 Home Healthcare Services in India"
        description="Book trusted home healthcare services in India. Professional nurses, elderly care, post-surgery care & medical support. Available 24/7. Call now for instant care."
        keywords="home nursing, elderly care, medical support india, nurse at home, physiotherapy home"
        schemas={[
          getOrganizationSchema(),
          getFAQSchema(commonFAQs),
          getAggregateRatingSchema(4.8, 1250)
        ]}
      />

      <div className="min-h-screen bg-white">
        <Navbar />
        
        <main>
          {/* H1 is typically in HeroSection, ensuring semantic structure */}
          <HeroSection />
          
          <section id="services">
            <h2 className="sr-only">Our Healthcare Services</h2>
            <ServiceCards />
          </section>

          <EmergencyBanner />
          
          <section id="how-it-works">
             <HowItWorks />
          </section>

          <section id="why-us">
             <WhyChooseUs />
          </section>

          <section id="locations">
             <LocationSection />
          </section>

          <section id="testimonials">
             <TestimonialsSection />
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default LandingPage;