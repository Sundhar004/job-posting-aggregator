const mongoose = require('mongoose');

const directUri = your_mongoDB_atlas_url

async function testDirectConnection() {
  console.log('Connecting directly to cluster0 using standard mongodb:// protocol...');
  try {
    await mongoose.connect(directUri);
    console.log('✅ Direct MongoDB Connection to Cluster0 succeeded!');
    const admin = mongoose.connection.db.admin();
    const dbs = await admin.listDatabases();
    console.log('Available databases:', dbs.databases.map(d => d.name));
    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ Direct Connection failed:', err.message);
  }
}

testDirectConnection();
