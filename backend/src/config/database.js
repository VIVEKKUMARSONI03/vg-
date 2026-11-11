const dns = require('node:dns');
const mongoose = require('mongoose');

function databaseNameFromUri(uri) {
  if (typeof uri !== 'string' || !uri.trim()) return null;
  try {
    return new mongoose.mongo.MongoClient(uri).options.dbName || null;
  } catch {
    return null;
  }
}

function assertDedicatedDatabase(uri) {
  if (databaseNameFromUri(uri) !== 'vb_gram_g') {
    throw new Error('MONGODB_URI must target the dedicated "vb_gram_g" database. Refusing to connect to any other database.');
  }
}

async function connectDatabase() {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error('MONGODB_URI is not set. Configure the database connection before starting the API.');
  }

  assertDedicatedDatabase(mongoUri);

  if (process.env.MONGODB_DNS_SERVER) {
    dns.setServers([process.env.MONGODB_DNS_SERVER]);
  }

  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB.');
  } catch (error) {
    throw new Error(
      'MongoDB connection failed. Verify the MONGODB_URI setting, DNS/network access, and database availability.',
      { cause: error }
    );
  }
}

connectDatabase.assertDedicatedDatabase = assertDedicatedDatabase;
connectDatabase.databaseNameFromUri = databaseNameFromUri;

module.exports = connectDatabase;