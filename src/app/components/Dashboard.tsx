import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  Star, 
  Award, 
  TrendingUp, 
  MessageCircle, 
  Calendar,
  Heart,
  Shield,
  Navigation as NavIcon,
  Camera,
  Gift,
  Sun,
  Moon,
  GraduationCap,
  Users,
  Building2,
  Activity,
  Crown,
  AlertCircle,
  Store,
  X,
  Send
} from 'lucide-react';
import CommunityList from './CommunityList';
import { useTheme } from '../contexts/ThemeContext';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  userRole: 'owner' | 'walker' | 'renter';
  onBackHome: () => void;
  onLogout: () => void;
  onSupportClick: () => void;
  onTrainingClick: () => void;
  onCommunityClick: () => void;
  onVolunteersClick?: () => void;
  onBookingClick?: () => void;
  onBookingsClick?: () => void;
}

export default function Dashboard({ userRole, onBackHome, onLogout, onSupportClick, onTrainingClick, onCommunityClick, onVolunteersClick, onBookingClick, onBookingsClick }: DashboardProps) {
  const [pawPoints] = useState(750);
  const { theme, toggleTheme } = useTheme();
  const isLightMode = theme === 'light';
  const nextTierPoints = 1500;
  const progress = (pawPoints / nextTierPoints) * 100;

  // Chat state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, sender: 'Marcus R.', text: 'Hi! Looking forward to walking Max on Tuesday!', time: '10:30 AM', isVolunteer: true },
    { id: 2, sender: 'You', text: 'Great! Max is really excited. He loves parks.', time: '10:32 AM', isVolunteer: false },
    { id: 3, sender: 'Marcus R.', text: 'Perfect! I\'ll bring some treats. Any allergies I should know about?', time: '10:35 AM', isVolunteer: true },
    { id: 4, sender: 'You', text: 'No allergies, but he really loves chicken treats!', time: '10:37 AM', isVolunteer: false },
  ]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setMessages([...messages, {
        id: messages.length + 1,
        sender: 'You',
        text: newMessage,
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        isVolunteer: false
      }]);
      setNewMessage('');
    }
  };

  // Photo upload state
  const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(null);
  const [communityPhotos, setCommunityPhotos] = useState<Array<{ id: number; url: string; time: string }>>([]);

  // Google Map state
  const [isMapOpen, setIsMapOpen] = useState(false);

  const handleSubmitPhoto = () => {
    if (uploadedPhoto) {
      const newPhoto = {
        id: Date.now(),
        url: uploadedPhoto,
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      };
      setCommunityPhotos([newPhoto, ...communityPhotos]);
      setUploadedPhoto(null);
      // Reset file input
      const fileInput = document.getElementById('photo-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    }
  };

  // Mock data based on user role
  const getRoleSpecificContent = () => {
    switch (userRole) {
      case 'walker':
        return {
          focusCard: {
            title: 'Your Next Mission',
            subtitle: 'Fetch Max in 30 mins',
            description: 'Golden Retriever • High energy • Loves parks',
            action: 'View Route Map',
            icon: MapPin,
            color: 'from-[#4A9EFF]/20 to-[#3A8EEF]/10'
          },
          stats: [
            { label: 'Walks Completed', value: '47', icon: TrendingUp },
            { label: 'Paw Points', value: pawPoints.toString(), icon: Award },
            { label: 'Happy Pets', value: '23', icon: Heart }
          ]
        };
      case 'owner':
        return {
          focusCard: {
            title: 'Meet Your Match',
            subtitle: 'Marcus R. confirmed for Tuesday',
            description: 'Pack Leader • 5.0 rating • 120+ walks',
            action: 'Chat Now',
            icon: MessageCircle,
            color: 'from-emerald-500/20 to-emerald-600/10'
          },
          stats: [
            { label: 'Active Walks', value: '3', icon: Calendar },
            { label: 'Favorite Walkers', value: '5', icon: Star },
            { label: 'Paw Points', value: pawPoints.toString(), icon: Award }
          ]
        };
      case 'renter':
        return {
          focusCard: {
            title: 'Your Playdate Awaits',
            subtitle: 'Buster the Beagle - Tomorrow 2pm',
            description: 'Friendly • Low energy • Loves cuddles',
            action: 'Review Details',
            icon: Heart,
            color: 'from-purple-500/20 to-purple-600/10'
          },
          stats: [
            { label: 'Playdates', value: '12', icon: Calendar },
            { label: 'Favorite Pets', value: '4', icon: Heart },
            { label: 'Paw Points', value: pawPoints.toString(), icon: Award }
          ]
        };
    }
  };

  const content = getRoleSpecificContent();

  const activityFeed = [
    {
      id: 1,
      type: 'walk',
      message: 'Max had a great time! 2.1 miles walked.',
      time: '2 hours ago',
      icon: MapPin
    },
    {
      id: 2,
      type: 'reward',
      message: 'You earned 50 Paw Points! Keep up the great work.',
      time: '1 day ago',
      icon: Award
    },
    {
      id: 3,
      type: 'community',
      message: 'New volunteer meetup scheduled for Saturday at Central Park.',
      time: '2 days ago',
      icon: NavIcon
    },
    {
      id: 4,
      type: 'match',
      message: 'Perfect match found! Luna would love to meet you.',
      time: '3 days ago',
      icon: Star
    }
  ];

  // Mock community data for Google Maps
  const mockCommunities = [
    { name: 'Prestige High Fields', location: 'Gachibowli', petCount: 15, walkerCount: 8, rating: 4.8, activeWalks: 3, tower: 'Tower A' },
    { name: 'My Home Vihanga', location: 'Gachibowli', petCount: 22, walkerCount: 12, rating: 4.9, activeWalks: 5, tower: 'Tower B' },
    { name: 'My Home Bhooja', location: 'Gachibowli', petCount: 18, walkerCount: 10, rating: 4.7, activeWalks: 4, tower: 'Tower C' },
    { name: 'Rajapushpa Kokapet', location: 'Kokapet', petCount: 12, walkerCount: 6, rating: 4.6, activeWalks: 2, tower: 'Tower D' },
    { name: 'Myscape Isle', location: 'Gachibowli', petCount: 20, walkerCount: 11, rating: 4.9, activeWalks: 6, tower: 'Tower E' },
    { name: 'My Home Avatar', location: 'Gachibowli', petCount: 25, walkerCount: 14, rating: 5.0, activeWalks: 7, tower: 'Tower F' },
    { name: 'Aparna Nallagandla', location: 'Nallagandla', petCount: 10, walkerCount: 5, rating: 4.5, activeWalks: 1, tower: 'Tower G' },
    { name: 'Purva Highlands', location: 'Gachibowli', petCount: 16, walkerCount: 9, rating: 4.8, activeWalks: 3, tower: 'Tower H' },
    { name: 'My Home Abhra', location: 'Gachibowli', petCount: 19, walkerCount: 11, rating: 4.9, activeWalks: 4, tower: 'Tower I' },
    { name: 'Mantri Espana', location: 'Gachibowli', petCount: 14, walkerCount: 7, rating: 4.7, activeWalks: 2, tower: 'Tower J' }
  ];

  return (
    <div className={`min-h-screen ${isLightMode ? 'bg-white text-black' : 'bg-black text-white'}`}>
      {/* Header */}
      <div className={`border-b sticky top-0 z-40 backdrop-blur-sm ${
        isLightMode 
          ? 'border-gray-200 bg-white/80' 
          : 'border-gray-900 bg-gray-950/50'
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button 
            onClick={onBackHome}
            className="flex items-center gap-2 hover:text-[#4A9EFF] transition-colors lowercase"
          >
            <ArrowLeft className="w-5 h-5" />
            back
          </button>
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-sm transition-colors ${
                isLightMode 
                  ? 'bg-gray-100 hover:bg-gray-200' 
                  : 'bg-gray-800 hover:bg-gray-700'
              }`}
              aria-label="Toggle theme"
            >
              {isLightMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
            <button 
              onClick={onLogout}
              className={`px-4 py-2 border rounded-sm transition-colors ${
                isLightMode 
                  ? 'border-gray-300 hover:border-[#4A9EFF]' 
                  : 'border-gray-700 hover:border-[#4A9EFF]'
              }`}
            >
              logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 lowercase">
        {/* Welcome Header */}
        <motion.div 
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="mb-2">Welcome back, hooman!</h1>
          <p className={isLightMode ? 'text-gray-600' : 'text-gray-400'}>
            Here&apos;s what&apos;s happening with your furry friends
          </p>
        </motion.div>

        {/* Progress to Next Tier */}
        <motion.div 
          className={`mb-12 rounded-sm p-6 ${
            isLightMode 
              ? 'bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200' 
              : 'bg-gradient-to-r from-gray-900 to-gray-950 border border-gray-800'
          }`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Award className={`w-5 h-5 ${isLightMode ? 'text-gray-900' : 'text-white'}`} />
              <span className={isLightMode ? 'text-gray-700' : 'text-gray-300'}>
                Progress to Pack Leader
              </span>
            </div>
            <span className={isLightMode ? 'text-gray-900' : 'text-white'}>{pawPoints} / {nextTierPoints} points</span>
          </div>
          <div className={`h-3 rounded-full overflow-hidden ${
            isLightMode ? 'bg-gray-200' : 'bg-gray-800'
          }`}>
            <motion.div 
              className={`h-full ${isLightMode ? 'bg-gradient-to-r from-gray-900 to-gray-700' : 'bg-gradient-to-r from-white to-gray-300'}`}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, delay: 0.3 }}
            />
          </div>
          <p className={`mt-2 ${isLightMode ? 'text-gray-500' : 'text-gray-500'}`}>
            {nextTierPoints - pawPoints} points to unlock Premium support & exclusive perks!
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content - Left & Center */}
          <div className="lg:col-span-2 space-y-8">
            {/* Focus Card - Primary Action */}
            <motion.div
              className={`border rounded-sm p-8 ${
                isLightMode 
                  ? 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-300' 
                  : 'bg-gradient-to-br from-gray-900 to-gray-950 border-gray-700'
              }`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-start gap-4 mb-6">
                <div className={`p-3 rounded-sm ${isLightMode ? 'bg-gray-900' : 'bg-white'}`}>
                  <content.focusCard.icon className={`w-6 h-6 ${isLightMode ? 'text-white' : 'text-gray-900'}`} />
                </div>
                <div className="flex-1">
                  <h2 className="mb-1">{content.focusCard.title}</h2>
                  <p className={isLightMode ? 'text-gray-700' : 'text-gray-300'}>
                    {content.focusCard.subtitle}
                  </p>
                </div>
              </div>
              
              <p className={`mb-6 ${isLightMode ? 'text-gray-600' : 'text-gray-400'}`}>
                {content.focusCard.description}
              </p>

              <div className="flex gap-3">
                <button 
                  onClick={() => setIsChatOpen(true)}
                  className={`px-6 py-3 border transition-colors rounded-sm ${
                  isLightMode 
                    ? 'border-gray-300 hover:border-gray-900' 
                    : 'border-gray-600 hover:border-white'
                }`}>
                  view details
                </button>
              </div>
            </motion.div>

            {/* Quick Stats */}
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid md:grid-cols-3 gap-4">
                {content.stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    className={`rounded-sm p-6 ${
                      isLightMode 
                        ? 'bg-gray-50 border border-gray-200' 
                        : 'bg-gray-950 border border-gray-800'
                    }`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    whileHover={{ borderColor: isLightMode ? '#000000' : '#FFFFFF' }}
                  >
                    <stat.icon className={`w-6 h-6 mb-3 ${isLightMode ? 'text-gray-900' : 'text-white'}`} />
                    <div className={isLightMode ? 'text-gray-600 mb-1' : 'text-gray-400 mb-1'}>
                      {stat.label}
                    </div>
                    <div className="text-3xl">{stat.value}</div>
                  </motion.div>
                ))}
              </div>

              {/* Charts Section */}
              <motion.div
                className={`rounded-sm p-6 ${
                  isLightMode 
                    ? 'bg-gray-50 border border-gray-200' 
                    : 'bg-gray-950 border border-gray-800'
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <h3 className="mb-6">Statistics Overview</h3>
                
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Bar Chart */}
                  <div>
                    <h4 className={`mb-4 ${isLightMode ? 'text-gray-700' : 'text-gray-300'}`}>
                      Performance Metrics
                    </h4>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart 
                        data={content.stats.map(stat => ({
                          name: stat.label,
                          value: parseInt(stat.value)
                        }))}
                      >
                        <CartesianGrid 
                          strokeDasharray="3 3" 
                          stroke={isLightMode ? '#e5e7eb' : '#374151'} 
                        />
                        <XAxis 
                          dataKey="name" 
                          stroke={isLightMode ? '#6b7280' : '#9ca3af'}
                          tick={{ fill: isLightMode ? '#6b7280' : '#9ca3af', fontSize: 12 }}
                        />
                        <YAxis 
                          stroke={isLightMode ? '#6b7280' : '#9ca3af'}
                          tick={{ fill: isLightMode ? '#6b7280' : '#9ca3af', fontSize: 12 }}
                        />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: isLightMode ? '#ffffff' : '#1f2937',
                            border: `1px solid ${isLightMode ? '#d1d5db' : '#374151'}`,
                            borderRadius: '4px',
                            color: isLightMode ? '#000000' : '#ffffff'
                          }}
                        />
                        <Bar 
                          dataKey="value" 
                          fill={isLightMode ? '#111827' : '#f3f4f6'}
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Pie Chart */}
                  <div>
                    <h4 className={`mb-4 ${isLightMode ? 'text-gray-700' : 'text-gray-300'}`}>
                      Distribution Breakdown
                    </h4>
                    <ResponsiveContainer width="100%" height={350}>
                      <PieChart>
                        <Pie
                          data={content.stats.map(stat => ({
                            name: stat.label,
                            value: parseInt(stat.value)
                          }))}
                          cx="50%"
                          cy="50%"
                          labelLine={{
                            stroke: isLightMode ? '#6b7280' : '#9ca3af',
                            strokeWidth: 1,
                            length: 40
                          }}
                          label={({
                            cx,
                            cy,
                            midAngle,
                            outerRadius,
                            name,
                            percent
                          }) => {
                            const RADIAN = Math.PI / 180;
                            const radius = outerRadius + 60;
                            const x = cx + radius * Math.cos(-midAngle * RADIAN);
                            const y = cy + radius * Math.sin(-midAngle * RADIAN);
                            
                            return (
                              <text
                                x={x}
                                y={y}
                                fill={isLightMode ? '#000000' : '#ffffff'}
                                textAnchor={x > cx ? 'start' : 'end'}
                                dominantBaseline="central"
                                style={{ fontSize: '10px', fontWeight: '500' }}
                              >
                                {`${name}: ${(percent * 100).toFixed(0)}%`}
                              </text>
                            );
                          }}
                          outerRadius={60}
                          fill="#8884d8"
                          dataKey="value"
                          startAngle={90}
                          endAngle={-270}
                        >
                          {content.stats.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={isLightMode 
                                ? ['#111827', '#4b5563', '#6b7280'][index % 3]
                                : ['#f3f4f6', '#d1d5db', '#9ca3af'][index % 3]
                              } 
                            />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: isLightMode ? '#ffffff' : '#1f2937',
                            border: `1px solid ${isLightMode ? '#d1d5db' : '#374151'}`,
                            borderRadius: '4px',
                            color: isLightMode ? '#000000' : '#ffffff'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Line Chart - Full Width */}
                <div className="mt-6 pt-6 border-t" style={{ borderColor: isLightMode ? '#e5e7eb' : '#374151' }}>
                  <h4 className={`mb-4 ${isLightMode ? 'text-gray-700' : 'text-gray-300'}`}>
                    Trend Analysis
                  </h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart 
                      data={[
                        { month: 'Week 1', ...Object.fromEntries(content.stats.map(stat => [stat.label, Math.floor(parseInt(stat.value) * 0.6)])) },
                        { month: 'Week 2', ...Object.fromEntries(content.stats.map(stat => [stat.label, Math.floor(parseInt(stat.value) * 0.75)])) },
                        { month: 'Week 3', ...Object.fromEntries(content.stats.map(stat => [stat.label, Math.floor(parseInt(stat.value) * 0.9)])) },
                        { month: 'Week 4', ...Object.fromEntries(content.stats.map(stat => [stat.label, parseInt(stat.value)])) },
                      ]}
                    >
                      <CartesianGrid 
                        strokeDasharray="3 3" 
                        stroke={isLightMode ? '#e5e7eb' : '#374151'} 
                      />
                      <XAxis 
                        dataKey="month" 
                        stroke={isLightMode ? '#6b7280' : '#9ca3af'}
                        tick={{ fill: isLightMode ? '#6b7280' : '#9ca3af', fontSize: 12 }}
                      />
                      <YAxis 
                        stroke={isLightMode ? '#6b7280' : '#9ca3af'}
                        tick={{ fill: isLightMode ? '#6b7280' : '#9ca3af', fontSize: 12 }}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: isLightMode ? '#ffffff' : '#1f2937',
                          border: `1px solid ${isLightMode ? '#d1d5db' : '#374151'}`,
                          borderRadius: '4px',
                          color: isLightMode ? '#000000' : '#ffffff'
                        }}
                      />
                      <Legend 
                        wrapperStyle={{
                          color: isLightMode ? '#6b7280' : '#9ca3af',
                          fontSize: '12px'
                        }}
                      />
                      {content.stats.map((stat, index) => (
                        <Line
                          key={stat.label}
                          type="monotone"
                          dataKey={stat.label}
                          stroke={isLightMode 
                            ? ['#111827', '#4b5563', '#6b7280'][index % 3]
                            : ['#f3f4f6', '#d1d5db', '#9ca3af'][index % 3]
                          }
                          strokeWidth={2}
                          dot={{ fill: isLightMode ? '#111827' : '#f3f4f6' }}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            </div>

            {/* Upcoming & Recent */}
            <motion.div
              className={`rounded-sm p-6 ${
                isLightMode 
                  ? 'bg-gray-50 border border-gray-200' 
                  : 'bg-gray-950 border border-gray-800'
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h3 className="mb-6 flex items-center gap-2">
                <Calendar className={`w-5 h-5 ${isLightMode ? 'text-gray-900' : 'text-white'}`} />
                Upcoming Schedule
              </h3>

              <div className="space-y-4">
                {[
                  { pet: 'Max', time: 'Today, 4:00 PM', location: 'prestige high fields', status: 'confirmed' },
                  { pet: 'Luna', time: 'Tomorrow, 9:00 AM', location: 'my home vihanga', status: 'pending' },
                  { pet: 'Charlie', time: 'Wed, 5:30 PM', location: 'rajapushpa atria', status: 'confirmed' }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    className={`flex items-center justify-between p-4 rounded-sm border transition-colors ${
                      isLightMode 
                        ? 'bg-white border-gray-200 hover:border-gray-900' 
                        : 'bg-black border-gray-800 hover:border-white'
                    }`}
                    whileHover={{ x: 4 }}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        isLightMode ? 'bg-gray-100' : 'bg-gray-800'
                      }`}>
                        🐕
                      </div>
                      <div>
                        <div className="mb-1">{item.pet}</div>
                        <div className={`flex items-center gap-2 ${
                          isLightMode ? 'text-gray-600' : 'text-gray-400'
                        }`}>
                          <Clock className="w-4 h-4" />
                          {item.time}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className={`inline-block px-2 py-0.5 rounded-full text-xs ${
                        item.status === 'confirmed' 
                          ? isLightMode 
                            ? 'bg-gray-900 text-white' 
                            : 'bg-white text-gray-900'
                          : isLightMode
                            ? 'bg-gray-400 text-white'
                            : 'bg-gray-600 text-white'
                      }`}>
                        {item.status}
                      </div>
                      <div className={`mt-1 flex items-center gap-1 ${
                        isLightMode ? 'text-gray-500' : 'text-gray-500'
                      }`}>
                        <MapPin className="w-3 h-3" />
                        {item.location}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <button 
                onClick={() => setIsMapOpen(true)}
                className={`p-6 border transition-colors rounded-sm text-left group ${
                  isLightMode 
                    ? 'bg-gray-50 border-gray-200 hover:border-gray-900' 
                    : 'bg-gray-950 border-gray-800 hover:border-white'
                }`}
              >
                <NavIcon className={`w-8 h-8 mb-3 group-hover:scale-110 transition-transform ${isLightMode ? 'text-gray-900' : 'text-white'}`} />
                <h3 className="mb-1">community map</h3>
                <p className={isLightMode ? 'text-gray-600' : 'text-gray-400'}>
                  interactive area visualization
                </p>
              </button>
              <button 
                className={`p-6 border transition-colors rounded-sm text-left group ${
                  isLightMode 
                    ? 'bg-gray-50 border-gray-200 hover:border-gray-900' 
                    : 'bg-gray-950 border-gray-800 hover:border-white'
                }`}
              >
                <Activity className={`w-8 h-8 mb-3 group-hover:scale-110 transition-transform ${isLightMode ? 'text-gray-900' : 'text-white'}`} />
                <h3 className="mb-1">activity dashboard</h3>
                <p className={isLightMode ? 'text-gray-600' : 'text-gray-400'}>
                  analytics & live monitoring
                </p>
              </button>
              <button 
                className={`p-6 border transition-colors rounded-sm text-left group ${
                  isLightMode 
                    ? 'bg-gray-50 border-gray-200 hover:border-gray-900' 
                    : 'bg-gray-950 border-gray-800 hover:border-white'
                }`}
              >
                <Crown className={`w-8 h-8 mb-3 group-hover:scale-110 transition-transform ${isLightMode ? 'text-gray-900' : 'text-white'}`} />
                <h3 className="mb-1">service tiers</h3>
                <p className={isLightMode ? 'text-gray-600' : 'text-gray-400'}>
                  pricing & membership plans
                </p>
              </button>
              <button 
                className={`p-6 border transition-colors rounded-sm text-left group ${
                  isLightMode 
                    ? 'bg-gray-50 border-gray-200 hover:border-gray-900' 
                    : 'bg-gray-950 border-gray-800 hover:border-white'
                }`}
              >
                <Building2 className={`w-8 h-8 mb-3 group-hover:scale-110 transition-transform ${isLightMode ? 'text-gray-900' : 'text-white'}`} />
                <h3 className="mb-1">pet-friendly communities</h3>
                <p className={isLightMode ? 'text-gray-600' : 'text-gray-400'}>
                  explore communities in gachibowli
                </p>
              </button>
              <button 
                className={`p-6 border transition-colors rounded-sm text-left group ${
                  isLightMode 
                    ? 'bg-gray-50 border-gray-200 hover:border-gray-900' 
                    : 'bg-gray-950 border-gray-800 hover:border-white'
                }`}
              >
                <Users className={`w-8 h-8 mb-3 group-hover:scale-110 transition-transform ${isLightMode ? 'text-gray-900' : 'text-white'}`} />
                <h3 className="mb-1">community pets</h3>
                <p className={isLightMode ? 'text-gray-600' : 'text-gray-400'}>
                  browse pets in your society
                </p>
              </button>
              <button 
                className={`p-6 border transition-colors rounded-sm text-left group ${
                  isLightMode 
                    ? 'bg-gray-50 border-gray-200 hover:border-gray-900' 
                    : 'bg-gray-950 border-gray-800 hover:border-white'
                }`}
              >
                <Shield className={`w-8 h-8 mb-3 group-hover:scale-110 transition-transform ${isLightMode ? 'text-gray-900' : 'text-white'}`} />
                <h3 className="mb-1">support & incident center</h3>
                <p className={isLightMode ? 'text-gray-600' : 'text-gray-400'}>
                  get help & report issues
                </p>
              </button>
              {userRole === 'walker' ? (
                <button 
                  onClick={onTrainingClick}
                  className={`p-6 border transition-colors rounded-sm text-left group ${
                    isLightMode 
                      ? 'bg-gray-50 border-gray-200 hover:border-gray-900' 
                      : 'bg-gray-950 border-gray-800 hover:border-white'
                  }`}
                >
                  <GraduationCap className={`w-8 h-8 mb-3 group-hover:scale-110 transition-transform ${isLightMode ? 'text-gray-900' : 'text-white'}`} />
                  <h3 className="mb-1">Safety Training</h3>
                  <p className={isLightMode ? 'text-gray-600' : 'text-gray-400'}>
                    Get certified to volunteer
                  </p>
                </button>
              ) : (
                <button className={`p-6 border transition-colors rounded-sm text-left group ${
                  isLightMode 
                    ? 'bg-gray-50 border-gray-200 hover:border-gray-900' 
                    : 'bg-gray-950 border-gray-800 hover:border-white'
                }`}>
                  <Gift className={`w-8 h-8 mb-3 group-hover:scale-110 transition-transform ${isLightMode ? 'text-gray-900' : 'text-white'}`} />
                  <h3 className="mb-1">redeem rewards</h3>
                  <p className={isLightMode ? 'text-gray-600' : 'text-gray-400'}>
                    use your {pawPoints} paw points
                  </p>
                </button>
              )}
              <button 
                className={`p-6 border transition-colors rounded-sm text-left group ${
                  isLightMode 
                    ? 'bg-gray-50 border-gray-200 hover:border-gray-900' 
                    : 'bg-gray-950 border-gray-800 hover:border-white'
                }`}
              >
                <AlertCircle className={`w-8 h-8 mb-3 group-hover:scale-110 transition-transform ${isLightMode ? 'text-gray-900' : 'text-white'}`} />
                <h3 className="mb-1">lost & found</h3>
                <p className={isLightMode ? 'text-gray-600' : 'text-gray-400'}>
                  report lost pets
                </p>
              </button>
              <button 
                className={`p-6 border transition-colors rounded-sm text-left group ${
                  isLightMode 
                    ? 'bg-gray-50 border-gray-200 hover:border-gray-900' 
                    : 'bg-gray-950 border-gray-800 hover:border-white'
                }`}
              >
                <Store className={`w-8 h-8 mb-3 group-hover:scale-110 transition-transform ${isLightMode ? 'text-gray-900' : 'text-white'}`} />
                <h3 className="mb-1">services</h3>
                <p className={isLightMode ? 'text-gray-600' : 'text-gray-400'}>
                  explore additional services
                </p>
              </button>
              {onVolunteersClick && (
                <button 
                  onClick={onVolunteersClick}
                  className={`p-6 border transition-colors rounded-sm text-left group ${
                    isLightMode 
                      ? 'bg-gray-50 border-gray-200 hover:border-gray-900' 
                      : 'bg-gray-950 border-gray-800 hover:border-white'
                  }`}
                >
                  <Users className={`w-8 h-8 mb-3 group-hover:scale-110 transition-transform ${isLightMode ? 'text-gray-900' : 'text-white'}`} />
                  <h3 className="mb-1">volunteers</h3>
                  <p className={isLightMode ? 'text-gray-600' : 'text-gray-400'}>
                    manage volunteer activities
                  </p>
                </button>
              )}
              {onBookingClick && (
                <button 
                  onClick={onBookingClick}
                  className={`p-6 border transition-colors rounded-sm text-left group ${
                    isLightMode 
                      ? 'bg-gray-50 border-gray-200 hover:border-gray-900' 
                      : 'bg-gray-950 border-gray-800 hover:border-white'
                  }`}
                >
                  <Calendar className={`w-8 h-8 mb-3 group-hover:scale-110 transition-transform ${isLightMode ? 'text-gray-900' : 'text-white'}`} />
                  <h3 className="mb-1">book a walk</h3>
                  <p className={isLightMode ? 'text-gray-600' : 'text-gray-400'}>
                    schedule a new walk
                  </p>
                </button>
              )}
              {onBookingsClick && (
                <button 
                  onClick={onBookingsClick}
                  className={`p-6 border transition-colors rounded-sm text-left group ${
                    isLightMode 
                      ? 'bg-gray-50 border-gray-200 hover:border-gray-900' 
                      : 'bg-gray-950 border-gray-800 hover:border-white'
                  }`}
                >
                  <Calendar className={`w-8 h-8 mb-3 group-hover:scale-110 transition-transform ${isLightMode ? 'text-gray-900' : 'text-white'}`} />
                  <h3 className="mb-1">view bookings</h3>
                  <p className={isLightMode ? 'text-gray-600' : 'text-gray-400'}>
                    manage your bookings
                  </p>
                </button>
              )}
            </motion.div>
          </div>

          {/* Activity Feed - Right Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              className={`rounded-sm p-6 sticky top-24 ${
                isLightMode 
                  ? 'bg-gray-50 border border-gray-200' 
                  : 'bg-gray-950 border border-gray-800'
              }`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="mb-6">Community Updates</h3>
              
              <div className="space-y-4">
                <AnimatePresence>
                  {activityFeed.map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      className={`pb-4 border-b last:border-0 ${
                        isLightMode ? 'border-gray-200' : 'border-gray-800'
                      }`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                    >
                      <div className="flex gap-3">
                        <div className={`p-2 rounded-sm h-fit ${
                          isLightMode ? 'bg-gray-900' : 'bg-white'
                        }`}>
                          <activity.icon className={`w-4 h-4 ${isLightMode ? 'text-white' : 'text-gray-900'}`} />
                        </div>
                        <div className="flex-1">
                          <p className={`mb-1 ${
                            isLightMode ? 'text-gray-700' : 'text-gray-300'
                          }`}>
                            {activity.message}
                          </p>
                          <p className={isLightMode ? 'text-gray-500' : 'text-gray-500'}>
                            {activity.time}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Community Photos Section */}
              {communityPhotos.length > 0 && (
                <div className={`mt-6 pt-6 border-t ${
                  isLightMode ? 'border-gray-200' : 'border-gray-800'
                }`}>
                  <h4 className={`mb-4 flex items-center gap-2 ${isLightMode ? 'text-gray-900' : 'text-white'}`}>
                    <Camera className="w-4 h-4" />
                    Community Photos
                  </h4>
                  <div className="space-y-3">
                    <AnimatePresence>
                      {communityPhotos.map((photo) => (
                        <motion.div
                          key={photo.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className={`rounded-sm overflow-hidden border ${
                            isLightMode ? 'border-gray-200' : 'border-gray-800'
                          }`}
                        >
                          <img 
                            src={photo.url} 
                            alt={`Community photo from ${photo.time}`}
                            className="w-full h-48 object-cover"
                          />
                          <div className={`p-2 flex items-center justify-between ${
                            isLightMode ? 'bg-gray-100' : 'bg-gray-900'
                          }`}>
                            <span className={`text-xs ${isLightMode ? 'text-gray-600' : 'text-gray-400'}`}>
                              submitted at {photo.time}
                            </span>
                            <span className="text-xs text-green-600">✓ verified</span>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {/* Photo Check-in Reminder */}
              <div className={`mt-6 pt-6 border-t ${
                isLightMode ? 'border-gray-200' : 'border-gray-800'
              }`}>
                <div className={`border rounded-sm p-4 ${
                  isLightMode 
                    ? 'bg-gray-100 border-gray-300' 
                    : 'bg-gray-900 border-gray-700'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Camera className={`w-4 h-4 ${isLightMode ? 'text-gray-900' : 'text-white'}`} />
                    <span className={isLightMode ? 'text-gray-900' : 'text-white'}>Reminder</span>
                  </div>
                  <p className={`mb-3 ${isLightMode ? 'text-gray-700' : 'text-gray-300'}`}>
                    Don&apos;t forget to submit your photo check-in during today&apos;s walk!
                  </p>
                  
                  {/* Display uploaded photo */}
                  {uploadedPhoto && (
                    <div className="mb-3">
                      <img 
                        src={uploadedPhoto} 
                        alt="Uploaded check-in" 
                        className="w-full h-48 object-cover rounded-sm"
                      />
                      <p className={`mt-2 flex items-center gap-2 ${
                        isLightMode ? 'text-gray-700' : 'text-gray-300'
                      }`}>
                        <span className="text-green-600">✓</span>
                        photo uploaded successfully!
                      </p>
                    </div>
                  )}
                  
                  <input
                    type="file"
                    accept="image/*"
                    id="photo-upload"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        console.log('Photo uploaded:', file.name);
                        setUploadedPhoto(URL.createObjectURL(file));
                        // Handle photo upload logic here
                      }
                    }}
                  />
                  <label
                    htmlFor="photo-upload"
                    className={`w-full px-4 py-2 border rounded-sm transition-colors cursor-pointer flex items-center justify-center gap-2 lowercase mb-2 ${
                      isLightMode
                        ? 'bg-gray-900 hover:bg-gray-800 text-white border-gray-900'
                        : 'bg-white hover:bg-gray-100 text-gray-900 border-white'
                    }`}
                  >
                    <Camera className="w-4 h-4" />
                    upload photo
                  </label>
                  {uploadedPhoto && (
                    <button
                      onClick={handleSubmitPhoto}
                      className={`w-full px-4 py-2 border rounded-sm transition-colors flex items-center justify-center gap-2 lowercase ${
                        isLightMode
                          ? 'bg-gray-900 hover:bg-gray-800 text-white border-gray-900'
                          : 'bg-white hover:bg-gray-100 text-gray-900 border-white'
                      }`}
                    >
                      <Send className="w-4 h-4" />
                      submit
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Chat Modal */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsChatOpen(false)}
          >
            <motion.div
              className={`w-full max-w-2xl h-[600px] rounded-sm flex flex-col ${
                isLightMode 
                  ? 'bg-white border border-gray-300' 
                  : 'bg-gray-950 border border-gray-800'
              }`}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Chat Header */}
              <div className={`border-b p-4 flex items-center justify-between ${
                isLightMode ? 'border-gray-200' : 'border-gray-800'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isLightMode ? 'bg-gray-100' : 'bg-gray-800'
                  }`}>
                    👤
                  </div>
                  <div>
                    <h3 className="lowercase">Marcus R.</h3>
                    <p className={`${isLightMode ? 'text-gray-600' : 'text-gray-400'}`}>
                      pack leader • 5.0 rating
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsChatOpen(false)}
                  className={`p-2 rounded-sm transition-colors ${
                    isLightMode 
                      ? 'hover:bg-gray-100' 
                      : 'hover:bg-gray-800'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isVolunteer ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-sm p-4 ${
                        message.isVolunteer
                          ? isLightMode
                            ? 'bg-gray-100 text-gray-900'
                            : 'bg-gray-800 text-white'
                          : isLightMode
                            ? 'bg-gray-900 text-white'
                            : 'bg-white text-gray-900'
                      }`}
                    >
                      <p className="mb-1 lowercase">{message.text}</p>
                      <p className={`text-xs ${
                        message.isVolunteer
                          ? isLightMode ? 'text-gray-500' : 'text-gray-500'
                          : isLightMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        {message.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className={`border-t p-4 ${
                isLightMode ? 'border-gray-200' : 'border-gray-800'
              }`}>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="type a message..."
                    className={`flex-1 px-4 py-3 rounded-sm border lowercase ${
                      isLightMode 
                        ? 'bg-gray-50 border-gray-200 text-black placeholder-gray-400' 
                        : 'bg-gray-900 border-gray-700 text-white placeholder-gray-500'
                    }`}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className={`px-4 py-3 rounded-sm transition-colors flex items-center gap-2 lowercase ${
                      newMessage.trim()
                        ? isLightMode
                          ? 'bg-gray-900 hover:bg-gray-800 text-white'
                          : 'bg-white hover:bg-gray-100 text-gray-900'
                        : isLightMode
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                    }`}
                  >
                    <Send className="w-4 h-4" />
                    send
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Google Maps Modal */}
      <AnimatePresence>
        {isMapOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMapOpen(false)}
          >
            <motion.div
              className={`w-full max-w-6xl h-[80vh] rounded-sm flex flex-col overflow-hidden ${
                isLightMode 
                  ? 'bg-white border border-gray-300' 
                  : 'bg-gray-950 border border-gray-800'
              }`}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Map Header */}
              <div className={`border-b p-4 flex items-center justify-between ${
                isLightMode ? 'border-gray-200' : 'border-gray-800'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-sm ${isLightMode ? 'bg-gray-100' : 'bg-gray-800'}`}>
                    <NavIcon className={`w-5 h-5 ${isLightMode ? 'text-gray-900' : 'text-white'}`} />
                  </div>
                  <div>
                    <h3 className="lowercase">community map</h3>
                    <p className={`${isLightMode ? 'text-gray-600' : 'text-gray-400'}`}>
                      gachibowli & surrounding areas
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsMapOpen(false)}
                  className={`p-2 rounded-sm transition-colors ${
                    isLightMode 
                      ? 'hover:bg-gray-100' 
                      : 'hover:bg-gray-800'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Map Content */}
              <div className="flex-1 overflow-hidden">
                <CommunityList
                  communities={mockCommunities}
                  isLightMode={isLightMode}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}