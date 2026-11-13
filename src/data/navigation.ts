import { NavigationItem } from '@/types';

export const navigationItems: NavigationItem[] = [
  {
    title: 'Home',
    href: '/',
  },
  {
    title: 'About',
    href: '/about',
    children: [
      {
        title: 'About CUBE',
        href: '/about#overview',
      },
      {
        title: 'Vision & Mission',
        href: '/about#vision-mission',
      },
      {
        title: 'Objectives & Values',
        href: '/about#objectives-values',
      },
      {
        title: 'Chairman Message',
        href: '/about#chairman-message',
      },
      {
        title: 'CEO Message',
        href: '/about#ceo-message',
      },
      {
        title: 'Governing Board',
        href: '/about#governing-board',
      },
      {
        title: 'IIT Advisory Panel',
        href: '/about#advisory-panel',
      },
      {
        title: 'Our Team (80+)',
        href: '/about#our-team',
      },
      {
        title: 'Clients & Partners',
        href: '/about#clients-partners',
      },
    ],
  },
  {
    title: 'Verticals',
    href: '/verticals',
    children: [
      {
        title: 'Building & Construction',
        href: '/verticals#building-construction',
      },
      {
        title: 'Environment & Sustainability',
        href: '/verticals#environment-sustainability',
      },
      {
        title: 'Smart Cities',
        href: '/verticals#smart-cities',
      },
      {
        title: 'Urban Planning & Transportation',
        href: '/verticals#urban-planning-transportation',
      },
    ],
  },
  {
    title: 'Projects',
    href: '/projects',
  },
  {
    title: 'CEL Lab',
    href: '/cel',
    badge: 'Testing',
  },
  {
    title: 'Media',
    href: '/media',
    children: [
      {
        title: 'News & Announcements',
        href: '/media#news',
      },
      {
        title: 'Events',
        href: '/media#events',
      },
      {
        title: 'Photo Gallery',
        href: '/media#gallery',
      },
      {
        title: 'Life at CUBE',
        href: '/media#life-at-cube',
      },
    ],
  },
  {
    title: 'Careers',
    href: '/careers',
    badge: 'Hiring',
  },
];
