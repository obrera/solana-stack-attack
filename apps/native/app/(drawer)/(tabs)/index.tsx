import { Card } from 'heroui-native'
import { View } from 'react-native'

import { UiContainer } from '@/features/ui/ui/ui-container'

export default function Home() {
  return (
    <UiContainer className="p-6">
      <View className="flex-1 items-center justify-center">
        <Card variant="secondary" className="items-center p-8">
          <Card.Title className="mb-2 text-3xl">Tab One</Card.Title>
        </Card>
      </View>
    </UiContainer>
  )
}
