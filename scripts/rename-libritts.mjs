// Rename LibriTTS voices with a gender-appropriate first name.
// Picks deterministically by id so reruns don't reshuffle.
import pg from "pg";
import dotenv from "dotenv";
dotenv.config({ path: "../.env" });

const MALE = [
  "Aaron", "Adam", "Adrian", "Alan", "Albert", "Alex", "Andrew", "Anthony", "Arthur", "Austin",
  "Benjamin", "Bennett", "Brandon", "Brian", "Caleb", "Cameron", "Carl", "Charles", "Chris", "Connor",
  "Daniel", "David", "Derek", "Dominic", "Dylan", "Edward", "Ethan", "Eugene", "Evan", "Felix",
  "Finn", "Frank", "Gabriel", "Gavin", "George", "Gordon", "Grant", "Gregory", "Harold", "Hayden",
  "Henry", "Hugo", "Ian", "Isaac", "Jack", "Jacob", "James", "Jason", "Jeremy", "John",
  "Jonah", "Joseph", "Julian", "Kenneth", "Kevin", "Leo", "Liam", "Lucas", "Malcolm", "Marcus",
];

const FEMALE = [
  "Abigail", "Alexa", "Alice", "Amelia", "Anna", "Aria", "Audrey", "Ava", "Beatrice", "Bella",
  "Camille", "Caroline", "Charlotte", "Chloe", "Claire", "Daisy", "Diana", "Eleanor", "Elena", "Eliza",
  "Ella", "Emily", "Emma", "Esther", "Eva", "Fiona", "Grace", "Hannah", "Harper", "Hazel",
  "Ingrid", "Iris", "Isabel", "Ivy", "Jade", "Jasmine", "Jenna", "Josephine", "Julia", "Juliet",
  "Kara", "Kate", "Kira", "Laura", "Leah", "Lena", "Lila", "Lily", "Lucy", "Maeve",
  "Mara", "Maya", "Mia", "Naomi", "Nora", "Olivia", "Paige", "Piper", "Quinn", "Rose",
];

const NEUTRAL = [
  "Avery", "Blake", "Cameron", "Casey", "Dakota", "Eden", "Elliot", "Emerson", "Finley", "Harper",
  "Hayden", "Jordan", "Kai", "Logan", "Morgan", "Parker", "Phoenix", "Reese", "Riley", "Rowan",
  "Sage", "Sawyer", "Skyler", "Taylor",
];

function hashId(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function pick(gender, id) {
  const pool = gender === "M" ? MALE : gender === "F" ? FEMALE : NEUTRAL;
  return pool[hashId(id) % pool.length];
}

function parseGender(name) {
  const m = name.match(/\(\s*[A-Za-z]+\s+([MF])\s*\)$/);
  if (m) return m[1];
  // "Unindentified M" / "Unindentified F" / no gender
  const u = name.match(/\b([MF])\s*\)$/);
  return u ? u[1] : null;
}

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

const { rows } = await client.query(
  `SELECT id, name FROM "Voice" WHERE name ILIKE 'LibriTTS%' ORDER BY name`,
);

console.log(`Found ${rows.length} LibriTTS voices.`);

// Track duplicates and disambiguate with a counter
const usedByGender = new Map(); // key: first+gender, val: count

let updated = 0;
for (const v of rows) {
  const gender = parseGender(v.name);
  let first = pick(gender, v.id);

  const key = `${first}|${gender}`;
  const n = usedByGender.get(key) || 0;
  if (n > 0) {
    // Alternate pool entry for collisions
    const pool = gender === "M" ? MALE : gender === "F" ? FEMALE : NEUTRAL;
    first = pool[(hashId(v.id) + n) % pool.length];
  }
  usedByGender.set(key, n + 1);

  await client.query(`UPDATE "Voice" SET name = $1 WHERE id = $2`, [first, v.id]);
  updated++;
  if (updated <= 10 || updated % 10 === 0) {
    console.log(`  ${v.name}  →  ${first}`);
  }
}

console.log(`\nUpdated ${updated} voices.`);
await client.end();
