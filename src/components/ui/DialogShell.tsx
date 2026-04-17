import type { ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

const SIZE: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
};

export interface DialogShellProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export function DialogShell({ open, onOpenChange, title, description, children, footer, size = 'md' }: DialogShellProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(SIZE[size], 'gap-0 rounded-lg border border-[#E4E4E8] bg-white p-0')}>
        <div className="border-b border-[#E4E4E8] px-5 py-4">
          <DialogHeader className="space-y-1 text-left">
            <DialogTitle className="text-[17px] font-semibold text-[#1A1A3E]">{title}</DialogTitle>
            {description ? (
              <DialogDescription className="text-[13px] text-[#6B6B80]">{description}</DialogDescription>
            ) : null}
          </DialogHeader>
        </div>
        <div className="scale-scroll max-h-[min(60vh,520px)] overflow-y-auto overscroll-contain px-5 py-4">{children}</div>
        <DialogFooter className="border-t border-[#E4E4E8] px-5 py-3 sm:justify-end">{footer}</DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
