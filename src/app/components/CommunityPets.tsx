import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  MapPin, 
  Filter,
  ChevronRight,
  User,
  Bell,
  Shield,
  AlertCircle
} from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface Pet {
  id: number;
  name: string;
  type: 'Dog' | 'Cat' | 'Guinea Pig' | 'Fish' | 'Bird';
  tower: string;
  apartment: string;
  image: string;
  status: 'online' | 'away' | 'offline';
  // PHI fields (may be masked)
  ownerName?: string;
  ownerPhone?: string;
  ownerEmail?: string;
  medicalNotes?: string;
  emergencyContact?: string;
}

interface CommunityPetsProps {
  onBack: () => void;
  userRole: 'owner' | 'walker' | 'renter' | 'admin';
  userId: string;
}

export default function CommunityPets({ onBack, userRole, userId }: CommunityPetsProps) {
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [notifications] = useState(2);
  const [allPets, setAllPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [phiMasked, setPhiMasked] = useState(true);
  const [bgcStatus, setBgcStatus] = useState<string>('N/A');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPets();
  }, [userId, userRole]);

  const fetchPets = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0cfbd72b/pets`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({ userId, userRole })
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch pets: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Fetched pets data:', data);
      
      setAllPets(data.pets || []);
      setPhiMasked(data.phiMasking);
      setBgcStatus(data.bgcStatus);
      setLoading(false);
    } catch (err: any) {
      console.error('Error fetching pets:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const locations = [
    { value: 'all', label: 'All Towers' },
    { value: 'tower1', label: 'Tower 1' },
    { value: 'tower2', label: 'Tower 2' },
    { value: 'tower3', label: 'Tower 3' },
    { value: 'tower4', label: 'Tower 4' },
    { value: 'tower5', label: 'Tower 5' },
    { value: 'tower6', label: 'Tower 6' },
    { value: 'tower7', label: 'Tower 7' },
    { value: 'tower8', label: 'Tower 8' },
    { value: 'tower9', label: 'Tower 9' },
    { value: 'tower10', label: 'Tower 10' }
  ];

  const filteredPets = selectedLocation === 'all' 
    ? allPets 
    : allPets.filter(pet => pet.tower.toLowerCase().replace(' ', '') === selectedLocation);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-emerald-500';
      case 'away': return 'bg-orange-500';
      case 'offline': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-gray-900 bg-gray-950/50 sticky top-0 z-40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={onBack}
              className="flex items-center gap-2 hover:text-[#4A9EFF] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              back
            </button>

            <div className="flex items-center gap-4">
              {/* Notifications */}
              <button className="relative p-2 hover:bg-gray-900 rounded-sm transition-colors">
                <Bell className="w-5 h-5" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs">
                    {notifications}
                  </span>
                )}
              </button>

              {/* Profile */}
              <button className="p-2 hover:bg-gray-900 rounded-sm transition-colors">
                <User className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="mb-2">Pets in Society ({filteredPets.length})</h1>
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>Prestige High Fields, Hyderabad, Telangana, India</span>
              </div>
            </div>

            {/* Security & PHI Status Badge */}
            {phiMasked && userRole !== 'admin' && (
              <div className="bg-white border border-gray-900 rounded-sm px-4 py-2 flex items-center gap-2">
                <Shield className="w-4 h-4 text-gray-900" />
                <div>
                  <div className="text-gray-900">PHI Protected</div>
                  <div className="text-xs text-gray-600">
                    {bgcStatus === 'pending' && 'BGC Verification Pending'}
                    {bgcStatus === 'failed' && 'BGC Verification Failed'}
                    {bgcStatus === 'N/A' && 'Owner information redacted'}
                  </div>
                </div>
              </div>
            )}
            {!phiMasked && userRole === 'admin' && (
              <div className="bg-white border border-gray-900 rounded-sm px-4 py-2 flex items-center gap-2">
                <Shield className="w-4 h-4 text-gray-900" />
                <div>
                  <div className="text-gray-900">Admin Access</div>
                  <div className="text-xs text-gray-600">Full PHI data visible</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <div className="inline-block w-12 h-12 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">Loading pet directory...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-white border border-gray-900 rounded-sm p-6 mb-8">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-gray-900" />
              <div>
                <div className="text-gray-900 mb-1">Failed to load pet directory</div>
                <div className="text-sm text-gray-600">{error}</div>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && (
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Left Sidebar - Location Filter */}
            <div className="lg:col-span-1">
              <motion.div
                className="bg-white border border-gray-900 rounded-sm p-6 sticky top-24"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Filter className="w-5 h-5 text-gray-900" />
                  <h3>Filter by Location</h3>
                </div>

                <div className="space-y-2">
                  {locations.map((location) => (
                    <button
                      key={location.value}
                      onClick={() => setSelectedLocation(location.value)}
                      className={`w-full text-left px-4 py-3 rounded-sm border transition-all ${
                        selectedLocation === location.value
                          ? 'bg-gray-900 border-gray-900 text-white'
                          : 'border-gray-900 hover:border-gray-600 text-gray-900'
                      }`}
                    >
                      {location.label}
                    </button>
                  ))}
                </div>

                {/* Location Stats */}
                <div className="mt-6 pt-6 border-t border-gray-900">
                  <h3 className="mb-4">Quick Stats</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-gray-600">
                      <span>Total Pets</span>
                      <span className="text-gray-900">{allPets.length}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Dogs</span>
                      <span className="text-gray-900">{allPets.filter(p => p.type === 'Dog').length}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Cats</span>
                      <span className="text-gray-900">{allPets.filter(p => p.type === 'Cat').length}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Active Now</span>
                      <span className="text-gray-900">{allPets.filter(p => p.status === 'online').length}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Main Content - Pet List */}
            <div className="lg:col-span-3">
              <motion.div
                className="bg-white border border-gray-900 rounded-sm overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="divide-y divide-gray-900">
                  {filteredPets.map((pet, index) => (
                    <motion.button
                      key={pet.id}
                      className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-100 transition-colors text-left group"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      whileHover={{ x: 4 }}
                    >
                      <div className="flex items-center gap-4">
                        {/* Pet Image */}
                        <div className="relative">
                          <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-200 border-2 border-gray-900">
                            <img 
                              src={pet.image} 
                              alt={pet.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          {/* Status Indicator */}
                          <div className={`absolute bottom-0 right-0 w-4 h-4 ${getStatusColor(pet.status)} rounded-full border-2 border-white`} />
                        </div>

                        {/* Pet Info */}
                        <div>
                          <div className="mb-1">{pet.name}</div>
                          <div className="text-gray-600">{pet.type}</div>
                          <div className="flex items-center gap-1 text-gray-500 mt-1">
                            <MapPin className="w-3 h-3" />
                            <span>{pet.tower} -- {pet.apartment}</span>
                          </div>
                        </div>
                      </div>

                      {/* Arrow */}
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-900 transition-colors" />
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              {/* Empty State */}
              {filteredPets.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No pets found in this location</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}