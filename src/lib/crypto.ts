import * as crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
// In production, this MUST come from environment variables
// 32 bytes for AES-256
const SECRET_KEY = process.env.DB_ENCRYPTION_KEY || "nanoai-default-dev-key-32chars!!";

/**
 * Encrypts a plaintext string using AES-256-GCM.
 * Returns format: iv:encrypted_text:auth_tag (all hex-encoded)
 */
export function encryptKey(text: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(SECRET_KEY), iv);

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag().toString("hex");

  return `${iv.toString("hex")}:${encrypted}:${authTag}`;
}

/**
 * Decrypts a ciphertext string produced by encryptKey().
 */
export function decryptKey(encryptedText: string): string {
  const [ivHex, encryptedHex, authTagHex] = encryptedText.split(":");

  const iv = Buffer.from(ivHex, "hex");
  const encrypted = Buffer.from(encryptedHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");

  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(SECRET_KEY), iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, undefined, "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}