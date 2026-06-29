import { NextResponse } from "next/server";
import mupdf from "mupdf";

const ALLOWED_HOST = "saami.org";

const imageCache = new Map<string, { data: Buffer; cachedAt: number; totalPages: number }>();
const pdfCache   = new Map<string, { data: Buffer; cachedAt: number }>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

async function fetchPdf(url: string): Promise<Buffer> {
  const hit = pdfCache.get(url);
  if (hit && Date.now() - hit.cachedAt < CACHE_TTL_MS) return hit.data;

  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; WristCoachApp/1.0)" },
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) throw new Error(`SAAMI returned ${res.status}`);
  const data = Buffer.from(await res.arrayBuffer());
  pdfCache.set(url, { data, cachedAt: Date.now() });
  return data;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const urlParam  = searchParams.get("url");
  const pageParam = searchParams.get("page") ?? "1";

  if (!urlParam) return NextResponse.json({ error: "url required" }, { status: 400 });

  const cleanUrl = urlParam.split("#")[0];

  let parsed: URL;
  try { parsed = new URL(cleanUrl); } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }
  if (parsed.hostname !== ALLOWED_HOST) {
    return NextResponse.json({ error: "Only saami.org URLs allowed" }, { status: 403 });
  }

  const pageNum  = Math.max(1, parseInt(pageParam, 10) || 1);
  const cacheKey = `${cleanUrl}::${pageNum}`;

  const cached = imageCache.get(cacheKey);
  if (cached && Date.now() - cached.cachedAt < CACHE_TTL_MS) {
    return new Response(new Uint8Array(cached.data), {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400",
        "X-Total-Pages": String(cached.totalPages),
      },
    });
  }

  try {
    const pdfData = await fetchPdf(cleanUrl);

    const doc       = mupdf.Document.openDocument(pdfData, "application/pdf");
    const numPages  = doc.countPages();
    const safePage  = Math.min(pageNum, numPages);

    const page    = doc.loadPage(safePage - 1); // mupdf is 0-indexed
    const matrix  = mupdf.Matrix.scale(2.0, 2.0);
    const pixmap  = page.toPixmap(matrix, mupdf.ColorSpace.DeviceRGB, false, true);
    const png     = pixmap.asPNG();
    const buf     = Buffer.from(png);

    imageCache.set(cacheKey, { data: buf, cachedAt: Date.now(), totalPages: numPages });

    return new Response(buf, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400",
        "X-Total-Pages": String(numPages),
      },
    });
  } catch (err) {
    console.error("[pdf-proxy] render error:", err);
    return NextResponse.json({ error: String(err) }, { status: 502 });
  }
}
