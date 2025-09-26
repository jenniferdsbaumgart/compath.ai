import express from 'express';
import Search from '../models/Search';
import User from '../models/User';
import Course, { ICourse } from '../models/Course';
import mongoose from 'mongoose';
import Enrollment, { IEnrollment } from '../models/Enrollment';

const router = express.Router();

// Type guard para verificar se courseId é ICourse
function isICourse(course: mongoose.Types.ObjectId | ICourse): course is ICourse {
  return (course as ICourse).title !== undefined;
}

// GET /api/dashboard/:userId
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Verificar se o usuário existe
    const user = await User.findById(userId).select('coins invitedFriends');
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    // Contar pesquisas do usuário
    const searchCount = await Search.countDocuments({ userId });

    // Contar cursos ativos do usuário
    const enrollments = await Enrollment.find({ userId }).populate('courseId');
    const activeCourses = enrollments
      .filter((enrollment) => enrollment.courseId && isICourse(enrollment.courseId))
      .map((enrollment) => {
        const course = enrollment.courseId as ICourse; // Type guard garante que é ICourse
        return {
          id: course._id.toString(),
          title: course.title,
          description: course.description,
          coinCost: course.coinCost,
          duration: course.duration,
          category: course.category,
        };
      });

    // Métricas gerais
    const totalUsers = await User.countDocuments();
    const totalCourses = await Course.countDocuments();
    const totalSearches = await Search.countDocuments();
    const invitedFriends = user.invitedFriends.length;

    // Montar resposta conforme a interface DashboardMetrics
    res.json({
      coins: user.coins || 0,
      searchCount,
      activeCourses,
      totalUsers,
      totalCourses,
      totalSearches,
      userActivity: {
        invitedFriends,
      },
    });
  } catch (error) {
    console.error('Erro ao carregar o dashboard:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

export default router;