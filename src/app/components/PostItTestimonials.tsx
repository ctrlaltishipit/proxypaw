import { motion } from 'motion/react';
import { Star } from 'lucide-react';

interface Testimonial {
  id: number;
  text: string;
  author: string;
  role: string;
  rating: number;
  rotation: number;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    text: "The AI matched Luna with the PERFECT walker. He knew exactly how to handle her anxiety. Peace of mind is priceless!",
    author: "Ananya Iyer",
    role: "Owner",
    rating: 5,
    rotation: -3
  },
  {
    id: 2,
    text: "Love the Paw Points! This initiative makes giving back so easy and rewarding. Completed my 10th walk this month!",
    author: "Rohan Mehta",
    role: "Volunteer",
    rating: 5,
    rotation: 2
  },
  {
    id: 3,
    text: "Borrowed 'Buster the Beagle' for a quiet afternoon. My apartment felt less lonely & Buster got great snuggles! Thank you Proxypaw.",
    author: "Kavya Reddy",
    role: "Renter",
    rating: 5,
    rotation: -2
  },
  {
    id: 4,
    text: "The real-time tracking feature gives me so much peace of mind. I can see exactly where Charlie is during his walks!",
    author: "Arjun Nair",
    role: "Owner",
    rating: 5,
    rotation: 1
  },
  {
    id: 5,
    text: "Background checks and safety protocols are top-notch. I feel completely safe volunteering and meeting new pups every week.",
    author: "Priya Sharma",
    role: "Volunteer",
    rating: 5,
    rotation: -1
  },
  {
    id: 6,
    text: "Just hit Pack Leader status! The reward system actually makes you feel valued. This community is special.",
    author: "Vikram Rao",
    role: "Volunteer",
    rating: 5,
    rotation: 3
  }
];

export default function PostItTestimonials() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
      {testimonials.map((testimonial, index) => (
        <motion.div
          key={testimonial.id}
          className="relative"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          whileHover={{ scale: 1.05, rotate: 0, zIndex: 10 }}
        >
          {/* Pushpin */}
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-gray-800 rounded-full shadow-lg z-10"></div>
          
          {/* Post-it Note */}
          <div 
            className="bg-gradient-to-br from-white to-gray-100 border border-gray-300 p-6 rounded-sm shadow-2xl min-h-[280px] flex flex-col"
            style={{ 
              transform: `rotate(${testimonial.rotation}deg)`,
              transition: 'transform 0.3s ease'
            }}
          >
            {/* Stars */}
            <div className="flex gap-1 mb-4">
              {[...Array(testimonial.rating)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-gray-800 text-gray-800" />
              ))}
            </div>

            {/* Testimonial Text - Handwritten Style */}
            <p className="text-gray-900 flex-grow mb-4 font-handwriting" style={{ fontFamily: "'Caveat', cursive" }}>
              &quot;{testimonial.text.toLowerCase()}&quot;
            </p>

            {/* Author */}
            <div className="mt-auto">
              <p className="text-gray-900 font-handwriting" style={{ fontFamily: "'Caveat', cursive" }}>
, {testimonial.author.toLowerCase()}
              </p>
              <p className="text-gray-600 font-handwriting" style={{ fontFamily: "'Caveat', cursive" }}>
                {testimonial.role.toLowerCase()}
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}