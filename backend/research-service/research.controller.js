const Project = require('../shared/models/research.model');
const Notification = require('../shared/models/notifications.model');
const User = require('../shared/models/auth.model');

exports.getProjects = async (req, res) => {
  try {
    const { status, search } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (search) filter.title = { $regex: search, $options: 'i' };

    const projects = await Project.find(filter)
      .populate('owner', 'name email profilePhoto')
      .populate('collaborators', 'name email profilePhoto')
      .sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch projects', error: error.message });
  }
};

exports.createProject = async (req, res) => {
  try {
    const project = new Project({ ...req.body, owner: req.user._id });
    project.activity.push({ user: req.user._id, action: 'Created the project' });
    await project.save();
    await project.populate('owner', 'name email profilePhoto');
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create project', error: error.message });
  }
};

exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email profilePhoto')
      .populate('collaborators', 'name email profilePhoto')
      .populate('activity.user', 'name profilePhoto')
      .populate('documents.uploadedBy', 'name');
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch project', error: error.message });
  }
};

exports.inviteCollaborator = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (project.collaborators.includes(user._id)) {
      return res.status(400).json({ message: 'User is already a collaborator' });
    }

    project.collaborators.push(user._id);
    project.activity.push({ user: req.user._id, action: `Invited ${user.name} to the project` });
    await project.save();

    await Notification.create({
      user: user._id,
      type: 'invitation',
      message: `${req.user.name} invited you to project "${project.title}"`,
      relatedId: project._id,
      relatedModel: 'Project'
    });

    await project.populate('owner', 'name email profilePhoto');
    await project.populate('collaborators', 'name email profilePhoto');
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Failed to invite collaborator', error: error.message });
  }
};

exports.uploadDocument = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (req.file) {
      project.documents.push({
        name: req.file.originalname,
        path: `/uploads/${req.file.filename}`,
        uploadedBy: req.user._id
      });
      project.activity.push({ user: req.user._id, action: `Uploaded ${req.file.originalname}` });
      await project.save();
    }

    await project.populate('owner', 'name email profilePhoto');
    await project.populate('collaborators', 'name email profilePhoto');
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Failed to upload document', error: error.message });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (project.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete project', error: error.message });
  }
};
