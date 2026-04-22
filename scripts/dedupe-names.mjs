// De-duplicate voice names by walking unused pool entries per gender.
import pg from "pg";
import dotenv from "dotenv";
dotenv.config({ path: "../.env" });

const MALE = [
  "Aaron","Adam","Adrian","Alan","Albert","Alex","Andrew","Anthony","Arthur","Austin",
  "Benjamin","Bennett","Brandon","Brian","Caleb","Cameron","Carl","Charles","Chris","Connor",
  "Daniel","David","Derek","Dominic","Dylan","Edward","Ethan","Eugene","Evan","Felix",
  "Finn","Frank","Gabriel","Gavin","George","Gordon","Grant","Gregory","Harold","Hayden",
  "Henry","Hugo","Ian","Isaac","Jack","Jacob","James","Jason","Jeremy","John",
  "Jonah","Joseph","Julian","Kenneth","Kevin","Leo","Liam","Lucas","Malcolm","Marcus",
  "Mason","Mateo","Matthew","Micah","Miles","Nathan","Nicholas","Noah","Oliver","Oscar",
  "Owen","Patrick","Paul","Peter","Quentin","Ralph","Reuben","Richard","Robert","Roman",
  "Ryan","Samuel","Sebastian","Simon","Spencer","Stephen","Stuart","Theo","Thomas","Toby",
  "Tristan","Tyler","Victor","Vincent","Wade","Walter","Warren","Wesley","William","Xavier",
];

const FEMALE = [
  "Abigail","Alexa","Alice","Amelia","Anna","Aria","Audrey","Ava","Beatrice","Bella",
  "Camille","Caroline","Charlotte","Chloe","Claire","Daisy","Diana","Eleanor","Elena","Eliza",
  "Ella","Emily","Emma","Esther","Eva","Fiona","Grace","Hannah","Harper","Hazel",
  "Ingrid","Iris","Isabel","Ivy","Jade","Jasmine","Jenna","Josephine","Julia","Juliet",
  "Kara","Kate","Kira","Laura","Leah","Lena","Lila","Lily","Lucy","Maeve",
  "Mara","Maya","Mia","Naomi","Nora","Olivia","Paige","Piper","Quinn","Rose",
  "Ruby","Sadie","Sage","Sarah","Scarlett","Sienna","Sophia","Stella","Sylvie","Tessa",
  "Thea","Valerie","Vera","Violet","Willow","Zara","Zoe",
];

const NEUTRAL = [
  "Avery","Blake","Casey","Dakota","Eden","Elliot","Emerson","Finley","Jordan","Kai",
  "Logan","Morgan","Parker","Phoenix","Reese","Riley","Rowan","Sawyer","Skyler","Taylor",
];

function hash(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

// Infer gender from the description, since names no longer include it.
function inferGender(desc) {
  if (!desc) return null;
  const lc = desc.toLowerCase();
  // Male indicators first (more specific)
  if (/\b(male speaker|a man|his |male voice|his speech|his lines|his monotone|his words|his message|his tone|male narrator)\b/.test(lc)) return "M";
  if (/\b(female speaker|a woman|her |female voice|her speech|her lines|her monotone|her words|her message|her tone|female narrator)\b/.test(lc)) return "F";
  return null;
}

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

// Only touch voices renamed from LibriTTS: they have a short single-word name AND
// a description that mentions "speaker" / typical LibriTTS phrasing.
const { rows: voices } = await client.query(`
  SELECT id, name, description
  FROM "Voice"
  WHERE description ILIKE '%monotone%' OR description ILIKE '%speaker delivers%' OR description ILIKE '%male speaker%' OR description ILIKE '%female speaker%'
  ORDER BY "createdAt" ASC
`);
console.log(`Examining ${voices.length} likely-LibriTTS voices.`);

// What names exist in DB (across ALL voices, to avoid colliding with non-LibriTTS too)
const { rows: allNames } = await client.query(`SELECT LOWER(name) AS name FROM "Voice"`);
const taken = new Set(allNames.map((r) => r.name));

// Walk each voice; if its current name collides with another (count > 1), reassign.
// Build collision set first:
const counts = new Map();
for (const v of voices) {
  const k = v.name.toLowerCase();
  counts.set(k, (counts.get(k) || 0) + 1);
}

const poolFor = (g) => (g === "M" ? MALE : g === "F" ? FEMALE : NEUTRAL);

// Sort by hash(id) so reassignment order is deterministic
const toFix = voices
  .filter((v) => counts.get(v.name.toLowerCase()) > 1)
  .sort((a, b) => hash(a.id) - hash(b.id));

console.log(`${toFix.length} duplicates to reassign.`);

let keepFirst = new Set(); // keep one voice per dup name unchanged
for (const v of toFix) {
  const k = v.name.toLowerCase();
  if (!keepFirst.has(k)) {
    keepFirst.add(k);
    continue; // keep this one
  }

  const gender = inferGender(v.description);
  const pool = poolFor(gender);
  const start = hash(v.id) % pool.length;
  let chosen = null;
  for (let i = 0; i < pool.length; i++) {
    const candidate = pool[(start + i) % pool.length];
    if (!taken.has(candidate.toLowerCase())) {
      chosen = candidate;
      break;
    }
  }
  if (!chosen) {
    // All pool names taken — append a number
    chosen = `${pool[start]} ${Math.floor(hash(v.id) % 99) + 2}`;
  }
  taken.add(chosen.toLowerCase());
  // Remove old entry from taken, so its slot frees up
  taken.delete(v.name.toLowerCase());
  await client.query(`UPDATE "Voice" SET name = $1 WHERE id = $2`, [chosen, v.id]);
  console.log(`  ${v.name}  →  ${chosen}  (${gender ?? "?"})`);
}

// Final verification
const { rows: dupCheck } = await client.query(`
  SELECT name, COUNT(*) AS n FROM "Voice" GROUP BY name HAVING COUNT(*) > 1 ORDER BY n DESC
`);
console.log(`\nRemaining duplicates: ${dupCheck.length}`);
dupCheck.forEach((r) => console.log(`  ${r.name} × ${r.n}`));

await client.end();
