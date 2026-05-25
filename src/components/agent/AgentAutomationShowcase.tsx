import { Link } from 'wouter';
import { motion, useReducedMotion } from 'framer-motion';
import { AGENT_BRAND, type AgentId } from '@/lib/agent-brand';
import { LEAD_AGENT_SCENARIO } from '@/lib/mock-agent-conversations';
import { MotionStagger, MotionItem } from '@/components/motion';
import { springSnappy } from '@/lib/motion';

const SHOWCASE: { agentId: AgentId; leadId: string; contact: string; blurb: string }[] = [
  {
    agentId: 'followup',
    leadId: 'lead-1',
    contact: 'Mohamed Benali',
    blurb: 'Outbound welcome + pricing follow-up',
  },
  {
    agentId: 'chat',
    leadId: 'lead-6',
    contact: 'Nadia Hamdi',
    blurb: 'FAQ — hours, delivery, returns',
  },
  {
    agentId: 'tracking',
    leadId: 'lead-9',
    contact: 'Mourad Terki',
    blurb: 'Carrier updates & delivery ETA',
  },
  {
    agentId: 'refund',
    leadId: 'lead-7',
    contact: 'Sofiane Meziane',
    blurb: 'Refund request auto-approved',
  },
];

function ShowcaseTile({
  item,
  brand,
}: {
  item: (typeof SHOWCASE)[0];
  brand: (typeof AGENT_BRAND)[AgentId];
}) {
  const reduce = useReducedMotion();
  return (
    <Link href={`/leads/${item.leadId}`}>
      <motion.a
        className="block h-full rounded-xl border p-4 backdrop-blur-sm"
        style={{
          borderColor: `${brand.solid}40`,
          backgroundColor: brand.tint,
          boxShadow: `0 8px 24px ${brand.solid}18`,
        }}
        data-testid={`showcase-agent-${item.agentId}`}
        whileHover={
          reduce
            ? undefined
            : {
                y: -6,
                scale: 1.02,
                boxShadow: `0 16px 40px ${brand.solid}28`,
                transition: springSnappy,
              }
        }
        whileTap={reduce ? undefined : { scale: 0.98 }}
      >
        <div
          className="text-[11px] font-semibold uppercase tracking-widest"
          style={{ color: brand.text }}
        >
          {brand.label}
        </div>
        <div className="mt-2 text-[15px] font-semibold text-[#1A1A3E]">{item.contact}</div>
        <p className="mt-1.5 text-[13px] leading-relaxed text-[#6B6B80]">{item.blurb}</p>
        <span
          className="mt-4 inline-flex items-center gap-1 text-[13px] font-medium"
          style={{ color: brand.solid }}
        >
          Open conversation
          <motion.span
            aria-hidden
            animate={reduce ? undefined : { x: [0, 4, 0] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
          >
            →
          </motion.span>
        </span>
      </motion.a>
    </Link>
  );
}

/** Dashboard strip — open a real thread per automation agent. */
export function AgentAutomationShowcase() {
  return (
    <MotionStagger className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {SHOWCASE.map(item => (
        <MotionItem key={item.agentId}>
          <ShowcaseTile item={item} brand={AGENT_BRAND[item.agentId]} />
        </MotionItem>
      ))}
    </MotionStagger>
  );
}

export function getAgentScenarioLeadIds(): typeof LEAD_AGENT_SCENARIO {
  return LEAD_AGENT_SCENARIO;
}
