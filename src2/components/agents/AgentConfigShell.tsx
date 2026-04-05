import { useState, useEffect, useRef, ReactNode } from 'react';
import { Link } from 'wouter';
import { ChevronRight } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { cn } from '@/lib/utils';

export interface AnchorSection {
  id: string;
  label: string;
}

interface AgentConfigShellProps {
  agentName: string;
  agentPath: string;
  sections: AnchorSection[];
  rightPanel: ReactNode;
  children: ReactNode;
}

export function AgentConfigShell({ agentName, agentPath, sections, rightPanel, children }: AgentConfigShellProps) {
  const [activeSection, setActiveSection] = useState(sections[0]?.id ?? '');
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollTo = (id: string) => {
    const el = document.getElementById(`section-${id}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.id.replace('section-', '');
            setActiveSection(id);
          }
        });
      },
      { rootMargin: '-20% 0px -70% 0px', threshold: 0 }
    );
    sections.forEach(s => {
      const el = document.getElementById(`section-${s.id}`);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [sections]);

  return (
    <AppShell title={agentName} noPadding>
      <div className="flex" style={{ minHeight: 'calc(100vh - 56px)' }}>
        {/* Left anchor nav */}
        <aside className="flex-shrink-0 bg-white border-r border-[#E4E4E8] pt-8 px-4 sticky top-14 self-start" style={{ width: 200, maxHeight: 'calc(100vh - 56px)', overflowY: 'auto' }}>
          {/* Breadcrumb */}
          <div className="flex items-center gap-1 text-[12px] text-[#9999AA] mb-6">
            <Link href="/admin/agents"><a className="hover:text-[#1A1A3E]">Agents</a></Link>
            <ChevronRight size={11} />
            <span className="text-[#1A1A3E] truncate">{agentName.replace(' Agent', '')}</span>
          </div>

          <nav className="space-y-0.5">
            {sections.map(s => (
              <button
                key={s.id}
                onClick={() => scrollTo(s.id)}
                className={cn(
                  'w-full text-left px-3 py-2 rounded text-[13px] transition-colors',
                  activeSection === s.id
                    ? 'bg-[#EEF3FD] text-[#1E3A8A] font-medium'
                    : 'text-[#6B6B80] hover:bg-[#F7F7F8] hover:text-[#1A1A3E]'
                )}
              >
                {s.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Center scrollable content */}
        <div className="flex-1 overflow-y-auto px-10 py-8 min-w-0">
          <div style={{ maxWidth: 720 }}>
            {children}
          </div>
        </div>

        {/* Right sticky panel */}
        <aside className="flex-shrink-0 pt-8 px-4 sticky top-14 self-start" style={{ width: 256, maxHeight: 'calc(100vh - 56px)', overflowY: 'auto' }}>
          {rightPanel}
        </aside>
      </div>
    </AppShell>
  );
}

export function SectionBlock({ id, title, description, children }: { id: string; title: string; description?: string; children: ReactNode }) {
  return (
    <section id={`section-${id}`} className="mb-10">
      <h2 className="text-[16px] font-semibold text-[#1A1A3E] mb-1">{title}</h2>
      {description && <p className="text-[13px] text-[#6B6B80] mb-5">{description}</p>}
      {children}
    </section>
  );
}

export function FieldGroup({ label, help, children, required }: { label: string; help?: string; children: ReactNode; required?: boolean }) {
  return (
    <div className="mb-4">
      <label className="block text-[13px] font-medium text-[#1A1A3E] mb-1.5">
        {label}{required && <span className="text-[#DC2626] ml-0.5">*</span>}
      </label>
      {children}
      {help && <p className="text-[12px] text-[#9999AA] mt-1">{help}</p>}
    </div>
  );
}
