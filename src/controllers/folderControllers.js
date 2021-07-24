import Folder from '../models/Folder.js'

export const getCreate = async (req, res) => {
    const user = req.user;
    const name = `Sample Folder_${user.folders.length}`;
    try {
        await Folder.create({
            name,
            owner: user._id
        });
        const newFolder = await Folder.findOne({ owner: user._id, name });
        user.folders.push(newFolder._id);
        await user.save();
        res.status(200).json({ success: true });
    } catch (err) {
        console.log(err);
        res.json({ success: false });
    }
}
