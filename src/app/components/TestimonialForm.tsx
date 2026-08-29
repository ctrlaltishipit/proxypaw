import { useState } from 'react';
import { motion } from 'motion/react';
import { X, Star } from 'lucide-react';

interface TestimonialFormProps {
  onClose: () => void;
}

export default function TestimonialForm({ onClose }: TestimonialFormProps) {
  const [rating, setRating] = useState(5);
  const [role, setRole] = useState<'Owner' | 'Volunteer' | 'Renter'>('Owner');
  const [name, setName] = useState('');
  const [testimonial, setTestimonial] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would submit to a backend
    setSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
      <motion.div
        className="bg-white border border-gray-300 rounded-sm max-w-lg w-full p-8 relative shadow-2xl"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-sm transition-colors text-gray-700"
        >
          <X className="w-5 h-5" />
        </button>

        {!submitted ? (
          <>
            <h2 className="mb-6 text-gray-900">stick your note!</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label className="block mb-2 text-gray-700">your name</label>
                <input 
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-sm px-4 py-3 focus:border-gray-500 outline-none transition-colors text-gray-900"
                  placeholder="sarah m."
                  required
                />
              </div>

              {/* Role */}
              <div>
                <label className="block mb-2 text-gray-700">your role</label>
                <div className="flex gap-3">
                  {(['Owner', 'Volunteer', 'Renter'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`flex-1 py-2 px-4 rounded-sm border transition-colors ${
                        role === r 
                          ? 'bg-gray-900 border-gray-900 text-white' 
                          : 'border-gray-300 hover:border-gray-400 text-gray-700'
                      }`}
                    >
                      {r.toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rating */}
              <div>
                <label className="block mb-2 text-gray-700">rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star 
                        className={`w-8 h-8 ${
                          star <= rating 
                            ? 'fill-gray-900 text-gray-900' 
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Testimonial */}
              <div>
                <label className="block mb-2 text-gray-700">your feedback</label>
                <textarea 
                  value={testimonial}
                  onChange={(e) => setTestimonial(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-sm px-4 py-3 focus:border-gray-500 outline-none transition-colors resize-none text-gray-900"
                  rows={5}
                  maxLength={500}
                  placeholder="share your experience with proxypaw..."
                  required
                />
                <p className="text-gray-500 mt-1">{testimonial.length}/500 characters</p>
              </div>

              {/* Submit */}
              <button 
                type="submit"
                className="w-full py-3 bg-gray-900 hover:bg-gray-800 transition-colors rounded-sm text-white"
              >
                stick it!
              </button>
            </form>
          </>
        ) : (
          <motion.div 
            className="text-center py-12"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8 fill-white text-white" />
            </div>
            <h3 className="mb-2 text-gray-900">thanks for your feedback!</h3>
            <p className="text-gray-600">your note will appear after moderation.</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}