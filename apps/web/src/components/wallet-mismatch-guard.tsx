import { useQuery } from '@tanstack/react-query'
import { ellipsify, useWalletUi } from '@wallet-ui/react'
import { LucideShieldAlert } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { authClient } from '@/lib/auth-client'
import { orpc } from '@/utils/orpc'

export function WalletMismatchGuard({ children }: { children: ReactNode }) {
  const { account } = useWalletUi()
  const { data: session } = authClient.useSession()
  const { data: wallets } = useQuery({
    ...orpc.user.wallets.queryOptions(),
    enabled: !!session?.user,
  })

  const connectedAddress = account?.address

  // No wallet connected or no session or wallets not loaded yet — let through
  if (!connectedAddress || !session?.user || !wallets) {
    return <>{children}</>
  }

  // Check if connected wallet matches any of the user's linked wallets
  const isLinked = wallets.some((w) => w.address === connectedAddress)

  if (isLinked) {
    return <>{children}</>
  }

  return (
    <div className="flex h-svh items-center justify-center bg-background p-4">
      <div className="mx-auto max-w-md space-y-6 text-center">
        <div className="flex justify-center">
          <div className="rounded-full bg-destructive/10 p-4">
            <LucideShieldAlert className="size-12 text-destructive" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="font-bold text-2xl">Wallet Mismatch</h1>
          <p className="text-muted-foreground">
            The connected wallet doesn't match your account.
          </p>
        </div>
        <div className="space-y-1 rounded-lg bg-muted p-4 text-left font-mono text-sm">
          <p>
            <span className="text-muted-foreground">Connected: </span>
            {ellipsify(connectedAddress, 8)}
          </p>
          <p>
            <span className="text-muted-foreground">Expected: </span>
            {wallets.map((w) => ellipsify(w.address, 8)).join(', ')}
          </p>
        </div>
        <p className="text-muted-foreground text-sm">
          Switch to the correct wallet or sign out and reconnect.
        </p>
        <div className="flex flex-col gap-3">
          <Button
            variant="destructive"
            className="w-full"
            onClick={() => authClient.signOut()}
          >
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  )
}
