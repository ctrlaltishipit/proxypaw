import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Shield, 
  Users, 
  DollarSign, 
  MessageSquare, 
  AlertTriangle,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  Eye,
  Ban,
  Trash2,
  FileText,
  Activity,
  Sun,
  Moon,
  Download,
  BarChart3,
  PieChart as PieChartIcon,
  Calendar,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AdminDashboardProps {
  onLogout: () => void;
  onBackHome: () => void;
}

type AdminView = 'overview' | 'users' | 'bgc' | 'moderation' | 'incidents' | 'financials';

// Mock data for analytics
const analyticsData = {
  activeUsers: 1247,
  totalUsers: 2890,
  pendingBGC: 23,
  pendingReports: 15,
  monthlyRevenue: 45678,
  approvedComments: 892,
  flaggedContent: 12
};

const userGrowthData = [
  { month: 'Jan', users: 850, active: 620 },
  { month: 'Feb', users: 1120, active: 780 },
  { month: 'Mar', users: 1450, active: 980 },
  { month: 'Apr', users: 1890, active: 1180 },
  { month: 'May', users: 2340, active: 1420 },
  { month: 'Jun', users: 2890, active: 1247 },
];

const revenueData = [
  { month: 'Jan', revenue: 28500 },
  { month: 'Feb', revenue: 32100 },
  { month: 'Mar', revenue: 35800 },
  { month: 'Apr', revenue: 39200 },
  { month: 'May', revenue: 42300 },
  { month: 'Jun', revenue: 45678 },
];

const userTypeData = [
  { name: 'Pet Owners', value: 1456, color: '#22c55e' },
  { name: 'Walkers', value: 892, color: '#3b82f6' },
  { name: 'Renters', value: 542, color: '#a855f7' },
];

// Mock user data
const mockUsers = [
  { id: '1', name: 'Rajesh Kumar', email: 'rajesh@example.com', role: 'owner', status: 'active', joinDate: '2024-01-15', activity: 'High' },
  { id: '2', name: 'Priya Sharma', email: 'priya@example.com', role: 'walker', status: 'active', joinDate: '2024-02-20', activity: 'Medium' },
  { id: '3', name: 'Amit Patel', email: 'amit@example.com', role: 'renter', status: 'suspended', joinDate: '2024-03-10', activity: 'Low' },
  { id: '4', name: 'Sneha Reddy', email: 'sneha@example.com', role: 'walker', status: 'active', joinDate: '2024-01-28', activity: 'High' },
  { id: '5', name: 'Karthik Iyer', email: 'karthik@example.com', role: 'owner', status: 'active', joinDate: '2024-04-05', activity: 'Medium' },
];

// Mock BGC verification data
const mockBGCQueue = [
  { id: '1', name: 'Deepak Verma', email: 'deepak@example.com', submittedDate: '2024-06-01', status: 'pending', documents: ['ID Proof', 'Address Proof', 'Photo'] },
  { id: '2', name: 'Ananya Singh', email: 'ananya@example.com', submittedDate: '2024-06-02', status: 'pending', documents: ['ID Proof', 'Address Proof', 'Photo'] },
  { id: '3', name: 'Vikram Rao', email: 'vikram@example.com', submittedDate: '2024-06-03', status: 'under_review', documents: ['ID Proof', 'Address Proof', 'Photo'] },
];

// Mock moderation queue
const mockModerationQueue = [
  { id: '1', user: 'Pooja Gupta', content: 'Great experience with Max! Very friendly dog.', type: 'comment', date: '2024-06-05', status: 'pending' },
  { id: '2', user: 'Rahul Joshi', content: 'Looking for a walker in Gachibowli area for weekends.', type: 'post', date: '2024-06-05', status: 'pending' },
  { id: '3', user: 'Meera Das', content: 'Highly recommend this service! Professional and caring.', type: 'review', date: '2024-06-04', status: 'pending' },
];

