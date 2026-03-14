const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['student', 'alumni', 'admin'], default: 'student' },
  bio: { type: String, default: '' },
  skills: [{ type: String }],
  profilePhoto: { type: String, default: '' },
  department: { type: String, default: 'Computer Engineering' },
  university: { type: String, default: 'University of Peradeniya' },
  registrationNumber: { type: String, default: '' },
  graduationYear: { type: String, default: '' },
  workHistory: [{
    company: String,
    position: String,
    startDate: String,
    endDate: String,
    current: { type: Boolean, default: false }
  }],
  education: [{
    institution: String,
    degree: String,
    field: String,
    startYear: String,
    endYear: String
  }],
  connections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  refreshToken: { type: String }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshToken;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
