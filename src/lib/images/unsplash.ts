const UNSPLASH_API = "https://api.unsplash.com";

export type UnsplashImage = {
  url: string;
  attributionName: string;
  attributionUrl: string;
};

/**
 * Searches Unsplash for a single photo matching `query`. Returns null on a
 * missing key, no results, or any request failure — callers fall back to
 * the icon treatment rather than surfacing an error.
 */
export async function searchUnsplashImage(query: string): Promise<UnsplashImage | null> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) return null;

  try {
    const res = await fetch(
      `${UNSPLASH_API}/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=squarish&content_filter=high`,
      {
        headers: { Authorization: `Client-ID ${accessKey}` },
      }
    );
    if (!res.ok) return null;

    const data = (await res.json()) as {
      results?: Array<{
        urls?: { small?: string; regular?: string };
        user?: { name?: string; links?: { html?: string } };
        links?: { download_location?: string };
      }>;
    };
    const photo = data.results?.[0];
    const url = photo?.urls?.small;
    if (!photo || !url) return null;

    // Unsplash API guidelines require pinging download_location when a photo
    // is put to use (not just previewed in search results). Fire-and-forget —
    // this shouldn't block or fail the caching write.
    if (photo.links?.download_location) {
      fetch(`${photo.links.download_location}&client_id=${accessKey}`).catch(() => {});
    }

    return {
      url,
      attributionName: photo.user?.name ?? "Unsplash",
      attributionUrl: photo.user?.links?.html ?? "https://unsplash.com",
    };
  } catch {
    return null;
  }
}
