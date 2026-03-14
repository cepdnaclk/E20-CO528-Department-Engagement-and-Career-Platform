const Post = require('../shared/models/feed.model');
const Notification = require('../shared/models/notifications.model');

exports.getPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const posts = await Post.find()
      .populate('author', 'name email profilePhoto role')
      .populate('comments.author', 'name profilePhoto')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments();
    res.json({ posts, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch posts', error: error.message });
  }
};

exports.createPost = async (req, res) => {
  try {
    const { content } = req.body;
    const media = req.files ? req.files.map(f => `/uploads/${f.filename}`) : [];

    const post = new Post({ author: req.user._id, content, media });
    await post.save();
    await post.populate('author', 'name email profilePhoto role');

    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create post', error: error.message });
  }
};

exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const userId = req.user._id;
    const likeIndex = post.likes.indexOf(userId);

    if (likeIndex > -1) {
      post.likes.splice(likeIndex, 1);
    } else {
      post.likes.push(userId);
      // Create notification for post author
      if (post.author.toString() !== userId.toString()) {
        await Notification.create({
          user: post.author,
          type: 'like',
          message: `${req.user.name} liked your post`,
          relatedId: post._id,
          relatedModel: 'Post'
        });
      }
    }

    await post.save();
    await post.populate('author', 'name email profilePhoto role');
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Failed to like post', error: error.message });
  }
};

exports.commentOnPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    post.comments.push({ author: req.user._id, content: req.body.content });
    await post.save();
    await post.populate('author', 'name email profilePhoto role');
    await post.populate('comments.author', 'name profilePhoto');

    // Notification
    if (post.author.toString() !== req.user._id.toString()) {
      await Notification.create({
        user: post.author,
        type: 'comment',
        message: `${req.user.name} commented on your post`,
        relatedId: post._id,
        relatedModel: 'Post'
      });
    }

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Failed to comment', error: error.message });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete post', error: error.message });
  }
};

exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'name email profilePhoto role')
      .populate('comments.author', 'name profilePhoto');
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch post', error: error.message });
  }
};
