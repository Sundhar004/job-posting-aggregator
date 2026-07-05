import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import JobPosting from '@/models/JobPosting';
import Papa from 'papaparse';
import { listFallbackJobsForUser, type FallbackJob } from '@/lib/fallbackStore';

function toDisplayString(value: unknown, fallback = 'N/A') {
  if (value === null || value === undefined || value === '') {
    return fallback;
  }

  return String(value);
}

function toCsvDate(value: unknown) {
  if (!value) return 'N/A';

  const date = new Date(value as string | Date);
  return Number.isNaN(date.getTime()) ? 'N/A' : date.toISOString().split('T')[0];
}

function toSkillList(value: unknown) {
  if (Array.isArray(value)) {
    return value.filter((skill): skill is string => typeof skill === 'string' && skill.trim() !== '').join(', ');
  }

  return toDisplayString(value, '');
}

function toPercent(value: unknown) {
  const numericValue = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(numericValue) ? `${numericValue}%` : '0%';
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return new Response('Unauthorized', { status: 401 });
    }

    let jobs: Array<Record<string, unknown> | FallbackJob> = [];

    try {
      await dbConnect();
      jobs = await JobPosting.find({ userId: session.user.id })
        .sort({ createdAt: -1 })
        .lean();
    } catch {
      jobs = await listFallbackJobsForUser(session.user.id);
    }

    // Map DB documents into a clean CSV row format
    const csvRows = jobs.map((job) => ({
      'Job Title': toDisplayString((job as Record<string, unknown>).jobTitle, 'N/A'),
      'Company Name': toDisplayString((job as Record<string, unknown>).companyName, 'N/A'),
      'Location': toDisplayString((job as Record<string, unknown>).location, 'N/A'),
      'Work Mode': toDisplayString((job as Record<string, unknown>).workMode, 'N/A'),
      'Required Skills': toSkillList((job as Record<string, unknown>).requiredSkills),
      'Experience Required': toDisplayString((job as Record<string, unknown>).experienceRequired, 'N/A'),
      'Salary Range': toDisplayString((job as Record<string, unknown>).salaryRange, 'N/A'),
      'Application Deadline': toCsvDate((job as Record<string, unknown>).applicationDeadline),
      'Summary': toDisplayString((job as Record<string, unknown>).jdSummary, ''),
      'Match %': toPercent((job as Record<string, unknown>).matchPercent),
      'Status': toDisplayString((job as Record<string, unknown>).status, 'N/A'),
      'Notes': toDisplayString((job as Record<string, unknown>).notes, ''),
      'Created At': toCsvDate((job as Record<string, unknown>).createdAt),
      'Source URL': toDisplayString((job as Record<string, unknown>).sourceUrl, 'N/A'),
    }));

    const csvContent = Papa.unparse(csvRows);

    return new Response(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename=job-applications-export.csv',
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: 'Failed to export data', details: message }, { status: 500 });
  }
}
