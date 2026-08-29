import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Star, Award, MapPin, Clock, Heart, MessageCircle, Filter, Search, Shield } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import BookingModal from './BookingModal';
import CommentsModal from './CommentsModal';

interface VolunteerListProps {
  onBack: () => void;
  userRole: 'owner' | 'walker' | 'renter' | 'admin';
  onProceedToPayment?: (bookingDetails: {
    volunteerId: string;
    volunteerName: string;
    date: string;
    time: string;
    duration: number;
    totalAmount: number;
  }) => void;
}

interface Volunteer {
  id: string;
  name: string;
  rating: number;
  totalWalks: number;
  location: string;
  availability: string;
  tier: 'Pup Scout' | 'Pack Leader' | 'Alpha Guardian';
  isTopRated: boolean;
  backgroundCheck: 'verified' | 'pending';
  specialties: string[];
  profileImage: string;
  distance: string;
  likes: number;
}

// Mock volunteer data
const mockVolunteers: Volunteer[] = [
  {
    id: 'v1',
    name: 'Marcus R.',
    rating: 5.0,
    totalWalks: 127,
    location: 'prestige high fields',
    availability: 'available today',
    tier: 'Alpha Guardian',
    isTopRated: true,
    backgroundCheck: 'verified',
    specialties: ['large dogs', 'puppies', 'senior dogs'],
    profileImage: '🐕',
    distance: '0.3 km',
    likes: 15
  },
  {
    id: 'v2',
    name: 'Priya S.',
    rating: 4.9,
    totalWalks: 98,
    location: 'my home vihanga',
    availability: 'available tomorrow',
    tier: 'Pack Leader',
    isTopRated: true,
    backgroundCheck: 'verified',
    specialties: ['small dogs', 'anxious pets', 'training'],
    profileImage: '🌿',
    distance: '0.5 km',
    likes: 10
  },
  {
    id: 'v3',
    name: 'James T.',
    rating: 4.8,
    totalWalks: 156,
    location: 'rajapushpa atria',
    availability: 'available today',
    tier: 'Alpha Guardian',
    isTopRated: true,
    backgroundCheck: 'verified',
    specialties: ['energetic dogs', 'multiple pets', 'jogging'],
    profileImage: '🏃',
    distance: '0.7 km',
    likes: 20
  },
  {
    id: 'v4',
    name: 'Ananya M.',
    rating: 4.9,
    totalWalks: 84,
    location: 'my home bhooja',
    availability: 'available weekends',
    tier: 'Pack Leader',
    isTopRated: true,
    backgroundCheck: 'verified',
    specialties: ['gentle care', 'first-time owners', 'shy dogs'],
    profileImage: '💚',
    distance: '1.1 km',
    likes: 12
  },
  {
    id: 'v5',
    name: 'Rahul K.',
    rating: 4.7,
    totalWalks: 63,
    location: 'myscape isle',
    availability: 'available today',
    tier: 'Pack Leader',
    isTopRated: false,
    backgroundCheck: 'verified',
    specialties: ['medium dogs', 'park activities', 'socialization'],
    profileImage: '🌳',
    distance: '1.3 km',
    likes: 8
  },
  {
    id: 'v6',
    name: 'Sarah L.',
    rating: 4.8,
    totalWalks: 91,
    location: 'prestige high fields',
    availability: 'available today',
    tier: 'Pack Leader',
    isTopRated: true,
    backgroundCheck: 'verified',
    specialties: ['rescue dogs', 'behavioral support', 'medication admin'],
    profileImage: '🐾',
    distance: '0.4 km',
    likes: 14
  },
  {
    id: 'v7',
    name: 'Aditya P.',
    rating: 4.6,
    totalWalks: 45,
    location: 'my home vihanga',
    availability: 'available weekdays',
    tier: 'Pup Scout',
    isTopRated: false,
    backgroundCheck: 'verified',
    specialties: ['playful dogs', 'basic training', 'fetch games'],
    profileImage: '🎾',
    distance: '0.6 km',
    likes: 5
  },
  {
    id: 'v8',
    name: 'Kavya N.',
    rating: 4.9,
    totalWalks: 112,
    location: 'rajapushpa atria',
    availability: 'available today',
    tier: 'Alpha Guardian',
    isTopRated: true,
    backgroundCheck: 'verified',
    specialties: ['all breeds', 'photo updates', 'GPS tracking'],
    profileImage: '📸',
    distance: '0.8 km',
    likes: 18
  },
  {
    id: 'v9',
    name: 'Vikram S.',
    rating: 4.5,
    totalWalks: 38,
    location: 'my home bhooja',
    availability: 'available evenings',
    tier: 'Pup Scout',
    isTopRated: false,
    backgroundCheck: 'verified',
    specialties: ['evening walks', 'calm dogs', 'quiet routes'],
    profileImage: '🌙',
    distance: '1.2 km',
    likes: 7
  },
  {
    id: 'v10',
    name: 'Meera D.',
    rating: 5.0,
    totalWalks: 143,
    location: 'myscape isle',
    availability: 'available today',
    tier: 'Alpha Guardian',
    isTopRated: true,
    backgroundCheck: 'verified',
    specialties: ['all sizes', 'grooming basics', 'health monitoring'],
    profileImage: '⭐',
    distance: '1.4 km',
    likes: 25
  }
];

