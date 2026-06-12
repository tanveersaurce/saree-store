const redis = require('redis');

const client = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

client.on('error', (err) => console.log('Redis error:', err.message));
client.on('connect', () => console.log('✅ Redis Connected'));

const setCache = async (key, data, ttl = 600) => {
  return new Promise((resolve) => {
    client.setex(key, ttl, JSON.stringify(data), (err) => {
      if (err) console.log('❌ Cache set error:', err);
      else console.log('✅ Cache set:', key);
      resolve(!err);
    });
  });
};

const getCache = async (key) => {
  return new Promise((resolve) => {
    client.get(key, (err, data) => {
      if (err) console.log('❌ Cache get error:', err);
      if (data) console.log('✅ Cache hit:', key);
      if (!data) console.log('⚠️ Cache miss:', key);
      resolve(data ? JSON.parse(data) : null);
    });
  });
};

const deleteCache = async (key) => {
  return new Promise((resolve) => {
    client.del(key, (err) => resolve(!err));
  });
};



module.exports = { getCache, setCache, deleteCache };