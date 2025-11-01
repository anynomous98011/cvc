// Lightweight smoke test script for production deployment
// Usage:
//   BASE_URL="https://your-deploy.vercel.app" BYPASS_TOKEN="..." node scripts/smoke-test.js

const BASE_URL = process.env.BASE_URL || 'https://cvc-evb3pi2io-ritiks-projects-337eed7f.vercel.app';
const BYPASS = process.env.BYPASS_TOKEN || '';

function buildUrl(path) {
  const url = new URL(path, BASE_URL);
  if (BYPASS) {
    url.searchParams.set('x-vercel-set-bypass-cookie', 'true');
    url.searchParams.set('x-vercel-protection-bypass', BYPASS);
  }
  return url.toString();
}

async function check(path, opts = {}) {
  const url = buildUrl(path);
  try {
    const res = await fetch(url, { method: opts.method || 'GET', headers: opts.headers || {} });
    const ct = res.headers.get('content-type') || '';
    console.log(`${path} -> ${res.status} ${res.statusText} - content-type: ${ct}`);
    return { ok: res.ok, status: res.status, headers: res.headers };
  } catch (err) {
    console.error(`${path} -> request failed:`, err.message || err);
    return { ok: false, error: err };
  }
}

(async () => {
  console.log('Running smoke tests against', BASE_URL);
  if (BYPASS) console.log('Using Vercel bypass token');

  const checks = [
    '/',
    '/auth/login',
    '/auth/signup',
    '/api/scraper/latest',
    '/api/scraper/subscribe'
  ];

  let failed = false;
  for (const p of checks) {
    const r = await check(p);
    if (!r.ok) failed = true;
    // For SSE endpoint, also show whether it returns event-stream header
    if (p === '/api/scraper/subscribe' && r.headers) {
      const ct = r.headers.get('content-type') || '';
      console.log('  SSE content-type header:', ct);
    }
  }

  if (failed) {
    console.error('\nOne or more checks failed. If you see 401 responses, your deployment is protected by Vercel.');
    console.error('To allow automated testing either:');
    console.error('  - Disable deployment protection in the Vercel dashboard, OR');
    console.error('  - Provide a Vercel bypass token as BYPASS_TOKEN env var when running this script.');
    process.exit(2);
  }

  console.log('\nAll checks passed (HTTP OK).');
  process.exit(0);
})();
