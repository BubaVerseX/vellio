const UNSPLASH_API = "https://api.unsplash.com";

export type UnsplashImage = {
  url: string;
  attributionName: string;
  attributionUrl: string;
};

// Unsplash's free tier caps at 50 requests/hour. This is a best-effort,
// in-memory counter (resets on cold start, not shared across instances) —
// not a hard limiter, just a log-based early warning so approaching the
// ceiling shows up in server logs before requests start getting rejected.
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT_WARN_THRESHOLD = 40;
let requestCount = 0;
let windowStartedAt = Date.now();

function recordUnsplashRequest() {
  const now = Date.now();
  if (now - windowStartedAt >= RATE_LIMIT_WINDOW_MS) {
    requestCount = 0;
    windowStartedAt = now;
  }
  requestCount += 1;
  if (requestCount >= RATE_LIMIT_WARN_THRESHOLD) {
    console.warn(
      `[unsplash] ${requestCount} requests in the current hourly window (free tier limit is 50/hour, per server instance)`
    );
  }
}

/**
 * Searches Unsplash for a single photo matching `query`. Returns null on a
 * missing key, no results, or any request failure — callers fall back to
 * the icon treatment rather than surfacing an error. `orientation`/`size`
 * default to the small-thumbnail shape everywhere except a large hero use.
 */
export async function searchUnsplashImage(
  query: string,
  options?: { orientation?: "squarish" | "landscape" | "portrait"; size?: "small" | "regular" }
): Promise<UnsplashImage | null> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) return null;
  const orientation = options?.orientation ?? "squarish";
  const size = options?.size ?? "small";

  try {
    recordUnsplashRequest();
    const res = await fetch(
      `${UNSPLASH_API}/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=${orientation}&content_filter=high`,
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
    const url = photo?.urls?.[size];
    if (!photo || !url) return null;

    // Unsplash API guidelines require pinging download_location when a photo
    // is put to use (not just previewed in search results). Fire-and-forget —
    // this shouldn't block or fail the caching write.
    if (photo.links?.download_location) {
      recordUnsplashRequest();
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