// Mock incident reports
const mockIncidents = [
  { id: '1', reporter: 'Suresh Babu', type: 'inappropriate_content', priority: 'high', description: 'User posted spam messages in community chat', date: '2024-06-05', status: 'open' },
  { id: '2', reporter: 'Lakshmi Nair', type: 'payment_issue', priority: 'medium', description: 'Payment not reflected after successful transaction', date: '2024-06-04', status: 'in_progress' },
  { id: '3', reporter: 'Arun Mehta', type: 'safety_concern', priority: 'high', description: 'Dog showed aggressive behavior during walk', date: '2024-06-03', status: 'resolved' },
  { id: '4', reporter: 'Divya Kapoor', type: 'lost_pet', priority: 'urgent', description: 'Pet went missing during rental period', date: '2024-06-05', status: 'open' },
];

// Mock financial data
const mockTransactions = [
  { id: '1', user: 'Rohan Desai', amount: 500, type: 'walk', date: '2024-06-05', status: 'completed' },
  { id: '2', user: 'Kavita Srinivas', amount: 1200, type: 'rental', date: '2024-06-05', status: 'completed' },
  { id: '3', user: 'Sanjay Kumar', amount: 800, type: 'premium', date: '2024-06-04', status: 'pending' },
  { id: '4', user: 'Nisha Agarwal', amount: 600, type: 'walk', date: '2024-06-04', status: 'completed' },
];

