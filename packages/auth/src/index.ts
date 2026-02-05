import { expo } from '@better-auth/expo'
import { db } from '@solana-stack-attack/db'
import * as schema from '@solana-stack-attack/db/schema/auth'
import { env } from '@solana-stack-attack/env/server'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'sqlite',

    schema: schema,
  }),
  trustedOrigins: [
    env.CORS_ORIGIN,
    'mybettertapp://',
    ...(env.NODE_ENV === 'development'
      ? [
          'exp://',
          'exp://**',
          'exp://192.168.*.*:*/**',
          'http://localhost:8081',
        ]
      : []),
  ],
  emailAndPassword: {
    enabled: true,
  },
  advanced: {
    defaultCookieAttributes: {
      sameSite: 'none',
      secure: true,
      httpOnly: true,
    },
  },
  plugins: [expo()],
})
