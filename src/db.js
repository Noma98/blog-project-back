import mongoose from 'mongoose';

mongoose.connect(process.env.MONGO_URI, {
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
const db = mongoose.connection;

db.on("error", (err) => console.log("DB Error", err));
db.once("open", () => console.log("✅ Connected to DB"));