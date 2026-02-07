import { Ionicons } from '@expo/vector-icons'
import { useQuery } from '@tanstack/react-query'
import { Card, Chip, useThemeColor } from 'heroui-native'
import { Text, View } from 'react-native'
import { AuthUiUserMenu } from '@/features/auth/ui/auth-ui-user-menu'
import { orpc } from '@/features/core/util/core-orpc'
import { SolanaUiConnect } from '@/features/solana/ui/solana-ui-connect'
import { UiContainer } from '@/features/ui/ui/ui-container'

export default function Home() {
  const healthCheck = useQuery(orpc.healthCheck.queryOptions())
  const privateData = useQuery(orpc.privateData.queryOptions())
  const isConnected = healthCheck?.data === 'OK'
  const isLoading = healthCheck?.isLoading

  const mutedColor = useThemeColor('muted')
  const successColor = useThemeColor('success')
  const dangerColor = useThemeColor('danger')

  return (
    <UiContainer className="space-y-6 p-6">
      <View className="mb-6 py-4">
        <Text className="mb-2 font-bold text-4xl text-foreground">
          Stack Attack
        </Text>
      </View>

      <View className="mb-6">
        <SolanaUiConnect />
      </View>

      <AuthUiUserMenu />

      <Card variant="secondary" className="p-6">
        <View className="mb-4 flex-row items-center justify-between">
          <Card.Title>System Status</Card.Title>
          <Chip
            variant="secondary"
            color={isConnected ? 'success' : 'danger'}
            size="sm"
          >
            <Chip.Label>{isConnected ? 'LIVE' : 'OFFLINE'}</Chip.Label>
          </Chip>
        </View>

        <Card className="p-4">
          <View className="flex-row items-center">
            <View
              className={`mr-3 h-3 w-3 rounded-full ${isConnected ? 'bg-success' : 'bg-muted'}`}
            />
            <View className="flex-1">
              <Text className="mb-1 font-medium text-foreground">
                ORPC Backend
              </Text>
              <Card.Description>
                {isLoading
                  ? 'Checking connection...'
                  : isConnected
                    ? 'Connected to API'
                    : 'API Disconnected'}
              </Card.Description>
            </View>
            {isLoading && (
              <Ionicons name="hourglass-outline" size={20} color={mutedColor} />
            )}
            {!isLoading && isConnected && (
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={successColor}
              />
            )}
            {!isLoading && !isConnected && (
              <Ionicons name="close-circle" size={20} color={dangerColor} />
            )}
          </View>
        </Card>
      </Card>

      <Card variant="secondary" className="my-6 p-4">
        <Card.Title className="mb-3">Private Data</Card.Title>
        <Card.Description>
          {privateData.data?.message || 'Loading...'}
        </Card.Description>
      </Card>
    </UiContainer>
  )
}
