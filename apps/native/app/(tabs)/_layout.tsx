import { Ionicons } from '@expo/vector-icons'
import { Tabs } from 'expo-router'
import { useThemeColor } from 'heroui-native'
import { View } from 'react-native'

import { AuthFeatureGuard } from '@/features/auth/auth-feature-guard'
import { useGameContext } from '@/features/game/data-access/game-provider'
import { useSaveStatus } from '@/features/profile/profile-feature'
import { usePendingRewardCount } from '@/features/rewards/data-access/use-pending-reward-count'

function TabsLayout() {
  const foregroundColor = useThemeColor('foreground')
  const backgroundColor = useThemeColor('background')
  const accentColor = useThemeColor('success')
  const warningColor = useThemeColor('warning')
  const dangerColor = useThemeColor('danger')
  const mutedColor = useThemeColor('muted')

  const { upgrades, canAfford } = useGameContext()
  const canAffordAnyUpgrade = upgrades.some((u) => canAfford(u.id))
  const pendingRewardCount = usePendingRewardCount()
  const saveStatus = useSaveStatus()

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: accentColor,
        tabBarInactiveTintColor: mutedColor,
        tabBarStyle: {
          backgroundColor,
          borderTopColor: mutedColor,
        },
        headerStyle: { backgroundColor },
        headerTintColor: foregroundColor,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Play',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="game-controller" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          title: 'Shop',
          tabBarIcon: ({ color, size }) => (
            <View>
              <Ionicons name="cart" size={size} color={color} />
              {canAffordAnyUpgrade && (
                <View
                  style={{ backgroundColor: accentColor }}
                  className="absolute -top-1 -right-1 h-3 w-3 rounded-full"
                />
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="ranks"
        options={{
          title: 'Ranks',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="trophy" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => {
            const badgeColor =
              pendingRewardCount > 0
                ? accentColor
                : saveStatus.color === 'danger'
                  ? dangerColor
                  : saveStatus.color === 'warning'
                    ? warningColor
                    : null

            return (
              <View>
                <Ionicons name="person" size={size} color={color} />
                {badgeColor && (
                  <View
                    style={{ backgroundColor: badgeColor }}
                    className="absolute -top-1 -right-1 h-3 w-3 rounded-full"
                  />
                )}
              </View>
            )
          },
        }}
      />
    </Tabs>
  )
}

export default function ProtectedTabsLayout() {
  return (
    <AuthFeatureGuard>
      <TabsLayout />
    </AuthFeatureGuard>
  )
}
