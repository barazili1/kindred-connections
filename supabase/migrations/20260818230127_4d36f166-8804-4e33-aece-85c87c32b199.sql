CREATE TABLE public.telegram_bot_settings (
  id smallint PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  enabled boolean NOT NULL DEFAULT true,
  channel_url text NOT NULL DEFAULT 'https://t.me/novavip',
  support_url text NOT NULL DEFAULT 'https://t.me/novavip_support',
  platform_1_url text NOT NULL DEFAULT 'https://1xbet.com/',
  platform_2_url text NOT NULL DEFAULT 'https://1xbet.com/',
  promo_code text NOT NULL DEFAULT '1234',
  app_base_url text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.telegram_bot_settings TO service_role;

ALTER TABLE public.telegram_bot_settings ENABLE ROW LEVEL SECURITY;

INSERT INTO public.telegram_bot_settings (id) VALUES (1);

CREATE OR REPLACE FUNCTION public.set_telegram_bot_settings_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER telegram_bot_settings_updated_at
BEFORE UPDATE ON public.telegram_bot_settings
FOR EACH ROW
EXECUTE FUNCTION public.set_telegram_bot_settings_updated_at();

CREATE POLICY "Service role manages Telegram bot settings"
ON public.telegram_bot_settings
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

ALTER TABLE public.telegram_bot_settings
  ADD COLUMN IF NOT EXISTS platform_3_url text NOT NULL DEFAULT 'https://gooobetaffiliate.com/L?tag=d_2787091m_127929c_&site=2787091&ad=127929',
  ADD COLUMN IF NOT EXISTS platform_4_url text NOT NULL DEFAULT 'https://refpa98980.com/L?tag=d_5876143m_68383c_&site=5876143&ad=68383';

UPDATE public.telegram_bot_settings SET
  channel_url = 'https://t.me/+KA1g9YjXsmBmZmNk',
  support_url = 'https://t.me/TOPx111m',
  promo_code = 'Gooo33',
  platform_1_url = 'https://refpazitag.top/L?tag=d_2926243m_54987c_&site=2926243&ad=54987',
  platform_2_url = 'https://refpa22168.com/L?tag=d_3638295m_99042c_&site=3638295&ad=99042',
  platform_3_url = 'https://gooobetaffiliate.com/L?tag=d_2787091m_127929c_&site=2787091&ad=127929',
  platform_4_url = 'https://refpa98980.com/L?tag=d_5876143m_68383c_&site=5876143&ad=68383'
WHERE id = 1;

CREATE TABLE IF NOT EXISTS public.telegram_admins (
  telegram_id bigint PRIMARY KEY,
  label text,
  added_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.telegram_admins TO service_role;

ALTER TABLE public.telegram_admins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages telegram admins"
  ON public.telegram_admins FOR ALL TO service_role USING (true) WITH CHECK (true);

INSERT INTO public.telegram_admins (telegram_id, label)
VALUES (8358563622, 'owner')
ON CONFLICT (telegram_id) DO NOTHING;