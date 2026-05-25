import { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { ScaleBadge } from '@/components/ui/ScaleBadge';
import { Check } from 'lucide-react';

const DEFAULT_PLANS = [
  { id: 'freelancer', name: 'Freelancer', price: '20', seats: '10', messages: '200000', enabled: true },
  { id: 'ecommerce', name: 'E-commerce', price: '30', seats: '25', messages: '500000', enabled: true },
  { id: 'edu', name: 'Edu Centers', price: '50', seats: '999', messages: '1000000', enabled: true },
];

export default function AdminBillingPage() {
  const [plans, setPlans] = useState(DEFAULT_PLANS);
  const [defaultCurrency, setDefaultCurrency] = useState('USD');
  const [trialDays, setTrialDays] = useState('14');
  const [invoicePrefix, setInvoicePrefix] = useState('SCL');
  const [taxRate, setTaxRate] = useState('19');
  const [provider, setProvider] = useState('stripe');
  const [webhookUrl, setWebhookUrl] = useState('https://api.scale.dz/webhooks/billing');

  const updatePlan = (id: string, field: 'price' | 'seats' | 'messages', value: string) => {
    setPlans(prev => prev.map(p => (p.id === id ? { ...p, [field]: value } : p)));
  };

  const togglePlan = (id: string) => {
    setPlans(prev => prev.map(p => (p.id === id ? { ...p, enabled: !p.enabled } : p)));
  };

  return (
    <AppShell title="Billing settings">
      <p className="text-[14px] text-[#6B6B80] mb-6">
        Configure subscription plans and payment infrastructure for all workspaces on the platform.
      </p>
      <div className="max-w-4xl space-y-8">
        <section>
          <h2 className="text-[15px] font-semibold text-[#1A1A3E] mb-1">Plan catalog</h2>
          <p className="text-[13px] text-[#6B6B80] mb-4">
            Plans shown to business owners when they subscribe or upgrade. Changes apply to new checkouts.
          </p>
          <div className="space-y-3">
            {plans.map(plan => (
              <div key={plan.id} className="scale-card" data-testid={`admin-plan-${plan.id}`}>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="text-[15px] font-medium text-[#1A1A3E]">{plan.name}</div>
                    <div className="text-[13px] text-[#6B6B80] mt-0.5">Public plan · billed monthly</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <ScaleBadge variant={plan.enabled ? 'success' : 'default'}>
                      {plan.enabled ? 'Active' : 'Hidden'}
                    </ScaleBadge>
                    <button
                      type="button"
                      className="scale-btn-ghost text-[13px]"
                      onClick={() => togglePlan(plan.id)}
                      data-testid={`button-toggle-plan-${plan.id}`}
                    >
                      {plan.enabled ? 'Hide plan' : 'Activate plan'}
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[13px] font-medium text-[#1A1A3E] mb-1.5">Price (USD/mo)</label>
                    <input
                      type="number"
                      value={plan.price}
                      onChange={e => updatePlan(plan.id, 'price', e.target.value)}
                      className="scale-input w-full"
                      data-testid={`input-plan-price-${plan.id}`}
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-[#1A1A3E] mb-1.5">Seat cap</label>
                    <input
                      type="number"
                      value={plan.seats}
                      onChange={e => updatePlan(plan.id, 'seats', e.target.value)}
                      className="scale-input w-full"
                      data-testid={`input-plan-seats-${plan.id}`}
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-[#1A1A3E] mb-1.5">Messages / month</label>
                    <input
                      type="number"
                      value={plan.messages}
                      onChange={e => updatePlan(plan.id, 'messages', e.target.value)}
                      className="scale-input w-full"
                      data-testid={`input-plan-messages-${plan.id}`}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button type="button" className="scale-btn-primary mt-4 text-[13px]" data-testid="button-save-plans">
            Save plan catalog
          </button>
        </section>

        <section className="scale-card max-w-2xl">
          <h2 className="text-[15px] font-semibold text-[#1A1A3E] mb-4">Billing defaults</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-medium text-[#1A1A3E] mb-1.5">Default currency</label>
              <select value={defaultCurrency} onChange={e => setDefaultCurrency(e.target.value)} className="scale-input w-full" data-testid="select-default-currency">
                <option value="USD">USD</option>
                <option value="DZD">DZD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[#1A1A3E] mb-1.5">Free trial (days)</label>
              <input type="number" value={trialDays} onChange={e => setTrialDays(e.target.value)} className="scale-input w-full" data-testid="input-trial-days" />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[#1A1A3E] mb-1.5">Invoice prefix</label>
              <input type="text" value={invoicePrefix} onChange={e => setInvoicePrefix(e.target.value)} className="scale-input w-full" data-testid="input-invoice-prefix" />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[#1A1A3E] mb-1.5">Default tax rate (%)</label>
              <input type="number" value={taxRate} onChange={e => setTaxRate(e.target.value)} className="scale-input w-full" data-testid="input-tax-rate" />
            </div>
          </div>
          <button type="button" className="scale-btn-secondary mt-4 text-[13px]" data-testid="button-save-billing-defaults">
            Save defaults
          </button>
        </section>

        <section className="scale-card max-w-2xl">
          <h2 className="text-[15px] font-semibold text-[#1A1A3E] mb-1">Payment provider</h2>
          <p className="text-[13px] text-[#6B6B80] mb-4">Platform-wide checkout integration. Business owners never see these keys.</p>
          <div className="space-y-4">
            <div>
              <label className="block text-[13px] font-medium text-[#1A1A3E] mb-1.5">Provider</label>
              <select value={provider} onChange={e => setProvider(e.target.value)} className="scale-input w-full max-w-xs" data-testid="select-payment-provider">
                <option value="stripe">Stripe</option>
                <option value="chargily">Chargily Pay</option>
              </select>
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[#1A1A3E] mb-1.5">Webhook URL</label>
              <input type="url" value={webhookUrl} onChange={e => setWebhookUrl(e.target.value)} className="scale-input w-full" data-testid="input-webhook-url" />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[#1A1A3E] mb-1.5">Secret key</label>
              <input type="password" value="sk_live_••••••••••••4242" readOnly className="scale-input w-full" data-testid="input-provider-secret" />
              <p className="text-[12px] text-[#9999AA] mt-1.5 flex items-center gap-1">
                <Check size={12} className="text-[#16A34A]" /> Connected · rotate in production dashboard
              </p>
            </div>
          </div>
          <button type="button" className="scale-btn-secondary mt-4 text-[13px]" data-testid="button-save-provider">
            Save provider settings
          </button>
        </section>
      </div>
    </AppShell>
  );
}
