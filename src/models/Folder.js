import mongoose from 'mongoose';

const folderSchema = new mongoose.Schema({
    name: { type: String, required: true },
    posts: [{ type: mongoose.Schema.Types.ObjectId }],
    owner: { type: mongoose.Schema.Types.ObjectId, required: true }
})
const Folder = mongoose.model("Folder", folderSchema);
export default Folder;