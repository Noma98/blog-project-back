import mongoose from 'mongoose';
const testSchema = new mongoose.Schema({
    content: String,
});
const Test = mongoose.model("Test", testSchema);
export default Test;