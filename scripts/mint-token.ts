/**
 * Mint the STACK token on devnet using Token-2022 with metadata extension.
 *
 * Usage:
 *   bun run scripts/mint-token.ts
 *
 * Environment:
 *   SOLANA_RPC_URL   - RPC endpoint (defaults to devnet)
 *   MINT_AUTHORITY    - Path to keypair JSON (defaults to ~/.config/solana/id.json)
 */

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  appendTransactionMessageInstructions,
  assertIsTransactionWithBlockhashLifetime,
  createEmptyClient,
  createKeyPairSignerFromBytes,
  createTransactionMessage,
  generateKeyPairSigner,
  getSignatureFromTransaction,
  pipe,
  sendAndConfirmTransactionFactory,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  signTransactionMessageWithSigners,
  some,
} from '@solana/kit'
import { rpc } from '@solana/kit-plugin-rpc'
import { getCreateAccountInstruction } from '@solana-program/system'
import {
  extension,
  findAssociatedTokenPda,
  getCreateAssociatedTokenInstructionAsync,
  getInitializeMetadataPointerInstruction,
  getInitializeMintInstruction,
  getInitializeTokenMetadataInstruction,
  getMintSize,
  getMintToInstruction,
  TOKEN_2022_PROGRAM_ADDRESS,
} from '@solana-program/token-2022'

function createSolanaClient({ url, urlWs }: { url: string; urlWs?: string }) {
  urlWs = urlWs ?? url.replace('http', 'ws').replace('8899', '8900')
  return createEmptyClient().use(rpc(url, urlWs ? { url: urlWs } : undefined))
}

const url = process.env.SOLANA_RPC_URL ?? 'https://api.devnet.solana.com'
const client = createSolanaClient({ url })

const KEYPAIR_PATH =
  process.env.MINT_AUTHORITY ??
  resolve(process.env.HOME ?? '~', '.config/solana/id.json')

const TOKEN_NAME = 'Solana Stack Attack'
const TOKEN_SYMBOL = 'STACK'
const TOKEN_URI =
  'https://raw.githubusercontent.com/obrera/solana-stack-attack/main/assets/token/metadata.json'
const TOKEN_DECIMALS = 9
const TOKEN_DESCRIPTION =
  'The tap-to-earn token for Solana Stack Attack. Stack blocks, earn STACK.'
const TOKEN_SUPPLY = 1_000_000_000n // 1 billion STACK
const TOKEN_SUPPLY_RAW = TOKEN_SUPPLY * 10n ** BigInt(TOKEN_DECIMALS)

