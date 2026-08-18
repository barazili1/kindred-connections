import { createHmac, timingSafeEqual } from "node:crypto";

/** Access tokens are valid for 12 hours. */
const TTL_MS = 12 * 60 * 60 * 1000;

function key(): string {
  const token = process.env["TELEGRAM_BOT_TOKEN"];
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN is not configured");
  return `nova-site-access:${token}`;
}

function sign(payload: string): string {
  return createHmac("sha256", key()).update(payload).digest("base64url");
}

/** token = <userId>.<expiryMs>.<hmac> */
export function createAccessToken(userId: string | number): string {
  const exp = Date.now() + TTL_MS;
  const payload = `${userId}.${exp}`;
  return `${payload}.${sign(payload)}`;
}

export function verifyAccessToken(token: string | null | undefined): { ok: boolean; userId?: string } {
  if (!token) return { ok: false };
  const parts = token.split(".");
  if (parts.length !== 3) return { ok: false };
  const [userId, exp, sig] = parts as [string, string, string];
  const expected = sign(`${userId}.${exp}`);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return { ok: false };
  if (!/^\d+$/.test(exp) || Number(exp) < Date.now()) return { ok: false };
  return { ok: true, userId };
}
