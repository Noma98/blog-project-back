import Folder from '../models/Folder.js';
import Post from '../models/Post.js'

export const postNewPost = async (req, res) => {
    try {
        const user = req.user;
        const { title, description, tags, selectedFolder: folderId } = req.body;
        const createdAt = Date.now();
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