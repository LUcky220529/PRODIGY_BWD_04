const redis = require('redis');
const client = redis.createClient({
  socket: {
    port: process.env.REDIS_PORT,
    host: process.env.REDIS_HOST
  }
});

client.connect().catch(console.error);
module.exports = client;
