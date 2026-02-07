import * as Haptics from 'expo-haptics'
import { useEffect, useRef } from 'react'
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native'

interface WelcomeBackModalProps {
  earnings: number
  onDismiss: () => void
}

export function WelcomeBackModal({
  earnings,
  onDismiss,
}: WelcomeBackModalProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current
  const coinsAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    // Haptic feedback on show
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)

    // Animate modal in
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start()

    // Animate coins counting up
    Animated.timing(coinsAnim, {
      toValue: earnings,
      duration: 1500,
      useNativeDriver: false,
    }).start()
  }, [earnings, scaleAnim, coinsAnim])

  const handleCollect = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    onDismiss()
  }

  return (
    <Modal transparent animationType="fade" visible>
      <View style={styles.overlay}>
        <Animated.View
          style={[styles.container, { transform: [{ scale: scaleAnim }] }]}
        >
          <Text style={styles.emoji}>🎉</Text>
          <Text style={styles.title}>Welcome Back!</Text>
          <Text style={styles.subtitle}>While you were away, you earned</Text>

          <View style={styles.earningsContainer}>
            <Animated.Text style={styles.earnings}>
              {coinsAnim.interpolate({
                inputRange: [0, earnings],
                outputRange: ['0', earnings.toLocaleString()],
              })}
            </Animated.Text>
            <Text style={styles.coinsLabel}>coins</Text>
          </View>

          <Pressable onPress={handleCollect} style={styles.button}>
            <Text style={styles.buttonText}>Collect!</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#1a1a2e',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    marginHorizontal: 24,
    borderWidth: 2,
    borderColor: '#ffd700',
    shadowColor: '#ffd700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#aaa',
    marginBottom: 24,
  },
  earningsContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 32,
  },
  earnings: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ffd700',
  },
  coinsLabel: {
    fontSize: 24,
    color: '#ffd700',
    marginLeft: 8,
  },
  button: {
    backgroundColor: '#ffd700',
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 12,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a2e',
  },
})
