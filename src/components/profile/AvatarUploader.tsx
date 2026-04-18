import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { Camera } from 'lucide-react';
import { uploadMyAvatar } from '@/lib/db/me';

interface AvatarUploaderProps {
  displayName: string;
  avatarUrl: string | null | undefined;
  orgId: string | null;
  userId: string;
  onUploaded: (url: string) => void;
}

function initialsFrom(name: string): string {
  return name
    .split(/\s+/)
    .map(p => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';
}

export function AvatarUploader({ displayName, avatarUrl, orgId, userId, onUploaded }: AvatarUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const pick = () => inputRef.current?.click();

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!orgId) {
      toast.error('Join a workspace before uploading a photo.');
      return;
    }
    setBusy(true);
    try {
      const url = await uploadMyAvatar(file, orgId, userId);
      onUploaded(url);
      toast.success('Profile photo updated');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not upload photo');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-full border border-[#E4E4E8] bg-[#F7F7F8]">
        {avatarUrl ? (
          <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[13px] font-semibold text-[#2B62E8]">
            {initialsFrom(displayName)}
          </div>
        )}
      </div>
      <div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={onFile}
          disabled={busy}
        />
        <button
          type="button"
          className="scale-btn-secondary inline-flex items-center gap-2 text-[13px]"
          onClick={pick}
          disabled={busy}
          data-testid="button-upload-avatar"
        >
          <Camera size={14} />
          {busy ? 'Uploading…' : 'Change photo'}
        </button>
        <p className="mt-1 text-[12px] text-[#9999AA]">JPEG, PNG, or WebP · up to 2 MB</p>
      </div>
    </div>
  );
}
