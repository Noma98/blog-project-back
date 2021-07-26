import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
    title: { type: String, required: true },
    createdAt: { type: Date, required: true },
    description: { type: String, required: true },
    tags: [String],
    author: {
        type: mongoose.Types.ObjectId,
        required: true,
    },
    folder: {
        type: mongoose.Types.ObjectId,
        required: true
    }
});

postSchema.static("makeTags", function (tags) {
    return tags.split(/ +/);
});

const Post = mongoose.model("Post", postSchema);
export default Post;