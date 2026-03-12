#!/usr/bin/env node
// Script pour deployer le schema SQL sur Supabase
import { readFileSync } from 'fs';
import pg from 'pg';

const DATABASE_URL = 'postgresql://postgres:BPePyKVgslFm6SVL@db.cubjvrpgqalhoidmnerg.supabase.co:5432/postgres';

async function deploy() {
  const client = new pg.Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Connexion a Supabase PostgreSQL...');
    await client.connect();
    console.log('Connecte.');

    const sql = readFileSync(new URL('./schema.sql', import.meta.url), 'utf8');

    // Decouper par blocs de commandes (separes par des lignes vides entre sections)
    // On execute le tout d'un coup car PostgreSQL gere les transactions
    console.log('Execution du schema SQL...');
    await client.query(sql);
    console.log('Schema deploye avec succes !');

    // Verifier les tables creees
    const { rows } = await client.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    console.log(`\n${rows.length} tables creees :`);
    rows.forEach(r => console.log(`  - ${r.table_name}`));

    // Verifier les enums
    const { rows: enums } = await client.query(`
      SELECT typname FROM pg_type
      WHERE typtype = 'e' AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
      ORDER BY typname
    `);
    console.log(`\n${enums.length} types enum crees :`);
    enums.forEach(e => console.log(`  - ${e.typname}`));

  } catch (err) {
    console.error('Erreur:', err.message);
    if (err.position) {
      const lines = readFileSync(new URL('./schema.sql', import.meta.url), 'utf8').substring(0, parseInt(err.position)).split('\n');
      console.error(`  -> Ligne ~${lines.length} du fichier schema.sql`);
    }
    process.exit(1);
  } finally {
    await client.end();
  }
}

deploy();
