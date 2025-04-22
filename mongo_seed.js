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
const subjects = ['Math', 'Science', 'English', 'History', 'Geography', 'Physics', 'Chemistry', 'Biology'];
const classSections = ['5A', '5B', '5C', '6A', '6B'];

const pdfPlaceholder = 'https://s2.q4cdn.com/175719177/files/doc_presentations/Placeholder-PDF.pdf';
const imagePlaceholder = 'https://picsum.photos/200/300';
const videoPlaceholder = 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

const hashPassword = (plain) => bcrypt.hashSync(plain, 10);

async function seedData() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to DB');

  await User.deleteMany();
  await Student.deleteMany();
  await Teacher.deleteMany();
  await Assignment.deleteMany();
  await Lecture.deleteMany();
  await Marksheet.deleteMany();
  await Timetable.deleteMany();

  const admin = await User.create({ username: 'admin', password: hashPassword('admin123'), role: 'admin' });

  const teacherUsers = [];
  for (let i = 1; i <= 10; i++) {
    const user = await User.create({ username: `teacher${i}`, password: hashPassword('pass123'), role: 'teacher' });
    teacherUsers.push(user);
  }

  const teacherDocs = [];
  for (let i = 0; i < 10; i++) {
    const assignedSubjects = [subjects[i % subjects.length]];
    const assignedClasses = [classSections[i % classSections.length]];
    const teacher = await Teacher.create({
      name: `Teacher ${i + 1}`,
      subjects: assignedSubjects,
      assignedClasses,
      user: teacherUsers[i]._id
    });
    teacherDocs.push(teacher);
  }

  const studentUsers = [];
  for (let i = 1; i <= 20; i++) {
    const user = await User.create({ username: `student${i}`, password: hashPassword('pass123'), role: 'student' });
    studentUsers.push(user);
  }

  const studentDocs = [];
  for (let i = 0; i < 20; i++) {
    const classSection = classSections[i % classSections.length];
    const student = await Student.create({
      name: `Student ${i + 1}`,
      classSection,
      user: studentUsers[i]._id
    });
    studentDocs.push(student);
  }

  for (let i = 0; i < 20; i++) {
    const classSection = classSections[i % classSections.length];
    const subject = subjects[i % subjects.length];
    await Assignment.create({
      classSection,
      title: `Assignment ${i + 1}`,
      subject,
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      fileUrl: pdfPlaceholder,
      teacher: teacherDocs[i % teacherDocs.length].user
    });
  }

  for (let i = 0; i < 20; i++) {
    const classSection = classSections[i % classSections.length];
    const subject = subjects[i % subjects.length];
    await Lecture.create({
      classSection,
      title: `Lecture ${i + 1}`,
      subject,
      videoUrl: videoPlaceholder,
      teacher: teacherDocs[i % teacherDocs.length].user
    });
  }

  for (let i = 0; i < 20; i++) {
    await Marksheet.create({
      title: `Marksheet ${i + 1}`,
      fileUrl: imagePlaceholder,
      user: studentDocs[i % studentDocs.length].user
    });
  }

  for (let i = 0; i < classSections.length; i++) {
    await Timetable.create({
      classSection: classSections[i],
      fileUrl: imagePlaceholder,
      teacher: teacherDocs[i % teacherDocs.length].user
    });
  }

  console.log('Seeding complete');
  process.exit();
}

seedData().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});
