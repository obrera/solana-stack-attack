import { gameFormatNumber } from '@solana-stack-attack/game-util/game-format-number'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface GameUiWelcomeModalProps {
  earnings: number
  onDismiss: () => void
}

export function GameUiWelcomeModal({
  earnings,
  onDismiss,
}: GameUiWelcomeModalProps) {
  const [displayValue, setDisplayValue] = useState(0)

  // Count-up animation
  useEffect(() => {
    const duration = 1200
    const start = performance.now()

    function tick(now: number) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      // Ease-out quad
      const eased = 1 - (1 - progress) * (1 - progress)
      setDisplayValue(Math.floor(eased * earnings))

      if (progress < 1) {
        requestAnimationFrame(tick)
      }
    }

    requestAnimationFrame(tick)
  }, [earnings])

  return (
    <Dialog open onOpenChange={(open) => !open && onDismiss()}>
      <DialogContent
        showCloseButton={false}
        className="border-2 border-yellow-400 bg-slate-900"
      >
        <DialogHeader className="items-center">
          <span className="text-6xl">🎉</span>
          <DialogTitle className="font-bold text-3xl text-white">
            Welcome Back!
          </DialogTitle>
          <DialogDescription className="text-base text-gray-400">
            While you were away, you earned
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-baseline justify-center gap-2 py-4">
          <span className="font-bold text-5xl text-yellow-400">
            {gameFormatNumber(displayValue)}
          </span>
          <span className="text-2xl text-yellow-400">coins</span>
        </div>

        <div className="flex justify-center">
          <Button
            className="rounded-xl bg-yellow-400 px-12 py-4 font-bold text-slate-900 text-xl hover:bg-yellow-300"
            onClick={onDismiss}
          >
            Collect!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
