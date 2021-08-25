import Comment from '../models/Comment';
import Post from '../models/Post';

export const createComment = async (req, res) => {
    try {
        const { text, postId } = req.body;
        const comment = new Comment({
            text,
            author: req.user._id,
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
export const deleteComment = async (req, res) => {
    try {
        const { commentId, postId } = req.body;
        const post = await Post.findById(postId);
        const updated = post.comments.filter(post => String(post) !== String(commentId));
        post.comments = updated;
        await post.save();
        await Comment.findByIdAndRemove(commentId);
        return res.status(200).json({ success: true });
    } catch (err) {
        console.log(err);
        return res.json({ success: false });
    }
}