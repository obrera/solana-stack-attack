import { Link, useLocation } from '@tanstack/react-router'
import {
  LucideDiamond,
  LucideFlame,
  LucideShoppingCart,
  LucideTrophy,
  LucideUser,
} from 'lucide-react'
import { useGameContext } from '@/features/game/data-access/game-provider'
import { usePendingRewardCount } from '@/features/rewards/data-access/use-pending-reward-count'

function useHasAffordableUpgrade(): boolean {
  const { upgrades, canAfford } = useGameContext()
  return upgrades.some((u) => canAfford(u.id))
}

interface TabItem {
  to: string
  label: string
  icon: typeof LucideDiamond
  badge?: boolean
}

function TabLink({ tab, isActive }: { isActive: boolean; tab: TabItem }) {
  const Icon = tab.icon
  return (
    <Link
      to={tab.to}
      className={`relative flex flex-1 flex-col items-center gap-1 py-2 text-xs transition-colors ${
        isActive ? 'text-green-500' : 'text-gray-500'
      }`}
    >
      <div className="relative">
        <Icon className="size-5" />
        {tab.badge && (
          <span className="absolute -top-1 -right-1 size-2.5 rounded-full bg-green-500" />
        )}
      </div>
      <span>{tab.label}</span>
    </Link>
  )
}

export function BottomTabs() {
  const location = useLocation()
  const pendingRewards = usePendingRewardCount()
  const hasAffordable = useHasAffordableUpgrade()

  const tabs: TabItem[] = [
    { to: '/game', label: 'Play', icon: LucideDiamond },
    {
      to: '/shop',
      label: 'Shop',
      icon: LucideShoppingCart,
      badge: hasAffordable,
    },
    { to: '/burn', label: 'Burn', icon: LucideFlame },
    { to: '/leaderboard', label: 'Ranks', icon: LucideTrophy },
    {
      to: '/profile',
      label: 'Profile',
      icon: LucideUser,
      badge: pendingRewards > 0,
    },
  ]

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex border-gray-800 border-t bg-black/95 backdrop-blur-sm">
      {tabs.map((tab) => (
        <TabLink
          key={tab.to}
          tab={tab}
          isActive={location.pathname === tab.to}
        />
      ))}
    </nav>
  )
}
