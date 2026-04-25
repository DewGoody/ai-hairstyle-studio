export function computeFitBox(
  originalWidth: number,
  originalHeight: number,
  maxSide: number,
): { width: number; height: number } {
  const longer = Math.max(originalWidth, originalHeight);
  if (longer <= maxSide) return { width: originalWidth, height: originalHeight };
  const scale = maxSide / longer;
  return {
    width: Math.round(originalWidth * scale),
    height: Math.round(originalHeight * scale),
  };
}

export async function makeThumbnail(
  dataUrl: string,
  maxSide = 256,
  quality = 0.85,
): Promise<string> {
  if (typeof document === "undefined") return dataUrl;
  const img = await loadImage(dataUrl);
  const { width, height } = computeFitBox(img.naturalWidth, img.naturalHeight, maxSide);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return dataUrl;
  ctx.drawImage(img, 0, 0, width, height);
  return canvas.toDataURL("image/webp", quality);
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("image load failed"));
    img.src = src;
  });
}
