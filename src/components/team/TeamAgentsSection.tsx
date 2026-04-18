import { useCallback, useMemo, useState } from 'react';
import { X, Plus, KeyRound, Pencil, Ban, Trash2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { SearchField } from '@/components/ui/SearchField';
import { RoleBadge, UserStatusBadge } from '@/components/ui/ScaleBadge';
import { useCrmData } from '@/contexts/CrmDataContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  claimOrgSlug,
  createAgent,
  deleteAgentUser,
  renameAgent,
  resetAgentPassword,
  setAgentStatus,
} from '@/lib/db/agents';
import type { User } from '@/lib/types';
import { composeAgentEmail } from '@/lib/agent-email';

const SLUG_RE = /^[a-z0-9-]{3,40}$/;
const HANDLE_RE = /^[a-z0-9._-]{3,40}$/;

function randomPassword(): string {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789ABCDEFGHJKMNPQRSTUVWXYZ!@#$%';
  let s = '';
  for (let i = 0; i < 12; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

function agentSignIn(u: User, orgSlug: string | null | undefined): string {
  return composeAgentEmail(u.localHandle, orgSlug) ?? u.email;
}

function countOpenLeads(leads: { assignedToUserId?: string; stage: string }[], agentId: string): number {
  return leads.filter(l => l.assignedToUserId === agentId && l.stage !== 'closed').length;
}

function countOpenOpps(opps: { ownerId: string; outcome: string }[], agentId: string): number {
  return opps.filter(o => o.ownerId === agentId && o.outcome === 'open').length;
}

export function TeamAgentsSection({ variant }: { variant: 'admin' | 'owner' }) {
  const { user, refreshUser } = useAuth();
  const { teamMembers, leads, opportunities, crmLoading, refetchCrm } = useCrmData();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [slugInput, setSlugInput] = useState('');
  const [slugSaving, setSlugSaving] = useState(false);

  const [addOpen, setAddOpen] = useState(false);
  const [handle, setHandle] = useState('');
  const [agentName, setAgentName] = useState('');
  const [tempPassword, setTempPassword] = useState('');
  const [addLoading, setAddLoading] = useState(false);

  const [pwdOpen, setPwdOpen] = useState<string | null>(null);
  const [pwdNew, setPwdNew] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);

  const [renameOpen, setRenameOpen] = useState<string | null>(null);
  const [renameHandle, setRenameHandle] = useState('');
  const [renameLoading, setRenameLoading] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState('');

  const rows = useMemo(() => {
    const base = variant === 'owner' ? teamMembers.filter(u => u.role === 'agent') : teamMembers;
    return base.filter(u => {
      if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      if (roleFilter && u.role !== roleFilter) return false;
      return true;
    });
  }, [teamMembers, variant, search, roleFilter]);

  const canManageAgents = user?.role === 'admin' || user?.role === 'owner';
  const showSlugBanner = canManageAgents && !user?.orgSlug;

  const saveSlug = async () => {
    const s = slugInput.trim().toLowerCase();
    if (!SLUG_RE.test(s)) {
      toast.error('Use 3–40 characters: lowercase letters, digits, and hyphens only.');
      return;
    }
    setSlugSaving(true);
    try {
      await claimOrgSlug(s);
      toast.success('Business address saved.');
      setSlugInput('');
      await refreshUser();
      await refetchCrm();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not save address');
    } finally {
      setSlugSaving(false);
    }
  };

  const submitAddAgent = async () => {
    const h = handle.trim().toLowerCase();
    if (!HANDLE_RE.test(h)) {
      toast.error('Handle must be 3–40 chars: lowercase letters, digits, . _ -');
      return;
    }
    if (tempPassword.length < 8) {
      toast.error('Password must be at least 8 characters.');
      return;
    }
    if (!user?.orgSlug) {
      toast.error('Set your business address first.');
      return;
    }
    setAddLoading(true);
    try {
      const res = await createAgent({ localHandle: h, name: agentName.trim() || h, password: tempPassword });
      const email = String(res.email ?? '');
      toast.success(`Agent created. Sign-in: ${email}`);
      setAddOpen(false);
      setHandle('');
      setAgentName('');
      setTempPassword('');
      await refetchCrm();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not create agent');
    } finally {
      setAddLoading(false);
    }
  };

  const submitPwd = async (id: string) => {
    if (pwdNew.length < 8) {
      toast.error('Password must be at least 8 characters.');
      return;
    }
    setPwdLoading(true);
    try {
      await resetAgentPassword(id, pwdNew);
      toast.success('Password updated.');
      setPwdOpen(null);
      setPwdNew('');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not update password');
    } finally {
      setPwdLoading(false);
    }
  };

  const submitRename = async (id: string) => {
    const nh = renameHandle.trim().toLowerCase();
    if (!HANDLE_RE.test(nh)) {
      toast.error('Invalid handle format.');
      return;
    }
    setRenameLoading(true);
    try {
      await renameAgent(id, nh);
      toast.success('Sign-in address updated.');
      setRenameOpen(null);
      setRenameHandle('');
      await refetchCrm();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not rename');
    } finally {
      setRenameLoading(false);
    }
  };

  const toggleActive = useCallback(
    async (u: User) => {
      const next = u.status === 'inactive' ? 'active' : 'inactive';
      try {
        await setAgentStatus(u.id, next);
        toast.success(next === 'active' ? 'Agent reactivated.' : 'Agent deactivated.');
        await refetchCrm();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Could not update status');
      }
    },
    [refetchCrm]
  );

  const submitDelete = async (id: string) => {
    if (deleteConfirm !== 'DELETE') {
      toast.error('Type DELETE to confirm.');
      return;
    }
    try {
      await deleteAgentUser(id);
      toast.success('Agent removed.');
      setDeleteOpen(null);
      setDeleteConfirm('');
      await refetchCrm();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not delete');
    }
  };

  return (
    <>
      {crmLoading && (
        <p className="text-[13px] text-[#9999AA] mb-4" data-testid="text-team-loading">
          Loading team…
        </p>
      )}

      {showSlugBanner && (
        <div className="mb-6 p-4 rounded-lg border border-[#E4E4E8] bg-[#EEF3FD]">
          <p className="text-[14px] font-medium text-[#1A1A3E] mb-1">Set your business sign-in address</p>
          <p className="text-[13px] text-[#6B6B80] mb-3">
            Agents sign in as <code className="text-[12px]">theirname@your-address.scale</code>. Choose a unique address (lowercase, hyphens allowed).
          </p>
          <div className="flex flex-wrap items-end gap-2">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-[12px] text-[#6B6B80] mb-1">Address</label>
              <div className="flex items-center gap-1">
                <input
                  className="scale-input flex-1"
                  value={slugInput}
                  onChange={e => setSlugInput(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  placeholder="e.g. brightwave"
                />
                <span className="text-[13px] text-[#6B6B80] whitespace-nowrap">.scale</span>
              </div>
            </div>
            <button type="button" className="scale-btn-primary" disabled={slugSaving} onClick={() => void saveSlug()}>
              {slugSaving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="max-w-xs flex-1 min-w-[180px]">
          <SearchField value={search} onChange={setSearch} placeholder="Search team…" inputTestId="input-search-team" />
        </div>
        {variant === 'admin' && (
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="scale-input w-36" data-testid="select-filter-role">
            <option value="">All roles</option>
            <option value="admin">Admin</option>
            <option value="owner">Business Owner</option>
            <option value="agent">Sales Agent</option>
          </select>
        )}
        {canManageAgents && (
          <button
            type="button"
            onClick={() => {
              setTempPassword(randomPassword());
              setAddOpen(true);
            }}
            className="scale-btn-primary ml-auto"
            data-testid="button-add-agent"
          >
            <Plus size={14} /> Add sales agent
          </button>
        )}
      </div>

      {user?.orgSlug && (
        <p className="text-[13px] text-[#6B6B80] mb-4">
          Business address: <span className="font-medium text-[#1A1A3E]">@{user.orgSlug}.scale</span>
        </p>
      )}

      <div className="scale-card p-0 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr style={{ background: '#F7F7F8', borderBottom: '1px solid #E4E4E8' }}>
              <th className="text-left py-2 px-4 text-[12px] font-medium text-[#6B6B80]">Name</th>
              <th className="text-left py-2 px-4 text-[12px] font-medium text-[#6B6B80]">Sign in</th>
              {variant === 'admin' && <th className="text-left py-2 px-4 text-[12px] font-medium text-[#6B6B80]">Role</th>}
              <th className="text-left py-2 px-4 text-[12px] font-medium text-[#6B6B80]">Open leads</th>
              <th className="text-left py-2 px-4 text-[12px] font-medium text-[#6B6B80]">Open deals</th>
              <th className="text-left py-2 px-4 text-[12px] font-medium text-[#6B6B80]">Last active</th>
              <th className="text-left py-2 px-4 text-[12px] font-medium text-[#6B6B80]">Status</th>
              <th className="py-2 px-4 text-[12px] font-medium text-[#6B6B80]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr key={row.id} className="border-b border-[#E4E4E8] last:border-0 hover:bg-[#F7F7F8]" style={{ height: 48 }}>
                <td className="px-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-[#F0F0F2] flex items-center justify-center text-[11px] font-semibold text-[#1A1A3E]">
                      {row.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <span className="text-[14px] font-medium text-[#1A1A3E]">{row.name}</span>
                  </div>
                </td>
                <td className="px-4 text-[13px] text-[#6B6B80] font-mono">{agentSignIn(row, user?.orgSlug)}</td>
                {variant === 'admin' && (
                  <td className="px-4">
                    <RoleBadge role={row.role} />
                  </td>
                )}
                <td className="px-4 text-[13px] text-[#1A1A3E]">{row.role === 'agent' ? countOpenLeads(leads, row.id) : '—'}</td>
                <td className="px-4 text-[13px] text-[#1A1A3E]">{row.role === 'agent' ? countOpenOpps(opportunities, row.id) : '—'}</td>
                <td className="px-4 text-[13px] text-[#6B6B80]">{row.lastActive}</td>
                <td className="px-4">
                  <UserStatusBadge status={row.status} />
                </td>
                <td className="px-4">
                  {row.role === 'agent' && canManageAgents ? (
                    <div className="flex items-center gap-2 justify-end flex-wrap">
                      <button type="button" className="text-[12px] text-[#2B62E8]" onClick={() => setPwdOpen(row.id)} title="Reset password">
                        <KeyRound size={14} className="inline mr-0.5" /> Password
                      </button>
                      <button
                        type="button"
                        className="text-[12px] text-[#2B62E8]"
                        onClick={() => {
                          setRenameOpen(row.id);
                          setRenameHandle(row.localHandle ?? row.email.split('@')[0] ?? '');
                        }}
                      >
                        <Pencil size={14} className="inline mr-0.5" /> Rename
                      </button>
                      <button type="button" className="text-[12px] text-[#6B6B80]" onClick={() => void toggleActive(row)}>
                        <Ban size={14} className="inline mr-0.5" />
                        {row.status === 'inactive' ? 'Activate' : 'Deactivate'}
                      </button>
                      {user?.role === 'admin' && (
                        <button type="button" className="text-[12px] text-[#DC2626]" onClick={() => setDeleteOpen(row.id)}>
                          <Trash2 size={14} className="inline mr-0.5" /> Delete
                        </button>
                      )}
                    </div>
                  ) : (
                    <span className="text-[12px] text-[#9999AA]">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {addOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(0,0,0,0.3)' }}>
          <div className="bg-white border border-[#E4E4E8] rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[17px] font-semibold text-[#1A1A3E]">Add sales agent</h3>
              <button type="button" onClick={() => setAddOpen(false)} className="text-[#9999AA]">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-[12px] text-[#6B6B80] mb-1">Handle (login prefix)</label>
                <input className="scale-input w-full" value={handle} onChange={e => setHandle(e.target.value.toLowerCase())} placeholder="sara-k" />
              </div>
              <div>
                <label className="block text-[12px] text-[#6B6B80] mb-1">Display name</label>
                <input className="scale-input w-full" value={agentName} onChange={e => setAgentName(e.target.value)} placeholder="Sara Kerbouche" />
              </div>
              <div>
                <label className="block text-[12px] text-[#6B6B80] mb-1">Temporary password</label>
                <div className="flex gap-2">
                  <input className="scale-input flex-1" type="text" value={tempPassword} onChange={e => setTempPassword(e.target.value)} />
                  <button type="button" className="scale-btn-secondary shrink-0" onClick={() => setTempPassword(randomPassword())}>
                    <RefreshCw size={14} />
                  </button>
                </div>
              </div>
              {user?.orgSlug && (
                <p className="text-[13px] text-[#6B6B80]">
                  Sign-in:{' '}
                  <span className="font-mono text-[#1A1A3E]">
                    {handle.trim() ? `${handle.trim().toLowerCase()}@${user.orgSlug}.scale` : `…@${user.orgSlug}.scale`}
                  </span>
                </p>
              )}
              <div className="flex gap-2 pt-2">
                <button type="button" className="scale-btn-primary flex-1 justify-center" disabled={addLoading} onClick={() => void submitAddAgent()}>
                  {addLoading ? 'Creating…' : 'Create agent'}
                </button>
                <button type="button" className="scale-btn-secondary" onClick={() => setAddOpen(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {pwdOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(0,0,0,0.3)' }}>
          <div className="bg-white border border-[#E4E4E8] rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-[17px] font-semibold text-[#1A1A3E] mb-3">New password</h3>
            <input className="scale-input w-full mb-3" type="text" value={pwdNew} onChange={e => setPwdNew(e.target.value)} placeholder="Min 8 characters" />
            <div className="flex gap-2">
              <button type="button" className="scale-btn-primary flex-1" disabled={pwdLoading} onClick={() => void submitPwd(pwdOpen)}>
                {pwdLoading ? 'Saving…' : 'Save'}
              </button>
              <button type="button" className="scale-btn-secondary" onClick={() => setPwdOpen(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {renameOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(0,0,0,0.3)' }}>
          <div className="bg-white border border-[#E4E4E8] rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-[17px] font-semibold text-[#1A1A3E] mb-2">Rename handle</h3>
            <p className="text-[12px] text-[#6B6B80] mb-3">The agent must sign in with the new address after this change.</p>
            <input className="scale-input w-full mb-3" value={renameHandle} onChange={e => setRenameHandle(e.target.value.toLowerCase())} />
            <div className="flex gap-2">
              <button
                type="button"
                className="scale-btn-primary flex-1"
                disabled={renameLoading}
                onClick={() => void submitRename(renameOpen)}
              >
                {renameLoading ? 'Saving…' : 'Save'}
              </button>
              <button type="button" className="scale-btn-secondary" onClick={() => setRenameOpen(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(0,0,0,0.3)' }}>
          <div className="bg-white border border-[#E4E4E8] rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-[17px] font-semibold text-[#DC2626] mb-2">Delete agent</h3>
            <p className="text-[13px] text-[#6B6B80] mb-3">This removes their login permanently. Type DELETE to confirm.</p>
            <input className="scale-input w-full mb-3" value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)} placeholder="DELETE" />
            <div className="flex gap-2">
              <button type="button" className="scale-btn-primary flex-1 bg-[#DC2626]" onClick={() => void submitDelete(deleteOpen)}>
                Remove
              </button>
              <button type="button" className="scale-btn-secondary" onClick={() => setDeleteOpen(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
