/**
 * Returns the Time in format HHh MMm
 * Example: 150 => "2h 30m"
 * Example: 45  => "0h 45m"
 */
export const minToHHMM = (minutes: number): string => {
  // 1. Handle edge cases (null, undefined, or negative)
  if (!minutes || minutes < 0) return "0h 0m";

  // 2. Calculate Hours and Minutes
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  // 3. Return the formatted string
  return `${hours}h ${mins}m`;
};