import { useThemeColor } from 'heroui-native'
import { Text, View } from 'react-native'

interface ProfileUiAvatarProps {
  name: string
  size?: number
}

export function ProfileUiAvatar({ name, size = 64 }: ProfileUiAvatarProps) {
  const accentColor = useThemeColor('success')

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: accentColor,
      }}
      className="items-center justify-center"
    >
      <Text style={{ fontSize: size * 0.4 }} className="font-bold text-white">
        {initials}
      </Text>
    </View>
  )
}
