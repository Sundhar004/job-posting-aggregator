import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import dbConnect from '@/lib/mongodb'
import { authOptions } from '@/lib/auth'
import User from '@/models/User'
import JobPosting from '@/models/JobPosting'
import { computeSkillMatch } from '@/lib/skillMatch'

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(request.url)
  const jobId = url.searchParams.get('jobId')
  if (!jobId) {
    return NextResponse.json({ error: 'jobId query required' }, { status: 400 })
  }

  await dbConnect()
  const [user, job] = await Promise.all([
    User.findById(session.user.id).lean(),
    JobPosting.findOne({ _id: jobId, userId: session.user.id }).lean(),
  ])

  if (!user || !job) {
    return NextResponse.json({ error: 'User or job not found' }, { status: 404 })
  }

  const score = computeSkillMatch(job.requiredSkills, user.skills || [])
  return NextResponse.json({ matchPercent: score })
}
