/**
 * Turn common misconfigurations into a valid origin (e.g. "5000", "localhost:5000").
 * @param {string} raw
 * @returns {string | null}
 */
function normalizeOrigin(raw) {
  const s = String(raw ?? '')
    .trim()
    .replace(/\/$/, '');
  if (!s) return null;
  if (/^https?:\/\//i.test(s)) {
    try {
      new URL(s);
      return s;
    } catch {
      return null;
    }
  }
  if (/^\d+$/.test(s)) return `http://localhost:${s}`;
  if (/^:\d+$/.test(s)) return `http://localhost${s}`;
  if (/^[a-zA-Z0-9][a-zA-Z0-9.-]*:\d+$/.test(s)) return `http://${s}`;
  try {
    const u = new URL(`http://${s}`);
    if (u.hostname && u.port) return `${u.protocol}//${u.host}`;
  } catch {
    /* ignore */
  }
  return null;
}

/**
 * Resolves the app origin for Playwright when baseURL is missing from config
 * (e.g. wrong --config, different cwd, or CI without env).
 */
function getBaseUrl() {
  const candidates = [
    process.env.PLAYWRIGHT_BASE_URL,
    process.env.PLAYWRIGHT_TEST_BASE_URL,
    process.env.BASE_URL,
    process.env.TEST_BASE_URL,
  ];
  for (const c of candidates) {
    const n = normalizeOrigin(c);
    if (n) return n;
  }
  const port = Number(process.env.PORT);
  const p = Number.isFinite(port) && port > 0 ? port : 5000;
  return `http://localhost:${p}`;
}

/**
 * @param {string} pathOrUrl - e.g. "/Home.html" or full URL
 */
function resolveUrl(pathOrUrl) {
  if (!pathOrUrl) return getBaseUrl() + '/';
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const base = getBaseUrl();
  const path = pathOrUrl.startsWith('/') ? pathOrUrl : '/' + pathOrUrl;
  return new URL(path, base + '/').href;
}

module.exports = { getBaseUrl, resolveUrl };
