import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../src/models/User';
import type { IUser } from '../src/models/User';
import Course, { ICourse } from '../src/models/Course';
import Enrollment, { IEnrollment } from '../src/models/Enrollment';
import Search from '../src/models/Search';
import * as dotenv from 'dotenv'; // Import dotenv
dotenv.config(); 

const MONGODB_URI = process.env.MONGODB_URI || '';
if (!MONGODB_URI) {
  throw new Error('MONGODB_URI is not defined in the environment variables.');
}
const SALT_ROUNDS = 10;

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Course.deleteMany({});
    await Enrollment.deleteMany({});
    await Search.deleteMany({});
    console.log('Cleared existing data');

    // Hash passwords
    const testPassword = await bcrypt.hash('test123', SALT_ROUNDS);
    const adminPassword = await bcrypt.hash('admin123', SALT_ROUNDS);

    // Create users
    const users: IUser[] = await User.insertMany([
      {
        name: 'Test User',
        email: 'test@example.com',
        password: testPassword,
        coins: 100,
        invitedFriends: [],
        profileCompletion: 50,
        createdAt: new Date(),
      },
      {
        name: 'Admin',
        email: 'admin@compath.com',
        password: adminPassword,
        coins: 200,
        invitedFriends: [],
        profileCompletion: 100,
        createdAt: new Date(),
      },
    ]);
    console.log('Created users:', users.map((u) => u.email));

    // Create sample courses
    const courses: ICourse[] = await Course.insertMany([
      {
        title: 'Curso de Empreendedorismo',
        description: 'Aprenda a empreender com sucesso',
        coinCost: 50,
        duration: '2 horas',
        category: 'Empreendedorismo',
        createdAt: new Date(),
      },
      {
        title: 'Marketing Digital',
        description: 'Estratégias de marketing online',
        coinCost: 30,
        duration: '1.5 horas',
        category: 'Marketing',
        createdAt: new Date(),
      },
    ]);
    console.log('Created courses:', courses.length);

    // Create enrollments for the test user
    const enrollments: IEnrollment[] = (await Enrollment.insertMany([
        {
          userId: users[0]._id, // Test User
          courseId: courses[0]._id,
          createdAt: new Date(),
        },
        {
          userId: users[0]._id, // Test User
          courseId: courses[1]._id,
          createdAt: new Date(),
        },
      ])) as IEnrollment[]; 
    console.log('Created enrollments:', enrollments.length);

    // Create sample searches for the test user
    await Search.insertMany([
      {
        userId: users[0]._id, // Test User
        query: 'empreendedorismo',
        createdAt: new Date(),
      },
      {
        userId: users[0]._id, // Test User
        query: 'marketing',
        createdAt: new Date(),
      },
    ]);
    console.log('Created searches: 2');

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seedDatabase();