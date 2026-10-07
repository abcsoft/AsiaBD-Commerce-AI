#!/usr/bin/env node
/**
 * End-to-end smoke test for AsiaBD Commerce AI (with authentication).
 *
 * Usage:
 *   1. Start the server:  npm run build && npm start -- -p 3366
 *   2. Run:               SMOKE_BASE=http://localhost:3366 npm run smoke
 */

const BASE = process.env.SMOKE_BASE ?? 'http://localhost:3366';

const results = [];

function record(name, ok, detail = '') {
  results.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  — ${detail}` : ''}`);
}

/** Minimal cookie jar. */
function makeJar() {
  return { cookies: {} };
}

function jarHeader(jar) {
  const entries = Object.entries(jar.cookies);
  return entries.length
    ? entries.map(([k, v]) => `${k}=${v}`).join('; ')
    : '';
}

function absorbCookies(jar, res) {
  const setCookies = res.headers.getSetCookie?.() ?? [];
  for (const c of setCookies) {
    const [pair] = c.split(';');
    const eq = pair.indexOf('=');
    if (eq === -1) continue;
    const name = pair.slice(0, eq).trim();
    const value = pair.slice(eq + 1).trim();
    if (name) jar.cookies[name] = value;
  }
}

async function request(path, options = {}, jar = null) {
  const headers = { ...(options.headers ?? {}) };
  if (jar) {
    const cookie = jarHeader(jar);
    if (cookie) headers.cookie = cookie;
  }

  const res = await fetch(BASE + path, {
    redirect: 'manual',
    ...options,
    headers,
  });

  if (jar) absorbCookies(jar, res);
  return res;
}

const REDIRECT_STATUSES = [301, 302, 303, 307, 308];

async function checkPage(path, expectText, jar) {
  try {
    const res = await request(path, {}, jar);
    const body = await res.text();
    const ok =
      res.status === 200 && (!expectText || body.includes(expectText));
    record(
      `GET ${path}`,
      ok,
      `status=${res.status}${expectText && !body.includes(expectText) ? ' (missing expected text)' : ''}`
    );
  } catch (err) {
    record(`GET ${path}`, false, String(err));
  }
}

