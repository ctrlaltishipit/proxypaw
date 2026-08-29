import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Star, Calendar, Clock, MapPin, CheckCircle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { formatPrice, formatPriceDual, detectCurrency, VOLUNTEER_TIER_RATES_INR } from '../utils/pricing';

interface Volunteer {
  id: string;
  name: string;
  rating: number;
  completedWalks: number;
  isTopRated: boolean;
  experience: string;
  specialty: string;
  availability: string[];
  location: string;
  hourlyRate: number;
}

interface BookingPageProps {
  onBack: () => void;
  onProceedToPayment: (booking: {
    volunteerId: string;
    volunteerName: string;
    date: string;
    time: string;
    duration: number;
    totalAmount: number;
  }) => void;
  userRole: 'owner' | 'walker' | 'renter' | 'admin';
}

export default function BookingPage({ onBack, onProceedToPayment, userRole }: BookingPageProps) {
  const { theme } = useTheme();
  const isLightMode = theme === 'light';
  const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [duration, setDuration] = useState(30);

  const volunteers: Volunteer[] = [
    {
      id: 'v1',
      name: 'raj kumar',
      rating: 4.9,
      completedWalks: 156,
      isTopRated: true,
      experience: '3 years',
      specialty: 'large breeds',
      availability: ['morning', 'evening'],
      location: 'my home vihanga',
      hourlyRate: VOLUNTEER_TIER_RATES_INR['Pack Leader']
    },
    {
      id: 'v2',
      name: 'priya sharma',
      rating: 4.8,
      completedWalks: 142,
      isTopRated: true,
      experience: '2 years',
      specialty: 'puppies & small breeds',
      availability: ['morning', 'afternoon'],
      location: 'prestige high fields',
      hourlyRate: VOLUNTEER_TIER_RATES_INR['Pack Leader']
    },
    {
      id: 'v3',
      name: 'amit reddy',
      rating: 4.7,
      completedWalks: 98,
      isTopRated: false,
      experience: '1.5 years',
      specialty: 'senior dogs',
      availability: ['afternoon', 'evening'],
      location: 'my home bhooja',
      hourlyRate: VOLUNTEER_TIER_RATES_INR['Pup Scout']
    },
    {
      id: 'v4',
      name: 'sneha patel',
      rating: 4.9,
      completedWalks: 203,
      isTopRated: true,
      experience: '4 years',
      specialty: 'all breeds',
      availability: ['morning', 'afternoon', 'evening'],
      location: 'rajapushpa atria',
      hourlyRate: VOLUNTEER_TIER_RATES_INR['Alpha Guardian']
    }
  ];

  const timeSlots = [
    '06:00 AM', '07:00 AM', '08:00 AM', '09:00 AM',
    '04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM'
  ];

  const calculateTotal = () => {
    if (!selectedVolunteer) return 0;
    return (selectedVolunteer.hourlyRate * duration) / 60;
  };

  const handleProceed = () => {
    if (selectedVolunteer && selectedDate && selectedTime) {
      onProceedToPayment({
        volunteerId: selectedVolunteer.id,
        volunteerName: selectedVolunteer.name,
        date: selectedDate,
        time: selectedTime,
        duration: duration,
        totalAmount: calculateTotal()
      });
    }
  };

  const isFormComplete = selectedVolunteer && selectedDate && selectedTime && duration > 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-900" />
          </button>
          <h1 className="text-gray-900">book a walk</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Volunteer Selection */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-sm border border-gray-300">
              <h2 className="mb-6 text-gray-900">select your volunteer</h2>
              <div className="space-y-4">
                {volunteers.map((volunteer) => (
                  <motion.div
                    key={volunteer.id}
                    className={`p-4 border rounded-sm cursor-pointer transition-all ${
                      selectedVolunteer?.id === volunteer.id
                        ? 'border-gray-900 bg-gray-100'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onClick={() => setSelectedVolunteer(volunteer)}
                    whileHover={{ scale: 1.01 }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-gray-900">{volunteer.name}</h3>
                          {volunteer.isTopRated && (
                            <div className="flex items-center gap-1 text-green-600">
                              <Star className="w-4 h-4 fill-current" />
                              <span className="text-sm">top rated</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-gray-600 mb-2">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span>{volunteer.rating}</span>
                          </div>
                          <span>•</span>
                          <span>{volunteer.completedWalks} walks</span>
                          <span>•</span>
                          <span>{volunteer.experience}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 mb-2">
                          <MapPin className="w-4 h-4" />
                          <span>{volunteer.location}</span>
                        </div>
                        <div className="text-gray-600">
                          <span className="font-medium">specialty:</span> {volunteer.specialty}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-gray-900 mb-1">
                          {formatPrice(volunteer.hourlyRate, 'INR')}/hr
                          {detectCurrency() !== 'INR' && (
                            <div className="text-xs text-gray-500">~{formatPrice(volunteer.hourlyRate, detectCurrency())}/hr</div>
                          )}
                        </div>
                        {selectedVolunteer?.id === volunteer.id && (
                          <CheckCircle className="w-6 h-6 text-gray-900" />
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Date & Time Selection */}
            {selectedVolunteer && (
              <motion.div
                className="bg-white p-6 rounded-sm border border-gray-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h2 className="mb-6 text-gray-900">select date & time</h2>
                
                <div className="space-y-6">
                  {/* Date Selection */}
                  <div>
                    <label className="block mb-3 text-gray-700">date</label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:outline-none focus:border-gray-900"
                    />
                  </div>

                  {/* Time Selection */}
                  <div>
                    <label className="block mb-3 text-gray-700">time slot</label>
                    <div className="grid grid-cols-4 gap-3">
                      {timeSlots.map((slot) => (
                        <button
                          key={slot}
                          onClick={() => setSelectedTime(slot)}
                          className={`px-4 py-3 border rounded-sm transition-colors ${
                            selectedTime === slot
                              ? 'border-gray-900 bg-gray-900 text-white'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Duration Selection */}
                  <div>
                    <label className="block mb-3 text-gray-700">duration (minutes)</label>
                    <div className="grid grid-cols-4 gap-3">
                      {[30, 45, 60, 90].map((mins) => (
                        <button
                          key={mins}
                          onClick={() => setDuration(mins)}
                          className={`px-4 py-3 border rounded-sm transition-colors ${
                            duration === mins
                              ? 'border-gray-900 bg-gray-900 text-white'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          {mins} min
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-sm border border-gray-300 sticky top-8">
              <h2 className="mb-6 text-gray-900">booking summary</h2>
              
              {selectedVolunteer ? (
                <div className="space-y-4">
                  <div className="pb-4 border-b border-gray-300">
                    <div className="text-gray-600 mb-1">volunteer</div>
                    <div className="text-gray-900">{selectedVolunteer.name}</div>
                  </div>

                  {selectedDate && (
                    <div className="pb-4 border-b border-gray-300">
                      <div className="text-gray-600 mb-1">date</div>
                      <div className="text-gray-900 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(selectedDate).toLocaleDateString('en-IN', { 
                          day: 'numeric', 
                          month: 'long', 
                          year: 'numeric' 
                        })}
                      </div>
                    </div>
                  )}

                  {selectedTime && (
                    <div className="pb-4 border-b border-gray-300">
                      <div className="text-gray-600 mb-1">time</div>
                      <div className="text-gray-900 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {selectedTime}
                      </div>
                    </div>
                  )}

                  <div className="pb-4 border-b border-gray-300">
                    <div className="text-gray-600 mb-1">duration</div>
                    <div className="text-gray-900">{duration} minutes</div>
                  </div>

                  <div className="pb-4 border-b border-gray-300">
                    <div className="text-gray-600 mb-1">rate</div>
                    <div className="text-gray-900">{formatPriceDual(selectedVolunteer.hourlyRate)}/hour</div>
                  </div>

                  <div className="pt-2">
                    <div className="text-gray-600 mb-1">total amount</div>
                    <div className="text-gray-900">{formatPriceDual(calculateTotal())}</div>
                  </div>

                  <button
                    onClick={handleProceed}
                    disabled={!isFormComplete}
                    className={`w-full py-3 rounded-sm transition-colors ${
                      isFormComplete
                        ? 'bg-gray-900 text-white hover:bg-gray-800'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    proceed to payment
                  </button>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  select a volunteer to continue
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}