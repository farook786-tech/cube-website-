import { NextRequest, NextResponse } from 'next/server';
import { getCMSStore, resolveAdminSession, UserRole } from '@/lib/db/store';
import { getPublishStatus, publishNow } from '@/lib/publish';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const CAN_PUBLISH: UserRole[] = ['super_admin', 'admin', 'editor'];

async function authorize(req: NextRequest) {
  return resolveAdminSession(req.cookies.get('cube_admin_session')?.value);
}

/** Live-site publishing status for the admin header. */
export async function GET(req: NextRequest) {
  if (!(await authorize(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json(getPublishStatus(), { headers: { 'Cache-Control': 'no-store' } });
}

/** "Publish now": push the current public content to the live website. */
export async function POST(req: NextRequest) {
  const user = await authorize(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!CAN_PUBLISH.includes(user.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const body = await req.json().catch(() => ({}));
  const status = await publishNow((await getCMSStore()) as unknown as Record<string, any>, {
    force: body?.force === true,
  });
  return NextResponse.json(status, { headers: { 'Cache-Control': 'no-store' } });
}
