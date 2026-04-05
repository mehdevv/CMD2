import { useState } from 'react';
import { useLocation } from 'wouter';
import { ChevronRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getDashboardRoute } from '@/lib/auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const user = await login(email, password);
    setLoading(false);
    if (user) {
      setLocation(getDashboardRoute(user.role));
    } else {
      setError('Invalid email or password. Try admin@scale.dz / demo');
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7F8] flex items-center justify-center px-4">
      <div className="bg-white border border-[#E4E4E8] rounded-lg p-10 w-full max-w-[400px]">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-10 h-10 bg-[#1A1A3E] rounded-lg flex items-center justify-center mb-3">
            <ChevronRight size={20} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="text-[22px] font-semibold text-[#1A1A3E] tracking-tight">Scale</span>
          <p className="text-[14px] text-[#6B6B80] mt-1">Sign in to your workspace</p>
        </div>

        {/* Demo hint */}
        <div className="mb-5 p-3 bg-[#EEF3FD] rounded-md text-[13px] text-[#1E3A8A]">
          Demo: admin@scale.dz / demo &nbsp;|&nbsp; owner@scale.dz / demo &nbsp;|&nbsp; agent@scale.dz / demo
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-[#1A1A3E] mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="scale-input"
              placeholder="you@scale.dz"
              required
              data-testid="input-email"
            />
          </div>

          <div>
            <label className="block text-[13px] font-medium text-[#1A1A3E] mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="scale-input pr-10"
                placeholder="••••••••"
                required
                data-testid="input-password"
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9999AA] hover:text-[#6B6B80]"
                data-testid="button-toggle-password"
              >
                {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            <div className="flex justify-end mt-1">
              <a href="#" className="text-[13px] text-[#2B62E8] hover:underline">Forgot password?</a>
            </div>
          </div>

          {error && (
            <p className="text-[13px] text-[#DC2626]" data-testid="text-login-error">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="scale-btn-primary w-full justify-center py-2.5 text-[14px]"
            data-testid="button-signin"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="text-center text-[13px] text-[#9999AA] mt-6">
          Don't have an account? Contact your admin.
        </p>
      </div>
    </div>
  );
}
