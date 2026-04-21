import crypto from "crypto";

export function generateApiKey(): {
  key: string;
  keyHash: string;
  keyPrefix: string;
} {
  const randomBytes = crypto.randomBytes(32).toString("hex");
  const key = `vm_${randomBytes}`;
  const keyHash = hashApiKey(key);
  const keyPrefix = key.slice(0, 8);
  return { key, keyHash, keyPrefix };
}

export function hashApiKey(key: string): string {
  return crypto.createHash("sha256").update(key).digest("hex");
}
