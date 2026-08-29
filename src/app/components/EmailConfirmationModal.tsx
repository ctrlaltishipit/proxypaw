import { motion } from 'motion/react';
import { Mail, CheckCircle, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface EmailConfirmationModalProps {
  onClose: () => void;
}

export default function EmailConfirmationModal({ onClose }: EmailConfirmationModalProps) {
  const { theme } = useTheme();
  const isLightMode = theme === 'light';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        className={`max-w-md w-full rounded-sm border p-8 relative ${
          isLightMode 
            ? 'bg-white border-gray-200' 
            : 'bg-black border-gray-800'
        }`}
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', duration: 0.5 }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-1 rounded-sm transition-colors ${
            isLightMode 
              ? 'hover:bg-gray-100' 
              : 'hover:bg-gray-900'
          }`}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Success icon */}
        <div className="flex justify-center mb-6">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
            isLightMode ? 'bg-gray-100' : 'bg-gray-900'
          }`}>
            <CheckCircle className={`w-10 h-10 ${isLightMode ? 'text-gray-900' : 'text-white'}`} />
          </div>
        </div>

        {/* Content */}
        <div className="text-center space-y-4 lowercase">
          <h2 className="text-2xl">application submitted!</h2>
          
          <div className="flex items-center justify-center gap-2">
            <Mail className={`w-5 h-5 ${isLightMode ? 'text-gray-600' : 'text-gray-400'}`} />
            <p className={isLightMode ? 'text-gray-600' : 'text-gray-400'}>
              we have mailed you the confirmation
            </p>
          </div>

          <div className={`p-4 rounded-sm ${
            isLightMode ? 'bg-gray-50' : 'bg-gray-950'
          }`}>
            <p className={`text-sm ${isLightMode ? 'text-gray-700' : 'text-gray-300'}`}>
              please wait for further communications regarding your volunteer application. we'll review your details and documents, then reach out within 2-3 business days.
            </p>
          </div>

          <div className={`text-sm ${isLightMode ? 'text-gray-600' : 'text-gray-400'}`}>
            check your email inbox (and spam folder) for the confirmation message.
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className={`w-full mt-6 py-3 rounded-sm transition-colors lowercase ${
            isLightMode 
              ? 'bg-gray-900 hover:bg-gray-800 text-white' 
              : 'bg-white hover:bg-gray-100 text-gray-900'
          }`}
        >
          got it, thanks!
        </button>
      </motion.div>
    </div>
  );
}
