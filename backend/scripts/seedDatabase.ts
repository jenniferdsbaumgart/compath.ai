import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User, { IUser } from '../src/models/User';
import Course, { ICourse } from '../src/models/Course';
import Enrollment, { IEnrollment } from '../src/models/Enrollment';
import Search from '../src/models/Search';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/compath';
const SALT_ROUNDS = 10;

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
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
    const testUser: IUser = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: testPassword,
      coins: 100,
      invitedFriends: [],
      profileCompletion: 50,
      createdAt: new Date(),
      favourites: [
        {
          title: 'Nicho de E-commerce',
          description: 'Ideias para lojas online',
          tags: ['e-commerce', 'negócios'],
          url: 'https://example.com/ecommerce',
          savedAt: new Date(),
        },
      ],
    });

    const adminUser: IUser = await User.create({
      name: 'Admin',
      email: 'admin@compath.com',
      password: adminPassword,
      coins: 200,
      invitedFriends: [testUser._id], // Admin invited Test User
      profileCompletion: 100,
      createdAt: new Date(),
      favourites: [
        {
          title: 'Gestão de Startups',
          description: 'Dicas para startups',
          tags: ['startups', 'gestão'],
          url: 'https://example.com/startups',
          savedAt: new Date(),
        },
      ],
    });

    // Update Test User's invitedFriends to include Admin (optional)
    await User.updateOne({ _id: testUser._id }, { $set: { invitedFriends: [adminUser._id] } });

    console.log('Created users:', [testUser.email, adminUser.email]);

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

    // Create enrollments for Test User
    const enrollments: IEnrollment[] = await Enrollment.insertMany([
      {
        userId: testUser._id,
        courseId: courses[0]._id,
        createdAt: new Date(),
      },
      {
        userId: testUser._id,
        courseId: courses[1]._id,
        createdAt: new Date(),
      },
    ]) as IEnrollment[];
    console.log('Created enrollments:', enrollments.length);

    // Create sample searches for Test User
    await Search.insertMany([
      {
        userId: testUser._id,
        query: 'empreendedorismo',
        createdAt: new Date(),
      },
      {
        userId: testUser._id,
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