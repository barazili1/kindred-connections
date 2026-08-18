ALTER TABLE public.telegram_bot_settings
  ADD COLUMN IF NOT EXISTS channel_chat_id text,
  ADD COLUMN IF NOT EXISTS platform_1_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS platform_2_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS platform_3_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS platform_4_enabled boolean NOT NULL DEFAULT true;