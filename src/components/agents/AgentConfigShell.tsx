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
  agentId?: AgentId;
  sections: AnchorSection[];
  rightPanel: ReactNode;
  children: ReactNode;
  overviewHref?: string;
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
      <div className="flex min-h-0 flex-col lg:flex-row" style={{ minHeight: 'calc(100dvh - 3.5rem)' }}>
        <aside
          className={cn(
            'flex-shrink-0 border-b border-[#E4E4E8] bg-white lg:sticky lg:top-14 lg:w-[200px] lg:self-start lg:border-b-0 lg:border-r',
            brand && 'border-l-[4px] lg:border-l-[4px]'
          )}
          style={{
            backgroundColor: brand ? brand.tint : '#ffffff',
            ...(brand ? { borderLeftColor: brand.solid } : {}),
          }}
        >
          <div className="px-4 pt-4 lg:pt-8">
            <div className="mb-3 flex items-center gap-1 text-[12px] text-[#9999AA] lg:mb-6">
              <Link href={overviewHref}>
                <a className="hover:text-[#1A1A3E]">{overviewLabel}</a>
              </Link>
              <ChevronRight size={11} />
              <span className="truncate text-[#1A1A3E]">{agentName.replace(' Agent', '')}</span>
            </div>
          </div>

          <nav className="scale-scroll flex gap-1 overflow-x-auto px-3 pb-3 lg:block lg:max-h-[calc(100dvh-8rem)] lg:space-y-0.5 lg:overflow-y-auto lg:overscroll-contain lg:px-4 lg:pb-8">
            {sections.map(s => {
              const active = activeSection === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => scrollTo(s.id)}
                  className={cn(
                    'flex-shrink-0 rounded px-3 py-2 text-left text-[13px] transition-colors lg:w-full',
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

        <div className="scale-scroll min-w-0 flex-1 overflow-y-auto overscroll-contain px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
          <div className="mx-auto w-full max-w-[720px]">{children}</div>
        </div>

        <aside className="scale-scroll flex-shrink-0 border-t border-[#E4E4E8] bg-[#F7F7F8] px-4 py-6 lg:sticky lg:top-14 lg:w-64 lg:self-start lg:border-t-0 lg:py-8 lg:max-h-[calc(100dvh-3.5rem)] lg:overflow-y-auto">
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
