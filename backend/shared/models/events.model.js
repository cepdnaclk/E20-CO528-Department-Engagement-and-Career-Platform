const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  endDate: { type: Date },
  location: { type: String, default: '' },
  type: { type: String, enum: ['workshop', 'seminar', 'hackathon', 'meetup', 'other'], default: 'other' },
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rsvps: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  maxAttendees: { type: Number, default: 0 },
  image: { type: String, default: '' },
  isAnnouncement: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
