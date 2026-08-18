import { createFileRoute } from "@tanstack/react-router";

/**
 * Mints a fresh site-access token from Telegram Mini App initData.
 * POST /api/public/telegram/session { initData } -> { ok, token?, userId? }
 */
export const Route = createFileRoute("/api/public/telegram/session")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let out: { ok: boolean; token?: string; userId?: string } = { ok: false };
        try {
          const body = (await request.json()) as { initData?: string };
          const { verifyInitData, createAccessToken } = await import(
            "@/lib/telegram/access.server"
          );
          const res = verifyInitData(body.initData ?? "");
          if (res.ok) {
            out = { ok: true, token: createAccessToken(res.userId ?? "1"), userId: res.userId };
          }
        } catch {
          out = { ok: false };
        }
        return new Response(JSON.stringify(out), {
          headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
        });
      },
    },
  },
});
