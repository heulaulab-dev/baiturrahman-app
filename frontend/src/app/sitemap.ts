import type { MetadataRoute } from 'next'

const SITE_URL = 'https://masjidbaiturrahimsb.org'

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()

  return [
    {
      url: `${SITE_URL}/`,
      lastModified,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${SITE_URL}/mitra`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/galeri`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ]
}
