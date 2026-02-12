import type { Upgrade } from '@solana-stack-attack/game-data-access/game-upgrades'
import { gameFormatNumber } from '@solana-stack-attack/game-util/game-format-number'
import {
  LucideCpu,
  LucideDiamond,
  LucideFingerprint,
  LucideGlobe,
  type LucideIcon,
  LucideRocket,
  LucideZap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const ICON_MAP: Record<string, LucideIcon> = {
  diamond: LucideDiamond,
  'finger-print': LucideFingerprint,
  flash: LucideZap,
  'hardware-chip': LucideCpu,
  planet: LucideGlobe,
  rocket: LucideRocket,
}

interface GameUiUpgradeCardProps {
  canAfford: boolean
  cost: number
  level: number
  onPurchase: () => void
  upgrade: Upgrade
}

export function GameUiUpgradeCard({
  canAfford,
  cost,
  level,
  onPurchase,
  upgrade,
}: GameUiUpgradeCardProps) {
  const IconComponent = ICON_MAP[upgrade.icon]

  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-4">
        {/* Icon */}
        <div className="flex size-12 items-center justify-center rounded-full bg-green-500/20">
          {IconComponent ? (
            <IconComponent className="size-6 text-green-500" />
          ) : (
            <span className="text-2xl">{upgrade.icon}</span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{upgrade.name}</span>
            {level > 0 && (
              <span className="rounded bg-green-500/30 px-2 py-0.5 font-medium text-green-500 text-xs">
                Lv.{level}
              </span>
            )}
          </div>
          <p className="text-muted-foreground text-sm">{upgrade.description}</p>
        </div>

        {/* Buy Button */}
        <Button
          size="sm"
          disabled={!canAfford}
          onClick={onPurchase}
          variant={canAfford ? 'default' : 'secondary'}
        >
          {gameFormatNumber(cost)}
        </Button>
      </CardContent>
    </Card>
  )
}
