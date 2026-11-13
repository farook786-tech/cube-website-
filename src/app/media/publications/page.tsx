import { redirect } from 'next/navigation';

// The original CUBE website has no reports/publications page, so this route
// sends visitors to the Media page instead of showing invented content.
export default function PublicationsPage() {
  redirect('/media');
}
