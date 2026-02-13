import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

// DEBUG: Log all env sources to diagnose VITE_SERVER_URL issue
const debugEnv = {
  'import.meta.env': import.meta.env,
  'import.meta.env.VITE_SERVER_URL': import.meta.env?.VITE_SERVER_URL,
  'process.env?.VITE_SERVER_URL':
    typeof process !== 'undefined'
      ? process.env?.VITE_SERVER_URL
      : 'process undefined',
  'typeof import.meta.env': typeof import.meta.env,
}
console.log('[env/web] DEBUG env sources:', JSON.stringify(debugEnv, null, 2))

// Use import.meta.env for client-side (Vite), fall back to process.env for SSR
const runtimeEnv = import.meta.env?.VITE_SERVER_URL
  ? import.meta.env
  : typeof process !== 'undefined'
    ? process.env
    : {}

console.log(
  '[env/web] DEBUG selected runtimeEnv:',
  JSON.stringify(runtimeEnv, null, 2),
)

export const env = createEnv({
  clientPrefix: 'VITE_',
  client: {
    VITE_SERVER_URL: z.url(),
    VITE_UMAMI_WEBSITE_ID: z.string().optional(),
  },
  runtimeEnv,
  emptyStringAsUndefined: true,
})
