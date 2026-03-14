require('dotenv').config({ path: __dirname + '/.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./shared/models/auth.model');
const Post = require('./shared/models/feed.model');
const Job = require('./shared/models/jobs.model');
const Event = require('./shared/models/events.model');
const Project = require('./shared/models/research.model');
const Notification = require('./shared/models/notifications.model');

const connectDB = require('./shared/config/db');

const seedData = async () => {
  try {
    await connectDB();
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Post.deleteMany({});
    await Job.deleteMany({});
    await Event.deleteMany({});
    await Project.deleteMany({});
    await Notification.deleteMany({});

    console.log('👤 Creating users...');
    const admin = await User.create({
      name: 'Dr. Kamal Perera',
      email: 'admin@eng.pdn.ac.lk',
      password: 'admin123',
      role: 'admin',
      bio: 'Senior Lecturer, Department of Computer Engineering',
      skills: ['Software Architecture', 'Cloud Computing', 'Machine Learning'],
      department: 'Computer Engineering',
      university: 'University of Peradeniya',
      education: [{ institution: 'University of Peradeniya', degree: 'PhD', field: 'Computer Science', startYear: '2010', endYear: '2015' }]
    });

    const alumni1 = await User.create({
      name: 'Nimal Fernando',
      email: 'alumni@eng.pdn.ac.lk',
      password: 'alumni123',
      role: 'alumni',
      bio: 'Software Engineer at Google | UoP CE Batch 2018',
      skills: ['React', 'Node.js', 'AWS', 'System Design'],
      registrationNumber: 'E/18/100',
      graduationYear: '2022',
      department: 'Computer Engineering',
      workHistory: [{ company: 'Google', position: 'Software Engineer', startDate: '2023-01', current: true }],
      education: [{ institution: 'University of Peradeniya', degree: 'BSc Engineering', field: 'Computer Engineering', startYear: '2018', endYear: '2022' }]
    });

    const alumni2 = await User.create({
      name: 'Sachini Dias',
      email: 'sachini@eng.pdn.ac.lk',
      password: 'alumni123',
      role: 'alumni',
      bio: 'DevOps Lead at WSO2 | UoP CE Batch 2019',
      skills: ['Kubernetes', 'Docker', 'CI/CD', 'Terraform'],
      registrationNumber: 'E/19/050',
      graduationYear: '2023',
      workHistory: [{ company: 'WSO2', position: 'DevOps Lead', startDate: '2023-06', current: true }]
    });

    const student1 = await User.create({
      name: 'Chamuditha Jananga',
      email: 'e20158@eng.pdn.ac.lk',
      password: 'student123',
      role: 'student',
      bio: 'Final year undergraduate passionate about full-stack development and cloud architecture',
      skills: ['JavaScript', 'React', 'Python', 'MongoDB', 'Docker'],
      registrationNumber: 'E/20/158',
      department: 'Computer Engineering',
      education: [{ institution: 'University of Peradeniya', degree: 'BSc Engineering', field: 'Computer Engineering', startYear: '2020', endYear: '2025' }]
    });

    const student2 = await User.create({
      name: 'Tharindu Mapagedara',
      email: 'e20248@eng.pdn.ac.lk',
      password: 'student123',
      role: 'student',
      bio: 'Interested in machine learning and software architecture',
      skills: ['Python', 'TensorFlow', 'Java', 'Express.js'],
      registrationNumber: 'E/20/248'
    });

    const student3 = await User.create({
      name: 'Janith Yogesh',
      email: 'e20453@eng.pdn.ac.lk',
      password: 'student123',
      role: 'student',
      bio: 'Full-stack developer exploring cloud-native architectures',
      skills: ['React Native', 'Flutter', 'Firebase', 'Node.js'],
      registrationNumber: 'E/20/453'
    });

    const student4 = await User.create({
      name: 'Tharushika Prasadinie',
      email: 'e20300@eng.pdn.ac.lk',
      password: 'student123',
      role: 'student',
      bio: 'Security enthusiast with a focus on web application security',
      skills: ['Cybersecurity', 'Penetration Testing', 'OAuth', 'JWT'],
      registrationNumber: 'E/20/300'
    });

    console.log('📝 Creating feed posts...');
    const posts = await Post.insertMany([
      {
        author: student1._id,
        content: '🎉 Excited to start our CO528 project — Department Engagement & Career Platform! Building with React, Node.js, and MongoDB. The architecture uses SOA principles with modular microservices. #CO528 #SoftwareArchitecture',
        likes: [student2._id, student3._id, alumni1._id],
        comments: [
          { author: student2._id, content: 'This is going to be amazing! Let\'s make it the best project. 🚀' },
          { author: alumni1._id, content: 'Great tech stack choice! I can share some tips on architecture design.' }
        ]
      },
      {
        author: alumni1._id,
        content: '💡 Pro tip for engineering students: Start contributing to open-source projects early. It significantly strengthens your CV and helps you understand real-world codebases. Here are my top recommendations for getting started...',
        likes: [student1._id, student2._id, student3._id, student4._id],
        comments: [
          { author: student3._id, content: 'Thanks for the advice! Any specific repos you recommend?' }
        ]
      },
      {
        author: admin._id,
        content: '📢 Department Announcement: The annual Inter-University Hackathon will be held on April 15-16, 2025. All interested students should register through the events section. Prizes worth Rs. 500,000!',
        likes: [student1._id, student2._id, alumni1._id, alumni2._id]
      },
      {
        author: student3._id,
        content: '🔬 Just completed my research paper on "Scalable Microservices Architecture for Educational Platforms". Looking for collaborators who are interested in distributed systems and cloud computing. Check out the Research section!',
        likes: [admin._id, student1._id],
        comments: [
          { author: admin._id, content: 'Excellent work, Janith! I\'d love to be your faculty advisor on this.' }
        ]
      },
      {
        author: alumni2._id,
        content: '🐳 DevOps tip: Always use multi-stage Docker builds for your production containers. It can reduce your image size by 80%+. Here\'s a quick example with a Node.js app...',
        likes: [student1._id, student4._id, alumni1._id]
      }
    ]);

    console.log('💼 Creating job listings...');
    await Job.insertMany([
      {
        title: 'Software Engineer Intern',
        company: 'Google',
        description: 'Join Google\'s engineering team for a 12-week summer internship. You\'ll work on real products used by billions of people worldwide. Strong background in data structures and algorithms required.',
        requirements: ['Strong DSA skills', 'Proficiency in C++ or Java', 'GPA above 3.5', 'Currently enrolled in CS/CE program'],
        location: 'Mountain View, CA (Remote option available)',
        type: 'internship',
        salary: '$8,000/month',
        deadline: new Date('2025-06-01'),
        postedBy: alumni1._id,
        applications: [{ applicant: student1._id, status: 'pending', coverLetter: 'I am passionate about building scalable systems...' }]
      },
      {
        title: 'Full Stack Developer',
        company: 'WSO2',
        description: 'Looking for a full-stack developer to join our integration team. You\'ll work on our next-gen API management platform using React and Java microservices.',
        requirements: ['React.js', 'Java/Spring Boot', 'REST APIs', 'Git'],
        location: 'Colombo, Sri Lanka',
        type: 'job',
        salary: 'LKR 150,000 - 250,000/month',
        deadline: new Date('2025-05-15'),
        postedBy: alumni2._id
      },
      {
        title: 'DevOps Engineer Intern',
        company: 'IFS',
        description: 'IFS is hiring DevOps interns to help automate our CI/CD pipeline and manage our Kubernetes clusters on AWS. Great opportunity to learn enterprise-scale infrastructure.',
        requirements: ['Docker', 'Kubernetes basics', 'Linux', 'CI/CD concepts'],
        location: 'Colombo, Sri Lanka',
        type: 'internship',
        salary: 'LKR 60,000/month',
        deadline: new Date('2025-07-01'),
        postedBy: alumni2._id
      },
      {
        title: 'Research Assistant — ML Lab',
        company: 'University of Peradeniya',
        description: 'The ML research lab is looking for undergraduate research assistants to work on NLP projects. Flexible hours, ideal for final-year students looking for FYP projects.',
        requirements: ['Python', 'PyTorch or TensorFlow', 'NLP basics', 'Statistics'],
        location: 'University of Peradeniya',
        type: 'internship',
        postedBy: admin._id
      }
    ]);

    console.log('📅 Creating events...');
    await Event.insertMany([
      {
        title: 'CO528 Project Demo Day',
        description: 'Final project demonstrations for CO528 Applied Software Architecture. Each group has 3 minutes to present their project. Attendance is mandatory.',
        date: new Date('2025-04-10T09:00:00'),
        endDate: new Date('2025-04-10T17:00:00'),
        location: 'S1 Lecture Hall, Engineering Faculty',
        type: 'seminar',
        organizer: admin._id,
        rsvps: [student1._id, student2._id, student3._id, student4._id]
      },
      {
        title: 'Inter-University Hackathon 2025',
        description: 'Annual 24-hour hackathon bringing together top engineering talent. Build innovative solutions to real-world problems. Teams of 3-5 members.',
        date: new Date('2025-04-15T08:00:00'),
        endDate: new Date('2025-04-16T08:00:00'),
        location: 'Engineering Auditorium',
        type: 'hackathon',
        organizer: admin._id,
        maxAttendees: 100,
        rsvps: [student1._id, student3._id]
      },
      {
        title: 'AWS Cloud Workshop',
        description: 'Hands-on workshop on deploying applications to AWS. Covers EC2, S3, RDS, and Lambda. Bring your laptop with AWS CLI installed.',
        date: new Date('2025-03-28T14:00:00'),
        endDate: new Date('2025-03-28T17:00:00'),
        location: 'Computer Lab 3',
        type: 'workshop',
        organizer: alumni2._id,
        rsvps: [student1._id, student2._id, student4._id]
      },
      {
        title: 'Alumni Talk: Career in Tech',
        description: 'Join our alumni panel discussion about careers in the tech industry. Learn about interview preparation, company cultures, and career growth strategies.',
        date: new Date('2025-04-05T15:00:00'),
        location: 'Virtual (Zoom)',
        type: 'meetup',
        organizer: alumni1._id,
        rsvps: [student1._id, student2._id, student3._id, student4._id]
      }
    ]);

    console.log('🔬 Creating research projects...');
    await Project.insertMany([
      {
        title: 'Scalable Microservices for Educational Platforms',
        description: 'Research project investigating optimal microservices architectures for university-scale educational platforms. Aims to develop a reference architecture that balances performance, maintainability, and cost.',
        requiredSkills: ['Microservices', 'Docker', 'Kubernetes', 'Node.js'],
        owner: student3._id,
        collaborators: [student1._id, student2._id],
        status: 'active',
        activity: [
          { user: student3._id, action: 'Created the project' },
          { user: student1._id, action: 'Joined as collaborator' },
          { user: student3._id, action: 'Uploaded initial architecture draft' }
        ]
      },
      {
        title: 'NLP-based Code Review Assistant',
        description: 'Building an AI-powered code review tool using NLP techniques. The tool analyzes pull requests and provides suggestions for code quality, security vulnerabilities, and best practices.',
        requiredSkills: ['Python', 'NLP', 'Machine Learning', 'Git'],
        owner: student2._id,
        collaborators: [student4._id],
        status: 'active',
        activity: [
          { user: student2._id, action: 'Created the project' },
          { user: student4._id, action: 'Joined as collaborator — focusing on security analysis' }
        ]
      },
      {
        title: 'IoT-based Smart Campus Monitoring',
        description: 'Developing an IoT system for monitoring environmental conditions (temperature, humidity, air quality) across the university campus. Uses ESP32 sensors and cloud-based data analytics.',
        requiredSkills: ['IoT', 'ESP32', 'MQTT', 'React', 'AWS IoT'],
        owner: student1._id,
        status: 'active',
        activity: [
          { user: student1._id, action: 'Created the project' },
          { user: student1._id, action: 'Published project proposal document' }
        ]
      }
    ]);

    console.log('🔔 Creating notifications...');
    await Notification.insertMany([
      { user: student1._id, type: 'like', message: 'Tharindu Mapagedara liked your post', relatedModel: 'Post', read: false },
      { user: student1._id, type: 'comment', message: 'Nimal Fernando commented on your post', relatedModel: 'Post', read: false },
      { user: student1._id, type: 'invitation', message: 'Janith Yogesh invited you to "Scalable Microservices" project', relatedModel: 'Project', read: true },
      { user: alumni1._id, type: 'application', message: 'Chamuditha Jananga applied for Software Engineer Intern', relatedModel: 'Job', read: false },
      { user: student2._id, type: 'system', message: 'Welcome to DECP! Complete your profile to get started.', read: true }
    ]);

    console.log('\n✅ Seed data inserted successfully!');
    console.log('\n📧 Test Accounts:');
    console.log('   Admin:   admin@eng.pdn.ac.lk / admin123');
    console.log('   Alumni:  alumni@eng.pdn.ac.lk / alumni123');
    console.log('   Student: e20158@eng.pdn.ac.lk / student123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
};

seedData();
