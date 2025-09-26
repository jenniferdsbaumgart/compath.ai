export function transformProfileToFeatures(profile: any): number[] {
  // Fallbacks seguros para campos que podem estar undefined/null
  const educationCount = Array.isArray(profile.education) ? profile.education.length : 0;
  const areaCount = Array.isArray(profile.areas) ? profile.areas.length : 0;
  const investment = typeof profile.investment === 'number' ? profile.investment : 0;
  const time = typeof profile.time === 'number' ? profile.time : 0;
  const hobbyScore = Array.isArray(profile.hobbies) ? profile.hobbies.length / 10 : 0;
  const audienceScore = Array.isArray(profile.audience) ? profile.audience.length / 10 : 0;

  return [educationCount, areaCount, investment, time, hobbyScore, audienceScore];
}
