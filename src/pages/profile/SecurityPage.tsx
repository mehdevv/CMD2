import { useState } from 'react';
import { toast } from 'sonner';
import { ProfileSettingsShell } from '@/components/profile/ProfileSettingsShell';
import { PageSection } from '@/components/layout/PageSection';
import { useAuth } from '@/contexts/AuthContext';
import { getSupabase } from '@/lib/supabase';
import { isAgentEmail } from '@/lib/agent-email';

export default function SecurityPage() {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [nextPassword, setNextPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const agent = user ? isAgentEmail(user.email) : false;

  const submit = async () => {
    if (!user?.email) return;
    if (nextPassword.length < 8) {
      toast.error('Use at least 8 characters for the new password.');
      return;
    }
    if (nextPassword !== confirmPassword) {
      toast.error('New password and confirmation do not match.');
      return;
    }
    setBusy(true);
    try {
      const supabase = getSupabase();
      const { error: signErr } = await supabase.auth.signInWithPassword({
        email: user.email.trim(),
        password: currentPassword,
      });
      if (signErr) {
        toast.error('Current password is incorrect.');
        return;
      }
      const { error: updErr } = await supabase.auth.updateUser({ password: nextPassword });
      if (updErr) throw updErr;
      setCurrentPassword('');
      setNextPassword('');
      setConfirmPassword('');
      toast.success('Password updated');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not update password');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ProfileSettingsShell
      shellTitle="Security"
      heading="Security"
      description="Password and future sign-in options."
    >
      <PageSection title="Password" description="Use a strong password you do not reuse elsewhere.">
        {agent ? (
          <p className="text-[13px] text-[#6B6B80]">
            Your password is managed by your business administrator. Ask them to reset it from the team screen if you
            need a new one.
          </p>
        ) : (
          <div className="max-w-md space-y-3">
            <div>
              <label htmlFor="pw-current" className="mb-1.5 block text-[12px] font-medium text-[#6B6B80]">
                Current password
              </label>
              <input
                id="pw-current"
                type="password"
                className="scale-input"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
            <div>
              <label htmlFor="pw-new" className="mb-1.5 block text-[12px] font-medium text-[#6B6B80]">
                New password
              </label>
              <input
                id="pw-new"
                type="password"
                className="scale-input"
                value={nextPassword}
                onChange={e => setNextPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>
            <div>
              <label htmlFor="pw-confirm" className="mb-1.5 block text-[12px] font-medium text-[#6B6B80]">
                Confirm new password
              </label>
              <input
                id="pw-confirm"
                type="password"
                className="scale-input"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>
            <button
              type="button"
              className="scale-btn-primary mt-2"
              disabled={busy}
              onClick={() => void submit()}
              data-testid="button-update-password"
            >
              {busy ? 'Updating…' : 'Update password'}
            </button>
          </div>
        )}
      </PageSection>

      <PageSection
        title="Extra verification"
        description="Add a second step after your password. Not available yet on this environment."
      >
        <p className="text-[13px] text-[#6B6B80]">Coming soon: app-based verification for sensitive actions.</p>
      </PageSection>
    </ProfileSettingsShell>
  );
}
