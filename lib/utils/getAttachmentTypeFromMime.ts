// utils/getAttachmentTypeFromMime.ts

export function getAttachmentTypeFromMime(
  mime: string
): "IMAGE" | "DOCUMENT" | "AUDIO" | "VIDEO" {
  if (mime.startsWith("image/")) return "IMAGE";
  if (mime.startsWith("audio/")) return "AUDIO";
  if (mime.startsWith("video/")) return "VIDEO";
  if (mime.startsWith("application/")) return "DOCUMENT";
  return "DOCUMENT";
}
