import { Button, Spinner } from 'heroui-native'

import { useSolanaSignIn } from '../data-access/use-solana-sign-in'

export function AuthUiSolanaSignInButton() {
  const { handleSignIn, isLoading } = useSolanaSignIn()

  return (
    <Button isDisabled={isLoading} onPress={handleSignIn} variant="secondary">
      {isLoading ? (
        <Spinner size="sm" />
      ) : (
        <Button.Label>Sign in with Solana</Button.Label>
      )}
    </Button>
  )
}
