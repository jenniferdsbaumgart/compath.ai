import { Router } from 'express';
import User, { UserDocument } from '../models/User';
import ProfileResponse from '../models/ProfileResponse';
import Profile from '../models/Profile';
import jwt from 'jsonwebtoken';
import OpenAI from 'openai';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { upload } from '../middleware/uploadMiddleware';
import { updateAvatar } from '../controllers/userController';
import { authMiddleware } from '../middleware/authMiddleware';

dotenv.config();

const router = Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Middleware to verify JWT
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  jwt.verify(token, process.env.JWT_SECRET || 'secret', (err: any, decoded: any) => {
    if (err) return res.status(401).json({ message: 'Invalid token' });
    req.user = decoded;
    next();
  });
};

// Register user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      coins: 50,
      profileCompletion: 0,
      invitedFriends: [],
      favourites: [],
    });

    await user.save();

    const token = jwt.sign({ id: user._id.toString() }, process.env.JWT_SECRET || 'secret', {
      expiresIn: '1d',
    });

    res.status(201).json({
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        coins: user.coins,
        createdAt: user.createdAt,
        phone: user.phone,
        location: user.location,
        company: user.company,
        website: user.website,
        bio: user.bio,
        avatar: user.avatar,
        profileCompletion: user.profileCompletion,
        invitedFriends: user.invitedFriends,
        favourites: user.favourites,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email }) as UserDocument | null;
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id.toString() }, process.env.JWT_SECRET || 'secret', {
      expiresIn: '1d',
    });

    res.json({
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        coins: user.coins,
        createdAt: user.createdAt,
        phone: user.phone,
        location: user.location,
        company: user.company,
        website: user.website,
        bio: user.bio,
        avatar: user.avatar,
        profileCompletion: user.profileCompletion || 0,
        invitedFriends: user.invitedFriends || [],
        favourites: user.favourites || [],
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user coins
router.get('/coins', authenticateToken, async (req: any, res) => {
  try {
    const user = await User.findById(req.user.id).select('coins') as UserDocument | null;
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ coins: user.coins });
  } catch (error) {
    console.error('Error fetching coins:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Spend coins
router.post('/coins/spend', authenticateToken, async (req: any, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    const user = await User.findById(req.user.id) as UserDocument | null;
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.coins < amount) {
      return res.status(400).json({ message: 'Insufficient coins' });
    }

    user.coins -= amount;
    await user.save();

    res.json({ coins: user.coins });
  } catch (error) {
    console.error('Error spending coins:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Earn coins
router.post('/coins/earn', authenticateToken, async (req: any, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    const user = await User.findById(req.user.id) as UserDocument | null;
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.coins += amount;
    await user.save();

    res.json({ coins: user.coins });
  } catch (error) {
    console.error('Error earning coins:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Save profile response
router.post('/profile', authenticateToken, async (req: any, res) => {
  try {
    const { questionId, response } = req.body;
    const userId = req.user.id;

    if (!questionId || response === undefined) {
      return res.status(400).json({ message: 'Question ID and response are required' });
    }

    const profileResponse = new ProfileResponse({
      userId: new mongoose.Types.ObjectId(userId),
      questionId,
      response,
      createdAt: new Date(),
    });
    await profileResponse.save();

    const responses = await ProfileResponse.find({ userId });
    const totalQuestions = 5;
    const completion = Math.round((responses.length / totalQuestions) * 100);

    await User.findByIdAndUpdate(userId, { profileCompletion: completion });

    res.json({ success: true, profileCompletion: completion });
  } catch (error) {
    console.error('Error saving profile response:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get profile recommendations
router.get('/profile/recommendations', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const responses = await ProfileResponse.find({ userId });

    const responseSummary = responses.reduce((acc, r) => {
      acc[r.questionId] = r.response;
      return acc;
    }, {} as { [key: string]: any });

    const profiles = [
      { profile: 'Social', description: 'Enjoys community engagement, helping others, and promoting well-being.' },
      { profile: 'Analítico', description: 'Organized, detail-oriented, and excels in problem-solving and logistics.' },
      { profile: 'Criativo', description: 'Innovative, artistic, and enjoys creating unique products or experiences.' },
      { profile: 'Comunicador', description: 'Dynamic, expressive, and skilled at engaging and serving audiences.' },
      { profile: 'Técnico', description: 'Skilled in technical tasks, technology, and optimizing systems.' },
    ];

    const prompt = `
      Based on the following user responses, classify their entrepreneurial profile into one of these categories: ${profiles.map(p => p.profile).join(', ')}.
      Each profile has a description:
      ${profiles.map(p => `- ${p.profile}: ${p.description}`).join('\n')}

      User responses:
      - Education: ${JSON.stringify(responseSummary.education || 'N/A')}
      - Investment: ${responseSummary.investment || 'N/A'} R$
      - Time Commitment: ${responseSummary.time || 'N/A'} hours/week
      - Hobbies: ${JSON.stringify(responseSummary.hobbies || 'N/A')}
      - Target Audience: ${JSON.stringify(responseSummary.audience || 'N/A')}

      Return the profile name (e.g., "Social") that best matches the user's responses.
    `;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 50,
    });

    const selectedProfile = completion.choices[0].message.content?.trim() || 'Social';

    const profileDoc = await Profile.findOne({ name: selectedProfile });
    if (!profileDoc) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.json({
      recommendations: profileDoc.niches,
    });
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user by ID
router.get('/:id', authenticateToken, async (req: any, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password') as UserDocument | null;
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user
router.post('/:id', authenticateToken, async (req: any, res) => {
  try {
    const { name, email, phone, location, company, website, bio } = req.body;
    const user = await User.findById(req.params.id) as UserDocument | null;

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (location) user.location = location;
    if (company) user.company = company;
    if (website) user.website = website;
    if (bio) user.bio = bio;

    await user.save();

    res.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        coins: user.coins,
        createdAt: user.createdAt,
        phone: user.phone,
        location: user.location,
        company: user.company,
        website: user.website,
        bio: user.bio,
        profileCompletion: user.profileCompletion,
        invitedFriends: user.invitedFriends,
        favourites: user.favourites,
      },
      message: 'User updated successfully',
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/avatar', authMiddleware, upload.single('avatar'), updateAvatar);

export default router;