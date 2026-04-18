import { useCallback, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ProfileSettingsShell } from '@/components/profile/ProfileSettingsShell';
import { PageSection } from '@/components/layout/PageSection';
import { Checkbox } from '@/components/ui/checkbox';
import { useMyProfile } from '@/hooks/useMyProfile';
import { setMyNotificationPrefsDelta } from '@/lib/db/me';
import {
  NOTIFICATION_EVENT_ROWS,
  type NotificationEventKey,
  patchNotificationKey,
  resolvedNotificationPrefs,
} from '@/lib/notification-prefs';

export default function NotificationsPage() {
  const { data: profile, isPending, refetch } = useMyProfile();
  const qc = useQueryClient();
  const [pendingKey, setPendingKey] = useState<string | null>(null);

  const prefs = useMemo(
    () => resolvedNotificationPrefs(profile?.notification_prefs as Record<string, unknown> | null | undefined),
    [profile?.notification_prefs]
  );

  const flushToggle = useCallback(
    async (key: NotificationEventKey, field: 'in_app' | 'email', value: boolean) => {
      const id = `${key}-${field}`;
      setPendingKey(id);
      try {
        const nextEntry = patchNotificationKey(prefs, key, field, value)[key];
        await setMyNotificationPrefsDelta({ [key]: nextEntry });
        await refetch();
        await qc.invalidateQueries({ queryKey: ['my-profile'] });
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Could not save notification preference');
      } finally {
        setPendingKey(null);
      }
    },
    [prefs, qc, refetch]
  );

  if (isPending || !profile) {
    return (
      <ProfileSettingsShell shellTitle="Notifications" heading="Notifications" description="Loading…">
        <p className="text-[14px] text-[#9999AA]">Loading…</p>
      </ProfileSettingsShell>
    );
  }

  return (
    <ProfileSettingsShell
      shellTitle="Notifications"
      heading="Notifications"
      description="Choose how we notify you about work that concerns you. Email delivery respects your project’s mail limits."
    >
      <PageSection title="Events" description="In-app notices appear inside Scale. Email is optional per event.">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[320px] border-collapse text-left text-[13px]">
            <thead>
              <tr className="border-b border-[#E4E4E8] text-[12px] font-medium text-[#9999AA]">
                <th className="py-2 pr-4 font-medium">Event</th>
                <th className="w-28 py-2 font-medium">In-app</th>
                <th className="w-28 py-2 font-medium">Email</th>
              </tr>
            </thead>
            <tbody>
              {NOTIFICATION_EVENT_ROWS.map(row => {
                const rowPrefs = prefs[row.key];
                return (
                  <tr key={row.key} className="border-b border-[#F0F0F2]">
                    <td className="py-3 pr-4 text-[#1A1A3E]">{row.label}</td>
                    <td className="py-3">
                      <Checkbox
                        checked={rowPrefs.in_app}
                        disabled={pendingKey !== null}
                        onCheckedChange={v => {
                          if (v === 'indeterminate') return;
                          void flushToggle(row.key, 'in_app', v);
                        }}
                        className="border-[#C4C4D4] data-[state=checked]:border-[#2B62E8] data-[state=checked]:bg-[#2B62E8]"
                      />
                    </td>
                    <td className="py-3">
                      <Checkbox
                        checked={rowPrefs.email}
                        disabled={pendingKey !== null}
                        onCheckedChange={v => {
                          if (v === 'indeterminate') return;
                          void flushToggle(row.key, 'email', v);
                        }}
                        className="border-[#C4C4D4] data-[state=checked]:border-[#2B62E8] data-[state=checked]:bg-[#2B62E8]"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </PageSection>
    </ProfileSettingsShell>
  );
}
