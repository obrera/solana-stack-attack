import { Card } from 'heroui-native'
import { View } from 'react-native'

import { UiContainer } from '@/features/ui/ui/ui-container'

export default function TabTwo() {
  return (
    <UiContainer className="p-6">
      <View className="flex-1 items-center justify-center">
        <Card variant="secondary" className="items-center p-8">
          <Card.Title className="mb-2 text-3xl">TabTwo</Card.Title>
        </Card>
      </View>
    </UiContainer>
  )
}
