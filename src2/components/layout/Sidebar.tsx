import { Link, useLocation } from 'wouter';
import { LayoutDashboard, Users, MessageSquare, Zap, BarChart3, TrendingUp, Settings, CreditCard, FileText, Sliders, Wifi, ShieldCheck, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { roleLabel } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles: string[];
}

const NAV_ITEMS: { section: string; items: NavItem[] }[] = [
  {
    section: 'Workspace',
    items: [
      { label: 'Dashboard', href: '/admin/dashboard', icon: <LayoutDashboard size={16} />, roles: ['admin'] },
      { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={16} />, roles: ['owner', 'agent'] },
      { label: 'Leads', href: '/leads', icon: <Users size={16} />, roles: ['admin', 'owner', 'agent'] },
      { label: 'Inbox', href: '/inbox', icon: <MessageSquare size={16} />, roles: ['admin', 'owner', 'agent'] },
    ],
  },
  {
    section: 'Intelligence',
    items: [
      { label: 'Intelligence', href: '/intelligence', icon: <TrendingUp size={16} />, roles: ['admin', 'owner'] },
      { label: 'Performance', href: '/performance', icon: <BarChart3 size={16} />, roles: ['admin', 'owner'] },
    ],
  },
  {
    section: 'Settings',
    items: [
      { label: 'Users', href: '/admin/users', icon: <Users size={16} />, roles: ['admin'] },
      { label: 'AI Agents', href: '/admin/agents', icon: <Zap size={16} />, roles: ['admin'] },
      { label: 'Channels', href: '/admin/channels', icon: <Wifi size={16} />, roles: ['admin'] },
      { label: 'Templates', href: '/admin/templates', icon: <FileText size={16} />, roles: ['admin'] },
      { label: 'Rules', href: '/admin/rules', icon: <ShieldCheck size={16} />, roles: ['admin'] },
      { label: 'Billing', href: '/admin/billing', icon: <CreditCard size={16} />, roles: ['admin'] },
    ],
  },
];

export function Sidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  if (!user) return null;

  const filteredSections = NAV_ITEMS.map(section => ({
    ...section,
    items: section.items.filter(item => item.roles.includes(user.role)),
  })).filter(section => section.items.length > 0);

  const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <aside
      className="fixed left-0 top-0 bottom-0 z-50 flex flex-col bg-white border-r border-[#E4E4E8] overflow-y-auto"
      style={{ width: 220 }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 px-5 h-14 border-b border-[#E4E4E8] flex-shrink-0">
        <div className="w-6 h-6 bg-[#1A1A3E] rounded flex items-center justify-center flex-shrink-0">
          <ChevronRight size={14} className="text-white" strokeWidth={2.5} />
        </div>
        <span className="text-[15px] font-semibold text-[#1A1A3E] tracking-tight">Scale</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {filteredSections.map(section => (
          <div key={section.section}>
            <div className="text-[11px] font-medium text-[#9999AA] px-3 mb-1 mt-5 first:mt-2 tracking-[0.04em]">
              {section.section}
            </div>
            {section.items.map(item => {
              const isActive = location === item.href || (item.href !== '/' && location.startsWith(item.href));
              return (
                <Link key={item.href} href={item.href}>
                  <a
                    className={cn(
                      'flex items-center gap-2.5 h-9 px-3 rounded-md text-[14px] transition-colors cursor-pointer',
                      isActive
                        ? 'bg-[#F0F0F2] text-[#1A1A3E] font-medium'
                        : 'text-[#6B6B80] hover:bg-[#F7F7F8] hover:text-[#1A1A3E]'
                    )}
                    data-testid={`nav-link-${item.label.toLowerCase().replace(' ', '-')}`}
                  >
                    {item.icon}
                    {item.label}
                  </a>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-[#E4E4E8] flex-shrink-0">
        <div className="flex items-center gap-2.5 px-3 py-2">
          <div className="w-7 h-7 rounded-full bg-[#EEF3FD] flex items-center justify-center text-[11px] font-semibold text-[#2B62E8] flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-medium text-[#1A1A3E] truncate">{user.name}</div>
            <div className="text-[11px] text-[#9999AA] truncate">{roleLabel(user.role)}</div>
          </div>
          <button
            onClick={logout}
            className="text-[#9999AA] hover:text-[#6B6B80] transition-colors"
            title="Sign out"
            data-testid="button-logout"
          >
            <Settings size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}
