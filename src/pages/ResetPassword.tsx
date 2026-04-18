import { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Eye, EyeOff } from 'lucide-react';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { BRAND_WORDMARK_PNG } from '@/lib/brand-assets';
import { toast } from 'sonner';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const supabase = getSupabase();
    void supabase.auth.getSession().then(({ data: { session } }) => {
      setReady(Boolean(session));
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || session) {
        setReady(Boolean(session));
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured) {
      toast.error('Supabase is not configured.');
      return;
    }
    setLoading(true);
    try {
      const supabase = getSupabase();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success('Password updated. You can sign in with your new password.');
      await supabase.auth.signOut();
      setLocation('/login');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not update password');
    } finally {
      setLoading(false);
    }
  };

  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-[#F7F7F8] flex items-center justify-center px-4">
        <p className="text-[14px] text-[#6B6B80]">Supabase is not configured.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F7F8] flex items-center justify-center px-4">
      <div className="bg-white border border-[#E4E4E8] rounded-lg p-10 w-full max-w-[400px]">
        <div className="flex flex-col items-center mb-8">
          <img src={BRAND_WORDMARK_PNG} alt="Scale" className="h-11 w-auto max-w-[220px] object-contain mb-3" width={220} height={44} />
          <p className="text-[14px] text-[#6B6B80] text-center">Choose a new password for your account.</p>
        </div>

        {!ready ? (
          <p className="text-[13px] text-[#9999AA] text-center">Open the link from your email to continue. If this page stays here, request a new reset link.</p>
        ) : (
          <form onSubmit={e => void handleSubmit(e)} className="space-y-4">
            <div>
              <label className="block text-[13px] font-medium text-[#1A1A3E] mb-1.5">New password</label>
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
            <button type="submit" disabled={loading} className="scale-btn-primary w-full justify-center py-2.5 text-[14px]">
              {loading ? 'Saving…' : 'Save password'}
            </button>
          </form>
        )}

        <p className="text-center text-[13px] text-[#9999AA] mt-6">
          <Link href="/login" className="text-[#2B62E8] hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
