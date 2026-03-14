const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['like', 'comment', 'application', 'rsvp', 'invitation', 'message', 'system'], required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  relatedId: { type: mongoose.Schema.Types.ObjectId },
  relatedModel: { type: String, enum: ['Post', 'Job', 'Event', 'Project', 'Message'] }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
