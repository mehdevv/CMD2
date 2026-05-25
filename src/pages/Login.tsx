import { useMemo, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getDashboardRoute } from '@/lib/auth';
import { BRAND_WORDMARK_PNG } from '@/lib/brand-assets';
import { isAgentEmail } from '@/lib/agent-email';
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from '@/lib/demo-accounts';
import { tryDemoLogin } from '@/lib/demo-auth';
import { MotionAuthPanel, MotionFade, MotionInteractive, MotionStagger, MotionItem } from '@/components/motion';

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
    const isDemoAttempt = Boolean(tryDemoLogin(email, password));
    if (authDisabled && !isDemoAttempt) {
      setError('Supabase is not configured. Use a tester account below or add VITE_SUPABASE_URL to .env');
      return;
    }
    setLoading(true);
    const loggedIn = await login(email, password);
    setLoading(false);
    if (loggedIn) {
      setLocation(getDashboardRoute(loggedIn.role));
    } else {
      setError('Invalid email or password. Use a tester account below (password: ScaleDemo2026!).');
    }
  };

  const fillDemo = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <MotionStagger className="w-full max-w-[440px] space-y-5">
        <MotionItem>
          <MotionAuthPanel className="scale-card scale-card-motion rounded-2xl p-10 w-full shadow-[var(--shadow-elevated)]">
          <MotionFade className="flex flex-col items-center mb-8">
            <motion.img
              src={BRAND_WORDMARK_PNG}
              alt="Scale"
              className="h-11 w-auto max-w-[220px] object-contain object-center mb-3"
              width={220}
              height={44}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
            />
            <p className="text-[14px] text-[#6B6B80]">Sign in to your workspace</p>
          </MotionFade>

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
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="text-[13px] text-[#DC2626]"
                data-testid="text-login-error"
              >
                {error}
              </motion.p>
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
          </MotionAuthPanel>
        </MotionItem>

        <MotionItem>
        <MotionAuthPanel className="scale-card scale-card-motion rounded-2xl p-5 w-full">
          <p className="text-[12px] font-semibold uppercase tracking-wide text-[#9999AA] mb-3">Tester accounts</p>
          <p className="text-[12px] text-[#6B6B80] mb-3">
            Click a role to fill credentials. Works offline in demo mode. Password:{' '}
            <code className="text-[#1A1A3E]">{DEMO_PASSWORD}</code>
          </p>
          <div className="space-y-2">
            {DEMO_ACCOUNTS.map(account => (
              <MotionInteractive key={account.email}>
              <button
                type="button"
                onClick={() => fillDemo(account.email, account.password)}
                className="w-full text-left rounded-xl border border-[#E4E4E8] bg-white px-3 py-2.5 hover:border-[#2B62E8]/30"
                data-testid={`demo-account-${account.role}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[13px] font-medium text-[#1A1A3E]">{account.label}</span>
                  <span className="text-[11px] text-[#9999AA] uppercase">{account.role}</span>
                </div>
                <p className="text-[12px] text-[#2B62E8] mt-0.5">{account.email}</p>
                <p className="text-[11px] text-[#9999AA] mt-0.5">{account.hint}</p>
              </button>
              </MotionInteractive>
            ))}
          </div>
        </MotionAuthPanel>
        </MotionItem>
      </MotionStagger>
    </div>
  );
}
