import { LucideCheckCircle, LucideExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import type { Reward } from '../data-access/use-rewards'

interface RewardsUiCardProps {
  isClaiming: boolean
  onClaim: (id: number) => void
  reward: Reward
}

export function RewardsUiCard({
  isClaiming,
  onClaim,
  reward,
}: RewardsUiCardProps) {
  const isPending = reward.status === 'pending'

  return (
    <Card className="mb-3">
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex-1">
          <p className="font-semibold">
            {reward.milestoneId
              .replace(/_/g, ' ')
              .replace(/\b\w/g, (c) => c.toUpperCase())}
          </p>
          <p className="mt-1 text-muted-foreground text-sm">
            {reward.displayAmount.toLocaleString()} STACK
          </p>
        </div>

        {isPending ? (
          <Button
            size="sm"
            disabled={isClaiming}
            onClick={() => onClaim(reward.id)}
          >
            {isClaiming ? <Spinner className="size-4" /> : 'Claim'}
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <LucideCheckCircle className="size-5 text-green-500" />
            {reward.txSignature ? (
              <a
                href={`https://explorer.solana.com/tx/${reward.txSignature}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-green-500 text-sm underline"
              >
                View Tx
                <LucideExternalLink className="size-3" />
              </a>
            ) : (
              <span className="text-muted-foreground text-sm">Claimed</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
