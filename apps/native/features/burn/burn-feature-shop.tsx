import { Ionicons } from '@expo/vector-icons'
import { Card, Spinner, useThemeColor } from 'heroui-native'
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native'

import { useGameContext } from '@/features/game/data-access/game-provider'
import { UiContainer } from '@/features/ui/ui/ui-container'
import {
  useBurnPurchase,
  useBurnPurchased,
  useBurnSpendableBalance,
  useBurnUpgrades,
  useClaimAll,
  useFuelCellInfo,
  useFuelCellPurchase,
} from './data-access/use-burn-upgrades'
import { BurnUiUpgradeCard } from './ui/burn-ui-upgrade-card'

export function BurnFeatureShop() {
  const accentColor = useThemeColor('success')
  const dangerColor = useThemeColor('danger')
  const warningColor = useThemeColor('warning')
  const mutedColor = useThemeColor('muted')

  const { data: upgrades, isLoading: upgradesLoading } = useBurnUpgrades()
  const { data: purchased, isLoading: purchasedLoading } = useBurnPurchased()
  const { data: balance, isLoading: balanceLoading } = useBurnSpendableBalance()
  const { data: fuelCell } = useFuelCellInfo()
  const purchaseMutation = useBurnPurchase()
  const fuelCellMutation = useFuelCellPurchase()
  const claimAllMutation = useClaimAll()
  const { buyAll, refillEnergy } = useGameContext()

  const hasBuyAll = purchased?.includes('buy_all') ?? false
  const hasAutoClaim = purchased?.includes('auto_claim') ?? false

  const isLoading = upgradesLoading || purchasedLoading || balanceLoading

  function handlePurchase(upgradeId: string, name: string, cost: number) {
    Alert.alert(
      '🔥 Burn STACK',
      `Burn ${cost} STACK to unlock ${name}? This will burn tokens on-chain and cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Burn It 🔥',
          style: 'destructive',
          onPress: () => purchaseMutation.mutate(upgradeId),
        },
      ],
    )
  }

  function handleFuelCell() {
    if (!fuelCell) return
    Alert.alert(
      '⚡ Fuel Cell',
      `Burn ${fuelCell.displayCost} STACK to fully recharge energy?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Recharge ⚡',
          style: 'destructive',
          onPress: () =>
            fuelCellMutation.mutate(undefined, {
              onSuccess: () => refillEnergy(),
            }),
        },
      ],
    )
  }

  function handleBuyAll() {
    const count = buyAll()
    if (count > 0) {
      Alert.alert('🛒 Buy All', `Bought upgrades for ${count} points!`)
    } else {
      Alert.alert('🛒 Buy All', "Can't afford any upgrades right now.")
    }
  }

  function handleClaimAll() {
    claimAllMutation.mutate(undefined, {
      onSuccess: (data) => {
        Alert.alert(
          '⚡ Claimed!',
          `Claimed ${data.claimed} rewards for ${data.displayTotalAmount} STACK!`,
        )
      },
    })
  }

  return (
    <UiContainer className="flex-1">
      <ScrollView className="flex-1 p-4">
        {/* Header */}
        <View className="mb-4 items-center">
          <Text className="text-4xl">🔥</Text>
          <Text className="mt-1 font-bold text-2xl text-foreground">
            Burn Shop
          </Text>
          <Text className="mt-1 text-center text-muted text-sm">
            Burn your STACK tokens for permanent upgrades
          </Text>
        </View>

        {/* Balance Card */}
        <Card variant="secondary" className="mb-6 p-4">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-muted text-sm">Spendable STACK</Text>
              {balanceLoading ? (
                <Spinner size="sm" color="default" />
              ) : (
                <Text
                  className="font-bold text-3xl"
                  style={{ color: dangerColor }}
                >
                  {balance?.displaySpendable ?? 0}
                </Text>
              )}
            </View>
            <View className="items-end">
              <Text className="text-muted text-xs">Total Burned</Text>
              <Text className="font-semibold text-foreground">
                🔥 {balance?.displayTotalBurned ?? 0}
              </Text>
            </View>
          </View>
        </Card>

        {/* Quick Actions (unlocked via burns) */}
        {(hasBuyAll || hasAutoClaim) && (
          <View className="mb-6 gap-3">
            <Text className="font-semibold text-foreground text-lg">
              ⚡ Quick Actions
            </Text>
            <View className="flex-row gap-3">
              {hasBuyAll && (
                <Pressable
                  onPress={handleBuyAll}
                  className="flex-1 items-center rounded-xl p-4"
                  style={{ backgroundColor: `${accentColor}20` }}
                >
                  <Ionicons name="cart" size={28} color={accentColor} />
                  <Text
                    style={{ color: accentColor }}
                    className="mt-1 font-semibold text-sm"
                  >
                    Buy All
                  </Text>
                </Pressable>
              )}
              {hasAutoClaim && (
                <Pressable
                  onPress={handleClaimAll}
                  disabled={claimAllMutation.isPending}
                  className="flex-1 items-center rounded-xl p-4"
                  style={{
                    backgroundColor: `${accentColor}20`,
                    opacity: claimAllMutation.isPending ? 0.5 : 1,
                  }}
                >
                  {claimAllMutation.isPending ? (
                    <ActivityIndicator size={28} color={accentColor} />
                  ) : (
                    <Ionicons name="gift" size={28} color={accentColor} />
                  )}
                  <Text
                    style={{ color: accentColor }}
                    className="mt-1 font-semibold text-sm"
                  >
                    Claim All
                  </Text>
                </Pressable>
              )}
            </View>
          </View>
        )}

        {/* Loading State */}
        {isLoading && (
          <View className="items-center py-8">
            <Spinner size="lg" color="default" />
          </View>
        )}

        {/* Fuel Cell (repeatable) */}
        {fuelCell && (
          <>
            <Text className="mb-3 font-semibold text-foreground text-lg">
              ⚡ Fuel Cell
            </Text>
            <Card variant="secondary" className="mb-6 p-4">
              <View className="flex-row items-center gap-4">
                <View
                  className="h-12 w-12 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${warningColor}20` }}
                >
                  <Ionicons name="flash" size={24} color={warningColor} />
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center gap-2">
                    <Text className="font-semibold text-foreground">
                      {fuelCell.name}
                    </Text>
                    {fuelCell.timesPurchased > 0 && (
                      <View
                        className="rounded px-2 py-0.5"
                        style={{ backgroundColor: `${warningColor}30` }}
                      >
                        <Text
                          style={{ color: warningColor }}
                          className="font-medium text-xs"
                        >
                          ×{fuelCell.timesPurchased}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text className="text-muted text-sm">
                    {fuelCell.description}
                  </Text>
                </View>
                <Pressable
                  onPress={handleFuelCell}
                  disabled={
                    (balance?.spendable ?? 0) < fuelCell.cost ||
                    fuelCellMutation.isPending
                  }
                  className="flex-row items-center gap-1 rounded-lg px-4 py-2"
                  style={{
                    backgroundColor:
                      (balance?.spendable ?? 0) >= fuelCell.cost
                        ? warningColor
                        : mutedColor,
                    opacity:
                      (balance?.spendable ?? 0) >= fuelCell.cost &&
                      !fuelCellMutation.isPending
                        ? 1
                        : 0.5,
                  }}
                >
                  {fuelCellMutation.isPending ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <>
                      <Text className="font-semibold text-white">
                        {fuelCell.displayCost}
                      </Text>
                      <Text className="text-white/80 text-xs">🔥</Text>
                    </>
                  )}
                </Pressable>
              </View>
            </Card>
          </>
        )}

        {/* Permanent Upgrades */}
        {!isLoading && upgrades && (
          <>
            <Text className="mb-3 font-semibold text-foreground text-lg">
              🔥 Permanent Upgrades
            </Text>
            <View className="gap-3 pb-8">
              {upgrades.map((upgrade) => {
                const isPurchased = purchased?.includes(upgrade.id) ?? false
                const canAfford =
                  (balance?.spendable ?? 0) >= upgrade.cost && !isPurchased

                return (
                  <BurnUiUpgradeCard
                    key={upgrade.id}
                    name={upgrade.name}
                    description={upgrade.description}
                    icon={upgrade.icon}
                    displayCost={upgrade.displayCost}
                    isPurchased={isPurchased}
                    canAfford={canAfford}
                    isPurchasing={
                      purchaseMutation.isPending &&
                      purchaseMutation.variables === upgrade.id
                    }
                    accentColor={accentColor}
                    dangerColor={dangerColor}
                    mutedColor={mutedColor}
                    onPurchase={() =>
                      handlePurchase(
                        upgrade.id,
                        upgrade.name,
                        upgrade.displayCost,
                      )
                    }
                  />
                )
              })}
            </View>
          </>
        )}

        {/* Info */}
        <View className="mb-8 items-center">
          <Text className="text-center text-muted text-xs">
            💡 Claim STACK from milestones, then burn them here.{'\n'}
            Burning STACK boosts your leaderboard ranking!
          </Text>
        </View>
      </ScrollView>
    </UiContainer>
  )
}
