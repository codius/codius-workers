import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const centsToString = (amount: number): string =>
  `$${(amount / 100).toFixed(2)}`

export const centsToNanocents = (amount: number): bigint =>
  BigInt(amount) * 1_000_000_000n

export const nanocentsToString = (amount: bigint): string => {
  const isNegative = amount < 0n
  let nanocentsStr = amount.toString()

  if (isNegative) {
    nanocentsStr = nanocentsStr.substring(1)
  }

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
  const trimmedCents = cents.length > 2 ? cents.replace(/0+$/, "") : cents

  return `${isNegative ? "-" : ""}$${dollars}.${trimmedCents.padEnd(2, "0")}`
}
