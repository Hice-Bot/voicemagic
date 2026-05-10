import pg from "pg";

const { Client } = pg;
const c = new Client({ connectionString: process.env.DATABASE_URL });
c.connect().then(async () => {
  const orgs = await c.query('SELECT DISTINCT "orgId" FROM "Generation" LIMIT 1');
  const orgId = orgs.rows[0]?.orgId || "demo";
  await c.query(
    'INSERT INTO "ApiKey" (id, "orgId", name, "keyHash", "keyPrefix", "createdAt") VALUES ($1, $2, $3, $4, $5, NOW()) ON CONFLICT (id) DO NOTHING',
    ["demo_key_1", orgId, "Demo Key", "923039d992e8c101059b48a9449612c449be7f9545fd0501a1ef3afae92826f2", "vm_e07fc1df"]
  );
  const voices = await c.query("SELECT id, name FROM \"Voice\" WHERE name IN ('Aaron','Gavin','Archer','Madison','Abigail') AND variant = 'SYSTEM'");
  console.log(JSON.stringify({orgId, voices: voices.rows}));
  c.end();
}).catch(e => { console.error(e.message); c.end(); });
