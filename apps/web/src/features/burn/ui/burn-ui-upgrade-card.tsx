import {
  LucideBatteryCharging,
  LucideCheck,
  LucideDiamond,
  LucideGift,
  LucideHandMetal,
  type LucideIcon,
  LucidePlane,
  LucideShoppingCart,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'

const ICON_MAP: Record<string, LucideIcon> = {
  airplane: LucidePlane,
  'battery-charging': LucideBatteryCharging,
  cart: LucideShoppingCart,
  diamond: LucideDiamond,
  gift: LucideGift,
  'hand-left': LucideHandMetal,
}

interface BurnUiUpgradeCardProps {
  canAfford: boolean
  description: string
  displayCost: number
  icon: string
  isPurchased: boolean
  isPurchasing: boolean
  name: string
  onPurchase: () => void
}

export function BurnUiUpgradeCard({
  canAfford,
  description,
  displayCost,
  icon,
  isPurchased,
  isPurchasing,
  name,
  onPurchase,
}: BurnUiUpgradeCardProps) {
  const IconComponent = ICON_MAP[icon]

  return (
    <Card className={isPurchased ? 'border border-green-500' : ''}>
      <CardContent className="flex items-center gap-4 p-4">
        {/* Icon */}
        <div
          className={`flex size-12 items-center justify-center rounded-full ${
            isPurchased ? 'bg-green-500/20' : 'bg-red-500/20'
          }`}
        >
          {IconComponent ? (
            <IconComponent
              className={`size-6 ${isPurchased ? 'text-green-500' : 'text-red-500'}`}
            />
          ) : (
            <span className="text-2xl">{icon}</span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{name}</span>
            {isPurchased && (
              <span className="rounded bg-green-500/30 px-2 py-0.5 font-medium text-green-500 text-xs">
                OWNED
              </span>
            )}
          </div>
          <p className="text-muted-foreground text-sm">{description}</p>
        </div>

        {/* Buy/Owned */}
        {isPurchased ? (
          <div className="rounded-lg bg-green-500/20 p-2">
            <LucideCheck className="size-5 text-green-500" />
          </div>
        ) : (
          <Button
            variant="destructive"
            size="sm"
            disabled={!canAfford || isPurchasing}
            onClick={onPurchase}
          >
            {isPurchasing ? (
              <Spinner className="size-4" />
            ) : (
              <>{displayCost} 🔥</>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
