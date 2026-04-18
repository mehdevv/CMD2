import { memo, useLayoutEffect, useRef } from 'react';
import { Link, useLocation } from 'wouter';
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Zap,
  BarChart3,
  TrendingUp,
  FileText,
  Wifi,
  ShieldCheck,
  LayoutGrid,
  Send,
  MessageCircle,
  Package,
  RefreshCw,
  GitBranch,
  Bell,
  ScrollText,
  Briefcase,
  Kanban,
  PieChart,
  CreditCard,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getDashboardRoute } from '@/lib/auth';
import { BRAND_WORDMARK_PNG } from '@/lib/brand-assets';
import { cn } from '@/lib/utils';
import { AGENT_BRAND, type AgentId } from '@/lib/agent-brand';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles: string[];
  /** When true, only exact path match highlights (for /admin/agents overview). */
  exact?: boolean;
  /** When set, active state uses this automation agent’s brand colors. */
  agentId?: AgentId;
}

function navItemActive(href: string, location: string, exact?: boolean) {
  if (exact) return location === href;

  if (href === '/opportunities') {
    if (location === '/opportunities') return true;
    if (location.startsWith('/opportunities/') && !location.startsWith('/opportunities/board')) return true;
    return false;
  }

  if (href === '/analytics') {
    return location === '/analytics';
  }

  return location === href || location.startsWith(`${href}/`);
}

const NAV_ITEMS: { section: string; items: NavItem[] }[] = [
  {
    section: 'Workspace',
    items: [
      { label: 'Dashboard', href: '/admin/dashboard', icon: <LayoutDashboard size={16} />, roles: ['admin'] },
      { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={16} />, roles: ['owner', 'agent'] },
      { label: 'Sales team', href: '/dashboard/agents', icon: <Users size={16} />, roles: ['owner'] },
      { label: 'Leads', href: '/leads', icon: <Users size={16} />, roles: ['admin', 'owner', 'agent'] },
      { label: 'Inbox', href: '/inbox', icon: <MessageSquare size={16} />, roles: ['admin', 'owner', 'agent'] },
    ],
  },
  {
    section: 'Pipeline',
    items: [
      { label: 'Opportunities', href: '/opportunities', icon: <Briefcase size={16} />, roles: ['admin', 'owner', 'agent'] },
      { label: 'Board', href: '/opportunities/board', icon: <Kanban size={16} />, roles: ['admin', 'owner', 'agent'] },
    ],
  },
  {
    section: 'Insights',
    items: [
      { label: 'Intelligence', href: '/intelligence', icon: <TrendingUp size={16} />, roles: ['admin', 'owner'] },
      { label: 'Performance', href: '/performance', icon: <BarChart3 size={16} />, roles: ['admin', 'owner'] },
      { label: 'Analytics', href: '/analytics', icon: <PieChart size={16} />, roles: ['admin', 'owner'] },
      { label: 'Reports', href: '/analytics/reports', icon: <ScrollText size={16} />, roles: ['admin', 'owner'] },
    ],
  },
  {
    section: 'Automation',
    items: [
      { label: 'Overview', href: '/admin/agents', icon: <LayoutGrid size={16} />, roles: ['admin'], exact: true },
      { label: 'Lead Follow-Up', href: '/admin/agents/followup', icon: <Send size={16} />, roles: ['admin'], agentId: 'followup' },
      { label: 'Client Chat', href: '/admin/agents/chat', icon: <MessageCircle size={16} />, roles: ['admin'], agentId: 'chat' },
      { label: 'Order Tracking', href: '/admin/agents/tracking', icon: <Package size={16} />, roles: ['admin'], agentId: 'tracking' },
      { label: 'Refund', href: '/admin/agents/refund', icon: <RefreshCw size={16} />, roles: ['admin'], agentId: 'refund' },
      { label: 'Triggers', href: '/admin/automation/triggers', icon: <GitBranch size={16} />, roles: ['admin'] },
      { label: 'Human intervention', href: '/admin/automation/intervention', icon: <Bell size={16} />, roles: ['admin'] },
      { label: 'Activity log', href: '/admin/automation/activity', icon: <ScrollText size={16} />, roles: ['admin'] },
      { label: 'Classic workspace', href: '/admin/agents/workspace', icon: <Zap size={16} />, roles: ['admin'] },
      { label: 'Your automation', href: '/automation', icon: <LayoutGrid size={16} />, roles: ['owner'], exact: true },
      { label: 'Lead Follow-Up', href: '/automation/followup', icon: <Send size={16} />, roles: ['owner'], agentId: 'followup' },
      { label: 'Client Chat', href: '/automation/chat', icon: <MessageCircle size={16} />, roles: ['owner'], agentId: 'chat' },
      { label: 'Order Tracking', href: '/automation/tracking', icon: <Package size={16} />, roles: ['owner'], agentId: 'tracking' },
      { label: 'Refund', href: '/automation/refund', icon: <RefreshCw size={16} />, roles: ['owner'], agentId: 'refund' },
    ],
  },
  {
    section: 'Settings',
    items: [
      { label: 'Users', href: '/admin/users', icon: <Users size={16} />, roles: ['admin'] },
      { label: 'Channels', href: '/admin/channels', icon: <Wifi size={16} />, roles: ['admin'] },
      { label: 'Templates', href: '/admin/templates', icon: <FileText size={16} />, roles: ['admin'] },
      { label: 'Rules', href: '/admin/rules', icon: <ShieldCheck size={16} />, roles: ['admin'] },
      { label: 'Billing', href: '/admin/billing', icon: <CreditCard size={16} />, roles: ['admin'] },
    ],
  },
];

