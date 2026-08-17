import { createClient } from '@supabase/supabase-js';

const metaEnv = typeof import.meta !== 'undefined' ? (import.meta as any).env : undefined;
const procEnv = typeof process !== 'undefined' ? process.env : undefined;

const SUPABASE_URL =
  metaEnv?.VITE_SUPABASE_URL ||
  procEnv?.VITE_SUPABASE_URL ||
  'https://nvxnkwppyzhutkmfjohb.supabase.co';

const SUPABASE_ANON_KEY =
  metaEnv?.VITE_SUPABASE_ANON_KEY ||
  procEnv?.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52eG5rd3BweXpodXRrbWZqb2hiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0Mzc4MTYsImV4cCI6MjA5ODAxMzgxNn0.FSv7Fw31kMO2uhRqjuvZDLdtyaytZXWjRcQXVNS1Rkc';

export const SUPABASE_STORAGE_BUCKET =
  metaEnv?.VITE_SUPABASE_STORAGE_BUCKET ||
  procEnv?.VITE_SUPABASE_STORAGE_BUCKET ||
  'Tailorpro';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Helper to upload a File or Base64 Blob to Supabase Storage bucket ('Tailorpro').
 * Returns the public URL of the uploaded asset.
 */
export async function uploadToSupabaseStorage(
  fileOrBase64: File | string,
  fileName?: string
): Promise<string | null> {
  try {
    let fileToUpload: Blob;
    let finalFileName = fileName || `file_${Date.now()}`;

    if (typeof fileOrBase64 === 'string') {
      // Base64 string handling
      let base64Data = fileOrBase64;
      let contentType = 'image/jpeg';

      if (fileOrBase64.includes(';base64,')) {
        const parts = fileOrBase64.split(';base64,');
        const mimeMatch = parts[0].match(/data:(.*?)$/);
        if (mimeMatch) contentType = mimeMatch[1];
        base64Data = parts[1];
      }

      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      fileToUpload = new Blob([byteArray], { type: contentType });

      if (!fileName) {
        const ext = contentType.split('/')[1] || 'jpg';
        finalFileName = `fabric_${Date.now()}.${ext}`;
      }
    } else {
      fileToUpload = fileOrBase64;
      if (!fileName) {
        finalFileName = `${Date.now()}_${fileOrBase64.name}`;
      }
    }

    const filePath = `uploads/${finalFileName}`;

    const { data, error } = await supabase.storage
      .from(SUPABASE_STORAGE_BUCKET)
      .upload(filePath, fileToUpload, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.warn(`[Supabase Storage] Upload error to bucket '${SUPABASE_STORAGE_BUCKET}':`, error.message);
      return null;
    }

    const { data: publicUrlData } = supabase.storage
      .from(SUPABASE_STORAGE_BUCKET)
      .getPublicUrl(data.path);

    return publicUrlData?.publicUrl || null;
  } catch (err) {
    console.error('[Supabase Storage] Exception during file upload:', err);
    return null;
  }
}
