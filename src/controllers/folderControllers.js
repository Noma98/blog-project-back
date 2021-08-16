import Folder from '../models/Folder.js'

export const createFolder = async (req, res) => {
    const user = req.user;
    const name = `Sample Folder ${user.folders.length + 1}`;
    try {
        const folder = new Folder({
            name,
            owner: user._id
        });
        await folder.save();
        user.folders.push(folder._id);
        await user.save();
        res.status(200).json({ success: true });
    } catch (err) {
        console.log(err);
        res.json({ success: false });
    }
}
export const updateFolderName = async (req, res) => {
    try {
        const { folderId, newName } = req.body;
        await Folder.findByIdAndUpdate(folderId, {
            name: newName
        });
        return res.status(200).json({
            success: true
        })
    } catch (err) {
        console.log(err);
        return res.json({ success: false });
    }
}
export const deleteFolder = async (req, res) => {
    try {
        const user = req.user;
        const { folderId } = req.body;
        await Folder.findByIdAndRemove(folderId);
        const updated = user.folders.filter(folder => String(folder._id) !== String(folderId));
        user.folders = updated;
        await user.save();
        return res.send({ success: true });
    } catch (err) {
        console.log(err);
        return res.send({ success: false });
    }
}