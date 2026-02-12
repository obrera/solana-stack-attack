import { Ionicons } from '@expo/vector-icons'
import { useMobileWallet } from '@wallet-ui/react-native-kit'
import * as Clipboard from 'expo-clipboard'
import { Card, useThemeColor } from 'heroui-native'
import { Pressable, ScrollView, Text, View } from 'react-native'

import {
  authClient,
  useIsAuthenticated,
} from '@/features/auth/data-access/auth-client'
import { queryClient } from '@/features/core/util/core-orpc'
import { useGameContext } from '@/features/game/data-access/game-provider'
import { useTokenBalance } from '@/features/rewards/data-access/use-token-balance'
import { RewardsFeature } from '@/features/rewards/rewards-feature'

function ellipsify(str = '', len = 4, delimiter = '..') {
  return str.length < len * 2 + delimiter.length
    ? str
    : `${str.slice(0, len)}${delimiter}${str.slice(-len)}`
}

import { UiContainer } from '@/features/ui/ui/ui-container'
import { UiThemeToggle } from '@/features/ui/ui/ui-theme-toggle'

import { ProfileUiAvatar } from './ui/profile-ui-avatar'
import { ProfileUiStatCard } from './ui/profile-ui-stat-card'

function formatLastSaved(date: Date | null): string {
  if (!date) {
    return 'Not saved yet'
  }
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 5) {
    return 'Just now'
  }
  if (seconds < 60) {
    return `${seconds}s ago`
  }
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) {
    return `${minutes}m ago`
  }
  return date.toLocaleTimeString()
}

export function useSaveStatus() {
  const { state } = useGameContext()
  const stale = state.lastSavedAt
    ? Date.now() - state.lastSavedAt.getTime() > 5 * 60 * 1000
    : false

  if (state.isSaving) {
    return {
      color: 'warning' as const,
      icon: 'cloud-upload' as const,
      label: 'Saving...',
    }
  }
  if (!state.lastSavedAt) {
    return {
      color: 'danger' as const,
      icon: 'cloud-offline' as const,
      label: 'Not saved yet',
    }
  }
  if (stale) {
    return {
      color: 'warning' as const,
      icon: 'cloud-upload' as const,
      label: `Saved ${formatLastSaved(state.lastSavedAt)}`,
    }
  }
  return {
    color: 'success' as const,
    icon: 'cloud-done' as const,
    label: `Saved ${formatLastSaved(state.lastSavedAt)}`,
  }
}

export function ProfileFeature() {
  const { user } = useIsAuthenticated()
  const { state } = useGameContext()
  const { account } = useMobileWallet()
  const saveStatus = useSaveStatus()
  const { balance } = useTokenBalance()
  const accentColor = useThemeColor('success')
  const warningColor = useThemeColor('warning')
  const dangerColor = useThemeColor('danger')
  const mutedColor = useThemeColor('muted')

  const walletAddress = account?.address
  const truncatedWallet = walletAddress
    ? ellipsify(walletAddress)
    : 'Not connected'

  async function handleCopyWallet() {
    if (walletAddress) {
      await Clipboard.setStringAsync(walletAddress)
    }
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
            Level {state.level} Stacker
          </Text>
          {walletAddress && (
            <Text className="mt-1 font-mono text-muted text-sm">
              {ellipsify(walletAddress, 6)}
            </Text>
          )}
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
          {balance !== null && (
            <View className="mt-3 flex-row items-center gap-2 border-background border-t pt-3">
              <Ionicons name="diamond" size={18} color={accentColor} />
              <Text className="font-semibold text-foreground text-lg">
                {balance.toLocaleString()}
              </Text>
              <Text className="text-muted text-sm">STACK</Text>
            </View>
          )}
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

        {/* Rewards */}
        <Text className="mb-3 font-semibold text-foreground text-lg">
          Rewards
        </Text>
        <View className="mb-6">
          <RewardsFeature />
        </View>

        {/* Sync Status */}
        <Card variant="secondary" className="mb-6 p-4">
          <View className="flex-row items-center gap-3">
            <Ionicons
              name={saveStatus.icon}
              size={22}
              color={
                saveStatus.color === 'success'
                  ? accentColor
                  : saveStatus.color === 'warning'
                    ? warningColor
                    : dangerColor
              }
            />
            <Text className="text-foreground text-sm">{saveStatus.label}</Text>
          </View>
        </Card>

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
