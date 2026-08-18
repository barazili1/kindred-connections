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

export function verifyAccessToken(token: string | null | undefined): { ok: boolean; userId?: string | undefined } {
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

/**
 * Validates Telegram Mini App initData (signed by Telegram with the bot token).
 * Lets the app mint a fresh access token when the old one expires.
 */
export function verifyInitData(initData: string): { ok: boolean; userId?: string | undefined } {
  const token = process.env["TELEGRAM_BOT_TOKEN"];
  if (!token || !initData) return { ok: false };
  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) return { ok: false };
  params.delete("hash");
  const dataCheckString = [...params.entries()]
    .map(([k, v]) => `${k}=${v}`)
    .sort()
    .join("\n");
  const secret = createHmac("sha256", "WebAppData").update(token).digest();
  const computed = createHmac("sha256", secret).update(dataCheckString).digest("hex");
  const a = Buffer.from(computed);
  const b = Buffer.from(hash);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return { ok: false };
  const authDate = Number(params.get("auth_date") ?? 0);
  if (!authDate || Date.now() / 1000 - authDate > 60 * 60 * 24) return { ok: false };
  try {
    const user = JSON.parse(params.get("user") ?? "{}");
    return { ok: true, userId: user?.id ? String(user.id) : undefined };
  } catch {
    return { ok: true };
  }
}
