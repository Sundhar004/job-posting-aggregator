import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import JobPosting from '@/models/JobPosting';
import User from '@/models/User';
import Application from '@/models/Application';
import { computeSkillMatch } from '@/lib/skillMatch';
import { createFallbackJob, listFallbackJobsForUser } from '@/lib/fallbackStore';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const workMode = searchParams.get('workMode') || '';
    const skill = searchParams.get('skill') || '';

    try {
      await dbConnect();

      const query: Record<string, any> = { userId: session.user.id };

      if (search) {
        query.$or = [
          { jobTitle: { $regex: search, $options: 'i' } },
          { companyName: { $regex: search, $options: 'i' } },
        ];
      }

      if (status) {
        query.status = status;
      }

      if (workMode) {
        query.workMode = workMode;
      }

      if (skill) {
        query.requiredSkills = { $regex: skill, $options: 'i' };
      }

      const jobs = await JobPosting.find(query).lean();
      const sortedJobs = [...jobs].sort((a, b) => {
        const ad = a.applicationDeadline ? new Date(a.applicationDeadline).getTime() : null;
        const bd = b.applicationDeadline ? new Date(b.applicationDeadline).getTime() : null;

        if (ad !== null && bd !== null) {
          return ad - bd;
        }
        if (ad !== null && bd === null) return -1;
        if (ad === null && bd !== null) return 1;

        const aCreated = new Date(a.createdAt).getTime();
        const bCreated = new Date(b.createdAt).getTime();
        return bCreated - aCreated;
      });

      return NextResponse.json(sortedJobs);
    } catch {
      const jobs = await listFallbackJobsForUser(session.user.id);
      return NextResponse.json(jobs);
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: 'Internal Server Error', details: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      sourceUrl,
      rawText,
      jobTitle,
      companyName,
      location,
      workMode,
      requiredSkills,
      experienceRequired,
      salaryRange,
      applicationDeadline,
      jdSummary,
      notes,
      status = 'Saved',
    } = body;

    if (!jobTitle || !companyName) {
      return NextResponse.json(
        { error: 'Job title and company name are required' },
        { status: 400 }
      );
    }

    try {
      await dbConnect();

      const user = await User.findById(session.user.id).select('skills').lean();
      const userSkills = user?.skills || [];

      const skillsArray = Array.isArray(requiredSkills) ? requiredSkills : [];
      const matchPercent = computeSkillMatch(skillsArray, userSkills);

      let deadlineDate: Date | null = null;
      if (applicationDeadline) {
        const parsed = new Date(applicationDeadline);
        if (!isNaN(parsed.getTime())) {
          deadlineDate = parsed;
        }
      }

      const job = await JobPosting.create({
        userId: session.user.id,
        sourceUrl,
        rawText,
        jobTitle,
        companyName,
        location: location || null,
        workMode: workMode || 'unknown',
        requiredSkills: skillsArray,
        experienceRequired: experienceRequired || null,
        salaryRange: salaryRange || null,
        applicationDeadline: deadlineDate,
        jdSummary: jdSummary || '',
        matchPercent,
        status,
        notes: notes || '',
      });

      await Application.create({
        jobId: job._id,
        userId: session.user.id,
        fromStatus: 'Saved',
        toStatus: status,
        changedAt: new Date(),
      });

      return NextResponse.json({ message: 'Job posting added successfully', job }, { status: 201 });
    } catch {
      const skillsArray = Array.isArray(requiredSkills) ? requiredSkills : [];
      const job = await createFallbackJob({
        userId: session.user.id,
        sourceUrl,
        rawText,
        jobTitle,
        companyName,
        location: location || null,
        workMode: workMode || 'unknown',
        requiredSkills: skillsArray,
        experienceRequired: experienceRequired || null,
        salaryRange: salaryRange || null,
        applicationDeadline: applicationDeadline || null,
        jdSummary: jdSummary || '',
        matchPercent: computeSkillMatch(skillsArray, []),
        status,
        notes: notes || '',
      });

      return NextResponse.json({ message: 'Job posting added successfully', job }, { status: 201 });
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: 'Internal Server Error', details: message }, { status: 500 });
  }
}
