import { GoogleGenerativeAI } from '@google/generative-ai';
import type { ExtractedJob } from '@/types';

if (!process.env.GEMINI_API_KEY) {
  throw new Error('Missing GEMINI_API_KEY environment variable');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ── Few-shot example embedded directly in the prompt ──────────────────────────
const FEW_SHOT_EXAMPLE = `
INPUT:
Senior Software Engineer – Remote
ABC Tech Solutions | Bangalore, India (Remote OK)
Salary: ₹20–35 LPA | Deadline: 30th July 2024

We are looking for a Senior SWE with 5+ years experience in React, Node.js, TypeScript,
PostgreSQL, AWS. Familiarity with Docker and CI/CD pipelines is a plus.

OUTPUT:
{
  "jobTitle": "Senior Software Engineer",
  "companyName": "ABC Tech Solutions",
  "location": "Bangalore, India",
  "workMode": "remote",
  "requiredSkills": ["React", "Node.js", "TypeScript", "PostgreSQL", "AWS", "Docker", "CI/CD"],
  "experienceRequired": "5+ years",
  "salaryRange": "₹20–35 LPA",
  "applicationDeadline": "2024-07-30",
  "jdSummary": "Senior Software Engineer role at ABC Tech Solutions requiring expertise in full-stack development with React, Node.js, and AWS. Remote-friendly position with competitive salary."
}
`;

const SYSTEM_PROMPT = `You are a job posting parsing engine. Your only job is to extract structured information from raw job description text and return it as valid JSON.

Rules:
1. Extract ONLY information explicitly stated in the text. Do NOT invent or hallucinate data.
2. If salary, deadline, or location is not mentioned, return null for those fields — never guess.
3. For workMode: return "remote" if fully remote, "hybrid" if hybrid, "onsite" if office-only, "unknown" if unclear.
4. For applicationDeadline: return ISO 8601 date string (YYYY-MM-DD) if a deadline is mentioned, else null.
5. For jdSummary: write exactly 2–3 sentences summarizing the role, company, and key requirements.
6. For requiredSkills: extract all mentioned technologies, tools, frameworks, languages, and soft skills as an array of strings.
7. Handle messy formatting gracefully — LinkedIn, Naukri, and Indeed postings often have inconsistent structure.
8. Return ONLY valid JSON matching the schema below. No explanations, no markdown, no code blocks.

Output JSON Schema:
{
  "jobTitle": "string",
  "companyName": "string",
  "location": "string | null",
  "workMode": "remote | hybrid | onsite | unknown",
  "requiredSkills": ["string"],
  "experienceRequired": "string | null",
  "salaryRange": "string | null",
  "applicationDeadline": "YYYY-MM-DD string | null",
  "jdSummary": "string"
}

Here is a few-shot example:
${FEW_SHOT_EXAMPLE}

Now parse the following job description and return ONLY the JSON:`;

function createFallbackExtraction(text: string): ExtractedJob {
  // Simple regex-based extraction for fallback when Gemini is unavailable
  const titleMatch = text.match(/(?:job title|position|role)[:\s]+([^\n]{1,80})/i);
  const companyMatch = text.match(/(?:company|employer|organization)[:\s]+([^\n]{1,80})/i);
  const salaryMatch = text.match(/(?:salary|compensation|pay)[:\s]+([^\n]{1,80})/i);
  const locationMatch = text.match(/(?:location|place|based)[:\s]+([^\n]{1,80})/i);
  
  const skillMatches = text.match(/(?:skills?|technologies?|requirements?|tools?)[:\s]+([^\n.]+)/gi);
  const skills = skillMatches
    ? skillMatches
        .flatMap(s => s.split(/[,;]/))
        .map(s => s.trim().replace(/^(?:skills?|technologies?|requirements?|tools?)[:\s]*/i, ''))
        .filter((s): s is string => s.length > 0 && s.length < 50)
        .slice(0, 10)
    : [];

  const remoteMatch = text.match(/(?:remote|hybrid|onsite)/i);
  const workMode = remoteMatch
    ? (remoteMatch[0].toLowerCase() as 'remote' | 'hybrid' | 'onsite' | 'unknown')
    : 'unknown';

  return {
    jobTitle: titleMatch ? titleMatch[1].trim() : 'Unknown Role',
    companyName: companyMatch ? companyMatch[1].trim() : 'Unknown Company',
    location: locationMatch ? locationMatch[1].trim() : null,
    workMode,
    requiredSkills: skills,
    experienceRequired: null,
    salaryRange: salaryMatch ? salaryMatch[1].trim() : null,
    applicationDeadline: null,
    jdSummary: text.slice(0, 200).trim(),
  };
}

export async function extractJobData(rawText: string): Promise<ExtractedJob> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
      temperature: 0,
      responseMimeType: 'application/json',
    },
  });

  const prompt = `${SYSTEM_PROMPT}\n\nINPUT:\n${rawText}\n\nOUTPUT:`;

  let result;
  try {
    result = await model.generateContent(prompt);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[Gemini API Error]', message);
    
    // Fallback: try to extract basic info from the raw text for development
    console.log('[Using Fallback Extractor]');
    return createFallbackExtraction(rawText);
  }

  const text = result.response.text();
  if (!text || text.trim().length === 0) {
    console.error('[Gemini] Empty response returned');
    return createFallbackExtraction(rawText);
  }

  let parsed: ExtractedJob;
  const clean = text
    .replace(/```json\n?/gi, '')
    .replace(/```\n?/gi, '')
    .trim();

  const tryParse = (value: string) => {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  };

  parsed = tryParse(clean);
  if (!parsed) {
    const first = clean.indexOf('{');
    const last = clean.lastIndexOf('}');
    if (first !== -1 && last !== -1 && last > first) {
      parsed = tryParse(clean.slice(first, last + 1));
    }
  }

  if (!parsed) {
    console.error('[Gemini] Failed to parse JSON:', clean.slice(0, 500));
    return createFallbackExtraction(rawText);
  }

  // Validate required fields and set safe defaults
  return {
    jobTitle:             parsed.jobTitle             || 'Unknown Role',
    companyName:          parsed.companyName          || 'Unknown Company',
    location:             parsed.location             ?? null,
    workMode:             parsed.workMode             || 'unknown',
    requiredSkills:       Array.isArray(parsed.requiredSkills) ? parsed.requiredSkills : [],
    experienceRequired:   parsed.experienceRequired   ?? null,
    salaryRange:          parsed.salaryRange          ?? null,
    applicationDeadline:  parsed.applicationDeadline  ?? null,
    jdSummary:            parsed.jdSummary            || '',
  };
}