export default function VolunteerList({ onBack, userRole, onProceedToPayment }: VolunteerListProps) {
  const { theme } = useTheme();
  const isLightMode = theme === 'light';
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTier, setFilterTier] = useState<'all' | 'Pup Scout' | 'Pack Leader' | 'Alpha Guardian'>('all');
  const [showTopRatedOnly, setShowTopRatedOnly] = useState(false);
  const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);
  const [likedVolunteers, setLikedVolunteers] = useState<Set<string>>(new Set());

  // Filter volunteers
  const filteredVolunteers = mockVolunteers.filter(volunteer => {
    const matchesSearch = volunteer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         volunteer.specialties.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesTier = filterTier === 'all' || volunteer.tier === filterTier;
    const matchesTopRated = !showTopRatedOnly || volunteer.isTopRated;
    
    return matchesSearch && matchesTier && matchesTopRated;
  });

  const handleBookWalk = (volunteer: Volunteer) => {
    setSelectedVolunteer(volunteer);
    setIsBookingModalOpen(true);
  };

  const handleProceedToPayment = (bookingDetails: {
    volunteerId: string;
    volunteerName: string;
    date: string;
    time: string;
    duration: number;
    totalAmount: number;
  }) => {
    console.log('VolunteerList - Received booking details:', bookingDetails);
    if (onProceedToPayment) {
      console.log('VolunteerList - Calling onProceedToPayment');
      onProceedToPayment(bookingDetails);
    } else {
      console.error('VolunteerList - onProceedToPayment is not defined!');
    }
    setIsBookingModalOpen(false);
  };

  const handleOpenComments = (volunteer: Volunteer) => {
    setSelectedVolunteer(volunteer);
    setIsCommentsModalOpen(true);
  };

  const handleLike = (volunteerId: string) => {
    setLikedVolunteers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(volunteerId)) {
        newSet.delete(volunteerId);
      } else {
        newSet.add(volunteerId);
      }
      return newSet;
    });
  };

  return (
    <div className={`min-h-screen ${isLightMode ? 'bg-white' : 'bg-black'}`}>
      {/* Header */}
      <div className={`border-b ${isLightMode ? 'border-gray-200 bg-white' : 'border-gray-800 bg-black'} sticky top-0 z-10`}>
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={onBack}
              className={`p-2 rounded-sm transition-colors ${
                isLightMode 
                  ? 'hover:bg-gray-100' 
                  : 'hover:bg-gray-900'
              }`}
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className={isLightMode ? 'text-gray-900' : 'text-white'}>find a walker</h1>
              <p className={`${isLightMode ? 'text-gray-600' : 'text-gray-400'}`}>
                {filteredVolunteers.length} verified volunteers in your community
              </p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                isLightMode ? 'text-gray-400' : 'text-gray-500'
              }`} />
              <input
                type="text"
                placeholder="search by name or specialty..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-12 pr-4 py-3 rounded-sm border ${
                  isLightMode 
                    ? 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-[#4A9EFF]' 
                    : 'bg-gray-950 border-gray-700 text-white placeholder-gray-500 focus:border-[#4A9EFF]'
                } outline-none transition-colors`}
              />
            </div>

            {/* Tier Filter */}
            <select
              value={filterTier}
              onChange={(e) => setFilterTier(e.target.value as any)}
              className={`px-4 py-3 rounded-sm border ${
                isLightMode 
                  ? 'bg-white border-gray-300 text-gray-900' 
                  : 'bg-gray-950 border-gray-700 text-white'
              } outline-none focus:border-[#4A9EFF] transition-colors`}
            >
              <option value="all">all tiers</option>
              <option value="Pup Scout">pup scout</option>
              <option value="Pack Leader">pack leader</option>
              <option value="Alpha Guardian">alpha guardian</option>
            </select>

            {/* Top Rated Toggle */}
            <button
              onClick={() => setShowTopRatedOnly(!showTopRatedOnly)}
              className={`px-6 py-3 rounded-sm border transition-colors ${
                showTopRatedOnly
                  ? 'bg-[#4A9EFF] border-[#4A9EFF] text-white'
                  : isLightMode
                    ? 'bg-white border-gray-300 text-gray-900 hover:border-[#4A9EFF]'
                    : 'bg-gray-950 border-gray-700 text-white hover:border-[#4A9EFF]'
              }`}
            >
              top rated only
            </button>
          </div>
        </div>
      </div>

      {/* Volunteer Grid */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <AnimatePresence mode="popLayout">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVolunteers.map((volunteer, index) => (
              <motion.div
                key={volunteer.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                className={`border rounded-sm p-6 transition-all hover:shadow-lg ${
                  isLightMode 
                    ? 'bg-white border-gray-200 hover:border-gray-900' 
                    : 'bg-gray-950 border-gray-800 hover:border-gray-100'
                }`}
              >
                {/* Top Rated Badge */}
                {volunteer.isTopRated && (
                  <div className="flex justify-end mb-2">
                    <div className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${
                      isLightMode
                        ? 'bg-gray-900 text-white'
                        : 'bg-white text-gray-900'
                    }`}>
                      <Star className={`w-3 h-3 ${isLightMode ? 'fill-white' : 'fill-gray-900'}`} />
                      top rated
                    </div>
                  </div>
                )}

                {/* Profile */}
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl ${
                    isLightMode ? 'bg-gray-100' : 'bg-gray-800'
                  }`}>
                    {volunteer.profileImage}
                  </div>
                  <div className="flex-1">
                    <h3 className={`mb-1 ${isLightMode ? 'text-gray-900' : 'text-white'}`}>
                      {volunteer.name.toLowerCase()}
                    </h3>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex items-center gap-1">
                        <Star className={`w-4 h-4 ${isLightMode ? 'text-gray-900 fill-gray-900' : 'text-white fill-white'}`} />
                        <span className={isLightMode ? 'text-gray-900' : 'text-white'}>
                          {volunteer.rating.toFixed(1)}
                        </span>
                      </div>
                      <span className={isLightMode ? 'text-gray-400' : 'text-gray-500'}>•</span>
                      <span className={isLightMode ? 'text-gray-600' : 'text-gray-400'}>
                        {volunteer.totalWalks} walks
                      </span>
                    </div>
                    <div className={`flex items-center gap-1 ${isLightMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      <Shield className="w-3 h-3" />
                      <span className="text-sm">bgc verified</span>
                    </div>
                  </div>
                </div>

                {/* Tier Badge */}
                <div className="mb-4">
                  <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                    volunteer.tier === 'Alpha Guardian'
                      ? isLightMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
                      : volunteer.tier === 'Pack Leader'
                        ? isLightMode ? 'bg-gray-700 text-white' : 'bg-gray-300 text-gray-900'
                        : isLightMode ? 'bg-gray-300 text-gray-900' : 'bg-gray-700 text-white'
                  }`}>
                    <Award className="w-3 h-3" />
                    {volunteer.tier.toLowerCase()}
                  </div>
                </div>

                {/* Location & Distance */}
                <div className={`flex items-center gap-4 mb-4 pb-4 border-b ${
                  isLightMode ? 'border-gray-200' : 'border-gray-800'
                }`}>
                  <div className="flex items-center gap-1 flex-1">
                    <MapPin className={`w-4 h-4 ${isLightMode ? 'text-gray-900' : 'text-white'}`} />
                    <span className={`text-sm ${isLightMode ? 'text-gray-600' : 'text-gray-400'}`}>
                      {volunteer.location}
                    </span>
                  </div>
                  <span className={`text-sm ${isLightMode ? 'text-gray-900' : 'text-white'}`}>{volunteer.distance}</span>
                </div>

                {/* Availability */}
                <div className="flex items-center gap-2 mb-4">
                  <Clock className={`w-4 h-4 ${isLightMode ? 'text-gray-900' : 'text-white'}`} />
                  <span className={`text-sm ${isLightMode ? 'text-gray-600' : 'text-gray-400'}`}>
                    {volunteer.availability}
                  </span>
                </div>

                {/* Specialties */}
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {volunteer.specialties.slice(0, 3).map((specialty, idx) => (
                      <span
                        key={idx}
                        className={`px-2 py-1 rounded text-xs ${
                          isLightMode 
                            ? 'bg-gray-100 text-gray-700' 
                            : 'bg-gray-800 text-gray-300'
                        }`}
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    className={`flex-1 px-4 py-2 rounded-sm transition-colors ${
                      isLightMode
                        ? 'bg-gray-900 hover:bg-gray-800 text-white'
                        : 'bg-white hover:bg-gray-100 text-gray-900'
                    }`}
                    onClick={() => handleBookWalk(volunteer)}
                  >
                    book walk
                  </button>
                  <button 
                    onClick={() => handleOpenComments(volunteer)}
                    className={`px-4 py-2 border rounded-sm transition-colors ${
                      isLightMode 
                        ? 'border-gray-300 hover:border-gray-900 hover:bg-gray-50' 
                        : 'border-gray-700 hover:border-white hover:bg-gray-900'
                    }`}
                  >
                    <MessageCircle className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleLike(volunteer.id)}
                    className={`px-4 py-2 border rounded-sm transition-all flex items-center gap-2 ${
                      likedVolunteers.has(volunteer.id)
                        ? isLightMode
                          ? 'border-gray-900 bg-gray-900 text-white'
                          : 'border-white bg-white text-gray-900'
                        : isLightMode 
                          ? 'border-gray-300 hover:border-gray-900 hover:bg-gray-50' 
                          : 'border-gray-700 hover:border-white hover:bg-gray-900'
                    }`}
                  >
                    <Heart className={`w-5 h-5 transition-all ${
                      likedVolunteers.has(volunteer.id) 
                        ? isLightMode
                          ? 'fill-white text-white'
                          : 'fill-gray-900 text-gray-900'
                        : ''
                    }`} />
                    <span className={`text-sm ${
                      likedVolunteers.has(volunteer.id)
                        ? isLightMode
                          ? 'text-white'
                          : 'text-gray-900'
                        : isLightMode
                          ? 'text-gray-600'
                          : 'text-gray-400'
                    }`}>
                      {volunteer.likes + (likedVolunteers.has(volunteer.id) ? 1 : 0)}
                    </span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>

        {/* No Results */}
        {filteredVolunteers.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Filter className={`w-16 h-16 mx-auto mb-4 ${isLightMode ? 'text-gray-300' : 'text-gray-700'}`} />
            <h3 className={`mb-2 ${isLightMode ? 'text-gray-900' : 'text-white'}`}>
              no volunteers found
            </h3>
            <p className={isLightMode ? 'text-gray-600' : 'text-gray-400'}>
              try adjusting your filters or search terms
            </p>
          </motion.div>
        )}
      </div>

      {/* Booking Modal */}
      {isBookingModalOpen && selectedVolunteer && (
        <BookingModal
          volunteer={selectedVolunteer}
          onClose={() => setIsBookingModalOpen(false)}
          onProceedToPayment={handleProceedToPayment}
        />
      )}

      {/* Comments Modal */}
      {isCommentsModalOpen && selectedVolunteer && (
        <CommentsModal
          volunteer={selectedVolunteer}
          onClose={() => setIsCommentsModalOpen(false)}
          currentUserId="currentUser"
          currentUserName="You"
          currentUserAvatar="👤"
        />
      )}
    </div>
  );
}