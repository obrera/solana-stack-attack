import {
  ActivityIndicator,
  Animated,
  Modal,
  Pressable,
  Text,
  View,
} from 'react-native'

import { useGameAnimation } from '../data-access/use-game-animation'

interface GameUiWelcomeModalProps {
  earnings: number
  onDismiss: () => void
}

export function GameUiWelcomeModal({
  earnings,
  onDismiss,
}: GameUiWelcomeModalProps) {
  const { scaleAnim, displayValue, isReady, handleCollect } = useGameAnimation({
    earnings,
    onCollect: onDismiss,
  })

  return (
    <Modal transparent animationType="fade" visible>
      <View className="flex-1 items-center justify-center bg-black/70">
        <Animated.View
          style={{ transform: [{ scale: scaleAnim }] }}
          className="mx-6 items-center rounded-3xl border-2 border-yellow-400 bg-slate-900 p-8 shadow-lg"
        >
          <Text className="mb-4 text-6xl">🎉</Text>
          <Text className="mb-2 font-bold text-3xl text-white">
            Welcome Back!
          </Text>
          <Text className="mb-6 text-base text-gray-400">
            While you were away, you earned
          </Text>

          <View className="mb-8 flex-row items-baseline">
            {isReady ? (
              <>
                <Text className="font-bold text-5xl text-yellow-400">
                  {displayValue.toLocaleString()}
                </Text>
                <Text className="ml-2 text-2xl text-yellow-400">coins</Text>
              </>
            ) : (
              <ActivityIndicator size="large" color="#facc15" />
            )}
          </View>

          <Pressable
            onPress={handleCollect}
            className="rounded-xl bg-yellow-400 px-12 py-4 active:opacity-80"
          >
            <Text className="font-bold text-slate-900 text-xl">Collect!</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  )
}
