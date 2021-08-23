import Comment from '../models/Comment';
import Post from '../models/Post';

export const createComment = async (req, res) => {
    try {
        const { text, userId, postId } = req.body;
        const comment = new Comment({
            text,
            author: userId,
            createdAt: Date.now(),
            post: postId,
        });
        await comment.save();
        const post = await Post.findById(postId);
        post.comments.push(comment._id);
        await post.save();
        return res.status(201).json({ success: true });
    } catch (err) {
        console.log(err);
        return res.json({ success: false });
    }
}