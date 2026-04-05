import { useState } from 'react';
import { SectionBlock, FieldGroup } from './AgentConfigShell';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { ScaleSlider } from '@/components/ui/ScaleSlider';
import { InfoBlock } from '@/components/ui/InfoBlock';

interface LLMConfig {
  provider: string;
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
  responseTimeout?: number;
  holdingMessage?: string;
}

interface LLMConfigSectionProps {
  config: LLMConfig;
  onChange: (c: LLMConfig) => void;
  showChatExtras?: boolean;
  showRefundNote?: boolean;
}

const PROVIDERS = ['OpenAI', 'Anthropic', 'Google Gemini', 'Custom (OpenAI-compatible)'];
const MODELS: Record<string, string[]> = {
  OpenAI: ['gpt-4o', 'gpt-4o-mini', 'custom'],
  Anthropic: ['claude-3-5-sonnet', 'claude-3-5-haiku', 'custom'],
  'Google Gemini': ['gemini-1.5-flash', 'gemini-1.5-pro', 'custom'],
  'Custom (OpenAI-compatible)': ['custom'],
};

export function LLMConfigSection({ config, onChange, showChatExtras, showRefundNote }: LLMConfigSectionProps) {
  const models = MODELS[config.provider] ?? MODELS['OpenAI'];

  const set = (patch: Partial<LLMConfig>) => onChange({ ...config, ...patch });

  return (
    <SectionBlock id="llm" title="LLM configuration" description="Configure the language model that powers this agent.">
      {showRefundNote && (
        <div className="mb-4">
          <InfoBlock>
            For refund conversations, set creativity to 0.2 or lower. The agent must be predictable and policy-compliant. Use a strong model (GPT-4o or Claude Sonnet).
          </InfoBlock>
        </div>
      )}

      <div className="scale-card space-y-4">
        <FieldGroup label="AI provider" help="The LLM provider that generates message content.">
          <select value={config.provider} onChange={e => set({ provider: e.target.value, model: MODELS[e.target.value]?.[0] ?? 'gpt-4o' })} className="scale-input w-64">
            {PROVIDERS.map(p => <option key={p}>{p}</option>)}
          </select>
        </FieldGroup>

        <FieldGroup label="API key" help="Stored encrypted. Never displayed after save.">
          <PasswordInput
            value={config.apiKey}
            onChange={v => set({ apiKey: v })}
            placeholder="sk-..."
            showTestButton
          />
        </FieldGroup>

        <FieldGroup label="Model" help="Faster/cheaper models for follow-up sequences are usually fine.">
          {config.model === 'custom' || !models.includes(config.model) ? (
            <input type="text" value={config.model} onChange={e => set({ model: e.target.value })} className="scale-input w-64" placeholder="Enter model name" />
          ) : (
            <select value={config.model} onChange={e => set({ model: e.target.value })} className="scale-input w-64">
              {models.map(m => <option key={m}>{m}</option>)}
            </select>
          )}
        </FieldGroup>

        <FieldGroup label="Creativity" help="Lower = more predictable messages. For follow-ups, keep below 0.5.">
          <div className="w-72">
            <ScaleSlider
              value={config.temperature}
              min={0}
              max={1}
              step={0.1}
              onChange={v => set({ temperature: v })}
              labels={{ left: 'Consistent', center: 'Balanced', right: 'Creative' }}
            />
          </div>
        </FieldGroup>

        <FieldGroup label="Max message length" help="Maximum tokens per generated message. WhatsApp: recommended 120–200.">
          <input type="number" value={config.maxTokens} onChange={e => set({ maxTokens: Number(e.target.value) })} className="scale-input w-32" />
        </FieldGroup>

        {showChatExtras && (
          <>
            <FieldGroup label="Max response time" help="If the model takes longer, a holding message is sent automatically.">
              <div className="flex items-center gap-2">
                <input type="number" value={config.responseTimeout ?? 8} onChange={e => set({ responseTimeout: Number(e.target.value) })} className="scale-input w-24" />
                <span className="text-[13px] text-[#6B6B80]">seconds</span>
              </div>
            </FieldGroup>
            <FieldGroup label="Holding message" help="Sent immediately if the model takes longer than the timeout.">
              <input type="text" value={config.holdingMessage ?? ''} onChange={e => set({ holdingMessage: e.target.value })} className="scale-input" placeholder="Just a moment, let me check that for you! 🙏" />
            </FieldGroup>
          </>
        )}
      </div>
    </SectionBlock>
  );
}