function SidebarInner() {
  const [location] = useLocation();
  const { user } = useAuth();
  const navScrollRef = useRef<HTMLElement>(null);
  const savedNavScroll = useRef(0);

  useLayoutEffect(() => {
    const el = navScrollRef.current;
    if (el) el.scrollTop = savedNavScroll.current;
  }, [location]);

  if (!user) return null;

  const filteredSections = NAV_ITEMS.map(section => ({
    ...section,
    items: section.items.filter(item => item.roles.includes(user.role)),
  })).filter(section => section.items.length > 0);

  return (
    <aside
      className="fixed bottom-0 left-0 top-0 z-50 flex w-[220px] flex-col overflow-hidden border-r border-[#E4E4E8] bg-white"
      style={{ overscrollBehavior: 'contain' }}
    >
      <div className="flex h-14 flex-shrink-0 items-center border-b border-[#E4E4E8] px-4">
        <Link href={getDashboardRoute(user.role)}>
          <a className="flex items-center py-1" aria-label="Scale home" data-testid="link-brand-sidebar">
            <img
              src={BRAND_WORDMARK_PNG}
              alt="Scale"
              className="h-[26px] w-auto max-w-[148px] object-contain object-left"
              width={148}
              height={26}
            />
          </a>
        </Link>
      </div>

      <nav
        ref={navScrollRef}
        className="scale-scroll min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain p-3"
        onScroll={() => {
          if (navScrollRef.current) savedNavScroll.current = navScrollRef.current.scrollTop;
        }}
      >
        {filteredSections.map(section => (
          <div key={section.section}>
            <div className="mb-1 mt-5 px-3 text-[11px] font-medium tracking-[0.04em] text-[#9999AA] first:mt-2">
              {section.section}
            </div>
            {section.items.map(item => {
              const isActive = navItemActive(item.href, location, item.exact);
              const brandTokens = item.agentId ? AGENT_BRAND[item.agentId] : null;
              const brandActive = Boolean(isActive && brandTokens);
              const brandIdle = Boolean(brandTokens && !brandActive);
              return (
                <Link key={item.href} href={item.href}>
                  <a
                    className={cn(
                      'flex h-9 cursor-pointer items-center gap-2.5 border-l-[3px] px-3 text-[14px] transition-colors',
                      !brandActive && !brandIdle && 'border-transparent',
                      brandActive && 'font-medium',
                      brandIdle && 'group',
                      isActive && !brandTokens && 'bg-[#F0F0F2] font-medium text-[#1A1A3E]',
                      !isActive && !brandTokens && 'text-[#6B6B80] hover:bg-[#F7F7F8] hover:text-[#1A1A3E]'
                    )}
                    style={
                      brandActive && brandTokens
                        ? {
                            borderLeftColor: brandTokens.solid,
                            backgroundColor: brandTokens.tint,
                            color: brandTokens.text,
                          }
                        : brandIdle && brandTokens
                          ? {
                              borderLeftColor: `color-mix(in srgb, ${brandTokens.solid} 52%, transparent)`,
                              backgroundColor: `color-mix(in srgb, ${brandTokens.tint} 38%, white)`,
                            }
                          : undefined
                    }
                    data-testid={`nav-link-${item.label.toLowerCase().replace(' ', '-')}`}
                  >
                    <span
                      className="flex shrink-0 items-center justify-center [&_svg]:shrink-0"
                      style={
                        brandActive && brandTokens
                          ? { color: brandTokens.text }
                          : brandIdle && brandTokens
                            ? { color: brandTokens.solid }
                            : undefined
                      }
                    >
                      {item.icon}
                    </span>
                    <span
                      className={cn(
                        'min-w-0 truncate',
                        brandIdle && 'text-[#6B6B80] group-hover:text-[#1A1A3E]'
                      )}
                      style={brandActive && brandTokens ? { color: brandTokens.text } : undefined}
                    >
                      {item.label}
                    </span>
                  </a>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}

SidebarInner.displayName = 'Sidebar';
export const Sidebar = memo(SidebarInner);