export default function AdminDashboard({ onLogout, onBackHome }: AdminDashboardProps) {
  const { theme, toggleTheme } = useTheme();
  const isLightMode = theme === 'light';
  const [currentView, setCurrentView] = useState<AdminView>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'completed':
      case 'resolved':
      case 'approved':
        return 'text-green-500';
      case 'pending':
      case 'under_review':
      case 'in_progress':
        return 'text-yellow-500';
      case 'suspended':
      case 'rejected':
      case 'open':
        return 'text-red-500';
      case 'urgent':
        return 'text-orange-500';
      default:
        return isLightMode ? 'text-gray-600' : 'text-gray-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500 text-white';
      case 'high':
        return 'bg-orange-500 text-white';
      case 'medium':
        return 'bg-yellow-500 text-black';
      case 'low':
        return 'bg-green-500 text-white';
      default:
        return isLightMode ? 'bg-gray-200 text-gray-800' : 'bg-gray-800 text-gray-200';
    }
  };

  return (
    <div className={`min-h-screen ${isLightMode ? 'bg-gray-50 text-black' : 'bg-black text-white'}`}>
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
            back to home
          </button>
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-[#4A9EFF]" />
            <h1 className="text-xl lowercase">admin dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
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
              className={`px-4 py-2 border rounded-sm transition-colors lowercase ${
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

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Navigation Tabs */}
        <div className={`flex gap-2 mb-8 overflow-x-auto pb-2 ${
          isLightMode ? 'border-b border-gray-200' : 'border-b border-gray-800'
        }`}>
          {[
            { key: 'overview', label: 'overview', icon: BarChart3 },
            { key: 'users', label: 'user management', icon: Users },
            { key: 'bgc', label: 'bgc verification', icon: Shield },
            { key: 'moderation', label: 'content moderation', icon: MessageSquare },
            { key: 'incidents', label: 'incident reports', icon: AlertTriangle },
            { key: 'financials', label: 'financials', icon: DollarSign },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setCurrentView(key as AdminView)}
              className={`flex items-center gap-2 px-4 py-2 rounded-sm transition-colors whitespace-nowrap lowercase ${
                currentView === key
                  ? isLightMode
                    ? 'bg-gray-900 text-white'
                    : 'bg-white text-black'
                  : isLightMode
                    ? 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                    : 'bg-gray-900 hover:bg-gray-800 text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Overview Section */}
        {currentView === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'total users', value: analyticsData.totalUsers, icon: Users, color: 'text-blue-500' },
                { label: 'active users', value: analyticsData.activeUsers, icon: Activity, color: 'text-green-500' },
                { label: 'pending bgc', value: analyticsData.pendingBGC, icon: Shield, color: 'text-yellow-500' },
                { label: 'open reports', value: analyticsData.pendingReports, icon: AlertTriangle, color: 'text-red-500' },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`rounded-sm border p-6 ${
                    isLightMode ? 'bg-white border-gray-200' : 'bg-gray-950 border-gray-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm lowercase ${isLightMode ? 'text-gray-600' : 'text-gray-400'}`}>
                      {stat.label}
                    </span>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <p className="text-3xl font-bold">{stat.value.toLocaleString()}</p>
                </motion.div>
              ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* User Growth Chart */}
              <div className={`rounded-sm border p-6 ${
                isLightMode ? 'bg-white border-gray-200' : 'bg-gray-950 border-gray-800'
              }`}>
                <h3 className="mb-4 lowercase flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  user growth trend
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={userGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isLightMode ? '#e5e7eb' : '#374151'} />
                    <XAxis dataKey="month" stroke={isLightMode ? '#6b7280' : '#9ca3af'} />
                    <YAxis stroke={isLightMode ? '#6b7280' : '#9ca3af'} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: isLightMode ? '#fff' : '#1f2937', 
                        border: `1px solid ${isLightMode ? '#e5e7eb' : '#374151'}`,
                        color: isLightMode ? '#000' : '#fff'
                      }} 
                    />
                    <Legend />
                    <Line type="monotone" dataKey="users" stroke="#3b82f6" name="Total Users" />
                    <Line type="monotone" dataKey="active" stroke="#22c55e" name="Active Users" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* User Type Distribution */}
              <div className={`rounded-sm border p-6 ${
                isLightMode ? 'bg-white border-gray-200' : 'bg-gray-950 border-gray-800'
              }`}>
                <h3 className="mb-4 lowercase flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5" />
                  user type distribution
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={userTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {userTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: isLightMode ? '#fff' : '#1f2937', 
                        border: `1px solid ${isLightMode ? '#e5e7eb' : '#374151'}`,
                        color: isLightMode ? '#000' : '#fff'
                      }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Revenue Chart */}
              <div className={`rounded-sm border p-6 lg:col-span-2 ${
                isLightMode ? 'bg-white border-gray-200' : 'bg-gray-950 border-gray-800'
              }`}>
                <h3 className="mb-4 lowercase flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  monthly revenue
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isLightMode ? '#e5e7eb' : '#374151'} />
                    <XAxis dataKey="month" stroke={isLightMode ? '#6b7280' : '#9ca3af'} />
                    <YAxis stroke={isLightMode ? '#6b7280' : '#9ca3af'} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: isLightMode ? '#fff' : '#1f2937', 
                        border: `1px solid ${isLightMode ? '#e5e7eb' : '#374151'}`,
                        color: isLightMode ? '#000' : '#fff'
                      }} 
                    />
                    <Bar dataKey="revenue" fill="#22c55e" name="Revenue (₹)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>
        )}

        {/* User Management Section */}
        {currentView === 'users' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Search and Filters */}
            <div className={`rounded-sm border p-4 ${
              isLightMode ? 'bg-white border-gray-200' : 'bg-gray-950 border-gray-800'
            }`}>
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                    isLightMode ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                  <input
                    type="text"
                    placeholder="search users by name, email, or id..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 rounded-sm border lowercase ${
                      isLightMode 
                        ? 'bg-gray-50 border-gray-300 focus:border-gray-900' 
                        : 'bg-black border-gray-700 focus:border-white'
                    } focus:outline-none`}
                  />
                </div>
                <button className={`flex items-center gap-2 px-4 py-2 rounded-sm border lowercase ${
                  isLightMode 
                    ? 'bg-gray-100 border-gray-300 hover:bg-gray-200' 
                    : 'bg-gray-900 border-gray-700 hover:bg-gray-800'
                }`}>
                  <Filter className="w-4 h-4" />
                  filters
                </button>
              </div>
            </div>

            {/* Users Table */}
            <div className={`rounded-sm border overflow-hidden ${
              isLightMode ? 'bg-white border-gray-200' : 'bg-gray-950 border-gray-800'
            }`}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={isLightMode ? 'bg-gray-50' : 'bg-gray-900'}>
                    <tr>
                      <th className={`px-6 py-3 text-left text-xs uppercase tracking-wider lowercase ${
                        isLightMode ? 'text-gray-700' : 'text-gray-300'
                      }`}>
                        user
                      </th>
                      <th className={`px-6 py-3 text-left text-xs uppercase tracking-wider lowercase ${
                        isLightMode ? 'text-gray-700' : 'text-gray-300'
                      }`}>
                        role
                      </th>
                      <th className={`px-6 py-3 text-left text-xs uppercase tracking-wider lowercase ${
                        isLightMode ? 'text-gray-700' : 'text-gray-300'
                      }`}>
                        status
                      </th>
                      <th className={`px-6 py-3 text-left text-xs uppercase tracking-wider lowercase ${
                        isLightMode ? 'text-gray-700' : 'text-gray-300'
                      }`}>
                        activity
                      </th>
                      <th className={`px-6 py-3 text-left text-xs uppercase tracking-wider lowercase ${
                        isLightMode ? 'text-gray-700' : 'text-gray-300'
                      }`}>
                        joined
                      </th>
                      <th className={`px-6 py-3 text-left text-xs uppercase tracking-wider lowercase ${
                        isLightMode ? 'text-gray-700' : 'text-gray-300'
                      }`}>
                        actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {mockUsers.map((user) => (
                      <tr key={user.id} className={isLightMode ? 'hover:bg-gray-50' : 'hover:bg-gray-900'}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="lowercase">{user.name}</div>
                            <div className={`text-sm ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>
                              {user.email}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap lowercase">
                          <span className={`px-2 py-1 rounded-sm text-xs ${
                            isLightMode ? 'bg-blue-100 text-blue-800' : 'bg-blue-900 text-blue-200'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`lowercase ${getStatusColor(user.status)}`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap lowercase">
                          {user.activity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm lowercase">
                          {user.joinDate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex gap-2">
                            <button className="p-1 hover:text-blue-500 transition-colors" title="View Details">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="p-1 hover:text-yellow-500 transition-colors" title="Suspend User">
                              <Ban className="w-4 h-4" />
                            </button>
                            <button className="p-1 hover:text-red-500 transition-colors" title="Delete User">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* BGC Verification Section */}
        {currentView === 'bgc' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className={`rounded-sm border p-4 ${
              isLightMode ? 'bg-yellow-50 border-yellow-200' : 'bg-yellow-950 border-yellow-800'
            }`}>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                <p className="lowercase">
                  {mockBGCQueue.length} background check applications pending review
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {mockBGCQueue.map((application) => (
                <div
                  key={application.id}
                  className={`rounded-sm border p-6 ${
                    isLightMode ? 'bg-white border-gray-200' : 'bg-gray-950 border-gray-800'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="lowercase mb-1">{application.name}</h3>
                      <div className={`text-sm ${isLightMode ? 'text-gray-600' : 'text-gray-400'}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <Mail className="w-4 h-4" />
                          <span>{application.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>submitted: {application.submittedDate}</span>
                        </div>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-sm text-xs uppercase ${getStatusColor(application.status)}`}>
                      {application.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="mb-4">
                    <p className={`text-sm mb-2 lowercase ${isLightMode ? 'text-gray-700' : 'text-gray-300'}`}>
                      documents submitted:
                    </p>
                    <div className="flex gap-2">
                      {application.documents.map((doc, index) => (
                        <button
                          key={index}
                          className={`flex items-center gap-2 px-3 py-2 rounded-sm border lowercase text-sm ${
                            isLightMode 
                              ? 'bg-gray-50 border-gray-300 hover:bg-gray-100' 
                              : 'bg-gray-900 border-gray-700 hover:bg-gray-800'
                          }`}
                        >
                          <FileText className="w-4 h-4" />
                          {doc.toLowerCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-sm hover:bg-green-600 transition-colors lowercase">
                      <CheckCircle className="w-4 h-4" />
                      approve
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-sm hover:bg-red-600 transition-colors lowercase">
                      <XCircle className="w-4 h-4" />
                      reject
                    </button>
                    <button className={`flex items-center gap-2 px-4 py-2 rounded-sm border lowercase ${
                      isLightMode 
                        ? 'bg-gray-100 border-gray-300 hover:bg-gray-200' 
                        : 'bg-gray-900 border-gray-700 hover:bg-gray-800'
                    }`}>
                      <Eye className="w-4 h-4" />
                      view details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Content Moderation Section */}
        {currentView === 'moderation' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className={`rounded-sm border p-4 ${
              isLightMode ? 'bg-blue-50 border-blue-200' : 'bg-blue-950 border-blue-800'
            }`}>
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-500" />
                <p className="lowercase">
                  {mockModerationQueue.length} items pending moderation
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {mockModerationQueue.map((item) => (
                <div
                  key={item.id}
                  className={`rounded-sm border p-6 ${
                    isLightMode ? 'bg-white border-gray-200' : 'bg-gray-950 border-gray-800'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="lowercase">{item.user}</h3>
                        <span className={`px-2 py-1 rounded-sm text-xs lowercase ${
                          isLightMode ? 'bg-purple-100 text-purple-800' : 'bg-purple-900 text-purple-200'
                        }`}>
                          {item.type}
                        </span>
                      </div>
                      <p className={`text-sm ${isLightMode ? 'text-gray-600' : 'text-gray-400'}`}>
                        {item.date}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-sm text-xs uppercase ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </div>

                  <div className={`p-4 rounded-sm mb-4 ${
                    isLightMode ? 'bg-gray-50' : 'bg-gray-900'
                  }`}>
                    <p className="lowercase">{item.content}</p>
                  </div>

                  <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-sm hover:bg-green-600 transition-colors lowercase">
                      <CheckCircle className="w-4 h-4" />
                      approve
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-sm hover:bg-red-600 transition-colors lowercase">
                      <XCircle className="w-4 h-4" />
                      reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Incident Reports Section */}
        {currentView === 'incidents' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className={`rounded-sm border p-4 ${
              isLightMode ? 'bg-red-50 border-red-200' : 'bg-red-950 border-red-800'
            }`}>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <p className="lowercase">
                  {mockIncidents.filter(i => i.status === 'open').length} urgent incidents require attention
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {mockIncidents.map((incident) => (
                <div
                  key={incident.id}
                  className={`rounded-sm border p-6 ${
                    isLightMode ? 'bg-white border-gray-200' : 'bg-gray-950 border-gray-800'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="lowercase">{incident.reporter}</h3>
                        <span className={`px-2 py-1 rounded-sm text-xs lowercase ${getPriorityColor(incident.priority)}`}>
                          {incident.priority}
                        </span>
                        <span className={`px-2 py-1 rounded-sm text-xs lowercase ${
                          isLightMode ? 'bg-gray-100 text-gray-800' : 'bg-gray-800 text-gray-200'
                        }`}>
                          {incident.type.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className={`text-sm mb-2 ${isLightMode ? 'text-gray-600' : 'text-gray-400'}`}>
                        {incident.date}
                      </p>
                      <p className="lowercase">{incident.description}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-sm text-xs uppercase whitespace-nowrap ${getStatusColor(incident.status)}`}>
                      {incident.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button className={`flex items-center gap-2 px-4 py-2 rounded-sm lowercase ${
                      isLightMode 
                        ? 'bg-blue-500 text-white hover:bg-blue-600' 
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}>
                      <Eye className="w-4 h-4" />
                      view full report
                    </button>
                    {incident.status === 'open' && (
                      <button className={`flex items-center gap-2 px-4 py-2 rounded-sm border lowercase ${
                        isLightMode 
                          ? 'bg-gray-100 border-gray-300 hover:bg-gray-200' 
                          : 'bg-gray-900 border-gray-700 hover:bg-gray-800'
                      }`}>
                        <Clock className="w-4 h-4" />
                        assign to me
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Financials Section */}
        {currentView === 'financials' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Revenue Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: 'monthly revenue', value: `₹${analyticsData.monthlyRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-green-500' },
                { label: 'pending payments', value: '3', icon: Clock, color: 'text-yellow-500' },
                { label: 'total transactions', value: '1,234', icon: Activity, color: 'text-blue-500' },
              ].map((stat, index) => (
                <div
                  key={index}
                  className={`rounded-sm border p-6 ${
                    isLightMode ? 'bg-white border-gray-200' : 'bg-gray-950 border-gray-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm lowercase ${isLightMode ? 'text-gray-600' : 'text-gray-400'}`}>
                      {stat.label}
                    </span>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Transactions Table */}
            <div className={`rounded-sm border overflow-hidden ${
              isLightMode ? 'bg-white border-gray-200' : 'bg-gray-950 border-gray-800'
            }`}>
              <div className="p-4 flex items-center justify-between border-b">
                <h3 className="lowercase">recent transactions</h3>
                <button className={`flex items-center gap-2 px-4 py-2 rounded-sm border lowercase ${
                  isLightMode 
                    ? 'bg-gray-100 border-gray-300 hover:bg-gray-200' 
                    : 'bg-gray-900 border-gray-700 hover:bg-gray-800'
                }`}>
                  <Download className="w-4 h-4" />
                  export
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={isLightMode ? 'bg-gray-50' : 'bg-gray-900'}>
                    <tr>
                      <th className={`px-6 py-3 text-left text-xs uppercase tracking-wider lowercase ${
                        isLightMode ? 'text-gray-700' : 'text-gray-300'
                      }`}>
                        transaction id
                      </th>
                      <th className={`px-6 py-3 text-left text-xs uppercase tracking-wider lowercase ${
                        isLightMode ? 'text-gray-700' : 'text-gray-300'
                      }`}>
                        user
                      </th>
                      <th className={`px-6 py-3 text-left text-xs uppercase tracking-wider lowercase ${
                        isLightMode ? 'text-gray-700' : 'text-gray-300'
                      }`}>
                        amount
                      </th>
                      <th className={`px-6 py-3 text-left text-xs uppercase tracking-wider lowercase ${
                        isLightMode ? 'text-gray-700' : 'text-gray-300'
                      }`}>
                        type
                      </th>
                      <th className={`px-6 py-3 text-left text-xs uppercase tracking-wider lowercase ${
                        isLightMode ? 'text-gray-700' : 'text-gray-300'
                      }`}>
                        date
                      </th>
                      <th className={`px-6 py-3 text-left text-xs uppercase tracking-wider lowercase ${
                        isLightMode ? 'text-gray-700' : 'text-gray-300'
                      }`}>
                        status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {mockTransactions.map((transaction) => (
                      <tr key={transaction.id} className={isLightMode ? 'hover:bg-gray-50' : 'hover:bg-gray-900'}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm lowercase">
                          #{transaction.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap lowercase">
                          {transaction.user}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          ₹{transaction.amount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap lowercase">
                          <span className={`px-2 py-1 rounded-sm text-xs ${
                            isLightMode ? 'bg-blue-100 text-blue-800' : 'bg-blue-900 text-blue-200'
                          }`}>
                            {transaction.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm lowercase">
                          {transaction.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`lowercase ${getStatusColor(transaction.status)}`}>
                            {transaction.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
