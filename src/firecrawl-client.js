const { FIRECRAWL_BASE_URL } = require('./config');
const { nextKey, listKeys, getKeyById, updateKey } = require('./store');
const logger = require('./logger');

const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
};

async function firecrawlFetch(path, { method = 'GET', body, keyRecord, query } = {}) {
  const activeKey = keyRecord || await nextKey();
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

  await updateKey(activeKey.id, {
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

function normalizeBalanceData(creditData = {}, tokenData = {}) {
  const remainingCredits = Number(creditData.remainingCredits ?? 0);
  const planCredits = Number(creditData.planCredits ?? 0);
  const remainingTokens = Number(tokenData.remainingTokens ?? 0);
  const planTokens = Number(tokenData.planTokens ?? 0);
  return {
    remainingCredits,
    planCredits,
    usedCredits: Math.max(0, planCredits - remainingCredits),
    remainingTokens,
    planTokens,
    usedTokens: Math.max(0, planTokens - remainingTokens),
    billingPeriodStart: creditData.billingPeriodStart || tokenData.billingPeriodStart || null,
    billingPeriodEnd: creditData.billingPeriodEnd || tokenData.billingPeriodEnd || null,
    lastCheckedAt: new Date().toISOString(),
  };
}

async function queryBalanceForKeyId(id) {
  const keyRecord = await getKeyById(id);
  if (!keyRecord) {
    throw new Error('Key not found');
  }

  const [creditUsage, tokenUsage] = await Promise.allSettled([
    firecrawlFetch('/v2/team/credit-usage', { keyRecord }),
    firecrawlFetch('/v2/team/token-usage', { keyRecord }),
  ]);

  const creditData = creditUsage.status === 'fulfilled' ? (creditUsage.value.data?.data || creditUsage.value.data || {}) : {};
  const tokenData = tokenUsage.status === 'fulfilled' ? (tokenUsage.value.data?.data || tokenUsage.value.data || {}) : {};

  const balance = normalizeBalanceData(creditData, tokenData);
  const patch = {
    balance,
    lastStatus: creditUsage.status === 'fulfilled' || tokenUsage.status === 'fulfilled' ? 'ok' : 'error',
    lastError: creditUsage.status === 'rejected' && tokenUsage.status === 'rejected'
      ? `${creditUsage.reason.message}; ${tokenUsage.reason.message}`
      : null,
  };
  const updated = await updateKey(id, patch);
  logger.info('Balance queried', { id, key: keyRecord.maskedKey, balance });
  return updated;
}

async function buildDashboardOverview() {
  const perKey = await listKeys();
  const aggregate = perKey.reduce((acc, item) => {
    const balance = item.balance || {};
    acc.keyCount += 1;
    acc.remainingCredits += Number(balance.remainingCredits || 0);
    acc.usedCredits += Number(balance.usedCredits || 0);
    acc.remainingTokens += Number(balance.remainingTokens || 0);
    acc.usedTokens += Number(balance.usedTokens || 0);
    acc.totalRequests += Number(item.requestCount || 0);
    return acc;
  }, {
    keyCount: 0,
    remainingCredits: 0,
    usedCredits: 0,
    remainingTokens: 0,
    usedTokens: 0,
    totalRequests: 0,
  });

  return { aggregate, perKey };
}

module.exports = {
  firecrawlFetch,
  buildDashboardOverview,
  queryBalanceForKeyId,
};
