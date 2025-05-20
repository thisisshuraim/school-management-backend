# School Management Backend

This is the backend server for the School Management System.

## Features
- Authentication (Admin, Teacher, Student)
- Upload and manage assignments, lectures, marksheets, timetables
- Class and subject-based access control
- AWS S3 for file storage
- MongoDB for database

## Tech Stack
- Node.js + Express
- MongoDB
- AWS S3
- JWT for authentication

## Local Development

### Requirements
- Node.js
- MongoDB Atlas or Local MongoDB

### Installation
```bash
git clone https://github.com/thisisshuraim/school-management-backend.git
cd school-management-backend
npm install
```

### Run
Create a `.env` file in the root:
```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/school-management
JWT_SECRET=your_jwt_secret
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
BUCKET=your_bucket
```

Run the server:
```bash
npm start
```

## Deployment on EC2 (Full Setup Script)

```bash
#!/bin/bash
set -e

# Update packages
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install MongoDB 6.0
wget -qO - https://pgp.mongodb.com/server-6.0.asc | sudo gpg --dearmor -o /usr/share/keyrings/mongodb-server-6.0.gpg
echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-6.0.gpg ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

sudo apt update
sudo apt install -y mongodb-org

# Start MongoDB
sudo systemctl enable mongod
sudo systemctl start mongod

# Clone and setup backend
cd ~
git clone https://github.com/thisisshuraim/school-management-backend.git
cd school-management-backend
npm install

# Create .env
cat <<EOF > .env
PORT=5000
MONGO_URI=mongodb://localhost:27017/school-management
JWT_SECRET=supersecretkey
AWS_ACCESS_KEY_ID=YOUR_AWS_KEY
AWS_SECRET_ACCESS_KEY=YOUR_SECRET_KEY
EOF

# Start backend using PM2
pm2 start index.js --name school-backend
pm2 save
```

## License
MIT
