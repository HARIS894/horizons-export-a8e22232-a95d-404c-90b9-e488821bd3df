import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const TestimonialsSection = () => {
  const testimonials = [
    {
      id: 1,
      name: "Rajesh Kumar",
      image: "https://images.unsplash.com/photo-1680778470701-b64ce61294ca?w=100&h=100&fit=crop",
      rating: 5,
      condition: "Post-Surgery Care",
      text: "The nurse provided for my father's post-bypass surgery care was exceptional. Professional, punctual, and very knowledgeable."
    },
    {
      id: 2,
      name: "Priya Sharma",
      image: "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=100&h=100&fit=crop",
      rating: 5,
      condition: "Elderly Care",
      text: "InstantCare has been a blessing for our family. The 24/7 support means we can sleep peacefully knowing our grandmother is safe."
    },
    {
      id: 3,
      name: "Amit Patel",
      image: "https://images.unsplash.com/photo-1571842398960-834d7f56861c?w=100&h=100&fit=crop",
      rating: 5,
      condition: "Physiotherapy",
      text: "Recovering from a sports injury was much faster thanks to the home physiotherapy sessions. Highly recommended!"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Trusted by Families</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            See what our patients and their families have to say about our care services.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2, duration: 0.6 }}
              className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 relative group hover:-translate-y-2 transition-transform duration-300"
            >
              <Quote className="absolute top-6 right-6 w-10 h-10 text-[#6B46C1]/10 group-hover:text-[#6B46C1]/20 transition-colors" />
              
              <div className="flex items-center gap-4 mb-6">
                <img 
                  src={testimonial.image} 
                  alt={testimonial.name} 
                  className="w-16 h-16 rounded-full object-cover border-2 border-[#06B6D4]"
                />
                <div>
                  <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                  <p className="text-sm text-[#6B46C1] font-medium">{testimonial.condition}</p>
                </div>
              </div>

              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                ))}
              </div>

              <p className="text-gray-600 italic leading-relaxed">
                "{testimonial.text}"
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;