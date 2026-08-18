import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type Platform = {
  key: string;
  name: string;
  emoji: string;
  downloadUrl: string;
  enabled: boolean;
  sortOrder: number;
};

export async function listPlatforms(): Promise<Platform[]> {
  const { data, error } = await supabaseAdmin
    .from("telegram_platforms")
    .select("key,name,emoji,download_url,enabled,sort_order")
    .order("sort_order", { ascending: true });
  if (error || !data) {
    console.error("Could not load platforms:", error?.message);
    return [];
  }
  return (data as Record<string, any>[]).map((r) => ({
    key: r["key"],
    name: r["name"],
    emoji: r["emoji"] ?? "🎰",
    downloadUrl: r["download_url"],
    enabled: r["enabled"] !== false,
    sortOrder: r["sort_order"] ?? 100,
  }));
}

export async function getPlatform(key: string): Promise<Platform | null> {
  const all = await listPlatforms();
  return all.find((p) => p.key === key) ?? null;
}

/** Creates a platform with an auto-generated key (p5, p6, …). */
export async function addPlatform(name: string, downloadUrl: string, emoji = "🎰") {
  const all = await listPlatforms();
  let n = all.length + 1;
  const used = new Set(all.map((p) => p.key));
  while (used.has(`p${n}`)) n += 1;
  const sort = all.reduce((max, p) => Math.max(max, p.sortOrder), 0) + 1;
  const { error } = await supabaseAdmin.from("telegram_platforms").insert({
    key: `p${n}`,
    name,
    emoji,
    download_url: downloadUrl,
    sort_order: sort,
  } as any);
  if (error) throw new Error(error.message);
  return `p${n}`;
}

export async function deletePlatform(key: string) {
  const { error } = await supabaseAdmin.from("telegram_platforms").delete().eq("key", key);
  if (error) throw new Error(error.message);
}

export async function setPlatformEnabled(key: string, enabled: boolean) {
  const { error } = await supabaseAdmin
    .from("telegram_platforms")
    .update({ enabled } as any)
    .eq("key", key);
  if (error) throw new Error(error.message);
}

export async function setPlatformUrl(key: string, downloadUrl: string) {
  const { error } = await supabaseAdmin
    .from("telegram_platforms")
    .update({ download_url: downloadUrl } as any)
    .eq("key", key);
  if (error) throw new Error(error.message);
}

export async function setPlatformName(key: string, name: string) {
  const { error } = await supabaseAdmin
    .from("telegram_platforms")
    .update({ name } as any)
    .eq("key", key);
  if (error) throw new Error(error.message);
}
