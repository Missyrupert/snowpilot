const API_BASE = 'https://thelongdark.fandom.com/api.php';
const cache = new Map<string, string>();

function pickMapImage(images: string[]): string {
  const valid = images.filter(
    (name) => !/icon|placeholder/i.test(name) && /\.(png|jpg|jpeg|webp)$/i.test(name),
  );
  if (valid.length === 0) return images[0] ?? '';
  return valid.find((n) => /default|preview|map|_map/i.test(n)) ?? valid[0];
}

export async function getMapImageUrl(mapPageTitle: string): Promise<string> {
  const cached = cache.get(mapPageTitle);
  if (cached) return cached;

  const parseRes = await fetch(
    `${API_BASE}?action=parse&page=${encodeURIComponent(mapPageTitle)}&prop=images&format=json&origin=*`,
  );
  const parseJson = await parseRes.json();
  const images: string[] = parseJson?.parse?.images ?? [];
  if (images.length === 0) throw new Error('No images on map page');

  const fileName = pickMapImage(images);
  if (!fileName) throw new Error('Could not select map image');

  const fileTitle = fileName.startsWith('File:') ? fileName : `File:${fileName}`;
  const queryRes = await fetch(
    `${API_BASE}?action=query&titles=${encodeURIComponent(fileTitle)}&prop=imageinfo&iiprop=url&format=json&origin=*`,
  );
  const queryJson = await queryRes.json();
  const pages = Object.values(queryJson?.query?.pages ?? {}) as { imageinfo?: { url: string }[] }[];
  const url = pages[0]?.imageinfo?.[0]?.url;
  if (!url) throw new Error('Could not get image URL');

  cache.set(mapPageTitle, url);
  return url;
}
