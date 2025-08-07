const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Student = require('./models/Student');
const Teacher = require('./models/Teacher');
const Assignment = require('./models/Assignment');
const Lecture = require('./models/Lecture');
const Marksheet = require('./models/Marksheet');
const Timetable = require('./models/Timetable');
const Announcement = require('./models/Announcement');
const Calendar = require('./models/Calendar');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/school-management';

async function cleanData() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to DB');

  await User.deleteMany();
  await Student.deleteMany();
  await Teacher.deleteMany();
  await Assignment.deleteMany();
  await Lecture.deleteMany();
  await Marksheet.deleteMany();
  await Timetable.deleteMany();
  await Announcement.deleteMany();
  await Calendar.deleteMany();

  console.log('Cleaning complete');
  process.exit();
}

cleanData().catch(err => {
  console.error('Cleaning error:', err);
  process.exit(1);
});
