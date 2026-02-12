import type { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface ProfileUiStatCardProps {
  icon: LucideIcon
  label: string
  value: string
}

export function ProfileUiStatCard({
  icon: Icon,
  label,
  value,
}: ProfileUiStatCardProps) {
  return (
    <Card className="flex-1">
      <CardContent className="p-4">
        <div className="flex items-center gap-2">
          <Icon className="size-4 text-green-500" />
          <span className="text-muted-foreground text-xs">
            {label.toUpperCase()}
          </span>
        </div>
        <p className="mt-1 font-bold text-xl">{value}</p>
      </CardContent>
    </Card>
  )
}
