#!/usr/bin/env node
// Re-trim all system voice samples to 10 seconds and re-upload to R2
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import pg from "pg";
import os from "os";

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

const TARGET_SECONDS = 10;

async function streamToBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks);
}

async function trimAndReupload(r2Key) {
  // Download from R2
  const resp = await r2.send(new GetObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: r2Key,
  }));
  const inputBuf = await streamToBuffer(resp.Body);

  // Write to temp file, trim to TARGET_SECONDS
  const tmpIn = path.join(os.tmpdir(), `vm_trim_in_${Date.now()}.wav`);
  const tmpOut = path.join(os.tmpdir(), `vm_trim_out_${Date.now()}.wav`);
  fs.writeFileSync(tmpIn, inputBuf);

  execSync(
    `ffmpeg -y -i "${tmpIn}" -t ${TARGET_SECONDS} -af loudnorm=I=-16:TP=-1.5:LRA=11 -ar 22050 -ac 1 "${tmpOut}"`,
    { stdio: "pipe" }
  );

  const trimmedBuf = fs.readFileSync(tmpOut);
  fs.unlinkSync(tmpIn);
  fs.unlinkSync(tmpOut);

  // Re-upload to same key
  await r2.send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: r2Key,
    Body: trimmedBuf,
    ContentType: "audio/wav",
  }));

  const savedKB = Math.round((inputBuf.length - trimmedBuf.length) / 1024);
  return `✓ saved ${savedKB}KB`;
}

async function main() {
  const { rows: voices } = await pool.query(
    `SELECT id, name, "r2ObjectKey" FROM "Voice" WHERE variant = 'SYSTEM' AND "r2ObjectKey" IS NOT NULL ORDER BY name`
  );

  console.log(`Trimming ${voices.length} system voices to ${TARGET_SECONDS}s...\n`);

  let trimmed = 0, skipped = 0, errors = 0;

  for (const voice of voices) {
    process.stdout.write(`  ${voice.name}... `);
    try {
      const result = await trimAndReupload(voice.r2ObjectKey);
      console.log(result);
      if (result.startsWith("trimmed")) trimmed++;
      else skipped++;
    } catch (err) {
      console.log(`✗ ${err.message}`);
      errors++;
    }
  }

  console.log(`\nDone: ${trimmed} trimmed, ${skipped} already short, ${errors} errors`);
  await pool.end();
}

main().catch(e => { console.error(e); process.exit(1); });
