import React from 'react';
import { requireAdmin } from '@/lib/auth-guard';
import AuditLogsClient from './AuditLogsClient';

export const dynamic = 'force-dynamic';

// Audit logs: super admins and admins only (editors and viewers are sent back to the dashboard).
export default async function AdminAuditLogsPage() {
  await requireAdmin(['super_admin', 'admin']);
  return <AuditLogsClient />;
}
