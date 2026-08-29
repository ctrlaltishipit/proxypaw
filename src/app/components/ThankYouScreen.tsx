import { motion } from 'motion/react';
import { CheckCircle, Calendar, Clock, User, Download, Home } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { formatPriceDual } from '../utils/pricing';

interface ThankYouScreenProps {
  onGoToDashboard: () => void;
  onGoHome: () => void;
  bookingDetails: {
    volunteerId: string;
    volunteerName: string;
    date: string;
    time: string;
    duration: number;
    totalAmount: number;
  };
}

export default function ThankYouScreen({ onGoToDashboard, onGoHome, bookingDetails }: ThankYouScreenProps) {
  const { theme } = useTheme();
  const isLightMode = theme === 'light';
  const bookingId = 'PXP' + Date.now().toString().slice(-8);

  return (
    <div className={`min-h-screen flex items-center justify-center px-6 ${isLightMode ? 'bg-gradient-to-b from-gray-50 to-gray-100' : 'bg-gradient-to-b from-gray-900 to-gray-800'}`}>
      <motion.div 
        className="max-w-2xl w-full"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Success Icon */}
        <motion.div
          className="flex justify-center mb-8"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        >
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-16 h-16 text-green-600" />
          </div>
        </motion.div>

        {/* Success Message */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h1 className="mb-4 text-gray-900">thank you for booking!</h1>
          <p className="text-gray-600 mb-2">
            your walk has been successfully scheduled
          </p>
          <div className="inline-block px-4 py-2 bg-[#4A9EFF]/10 rounded-sm">
            <span className="text-gray-600">booking id: </span>
            <span className="text-[#4A9EFF]">{bookingId}</span>
          </div>
        </motion.div>

        {/* Booking Details Card */}
        <motion.div
          className="bg-white p-8 rounded-sm border border-gray-300 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="mb-6 text-gray-900 text-center">booking details</h2>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4 pb-4 border-b border-gray-300">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-6 h-6 text-gray-900" />
              </div>
              <div className="flex-1">
                <div className="text-gray-600">volunteer</div>
                <div className="text-gray-900">{bookingDetails.volunteerName}</div>
              </div>
            </div>

            <div className="flex items-center gap-4 pb-4 border-b border-gray-300">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Calendar className="w-6 h-6 text-gray-900" />
              </div>
              <div className="flex-1">
                <div className="text-gray-600">date</div>
                <div className="text-gray-900">
                  {new Date(bookingDetails.date).toLocaleDateString('en-IN', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric',
                    weekday: 'long'
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 pb-4 border-b border-gray-300">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Clock className="w-6 h-6 text-gray-900" />
              </div>
              <div className="flex-1">
                <div className="text-gray-600">time & duration</div>
                <div className="text-gray-900">{bookingDetails.time} • {bookingDetails.duration} minutes</div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4">
              <div className="text-gray-600">amount paid</div>
              <div className="text-gray-900">{formatPriceDual(bookingDetails.totalAmount)}</div>
            </div>
          </div>
        </motion.div>

        {/* What's Next */}
        <motion.div
          className="bg-white p-8 rounded-sm border border-gray-300 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="mb-4 text-gray-900">what&apos;s next?</h3>
          <ul className="space-y-3 text-gray-600">
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
              </div>
              <span>you&apos;ll receive a confirmation email with all booking details</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
              </div>
              <span>your volunteer will contact you 24 hours before the scheduled walk</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
              </div>
              <span>track your walk in real-time through the dashboard</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
              </div>
              <span>earn paw points with each completed walk</span>
            </li>
          </ul>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          className="grid md:grid-cols-2 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <button
            onClick={onGoToDashboard}
            className="py-4 bg-[#4A9EFF] text-white rounded-sm hover:bg-[#3A8EEF] transition-colors flex items-center justify-center gap-2"
          >
            <Calendar className="w-5 h-5" />
            view my bookings
          </button>
          <button
            onClick={onGoHome}
            className="py-4 bg-white text-gray-900 rounded-sm border border-gray-300 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            back to home
          </button>
        </motion.div>

        {/* Download Receipt */}
        <motion.div
          className="text-center mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <button className="text-[#4A9EFF] hover:underline flex items-center justify-center gap-2 mx-auto">
            <Download className="w-4 h-4" />
            download receipt
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}