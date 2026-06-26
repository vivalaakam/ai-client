export function firstLine(value: string) {
  return value
    .split('\n')
    .map((line) => line.trim())
    .find(Boolean);
}
