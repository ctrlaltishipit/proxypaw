import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import MyBookings from './MyBookings';
import { useTheme } from '../contexts/ThemeContext';

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

interface BookingsScreenProps {
  onBack: () => void;
  userRole: 'owner' | 'walker' | 'renter' | 'admin';
}

export default function BookingsScreen({ onBack, userRole }: BookingsScreenProps) {
  const { theme } = useTheme();
  const isLightMode = theme === 'light';
  
  // Mock bookings data - in a real app, this would come from a backend
  const [bookings, setBookings] = useState<Booking[]>([
    {
      id: 'BK001',
      volunteerId: 'v1',
      volunteerName: 'raj kumar',
      date: '2025-12-15',
      time: '07:00 AM',
      duration: 60,
      amount: 200,
      status: 'upcoming',
      location: 'my home vihanga'
    },
    {
      id: 'BK002',
      volunteerId: 'v2',
      volunteerName: 'priya sharma',
      date: '2025-12-18',
      time: '06:00 PM',
      duration: 45,
      amount: 135,
      status: 'upcoming',
      location: 'prestige high fields'
    },
    {
      id: 'BK003',
      volunteerId: 'v1',
      volunteerName: 'raj kumar',
      date: '2025-12-05',
      time: '07:00 AM',
      duration: 60,
      amount: 200,
      status: 'completed',
      location: 'my home vihanga'
    }
  ]);

  const handleReschedule = (bookingId: string, newDate: string, newTime: string) => {
    setBookings(bookings.map(booking => 
      booking.id === bookingId 
        ? { ...booking, date: newDate, time: newTime }
        : booking
    ));
  };

  const handleSetReminder = (bookingId: string) => {
    console.log(`Reminder set for booking ${bookingId}`);
    // In a real app, this would trigger a notification/email reminder
  };

  const handleCancelBooking = (bookingId: string) => {
    setBookings(bookings.map(booking => 
      booking.id === bookingId 
        ? { ...booking, status: 'cancelled' as const }
        : booking
    ));
  };

  return (
    <div className={`min-h-screen ${isLightMode ? 'bg-white text-black' : 'bg-black text-white'}`}>
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onBack}
            className={`p-2 rounded-full transition-colors ${
              isLightMode ? 'hover:bg-gray-200' : 'hover:bg-gray-800'
            }`}
          >
            <ArrowLeft className={`w-6 h-6 ${isLightMode ? 'text-black' : 'text-white'}`} />
          </button>
          <h1 className={isLightMode ? 'text-black' : 'text-white'}>my bookings</h1>
        </div>

        <MyBookings 
          bookings={bookings}
          onReschedule={handleReschedule}
          onSetReminder={handleSetReminder}
          onCancelBooking={handleCancelBooking}
        />
      </div>
    </div>
  );
}