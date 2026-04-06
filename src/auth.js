const crypto = require('node:crypto');
const { API_ACCESS_KEY, WEB_LOGIN_PASSWORD, SESSION_COOKIE_NAME } = require('./config');

const sessions = new Map();
const SESSION_TTL_MS = 1000 * 60 * 60 * 12;

function parseCookies(header = '') {
  return header.split(';').reduce((acc, pair) => {
    const index = pair.indexOf('=');
    if (index === -1) return acc;
    const key = pair.slice(0, index).trim();
    const value = pair.slice(index + 1).trim();
    acc[key] = decodeURIComponent(value);
    return acc;
  }, {});
}

function createSession() {
  const token = crypto.randomBytes(24).toString('hex');
  sessions.set(token, { createdAt: Date.now() });
  return token;
}

function cleanupSessions() {
  const now = Date.now();
  for (const [token, session] of sessions.entries()) {
    if (now - session.createdAt > SESSION_TTL_MS) sessions.delete(token);
  }
}

function buildCookie(token, req) {
  const isSecure = req.secure || req.headers['x-forwarded-proto'] === 'https';
  const sameSite = isSecure ? 'None' : 'Lax';
  return `${SESSION_COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=${sameSite}; Max-Age=${SESSION_TTL_MS / 1000}${isSecure ? '; Secure' : ''}`;
}

function clearCookie(req) {
  const isSecure = req.secure || req.headers['x-forwarded-proto'] === 'https';
  const sameSite = isSecure ? 'None' : 'Lax';
  return `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=${sameSite}; Max-Age=0${isSecure ? '; Secure' : ''}`;
}

function requireLogin(req, res, next) {
  cleanupSessions();
  const cookies = parseCookies(req.headers.cookie || '');
  const token = cookies[SESSION_COOKIE_NAME];
  if (!token || !sessions.has(token)) {
    return res.status(401).json({ ok: false, message: '未登录或登录已过期' });
  }
  next();
}

function requireApiKey(req, res, next) {
  const auth = req.headers.authorization || '';
  const bearer = auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';
  const headerKey = req.headers['x-api-key'];
  const provided = headerKey || bearer;
  if (provided !== API_ACCESS_KEY) {
    return res.status(401).json({ ok: false, message: 'API 密钥无效' });
  }
  next();
}

function loginHandler(req, res) {
  const password = req.body?.password;
  if (password !== WEB_LOGIN_PASSWORD) {
    return res.status(401).json({ ok: false, message: '登录密码错误' });
  }
  const token = createSession();
  res.setHeader('Set-Cookie', buildCookie(token, req));
  res.json({ ok: true, message: '登录成功' });
}

function logoutHandler(req, res) {
  res.setHeader('Set-Cookie', clearCookie(req));
  res.json({ ok: true });
}

function meHandler(req, res) {
  cleanupSessions();
  const cookies = parseCookies(req.headers.cookie || '');
  const token = cookies[SESSION_COOKIE_NAME];
  res.json({ ok: true, loggedIn: !!(token && sessions.has(token)) });
}

module.exports = {
  requireLogin,
  requireApiKey,
  loginHandler,
  logoutHandler,
  meHandler,
};
