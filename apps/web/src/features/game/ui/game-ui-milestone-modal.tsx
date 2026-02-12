import type { Milestone } from '@solana-stack-attack/game-util/game-milestones'
import {
  LucideDiamond,
  LucideFingerprint,
  LucideFlame,
  LucideHandMetal,
  type LucideIcon,
  LucideLayoutGrid,
  LucideShoppingCart,
  LucideStar,
  LucideStarHalf,
  LucideTrendingUp,
  LucideTrophy,
  LucideZap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const ICON_MAP: Record<string, LucideIcon> = {
  cart: LucideShoppingCart,
  diamond: LucideDiamond,
  'finger-print': LucideFingerprint,
  flame: LucideFlame,
  flash: LucideZap,
  grid: LucideLayoutGrid,
  'hand-left': LucideHandMetal,
  star: LucideStar,
  'star-half': LucideStarHalf,
  'star-outline': LucideStar,
  'trending-up': LucideTrendingUp,
  trophy: LucideTrophy,
  zap: LucideZap,
}

interface GameUiMilestoneModalProps {
  milestone: Milestone | null
  onDismiss: () => void
}

export function GameUiMilestoneModal({
  milestone,
  onDismiss,
}: GameUiMilestoneModalProps) {
  if (!milestone) {
    return null
  }

  const IconComponent = ICON_MAP[milestone.icon] ?? LucideTrophy

  return (
    <Dialog open onOpenChange={(open) => !open && onDismiss()}>
      <DialogContent
        showCloseButton={false}
        className="border-2 border-yellow-400 bg-slate-900"
      >
        <DialogHeader className="items-center">
          {/* Trophy Icon */}
          <div className="flex size-20 items-center justify-center rounded-full bg-yellow-400/20">
            <IconComponent className="size-10 text-yellow-400" />
          </div>

          <span className="text-6xl">🎉</span>
          <DialogTitle className="font-bold text-2xl text-white">
            Achievement Unlocked!
          </DialogTitle>
          <p className="font-semibold text-xl text-yellow-400">
            {milestone.name}
          </p>
          <DialogDescription className="text-center text-base text-gray-400">
            {milestone.description}
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-center pt-4">
          <Button
            className="rounded-xl bg-yellow-400 px-12 py-4 font-bold text-slate-900 text-xl hover:bg-yellow-300"
            onClick={onDismiss}
          >
            Awesome!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
