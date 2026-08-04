import React from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Phone, Mail, MapPin, MessageCircle, Instagram, Linkedin, Facebook, Twitter } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import InquiryForm from '@/components/inquiry/InquiryForm';
import { buildWhatsAppUrl, siteContact } from '@/config/siteConfig';

const ContactUsPage = () => {
   const ogImage = "https://horizons-cdn.hostinger.com/a8e22232-a95d-404c-90b9-e488821bd3df/e5cc0df1efbb4be6faf5d180e168f0cb.jpg";

   return (
      <div className="min-h-screen bg-[#F8FAFB] font-sans">
         <Helmet>
            <title>Contact Us – InstantCare Home Healthcare</title>
            <meta name="description" content="Get in touch with InstantCare for 24/7 emergency healthcare support. Call our hotline +91 89489 89353 for immediate assistance." />
            
            {/* Open Graph */}
            <meta property="og:title" content="Contact Us – InstantCare Home Healthcare" />
            <meta property="og:description" content="24/7 Emergency Hotline: +91 89489 89353. Contact us for nurse at home and patient care services." />
            <meta property="og:url" content="https://instantcare.in/contact" />
            <meta property="og:image" content={ogImage} />
            <meta property="og:type" content="website" />
            
            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content="Contact Us – InstantCare Home Healthcare" />
            <meta name="twitter:description" content="24/7 Emergency Hotline: +91 89489 89353. Contact us for nurse at home and patient care services." />
            <meta name="twitter:image" content={ogImage} />
         </Helmet>
         
         <Navbar />
         
         <div className="pt-28 pb-16 px-4 container-custom">
            <div className="text-center mb-12">
               <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">Get in Touch</h1>
               <p className="text-gray-600 text-lg max-w-xl mx-auto">
                  Have questions about our services? We're here to help you 24/7.
               </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
               
               {/* Contact Info Column */}
               <div className="lg:col-span-1 space-y-6">
                  {/* Info Card */}
                  <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100 h-full">
                     <h2 className="text-xl font-bold text-gray-900 mb-6">Contact Information</h2>
                     
                     <div className="space-y-6">
                        <div className="flex items-start gap-4">
                           <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center text-[#7C3AED] shrink-0">
                              <MapPin className="w-5 h-5" />
                           </div>
                           <div>
                              <h3 className="font-semibold text-gray-900 mb-1">Our Location</h3>
                              <p className="text-gray-600 text-sm leading-relaxed">
                                 Near Fortis Hospital, Goregaon Link Road, Nahur West, Mumbai – 400078
                              </p>
                           </div>
                        </div>

                        <div className="flex items-start gap-4">
                           <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center text-[#7C3AED] shrink-0">
                              <Phone className="w-5 h-5" />
                           </div>
                           <div>
                              <h3 className="font-semibold text-gray-900 mb-1">Phone Number</h3>
                              <a href={siteContact.phoneHref} className="text-gray-600 text-sm hover:text-[#7C3AED] block">
                                 {siteContact.phoneDisplay}
                              </a>
                              <p className="text-xs text-gray-400 mt-1">Available 24/7 for support</p>
                           </div>
                        </div>

                        <div className="flex items-start gap-4">
                           <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center text-green-600 shrink-0">
                              <MessageCircle className="w-5 h-5" />
                           </div>
                           <div>
                              <h3 className="font-semibold text-gray-900 mb-1">WhatsApp</h3>
                              <a href={buildWhatsAppUrl('Hello InstantCare, I need help with a care inquiry.')} className="text-gray-600 text-sm hover:text-green-600 block">
                                 {siteContact.phoneDisplay}
                              </a>
                              <p className="text-xs text-gray-400 mt-1">Chat with us instantly</p>
                           </div>
                        </div>

                        <div className="flex items-start gap-4">
                           <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center text-[#7C3AED] shrink-0">
                              <Mail className="w-5 h-5" />
                           </div>
                           <div>
                              <h3 className="font-semibold text-gray-900 mb-1">Email Address</h3>
                              <a href={`mailto:${siteContact.supportEmail}`} className="text-gray-600 text-sm hover:text-[#7C3AED] block break-all">
                                 {siteContact.supportEmail}
                              </a>
                           </div>
                        </div>
                     </div>

                     <div className="mt-8 pt-8 border-t border-gray-100">
                        <h3 className="font-semibold text-gray-900 mb-4">Follow Us</h3>
                        <div className="flex gap-3">
                           <a href="https://www.instagram.com/instantcare24_7/" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-[#7C3AED] hover:text-white transition-all">
                              <Instagram className="w-5 h-5" />
                           </a>
                           <a href="https://www.linkedin.com/in/instantcare-health-wealth-3516173a1/" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-[#7C3AED] hover:text-white transition-all">
                              <Linkedin className="w-5 h-5" />
                           </a>
                           <a href="#" className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-[#7C3AED] hover:text-white transition-all">
                              <Facebook className="w-5 h-5" />
                           </a>
                           <a href="#" className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-[#7C3AED] hover:text-white transition-all">
                              <Twitter className="w-5 h-5" />
                           </a>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Contact Form Column */}
               <div className="lg:col-span-2 space-y-8">
                  <InquiryForm
                     source="contact-page"
                     title="Create a professional care inquiry"
                     description="Share patient details, location, service preference, budget, timeline, and supporting reports so our team can respond with the right next step."
                  />
                  
                  {/* Google Map */}
                  <div className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden h-[300px]">
                     <iframe 
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3768.665787164627!2d72.9365!3d19.1663!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7b8f0c5f5b0f7%3A0x1234567890abcdef!2sNahur%20West%2C%20Mumbai!5e0!3m2!1sen!2sin!4v1620000000000!5m2!1sen!2sin" 
                        width="100%" 
                        height="100%" 
                        style={{border:0}} 
                        allowFullScreen="" 
                        loading="lazy"
                        title="Office Location Map"
                     ></iframe>
                  </div>
               </div>
            </div>
         </div>

         <Footer />
      </div>
   );
};

export default ContactUsPage;