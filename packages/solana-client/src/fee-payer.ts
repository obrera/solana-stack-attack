import { readFileSync } from 'node:fs'

import { createKeyPairSignerFromBytes } from '@solana/kit'

/**
 * Load the fee payer signer from a JSON keypair string or a file path.
 * Accepts either a JSON array of bytes (same format as `solana-keygen`)
 * or a path to a JSON keypair file.
 */
export async function getFeePayer(keypairJsonOrPath: string) {
  const raw = keypairJsonOrPath.trimStart().startsWith('[')
    ? keypairJsonOrPath
    : readFileSync(keypairJsonOrPath, 'utf-8')
  const keypairBytes = new Uint8Array(JSON.parse(raw))
  return createKeyPairSignerFromBytes(keypairBytes)
}
