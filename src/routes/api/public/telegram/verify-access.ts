import { createFileRoute } from "@tanstack/react-router";

/**
 * Validates a signed site-access token issued by the bot.
 * GET /api/public/telegram/verify-access?tk=... -> { ok: boolean, userId?: string }
 */
export const Route = createFileRoute("/api/public/telegram/verify-access")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const tk = url.searchParams.get("tk");
        let result: { ok: boolean; userId?: string | undefined } = { ok: false };
        try {
          const { verifyAccessToken } = await import("@/lib/telegram/access.server");
          result = verifyAccessToken(tk);
        } catch {
          result = { ok: false };
        }
        return new Response(JSON.stringify(result), {
          headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
        });
      },
    },
  },
});
