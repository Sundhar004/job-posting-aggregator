import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { scrapeUrl } from '@/lib/scraper';
import { extractJobData } from '@/lib/gemini';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { computeSkillMatch } from '@/lib/skillMatch';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { text, url } = await req.json();

    if (!text && !url) {
      return NextResponse.json(
        { error: 'Either raw job text or a job posting URL must be provided' },
        { status: 400 }
      );
    }

    let jdText = '';

    if (url) {
      try {
        new URL(url);
      } catch {
        return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
      }
      // Scrape the URL
      jdText = await scrapeUrl(url);
    } else {
      jdText = text;
    }

    if (!jdText || jdText.trim().length < 50) {
      return NextResponse.json(
        { error: 'Provided text is too short to be parsed as a job description.' },
        { status: 400 }
      );
    }

    // Call Gemini API to extract structured data
    const extractedData = await extractJobData(jdText);

    // Compute user match percent preview
    let matchPercent = 0;
    try {
      await dbConnect();
      const user = await User.findById(session.user.id).select('skills').lean();
      const userSkills = user?.skills || [];
      matchPercent = computeSkillMatch(extractedData.requiredSkills, userSkills);
    } catch (dbErr) {
      console.warn('[Extract] Could not connect to MongoDB, using 0 match percent:', dbErr);
      matchPercent = 0;
    }

    return NextResponse.json({
      success: true,
      data: extractedData,
      matchPercent,
      rawText: text ? jdText : undefined, // only return raw text if we scraped it or manually passed
      sourceUrl: url || undefined,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[API Extract Error]', message, error);
    return NextResponse.json(
      { error: 'Extraction pipeline failed', details: message },
      { status: 500 }
    );
  }
}
