import { useState } from 'react';
import { Copy, Eye, EyeOff } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { ChannelDot } from '@/components/ui/ChannelDot';

const CONNECTED = [
  { channel: 'whatsapp' as const, name: 'WhatsApp Business', handle: '+213 555 000 001', msgsToday: 847 },
  { channel: 'instagram' as const, name: 'Instagram', handle: '@scale.dz', msgsToday: 312 },
];

const AVAILABLE = [
  { channel: 'facebook' as const, name: 'Facebook Messenger', desc: 'Connect via Facebook Page — handles ad-generated leads automatically.' },
];

export default function AdminChannelsPage() {
  const [showToken, setShowToken] = useState(false);
  const [copied, setCopied] = useState(false);

  const WEBHOOK_URL = 'https://api.scale.dz/webhooks/inbound';
  const API_TOKEN = '••••••••••••••••••••••••••••••••';

  const copyWebhook = () => {
    navigator.clipboard.writeText(WEBHOOK_URL).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AppShell title="Channels">
      {/* Connected channels */}
      <h2 className="text-[15px] font-semibold text-[#1A1A3E] mb-4">Connected channels</h2>
      <div className="scale-card mb-8 p-0 overflow-hidden">
        {CONNECTED.map((ch, i) => (
          <div key={ch.channel} className="flex items-center gap-4 px-5 py-4" style={{ borderBottom: i < CONNECTED.length - 1 ? '1px solid #E4E4E8' : 'none' }} data-testid={`row-channel-${ch.channel}`}>
            <ChannelDot channel={ch.channel} size={8} />
            <div className="flex-1">
              <div className="text-[14px] font-medium text-[#1A1A3E]">{ch.name}</div>
              <div className="text-[13px] text-[#6B6B80]">{ch.handle} · {ch.msgsToday.toLocaleString()} messages today</div>
            </div>
            <span className="text-[13px] text-[#16A34A]">● Connected</span>
            <a href="/admin/agents" className="scale-btn-ghost text-[13px]">Manage</a>
            <button className="scale-btn-danger text-[13px] py-1.5 px-3">Disconnect</button>
          </div>
        ))}
      </div>

      {/* Available channels */}
      <h2 className="text-[15px] font-semibold text-[#1A1A3E] mb-4">Add a channel</h2>
      <div className="grid grid-cols-3 gap-4 mb-8">
        {AVAILABLE.map(ch => (
          <div key={ch.channel} className="scale-card hover:border-[#C8C8D0] transition-colors" data-testid={`card-add-channel-${ch.channel}`}>
            <div className="flex items-center gap-2 mb-2">
              <ChannelDot channel={ch.channel} size={10} />
              <span className="text-[14px] font-medium text-[#1A1A3E]">{ch.name}</span>
            </div>
            <p className="text-[13px] text-[#6B6B80] mb-4">{ch.desc}</p>
            <button className="scale-btn-primary text-[13px] py-1.5 px-4" data-testid={`button-connect-${ch.channel}`}>Connect</button>
          </div>
        ))}
        <div className="scale-card opacity-60">
          <div className="text-[14px] font-medium text-[#6B6B80] mb-1">Telegram</div>
          <p className="text-[13px] text-[#9999AA] mb-4">Coming soon — bot-based messaging channel.</p>
          <span className="text-[12px] bg-[#F0F0F2] text-[#9999AA] px-2 py-0.5 rounded">Soon</span>
        </div>
        <div className="scale-card opacity-60">
          <div className="text-[14px] font-medium text-[#6B6B80] mb-1">TikTok DMs</div>
          <p className="text-[13px] text-[#9999AA] mb-4">Coming soon — TikTok Shop integration.</p>
          <span className="text-[12px] bg-[#F0F0F2] text-[#9999AA] px-2 py-0.5 rounded">Soon</span>
        </div>
      </div>

      {/* Webhook */}
      <h2 className="text-[15px] font-semibold text-[#1A1A3E] mb-4">Webhook & API</h2>
      <div className="scale-card max-w-xl">
        <div className="mb-4">
          <label className="block text-[13px] font-medium text-[#1A1A3E] mb-2">Webhook endpoint</label>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-[#F7F7F8] border border-[#E4E4E8] rounded-md px-3 py-2 text-[13px] font-mono text-[#1A1A3E]">
              {WEBHOOK_URL}
            </code>
            <button onClick={copyWebhook} className="scale-btn-secondary text-[13px] py-1.5 px-3 flex-shrink-0" data-testid="button-copy-webhook">
              <Copy size={13} /> {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-[13px] font-medium text-[#1A1A3E] mb-2">API token</label>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-[#F7F7F8] border border-[#E4E4E8] rounded-md px-3 py-2 text-[13px] font-mono text-[#1A1A3E]">
              {showToken ? 'scale_demo_token_replace_in_production' : API_TOKEN}
            </code>
            <button onClick={() => setShowToken(v => !v)} className="scale-btn-secondary text-[13px] py-1.5 px-3 flex-shrink-0" data-testid="button-toggle-token">
              {showToken ? <EyeOff size={13} /> : <Eye size={13} />}
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
