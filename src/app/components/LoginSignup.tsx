import { useState } from 'react';
import { motion } from 'motion/react';
import { X, Mail, Lock, User, PawPrint } from 'lucide-react';
import bgImage from 'figma:asset/5b5a590a2b2ded28914503942b26ad9a1ba794a5.png';

interface LoginSignupProps {
  onClose: () => void;
  onLogin: (role: 'owner' | 'walker' | 'renter' | 'admin') => void;
  isFullPage?: boolean;
}

export default function LoginSignup({ onClose, onLogin, isFullPage = false }: LoginSignupProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [selectedRole, setSelectedRole] = useState<'owner' | 'walker' | 'renter' | 'admin'>('owner');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(selectedRole);
  };

  const content = (
    <motion.div
      className="bg-white border border-[#6B4423]/20 rounded-lg shadow-2xl max-w-xs w-full p-3 relative text-sm"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
    >
      {!isFullPage && (
        <button 
          onClick={onClose}
          className="absolute top-2 right-2 p-1 hover:bg-[#F5F3EE] rounded-lg transition-colors text-[#6B4423]"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      <div className="flex items-center gap-2 mb-3">
        <PawPrint className="w-5 h-5 text-[#6B4423]" />
        <h2 className="text-[#2D5016] text-lg">{isLogin ? 'welcome back, hooman!' : 'join proxypaw'}</h2>
      </div>

      {/* Role Selection */}
      {!isLogin && (
        <div className="mb-3">
          <label className="block mb-2 text-[#2D5016] text-xs">i want to...</label>
          <div className="space-y-1.5">
            {[
              { value: 'owner' as const, label: 'find walkers for my pet', icon: '🐕' },
              { value: 'walker' as const, label: 'volunteer to walk pets', icon: '🌿' },
              { value: 'renter' as const, label: 'enjoy temporary pet companionship', icon: '💚' },
              { value: 'admin' as const, label: 'admin access (phf management)', icon: '🌳' }
            ].map((role) => (
              <button
                key={role.value}
                type="button"
                onClick={() => setSelectedRole(role.value)}
                className={`w-full text-left px-2 py-1.5 rounded-lg border transition-all flex items-center gap-2 text-xs ${
                  selectedRole === role.value 
                    ? 'bg-[#4A7C59] border-[#4A7C59] text-white shadow-md' 
                    : 'border-[#6B4423]/20 hover:bg-[#F5F3EE] text-[#2D5016]'
                }`}
              >
                <span className="text-base">{role.icon}</span>
                <span>{role.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-2">
        {!isLogin && (
          <div>
            <label className="block mb-1 text-[#2D5016] text-xs">name</label>
            <div className="relative">
              <User className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5D7349]" />
              <input 
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white border border-[#6B4423]/20 rounded-lg pl-8 pr-2 py-1.5 focus:border-[#4A7C59] focus:ring-2 focus:ring-[#4A7C59]/20 outline-none transition-all text-[#2D5016] text-sm"
                placeholder="your name"
                required
              />
            </div>
          </div>
        )}

        <div>
          <label className="block mb-1 text-[#2D5016] text-xs">email</label>
          <div className="relative">
            <Mail className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5D7349]" />
            <input 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white border border-[#6B4423]/20 rounded-lg pl-8 pr-2 py-1.5 focus:border-[#4A7C59] focus:ring-2 focus:ring-[#4A7C59]/20 outline-none transition-all text-[#2D5016] text-sm"
              placeholder="your@email.com"
              required
            />
          </div>
        </div>

        <div>
          <label className="block mb-1 text-[#2D5016] text-xs">password</label>
          <div className="relative">
            <Lock className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5D7349]" />
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white border border-[#6B4423]/20 rounded-lg pl-8 pr-2 py-1.5 focus:border-[#4A7C59] focus:ring-2 focus:ring-[#4A7C59]/20 outline-none transition-all text-[#2D5016] text-sm"
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        <button 
          type="submit"
          className="w-full py-2 bg-[#4A7C59] hover:bg-[#3D6B4A] transition-colors rounded-lg mt-3 text-white shadow-md hover:shadow-lg text-sm"
        >
          {isLogin ? 'sign in' : 'create account'}
        </button>
      </form>

      <div className="mt-2 text-center">
        <button 
          onClick={() => setIsLogin(!isLogin)}
          className="text-[#5D7349] hover:text-[#4A7C59] transition-colors text-xs"
        >
          {isLogin ? "don't have an account? sign up" : 'already have an account? sign in'}
        </button>
      </div>

      {isLogin && (
        <div className="mt-2 text-center space-y-1">
          <a href="#" className="text-[#5D7349] hover:text-[#4A7C59] transition-colors text-xs block">
            forgot password?
          </a>
          <button
            type="button"
            onClick={() => {
              // Quick admin login - checks if email contains 'admin'
              if (email.toLowerCase().includes('admin')) {
                onLogin('admin');
              }
            }}
            className="text-[#5D7349] hover:text-[#4A7C59] transition-colors text-xs"
          >
            admin? click here after entering credentials
          </button>
        </div>
      )}
    </motion.div>
  );

  if (isFullPage) {
    return (
      <div 
        className="min-h-screen flex items-center justify-start p-6 relative overflow-hidden"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1669892221148-fbc04ce3c90f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkb2clMjBjYXQlMjBnYXJkZW4lMjBvdXRkb29yfGVufDF8fHx8MTc2NTEyMjcyNHww&ixlib=rb-4.1.0&q=80&w=1080')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* Decorative elements */}
        <div className="absolute top-10 left-10 opacity-20">
        </div>
        <div className="absolute bottom-10 right-10 opacity-20">
        </div>
        <div className="absolute top-1/4 right-20 opacity-20">
        </div>
        <div className="relative ml-8">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2D5016]/60 backdrop-blur-md p-6">
      {content}
    </div>
  );
}