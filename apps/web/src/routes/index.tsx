import { createFileRoute, redirect } from '@tanstack/react-router'
import { LucideDiamond } from 'lucide-react'
import { useSolana } from '@/components/solana/use-solana'
import { SolanaSignInButton } from '@/components/solana-sign-in-button'
import { getUser } from '@/functions/get-user'

export const Route = createFileRoute('/')({
  component: IndexComponent,
  beforeLoad: async () => {
    const session = await getUser()
    if (session) {
      throw redirect({ to: '/game' })
    }
  },
})

function IndexComponent() {
  const { wallets } = useSolana()

  return (
    <div className="flex h-full flex-col items-center justify-center p-8">
      {/* Game icon */}
      <div className="mb-6 flex size-28 items-center justify-center rounded-full bg-green-500/10">
        <LucideDiamond className="size-14 text-green-500" />
      </div>

      {/* Title */}
      <h1 className="mb-2 text-center font-bold text-5xl text-white">
        Stack Attack
      </h1>
      <p className="mb-1 text-center text-green-500 text-lg">
        Tap. Stack. Earn.
      </p>
      <p className="mb-12 text-center text-gray-500 text-sm">
        Connect your wallet to start stacking
      </p>

      {/* Sign in buttons */}
      <div className="w-full max-w-sm space-y-2">
        {wallets.length === 0 ? (
          <p className="text-center text-gray-500 text-sm">
            No Solana wallets detected. Please install a wallet extension.
          </p>
        ) : (
          wallets.map((wallet) => (
            <SolanaSignInButton key={wallet.name} wallet={wallet} />
          ))
        )}
      </div>

      {/* Footer */}
      <p className="mt-8 text-center text-gray-600 text-xs">
        Built on Solana ⚡
      </p>
    </div>
  )
}
