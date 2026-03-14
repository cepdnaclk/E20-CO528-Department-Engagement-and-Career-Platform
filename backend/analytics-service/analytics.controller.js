const User = require('../shared/models/auth.model');
const Post = require('../shared/models/feed.model');
const Job = require('../shared/models/jobs.model');
const Event = require('../shared/models/events.model');
const Project = require('../shared/models/research.model');

exports.getOverview = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalPosts = await Post.countDocuments();
    const totalJobs = await Job.countDocuments();
    const totalEvents = await Event.countDocuments();
    const totalProjects = await Project.countDocuments();
    const studentCount = await User.countDocuments({ role: 'student' });
    const alumniCount = await User.countDocuments({ role: 'alumni' });
    const adminCount = await User.countDocuments({ role: 'admin' });

    res.json({
      totalUsers, totalPosts, totalJobs, totalEvents, totalProjects,
      userBreakdown: { students: studentCount, alumni: alumniCount, admins: adminCount }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch overview', error: error.message });
  }
};

exports.getUserStats = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const users = await User.find({ createdAt: { $gte: thirtyDaysAgo } }).select('createdAt role');
    
    // Group by day
    const dailyStats = {};
    users.forEach(user => {
      const day = user.createdAt.toISOString().split('T')[0];
      if (!dailyStats[day]) dailyStats[day] = { date: day, count: 0, students: 0, alumni: 0 };
      dailyStats[day].count++;
      if (user.role === 'student') dailyStats[day].students++;
      if (user.role === 'alumni') dailyStats[day].alumni++;
    });

    res.json(Object.values(dailyStats).sort((a, b) => a.date.localeCompare(b.date)));
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user stats', error: error.message });
  }
};

exports.getPostStats = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', 'name')
      .sort({ createdAt: -1 })
      .limit(20);

    const postStats = posts.map(p => ({
      _id: p._id,
      content: p.content.substring(0, 100),
      author: p.author?.name || 'Unknown',
      likes: p.likes.length,
      comments: p.comments.length,
      engagement: p.likes.length + p.comments.length,
      createdAt: p.createdAt
    }));

    postStats.sort((a, b) => b.engagement - a.engagement);
    res.json(postStats);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch post stats', error: error.message });
  }
};

exports.getJobStats = async (req, res) => {
  try {
    const jobs = await Job.find().populate('postedBy', 'name');
    const jobStats = jobs.map(j => ({
      _id: j._id,
      title: j.title,
      company: j.company,
      postedBy: j.postedBy?.name || 'Unknown',
      applications: j.applications.length,
      type: j.type,
      createdAt: j.createdAt
    }));
    jobStats.sort((a, b) => b.applications - a.applications);
    res.json(jobStats);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch job stats', error: error.message });
  }
};
