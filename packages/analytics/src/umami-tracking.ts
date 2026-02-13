import type { Context, Next } from 'hono'

const UMAMI_HOST_URL = process.env.UMAMI_URL ?? 'https://stats.colmena.dev'
const UMAMI_WEBSITE_ID = process.env.UMAMI_WEBSITE_ID ?? ''
const UMAMI_HOSTNAME = 'stack-api.colmena.dev'

const EVENT_ROUTES: [RegExp, string][] = [
  [/^\/api\/auth\//, 'auth'],
  [/^\/rpc\/burn\.confirmBurn/, 'burn.confirmBurn'],
  [/^\/rpc\/burn\.confirmFuelCell/, 'burn.confirmFuelCell'],
  [/^\/rpc\/burn\.leaderboard/, 'burn.leaderboard'],
  [/^\/rpc\/burn\.prepareBurn/, 'burn.prepareBurn'],
  [/^\/rpc\/burn\.prepareFuelCell/, 'burn.prepareFuelCell'],
  [/^\/rpc\/burn\.purchased/, 'burn.purchased'],
  [/^\/rpc\/burn\.spendableBalance/, 'burn.spendableBalance'],
  [/^\/rpc\/burn\.upgrades/, 'burn.upgrades'],
  [/^\/rpc\/feePayer\.getBalance/, 'feePayer.getBalance'],
  [/^\/rpc\/game\.getLeaderboard/, 'game.getLeaderboard'],
  [/^\/rpc\/game\.getMilestones/, 'game.getMilestones'],
  [/^\/rpc\/game\.getMyRank/, 'game.getMyRank'],
  [/^\/rpc\/game\.getState/, 'game.getState'],
  [/^\/rpc\/game\.saveState/, 'game.saveState'],
  [/^\/rpc\/reward\.balance/, 'reward.balance'],
  [/^\/rpc\/reward\.claim/, 'reward.claim'],
  [/^\/rpc\/reward\.claimAll/, 'reward.claimAll'],
  [/^\/rpc\/reward\.list/, 'reward.list'],
  [/^\/rpc\/healthCheck/, 'healthCheck'],
  [/^\/$/, 'root'],
]

function resolveEventName(path: string): string {
  for (const [pattern, name] of EVENT_ROUTES) {
    if (pattern.test(path)) {
      return name
    }
  }
  return 'api-request'
}

function getClientIp(c: Context): string {
  return (
    c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ??
    c.req.header('x-real-ip') ??
    ''
  )
}

function sendToUmami(
  payload: Record<string, unknown>,
  headers: Record<string, string>,
) {
  fetch(`${UMAMI_HOST_URL}/api/send`, {
    body: JSON.stringify({ payload, type: 'event' }),
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    method: 'POST',
  }).catch(() => {
    // Silently ignore tracking failures
  })
}

export async function umamiTracking(c: Context, next: Next) {
  if (!UMAMI_WEBSITE_ID) {
    return next()
  }

  const start = Date.now()
  await next()
  const duration = Date.now() - start

  const url = c.req.path
  const clientIp = getClientIp(c)
  const userAgent = c.req.header('user-agent') ?? ''

  const data: Record<string, string | number> = {
    duration,
    method: c.req.method,
    status: c.res.status,
    userAgent,
  }

  // Forward client IP + user-agent for geo/device detection
  const headers: Record<string, string> = {
    'User-Agent': userAgent,
  }
  if (clientIp) {
    headers['X-Forwarded-For'] = clientIp
  }

  sendToUmami(
    {
      data,
      hostname: UMAMI_HOSTNAME,
      name: resolveEventName(url),
      url,
      website: UMAMI_WEBSITE_ID,
    },
    headers,
  )
}
