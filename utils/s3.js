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

const sanitizeFilename = (filename) => {
  if (typeof filename !== 'string' || filename.length === 0) {
    return '';
  }

  const decodedFilename = decodeURIComponent(filename);

  const lastDotIndex = decodedFilename.lastIndexOf('.');
  let name = decodedFilename;
  let extension = '';
  if (lastDotIndex > -1) {
    name = decodedFilename.substring(0, lastDotIndex);
    extension = decodedFilename.substring(lastDotIndex);
  }
  const sanitizedName = name
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces and whitespace with hyphens
    .replace(/[^a-z0-9-]/g, '') // Remove all non-alphanumeric characters except hyphens
    .replace(/--+/g, '-') // Replace multiple hyphens with a single one
    .replace(/^-|-$/g, ''); // Remove leading or trailing hyphens

  const sanitizedExtension = extension.toLowerCase().replace(/[^a-z0-9.]/g, '');

  return `${sanitizedName}${sanitizedExtension}`;
}

const uploadObject = (dir) => multer({
  storage: multerS3({
    s3,
    bucket: process.env.BUCKET,
    key: (_, file, cb) => {
      const sanitizedFilename = sanitizeFilename(file.originalname);
      const filename = `${dir}/${uuidv4()}-${sanitizedFilename}`;
      cb(null, filename);
    }
  })
});

const deleteObject = async (key) => {
  await s3.deleteObject({
    Bucket: process.env.BUCKET,
    Key: key
  }).promise();
}

module.exports = { uploadObject, deleteObject };
