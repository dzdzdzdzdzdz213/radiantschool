/**
 * Seed script for demo accounts
 * 
 * Run: node scripts/seed-demo.mjs
 * 
 * Prerequisites:
 * 1. Get your Supabase service_role key from:
 *    Supabase Dashboard → Project Settings → API → service_role key
 * 2. Set it as env var: $env:SUPABASE_SERVICE_KEY = "your-key-here"
 * 3. Or edit the variables below directly (not recommended for production)
 */

const SUPABASE_URL = 'https://kaoxcbqhuwhtadpgccjp.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';

if (!SERVICE_KEY) {
  console.error('❌ Missing SUPABASE_SERVICE_KEY environment variable');
  console.error('   Run: $env:SUPABASE_SERVICE_KEY = "your-service-role-key"');
  console.error('   Get it from: Supabase Dashboard → Project Settings → API');
  process.exit(1);
}

const DEMO_USERS = [
  { email: 'etudiant@demo.dz', password: 'demo123', firstName: 'Ahmed', lastName: 'Demo', role: 'student' },
  { email: 'prof@demo.dz', password: 'demo123', firstName: 'Sami', lastName: 'Demo', role: 'teacher' },
  { email: 'assistant@demo.dz', password: 'demo123', firstName: 'Leila', lastName: 'Demo', role: 'assistant' },
  { email: 'admin@demo.dz', password: 'demo123', firstName: 'Admin', lastName: 'Demo', role: 'admin' },
];

async function createUser(user) {
  // 1. Create auth user via admin API
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
    },
    body: JSON.stringify({
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: {
        first_name: user.firstName,
        last_name: user.lastName,
        role: user.role,
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error(`✗ ${user.email}: ${res.status} ${body}`);
    return null;
  }

  const authUser = await res.json();
  const userId = authUser.id;

  // 2. Create profile in public.users
  const { error: profileError } = await supabase
    .from('users')
    .insert({
      id: userId,
      email: user.email,
      first_name: user.firstName,
      last_name: user.lastName,
      role: user.role,
      status: 'active',
      email_verified: true,
    });

  if (profileError) {
    console.error(`✗ ${user.email}: profile insert failed - ${profileError.message}`);
    return null;
  }

  // 3. Create role-specific record
  if (user.role === 'student') {
    const regNumber = `STU-DEMO-${userId.slice(0, 8)}`;
    await supabase.from('students').insert({
      id: userId,
      student_type: 'regular',
      registration_number: regNumber,
    });
  } else if (user.role === 'teacher') {
    await supabase.from('teachers').insert({ id: userId });
  } else if (user.role === 'assistant') {
    await supabase.from('assistants').insert({ id: userId });
  }

  return { email: user.email, id: userId };
}

async function main() {
  console.log('🚀 Creating demo accounts...\n');

  for (const user of DEMO_USERS) {
    const result = await createUser(user);
    if (result) {
      console.log(`✓ ${result.email} (${result.id.slice(0, 8)}...)`);
    }
  }

  console.log('\n✅ Done!');
  console.log('\nLogin credentials:');
  DEMO_USERS.forEach(u => {
    console.log(`  ${u.email.padEnd(25)} demo123  →  ${u.role}`);
  });
}

main().catch(console.error);
