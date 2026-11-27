/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  // output: "export",
  // Optional: Change links `/me` -> `/me/` and emit `/me.html` -> `/me/index.html`
  // trailingSlash: true,
  // Optional: Prevent automatic `/me` -> `/me/`, instead preserve `href`
  // skipTrailingSlashRedirect: true,
  // Optional: Change the output directory `out` -> `dist`
  // distDir: 'dist',

  // Next serves public/ files with "max-age=0", which makes the browser check
  // with the server every time an image is shown again. That round trip shows
  // up as a blank flash when switching pages (e.g. the nightstand on /contact).
  // Let the browser reuse images for a day, refreshing them in the background.
  async headers() {
    return [
      {
        source: "/:all*(webp|png|jpg|jpeg|gif|svg)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
