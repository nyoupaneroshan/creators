export interface ParsedVideo {
  type: "youtube" | "vimeo" | "loom" | "tiktok" | "direct" | "unknown";
  embedUrl: string | null;
  directUrl: string | null;
  originalUrl: string;
}

export function parseVideoUrl(url: string): ParsedVideo {
  if (!url) {
    return {
      type: "unknown",
      embedUrl: null,
      directUrl: null,
      originalUrl: url,
    };
  }

  const trimmed = url.trim();

  // 1. YouTube (watch, embed, youtu.be, shorts)
  const ytMatch =
    trimmed.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/\s]{11})/i);
  if (ytMatch && ytMatch[1]) {
    return {
      type: "youtube",
      embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=0&rel=0`,
      directUrl: null,
      originalUrl: trimmed,
    };
  }

  // 2. Vimeo
  const vimeoMatch = trimmed.match(/(?:vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/[^\/]*\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+))/i);
  if (vimeoMatch && vimeoMatch[1]) {
    return {
      type: "vimeo",
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
      directUrl: null,
      originalUrl: trimmed,
    };
  }

  // 3. Loom
  const loomMatch = trimmed.match(/loom\.com\/(?:share|embed)\/([a-zA-Z0-9]+)/i);
  if (loomMatch && loomMatch[1]) {
    return {
      type: "loom",
      embedUrl: `https://www.loom.com/embed/${loomMatch[1]}`,
      directUrl: null,
      originalUrl: trimmed,
    };
  }

  // 4. TikTok
  const tiktokMatch = trimmed.match(/tiktok\.com\/@[\w.-]+\/video\/(\d+)/i);
  if (tiktokMatch && tiktokMatch[1]) {
    return {
      type: "tiktok",
      embedUrl: `https://www.tiktok.com/embed/v2/${tiktokMatch[1]}`,
      directUrl: null,
      originalUrl: trimmed,
    };
  }

  // 5. Direct MP4 / WebM / Mov
  if (
    trimmed.endsWith(".mp4") ||
    trimmed.endsWith(".webm") ||
    trimmed.endsWith(".mov") ||
    trimmed.includes(".mp4?") ||
    trimmed.includes("gtv-videos-bucket")
  ) {
    return {
      type: "direct",
      embedUrl: null,
      directUrl: trimmed,
      originalUrl: trimmed,
    };
  }

  return {
    type: "unknown",
    embedUrl: null,
    directUrl: trimmed,
    originalUrl: trimmed,
  };
}
