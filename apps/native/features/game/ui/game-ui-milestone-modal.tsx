import { Ionicons } from '@expo/vector-icons'
import type { Milestone } from '@solana-stack-attack/game-util/game-milestones'
import { useEffect, useRef } from 'react'
import { Animated, Modal, Pressable, Text, View } from 'react-native'

interface GameUiMilestoneModalProps {
  milestone: Milestone | null
  onDismiss: () => void
}

export function GameUiMilestoneModal({
  milestone,
  onDismiss,
}: GameUiMilestoneModalProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current
  const opacityAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (milestone) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start()
    } else {
      scaleAnim.setValue(0)
      opacityAnim.setValue(0)
    }
  }, [milestone, scaleAnim, opacityAnim])

  if (!milestone) {
    return null
  }

  function handleDismiss() {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss()
    })
  }

  return (
    <Modal transparent visible={!!milestone} animationType="none">
      <Animated.View
        className="flex-1 items-center justify-center bg-black/70"
        style={{ opacity: opacityAnim }}
      >
        <Pressable className="absolute inset-0" onPress={handleDismiss} />
        <Animated.View
          className="mx-6 items-center rounded-3xl border-2 border-yellow-400 bg-slate-900 p-8 shadow-lg"
          style={{ transform: [{ scale: scaleAnim }] }}
        >
          {/* Trophy Icon */}
          <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-yellow-400/20">
            <Ionicons
              name={milestone.icon as keyof typeof Ionicons.glyphMap}
              size={40}
              color="#facc15" // yellow-400
            />
          </View>

          {/* Achievement Text */}
          <Text className="mb-4 text-6xl">🎉</Text>
          <Text className="mb-2 font-bold text-2xl text-white">
            Achievement Unlocked!
          </Text>
          <Text className="mb-2 font-semibold text-xl text-yellow-400">
            {milestone.name}
          </Text>
          <Text className="mb-8 text-center text-base text-gray-400">
            {milestone.description}
          </Text>

          {/* Dismiss Button */}
          <Pressable
            onPress={handleDismiss}
            className="rounded-xl bg-yellow-400 px-12 py-4 active:opacity-80"
          >
            <Text className="font-bold text-slate-900 text-xl">Awesome!</Text>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </Modal>
  )
}
