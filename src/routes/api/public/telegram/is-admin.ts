import { createFileRoute } from "@tanstack/react-router";

/**
 * Public check: is a given Telegram user id a bot admin?
 * GET /api/public/telegram/is-admin?id=123456789 -> { admin: boolean }
 */
export const Route = createFileRoute("/api/public/telegram/is-admin")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const id = url.searchParams.get("id");
        let admin = false;
        if (id && /^\d{3,20}$/.test(id)) {
          const { isAdminUser } = await import("@/lib/telegram/admins.server");
          admin = await isAdminUser(Number(id));
        }
        return new Response(JSON.stringify({ admin }), {
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store",
          },
        });
      },
    },
  },
});
