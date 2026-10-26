const { MongoMemoryReplSet } = require('mongodb-memory-server');
const mongoose = require('mongoose');
exports.openDatabase = async () => {
  const replica = await MongoMemoryReplSet.create({ replSet: { count: 1 }, binary: { version: '8.0.17' } });
  const connection = await mongoose.createConnection(replica.getUri('city_tire_test')).asPromise();
  return { connection, close: async () => { await connection.close(); await replica.stop(); } };
};
