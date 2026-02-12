import { Link } from '@tanstack/react-router'
import { useGameContext } from '@/features/game/data-access/game-provider'
import { usePendingRewardCount } from '@/features/rewards/data-access/use-pending-reward-count'

function NavDot({ color, visible }: { color: string; visible: boolean }) {
  if (!visible) return null
  return <span className={`ml-1 inline-block size-2.5 rounded-full ${color}`} />
}

function useHasAffordableUpgrade(): boolean {
  const { upgrades, canAfford } = useGameContext()
  return upgrades.some((u) => canAfford(u.id))
}

export default function Header() {
  const pendingRewards = usePendingRewardCount()
  const hasAffordable = useHasAffordableUpgrade()

  const links = [
    { to: '/', label: 'Home' },
    { to: '/game', label: 'Game' },
    { to: '/leaderboard', label: 'Ranks' },
    {
      to: '/shop',
      label: 'Shop',
      dot: hasAffordable,
      dotColor: 'bg-green-500',
    },
    { to: '/burn', label: 'Burn' },
    {
      to: '/profile',
      label: 'Profile',
      dot: pendingRewards > 0,
      dotColor: 'bg-green-500',
    },
  ] as const

  return (
    <div>
      <div className="flex flex-row items-center justify-between px-2 py-1">
        <nav className="flex gap-4 text-lg">
          {links.map(({ to, label, ...rest }) => {
            const dot = 'dot' in rest ? rest.dot : false
            const dotColor = 'dotColor' in rest ? rest.dotColor : 'bg-green-500'
            return (
              <Link key={to} to={to} className="flex items-center">
                {label}
                <NavDot visible={dot} color={dotColor} />
              </Link>
            )
          })}
        </nav>
      </div>
      <hr />
    </div>
  )
}
