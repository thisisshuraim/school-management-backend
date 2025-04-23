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
const teacherNames = ['Ananya', 'Kabir', 'Rhea', 'Aarav', 'Isha', 'Dev', 'Tanya', 'Rohan', 'Sneha', 'Arjun', 'Mira', 'Kunal', 'Neha', 'Ayaan', 'Meera', 'Vir', 'Diya', 'Nikhil', 'Sana', 'Yash'];
const studentNames = ['Ishaan', 'Myra', 'Reyansh', 'Aadhya', 'Vivaan', 'Kiara', 'Aarush', 'Saanvi', 'Aditya', 'Anika', 'Krishna', 'Zoya', 'Shaurya', 'Ritika', 'Laksh', 'Navya', 'Dhruv', 'Avni', 'Aryan', 'Prisha', 'Kabir', 'Ria', 'Om', 'Anaya', 'Veer', 'Tanvi', 'Arnav', 'Meher', 'Neil', 'Vanya', 'Rudra', 'Amaira', 'Atharv', 'Inaaya', 'Divyansh', 'Mahira', 'Parth', 'Mishti', 'Yuvaan', 'Kashvi', 'Hridaan', 'Vedika', 'Vihaan', 'Sharvani', 'Ayan', 'Jiya', 'Siddharth', 'Tara', 'Samarth', 'Charvi'];

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
  for (let i = 0; i < 20; i++) {
    const username = `teacher${i+1}`;
    const user = await User.create({ username, password: hashPassword('pass123'), role: 'teacher' });
    teacherUsers.push(user);
  }

  const teacherDocs = [];
  for (let i = 0; i < 20; i++) {
    const assignedSubjects = i % 5 === 0 ? [subjects[i % subjects.length]] : subjects.slice(0, 2 + (i % 3));
    const assignedClasses = i % 4 === 0 ? [classSections[i % classSections.length]] : classSections.slice(0, 2 + (i % 2));
    const classTeacher = i % 3 === 0;
    const name = teacherNames[i % teacherNames.length];

    const teacher = await Teacher.create({
      name,
      subjects: assignedSubjects,
      assignedClasses,
      isClassTeacher: classTeacher,
      user: teacherUsers[i]._id
    });
    teacherDocs.push(teacher);
  }

  const studentUsers = [];
  for (let i = 0; i < 50; i++) {
    const username = `student${i+1}`;
    const user = await User.create({ username, password: hashPassword('pass123'), role: 'student' });
    studentUsers.push(user);
  }

  const studentDocs = [];
  for (let i = 0; i < 50; i++) {
    const name = studentNames[i % studentNames.length];
    const classSection = classSections[i % classSections.length];
    const student = await Student.create({
      name,
      classSection,
      user: studentUsers[i]._id
    });
    studentDocs.push(student);
  }

  for (let classSection of classSections) {
    for (let subject of subjects.slice(0, 4)) {
      for (let j = 1; j <= 5; j++) {
        const futureDate = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000);
        await Assignment.create({
          classSection,
          title: `${subject} Assignment ${j}`,
          subject,
          deadline: futureDate,
          fileUrl: pdfPlaceholder,
          teacher: teacherDocs[j % teacherDocs.length].user
        });

        await Lecture.create({
          classSection,
          title: `${subject} Lecture ${j}`,
          subject,
          videoUrl: videoPlaceholder,
          teacher: teacherDocs[j % teacherDocs.length].user
        });
      }
    }
  }

  for (let student of studentDocs) {
    await Marksheet.create({
      title: `Marksheet for ${student.name}`,
      fileUrl: imagePlaceholder,
      user: student.user
    });
  }

  for (let classSection of classSections) {
    await Timetable.create({
      classSection,
      fileUrl: imagePlaceholder,
      teacher: teacherDocs[0].user
    });
  }

  console.log('Seeding complete');
  process.exit();
}

seedData().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});
