import React from 'react';
import { requireAdmin } from '@/lib/auth-guard';
import SettingsClient from './SettingsClient';

export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
  await requireAdmin();
  return <SettingsClient />;
}
