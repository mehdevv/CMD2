import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { SearchField } from '@/components/ui/SearchField';
import { RoleBadge, UserStatusBadge } from '@/components/ui/ScaleBadge';
import { MOCK_USERS } from '@/lib/mock-data';
import { User } from '@/lib/types';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('agent');

  const filtered = users.filter(u => {
    if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase())) return false;
    if (roleFilter && u.role !== roleFilter) return false;
    return true;
  });

  const sendInvite = () => {
    if (!inviteEmail) return;
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: inviteEmail.split('@')[0],
      email: inviteEmail,
      role: inviteRole as User['role'],
      status: 'invited',
      lastActive: 'Never',
    };
    setUsers(prev => [...prev, newUser]);
    setInviteEmail('');
    setShowInvite(false);
  };

  return (
    <AppShell title="Users">
      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-6">
        <div className="max-w-xs flex-1">
          <SearchField
            value={search}
            onChange={setSearch}
            placeholder="Search users…"
            inputTestId="input-search-users"
          />
        </div>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="scale-input w-36" data-testid="select-filter-role">
          <option value="">All roles</option>
          <option value="admin">Admin</option>
          <option value="owner">Business Owner</option>
          <option value="agent">Sales Agent</option>
        </select>
        <button
          onClick={() => setShowInvite(true)}
          className="scale-btn-primary ml-auto"
          data-testid="button-invite-user"
        >
          <Plus size={14} /> Invite user
        </button>
      </div>

      {/* Table */}
      <div className="scale-card p-0 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr style={{ background: '#F7F7F8', borderBottom: '1px solid #E4E4E8' }}>
              <th className="text-left py-2 px-4 text-[12px] font-medium text-[#6B6B80]">Name</th>
              <th className="text-left py-2 px-4 text-[12px] font-medium text-[#6B6B80]">Email</th>
              <th className="text-left py-2 px-4 text-[12px] font-medium text-[#6B6B80]">Role</th>
              <th className="text-left py-2 px-4 text-[12px] font-medium text-[#6B6B80]">Last active</th>
              <th className="text-left py-2 px-4 text-[12px] font-medium text-[#6B6B80]">Status</th>
              <th className="py-2 px-4 text-[12px] font-medium text-[#6B6B80]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(user => (
              <tr key={user.id} className="border-b border-[#E4E4E8] last:border-0 hover:bg-[#F7F7F8]" style={{ height: 48 }} data-testid={`row-user-${user.id}`}>
                <td className="px-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-[#F0F0F2] flex items-center justify-center text-[11px] font-semibold text-[#1A1A3E]">
                      {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <span className="text-[14px] font-medium text-[#1A1A3E]">{user.name}</span>
                  </div>
                </td>
                <td className="px-4 text-[13px] text-[#6B6B80]">{user.email}</td>
                <td className="px-4"><RoleBadge role={user.role} /></td>
                <td className="px-4 text-[13px] text-[#6B6B80]">{user.lastActive}</td>
                <td className="px-4"><UserStatusBadge status={user.status} /></td>
                <td className="px-4">
                  <div className="flex items-center gap-3 justify-end">
                    <button className="text-[13px] text-[#6B6B80] hover:text-[#1A1A3E]">Edit</button>
                    <button className="text-[13px] text-[#DC2626] hover:underline">Deactivate</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Invite Modal */}
      {showInvite && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(0,0,0,0.3)' }}>
          <div className="bg-white border border-[#E4E4E8] rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[17px] font-semibold text-[#1A1A3E]">Invite user</h3>
              <button onClick={() => setShowInvite(false)} className="text-[#9999AA] hover:text-[#6B6B80]" data-testid="button-close-invite">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-[#1A1A3E] mb-1.5">Email address</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  placeholder="colleague@company.dz"
                  className="scale-input"
                  data-testid="input-modal-invite-email"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#1A1A3E] mb-1.5">Role</label>
                <select value={inviteRole} onChange={e => setInviteRole(e.target.value)} className="scale-input" data-testid="select-modal-invite-role">
                  <option value="admin">Admin</option>
                  <option value="owner">Business Owner</option>
                  <option value="agent">Sales Agent</option>
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={sendInvite} className="scale-btn-primary flex-1 justify-center" disabled={!inviteEmail} data-testid="button-send-invite">
                  Send invite
                </button>
                <button onClick={() => setShowInvite(false)} className="scale-btn-secondary" data-testid="button-cancel-invite">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
