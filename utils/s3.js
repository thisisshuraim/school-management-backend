const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const { v4: uuidv4 } = require('uuid');

AWS.config.update({
  region: 'ap-south-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const s3 = new AWS.S3();
const bucket = "school-management-thisisshuraim";

const uploadObject = (dir) => multer({
  storage: multerS3({
    s3,
    bucket: process.env.BUCKET,
    key: (_, file, cb) => {
      const filename = `${dir}/${uuidv4()}-${file.originalname}`;
      cb(null, filename);
    }
  })
});

const deleteObject = async (key) => {
  await s3.deleteObject({
    Bucket: bucket,
    Key: key
  }).promise();
}

module.exports = { uploadObject, deleteObject };
