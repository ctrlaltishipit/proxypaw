import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, CreditCard, Lock, Calendar, Clock, User } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { formatPrice, formatPriceDual, detectCurrency } from '../utils/pricing';

interface PaymentScreenProps {
  onBack: () => void;
  onPaymentComplete: () => void;
  bookingDetails: {
    volunteerId: string;
    volunteerName: string;
    date: string;
    time: string;
    duration: number;
    totalAmount: number;
  };
}

export default function PaymentScreen({ onBack, onPaymentComplete, bookingDetails }: PaymentScreenProps) {
  const { theme } = useTheme();
  const isLightMode = theme === 'light';
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = () => {
    setIsProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      onPaymentComplete();
    }, 2000);
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const chunks = cleaned.match(/.{1,4}/g);
    return chunks ? chunks.join(' ') : cleaned;
  };

  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  const isFormValid = cardNumber.replace(/\s/g, '').length === 16 && 
                      cardName.length > 0 && 
                      expiryDate.length === 5 && 
                      cvv.length === 3;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
            disabled={isProcessing}
          >
            <ArrowLeft className="w-6 h-6 text-gray-900" />
          </button>
          <h1 className="text-gray-900">payment</h1>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="md:col-span-2">
            <div className="bg-white p-8 rounded-sm border border-gray-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-[#6B4423]/10 to-[#8B6F47]/10 rounded-full">
                  <CreditCard className="w-6 h-6 text-[#6B4423]" />
                </div>
                <h2 className="text-gray-900">card details</h2>
              </div>

              <div className="space-y-6">
                {/* Card Number */}
                <div>
                  <label className="block mb-2 text-gray-700">card number</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => {
                      const cleaned = e.target.value.replace(/\s/g, '');
                      if (cleaned.length <= 16 && /^\d*$/.test(cleaned)) {
                        setCardNumber(formatCardNumber(cleaned));
                      }
                    }}
                    placeholder="1234 5678 9012 3456"
                    className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:outline-none focus:border-[#6B4423]"
                    maxLength={19}
                  />
                </div>

                {/* Cardholder Name */}
                <div>
                  <label className="block mb-2 text-gray-700">cardholder name</label>
                  <input
                    type="text"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="john doe"
                    className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:outline-none focus:border-[#6B4423]"
                  />
                </div>

                {/* Expiry & CVV */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 text-gray-700">expiry date</label>
                    <input
                      type="text"
                      value={expiryDate}
                      onChange={(e) => {
                        const cleaned = e.target.value.replace(/\D/g, '');
                        if (cleaned.length <= 4) {
                          setExpiryDate(formatExpiryDate(cleaned));
                        }
                      }}
                      placeholder="MM/YY"
                      className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:outline-none focus:border-[#6B4423]"
                      maxLength={5}
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-gray-700">cvv</label>
                    <input
                      type="text"
                      value={cvv}
                      onChange={(e) => {
                        if (e.target.value.length <= 3 && /^\d*$/.test(e.target.value)) {
                          setCvv(e.target.value);
                        }
                      }}
                      placeholder="123"
                      className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:outline-none focus:border-[#6B4423]"
                      maxLength={3}
                    />
                  </div>
                </div>

                {/* Security Notice */}
                <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-sm border border-gray-300">
                  <Lock className="w-5 h-5 text-[#6B4423] flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-gray-900 mb-1">secure payment</div>
                    <p className="text-gray-600">
                      your payment information is encrypted and secure. we never store your card details.
                    </p>
                  </div>
                </div>

                {/* Payment Button */}
                <button
                  onClick={handlePayment}
                  disabled={!isFormValid || isProcessing}
                  className={`w-full py-4 rounded-sm transition-all flex items-center justify-center gap-2 ${
                    isFormValid && !isProcessing
                      ? 'bg-gradient-to-br from-[#6B4423] to-[#8B6F47] hover:from-[#8B6F47] hover:to-[#6B4423] text-white shadow-md hover:shadow-lg'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      processing payment...
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5" />
                      pay {formatPrice(bookingDetails.totalAmount, 'INR')}{detectCurrency() !== 'INR' ? ` (~${formatPrice(bookingDetails.totalAmount, detectCurrency())})` : ''}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Booking Summary */}
          <div className="md:col-span-1">
            <div className="bg-white p-6 rounded-sm border border-gray-300 sticky top-8">
              <h2 className="mb-6 text-gray-900">booking details</h2>
              
              <div className="space-y-4">
                <div className="pb-4 border-b border-gray-300">
                  <div className="text-gray-600 mb-1 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    volunteer
                  </div>
                  <div className="text-gray-900">{bookingDetails.volunteerName}</div>
                </div>

                <div className="pb-4 border-b border-gray-300">
                  <div className="text-gray-600 mb-1 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    date
                  </div>
                  <div className="text-gray-900">
                    {new Date(bookingDetails.date).toLocaleDateString('en-IN', { 
                      day: 'numeric', 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </div>
                </div>

                <div className="pb-4 border-b border-gray-300">
                  <div className="text-gray-600 mb-1 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    time
                  </div>
                  <div className="text-gray-900">{bookingDetails.time}</div>
                </div>

                <div className="pb-4 border-b border-gray-300">
                  <div className="text-gray-600 mb-1">duration</div>
                  <div className="text-gray-900">{bookingDetails.duration} minutes</div>
                </div>

                <div className="pt-2">
                  <div className="text-gray-600 mb-1">total amount</div>
                  <div className="text-gray-900 bg-gradient-to-br from-[#6B4423]/10 to-[#8B6F47]/10 px-3 py-2 rounded-sm">{formatPriceDual(bookingDetails.totalAmount)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}