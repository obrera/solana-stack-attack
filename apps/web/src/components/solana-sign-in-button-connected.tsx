import { useNavigate } from '@tanstack/react-router'
import {
  type UiWallet,
  type UiWalletAccount,
  WalletUiIcon,
} from '@wallet-ui/react'
import { LucideKey } from 'lucide-react'
import { toast } from 'sonner'
import { useHandleSiwsAuthMutation } from '@/components/solana/use-handle-siws-auth-mutation'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'

export function SolanaSignInButtonConnected({
  account,
  wallet,
}: {
  account: UiWalletAccount
  wallet: UiWallet
}) {
  const navigate = useNavigate()
  const { mutate, isPending } = useHandleSiwsAuthMutation({
    account,
    wallet,
    onSuccess: () => {
      toast.success('Signed in successfully')
      void navigate({ to: '/game' })
    },
    onError: (err) => {
      toast.error('Sign in failed', { description: String(err) })
    },
  })

  return (
    <Button
      variant="secondary"
      className="w-full justify-start gap-2"
      onClick={() => mutate()}
      disabled={isPending}
    >
      {isPending ? (
        <Spinner className="size-5" />
      ) : (
        <WalletUiIcon wallet={wallet} className="size-5" />
      )}
      <span className="flex-1 text-left">Sign in with {wallet.name}</span>
      <LucideKey className="size-4" />
    </Button>
  )
}
