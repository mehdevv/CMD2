import { useState } from 'react';
import { Link } from 'wouter';
import { AppShell } from '@/components/layout/AppShell';
import { Bot, ArrowRight } from 'lucide-react';

const AGENTS = [
  {
    id: 'followup',
    name: 'Lead Follow-Up',
    desc: 'Your follow-up messages and sequence for new leads.',
    route: '/automation/followup',
  },
  {
    id: 'chat',
    name: 'Client Chat',
    desc: 'Knowledge base, greeting, and tone for inbound chat.',
    route: '/automation/chat',
  },
  {
    id: 'tracking',
    name: 'Order Tracking',
    desc: 'Customer-facing status messages (carrier is connected by admin).',
    route: '/automation/tracking',
  },
  {
    id: 'refund',
    name: 'Refund',
    desc: 'Tone and messages; policy limits are set by admin.',
    route: '/automation/refund',
  },
];

export default function OwnerAutomationOverview() {
  const [enabled, setEnabled] = useState<Record<string, boolean>>({
    followup: true,
    chat: true,
    tracking: true,
    refund: true,
  });

  return (
    <AppShell title="Automation">
      <div className="mb-6 max-w-2xl">
        <h1 className="text-[22px] font-semibold text-[#1A1A3E]">Your automation</h1>
        <p className="text-[13px] text-[#6B6B80] mt-1">
          Configure how automation speaks to your customers. Model, API keys, and org-wide limits are managed by your admin — you control prompts, FAQs, sequences, and customer-facing text.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-5">
        {AGENTS.map(agent => (
          <div key={agent.id} className="scale-card">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#EEF3FD] flex items-center justify-center">
                  <Bot size={18} style={{ color: '#2B62E8' }} />
                </div>
                <div>
                  <div className="text-[15px] font-semibold text-[#1A1A3E]">{agent.name}</div>
                  <div className="text-[12px] text-[#6B6B80] mt-0.5">{agent.desc}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEnabled(p => ({ ...p, [agent.id]: !p[agent.id] }))}
                className="relative w-10 h-5 rounded-full transition-colors flex-shrink-0 mt-1"
                style={{ background: enabled[agent.id] ? '#2B62E8' : '#E4E4E8' }}
              >
                <span className="absolute top-0.5 rounded-full w-4 h-4 bg-white transition-transform" style={{ left: enabled[agent.id] ? '22px' : '2px' }} />
              </button>
            </div>
            <div className="flex justify-end">
              <Link href={agent.route}>
                <a className="scale-btn-primary flex items-center gap-1.5 text-[13px] py-1.5 px-3">
                  Configure
                  <ArrowRight size={12} />
                </a>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
