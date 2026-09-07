import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles, Award, Clock, Shield, Heart, Send, Star, Crown, Trophy } from 'lucide-react';
import Navigation from './Navigation';
import PostItTestimonials from './PostItTestimonials';
import TestimonialForm from './TestimonialForm';
import VolunteerApplicationForm from './VolunteerApplicationForm';
import EmailConfirmationModal from './EmailConfirmationModal';
import { useTheme } from '../contexts/ThemeContext';
import { formatPriceDual, ENTRY_PRICE_INR } from '../utils/pricing';
import heroImage from 'figma:asset/5b5a590a2b2ded28914503942b26ad9a1ba794a5.png';

interface HomePageProps {
  onLoginClick: () => void;
  isLoggedIn: boolean;
  onDashboardClick: () => void;
  onLogout: () => void;
  onVolunteersClick: () => void;
  onAboutClick?: () => void;
  onBookingClick?: () => void;
}

export default function HomePage({ onLoginClick, isLoggedIn, onDashboardClick, onLogout, onVolunteersClick, onAboutClick, onBookingClick }: HomePageProps) {
  const { theme } = useTheme();
  const isLightMode = theme === 'light';
  const [showTestimonialForm, setShowTestimonialForm] = useState(false);
  const [showVolunteerForm, setShowVolunteerForm] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

  const handleVolunteerClick = () => {
    setShowVolunteerForm(true);
  };

  const handleVolunteerFormBack = () => {
    setShowVolunteerForm(false);
  };

  const handleVolunteerSubmitSuccess = () => {
    setShowVolunteerForm(false);
    setShowConfirmationModal(true);
  };

  const handleConfirmationClose = () => {
    setShowConfirmationModal(false);
  };

  // Show volunteer application form
  if (showVolunteerForm) {
    return (
      <VolunteerApplicationForm 
        onBack={handleVolunteerFormBack}
        onSubmitSuccess={handleVolunteerSubmitSuccess}
      />
    );
  }

  return (
    <div className="bg-white text-gray-900">
      <Navigation 
        onLoginClick={onLoginClick} 
        isLoggedIn={isLoggedIn}
        onDashboardClick={onDashboardClick}
        onLogout={onLogout}
        onHomeClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        onAboutClick={onAboutClick}
      />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={heroImage}
            alt="Cat and dog together in garden"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/5"></div>
        </div>
        
        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          <motion.h1 
            className="mb-8 text-white drop-shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            connect. care. community.
          </motion.h1>
          
          <motion.p 
            className="mb-12 text-white drop-shadow-lg max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            join our community-powered platform where ai matches pets with perfect companions. 
            walk, care, and connect, all while earning rewards.
          </motion.p>

          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onVolunteersClick?.();
              }}
              className="px-8 py-4 bg-gradient-to-br from-[#6B4423] to-[#8B6F47] hover:from-[#8B6F47] hover:to-[#6B4423] text-white transition-all duration-300 rounded-sm shadow-lg hover:shadow-xl flex items-center justify-center gap-2 cursor-pointer"
            >
              find a walker
              <ArrowRight className="w-5 h-5" />
            </button>
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleVolunteerClick();
              }}
              className="px-8 py-4 bg-white/95 hover:bg-white text-gray-900 transition-colors rounded-sm cursor-pointer"
            >
              volunteer to walk
            </button>
          </motion.div>
        </div>
      </section>

      {/* Storytelling Section */}
      <section className={`py-24 px-6 ${isLightMode ? 'bg-white' : 'bg-gray-950'}`}>
        <div className="max-w-4xl mx-auto space-y-16">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className={`mb-6 ${isLightMode ? 'text-gray-900' : 'text-white'}`}>a thoughtful initiative</h2>
            <p className={`max-w-2xl mx-auto ${isLightMode ? 'text-gray-600' : 'text-gray-300'}`}>
              ProxyPaw isn&apos;t just a service, it&apos;s a movement. we believe every pet deserves 
              enriching experiences, and every community member should have the opportunity to 
              connect through responsible pet care.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Heart,
                title: 'community first',
                description: 'built on trust, verified volunteers, and local connections that matter.'
              },
              {
                icon: Shield,
                title: 'safety assured',
                description: 'background checks, real-time tracking, and comprehensive insurance for peace of mind.'
              },
              {
                icon: Sparkles,
                title: 'ai-powered matching',
                description: 'our intelligent system pairs pets with perfect companions based on personality and needs.'
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 mb-4 border-2 rounded-full bg-gradient-to-br from-[#4A7C59]/10 to-[#7BA662]/10 border-[#4A7C59]">
                  <item.icon className="w-8 h-8 text-[#4A7C59]" />
                </div>
                <h3 className={`mb-3 ${isLightMode ? 'text-gray-900' : 'text-white'}`}>{item.title}</h3>
                <p className={`${isLightMode ? 'text-gray-600' : 'text-gray-300'}`}>{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Workflow Section */}
      <section className={`py-24 px-6 ${isLightMode ? 'bg-gradient-to-b from-gray-50 to-gray-100' : 'bg-gradient-to-b from-gray-900 to-gray-950'}`}>
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className={`mb-4 ${isLightMode ? 'text-gray-900' : 'text-white'}`}>ai matchmaking: the perfect paw partner</h2>
            <p className={`${isLightMode ? 'text-gray-600' : 'text-gray-300'}`}>experience our seamless, intelligent workflow</p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8 bg-[rgba(0,0,0,0)]">
            {[
              { step: '01', title: 'profile creation', desc: 'tell us about your pet or availability' },
              { step: '02', title: 'ai analysis', desc: 'smart matching based on personality & needs' },
              { step: '03', title: 'perfect match', desc: 'meet your ideal walking companion' },
              { step: '04', title: 'track & reward', desc: 'monitor progress and earn paw points' }
            ].map((item, index) => (
              <motion.div
                key={index}
                className="relative"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
              >
                <div className={`mb-4 ${isLightMode ? 'text-black' : 'text-white'}`}>{item.step}</div>
                <h3 className={`mb-2 ${isLightMode ? 'text-gray-900' : 'text-white'}`}>{item.title}</h3>
                <p className={`${isLightMode ? 'text-gray-600' : 'text-gray-300'}`}>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Reward System Section */}
      <section className={`py-24 px-6 relative overflow-hidden ${isLightMode ? 'bg-white' : 'bg-gray-950'}`}>
        {/* Decorative background elements */}
        <div className={`absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-[#4A7C59]/5 to-[#7BA662]/5 rounded-full blur-3xl ${isLightMode ? 'opacity-100' : 'opacity-30'}`}></div>
        <div className={`absolute bottom-10 right-10 w-40 h-40 bg-gradient-to-br from-[#6B4423]/5 to-[#8B6F47]/5 rounded-full blur-3xl ${isLightMode ? 'opacity-100' : 'opacity-30'}`}></div>
        
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center justify-center w-20 h-20 mb-6 bg-gradient-to-br from-[#6B4423]/10 to-[#8B6F47]/10 rounded-full border-2 border-[#6B4423]/20">
              <Award className="w-12 h-12 text-[#6B4423]" />
            </div>
            <h2 className={`mb-4 ${isLightMode ? 'text-gray-900' : 'text-white'}`}>earn paw points</h2>
            <p className={`${isLightMode ? 'text-gray-600' : 'text-gray-300'}`}>get rewarded for being an amazing community member</p>
            
            {/* Progress visualization */}
            <div className="mt-8 max-w-2xl mx-auto">
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>0</span>
                <span className={`text-sm ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>500</span>
                <span className={`text-sm ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>1500+</span>
              </div>
              <div className="h-2 bg-gradient-to-r from-[#8B6F47]/20 via-[#6B4423]/20 to-[#4A7C59]/20 rounded-full relative">
                <div className={`absolute top-1/2 -translate-y-1/2 left-0 w-3 h-3 bg-[#8B6F47] rounded-full border-2 shadow-md ${isLightMode ? 'border-white' : 'border-gray-950'}`}></div>
                <div className={`absolute top-1/2 -translate-y-1/2 left-1/3 w-3 h-3 bg-[#6B4423] rounded-full border-2 shadow-md ${isLightMode ? 'border-white' : 'border-gray-950'}`}></div>
                <div className={`absolute top-1/2 -translate-y-1/2 right-0 w-3 h-3 bg-[#4A7C59] rounded-full border-2 shadow-md ${isLightMode ? 'border-white' : 'border-gray-950'}`}></div>
              </div>
            </div>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { 
                tier: 'pup scout', 
                points: '0-500', 
                perks: 'welcome badge, profile customization',
                icon: Star,
                gradient: 'from-[#8B6F47] to-[#A0855B]',
                bgGradient: 'from-[#8B6F47]/5 to-[#A0855B]/5',
                ringColor: 'ring-[#8B6F47]/30'
              },
              { 
                tier: 'pack leader', 
                points: '500-1500', 
                perks: 'priority matching, exclusive events, 10% partner discounts',
                icon: Trophy,
                gradient: 'from-[#6B4423] to-[#8B6F47]',
                bgGradient: 'from-[#6B4423]/5 to-[#8B6F47]/5',
                ringColor: 'ring-[#6B4423]/30'
              },
              { 
                tier: 'alpha guardian', 
                points: '1500+', 
                perks: 'premium support, free merchandise, 25% partner discounts',
                icon: Crown,
                gradient: 'from-[#4A7C59] to-[#5D7349]',
                bgGradient: 'from-[#4A7C59]/5 to-[#5D7349]/5',
                ringColor: 'ring-[#4A7C59]/30'
              }
            ].map((tier, index) => {
              const IconComponent = tier.icon;
              return (
                <motion.div
                  key={index}
                  className={`border-2 hover:border-[#6B4423] transition-all p-8 rounded-sm bg-gradient-to-br ${tier.bgGradient} hover:shadow-lg group relative overflow-hidden ${isLightMode ? 'border-gray-300' : 'border-gray-700'}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  {/* Tier badge */}
                  <div className="absolute top-4 right-4">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${tier.gradient} flex items-center justify-center shadow-md ring-4 ${tier.ringColor}`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  
                  {/* Decorative paw prints */}
                  <div className="absolute -bottom-2 -left-2 opacity-5 group-hover:opacity-10 transition-opacity">
                    <svg width="60" height="60" viewBox="0 0 24 24" fill="currentColor" className={`${isLightMode ? 'text-gray-900' : 'text-white'}`}>
                      <path d="M12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-4-3c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm8 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM6 15c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                    </svg>
                  </div>

                  <div className="relative z-10">
                    <h3 className={`mb-2 ${isLightMode ? 'text-gray-900' : 'text-white'}`}>{tier.tier}</h3>
                    <div className={`inline-block px-4 py-1 rounded-full bg-gradient-to-r ${tier.gradient} bg-clip-text text-transparent mb-4 ring-1 ${isLightMode ? 'ring-gray-200' : 'ring-gray-700'}`}>
                      {tier.points} points
                    </div>
                    <p className={`mt-4 ${isLightMode ? 'text-gray-600' : 'text-gray-300'}`}>{tier.perks}</p>
                    
                    {/* Progression indicator */}
                    <div className="mt-6 flex items-center gap-1">
                      {[...Array(3)].map((_, i) => (
                        <div 
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-all ${
                            i <= index 
                              ? `bg-gradient-to-r ${tier.gradient}` 
                              : isLightMode ? 'bg-gray-200' : 'bg-gray-700'
                          }`}
                        ></div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Hourly Rental Section */}
      <section className={`py-24 px-6 ${isLightMode ? 'bg-gradient-to-b from-gray-50 to-gray-100' : 'bg-gradient-to-b from-gray-900 to-gray-950'}`}>
        <div className="max-w-4xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <Clock className="w-12 h-12 text-[#4A7C59] mx-auto mb-4" />
            <h2 className={`mb-4 ${isLightMode ? 'text-gray-900' : 'text-white'}`}>temporary enrichment fostering</h2>
            <p className={`max-w-2xl mx-auto ${isLightMode ? 'text-gray-600' : 'text-gray-300'}`}>
              experience the joy of pet companionship without long-term commitment. 
              perfect for enriching a pet&apos;s day while giving them extra love and attention.
            </p>
          </motion.div>

          <motion.div 
            className={`border-2 bg-gradient-to-br p-8 rounded-sm shadow-lg ${isLightMode ? 'border-gray-200 from-white to-[#F5F3EE]/30' : 'border-gray-700 from-gray-900 to-gray-800'}`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className={`mb-4 ${isLightMode ? 'text-gray-900' : 'text-white'}`}>how it works</h3>
                <ul className={`space-y-3 ${isLightMode ? 'text-gray-600' : 'text-gray-300'}`}>
                  <li className="flex items-start gap-2">
                    <span className="text-[#4A7C59] mt-1">•</span>
                    <span>pass our safety quiz and environment profile</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#4A7C59] mt-1">•</span>
                    <span>ai matches you with compatible pets</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#4A7C59] mt-1">•</span>
                    <span>enjoy 2-4 hours of quality time</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#4A7C59] mt-1">•</span>
                    <span>real-time gps tracking for owner peace of mind</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className={`mb-4 ${isLightMode ? 'text-gray-900' : 'text-white'}`}>safety first</h3>
                <ul className={`space-y-3 ${isLightMode ? 'text-gray-600' : 'text-gray-300'}`}>
                  <li className="flex items-start gap-2">
                    <span className="text-[#4A7C59] mt-1">•</span>
                    <span>mandatory background checks</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#4A7C59] mt-1">•</span>
                    <span>digital liability agreement</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#4A7C59] mt-1">•</span>
                    <span>emergency vet protocols</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#4A7C59] mt-1">•</span>
                    <span>photo check-ins required</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className={`text-center pt-6 border-t-2 ${isLightMode ? 'border-gray-200' : 'border-gray-700'}`}>
              <p className="bg-gradient-to-r from-[#6B4423] to-[#8B6F47] bg-clip-text text-transparent mb-2">starting at {formatPriceDual(ENTRY_PRICE_INR)}/hour</p>
              <p className={`${isLightMode ? 'text-gray-600' : 'text-gray-300'}`}>all proceeds support local animal shelters</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Post-it Note Testimonials */}
      <section className={`py-24 px-6 ${isLightMode ? 'bg-white' : 'bg-gray-950'}`}>
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className={`mb-4 ${isLightMode ? 'text-gray-900' : 'text-white'}`}>the community&apos;s voice</h2>
            <p className={`mb-8 ${isLightMode ? 'text-gray-600' : 'text-gray-300'}`}>real feedback from our amazing community</p>
            <button 
              onClick={() => setShowTestimonialForm(true)}
              className="px-6 py-3 bg-gradient-to-br from-[#4A7C59] to-[#5D7349] hover:from-[#5D7349] hover:to-[#4A7C59] text-white transition-all duration-300 rounded-sm flex items-center gap-2 mx-auto shadow-md hover:shadow-lg"
            >
              <Send className="w-4 h-4" />
              leave your note
            </button>
          </motion.div>

          <PostItTestimonials />
        </div>
      </section>

      {/* Volunteer CTA Section */}
      <section className={`py-24 px-6 ${isLightMode ? 'bg-gradient-to-b from-gray-50 to-gray-100' : 'bg-gradient-to-b from-gray-900 to-gray-950'}`}>
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className={`mb-6 ${isLightMode ? 'text-gray-900' : 'text-white'}`}>ready to make a difference?</h2>
            <p className={`mb-8 ${isLightMode ? 'text-gray-600' : 'text-gray-300'}`}>
              join hundreds of volunteers who are creating meaningful connections in their communities.
            </p>
            <button 
              onClick={onVolunteersClick}
              className="px-8 py-4 bg-gradient-to-br from-[#6B4423] to-[#8B6F47] hover:from-[#8B6F47] hover:to-[#6B4423] text-white transition-all duration-300 rounded-sm shadow-lg hover:shadow-xl"
            >
              start your journey
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`border-t py-12 px-6 ${isLightMode ? 'border-gray-300 bg-white' : 'border-gray-700 bg-gray-950'}`}>
        <div className={`max-w-6xl mx-auto text-center ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>
          <p className="mb-4">© 2025 ProxyPaw. building community through compassionate pet care.</p>
          <div className="flex justify-center gap-6 mb-4">
            <a href="#" className={`transition-colors ${isLightMode ? 'hover:text-gray-900' : 'hover:text-white'}`}>Privacy</a>
            <a href="#" className={`transition-colors ${isLightMode ? 'hover:text-gray-900' : 'hover:text-white'}`}>Terms</a>
            <a href="mailto:proxypawbiz@gmail.com" className={`transition-colors ${isLightMode ? 'hover:text-gray-900' : 'hover:text-white'}`}>Contact</a>
          </div>
          <div className={`${isLightMode ? 'text-gray-600' : 'text-gray-300'}`}>
            <a href="mailto:proxypawbiz@gmail.com" className="hover:text-[#4A7C59] transition-colors">
              proxypawbiz@gmail.com
            </a>
          </div>
        </div>
      </footer>

      {showTestimonialForm && (
        <TestimonialForm onClose={() => setShowTestimonialForm(false)} />
      )}

      {showConfirmationModal && (
        <EmailConfirmationModal onClose={handleConfirmationClose} />
      )}
    </div>
  );
}