import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getCMSStore, saveCMSStore } from '@/lib/db/store';
import { isPublishedSite } from '@/lib/db/backend';
import { RESUME_MIME, detectResumeType } from '@/lib/resumes';
import { putFile } from '@/lib/file-storage';
import { consumeRateLimit } from '@/lib/rate-limit';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;

function clientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  );
}

function field(formData: FormData, key: string, max: number, fallback = ''): string {
  const value = formData.get(key);
  return (typeof value === 'string' ? value : fallback).trim().slice(0, max);
}

export async function POST(req: NextRequest) {
  // The live website is read-only (applications are kept on the local admin).
  if (isPublishedSite()) {
    return NextResponse.json(
      { error: 'Online applications are not available yet. Please email your CV to office@cubeiitm.org.' },
      { status: 503 }
    );
  }
  try {
    const rateLimit = await consumeRateLimit(`career-application:${clientIp(req)}`, MAX_PER_WINDOW, WINDOW_MS);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many applications from this network. Please try again later.' },
        { status: 429 }
      );
    }

    const formData = await req.formData();
    const fullName = field(formData, 'fullName', 200);
    const email = field(formData, 'email', 320);
    const phone = field(formData, 'phone', 50);
    const experience = field(formData, 'experience', 200);
    const domain = field(formData, 'domain', 200);
    const jobTitle = field(formData, 'jobTitle', 300) || 'General Talent Network';
    const coverLetter = field(formData, 'coverLetter', 5000);
    const resumeFile = formData.get('resume');

    if (!fullName || !email) {
      return NextResponse.json(
        { error: 'Full name and email are required fields.' },
        { status: 400 }
      );
    }
    if (!EMAIL_PATTERN.test(email)) {
      return NextResponse.json({ error: 'Please provide a valid email address.' }, { status: 400 });
    }

    let resumeUrl = '';

    if (resumeFile instanceof File && resumeFile.size > 0) {
      if (resumeFile.size > MAX_FILE_SIZE_BYTES) {
        return NextResponse.json({ error: 'File size exceeds 10MB limit.' }, { status: 400 });
      }

      const buffer = Buffer.from(await resumeFile.arrayBuffer());

      // Validate real file content; never trust the client-supplied name/MIME.
      const detected = detectResumeType(buffer);
      if (!detected) {
        return NextResponse.json(
          { error: 'Resume must be a PDF, DOC or DOCX file.' },
          { status: 415 }
        );
      }

      // Stored OUTSIDE /public so resumes are never publicly downloadable and
      // can never be served as HTML/SVG from the site's origin.
      // (Private Supabase bucket when hosted, data-store/resumes locally.)
      const fileName = `${Date.now()}_${crypto.randomBytes(12).toString('hex')}${detected.ext}`;
      await putFile('resumes', fileName, buffer, RESUME_MIME[detected.ext] || 'application/octet-stream');
      resumeUrl = `/api/admin/resumes/${fileName}`;
    }

    const store = await getCMSStore();
    if (!store.jobApplications) store.jobApplications = [];

    const newApplication = {
      id: `app_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
      fullName,
      email,
      phone,
      experience,
      domain,
      jobTitle,
      coverLetter,
      resumeUrl,
      appliedAt: new Date().toISOString(),
      status: 'new',
    };

    store.jobApplications.unshift(newApplication);
    await saveCMSStore(store);

    return NextResponse.json({
      success: true,
      message: 'Your application and profile have been successfully submitted to CUBE Talent Network.',
    });
  } catch (error: any) {
    console.error('Career application submission error:', error);
    return NextResponse.json(
      { error: 'An error occurred while submitting your application.' },
      { status: 500 }
    );
  }
}
