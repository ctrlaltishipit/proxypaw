import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, Clock, DollarSign } from 'lucide-react';
import { WALK_DURATIONS_INR, formatPriceDual, formatPrice, detectCurrency } from '../utils/pricing';

interface BookingModalProps {
  volunteer: {
    id: string;
    name: string;
    rating: number;
    profileImage: string;
  };
  onClose: () => void;
  onProceedToPayment: (bookingDetails: {
    volunteerId: string;
    volunteerName: string;
    date: string;
    time: string;
    duration: number;
    totalAmount: number;
  }) => void;
}

export default function BookingModal({ volunteer, onClose, onProceedToPayment }: BookingModalProps) {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedDuration, setSelectedDuration] = useState('30');

  // Generate next 7 days
  const generateDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        value: date.toISOString().split('T')[0],
        label: i === 0 ? 'today' : i === 1 ? 'tomorrow' : date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).toLowerCase()
      });
    }
    return dates;
  };

  // Generate time slots (6 AM to 9 PM)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 6; hour <= 21; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const period = hour >= 12 ? 'pm' : 'am';
        const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        const displayTime = `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
        slots.push({ value: time, label: displayTime });
      }
    }
    return slots;
  };

  const userCurrency = detectCurrency();
  const durations = WALK_DURATIONS_INR.map(d => ({
    value: d.value,
    label: d.label,
    price: d.priceINR,
  }));

  const dates = generateDates();
  const timeSlots = generateTimeSlots();
  const selectedDurationObj = durations.find(d => d.value === selectedDuration);
  const totalPrice = selectedDurationObj?.price || 0;

  const canProceed = selectedDate && selectedTime && selectedDuration;

  const handleProceed = () => {
    if (canProceed && selectedDurationObj) {
      const selectedTimeLabel = timeSlots.find(t => t.value === selectedTime)?.label || selectedTime;
      console.log('BookingModal - Proceeding to payment with:', {
        volunteerId: volunteer.id,
        volunteerName: volunteer.name,
        date: selectedDate,
        time: selectedTimeLabel,
        duration: parseInt(selectedDurationObj.value),
        totalAmount: totalPrice
      });
      onProceedToPayment({
        volunteerId: volunteer.id,
        volunteerName: volunteer.name,
        date: selectedDate,
        time: selectedTimeLabel,
        duration: parseInt(selectedDurationObj.value),
        totalAmount: totalPrice
      });
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-sm max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-xl">
                {volunteer.profileImage}
              </div>
              <div>
                <h2 className="text-gray-900">book walk with {volunteer.name}</h2>
                <p className="text-gray-600">select your preferred slot</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-sm transition-colors"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Date Selection */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-5 h-5 text-[#6B4423]" />
                <label className="text-gray-900">select date</label>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {dates.map((date) => (
                  <button
                    key={date.value}
                    onClick={() => setSelectedDate(date.value)}
                    className={`p-3 rounded-sm border-2 transition-all ${
                      selectedDate === date.value
                        ? 'border-[#6B4423] bg-gradient-to-br from-[#6B4423]/10 to-[#8B6F47]/10'
                        : 'border-gray-300 hover:border-[#6B4423]/50'
                    }`}
                  >
                    <div className="text-sm text-gray-900">{date.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Time Selection */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-5 h-5 text-[#4A7C59]" />
                <label className="text-gray-900">select time</label>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-2 border border-gray-200 rounded-sm">
                {timeSlots.map((slot) => (
                  <button
                    key={slot.value}
                    onClick={() => setSelectedTime(slot.value)}
                    className={`p-2 rounded-sm border transition-all text-sm ${
                      selectedTime === slot.value
                        ? 'border-[#4A7C59] bg-gradient-to-br from-[#4A7C59]/10 to-[#5D7349]/10 text-gray-900'
                        : 'border-gray-300 hover:border-[#4A7C59]/50 text-gray-600'
                    }`}
                  >
                    {slot.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration Selection */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="w-5 h-5 text-[#8B6F47]" />
                <label className="text-gray-900">select duration</label>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {durations.map((duration) => (
                  <button
                    key={duration.value}
                    onClick={() => setSelectedDuration(duration.value)}
                    className={`p-4 rounded-sm border-2 transition-all ${
                      selectedDuration === duration.value
                        ? 'border-[#8B6F47] bg-gradient-to-br from-[#8B6F47]/10 to-[#A0855B]/10'
                        : 'border-gray-300 hover:border-[#8B6F47]/50'
                    }`}
                  >
                    <div className="text-gray-900 mb-1">{duration.label}</div>
                    <div className="text-sm text-gray-600">{formatPrice(duration.price, 'INR')}</div>
                    {userCurrency !== 'INR' && (
                      <div className="text-xs text-gray-500">~{formatPrice(duration.price, userCurrency)}</div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Summary */}
            {canProceed && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-sm border border-gray-200"
              >
                <h3 className="text-gray-900 mb-3">booking summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">volunteer:</span>
                    <span className="text-gray-900">{volunteer.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">date:</span>
                    <span className="text-gray-900">{dates.find(d => d.value === selectedDate)?.label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">time:</span>
                    <span className="text-gray-900">{timeSlots.find(t => t.value === selectedTime)?.label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">duration:</span>
                    <span className="text-gray-900">{selectedDurationObj?.label}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-300">
                    <span className="text-gray-900">total:</span>
                    <span className="text-gray-900">{formatPriceDual(totalPrice, userCurrency)}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 hover:border-gray-400 text-gray-900 rounded-sm transition-colors"
            >
              cancel
            </button>
            <button
              onClick={handleProceed}
              disabled={!canProceed}
              className={`flex-1 px-6 py-3 rounded-sm transition-all ${
                canProceed
                  ? 'bg-gradient-to-br from-[#6B4423] to-[#8B6F47] hover:from-[#8B6F47] hover:to-[#6B4423] text-white shadow-md hover:shadow-lg'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              proceed to payment
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}