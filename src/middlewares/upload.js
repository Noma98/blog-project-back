import multer from 'multer';

export const imgUpload = multer({
    dest: "uploads/avatars/",
    limits: {
        fileSize: 200000,
    },
})