import { useMemo, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getDashboardRoute } from '@/lib/auth';
import { BRAND_WORDMARK_PNG } from '@/lib/brand-assets';
import { isAgentEmail } from '@/lib/agent-email';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, authDisabled } = useAuth();
  const [, setLocation] = useLocation();
  const lookingLikeAgent = useMemo(() => isAgentEmail(email), [email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (authDisabled) {
      setError('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to .env');
      return;
    }
    setLoading(true);
    const loggedIn = await login(email, password);
    setLoading(false);
    if (loggedIn) {
      setLocation(getDashboardRoute(loggedIn.role));
    } else {
      setError('Invalid email or password.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7F8] flex items-center justify-center px-4">
      <div className="bg-white border border-[#E4E4E8] rounded-lg p-10 w-full max-w-[400px]">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <img
            src={BRAND_WORDMARK_PNG}
            alt="Scale"
            className="h-11 w-auto max-w-[220px] object-contain object-center mb-3"
            width={220}
            height={44}
          />
          <p className="text-[14px] text-[#6B6B80]">Sign in to your workspace</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-[#1A1A3E] mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="scale-input"
              placeholder="you@company.com  or  name@business.scale"
              required
              data-testid="input-email"
            />
            {lookingLikeAgent && (
              <p className="text-[12px] text-[#6B6B80] mt-1">
                Signing in as a sales agent — ask your business admin to reset your password if needed.
              </p>
            )}
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
            {!lookingLikeAgent && (
              <div className="flex justify-end mt-1">
                <Link href="/forgot-password" className="text-[13px] text-[#2B62E8] hover:underline">
                  Forgot password?
                </Link>
              </div>
            )}
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

        {!lookingLikeAgent && (
          <p className="text-center text-[13px] text-[#9999AA] mt-6">
            Need a business account?{' '}
            <Link href="/register" className="text-[#2B62E8] hover:underline">
              Create one
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
