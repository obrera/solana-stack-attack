import { Ionicons } from '@expo/vector-icons'
import { Card, useThemeColor } from 'heroui-native'
import { Text, View } from 'react-native'

interface ProfileUiStatCardProps {
  label: string
  value: string
  icon: keyof typeof Ionicons.glyphMap
}

export function ProfileUiStatCard({
  label,
  value,
  icon,
}: ProfileUiStatCardProps) {
  const accentColor = useThemeColor('success')

  return (
    <Card variant="secondary" className="flex-1 p-4">
      <View className="flex-row items-center gap-2">
        <Ionicons name={icon} size={16} color={accentColor} />
        <Text className="text-muted text-xs">{label.toUpperCase()}</Text>
      </View>
      <Text className="mt-1 font-bold text-foreground text-xl">{value}</Text>
    </Card>
  )
}
