import { useState } from 'react';
import { Plus, X, Zap } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { DEFAULT_FOLLOWUP_STEPS, DEFAULT_FAQ, DEFAULT_RULES } from '@/lib/mock-data';
import { FollowUpStep, FAQEntry, Rule } from '@/lib/types';

type AgentTab = 'followup' | 'chat' | 'refund' | 'tracking';

const AGENT_TABS: { id: AgentTab; label: string }[] = [
  { id: 'followup', label: 'Lead Follow-Up' },
  { id: 'chat', label: 'Client Chat' },
  { id: 'refund', label: 'Refund' },
  { id: 'tracking', label: 'Order Tracking' },
];

const TRACKING_STATUSES = [
  { internal: 'confirmed', message: 'Votre commande a été confirmée. Nous la préparons pour vous !' },
  { internal: 'shipped', message: 'Votre commande est en route ! Livraison estimée : 2-3 jours.' },
  { internal: 'out_for_delivery', message: 'Votre commande est dans votre ville. Livraison aujourd\'hui !' },
  { internal: 'delivered', message: 'Votre commande a été livrée. Merci pour votre achat !' },
];

export default function AdminAgentsPage() {
  const [tab, setTab] = useState<AgentTab>('followup');
  const [steps, setSteps] = useState<FollowUpStep[]>(DEFAULT_FOLLOWUP_STEPS);
  const [faq, setFaq] = useState<FAQEntry[]>(DEFAULT_FAQ);
  const [rules, setRules] = useState<Rule[]>(DEFAULT_RULES);
  const [refundWindow, setRefundWindow] = useState('30');
  const [autoLimit, setAutoLimit] = useState('2000');
  const [proofRequired, setProofRequired] = useState(true);
  const [chatTone, setChatTone] = useState('Professional');
  const [agentEnabled, setAgentEnabled] = useState({ followup: true, chat: true, refund: true, tracking: true });
  const [testResult, setTestResult] = useState('');
  const [testValues, setTestValues] = useState({ value: '', type: 'new', days: '' });

  const addStep = () => {
    setSteps(prev => [...prev, { id: `step-${Date.now()}`, delay: '+1 day', message: '' }]);
  };

  const addFAQ = () => {
    setFaq(prev => [...prev, { id: `faq-${Date.now()}`, question: '', answer: '' }]);
  };

  const runTest = () => {
    const val = parseInt(testValues.value);
    const days = parseInt(testValues.days);
    const limit = parseInt(autoLimit);
    const window = parseInt(refundWindow);
    if (days > window) setTestResult('Reject — outside refund window.');
    else if (val > parseInt(autoLimit) * 2) setTestResult('Escalate to human — exceeds auto-approve limit.');
    else if (val <= limit) setTestResult('Auto-approve — within policy limits.');
    else setTestResult('Escalate to human — above auto-approve threshold.');
  };

  return (
    <AppShell title="AI Agents">
      <div className="flex gap-6">
        {/* Main config area */}
        <div className="flex-1 min-w-0">
          {/* Tabs */}
          <div className="flex gap-6 mb-6 border-b border-[#E4E4E8] pb-0">
            {AGENT_TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`text-[14px] pb-3 transition-colors ${tab === t.id ? 'text-[#1A1A3E] font-medium border-b-2 border-[#1A1A3E]' : 'text-[#6B6B80] hover:text-[#1A1A3E]'}`}
                data-testid={`button-agent-tab-${t.id}`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Follow-up */}
          {tab === 'followup' && (
            <div className="scale-card">
              <h3 className="text-[15px] font-medium text-[#1A1A3E] mb-4">Follow-up sequence</h3>
              <div className="space-y-3">
                {steps.map((step, i) => (
                  <div key={step.id} className="flex items-start gap-3 p-3 border border-[#E4E4E8] rounded-lg">
                    <span className="text-[13px] font-medium text-[#9999AA] mt-2 w-6 flex-shrink-0">{i + 1}</span>
                    <input
                      type="text"
                      value={step.delay}
                      onChange={e => setSteps(prev => prev.map(s => s.id === step.id ? { ...s, delay: e.target.value } : s))}
                      className="scale-input w-32 flex-shrink-0"
                      placeholder="Delay"
                      data-testid={`input-step-delay-${i}`}
                    />
                    <textarea
                      value={step.message}
                      onChange={e => setSteps(prev => prev.map(s => s.id === step.id ? { ...s, message: e.target.value } : s))}
                      className="scale-input flex-1 resize-none py-2"
                      style={{ height: 64 }}
                      placeholder="Message content..."
                      data-testid={`textarea-step-message-${i}`}
                    />
                    <button
                      onClick={() => setSteps(prev => prev.filter(s => s.id !== step.id))}
                      className="text-[#9999AA] hover:text-[#DC2626] mt-2"
                      data-testid={`button-remove-step-${i}`}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <button onClick={addStep} className="scale-btn-ghost mt-3 text-[13px]" data-testid="button-add-step">
                <Plus size={13} /> Add step
              </button>
              <p className="text-[12px] text-[#9999AA] mt-3">Variables: {'{{name}}'}, {'{{product}}'}, {'{{company}}'}, {'{{agent_name}}'}</p>
            </div>
          )}

          {/* Chat */}
          {tab === 'chat' && (
            <div className="scale-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[15px] font-medium text-[#1A1A3E]">FAQ entries</h3>
                <div className="flex items-center gap-3">
                  <label className="text-[13px] text-[#6B6B80]">Tone:</label>
                  <select value={chatTone} onChange={e => setChatTone(e.target.value)} className="scale-input w-36" data-testid="select-chat-tone">
                    <option>Professional</option>
                    <option>Friendly</option>
                    <option>Direct</option>
                  </select>
                </div>
              </div>
              <table className="w-full">
                <thead>
                  <tr style={{ background: '#F7F7F8', borderBottom: '1px solid #E4E4E8' }}>
                    <th className="text-left py-2 px-3 text-[12px] font-medium text-[#6B6B80]">Question</th>
                    <th className="text-left py-2 px-3 text-[12px] font-medium text-[#6B6B80]">Answer</th>
                    <th className="py-2 px-3 w-8" />
                  </tr>
                </thead>
                <tbody>
                  {faq.map((entry, i) => (
                    <tr key={entry.id} className="border-b border-[#E4E4E8] last:border-0">
                      <td className="py-2 px-3">
                        <input type="text" value={entry.question} onChange={e => setFaq(prev => prev.map(f => f.id === entry.id ? { ...f, question: e.target.value } : f))} className="scale-input text-[13px]" placeholder="Question..." data-testid={`input-faq-q-${i}`} />
                      </td>
                      <td className="py-2 px-3">
                        <input type="text" value={entry.answer} onChange={e => setFaq(prev => prev.map(f => f.id === entry.id ? { ...f, answer: e.target.value } : f))} className="scale-input text-[13px]" placeholder="Answer..." data-testid={`input-faq-a-${i}`} />
                      </td>
                      <td className="py-2 px-3">
                        <button onClick={() => setFaq(prev => prev.filter(f => f.id !== entry.id))} className="text-[#9999AA] hover:text-[#DC2626]"><X size={13} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button onClick={addFAQ} className="scale-btn-ghost mt-3 text-[13px]" data-testid="button-add-faq"><Plus size={13} /> Add entry</button>
            </div>
          )}

          {/* Refund */}
          {tab === 'refund' && (
            <div className="space-y-6">
              <div className="scale-card">
                <h3 className="text-[15px] font-medium text-[#1A1A3E] mb-4">Refund policy</h3>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-[13px] font-medium text-[#1A1A3E] mb-1.5">Refund window (days)</label>
                    <input type="number" value={refundWindow} onChange={e => setRefundWindow(e.target.value)} className="scale-input" data-testid="input-refund-window" />
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-[#1A1A3E] mb-1.5">Auto-approve limit (DZD)</label>
                    <input type="number" value={autoLimit} onChange={e => setAutoLimit(e.target.value)} className="scale-input" data-testid="input-auto-limit" />
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-[#1A1A3E] mb-1.5">Proof required</label>
                    <div className="flex items-center gap-2 h-9">
                      <button
                        onClick={() => setProofRequired(v => !v)}
                        className="relative w-9 h-5 rounded-full transition-colors"
                        style={{ background: proofRequired ? '#2B62E8' : '#E4E4E8' }}
                        data-testid="toggle-proof-required"
                      >
                        <span
                          className="absolute top-0.5 rounded-full w-4 h-4 bg-white transition-transform"
                          style={{ left: proofRequired ? '50%' : '2px' }}
                        />
                      </button>
                      <span className="text-[13px] text-[#6B6B80]">{proofRequired ? 'Required' : 'Not required'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="scale-card">
                <h3 className="text-[15px] font-medium text-[#1A1A3E] mb-4">Business rules</h3>
                <div className="space-y-2">
                  {rules.map((rule, i) => (
                    <div key={rule.id} className="flex items-center gap-2">
                      <span className="text-[13px] text-[#9999AA]">IF</span>
                      <select value={rule.condition} onChange={e => setRules(prev => prev.map(r => r.id === rule.id ? { ...r, condition: e.target.value } : r))} className="scale-input w-48" data-testid={`select-rule-condition-${i}`}>
                        <option value="order_value_above">Order value above</option>
                        <option value="order_value_below">Order value below</option>
                        <option value="days_since_purchase_above">Days since purchase above</option>
                      </select>
                      <input type="text" value={rule.value} onChange={e => setRules(prev => prev.map(r => r.id === rule.id ? { ...r, value: e.target.value } : r))} className="scale-input w-24" data-testid={`input-rule-value-${i}`} />
                      <span className="text-[13px] text-[#9999AA]">THEN</span>
                      <select value={rule.action} onChange={e => setRules(prev => prev.map(r => r.id === rule.id ? { ...r, action: e.target.value } : r))} className="scale-input w-48" data-testid={`select-rule-action-${i}`}>
                        <option value="auto_approve">Auto-approve</option>
                        <option value="escalate_to_human">Escalate to human</option>
                        <option value="reject_refund">Reject refund</option>
                      </select>
                      <button onClick={() => setRules(prev => prev.filter(r => r.id !== rule.id))} className="text-[#9999AA] hover:text-[#DC2626]"><X size={13} /></button>
                    </div>
                  ))}
                </div>
                <button onClick={() => setRules(prev => [...prev, { id: `rule-${Date.now()}`, condition: 'order_value_above', value: '', action: 'escalate_to_human' }])} className="scale-btn-ghost mt-3 text-[13px]"><Plus size={13} /> Add rule</button>
              </div>

              <div className="scale-card">
                <h3 className="text-[15px] font-medium text-[#1A1A3E] mb-4">Test a scenario</h3>
                <div className="flex gap-3 mb-3">
                  <div><label className="block text-[12px] text-[#6B6B80] mb-1">Order value (DZD)</label><input type="number" value={testValues.value} onChange={e => setTestValues(p => ({ ...p, value: e.target.value }))} className="scale-input w-32" data-testid="input-test-value" /></div>
                  <div><label className="block text-[12px] text-[#6B6B80] mb-1">Customer type</label><select value={testValues.type} onChange={e => setTestValues(p => ({ ...p, type: e.target.value }))} className="scale-input w-32" data-testid="select-test-type"><option value="new">New</option><option value="returning">Returning</option></select></div>
                  <div><label className="block text-[12px] text-[#6B6B80] mb-1">Days since purchase</label><input type="number" value={testValues.days} onChange={e => setTestValues(p => ({ ...p, days: e.target.value }))} className="scale-input w-32" data-testid="input-test-days" /></div>
                </div>
                <button onClick={runTest} className="scale-btn-secondary text-[13px]" data-testid="button-run-test">Run test</button>
                {testResult && (
                  <div className="mt-3 p-3 border border-[#E4E4E8] rounded-md text-[13px] text-[#1A1A3E]" data-testid="text-test-result">
                    <strong>AI decision:</strong> {testResult}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Order Tracking */}
          {tab === 'tracking' && (
            <div className="scale-card">
              <h3 className="text-[15px] font-medium text-[#1A1A3E] mb-4">Status message mapping</h3>
              <table className="w-full">
                <thead>
                  <tr style={{ background: '#F7F7F8', borderBottom: '1px solid #E4E4E8' }}>
                    <th className="text-left py-2 px-3 text-[12px] font-medium text-[#6B6B80]">Internal status</th>
                    <th className="text-left py-2 px-3 text-[12px] font-medium text-[#6B6B80]">Customer message</th>
                  </tr>
                </thead>
                <tbody>
                  {TRACKING_STATUSES.map((s, i) => (
                    <tr key={i} className="border-b border-[#E4E4E8] last:border-0">
                      <td className="py-2 px-3 text-[13px] font-medium text-[#1A1A3E] w-40">{s.internal}</td>
                      <td className="py-2 px-3">
                        <input type="text" defaultValue={s.message} className="scale-input text-[13px]" data-testid={`input-tracking-msg-${i}`} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button className="scale-btn-ghost mt-3 text-[13px]"><Plus size={13} /> Add status</button>
            </div>
          )}
        </div>

        {/* Agent enable/disable sidebar */}
        <div className="w-64 flex-shrink-0">
          <div className="scale-card">
            <h4 className="text-[13px] font-medium text-[#1A1A3E] mb-4">Agent status</h4>
            <div className="space-y-3">
              {AGENT_TABS.map(t => (
                <div key={t.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap size={13} className={agentEnabled[t.id] ? 'text-[#2B62E8]' : 'text-[#9999AA]'} />
                    <span className="text-[13px] text-[#1A1A3E]">{t.label}</span>
                  </div>
                  <button
                    onClick={() => setAgentEnabled(prev => ({ ...prev, [t.id]: !prev[t.id] }))}
                    className="relative w-9 h-5 rounded-full transition-colors"
                    style={{ background: agentEnabled[t.id] ? '#2B62E8' : '#E4E4E8' }}
                    data-testid={`toggle-agent-${t.id}`}
                  >
                    <span
                      className="absolute top-0.5 rounded-full w-4 h-4 bg-white transition-transform"
                      style={{ left: agentEnabled[t.id] ? '50%' : '2px' }}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
