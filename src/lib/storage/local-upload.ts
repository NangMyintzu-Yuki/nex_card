// src/lib/storage/local-upload.ts
// @deprecated Import from @/lib/storage instead — kept for backward compatibility

import { uploadToLocal } from "./providers/local";
import type { UploadFolder } from "./types";

export type LocalUploadFolder = UploadFolder;

export async function uploadLocalImage(options: {
  buffer: Buffer;
  contentType: string;
  userId: string;
  folder: LocalUploadFolder;
}) {
  const result = await uploadToLocal(options);
  return {
    url: result.url,
    publicUrl: result.publicUrl,
    filename: result.filename!,
  };
}
