const { FIRECRAWL_BASE_URL } = require('./config');
const { nextKey, listKeysWithSecrets, updateKey } = require('./store');
const logger = require('./logger');

const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
};

async function firecrawlFetch(path, { method = 'GET', body, keyRecord, query } = {}) {
  const activeKey = keyRecord || nextKey();
  const url = new URL(path, FIRECRAWL_BASE_URL);
  if (query && typeof query === 'object') {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v));
    }
  }

  logger.info('Proxy request started', {
    path: url.pathname + url.search,
    method,
    key: activeKey.maskedKey,
  });

  const response = await fetch(url, {
    method,
    headers: {
      ...DEFAULT_HEADERS,
      Authorization: `Bearer ${activeKey.key}`,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }

  updateKey(activeKey.id, {
    lastStatus: response.ok ? 'ok' : 'error',
    lastError: response.ok ? null : data?.error || data?.message || `HTTP ${response.status}`,
  });

  if (!response.ok) {
    logger.error('Proxy request failed', {
      path: url.pathname + url.search,
      status: response.status,
      key: activeKey.maskedKey,
      body: data,
    });
  } else {
    logger.info('Proxy request completed', {
      path: url.pathname + url.search,
      status: response.status,
      key: activeKey.maskedKey,
    });
  }

  return {
    ok: response.ok,
    status: response.status,
    data,
    key: activeKey,
  };
}

async function queryUsageForKey(keyRecord) {
  const [creditUsage, tokenUsage] = await Promise.allSettled([
    firecrawlFetch('/v2/team/credit-usage', { keyRecord }),
    firecrawlFetch('/v2/team/token-usage', { keyRecord }),
  ]);

  return {
    id: keyRecord.id,
    maskedKey: keyRecord.maskedKey,
    fingerprint: keyRecord.fingerprint,
    lastUsedAt: keyRecord.lastUsedAt,
    requestCount: keyRecord.requestCount,
    lastStatus: keyRecord.lastStatus,
    lastError: keyRecord.lastError,
    creditUsage: creditUsage.status === 'fulfilled' ? creditUsage.value.data : { error: creditUsage.reason.message },
    tokenUsage: tokenUsage.status === 'fulfilled' ? tokenUsage.value.data : { error: tokenUsage.reason.message },
  };
}

async function buildDashboardOverview() {
  const keys = listKeysWithSecrets();
  const perKey = await Promise.all(keys.map((key) => queryUsageForKey(key)));

  const aggregate = perKey.reduce((acc, item) => {
    const credit = item.creditUsage || {};
    const token = item.tokenUsage || {};
    acc.keyCount += 1;
    acc.remainingCredits += Number(credit.remainingCredits || 0);
    acc.remainingTokens += Number(token.remainingTokens || 0);
    acc.totalRequests += Number(item.requestCount || 0);
    return acc;
  }, {
    keyCount: 0,
    remainingCredits: 0,
    remainingTokens: 0,
    totalRequests: 0,
  });

  return { aggregate, perKey };
}

module.exports = {
  firecrawlFetch,
  buildDashboardOverview,
};
