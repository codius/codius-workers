import { type ClassValue, clsx } from "clsx"
import { customAlphabet } from "nanoid"
import { twMerge } from "tailwind-merge"

export const nanoid: () => string = customAlphabet(
  // Cloudflare worker names must be lowercase alphanumeric
  "123456789abcdefghijkmnopqrstuvwxyz",
  16,
)

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const centsToString = (amount: number): string =>
  `$${(amount / 100).toFixed(2)}`

export const centsToNanocents = (amount: number): bigint =>
  BigInt(amount) * 1_000_000_000n

export const nanocentsToString = (amount: bigint): string => {
  let nanocentsStr = amount.toString()

  const neededLength = 12
  const currentLength = nanocentsStr.length
  if (currentLength < neededLength) {
    // Pad with zeros to ensure correct decimal placement
    nanocentsStr = "0".repeat(neededLength - currentLength) + nanocentsStr
  }

  const position = nanocentsStr.length - 11
  const dollars = nanocentsStr.substring(0, position)
  const cents = nanocentsStr.substring(position)

  // Remove trailing zeros after the decimal point
  const trimmedCents =
    cents.replace(/(0+)$/, "").length >= 2
      ? cents.replace(/(0+)$/, "")
      : cents.substring(0, 2)

  return `$${dollars}.${trimmedCents}`
}
