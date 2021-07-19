import mongoose from 'mongoose';
import config from './config/config.js';

mongoose.connect(config.mongoUri, {
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
const db = mongoose.connection;

db.on("error", (err) => console.log("DB Error", err));
db.once("open", () => console.log("✅ Connected to DB"));