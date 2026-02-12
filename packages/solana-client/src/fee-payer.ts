import { createKeyPairSignerFromBytes } from '@solana/kit'

/**
 * Load the fee payer signer from a JSON keypair string or a file path.
 * Accepts either a JSON array of bytes (same format as `solana-keygen`)
 * or a path to a JSON keypair file.
 */
export async function getFeePayer(keypairJsonOrPath: string) {
  let raw = keypairJsonOrPath
  if (!keypairJsonOrPath.trimStart().startsWith('[')) {
    const { readFileSync } = await import('node:fs')
    raw = readFileSync(keypairJsonOrPath, 'utf-8')
  }
  const keypairBytes = new Uint8Array(JSON.parse(raw))
  return createKeyPairSignerFromBytes(keypairBytes)
}
