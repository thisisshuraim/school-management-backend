const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(express.json());

// Static uploads
app.use('/uploads', express.static('uploads'));

mongoose.connect(process.env.MONGO_URI).then(() =>
  console.log('MongoDB connected')
);

app.use('/api/auth', require('./routes/auth'));
app.use('/api/students', require('./routes/students'));
app.use('/api/teachers', require('./routes/teachers'));
app.use('/api/assignments', require('./routes/assignments'));
app.use('/api/marksheets', require('./routes/marksheets'));
app.use('/api/timetable', require('./routes/timetable'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
