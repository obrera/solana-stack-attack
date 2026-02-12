import type { Address, KeyPairSigner } from '@solana/kit'
import {
  appendTransactionMessageInstructions,
  assertIsTransactionWithBlockhashLifetime,
  createTransactionMessage,
  getSignatureFromTransaction,
  pipe,
  sendAndConfirmTransactionFactory,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  signTransactionMessageWithSigners,
} from '@solana/kit'
import {
  findAssociatedTokenPda,
  getCreateAssociatedTokenIdempotentInstructionAsync,
  getTransferCheckedInstruction,
  TOKEN_2022_PROGRAM_ADDRESS,
} from '@solana-program/token-2022'

import type { SolanaClient } from './solana-client'

/**
 * Transfer Token-2022 tokens from the fee payer to a recipient.
 * Creates the recipient's ATA if it doesn't exist (idempotent).
 * Returns the transaction signature.
 */
export async function transferToken(
  client: SolanaClient,
  {
    amount,
    decimals,
    feePayer,
    mint,
    recipient,
  }: {
    amount: bigint
    decimals: number
    feePayer: KeyPairSigner
    mint: Address
    recipient: Address
  },
): Promise<string> {
  // Find ATAs
  const [sourceAta] = await findAssociatedTokenPda({
    mint,
    owner: feePayer.address,
    tokenProgram: TOKEN_2022_PROGRAM_ADDRESS,
  })

  const [destinationAta] = await findAssociatedTokenPda({
    mint,
    owner: recipient,
    tokenProgram: TOKEN_2022_PROGRAM_ADDRESS,
  })

  // Create destination ATA if needed (idempotent)
  const createAtaInstruction =
    await getCreateAssociatedTokenIdempotentInstructionAsync({
      mint,
      owner: recipient,
      payer: feePayer,
    })

  // Transfer tokens
  const transferInstruction = getTransferCheckedInstruction({
    amount,
    authority: feePayer,
    decimals,
    destination: destinationAta,
    mint,
    source: sourceAta,
  })

  const { value: latestBlockhash } = await client.rpc
    .getLatestBlockhash()
    .send()

  const transactionMessage = pipe(
    createTransactionMessage({ version: 0 }),
    (tx) => setTransactionMessageFeePayerSigner(feePayer, tx),
    (tx) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
    (tx) =>
      appendTransactionMessageInstructions(
        [createAtaInstruction, transferInstruction],
        tx,
      ),
  )

  const signedTransaction =
    await signTransactionMessageWithSigners(transactionMessage)
  assertIsTransactionWithBlockhashLifetime(signedTransaction)

  await sendAndConfirmTransactionFactory(client)(signedTransaction, {
    commitment: 'confirmed',
    skipPreflight: true,
  })

  return getSignatureFromTransaction(signedTransaction)
}
