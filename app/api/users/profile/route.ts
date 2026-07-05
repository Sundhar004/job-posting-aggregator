import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import JobPosting from '@/models/JobPosting';
import { computeSkillMatch } from '@/lib/skillMatch';
import { findFallbackUserById, updateFallbackUserProfile } from '@/lib/fallbackStore';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      await dbConnect();
      const user = await User.findById(session.user.id).select('-passwordHash').lean();
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      return NextResponse.json({ user });
    } catch {
      const user = await findFallbackUserById(session.user.id);
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, skills: user.skills, createdAt: user.createdAt } });
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: 'Internal Server Error', details: message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { skills, name } = await req.json();

    try {
      await dbConnect();
      const user = await User.findById(session.user.id);
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      if (name !== undefined) user.name = name;
      if (skills !== undefined) {
        user.skills = Array.from(
          new Set(
            (Array.isArray(skills) ? skills : [])
              .map((s) => s.trim())
              .filter((s) => s.length > 0)
          )
        );
      }

      await user.save();

      if (skills !== undefined) {
        const jobs = await JobPosting.find({ userId: user._id });
        for (const job of jobs) {
          const newMatch = computeSkillMatch(job.requiredSkills, user.skills);
          if (job.matchPercent !== newMatch) {
            job.matchPercent = newMatch;
            await job.save();
          }
        }
      }

      return NextResponse.json({
        message: 'Profile updated successfully',
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          skills: user.skills,
        },
      });
    } catch {
      const user = await updateFallbackUserProfile(session.user.id, { name, skills: Array.isArray(skills) ? skills : undefined });
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      return NextResponse.json({
        message: 'Profile updated successfully',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          skills: user.skills,
        },
      });
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: 'Internal Server Error', details: message }, { status: 500 });
  }
}
