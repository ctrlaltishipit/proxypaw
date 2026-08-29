import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Clock, User, MapPin, Edit2, Bell, X, Check } from 'lucide-react';
import { formatPrice, formatPriceDual, detectCurrency } from '../utils/pricing';

interface Booking {
  id: string;
  volunteerId: string;
  volunteerName: string;
  date: string;
  time: string;
  duration: number;
  amount: number;
  status: 'upcoming' | 'completed' | 'cancelled';
  location: string;
}

interface MyBookingsProps {
  bookings: Booking[];
  onReschedule: (bookingId: string, newDate: string, newTime: string) => void;
  onSetReminder: (bookingId: string) => void;
  onCancelBooking: (bookingId: string) => void;
}

export default function MyBookings({ bookings, onReschedule, onSetReminder, onCancelBooking }: MyBookingsProps) {
  const [editingBooking, setEditingBooking] = useState<string | null>(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [reminderSet, setReminderSet] = useState<{ [key: string]: boolean }>({});

  const upcomingBookings = bookings.filter(b => b.status === 'upcoming');
  const pastBookings = bookings.filter(b => b.status === 'completed');

  const handleReschedule = (bookingId: string) => {
    if (newDate && newTime) {
      onReschedule(bookingId, newDate, newTime);
      setEditingBooking(null);
      setNewDate('');
      setNewTime('');
    }
  };

  const handleSetReminder = (bookingId: string) => {
    onSetReminder(bookingId);
    setReminderSet({ ...reminderSet, [bookingId]: true });
    setTimeout(() => {
      setReminderSet({ ...reminderSet, [bookingId]: false });
    }, 3000);
  };

  const timeSlots = [
    '06:00 AM', '07:00 AM', '08:00 AM', '09:00 AM',
    '04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM'
  ];

  return (
    <div className="space-y-8">
      {/* Upcoming Bookings */}
      <div>
        <h2 className="mb-6 text-gray-900">upcoming walks</h2>
        {upcomingBookings.length === 0 ? (
          <div className="bg-white border border-gray-300 rounded-sm p-8 text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">no upcoming walks scheduled</p>
            <button className="px-6 py-2 bg-[#4A9EFF] text-white rounded-sm hover:bg-[#3A8EEF] transition-colors">
              book a walk
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingBookings.map((booking) => (
              <motion.div
                key={booking.id}
                className="bg-white border border-gray-300 rounded-sm p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                layout
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-[#4A9EFF]/10 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-[#4A9EFF]" />
                      </div>
                      <div>
                        <h3 className="text-gray-900">{booking.volunteerName}</h3>
                        <div className="text-gray-600 flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {booking.location}
                        </div>
                      </div>
                    </div>

                    {editingBooking === booking.id ? (
                      <div className="mt-4 p-4 bg-gray-50 rounded-sm border border-gray-300">
                        <h4 className="mb-4 text-gray-900">reschedule walk</h4>
                        <div className="space-y-4">
                          <div>
                            <label className="block mb-2 text-gray-700">new date</label>
                            <input
                              type="date"
                              value={newDate}
                              onChange={(e) => setNewDate(e.target.value)}
                              min={new Date().toISOString().split('T')[0]}
                              className="w-full px-4 py-2 border border-gray-300 rounded-sm focus:outline-none focus:border-[#4A9EFF]"
                            />
                          </div>
                          <div>
                            <label className="block mb-2 text-gray-700">new time</label>
                            <div className="grid grid-cols-4 gap-2">
                              {timeSlots.map((slot) => (
                                <button
                                  key={slot}
                                  onClick={() => setNewTime(slot)}
                                  className={`px-3 py-2 border rounded-sm transition-colors text-sm ${
                                    newTime === slot
                                      ? 'border-[#4A9EFF] bg-[#4A9EFF] text-white'
                                      : 'border-gray-300 hover:border-gray-400'
                                  }`}
                                >
                                  {slot}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleReschedule(booking.id)}
                              disabled={!newDate || !newTime}
                              className={`flex-1 py-2 rounded-sm transition-colors flex items-center justify-center gap-2 ${
                                newDate && newTime
                                  ? 'bg-[#4A9EFF] text-white hover:bg-[#3A8EEF]'
                                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              }`}
                            >
                              <Check className="w-4 h-4" />
                              confirm
                            </button>
                            <button
                              onClick={() => {
                                setEditingBooking(null);
                                setNewDate('');
                                setNewTime('');
                              }}
                              className="flex-1 py-2 border border-gray-300 rounded-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                            >
                              <X className="w-4 h-4" />
                              cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-2 text-gray-700">
                          <Calendar className="w-5 h-5 text-[#4A9EFF]" />
                          <div>
                            <div className="text-gray-600">date</div>
                            <div>{new Date(booking.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <Clock className="w-5 h-5 text-[#4A9EFF]" />
                          <div>
                            <div className="text-gray-600">time</div>
                            <div>{booking.time}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <Clock className="w-5 h-5 text-[#4A9EFF]" />
                          <div>
                            <div className="text-gray-600">duration</div>
                            <div>{booking.duration} min</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {editingBooking !== booking.id && (
                  <div className="flex items-center justify-between pt-4 border-t border-gray-300">
                    <div className="text-gray-600">
                      total: <span className="text-[#4A7C59]">{formatPriceDual(booking.amount)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSetReminder(booking.id)}
                        className={`px-4 py-2 border rounded-sm transition-colors flex items-center gap-2 ${
                          reminderSet[booking.id]
                            ? 'border-green-600 bg-green-50 text-green-600'
                            : 'border-gray-300 hover:border-[#4A9EFF]'
                        }`}
                      >
                        <Bell className="w-4 h-4" />
                        {reminderSet[booking.id] ? 'reminder set!' : 'set reminder'}
                      </button>
                      <button
                        onClick={() => setEditingBooking(booking.id)}
                        className="px-4 py-2 border border-gray-300 rounded-sm hover:border-[#4A9EFF] transition-colors flex items-center gap-2"
                      >
                        <Edit2 className="w-4 h-4" />
                        reschedule
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Past Bookings */}
      {pastBookings.length > 0 && (
        <div>
          <h2 className="mb-6 text-gray-900">past walks</h2>
          <div className="space-y-4">
            {pastBookings.map((booking) => (
              <motion.div
                key={booking.id}
                className="bg-white border border-gray-300 rounded-sm p-6 opacity-75"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 0.75, y: 0 }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="text-gray-900">{booking.volunteerName}</h3>
                        <div className="text-gray-600">completed</div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Calendar className="w-5 h-5 text-gray-500" />
                        <div>
                          <div className="text-gray-600">date</div>
                          <div>{new Date(booking.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <Clock className="w-5 h-5 text-gray-500" />
                        <div>
                          <div className="text-gray-600">time</div>
                          <div>{booking.time}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <Clock className="w-5 h-5 text-gray-500" />
                        <div>
                          <div className="text-gray-600">duration</div>
                          <div>{booking.duration} min</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-gray-600">{formatPrice(booking.amount, 'INR')}{detectCurrency() !== 'INR' ? ` (~${formatPrice(booking.amount, detectCurrency())})` : ''}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
