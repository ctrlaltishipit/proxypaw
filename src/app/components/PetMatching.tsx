import { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'motion/react';
import { 
  Heart, 
  X, 
  Star, 
  MapPin, 
  Sparkles, 
  Zap, 
  Coffee, 
  Moon,
  Sun,
  Wind,
  ChevronLeft,
  Info,
  Calendar
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface Pet {
  id: number;
  name: string;
  type: 'Dog' | 'Cat' | 'Guinea Pig' | 'Fish' | 'Bird';
  tower: string;
  apartment: string;
  image: string;
  status: 'online' | 'away' | 'offline';
  age: number;
  breed: string;
  personality: string[];
  energy: 'low' | 'medium' | 'high' | 'very high';
  mood: 'playful' | 'calm' | 'energetic' | 'sleepy' | 'curious';
  interests: string[];
  bio: string;
  walkPreference: 'morning' | 'afternoon' | 'evening' | 'any';
  specialNeeds?: string;
}

interface Volunteer {
  name: string;
  rating: number;
  matches: number;
  isTopRated: boolean;
}

interface PetMatchingProps {
  onBack: () => void;
  userRole: 'owner' | 'walker' | 'renter' | 'admin';
  currentUser: Volunteer;
}

export default function PetMatching({ onBack, userRole, currentUser }: PetMatchingProps) {
  const [pets, setPets] = useState<Pet[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matches, setMatches] = useState<number[]>([]);
  const [passes, setPasses] = useState<number[]>([]);
  const [showInfo, setShowInfo] = useState(false);
  const { theme } = useTheme();
  const isLightMode = theme === 'light';

  useEffect(() => {
    // Sample pets with rich personalities
    const samplePets: Pet[] = [
      {
        id: 1,
        name: 'luna',
        type: 'Dog',
        tower: 'Tower 5',
        apartment: '5081',
        image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400',
        status: 'online',
        age: 3,
        breed: 'golden retriever',
        personality: ['friendly', 'playful', 'gentle', 'loves cuddles'],
        energy: 'high',
        mood: 'playful',
        interests: ['fetch', 'swimming', 'making new friends', 'treats'],
        bio: 'hi there! i\'m luna and i absolutely love morning walks in the park! i get super excited when i see other dogs and i promise to make your day brighter with my wagging tail. my favorite thing? definitely treats and belly rubs!',
        walkPreference: 'morning'
      },
      {
        id: 2,
        name: 'shadow',
        type: 'Dog',
        tower: 'Tower 1',
        apartment: '1242',
        image: 'https://images.unsplash.com/photo-1568572933382-74d440642117?w=400',
        status: 'online',
        age: 5,
        breed: 'german shepherd',
        personality: ['loyal', 'protective', 'intelligent', 'calm'],
        energy: 'medium',
        mood: 'calm',
        interests: ['long walks', 'training', 'guarding', 'belly rubs'],
        bio: 'i\'m shadow, a mature gentleman who enjoys peaceful evening strolls. i\'m great with commands and love learning new tricks. looking for someone patient who appreciates a calm companion.',
        walkPreference: 'evening',
        specialNeeds: 'prefers quiet routes'
      },
      {
        id: 3,
        name: 'bubbles',
        type: 'Cat',
        tower: 'Tower 7',
        apartment: '7323',
        image: 'https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?w=400',
        status: 'online',
        age: 2,
        breed: 'persian',
        personality: ['curious', 'independent', 'playful', 'affectionate'],
        energy: 'medium',
        mood: 'curious',
        interests: ['bird watching', 'sunbathing', 'laser pointers', 'cat towers'],
        bio: 'meow! i\'m bubbles and i love exploring every corner. while i\'m a bit independent, i do enjoy quality time with my humans. i\'m perfect for someone who understands that cats need their space too!',
        walkPreference: 'afternoon'
      },
      {
        id: 4,
        name: 'coco',
        type: 'Dog',
        tower: 'Tower 4',
        apartment: '4171',
        image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400',
        status: 'online',
        age: 1,
        breed: 'beagle puppy',
        personality: ['energetic', 'curious', 'mischievous', 'loves everyone'],
        energy: 'very high',
        mood: 'energetic',
        interests: ['sniffing everything', 'chasing squirrels', 'meeting people', 'playing tug'],
        bio: 'woof woof! i\'m coco and i have TONS of energy! i need someone who can keep up with my zoomies and doesn\'t mind if i get a bit muddy. adventure awaits!',
        walkPreference: 'any'
      },
      {
        id: 5,
        name: 'milo',
        type: 'Dog',
        tower: 'Tower 3',
        apartment: '3247',
        image: 'https://images.unsplash.com/photo-1558788353-f76d92427f16?w=400',
        status: 'online',
        age: 7,
        breed: 'labrador',
        personality: ['gentle', 'wise', 'relaxed', 'food-motivated'],
        energy: 'low',
        mood: 'sleepy',
        interests: ['naps', 'gentle walks', 'treats', 'being a good boy'],
        bio: 'hello friend, i\'m milo. i\'m a senior pup who enjoys the simple things - a nice slow walk, maybe a treat or two, and lots of rest. perfect for someone who wants a chill companion!',
        walkPreference: 'morning',
        specialNeeds: 'senior dog, needs gentle exercise'
      },
      {
        id: 6,
        name: 'pepper',
        type: 'Dog',
        tower: 'Tower 4',
        apartment: '4284',
        image: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=400',
        status: 'online',
        age: 4,
        breed: 'border collie',
        personality: ['smart', 'active', 'focused', 'herding instinct'],
        energy: 'very high',
        mood: 'energetic',
        interests: ['frisbee', 'agility', 'learning tricks', 'running'],
        bio: 'hey! i\'m pepper and i LOVE mental and physical challenges! i need an active person who can give me tasks and plenty of exercise. i\'ll be your best adventure buddy!',
        walkPreference: 'morning'
      }
    ];

    setPets(samplePets);
  }, []);

  const currentPet = pets[currentIndex];
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (Math.abs(info.offset.x) > 100) {
      if (info.offset.x > 0) {
        handleMatch();
      } else {
        handlePass();
      }
    }
  };

  const handleMatch = () => {
    setMatches([...matches, currentPet.id]);
    nextPet();
  };

  const handlePass = () => {
    setPasses([...passes, currentPet.id]);
    nextPet();
  };

  const nextPet = () => {
    if (currentIndex < pets.length - 1) {
      setCurrentIndex(currentIndex + 1);
      x.set(0);
    }
  };

  const getEnergyIcon = (energy: string) => {
    switch (energy) {
      case 'very high': return { icon: <Zap className="w-4 h-4" />, color: 'text-amber-600', bg: 'bg-amber-50' };
      case 'high': return { icon: <Sun className="w-4 h-4" />, color: 'text-orange-600', bg: 'bg-orange-50' };
      case 'medium': return { icon: <Wind className="w-4 h-4" />, color: 'text-blue-600', bg: 'bg-blue-50' };
      case 'low': return { icon: <Moon className="w-4 h-4" />, color: 'text-indigo-600', bg: 'bg-indigo-50' };
      default: return { icon: <Coffee className="w-4 h-4" />, color: 'text-gray-600', bg: 'bg-gray-50' };
    }
  };

  const getMoodEmoji = (mood: string) => {
    switch (mood) {
      case 'playful': return '🎾';
      case 'calm': return '😌';
      case 'energetic': return '⚡';
      case 'sleepy': return '😴';
      case 'curious': return '🔍';
      default: return '😊';
    }
  };

  const getWalkIcon = (pref: string) => {
    switch (pref) {
      case 'morning': return '🌅';
      case 'afternoon': return '☀️';
      case 'evening': return '🌙';
      case 'any': return '🕐';
      default: return '🕐';
    }
  };

  if (!currentPet) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isLightMode ? 'bg-gradient-to-br from-amber-50 to-green-50' : 'bg-gradient-to-br from-gray-900 to-gray-800'}`}>
        <div className="text-center">
          <Sparkles className={`w-16 h-16 mx-auto mb-4 ${isLightMode ? 'text-green-700' : 'text-green-400'}`} />
          <h2 className={`text-2xl mb-2 ${isLightMode ? 'text-gray-900' : 'text-white'}`}>no more pets for now!</h2>
          <p className={`mb-6 ${isLightMode ? 'text-gray-600' : 'text-gray-300'}`}>check back later for more furry friends</p>
          <button
            onClick={onBack}
            className={`px-6 py-3 rounded-lg transition-colors ${isLightMode ? 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800' : 'bg-gradient-to-r from-green-700 to-green-800 text-white hover:from-green-800 hover:to-green-900'}`}
          >
            back to dashboard
          </button>
          <div className={`mt-8 ${isLightMode ? 'text-gray-600' : 'text-gray-300'}`}>
            <p>you matched with {matches.length} pets! 💚</p>
          </div>
        </div>
      </div>
    );
  }

  const energyData = getEnergyIcon(currentPet.energy);

  return (
    <div className={`min-h-screen overflow-hidden ${isLightMode ? 'bg-gradient-to-br from-amber-50 to-green-50' : 'bg-gradient-to-br from-gray-900 to-gray-800'}`}>
      {/* Header */}
      <div className={`border-b px-6 py-4 ${isLightMode ? 'bg-white/80 backdrop-blur-sm border-gray-200' : 'bg-gray-800/80 backdrop-blur-sm border-gray-700'}`}>
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button
            onClick={onBack}
            className={`flex items-center gap-2 transition-colors ${isLightMode ? 'text-gray-700 hover:text-green-700' : 'text-gray-300 hover:text-green-400'}`}
          >
            <ChevronLeft className="w-5 h-5" />
            <span>back</span>
          </button>
          
          <div className="flex items-center gap-2">
            <img 
              src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%236B4423'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9h2v2H7v-2zm8 0h2v2h-2v-2zm-4 4h2v2h-2v-2z'/%3E%3C/svg%3E"
              alt="proxypaw"
              className="w-8 h-8"
            />
            <h1 className={`text-xl ${isLightMode ? 'text-amber-900' : 'text-amber-200'}`}>proxypaw</h1>
          </div>

          <div className="flex items-center gap-2">
            {currentUser.isTopRated && (
              <div className="flex items-center gap-1 bg-[#A8D5A0] text-[#2D5016] px-3 py-1 rounded-full">
                <Star className="w-4 h-4 fill-[#4A7C59]" />
                <span className="text-sm">top rated</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Swipe Area */}
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="relative h-[600px]">
          <motion.div
            className="absolute inset-0"
            style={{ x, rotate, opacity }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={handleDragEnd}
          >
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden h-full relative">
              {/* Pet Image */}
              <div className="h-96 relative overflow-hidden">
                <img 
                  src={currentPet.image} 
                  alt={currentPet.name}
                  className="w-full h-full object-cover"
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                {/* Status Badge */}
                <div className="absolute top-4 right-4 flex gap-2">
                  <div className={`px-3 py-1 rounded-full text-sm backdrop-blur-md ${
                    currentPet.status === 'online' ? 'bg-[#A8D5A0]/90 text-[#2D5016]' : 'bg-gray-200/90 text-gray-700'
                  }`}>
                    {currentPet.status}
                  </div>
                </div>

                {/* Name & Basic Info */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-end justify-between">
                    <div>
                      <h2 className="text-4xl text-white mb-1">{currentPet.name}, {currentPet.age}</h2>
                      <div className="flex items-center gap-2 text-white/90">
                        <MapPin className="w-4 h-4" />
                        <span>{currentPet.tower} • {currentPet.breed}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowInfo(!showInfo)}
                      className="bg-white/20 backdrop-blur-md p-3 rounded-full hover:bg-white/30 transition-colors"
                    >
                      <Info className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Pet Details */}
              <div className="p-6 space-y-4 overflow-y-auto" style={{ maxHeight: 'calc(100% - 384px)' }}>
                {/* Bio */}
                <div>
                  <p className="text-[#2D5016] leading-relaxed">{currentPet.bio}</p>
                </div>

                {/* Energy & Mood */}
                <div className="flex gap-3">
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${energyData.bg}`}>
                    <div className={energyData.color}>{energyData.icon}</div>
                    <span className={`capitalize ${energyData.color}`}>{currentPet.energy} energy</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#F5F3EE]">
                    <span className="text-xl">{getMoodEmoji(currentPet.mood)}</span>
                    <span className="text-[#2D5016] capitalize">{currentPet.mood}</span>
                  </div>
                </div>

                {/* Walk Preference */}
                <div className="flex items-center gap-2 px-4 py-2 bg-[#E8E4DB] rounded-lg w-fit">
                  <Calendar className="w-4 h-4 text-[#6B4423]" />
                  <span className="text-[#2D5016]">
                    <span className="mr-2">{getWalkIcon(currentPet.walkPreference)}</span>
                    prefers {currentPet.walkPreference} walks
                  </span>
                </div>

                {/* Personality Traits */}
                <div>
                  <h4 className="text-[#2D5016] mb-2">personality</h4>
                  <div className="flex flex-wrap gap-2">
                    {currentPet.personality.map((trait, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-[#A8D5A0] text-[#2D5016] rounded-full text-sm"
                      >
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Interests */}
                <div>
                  <h4 className="text-[#2D5016] mb-2">loves</h4>
                  <div className="flex flex-wrap gap-2">
                    {currentPet.interests.map((interest, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 border border-[#6B4423]/20 text-[#5D7349] rounded-full text-sm"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Special Needs */}
                {currentPet.specialNeeds && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <p className="text-amber-900 text-sm">
                      <strong>note:</strong> {currentPet.specialNeeds}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center items-center gap-6 mt-8">
          <button
            onClick={handlePass}
            className="w-16 h-16 rounded-full bg-white border-2 border-[#C14A3F] hover:bg-[#C14A3F] hover:scale-110 transition-all shadow-lg flex items-center justify-center group"
          >
            <X className="w-8 h-8 text-[#C14A3F] group-hover:text-white transition-colors" />
          </button>

          <button
            onClick={handleMatch}
            className="w-20 h-20 rounded-full bg-[#4A7C59] hover:bg-[#3D6B4A] hover:scale-110 transition-all shadow-xl flex items-center justify-center"
          >
            <Heart className="w-10 h-10 text-white fill-white" />
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="mt-6 text-center text-[#5D7349]">
          <p>{currentIndex + 1} of {pets.length} • {matches.length} matches</p>
        </div>
      </div>
    </div>
  );
}