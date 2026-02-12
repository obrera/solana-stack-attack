import type { Address, KeyPairSigner } from '@solana/kit'
import {
  appendTransactionMessageInstructions,
  createNoopSigner,
  createTransactionMessage,
  getBase64EncodedWireTransaction,
  partiallySignTransactionMessageWithSigners,
  pipe,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
} from '@solana/kit'
import {
  findAssociatedTokenPda,
  getBurnCheckedInstruction,
  TOKEN_2022_PROGRAM_ADDRESS,
} from '@solana-program/token-2022'

import type { SolanaClient } from './solana-client'

/**
 * Build a burn transaction that burns Token-2022 tokens from a user's ATA.
 * The transaction is signed by the fee payer (who pays for the tx).
 * The user's wallet must co-sign it (authority over their ATA).
 *
 * Returns base64-encoded partially-signed transaction for client-side signing.
 */
export async function buildBurnTransaction(
  client: SolanaClient,
  {
    amount,
    decimals,
    feePayer,
    mint,
    owner,
  }: {
    amount: bigint
    decimals: number
    feePayer: KeyPairSigner
    mint: Address
    owner: Address
  },
): Promise<{ transaction: string }> {
  // Find user's ATA
  const [userAta] = await findAssociatedTokenPda({
    mint,
    owner,
    tokenProgram: TOKEN_2022_PROGRAM_ADDRESS,
  })

  // Create a noop signer for the user — reserves a signature slot
  // without actually signing (the mobile wallet signs on the client)
  const ownerSigner = createNoopSigner(owner)

  // Build burn instruction — authority uses noop signer so tx expects user's signature
  const burnInstruction = getBurnCheckedInstruction({
    account: userAta,
    amount,
    authority: ownerSigner,
    decimals,
    mint,
  })

  const { value: latestBlockhash } = await client.rpc
    .getLatestBlockhash()
    .send()

  const transactionMessage = pipe(
    createTransactionMessage({ version: 0 }),
    (tx) => setTransactionMessageFeePayerSigner(feePayer, tx),
    (tx) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
    (tx) => appendTransactionMessageInstructions([burnInstruction], tx),
  )

  // Partially sign — fee payer signs, user's noop signer slot left empty
  const partiallySignedTx =
    await partiallySignTransactionMessageWithSigners(transactionMessage)

  // Serialize to base64 wire format
  const transaction = getBase64EncodedWireTransaction(partiallySignedTx)

  return { transaction }
}
