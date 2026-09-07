import { motion, AnimatePresence } from 'motion/react';
import { PawPrint, Menu, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useState } from 'react';

interface NavigationProps {
  onLoginClick: () => void;
  isLoggedIn: boolean;
  onDashboardClick: () => void;
  onLogout: () => void;
  onHomeClick?: () => void;
  onAboutClick?: () => void;
  hideHomeButton?: boolean;
}

export default function Navigation({ onLoginClick, isLoggedIn, onDashboardClick, onLogout, onHomeClick, onAboutClick, hideHomeButton }: NavigationProps) {
  const { theme } = useTheme();
  const isLightMode = theme === 'light';
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <motion.nav 
      className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-sm border-b ${
        isLightMode ? 'bg-white/80 border-gray-200' : 'bg-black/80 border-gray-900'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className={`max-w-7xl mx-auto px-6 py-4 flex items-center justify-between ${
        isLightMode ? 'bg-white' : 'bg-[rgb(0,112,53)]'
      }`}>
        <div className="flex items-center gap-2 bg-[rgba(255,255,255,0)]">
          <PawPrint className={`w-6 h-6 ${isLightMode ? 'text-gray-900' : 'text-white'}`} />
          <button 
            onClick={onHomeClick}
            className={`tracking-wider transition-colors whitespace-nowrap ${
              isLightMode 
                ? 'text-gray-900 hover:text-gray-600' 
                : 'text-white hover:text-[#4A9EFF]'
            }`}
          >
            ProxyPaw
          </button>
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1">
          {isLoggedIn ? (
            <>
              {onAboutClick && (
                <button onClick={onAboutClick} className={`px-2 py-2 transition-colors whitespace-nowrap ${
                  isLightMode 
                    ? 'text-gray-900 hover:text-gray-600' 
                    : 'text-white hover:text-[#4A9EFF]'
                }`}>about us</button>
              )}
              {!hideHomeButton && onHomeClick && (
                <button 
                  onClick={onHomeClick}
                  className={`px-2 py-2 transition-colors whitespace-nowrap ${
                    isLightMode 
                      ? 'text-gray-900 hover:text-gray-600' 
                      : 'text-white hover:text-[#4A9EFF]'
                  }`}
                >
                  home
                </button>
              )}
              <button 
                onClick={onDashboardClick}
                className={`px-2 py-2 transition-colors whitespace-nowrap ${
                  isLightMode 
                    ? 'text-gray-900 hover:text-gray-600' 
                    : 'text-white hover:text-[#4A9EFF]'
                }`}
              >
                dashboard
              </button>
              <button 
                onClick={onLogout}
                className={`ml-2 px-4 py-2 transition-colors rounded-sm whitespace-nowrap ${
                  isLightMode
                    ? 'bg-gray-900 text-white hover:bg-gray-800'
                    : 'bg-white text-black hover:bg-gray-100'
                }`}
              >
                logout
              </button>
            </>
          ) : (
            <>
              {onAboutClick && (
                <button onClick={onAboutClick} className={`px-2 py-2 transition-colors whitespace-nowrap ${
                  isLightMode 
                    ? 'text-gray-900 hover:text-gray-600' 
                    : 'text-white hover:text-[#4A9EFF]'
                }`}>about us</button>
              )}
              {!hideHomeButton && onHomeClick && (
                <button 
                  onClick={onHomeClick}
                  className={`px-2 py-2 transition-colors whitespace-nowrap ${
                    isLightMode 
                      ? 'text-gray-900 hover:text-gray-600' 
                      : 'text-white hover:text-[#4A9EFF]'
                  }`}
                >
                  home
                </button>
              )}
              <button 
                onClick={onLoginClick}
                className={`ml-2 px-4 py-2 transition-colors rounded-sm whitespace-nowrap ${
                  isLightMode
                    ? 'bg-gray-900 text-white hover:bg-gray-800'
                    : 'bg-white text-black hover:bg-gray-100'
                }`}
              >
                login
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="flex md:hidden items-center gap-2">
          {/* Hamburger Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`p-2 rounded-sm transition-colors ${
              isLightMode
                ? 'hover:bg-gray-100 text-gray-900'
                : 'hover:bg-gray-800 text-white'
            }`}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className={`md:hidden border-t overflow-hidden ${
              isLightMode ? 'bg-white border-gray-200' : 'bg-black border-gray-900'
            }`}
          >
            <div className="px-6 py-4 space-y-2">
              {isLoggedIn ? (
                <>
                  {onAboutClick && (
                    <button 
                      onClick={() => { onAboutClick(); closeMobileMenu(); }}
                      className={`w-full text-left px-4 py-3 rounded-sm transition-colors ${
                        isLightMode 
                          ? 'text-gray-900 hover:bg-gray-100' 
                          : 'text-white hover:bg-gray-900'
                      }`}
                    >
                      about us
                    </button>
                  )}
                  {!hideHomeButton && onHomeClick && (
                    <button 
                      onClick={() => { onHomeClick(); closeMobileMenu(); }}
                      className={`w-full text-left px-4 py-3 rounded-sm transition-colors ${
                        isLightMode 
                          ? 'text-gray-900 hover:bg-gray-100' 
                          : 'text-white hover:bg-gray-900'
                      }`}
                    >
                      home
                    </button>
                  )}
                  <button 
                    onClick={() => { onDashboardClick(); closeMobileMenu(); }}
                    className={`w-full text-left px-4 py-3 rounded-sm transition-colors ${
                      isLightMode 
                        ? 'text-gray-900 hover:bg-gray-100' 
                        : 'text-white hover:bg-gray-900'
                    }`}
                  >
                    dashboard
                  </button>
                  <button 
                    onClick={() => { onLogout(); closeMobileMenu(); }}
                    className={`w-full px-4 py-3 transition-colors rounded-sm ${
                      isLightMode
                        ? 'bg-gray-900 text-white hover:bg-gray-800'
                        : 'bg-white text-black hover:bg-gray-100'
                    }`}
                  >
                    logout
                  </button>
                </>
              ) : (
                <>
                  {onAboutClick && (
                    <button 
                      onClick={() => { onAboutClick(); closeMobileMenu(); }}
                      className={`w-full text-left px-4 py-3 rounded-sm transition-colors ${
                        isLightMode 
                          ? 'text-gray-900 hover:bg-gray-100' 
                          : 'text-white hover:bg-gray-900'
                      }`}
                    >
                      about us
                    </button>
                  )}
                  {!hideHomeButton && onHomeClick && (
                    <button 
                      onClick={() => { onHomeClick(); closeMobileMenu(); }}
                      className={`w-full text-left px-4 py-3 rounded-sm transition-colors ${
                        isLightMode 
                          ? 'text-gray-900 hover:bg-gray-100' 
                          : 'text-white hover:bg-gray-900'
                      }`}
                    >
                      home
                    </button>
                  )}
                  <button 
                    onClick={() => { onLoginClick(); closeMobileMenu(); }}
                    className={`w-full px-4 py-3 transition-colors rounded-sm ${
                      isLightMode
                        ? 'bg-gray-900 text-white hover:bg-gray-800'
                        : 'bg-white text-black hover:bg-gray-100'
                    }`}
                  >
                    login
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}