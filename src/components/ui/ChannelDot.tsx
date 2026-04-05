import { Channel } from '@/lib/types';

const channelColors: Record<Channel, string> = {
  whatsapp: '#25D366',
  instagram: '#E1306C',
  facebook: '#1877F2',
};

const channelNames: Record<Channel, string> = {
  whatsapp: 'WhatsApp',
  instagram: 'Instagram',
  facebook: 'Facebook',
};

interface ChannelDotProps {
  channel: Channel;
  showLabel?: boolean;
  size?: number;
}

export function ChannelDot({ channel, showLabel = false, size = 6 }: ChannelDotProps) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="rounded-full flex-shrink-0"
        style={{ width: size, height: size, backgroundColor: channelColors[channel] }}
      />
      {showLabel && (
        <span className="text-[13px] text-[#6B6B80]">{channelNames[channel]}</span>
      )}
    </span>
  );
}
