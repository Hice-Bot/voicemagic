#!/usr/bin/env node
// Seeds LibriVox harvested voices into R2 + database
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config({ path: new URL("../.env", import.meta.url).pathname });

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VOICES_DIR = path.join(__dirname, "system-voices-librivox");
const METADATA_PATH = path.join(VOICES_DIR, "_metadata.json");

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const CATEGORY_MAP = {
  AUDIOBOOK: "AUDIOBOOK",
  NARRATIVE: "NARRATIVE",
  PODCAST: "PODCAST",
  GENERAL: "GENERAL",
};

function cuid() {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 12);
  return `c${ts}${rand}`;
}

async function main() {
  const metadata = JSON.parse(fs.readFileSync(METADATA_PATH, "utf8"));
  const names = Object.keys(metadata);
  console.log(`Seeding ${names.length} LibriVox voices...`);

  let seeded = 0, skipped = 0, errors = 0;

  for (const name of names) {
    const wavPath = path.join(VOICES_DIR, `${name}.wav`);
    if (!fs.existsSync(wavPath)) {
      console.log(`  SKIP ${name} — WAV not found`);
      skipped++;
      continue;
    }

    // Check if already exists
    const { rows: existing } = await pool.query(
      `SELECT id FROM "Voice" WHERE name = $1 AND variant = 'SYSTEM' LIMIT 1`,
      [name]
    );
    if (existing.length > 0) {
      console.log(`  SKIP ${name} — already in DB`);
      skipped++;
      continue;
    }

    const info = metadata[name];
    const slug = name.replace(/\s+/g, "-").toLowerCase().replace(/[^a-z0-9-]/g, "");
    const r2Key = `system-voices/${slug}.wav`;
    const category = CATEGORY_MAP[info.category] || "AUDIOBOOK";

    try {
      // Upload to R2
      const buffer = fs.readFileSync(wavPath);
      await r2.send(new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: r2Key,
        Body: buffer,
        ContentType: "audio/wav",
      }));

      // Create DB record
      const id = cuid();
      const now = new Date().toISOString();
      await pool.query(
        `INSERT INTO "Voice" (id, "orgId", name, description, category, language, variant, "r2ObjectKey", "createdAt", "updatedAt")
         VALUES ($1, NULL, $2, $3, $4, $5, 'SYSTEM', $6, $7, $7)`,
        [id, name, info.description, category, info.language || "en-US", r2Key, now]
      );

      console.log(`  ✓ ${name}`);
      seeded++;
    } catch (err) {
      console.error(`  ✗ ${name}: ${err.message}`);
      errors++;
    }
  }

  console.log(`\nDone: ${seeded} seeded, ${skipped} skipped, ${errors} errors`);
  await pool.end();
}

main().catch(e => { console.error(e); process.exit(1); });
