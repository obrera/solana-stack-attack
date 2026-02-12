import { ellipsify, useWalletUi } from '@wallet-ui/react'
import {
  LucideCloud,
  LucideCloudOff,
  LucideCloudUpload,
  LucideCopy,
  LucideDiamond,
  LucideFingerprint,
  LucideLogOut,
  LucideTimer,
  LucideTrendingUp,
  LucideWallet,
} from 'lucide-react'
import { toast } from 'sonner'
import { ClusterDropdown } from '@/components/cluster-dropdown'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { WalletDropdown } from '@/components/wallet-dropdown'
import { useGameContext } from '@/features/game/data-access/game-provider'
import { RewardsFeature } from '@/features/rewards/rewards-feature'
import { authClient } from '@/lib/auth-client'
import { ProfileUiAvatar } from './ui/profile-ui-avatar'
import { ProfileUiStatCard } from './ui/profile-ui-stat-card'

function formatLastSaved(date: Date | null): string {
  if (!date) {
    return 'Not saved yet'
  }
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 5) {
    return 'Just now'
  }
  if (seconds < 60) {
    return `${seconds}s ago`
  }
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) {
    return `${minutes}m ago`
  }
  return date.toLocaleTimeString()
}

function useSaveStatus() {
  const { state } = useGameContext()
  const stale = state.lastSavedAt
    ? Date.now() - state.lastSavedAt.getTime() > 5 * 60 * 1000
    : false

  if (state.isSaving) {
    return {
      color: 'text-yellow-500',
      icon: LucideCloudUpload,
      label: 'Saving...',
    }
  }
  if (!state.lastSavedAt) {
    return {
      color: 'text-red-500',
      icon: LucideCloudOff,
      label: 'Not saved yet',
    }
  }
  if (stale) {
    return {
      color: 'text-yellow-500',
      icon: LucideCloudUpload,
      label: `Saved ${formatLastSaved(state.lastSavedAt)}`,
    }
  }
  return {
    color: 'text-green-500',
    icon: LucideCloud,
    label: `Saved ${formatLastSaved(state.lastSavedAt)}`,
  }
}

export function ProfileFeature() {
  const { data: session } = authClient.useSession()
  const { state } = useGameContext()
  const { account } = useWalletUi()
  const saveStatus = useSaveStatus()

  const user = session?.user
  const walletAddress = account?.address

  function handleCopyWallet() {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress)
      toast.success('Wallet address copied')
    }
  }

  function handleSignOut() {
    authClient.signOut()
  }

  if (!user) return null

  return (
    <div className="mx-auto w-full max-w-lg space-y-6 p-4">
      {/* Header */}
      <div className="flex flex-col items-center py-6">
        <ProfileUiAvatar name={user.name ?? 'Player'} />
        <h1 className="mt-4 font-bold text-2xl">Level {state.level} Stacker</h1>
        {walletAddress && (
          <p className="mt-1 font-mono text-muted-foreground text-sm">
            {ellipsify(walletAddress, 6)}
          </p>
        )}
      </div>

      {/* Wallet Card */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <LucideWallet className="size-5 text-green-500" />
              <div>
                <p className="text-muted-foreground text-xs">WALLET</p>
                <p className="font-mono">
                  {walletAddress ? ellipsify(walletAddress) : 'Not connected'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {walletAddress && (
                <Button variant="ghost" size="icon" onClick={handleCopyWallet}>
                  <LucideCopy className="size-4" />
                </Button>
              )}
              <WalletDropdown />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div>
        <h2 className="mb-3 font-semibold text-lg">Stats</h2>
        <div className="grid grid-cols-2 gap-3">
          <ProfileUiStatCard
            icon={LucideDiamond}
            label="Total Score"
            value={state.score.toLocaleString()}
          />
          <ProfileUiStatCard
            icon={LucideFingerprint}
            label="Total Taps"
            value={state.totalTaps.toLocaleString()}
          />
          <ProfileUiStatCard
            icon={LucideTrendingUp}
            label="Level"
            value={state.level.toString()}
          />
          <ProfileUiStatCard
            icon={LucideTimer}
            label="Per Second"
            value={`+${state.pointsPerSecond}`}
          />
        </div>
      </div>

      {/* Rewards */}
      <div>
        <h2 className="mb-3 font-semibold text-lg">Rewards</h2>
        <RewardsFeature />
      </div>

      {/* Sync Status */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <saveStatus.icon className={`size-5 ${saveStatus.color}`} />
            <span className="text-sm">{saveStatus.label}</span>
          </div>
        </CardContent>
      </Card>

      {/* Settings */}
      <div>
        <h2 className="mb-3 font-semibold text-lg">Settings</h2>
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <span className="text-sm">Cluster</span>
            <ClusterDropdown />
          </CardContent>
        </Card>
      </div>

      {/* Sign Out */}
      <Button variant="destructive" className="w-full" onClick={handleSignOut}>
        <LucideLogOut className="mr-2 size-4" />
        Sign Out
      </Button>
    </div>
  )
}
