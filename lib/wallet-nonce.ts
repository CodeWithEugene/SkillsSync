/**
 * In-memory nonce store for wallet linking (SIWE).
 * For production with multiple instances, use Redis or a DB table.
 */
const usedNonces = new Set<string>()
const NONCE_PREFIX = "SkillsSync wallet link. Nonce: "

export function createWalletLinkNonce(): string {
  const nonce = crypto.randomUUID().replace(/-/g, "")
  usedNonces.add(nonce)
  return nonce
}

export function getWalletLinkMessage(nonce: string): string {
  return `${NONCE_PREFIX}${nonce}`
}

export function consumeWalletLinkNonce(nonce: string): boolean {
  if (!usedNonces.has(nonce)) return false
  usedNonces.delete(nonce)
  return true
}

export function parseNonceFromMessage(message: string): string | null {
  if (!message.startsWith(NONCE_PREFIX)) return null
  return message.slice(NONCE_PREFIX.length).trim()
}
