'use client';

import React from 'react';
import PageHeader from '@/components/common/PageHeader';
import GalleryGrid from '@/components/media/GalleryGrid';

export default function GalleryPage() {
  return (
    <div>
      <PageHeader
        badge="Media"
        title="Gallery"
        description="News, media coverage and life at CUBE. Select a photo to read more."
        breadcrumbs={[
          { label: 'Media', href: '/media' },
          { label: 'Gallery' },
        ]}
      />

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <GalleryGrid showFilters />
        </div>
      </section>
    </div>
  );
}
