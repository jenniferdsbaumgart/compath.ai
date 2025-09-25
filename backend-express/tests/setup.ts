import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

// Mock environment variables
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test_jwt_secret";
process.env.MONGODB_URI = "mongodb://localhost:27017/compath-test";
process.env.OPENAI_API_KEY = "test_openai_key";

// Global test setup
beforeAll(async () => {
  // Start in-memory MongoDB
  const mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  process.env.MONGODB_URI = mongoUri;

  // Connect to test database
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  // Close database connection
  await mongoose.disconnect();
});

beforeEach(async () => {
  // Clear all collections before each test
  const collections = mongoose.connection.collections;

  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});
