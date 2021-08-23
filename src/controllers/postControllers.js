import Comment from '../models/Comment.js';
import Folder from '../models/Folder.js';
import Post from '../models/Post.js'

export const createPost = async (req, res) => {
    try {
        const file = req.file; //없으면 undefined
        let thumbnail = "";
        if (file) {
            thumbnail = process.env.NODE_ENV === "production" ? file.location : `http://localhost:4000/${file.path}`;
        }
        const user = req.user;
        const { title, description, tagArray, selectedFolder: folderId, htmlContent } = JSON.parse(req.body.data);

        const createdAt = Date.now();
        const newPost = new Post({
            title: title || "제목 없음",
            description,
            htmlContent,
            author: user._id,
            folder: folderId,
            createdAt,
            tags: tagArray,
            thumbnail
        })
        await newPost.save();
        const folder = await Folder.findById(folderId);
        folder.posts.push(newPost._id);
        await folder.save();
        return res.json({ success: true });
    } catch (err) {
        console.log(err);
        return res.json({ success: false });
    }
}

export const deletePost = async (req, res) => {
    try {
        const { postId, folderId } = req.body;
        await Post.findByIdAndRemove(postId);
        const folder = await Folder.findById(folderId);
        const updated = folder.posts.filter(post => String(post) !== String(postId));
        folder.posts = updated;
        await folder.save();
        await Comment.deleteMany({ post: postId });
        return res.status(200).json({ success: true });
    } catch (err) {
        console.log(err);
        return res.json({ success: false });
    }
}

export const updatePost = async (req, res) => {
    try {
        const { postId, title, description, htmlContent, selectedFolder, tagArray, prevFolderId, update } = JSON.parse(req.body.data);

        const file = req.file; //없으면 undefined
        let thumbnail = "";
        if (file) {
            thumbnail = process.env.NODE_ENV === "production" ? file.location : `http://localhost:4000/${file.path}`;
        }
        await Post.findByIdAndUpdate(postId, {
            title,
            description,
            htmlContent,
            folder: selectedFolder,
            tags: tagArray,
            ...(update && { thumbnail })
        });
        if (prevFolderId !== selectedFolder) {
            //이전 폴더에서 삭제
            const prevFolder = await Folder.findById(prevFolderId);
            prevFolder.posts = prevFolder.posts.filter(post => post !== postId);
            await prevFolder.save();
            //새로 선택된 폴더에 추가
            const newFolder = await Folder.findById(selectedFolder);
            newFolder.posts.push(postId);
            await newFolder.save();
        }
        return res.status(200).json({ success: true });
    } catch (err) {
        console.log(err);
        return res.json({ success: false });
    }
}

export const findPostsByFolderId = async (req, res) => {
    try {
        const { folderId } = req.body;
        const posts = await Post.find({ folder: folderId }).sort({ createdAt: -1 });
        return res.status(200).json({ success: true, payload: posts });
    } catch (err) {
        console.log(err);
        return res.json({ success: false });
    }
}

export const findPostByPostId = async (req, res) => {
    try {
        const { postId } = req.body;
        const post = await Post.findById(postId).populate("comments").populate("author");
        return res.status(200).json({ success: true, payload: post });
    } catch (err) {
        console.log(err);
        return res.json({ success: false });
    }
}

export const findPostsByUserId = async (req, res) => {
    try {
        const { userId } = req.body;
        const posts = await Post.find({ author: userId }).sort({ createdAt: -1 });
        return res.status(200).json({ success: true, payload: posts });
    } catch (err) {
        console.log(err);
        return res.json({ success: false });
    }
}

export const findPostsByQuery = async (req, res) => {
    try {
        const { query, userId } = req.body;
        const regex = new RegExp(query, "i");
        const result = await Post
            .find({
                author: userId
            })
            .or([
                { title: { $regex: regex } },
                { description: { $regex: regex } },
                { tags: { $elemMatch: { name: { $regex: regex } } } }
            ])
            .sort({ createdAt: -1 });
        return res.status(200).json({ success: true, payload: result });
    } catch (err) {
        console.log(err);
        return res.json({ success: false });
    }
}

export const findLatestPost = async (req, res) => {
    try {
        const { userId } = req.body;
        const post = await Post.find({ author: userId }).sort({ createdAt: -1 }).findOne();
        return res.status(200).json({ success: true, payload: post });
    } catch (err) {
        console.log(err);
        return res.json({ success: false });
    }
}
export const findAllPosts = async (req, res) => {
    try {
        const posts = await Post.find().populate("author").sort({ createdAt: -1 });
        return res.status(200).json({ success: true, payload: posts });
    } catch (err) {
        console.log(err);
        return res.json({ success: false });
    }
}
export const findAllResults = async (req, res) => {
    try {
        const { query } = req.body;
        const regex = new RegExp(query, "i");
        const posts = await Post.find().or([
            { title: { $regex: regex } },
            { description: { $regex: regex } },
            { tags: { $elemMatch: { name: { $regex: regex } } } }
        ]).sort({ createdAt: -1 }).populate("author");

        return res.status(200).json({ success: true, payload: posts });
    } catch (err) {
        console.log(err);
        return res.json({ success: false });
    }
}
export const convertImage = async (req, res) => {
    try {
        const file = req.file;
        const url = process.env.NODE_ENV === "production" ? file.location : `http://localhost:4000/${file.path}`;
        return res.status(200).json({ success: true, payload: { url } });
    } catch (err) {
        console.log(err);
        return res.json({ success: false });
    }
}