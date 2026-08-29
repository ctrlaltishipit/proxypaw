import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  Upload, 
  CheckCircle, 
  FileText,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  AlertCircle,
  X,
  Sun,
  Moon
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface VolunteerApplicationFormProps {
  onBack: () => void;
  onSubmitSuccess: () => void;
}

export default function VolunteerApplicationForm({ onBack, onSubmitSuccess }: VolunteerApplicationFormProps) {
  const { theme, toggleTheme } = useTheme();
  const isLightMode = theme === 'light';
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: 'Hyderabad',
    dateOfBirth: '',
    experience: '',
    availability: '',
    emergencyContact: '',
    emergencyPhone: ''
  });

  const [documents, setDocuments] = useState<{
    idProof: File | null;
    addressProof: File | null;
    photo: File | null;
  }>({
    idProof: null,
    addressProof: null,
    photo: null
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, docType: 'idProof' | 'addressProof' | 'photo') => {
    const file = e.target.files?.[0];
    if (file) {
      setDocuments(prev => ({ ...prev, [docType]: file }));
      if (errors[docType]) {
        setErrors(prev => ({ ...prev, [docType]: '' }));
      }
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.fullName.trim()) newErrors.fullName = 'full name is required';
    if (!formData.email.trim()) newErrors.email = 'email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'invalid email format';
    if (!formData.phone.trim()) newErrors.phone = 'phone number is required';
    else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) newErrors.phone = 'invalid phone number';
    if (!formData.address.trim()) newErrors.address = 'address is required';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'date of birth is required';
    if (!formData.emergencyContact.trim()) newErrors.emergencyContact = 'emergency contact is required';
    if (!formData.emergencyPhone.trim()) newErrors.emergencyPhone = 'emergency phone is required';
    
    if (!documents.idProof) newErrors.idProof = 'id proof is required';
    if (!documents.addressProof) newErrors.addressProof = 'address proof is required';
    if (!documents.photo) newErrors.photo = 'photo is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    setIsSubmitting(false);
    onSubmitSuccess();
  };

  return (
    <div className={`min-h-screen ${isLightMode ? 'bg-white text-black' : 'bg-black text-white'}`}>
      {/* Header */}
      <div className={`border-b sticky top-0 z-40 backdrop-blur-sm ${
        isLightMode 
          ? 'border-gray-200 bg-white/80' 
          : 'border-gray-900 bg-gray-950/50'
      }`}>
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <button 
            onClick={onBack}
            className={`flex items-center gap-2 transition-colors lowercase ${
              isLightMode ? 'hover:text-gray-600' : 'hover:text-gray-400'
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
            back
          </button>
          <div className="flex items-center gap-2">
            <User className="w-6 h-6" />
            <h1 className="text-xl lowercase">volunteer application</h1>
          </div>
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-sm transition-colors ${
              isLightMode
                ? 'hover:bg-gray-100 text-gray-900'
                : 'hover:bg-gray-800 text-white'
            }`}
            title={isLightMode ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            {isLightMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Title */}
        <motion.div 
          className="mb-8 text-center lowercase"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="mb-2">become a volunteer walker</h2>
          <p className={isLightMode ? 'text-gray-600' : 'text-gray-400'}>
            join our community and help pets get the exercise they need
          </p>
        </motion.div>

        <form onSubmit={handleSubmit}>
          {/* Personal Information */}
          <motion.div 
            className={`rounded-sm border p-6 mb-6 ${
              isLightMode ? 'bg-gray-50 border-gray-200' : 'bg-gray-950 border-gray-800'
            }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="mb-4 lowercase flex items-center gap-2">
              <User className="w-5 h-5" />
              personal information
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm mb-2 lowercase ${isLightMode ? 'text-gray-700' : 'text-gray-300'}`}>
                  full name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 rounded-sm border lowercase ${
                    isLightMode 
                      ? 'bg-white border-gray-300 focus:border-gray-900' 
                      : 'bg-black border-gray-700 focus:border-white'
                  } focus:outline-none`}
                  placeholder="enter your full name"
                />
                {errors.fullName && (
                  <p className="text-red-500 text-xs mt-1 lowercase">{errors.fullName}</p>
                )}
              </div>

              <div>
                <label className={`block text-sm mb-2 lowercase ${isLightMode ? 'text-gray-700' : 'text-gray-300'}`}>
                  email address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 rounded-sm border lowercase ${
                    isLightMode 
                      ? 'bg-white border-gray-300 focus:border-gray-900' 
                      : 'bg-black border-gray-700 focus:border-white'
                  } focus:outline-none`}
                  placeholder="your@email.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1 lowercase">{errors.email}</p>
                )}
              </div>

              <div>
                <label className={`block text-sm mb-2 lowercase ${isLightMode ? 'text-gray-700' : 'text-gray-300'}`}>
                  phone number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 rounded-sm border lowercase ${
                    isLightMode 
                      ? 'bg-white border-gray-300 focus:border-gray-900' 
                      : 'bg-black border-gray-700 focus:border-white'
                  } focus:outline-none`}
                  placeholder="10-digit mobile number"
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1 lowercase">{errors.phone}</p>
                )}
              </div>

              <div>
                <label className={`block text-sm mb-2 lowercase ${isLightMode ? 'text-gray-700' : 'text-gray-300'}`}>
                  date of birth *
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 rounded-sm border lowercase ${
                    isLightMode 
                      ? 'bg-white border-gray-300 focus:border-gray-900' 
                      : 'bg-black border-gray-700 focus:border-white'
                  } focus:outline-none`}
                />
                {errors.dateOfBirth && (
                  <p className="text-red-500 text-xs mt-1 lowercase">{errors.dateOfBirth}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className={`block text-sm mb-2 lowercase ${isLightMode ? 'text-gray-700' : 'text-gray-300'}`}>
                  address *
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 rounded-sm border lowercase ${
                    isLightMode 
                      ? 'bg-white border-gray-300 focus:border-gray-900' 
                      : 'bg-black border-gray-700 focus:border-white'
                  } focus:outline-none`}
                  placeholder="flat/tower, community name"
                />
                {errors.address && (
                  <p className="text-red-500 text-xs mt-1 lowercase">{errors.address}</p>
                )}
              </div>

              <div>
                <label className={`block text-sm mb-2 lowercase ${isLightMode ? 'text-gray-700' : 'text-gray-300'}`}>
                  city
                </label>
                <select
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 rounded-sm border lowercase ${
                    isLightMode 
                      ? 'bg-white border-gray-300 focus:border-gray-900' 
                      : 'bg-black border-gray-700 focus:border-white'
                  } focus:outline-none`}
                >
                  <option value="Hyderabad">hyderabad</option>
                  <option value="Bangalore">bangalore</option>
                  <option value="Mumbai">mumbai</option>
                  <option value="Delhi">delhi</option>
                  <option value="Pune">pune</option>
                  <option value="Chennai">chennai</option>
                  <option value="Kolkata">kolkata</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm mb-2 lowercase ${isLightMode ? 'text-gray-700' : 'text-gray-300'}`}>
                  experience with pets
                </label>
                <select
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 rounded-sm border lowercase ${
                    isLightMode 
                      ? 'bg-white border-gray-300 focus:border-gray-900' 
                      : 'bg-black border-gray-700 focus:border-white'
                  } focus:outline-none`}
                >
                  <option value="">select experience</option>
                  <option value="none">no experience</option>
                  <option value="some">some experience</option>
                  <option value="extensive">extensive experience</option>
                  <option value="professional">professional</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Emergency Contact */}
          <motion.div 
            className={`rounded-sm border p-6 mb-6 ${
              isLightMode ? 'bg-gray-50 border-gray-200' : 'bg-gray-950 border-gray-800'
            }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="mb-4 lowercase flex items-center gap-2">
              <Phone className="w-5 h-5" />
              emergency contact
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm mb-2 lowercase ${isLightMode ? 'text-gray-700' : 'text-gray-300'}`}>
                  contact name *
                </label>
                <input
                  type="text"
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 rounded-sm border lowercase ${
                    isLightMode 
                      ? 'bg-white border-gray-300 focus:border-gray-900' 
                      : 'bg-black border-gray-700 focus:border-white'
                  } focus:outline-none`}
                  placeholder="emergency contact name"
                />
                {errors.emergencyContact && (
                  <p className="text-red-500 text-xs mt-1 lowercase">{errors.emergencyContact}</p>
                )}
              </div>

              <div>
                <label className={`block text-sm mb-2 lowercase ${isLightMode ? 'text-gray-700' : 'text-gray-300'}`}>
                  contact phone *
                </label>
                <input
                  type="tel"
                  name="emergencyPhone"
                  value={formData.emergencyPhone}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 rounded-sm border lowercase ${
                    isLightMode 
                      ? 'bg-white border-gray-300 focus:border-gray-900' 
                      : 'bg-black border-gray-700 focus:border-white'
                  } focus:outline-none`}
                  placeholder="10-digit mobile number"
                />
                {errors.emergencyPhone && (
                  <p className="text-red-500 text-xs mt-1 lowercase">{errors.emergencyPhone}</p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Background Check Documents */}
          <motion.div 
            className={`rounded-sm border p-6 mb-6 ${
              isLightMode ? 'bg-gray-50 border-gray-200' : 'bg-gray-950 border-gray-800'
            }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="mb-4 lowercase flex items-center gap-2">
              <FileText className="w-5 h-5" />
              background check verification
            </h3>

            <div className="space-y-4">
              {/* ID Proof */}
              <div>
                <label className={`block text-sm mb-2 lowercase ${isLightMode ? 'text-gray-700' : 'text-gray-300'}`}>
                  id proof (aadhaar/pan/passport) *
                </label>
                <div className={`border-2 border-dashed rounded-sm p-4 text-center ${
                  errors.idProof 
                    ? 'border-red-500' 
                    : isLightMode 
                      ? 'border-gray-300' 
                      : 'border-gray-700'
                }`}>
                  <input
                    type="file"
                    id="idProof"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileChange(e, 'idProof')}
                    className="hidden"
                  />
                  <label htmlFor="idProof" className="cursor-pointer">
                    {documents.idProof ? (
                      <div className="flex items-center justify-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="lowercase">{documents.idProof.name}</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Upload className="w-8 h-8 opacity-50" />
                        <span className="lowercase">click to upload id proof</span>
                        <span className={`text-xs ${isLightMode ? 'text-gray-500' : 'text-gray-500'}`}>
                          jpg, png or pdf (max 5mb)
                        </span>
                      </div>
                    )}
                  </label>
                </div>
                {errors.idProof && (
                  <p className="text-red-500 text-xs mt-1 lowercase">{errors.idProof}</p>
                )}
              </div>

              {/* Address Proof */}
              <div>
                <label className={`block text-sm mb-2 lowercase ${isLightMode ? 'text-gray-700' : 'text-gray-300'}`}>
                  address proof (utility bill/bank statement) *
                </label>
                <div className={`border-2 border-dashed rounded-sm p-4 text-center ${
                  errors.addressProof 
                    ? 'border-red-500' 
                    : isLightMode 
                      ? 'border-gray-300' 
                      : 'border-gray-700'
                }`}>
                  <input
                    type="file"
                    id="addressProof"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileChange(e, 'addressProof')}
                    className="hidden"
                  />
                  <label htmlFor="addressProof" className="cursor-pointer">
                    {documents.addressProof ? (
                      <div className="flex items-center justify-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="lowercase">{documents.addressProof.name}</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Upload className="w-8 h-8 opacity-50" />
                        <span className="lowercase">click to upload address proof</span>
                        <span className={`text-xs ${isLightMode ? 'text-gray-500' : 'text-gray-500'}`}>
                          jpg, png or pdf (max 5mb)
                        </span>
                      </div>
                    )}
                  </label>
                </div>
                {errors.addressProof && (
                  <p className="text-red-500 text-xs mt-1 lowercase">{errors.addressProof}</p>
                )}
              </div>

              {/* Photo */}
              <div>
                <label className={`block text-sm mb-2 lowercase ${isLightMode ? 'text-gray-700' : 'text-gray-300'}`}>
                  recent photograph *
                </label>
                <div className={`border-2 border-dashed rounded-sm p-4 text-center ${
                  errors.photo 
                    ? 'border-red-500' 
                    : isLightMode 
                      ? 'border-gray-300' 
                      : 'border-gray-700'
                }`}>
                  <input
                    type="file"
                    id="photo"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'photo')}
                    className="hidden"
                  />
                  <label htmlFor="photo" className="cursor-pointer">
                    {documents.photo ? (
                      <div className="flex items-center justify-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="lowercase">{documents.photo.name}</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Upload className="w-8 h-8 opacity-50" />
                        <span className="lowercase">click to upload your photo</span>
                        <span className={`text-xs ${isLightMode ? 'text-gray-500' : 'text-gray-500'}`}>
                          jpg or png (max 5mb)
                        </span>
                      </div>
                    )}
                  </label>
                </div>
                {errors.photo && (
                  <p className="text-red-500 text-xs mt-1 lowercase">{errors.photo}</p>
                )}
              </div>
            </div>

            <div className={`mt-4 p-3 rounded-sm flex items-start gap-2 ${
              isLightMode ? 'bg-gray-100' : 'bg-gray-900'
            }`}>
              <AlertCircle className={`w-4 h-4 mt-0.5 ${isLightMode ? 'text-gray-700' : 'text-gray-300'}`} />
              <p className={`text-xs lowercase ${isLightMode ? 'text-gray-700' : 'text-gray-300'}`}>
                all documents will be verified for background check. your information is secure and will be used only for verification purposes.
              </p>
            </div>
          </motion.div>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-4 rounded-sm transition-colors lowercase flex items-center justify-center gap-2 ${
                isSubmitting
                  ? isLightMode
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gray-700 cursor-not-allowed'
                  : isLightMode 
                    ? 'bg-gray-900 hover:bg-gray-800 text-white' 
                    : 'bg-white hover:bg-gray-100 text-gray-900'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  submitting application...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  submit application
                </>
              )}
            </button>
          </motion.div>
        </form>
      </div>
    </div>
  );
}