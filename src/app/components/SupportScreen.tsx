import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Bell, 
  User, 
  Upload, 
  CheckCircle, 
  Calendar as CalendarIcon,
  Mail,
  Phone,
  MessageSquare,
  MapPin,
  Award,
  AlertCircle,
  X,
  Image as ImageIcon
} from 'lucide-react';
import { formatPriceDual } from '../utils/pricing';
import { useTheme } from '../contexts/ThemeContext';

interface SupportScreenProps {
  onBack: () => void;
  userRole: 'owner' | 'walker' | 'renter';
}

export default function SupportScreen({ onBack, userRole }: SupportScreenProps) {
  const { theme } = useTheme();
  const isLightMode = theme === 'light';
  const [showBookingConfirmation, setShowBookingConfirmation] = useState(true);
  const [incidentType, setIncidentType] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [preferredContact, setPreferredContact] = useState('email');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [notifications] = useState(3);

  const recentActivity = [
    {
      id: 1,
      type: 'booking',
      message: 'Booking for Spot the Dog confirmed.',
      time: 'Just Now',
      icon: CheckCircle,
      color: 'text-emerald-400'
    },
    {
      id: 2,
      type: 'report',
      message: 'Walk Report Card received from Marcus R.',
      time: '5 min ago',
      icon: MapPin,
      color: 'text-[#4A9EFF]'
    },
    {
      id: 3,
      type: 'ticket',
      message: 'Incident #104 resolution posted.',
      time: 'Yesterday',
      icon: AlertCircle,
      color: 'text-yellow-400'
    },
    {
      id: 4,
      type: 'reward',
      message: 'You earned 50 Paw Points!',
      time: '2 days ago',
      icon: Award,
      color: 'text-purple-400'
    }
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && uploadedImages.length < 3) {
      const remaining = 3 - uploadedImages.length;
      const newImages = Array.from(files).slice(0, remaining).map(file => URL.createObjectURL(file));
      setUploadedImages([...uploadedImages, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(uploadedImages.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    // Reset form after 3 seconds
    setTimeout(() => {
      setSubmitted(false);
      setIncidentType('');
      setSubject('');
      setDescription('');
      setUploadedImages([]);
      setPreferredContact('email');
    }, 3000);
  };

  const addToCalendar = () => {
    alert('Calendar integration would open here');
  };

  return (
    <div className={`min-h-screen ${isLightMode ? 'bg-white text-gray-900' : 'bg-gray-900 text-white'}`}>
      {/* Header */}
      <div className={`border-b sticky top-0 z-40 backdrop-blur-sm ${isLightMode ? 'border-gray-200 bg-white/80' : 'border-gray-800 bg-gray-900/80'}`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={onBack}
              className={`flex items-center gap-2 transition-colors ${isLightMode ? 'hover:text-gray-600' : 'hover:text-gray-300'}`}
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Dashboard
            </button>

            <div className="flex items-center gap-4">
              {/* Notifications */}
              <button className={`relative p-2 rounded-sm transition-colors ${isLightMode ? 'hover:bg-gray-100' : 'hover:bg-gray-800'}`}>
                <Bell className="w-5 h-5" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white">
                    {notifications}
                  </span>
                )}
              </button>

              {/* Profile */}
              <button className={`p-2 rounded-sm transition-colors ${isLightMode ? 'hover:bg-gray-100' : 'hover:bg-gray-800'}`}>
                <User className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Page Title */}
        <motion.div 
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="mb-2">Support & Incident Center</h1>
          <p className={isLightMode ? 'text-gray-600' : 'text-gray-400'}>Get help, report issues, and track your service activity</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content - Left & Center */}
          <div className="lg:col-span-2 space-y-8">
            {/* Booking Confirmation Card */}
            <AnimatePresence>
              {showBookingConfirmation && (
                <motion.div
                  className={`border rounded-sm p-8 relative ${isLightMode ? 'bg-gray-50 border-gray-200' : 'bg-gray-800 border-gray-700'}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <button 
                    onClick={() => setShowBookingConfirmation(false)}
                    className={`absolute top-4 right-4 p-1 rounded-sm transition-colors ${isLightMode ? 'hover:bg-gray-200' : 'hover:bg-gray-700'}`}
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div className="flex items-start gap-4 mb-6">
                    <div className={`p-3 rounded-sm ${isLightMode ? 'bg-gray-900' : 'bg-gray-700'}`}>
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h2 className="mb-2">Booking Confirmed!</h2>
                      <p className={`mb-4 ${isLightMode ? 'text-gray-700' : 'text-gray-300'}`}>
                        Your service is confirmed for <span className={isLightMode ? 'text-gray-900' : 'text-white'}>Tuesday, Dec 10</span> at <span className={isLightMode ? 'text-gray-900' : 'text-white'}>2:00 PM – 3:00 PM</span>
                      </p>
                      
                      <div className={`rounded-sm p-4 mb-4 border ${isLightMode ? 'bg-white border-gray-200' : 'bg-gray-900 border-gray-700'}`}>
                        <div className="flex justify-between items-center mb-2">
                          <span className={isLightMode ? 'text-gray-600' : 'text-gray-400'}>Service</span>
                          <span className={isLightMode ? 'text-gray-900' : 'text-white'}>1 hour walk</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className={isLightMode ? 'text-gray-600' : 'text-gray-400'}>Total Price</span>
                          <span className={isLightMode ? 'text-gray-900' : 'text-white'}>{formatPriceDual(249)}</span>
                        </div>
                      </div>

                      <p className={`mb-6 ${isLightMode ? 'text-gray-600' : 'text-gray-400'}`}>
                        We have notified your Paw Partner, <span className={isLightMode ? 'text-gray-900' : 'text-white'}>Marcus R.</span>
                      </p>

                      <button 
                        onClick={addToCalendar}
                        className={`flex items-center gap-2 px-6 py-3 transition-colors rounded-sm ${isLightMode ? 'bg-gray-900 hover:bg-gray-800 text-white' : 'bg-white hover:bg-gray-100 text-gray-900'}`}
                      >
                        <CalendarIcon className="w-4 h-4" />
                        Add to Calendar
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Incident Reporting Form */}
            <motion.div
              className={`border rounded-sm p-8 ${isLightMode ? 'bg-white border-gray-200' : 'bg-gray-800 border-gray-700'}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="mb-6">Need Help? Raise an Incident Ticket</h2>

              {submitted ? (
                <motion.div
                  className="text-center py-12"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isLightMode ? 'bg-gray-900' : 'bg-gray-700'}`}>
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="mb-2">Incident Report Submitted</h3>
                  <p className={isLightMode ? 'text-gray-600' : 'text-gray-400'}>
                    We&apos;ve received your report and will respond within 24 hours via your preferred contact method.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Incident Type */}
                  <div>
                    <label className={`block mb-2 ${isLightMode ? 'text-gray-700' : 'text-gray-300'}`}>Incident Type *</label>
                    <select 
                      value={incidentType}
                      onChange={(e) => setIncidentType(e.target.value)}
                      className={`w-full border rounded-sm px-4 py-3 outline-none transition-colors ${isLightMode ? 'bg-white border-gray-300 focus:border-gray-900' : 'bg-gray-900 border-gray-700 focus:border-gray-500'}`}
                      required
                    >
                      <option value="">Select an incident type</option>
                      <option value="walker-renter">Walker/Renter Issue (Behavior, Lateness)</option>
                      <option value="pet-injury">Pet Injury/Accident</option>
                      <option value="app-billing">App/Billing Issue</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {/* Subject Line */}
                  <div>
                    <label className={`block mb-2 ${isLightMode ? 'text-gray-700' : 'text-gray-300'}`}>Subject Line *</label>
                    <input 
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className={`w-full border rounded-sm px-4 py-3 outline-none transition-colors ${isLightMode ? 'bg-white border-gray-300 focus:border-gray-900' : 'bg-gray-900 border-gray-700 focus:border-gray-500'}`}
                      placeholder="Brief summary of the issue"
                      required
                    />
                  </div>

                  {/* Detailed Description */}
                  <div>
                    <label className={`block mb-2 ${isLightMode ? 'text-gray-700' : 'text-gray-300'}`}>Detailed Description *</label>
                    <textarea 
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className={`w-full border rounded-sm px-4 py-3 outline-none transition-colors resize-none ${isLightMode ? 'bg-white border-gray-300 focus:border-gray-900' : 'bg-gray-900 border-gray-700 focus:border-gray-500'}`}
                      rows={6}
                      placeholder="Please provide full context of the incident..."
                      required
                    />
                  </div>

                  {/* Image Upload */}
                  <div>
                    <label className={`block mb-2 ${isLightMode ? 'text-gray-700' : 'text-gray-300'}`}>Upload Evidence (Max 3 Images)</label>
                    <div className="space-y-4">
                      {uploadedImages.length < 3 && (
                        <label className={`flex items-center justify-center w-full h-32 border-2 border-dashed rounded-sm transition-colors cursor-pointer ${isLightMode ? 'border-gray-300 hover:border-gray-900' : 'border-gray-700 hover:border-gray-500'}`}>
                          <div className="text-center">
                            <Upload className={`w-8 h-8 mx-auto mb-2 ${isLightMode ? 'text-gray-400' : 'text-gray-500'}`} />
                            <p className={isLightMode ? 'text-gray-600' : 'text-gray-400'}>Click to upload images</p>
                            <p className={isLightMode ? 'text-gray-400' : 'text-gray-500'}>PNG, JPG up to 5MB</p>
                          </div>
                          <input 
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </label>
                      )}

                      {/* Uploaded Images Preview */}
                      {uploadedImages.length > 0 && (
                        <div className="grid grid-cols-3 gap-4">
                          {uploadedImages.map((image, index) => (
                            <div key={index} className="relative group">
                              <img 
                                src={image} 
                                alt={`Upload ${index + 1}`}
                                className={`w-full h-24 object-cover rounded-sm border ${isLightMode ? 'border-gray-300' : 'border-gray-700'}`}
                              />
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-sm opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      <p className={isLightMode ? 'text-gray-500' : 'text-gray-400'}>{uploadedImages.length}/3 images uploaded</p>
                    </div>
                  </div>

                  {/* Preferred Contact */}
                  <div>
                    <label className={`block mb-3 ${isLightMode ? 'text-gray-700' : 'text-gray-300'}`}>How should we respond? *</label>
                    <div className="space-y-2">
                      {[
                        { value: 'email', label: 'Email - proxypaw.com', icon: Mail },
                        { value: 'phone', label: 'Phone Call - +91 9000454967', icon: Phone },
                        { value: 'chatbot', label: 'In-App Chatbot', icon: MessageSquare }
                      ].map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setPreferredContact(option.value)}
                          className={`w-full text-left px-4 py-3 rounded-sm border transition-colors flex items-center gap-3 ${
                            preferredContact === option.value 
                              ? isLightMode 
                                ? 'bg-gray-900 border-gray-900 text-white' 
                                : 'bg-white border-white text-gray-900'
                              : isLightMode
                                ? 'border-gray-300 hover:border-gray-400'
                                : 'border-gray-700 hover:border-gray-600'
                          }`}
                        >
                          <option.icon className="w-5 h-5" />
                          <span>{option.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button 
                    type="submit"
                    className={`w-full py-4 transition-colors rounded-sm flex items-center justify-center gap-2 ${isLightMode ? 'bg-gray-900 hover:bg-gray-800 text-white' : 'bg-white hover:bg-gray-100 text-gray-900'}`}
                  >
                    <AlertCircle className="w-5 h-5" />
                    Submit Incident Report
                  </button>
                </form>
              )}
            </motion.div>
          </div>

          {/* Recent Activity Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              className={`border rounded-sm p-6 sticky top-24 ${isLightMode ? 'bg-white border-gray-200' : 'bg-gray-800 border-gray-700'}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="mb-6">Recent Activity & Updates</h3>
              
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    className={`pb-4 border-b last:border-0 ${isLightMode ? 'border-gray-200' : 'border-gray-700'}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                  >
                    <div className="flex gap-3">
                      <div className={`p-2 rounded-sm h-fit ${isLightMode ? 'bg-gray-100' : 'bg-gray-700'}`}>
                        <activity.icon className={`w-4 h-4 ${activity.color}`} />
                      </div>
                      <div className="flex-1">
                        <p className={`mb-1 ${isLightMode ? 'text-gray-700' : 'text-gray-300'}`}>{activity.message}</p>
                        <p className={isLightMode ? 'text-gray-500' : 'text-gray-400'}>{activity.time}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Quick Help */}
              <div className={`mt-8 pt-6 border-t ${isLightMode ? 'border-gray-200' : 'border-gray-700'}`}>
                <h3 className="mb-4">Need Quick Help?</h3>
                <div className="space-y-2">
                  <button className={`w-full text-left px-4 py-3 rounded-sm transition-colors flex items-center gap-3 ${isLightMode ? 'bg-gray-50 hover:bg-gray-100' : 'bg-gray-700 hover:bg-gray-600'}`}>
                    <ImageIcon className={`w-4 h-4 ${isLightMode ? 'text-gray-900' : 'text-white'}`} />
                    <span>View Safety Guidelines</span>
                  </button>
                  <button className={`w-full text-left px-4 py-3 rounded-sm transition-colors flex items-center gap-3 ${isLightMode ? 'bg-gray-50 hover:bg-gray-100' : 'bg-gray-700 hover:bg-gray-600'}`}>
                    <MessageSquare className={`w-4 h-4 ${isLightMode ? 'text-gray-900' : 'text-white'}`} />
                    <span>FAQs</span>
                  </button>
                  <button className={`w-full text-left px-4 py-3 rounded-sm transition-colors flex items-center gap-3 ${isLightMode ? 'bg-gray-50 hover:bg-gray-100' : 'bg-gray-700 hover:bg-gray-600'}`}>
                    <Phone className={`w-4 h-4 ${isLightMode ? 'text-gray-900' : 'text-white'}`} />
                    <span>Emergency Contact</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}