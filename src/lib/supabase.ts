import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  return Boolean(url && key && url.startsWith('http') && !url.includes('your-project-ref'));
}

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }
  if (!supabaseInstance) {
    const url = process.env.SUPABASE_URL!;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY!;
    supabaseInstance = createClient(url, key, {
      auth: { persistSession: false },
    });
  }
  return supabaseInstance;
}

export const BUCKET_NAME = 'compliance-files';

/**
 * Uploads a file buffer directly to the Supabase Storage Bucket 'compliance-files'
 */
export async function uploadFileToSupabaseBucket(
  filePath: string,
  buffer: Buffer,
  contentType: string
): Promise<string | null> {
  const client = getSupabase();
  if (!client) return null;

  try {
    const { data, error } = await client.storage
      .from(BUCKET_NAME)
      .upload(filePath, buffer, {
        contentType,
        upsert: true,
      });

    if (error) {
      console.error('Supabase storage upload error:', error.message);
      return null;
    }

    // Get public URL
    const { data: publicUrlData } = client.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path);

    return publicUrlData.publicUrl;
  } catch (err: any) {
    console.error('Supabase upload exception:', err?.message || err);
    return null;
  }
}
