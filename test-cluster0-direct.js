const mongoose = require('mongoose');

const directUri = "mongodb://job_tracker_user:JobTracker2024@ac-rgxn4ai-shard-00-00.0krywdt.mongodb.net:27017,ac-rgxn4ai-shard-00-01.0krywdt.mongodb.net:27017,ac-rgxn4ai-shard-00-02.0krywdt.mongodb.net:27017/job_tracker?replicaSet=atlas-0krywdt-shard-0&ssl=true&authSource=admin";

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
