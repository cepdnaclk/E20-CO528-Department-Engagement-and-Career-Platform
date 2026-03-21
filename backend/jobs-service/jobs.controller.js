const Job = require('../shared/models/jobs.model');
const Notification = require('../shared/models/notifications.model');

exports.getJobs = async (req, res) => {
  try {
    const { type, search } = req.query;
    const filter = { isActive: true };
    if (type) filter.type = type;
    if (search) filter.title = { $regex: search, $options: 'i' };

    const jobs = await Job.find(filter)
      .populate('postedBy', 'name email profilePhoto role')
      .sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch jobs', error: error.message });
  }
};

exports.createJob = async (req, res) => {
  try {
    const job = new Job({ ...req.body, postedBy: req.user._id });
    await job.save();
    await job.populate('postedBy', 'name email profilePhoto role');
    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create job', error: error.message });
  }
};

exports.getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('postedBy', 'name email profilePhoto role')
      .populate('applications.applicant', 'name email profilePhoto');
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch job', error: error.message });
  }
};

exports.applyForJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const alreadyApplied = job.applications.some(
      app => app.applicant.toString() === req.user._id.toString()
    );
    if (alreadyApplied) {
      return res.status(400).json({ message: 'Already applied for this job' });
    }

    job.applications.push({
      applicant: req.user._id,
      coverLetter: req.body.coverLetter || '',
      resume: req.file ? `/uploads/${req.file.filename}` : (req.body.resume || '')
    });
    await job.save();

    // Notify job poster
    await Notification.create({
      user: job.postedBy,
      type: 'application',
      message: `${req.user.name} applied for ${job.title}`,
      relatedId: job._id,
      relatedModel: 'Job'
    });

    res.json({ message: 'Application submitted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to apply', error: error.message });
  }
};

exports.getMyApplications = async (req, res) => {
  try {
    const jobs = await Job.find({ 'applications.applicant': req.user._id })
      .populate('postedBy', 'name email');
    
    const applications = jobs.map(job => {
      const app = job.applications.find(a => a.applicant.toString() === req.user._id.toString());
      return {
        job: { _id: job._id, title: job.title, company: job.company, type: job.type },
        status: app.status,
        appliedAt: app.appliedAt
      };
    });
    
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch applications', error: error.message });
  }
};

exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (job.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await Job.findByIdAndDelete(req.params.id);
    res.json({ message: 'Job deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete job', error: error.message });
  }
};
