// TEMPORARY screenshot harness — deleted after capture. Not part of the app.
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from './app/contexts/ThemeContext';
import Dashboard from './app/components/Dashboard';
import VolunteerList from './app/components/VolunteerList';
import BookingPage from './app/components/BookingPage';
import PaymentScreen from './app/components/PaymentScreen';
import BookingsScreen from './app/components/BookingsScreen';
import CommunityPets from './app/components/CommunityPets';
import SafetyTrainingModule from './app/components/SafetyTrainingModule';
import './styles/index.css';

const noop = () => {};
const booking = {
  volunteerId: 'v1', volunteerName: 'sarah m.', date: '2026-09-04',
  time: '7:00 AM', duration: 60, totalAmount: 249,
};

const screen = new URLSearchParams(location.search).get('s') ?? 'dashboard';

const SCREENS: Record<string, JSX.Element> = {
  dashboard: <Dashboard userRole="owner" onBackHome={noop} onLogout={noop} onSupportClick={noop} onTrainingClick={noop} onCommunityClick={noop} onVolunteersClick={noop} onBookingClick={noop} onBookingsClick={noop} />,
  volunteers: <VolunteerList onBack={noop} userRole="owner" onProceedToPayment={noop} />,
  booking: <BookingPage onBack={noop} userRole="owner" onProceedToPayment={noop} />,
  payment: <PaymentScreen onBack={noop} onPaymentComplete={noop} bookingDetails={booking} />,
  bookings: <BookingsScreen onBack={noop} userRole="owner" />,
  community: <CommunityPets onBack={noop} userRole="owner" userId="demo" />,
  safety: <SafetyTrainingModule onBack={noop} userRole="owner" />,
};

createRoot(document.getElementById('root')!).render(
  <ThemeProvider>{SCREENS[screen] ?? <div>unknown: {screen}</div>}</ThemeProvider>,
);
