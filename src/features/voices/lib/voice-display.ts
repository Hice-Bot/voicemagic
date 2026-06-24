type DisplayVoiceInput = {
  id: string;
  name: string;
  description: string | null;
  language: string;
  variant: "SYSTEM" | "CUSTOM";
};

const DISPLAY_NAME_POOL = [
  "Aaron", "Abigail", "Adam", "Adrian", "Aiden", "Alana", "Alan", "Alexa",
  "Alex", "Alexandra", "Alexis", "Alice", "Allison", "Amanda", "Amelia",
  "Ana", "Anaya", "Anderson", "Andrew", "Andy", "Angela", "Annie", "Anthony",
  "Ari", "Ariana", "Archer", "Arthur", "Ashley", "Ashton", "Audrey", "Austin",
  "Ava", "Avery", "Bailey", "Beau", "Bella", "Benjamin", "Bennett", "Beth",
  "Bianca", "Blake", "Brady", "Brandon", "Brian", "Brianna", "Bridget",
  "Brooke", "Caleb", "Callie", "Cameron", "Camille", "Carson", "Carter",
  "Casey", "Celeste", "Charlie", "Charlotte", "Chelsea", "Chloe", "Chris",
  "Claire", "Clara", "Cole", "Colin", "Connor", "Cora", "Daisy", "Damian",
  "Daniel", "Daphne", "David", "Dean", "Delia", "Denise", "Derek", "Diana",
  "Dominic", "Drew", "Dylan", "Eden", "Edward", "Elaine", "Eleanor", "Elena",
  "Eli", "Elijah", "Elise", "Ella", "Elliot", "Emery", "Emily", "Emma",
  "Emmanuel", "Eric", "Erin", "Esther", "Ethan", "Eugene", "Eva", "Evan",
  "Evelyn", "Faith", "Felix", "Finn", "Fiona", "Frances", "Franklin", "Freya",
  "Gabriel", "Garrett", "Gavin", "Gemma", "George", "Georgia", "Gideon",
  "Giovanni", "Gloria", "Gordon", "Grace", "Graham", "Grant", "Hailey",
  "Hannah", "Harper", "Hayden", "Hazel", "Henry", "Holly", "Hugo", "Ian",
  "Iris", "Isaac", "Isabella", "Isabelle", "Ivan", "Jack", "Jackson", "Jacob",
  "Jade", "James", "Jane", "Jasper", "Jason", "Jeff", "Jenna", "Jesse",
  "Jessica", "Joel", "John", "Jonah", "Jordan", "Joseph", "Joshua", "Josie",
  "Joyce", "Julia", "Julian", "Justin", "Kara", "Katherine", "Kayla", "Keira",
  "Kelly", "Kenneth", "Kevin", "Kieran", "Kimberly", "Kyle", "Laura", "Lauren",
  "Layla", "Leah", "Lena", "Leo", "Levi", "Liam", "Lila", "Lily", "Lincoln",
  "Lisa", "Logan", "Lucas", "Lucy", "Lydia", "Mackenzie", "Madison", "Maeve",
  "Malcolm", "Mara", "Marcus", "Margaret", "Maria", "Marina", "Marisol",
  "Mark", "Martin", "Mary", "Mason", "Mateo", "Matthew", "Maya", "Meera",
  "Melissa", "Mia", "Micah", "Michael", "Miguel", "Miles", "Molly", "Morgan",
  "Murray", "Naomi", "Natalie", "Nathan", "Nicholas", "Nicole", "Nina",
  "Noah", "Nolan", "Nora", "Oliver", "Olivia", "Opal", "Oscar", "Owen",
  "Paige", "Parker", "Patrick", "Peter", "Peyton", "Phoebe", "Piper",
  "Preston", "Quinn", "Rachel", "Rebecca", "Reese", "Richard", "Riley",
  "Robert", "Rowan", "Ruby", "Russell", "Ryan", "Sabrina", "Sadie", "Samantha",
  "Samuel", "Sarah", "Scott", "Sean", "Sebastian", "Sienna", "Simon", "Sofia",
  "Sophie", "Spencer", "Stella", "Summer", "Sydney", "Taylor", "Teresa",
  "Tessa", "Theo", "Thomas", "Tobias", "Trent", "Tyler", "Una", "Vanessa",
  "Vera", "Victor", "Violet", "Vivian", "Walter", "Warren", "Wendy", "Wesley",
  "William", "Wyatt", "Xavier", "Yara", "Zane", "Zoe",
] as const;

const STANDARD_FIRST_NAMES = new Set<string>(DISPLAY_NAME_POOL);

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

function titleCaseName(value: string) {
  const lower = value.toLowerCase();
  return `${lower.charAt(0).toUpperCase()}${lower.slice(1)}`;
}

function fallbackName(id: string) {
  return DISPLAY_NAME_POOL[stableIndex(id, DISPLAY_NAME_POOL.length)];
}

function displayNameKey(name: string) {
  return name.trim().toLocaleLowerCase("en-US");
}

function nextAvailableDisplayName(seed: string, usedNames: Set<string>) {
  const start = stableIndex(seed, DISPLAY_NAME_POOL.length);

  for (let offset = 0; offset < DISPLAY_NAME_POOL.length; offset += 1) {
    const candidate = DISPLAY_NAME_POOL[(start + offset) % DISPLAY_NAME_POOL.length];
    if (!usedNames.has(displayNameKey(candidate))) {
      return candidate;
    }
  }

  return "Narrator";
}

function systemDisplayName(voice: DisplayVoiceInput) {
  const name = voice.name.replace(/\([^)]*\)/g, "").trim();
  if (/^(anonymous|unknown|vctk|founding fathers)$/i.test(name)) {
    return fallbackName(voice.id);
  }

  const parts = name.split(/[\s-]+/).map(cleanNamePart).filter(Boolean);
  const candidate = parts[0]?.length === 1 ? parts[1] : parts[0];

  const displayCandidate = candidate ? titleCaseName(candidate) : null;
  if (displayCandidate && STANDARD_FIRST_NAMES.has(displayCandidate)) {
    return displayCandidate;
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

export function normalizeVoiceList<T extends DisplayVoiceInput>(voices: T[]): T[] {
  const usedSystemNames = new Set<string>();

  return voices.map((voice) => {
    const normalized = normalizeVoiceDisplay(voice);
    if (normalized.variant !== "SYSTEM") {
      return normalized;
    }

    let displayName = normalized.name;
    let key = displayNameKey(displayName);

    if (!displayName || usedSystemNames.has(key)) {
      displayName = nextAvailableDisplayName(voice.id, usedSystemNames);
      key = displayNameKey(displayName);
    }

    usedSystemNames.add(key);

    if (displayName === normalized.name) {
      return normalized;
    }

    return {
      ...normalized,
      name: displayName,
      description: systemDescription(voice, displayName),
    };
  });
}

export function sortVoiceDisplayList<T extends Pick<DisplayVoiceInput, "id" | "name" | "variant">>(
  voices: T[],
): T[] {
  return [...voices].sort((a, b) => {
    const nameOrder = a.name.localeCompare(b.name, "en", { sensitivity: "base" });
    if (nameOrder !== 0) return nameOrder;

    const variantOrder = a.variant.localeCompare(b.variant);
    if (variantOrder !== 0) return variantOrder;

    return a.id.localeCompare(b.id);
  });
}
