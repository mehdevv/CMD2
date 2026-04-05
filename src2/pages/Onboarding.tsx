import { useState } from 'react';
import { useLocation } from 'wouter';
import { Check, ChevronRight, MessageSquare, Instagram, Facebook } from 'lucide-react';

const STEPS = [
  { id: 1, title: 'Connect a channel' },
  { id: 2, title: 'Invite your team' },
  { id: 3, title: 'Choose a plan' },
  { id: 4, title: "You're ready" },
];

const PLANS = [
  { name: 'Freelancer', price: '$20', users: 'Up to 10 users', messages: '200,000 msg/mo', features: ['All 4 AI agents', 'WhatsApp, Instagram, Facebook', 'Basic analytics'] },
  { name: 'E-commerce', price: '$30', users: 'Up to 25 users', messages: '500,000 msg/mo', features: ['All 4 AI agents', 'Priority support', 'Advanced analytics', 'Custom templates'], highlighted: true },
  { name: 'Edu Centers', price: '$50', users: 'Unlimited users', messages: '1,000,000 msg/mo', features: ['All 4 AI agents', 'Dedicated support', 'Full analytics', 'API access'] },
];

const AI_AGENTS = [
  { name: 'Lead Follow-Up Agent', desc: 'Contacts new leads automatically' },
  { name: 'Client Chat Agent', desc: 'Answers questions 24/7 using FAQ' },
  { name: 'Order Tracking Agent', desc: 'Sends proactive order status updates' },
  { name: 'Refund Agent', desc: 'Handles refund requests automatically' },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState(1);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('agent');
  const [invited, setInvited] = useState<{ email: string; role: string }[]>([]);
  const [, setLocation] = useLocation();

  const addInvite = () => {
    if (!inviteEmail) return;
    setInvited(prev => [...prev, { email: inviteEmail, role: inviteRole }]);
    setInviteEmail('');
  };

  return (
    <div className="min-h-screen bg-[#F7F7F8] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[600px]">
        {/* Logo */}
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="w-8 h-8 bg-[#1A1A3E] rounded flex items-center justify-center">
            <ChevronRight size={16} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="text-[18px] font-semibold text-[#1A1A3E]">Scale</span>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center mb-10">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-medium"
                  style={{
                    background: s.id < step ? '#16A34A' : s.id === step ? '#1A1A3E' : '#F0F0F2',
                    color: s.id <= step ? 'white' : '#9999AA',
                  }}
                >
                  {s.id < step ? <Check size={12} /> : s.id}
                </div>
              </div>
              {i < STEPS.length - 1 && (
                <div className="w-16 h-px bg-[#E4E4E8] mx-2" />
              )}
            </div>
          ))}
        </div>

        <div className="bg-white border border-[#E4E4E8] rounded-lg p-8">
          <h2 className="text-[22px] font-semibold text-[#1A1A3E] mb-1">{STEPS[step - 1].title}</h2>
          <p className="text-[14px] text-[#6B6B80] mb-6">Step {step} of {STEPS.length}</p>

          {/* Step 1 */}
          {step === 1 && (
            <div className="space-y-3">
              {[
                { icon: <MessageSquare size={18} className="text-[#25D366]" />, name: 'WhatsApp Business API', desc: 'Primary channel for follow-ups and order tracking', recommended: true },
                { icon: <Instagram size={18} className="text-[#E1306C]" />, name: 'Instagram Direct Messages', desc: 'Capture leads from Instagram posts and stories', recommended: false },
                { icon: <Facebook size={18} className="text-[#1877F2]" />, name: 'Facebook Messenger', desc: 'Handles ad-generated leads automatically', recommended: false },
              ].map(channel => (
                <div key={channel.name} className="border border-[#E4E4E8] rounded-lg p-4 flex items-center justify-between hover:border-[#2B62E8] transition-colors cursor-pointer" data-testid={`card-channel-${channel.name.toLowerCase().replace(/ /g, '-')}`}>
                  <div className="flex items-center gap-3">
                    {channel.icon}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[14px] font-medium text-[#1A1A3E]">{channel.name}</span>
                        {channel.recommended && <span className="text-[11px] bg-[#EEF3FD] text-[#1E3A8A] px-2 py-0.5 rounded font-medium">Recommended</span>}
                      </div>
                      <p className="text-[13px] text-[#6B6B80]">{channel.desc}</p>
                    </div>
                  </div>
                  <button className="scale-btn-secondary text-[13px] py-1.5 px-3">Connect</button>
                </div>
              ))}
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div>
              <div className="flex gap-2 mb-4">
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  placeholder="colleague@company.dz"
                  className="scale-input flex-1"
                  data-testid="input-invite-email"
                />
                <select value={inviteRole} onChange={e => setInviteRole(e.target.value)} className="scale-input w-40" data-testid="select-invite-role">
                  <option value="admin">Admin</option>
                  <option value="owner">Business Owner</option>
                  <option value="agent">Sales Agent</option>
                </select>
                <button onClick={addInvite} className="scale-btn-primary px-4" data-testid="button-add-invite">Add</button>
              </div>
              {invited.length > 0 ? (
                <div className="space-y-2">
                  {invited.map((inv, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-[#E4E4E8] last:border-0">
                      <span className="text-[14px] text-[#1A1A3E]">{inv.email}</span>
                      <span className="text-[12px] bg-[#F0F0F2] text-[#6B6B80] px-2 py-0.5 rounded">{inv.role}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[13px] text-[#9999AA]">No team members added yet. You can skip this step.</p>
              )}
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div className="grid grid-cols-3 gap-3">
              {PLANS.map((plan, i) => (
                <div
                  key={plan.name}
                  onClick={() => setSelectedPlan(i)}
                  className="border rounded-lg p-4 cursor-pointer transition-colors"
                  style={{ borderColor: selectedPlan === i ? '#2B62E8' : '#E4E4E8' }}
                  data-testid={`card-plan-${plan.name.toLowerCase().replace(' ', '-')}`}
                >
                  <div className="text-[15px] font-medium text-[#1A1A3E]">{plan.name}</div>
                  <div className="text-[22px] font-semibold text-[#1A1A3E] mt-1">{plan.price}<span className="text-[13px] font-normal text-[#6B6B80]">/mo</span></div>
                  <div className="text-[12px] text-[#6B6B80] mt-2">{plan.users}</div>
                  <div className="text-[12px] text-[#6B6B80]">{plan.messages}</div>
                  <ul className="mt-3 space-y-1">
                    {plan.features.map(f => (
                      <li key={f} className="text-[12px] text-[#6B6B80] flex items-center gap-1.5">
                        <Check size={11} className="text-[#16A34A]" /> {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    className={`mt-4 w-full text-[13px] py-1.5 rounded-md border font-medium transition-colors ${selectedPlan === i ? 'bg-[#2B62E8] text-white border-[#2B62E8]' : 'border-[#E4E4E8] text-[#1A1A3E] hover:bg-[#F7F7F8]'}`}
                    data-testid={`button-select-plan-${i}`}
                  >
                    {selectedPlan === i ? 'Selected' : 'Select'}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Step 4 */}
          {step === 4 && (
            <div className="space-y-3">
              {AI_AGENTS.map(agent => (
                <div key={agent.name} className="flex items-center gap-3 p-3 border border-[#E4E4E8] rounded-lg">
                  <div className="w-6 h-6 rounded-full bg-[#F0FDF4] flex items-center justify-center flex-shrink-0">
                    <Check size={13} className="text-[#16A34A]" />
                  </div>
                  <div>
                    <div className="text-[14px] font-medium text-[#1A1A3E]">{agent.name}</div>
                    <div className="text-[13px] text-[#6B6B80]">{agent.desc}</div>
                  </div>
                  <span className="ml-auto text-[13px] text-[#16A34A] font-medium">Active</span>
                </div>
              ))}
            </div>
          )}

          {/* Nav buttons */}
          <div className="flex justify-between mt-8">
            {step > 1 ? (
              <button onClick={() => setStep(s => s - 1)} className="scale-btn-secondary" data-testid="button-prev-step">Back</button>
            ) : <div />}
            {step < 4 ? (
              <div className="flex items-center gap-3">
                {step === 2 && <button onClick={() => setStep(3)} className="scale-btn-ghost text-[13px]">Skip</button>}
                <button onClick={() => setStep(s => s + 1)} className="scale-btn-primary" data-testid="button-next-step">Continue</button>
              </div>
            ) : (
              <button onClick={() => setLocation('/admin/dashboard')} className="scale-btn-primary" data-testid="button-goto-dashboard">
                Go to dashboard
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
