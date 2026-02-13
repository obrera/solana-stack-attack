import { expo } from '@better-auth/expo'
import { solanaAuth } from '@solana-stack-attack/better-auth-solana'
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
    ...env.CORS_ORIGINS,
    ...(env.NODE_ENV === 'development'
      ? [
          'exp://',
          'exp://**',
          'exp://192.168.*.*:*/**',
          'http://localhost:8081',
        ]
      : []),
  ],
  advanced: {
    ...(env.AUTH_COOKIE_DOMAIN && {
      crossSubDomainCookies: {
        enabled: true,
        domain: env.AUTH_COOKIE_DOMAIN,
      },
    }),
    defaultCookieAttributes: {
      sameSite: 'none',
      secure: true,
      httpOnly: true,
    },
  },
  plugins: [expo(), solanaAuth({ cluster: 'devnet', domain: 'localhost' })],
})
