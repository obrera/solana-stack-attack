import { createMiddleware } from '@tanstack/react-start'

import { authClient } from '@/lib/auth-client'

export const authMiddleware = createMiddleware().server(
  async ({ next, request }) => {
    // Only forward the cookie header to the API server.
    // Forwarding all headers (including Host, Origin, etc.) causes
    // the server-to-server fetch to fail because the Host header
    // doesn't match the API URL.
    const cookie = request.headers.get('cookie')
    const { data: session } = await authClient.getSession({
      fetchOptions: {
        headers: cookie ? { cookie } : {},
      },
    })
    return next({
      context: { session: session ?? null },
    })
  },
)
