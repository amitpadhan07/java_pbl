import { MongoClient, Db } from 'mongodb';

// MongoDB connection string (use environment variable in production)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = 'carbontrack';

// Global MongoDB client for reuse across requests
let cachedDb: Db | null = null;

export async function connectDB(): Promise<Db> {
  if (cachedDb) {
    return cachedDb;
  }

  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    cachedDb = client.db(DB_NAME);
    
    // Initialize collections
    await initializeCollections(cachedDb);
    
    return cachedDb;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

async function initializeCollections(db: Db): Promise<void> {
  const collections = await db.listCollections().toArray();
  const collectionNames = collections.map(c => c.name);

  // Create collections if they don't exist
  if (!collectionNames.includes('users')) {
    await db.createCollection('users');
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
  }

  if (!collectionNames.includes('activities')) {
    await db.createCollection('activities');
    await db.collection('activities').createIndex({ userId: 1, createdAt: -1 });
  }

  if (!collectionNames.includes('emissionFactors')) {
    await db.createCollection('emissionFactors');
  }

  if (!collectionNames.includes('reports')) {
    await db.createCollection('reports');
    await db.collection('reports').createIndex({ userId: 1, month: -1 });
  }
}

export async function getCollection(collectionName: string) {
  const db = await connectDB();
  return db.collection(collectionName);
}
