import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const BUCKET = "project-assets";
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

const Input = z.object({
  analysisId: z.string().uuid().optional().nullable(),
  filename: z.string().min(1).max(200),
  mediaType: z.string().min(1).max(120),
  dataBase64: z.string().min(1),
});

function decodeBase64(b64: string): Uint8Array {
  const clean = b64.includes(",") ? b64.split(",", 2)[1] : b64;
  const bin = atob(clean);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

export const uploadReferenceImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data, context }) => {
    if (!data.mediaType.startsWith("image/")) {
      throw new Error("Only image uploads are accepted here");
    }
    const bytes = decodeBase64(data.dataBase64);
    if (bytes.byteLength === 0) throw new Error("Empty file");
    if (bytes.byteLength > MAX_IMAGE_BYTES) throw new Error("Image larger than 10MB");

    const { supabase, userId } = context;
    const safe = data.filename.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80);
    const path = `${userId}/refs/${data.analysisId ?? "any"}/${Date.now()}_${safe}`;
    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(path, bytes, { contentType: data.mediaType, upsert: false });
    if (upErr) throw new Error(upErr.message);

    const { data: signed, error: sErr } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(path, 60 * 60 * 24 * 7);
    if (sErr || !signed?.signedUrl) throw new Error(sErr?.message || "Signed URL failed");
    return { url: signed.signedUrl, path };
  });