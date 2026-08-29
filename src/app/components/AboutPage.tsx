import { motion } from 'motion/react';
import { Target, Rocket, Lightbulb, User, Shield, TrendingUp, Globe } from 'lucide-react';
import Navigation from './Navigation';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useTheme } from '../contexts/ThemeContext';
import communityWalkingImg from "figma:asset/16fde6b881f27ca94d0e2d60d7f9356a038d0d86.png";

interface AboutPageProps {
  onLoginClick: () => void;
  isLoggedIn: boolean;
  onDashboardClick: () => void;
  onLogout: () => void;
  onHomeClick: () => void;
}

export default function AboutPage({ 
  onLoginClick, 
  isLoggedIn, 
  onDashboardClick, 
  onLogout,
  onHomeClick 
}: AboutPageProps) {
  const { theme } = useTheme();
  const isLightMode = theme === 'light';
  
  return (
    <div className={`min-h-screen ${isLightMode ? 'bg-gradient-to-b from-white to-gray-50 text-gray-900' : 'bg-gradient-to-b from-gray-900 to-gray-800 text-white'}`}>
      <Navigation 
        onLoginClick={onLoginClick} 
        isLoggedIn={isLoggedIn}
        onDashboardClick={onDashboardClick}
        onLogout={onLogout}
        onHomeClick={onHomeClick}
      />

      {/* Hero Section */}
      <section className={`pt-32 pb-16 px-6 ${isLightMode ? 'bg-gradient-to-b from-gray-50 to-white' : 'bg-gradient-to-b from-gray-900 to-gray-950'}`}>
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1 
            className={`mb-6 ${isLightMode ? 'text-gray-900' : 'text-white'}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            about proxypaw
          </motion.h1>
          <motion.p 
            className={`max-w-2xl mx-auto ${isLightMode ? 'text-gray-600' : 'text-gray-300'}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            mission, vision, and purpose
          </motion.p>
        </div>
      </section>

      {/* Vision, Mission, Purpose Section */}
      <section className={`py-24 px-6 ${isLightMode ? 'bg-white' : 'bg-gray-950'}`}>
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Vision */}
            <motion.div
              className={`border p-8 rounded-sm hover:border-[#7D5A3B] transition-colors ${isLightMode ? 'border-gray-300' : 'border-gray-700'}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center justify-center w-16 h-16 mb-6 bg-[#7D5A3B]/10 rounded-full">
                <Target className="w-8 h-8 text-[#7D5A3B]" />
              </div>
              <h2 className={`mb-4 ${isLightMode ? 'text-gray-900' : 'text-white'}`}>0.1 our vision</h2>
              <p className={`${isLightMode ? 'text-gray-600' : 'text-gray-300'}`}>
                to be the world&apos;s most trusted, ethical, and technologically advanced proxy network, 
                enabling data sovereignty and unlimited, reliable web access for global innovators and 
                data-driven organizations.
              </p>
            </motion.div>

            {/* Mission */}
            <motion.div
              className={`border p-8 rounded-sm hover:border-[#7D5A3B] transition-colors ${isLightMode ? 'border-gray-300' : 'border-gray-700'}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="inline-flex items-center justify-center w-16 h-16 mb-6 bg-[#7D5A3B]/10 rounded-full">
                <Rocket className="w-8 h-8 text-[#7D5A3B]" />
              </div>
              <h2 className={`mb-4 ${isLightMode ? 'text-gray-900' : 'text-white'}`}>0.2 our mission</h2>
              <p className={`${isLightMode ? 'text-gray-600' : 'text-gray-300'}`}>
                to provide high-performance, geo-targeted, and secure proxy solutions built on an ethical 
                ip sourcing model, empowering businesses to gather critical market intelligence, monitor 
                seo, and scale their data operations with unparalleled reliability.
              </p>
            </motion.div>

            {/* Purpose */}
            <motion.div
              className={`border p-8 rounded-sm hover:border-[#7D5A3B] transition-colors ${isLightMode ? 'border-gray-300' : 'border-gray-700'}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="inline-flex items-center justify-center w-16 h-16 mb-6 bg-[#7D5A3B]/10 rounded-full">
                <Lightbulb className="w-8 h-8 text-[#7D5A3B]" />
              </div>
              <h2 className={`mb-4 ${isLightMode ? 'text-gray-900' : 'text-white'}`}>0.3 our purpose</h2>
              <p className={`${isLightMode ? 'text-gray-600' : 'text-gray-300'}`}>
                proxypaw exists to bridge the critical gap between the need for large-scale web data 
                acquisition (scraping, monitoring, ad verification) and the absolute requirement for 
                ethical compliance and high technical reliability in an era of increasingly sophisticated 
                web defenses. we provide the infrastructure that turns the world&apos;s web data into actionable 
                intelligence.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* User Story Section */}
      <section 
        className="py-24 px-6 bg-white relative bg-cover bg-center"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1701162100326-1c007463af2e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkb2clMjBjYXQlMjBnYXJkZW4lMjBuYXR1cmV8ZW58MXx8fHwxNzY1MTc0MzgyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral')` }}
      >
        <div className={`absolute inset-0 ${isLightMode ? 'bg-white/90' : 'bg-gray-900/90'}`}></div>
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <User className="w-12 h-12 text-[#7D5A3B] mx-auto mb-4" />
            <h2 className={`mb-4 ${isLightMode ? 'text-gray-900' : 'text-white'}`}>0.4 core user story: sarah, the data scientist</h2>
            <p className={`max-w-2xl mx-auto ${isLightMode ? 'text-gray-600' : 'text-gray-300'}`}>
              meet sarah, a data scientist at a multinational e-commerce monitoring firm.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Challenge */}
            <motion.div
              className={`border p-8 rounded-sm ${isLightMode ? 'bg-white border-gray-300' : 'bg-gray-800 border-gray-700'}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center justify-center w-12 h-12 mb-4 bg-[#7D5A3B]/10 rounded-full">
                <Shield className="w-6 h-6 text-[#7D5A3B]" />
              </div>
              <h3 className={`mb-4 ${isLightMode ? 'text-gray-900' : 'text-white'}`}>challenge</h3>
              <p className={`${isLightMode ? 'text-gray-600' : 'text-gray-300'}`}>
                sarah&apos;s job requires aggregating millions of real-time price changes from global retail 
                websites. she needs reliable, geo-targeted ips that won&apos;t get instantly blocked, and she 
                must adhere to strict ethical data sourcing policies.
              </p>
            </motion.div>

            {/* Solution */}
            <motion.div
              className={`border border-[#7D5A3B] p-8 rounded-sm ${isLightMode ? 'bg-white' : 'bg-gray-800'}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="inline-flex items-center justify-center w-12 h-12 mb-4 bg-[#7D5A3B]/10 rounded-full">
                <Globe className="w-6 h-6 text-[#7D5A3B]" />
              </div>
              <h3 className={`mb-4 ${isLightMode ? 'text-gray-900' : 'text-white'}`}>proxypaw&apos;s solution</h3>
              <p className={`${isLightMode ? 'text-gray-600' : 'text-gray-300'}`}>
                sarah uses the proxypaw api (feature p-04) to programmatically generate country-specific 
                proxy credentials for the residential network. she sets up a sticky session rotation 
                (feature p-03) lasting 10 minutes to mimic genuine user behavior.
              </p>
            </motion.div>

            {/* Outcome */}
            <motion.div
              className={`border p-8 rounded-sm ${isLightMode ? 'bg-white border-gray-300' : 'bg-gray-800 border-gray-700'}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="inline-flex items-center justify-center w-12 h-12 mb-4 bg-[#4A7C59]/10 rounded-full">
                <TrendingUp className="w-6 h-6 text-[#4A7C59]" />
              </div>
              <h3 className={`mb-4 ${isLightMode ? 'text-gray-900' : 'text-white'}`}>outcome</h3>
              <p className={`mb-4 ${isLightMode ? 'text-gray-600' : 'text-gray-300'}`}>
                with proxypaw, sarah reliably collects 98% of her target data on time, enabling her 
                company to react instantly to competitor pricing changes, while maintaining a clean, 
                compliant ip footprint.
              </p>
              <div className="text-[#7D5A3B] text-sm">
                98% data collection success • real-time competitive intelligence • ethical compliance
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className={`pt-24 pb-8 px-6 ${isLightMode ? 'bg-white' : 'bg-gray-950'}`}>
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className={`mb-4 ${isLightMode ? 'text-gray-900' : 'text-white'}`}>why choose proxypaw</h2>
            <p className={`max-w-2xl mx-auto ${isLightMode ? 'text-gray-600' : 'text-gray-300'}`}>
              enterprise-grade proxy solutions with ethical ip sourcing and unmatched reliability
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: 'ethical ip sourcing',
                description: 'all residential ips are sourced ethically with full user consent and transparency, ensuring compliance with global data regulations.'
              },
              {
                title: 'geo-targeted precision',
                description: 'access country-specific and city-level proxy networks for accurate market intelligence and localized data gathering.'
              },
              {
                title: 'high-performance infrastructure',
                description: '99.9% uptime guarantee with low-latency connections and unlimited bandwidth for large-scale data operations.'
              },
              {
                title: 'advanced session management',
                description: 'sticky sessions, automatic rotation, and customizable session durations to mimic genuine user behavior and avoid detection.'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                className={`flex gap-6 p-6 border rounded-sm hover:border-green-600 transition-colors ${isLightMode ? 'border-gray-300' : 'border-gray-700'}`}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div className="flex-shrink-0">
                  <div className="w-3 h-3 bg-green-600 rounded-full mt-2"></div>
                </div>
                <div>
                  <h3 className={`mb-2 ${isLightMode ? 'text-gray-900' : 'text-white'}`}>{feature.title}</h3>
                  <p className={`${isLightMode ? 'text-gray-600' : 'text-gray-300'}`}>{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Walking Image Section */}
      <section className={`py-16 px-6 ${isLightMode ? 'bg-gradient-to-b from-white to-gray-50' : 'bg-gradient-to-b from-gray-950 to-gray-900'}`}>
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="rounded-sm overflow-hidden shadow-xl"
          >
            <ImageWithFallback
              src={communityWalkingImg}
              alt="community dog walking"
              className="w-full h-auto object-cover"
            />
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`border-t py-12 px-6 ${isLightMode ? 'border-gray-300 bg-white' : 'border-gray-700 bg-gray-950'}`}>
        <div className={`max-w-6xl mx-auto text-center ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>
          <p className="mb-4">© 2025 proxypaw. ethical proxy solutions for data-driven organizations.</p>
          <div className="flex justify-center gap-6 mb-4">
            <a href="#" className={`transition-colors ${isLightMode ? 'hover:text-gray-900' : 'hover:text-white'}`}>privacy</a>
            <a href="#" className={`transition-colors ${isLightMode ? 'hover:text-gray-900' : 'hover:text-white'}`}>terms</a>
            <a href="mailto:proxypawbiz@gmail.com" className={`transition-colors ${isLightMode ? 'hover:text-gray-900' : 'hover:text-white'}`}>contact</a>
          </div>
          <div className={`${isLightMode ? 'text-gray-600' : 'text-gray-400'}`}>
            <a href="mailto:proxypawbiz@gmail.com" className="hover:text-[#4A7C59] transition-colors">
              proxypawbiz@gmail.com
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}