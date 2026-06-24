type DisplayVoiceInput = {
  id: string;
  name: string;
  description: string | null;
  language: string;
  variant: "SYSTEM" | "CUSTOM";
};

const STANDARD_FIRST_NAMES = new Set([
  "Aaron", "Abigail", "Adam", "Adrian", "Alan", "Alex", "Anaya", "Andrew",
  "Andy", "Anthony", "Archer", "Arthur", "Audrey", "Austin", "Ava", "Bella",
  "Benjamin", "Bennett", "Brandon", "Brian", "Caleb", "Cameron", "Camille",
  "Charlotte", "Chloe", "Chris", "Claire", "Daisy", "Daniel", "David",
  "Derek", "Dominic", "Dylan", "Edward", "Eleanor", "Ella", "Emily", "Emma",
  "Emmanuel", "Esther", "Ethan", "Eugene", "Eva", "Evan", "Evelyn", "Fiona",
  "Frances", "Gabriel", "Gavin", "George", "Giovanni", "Gordon", "Grace",
  "Grant", "Harper", "Hayden", "Henry", "Ivan", "Jack", "James", "Jane",
  "Laura", "Lucy", "Madison", "Maeve", "Mara", "Marcus", "Marisol", "Mason",
  "Mateo", "Matthew", "Meera", "Mia", "Micah", "Miguel", "Murray", "Nora",
  "Olivia", "Piper", "Quinn", "Robert", "Ruby", "Ryan", "Sadie", "Sarah",
  "Scott", "Thomas", "Victor", "Walter", "William", "Zane",
]);

const FALLBACK_FIRST_NAMES = [
  "Avery", "Blake", "Callie", "Drew", "Elena", "Felix", "Gemma", "Hannah",
  "Isaac", "Jasper", "Keira", "Liam", "Maya", "Noah", "Opal", "Paige",
  "Reese", "Sofia", "Theo", "Una", "Violet", "Wesley", "Yara", "Zoe",
  "Nina", "Miles", "Iris", "Jonah", "Lena", "Owen", "Tessa", "Elliot",
];

const LANGUAGE_NOTES: Record<string, string> = {
  "en-AU": "Australian English accent",
  "en-GB": "British English accent",
  "en-IN": "Indian English accent",
};

function stableIndex(value: string, length: number) {
  let hash = 0;
  for (const char of value) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }
  return hash % length;
}

function cleanNamePart(value: string | undefined) {
  return value?.replace(/[^A-Za-z]/g, "") ?? "";
}

function fallbackName(id: string) {
  return FALLBACK_FIRST_NAMES[stableIndex(id, FALLBACK_FIRST_NAMES.length)];
}

function systemDisplayName(voice: DisplayVoiceInput) {
  const name = voice.name.replace(/\([^)]*\)/g, "").trim();
  if (/^(anonymous|unknown|vctk|founding fathers)$/i.test(name)) {
    return fallbackName(voice.id);
  }

  const parts = name.split(/[\s-]+/).map(cleanNamePart).filter(Boolean);
  const candidate = parts[0]?.length === 1 ? parts[1] : parts[0];

  if (candidate && STANDARD_FIRST_NAMES.has(candidate)) {
    return candidate;
  }

  return fallbackName(voice.id);
}

function languageNote(language: string) {
  return LANGUAGE_NOTES[language] ?? null;
}

function appendLanguageNote(description: string, language: string) {
  const note = languageNote(language);
  if (!note || description.toLowerCase().includes(note.toLowerCase())) {
    return description;
  }

  return `${description} Includes a ${note}.`;
}

function generatedDescription(voice: DisplayVoiceInput, displayName: string) {
  const original = voice.description ?? "";
  const lower = original.toLowerCase();
  const accentMatch = original.match(/(?:speaker,\s*)?([A-Za-z .-]+ accent)(?: \(([^)]+)\))?/i);

  if (/public domain voice|librivox reader/i.test(original)) {
    return `${displayName} has a classic audiobook narration style with steady pacing, clear diction, and a warm storytelling tone.`;
  }

  if (/vctk|studio-recorded|professional english speaker/i.test(original) && accentMatch?.[1]) {
    const accent = accentMatch[1].replace(/\s+/g, " ").trim();
    return `${displayName} has a polished ${accent} with clear diction, natural pacing, and a studio-ready sound.`;
  }

  if (/male|man/.test(lower) || /female|woman/.test(lower) || lower.startsWith("a ")) {
    const gender = /female|woman/.test(lower) ? "female" : /male|man/.test(lower) ? "male" : "narrator";
    const energy = /expressive|animated/.test(lower)
      ? "expressive"
      : /monotone|restrained/.test(lower)
        ? "steady"
        : "natural";
    const pitch = /low[- ]pitch/.test(lower)
      ? "a lower pitch"
      : /high[- ]pitch/.test(lower)
        ? "a brighter pitch"
        : "a balanced pitch";
    const pace = /fast|quick|hurried/.test(lower)
      ? "brisk pacing"
      : /slow|slowed/.test(lower)
        ? "measured pacing"
        : "moderate pacing";
    const texture = /noise|echo|background/.test(lower)
      ? "a lightly textured recording character"
      : "a clean, close studio presence";

    return `${displayName} is a clear ${gender} voice with ${energy} delivery, ${pitch}, ${pace}, and ${texture}.`;
  }

  return `${displayName} has a clear, flexible voice suited for natural text-to-speech, narration, and short-form audio.`;
}

function systemDescription(voice: DisplayVoiceInput, displayName: string) {
  const description = voice.description?.trim();
  const shouldReplace =
    !description ||
    /public domain voice|librivox reader|vctk|studio-recorded|professional english speaker/i.test(description) ||
    /^a\s+(male|female|man|woman)\b/i.test(description) ||
    /^afemale\b/i.test(description) ||
    /speakerdelivers/i.test(description);

  const nextDescription = shouldReplace
    ? generatedDescription(voice, displayName)
    : description;

  return appendLanguageNote(nextDescription, voice.language);
}

export function normalizeVoiceDisplay<T extends DisplayVoiceInput>(voice: T): T {
  if (voice.variant === "CUSTOM") {
    return voice;
  }

  const displayName = systemDisplayName(voice);

  return {
    ...voice,
    name: displayName,
    description: systemDescription(voice, displayName),
  };
}
