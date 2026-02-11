import { createKeyPairSignerFromBytes } from '@solana/kit'

/**
 * Load the fee payer signer from a JSON keypair string.
 * The keypair should be a JSON array of bytes (same format as `solana-keygen`).
 */
export async function getFeePayer(keypairJson: string) {
  const keypairBytes = new Uint8Array(JSON.parse(keypairJson))
  return createKeyPairSignerFromBytes(keypairBytes)
}
