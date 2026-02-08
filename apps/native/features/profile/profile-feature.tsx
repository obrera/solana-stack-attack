import { Ionicons } from '@expo/vector-icons'
import * as Clipboard from 'expo-clipboard'
import { Card, useThemeColor } from 'heroui-native'
import { Pressable, ScrollView, Text, View } from 'react-native'

import {
  authClient,
  useIsAuthenticated,
} from '@/features/auth/data-access/auth-client'
import { queryClient } from '@/features/core/util/core-orpc'
import { useGameContext } from '@/features/game/data-access/game-provider'
import { UiContainer } from '@/features/ui/ui/ui-container'
import { UiThemeToggle } from '@/features/ui/ui/ui-theme-toggle'

import { ProfileUiAvatar } from './ui/profile-ui-avatar'
import { ProfileUiStatCard } from './ui/profile-ui-stat-card'

export function ProfileFeature() {
  const { user } = useIsAuthenticated()
  const { state } = useGameContext()
  const accentColor = useThemeColor('success')
  const mutedColor = useThemeColor('muted')

  // Mock wallet address for now - will integrate real wallet later
  const walletAddress = 'SEekKY1iUoWYJqZ3d9QBsfJytNx5RLBjBmgznkGrqbH'
  const truncatedWallet = `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`

  async function handleCopyWallet() {
    await Clipboard.setStringAsync(walletAddress)
  }

  function handleSignOut() {
    authClient.signOut()
    queryClient.invalidateQueries()
  }

  if (!user) return null

  return (
    <UiContainer>
      <ScrollView className="flex-1" contentContainerClassName="p-4">
        {/* Header */}
        <View className="items-center py-6">
          <ProfileUiAvatar name={user.name ?? 'Player'} size={80} />
          <Text className="mt-4 font-bold text-2xl text-foreground">
            {user.name}
          </Text>
          <Text className="mt-1 text-muted">{user.email}</Text>
        </View>

        {/* Wallet Card */}
        <Card variant="secondary" className="mb-4 p-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <Ionicons name="wallet-outline" size={24} color={accentColor} />
              <View>
                <Text className="text-muted text-xs">WALLET</Text>
                <Text className="font-mono text-foreground">
                  {truncatedWallet}
                </Text>
              </View>
            </View>
            <Pressable
              onPress={handleCopyWallet}
              className="rounded-lg bg-background p-2 active:opacity-70"
            >
              <Ionicons name="copy-outline" size={20} color={mutedColor} />
            </Pressable>
          </View>
        </Card>

        {/* Stats */}
        <Text className="mb-3 font-semibold text-foreground text-lg">
          Stats
        </Text>
        <View className="mb-6 flex-row gap-3">
          <ProfileUiStatCard
            label="Total Score"
            value={state.score.toLocaleString()}
            icon="diamond"
          />
          <ProfileUiStatCard
            label="Total Taps"
            value={state.totalTaps.toLocaleString()}
            icon="finger-print"
          />
        </View>
        <View className="mb-6 flex-row gap-3">
          <ProfileUiStatCard
            label="Level"
            value={state.level.toString()}
            icon="trending-up"
          />
          <ProfileUiStatCard
            label="Per Second"
            value={`+${state.pointsPerSecond}`}
            icon="time"
          />
        </View>

        {/* Settings */}
        <Text className="mb-3 font-semibold text-foreground text-lg">
          Settings
        </Text>
        <Card variant="secondary" className="mb-4 p-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <Ionicons name="moon-outline" size={24} color={mutedColor} />
              <Text className="text-foreground">Theme</Text>
            </View>
            <UiThemeToggle />
          </View>
        </Card>

        {/* Sign Out */}
        <Pressable
          onPress={handleSignOut}
          className="mt-4 rounded-xl bg-danger p-4 active:opacity-70"
        >
          <View className="flex-row items-center justify-center gap-2">
            <Ionicons name="log-out-outline" size={20} color="white" />
            <Text className="font-semibold text-white">Sign Out</Text>
          </View>
        </Pressable>
      </ScrollView>
    </UiContainer>
  )
}
