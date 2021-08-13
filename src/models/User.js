import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema({
    socialOnly: { type: Boolean, default: true, required: true },
    email: { type: String, unique: true, required: true },
    pwd: { type: String, minLength: 6 },
    name: { type: String, required: true },
    avatar: { type: String, default: "" },
    blogInfo: {
        name: { type: String },
        introduction: { type: String, default: "🧚‍♀️ : 안녕하세요, 관리자 noma입니다. 나만의 공간을 잘 표현할 수 있는 문구로 소개글을 수정해보세요!" }
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
        process.env.TOKEN_SECRET,
        {
            expiresIn: "7d"
        }
    );
})
userSchema.static("findByToken", async function (token) {
    try {
        if (!token || token === "none") {
            return null;
        }
        const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
        const user = await this.findOne({ _id: decoded._id, token }).populate("folders");
        return user;
    } catch (err) {
        console.log(err);
        return null;
    }
})
const User = mongoose.model("User", userSchema);
export default User;