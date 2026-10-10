const { Client } = require('pg');

async function tryClear() {
  const users = ['postgres.arygiubgshkzlqhmdszc'];
  const ports = [6543, 5432];
  
  for (const user of users) {
    for (const port of ports) {
      console.log(`Trying ${user} on port ${port} with object config...`);
      
      const client = new Client({
        host: 'aws-0-ap-northeast-2.pooler.supabase.com',
        port: port,
        database: 'postgres',
        user: user,
        password: 'Wishone@4229',
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 5000
      });

      try {
        await client.connect();
        console.log(`SUCCESS! Connected with ${user} on port ${port}`);
        
        const res = await client.query('DELETE FROM auth.users WHERE id IS NOT NULL;');
        console.log(`DELETED ${res.rowCount} users! All data cleared!`);
        
        await client.end();
        return;
      } catch (err) {
        console.log(`Failed: ${err.message}`);
        await client.end();
      }
    }
  }
}

tryClear();
