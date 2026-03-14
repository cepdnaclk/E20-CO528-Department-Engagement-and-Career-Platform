const Event = require('../shared/models/events.model');
const Notification = require('../shared/models/notifications.model');

exports.getEvents = async (req, res) => {
  try {
    const { type, upcoming } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (upcoming === 'true') filter.date = { $gte: new Date() };

    const events = await Event.find(filter)
      .populate('organizer', 'name email profilePhoto role')
      .populate('rsvps', 'name profilePhoto')
      .sort({ date: 1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch events', error: error.message });
  }
};

exports.createEvent = async (req, res) => {
  try {
    const event = new Event({ ...req.body, organizer: req.user._id });
    await event.save();
    await event.populate('organizer', 'name email profilePhoto role');
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create event', error: error.message });
  }
};

exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name email profilePhoto role')
      .populate('rsvps', 'name email profilePhoto');
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch event', error: error.message });
  }
};

exports.rsvpEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const userId = req.user._id;
    const rsvpIndex = event.rsvps.indexOf(userId);

    if (rsvpIndex > -1) {
      event.rsvps.splice(rsvpIndex, 1);
    } else {
      if (event.maxAttendees > 0 && event.rsvps.length >= event.maxAttendees) {
        return res.status(400).json({ message: 'Event is full' });
      }
      event.rsvps.push(userId);

      await Notification.create({
        user: event.organizer,
        type: 'rsvp',
        message: `${req.user.name} RSVP'd to ${event.title}`,
        relatedId: event._id,
        relatedModel: 'Event'
      });
    }

    await event.save();
    await event.populate('organizer', 'name email profilePhoto role');
    await event.populate('rsvps', 'name profilePhoto');
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Failed to RSVP', error: error.message });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete event', error: error.message });
  }
};
