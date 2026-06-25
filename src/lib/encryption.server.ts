import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const IV_BYTES = 12;
const TAG_BYTES = 16;

function getKey(): Buffer {
  const secret = process.env.API_KEY_ENCRYPTION_SECRET;
  if (!secret) throw new Error("API_KEY_ENCRYPTION_SECRET is not set");
  // Derive a 32-byte key by hashing the secret deterministically.
  // Using a fixed-length slice keeps things simple; a proper KDF is overkill
  // for a server-side encryption key that is already generated securely.
  return Buffer.from(secret.padEnd(32, "\0").slice(0, 32), "utf8");
}

export function encryptApiKey(plaintext: string): string {
  const key = getKey();
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  // Layout: [12 bytes IV][16 bytes GCM tag][ciphertext]
  return Buffer.concat([iv, tag, encrypted]).toString("base64");
}

export function decryptApiKey(ciphertext: string): string {
  const key = getKey();
  const combined = Buffer.from(ciphertext, "base64");
  const iv = combined.subarray(0, IV_BYTES);
  const tag = combined.subarray(IV_BYTES, IV_BYTES + TAG_BYTES);
  const encrypted = combined.subarray(IV_BYTES + TAG_BYTES);
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  return decipher.update(encrypted).toString("utf8") + decipher.final("utf8");
}

export function getLastFour(key: string): string {
  return key.length > 4 ? `...${key.slice(-4)}` : "...****";
}
