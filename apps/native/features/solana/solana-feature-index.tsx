import { Ionicons } from '@expo/vector-icons'
import { useMutation } from '@tanstack/react-query'
import {
  Button,
  Input,
  Spinner,
  Surface,
  TextField,
  useThemeColor,
} from 'heroui-native'
import { useState } from 'react'
import { ScrollView, Text, View } from 'react-native'
import { orpc } from '@/features/core/util/core-orpc'
import { UiContainer } from '@/features/ui/ui/ui-container'

import { SolanaUiBalanceDisplay } from './ui/solana-ui-balance-display'

export function SolanaFeatureIndex() {
  const [address, setAddress] = useState(
    'SEekKY1iUoWYJqZ3d9QBsfJytNx5RLBjBmgznkGrqbH',
  )

  const balanceMutation = useMutation({
    ...orpc.solana.getBalance.mutationOptions(),
  })

  const mutedColor = useThemeColor('muted')
  const foregroundColor = useThemeColor('foreground')

  function handleCheckBalance() {
    if (address.trim()) {
      balanceMutation.mutate({ address })
    }
  }

  return (
    <UiContainer>
      <ScrollView className="flex-1" contentContainerClassName="p-4">
        <View className="mb-4 py-4">
          <View className="flex-row items-center gap-2">
            <Ionicons name="wallet-outline" size={24} color={foregroundColor} />
            <Text className="font-semibold text-2xl text-foreground tracking-tight">
              Solana Balance
            </Text>
          </View>
          <Text className="mt-1 text-muted text-sm">
            Check the balance of any Solana address
          </Text>
        </View>

        <Surface variant="secondary" className="mb-6 rounded-lg p-4">
          <Text className="mb-2 font-medium text-foreground text-sm">
            Wallet Address
          </Text>
          <View className="flex-row items-center gap-2">
            <View className="flex-1">
              <TextField>
                <Input
                  value={address}
                  onChangeText={setAddress}
                  placeholder="Enter Solana address..."
                  editable={!balanceMutation.isPending}
                  onSubmitEditing={handleCheckBalance}
                  returnKeyType="search"
                />
              </TextField>
            </View>
            <Button
              isIconOnly
              variant={
                balanceMutation.isPending || !address.trim()
                  ? 'secondary'
                  : 'primary'
              }
              isDisabled={balanceMutation.isPending || !address.trim()}
              onPress={handleCheckBalance}
              size="sm"
            >
              {balanceMutation.isPending ? (
                <Spinner size="sm" color="default" />
              ) : (
                <Ionicons
                  name="search"
                  size={20}
                  color={
                    balanceMutation.isPending || !address.trim()
                      ? mutedColor
                      : foregroundColor
                  }
                />
              )}
            </Button>
          </View>
        </Surface>

        <SolanaUiBalanceDisplay
          isIdle={balanceMutation.isIdle}
          isPending={balanceMutation.isPending}
          isError={balanceMutation.isError}
          error={balanceMutation.error}
          balance={balanceMutation.data?.value}
        />
      </ScrollView>
    </UiContainer>
  )
}
