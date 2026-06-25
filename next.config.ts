import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["canvas", "pdfjs-dist", "mupdf"],
};

export default nextConfig;