const main = async () => {
  console.log(`Smoke testing ${BASE}\n`);

  // ------------------------------------------------------------------
  // 1. Unauthenticated: app is gated
  // ------------------------------------------------------------------
  const anon = makeJar();
  try {
    const res = await request('/dashboard', {}, anon);
    const location = res.headers.get('location') ?? '';
    record(
      'anon GET /dashboard → redirect to /signin',
      REDIRECT_STATUSES.includes(res.status) && location.includes('/signin'),
      `status=${res.status} location=${location}`
    );
  } catch (err) {
    record('anon GET /dashboard → redirect to /signin', false, String(err));
  }

  try {
    const res = await request('/api/overview', {}, anon);
    record('anon GET /api/overview → 401', res.status === 401, `status=${res.status}`);
  } catch (err) {
    record('anon GET /api/overview → 401', false, String(err));
  }

  // ------------------------------------------------------------------
  // 2. Public pages still work
  // ------------------------------------------------------------------
  await checkPage('/', 'AsiaBD', null);
  await checkPage('/pricing', 'Pricing', null);
  await checkPage('/about', 'AsiaBD Commerce AI', null);
  await checkPage('/contact', 'Get in touch', null);
  await checkPage('/privacy', 'Privacy', null);
  await checkPage('/terms', 'Terms', null);
  await checkPage('/refund-policy', 'Refund', null);
  await checkPage('/ai-disclosure', 'AI', null);
  await checkPage('/signin', 'Sign In', null);
  await checkPage('/signup', 'Sign Up', null);

  // ------------------------------------------------------------------
  // 3. Sign up a fresh account
  // ------------------------------------------------------------------
  const jar = makeJar();
  const email = `smoke+${Date.now()}@asiabd.shop`;
  try {
    const res = await request(
      '/api/auth/signup',
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          firstName: 'Smoke',
          lastName: 'Test',
          email,
          password: 'smoke-test-123',
        }),
      },
      jar
    );
    const data = await res.json();
    const ok =
      res.status === 200 &&
      data?.user?.email === email &&
      Boolean(jar.cookies.asiabd_auth);
    record('POST /api/auth/signup', ok, `status=${res.status} email=${email}`);
  } catch (err) {
    record('POST /api/auth/signup', false, String(err));
  }

  // Duplicate email → 409
  try {
    const res = await request('/api/auth/signup', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        firstName: 'Smoke',
        lastName: 'Test',
        email,
        password: 'smoke-test-123',
      }),
    });
    record('POST /api/auth/signup (duplicate) → 409', res.status === 409, `status=${res.status}`);
  } catch (err) {
    record('POST /api/auth/signup (duplicate) → 409', false, String(err));
  }

  // Wrong password → 401
  try {
    const res = await request('/api/auth/signin', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password: 'wrong-password' }),
    });
    record('POST /api/auth/signin (wrong pw) → 401', res.status === 401, `status=${res.status}`);
  } catch (err) {
    record('POST /api/auth/signin (wrong pw) → 401', false, String(err));
  }

  // ------------------------------------------------------------------
  // 4. Authenticated app flow
  // ------------------------------------------------------------------
  await checkPage('/dashboard', 'Dashboard', jar);
  await checkPage('/tools', 'toolkit', jar);
  await checkPage('/tools/product-title-generator', 'Product Title Generator', jar);
  await checkPage('/library', 'library', jar);

  let creditsBefore = null;
  try {
    const res = await request('/api/overview', {}, jar);
    const data = await res.json();
    creditsBefore = data.credits;
    record(
      'GET /api/overview (auth)',
      res.status === 200 && typeof data.credits === 'number' && data.user?.email === email,
      `credits=${data.credits} demo=${data.demoMode} user=${data.user?.email}`
    );
  } catch (err) {
    record('GET /api/overview (auth)', false, String(err));
  }

  let balanceAfter = null;
  try {
    const res = await request(
      '/api/generate',
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          toolId: 'product-title-generator',
          inputs: { productName: 'Smoke Test Widget', marketplace: 'etsy' },
        }),
      },
      jar
    );
    const data = await res.json();
    const titles = data?.output?.titles?.length ?? 0;
    balanceAfter = data?.balance;
    record(
      'POST /api/generate (demo, auth)',
      res.status === 200 && titles >= 2 && typeof data.cost === 'number',
      `status=${res.status} titles=${titles} cost=${data.cost} balance=${data.balance}`
    );
  } catch (err) {
    record('POST /api/generate (demo, auth)', false, String(err));
  }

  try {
    const res = await request('/api/overview', {}, jar);
    const data = await res.json();
    record(
      'credits deducted correctly',
      data.credits === balanceAfter && balanceAfter !== null,
      `before=${creditsBefore} after=${data.credits}`
    );
  } catch (err) {
    record('credits deducted correctly', false, String(err));
  }

  let savedId = null;
  try {
    const res = await request(
      '/api/library',
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          toolId: 'product-title-generator',
          title: 'Smoke test item',
          content: JSON.stringify({ titles: [{ text: 'Smoke' }] }),
          marketplace: 'etsy',
          tags: ['smoke'],
        }),
      },
      jar
    );
    const data = await res.json();
    savedId = data?.item?.id ?? null;
    record('POST /api/library (save)', res.status === 200 && Boolean(savedId), `id=${savedId}`);
  } catch (err) {
    record('POST /api/library (save)', false, String(err));
  }

  try {
    const res = await request('/api/library?q=Smoke', {}, jar);
    const data = await res.json();
    const found =
      Array.isArray(data.items) && data.items.some((i) => i.id === savedId);
    record('GET /api/library (list)', res.status === 200 && found, `items=${data.items?.length}`);
  } catch (err) {
    record('GET /api/library (list)', false, String(err));
  }

  if (savedId) {
    try {
      const res = await request(`/api/library/${savedId}`, { method: 'DELETE' }, jar);
      record('DELETE /api/library/[id]', res.status === 200, `status=${res.status}`);
    } catch (err) {
      record('DELETE /api/library/[id]', false, String(err));
    }
  }

  // ------------------------------------------------------------------
  // 5. Sign out invalidates the session
  // ------------------------------------------------------------------
  try {
    const res = await request('/api/auth/signout', { method: 'POST' }, jar);
    record('POST /api/auth/signout', res.status === 200, `status=${res.status}`);
  } catch (err) {
    record('POST /api/auth/signout', false, String(err));
  }

  // Reuse the same (stale) cookie value — the server-side session is gone.
  try {
    const res = await request('/api/overview', {}, jar);
    record('stale cookie GET /api/overview → 401', res.status === 401, `status=${res.status}`);
  } catch (err) {
    record('stale cookie GET /api/overview → 401', false, String(err));
  }

  try {
    const res = await request('/dashboard', {}, jar);
    const location = res.headers.get('location') ?? '';
    const ok =
      REDIRECT_STATUSES.includes(res.status) && location.includes('/signin');
    record(
      'stale cookie GET /dashboard → /signin',
      ok,
      `status=${res.status} location=${location}`
    );
  } catch (err) {
    record('stale cookie GET /dashboard → /signin', false, String(err));
  }

  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed.`);
  if (failed.length) {
    console.log('\nFailures:');
    failed.forEach((f) => console.log(` - ${f.name} ${f.detail}`));
    process.exit(1);
  }
};

main().catch((err) => {
  console.error('Smoke run crashed:', err);
  process.exit(1);
});
