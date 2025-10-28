module.exports = {
  siteUrl: 'https://steeeam.vercel.app',
  generateIndexSitemap: false,
  generateRobotsTxt: true,
  sitemapBaseFileName: 'sitemap',
  changefreq: 'daily',
  priority: 0.7,
  // outDir: './out', // Uncomment for custom directory
  exclude: ['/api/*'],
}
