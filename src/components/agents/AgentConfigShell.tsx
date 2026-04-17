import { useState, useEffect, ReactNode } from 'react';
import { Link } from 'wouter';
import { ChevronRight } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { cn } from '@/lib/utils';
import { AGENT_BRAND, type AgentId } from '@/lib/agent-brand';

export interface AnchorSection {
  id: string;
  label: string;
}

interface AgentConfigShellProps {
  agentName: string;
  agentPath: string;
  /** When set, applies this bot’s brand to the top bar, left rail, and active section. */
  agentId?: AgentId;
  sections: AnchorSection[];
  rightPanel: ReactNode;
  children: ReactNode;
  /** Breadcrumb root link (default: /admin/agents) */
  overviewHref?: string;
  /** Breadcrumb root label (default: Automation) */
  overviewLabel?: string;
}

export function AgentConfigShell({
  agentName,
  agentPath: _agentPath,
  agentId,
  sections,
  rightPanel,
  children,
  overviewHref = '/admin/agents',
  overviewLabel = 'Automation',
}: AgentConfigShellProps) {
  const [activeSection, setActiveSection] = useState(sections[0]?.id ?? '');
  const brand = agentId ? AGENT_BRAND[agentId] : null;

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
        <aside
          className={cn(
            'scale-scroll sticky top-14 flex-shrink-0 self-start overflow-y-auto overscroll-contain border-r border-[#E4E4E8] px-4 pt-8',
            brand && 'border-l-[4px]'
          )}
          style={{
            width: 200,
            maxHeight: 'calc(100vh - 56px)',
            backgroundColor: brand ? brand.tint : '#ffffff',
            ...(brand ? { borderLeftColor: brand.solid } : {}),
          }}
        >
          <div className="mb-6 flex items-center gap-1 text-[12px] text-[#9999AA]">
            <Link href={overviewHref}>
              <a className="hover:text-[#1A1A3E]">{overviewLabel}</a>
            </Link>
            <ChevronRight size={11} />
            <span className="truncate text-[#1A1A3E]">{agentName.replace(' Agent', '')}</span>
          </div>

          <nav className="space-y-0.5">
            {sections.map(s => {
              const active = activeSection === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => scrollTo(s.id)}
                  className={cn(
                    'w-full rounded px-3 py-2 text-left text-[13px] transition-colors',
                    active && brand && 'border-l-[3px] font-medium',
                    active && !brand && 'bg-[#EEF3FD] font-medium text-[#1E3A8A]',
                    !active && 'text-[#6B6B80] hover:bg-white hover:text-[#1A1A3E]'
                  )}
                  style={
                    active && brand
                      ? {
                          borderLeftColor: brand.solid,
                          backgroundColor: '#ffffff',
                          color: brand.text,
                        }
                      : undefined
                  }
                >
                  {s.label}
                </button>
              );
            })}
          </nav>
        </aside>

        <div className="scale-scroll min-w-0 flex-1 overflow-y-auto overscroll-contain px-10 py-8">
          <div style={{ maxWidth: 720 }}>{children}</div>
        </div>

        <aside
          className="scale-scroll sticky top-14 flex-shrink-0 self-start overflow-y-auto overscroll-contain bg-[#F7F7F8] px-4 pt-8"
          style={{ width: 256, maxHeight: 'calc(100vh - 56px)' }}
        >
          {rightPanel}
        </aside>
      </div>
    </AppShell>
  );
}

export function SectionBlock({ id, title, description, children }: { id: string; title: string; description?: string; children: ReactNode }) {
  return (
    <section id={`section-${id}`} className="mb-10">
      <h2 className="mb-1 text-[16px] font-semibold text-[#1A1A3E]">{title}</h2>
      {description && <p className="mb-5 text-[13px] text-[#6B6B80]">{description}</p>}
      {children}
    </section>
  );
}

export function FieldGroup({ label, help, children, required }: { label: string; help?: string; children: ReactNode; required?: boolean }) {
  return (
    <div className="mb-4">
      <label className="mb-1.5 block text-[13px] font-medium text-[#1A1A3E]">
        {label}
        {required && <span className="ml-0.5 text-[#DC2626]">*</span>}
      </label>
      {children}
      {help && <p className="mt-1 text-[12px] text-[#9999AA]">{help}</p>}
    </div>
  );
}
