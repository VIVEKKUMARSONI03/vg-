require('dotenv').config();

const app = require('./app');
const connectDatabase = require('./config/database');
const mongoose = require('mongoose');

const port = process.env.PORT ? Number(process.env.PORT) : 53184;

async function startServer() {
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be an integer between 1 and 65535.');
  }
  await connectDatabase();

  const server = app.listen(port);
  server.on('listening', () => {
    console.log(`API listening at http://localhost:${port}`);
  });
  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`Port ${port} is already in use. Stop the other process or configure a different PORT.`);
    } else {
      console.error(`API could not start: ${error.code || error.message}`);
    }
    process.exitCode = 1;
    mongoose.disconnect().catch(() => {
      console.error('MongoDB could not be disconnected after the server failed to start.');
    });
  });
}

startServer().catch(async (error) => {
  console.error(`API startup failed: ${error.message}`);
  process.exitCode = 1;
  try {
    await mongoose.disconnect();
  } catch {
    console.error('MongoDB cleanup failed after API startup failure.');
  }
});