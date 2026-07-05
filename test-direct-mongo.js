const mongoose = require('mongoose');

// Direct standard connection string using the resolved shard hosts
const directUri = your_mongoDB_url;

async function testDirectConnection() {
  console.log('Connecting directly using standard mongodb:// protocol...');
  try {
    await mongoose.connect(directUri);
    console.log('✅ Direct MongoDB Connection succeeded!');
    const admin = mongoose.connection.db.admin();
    const dbs = await admin.listDatabases();
    console.log('Available databases:', dbs.databases.map(d => d.name));
    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ Direct Connection failed:', err.message);
  }
}

testDirectConnection();
