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
        blogName: { type: String, default: "blog name", maxLength: 15 },
    },
    folders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Folder" }],
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
            expiresIn: "7d"
        }
    );
})
userSchema.static("findByToken", async function (token) {
    try {
        const decoded = jwt.verify(token, config.tokenSecret);
        const user = await this.findOne({ _id: decoded._id, token }).populate("folders");
        return user;
    } catch {
        return null;
    }
})
const User = mongoose.model("User", userSchema);
export default User;