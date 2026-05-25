/**
 * Creates demo tester accounts in Supabase Auth + profiles.
 * Run from repo root: node scripts/seed-demo-users.mjs
 *
 * Requires in .env: VITE_SUPABASE_URL, SUPABASE_SECRET_KEY (service role)
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

function loadEnv() {
  const path = resolve(root, '.env');
  if (!existsSync(path)) return {};
  const text = readFileSync(path, 'utf8');
  const out = {};
  for (const line of text.split('\n')) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) out[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
  }
  return out;
}

const env = loadEnv();
const url = env.VITE_SUPABASE_URL;
const serviceKey = env.SUPABASE_SECRET_KEY;

if (!url || !serviceKey) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SECRET_KEY in .env');
  process.exit(1);
}

const supabase = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

const PASSWORD = 'ScaleDemo2026!';
const DEMO_ORG_SLUG = 'demo';
const DEMO_ORG_NAME = 'Demo Business';

async function ensureUser(email, metadata) {
  const { data: list } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  const existing = list?.users?.find(u => u.email?.toLowerCase() === email.toLowerCase());
  if (existing) {
    await supabase.auth.admin.updateUserById(existing.id, { password: PASSWORD, email_confirm: true });
    return existing.id;
  }
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: metadata,
  });
  if (error) throw error;
  return data.user.id;
}

async function ensureOrg(slug, name) {
  const { data: org } = await supabase.from('organizations').select('id').eq('slug', slug).maybeSingle();
  if (org?.id) return org.id;
  const { data, error } = await supabase.from('organizations').insert({ name, slug }).select('id').single();
  if (error) throw error;
  return data.id;
}

async function setProfile(userId, { name, email, role, orgId, localHandle }) {
  const { error } = await supabase.from('profiles').upsert({
    id: userId,
    name,
    email,
    role,
    org_id: orgId,
    local_handle: localHandle ?? null,
    status: 'active',
  });
  if (error) throw error;
}

async function seedOrgDefaults(orgId) {
  await supabase.from('refund_policy').upsert({ org_id: orgId });
  await supabase.from('intervention_settings').upsert({ org_id: orgId });
  await supabase.from('billing').upsert({ org_id: orgId });
  const agents = [
    { agent_id: 'followup', agent_name: 'Lead Follow-Up', tone: 'friendly' },
    { agent_id: 'chat', agent_name: 'Client Chat', tone: 'professional' },
    { agent_id: 'tracking', agent_name: 'Order Tracking', tone: 'direct' },
    { agent_id: 'refund', agent_name: 'Refund', tone: 'empathetic' },
  ];
  for (const a of agents) {
    await supabase.from('automation_agent_configs').upsert({ org_id: orgId, ...a, enabled: true });
  }
}

async function main() {
  const orgId = await ensureOrg(DEMO_ORG_SLUG, DEMO_ORG_NAME);
  await seedOrgDefaults(orgId);

  const ownerId = await ensureUser('owner@scale.test', { name: 'Demo Owner', role: 'owner' });
  await setProfile(ownerId, { name: 'Demo Owner', email: 'owner@scale.test', role: 'owner', orgId });

  const adminId = await ensureUser('admin@scale.test', { name: 'Platform Admin', role: 'admin' });
  await setProfile(adminId, { name: 'Platform Admin', email: 'admin@scale.test', role: 'admin', orgId });

  const agentId = await ensureUser('karim@demo.scale', { name: 'Karim Agent', role: 'agent' });
  await setProfile(agentId, {
    name: 'Karim Agent',
    email: 'karim@demo.scale',
    role: 'agent',
    orgId,
    localHandle: 'karim',
  });

  console.log('Demo accounts ready (password: ScaleDemo2026!):');
  console.log('  admin@scale.test     — platform admin');
  console.log('  owner@scale.test     — business owner');
  console.log('  karim@demo.scale     — sales agent');
  console.log(`  Org: ${DEMO_ORG_NAME} (slug: ${DEMO_ORG_SLUG})`);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
