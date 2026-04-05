import { AppShell } from '@/components/layout/AppShell';
import { Bell } from 'lucide-react';

export default function AdminNotifications() {
  return (
    <AppShell title="Human intervention alerts">
      <div className="scale-card flex flex-col items-center justify-center py-16 text-center">
        <div className="w-12 h-12 rounded-full bg-[#EEF3FD] flex items-center justify-center mb-4">
          <Bell size={22} className="text-[#2B62E8]" />
        </div>
        <h2 className="text-[16px] font-medium text-[#1A1A3E] mb-1">No pending alerts</h2>
        <p className="text-[13px] text-[#6B6B80] max-w-md">
          When an AI agent escalates to a human, notifications will appear here. Connect channels and enable agents to start monitoring.
        </p>
      </div>
    </AppShell>
  );
}
