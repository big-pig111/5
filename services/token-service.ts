import type { Connection, PublicKey } from "@solana/web3.js"
import { TOKEN_PROGRAM_ID, getAccount, getMint } from "@solana/spl-token"

export interface TokenInfo {
  mint: string
  address: string
  amount: number
  decimals: number
  symbol?: string
  name?: string
  logoURI?: string
}

export async function getTokenAccounts(connection: Connection, publicKey: PublicKey): Promise<TokenInfo[]> {
  try {
    const tokenAccounts = await connection.getTokenAccountsByOwner(publicKey, {
      programId: TOKEN_PROGRAM_ID,
    })

    const accounts: TokenInfo[] = []

    for (const tokenAccount of tokenAccounts.value) {
      try {
        const accountInfo = await getAccount(connection, tokenAccount.pubkey)
        const mintInfo = await getMint(connection, accountInfo.mint)

        accounts.push({
          mint: accountInfo.mint.toString(),
          address: tokenAccount.pubkey.toString(),
          amount: Number(accountInfo.amount) / Math.pow(10, mintInfo.decimals),
          decimals: mintInfo.decimals,
        })
      } catch (error) {
        console.error("Error processing token account:", error)
      }
    }

    return accounts
  } catch (error) {
    console.error("Error fetching token accounts:", error)
    return []
  }
}
