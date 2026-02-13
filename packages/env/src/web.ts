import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

// Use import.meta.env for client-side (Vite), fall back to process.env for SSR
const runtimeEnv = import.meta.env?.VITE_SERVER_URL
  ? import.meta.env
  : typeof process !== 'undefined'
    ? process.env
    : {}

export const env = createEnv({
  clientPrefix: 'VITE_',
  client: {
    VITE_SERVER_URL: z.url(),
    VITE_UMAMI_WEBSITE_ID: z.string().optional(),
  },
  runtimeEnv,
  emptyStringAsUndefined: true,
})
