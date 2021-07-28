import Folder from '../models/Folder.js';
import Post from '../models/Post.js'

export const postCreate = async (req, res) => {
    try {
        const user = req.user;
        const { title, description, tagArray, selectedFolder: folderId } = req.body;
        const createdAt = Date.now();
        await Post.create({
            title: title || "제목 없음",
            description,
            author: user._id,
            folder: folderId,
            createdAt,
            tags: tagArray,
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
export const postsRead = async (req, res) => {
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
export const postDetail = async (req, res) => {
    try {
        const { postId } = req.body;
        const post = await Post.findById(postId);
        return res.status(200).json({ success: true, payload: post });
    } catch (err) {
        console.log(err);
        return res.json({ success: false });
    }
}
export const postUpdate = async (req, res) => {
    try {
        const { postId, title, description, selectedFolder, tagArray, prevFolderId } = req.body;

        await Post.findByIdAndUpdate(postId, {
            title,
            description,
            folder: selectedFolder,
            tags: tagArray
        });
        //이전 폴더에서 삭제
        const prevFolder = await Folder.findById(prevFolderId);
        prevFolder.posts = prevFolder.posts.filter(post => post !== postId);
        await prevFolder.save();
        //새로 선택된 폴더에 추가
        const newFolder = await Folder.findById(selectedFolder);
        newFolder.posts.push(postId);
        await newFolder.save();

        return res.status(200).json({ success: true });
    } catch (err) {
        console.log(err);
        return res.json({ success: false });
    }
}
export const postReadAll = async (req, res) => {
    try {
        const { userId } = req.body;
        const posts = await Post.find({ author: userId }).sort({ createdAt: -1 });
        return res.status(200).json({ success: true, payload: posts });
    } catch (err) {
        console.log(err);
        return res.json({ success: false });
    }
}