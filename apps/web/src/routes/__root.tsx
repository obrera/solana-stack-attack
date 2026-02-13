import { env } from '@solana-stack-attack/env/web'
import type { QueryClient } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts,
} from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { Toaster } from '@/components/ui/sonner'
import type { orpc } from '@/utils/orpc'
import { BottomTabs } from '../components/header'
import { WalletMismatchGuard } from '../components/wallet-mismatch-guard'
import { GameProvider } from '../features/game/data-access/game-provider'

import appCss from '../index.css?url'
import { authClient } from '../lib/auth-client'

export interface RouterAppContext {
  orpc: typeof orpc
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Stack Attack',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),

  component: RootDocument,
})

function RootDocument() {
  const { data: session } = authClient.useSession()
  const isAuthenticated = !!session?.user

  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
        {env.VITE_UMAMI_WEBSITE_ID && (
          <script
            defer
            src="https://stats.colmena.dev/script.js"
            data-website-id={env.VITE_UMAMI_WEBSITE_ID}
          />
        )}
      </head>
      <body>
        <GameProvider>
          <WalletMismatchGuard>
            <div
              className={`h-svh overflow-y-auto ${isAuthenticated ? 'pb-16' : ''}`}
            >
              <Outlet />
            </div>
            {isAuthenticated && <BottomTabs />}
          </WalletMismatchGuard>
        </GameProvider>
        <Toaster richColors />
        <TanStackRouterDevtools position="top-left" />
        <ReactQueryDevtools position="top" buttonPosition="top-right" />
        <Scripts />
      </body>
    </html>
  )
}