async function main() {
  console.log('🎮 Minting STACK token on devnet...\n')

  // Load authority keypair
  const keypairBytes = new Uint8Array(
    JSON.parse(readFileSync(KEYPAIR_PATH, 'utf-8')),
  )
  const authority = await createKeyPairSignerFromBytes(keypairBytes)
  console.log('Authority:', authority.address)

  // Check balance
  const balance = await client.rpc
    .getBalance(authority.address, { commitment: 'confirmed' })
    .send()
  console.log('Balance:', Number(balance.value) / 1_000_000_000, 'SOL\n')

  if (balance.value < 10_000_000n) {
    console.error(
      '❌ Insufficient balance. Need at least 0.01 SOL for rent + fees.',
    )
    console.error('   Run: solana airdrop 1 --url devnet')
    process.exit(1)
  }

  // Generate mint keypair
  const mint = await generateKeyPairSigner()
  console.log('Mint address:', mint.address)

  // Define extensions
  const metadataExtension = extension('TokenMetadata', {
    updateAuthority: some(authority.address),
    mint: mint.address,
    name: TOKEN_NAME,
    symbol: TOKEN_SYMBOL,
    uri: TOKEN_URI,
    additionalMetadata: new Map().set('description', TOKEN_DESCRIPTION),
  })

  const metadataPointerExtension = extension('MetadataPointer', {
    authority: authority.address,
    metadataAddress: mint.address,
  })

  // Calculate space and rent
  const spaceWithoutMetadata = BigInt(getMintSize([metadataPointerExtension]))
  const spaceWithMetadata = BigInt(
    getMintSize([metadataPointerExtension, metadataExtension]),
  )

  const rent = await client.rpc
    .getMinimumBalanceForRentExemption(spaceWithMetadata)
    .send()

  const { value: latestBlockhash } = await client.rpc
    .getLatestBlockhash()
    .send()

  // Build instructions
  const createMintAccountInstruction = getCreateAccountInstruction({
    payer: authority,
    newAccount: mint,
    lamports: rent,
    space: spaceWithoutMetadata,
    programAddress: TOKEN_2022_PROGRAM_ADDRESS,
  })

  const initializeMetadataPointerInstruction =
    getInitializeMetadataPointerInstruction({
      mint: mint.address,
      authority: authority.address,
      metadataAddress: mint.address,
    })

  const initializeMintInstruction = getInitializeMintInstruction({
    mint: mint.address,
    decimals: TOKEN_DECIMALS,
    mintAuthority: authority.address,
    freezeAuthority: authority.address,
  })

  const initializeMetadataInstruction = getInitializeTokenMetadataInstruction({
    metadata: mint.address,
    updateAuthority: authority.address,
    mint: mint.address,
    mintAuthority: authority,
    name: TOKEN_NAME,
    symbol: TOKEN_SYMBOL,
    uri: TOKEN_URI,
  })

  const instructions = [
    createMintAccountInstruction,
    initializeMetadataPointerInstruction,
    initializeMintInstruction,
    initializeMetadataInstruction,
  ]

  // Build, sign, send
  const transactionMessage = pipe(
    createTransactionMessage({ version: 0 }),
    (tx) => setTransactionMessageFeePayerSigner(authority, tx),
    (tx) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
    (tx) => appendTransactionMessageInstructions(instructions, tx),
  )

  console.log('\nSigning and sending transaction...')
  const signedTransaction =
    await signTransactionMessageWithSigners(transactionMessage)
  assertIsTransactionWithBlockhashLifetime(signedTransaction)
  await sendAndConfirmTransactionFactory(client)(signedTransaction, {
    commitment: 'confirmed',
    skipPreflight: true,
  })

  const signature = getSignatureFromTransaction(signedTransaction)

  console.log('\n✅ Mint created!')
  console.log('  Mint address:', mint.address)
  console.log(
    `  Transaction: https://explorer.solana.com/tx/${signature}?cluster=devnet`,
  )

  // Step 2: Create ATA and mint supply
  console.log(
    `\nCreating ATA and minting ${TOKEN_SUPPLY.toLocaleString()} STACK...`,
  )

  const createAtaInstruction = await getCreateAssociatedTokenInstructionAsync({
    payer: authority,
    mint: mint.address,
    owner: authority.address,
  })

  const [ataAddress] = await findAssociatedTokenPda({
    mint: mint.address,
    owner: authority.address,
    tokenProgram: TOKEN_2022_PROGRAM_ADDRESS,
  })

  const mintToInstruction = getMintToInstruction({
    mint: mint.address,
    token: ataAddress,
    mintAuthority: authority,
    amount: TOKEN_SUPPLY_RAW,
  })

  const { value: latestBlockhash2 } = await client.rpc
    .getLatestBlockhash()
    .send()

  const mintSupplyMessage = pipe(
    createTransactionMessage({ version: 0 }),
    (tx) => setTransactionMessageFeePayerSigner(authority, tx),
    (tx) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash2, tx),
    (tx) =>
      appendTransactionMessageInstructions(
        [createAtaInstruction, mintToInstruction],
        tx,
      ),
  )

  const signedMintSupply =
    await signTransactionMessageWithSigners(mintSupplyMessage)
  assertIsTransactionWithBlockhashLifetime(signedMintSupply)
  await sendAndConfirmTransactionFactory(client)(signedMintSupply, {
    commitment: 'confirmed',
    skipPreflight: true,
  })

  const mintSupplySignature = getSignatureFromTransaction(signedMintSupply)

  console.log('\n✅ STACK token fully deployed!\n')
  console.log('  Mint address:', mint.address)
  console.log('  Token account (ATA):', ataAddress)
  console.log('  Name:', TOKEN_NAME)
  console.log('  Symbol:', TOKEN_SYMBOL)
  console.log('  Decimals:', TOKEN_DECIMALS)
  console.log('  Supply:', TOKEN_SUPPLY.toLocaleString(), 'STACK')
  console.log('  Metadata URI:', TOKEN_URI)
  console.log(
    `\n  Explorer: https://explorer.solana.com/address/${mint.address}?cluster=devnet`,
  )
  console.log(
    `  Mint tx: https://explorer.solana.com/tx/${signature}?cluster=devnet`,
  )
  console.log(
    `  Supply tx: https://explorer.solana.com/tx/${mintSupplySignature}?cluster=devnet`,
  )
}

main().catch((err) => {
  console.error('❌ Error:', err)
  process.exit(1)
})
