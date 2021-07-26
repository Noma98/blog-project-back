import Folder from '../models/Folder.js';
import Post from '../models/Post.js'

export const postCreate = async (req, res) => {
    try {
        const user = req.user;
        const { title, description, tags, selectedFolder: folderId } = req.body;
        const createdAt = new Date().toISOString();
        await Post.create({
            title: title || "제목 없음",
            description,
            author: user._id,
            folder: folderId,
            createdAt,
            tags: Post.makeTags(tags),
        });
        const newPost = await Post.findOne({ author: user._id, createdAt });
        const folder = await Folder.findById(folderId);
        folder.posts.push(newPost._id);
        await folder.save();
        return res.json({ success: true });
    } catch (err) {
        console.log(err);
        return res.json({ success: false });
    }
}
export const postRead = async (req, res) => {
    try {
        const { folderId } = req.body;
        const posts = await Post.find({ folder: folderId });
        return res.status(200).json({ success: true, payload: posts });
    } catch (err) {
        console.log(err);
        return res.json({ success: false });
    }

}
export const postDelete = async (req, res) => {
    try {
        const { postId, folderId } = req.body;
        await Post.findByIdAndRemove(postId);
        const folder = await Folder.findById(folderId);
        const updated = folder.posts.filter(post => post != postId);
        folder.posts = updated;
        await folder.save();
        return res.status(200).json({ success: true });
    } catch (err) {
        console.log(err);
        return res.json({ success: false });
    }
}