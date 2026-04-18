import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getDashboardRoute } from '@/lib/auth';
import { BRAND_WORDMARK_PNG } from '@/lib/brand-assets';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [orgName, setOrgName] = useState('My Business');
  const [orgSlug, setOrgSlug] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, authDisabled } = useAuth();
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');
    if (authDisabled) {
      setError('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to .env');
      return;
    }
    const slug = orgSlug.trim().toLowerCase();
    if (!/^[a-z0-9-]{3,40}$/.test(slug)) {
      setError('Business address must be 3–40 characters: lowercase letters, digits, and hyphens only.');
      return;
    }
    setLoading(true);
    try {
      const { needsEmailConfirmation, user: signedUp } = await register(
        email,
        password,
        name.trim() || email.split('@')[0] || 'User',
        orgName.trim() || 'My Business',
        slug
      );
      if (needsEmailConfirmation) {
        setInfo('Check your email to confirm your account, then sign in.');
        return;
      }
      if (signedUp?.role) {
        setLocation(getDashboardRoute(signedUp.role));
      } else {
        setLocation('/login');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7F8] flex items-center justify-center px-4">
      <div className="bg-white border border-[#E4E4E8] rounded-lg p-10 w-full max-w-[400px]">
        <div className="flex flex-col items-center mb-8">
          <img src={BRAND_WORDMARK_PNG} alt="Scale" className="h-11 w-auto max-w-[220px] object-contain mb-3" width={220} height={44} />
          <p className="text-[14px] text-[#6B6B80]">Create your workspace</p>
        </div>

        <form onSubmit={e => void handleSubmit(e)} className="space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-[#1A1A3E] mb-1.5">Your name</label>
            <input className="scale-input" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[#1A1A3E] mb-1.5">Organization name</label>
            <input className="scale-input" value={orgName} onChange={e => setOrgName(e.target.value)} required />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[#1A1A3E] mb-1.5">Business address (for agent logins)</label>
            <div className="flex items-center gap-1">
              <input
                className="scale-input flex-1"
                value={orgSlug}
                onChange={e => setOrgSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                placeholder="e.g. brightwave"
                required
                minLength={3}
                maxLength={40}
              />
              <span className="text-[13px] text-[#6B6B80] whitespace-nowrap">.scale</span>
            </div>
            <p className="text-[12px] text-[#9999AA] mt-1">
              Example agent login: <span className="font-mono text-[#6B6B80]">{`sara@${orgSlug.trim() || 'your-address'}.scale`}</span>
            </p>
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[#1A1A3E] mb-1.5">Work email</label>
            <input type="email" className="scale-input" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[#1A1A3E] mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                className="scale-input pr-10"
                value={password}
                onChange={e => setPassword(e.target.value)}
                minLength={6}
                required
              />
              <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9999AA]">
                {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
          {error && <p className="text-[13px] text-[#DC2626]">{error}</p>}
          {info && <p className="text-[13px] text-[#166534]">{info}</p>}
          <button type="submit" disabled={loading} className="scale-btn-primary w-full justify-center py-2.5 text-[14px]">
            {loading ? 'Creating…' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-[13px] text-[#9999AA] mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-[#2B62E8] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
