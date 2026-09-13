/** Present API enum values as readable labels without changing stored values. */
export function displayLabel(value: string): string {
  return value.toLowerCase().replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}
