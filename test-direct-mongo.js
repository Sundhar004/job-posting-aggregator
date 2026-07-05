const mongoose = require('mongoose');

// Direct standard connection string using the resolved shard hosts
const directUri = "mongodb://crowdpriceuser:Sundu232004@ac-61ktelz-shard-00-00.wdsx71h.mongodb.net:27017,ac-61ktelz-shard-00-01.wdsx71h.mongodb.net:27017,ac-61ktelz-shard-00-02.wdsx71h.mongodb.net:27017/job_tracker?replicaSet=atlas-61ktelz-shard-0&ssl=true&authSource=admin";

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
