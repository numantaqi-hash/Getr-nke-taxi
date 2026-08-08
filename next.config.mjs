/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Der Storefront (index.html) ist die Startseite: "/" liefert den Shop.
  async rewrites() {
    return [{ source: "/", destination: "/shop" }];
  },

  // Stellt sicher, dass index.html im Serverless-Bundle der /shop-Route
  // landet (nötig für Vercel, da die Route die Datei zur Laufzeit liest).
  // In Next 14 liegt diese Option unter "experimental".
  experimental: {
    outputFileTracingIncludes: {
      "/shop": ["./index.html"],
    },
  },
};

export default nextConfig;
