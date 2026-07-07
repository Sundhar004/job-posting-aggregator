import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import JobPosting from '@/models/JobPosting';
import Application from '@/models/Application';
import User from '@/models/User';
import { computeSkillMatch } from '@/lib/skillMatch';
import { deleteFallbackJob, getFallbackJobById, updateFallbackJob } from '@/lib/fallbackStore';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      await dbConnect();
      const job = await JobPosting.findOne({
        _id: params.id,
        userId: session.user.id,
      }).lean();

      if (!job) {
        return NextResponse.json({ error: 'Job posting not found' }, { status: 404 });
      }

      return NextResponse.json(job);
    } catch {
      const job = await getFallbackJobById(params.id, session.user.id);
      if (!job) {
        return NextResponse.json({ error: 'Job posting not found' }, { status: 404 });
      }
      return NextResponse.json(job);
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: 'Internal Server Error', details: message }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    try {
      await dbConnect();

      const job = await JobPosting.findOne({
        _id: params.id,
        userId: session.user.id,
      });

      if (!job) {
        return NextResponse.json({ error: 'Job posting not found' }, { status: 404 });
      }

      const originalStatus = job.status;
      const fieldsToUpdate = [
        'jobTitle',
        'companyName',
        'location',
        'workMode',
        'requiredSkills',
        'experienceRequired',
        'salaryRange',
        'jdSummary',
        'notes',
        'status',
      ];

      let skillsUpdated = false;

      for (const key of fieldsToUpdate) {
        if (body[key] !== undefined) {
          if (key === 'requiredSkills') {
            job.requiredSkills = Array.isArray(body[key]) ? body[key] : [];
            skillsUpdated = true;
          } else {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            job[key] = body[key];
          }
        }
      }

      if (body.applicationDeadline !== undefined) {
        if (body.applicationDeadline === null) {
          job.applicationDeadline = null;
        } else {
          const parsed = new Date(body.applicationDeadline);
          if (!isNaN(parsed.getTime())) {
            job.applicationDeadline = parsed;
          }
        }
      }

      if (skillsUpdated) {
        const user = await User.findById(session.user.id).select('skills').lean();
        const userSkills = user?.skills || [];
        job.matchPercent = computeSkillMatch(job.requiredSkills, userSkills);
      }

      await job.save();

      if (body.status && body.status !== originalStatus) {
        await Application.create({
          jobId: job._id,
          userId: session.user.id,
          fromStatus: originalStatus,
          toStatus: body.status,
          changedAt: new Date(),
        });
      }

      return NextResponse.json({ message: 'Job posting updated successfully', job });
    } catch {
      const existing = await getFallbackJobById(params.id, session.user.id);
      if (!existing) {
        return NextResponse.json({ error: 'Job posting not found' }, { status: 404 });
      }

      const updated = await updateFallbackJob(params.id, session.user.id, {
        ...existing,
        ...body,
        requiredSkills: Array.isArray(body.requiredSkills) ? body.requiredSkills : existing.requiredSkills,
        status: body.status || existing.status,
        notes: body.notes || existing.notes,
        matchPercent: computeSkillMatch(Array.isArray(body.requiredSkills) ? body.requiredSkills : existing.requiredSkills, []),
      });

      return NextResponse.json({ message: 'Job posting updated successfully', job: updated });
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: 'Internal Server Error', details: message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      await dbConnect();
      const result = await JobPosting.deleteOne({
        _id: params.id,
        userId: session.user.id,
      });

      if (result.deletedCount === 0) {
        return NextResponse.json({ error: 'Job posting not found' }, { status: 404 });
      }

      await Application.deleteMany({ jobId: params.id });
      return NextResponse.json({ message: 'Job posting deleted successfully' });
    } catch {
      const deleted = await deleteFallbackJob(params.id, session.user.id);
      if (!deleted) {
        return NextResponse.json({ error: 'Job posting not found' }, { status: 404 });
      }
      return NextResponse.json({ message: 'Job posting deleted successfully' });
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: 'Internal Server Error', details: message }, { status: 500 });
  }
}
