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
