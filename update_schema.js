import pg from 'pg';
import dns from 'dns';

// Force DNS resolution to IPv6
dns.setDefaultResultOrder('ipv6first');

const connectionString = 'postgresql://postgres:Wishone%404229@db.arygiubgshkzlqhmdszc.supabase.co:5432/postgres';

const pool = new pg.Pool({
  connectionString,
});

async function updateSchema() {
  let client;
  try {
    client = await pool.connect();
    console.log('Connected to Supabase PostgreSQL database.');

    console.log('Adding to_username column to wishes...');
    await client.query(`ALTER TABLE public.wishes ADD COLUMN IF NOT EXISTS to_username TEXT;`);
    
    console.log('Adding media_type column to wishes...');
    await client.query(`ALTER TABLE public.wishes ADD COLUMN IF NOT EXISTS media_type TEXT CHECK (media_type IN ('image', 'video', null));`);

    console.log('Reloading PostgREST schema cache...');
    await client.query(`NOTIFY pgrst, 'reload schema';`);

    console.log('Database updated successfully! The schema cache has been reloaded.');
  } catch (error) {
    console.error('Error updating schema:', error);
  } finally {
    if (client) client.release();
    await pool.end();
  }
}

updateSchema();
