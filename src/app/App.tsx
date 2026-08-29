import { useState } from 'react';
import LandingPage from './components/LandingPage';
import BlogPage from './components/BlogPage';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/AdminDashboard';
import LoginSignup from './components/LoginSignup';
import SupportScreen from './components/SupportScreen';
import SafetyTrainingModule from './components/SafetyTrainingModule';
import CommunityPets from './components/CommunityPets';
import PetMatching from './components/PetMatching';
import VolunteerList from './components/VolunteerList';
import AboutPage from './components/AboutPage';
import BookingPage from './components/BookingPage';
import PaymentScreen from './components/PaymentScreen';
import ThankYouScreen from './components/ThankYouScreen';
import BookingsScreen from './components/BookingsScreen';
import { ThemeProvider } from './contexts/ThemeContext';

export default function App() {
  const [currentPage, setCurrentPage] = useState<'login' | 'home' | 'dashboard' | 'admin' | 'support' | 'training' | 'community' | 'matching' | 'volunteers' | 'about' | 'booking' | 'payment' | 'thankyou' | 'bookings' | 'blog'>('home');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<'owner' | 'walker' | 'renter' | 'admin'>('owner');
  const [userId] = useState('user-' + Math.random().toString(36).substr(2, 9)); // Generate unique user ID
  
  // Booking state
  const [bookingDetails, setBookingDetails] = useState<{
    volunteerId: string;
    volunteerName: string;
    date: string;
    time: string;
    duration: number;
    totalAmount: number;
  } | null>(null);

  // Volunteer profile for matching
  const [volunteer] = useState({
    name: 'sarah',
    rating: 4.9,
    matches: 23,
    isTopRated: true
  });

  const handleLogin = (role: 'owner' | 'walker' | 'renter' | 'admin') => {
    setIsLoggedIn(true);
    setUserRole(role);
    // If admin, go directly to admin dashboard
    if (role === 'admin') {
      setCurrentPage('admin');
    } else {
      setCurrentPage('home');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentPage('login');
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen">
        {currentPage === 'login' && !isLoggedIn && (
          <LoginSignup 
            onClose={() => {}} 
            onLogin={handleLogin}
            isFullPage={true}
          />
        )}

        {currentPage === 'home' && (
          <LandingPage 
            onLoginClick={() => setCurrentPage('login')} 
            isLoggedIn={isLoggedIn}
            onDashboardClick={() => setCurrentPage('dashboard')}
            onLogout={handleLogout}
            onVolunteersClick={() => setCurrentPage('volunteers')}
            onAboutClick={() => setCurrentPage('about')}
            onBookingClick={() => setCurrentPage('booking')}
            onBlogClick={() => setCurrentPage('blog')}
          />
        )}

        {currentPage === 'blog' && (
          <BlogPage
            onHomeClick={() => setCurrentPage('home')}
            onGetStarted={() => setCurrentPage(isLoggedIn ? 'dashboard' : 'login')}
            isLoggedIn={isLoggedIn}
          />
        )}
        
        {currentPage === 'dashboard' && isLoggedIn && (
          <Dashboard 
            userRole={userRole} 
            onBackHome={() => setCurrentPage('home')}
            onLogout={handleLogout}
            onSupportClick={() => setCurrentPage('support')}
            onTrainingClick={() => setCurrentPage('training')}
            onCommunityClick={() => setCurrentPage('community')}
            onVolunteersClick={() => setCurrentPage('volunteers')}
            onBookingClick={() => setCurrentPage('booking')}
            onBookingsClick={() => setCurrentPage('bookings')}
          />
        )}

        {currentPage === 'admin' && isLoggedIn && userRole === 'admin' && (
          <AdminDashboard 
            onBackHome={() => setCurrentPage('home')}
            onLogout={handleLogout}
          />
        )}

        {currentPage === 'support' && isLoggedIn && (
          <SupportScreen 
            onBack={() => setCurrentPage('dashboard')}
            userRole={userRole}
          />
        )}

        {currentPage === 'training' && isLoggedIn && (
          <SafetyTrainingModule 
            onBack={() => setCurrentPage('dashboard')}
            userRole={userRole}
          />
        )}

        {currentPage === 'community' && isLoggedIn && (
          <CommunityPets 
            onBack={() => setCurrentPage('dashboard')}
            userRole={userRole}
            userId={userId}
          />
        )}

        {currentPage === 'matching' && isLoggedIn && (
          <PetMatching 
            onBack={() => setCurrentPage('dashboard')}
            userRole={userRole}
            currentUser={volunteer}
          />
        )}

        {currentPage === 'volunteers' && (
          <VolunteerList 
            onBack={() => setCurrentPage(isLoggedIn ? 'dashboard' : 'home')}
            userRole={userRole}
            onProceedToPayment={(details) => {
              console.log('App.tsx - Received booking details:', details);
              setBookingDetails(details);
              console.log('App.tsx - Navigating to payment page');
              setCurrentPage('payment');
            }}
          />
        )}

        {currentPage === 'about' && (
          <AboutPage 
            onLoginClick={() => setCurrentPage('login')} 
            isLoggedIn={isLoggedIn}
            onDashboardClick={() => setCurrentPage('dashboard')}
            onLogout={handleLogout}
            onHomeClick={() => setCurrentPage('home')}
          />
        )}

        {currentPage === 'booking' && isLoggedIn && (
          <BookingPage 
            onBack={() => setCurrentPage('dashboard')}
            userRole={userRole}
            onProceedToPayment={(details) => {
              setBookingDetails(details);
              setCurrentPage('payment');
            }}
          />
        )}

        {currentPage === 'payment' && bookingDetails && (
          <PaymentScreen 
            onBack={() => setCurrentPage('volunteers')}
            bookingDetails={bookingDetails}
            onPaymentComplete={() => setCurrentPage('thankyou')}
          />
        )}

        {currentPage === 'thankyou' && bookingDetails && (
          <ThankYouScreen 
            onGoToDashboard={() => setCurrentPage('bookings')}
            onGoHome={() => setCurrentPage('home')}
            bookingDetails={bookingDetails}
          />
        )}

        {currentPage === 'bookings' && isLoggedIn && (
          <BookingsScreen 
            onBack={() => setCurrentPage('dashboard')}
            userRole={userRole}
          />
        )}
      </div>
    </ThemeProvider>
  );
}