import type {
  SolanaSignInInput,
  UiWallet,
  UiWalletAccount,
} from '@wallet-ui/react'
import { useSignIn, useSignMessage } from '@wallet-ui/react'
import { useCallback } from 'react'

/** Minimal shape that both signIn and our signMessage fallback return */
interface SignInResult {
  account: { address: string }
  signedMessage: Uint8Array
  signature: Uint8Array
}

/**
 * Build a Sign In With Solana (SIWS) message string from the input fields.
 * Follows the SIWS spec: https://github.com/phantom/sign-in-with-solana
 */
function buildSiwsMessage(input: SolanaSignInInput): string {
  const lines: string[] = []

  if (input.domain) {
    lines.push(`${input.domain} wants you to sign in with your Solana account:`)
  }
  if (input.address) {
    lines.push(input.address)
  }
  if (input.statement) {
    lines.push('')
    lines.push(input.statement)
  }

  lines.push('')

  if (input.uri) {
    lines.push(`URI: ${input.uri}`)
  }
  if (input.version) {
    lines.push(`Version: ${input.version}`)
  }
  if (input.chainId) {
    lines.push(`Chain ID: ${input.chainId}`)
  }
  if (input.nonce) {
    lines.push(`Nonce: ${input.nonce}`)
  }
  if (input.issuedAt) {
    lines.push(`Issued At: ${input.issuedAt}`)
  }
  if (input.expirationTime) {
    lines.push(`Expiration Time: ${input.expirationTime}`)
  }
  if (input.requestId) {
    lines.push(`Request ID: ${input.requestId}`)
  }
  if (input.resources && input.resources.length > 0) {
    lines.push('Resources:')
    for (const resource of input.resources) {
      lines.push(`- ${resource}`)
    }
  }

  return lines.join('\n')
}

/**
 * A compatible version of useSignIn that falls back to signMessage
 * for wallets that don't support the solana:signIn feature (e.g. Jupiter).
 */
export function useSignInCompat(
  wallet: UiWallet,
  account: UiWalletAccount,
): (input: SolanaSignInInput) => Promise<SignInResult> {
  const supportsSignIn = wallet.features.includes('solana:signIn')
  // Always call both hooks unconditionally (React rules of hooks)
  const signIn = useSignIn(wallet)
  const signMessage = useSignMessage(account)

  return useCallback(
    async (input: SolanaSignInInput): Promise<SignInResult> => {
      if (supportsSignIn) {
        const result = await signIn(input)
        return {
          account: result.account,
          signedMessage: result.signedMessage,
          signature: result.signature,
        }
      }

      // Fallback: construct SIWS message and use signMessage
      console.log(
        '[Auth] Wallet does not support solana:signIn, falling back to signMessage',
      )
      const messageText = buildSiwsMessage(input)
      const messageBytes = new TextEncoder().encode(messageText)
      const { signature } = await signMessage({ message: messageBytes })

      return {
        account: { address: account.address },
        signedMessage: messageBytes,
        signature,
      }
    },
    [supportsSignIn, signIn, signMessage, account],
  )
}
