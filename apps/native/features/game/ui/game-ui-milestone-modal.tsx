import { Ionicons } from '@expo/vector-icons'
import { useThemeColor } from 'heroui-native'
import { useEffect, useRef } from 'react'
import { Animated, Modal, Pressable, Text, View } from 'react-native'

import type { Milestone } from '../util/game-milestones'

interface GameUiMilestoneModalProps {
  milestone: Milestone | null
  onDismiss: () => void
}

export function GameUiMilestoneModal({
  milestone,
  onDismiss,
}: GameUiMilestoneModalProps) {
  const warningColor = useThemeColor('warning')
  const backgroundColor = useThemeColor('background')

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
        className="flex-1 items-center justify-center bg-black/60"
        style={{ opacity: opacityAnim }}
      >
        <Pressable className="absolute inset-0" onPress={handleDismiss} />
        <Animated.View
          className="mx-8 items-center rounded-2xl p-8"
          style={{
            backgroundColor,
            transform: [{ scale: scaleAnim }],
          }}
        >
          {/* Trophy Icon */}
          <View
            className="mb-4 h-20 w-20 items-center justify-center rounded-full"
            style={{ backgroundColor: `${warningColor}20` }}
          >
            <Ionicons
              name={milestone.icon as keyof typeof Ionicons.glyphMap}
              size={40}
              color={warningColor}
            />
          </View>

          {/* Achievement Text */}
          <Text className="mb-1 font-bold text-2xl text-foreground">
            🎉 Achievement Unlocked!
          </Text>
          <Text
            className="mb-2 font-semibold text-xl"
            style={{ color: warningColor }}
          >
            {milestone.name}
          </Text>
          <Text className="mb-6 text-center text-muted">
            {milestone.description}
          </Text>

          {/* Dismiss Button */}
          <Pressable
            onPress={handleDismiss}
            className="rounded-lg px-8 py-3"
            style={{ backgroundColor: warningColor }}
          >
            <Text className="font-semibold text-white">Awesome!</Text>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </Modal>
  )
}
