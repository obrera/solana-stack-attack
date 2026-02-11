import { getBase58Decoder } from '@solana/kit'
import type {
  SolanaAuthNonceResponse,
  SolanaAuthVerifyResponse,
} from '@solana-stack-attack/better-auth-solana/client'
import { useMobileWallet } from '@wallet-ui/react-native-kit'
import { useState } from 'react'
import { Alert } from 'react-native'

import { queryClient } from '@/features/core/util/core-orpc'

import { authClient } from './auth-client'

/**
 * Build a Sign-In With Solana (SIWS) message string.
 */
function buildSiwsMessage({
  address,
  domain,
  nonce,
  statement,
  uri,
  issuedAt,
  chainId,
}: {
  address: string
  chainId: string
  domain: string
  issuedAt: string
  nonce: string
  statement: string
  uri: string
}): string {
  return [
    `${domain} wants you to sign in with your Solana account:`,
    address,
    '',
    statement,
    '',
    `URI: ${uri}`,
    'Version: 1',
    `Chain ID: ${chainId}`,
    `Nonce: ${nonce}`,
    `Issued At: ${issuedAt}`,
  ].join('\n')
}

export function useSolanaSignIn() {
  const { account, connect, signMessage } = useMobileWallet()
  const [isLoading, setIsLoading] = useState(false)

  const handleSignIn = async () => {
    setIsLoading(true)
    try {
      const activeAccount = account || (await connect())
      const address = activeAccount.address

      const { data: nonce, error: nonceError } =
        await authClient.$fetch<SolanaAuthNonceResponse>('/solana-auth/nonce', {
          method: 'POST',
          body: { walletAddress: address },
        })

      if (nonceError || !nonce) {
        throw new Error(nonceError?.message || 'Failed to get nonce')
      }

      const message = buildSiwsMessage({
        address,
        chainId: nonce.chainId,
        domain: nonce.domain,
        issuedAt: nonce.issuedAt,
        nonce: nonce.nonce,
        statement: 'Sign in to Solana Stack Attack',
        uri: nonce.uri,
      })

      const messageBytes = new TextEncoder().encode(message)
      const signatureBytes = await signMessage(messageBytes)
      const signatureBase58 = getBase58Decoder().decode(signatureBytes)

      const { data: verifyData, error: verifyError } =
        await authClient.$fetch<SolanaAuthVerifyResponse>(
          '/solana-auth/verify',
          {
            method: 'POST',
            body: {
              walletAddress: address,
              signature: signatureBase58,
              message,
            },
          },
        )

      if (verifyError || !verifyData) {
        throw new Error(verifyError?.message || 'Verification failed')
      }

      queryClient.invalidateQueries()
      await authClient.getSession()
    } catch (error) {
      console.error('Solana sign in failed', error)
      Alert.alert(
        'Sign In Failed',
        error instanceof Error ? error.message : String(error),
      )
    } finally {
      setIsLoading(false)
    }
  }

  return {
    handleSignIn,
    isLoading,
  }
}
