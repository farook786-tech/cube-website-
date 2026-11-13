'use client';

import React from 'react';
import FlipCard from './FlipCard';
import { Vertical } from '@/types';

interface VerticalFlipCardProps {
  vertical: Vertical;
}

export default function VerticalFlipCard({ vertical }: VerticalFlipCardProps) {
  return (
    <FlipCard
      title={vertical.title}
      subtitle={vertical.tagline || undefined}
      category="Vertical"
      description={vertical.description}
      backTitle={vertical.title}
      backDescription={vertical.longDescription}
      keyPoints={vertical.capabilities}
      imageSrc={vertical.heroImage}
      href={`/verticals/${vertical.slug}`}
      ctaText={`Explore ${vertical.shortTitle} Vertical`}
      badge={vertical.projectCount ? `${vertical.projectCount}+ Projects` : undefined}
    />
  );
}
