import type { Address } from '@solana/kit'
import {
  findAssociatedTokenPda,
  TOKEN_2022_PROGRAM_ADDRESS,
} from '@solana-program/token-2022'
import type { SolanaClient } from './solana-client'

/**
 * Get the token balance for a wallet address.
 * Returns the UI amount (human-readable) or 0 if no ATA exists.
 */
export async function getTokenBalance(
  client: Pick<SolanaClient, 'rpc'>,
  mint: Address,
  owner: Address,
): Promise<{ amount: bigint; decimals: number; uiAmount: number }> {
  const [ataAddress] = await findAssociatedTokenPda({
    mint,
    owner,
    tokenProgram: TOKEN_2022_PROGRAM_ADDRESS,
  })

  try {
    const response = await client.rpc
      .getTokenAccountBalance(ataAddress, { commitment: 'confirmed' })
      .send()

    return {
      amount: BigInt(response.value.amount),
      decimals: response.value.decimals,
      uiAmount: response.value.uiAmount ?? 0,
    }
  } catch {
    // ATA doesn't exist — wallet has no tokens
    return { amount: 0n, decimals: 9, uiAmount: 0 }
  }
}
