import { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { DEFAULT_RULES } from '@/lib/mock-data';
import { Rule } from '@/lib/types';
import { Plus, X } from 'lucide-react';

export default function AdminRulesPage() {
  const [refundWindow, setRefundWindow] = useState('30');
  const [autoLimit, setAutoLimit] = useState('2000');
  const [proofRequired, setProofRequired] = useState(true);
  const [rules, setRules] = useState<Rule[]>(DEFAULT_RULES);
  const [testValues, setTestValues] = useState({ value: '', type: 'new', days: '' });
  const [testResult, setTestResult] = useState('');

  const runTest = () => {
    const val = parseInt(testValues.value);
    const days = parseInt(testValues.days);
    const window = parseInt(refundWindow);
    const limit = parseInt(autoLimit);
    if (isNaN(val) || isNaN(days)) { setTestResult('Please fill in all test fields.'); return; }
    if (days > window) setTestResult('Reject — outside refund window of ' + window + ' days.');
    else if (val > limit * 2) setTestResult('Escalate to human — exceeds auto-approve limit.');
    else if (val <= limit) setTestResult('Auto-approve — within policy limits.');
    else setTestResult('Escalate to human — above auto-approve threshold of ' + limit + ' DZD.');
  };

  return (
    <AppShell title="Rules">
      <div className="max-w-2xl space-y-6">
        {/* Refund Policy */}
        <div className="scale-card">
          <h3 className="text-[15px] font-medium text-[#1A1A3E] mb-4">Refund policy</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-medium text-[#1A1A3E] mb-1.5">Refund window</label>
                <div className="flex items-center gap-2">
                  <input type="number" value={refundWindow} onChange={e => setRefundWindow(e.target.value)} className="scale-input w-20" data-testid="input-refund-window" />
                  <span className="text-[13px] text-[#6B6B80]">days</span>
                </div>
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#1A1A3E] mb-1.5">Auto-approve limit</label>
                <div className="flex items-center gap-2">
                  <input type="number" value={autoLimit} onChange={e => setAutoLimit(e.target.value)} className="scale-input w-28" data-testid="input-auto-limit" />
                  <span className="text-[13px] text-[#6B6B80]">DZD</span>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[#1A1A3E] mb-2">Proof of purchase</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setProofRequired(v => !v)}
                  className="relative w-9 h-5 rounded-full transition-colors"
                  style={{ background: proofRequired ? '#2B62E8' : '#E4E4E8' }}
                  data-testid="toggle-proof"
                >
                  <span className="absolute top-0.5 rounded-full w-4 h-4 bg-white transition-transform" style={{ left: proofRequired ? '50%' : '2px' }} />
                </button>
                <span className="text-[13px] text-[#6B6B80]">{proofRequired ? 'Required for all refund requests' : 'Not required'}</span>
              </div>
            </div>
            <button className="scale-btn-primary text-[13px]" data-testid="button-save-policy">Save policy</button>
          </div>
        </div>

        {/* Business Rules */}
        <div className="scale-card">
          <h3 className="text-[15px] font-medium text-[#1A1A3E] mb-4">Business rules</h3>
          <div className="space-y-2">
            {rules.map((rule, i) => (
              <div key={rule.id} className="flex items-center gap-2 flex-wrap">
                <span className="text-[12px] font-medium text-[#9999AA] w-4">IF</span>
                <select value={rule.condition} onChange={e => setRules(prev => prev.map(r => r.id === rule.id ? { ...r, condition: e.target.value } : r))} className="scale-input w-44 text-[13px]" data-testid={`select-rule-cond-${i}`}>
                  <option value="order_value_above">Order value above</option>
                  <option value="order_value_below">Order value below</option>
                  <option value="days_since_purchase_above">Days since purchase above</option>
                </select>
                <input type="text" value={rule.value} onChange={e => setRules(prev => prev.map(r => r.id === rule.id ? { ...r, value: e.target.value } : r))} className="scale-input w-20 text-[13px]" data-testid={`input-rule-val-${i}`} />
                <span className="text-[12px] font-medium text-[#9999AA]">THEN</span>
                <select value={rule.action} onChange={e => setRules(prev => prev.map(r => r.id === rule.id ? { ...r, action: e.target.value } : r))} className="scale-input w-44 text-[13px]" data-testid={`select-rule-act-${i}`}>
                  <option value="auto_approve">Auto-approve</option>
                  <option value="escalate_to_human">Escalate to human</option>
                  <option value="reject_refund">Reject refund</option>
                </select>
                <button onClick={() => setRules(prev => prev.filter(r => r.id !== rule.id))} className="text-[#9999AA] hover:text-[#DC2626]"><X size={13} /></button>
              </div>
            ))}
          </div>
          <button onClick={() => setRules(prev => [...prev, { id: `r-${Date.now()}`, condition: 'order_value_above', value: '', action: 'escalate_to_human' }])} className="scale-btn-ghost mt-3 text-[13px]"><Plus size={13} /> Add rule</button>
          <button className="scale-btn-primary text-[13px] mt-3 ml-3" data-testid="button-save-rules">Save rules</button>
        </div>

        {/* Test */}
        <div className="scale-card">
          <h3 className="text-[15px] font-medium text-[#1A1A3E] mb-4">Test a scenario</h3>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div>
              <label className="block text-[12px] text-[#6B6B80] mb-1">Order value (DZD)</label>
              <input type="number" value={testValues.value} onChange={e => setTestValues(p => ({ ...p, value: e.target.value }))} className="scale-input" placeholder="e.g. 1500" data-testid="input-test-value" />
            </div>
            <div>
              <label className="block text-[12px] text-[#6B6B80] mb-1">Customer type</label>
              <select value={testValues.type} onChange={e => setTestValues(p => ({ ...p, type: e.target.value }))} className="scale-input" data-testid="select-test-type">
                <option value="new">New customer</option>
                <option value="returning">Returning customer</option>
              </select>
            </div>
            <div>
              <label className="block text-[12px] text-[#6B6B80] mb-1">Days since purchase</label>
              <input type="number" value={testValues.days} onChange={e => setTestValues(p => ({ ...p, days: e.target.value }))} className="scale-input" placeholder="e.g. 12" data-testid="input-test-days" />
            </div>
          </div>
          <button onClick={runTest} className="scale-btn-secondary text-[13px]" data-testid="button-run-test">Run test</button>
          {testResult && (
            <div className="mt-3 p-3 border border-[#E4E4E8] rounded-md text-[13px] text-[#1A1A3E]" data-testid="div-test-result">
              <strong>AI decision:</strong> {testResult}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
