import { useEffect, useRef, useState } from 'react';
import { Mic, MicOff } from 'lucide-react';

function formatElapsed(s: number) {
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

export interface VoiceRecorderProps {
  /** Called when user stops recording (mock: no audio captured). */
  onStop?: (elapsedSeconds: number) => void;
}

export function VoiceRecorder({ onStop }: VoiceRecorderProps) {
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [timer, setTimer] = useState<ReturnType<typeof setInterval> | null>(null);
  const elapsedRef = useRef(0);

  useEffect(
    () => () => {
      if (timer) clearInterval(timer);
    },
    [timer]
  );

  const start = () => {
    setRecording(true);
    setElapsed(0);
    elapsedRef.current = 0;
    const t = setInterval(() => {
      setElapsed(e => {
        const n = e + 1;
        elapsedRef.current = n;
        return n;
      });
    }, 1000);
    setTimer(t);
  };

  const stop = () => {
    setRecording(false);
    if (timer) clearInterval(timer);
    setTimer(null);
    onStop?.(elapsedRef.current);
  };

  return (
    <div className="flex flex-col items-center py-12">
      <button
        type="button"
        onClick={recording ? stop : start}
        className="flex h-16 w-16 items-center justify-center rounded-full transition-colors"
        style={{ background: recording ? '#DC2626' : '#1A1A3E' }}
        data-testid="button-record"
      >
        {recording ? <MicOff size={24} className="text-white" /> : <Mic size={24} className="text-white" />}
      </button>
      <div className="mt-4 text-center">
        {recording ? (
          <>
            <div className="font-mono text-[24px] text-[#1A1A3E]">{formatElapsed(elapsed)}</div>
            <p className="mt-1 text-[14px] text-[#6B6B80]">Recording… tap to stop</p>
          </>
        ) : (
          <p className="text-[14px] text-[#6B6B80]">Tap to record</p>
        )}
      </div>
    </div>
  );
}
