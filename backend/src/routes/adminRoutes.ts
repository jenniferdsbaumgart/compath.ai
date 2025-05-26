import express from 'express';
import User from '../models/User';
import Search from '../models/Search';
import Course from '../models/Course';

const router = express.Router();

router.get('/users', async (_req, res) => {
  const users = await User.find();
  res.json(users);
});

router.get('/searches', async (_req, res) => {
  const searches = await Search.find().populate('userId', 'email');
  res.json(searches);
});

router.post('/courses', async (req, res) => {
  const course = new Course(req.body);
  await course.save();
  res.json(course);
});

export default router;
