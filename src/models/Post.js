import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
    title: { type: String, required: true },
    createdAt: { type: Date, required: true },
    description: { type: String, required: true },
    htmlContent: { type: String, required: true },
    tags: [{
        id: String,
        name: String,
    }],
    thumbnail: { type: String, default: "" },
    comments: [{ type: mongoose.Types.ObjectId, ref: "Comment" }],
    author: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "User"
    },
    folder: {
        type: mongoose.Types.ObjectId,
        required: true
    }
});

postSchema.static("makeTags", function (tags) {
    return tags.trim().split(/ +/);
});

const Post = mongoose.model("Post", postSchema);
export default Post;