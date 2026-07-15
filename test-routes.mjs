import { chromium } from 'playwright';

const BASE = 'http://localhost:3001';
const PW = 'demo123';

const USERS = [
  { role: 'admin',    email: 'demo.admin@radiant-academy.xyz' },
  { role: 'assistant',email: 'demo.assistant@radiant-academy.xyz' },
  { role: 'teacher',  email: 'demo.prof@radiant-academy.xyz' },
  { role: 'student',  email: 'demo.etudiant@radiant-academy.xyz' },
];

const ROUTES_BY_ROLE = {
  admin:     ['dashboard','users','courses','attendance','payments','invoices','reports','messages','schedule','profile','settings','help'],
  assistant: ['dashboard','students','parents','registrations','attendance','payments','invoices','messages','schedule','reports','profile'],
  teacher:   ['dashboard','courses','schedule','calendar','students','private-lessons','profile','messages','attendance','assignments','homework','resources','online-classes','vip-classes','announcements','reports','revenue','reviews'],
  student:   ['dashboard','enroll','courses','schedule','calendar','attendance','payments','invoices','messages','profile'],
};

const publicPages = ['/','/login','/staff/login','/enroll','/forgot-password','/mentions-legales','/cgv','/confidentialite','/faq','/contact','/formations','/teachers','/leaderboard'];

let apiErrors = [];

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  page.on('response', resp => {
    if (resp.status() >= 400 && !resp.url().includes('supabase.co/auth')) {
      apiErrors.push(`[${resp.status()}] ${resp.request().method()} ${decodeURIComponent(resp.url())}`);
    }
  });

  // Just login and check routes slowly to catch all API errors
  for (const user of USERS) {
    console.log(`\n=== ${user.role.toUpperCase()} ===`);

    await page.goto(BASE + '/login', { waitUntil: 'domcontentloaded', timeout: 10000 });
    await page.waitForTimeout(1500);

    const emailInput = page.locator('input[type="email"]');
    const passInput = page.locator('input[type="password"]');
    if ((await emailInput.count()) === 0) { console.log('Cannot find login form'); continue; }

    await emailInput.fill(user.email);
    await passInput.fill(PW);
    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(2000);

    const url = page.url();
    if (url.includes('login')) { console.log('Login failed'); continue; }
    console.log(`  Logged in: ${url}`);

    const prefix = `/${user.role}`;
    for (const route of ROUTES_BY_ROLE[user.role]) {
      const target = BASE + prefix + '/' + route;
      process.stdout.write(`  ${route}... `);
      try {
        await page.goto(target, { waitUntil: 'domcontentloaded', timeout: 8000 });
        await page.waitForTimeout(2000);
        const body = await page.locator('body').textContent().catch(() => '');
        if (body.includes('🚧') || body.includes('Page en cours')) {
          console.log('⚠️  ComingSoon');
        } else if (body.includes('404') || body.includes('Not Found')) {
          console.log('❌ 404');
        } else {
          console.log('✅');
        }
      } catch (e) {
        console.log(`❌ ${e.message.slice(0, 60)}`);
      }
    }
  }

  console.log(`\n=== API ERRORS (${apiErrors.length}) ===`);
  const unique = [...new Set(apiErrors)];
  for (const e of unique) console.log(`  ${e}`);

  await browser.close();
})();
