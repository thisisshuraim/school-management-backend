// mongo_seed_script.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Student = require('./models/Student');
const Teacher = require('./models/Teacher');
const Assignment = require('./models/Assignment');
const Lecture = require('./models/Lecture');
const Marksheet = require('./models/Marksheet');
const Timetable = require('./models/Timetable');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/school-management';

const videoUrl = 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
const imageUrl = 'https://picsum.photos/200/300';
const pdfUrl = 'https://s2.q4cdn.com/175719177/files/doc_presentations/Placeholder-PDF.pdf';

const seedData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    await Promise.all([
      User.deleteMany(), Student.deleteMany(), Teacher.deleteMany(),
      Assignment.deleteMany(), Lecture.deleteMany(), Marksheet.deleteMany(), Timetable.deleteMany()
    ]);

    const roles = ['admin', 'teacher', 'student'];
    const subjects = ['Math', 'Science', 'English', 'History'];
    const classSections = ['5A', '5B', '5C'];

    // Create Admin User
    const admin = await User.create({
      username: 'admin',
      password: bcrypt.hashSync('admin123', 10),
      role: 'admin'
    });

    // Create Teachers
    const teachers = await Promise.all(Array.from({ length: 10 }).map((_, i) => {
      const username = `teacher${i + 1}`;
      const user = new User({ username, password: bcrypt.hashSync('pass123', 10), role: 'teacher' });
      return user.save();
    }));

    const teacherDocs = await Promise.all(teachers.map((user, i) => {
      const assigned = [classSections[i % 3]];
      const teachSubjects = [subjects[i % subjects.length]];
      return Teacher.create({ name: `Teacher ${i + 1}`, user: user._id, assignedClasses: assigned, subjects: teachSubjects });
    }));

    // Create Students
    const students = await Promise.all(Array.from({ length: 20 }).map((_, i) => {
      const username = `student${i + 1}`;
      const user = new User({ username, password: bcrypt.hashSync('pass123', 10), role: 'student' });
      return user.save();
    }));

    const studentDocs = await Promise.all(students.map((user, i) => {
      const section = classSections[i % classSections.length];
      return Student.create({ name: `Student ${i + 1}`, classSection: section, user: user._id });
    }));

    // Create Assignments
    for (let i = 0; i < 10; i++) {
      await Assignment.create({
        title: `Assignment ${i + 1}`,
        classSection: classSections[i % classSections.length],
        subject: subjects[i % subjects.length],
        deadline: new Date(Date.now() + 7 * 86400000),
        fileUrl: pdfUrl,
        teacher: teacherDocs[i % teacherDocs.length].user
      });
    }

    // Create Lectures
    for (let i = 0; i < 10; i++) {
      await Lecture.create({
        title: `Lecture ${i + 1}`,
        classSection: classSections[i % classSections.length],
        subject: subjects[i % subjects.length],
        videoUrl: videoUrl,
        teacher: teacherDocs[i % teacherDocs.length].user
      });
    }

    // Create Marksheets
    for (let i = 0; i < 5; i++) {
      await Marksheet.create({
        student: studentDocs[i]._id,
        fileUrl: imageUrl
      });
    }

    // Create Timetables
    for (let i = 0; i < classSections.length; i++) {
      await Timetable.create({
        classSection: classSections[i],
        fileUrl: imageUrl
      });
    }

    console.log('Seed data inserted successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seedData();