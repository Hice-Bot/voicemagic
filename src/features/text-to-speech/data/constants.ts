export const TEXT_MAX_LENGTH = 5000;
export const CREDITS_PER_CHARACTER = 1;

export function estimateCreditsForText(text: string) {
  return text.trim().length * CREDITS_PER_CHARACTER;
}
