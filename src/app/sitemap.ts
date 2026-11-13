import { MetadataRoute } from 'next';
import { getCMSStore } from '@/lib/db/store';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cubeiitm.org';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const store = await getCMSStore();

  const staticRoutes = [
    '',
    '/about',
    '/about/team',
    '/about/advisory-panel',
    '/about/clients',
    '/about/ceo-message',
    '/about/chairman-message',
    '/about/core-values',
    '/about/objectives',
    '/about/vision-mission',
    '/projects',
    '/careers',
    '/cel',
    '/contact',
    '/tenders',
    '/media',
    '/media/news',
    '/media/events',
    '/media/gallery',
    '/life-at-cube',
    '/verticals/building-construction',
    '/verticals/environment-sustainability',
    '/verticals/smart-cities',
    '/verticals/urban-planning-transportation',
  ].map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: path === '' ? 1 : 0.8,
  }));

  const projectRoutes = (store.projects || [])
    .filter((project) => project.status === 'published')
    .map((project) => ({
      url: `${BASE_URL}/projects/${project.slug}`,
      lastModified: project.updatedAt ? new Date(project.updatedAt) : new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }));

  const newsRoutes = (store.news || [])
    .filter((item) => item.status === 'published')
    .map((item) => ({
      url: `${BASE_URL}/media/news/${item.slug || item.id}`,
      lastModified: item.updatedAt ? new Date(item.updatedAt) : new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }));

  return [...staticRoutes, ...projectRoutes, ...newsRoutes];
}
