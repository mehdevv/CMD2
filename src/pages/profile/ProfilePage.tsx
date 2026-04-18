import { useCallback, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ProfileSettingsShell } from '@/components/profile/ProfileSettingsShell';
import { AvatarUploader } from '@/components/profile/AvatarUploader';
import { PageSection } from '@/components/layout/PageSection';
import { useAuth } from '@/contexts/AuthContext';
import { useMyProfile } from '@/hooks/useMyProfile';
import { fetchOrganizationSummary, updateMyProfileFields } from '@/lib/db/me';
import { composeAgentEmail, isAgentEmail } from '@/lib/agent-email';
import { roleLabel } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const LANGUAGES: Array<{ value: string; label: string; disabled?: boolean }> = [
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'Français (soon)', disabled: true },
  { value: 'ar', label: 'العربية (soon)', disabled: true },
];

const TIMEZONES = [
  'Africa/Algiers',
  'UTC',
  'Europe/Paris',
  'Europe/London',
  'America/New_York',
] as const;

const DATE_FORMATS = [
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
] as const;

const NUMBER_FORMATS = [
  { value: 'space_comma', label: '1 234,56 (common in Algeria)' },
  { value: 'comma_dot', label: '1,234.56' },
] as const;

function readPrefs(raw: Record<string, unknown> | null | undefined) {
  const o = raw ?? {};
  return {
    language: typeof o.language === 'string' ? o.language : 'en',
    timezone: typeof o.timezone === 'string' ? o.timezone : '',
    dateFormat: typeof o.dateFormat === 'string' ? o.dateFormat : 'DD/MM/YYYY',
    numberFormat: typeof o.numberFormat === 'string' ? o.numberFormat : 'space_comma',
  };
}

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const { data: profile, isPending, refetch } = useMyProfile();
  const { data: org } = useQuery({
    queryKey: ['org-summary', user?.orgId],
    queryFn: () => fetchOrganizationSummary(user!.orgId!),
    enabled: Boolean(user?.orgId),
  });

  const [name, setName] = useState('');
  const [language, setLanguage] = useState('en');
  const [timezone, setTimezone] = useState('');
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');
  const [numberFormat, setNumberFormat] = useState('space_comma');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile) return;
    queueMicrotask(() => {
      setName(profile.name);
      const p = readPrefs(profile.preferences as Record<string, unknown> | null | undefined);
      setLanguage(p.language);
      setTimezone(p.timezone || (org?.timezone ?? 'Africa/Algiers'));
      setDateFormat(p.dateFormat);
      setNumberFormat(p.numberFormat);
    });
  }, [profile, org?.timezone]);

  const onSave = useCallback(async () => {
    if (!profile || !user) return;
    setSaving(true);
    try {
      await updateMyProfileFields({
        newName: name.trim() || profile.name,
        newPrefs: {
          language,
          timezone: timezone || null,
          dateFormat,
          numberFormat,
        },
      });
      await refreshUser();
      await refetch();
      toast.success('Profile saved');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not save profile');
    } finally {
      setSaving(false);
    }
  }, [profile, user, name, language, timezone, dateFormat, numberFormat, refreshUser, refetch]);

  const agentEmail =
    user && isAgentEmail(user.email)
      ? composeAgentEmail(user.localHandle ?? null, user.orgSlug ?? null) ?? user.email
      : null;

  if (isPending || !profile || !user) {
    return (
      <ProfileSettingsShell shellTitle="Profile" heading="Your profile" description="Loading…">
        <p className="text-[14px] text-[#9999AA]">Loading your profile…</p>
      </ProfileSettingsShell>
    );
  }

  return (
    <ProfileSettingsShell
      shellTitle="Profile"
      heading="Your profile"
      description="Update how you appear in Scale and your regional preferences."
    >
      {isAgentEmail(user.email) ? (
        <PageSection title="Sign-in">
          <p className="text-[13px] text-[#6B6B80]">
            Your sign-in is managed by your business administrator. You can change your display name and personal
            preferences here; email changes go through your admin.
          </p>
        </PageSection>
      ) : null}

      <PageSection title="Identity" description="Photo and name are visible to others in your workspace.">
        <div className="space-y-5">
          <AvatarUploader
            displayName={profile.name}
            avatarUrl={profile.avatar_url ?? user.avatarUrl}
            orgId={user.orgId}
            userId={user.id}
            onUploaded={() => {
              void refreshUser();
              void refetch();
            }}
          />
          <div>
            <label htmlFor="profile-name" className="mb-1.5 block text-[12px] font-medium text-[#6B6B80]">
              Display name
            </label>
            <input
              id="profile-name"
              className="scale-input max-w-md"
              value={name}
              onChange={e => setName(e.target.value)}
              autoComplete="name"
              data-testid="input-profile-name"
            />
          </div>
          <div className="grid gap-3 text-[13px] sm:grid-cols-2">
            <div>
              <span className="text-[#9999AA]">Email</span>
              <div className="mt-0.5 font-medium text-[#1A1A3E]">{user.email}</div>
            </div>
            <div>
              <span className="text-[#9999AA]">Role</span>
              <div className="mt-0.5 font-medium text-[#1A1A3E]">{roleLabel(user.role)}</div>
            </div>
            {org?.name ? (
              <div className="sm:col-span-2">
                <span className="text-[#9999AA]">Workspace</span>
                <div className="mt-0.5 font-medium text-[#1A1A3E]">{org.name}</div>
              </div>
            ) : null}
            {agentEmail ? (
              <div className="sm:col-span-2">
                <span className="text-[#9999AA]">Agent sign-in address</span>
                <div className="mt-0.5 font-mono text-[13px] text-[#1A1A3E]">{agentEmail}</div>
                <p className="mt-1 text-[12px] text-[#9999AA]">
                  This label is for your workspace only; it is not a real mailbox.
                </p>
              </div>
            ) : null}
          </div>
          {!isAgentEmail(user.email) ? (
            <Dialog>
              <DialogTrigger asChild>
                <button type="button" className="scale-btn-secondary text-[13px]">
                  Change email
                </button>
              </DialogTrigger>
              <DialogContent className="border-[#E4E4E8] bg-white sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-[#1A1A3E]">Change email</DialogTitle>
                  <DialogDescription className="text-[#6B6B80]">
                    Changing your sign-in email will be available in a future update. For now, contact support if you
                    need to move your account to a different address.
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          ) : null}
        </div>
      </PageSection>

      <PageSection title="Language & region" description="Used for dates, times, and future localized copy.">
        <div className="flex max-w-md flex-col gap-3">
          <div>
            <label htmlFor="profile-lang" className="mb-1.5 block text-[12px] font-medium text-[#6B6B80]">
              Language
            </label>
            <select
              id="profile-lang"
              className="scale-input"
              value={language}
              onChange={e => setLanguage(e.target.value)}
            >
              {LANGUAGES.map(opt => (
                <option key={opt.value} value={opt.value} disabled={Boolean(opt.disabled)}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="profile-tz" className="mb-1.5 block text-[12px] font-medium text-[#6B6B80]">
              Timezone
            </label>
            <select
              id="profile-tz"
              className="scale-input"
              value={timezone || org?.timezone || 'Africa/Algiers'}
              onChange={e => setTimezone(e.target.value)}
            >
              {TIMEZONES.map(tz => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="profile-df" className="mb-1.5 block text-[12px] font-medium text-[#6B6B80]">
              Date format
            </label>
            <select
              id="profile-df"
              className="scale-input"
              value={dateFormat}
              onChange={e => setDateFormat(e.target.value)}
            >
              {DATE_FORMATS.map(df => (
                <option key={df.value} value={df.value}>
                  {df.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="profile-nf" className="mb-1.5 block text-[12px] font-medium text-[#6B6B80]">
              Number format
            </label>
            <select
              id="profile-nf"
              className="scale-input"
              value={numberFormat}
              onChange={e => setNumberFormat(e.target.value)}
            >
              {NUMBER_FORMATS.map(nf => (
                <option key={nf.value} value={nf.value}>
                  {nf.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </PageSection>

      <div className="flex justify-end">
        <button type="button" className="scale-btn-primary" disabled={saving} onClick={() => void onSave()}>
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>

      <PageSection
        title="Account"
        description="To leave this workspace or close your account, contact your business administrator or Scale support."
      >
        <p className="text-[13px] text-[#6B6B80]">
          Self-service leave and account closure will ship in a later release. Until then, use your admin or Scale
          support if you need to move or close an account.
        </p>
      </PageSection>
    </ProfileSettingsShell>
  );
}
