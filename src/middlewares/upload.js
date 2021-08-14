import multer from 'multer';
import multerS3 from 'multer-s3';
import aws from 'aws-sdk';

const s3 = new aws.S3({
    credentials: {
        accessKeyId: process.env.AWS_ID,
        secretAccessKey: process.env.AWS_SECRET,
    }
});
const s3ImageUploader = multerS3({
    s3: s3,
    bucket: 'nomalogbucket/images',
    acl: 'public-read',
})

//storage가 없으면 dest 경로에 저장됨
export const imgUploader = multer({
    dest: "uploads/avatars/",
    limits: {
        fileSize: 200000,
    },
    storage: process.env.NODE_ENV === "production" ? s3ImageUploader : undefined
})