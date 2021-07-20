import mongoose from 'mongoose';
const userSchema = new mongoose.Schema({
    email: { type: String, unique: true, required: true },
    pwd: { type: String, required: true },
    name: { type: String, required: true },
    avatar: { type: String, default: "" },
    blogInfo: {
        blogName: { type: String, default: "블로그 이름을 설정하세요.", maxLength: 15 },
    }
});
const User = mongoose.model("User", userSchema);
export default User;