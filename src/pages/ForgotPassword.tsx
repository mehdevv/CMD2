import { useState } from 'react';
import { Link } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { BRAND_WORDMARK_PNG } from '@/lib/brand-assets';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { requestPasswordReset, authDisabled } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authDisabled) {
      toast.error('Supabase is not configured.');
      return;
    }
    setLoading(true);
    try {
      await requestPasswordReset(email);
      toast.success('If an account exists for that email, a reset link has been sent.');
      setEmail('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7F8] flex items-center justify-center px-4">
      <div className="bg-white border border-[#E4E4E8] rounded-lg p-10 w-full max-w-[400px]">
        <div className="flex flex-col items-center mb-8">
          <img src={BRAND_WORDMARK_PNG} alt="Scale" className="h-11 w-auto max-w-[220px] object-contain mb-3" width={220} height={44} />
          <p className="text-[14px] text-[#6B6B80] text-center">Enter your email and we will send a link to choose a new password.</p>
        </div>

        <form onSubmit={e => void handleSubmit(e)} className="space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-[#1A1A3E] mb-1.5">Email</label>
            <input type="email" className="scale-input" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <button type="submit" disabled={loading} className="scale-btn-primary w-full justify-center py-2.5 text-[14px]">
            {loading ? 'Sending…' : 'Send reset link'}
          </button>
        </form>

        <p className="text-center text-[13px] text-[#9999AA] mt-6">
          <Link href="/login" className="text-[#2B62E8] hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
