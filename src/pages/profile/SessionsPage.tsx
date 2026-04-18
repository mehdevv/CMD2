import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { ProfileSettingsShell } from '@/components/profile/ProfileSettingsShell';
import { PageSection } from '@/components/layout/PageSection';
import { getSupabase } from '@/lib/supabase';

export default function SessionsPage() {
  const [, setLocation] = useLocation();
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void getSupabase()
      .auth.getSession()
      .then(({ data }) => {
        const exp = data.session?.expires_at;
        setExpiresAt(typeof exp === 'number' ? exp : null);
      });
  }, []);

  const signOutEverywhere = async () => {
    setBusy(true);
    try {
      const { error } = await getSupabase().auth.signOut({ scope: 'global' });
      if (error) throw error;
      toast.success('Signed out');
      setLocation('/login');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not sign out');
    } finally {
      setBusy(false);
    }
  };

  const expiresLabel =
    expiresAt != null
      ? format(new Date(expiresAt * 1000), "PPp")
      : 'Unknown — refresh the page if this stays blank.';

  return (
    <ProfileSettingsShell
      shellTitle="Sessions"
      heading="Sessions"
      description="See this browser session and sign out from everywhere when needed."
    >
      <PageSection title="This browser" description="You are signed in here. Session expiry is managed by Supabase.">
        <p className="text-[13px] text-[#6B6B80]">
          Session refreshes automatically before it expires. Approximate expiry:{' '}
          <span className="font-medium text-[#1A1A3E]">{expiresLabel}</span>
        </p>
      </PageSection>

      <PageSection
        title="Sign out everywhere"
        description="Ends this session and revokes refresh tokens on other devices when your project supports it."
      >
        <button
          type="button"
          className="scale-btn-secondary text-[13px]"
          disabled={busy}
          onClick={() => void signOutEverywhere()}
          data-testid="button-sign-out-everywhere"
        >
          {busy ? 'Signing out…' : 'Sign out everywhere'}
        </button>
      </PageSection>
    </ProfileSettingsShell>
  );
}
