import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from '../config/config.js';

const userSchema = new mongoose.Schema({
    email: { type: String, unique: true, required: true },
    pwd: { type: String, required: true, minLength: 6 },
    name: { type: String, required: true },
    avatar: { type: String, default: "" },
    blogInfo: {
        blogName: { type: String, default: "블로그 이름을 설정하세요.", maxLength: 15 },
    },
    token: { type: String, default: "" }
});
userSchema.pre("save", async function (next) {
    if (!this.isModified("pwd")) {
        next();
    }
    this.pwd = await bcrypt.hash(this.pwd, 10);
    next();
})
userSchema.static("verifyPwd", async function (plain, hash) {
    return await bcrypt.compare(plain, hash);
})
userSchema.static("generateToken", function (user) {
    return jwt.sign(
        {
            _id: user._id,
            name: user.name,
        },
        config.tokenSecret,
        {
            expiresIn: "1h"
        }
    );
})

const User = mongoose.model("User", userSchema);
export default User;