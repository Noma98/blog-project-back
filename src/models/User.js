import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
    email: { type: String, unique: true, required: true },
    pwd: { type: String, required: true },
    name: { type: String, required: true },
    avatar: { type: String, default: "" },
    blogInfo: {
        blogName: { type: String, default: "블로그 이름을 설정하세요.", maxLength: 15 },
    }
});
userSchema.pre("save", async function (next) {
    if (!this.isModified("pwd")) {
        next();
    }
    this.pwd = await bcrypt.hash(this.pwd, 10);
    next();
})

const User = mongoose.model("User", userSchema);
export default User;