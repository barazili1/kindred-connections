CREATE TABLE IF NOT EXISTS public.telegram_platforms (
  key text PRIMARY KEY,
  name text NOT NULL,
  emoji text NOT NULL DEFAULT '🎰',
  download_url text NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 100,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.telegram_platforms TO service_role;

ALTER TABLE public.telegram_platforms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role manages telegram platforms" ON public.telegram_platforms;
CREATE POLICY "Service role manages telegram platforms"
  ON public.telegram_platforms FOR ALL TO service_role USING (true) WITH CHECK (true);

INSERT INTO public.telegram_platforms (key, name, emoji, download_url, sort_order)
SELECT 'p1', 'Megapari', '🔵', s.platform_1_url, 1 FROM public.telegram_bot_settings s WHERE s.id = 1
ON CONFLICT (key) DO NOTHING;
INSERT INTO public.telegram_platforms (key, name, emoji, download_url, sort_order)
SELECT 'p2', 'PariPulse', '🔴', s.platform_2_url, 2 FROM public.telegram_bot_settings s WHERE s.id = 1
ON CONFLICT (key) DO NOTHING;
INSERT INTO public.telegram_platforms (key, name, emoji, download_url, sort_order)
SELECT 'p3', 'GoooBet', '🔷', s.platform_3_url, 3 FROM public.telegram_bot_settings s WHERE s.id = 1
ON CONFLICT (key) DO NOTHING;
INSERT INTO public.telegram_platforms (key, name, emoji, download_url, sort_order)
SELECT 'p4', 'WinWin', '🟢', s.platform_4_url, 4 FROM public.telegram_bot_settings s WHERE s.id = 1
ON CONFLICT (key) DO NOTHING;