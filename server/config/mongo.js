import { MongoClient } from 'mongodb';
import environment from './environment.js';

let mongoClient = null;
let mongoDb = null;

export const isMongoPrimaryEnabled = () => Boolean(environment.MONGODB.useAsPrimary);

export const connectMongo = async () => {
  if (!environment.MONGODB.uri) {
    if (isMongoPrimaryEnabled()) {
      throw new Error('USE_MONGO_PRIMARY=true but MONGODB_URI is not set');
    }
    return null;
  }

  if (mongoDb) {
    return mongoDb;
  }

  mongoClient = new MongoClient(environment.MONGODB.uri);
  await mongoClient.connect();
  mongoDb = mongoClient.db(environment.MONGODB.dbName);
  return mongoDb;
};

export const getMongoDb = () => {
  if (!mongoDb) {
    throw new Error('MongoDB not connected. Call connectMongo() during startup.');
  }
  return mongoDb;
};

export const closeMongo = async () => {
  if (mongoClient) {
    await mongoClient.close();
    mongoClient = null;
    mongoDb = null;
  }
};

export default {
  connectMongo,
  getMongoDb,
  closeMongo,
  isMongoPrimaryEnabled,
};
