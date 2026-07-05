/**
 * Compute skill match percentage between a job's required skills
 * and the user's declared skill profile.
 *
 * Matching is case-insensitive and also checks for partial matches
 * (e.g. "React" matches "React.js").
 */
export function computeSkillMatch(
  requiredSkills: string[],
  userSkills: string[]
): number {
  if (!requiredSkills.length) return 0;
  if (!userSkills.length) return 0;

  const normalise = (s: string) => s.toLowerCase().replace(/[.\-_\s]/g, '');

  const normUser = userSkills.map(normalise);

  let matched = 0;
  for (const skill of requiredSkills) {
    const normSkill = normalise(skill);
    const found = normUser.some(
      (us) => us.includes(normSkill) || normSkill.includes(us)
    );
    if (found) matched++;
  }

  return Math.round((matched / requiredSkills.length) * 100);
}
